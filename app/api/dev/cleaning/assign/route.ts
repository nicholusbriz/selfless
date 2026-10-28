import { NextRequest, NextResponse } from 'next/server';
import {
  invalidJsonBodyResponse,
  isString,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

class AssignmentValidationError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}

async function retryWriteConflict<T>(operation: () => Promise<T>): Promise<T> {
  const maxAttempts = 3;

  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!hasPrismaCode(error, 'P2034') || attempt >= maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** (attempt - 1)));
    }
  }
}

// POST - Assign student to cleaning day (Dev can assign any student to any day)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'dev' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Dev or Super Admin privileges required.' }, { status: 403 });
    }

    const body = await parseJsonBody(request, {
      studentUserId: isString,
      cleaningDayId: isString,
    });
    if (!body) return invalidJsonBodyResponse();
    const { studentUserId, cleaningDayId } = body;

    if (!studentUserId || !cleaningDayId) {
      return NextResponse.json(
        { error: 'Student ID and Cleaning Day ID are required' },
        { status: 400 }
      );
    }

    // Verify day exists
    const day = await prisma.cleaningDay.findUnique({
      where: { id: cleaningDayId },
      include: {
        week: true,
      },
    });

    if (!day) {
      return NextResponse.json(
        { error: 'Cleaning day not found' },
        { status: 404 }
      );
    }

    // Verify student exists
    const student = await prisma.user.findFirst({
      where: {
        id: studentUserId,
        role: { name: 'student' },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const registration = await retryWriteConflict(() =>
      prisma.$transaction(async (tx) => {
        const existingDayRegistration = await tx.cleaningRegistration.findFirst({
          where: { userId: studentUserId, cleaningDayId },
        });

        if (existingDayRegistration) {
          throw new AssignmentValidationError(
            'Student is already registered for this cleaning day',
            409
          );
        }

        const registrationCount = await tx.cleaningRegistration.count({
          where: { userId: studentUserId },
        });

        if (registrationCount >= 2) {
          throw new AssignmentValidationError(
            'Student is already registered for 2 cleaning days (maximum allowed)',
            400
          );
        }

        const capacityUpdate = await tx.cleaningDay.updateMany({
          where: {
            id: cleaningDayId,
            currentRegistrations: { lt: day.capacityLimit },
          },
          data: { currentRegistrations: { increment: 1 } },
        });

        if (capacityUpdate.count === 0) {
          throw new AssignmentValidationError('Day is at full capacity', 400);
        }

        const updatedDay = await tx.cleaningDay.findUnique({
          where: { id: cleaningDayId },
          select: { currentRegistrations: true },
        });

        if (!updatedDay) {
          throw new AssignmentValidationError('Cleaning day not found', 404);
        }

        if (updatedDay.currentRegistrations >= day.capacityLimit) {
          await tx.cleaningDay.update({
            where: { id: cleaningDayId },
            data: { status: 'FULL' },
          });
        }

        const assignedRegistration = await tx.cleaningRegistration.create({
          data: { userId: studentUserId, cleaningDayId },
        });

        await tx.activityLog.create({
          data: {
            userId: session.user.id,
            action: 'assign_student_to_cleaning',
            entityType: 'cleaningRegistration',
            entityId: assignedRegistration.id,
            details: {
              studentId: studentUserId,
              studentName: `${student.firstName} ${student.lastName}`,
              dayId: cleaningDayId,
              dayOfWeek: day.dayOfWeek,
            },
            techCenterId: day.techCenterId,
          },
        });

        return assignedRegistration;
      }, { maxWait: 5000, timeout: 15000 })
    );

    return NextResponse.json(
      {
        message: 'Student assigned successfully',
        registration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error assigning student:', error);

    if (error instanceof AssignmentValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (hasPrismaCode(error, 'P2002')) {
      return NextResponse.json(
        { error: 'Student is already registered for this cleaning day' },
        { status: 409 }
      );
    }

    if (hasPrismaCode(error, 'P2034')) {
      return NextResponse.json(
        { error: 'Assignment is temporarily busy. Please try again.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to assign student' },
      { status: 500 }
    );
  }
}

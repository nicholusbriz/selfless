import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import {
  invalidJsonBodyResponse,
  isString,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';

// POST - Manual assign student (Admin/Teacher)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      session.user.role !== 'admin' &&
      session.user.role !== 'super_admin' &&
      session.user.role !== 'teacher'
    ) {
      return NextResponse.json(
        { error: 'Access denied. Admin or Teacher privileges required.' },
        { status: 403 }
      );
    }

    const body = await parseJsonBody(request, {
      studentUserId: isString,
      cleaningDayId: isString,
    });
    if (!body) return invalidJsonBodyResponse();
    const { studentUserId, cleaningDayId } = body;

    if (!studentUserId || !cleaningDayId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentUserId, cleaningDayId' },
        { status: 400 }
      );
    }

    // ── Pre-flight checks outside the transaction ──────────────────────────
    // These reads don't need to be atomic — we validate again inside the tx.

    const [student, cleaningDay] = await Promise.all([
      prisma.user.findUnique({ where: { id: studentUserId } }),
      prisma.cleaningDay.findUnique({
        where: { id: cleaningDayId },
        include: { week: true },
      }),
    ]);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!cleaningDay) {
      return NextResponse.json({ error: 'Cleaning day not found' }, { status: 404 });
    }

    // Check if student is already on this specific day (idempotent fast-path)
    const alreadyOnDay = await prisma.cleaningRegistration.findFirst({
      where: { userId: studentUserId, cleaningDayId },
    });

    if (alreadyOnDay) {
      return NextResponse.json({ message: 'Student already assigned to this day' });
    }

    // Check student's total registrations before entering the tx
    const totalRegs = await prisma.cleaningRegistration.count({
      where: { userId: studentUserId },
    });

    if (totalRegs >= 2) {
      return NextResponse.json(
        {
          error:
            'Student is already registered for 2 cleaning days (maximum allowed). Use the change-day endpoint to move an existing registration.',
        },
        { status: 400 }
      );
    }

    // ── Atomic write transaction ───────────────────────────────────────────
    // Only the capacity check + create + update run inside the transaction,
    // keeping it as short as possible.

    const result = await prisma.$transaction(
      async (tx) => {
        // Re-check capacity atomically to prevent race conditions
        const currentCount = await tx.cleaningRegistration.count({
          where: { cleaningDayId },
        });

        if (currentCount >= cleaningDay.capacityLimit) {
          throw new Error('This cleaning day is at capacity');
        }

        const registration = await tx.cleaningRegistration.create({
          data: {
            userId: studentUserId,
            cleaningDayId,
          },
          include: {
            cleaningDay: { include: { week: true } },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        const newCount = currentCount + 1;
        const isNowFull = newCount >= cleaningDay.capacityLimit;

        await tx.cleaningDay.update({
          where: { id: cleaningDayId },
          data: {
            currentRegistrations: newCount,
            status: isNowFull ? 'FULL' : 'OPEN',
          },
        });

        return { registration, message: 'Student assigned successfully' };
      },
      { maxWait: 5000, timeout: 15000 }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error manually assigning student:', error);

    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message?.includes('full') || error.message?.includes('at capacity')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message?.includes('already registered for 2')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to assign student' }, { status: 500 });
  }
}

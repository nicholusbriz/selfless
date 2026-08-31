import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// POST - Manual assign student (Admin/Teacher)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin' && session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Access denied. Admin or Teacher privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { studentUserId, cleaningDayId } = body;

    if (!studentUserId || !cleaningDayId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentUserId, cleaningDayId' },
        { status: 400 }
      );
    }

    // Use transaction to prevent race conditions with increased timeout
    const result = await prisma.$transaction(
      async (tx: any) => {
      // Check if student exists
      const student = await tx.user.findUnique({
        where: { id: studentUserId },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Check if cleaning day exists
      const cleaningDay = await tx.cleaningDay.findUnique({
        where: { id: cleaningDayId },
        include: { week: true },
      });

      if (!cleaningDay) {
        throw new Error('Cleaning day not found');
      }

      // Check if day is full
      if (cleaningDay.status === 'FULL') {
        throw new Error('This cleaning day is full');
      }

      // Check capacity within transaction
      const currentRegistrations = await tx.cleaningRegistration.count({
        where: { cleaningDayId },
      });

      if (currentRegistrations >= cleaningDay.capacityLimit) {
        throw new Error('This cleaning day is at capacity');
      }

      // Check if student already has a registration
      const existingRegistration = await tx.cleaningRegistration.findUnique({
        where: { userId: studentUserId },
      });

      let oldCleaningDayId: string | null = null;

      if (existingRegistration) {
        oldCleaningDayId = existingRegistration.cleaningDayId;

        // If already assigned to the same day, return success
        if (existingRegistration.cleaningDayId === cleaningDayId) {
          return { message: 'Student already assigned to this day' };
        }

        // Check if old day has exactly 4 students (minimum threshold)
        const oldDayRegistrations = await tx.cleaningRegistration.count({
          where: { cleaningDayId: oldCleaningDayId },
        });

        if (oldDayRegistrations === 4) {
          throw new Error('Cannot move student - the current day has exactly 4 students (minimum required). A day must have at least 4 students.');
        }

        // Delete old registration
        await tx.cleaningRegistration.delete({
          where: { userId: studentUserId },
        });

        // Update old day's count
        if (oldCleaningDayId) {
          const oldCount = await tx.cleaningRegistration.count({
            where: { cleaningDayId: oldCleaningDayId },
          });

          const oldDay = await tx.cleaningDay.findUnique({
            where: { id: oldCleaningDayId },
          });

          if (oldDay) {
            const isOldDayFull = oldCount >= oldDay.capacityLimit;
            await tx.cleaningDay.update({
              where: { id: oldCleaningDayId },
              data: {
                currentRegistrations: oldCount,
                status: isOldDayFull ? 'FULL' : 'OPEN',
              },
            });
          }
        }
      }

      // Create new registration
      const registration = await tx.cleaningRegistration.create({
        data: {
          userId: studentUserId,
          cleaningDayId,
        },
        include: {
          cleaningDay: {
            include: {
              week: true,
            },
          },
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

      // Update new day's count and auto-close if full
      const newRegistrationCount = currentRegistrations + 1;
      const isNowFull = newRegistrationCount >= cleaningDay.capacityLimit;

      await tx.cleaningDay.update({
        where: { id: cleaningDayId },
        data: {
          currentRegistrations: newRegistrationCount,
          status: isNowFull ? 'FULL' : 'OPEN',
        },
      });

      return {
        registration,
        message: oldCleaningDayId ? 'Student moved to new day' : 'Student assigned successfully',
      };
    }, {
      maxWait: 10000, // Increase timeout to 10 seconds
      timeout: 10000,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error manually assigning student:', error);
    
    // Handle specific error messages
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message.includes('full') || error.message.includes('at capacity')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('minimum required')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to assign student' },
      { status: 500 }
    );
  }
}

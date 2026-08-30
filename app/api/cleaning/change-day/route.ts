// app/api/cleaning/change-day/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { logCleaningDayChange } from '@/lib/logger';

// POST - Change student's cleaning day (any week)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { newDayId } = body;

    if (!newDayId) {
      return NextResponse.json(
        { error: 'Missing required field: newDayId' },
        { status: 400 }
      );
    }

    // Use transaction with increased timeout
    const result = await prisma.$transaction(async (tx) => {
      // Get existing registration
      const existingRegistration = await tx.cleaningRegistration.findUnique({
        where: { userId: user.id },
        include: {
          cleaningDay: {
            include: { week: true }
          }
        }
      });

      if (!existingRegistration) {
        throw new Error('You are not registered for any cleaning day');
      }

      const oldDayId = existingRegistration.cleaningDayId;

      // Get new day
      const newDay = await tx.cleaningDay.findUnique({
        where: { id: newDayId },
        include: { week: true }
      });

      if (!newDay) {
        throw new Error('New cleaning day not found');
      }

      // REMOVED: Same week restriction - User can change to any week
      // Now allowing changes across different weeks

      // Validate: Cannot change to the same day
      if (newDayId === oldDayId) {
        throw new Error('You are already registered for this day');
      }

      // Validate: Week must allow registration
      if (!newDay.week.isActive) {
        throw new Error('This week is closed for registration');
      }

      // Validate: Registration deadline not passed
      if (new Date() > new Date(newDay.week.registrationDeadline)) {
        throw new Error('Registration deadline has passed');
      }

      // Validate: New day must be OPEN
      if (newDay.status !== 'OPEN') {
        throw new Error('This cleaning day is not open for registration');
      }

      // Validate: Cannot change to past dates
      if (new Date(newDay.cleaningDate) < new Date()) {
        throw new Error('You cannot change to a past date');
      }

      // Check capacity on new day
      const newDayRegistrations = await tx.cleaningRegistration.count({
        where: { cleaningDayId: newDayId }
      });

      if (newDayRegistrations >= newDay.capacityLimit) {
        throw new Error('This cleaning day is at capacity');
      }

      // Check if old day has exactly 4 students (minimum threshold)
      const oldDayRegistrations = await tx.cleaningRegistration.count({
        where: { cleaningDayId: oldDayId }
      });

      if (oldDayRegistrations === 4) {
        throw new Error('Cannot leave this day - it has exactly 4 students (minimum required). A day must have at least 4 students.');
      }

      // Delete old registration
      await tx.cleaningRegistration.delete({
        where: { userId: user.id }
      });

      // Update old day's count and status (decrease count)
      const oldDayNewCount = await tx.cleaningRegistration.count({
        where: { cleaningDayId: oldDayId }
      });

      const oldDay = await tx.cleaningDay.findUnique({
        where: { id: oldDayId }
      });

      if (oldDay) {
        const isOldDayFull = oldDayNewCount >= oldDay.capacityLimit;
        await tx.cleaningDay.update({
          where: { id: oldDayId },
          data: {
            currentRegistrations: oldDayNewCount,
            status: isOldDayFull ? 'FULL' : 'OPEN'
          }
        });
      }

      // Create new registration
      const newRegistration = await tx.cleaningRegistration.create({
        data: {
          userId: user.id,
          cleaningDayId: newDayId
        },
        include: {
          cleaningDay: {
            include: { week: true }
          }
        }
      });

      // Update new day's count and status (increase count)
      const newDayNewCount = newDayRegistrations + 1;
      const isNewDayFull = newDayNewCount >= newDay.capacityLimit;

      await tx.cleaningDay.update({
        where: { id: newDayId },
        data: {
          currentRegistrations: newDayNewCount,
          status: isNewDayFull ? 'FULL' : 'OPEN'
        }
      });

      return {
        oldDayId,
        newDayId,
        registration: newRegistration,
        oldDayName: existingRegistration.cleaningDay.dayOfWeek,
        newDayName: newRegistration.cleaningDay.dayOfWeek,
        oldWeekLabel: existingRegistration.cleaningDay.week.weekLabel,
        newWeekLabel: newRegistration.cleaningDay.week.weekLabel,
      };
    }, {
      // Increase transaction timeout to 20 seconds
      timeout: 20000,
      // Increase max wait time
      maxWait: 20000
    });

    // Log the cleaning day change activity
    await logCleaningDayChange(
      user.id,
      user.techCenterId || undefined,
      {
        oldDayId: result.oldDayId,
        newDayId: result.newDayId,
        oldDayName: result.oldDayName,
        newDayName: result.newDayName,
        oldWeekLabel: result.oldWeekLabel,
        newWeekLabel: result.newWeekLabel,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully changed cleaning day',
      ...result
    });
  } catch (error: any) {
    console.error('Error changing cleaning day:', error);
    
    // Handle specific error messages
    if (error.message.includes('not registered')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('already registered')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('closed for registration')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('deadline')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('not open')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('past date')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('at capacity')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('minimum required')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('Transaction')) {
      return NextResponse.json(
        { error: 'Server is busy, please try again' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to change cleaning day' },
      { status: 500 }
    );
  }
}
// app/api/dashboard/cleaning/change/route.ts
// API route for changing a user's cleaning day registration

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// POST - Change user's cleaning day registration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { oldDayId, newDayId } = body;

    if (!oldDayId || !newDayId) {
      return NextResponse.json(
        { error: 'Both old and new day IDs are required' },
        { status: 400 }
      );
    }

    // Get user's current registration
    const registration = await prisma.cleaningRegistration.findFirst({
      where: {
        userId: session.user.id,
        cleaningDayId: oldDayId,
      },
      include: {
        cleaningDay: {
          include: {
            week: true
          }
        }
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'No registration found for the specified day' },
        { status: 404 }
      );
    }

    // Check if new day exists and is in the same week
    const newDay = await prisma.cleaningDay.findFirst({
      where: {
        id: newDayId,
        techCenterId: registration.cleaningDay.techCenterId,
        weekId: registration.cleaningDay.weekId,
      },
      include: {
        week: true,
        registrations: true
      }
    });

    if (!newDay) {
      return NextResponse.json(
        { error: 'New day not found or not in the same week' },
        { status: 404 }
      );
    }

    // Check if week is active
    if (!newDay.week.isActive) {
      return NextResponse.json(
        { error: 'Registration is closed for this week' },
        { status: 400 }
      );
    }

    // Check if new day is open
    if (newDay.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'The selected day is closed' },
        { status: 400 }
      );
    }

    // Check if new day is full
    if (newDay.status === 'FULL') {
      return NextResponse.json(
        { error: 'The selected day is full' },
        { status: 400 }
      );
    }

    // Check if user is already registered for the new day
    const existingRegistration = await prisma.cleaningRegistration.findFirst({
      where: {
        userId: session.user.id,
        cleaningDayId: newDayId,
      }
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this day' },
        { status: 400 }
      );
    }

    // Use transaction to move registration
    const result = await prisma.$transaction(async (tx) => {
      // Check if old day has exactly 4 students (minimum threshold)
      const oldDayRegistrations = await tx.cleaningRegistration.count({
        where: { cleaningDayId: oldDayId }
      });

      if (oldDayRegistrations === 4) {
        throw new Error('Cannot change from this day - it has exactly 4 students (minimum required). A day must have at least 4 students.');
      }

      // 1. Delete old registration
      await tx.cleaningRegistration.delete({
        where: { id: registration.id }
      });

      // 2. Decrement old day's registrations
      const updatedOldDay = await tx.cleaningDay.update({
        where: { id: oldDayId },
        data: {
          currentRegistrations: {
            decrement: 1
          }
        }
      });

      // 3. Check if old day should be reopened (status becomes OPEN if not full)
      if (updatedOldDay.currentRegistrations < updatedOldDay.capacityLimit) {
        await tx.cleaningDay.update({
          where: { id: oldDayId },
          data: { status: 'OPEN' }
        });
      }

      // 4. Create new registration
      const newRegistration = await tx.cleaningRegistration.create({
        data: {
          userId: session.user.id,
          cleaningDayId: newDayId,
        }
      });

      // 5. Increment new day's registrations
      const updatedNewDay = await tx.cleaningDay.update({
        where: { id: newDayId },
        data: {
          currentRegistrations: {
            increment: 1
          }
        }
      });

      // 6. Update new day status to FULL if capacity reached
      if (updatedNewDay.currentRegistrations >= updatedNewDay.capacityLimit) {
        await tx.cleaningDay.update({
          where: { id: newDayId },
          data: { status: 'FULL' }
        });
      }

      return { 
        newRegistration, 
        oldDay: updatedOldDay, 
        newDay: updatedNewDay,
        oldDayName: registration.cleaningDay.dayOfWeek,
        newDayName: newDay.dayOfWeek
      };
    }, {
      timeout: 10000 // 10 seconds timeout
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'change_cleaning_registration',
        entityType: 'cleaningRegistration',
        entityId: result.newRegistration.id,
        details: {
          oldDayId: oldDayId,
          newDayId: newDayId,
          oldDayOfWeek: result.oldDayName,
          newDayOfWeek: result.newDayName,
          oldDayCount: result.oldDay.currentRegistrations,
          newDayCount: result.newDay.currentRegistrations
        },
        techCenterId: registration.cleaningDay.techCenterId,
      }
    });

    return NextResponse.json({
      message: `✅ Successfully changed from ${result.oldDayName} to ${result.newDayName}`,
      registration: result.newRegistration,
      oldDay: {
        id: oldDayId,
        dayOfWeek: result.oldDayName,
        currentRegistrations: result.oldDay.currentRegistrations,
        status: result.oldDay.status
      },
      newDay: {
        id: newDayId,
        dayOfWeek: result.newDayName,
        currentRegistrations: result.newDay.currentRegistrations,
        status: result.newDay.status
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error changing cleaning registration:', error);
    
    // Handle specific error messages
    if (error.message.includes('minimum required')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to change cleaning day' },
      { status: 500 }
    );
  }
}
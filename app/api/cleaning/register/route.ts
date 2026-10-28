import { NextRequest, NextResponse } from 'next/server';
import {
  invalidJsonBodyResponse,
  isString,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { logCleaningRegistration } from '@/lib/logger';

// POST - Register student for a day
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
    const body = await parseJsonBody(request, { cleaningDayId: isString });
    if (!body) return invalidJsonBodyResponse();
    const { cleaningDayId } = body;

    // Check if student already has a registration (allow up to 2 registrations)
    const existingRegistrations = await prisma.cleaningRegistration.findMany({
      where: { userId: user.id },
    });

    if (existingRegistrations.length >= 2) {
      return NextResponse.json(
        { error: 'You can register for a maximum of 2 cleaning days. Please unregister from one of your current days to register for a new one.' },
        { status: 400 }
      );
    }

    // Check if already registered for this specific day
    const existingDayRegistration = existingRegistrations.find(
      (reg) => reg.cleaningDayId === cleaningDayId
    );

    if (existingDayRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this cleaning day.' },
        { status: 400 }
      );
    }

    // Get the cleaning day
    const cleaningDay = await prisma.cleaningDay.findUnique({
      where: { id: cleaningDayId },
      include: { week: true },
    });

    if (!cleaningDay) {
      return NextResponse.json(
        { error: 'Cleaning day not found' },
        { status: 404 }
      );
    }

    // Check if registration is enabled
    if (!cleaningDay.week.isActive) {
      return NextResponse.json(
        { error: 'Registration is currently disabled for this week' },
        { status: 400 }
      );
    }

    // Check if day is open
    if (cleaningDay.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'This cleaning day is not open for registration' },
        { status: 400 }
      );
    }

    if (new Date() >= new Date(cleaningDay.week.registrationDeadline)) {
      return NextResponse.json(
        { error: 'The registration deadline has passed for this cleaning day.' },
        { status: 400 }
      );
    }

    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Check capacity within transaction
      const currentRegistrations = await tx.cleaningRegistration.count({
        where: { cleaningDayId },
      });

      if (currentRegistrations >= cleaningDay.capacityLimit) {
        throw new Error('This cleaning day is at capacity');
      }

      // Create registration
      const registration = await tx.cleaningRegistration.create({
        data: {
          userId: user.id,
          cleaningDayId,
        },
        include: {
          cleaningDay: {
            include: {
              week: true,
            },
          },
        },
      });

      // Update day's current registration count and auto-close if full
      const newRegistrationCount = currentRegistrations + 1;
      const isNowFull = newRegistrationCount >= cleaningDay.capacityLimit;

      await tx.cleaningDay.update({
        where: { id: cleaningDayId },
        data: {
          currentRegistrations: newRegistrationCount,
          status: isNowFull ? 'FULL' : 'OPEN',
        },
      });

      return registration;
    }, {
      timeout: 15000 // 15 seconds timeout
    });

    // Log the cleaning registration activity
    await logCleaningRegistration(
      user.id,
      user.techCenterId || undefined,
      {
        cleaningDayId: result.cleaningDayId,
        dayName: result.cleaningDay.dayOfWeek,
        weekLabel: result.cleaningDay.week.weekLabel,
      }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error registering for cleaning day:', error);
    return NextResponse.json(
      { error: 'Failed to register for cleaning day' },
      { status: 500 }
    );
  }
}

// DELETE - Unregister student from a specific day
export async function DELETE(request: NextRequest) {
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

    const body = await parseJsonBody(request, { cleaningDayId: isString });
    if (!body) return invalidJsonBodyResponse();
    const { cleaningDayId } = body;

    if (!cleaningDayId) {
      return NextResponse.json(
        { error: 'cleaningDayId is required' },
        { status: 400 }
      );
    }

    // Get existing registration for this specific day
    const existingRegistration = await prisma.cleaningRegistration.findFirst({
      where: {
        userId: user.id,
        cleaningDayId,
      },
      include: {
        cleaningDay: {
          include: { week: true },
        },
      },
    });

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'No registration found for this day' },
        { status: 404 }
      );
    }

    if (new Date() >= new Date(existingRegistration.cleaningDay.week.registrationDeadline)) {
      return NextResponse.json(
        { error: 'The registration deadline has passed, so you can no longer unregister from this day.' },
        { status: 400 }
      );
    }

    // Delete registration
    await prisma.cleaningRegistration.delete({
      where: { id: existingRegistration.id },
    });

    // Update day's current registration count
    const currentRegistrations = await prisma.cleaningRegistration.count({
      where: { cleaningDayId },
    });

    const cleaningDay = await prisma.cleaningDay.findUnique({
      where: { id: cleaningDayId },
    });

    if (cleaningDay) {
      const isNowFull = currentRegistrations >= cleaningDay.capacityLimit;
      await prisma.cleaningDay.update({
        where: { id: cleaningDayId },
        data: {
          currentRegistrations,
          status: isNowFull ? 'FULL' : 'OPEN',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unregistering from cleaning day:', error);
    return NextResponse.json(
      { error: 'Failed to unregister from cleaning day' },
      { status: 500 }
    );
  }
}

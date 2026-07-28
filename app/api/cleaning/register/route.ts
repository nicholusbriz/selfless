import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

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
    const body = await request.json();
    const { cleaningDayId } = body;

    // Check if student already has a registration (ONE STUDENT = ONE DAY)
    const existingRegistration = await prisma.cleaningRegistration.findUnique({
      where: { userId: user.id },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for a cleaning day. Please unregister first to switch days.' },
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

    // Check if registration deadline has passed
    if (new Date() > new Date(cleaningDay.week.registrationDeadline)) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' },
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

    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx: any) => {
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

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error registering for cleaning day:', error);
    return NextResponse.json(
      { error: 'Failed to register for cleaning day' },
      { status: 500 }
    );
  }
}

// DELETE - Unregister student from day
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

    // Get existing registration
    const existingRegistration = await prisma.cleaningRegistration.findUnique({
      where: { userId: user.id },
    });

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'No registration found' },
        { status: 404 }
      );
    }

    const cleaningDayId = existingRegistration.cleaningDayId;

    // Delete registration
    await prisma.cleaningRegistration.delete({
      where: { userId: user.id },
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Register student for a day
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    if (!cleaningDay.week.registrationEnabled) {
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
    if (!cleaningDay.isOpen) {
      return NextResponse.json(
        { error: 'This cleaning day is closed' },
        { status: 400 }
      );
    }

    // Check if day is full
    if (cleaningDay.isFull) {
      return NextResponse.json(
        { error: 'This cleaning day is full' },
        { status: 400 }
      );
    }

    // Check capacity
    const currentRegistrations = await prisma.cleaningRegistration.count({
      where: { cleaningDayId },
    });

    if (currentRegistrations >= cleaningDay.capacityLimit) {
      return NextResponse.json(
        { error: 'This cleaning day is at capacity' },
        { status: 400 }
      );
    }

    // Create registration
    const registration = await prisma.cleaningRegistration.create({
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

    // Update day's current registration count
    await prisma.cleaningDay.update({
      where: { id: cleaningDayId },
      data: {
        currentRegistrations: currentRegistrations + 1,
        isFull: currentRegistrations + 1 >= cleaningDay.capacityLimit,
      },
    });

    return NextResponse.json(registration, { status: 201 });
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
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      await prisma.cleaningDay.update({
        where: { id: cleaningDayId },
        data: {
          currentRegistrations,
          isFull: currentRegistrations >= cleaningDay.capacityLimit,
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

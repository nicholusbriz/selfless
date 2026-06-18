import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Manual assign student (Admin/Teacher)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userRole !== 'admin' && userRole !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin or Teacher access required' }, { status: 403 });
    }

    const body = await request.json();
    const { studentUserId, cleaningDayId } = body;

    if (!studentUserId || !cleaningDayId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentUserId, cleaningDayId' },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: studentUserId },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if cleaning day exists
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

    // Check if student already has a registration
    const existingRegistration = await prisma.cleaningRegistration.findUnique({
      where: { userId: studentUserId },
    });

    let oldCleaningDayId: string | null = null;

    if (existingRegistration) {
      oldCleaningDayId = existingRegistration.cleaningDayId;

      // If already assigned to the same day, return success
      if (existingRegistration.cleaningDayId === cleaningDayId) {
        return NextResponse.json({ message: 'Student already assigned to this day' });
      }

      // Delete old registration
      await prisma.cleaningRegistration.delete({
        where: { userId: studentUserId },
      });

      // Update old day's count
      if (oldCleaningDayId) {
        const oldCount = await prisma.cleaningRegistration.count({
          where: { cleaningDayId: oldCleaningDayId },
        });

        const oldDay = await prisma.cleaningDay.findUnique({
          where: { id: oldCleaningDayId },
        });

        if (oldDay) {
          await prisma.cleaningDay.update({
            where: { id: oldCleaningDayId },
            data: {
              currentRegistrations: oldCount,
              isFull: oldCount >= oldDay.capacityLimit,
            },
          });
        }
      }
    }

    // Create new registration
    const registration = await prisma.cleaningRegistration.create({
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

    // Update new day's count
    await prisma.cleaningDay.update({
      where: { id: cleaningDayId },
      data: {
        currentRegistrations: currentRegistrations + 1,
        isFull: currentRegistrations + 1 >= cleaningDay.capacityLimit,
      },
    });

    return NextResponse.json({
      registration,
      message: oldCleaningDayId ? 'Student moved to new day' : 'Student assigned successfully',
    });
  } catch (error) {
    console.error('Error manually assigning student:', error);
    return NextResponse.json(
      { error: 'Failed to assign student' },
      { status: 500 }
    );
  }
}

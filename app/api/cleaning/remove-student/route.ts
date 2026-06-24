import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE - Remove student from a day (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { studentUserId } = body;

    if (!studentUserId) {
      return NextResponse.json(
        { error: 'Missing required field: studentUserId' },
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

    // Get existing registration
    const existingRegistration = await prisma.cleaningRegistration.findUnique({
      where: { userId: studentUserId },
    });

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'No registration found for this student' },
        { status: 404 }
      );
    }

    const cleaningDayId = existingRegistration.cleaningDayId;

    // Delete registration
    await prisma.cleaningRegistration.delete({
      where: { userId: studentUserId },
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
          isFull: isNowFull,
          isOpen: !isNowFull, // Auto-reopen when capacity becomes available
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Student removed from day successfully' });
  } catch (error) {
    console.error('Error removing student from day:', error);
    return NextResponse.json(
      { error: 'Failed to remove student from day' },
      { status: 500 }
    );
  }
}

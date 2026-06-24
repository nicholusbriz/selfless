import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Update day (capacity, open/close)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ dayId: string }> }
) {
  try {
    const { dayId } = await params;
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userRole !== 'admin' && userRole !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin or Teacher access required' }, { status: 403 });
    }

    const body = await request.json();
    const { capacityLimit, isOpen } = body;

    // Get current registrations before updating
    const currentRegistrations = await prisma.cleaningRegistration.count({
      where: { cleaningDayId: dayId },
    });

    const day = await prisma.cleaningDay.update({
      where: { id: dayId },
      data: {
        ...(capacityLimit !== undefined && { capacityLimit }),
        ...(isOpen !== undefined && { isOpen }),
        currentRegistrations,
      },
    });

    // Update isFull and isOpen status based on capacity changes
    if (capacityLimit !== undefined) {
      const isNowFull = currentRegistrations >= capacityLimit;
      
      // Auto-open if capacity increased above current registrations
      // Auto-close if capacity decreased below current registrations
      const shouldAutoOpen = !isNowFull;
      
      await prisma.cleaningDay.update({
        where: { id: dayId },
        data: {
          isFull: isNowFull,
          // Only auto-set isOpen if it wasn't explicitly provided in the request
          ...(isOpen === undefined && { isOpen: shouldAutoOpen }),
        },
      });
    }

    return NextResponse.json(day);
  } catch (error) {
    console.error('Error updating day:', error);
    return NextResponse.json(
      { error: 'Failed to update day' },
      { status: 500 }
    );
  }
}

// DELETE - Delete day (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dayId: string }> }
) {
  try {
    const { dayId } = await params;
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    }

    // Delete day (cascade will delete registrations and attendance records)
    await prisma.cleaningDay.delete({
      where: { id: dayId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting day:', error);
    return NextResponse.json(
      { error: 'Failed to delete day' },
      { status: 500 }
    );
  }
}

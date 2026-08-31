import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PUT - Update day (capacity, status)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ dayId: string }> }
) {
  try {
    const { dayId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin' && session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Access denied. Admin or Teacher privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { capacityLimit, status } = body;

    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx: any) => {
      // Get current registrations before updating
      const currentRegistrations = await tx.cleaningRegistration.count({
        where: { cleaningDayId: dayId },
      });

      const day = await tx.cleaningDay.findUnique({
        where: { id: dayId },
      });

      if (!day) {
        throw new Error('Cleaning day not found');
      }

      // Calculate new status based on capacity changes
      let newStatus = status;
      const newCapacity = capacityLimit !== undefined ? capacityLimit : day.capacityLimit;

      if (capacityLimit !== undefined) {
        // When capacity is changed, auto-determine status based on new capacity
        if (currentRegistrations >= newCapacity) {
          newStatus = 'FULL';
        } else {
          newStatus = 'OPEN';
        }
      } else if (status !== undefined) {
        // If only status is provided (no capacity change), validate
        if (status === 'OPEN' && currentRegistrations >= day.capacityLimit) {
          throw new Error('Cannot set status to OPEN when capacity is reached');
        }
        newStatus = status;
      } else {
        // If neither is provided, keep current status
        newStatus = day.status;
      }

      // Update day
      const updatedDay = await tx.cleaningDay.update({
        where: { id: dayId },
        data: {
          ...(capacityLimit !== undefined && { capacityLimit: newCapacity }),
          ...(status !== undefined && { status: newStatus }),
          currentRegistrations,
        },
      });

      return updatedDay;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating day:', error);
    
    // Handle specific error messages
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message.includes('Cannot set status')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
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

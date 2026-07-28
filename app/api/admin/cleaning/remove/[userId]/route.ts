import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// DELETE - Remove student from cleaning day
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const { userId } = await params;

    // Get admin's tech center
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { techCenterId: true }
    });

    if (!adminUser?.techCenterId) {
      return NextResponse.json(
        { error: 'No tech center assigned' },
        { status: 404 }
      );
    }

    // Get registration and verify it belongs to admin's tech center
    const registration = await prisma.cleaningRegistration.findUnique({
      where: { userId: userId },
      include: {
        cleaningDay: true,
        user: true
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    if (registration.cleaningDay.techCenterId !== adminUser.techCenterId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Use transaction to delete registration and update counts
    await prisma.$transaction(async (tx) => {
      await tx.cleaningRegistration.delete({
        where: { userId: userId }
      });

      // Decrement currentRegistrations
      const updatedDay = await tx.cleaningDay.update({
        where: { id: registration.cleaningDayId },
        data: {
          currentRegistrations: {
            decrement: 1
          }
        }
      });

      // Update status to OPEN if capacity not full
      if (updatedDay.currentRegistrations < updatedDay.capacityLimit) {
        await tx.cleaningDay.update({
          where: { id: registration.cleaningDayId },
          data: { status: 'OPEN' }
        });
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'remove_student_from_cleaning',
        entityType: 'cleaningRegistration',
        entityId: registration.id,
        details: {
          studentId: userId,
          studentName: `${registration.user.firstName} ${registration.user.lastName}`,
          dayId: registration.cleaningDayId,
          dayOfWeek: registration.cleaningDay.dayOfWeek
        },
        techCenterId: adminUser.techCenterId,
      }
    });

    return NextResponse.json({
      message: 'Student removed successfully'
    });
  } catch (error) {
    console.error('Error removing student:', error);
    return NextResponse.json(
      { error: 'Failed to remove student' },
      { status: 500 }
    );
  }
}
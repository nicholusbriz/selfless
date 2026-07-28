import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// DELETE - Remove student from a day (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { studentUserId } = body;

    if (!studentUserId) {
      return NextResponse.json(
        { error: 'Missing required field: studentUserId' },
        { status: 400 }
      );
    }

    // Use transaction with increased timeout to prevent race conditions
    await prisma.$transaction(async (tx: any) => {
      // Check if student exists
      const student = await tx.user.findUnique({
        where: { id: studentUserId },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Get existing registration
      const existingRegistration = await tx.cleaningRegistration.findUnique({
        where: { userId: studentUserId },
      });

      if (!existingRegistration) {
        throw new Error('No registration found for this student');
      }

      const cleaningDayId = existingRegistration.cleaningDayId;

      // Delete registration
      await tx.cleaningRegistration.delete({
        where: { userId: studentUserId },
      });

      // Update day's current registration count
      const currentRegistrations = await tx.cleaningRegistration.count({
        where: { cleaningDayId },
      });

      const cleaningDay = await tx.cleaningDay.findUnique({
        where: { id: cleaningDayId },
      });

      if (cleaningDay) {
        const isNowFull = currentRegistrations >= cleaningDay.capacityLimit;
        await tx.cleaningDay.update({
          where: { id: cleaningDayId },
          data: {
            currentRegistrations,
            status: isNowFull ? 'FULL' : 'OPEN',
          },
        });
      }
    }, {
      // Increase transaction timeout to 15 seconds
      timeout: 15000,
      // Increase max wait time
      maxWait: 15000
    });

    return NextResponse.json({ success: true, message: 'Student removed from day successfully' });
  } catch (error: any) {
    console.error('Error removing student from day:', error);
    
    // Handle specific error messages
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to remove student from day' },
      { status: 500 }
    );
  }
}

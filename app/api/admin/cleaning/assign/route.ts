import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// POST - Assign student to cleaning day
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { studentUserId, cleaningDayId } = body;

    if (!studentUserId || !cleaningDayId) {
      return NextResponse.json(
        { error: 'Student ID and Cleaning Day ID are required' },
        { status: 400 }
      );
    }

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

    // Verify day belongs to admin's tech center
    const day = await prisma.cleaningDay.findFirst({
      where: {
        id: cleaningDayId,
        techCenterId: adminUser.techCenterId
      },
      include: {
        week: true
      }
    });

    if (!day) {
      return NextResponse.json(
        { error: 'Cleaning day not found or access denied' },
        { status: 404 }
      );
    }

    // Check if week is active
    if (!day.week.isActive) {
      return NextResponse.json(
        { error: 'Registration is closed for this week' },
        { status: 400 }
      );
    }

    // Verify student exists and belongs to same tech center
    const student = await prisma.user.findFirst({
      where: {
        id: studentUserId,
        techCenterId: adminUser.techCenterId,
        role: { name: 'student' }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or not in your tech center' },
        { status: 404 }
      );
    }

    // Check if already registered
    const existingRegistration = await prisma.cleaningRegistration.findUnique({
      where: { userId: studentUserId }
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Student is already registered for a cleaning day in this week' },
        { status: 400 }
      );
    }

    // Check capacity
    if (day.currentRegistrations >= day.capacityLimit) {
      return NextResponse.json(
        { error: 'Day is at full capacity' },
        { status: 400 }
      );
    }

    // Use transaction to create registration and update counts
    const registration = await prisma.$transaction(async (tx) => {
      const reg = await tx.cleaningRegistration.create({
        data: {
          userId: studentUserId,
          cleaningDayId: cleaningDayId,
        }
      });

      // Update currentRegistrations
      const updatedDay = await tx.cleaningDay.update({
        where: { id: cleaningDayId },
        data: {
          currentRegistrations: {
            increment: 1
          }
        }
      });

      // Update status to FULL if capacity reached
      if (updatedDay.currentRegistrations >= updatedDay.capacityLimit) {
        await tx.cleaningDay.update({
          where: { id: cleaningDayId },
          data: { status: 'FULL' }
        });
      }

      return reg;
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'assign_student_to_cleaning',
        entityType: 'cleaningRegistration',
        entityId: registration.id,
        details: {
          studentId: studentUserId,
          studentName: `${student.firstName} ${student.lastName}`,
          dayId: cleaningDayId,
          dayOfWeek: day.dayOfWeek
        },
        techCenterId: adminUser.techCenterId,
      }
    });

    return NextResponse.json({
      message: 'Student assigned successfully',
      registration
    }, { status: 201 });
  } catch (error) {
    console.error('Error assigning student:', error);
    return NextResponse.json(
      { error: 'Failed to assign student' },
      { status: 500 }
    );
  }
}
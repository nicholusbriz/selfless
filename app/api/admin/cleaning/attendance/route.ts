import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// POST - Mark attendance
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'teacher' && session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Teacher or admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, cleaningDayId, status } = body;

    if (!userId || !cleaningDayId || !status) {
      return NextResponse.json(
        { error: 'User ID, Cleaning Day ID, and Status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['ATTENDED', 'NO_SHOW', 'PENDING'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ATTENDED, NO_SHOW, or PENDING' },
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
      }
    });

    if (!day) {
      return NextResponse.json(
        { error: 'Cleaning day not found or access denied' },
        { status: 404 }
      );
    }

    // Verify user belongs to admin's tech center
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        techCenterId: adminUser.techCenterId
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found or not in your tech center' },
        { status: 404 }
      );
    }

    // Update or create attendance record
    const attendance = await prisma.attendanceRecord.upsert({
      where: {
        userId_cleaningDayId: {
          userId: userId,
          cleaningDayId: cleaningDayId
        }
      },
      update: {
        status: status,
        markedBy: session.user.id,
        markedAt: new Date(),
      },
      create: {
        userId: userId,
        cleaningDayId: cleaningDayId,
        status: status,
        markedBy: session.user.id,
        markedAt: new Date(),
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'mark_attendance',
        entityType: 'attendanceRecord',
        entityId: attendance.id,
        details: {
          targetUserId: userId,
          targetUser: `${user.firstName} ${user.lastName}`,
          cleaningDayId: cleaningDayId,
          status: status
        },
        techCenterId: adminUser.techCenterId,
      }
    });

    return NextResponse.json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}
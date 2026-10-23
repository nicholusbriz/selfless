import { NextRequest, NextResponse } from 'next/server';
import {
  invalidJsonBodyResponse,
  isString,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { AttendanceStatus } from '@prisma/client';

// POST - Mark attendance (Dev can mark attendance for any day)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'dev' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied. Dev or Super Admin privileges required.' }, { status: 403 });
    }

    const body = await parseJsonBody(request, {
      userId: isString,
      cleaningDayId: isString,
      status: isString,
    });
    if (!body) return invalidJsonBodyResponse();
    const { userId, cleaningDayId, status } = body;

    if (!userId || !cleaningDayId || !status) {
      return NextResponse.json(
        { error: 'User ID, Cleaning Day ID, and Status are required' },
        { status: 400 }
      );
    }

    if (
      status !== AttendanceStatus.ATTENDED &&
      status !== AttendanceStatus.NO_SHOW &&
      status !== AttendanceStatus.PENDING
    ) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ATTENDED, NO_SHOW, or PENDING' },
        { status: 400 }
      );
    }

    // Verify day exists
    const day = await prisma.cleaningDay.findUnique({
      where: { id: cleaningDayId },
    });

    if (!day) {
      return NextResponse.json(
        { error: 'Cleaning day not found' },
        { status: 404 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update or create attendance record
    const attendance = await prisma.attendanceRecord.upsert({
      where: {
        userId_cleaningDayId: {
          userId: userId,
          cleaningDayId: cleaningDayId,
        },
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
      },
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
          status: status,
        },
        techCenterId: day.techCenterId,
      },
    });

    return NextResponse.json({
      message: 'Attendance marked successfully',
      attendance,
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}

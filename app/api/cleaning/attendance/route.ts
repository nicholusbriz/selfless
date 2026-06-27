import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastToAll, broadcastToUser } from '@/lib/websocket-server';

// POST - Mark attendance (Teacher/Admin only)
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
    const { userId: studentUserId, cleaningDayId, status, notes } = body;

    if (!studentUserId || !cleaningDayId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, cleaningDayId, status' },
        { status: 400 }
      );
    }

    if (!['ATTENDED', 'NO_SHOW', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ATTENDED, NO_SHOW, or PENDING' },
        { status: 400 }
      );
    }

    // Check if cleaning day exists
    const cleaningDay = await prisma.cleaningDay.findUnique({
      where: { id: cleaningDayId },
    });

    if (!cleaningDay) {
      return NextResponse.json(
        { error: 'Cleaning day not found' },
        { status: 404 }
      );
    }

    // Check if student is registered for this day
    const registration = await prisma.cleaningRegistration.findUnique({
      where: { userId: studentUserId },
    });

    if (!registration || registration.cleaningDayId !== cleaningDayId) {
      return NextResponse.json(
        { error: 'Student is not registered for this cleaning day' },
        { status: 400 }
      );
    }

    // Create or update attendance record
    const attendanceRecord = await prisma.attendanceRecord.upsert({
      where: {
        userId_cleaningDayId: {
          userId: studentUserId,
          cleaningDayId,
        },
      },
      update: {
        status,
        markedBy: userId,
        notes,
        markedAt: new Date(),
      },
      create: {
        userId: studentUserId,
        cleaningDayId,
        status,
        markedBy: userId,
        notes,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true,
          },
        },
        cleaningDay: {
          include: {
            week: true,
          },
        },
      },
    });

    // Broadcast attendance update to all connected clients
    broadcastToAll('cleaning:attendance:updated', attendanceRecord);
    // Also notify the specific student
    broadcastToUser(studentUserId, 'cleaning:attendance:updated', attendanceRecord);

    return NextResponse.json(attendanceRecord);
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}

// GET - Get attendance for a day
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cleaningDayId = searchParams.get('cleaningDayId');

    if (!cleaningDayId) {
      return NextResponse.json(
        { error: 'cleaningDayId is required' },
        { status: 400 }
      );
    }

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { cleaningDayId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        cleaningDay: {
          include: {
            week: true,
          },
        },
      },
      orderBy: { markedAt: 'desc' },
    });

    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

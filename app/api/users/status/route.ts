import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastToAll } from '@/lib/websocket-server';

// GET - Get current user's status
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      userId: user.id,
      status: 'ONLINE', // Default to online for now
      lastSeen: new Date()
    });
  } catch (error) {
    console.error('Error fetching user status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user status' },
      { status: 500 }
    );
  }
}

// PUT - Update user status
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    if (!status || !['ONLINE', 'OFFLINE', 'AWAY'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ONLINE, OFFLINE, or AWAY' },
        { status: 400 }
      );
    }

    // Broadcast status change to all users via Pusher
    if (status === 'ONLINE') {
      await broadcastToAll('user-online', { userId });
    } else {
      await broadcastToAll('user-offline', { userId, lastSeen: new Date() });
    }

    return NextResponse.json({
      userId,
      status,
      lastSeen: new Date()
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
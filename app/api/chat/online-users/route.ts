import { NextRequest, NextResponse } from 'next/server';
import { verifyUserToken } from '@/lib/auth-server';

// Simulate online users (in production, use WebSocket or Socket.io)
const onlineUsers = new Set<string>();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real implementation, this would connect to your WebSocket server
    // For now, we'll simulate some online users

    // Simulate some users being online (random for demo)
    const mockOnlineUsers = [
      'user1',
      'user2',
      'user3'
    ].filter(() => Math.random() > 0.3);

    return NextResponse.json(mockOnlineUsers);
  } catch (error) {
    console.error('Error fetching online users:', error);
    return NextResponse.json({ error: 'Failed to fetch online users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body; // action: 'online' or 'offline'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (action === 'online') {
      onlineUsers.add(userId);
    } else if (action === 'offline') {
      onlineUsers.delete(userId);
    }

    return NextResponse.json({
      message: `User ${action}`,
      onlineUsers: Array.from(onlineUsers)
    });
  } catch (error) {
    console.error('Error updating online status:', error);
    return NextResponse.json({ error: 'Failed to update online status' }, { status: 500 });
  }
}

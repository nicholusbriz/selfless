import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Channel format: private-user-{userId}, presence-role-{role}, or presence-online-users
    const presenceData: any = {};

    if (channelName.startsWith('private-user-')) {
      // Private channel for user-specific messages
      const auth = pusher.authorizeChannel(socketId, channelName);
      return NextResponse.json(auth);
    } else if (channelName.startsWith('presence-role-')) {
      const role = channelName.replace('presence-role-', '');
      presenceData.user_id = userId; // Use userId as the unique identifier
      presenceData.user_info = {
        role,
        userId,
        type: 'role'
      };
    } else if (channelName === 'presence-online-users') {
      // Shared presence channel for tracking online users
      presenceData.user_id = userId;
      presenceData.user_info = {
        userId,
        type: 'user'
      };
    }

    const auth = pusher.authorizeChannel(socketId, channelName, presenceData);
    return NextResponse.json(auth);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

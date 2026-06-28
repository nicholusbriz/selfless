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

    // Extract user info from channel name or headers
    // Channel format: presence-user-{userId} or presence-role-{role}
    const presenceData: any = {};

    if (channelName.startsWith('presence-user-')) {
      const userId = channelName.replace('presence-user-', '');
      presenceData.user_id = userId;
      presenceData.user_info = {
        userId,
        type: 'user'
      };
    } else if (channelName.startsWith('presence-role-')) {
      const role = channelName.replace('presence-role-', '');
      presenceData.user_id = role;
      presenceData.user_info = {
        role,
        type: 'role'
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

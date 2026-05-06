import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import { verifyUserToken } from '@/lib/auth-server';
import { MessageModel } from '@/models/Message';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Extract participant IDs from conversation ID
    const participantIds = conversationId.replace('conv-', '').split('-');

    if (participantIds.length !== 2) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
    }

    // Verify user is part of this conversation
    if (!participantIds.includes(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [userId1, userId2] = participantIds;

    // Find messages between these two users (both directions)
    console.log('🔍 Fetching messages for conversation:', conversationId, 'user:', user.id);

    const messages = await MessageModel.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ timestamp: 1 });

    console.log('📋 Messages found:', messages.length);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

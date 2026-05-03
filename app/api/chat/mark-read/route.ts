import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import mongoose from 'mongoose';
import { verifyUserToken } from '@/lib/auth-server';

// Message schema
const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text'], default: 'text' },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  senderName: { type: String, required: true },
  receiverName: { type: String, required: true },
});

const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Mark all messages where user is receiver as read
    const result = await MessageModel.updateMany(
      {
        receiverId: user.id,
        senderId: { $in: participantIds },
        read: false
      },
      { read: true }
    );

    return NextResponse.json({
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyUserToken } from '@/lib/auth-server';
import connectToDatabase from '@/models/database';
import mongoose from 'mongoose';

// Message schema (same as in messages route)
const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text'], default: 'text' },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  senderName: { type: String, required: true },
  receiverName: { type: String, required: true },
  deletedFor: [{ type: String }], // Array of user IDs who have deleted this message
  deletedAt: { type: Date }, // When message was deleted for everyone
});

const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Verify user authentication
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, deleteForEveryone } = await request.json();

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // Find the message
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user can delete this message (sender or receiver)
    if (message.senderId !== user.id && message.receiverId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log(`Deleting message ${messageId} for user ${user.id}, deleteForEveryone: ${deleteForEveryone}`);

    if (deleteForEveryone) {
      // Delete for everyone - permanently remove from database
      await MessageModel.findByIdAndDelete(messageId);

      return NextResponse.json({
        success: true,
        deletedFor: 'everyone',
        message: 'Message deleted for everyone'
      });
    } else {
      // Delete for me only - permanently remove from database (since user wants it gone)
      await MessageModel.findByIdAndDelete(messageId);

      return NextResponse.json({
        success: true,
        deletedFor: 'me',
        message: 'Message deleted for you'
      });
    }

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}

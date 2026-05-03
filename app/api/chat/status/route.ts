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
  deletedFor: [{ type: String }],
  deletedAt: { type: Date },
  status: { type: String, enum: ['sending', 'sent', 'delivered', 'read'], default: 'sent' },
  reactions: [mongoose.Schema.Types.Mixed],
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

    const { messageId, status } = await request.json();

    if (!messageId || !status) {
      return NextResponse.json({ error: 'Message ID and status are required' }, { status: 400 });
    }

    // Find the message
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user can update this message status
    // Only receiver can mark as delivered/read, only sender can mark as sent
    if (status === 'delivered' || status === 'read') {
      if (message.receiverId !== user.id) {
        return NextResponse.json({ error: 'Only receiver can update delivery/read status' }, { status: 403 });
      }
    } else if (status === 'sent') {
      if (message.senderId !== user.id) {
        return NextResponse.json({ error: 'Only sender can update sent status' }, { status: 403 });
      }
    }

    // Update message status
    message.status = status;
    
    // If marking as read, also update the read flag
    if (status === 'read') {
      message.read = true;
    }

    await message.save();

    return NextResponse.json({
      success: true,
      status: message.status,
      read: message.read,
      message: `Message status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json({ error: 'Failed to update message status' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import mongoose from 'mongoose';
import { verifyUserToken } from '@/lib/auth-server';

// Reaction interface
interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

// Reaction schema
const ReactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

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
  reactions: [ReactionSchema],
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

    const { messageId, emoji, action } = await request.json();

    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'Message ID and emoji are required' }, { status: 400 });
    }

    // Find the message
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user can react to this message (sender or receiver)
    if (message.senderId !== user.id && message.receiverId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Initialize reactions array if it doesn't exist
    if (!message.reactions) {
      message.reactions = [];
    }

    // Check if user already reacted with this emoji
    const existingReactionIndex = message.reactions.findIndex(
      (reaction: MessageReaction) => reaction.userId === user.id && reaction.emoji === emoji
    );

    if (action === 'add') {
      // Add reaction if it doesn't exist
      if (existingReactionIndex === -1) {
        message.reactions.push({
          emoji,
          userId: user.id,
          userName: user.firstName + ' ' + user.lastName,
          timestamp: new Date(),
        });
      }
    } else if (action === 'remove') {
      // Remove reaction if it exists
      if (existingReactionIndex !== -1) {
        message.reactions.splice(existingReactionIndex, 1);
      }
    }

    await message.save();

    return NextResponse.json({
      success: true,
      reactions: message.reactions,
      message: `Reaction ${action === 'add' ? 'added' : 'removed'} successfully`
    });

  } catch (error) {
    console.error('Error managing reaction:', error);
    return NextResponse.json({ error: 'Failed to manage reaction' }, { status: 500 });
  }
}

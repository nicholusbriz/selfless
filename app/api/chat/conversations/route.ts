import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import { IUser } from '@/models/User';
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

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Users can only access their own conversations
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find all messages where user is either sender or receiver
    const messages = await MessageModel.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ timestamp: -1 });

    // Group messages by conversation
    const conversationsMap = new Map();

    messages.forEach(message => {
      const participantIds = [message.senderId, message.receiverId].sort();
      const conversationId = `conv-${participantIds[0]}-${participantIds[1]}`;

      if (!conversationsMap.has(conversationId)) {
        conversationsMap.set(conversationId, {
          id: conversationId,
          participants: [
            {
              userId: message.senderId,
              userName: message.senderName,
            },
            {
              userId: message.receiverId,
              userName: message.receiverName,
            }
          ],
          lastMessage: message,
          unreadCount: message.read ? 0 : 1,
          createdAt: message.timestamp,
          updatedAt: message.timestamp,
        });
      } else {
        // Update last message and unread count
        const conv = conversationsMap.get(conversationId);
        if (conv) {
          conv.lastMessage = message;
          conv.unreadCount = message.read ? conv.unreadCount : conv.unreadCount + 1;
          conv.updatedAt = message.timestamp;
        }
      }
    });

    // Convert to array and sort by last message time
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

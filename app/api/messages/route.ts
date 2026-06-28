import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastToUser } from '@/lib/websocket-server';

// GET - Fetch messages for a conversation
export async function GET(
  request: NextRequest
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const skip = (page - 1) * limit;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || !conversation.participantIds.includes(userId)) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Mark fetched messages as read
    if (messages.length > 0) {
      const messageIds = messages.map(m => m.id);
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          receiverId: userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    }

    // Return in ascending order for display
    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a message
export async function POST(
  request: NextRequest
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, conversationId } = await request.json();

    if (!content || !conversationId) {
      return NextResponse.json(
        { error: 'content and conversationId are required' },
        { status: 400 }
      );
    }

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || !conversation.participantIds.includes(userId)) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    // Find receiver (the other participant)
    const receiverId = conversation.participantIds.find(id => id !== userId);
    if (!receiverId) {
      return NextResponse.json(
        { error: 'Invalid conversation' },
        { status: 400 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId,
        conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true
          }
        }
      }
    });

    // Update conversation's last message
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageId: message.id,
        updatedAt: new Date()
      }
    });

    // Broadcast to receiver via Pusher
    await broadcastToUser(receiverId, 'new-message', {
      message,
      conversationId
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a message (with query param)
export async function DELETE(
  request: NextRequest
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const conversationId = searchParams.get('conversationId');

    if (!messageId || !conversationId) {
      return NextResponse.json(
        { error: 'messageId and conversationId are required' },
        { status: 400 }
      );
    }

    // Verify message exists and user is the sender
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message || message.senderId !== userId) {
      return NextResponse.json(
        { error: 'Message not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId }
    });

    // Update lastMessage if this was the last message
    const lastMessage = await prisma.message.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageId: lastMessage?.id || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}

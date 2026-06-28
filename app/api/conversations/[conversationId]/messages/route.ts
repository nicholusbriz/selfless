import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const skip = (page - 1) * limit;

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

    // Mark messages as read (only the ones fetched)
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

    // Return messages in ascending order for display
    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, receiverId } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
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

    // Auto-determine receiverId from conversation participants
    const autoReceiverId = receiverId || conversation.participantIds.find(id => id !== userId);

    if (!autoReceiverId) {
      return NextResponse.json(
        { error: 'Could not determine receiver' },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId: autoReceiverId,
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

    // Update conversation's lastMessage
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageId: message.id,
        updatedAt: new Date()
      }
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

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params to get conversationId
    const { conversationId } = await params;
    const userId = session.user.id;

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participantIds: { has: userId },
        isActive: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        isRead: false,
        senderId: { not: userId },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ messages });
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params to get conversationId
    const { conversationId } = await params;
    const { content, attachments = [] } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participantIds: { has: userId },
        isActive: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Create message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: userId,
        content: content.trim(),
        attachments: attachments || [],
      },
    });

    // Update conversation's last message
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
        lastMessageId: newMessage.id,
      },
    });

    // Create delivery status for other participants
    const otherParticipants = conversation.participantIds.filter(id => id !== userId);
    if (otherParticipants.length > 0) {
      await prisma.messageDeliveryStatus.createMany({
        data: otherParticipants.map(participantId => ({
          messageId: newMessage.id,
          userId: participantId,
        })),
      });
    }

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
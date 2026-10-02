import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all conversations where user is a participant
    // Database constraints prevent duplicates via participantKey
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: { has: userId },
        isActive: true,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Get other user info for each conversation
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participantIds.find(id => id !== userId);
        
        let otherUser = null;
        if (otherUserId) {
          otherUser = await prisma.user.findUnique({
            where: { id: otherUserId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              techCenter: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });
        }

        const lastMessage = conv.messages[0];

        // Calculate unread count for this conversation
        // Count messages sent by others that the current user hasn't read
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        });

        return {
          id: conv.id,
          participants: conv.participantIds,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt,
          } : null,
          otherUser: otherUser ? {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            fullName: `${otherUser.firstName} ${otherUser.lastName}`,
            image: otherUser.profileImageUrl,
            techCenter: otherUser.techCenter,
          } : null,
          unreadCount,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithUsers });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const participantId =
      body && typeof body.participantId === 'string'
        ? body.participantId.trim()
        : '';
    
    if (!participantId) {
      return NextResponse.json(
        { error: 'A valid participant ID is required.' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    if (participantId === userId) {
      return NextResponse.json(
        { error: 'You cannot start a conversation with your own account.' },
        { status: 400 }
      );
    }

    const otherUser = await prisma.user.findFirst({
      where: {
        id: participantId,
        OR: [
          {
            status: 'ACTIVE',
            isActive: true,
          },
          {
            role: { is: { name: 'dev' } },
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        techCenter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!otherUser) {
      return NextResponse.json(
        { error: 'The selected user was not found or is not active.' },
        { status: 404 }
      );
    }

    const participantKey = [userId, participantId].sort().join(':');

    const conversation = await prisma.conversation.upsert({
      where: { participantKey },
      update: {},
      create: {
        participantIds: [userId, participantId],
        participantKey,
        lastMessageAt: new Date(),
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (
      conversation.participantIds.length !== 2 ||
      !conversation.participantIds.includes(userId) ||
      !conversation.participantIds.includes(participantId)
    ) {
      return NextResponse.json(
        {
          error:
            'An existing conversation for this user pair has invalid participants. Please contact support.',
        },
        { status: 409 }
      );
    }

    const lastMessage = conversation.messages[0];

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        participants: conversation.participantIds,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt,
        } : null,
        otherUser: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          fullName: `${otherUser.firstName} ${otherUser.lastName}`,
          image: otherUser.profileImageUrl,
          techCenter: otherUser.techCenter,
        },
        unreadCount: await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            isRead: false,
          },
        }),
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
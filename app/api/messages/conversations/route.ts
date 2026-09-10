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

    const { participantId } = await request.json();
    
    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const participantKey = [userId, participantId].sort().join(':');

    // Use upsert to either find existing conversation or create new one
    // The participantKey unique constraint prevents duplicates for the same user pair
    const conversation = await prisma.conversation.upsert({
      where: { participantKey },
      update: {}, // Don't update anything if it exists
      create: {
        participantIds: [userId, participantId],
        participantKey,
        lastMessageAt: new Date(),
      },
    });

    // Validate that the conversation is one-to-one (exactly 2 participants)
    if (conversation.participantIds.length !== 2) {
      return NextResponse.json(
        { error: 'Conversation must be one-to-one' },
        { status: 400 }
      );
    }

    const otherUser = await prisma.user.findUnique({
      where: { id: participantId },
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

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        participants: conversation.participantIds,
        lastMessage: null,
        otherUser: otherUser ? {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          fullName: `${otherUser.firstName} ${otherUser.lastName}`,
          image: otherUser.profileImageUrl,
          techCenter: otherUser.techCenter,
        } : null,
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
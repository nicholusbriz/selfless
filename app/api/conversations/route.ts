import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: userId // ✅ MongoDB syntax for array contains
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Fetch last messages for all conversations
    const conversationIds = conversations.map(c => c.id);
    const lastMessages = await prisma.message.findMany({
      where: {
        conversationId: { in: conversationIds }
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['conversationId']
    });

    // Build a map for quick last message lookup
    const lastMessageMap = lastMessages.reduce((acc, msg) => {
      acc[msg.conversationId] = msg;
      return acc;
    }, {} as Record<string, any>);

    // Get all unique participant IDs
    const participantIds = [...new Set(conversations.flatMap(c => c.participantIds))];
    
    // Fetch all participants in one query
    const participants = await prisma.user.findMany({
      where: {
        id: {
          in: participantIds
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true
      }
    });

    // Build a map for quick participant lookup
    const participantMap = participants.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, any>);

    // Get unread counts for all conversations in one query
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        // Count unread messages for this conversation
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: userId,
            isRead: false
          }
        });

        // Get participants excluding current user
        const convParticipants = conv.participantIds
          .filter(id => id !== userId)
          .map(id => participantMap[id])
          .filter(Boolean);

        const lastMessage = lastMessageMap[conv.id] || null;

        return {
          ...conv,
          participants: convParticipants,
          unreadCount,
          lastMessage
        };
      })
    );

    return NextResponse.json(conversationsWithUnread);
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
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      );
    }

    // Check if participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId }
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if conversation already exists (either order)
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participantIds: { has: userId } },
          { participantIds: { has: participantId } }
        ]
      }
    });

    if (existingConversation) {
      // Return existing conversation with participant info
      const conversationWithParticipants = {
        ...existingConversation,
        participants: [participant]
      };
      return NextResponse.json(conversationWithParticipants);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participantIds: [userId, participantId]
      }
    });

    // Return conversation with participant info
    const conversationWithParticipants = {
      ...conversation,
      participants: [participant]
    };

    return NextResponse.json(conversationWithParticipants);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Count all unread messages for the user
    // Messages sent by others that the user hasn't read
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: {
          in: await prisma.conversation
            .findMany({
              where: {
                participantIds: { has: userId },
                isActive: true,
              },
              select: { id: true },
            })
            .then(convs => convs.map(c => c.id)),
        },
        senderId: { not: userId },
        isRead: false,
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {
      userId: session.user.id
    };

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    // Optimize: when only count is needed (limit=1), skip fetching notifications
    let notifications: any[] = [];
    let unreadCount = 0;

    if (limit === 1 && unreadOnly) {
      // Only fetch count for badge
      unreadCount = await prisma.notification.count({
        where: {
          userId: session.user.id,
          isRead: false
        }
      });
    } else {
      // Fetch both notifications and count
      [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: whereClause,
          orderBy: {
            createdAt: 'desc'
          },
          take: limit
        }),
        prisma.notification.count({
          where: {
            userId: session.user.id,
            isRead: false
          }
        })
      ]);
    }

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', notifications: [], unreadCount: 0, total: 0 },
      { status: 500 }
    );
  }
}

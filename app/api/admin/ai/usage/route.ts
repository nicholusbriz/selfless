import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });
    if (admin?.role?.name !== 'dev') {
      return NextResponse.json({ error: 'Forbidden - dev only' }, { status: 403 });
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [totalQueries, recentQueries, activeUsers] = await Promise.all([
      prisma.activityLog.count({
        where: { action: 'ai_chat_opened', entityType: 'ai_assistant' },
      }),
      prisma.activityLog.count({
        where: {
          action: 'ai_chat_opened',
          entityType: 'ai_assistant',
          createdAt: { gte: since },
        },
      }),
      prisma.activityLog.findMany({
        where: {
          action: 'ai_chat_opened',
          entityType: 'ai_assistant',
          createdAt: { gte: since },
          userId: { not: null },
        },
        distinct: ['userId'],
        select: { userId: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalQueries,
        recentQueries,
        activeUsers: activeUsers.length,
      },
    });
  } catch (error) {
    console.error('AI usage stats error:', error);
    return NextResponse.json({ error: 'Failed to load AI usage statistics' }, { status: 500 });
  }
}

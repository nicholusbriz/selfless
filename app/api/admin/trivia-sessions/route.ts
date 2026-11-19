import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { getApiErrorMessage } from '@/lib/api-response';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is super admin or dev
    if (!session?.user?.id || (session.user.role !== 'super_admin' && session.user.role !== 'dev')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    // Group sessions by user: total sessions, total credits, last played
    const grouped = await prisma.triviaGameSession.groupBy({
      by: ['userId'],
      where,
      _count: { id: true },
      _sum: { points: true },
      _max: { playedAt: true },
      orderBy: { _sum: { points: 'desc' } },
      skip,
      take: limit,
    });

    const total = await prisma.triviaGameSession.groupBy({
      by: ['userId'],
      where,
    }).then((rows) => rows.length);

    const userIds = grouped.map((row) => row.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
      },
    });
    const userById = new Map(users.map((u) => [u.id, u]));

    const sessions = grouped.map((row) => ({
      id: row.userId,
      sessions: row._count.id,
      credits: row._sum.points || 0,
      lastPlayedAt: row._max.playedAt,
      user: userById.get(row.userId) ?? {
        id: row.userId,
        firstName: 'Unknown',
        lastName: 'User',
        email: '',
        profileImageUrl: null,
      },
    }));

    // Global stats across all users
    const [totalSessions, pointsAgg] = await Promise.all([
      prisma.triviaGameSession.count({ where }),
      prisma.triviaGameSession.aggregate({ _sum: { points: true } }),
    ]);

    return NextResponse.json({
      success: true,
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalGames: totalSessions,
        totalPointsEarned: pointsAgg._sum.points || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching trivia sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: getApiErrorMessage(error, 'Failed to fetch trivia sessions'),
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getApiErrorMessage } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    await requireAuth();

    const scores = await prisma.triviaGameSession.groupBy({
      by: ['userId'],
      _sum: { points: true },
      _count: { _all: true },
      orderBy: [{ _sum: { points: 'desc' } }, { userId: 'asc' }],
      take: 10,
    });

    const users = await prisma.user.findMany({
      where: { id: { in: scores.map((score) => score.userId) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });
    const usersById = new Map(users.map((user) => [user.id, user]));

    const leaderboard = scores.flatMap((score, index) => {
      const user = usersById.get(score.userId);
      if (!user) return [];

      return [{
        rank: index + 1,
        user,
        points: score._sum.points ?? 0,
        gamesPlayed: score._count._all,
      }];
    });

    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error fetching trivia leaderboard:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: getApiErrorMessage(error, 'Failed to fetch trivia leaderboard'),
      },
      { status: 500 },
    );
  }
}

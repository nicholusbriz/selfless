import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { getDailyTriviaGames } from '@/lib/trivia/daily-games-server';
import { getCurrentTriviaLevel } from '@/lib/trivia/current-level-server';
import {
  getActiveTriviaLock,
  getNextUtcTriviaReset,
  isCurrentUtcTriviaDay,
} from '@/lib/trivia/daily-lock';
import { MAX_DAILY_HEARTS } from '@/lib/trivia/heart-sharing';

export async function GET() {
  try {
    const user = await requireAuth();

    const points = await prisma.triviaGameSession.aggregate({
      where: { userId: user.id },
      _sum: { points: true },
    });

    // Get user's current level
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        currentLevel: true,
        triviaLockedUntil: true,
        triviaHeartsRemaining: true,
        triviaHeartsDate: true,
      },
    });

    const currentLevel = userData
      ? await getCurrentTriviaLevel(user.id)
      : 1;
    const storedLock = isCurrentUtcTriviaDay(userData?.triviaHeartsDate ?? null)
      ? getActiveTriviaLock(userData?.triviaLockedUntil ?? null)
      : null;
    const dailyHeartsRemaining = isCurrentUtcTriviaDay(userData?.triviaHeartsDate ?? null)
      ? userData?.triviaHeartsRemaining ?? MAX_DAILY_HEARTS
      : MAX_DAILY_HEARTS;
    const triviaLockedUntil =
      storedLock ??
      (dailyHeartsRemaining === 0 ? getNextUtcTriviaReset() : null);
    const dailyGames = await getDailyTriviaGames(user.id);

    return NextResponse.json({
      success: true,
      triviaPoints: points._sum.points ?? 0,
      currentLevel,
      triviaLockedUntil: triviaLockedUntil?.toISOString() ?? null,
      dailyHeartsRemaining: triviaLockedUntil ? 0 : dailyHeartsRemaining,
      dailyGames,
    });
  } catch (error) {
    console.error('Error fetching trivia points:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch trivia points' },
      { status: 500 }
    );
  }
}

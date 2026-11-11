import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import {
  getActiveTriviaLock,
  getNextUtcTriviaReset,
  isCurrentUtcTriviaDay,
} from '@/lib/trivia/daily-lock';

export async function GET() {
  try {
    // Get authenticated user
    const user = await requireAuth();
    console.log('Fetching trivia points for user:', user.id);

    // Calculate total points from all trivia game sessions
    const sessions = await prisma.triviaGameSession.findMany({
      where: { userId: user.id },
      select: {
        points: true,
      },
    });

    console.log('User trivia sessions:', sessions);

    const totalPoints = sessions.reduce((sum, session) => sum + session.points, 0);
    console.log('Calculated total points:', totalPoints);

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

    const currentLevel = userData?.currentLevel || 1;
    const storedLock = getActiveTriviaLock(userData?.triviaLockedUntil ?? null);
    const dailyHeartsRemaining = isCurrentUtcTriviaDay(userData?.triviaHeartsDate ?? null)
      ? userData?.triviaHeartsRemaining ?? 3
      : 3;
    const triviaLockedUntil =
      storedLock ??
      (dailyHeartsRemaining === 0 ? getNextUtcTriviaReset() : null);

    return NextResponse.json({
      success: true,
      triviaPoints: totalPoints,
      currentLevel,
      triviaLockedUntil: triviaLockedUntil?.toISOString() ?? null,
      dailyHeartsRemaining: triviaLockedUntil ? 0 : dailyHeartsRemaining,
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

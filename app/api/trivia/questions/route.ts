import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { getDailyTriviaGames } from '@/lib/trivia/daily-games-server';
import { getEatTriviaDay, hasReachedDailyGameLimit } from '@/lib/trivia/daily-games';
import { getCurrentTriviaLevel } from '@/lib/trivia/current-level-server';
import { getDifficultyForLevel } from '@/lib/trivia/levels';
import {
  randomizeTriviaOptions,
  selectTriviaQuestions,
} from '@/lib/trivia/questions';
import {
  getActiveTriviaLock,
  getNextUtcTriviaReset,
  isCurrentUtcTriviaDay,
} from '@/lib/trivia/daily-lock';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const now = new Date();
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        triviaLockedUntil: true,
        triviaHeartsRemaining: true,
        triviaHeartsDate: true,
      },
    });
    const heartsRemaining = isCurrentUtcTriviaDay(account?.triviaHeartsDate ?? null)
      ? account?.triviaHeartsRemaining ?? 3
      : 3;
    const triviaLockedUntil =
      getActiveTriviaLock(account?.triviaLockedUntil ?? null) ??
      (heartsRemaining === 0 ? getNextUtcTriviaReset() : null);

    if (triviaLockedUntil) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have used all three hearts for today.',
          triviaLockedUntil: triviaLockedUntil.toISOString(),
          dailyHeartsRemaining: 0,
        },
        { status: 423 },
      );
    }

    const dailyGames = await getDailyTriviaGames(user.id, now);
    if (hasReachedDailyGameLimit(dailyGames.completed)) {
      return NextResponse.json(
        {
          success: false,
          code: 'DAILY_GAME_LIMIT',
          error: 'You have completed 10 trivia games today.',
          dailyGames,
        },
        { status: 423 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get('count') || '10', 10);
    const level = await getCurrentTriviaLevel(user.id, now);
    const difficulty = searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced' | undefined;
    const category = searchParams.get('category') as 'grammar' | 'vocabulary' | 'reading' | 'idioms' | 'common-mistakes' | undefined;

    const limit = Math.min(Math.max(count, 1), 20); // Limit to 1-20 questions

    // Build where clause
    const where: Prisma.TriviaQuestionWhereInput = {
      isActive: true,
    };

    // Use provided difficulty or calculate from level
    const targetDifficulty = difficulty || getDifficultyForLevel(level);
    where.difficulty = targetDifficulty;

    if (category) {
      where.category = category;
    }

    // Fetch all matching questions
    const allQuestions = await prisma.triviaQuestion.findMany({
      where,
      select: {
        id: true,
        referenceId: true,
        question: true,
        options: true,
        correctAnswer: true,
        category: true,
        difficulty: true,
        explanation: true,
      },
    });

    const { reset: currentDayReset } = getEatTriviaDay(now);
    const latestSession = await prisma.triviaGameSession.findFirst({
      where: { userId: user.id, playedAt: { lt: currentDayReset } },
      orderBy: { playedAt: 'desc' },
      select: { playedAt: true },
    });
    const recentlyUsedQuestionIds = new Set<string>();
    if (latestSession) {
      const { start, reset } = getEatTriviaDay(latestSession.playedAt);
      const sessions = await prisma.triviaGameSession.findMany({
        where: {
          userId: user.id,
          playedAt: { gte: start, lt: reset },
        },
        select: { answers: { select: { questionId: true } } },
      });
      for (const session of sessions) {
        for (const answer of session.answers) {
          recentlyUsedQuestionIds.add(answer.questionId);
        }
      }
    }

    const selectedQuestions = selectTriviaQuestions(
      allQuestions,
      recentlyUsedQuestionIds,
      limit,
    );
    const questions = selectedQuestions.map((question) => ({
      ...question,
      ...randomizeTriviaOptions(question.options, question.correctAnswer),
    }));

    // Increment timesAsked for each selected question
    if (questions.length > 0) {
      await prisma.triviaQuestion.updateMany({
        where: {
          id: {
            in: questions.map((q) => q.id),
          },
        },
        data: {
          timesAsked: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      questions,
      count: questions.length,
      level,
      difficulty: targetDifficulty,
      dailyHeartsRemaining: heartsRemaining,
      dailyGames,
    });
  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trivia questions',
      },
      { status: 500 }
    );
  }
}

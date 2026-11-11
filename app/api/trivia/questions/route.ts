import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import {
  getActiveTriviaLock,
  getNextUtcTriviaReset,
  isCurrentUtcTriviaDay,
} from '@/lib/trivia/daily-lock';

// Map levels to difficulty
function getDifficultyForLevel(level: number): 'beginner' | 'intermediate' | 'advanced' {
  if (level <= 3) return 'beginner';
  if (level <= 6) return 'intermediate';
  return 'advanced';
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
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

    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get('count') || '10', 10);
    const level = parseInt(searchParams.get('level') || '1', 10);
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

    // Shuffle and pick random questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, Math.min(limit, shuffled.length));

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

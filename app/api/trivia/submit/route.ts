import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';
import { prisma } from '@/lib/prisma/client';
import {
  getActiveTriviaLock,
  getNextUtcTriviaReset,
  isCurrentUtcTriviaDay,
} from '@/lib/trivia/daily-lock';

const MAX_LEVEL = 10;
const MIN_ACCURACY_TO_LEVEL_UP = 70;
const POINTS_PER_CORRECT = 10;
const STREAK_BONUS_PER_POINT = 2;
const SKIP_PENALTY = 2;

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isJsonObject(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const { correct, total, streak, answers } = body;

    // --- Validate scalars ---
    if (
      typeof correct !== 'number' ||
      typeof total !== 'number' ||
      typeof streak !== 'number' ||
      !Number.isInteger(correct) ||
      !Number.isInteger(total) ||
      !Number.isInteger(streak) ||
      total <= 0 ||
      correct < 0 ||
      correct > total ||
      streak < 0 ||
      streak > total
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 },
      );
    }

    // --- Validate answers array ---
    let rawAnswers: Array<{ questionId: string; userAnswer: number }> = [];
    if (Array.isArray(answers)) {
      rawAnswers = answers
        .filter(
          (a): a is { questionId: string; userAnswer: number } =>
            isJsonObject(a) &&
            typeof a.questionId === 'string' &&
            typeof a.userAnswer === 'number' &&
            Number.isInteger(a.userAnswer),
        )
        .map((a) => ({ questionId: a.questionId, userAnswer: a.userAnswer }));
    }

    // --- Session / user ---
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // --- Load user's current level ---
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentLevel: true,
        triviaLockedUntil: true,
        triviaHeartsRemaining: true,
        triviaHeartsDate: true,
      },
    });

    const storedLock = getActiveTriviaLock(user?.triviaLockedUntil ?? null);
    const triviaLockedUntil =
      storedLock ??
      (isCurrentUtcTriviaDay(user?.triviaHeartsDate ?? null) &&
      user?.triviaHeartsRemaining === 0
        ? getNextUtcTriviaReset()
        : null);
    if (triviaLockedUntil) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have used all three hearts for today.',
          triviaLockedUntil: triviaLockedUntil.toISOString(),
        },
        { status: 423 },
      );
    }

    const currentLevel = user?.currentLevel ?? 1;

    // --- Recompute correctness server-side ---
    let serverAnswers: Array<{
      questionId: string;
      userAnswer: number;
      isCorrect: boolean;
    }> = [];

    if (rawAnswers.length > 0) {
      const questionIds = [...new Set(rawAnswers.map((a) => a.questionId))];
      const dbQuestions = await prisma.triviaQuestion.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, correctAnswer: true },
      });
      const answerKey = new Map(dbQuestions.map((q) => [q.id, q.correctAnswer]));

      serverAnswers = rawAnswers
        .filter((a) => answerKey.has(a.questionId))
        .map((a) => ({
          questionId: a.questionId,
          userAnswer: a.userAnswer,
          isCorrect:
            a.userAnswer !== -1 && answerKey.get(a.questionId) === a.userAnswer,
        }));
    }

    const serverTotal = serverAnswers.length > 0 ? serverAnswers.length : total;
    const serverCorrect = serverAnswers.filter((a) => a.isCorrect).length;
    const accuracy = serverTotal > 0 ? (serverCorrect / serverTotal) * 100 : 0;

    // --- Server-computed points ---
    const skipped = serverAnswers.filter((a) => a.userAnswer === -1).length;
    const basePoints = serverCorrect * POINTS_PER_CORRECT;
    const streakBonus = Math.max(0, streak) * STREAK_BONUS_PER_POINT;
    const skipPenalty = skipped * SKIP_PENALTY;
    const points = Math.max(0, basePoints + streakBonus - skipPenalty);

    // --- Level progression (hard stop at MAX_LEVEL) ---
    const atMaxLevel = currentLevel >= MAX_LEVEL;
    const shouldLevelUp =
      !atMaxLevel && accuracy >= MIN_ACCURACY_TO_LEVEL_UP;

    const levelUnlocked = shouldLevelUp;
    const newLevel = shouldLevelUp ? currentLevel + 1 : currentLevel;

    // --- Persist session ---
    const gameSession = await prisma.triviaGameSession.create({
      data: {
        userId,
        correct: serverCorrect,
        total: serverTotal,
        points,
        streak,
        accuracy,
        level: currentLevel,
      },
    });

    // --- Persist answers + analytics ---
    if (serverAnswers.length > 0) {
      await prisma.triviaGameAnswer.createMany({
        data: serverAnswers.map((a) => ({
          sessionId: gameSession.id,
          questionId: a.questionId,
          userAnswer: a.userAnswer,
          isCorrect: a.isCorrect,
        })),
      });

      for (const a of serverAnswers) {
        if (a.isCorrect) {
          await prisma.triviaQuestion.update({
            where: { id: a.questionId },
            data: { timesCorrect: { increment: 1 } },
          });
        }
      }

      const affectedIds = [...new Set(serverAnswers.map((a) => a.questionId))];
      const refreshed = await prisma.triviaQuestion.findMany({
        where: { id: { in: affectedIds } },
        select: { id: true, timesAsked: true, timesCorrect: true },
      });

      for (const q of refreshed) {
        if (q.timesAsked > 0) {
          await prisma.triviaQuestion.update({
            where: { id: q.id },
            data: { difficultyRating: 1 - q.timesCorrect / q.timesAsked },
          });
        }
      }
    }

    // --- Apply level-up ---
    if (levelUnlocked) {
      await prisma.user.update({
        where: { id: userId },
        data: { currentLevel: newLevel },
      });
    }

    const finished = atMaxLevel && !levelUnlocked;

    return NextResponse.json({
      success: true,
      points,
      correct: serverCorrect,
      total: serverTotal,
      streak,
      accuracy,
      currentLevel,
      newLevel,
      levelUnlocked,
      finished,
      message: levelUnlocked
        ? `Congratulations! You've unlocked Level ${newLevel}!`
        : finished
          ? `You've completed all ${MAX_LEVEL} levels!`
          : `You earned ${points} points!`,
    });
  } catch (error) {
    console.error('Error submitting trivia results:', error);
    return NextResponse.json(
      {
        success: false,
        error: getApiErrorMessage(error, 'Failed to submit trivia results'),
      },
      { status: 500 },
    );
  }
}
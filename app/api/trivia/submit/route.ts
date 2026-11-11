import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';
import { prisma } from '@/lib/prisma/client';
import {
  getEatTriviaDay,
  hasReachedDailyGameLimit,
  MAX_DAILY_TRIVIA_GAMES,
} from '@/lib/trivia/daily-games';
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

class DailyTriviaLimitError extends Error {
  constructor(readonly reset: Date) {
    super('You have completed 10 trivia games today.');
  }
}

class TriviaHeartsExhaustedError extends Error {
  constructor(readonly reset: Date) {
    super('You have used all three hearts for today.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isJsonObject(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const { correct, total, streak, answers, submissionId } = body;

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
      streak > total ||
      typeof submissionId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)
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
    if (
      !Array.isArray(answers) ||
      rawAnswers.length !== total ||
      new Set(rawAnswers.map((a) => a.questionId)).size !== total ||
      rawAnswers.some((a) => a.userAnswer < -1 || a.userAnswer > 3)
    ) {
      return NextResponse.json(
        { success: false, error: 'All questions must be answered before submitting.' },
        { status: 400 },
      );
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

    if (serverAnswers.length !== total) {
      return NextResponse.json(
        { success: false, error: 'Some trivia questions could not be found.' },
        { status: 400 },
      );
    }
    const serverTotal = serverAnswers.length;
    const serverCorrect = serverAnswers.filter((a) => a.isCorrect).length;
    const accuracy = serverTotal > 0 ? (serverCorrect / serverTotal) * 100 : 0;

    // --- Server-computed points ---
    const skipped = serverAnswers.filter((a) => a.userAnswer === -1).length;
    const basePoints = serverCorrect * POINTS_PER_CORRECT;
    const streakBonus = Math.max(0, streak) * STREAK_BONUS_PER_POINT;
    const skipPenalty = skipped * SKIP_PENALTY;
    const points = Math.max(0, basePoints + streakBonus - skipPenalty);

    // The user write serializes concurrent submissions before counting sessions.
    const saved = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { triviaSubmissionToken: randomUUID() },
        select: {
          currentLevel: true,
          triviaLockedUntil: true,
          triviaHeartsRemaining: true,
          triviaHeartsDate: true,
        },
      });

      const existing = await tx.triviaGameSession.findFirst({
        where: { userId, submissionId },
      });
      const now = new Date();
      const { start, reset } = getEatTriviaDay(now);
      const completedToday = await tx.triviaGameSession.count({
        where: { userId, playedAt: { gte: start, lt: reset } },
      });
      if (existing) {
        return { session: existing, completedToday, reset };
      }

      const storedLock = getActiveTriviaLock(user.triviaLockedUntil, now);
      const triviaLockedUntil =
        storedLock ??
        (isCurrentUtcTriviaDay(user.triviaHeartsDate, now) &&
        user.triviaHeartsRemaining === 0
          ? getNextUtcTriviaReset(now)
          : null);
      if (triviaLockedUntil) throw new TriviaHeartsExhaustedError(triviaLockedUntil);

      if (hasReachedDailyGameLimit(completedToday)) {
        throw new DailyTriviaLimitError(reset);
      }

      const currentLevel = user.currentLevel;
      const levelUnlocked =
        currentLevel < MAX_LEVEL && accuracy >= MIN_ACCURACY_TO_LEVEL_UP;
      const gameSession = await tx.triviaGameSession.create({
        data: {
          userId, correct: serverCorrect, total: serverTotal, points, streak,
          accuracy, level: currentLevel, submissionId, playedAt: now,
        },
      });

      if (serverAnswers.length > 0) {
        await tx.triviaGameAnswer.createMany({
          data: serverAnswers.map((a) => ({
            sessionId: gameSession.id,
            questionId: a.questionId,
            userAnswer: a.userAnswer,
            isCorrect: a.isCorrect,
          })),
        });

        for (const a of serverAnswers) {
          if (a.isCorrect) {
            await tx.triviaQuestion.update({
              where: { id: a.questionId },
              data: { timesCorrect: { increment: 1 } },
            });
          }
        }

        const affectedIds = [...new Set(serverAnswers.map((a) => a.questionId))];
        const refreshed = await tx.triviaQuestion.findMany({
          where: { id: { in: affectedIds } },
          select: { id: true, timesAsked: true, timesCorrect: true },
        });

        for (const q of refreshed) {
          if (q.timesAsked > 0) {
            await tx.triviaQuestion.update({
              where: { id: q.id },
              data: { difficultyRating: 1 - q.timesCorrect / q.timesAsked },
            });
          }
        }
      }

      if (levelUnlocked) {
        await tx.user.update({
          where: { id: userId },
          data: { currentLevel: currentLevel + 1 },
        });
      }
      return { session: gameSession, completedToday: completedToday + 1, reset };
    }, { timeout: 60000, maxWait: 10000 });

    const currentLevel = saved.session.level;
    const levelUnlocked =
      currentLevel < MAX_LEVEL && saved.session.accuracy >= MIN_ACCURACY_TO_LEVEL_UP;
    const newLevel = levelUnlocked ? currentLevel + 1 : currentLevel;
    const finished = currentLevel >= MAX_LEVEL;

    return NextResponse.json({
      success: true,
      points: saved.session.points,
      correct: saved.session.correct,
      total: saved.session.total,
      streak: saved.session.streak,
      accuracy: saved.session.accuracy,
      dailyGames: {
        completed: saved.completedToday,
        limit: MAX_DAILY_TRIVIA_GAMES,
        resetAt: saved.reset.toISOString(),
      },
      currentLevel,
      newLevel,
      levelUnlocked,
      finished,
      message: levelUnlocked
        ? `Congratulations! You've unlocked Level ${newLevel}!`
        : finished
          ? `You've completed all ${MAX_LEVEL} levels!`
          : `You earned ${saved.session.points} points!`,
    });
  } catch (error) {
    if (error instanceof DailyTriviaLimitError) {
      return NextResponse.json(
        { success: false, code: 'DAILY_GAME_LIMIT', error: error.message, dailyGamesResetAt: error.reset.toISOString() },
        { status: 423 },
      );
    }
    if (error instanceof TriviaHeartsExhaustedError) {
      return NextResponse.json(
        { success: false, error: error.message, triviaLockedUntil: error.reset.toISOString() },
        { status: 423 },
      );
    }
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
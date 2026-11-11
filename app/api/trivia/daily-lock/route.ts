import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { isJsonObject } from '@/lib/api-response';
import {
  getActiveTriviaLock,
  getNextUtcTriviaReset,
  getUtcTriviaDayStart,
  isCurrentUtcTriviaDay,
} from '@/lib/trivia/daily-lock';
import { prisma } from '@/lib/prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    if (
      !isJsonObject(body) ||
      typeof body.questionId !== 'string' ||
      !/^[a-f\d]{24}$/i.test(body.questionId) ||
      typeof body.failureId !== 'string' ||
      !/^[a-f\d-]{36}$/i.test(body.failureId)
    ) {
      return NextResponse.json(
        { success: false, error: 'A valid question ID is required' },
        { status: 400 },
      );
    }

    const questionExists = await prisma.triviaQuestion.findUnique({
      where: { id: body.questionId },
      select: { id: true },
    });
    if (!questionExists) {
      return NextResponse.json(
        { success: false, error: 'Trivia question not found' },
        { status: 404 },
      );
    }

    const now = new Date();
    const dayStart = getUtcTriviaDayStart(now);
    const userId = session.user.id;

    await prisma.user.updateMany({
      where: {
        id: userId,
        OR: [
          { triviaHeartsDate: null },
          { triviaHeartsDate: { lt: dayStart } },
        ],
      },
      data: {
        triviaHeartsDate: dayStart,
        triviaHeartsRemaining: 3,
        triviaFailureIds: [],
        triviaLockedUntil: null,
      },
    });

    let account = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        triviaHeartsDate: true,
        triviaHeartsRemaining: true,
        triviaFailureIds: true,
        triviaLockedUntil: true,
      },
    });
    if (!account) {
      return NextResponse.json(
        { success: false, error: 'User account not found' },
        { status: 404 },
      );
    }

    let lockedUntil = getActiveTriviaLock(account.triviaLockedUntil, now);
    if (!isCurrentUtcTriviaDay(account.triviaHeartsDate, now)) {
      return NextResponse.json(
        { success: false, error: 'Could not initialize daily trivia hearts' },
        { status: 500 },
      );
    }

    if (account.triviaHeartsRemaining === 0) {
      lockedUntil ??= getNextUtcTriviaReset(now);
    } else if (!lockedUntil && !account.triviaFailureIds.includes(body.failureId)) {
      await prisma.user.updateMany({
        where: {
          id: userId,
          triviaHeartsDate: dayStart,
          triviaHeartsRemaining: { gt: 0 },
          NOT: { triviaFailureIds: { has: body.failureId } },
          AND: [
            {
              OR: [
                { triviaLockedUntil: null },
                { triviaLockedUntil: { lte: now } },
              ],
            },
          ],
        },
        data: {
          triviaHeartsRemaining: { decrement: 1 },
          triviaFailureIds: { push: body.failureId },
        },
      });

      account = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          triviaHeartsDate: true,
          triviaHeartsRemaining: true,
          triviaFailureIds: true,
          triviaLockedUntil: true,
        },
      });
      if (!account) {
        return NextResponse.json(
          { success: false, error: 'User account not found' },
          { status: 404 },
        );
      }

      lockedUntil = getActiveTriviaLock(account.triviaLockedUntil, now);
      if (account.triviaHeartsRemaining === 0) {
        const resetAt = getNextUtcTriviaReset(now);
        await prisma.user.updateMany({
          where: {
            id: userId,
            triviaHeartsDate: dayStart,
            triviaHeartsRemaining: 0,
            OR: [
              { triviaLockedUntil: null },
              { triviaLockedUntil: { lte: now } },
            ],
          },
          data: { triviaLockedUntil: resetAt },
        });
        lockedUntil = resetAt;
      }
    }

    return NextResponse.json({
      success: true,
      dailyHeartsRemaining: account.triviaHeartsRemaining,
      triviaLockedUntil: lockedUntil?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('Error recording failed trivia question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record failed trivia question' },
      { status: 500 },
    );
  }
}

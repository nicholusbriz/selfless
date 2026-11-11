import { Prisma } from '@prisma/client';
import {
  getActiveTriviaLock,
  getNextUtcTriviaReset,
  getUtcTriviaDayStart,
  isCurrentUtcTriviaDay,
} from './daily-lock';

type HeartDatabase = Pick<Prisma.TransactionClient, 'user'>;

const heartSelection = {
  triviaHeartsDate: true,
  triviaHeartsRemaining: true,
  triviaFailureIds: true,
  triviaLockedUntil: true,
} as const;

export async function recordFailedTriviaQuestion(
  db: HeartDatabase,
  userId: string,
  failureId: string,
  now = new Date(),
) {
  const dayStart = getUtcTriviaDayStart(now);

  await db.user.updateMany({
    where: {
      id: userId,
      OR: [
        { triviaHeartsDate: null },
        { triviaHeartsDate: { isSet: false } },
        { triviaHeartsDate: { lt: dayStart } },
      ],
    },
    data: {
      triviaHeartsDate: dayStart,
      triviaHeartsRemaining: 3,
      triviaFailureIds: [],
    },
  });

  let account = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: heartSelection,
  });
  if (!isCurrentUtcTriviaDay(account.triviaHeartsDate, now)) {
    throw new Error('Could not initialize daily trivia hearts');
  }

  let lockedUntil = getActiveTriviaLock(account.triviaLockedUntil, now);
  if (account.triviaHeartsRemaining === 0) {
    lockedUntil ??= getNextUtcTriviaReset(now);
  } else if (!lockedUntil && !account.triviaFailureIds.includes(failureId)) {
    await db.user.updateMany({
      where: {
        id: userId,
        triviaHeartsDate: dayStart,
        triviaHeartsRemaining: { gt: 0 },
        NOT: { triviaFailureIds: { has: failureId } },
        OR: [
          { triviaLockedUntil: null },
          { triviaLockedUntil: { isSet: false } },
          { triviaLockedUntil: { lte: now } },
        ],
      },
      data: {
        triviaHeartsRemaining: { decrement: 1 },
        triviaFailureIds: { push: failureId },
      },
    });

    account = await db.user.findUniqueOrThrow({
      where: { id: userId },
      select: heartSelection,
    });
    lockedUntil = getActiveTriviaLock(account.triviaLockedUntil, now);
    if (account.triviaHeartsRemaining === 0) {
      lockedUntil ??= getNextUtcTriviaReset(now);
      await db.user.updateMany({
        where: {
          id: userId,
          triviaHeartsDate: dayStart,
          triviaHeartsRemaining: 0,
          OR: [
            { triviaLockedUntil: null },
            { triviaLockedUntil: { isSet: false } },
            { triviaLockedUntil: { lte: now } },
          ],
        },
        data: { triviaLockedUntil: lockedUntil },
      });
    } else if (!lockedUntil && !account.triviaFailureIds.includes(failureId)) {
      throw new Error('Could not record the failed trivia question');
    }
  }

  return {
    dailyHeartsRemaining: lockedUntil ? 0 : account.triviaHeartsRemaining,
    triviaLockedUntil: lockedUntil?.toISOString() ?? null,
  };
}

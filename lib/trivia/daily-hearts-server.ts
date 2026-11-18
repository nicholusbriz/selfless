import { Prisma } from '@prisma/client';
import {
  getActiveTriviaLock,
  getNextUtcTriviaReset,
  getUtcTriviaDayStart,
  isCurrentUtcTriviaDay,
} from './daily-lock';
import { MAX_DAILY_HEARTS } from './heart-sharing';

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

  // First, ensure the user has initialized hearts for today
  let account = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: heartSelection,
  });

  if (!isCurrentUtcTriviaDay(account.triviaHeartsDate, now)) {
    // Initialize hearts for today if not already done
    account = await db.user.update({
      where: { id: userId },
      data: {
        triviaHeartsDate: dayStart,
        triviaHeartsRemaining: MAX_DAILY_HEARTS,
        triviaFailureIds: [],
        triviaLockedUntil: null,
      },
      select: heartSelection,
    });
  }

  let lockedUntil = getActiveTriviaLock(account.triviaLockedUntil, now);
  if (account.triviaHeartsRemaining === 0) {
    lockedUntil ??= getNextUtcTriviaReset(now);
  } else if (!lockedUntil && !account.triviaFailureIds.includes(failureId)) {
    const locksAfterFailure = account.triviaHeartsRemaining === 1;
    lockedUntil = locksAfterFailure ? getNextUtcTriviaReset(now) : null;
    account = await db.user.update({
      where: { id: userId },
      data: {
        triviaHeartsRemaining: { decrement: 1 },
        triviaFailureIds: { push: failureId },
        ...(lockedUntil ? { triviaLockedUntil: lockedUntil } : {}),
      },
      select: heartSelection,
    });

    lockedUntil = getActiveTriviaLock(account.triviaLockedUntil, now);
    if (account.triviaHeartsRemaining === 0) {
      lockedUntil ??= getNextUtcTriviaReset(now);
    } else if (!lockedUntil && !account.triviaFailureIds.includes(failureId)) {
      throw new Error('Could not record the failed trivia question');
    }
  }

  return {
    dailyHeartsRemaining: lockedUntil ? 0 : account.triviaHeartsRemaining,
    triviaLockedUntil: lockedUntil?.toISOString() ?? null,
  };
}

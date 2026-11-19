import {
  getActiveTriviaLock,
  isCurrentUtcTriviaDay,
} from './daily-lock';

export const MAX_DAILY_HEARTS = 5;
// A giver always keeps at least one heart so sharing never locks them out.
export const MIN_HEARTS_TO_GIVE = 2;
export const MAX_DAILY_HEART_REQUESTS = 3;

export interface HeartAccount {
  triviaHeartsDate: Date | null;
  triviaHeartsRemaining: number;
  triviaLockedUntil: Date | null;
}

export function getEffectiveHearts(account: HeartAccount, now = new Date()): number {
  if (!isCurrentUtcTriviaDay(account.triviaHeartsDate, now)) return MAX_DAILY_HEARTS;
  if (getActiveTriviaLock(account.triviaLockedUntil, now)) return 0;
  return account.triviaHeartsRemaining;
}

export function canGiveHeart(account: HeartAccount, now = new Date()): boolean {
  return getEffectiveHearts(account, now) >= MIN_HEARTS_TO_GIVE;
}

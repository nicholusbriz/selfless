export function getNextUtcTriviaReset(now = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
}

export function getUtcTriviaDayStart(now = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function isCurrentUtcTriviaDay(dayStart: Date | null, now = new Date()): boolean {
  return dayStart?.getTime() === getUtcTriviaDayStart(now).getTime();
}

export function getActiveTriviaLock(
  lockedUntil: Date | null,
  now = new Date(),
): Date | null {
  return lockedUntil && lockedUntil.getTime() > now.getTime()
    ? lockedUntil
    : null;
}

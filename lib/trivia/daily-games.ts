export const MAX_DAILY_TRIVIA_GAMES = 10;

const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getEatTriviaDay(now = new Date()) {
  const shifted = new Date(now.getTime() + EAT_OFFSET_MS);
  const start = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) -
      EAT_OFFSET_MS,
  );
  return { start, reset: new Date(start.getTime() + DAY_MS) };
}

export function hasReachedDailyGameLimit(completed: number): boolean {
  return completed >= MAX_DAILY_TRIVIA_GAMES;
}

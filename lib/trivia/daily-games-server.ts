import { prisma } from '@/lib/prisma/client';
import { getEatTriviaDay, MAX_DAILY_TRIVIA_GAMES } from './daily-games';

export async function getDailyTriviaGames(userId: string, now = new Date()) {
  const { start, reset } = getEatTriviaDay(now);
  const completed = await prisma.triviaGameSession.count({
    where: { userId, playedAt: { gte: start, lt: reset } },
  });
  return {
    completed,
    limit: MAX_DAILY_TRIVIA_GAMES,
    resetAt: reset.toISOString(),
  };
}

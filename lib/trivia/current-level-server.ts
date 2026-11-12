import { prisma } from '@/lib/prisma/client';
import { getEatTriviaDay } from './daily-games';
import {
  MAX_TRIVIA_LEVEL,
  MIN_ACCURACY_TO_LEVEL_UP,
  shouldResetCompletedTriviaLevel,
} from './levels';

export async function getCurrentTriviaLevel(userId: string, now = new Date()) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentLevel: true },
  });

  if (!user) {
    throw new Error('Trivia user not found');
  }

  if (user.currentLevel !== MAX_TRIVIA_LEVEL) {
    return user.currentLevel;
  }

  const { start } = getEatTriviaDay(now);
  const completedLevelTen = await prisma.triviaGameSession.findFirst({
    where: {
      userId,
      level: MAX_TRIVIA_LEVEL,
      accuracy: { gte: MIN_ACCURACY_TO_LEVEL_UP },
      playedAt: { lt: start },
    },
    orderBy: { playedAt: 'desc' },
    select: { playedAt: true },
  });

  if (
    !shouldResetCompletedTriviaLevel(
      user.currentLevel,
      completedLevelTen?.playedAt ?? null,
      start,
    )
  ) {
    return user.currentLevel;
  }

  await prisma.user.updateMany({
    where: { id: userId, currentLevel: MAX_TRIVIA_LEVEL },
    data: { currentLevel: 1 },
  });

  return 1;
}

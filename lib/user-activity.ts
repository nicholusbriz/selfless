import { prisma } from '@/lib/prisma/client';

const MIN_INTERVAL_MS = 20_000;
const MAX_RETRIES = 3;

const lastSuccessfulWriteByUser = new Map<string, number>();
const inFlightByUser = new Map<string, Promise<void>>();

function pruneSuccessfulWrites(now: number) {
  if (lastSuccessfulWriteByUser.size < 5000) return;
  for (const [userId, timestamp] of lastSuccessfulWriteByUser) {
    if (now - timestamp > MIN_INTERVAL_MS * 10) {
      lastSuccessfulWriteByUser.delete(userId);
    }
  }
}

async function persistLastActiveAt(userId: string): Promise<void> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      await prisma.user.updateMany({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      });
      const now = Date.now();
      lastSuccessfulWriteByUser.set(userId, now);
      pruneSuccessfulWrites(now);
      return;
    } catch (error) {
      const isWriteConflict =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2034';

      if (!isWriteConflict || attempt >= MAX_RETRIES) {
        throw error;
      }

      const delayMs = 25 * 2 ** attempt + Math.floor(Math.random() * 25);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export function updateUserLastActiveAt(userId: string): void {
  if (inFlightByUser.has(userId)) return;

  const now = Date.now();
  if (now - (lastSuccessfulWriteByUser.get(userId) ?? 0) < MIN_INTERVAL_MS) {
    return;
  }

  const update = persistLastActiveAt(userId)
    .catch((error: unknown) => {
      console.warn('[user-activity] lastActiveAt update failed:', error);
    })
    .finally(() => {
      inFlightByUser.delete(userId);
    });

  inFlightByUser.set(userId, update);
}

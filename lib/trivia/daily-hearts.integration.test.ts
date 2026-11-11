import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';
import { recordFailedTriviaQuestion } from './daily-hearts-server';

test('daily hearts initialize for legacy users, charge once, lock and reset', async () => {
  const prisma = new PrismaClient();
  const rollback = new Error('rollback test fixture');
  const now = new Date('2026-11-11T12:00:00.000Z');

  try {
    await assert.rejects(
      prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            firstName: 'Trivia',
            lastName: 'Test',
            email: `trivia-hearts-${randomUUID()}@invalid.example`,
          },
          select: { id: true },
        });
        assert.equal(await tx.user.count({
          where: { id: user.id, triviaHeartsDate: { isSet: false } },
        }), 1);
        assert.equal(await tx.user.count({
          where: { id: user.id, triviaLockedUntil: { isSet: false } },
        }), 1);

        const firstId = randomUUID();
        assert.deepEqual(await recordFailedTriviaQuestion(tx, user.id, firstId, now), {
          dailyHeartsRemaining: 2,
          triviaLockedUntil: null,
        });
        assert.equal((await recordFailedTriviaQuestion(tx, user.id, firstId, now)).dailyHeartsRemaining, 2);
        assert.equal((await recordFailedTriviaQuestion(tx, user.id, randomUUID(), now)).dailyHeartsRemaining, 1);
        assert.deepEqual(await recordFailedTriviaQuestion(tx, user.id, randomUUID(), now), {
          dailyHeartsRemaining: 0,
          triviaLockedUntil: '2026-11-12T00:00:00.000Z',
        });
        assert.equal((await recordFailedTriviaQuestion(tx, user.id, randomUUID(), now)).dailyHeartsRemaining, 0);

        assert.deepEqual(await recordFailedTriviaQuestion(
          tx, user.id, randomUUID(), new Date('2026-11-12T00:00:00.000Z'),
        ), {
          dailyHeartsRemaining: 2,
          triviaLockedUntil: null,
        });

        const locked = await tx.user.create({
          data: {
            firstName: 'Trivia',
            lastName: 'Locked',
            email: `trivia-locked-${randomUUID()}@invalid.example`,
            triviaLockedUntil: new Date('2026-11-12T00:00:00.000Z'),
          },
          select: { id: true },
        });
        assert.deepEqual(await recordFailedTriviaQuestion(tx, locked.id, randomUUID(), now), {
          dailyHeartsRemaining: 0,
          triviaLockedUntil: '2026-11-12T00:00:00.000Z',
        });
        const preserved = await tx.user.findUniqueOrThrow({
          where: { id: locked.id },
          select: { triviaLockedUntil: true },
        });
        assert.equal(preserved.triviaLockedUntil?.toISOString(), '2026-11-12T00:00:00.000Z');
        throw rollback;
      }, { timeout: 120000, maxWait: 10000 }),
      (error: unknown) => error === rollback,
    );
  } finally {
    await prisma.$disconnect();
  }
});

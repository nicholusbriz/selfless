import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getEatTriviaDay,
  hasReachedDailyGameLimit,
  MAX_DAILY_TRIVIA_GAMES,
} from './daily-games';

test('daily games reset at midnight East Africa Time', () => {
  const before = getEatTriviaDay(new Date('2026-11-11T20:59:59.999Z'));
  assert.equal(before.start.toISOString(), '2026-11-10T21:00:00.000Z');
  assert.equal(before.reset.toISOString(), '2026-11-11T21:00:00.000Z');

  const after = getEatTriviaDay(new Date('2026-11-11T21:00:00.000Z'));
  assert.equal(after.start.toISOString(), '2026-11-11T21:00:00.000Z');
  assert.equal(after.reset.toISOString(), '2026-11-12T21:00:00.000Z');
});

test('the tenth completed game reaches the daily limit', () => {
  assert.equal(MAX_DAILY_TRIVIA_GAMES, 10);
  assert.equal(hasReachedDailyGameLimit(9), false);
  assert.equal(hasReachedDailyGameLimit(10), true);
  assert.equal(hasReachedDailyGameLimit(11), true);
});

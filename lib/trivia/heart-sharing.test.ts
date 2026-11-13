import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canGiveHeart,
  canRequestHeart,
  getEffectiveHearts,
  MAX_DAILY_HEART_REQUESTS,
  MIN_HEARTS_TO_GIVE,
} from './heart-sharing';

const now = new Date('2026-11-12T14:00:00.000Z');
const today = new Date('2026-11-12T00:00:00.000Z');
const yesterday = new Date('2026-11-11T00:00:00.000Z');

const account = (
  hearts: number,
  date: Date | null = today,
  lockedUntil: Date | null = null,
) => ({
  triviaHeartsDate: date,
  triviaHeartsRemaining: hearts,
  triviaLockedUntil: lockedUntil,
});

test('stale heart records count as a full set of hearts', () => {
  assert.equal(getEffectiveHearts(account(0, yesterday), now), 3);
  assert.equal(getEffectiveHearts(account(0, new Date('2026-11-13T00:00:00.000Z')), now), 3);
  assert.equal(getEffectiveHearts(account(1, null), now), 3);
  assert.equal(getEffectiveHearts(account(1), now), 1);
});

test('an active lock means no hearts', () => {
  const lock = new Date('2026-11-13T00:00:00.000Z');
  assert.equal(getEffectiveHearts(account(2, today, lock), now), 0);
});

test('only players with a spare heart can give one', () => {
  assert.equal(MIN_HEARTS_TO_GIVE, 2);
  assert.equal(canGiveHeart(account(3), now), true);
  assert.equal(canGiveHeart(account(2), now), true);
  assert.equal(canGiveHeart(account(1), now), false);
  assert.equal(canGiveHeart(account(0), now), false);
});

test('only players who are out of hearts can request one', () => {
  const lock = new Date('2026-11-13T00:00:00.000Z');
  assert.equal(canRequestHeart(account(0, today, lock), now), true);
  assert.equal(canRequestHeart(account(0), now), true);
  assert.equal(canRequestHeart(account(1), now), false);
  assert.equal(canRequestHeart(account(0, yesterday), now), false);
});

test('players can send three heart requests per day', () => {
  assert.equal(MAX_DAILY_HEART_REQUESTS, 3);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canGiveHeart,
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
  assert.equal(getEffectiveHearts(account(0, yesterday), now), 5);
  assert.equal(getEffectiveHearts(account(0, new Date('2026-11-13T00:00:00.000Z')), now), 5);
  assert.equal(getEffectiveHearts(account(1, null), now), 5);
  assert.equal(getEffectiveHearts(account(1), now), 1);
});

test('an active lock means no hearts', () => {
  const lock = new Date('2026-11-13T00:00:00.000Z');
  assert.equal(getEffectiveHearts(account(2, today, lock), now), 0);
});

test('a stale lock does not carry into a new heart day', () => {
  const lock = new Date('2026-11-13T00:00:00.000Z');
  assert.equal(getEffectiveHearts(account(0, yesterday, lock), now), 5);
});

test('only players with a spare heart can give one', () => {
  assert.equal(MIN_HEARTS_TO_GIVE, 2);
  assert.equal(canGiveHeart(account(5), now), true);
  assert.equal(canGiveHeart(account(2), now), true);
  assert.equal(canGiveHeart(account(6), now), true);
  assert.equal(canGiveHeart(account(1), now), false);
  assert.equal(canGiveHeart(account(0), now), false);
});

test('gifted hearts may raise the balance above the daily five-heart allowance', () => {
  assert.equal(getEffectiveHearts(account(6), now), 6);
});

test('players can send three heart requests per day', () => {
  assert.equal(MAX_DAILY_HEART_REQUESTS, 3);
});

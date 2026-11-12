import assert from 'node:assert/strict';
import test from 'node:test';
import {
  randomizeTriviaOptions,
  selectTriviaQuestions,
} from './questions';
import {
  getDifficultyForLevel,
  MAX_TRIVIA_LEVEL,
  shouldResetCompletedTriviaLevel,
} from './levels';

test('randomized options keep the correct answer and original option indexes aligned', () => {
  const randomized = randomizeTriviaOptions(
    ['wrong one', 'correct', 'wrong two', 'wrong three'],
    1,
    () => 0,
  );

  assert.deepEqual(randomized.options, [
    'correct',
    'wrong two',
    'wrong three',
    'wrong one',
  ]);
  assert.equal(randomized.options[randomized.correctAnswer], 'correct');
  assert.equal(randomized.optionIndexes[randomized.correctAnswer], 1);
});

test('question selection prefers unused questions and falls back when needed', () => {
  const questions = [{ id: 'used' }, { id: 'fresh-1' }, { id: 'fresh-2' }];
  const recentlyUsed = new Set(['used']);

  assert.deepEqual(
    selectTriviaQuestions(questions, recentlyUsed, 2, () => 0),
    [{ id: 'fresh-2' }, { id: 'fresh-1' }],
  );
  assert.equal(
    selectTriviaQuestions(questions, recentlyUsed, 3, () => 0)[2].id,
    'used',
  );
});

test('difficulty increases as players advance through the levels', () => {
  assert.equal(getDifficultyForLevel(1), 'beginner');
  assert.equal(getDifficultyForLevel(2), 'beginner');
  assert.equal(getDifficultyForLevel(3), 'intermediate');
  assert.equal(getDifficultyForLevel(5), 'intermediate');
  assert.equal(getDifficultyForLevel(6), 'advanced');
  assert.equal(getDifficultyForLevel(MAX_TRIVIA_LEVEL), 'advanced');
});

test('a completed level ten run resets only on a later EAT day', () => {
  const dayStart = new Date('2026-11-12T21:00:00.000Z');

  assert.equal(
    shouldResetCompletedTriviaLevel(
      MAX_TRIVIA_LEVEL,
      new Date('2026-11-12T22:00:00.000Z'),
      dayStart,
    ),
    false,
  );
  assert.equal(
    shouldResetCompletedTriviaLevel(
      MAX_TRIVIA_LEVEL,
      new Date('2026-11-12T21:00:00.000Z'),
      dayStart,
    ),
    false,
  );
  assert.equal(
    shouldResetCompletedTriviaLevel(
      MAX_TRIVIA_LEVEL,
      new Date('2026-11-12T20:59:59.999Z'),
      new Date('2026-11-13T21:00:00.000Z'),
    ),
    true,
  );
});

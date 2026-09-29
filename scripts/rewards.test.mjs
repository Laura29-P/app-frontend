import test from 'node:test';
import assert from 'node:assert/strict';
import { rewardCorrectAnswer } from '../src/data/rewards.js';

test('each correct answer earns currency, including practice, without duplicating progress', () => {
  const original = { stars: 1, completedExercises: {} };
  const first = rewardCorrectAnswer(original, 'm1');
  const repeated = rewardCorrectAnswer(first, 'm1');
  assert.equal(first.stars, 4);
  assert.equal(repeated.stars, 7);
  assert.deepEqual(repeated.completedExercises, { m1: true });
  assert.equal(original.stars, 1);
});

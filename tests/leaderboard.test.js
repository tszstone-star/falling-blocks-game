import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePlayerName, submitScore } from '../src/game/leaderboard.js';

test('names are trimmed and limited by visible characters', () => {
  assert.equal(normalizePlayerName('  Baozi  '), 'Baozi');
  assert.equal(normalizePlayerName('馒头游戏玩家用户名超长'), '馒头游戏玩家用户名超');
  assert.equal(normalizePlayerName('   '), '');
});

test('the page leaderboard sorts high scores and keeps only three entries', () => {
  let entries = [];
  for (const [name, score] of [['Lin', 100], ['Bo', 400], ['Ming', 250], ['Yan', 200]]) {
    entries = submitScore(entries, name, score).entries;
  }
  assert.deepEqual(entries, [{ name: 'Bo', score: 400 }, { name: 'Ming', score: 250 }, { name: 'Yan', score: 200 }]);
});

test('the same name keeps its best score and can move up the board', () => {
  const entries = [{ name: 'Bo', score: 300 }, { name: 'Lin', score: 200 }, { name: 'Ming', score: 100 }];
  assert.equal(submitScore(entries, 'Bo', 250).recorded, false);
  const updated = submitScore(entries, 'Bo', 500);
  assert.equal(updated.rank, 1);
  assert.deepEqual(updated.entries, [{ name: 'Bo', score: 500 }, { name: 'Lin', score: 200 }, { name: 'Ming', score: 100 }]);
});

test('existing entries keep their place when a new score ties the cutoff', () => {
  const entries = [{ name: 'Bo', score: 300 }, { name: 'Lin', score: 200 }, { name: 'Ming', score: 100 }];
  const tied = submitScore(entries, 'Yan', 100);
  assert.equal(tied.recorded, false);
  assert.equal(tied.rank, 0);
  assert.equal(tied.entries, entries);
});

test('blank names and invalid scores do not enter the leaderboard', () => {
  const entries = [];
  assert.equal(submitScore(entries, '', 100).recorded, false);
  assert.equal(submitScore(entries, 'Bo', -1).recorded, false);
  assert.equal(submitScore(entries, 'Bo', 1.5).recorded, false);
  assert.deepEqual(entries, []);
});

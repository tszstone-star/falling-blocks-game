import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, act, advance } from '../src/game/game.js';
import { spawnPiece, rotatePiece } from '../src/game/pieces.js';
import { formatPlayTime } from '../src/ui/renderer.js';

test('play time counts active simulation and excludes pause and post-lock remainder', () => {
  let state = advance(createGame(), 350);
  assert.equal(state.playTimeMs, 350);
  const paused = act(state, 'pause');
  assert.equal(advance(paused, 10000), paused);
  state = advance(act(paused, 'pause'), 250);
  assert.equal(state.playTimeMs, 600);

  const grounded = { ...createGame(), current: { ...spawnPiece('O'), y: 18 } };
  const locked = advance(grounded, 650);
  assert.equal(locked.playTimeMs, 500);
  assert.equal(advance({ ...locked, gameOver: true }, 10000).playTimeMs, 500);

  const doomed = { ...createGame(), current: { ...spawnPiece('O'), y: 18 } };
  const blockedSpawn = spawnPiece(doomed.next);
  const [x, y] = blockedSpawn.cells[0];
  doomed.board[blockedSpawn.y + y][blockedSpawn.x + x] = 'T';
  const over = advance(doomed, 650);
  assert.equal(over.gameOver, true);
  assert.equal(over.playTimeMs, 500);
  assert.equal(advance(over, 10000), over);
});

test('Tetris count increments only for four-line clears and is included in lock events', () => {
  const state = createGame();
  state.current = { ...rotatePiece(spawnPiece('I')), x: 2, y: 16 };
  for (let y = 16; y < 20; y++) {
    state.board[y].fill('O');
    state.board[y][4] = null;
  }
  const result = act(state, 'drop');
  assert.equal(result.lines, 4);
  assert.equal(result.level, 1);
  assert.equal(result.tetrisCount, 1);
  assert.deepEqual(result.events, ['lock', 'tetris']);
  assert.equal(result.eventId, 2);
  assert.equal(state.tetrisCount, 0);
});

test('a threshold-crossing line clear adds a level-up event using the new line total', () => {
  const state = createGame();
  state.current = { ...rotatePiece(spawnPiece('I')), x: 2, y: 16 };
  state.lines = 9;
  state.board[19].fill('O');
  state.board[19][4] = null;
  const result = act(state, 'drop');
  assert.equal(result.level, 2);
  assert.equal(result.score, 100);
  assert.deepEqual(result.events, ['lock', 'line-clear', 'level-up']);
});

test('a restart resets per-round statistics; formatting switches to hours after 60 minutes', () => {
  assert.equal(formatPlayTime(3_661_000), '01:01:01');
  assert.equal(formatPlayTime(3_599_999), '59:59');
  assert.equal(formatPlayTime(-1000), '00:00');
  const active = { ...createGame(), playTimeMs: 3_661_000 };
  const restarted = act({ ...active, tetrisCount: 2, lines: 14, level: 2 }, 'restart');
  assert.equal(restarted.playTimeMs, 0);
  assert.equal(restarted.tetrisCount, 0);
  assert.equal(restarted.lines, 0);
  assert.equal(restarted.level, 1);
});

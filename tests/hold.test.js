import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, act } from '../src/game/game.js';
import { spawnPiece } from '../src/game/pieces.js';

test('empty hold stores current, promotes Next, and draws one new preview', () => {
  const state = createGame(0, () => 0);
  const current = state.current.type;
  const next = state.next;
  const bagLength = state.bag.length;
  const held = act(state, 'hold', () => 0);
  assert.equal(held.holdPiece, current);
  assert.deepEqual(held.current, spawnPiece(next));
  assert.notEqual(held.next, next);
  assert.equal(held.bag.length, bagLength - 1);
  assert.equal(held.holdUsedThisTurn, true);
  assert.equal(act(held, 'hold'), held, 'a piece can only be held once per turn');
});

test('swap hold resets both pieces and does not consume Next or bag', () => {
  const state = createGame(0, () => 0);
  const held = act(state, 'hold', () => 0);
  const next = held.next;
  const bag = held.bag;
  const swapped = act({ ...held, holdUsedThisTurn: false }, 'hold');
  assert.equal(swapped.current.type, held.holdPiece);
  assert.equal(swapped.holdPiece, held.current.type);
  assert.equal(swapped.current.x, spawnPiece(held.holdPiece).x);
  assert.equal(swapped.current.y, 0);
  assert.equal(swapped.next, next);
  assert.deepEqual(swapped.bag, bag);
});

test('hold becomes available after locking and restart clears held state', () => {
  const held = act(createGame(0, () => 0), 'hold', () => 0);
  const locked = act(held, 'drop', () => 0);
  assert.equal(locked.holdUsedThisTurn, false);
  const restarted = act({ ...locked, holdPiece: 'T' }, 'restart', () => 0);
  assert.equal(restarted.holdPiece, null);
  assert.equal(restarted.holdUsedThisTurn, false);
});

test('hold ends the game if the replacement cannot spawn on the board', () => {
  const state = createGame(0, () => 0);
  const nextSpawn = spawnPiece(state.next);
  const [x, y] = nextSpawn.cells[0];
  state.board[nextSpawn.y + y][nextSpawn.x + x] = 'T';
  const ended = act(state, 'hold', () => 0);
  assert.equal(ended.gameOver, true);
  assert.equal(ended.holdPiece, state.current.type);
});

test('holding a grounded piece clears its lock-delay state for the replacement', () => {
  const state = createGame();
  Object.assign(state, { current: { ...state.current, y: 18 }, groundedMs: 420, lockResets: 6, elapsed: 700 });
  const held = act(state, 'hold');
  assert.equal(held.groundedMs, 0);
  assert.equal(held.lockResets, 0);
  assert.equal(held.elapsed, 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoard } from '../src/game/board.js';
import { MAX_LOCK_RESETS, LOCK_DELAY_MS, START_GRAVITY_INTERVAL_MS } from '../src/game/config.js';
import { act, advance, createGame, isGrounded } from '../src/game/game.js';
import { spawnPiece } from '../src/game/pieces.js';

function groundedGame(type = 'O', x = 4, y = 18) {
  const state = createGame();
  state.current = { ...spawnPiece(type), x, y };
  return state;
}

test('a grounded piece waits 500 ms before gravity lock and hard drop remains immediate', () => {
  const state = groundedGame();
  const waiting = advance(state, LOCK_DELAY_MS - 1);
  assert.equal(waiting.board.flat().filter(Boolean).length, 0);
  assert.equal(waiting.groundedMs, LOCK_DELAY_MS - 1);
  const locked = advance(waiting, 1);
  assert.equal(locked.board.flat().filter(Boolean).length, 4);
  assert.equal(locked.groundedMs, 0);
  assert.equal(act(state, 'drop').board.flat().filter(Boolean).length, 4);
});

test('valid grounded movement and rotation reset the timer at most eight times', () => {
  let rotated = advance(groundedGame('T', 3, 18), 420);
  assert.equal(isGrounded(rotated.board, rotated.current), true);
  rotated = act(rotated, 'rotate');
  assert.equal(rotated.lockResets, 1);
  assert.equal(rotated.groundedMs, 0);

  let state = advance(groundedGame(), 420);
  for (let i = state.lockResets; i < MAX_LOCK_RESETS; i++) {
    state = act(state, i % 2 ? 'left' : 'right');
    assert.equal(state.groundedMs, 0);
  }
  state = { ...state, groundedMs: 420 };
  const afterLimit = act(state, 'left');
  assert.equal(afterLimit.lockResets, MAX_LOCK_RESETS);
  assert.equal(afterLimit.groundedMs, 420);
  assert.equal(advance(afterLimit, LOCK_DELAY_MS - 421).board.flat().filter(Boolean).length, 0);
  assert.equal(advance(afterLimit, LOCK_DELAY_MS - 420).board.flat().filter(Boolean).length, 4);
});

test('leaving a ledge cancels the timer and landing starts a fresh delay without clearing reset count', () => {
  const board = createBoard();
  board[19][5] = 'I';
  let state = { ...groundedGame('O', 4, 17), board, groundedMs: 300, lockResets: 3 };
  assert.equal(isGrounded(state.board, state.current), true);
  state = act(state, 'left');
  assert.equal(isGrounded(state.board, state.current), false);
  assert.equal(state.groundedMs, 0);
  assert.equal(state.lockResets, 3);
  state = advance(state, START_GRAVITY_INTERVAL_MS);
  assert.equal(state.current.y, 18);
  assert.equal(isGrounded(state.board, state.current), true);
  assert.equal(state.groundedMs, 0);
  assert.equal(state.lockResets, 3);
});

test('pause freezes lock delay and one advance cannot double-lock newly spawned pieces', () => {
  const state = advance(groundedGame(), 250);
  const paused = act(state, 'pause');
  assert.equal(advance(paused, 10000), paused);
  const resumed = act(paused, 'pause');
  const nearLock = advance(resumed, 249);
  assert.equal(nearLock.board.flat().filter(Boolean).length, 0);
  const locked = advance(nearLock, 1);
  assert.equal(locked.board.flat().filter(Boolean).length, 4);
  assert.equal(locked.current.y, 0);
  assert.equal(locked.elapsed, 0);
});

test('restart clears all lock delay state', () => {
  const state = { ...groundedGame(), groundedMs: 350, lockResets: MAX_LOCK_RESETS };
  const fresh = act(state, 'restart');
  assert.equal(fresh.groundedMs, 0);
  assert.equal(fresh.lockResets, 0);
});

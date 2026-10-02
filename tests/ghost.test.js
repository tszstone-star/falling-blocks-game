import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoard, placePiece } from '../src/game/board.js';
import { projectGhost, act, createGame } from '../src/game/game.js';
import { rotatePiece, spawnPiece } from '../src/game/pieces.js';

test('ghost projection finds the lowest valid position without changing board or piece', () => {
  const board = createBoard();
  board[19][4] = 'T';
  const piece = spawnPiece('O');
  const before = structuredClone(board);
  const ghost = projectGhost(board, piece);
  assert.equal(ghost.y, 17);
  assert.deepEqual(piece, spawnPiece('O'));
  assert.deepEqual(board, before);
});

test('ghost follows horizontal position and rotation', () => {
  const board = createBoard();
  const first = spawnPiece('T');
  const moved = { ...first, x: 1 };
  const rotated = rotatePiece(moved);
  assert.equal(projectGhost(board, first).x, first.x);
  assert.equal(projectGhost(board, moved).x, 1);
  assert.equal(projectGhost(board, rotated).rotation, rotated.rotation);
  assert.deepEqual(projectGhost(board, rotated).cells, rotated.cells);
});

test('hard drop lands on the exact ghost position', () => {
  const state = createGame();
  state.current = { ...rotatePiece(spawnPiece('I')), x: 3, y: 2 };
  const ghost = projectGhost(state.board, state.current);
  const landed = act(state, 'drop');
  const expected = placePiece(state.board, ghost);
  assert.deepEqual(landed.board, expected);
  assert.equal(state.board.flat().filter(Boolean).length, 0);
});

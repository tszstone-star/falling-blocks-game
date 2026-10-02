import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoard, canPlace, placePiece, clearLines } from '../src/game/board.js';
import { spawnPiece } from '../src/game/pieces.js';

test('empty board has independent rows; placement copies input', () => {
  const board = createBoard();
  assert.equal(board.length, 20);
  assert.ok(board.every(row => row.length === 10 && row.every(cell => cell === null)));
  assert.notEqual(board[0], board[1]);
  const piece = spawnPiece('T');
  const placed = placePiece(board, piece);
  assert.equal(placed.flat().filter(Boolean).length, 4);
  assert.equal(board.flat().filter(Boolean).length, 0);
  assert.equal(canPlace(placed, piece), false);
  assert.throws(() => placePiece(placed, piece), /colliding/);
});

test('clears multiple full rows and preserves order and dimensions without mutation', () => {
  const board = createBoard();
  board[19].fill('I'); board[17].fill('T'); board[18][2] = 'O';
  const result = clearLines(board);
  assert.equal(result.count, 2);
  assert.equal(result.board.length, 20);
  assert.ok(result.board.every(row => row.length === 10));
  assert.equal(result.board[19][2], 'O');
  assert.ok(result.board[0].every(cell => cell === null));
  assert.equal(board[19][0], 'I');
  assert.equal(clearLines(createBoard()).count, 0);
});

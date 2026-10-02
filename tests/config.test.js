import test from 'node:test';
import assert from 'node:assert/strict';
import { BOARD_COLUMNS, BOARD_VISIBLE_ROWS, CELL_SIZE_PX } from '../src/game/config.js';

test('classic board has 10 columns and 20 visible rows', () => {
  assert.equal(BOARD_COLUMNS, 10);
  assert.equal(BOARD_VISIBLE_ROWS, 20);
});

test('board dimensions and planned cell size are positive integers', () => {
  for (const value of [BOARD_COLUMNS, BOARD_VISIBLE_ROWS, CELL_SIZE_PX]) {
    assert.ok(Number.isInteger(value));
    assert.ok(value > 0);
  }
  assert.equal(CELL_SIZE_PX, 30);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoard, canPlace } from '../src/game/board.js';
import { spawnPiece, rotatePiece, srsKicks } from '../src/game/pieces.js';
import { createGame, act } from '../src/game/game.js';

test('collision rejects walls, floor, ceiling and occupied cells', () => {
  const board = createBoard(); const piece = spawnPiece('O');
  for (const offset of [{x:-1}, {x:9}, {y:19}, {y:-1}]) assert.equal(canPlace(board, {...piece,...offset}), false);
  assert.equal(canPlace(board, {...piece,x:0,y:18}), true);
  board[0][4] = 'T';
  assert.equal(canPlace(board, piece), false);
});

test('SRS rotates clockwise and kicks an I piece at both side walls and a T off the floor', () => {
  const initial = createGame();
  const vertical = rotatePiece(spawnPiece('I'));
  const left = {...initial,current:{...vertical,x:-2,y:3}};
  const rotated = act(left, 'rotate');
  assert.equal(rotated.current.x, 0);
  assert.equal(rotated.current.rotation, 2);
  assert.equal(canPlace(rotated.board, rotated.current), true);
  assert.deepEqual(rotated.events, ['rotate']);
  assert.equal(rotated.eventId, left.eventId + 1);
  const right = {...initial,current:{...vertical,x:7,y:3}};
  const rightRotated = act(right,'rotate');
  assert.equal(rightRotated.current.x, 6);
  assert.equal(rightRotated.current.rotation, 2);
  const floor = {...initial,current:{...spawnPiece('T'),y:18}};
  const floorRotated = act(floor,'rotate');
  assert.equal(floorRotated.current.x, 2);
  assert.equal(floorRotated.current.y,17);
  assert.equal(floorRotated.current.rotation, 1);
  const board = createBoard().map(row => row.map(() => 'Z'));
  const piece = spawnPiece('T');
  for (const [x,y] of piece.cells) board[piece.y+y][piece.x+x] = null;
  const blocked = {...initial,board,current:piece};
  assert.equal(act(blocked,'rotate'),blocked);
});

test('SRS uses piece-family transition tables and O rotation remains unchanged', () => {
  assert.deepEqual(srsKicks('T', 0, 1), [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]]);
  assert.deepEqual(srsKicks('I', 0, 1), [[0,0],[-2,0],[1,0],[-2,-1],[1,2]]);
  assert.deepEqual(srsKicks('I', 1, 2), [[0,0],[-1,0],[2,0],[-1,2],[2,-1]]);
  assert.deepEqual(srsKicks('O', 0, 1), [[0,0]]);
  const square = spawnPiece('O');
  assert.equal(rotatePiece(square), square);
  const start = spawnPiece('J');
  const completeTurn = rotatePiece(rotatePiece(rotatePiece(rotatePiece(start))));
  assert.equal(completeTurn.rotation, 0);
  assert.deepEqual(completeTurn.cells, start.cells);
});

test('blocked next spawn ends the game and ignores play actions', () => {
  const state = createGame(); state.next = 'O'; state.board[0][4] = 'T';
  state.current = {...spawnPiece('O'),x:0,y:18};
  const ended = act(state,'drop');
  assert.equal(ended.gameOver,true);
  assert.equal(act(ended,'left'),ended);
});

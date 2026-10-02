import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoard, canPlace } from '../src/game/board.js';
import { spawnPiece, rotatePiece } from '../src/game/pieces.js';
import { createGame, act } from '../src/game/game.js';

test('collision rejects walls, floor, ceiling and occupied cells', () => {
  const board = createBoard(); const piece = spawnPiece('O');
  for (const offset of [{x:-1}, {x:9}, {y:19}, {y:-1}]) assert.equal(canPlace(board, {...piece,...offset}), false);
  assert.equal(canPlace(board, {...piece,x:0,y:18}), true);
  board[0][4] = 'T';
  assert.equal(canPlace(board, piece), false);
});

test('rotation uses ordered wall kicks and floor kick; blocked rotation is unchanged', () => {
  const initial = createGame();
  const vertical = rotatePiece(spawnPiece('I'));
  const left = {...initial,current:{...vertical,x:-2,y:3}};
  const rotated = act(left, 'rotate');
  assert.equal(rotated.current.x, 0);
  assert.equal(canPlace(rotated.board, rotated.current), true);
  const right = {...initial,current:{...vertical,x:7,y:3}};
  assert.equal(act(right,'rotate').current.x, 6);
  const floor = {...initial,current:{...spawnPiece('T'),y:18}};
  assert.equal(act(floor,'rotate').current.y,17);
  const board = createBoard().map(row => row.map(() => 'Z'));
  const piece = spawnPiece('T');
  for (const [x,y] of piece.cells) board[piece.y+y][piece.x+x] = null;
  const blocked = {...initial,board,current:piece};
  assert.equal(act(blocked,'rotate'),blocked);
});

test('blocked next spawn ends the game and ignores play actions', () => {
  const state = createGame(); state.next = 'O'; state.board[0][4] = 'T';
  state.current = {...spawnPiece('O'),x:0,y:18};
  const ended = act(state,'down');
  assert.equal(ended.gameOver,true);
  assert.equal(act(ended,'left'),ended);
});

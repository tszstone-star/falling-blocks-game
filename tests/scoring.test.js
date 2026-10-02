import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, act, advance, lineScore, levelForLines, gravityInterval } from '../src/game/game.js';
import { spawnPiece, rotatePiece, createBag, PIECE_TYPES } from '../src/game/pieces.js';
import { LOCK_DELAY_MS } from '../src/game/config.js';

for (const [count,points] of [[1,100],[2,300],[3,500],[4,800]]) {
  test(`locking clears ${count} rows and scores at pre-clear level`, () => {
    const state = createGame();
    state.current = {...rotatePiece(spawnPiece('I')),x:2,y:16};
    for (let y=20-count;y<20;y++) { state.board[y].fill('O'); state.board[y][4]=null; }
    state.lines=9; state.score=50;
    const result=act(state,'drop');
    assert.equal(result.score,50+points);
    assert.equal(result.lines,9+count);
    assert.equal(result.level,2);
    assert.equal(result.highScore,50+points);
    assert.equal(state.score,50);
  });
}
test('fixed score table, line-based level thresholds and six-percent speed scaling', () => {
  assert.deepEqual([0,1,2,3,4].map(lineScore),[0,100,300,500,800]);
  assert.deepEqual([0,9,10,19,20,29,30,1000].map(levelForLines),[1,1,2,2,3,3,4,101]);
  assert.deepEqual([1,2,3,5,10,15,20,35,50].map(gravityInterval),[800,755,712,634,474,354,264,110,100]);
});
test('line clears use fixed points and only lines change the level', () => {
  const state=createGame();
  state.current={...rotatePiece(spawnPiece('I')),x:2,y:16};
  state.board[19].fill('O'); state.board[19][4]=null;
  state.score=19900; state.lines=9;
  const result=act(state,'drop');
  assert.equal(result.score,20000);
  assert.equal(result.level,2);
  assert.equal(gravityInterval(result.level),755);
  assert.equal(state.level,1);
});
test('gravity accumulates time and pause freezes both gravity and lock timing', () => {
  let state=advance(createGame(),799);
  assert.equal(state.current.y,0);
  const paused=act(state,'pause');
  assert.equal(advance(paused,10000),paused);
  assert.equal(act(paused,'drop'),paused);
  state=advance(act(paused,'pause'),1);
  assert.equal(state.current.y,1);
  assert.equal(state.elapsed,0);
  assert.equal(advance(state,1600).current.y,3);
});
test('soft drop on the floor starts lock timing; hard drop still locks immediately', () => {
  const state=createGame(); state.current={...spawnPiece('O'),y:18};
  const soft=act(state,'down');
  assert.equal(soft.board.flat().filter(Boolean).length,0);
  assert.equal(advance(soft,LOCK_DELAY_MS-1).board.flat().filter(Boolean).length,0);
  assert.equal(advance(soft,LOCK_DELAY_MS).board.flat().filter(Boolean).length,4);
  const hard=act(state,'drop');
  assert.equal(hard.board.flat().filter(Boolean).length,4);
  assert.equal(hard.elapsed,0);
  assert.equal(act(createGame(),'drop').board.flat().filter(Boolean).length,4);
});
test('restart resets all transient state and preserves high score', () => {
  const state=act(createGame(900),'drop');
  Object.assign(state,{score:100,lines:15,level:2,paused:true,gameOver:true,elapsed:500});
  const fresh=act(state,'restart');
  assert.equal(fresh.highScore,900);
  assert.equal(fresh.score,0); assert.equal(fresh.lines,0); assert.equal(fresh.level,1);
  assert.equal(fresh.paused,false); assert.equal(fresh.gameOver,false); assert.equal(fresh.elapsed,0);
  assert.ok(fresh.board.flat().every(cell=>cell===null));
});
test('7-bag contains every type once; preview becomes current and input is not mutated', () => {
  const random=()=>0.5;
  assert.deepEqual([...createBag(random)].sort(),[...PIECE_TYPES].sort());
  const state=createGame(0,random);
  const snapshot=structuredClone(state);
  const result=act(state,'drop',random);
  assert.equal(result.current.type,state.next);
  assert.deepEqual(state,snapshot);
  // Collect consecutive pieces across a refill on fresh boards to avoid top-out.
  let cursor=state; const types=[];
  for(let i=0;i<14;i++) {
    types.push(cursor.current.type);
    cursor=act({...cursor,board:createGame().board},'drop',random);
  }
  assert.deepEqual(types.slice(0,7).sort(),[...PIECE_TYPES].sort());
  assert.deepEqual(types.slice(7).sort(),[...PIECE_TYPES].sort());
});

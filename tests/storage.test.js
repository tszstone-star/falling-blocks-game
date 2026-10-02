import test from 'node:test';
import assert from 'node:assert/strict';
import { loadHighScore, saveHighScore } from '../src/ui/storage.js';
test('high score round-trip and malformed or unavailable storage fallback', () => {
  const values=new Map();
  const storage={getItem:key=>values.get(key) ?? null,setItem:(key,value)=>values.set(key,value)};
  assert.equal(loadHighScore(storage),0);
  values.set('falling-blocks-high-score','9000');
  assert.equal(loadHighScore(storage),0,'Phase 5 scores are kept separate from V2 scores');
  saveHighScore(storage,1200); assert.equal(loadHighScore(storage),1200);
  assert.equal(values.get('baozi-blocks-high-score-v2'),'1200');
  for(const value of ['bad','-1','1.5','Infinity']) { storage.setItem('baozi-blocks-high-score-v2',value); assert.equal(loadHighScore(storage),0); }
  const denied={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};
  assert.equal(loadHighScore(denied),0); assert.doesNotThrow(()=>saveHighScore(denied,100));
  assert.equal(loadHighScore(undefined),0); assert.doesNotThrow(()=>saveHighScore(undefined,100));
});

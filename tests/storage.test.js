import test from 'node:test';
import assert from 'node:assert/strict';
import { loadHighScore, saveHighScore } from '../src/ui/storage.js';
test('high score round-trip and malformed or unavailable storage fallback', () => {
  const values=new Map();
  const storage={getItem:key=>values.get(key) ?? null,setItem:(key,value)=>values.set(key,value)};
  assert.equal(loadHighScore(storage),0);
  saveHighScore(storage,1200); assert.equal(loadHighScore(storage),1200);
  for(const value of ['bad','-1','1.5','Infinity']) { storage.setItem('falling-blocks-high-score',value); assert.equal(loadHighScore(storage),0); }
  const denied={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};
  assert.equal(loadHighScore(denied),0); assert.doesNotThrow(()=>saveHighScore(denied,100));
  assert.equal(loadHighScore(undefined),0); assert.doesNotThrow(()=>saveHighScore(undefined,100));
});

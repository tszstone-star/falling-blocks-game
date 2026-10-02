import test from 'node:test';
import assert from 'node:assert/strict';
import { createSoundEffects } from '../src/ui/sound.js';

function audioTarget(state = 'running') {
  const oscillators = [];
  class Param {
    setValueAtTime() {}
    linearRampToValueAtTime() {}
    exponentialRampToValueAtTime() {}
  }
  class AudioNode {
    constructor() { this.gain = new Param(); this.frequency = new Param(); this.starts = []; }
    connect() {}
    start(when) { this.starts.push(when); }
    stop() {}
  }
  class AudioContext {
    constructor() { this.state = state; this.currentTime = 1; this.destination = {}; }
    createGain() { return new AudioNode(); }
    createOscillator() { const node = new AudioNode(); oscillators.push(node); return node; }
    async resume() { this.state = 'running'; }
  }
  return { target: { AudioContext }, oscillators };
}

test('sound effects schedule gentle synthesized notes and can be disabled', () => {
  const { target, oscillators } = audioTarget();
  const sound = createSoundEffects(target);
  assert.equal(sound.isEnabled(), true);
  assert.equal(sound.play('lock'), true);
  assert.equal(sound.play('tetris'), true);
  assert.equal(oscillators.length, 5);
  assert.ok(oscillators.every(node => node.starts.length === 1));
  assert.equal(sound.setEnabled(false), false);
  assert.equal(sound.play('line-clear'), false);
});

test('audio unlock is gesture-compatible and unsupported browsers remain playable', async () => {
  const { target } = audioTarget('suspended');
  const sound = createSoundEffects(target);
  assert.equal(await sound.unlock(), true);
  const unsupported = createSoundEffects({});
  assert.equal(await unsupported.unlock(), false);
  assert.equal(unsupported.play('lock'), false);
});

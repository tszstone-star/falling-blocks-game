import test from 'node:test';
import assert from 'node:assert/strict';
import { createMusic } from '../src/ui/music.js';

function makeAudioTarget() {
  const scheduled = new Map();
  const cancelled = [];
  const oscillators = [];
  class Param {
    constructor(value = 0) { this.value = value; }
    setValueAtTime(value) { this.value = value; }
    linearRampToValueAtTime(value) { this.value = value; }
    exponentialRampToValueAtTime(value) { this.value = value; }
    cancelScheduledValues() {}
  }
  class Node {
    constructor() { this.gain = new Param(); this.frequency = new Param(); this.stops = []; }
    connect() {}
    disconnect() {}
    start() {}
    stop(time) { this.stops.push(time); }
  }
  class AudioContext {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; this.created = []; }
    createGain() { const node = new Node(); this.created.push(node); return node; }
    createOscillator() { const node = new Node(); this.created.push(node); oscillators.push(node); return node; }
  }
  const target = {
    AudioContext,
    setInterval(callback) { scheduled.set(1, callback); return 1; },
    clearInterval(id) { cancelled.push(id); scheduled.delete(id); },
    setTimeout(callback) { callback(); return 2; },
  };
  return { target, scheduled, cancelled, oscillators };
}

test('music starts after an explicit call, schedules gentle notes and does not duplicate a loop', async () => {
  const { target, scheduled, oscillators } = makeAudioTarget();
  const music = createMusic(target);
  assert.equal(music.isEnabled(), true);
  assert.equal(music.isPlaying(), false);
  assert.equal(await music.start(), true);
  assert.equal(music.isPlaying(), true);
  assert.equal(await music.start(), false);
  assert.equal(scheduled.size, 1);
  assert.ok(oscillators.length >= 2);
});

test('stopping and disabling music clear its timer and stop scheduled notes', async () => {
  const { target, scheduled, cancelled, oscillators } = makeAudioTarget();
  const music = createMusic(target);
  await music.start();
  music.stop();
  assert.equal(music.isPlaying(), false);
  assert.equal(scheduled.size, 0);
  assert.deepEqual(cancelled, [1]);
  assert.ok(oscillators.every(oscillator => oscillator.stops.length === 2));
  assert.equal(music.setEnabled(false), false);
  assert.equal(await music.start(), false);
});

test('unsupported browsers leave gameplay usable without music', async () => {
  const music = createMusic({});
  assert.equal(await music.start(), false);
  assert.equal(music.isPlaying(), false);
});

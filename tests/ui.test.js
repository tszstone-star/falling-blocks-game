import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('entry wires Canvas, keyboard, pause/restart, game over and unavailable storage', async () => {
  const elements = new Map();
  const events = new Map();
  const frames = [];
  for (const id of ['game-board', 'playfield-description', 'board-frame', 'board-overlay', 'status-panel', 'pause-label', 'next-piece', 'score', 'level', 'lines', 'highScore', 'game-status', 'pause', 'restart']) {
    const context = { draws: [], fillRect(...args) { this.draws.push(args); }, strokeRect() {}, clearRect() {} };
    elements.set(id, { textContent: '', context, attributes: {}, handlers: {}, dataset: {}, hidden: false, disabled: false,
      getContext: () => context,
      setAttribute(key, value) { this.attributes[key] = value; },
      addEventListener(key, handler) { this.handlers[key] = handler; },
    });
  }
  const original = { window: globalThis.window, document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame };
  globalThis.window = { get localStorage() { throw new Error('Storage denied'); }, addEventListener: (key, handler) => events.set(key, handler) };
  globalThis.document = { getElementById: id => elements.get(id) };
  globalThis.requestAnimationFrame = callback => frames.push(callback);
  const element = id => elements.get(id);
  function key(value, repeat = false) {
    let prevented = false;
    events.get('keydown')({ key: value, repeat, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
  }
  try {
    await import('../src/main.js');
    assert.equal(element('game-board').width, 300);
    assert.equal(element('game-board').height, 600);
    assert.ok(element('game-board').context.draws.length >= 5);
    assert.match(element('next-piece').attributes['aria-label'], /^Next piece: [IOTSZJL]$/);
    assert.match(element('game-status').textContent, /^Playing/);
    assert.equal(element('board-overlay').hidden, true);
    assert.match(element('playfield-description').textContent, /^Current [IOTSZJL] piece, row \d+, column \d+\. Next piece [IOTSZJL]\.$/);
    for (const id of ['score', 'lines', 'highScore']) assert.equal(Number(element(id).textContent), 0);
    assert.equal(Number(element('level').textContent), 1);
    for (const value of ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp']) key(value);
    key('p');
    assert.match(element('game-status').textContent, /^Paused/);
    assert.equal(element('status-panel').dataset.state, 'paused');
    assert.equal(element('board-frame').dataset.state, 'paused');
    assert.equal(element('board-overlay').textContent, 'PAUSED');
    key('p', true);
    assert.match(element('game-status').textContent, /^Paused/);
    frames.shift()(0);
    frames.shift()(10000);
    assert.match(element('game-status').textContent, /^Paused/);
    element('pause').handlers.click();
    assert.match(element('game-status').textContent, /^Playing/);
    // Repeated center drops must eventually obstruct the spawn, regardless of bag order.
    for (let i = 0; i < 40 && !element('pause').disabled; i++) key(' ');
    assert.match(element('game-status').textContent, /^Game over/);
    assert.equal(element('status-panel').dataset.state, 'game-over');
    assert.equal(element('board-frame').dataset.state, 'game-over');
    assert.equal(element('board-overlay').textContent, 'GAME OVER');
    assert.equal(element('pause').disabled, true);
    key('R');
    assert.match(element('game-status').textContent, /^Playing/);
    assert.equal(element('pause').disabled, false);
    events.get('blur')();
    assert.match(element('game-status').textContent, /^Paused/);
    element('restart').handlers.click();
    assert.match(element('game-status').textContent, /^Playing/);
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});

test('page markup and styles keep the accessible responsive MVP shell', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
  assert.match(html, /id="game-status"[^>]*role="status"[^>]*aria-live="polite"[^>]*aria-atomic="true"/);
  assert.match(html, /id="game-board"[^>]*aria-describedby="playfield-description game-status control-help"/);
  const stats = html.match(/<dl class="stats"[\s\S]*?<\/dl>/)?.[0] ?? '';
  assert.ok(stats, 'statistics use a description list');
  assert.equal((stats.match(/<dt>/g) ?? []).length, 4);
  assert.equal((stats.match(/<dd\b/g) ?? []).length, 4);
  for (const label of ['Score', 'Level', 'Lines', 'High score']) assert.ok(stats.includes(`<dt>${label}</dt>`));
  assert.match(html, /aria-keyshortcuts="P"/);
  assert.match(html, /aria-keyshortcuts="R"/);
  assert.match(html, /<kbd>Space<\/kbd>/);
  assert.match(css, /aspect-ratio:\s*1\s*\/\s*2/);
  assert.match(css, /@media\s*\(max-width:\s*620px\)/);
  assert.match(css, /button:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});

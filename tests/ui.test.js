import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('entry wires Canvas, keyboard, touch holds, pause/restart, game over and unavailable storage', async () => {
  const elements = new Map();
  const events = new Map();
  const frames = [];
  const makeElement = tagName => ({ tagName, textContent: '', context: { draws: [], globalAlpha: 1, fillRect(...args) { this.draws.push({ args, alpha: this.globalAlpha }); }, strokeRect() {}, clearRect() {} }, attributes: {}, handlers: {}, dataset: {}, children: [], hidden: false, disabled: false, checked: false,
    getContext() { return this.context; },
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(key, handler) { this.handlers[key] = handler; },
    showModal() { this.open = true; },
    close() { this.open = false; this.handlers.close?.(); },
    setPointerCapture() {}, append(...children) { this.children.push(...children); }, replaceChildren(...children) { this.children = children; },
    focus() { this.focused = true; }, matches(selector) { return selector.startsWith('input') && this.tagName === 'INPUT'; },
  });
  for (const id of ['game-board', 'playfield-description', 'board-frame', 'board-overlay', 'level-notice', 'line-clear-notice', 'score-entry', 'round-summary', 'final-score', 'final-level', 'final-lines', 'final-play-time', 'final-tetris-count', 'score-form', 'player-name', 'save-score', 'score-message', 'leaderboard-list', 'game-over-restart', 'mobile-start', 'touch-controls', 'status-panel', 'pause-label', 'pause-mobile-label', 'pause-icon', 'music-toggle', 'music-icon', 'music-label', 'sound-toggle', 'sound-icon', 'sound-label', 'ghost-toggle', 'ghost-state', 'help-toggle', 'help-dialog', 'help-close', 'help-done', 'next-piece', 'hold-piece', 'hold-action', 'score', 'level', 'lines', 'highScore', 'game-status', 'pause', 'restart']) {
    elements.set(id, makeElement(id === 'player-name' ? 'INPUT' : id === 'score-form' ? 'FORM' : id === 'help-dialog' ? 'DIALOG' : 'DIV'));
  }
  const element = id => elements.get(id);
  const touchButtons = ['left', 'right', 'hold', 'drop', 'rotate'].map(action => ({ handlers: {}, dataset: { action }, addEventListener(key, handler) { this.handlers[key] = handler; }, setPointerCapture() {} }));
  elements.set('hold-action', touchButtons.find(button => button.dataset.action === 'hold'));
  element('touch-controls').querySelectorAll = () => touchButtons;
  const original = { window: globalThis.window, document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame };
  const documentEvents = new Map();
  let allowRestart = true;
  globalThis.window = { get localStorage() { throw new Error('Storage denied'); }, matchMedia: () => ({ matches: true }), confirm: () => allowRestart, addEventListener: (key, handler) => events.set(key, handler) };
  globalThis.document = { visibilityState: 'visible', getElementById: id => elements.get(id), createElement: tag => makeElement(tag.toUpperCase()), addEventListener: (key, handler) => documentEvents.set(key, handler) };
  globalThis.requestAnimationFrame = callback => frames.push(callback);
  function key(value, repeat = false, target) {
    let prevented = false;
    events.get('keydown')({ key: value, repeat, target, preventDefault() { prevented = true; } });
    if (target) assert.equal(prevented, false, 'name entry keeps game shortcuts from consuming typed characters');
    else assert.equal(prevented, true);
    return prevented;
  }
  try {
    await import('../src/main.js');
    assert.equal(element('game-board').width, 300);
    assert.equal(element('game-board').height, 600);
    assert.ok(element('game-board').context.draws.length >= 5);
    assert.equal(element('mobile-start').hidden, false);
    assert.equal(element('ghost-toggle').checked, false);
    assert.equal(element('ghost-state').textContent, '关');
    assert.equal(element('game-board').context.draws.some(draw => draw.alpha < 1), false, 'Ghost starts hidden');
    assert.equal(element('music-toggle').attributes['aria-pressed'], 'true');
    element('music-toggle').handlers.click();
    assert.equal(element('music-toggle').attributes['aria-pressed'], 'false');
    element('music-toggle').handlers.click();
    assert.equal(element('music-toggle').attributes['aria-pressed'], 'true');
    element('sound-toggle').handlers.click();
    assert.equal(element('sound-toggle').attributes['aria-pressed'], 'false');
    element('sound-toggle').handlers.click();
    assert.equal(element('sound-toggle').attributes['aria-pressed'], 'true');
    assert.match(element('game-status').textContent, /^Paused/);
    element('mobile-start').handlers.click();
    assert.equal(element('mobile-start').hidden, true);
    assert.match(element('game-status').textContent, /^Playing/);
    assert.match(element('next-piece').attributes['aria-label'], /^Next piece: [IOTSZJL]$/);
    assert.match(element('hold-piece').attributes['aria-label'], /^Hold piece: empty$/);
    assert.equal(element('board-overlay').hidden, true);
    element('game-board').context.draws.length = 0;
    element('ghost-toggle').checked = true;
    element('ghost-toggle').handlers.change({ currentTarget: element('ghost-toggle') });
    assert.equal(element('ghost-state').textContent, '开');
    assert.equal(element('ghost-toggle').attributes['aria-label'], '隐藏落点影子');
    assert.ok(element('game-board').context.draws.some(draw => draw.alpha < 1), 'enabled Ghost uses a translucent landing piece');
    element('game-board').context.draws.length = 0;
    element('ghost-toggle').checked = false;
    element('ghost-toggle').handlers.change({ currentTarget: element('ghost-toggle') });
    assert.equal(element('ghost-state').textContent, '关');
    assert.equal(element('game-board').context.draws.some(draw => draw.alpha < 1), false, 'disabled Ghost is not drawn');
    element('help-toggle').handlers.click();
    assert.equal(element('help-dialog').open, true);
    assert.match(element('game-status').textContent, /^Paused/);
    let helpKeyPrevented = false;
    const helpPosition = element('playfield-description').textContent;
    events.get('keydown')({ key: 'ArrowLeft', preventDefault() { helpKeyPrevented = true; } });
    assert.equal(helpKeyPrevented, false);
    assert.equal(element('playfield-description').textContent, helpPosition, 'game shortcuts are ignored while the guide is open');
    element('help-done').handlers.click();
    assert.equal(element('help-dialog').open, false);
    assert.match(element('game-status').textContent, /^Playing/);
    assert.match(element('playfield-description').textContent, /^Current [IOTSZJL] piece, row \d+, column \d+\. Next piece [IOTSZJL]\.$/);
    const columnBeforeTouch = Number(/column (\d+)/.exec(element('playfield-description').textContent)[1]);
    const pointer = (button, eventName) => button.handlers[eventName]({ pointerId: 1, button: 0, preventDefault() {} });
    pointer(touchButtons[0], 'pointerdown');
    await new Promise(resolve => setTimeout(resolve, 330));
    pointer(touchButtons[0], 'pointerup');
    const columnAfterHold = Number(/column (\d+)/.exec(element('playfield-description').textContent)[1]);
    assert.ok(columnAfterHold <= columnBeforeTouch - 2, 'holding left repeats movement');
    await new Promise(resolve => setTimeout(resolve, 120));
    assert.equal(Number(/column (\d+)/.exec(element('playfield-description').textContent)[1]), columnAfterHold, 'release stops repeat movement');
    const touchButton = action => touchButtons.find(button => button.dataset.action === action);
    pointer(touchButton('hold'), 'pointerdown');
    pointer(touchButton('hold'), 'pointerup');
    assert.equal(element('hold-action').disabled, true);
    assert.match(element('hold-piece').attributes['aria-label'], /^Hold piece: [IOTSZJL]$/);
    pointer(touchButton('drop'), 'pointerdown');
    pointer(touchButton('drop'), 'pointerup');
    pointer(touchButton('rotate'), 'pointerdown');
    pointer(touchButton('rotate'), 'pointerup');
    for (const id of ['score', 'lines', 'highScore']) assert.equal(Number(element(id).textContent), 0);
    assert.equal(Number(element('level').textContent), 1);
    for (const value of ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp']) key(value);
    key('c');
    key('p');
    assert.match(element('game-status').textContent, /^Paused/);
    assert.equal(element('pause-mobile-label').textContent, '继续');
    assert.equal(element('pause-icon').textContent, '▶');
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
    assert.equal(element('pause-icon').textContent, 'Ⅱ');
    // Repeated center drops must eventually obstruct the spawn, regardless of bag order.
    for (let i = 0; i < 40 && !element('pause').disabled; i++) key(' ');
    assert.match(element('game-status').textContent, /^Game over/);
    assert.equal(element('status-panel').dataset.state, 'game-over');
    assert.equal(element('board-frame').dataset.state, 'game-over');
    assert.equal(element('board-overlay').textContent, 'GAME OVER');
    assert.equal(element('score-entry').hidden, false);
    assert.match(element('final-play-time').textContent, /^\d{2}:\d{2}$/);
    assert.equal(element('final-score').textContent, String(element('score').textContent));
    assert.equal(element('pause').disabled, true);
    assert.equal(key('r', false, element('player-name')), false);
    assert.match(element('game-status').textContent, /^Game over/);
    element('player-name').value = 'Baozi';
    element('score-form').handlers.submit({ preventDefault() {} });
    assert.equal(element('leaderboard-list').children.length, 1);
    assert.equal(element('leaderboard-list').children[0].children[0].textContent, 'Baozi');
    assert.equal(element('leaderboard-list').children[0].children[1].textContent, '0');
    assert.match(element('score-message').textContent, /第 1 名/);
    allowRestart = false;
    key('r');
    assert.match(element('game-status').textContent, /^Game over/);
    allowRestart = true;
    key('R');
    assert.match(element('game-status').textContent, /^Playing/);
    assert.equal(element('pause').disabled, false);
    events.get('blur')();
    assert.match(element('game-status').textContent, /^Paused/);
    element('restart').handlers.click();
    assert.match(element('game-status').textContent, /^Playing/);
    globalThis.document.visibilityState = 'hidden';
    documentEvents.get('visibilitychange')();
    assert.match(element('game-status').textContent, /^Paused/);
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
  for (const label of ['Score', 'Level', 'Lines', 'High score']) assert.ok(stats.includes(`<span class="desktop-label">${label}</span>`));
  assert.match(html, /aria-keyshortcuts="P"/);
  assert.match(html, /aria-keyshortcuts="R"/);
  assert.match(html, /id="touch-controls"/);
  assert.match(html, /<title>Baozi Blocks<\/title>/);
  assert.match(html, /<h1>[\s\S]*Baozi Blocks/);
  assert.doesNotMatch(html, /BAOZI-\*\*FALLING BLOCKS/);
  assert.match(html, /<button type="button" data-action="drop"[\s\S]*<button type="button" data-action="rotate"/);
  for (const action of ['left', 'right', 'hold', 'rotate', 'drop']) assert.match(html, new RegExp(`data-action="${action}"`));
  assert.match(html, /id="hold-piece"/);
  assert.match(html, /<kbd>C<\/kbd>[\s\S]*Hold piece/);
  assert.doesNotMatch(html, /data-action="down"/);
  assert.match(html, /id="mobile-start"/);
  assert.match(html, /id="ghost-toggle"[^>]*type="checkbox" role="switch"/);
  assert.match(html, /id="ghost-state">关</);
  assert.match(html, /id="help-dialog"/);
  assert.match(html, /快速上手/);
  assert.match(html, /暂存可换出当前方块/);
  assert.match(html, /id="music-toggle"[^>]*aria-pressed="true"/);
  assert.match(html, /id="sound-toggle"[^>]*aria-pressed="true"/);
  assert.match(html, /id="line-clear-notice"/);
  assert.match(html, /id="final-play-time"/);
  assert.match(html, /id="score-entry"/);
  assert.match(html, /id="score-form"/);
  assert.match(html, /id="leaderboard-list"/);
  assert.match(css, /touch-action:\s*none/);
  assert.match(css, /height:\s*68px/);
  assert.match(css, /max-height:\s*520px[\s\S]*\.board-frame\[data-state="game-over"\] \.score-entry \{ position:\s*fixed/);
  assert.match(html, /<kbd>Space<\/kbd>/);
  assert.match(css, /aspect-ratio:\s*1\s*\/\s*2/);
  assert.match(css, /@media\s*\(max-width:\s*620px\)/);
  assert.match(css, /height:\s*100dvh/);
  assert.match(css, /color-scheme:\s*light/);
  assert.match(css, /background:\s*#e8eef4/);
  assert.match(css, /main\s*\{[^}]*flex:\s*1/);
  assert.match(css, /\.playfield-column\s*\{[^}]*flex:\s*1/);
  assert.match(css, /\.stat\s*\{[^}]*padding:\s*5px 6px/);
  assert.match(css, /\.board-frame\s*\{[^}]*340px/);
  assert.match(css, /\.touch-controls\s*\{\s*order:\s*3/);
  assert.match(css, /button:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});

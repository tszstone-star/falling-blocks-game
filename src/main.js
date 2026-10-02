import { createGame, act, advance } from './game/game.js';
import { createRenderer } from './ui/renderer.js?v=phone-controls-2';
import { loadHighScore, saveHighScore } from './ui/storage.js';
let storage;
try { storage = window.localStorage; } catch { /* Storage may be disabled. */ }
let state = createGame(loadHighScore(storage));
const touchDevice = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
if (touchDevice) state = act(state, 'pause');
const render = createRenderer(document);
function update(next) {
  if (next.highScore > state.highScore) saveHighScore(storage, next.highScore);
  state = next;
  if (!state.paused) mobileStart.hidden = true;
  render(state);
}
const mobileStart = document.getElementById('mobile-start');
mobileStart.hidden = !touchDevice;
mobileStart.addEventListener('click', () => {
  if (state.paused && !state.gameOver) update(act(state, 'pause'));
  mobileStart.hidden = true;
});

const controls = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down', ArrowUp: 'rotate', ' ': 'drop', p: 'pause', r: 'restart' };
function restartGame() {
  if (touchDevice && typeof window.confirm === 'function' && !window.confirm('要重新开始这一局吗？')) return;
  update(act(state, 'restart'));
}
window.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const action = controls[event.key] ?? controls[event.key.toLowerCase()];
  if (!action) return;
  event.preventDefault();
  if (event.repeat && ['pause', 'restart', 'drop', 'rotate'].includes(action)) return;
  if (action === 'restart') restartGame();
  else update(act(state, action));
});
document.getElementById('pause').addEventListener('click', () => update(act(state, 'pause')));
document.getElementById('restart').addEventListener('click', restartGame);

let activePress;
function stopPress(pointerId) {
  if (!activePress || (pointerId !== undefined && activePress.pointerId !== pointerId)) return;
  clearTimeout(activePress.timeout);
  clearInterval(activePress.interval);
  activePress.button.dataset.pressed = 'false';
  activePress = undefined;
}
const touchControls = document.getElementById('touch-controls');
for (const button of touchControls.querySelectorAll('[data-action]')) {
  button.addEventListener('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    if (state.paused || state.gameOver) return;
    stopPress();
    const action = button.dataset.action;
    activePress = { pointerId: event.pointerId, button, timeout: undefined, interval: undefined };
    button.dataset.pressed = 'true';
    if (event.pointerId !== undefined) button.setPointerCapture?.(event.pointerId);
    update(act(state, action));
    if (['left', 'right', 'down'].includes(action)) {
      activePress.timeout = setTimeout(() => {
        if (activePress?.button !== button) return;
        activePress.interval = setInterval(() => update(act(state, action)), 90);
      }, 180);
    }
  });
  for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    button.addEventListener(eventName, event => stopPress(event.pointerId));
  }
}

function pauseAfterLeavingPage() {
  stopPress();
  if (!state.paused && !state.gameOver) update(act(state, 'pause'));
}
window.addEventListener('blur', pauseAfterLeavingPage);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') pauseAfterLeavingPage();
});
let previous;
function frame(now) {
  if (previous !== undefined) update(advance(state, now - previous));
  previous = now;
  requestAnimationFrame(frame);
}
render(state);
requestAnimationFrame(frame);

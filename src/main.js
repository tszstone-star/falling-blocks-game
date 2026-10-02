import { createGame, act, advance } from './game/game.js';
import { normalizePlayerName, submitScore } from './game/leaderboard.js';
import { createRenderer } from './ui/renderer.js?v=phase5';
import { loadHighScore, saveHighScore } from './ui/storage.js';
import { createMusic } from './ui/music.js';
let storage;
try { storage = window.localStorage; } catch { /* Storage may be disabled. */ }
let state = createGame(loadHighScore(storage));
let leaderboard = [];
let scoreMessage = '';
const music = createMusic(window);
const touchDevice = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
if (touchDevice) state = act(state, 'pause');
const render = createRenderer(document);
function update(next) {
  const enteredGameOver = !state.gameOver && next.gameOver;
  if (next.highScore > state.highScore) saveHighScore(storage, next.highScore);
  if (enteredGameOver) {
    document.getElementById('player-name').value = '';
    document.getElementById('player-name').disabled = false;
    document.getElementById('save-score').disabled = false;
    scoreMessage = '';
  }
  state = next;
  if (state.paused || state.gameOver) music.stop();
  if (!state.paused) mobileStart.hidden = true;
  render(state, leaderboard, scoreMessage, music.isEnabled());
  if (enteredGameOver && !touchDevice) document.getElementById('player-name').focus();
}
const mobileStart = document.getElementById('mobile-start');
mobileStart.hidden = !touchDevice;
mobileStart.addEventListener('click', () => {
  if (state.paused && !state.gameOver) update(act(state, 'pause'));
  mobileStart.hidden = true;
  if (!state.paused && !state.gameOver) music.start();
});

const controls = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down', ArrowUp: 'rotate', ' ': 'drop', p: 'pause', r: 'restart' };
function restartGame() {
  if (touchDevice && typeof window.confirm === 'function' && !window.confirm('要重新开始这一局吗？')) return;
  update(act(state, 'restart'));
  if (!state.paused && !state.gameOver) music.start();
}
window.addEventListener('keydown', event => {
  if (event.target?.matches?.('input, textarea, select, [contenteditable="true"]')) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const action = controls[event.key] ?? controls[event.key.toLowerCase()];
  if (!action) return;
  event.preventDefault();
  if (event.repeat && ['pause', 'restart', 'drop', 'rotate'].includes(action)) return;
  if (action === 'restart') restartGame();
  else {
    update(act(state, action));
    if (!state.paused && !state.gameOver) music.start();
  }
});
document.getElementById('pause').addEventListener('click', () => {
  update(act(state, 'pause'));
  if (!state.paused && !state.gameOver) music.start();
});
document.getElementById('restart').addEventListener('click', restartGame);
document.getElementById('game-over-restart').addEventListener('click', () => {
  update(act(state, 'restart'));
  music.start();
});
document.getElementById('music-toggle').addEventListener('click', () => {
  const enabled = music.setEnabled(!music.isEnabled());
  render(state, leaderboard, scoreMessage, enabled);
  if (enabled && !state.paused && !state.gameOver) music.start();
});
document.getElementById('score-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!state.gameOver) return;
  const nameInput = document.getElementById('player-name');
  const name = normalizePlayerName(nameInput.value);
  if (!name) {
    scoreMessage = '请输入名字，或选择再来一局。';
    render(state, leaderboard, scoreMessage, music.isEnabled());
    return;
  }
  nameInput.value = name;
  const result = submitScore(leaderboard, name, state.score);
  leaderboard = result.entries;
  scoreMessage = result.recorded
    ? `成绩已保存，当前第 ${result.rank} 名。`
    : result.rank
      ? `这个名字的最佳成绩仍排在第 ${result.rank} 名。`
      : '本局分数未进入前三。';
  document.getElementById('player-name').disabled = true;
  document.getElementById('save-score').disabled = true;
  render(state, leaderboard, scoreMessage, music.isEnabled());
});

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
    if (!state.paused && !state.gameOver) music.start();
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
  music.stop();
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
render(state, leaderboard, scoreMessage, music.isEnabled());
requestAnimationFrame(frame);

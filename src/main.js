import { createGame, act, advance } from './game/game.js?v=phase7';
import { normalizePlayerName, submitScore } from './game/leaderboard.js';
import { createRenderer } from './ui/renderer.js?v=phase7';
import { loadHighScore, saveHighScore } from './ui/storage.js';
import { createMusic } from './ui/music.js?v=phase7';
import { createSoundEffects } from './ui/sound.js?v=phase7';
let storage;
try { storage = window.localStorage; } catch { /* Storage may be disabled. */ }
let state = createGame(loadHighScore(storage));
let leaderboard = [];
let scoreMessage = '';
let ghostEnabled = false;
let resumeAfterHelp = false;
const music = createMusic(window);
const sound = createSoundEffects(window);
const touchDevice = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
if (touchDevice) state = act(state, 'pause');
const render = createRenderer(document);
function renderCurrent() { render(state, leaderboard, scoreMessage, music.isEnabled(), sound.isEnabled(), ghostEnabled); }
function update(next) {
  const enteredGameOver = !state.gameOver && next.gameOver;
  if (next.highScore > state.highScore) saveHighScore(storage, next.highScore);
  if (next.eventId !== state.eventId) for (const event of next.events) sound.play(event);
  if (enteredGameOver) {
    document.getElementById('player-name').value = '';
    document.getElementById('player-name').disabled = false;
    document.getElementById('save-score').disabled = false;
    scoreMessage = '';
  }
  state = next;
  if (state.paused || state.gameOver) music.stop();
  if (!state.paused) mobileStart.hidden = true;
  renderCurrent();
  if (enteredGameOver && !touchDevice) document.getElementById('player-name').focus();
}
const mobileStart = document.getElementById('mobile-start');
const helpDialog = document.getElementById('help-dialog');
mobileStart.hidden = !touchDevice;
mobileStart.addEventListener('click', () => {
  sound.unlock();
  if (state.paused && !state.gameOver) update(act(state, 'pause'));
  mobileStart.hidden = true;
  if (!state.paused && !state.gameOver) music.start();
});

const controls = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down', ArrowUp: 'rotate', ' ': 'drop', c: 'hold', p: 'pause', r: 'restart' };
function restartGame() {
  if (touchDevice && typeof window.confirm === 'function' && !window.confirm('要重新开始这一局吗？')) return;
  sound.unlock();
  update(act(state, 'restart'));
  if (!state.paused && !state.gameOver) music.start();
}
window.addEventListener('keydown', event => {
  if (helpDialog.open) return;
  if (event.target?.matches?.('input, textarea, select, [contenteditable="true"]')) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const action = controls[event.key] ?? controls[event.key.toLowerCase()];
  if (!action) return;
  event.preventDefault();
  if (event.repeat && ['pause', 'restart', 'drop', 'rotate'].includes(action)) return;
  if (action === 'restart') restartGame();
  else {
    sound.unlock();
    update(act(state, action));
    if (!state.paused && !state.gameOver) music.start();
  }
});
document.getElementById('pause').addEventListener('click', () => {
  sound.unlock();
  update(act(state, 'pause'));
  if (!state.paused && !state.gameOver) music.start();
});
document.getElementById('restart').addEventListener('click', restartGame);
document.getElementById('game-over-restart').addEventListener('click', () => {
  sound.unlock();
  update(act(state, 'restart'));
  music.start();
});
document.getElementById('music-toggle').addEventListener('click', () => {
  const enabled = music.setEnabled(!music.isEnabled());
  renderCurrent();
  if (enabled && !state.paused && !state.gameOver) music.start();
});
document.getElementById('sound-toggle').addEventListener('click', () => {
  sound.unlock();
  sound.setEnabled(!sound.isEnabled());
  renderCurrent();
});
document.getElementById('ghost-toggle').addEventListener('change', event => {
  ghostEnabled = event.currentTarget.checked;
  renderCurrent();
});
document.getElementById('help-toggle').addEventListener('click', () => {
  resumeAfterHelp = !state.paused && !state.gameOver;
  if (resumeAfterHelp) update(act(state, 'pause'));
  helpDialog.showModal();
});
function closeHelp() { helpDialog.close(); }
document.getElementById('help-close').addEventListener('click', closeHelp);
document.getElementById('help-done').addEventListener('click', closeHelp);
helpDialog.addEventListener('close', () => {
  if (resumeAfterHelp && state.paused && !state.gameOver) {
    update(act(state, 'pause'));
    music.start();
  }
  resumeAfterHelp = false;
});
document.getElementById('score-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!state.gameOver) return;
  const nameInput = document.getElementById('player-name');
  const name = normalizePlayerName(nameInput.value);
  if (!name) {
    scoreMessage = '请输入名字，或选择再来一局。';
    renderCurrent();
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
  renderCurrent();
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
    sound.unlock();
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
renderCurrent();
requestAnimationFrame(frame);

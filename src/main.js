import { createGame, act, advance } from './game/game.js';
import { createRenderer } from './ui/renderer.js';
import { loadHighScore, saveHighScore } from './ui/storage.js';
let storage;
try { storage = window.localStorage; } catch { /* Storage may be disabled. */ }
let state = createGame(loadHighScore(storage));
const render = createRenderer(document);
function update(next) {
  if (next.highScore > state.highScore) saveHighScore(storage, next.highScore);
  state = next;
  render(state);
}
const controls = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down', ArrowUp: 'rotate', ' ': 'drop', p: 'pause', r: 'restart' };
window.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const action = controls[event.key] ?? controls[event.key.toLowerCase()];
  if (!action) return;
  event.preventDefault();
  if (event.repeat && ['pause', 'restart', 'drop', 'rotate'].includes(action)) return;
  update(act(state, action));
});
document.getElementById('pause').addEventListener('click', () => update(act(state, 'pause')));
document.getElementById('restart').addEventListener('click', () => update(act(state, 'restart')));
window.addEventListener('blur', () => { if (!state.paused && !state.gameOver) update(act(state, 'pause')); });
let previous;
function frame(now) {
  if (previous !== undefined) update(advance(state, now - previous));
  previous = now;
  requestAnimationFrame(frame);
}
render(state);
requestAnimationFrame(frame);

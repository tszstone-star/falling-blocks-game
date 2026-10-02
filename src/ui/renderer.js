import { CELL_SIZE_PX, BOARD_COLUMNS, BOARD_VISIBLE_ROWS } from '../game/config.js';
import { spawnPiece } from '../game/pieces.js';
const COLORS = { I: '#22d3ee', O: '#facc15', T: '#c084fc', S: '#4ade80', Z: '#fb7185', J: '#60a5fa', L: '#fb923c' };
function cell(context, x, y, type, size) {
  context.fillStyle = COLORS[type];
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
}
export function createRenderer(root) {
  const canvas = root.getElementById('game-board');
  const boardFrame = root.getElementById('board-frame');
  const boardOverlay = root.getElementById('board-overlay');
  canvas.width = BOARD_COLUMNS * CELL_SIZE_PX;
  canvas.height = BOARD_VISIBLE_ROWS * CELL_SIZE_PX;
  const context = canvas.getContext('2d');
  const preview = root.getElementById('next-piece');
  preview.width = preview.height = 120;
  const nextContext = preview.getContext('2d');
  return state => {
    const mode = state.gameOver ? 'game-over' : state.paused ? 'paused' : 'playing';
    context.fillStyle = '#020617';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < BOARD_VISIBLE_ROWS; y++) for (let x = 0; x < BOARD_COLUMNS; x++) {
      context.strokeStyle = '#172033';
      context.strokeRect(x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX, CELL_SIZE_PX);
      if (state.board[y][x]) cell(context, x, y, state.board[y][x], CELL_SIZE_PX);
    }
    if (!state.gameOver) for (const [x,y] of state.current.cells) cell(context, state.current.x + x, state.current.y + y, state.current.type, CELL_SIZE_PX);
    nextContext.clearRect(0, 0, 120, 120);
    const next = spawnPiece(state.next);
    const xs = next.cells.map(([x]) => x);
    const ys = next.cells.map(([,y]) => y);
    const ox = (4 - (Math.max(...xs) - Math.min(...xs) + 1)) / 2 - Math.min(...xs);
    const oy = (4 - (Math.max(...ys) - Math.min(...ys) + 1)) / 2 - Math.min(...ys);
    for (const [x,y] of next.cells) cell(nextContext, x + ox, y + oy, next.type, 30);
    preview.setAttribute('aria-label', `Next piece: ${state.next}`);
    for (const key of ['score','level','lines','highScore']) {
      const value = root.getElementById(key);
      if (value.textContent !== String(state[key])) value.textContent = state[key];
    }
    const status = root.getElementById('game-status');
    const message = mode === 'game-over'
      ? 'Game over — press R or select Restart.'
      : mode === 'paused'
        ? 'Paused — press P or select Resume.'
        : `Playing · Level ${state.level}`;
    if (status.textContent !== message) status.textContent = message;
    status.dataset.state = mode;
    const left = Math.min(...state.current.cells.map(([x]) => x)) + state.current.x + 1;
    const top = Math.min(...state.current.cells.map(([, y]) => y)) + state.current.y + 1;
    const description = root.getElementById('playfield-description');
    const pieceDescription = `Current ${state.current.type} piece, row ${top}, column ${left}. Next piece ${state.next}.`;
    if (description.textContent !== pieceDescription) description.textContent = pieceDescription;
    root.getElementById('status-panel').dataset.state = mode;
    boardFrame.dataset.state = mode;
    boardOverlay.textContent = mode === 'game-over' ? 'GAME OVER' : 'PAUSED';
    boardOverlay.hidden = mode === 'playing';
    const pauseButton = root.getElementById('pause');
    root.getElementById('pause-label').textContent = state.paused ? 'Resume' : 'Pause';
    pauseButton.disabled = state.gameOver;
  };
}

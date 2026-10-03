import { CELL_SIZE_PX, BOARD_COLUMNS, BOARD_VISIBLE_ROWS } from '../game/config.js';
import { spawnPiece } from '../game/pieces.js';
import { projectGhost } from '../game/game.js?v=phase7';
const COLORS = { I: '#22d3ee', O: '#facc15', T: '#c084fc', S: '#4ade80', Z: '#fb7185', J: '#60a5fa', L: '#fb923c' };
export function formatPlayTime(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes < 60) return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}
function cell(context, x, y, type, size) {
  context.fillStyle = COLORS[type];
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
}
export function createRenderer(root) {
  const canvas = root.getElementById('game-board');
  const boardFrame = root.getElementById('board-frame');
  const boardOverlay = root.getElementById('board-overlay');
  const scoreEntry = root.getElementById('score-entry');
  const leaderboardList = root.getElementById('leaderboard-list');
  const scoreMessage = root.getElementById('score-message');
  const musicToggle = root.getElementById('music-toggle');
  const soundToggle = root.getElementById('sound-toggle');
  const ghostToggle = root.getElementById('ghost-toggle');
  const ghostState = root.getElementById('ghost-state');
  let displayedEntries;
  let displayedLevel = 1;
  let levelNoticeUntil = 0;
  let displayedEventId = 0;
  let lineNoticeUntil = 0;
  let lineFlashUntil = 0;
  let lineNotice = '';
  let lineNoticeKind = 'line-clear';
  canvas.width = BOARD_COLUMNS * CELL_SIZE_PX;
  canvas.height = BOARD_VISIBLE_ROWS * CELL_SIZE_PX;
  const context = canvas.getContext('2d');
  const preview = root.getElementById('next-piece');
  preview.width = preview.height = 120;
  const nextContext = preview.getContext('2d');
  const holdPreview = root.getElementById('hold-piece');
  holdPreview.width = holdPreview.height = 120;
  const holdContext = holdPreview.getContext('2d');
  return (state, entries = [], entryMessage = '', musicEnabled = true, soundEnabled = true, ghostEnabled = false) => {
    const now = Date.now();
    if (state.level > displayedLevel) levelNoticeUntil = now + 900;
    else if (state.level < displayedLevel) levelNoticeUntil = 0;
    displayedLevel = state.level;
    if (state.eventId !== displayedEventId) {
      displayedEventId = state.eventId;
      lineNoticeUntil = 0;
      lineFlashUntil = 0;
      if (state.events.includes('line-clear') || state.events.includes('tetris')) {
        lineNoticeKind = state.events.includes('tetris') ? 'tetris' : 'line-clear';
        lineNotice = lineNoticeKind === 'tetris' ? 'TETRIS!' : `${state.lastClearCount} LINE${state.lastClearCount === 1 ? '' : 'S'} CLEAR`;
        lineNoticeUntil = now + 850;
        lineFlashUntil = now + 150;
      }
    }
    const mode = state.gameOver ? 'game-over' : state.paused ? 'paused' : 'playing';
    context.fillStyle = '#26384f';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < BOARD_VISIBLE_ROWS; y++) for (let x = 0; x < BOARD_COLUMNS; x++) {
      context.strokeStyle = '#465a72';
      context.strokeRect(x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX, CELL_SIZE_PX);
      if (state.board[y][x]) cell(context, x, y, state.board[y][x], CELL_SIZE_PX);
    }
    if (!state.gameOver) {
      if (ghostEnabled) {
        const ghost = projectGhost(state.board, state.current);
        context.globalAlpha = 0.34;
        for (const [x,y] of ghost.cells) cell(context, ghost.x + x, ghost.y + y, ghost.type, CELL_SIZE_PX);
        context.globalAlpha = 1;
      }
      for (const [x,y] of state.current.cells) cell(context, state.current.x + x, state.current.y + y, state.current.type, CELL_SIZE_PX);
    }
    if (now < lineFlashUntil && mode === 'playing') {
      context.globalAlpha = 0.2;
      context.fillStyle = '#e0f2fe';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1;
    }
    nextContext.clearRect(0, 0, 120, 120);
    const next = spawnPiece(state.next);
    const xs = next.cells.map(([x]) => x);
    const ys = next.cells.map(([,y]) => y);
    const ox = (4 - (Math.max(...xs) - Math.min(...xs) + 1)) / 2 - Math.min(...xs);
    const oy = (4 - (Math.max(...ys) - Math.min(...ys) + 1)) / 2 - Math.min(...ys);
    for (const [x,y] of next.cells) cell(nextContext, x + ox, y + oy, next.type, 30);
    preview.setAttribute('aria-label', `Next piece: ${state.next}`);
    holdContext.clearRect(0, 0, 120, 120);
    if (state.holdPiece) {
      const held = spawnPiece(state.holdPiece);
      const heldXs = held.cells.map(([x]) => x);
      const heldYs = held.cells.map(([,y]) => y);
      const heldX = (4 - (Math.max(...heldXs) - Math.min(...heldXs) + 1)) / 2 - Math.min(...heldXs);
      const heldY = (4 - (Math.max(...heldYs) - Math.min(...heldYs) + 1)) / 2 - Math.min(...heldYs);
      for (const [x,y] of held.cells) cell(holdContext, x + heldX, y + heldY, held.type, 30);
    }
    holdPreview.setAttribute('aria-label', `Hold piece: ${state.holdPiece ?? 'empty'}`);
    for (const key of ['score','level','lines','highScore']) {
      const value = root.getElementById(key);
      if (value.textContent !== String(state[key])) value.textContent = state[key];
    }
    for (const [id, value] of Object.entries({
      'final-score': state.score,
      'final-level': state.level,
      'final-lines': state.lines,
      'final-play-time': formatPlayTime(state.playTimeMs),
      'final-tetris-count': state.tetrisCount,
    })) {
      const element = root.getElementById(id);
      if (element.textContent !== String(value)) element.textContent = String(value);
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
    const levelNotice = root.getElementById('level-notice');
    levelNotice.hidden = now >= levelNoticeUntil || state.paused || state.gameOver;
    if (!levelNotice.hidden) levelNotice.textContent = `LEVEL UP · ${state.level}`;
    const lineClearNotice = root.getElementById('line-clear-notice');
    lineClearNotice.hidden = now >= lineNoticeUntil || state.paused || state.gameOver;
    lineClearNotice.textContent = lineNotice;
    lineClearNotice.dataset.kind = lineNoticeKind;
    scoreEntry.hidden = !state.gameOver;
    root.getElementById('round-summary').textContent = `本局得分 ${state.score} · 达到等级 ${state.level}`;
    const entriesKey = JSON.stringify(entries);
    if (entriesKey !== displayedEntries) {
      const rows = entries.length
        ? entries.map(({ name, score }) => {
          const row = root.createElement('li');
          const player = root.createElement('span');
          const points = root.createElement('strong');
          player.textContent = name;
          points.textContent = String(score);
          row.append(player, points);
          return row;
        })
        : [Object.assign(root.createElement('li'), { textContent: '还没有成绩，来创造纪录。' })];
      leaderboardList.replaceChildren(...rows);
      displayedEntries = entriesKey;
    }
    if (scoreMessage.textContent !== entryMessage) scoreMessage.textContent = entryMessage;
    musicToggle.setAttribute('aria-pressed', String(musicEnabled));
    musicToggle.setAttribute('aria-label', musicEnabled ? '关闭背景音乐' : '开启背景音乐');
    musicToggle.setAttribute('title', musicEnabled ? '关闭背景音乐' : '开启背景音乐');
    root.getElementById('music-icon').textContent = musicEnabled ? '♫' : '♪';
    root.getElementById('music-label').textContent = musicEnabled ? 'Music on' : 'Music off';
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    soundToggle.setAttribute('aria-label', soundEnabled ? '关闭音效' : '开启音效');
    soundToggle.setAttribute('title', soundEnabled ? '关闭音效' : '开启音效');
    root.getElementById('sound-icon').textContent = soundEnabled ? '◖))' : '◖';
    root.getElementById('sound-label').textContent = soundEnabled ? 'Sound on' : 'Sound off';
    ghostToggle.checked = ghostEnabled;
    ghostToggle.setAttribute('aria-label', ghostEnabled ? '隐藏落点影子' : '显示落点影子');
    ghostState.textContent = ghostEnabled ? '开' : '关';
    const pauseButton = root.getElementById('pause');
    root.getElementById('pause-label').textContent = state.paused ? 'Resume' : 'Pause';
    root.getElementById('pause-mobile-label').textContent = state.paused ? '继续' : '暂停';
    root.getElementById('pause-icon').textContent = state.paused ? '▶' : 'Ⅱ';
    pauseButton.disabled = state.gameOver;
    root.getElementById('hold-action').disabled = state.gameOver || state.paused || state.holdUsedThisTurn;
  };
}

import { createBoard, canPlace, placePiece, clearLines } from './board.js';
import { createBag, spawnPiece, rotatePiece, WALL_KICKS } from './pieces.js';

export const levelForLines = lines => 1 + Math.floor(lines / 10);
export const gravityInterval = level => Math.max(100, 800 - (level - 1) * 60);
export const lineScore = (count, level) => [0, 100, 300, 500, 800][count] * level;

function takePiece(state, random) {
  const bag = state.bag.length ? [...state.bag] : createBag(random);
  const type = bag.shift();
  return { type, bag };
}

export function createGame(highScore = 0, random = Math.random) {
  const first = takePiece({ bag: [] }, random);
  const next = takePiece(first, random);
  return { board: createBoard(), current: spawnPiece(first.type), next: next.type, bag: next.bag,
    score: 0, lines: 0, level: 1, highScore, paused: false, gameOver: false, elapsed: 0 };
}

function lock(state, random) {
  const cleared = clearLines(placePiece(state.board, state.current));
  const score = state.score + lineScore(cleared.count, state.level);
  const lines = state.lines + cleared.count;
  const current = spawnPiece(state.next);
  const next = takePiece(state, random);
  return { ...state, board: cleared.board, current, next: next.type, bag: next.bag,
    score, lines, level: levelForLines(lines), highScore: Math.max(state.highScore, score),
    gameOver: !canPlace(cleared.board, current), elapsed: 0 };
}

export function act(state, action, random = Math.random) {
  if (action === 'restart') return createGame(state.highScore, random);
  if (state.gameOver) return state;
  if (action === 'pause') return { ...state, paused: !state.paused };
  if (state.paused) return state;
  const piece = state.current;
  if (action === 'left' || action === 'right') {
    const moved = { ...piece, x: piece.x + (action === 'left' ? -1 : 1) };
    return canPlace(state.board, moved) ? { ...state, current: moved } : state;
  }
  if (action === 'rotate') {
    const rotated = rotatePiece(piece);
    for (const [dx, dy] of WALL_KICKS) {
      const kicked = { ...rotated, x: piece.x + dx, y: piece.y + dy };
      if (canPlace(state.board, kicked)) return { ...state, current: kicked };
    }
    return state;
  }
  if (action === 'down') {
    const moved = { ...piece, y: piece.y + 1 };
    return canPlace(state.board, moved) ? { ...state, current: moved } : lock(state, random);
  }
  if (action === 'drop') {
    let landed = piece;
    while (canPlace(state.board, { ...landed, y: landed.y + 1 })) landed = { ...landed, y: landed.y + 1 };
    return lock({ ...state, current: landed }, random);
  }
  return state;
}

export function advance(state, milliseconds, random = Math.random) {
  if (state.paused || state.gameOver) return state;
  let result = { ...state, elapsed: state.elapsed + Math.max(0, milliseconds) };
  while (!result.gameOver && result.elapsed >= gravityInterval(result.level)) {
    const elapsed = result.elapsed - gravityInterval(result.level);
    const moved = act(result, 'down', random);
    // A newly spawned piece starts a fresh interval; don't consume old-piece time.
    if (moved.board !== result.board) return moved;
    result = { ...moved, elapsed };
  }
  return result;
}

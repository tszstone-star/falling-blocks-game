import { createBoard, canPlace, placePiece, clearLines } from './board.js';
import { createBag, spawnPiece, rotatePiece, srsKicks } from './pieces.js';
import { LINES_PER_LEVEL, START_GRAVITY_INTERVAL_MS, LEVEL_SPEED_MULTIPLIER, MIN_GRAVITY_INTERVAL_MS, LOCK_DELAY_MS, MAX_LOCK_RESETS } from './config.js?v=phase7';

export const levelForLines = lines => 1 + Math.floor(lines / LINES_PER_LEVEL);
export const gravityInterval = level => Math.max(MIN_GRAVITY_INTERVAL_MS, Math.round(START_GRAVITY_INTERVAL_MS / LEVEL_SPEED_MULTIPLIER ** (level - 1)));
export const lineScore = count => [0, 100, 300, 500, 800][count] ?? 0;

export function projectGhost(board, piece) {
  let y = piece.y;
  while (canPlace(board, { ...piece, y: y + 1 })) y++;
  return { ...piece, y };
}

export const isGrounded = (board, piece) => !canPlace(board, { ...piece, y: piece.y + 1 });

function takePiece(state, random) {
  const bag = state.bag.length ? [...state.bag] : createBag(random);
  const type = bag.shift();
  return { type, bag };
}

export function createGame(highScore = 0, random = Math.random) {
  const first = takePiece({ bag: [] }, random);
  const next = takePiece(first, random);
  return { board: createBoard(), current: spawnPiece(first.type), next: next.type, bag: next.bag,
    score: 0, lines: 0, level: 1, highScore, paused: false, gameOver: false, elapsed: 0,
    groundedMs: 0, lockResets: 0, holdPiece: null, holdUsedThisTurn: false,
    playTimeMs: 0, tetrisCount: 0, eventId: 0, events: [] };
}

function lock(state, random) {
  const cleared = clearLines(placePiece(state.board, state.current));
  const score = state.score + lineScore(cleared.count);
  const lines = state.lines + cleared.count;
  const level = levelForLines(lines);
  const current = spawnPiece(state.next);
  const gameOver = !canPlace(cleared.board, current);
  const events = ['lock'];
  if (cleared.count === 4) events.push('tetris');
  else if (cleared.count > 0) events.push('line-clear');
  if (level > state.level) events.push('level-up');
  if (gameOver) events.push('game-over');
  const next = takePiece(state, random);
  return { ...state, board: cleared.board, current, next: next.type, bag: next.bag,
    score, lines, level, highScore: Math.max(state.highScore, score),
    gameOver, elapsed: 0, groundedMs: 0, lockResets: 0,
    holdUsedThisTurn: false, tetrisCount: state.tetrisCount + (cleared.count === 4 ? 1 : 0),
    lastClearCount: cleared.count, eventId: state.eventId + events.length, events };
}

function hold(state, random) {
  if (state.holdUsedThisTurn) return state;
  const currentType = state.current.type;
  let heldType = currentType;
  let current;
  let next = state.next;
  let bag = state.bag;
  if (state.holdPiece) {
    current = spawnPiece(state.holdPiece);
  } else {
    current = spawnPiece(next);
    const drawn = takePiece(state, random);
    next = drawn.type;
    bag = drawn.bag;
  }
  const gameOver = !canPlace(state.board, current);
  const events = ['hold'];
  if (gameOver) events.push('game-over');
  return { ...state, current, next, bag, holdPiece: heldType, holdUsedThisTurn: true,
    elapsed: 0, groundedMs: 0, lockResets: 0, gameOver,
    eventId: state.eventId + events.length, events };
}

function movePiece(state, candidate, resetLock = true) {
  if (!canPlace(state.board, candidate)) return state;
  const wasGrounded = isGrounded(state.board, state.current);
  const nowGrounded = isGrounded(state.board, candidate);
  let groundedMs = nowGrounded ? state.groundedMs : 0;
  let lockResets = state.lockResets;
  if (!wasGrounded && nowGrounded) groundedMs = 0;
  else if (wasGrounded && !nowGrounded) groundedMs = 0;
  else if (wasGrounded && nowGrounded && resetLock && lockResets < MAX_LOCK_RESETS) {
    groundedMs = 0;
    lockResets++;
  }
  return { ...state, current: candidate, groundedMs, lockResets };
}

export function act(state, action, random = Math.random) {
  if (action === 'restart') return createGame(state.highScore, random);
  if (state.gameOver) return state;
  if (action === 'pause') return { ...state, paused: !state.paused };
  if (state.paused) return state;
  if (action === 'hold') return hold(state, random);
  const piece = state.current;
  if (action === 'left' || action === 'right') {
    const moved = { ...piece, x: piece.x + (action === 'left' ? -1 : 1) };
    return movePiece(state, moved);
  }
  if (action === 'rotate') {
    const rotated = rotatePiece(piece);
    if (rotated === piece) return state;
    for (const [dx, dy] of srsKicks(piece.type, piece.rotation ?? 0, rotated.rotation)) {
      const kicked = { ...rotated, x: piece.x + dx, y: piece.y + dy };
      if (canPlace(state.board, kicked)) {
        const result = movePiece(state, kicked);
        return { ...result, eventId: state.eventId + 1, events: ['rotate'] };
      }
    }
    return state;
  }
  if (action === 'down') {
    const moved = { ...piece, y: piece.y + 1 };
    return movePiece(state, moved, false);
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
  let result = state;
  let remaining = Math.max(0, milliseconds);
  let activeMs = 0;
  while (!result.gameOver && remaining > 0) {
    const grounded = isGrounded(result.board, result.current);
    const untilGravity = Math.max(0, gravityInterval(result.level) - result.elapsed);
    const untilLock = grounded ? Math.max(0, LOCK_DELAY_MS - result.groundedMs) : Infinity;
    const step = Math.min(remaining, untilGravity, untilLock);
    if (step > 0) {
      remaining -= step;
      activeMs += step;
      result = { ...result,
        elapsed: result.elapsed + step,
        groundedMs: grounded ? result.groundedMs + step : 0 };
    }
    if (grounded && result.groundedMs >= LOCK_DELAY_MS) {
      const locked = lock(result, random);
      return { ...locked, playTimeMs: locked.playTimeMs + activeMs };
    }
    if (result.elapsed >= gravityInterval(result.level)) {
      const next = { ...result.current, y: result.current.y + 1 };
      result = { ...result, elapsed: 0 };
      if (canPlace(result.board, next)) result = { ...result, current: next, groundedMs: 0 };
      continue;
    }
    if (step === 0) break;
  }
  return activeMs ? { ...result, playTimeMs: result.playTimeMs + activeMs } : result;
}

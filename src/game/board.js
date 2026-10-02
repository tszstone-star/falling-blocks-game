import { BOARD_COLUMNS, BOARD_VISIBLE_ROWS } from './config.js';

export const createBoard = () => Array.from({ length: BOARD_VISIBLE_ROWS }, () => Array(BOARD_COLUMNS).fill(null));

export function canPlace(board, piece) {
  return piece.cells.every(([cx, cy]) => {
    const x = piece.x + cx;
    const y = piece.y + cy;
    return x >= 0 && x < BOARD_COLUMNS && y >= 0 && y < BOARD_VISIBLE_ROWS && board[y][x] === null;
  });
}

export function placePiece(board, piece) {
  if (!canPlace(board, piece)) throw new Error('Cannot place colliding piece');
  const result = board.map(row => [...row]);
  for (const [cx, cy] of piece.cells) result[piece.y + cy][piece.x + cx] = piece.type;
  return result;
}

export function clearLines(board) {
  const remaining = board.filter(row => row.some(cell => cell === null));
  const count = BOARD_VISIBLE_ROWS - remaining.length;
  return { board: [...Array.from({ length: count }, () => Array(BOARD_COLUMNS).fill(null)), ...remaining.map(row => [...row])], count };
}

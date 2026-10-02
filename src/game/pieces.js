export const SHAPES = {
  I: { size: 4, cells: [[0,1],[1,1],[2,1],[3,1]] },
  O: { size: 2, cells: [[0,0],[1,0],[0,1],[1,1]] },
  T: { size: 3, cells: [[1,0],[0,1],[1,1],[2,1]] },
  S: { size: 3, cells: [[1,0],[2,0],[0,1],[1,1]] },
  Z: { size: 3, cells: [[0,0],[1,0],[1,1],[2,1]] },
  J: { size: 3, cells: [[0,0],[0,1],[1,1],[2,1]] },
  L: { size: 3, cells: [[2,0],[0,1],[1,1],[2,1]] },
};
export const PIECE_TYPES = Object.keys(SHAPES);
export const WALL_KICKS = [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1]];
export function spawnPiece(type) {
  const { size, cells } = SHAPES[type];
  return { type, size, cells: cells.map(cell => [...cell]), x: Math.floor((10 - size) / 2), y: 0 };
}
export function rotatePiece(piece) {
  if (piece.type === 'O') return piece;
  return { ...piece, cells: piece.cells.map(([x,y]) => [piece.size - 1 - y, x]) };
}
export function createBag(random = Math.random) {
  const bag = [...PIECE_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

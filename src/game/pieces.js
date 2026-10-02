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

const JLSTZ_KICKS = {
  '0>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '1>0': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '1>2': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '2>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '2>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '3>2': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '3>0': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '0>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
};
const I_KICKS = {
  '0>1': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
  '1>0': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
  '1>2': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
  '2>1': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
  '2>3': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
  '3>2': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
  '3>0': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
  '0>3': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
};
export function srsKicks(type, from, to) {
  if (type === 'O') return [[0,0]];
  return (type === 'I' ? I_KICKS : JLSTZ_KICKS)[`${from}>${to}`] ?? [[0,0]];
}

export function spawnPiece(type) {
  const { size, cells } = SHAPES[type];
  return { type, size, cells: cells.map(cell => [...cell]), x: Math.floor((10 - size) / 2), y: 0, rotation: 0 };
}
export function rotatePiece(piece) {
  if (piece.type === 'O') return piece;
  return { ...piece, cells: piece.cells.map(([x,y]) => [piece.size - 1 - y, x]), rotation: ((piece.rotation ?? 0) + 1) % 4 };
}
export function createBag(random = Math.random) {
  const bag = [...PIECE_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

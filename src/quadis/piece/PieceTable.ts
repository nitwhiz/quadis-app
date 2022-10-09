const I = 'I'.charCodeAt(0);
const O = 'O'.charCodeAt(0);
const L = 'L'.charCodeAt(0);
const J = 'J'.charCodeAt(0);
const S = 'S'.charCodeAt(0);
const T = 'T'.charCodeAt(0);
const Z = 'Z'.charCodeAt(0);

export const PieceI = I;
export const PieceO = O;
export const PieceL = L;
export const PieceJ = J;
export const PieceS = S;
export const PieceT = T;
export const PieceZ = Z;

export const PieceBedrock = 'B'.charCodeAt(0);

const pieceDataI = [
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, I, I, I, I, 0, 0, 0, 0]),
  new Uint8Array([0, 0, I, 0, 0, 0, I, 0, 0, 0, I, 0, 0, 0, I, 0]),
];

const pieceDataO = [
  new Uint8Array([0, 0, 0, 0, 0, O, O, 0, 0, O, O, 0, 0, 0, 0, 0]),
];

const pieceDataL = [
  new Uint8Array([0, 0, 0, 0, L, L, L, 0, 0, 0, L, 0, 0, 0, 0, 0]),
  new Uint8Array([0, L, 0, 0, 0, L, 0, 0, L, L, 0, 0, 0, 0, 0, 0]),
  new Uint8Array([L, 0, 0, 0, L, L, L, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  new Uint8Array([0, L, L, 0, 0, L, 0, 0, 0, L, 0, 0, 0, 0, 0, 0]),
];

const pieceDataJ = [
  new Uint8Array([0, 0, 0, 0, J, J, J, 0, J, 0, 0, 0, 0, 0, 0, 0]),
  new Uint8Array([J, J, 0, 0, 0, J, 0, 0, 0, J, 0, 0, 0, 0, 0, 0]),
  new Uint8Array([0, 0, J, 0, J, J, J, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  new Uint8Array([0, J, 0, 0, 0, J, 0, 0, 0, J, J, 0, 0, 0, 0, 0]),
];

const pieceDataS = [
  new Uint8Array([0, 0, 0, 0, 0, S, S, 0, S, S, 0, 0, 0, 0, 0, 0]),
  new Uint8Array([0, S, 0, 0, 0, S, S, 0, 0, 0, S, 0, 0, 0, 0, 0]),
  new Uint8Array([0, 0, 0, 0, 0, S, S, 0, S, S, 0, 0, 0, 0, 0, 0]),
  new Uint8Array([0, S, 0, 0, 0, S, S, 0, 0, 0, S, 0, 0, 0, 0, 0]),
];

const pieceDataT = [
  new Uint8Array([0, 0, 0, 0, T, T, T, 0, 0, T, 0, 0, 0, 0, 0, 0]),
  new Uint8Array([0, T, 0, 0, T, T, 0, 0, 0, T, 0, 0, 0, 0, 0, 0]),
  new Uint8Array([0, T, 0, 0, T, T, T, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  new Uint8Array([0, T, 0, 0, 0, T, T, 0, 0, T, 0, 0, 0, 0, 0, 0]),
];

const pieceDataZ = [
  new Uint8Array([0, 0, 0, 0, Z, Z, 0, 0, 0, Z, Z, 0, 0, 0, 0, 0]),
  new Uint8Array([0, 0, Z, 0, 0, Z, Z, 0, 0, Z, 0, 0, 0, 0, 0, 0]),
  new Uint8Array([0, 0, 0, 0, Z, Z, 0, 0, 0, Z, Z, 0, 0, 0, 0, 0]),
  new Uint8Array([0, 0, Z, 0, 0, Z, Z, 0, 0, Z, 0, 0, 0, 0, 0, 0]),
];

export const PieceTable = {
  [I]: pieceDataI,
  [O]: pieceDataO,
  [L]: pieceDataL,
  [J]: pieceDataJ,
  [S]: pieceDataS,
  [T]: pieceDataT,
  [Z]: pieceDataZ,
};

const clampRotation = (pieceName: number, rot: number): number => {
  return rot % (PieceTable[pieceName] || []).length;
};

export const getPieceDataXY = (
  pieceName: number,
  rot: number,
  x: number,
  y: number,
): number => {
  const cRot = clampRotation(pieceName, rot);

  return PieceTable[pieceName][cRot][y * 4 + x];
};

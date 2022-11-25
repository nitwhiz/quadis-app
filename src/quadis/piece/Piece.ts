export const enum Piece {
  I = 1,
  O = 2,
  L = 3,
  J = 4,
  S = 5,
  T = 6,
  Z = 7,
  B = 8,
}

const I = Piece.I;
const O = Piece.O;
const L = Piece.L;
const J = Piece.J;
const S = Piece.S;
const T = Piece.T;
const Z = Piece.Z;

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

export const PieceDataTable: Record<Piece, Uint8Array[] | null> = {
  [Piece.I]: pieceDataI,
  [Piece.O]: pieceDataO,
  [Piece.L]: pieceDataL,
  [Piece.J]: pieceDataJ,
  [Piece.S]: pieceDataS,
  [Piece.T]: pieceDataT,
  [Piece.Z]: pieceDataZ,
  [Piece.B]: null,
};

export const getFaceCount = (piece: Piece): number => {
  return (PieceDataTable[piece] ?? []).length;
};

export const clampRotation = (piece: Piece, rot: number): number => {
  return Math.floor(rot % getFaceCount(piece));
};

export const getPieceDataXY = (
  piece: Piece,
  rot: number,
  x: number,
  y: number,
): number => {
  const pieceData = PieceDataTable[piece];

  if (pieceData === null) {
    return 0;
  }

  const cRot = clampRotation(piece, rot);

  return pieceData[cRot][y * 4 + x];
};

export const BLOCK_SIZE_SIDE_PIECE = 12;
export const BLOCK_SIZE_MAIN_FIELD = 24;
export const BLOCK_SIZE_OPPONENT_FIELD = 10;

export const MAX_TOKEN = Number(Piece.B);

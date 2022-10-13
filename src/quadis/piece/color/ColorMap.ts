import { Piece } from '../Piece';

export default class ColorMap {
  public static readonly DEFAULT_COLOR = 0xff00ff;

  private readonly colors: Record<Piece, number>;

  constructor() {
    this.colors = {
      [Piece.I]: ColorMap.DEFAULT_COLOR,
      [Piece.O]: ColorMap.DEFAULT_COLOR,
      [Piece.L]: ColorMap.DEFAULT_COLOR,
      [Piece.J]: ColorMap.DEFAULT_COLOR,
      [Piece.S]: ColorMap.DEFAULT_COLOR,
      [Piece.T]: ColorMap.DEFAULT_COLOR,
      [Piece.Z]: ColorMap.DEFAULT_COLOR,
      [Piece.B]: ColorMap.DEFAULT_COLOR,
    };
  }

  public setColor(piece: Piece, color: number) {
    this.colors[piece] = color;
  }

  public getColor(piece: Piece): number {
    return this.colors[piece];
  }
}

import { Piece } from '../Piece';

export default class ColorMap {
  public static readonly DEFAULT_COLOR_MAP = new ColorMap({
    [Piece.I]: 0x0caee8,
    [Piece.O]: 0xf2f200,
    [Piece.L]: 0xffce0d,
    [Piece.J]: 0xebaf0c,
    [Piece.S]: 0x0cb14a,
    [Piece.T]: 0xac0ce8,
    [Piece.Z]: 0xe82c0c,
    [Piece.B]: 0x333333,
  });

  private readonly colors: Record<Piece, number>;

  constructor(colors: Record<Piece, number>) {
    this.colors = colors;
  }

  public getColor(piece: Piece): number {
    return this.colors[piece];
  }
}

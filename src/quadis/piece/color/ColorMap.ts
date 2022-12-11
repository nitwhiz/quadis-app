import { Piece } from '../Piece';

export default class ColorMap {
  public static readonly CLASSIC = new ColorMap({
    [Piece.I]: 0x00f0f0,
    [Piece.O]: 0xf0f000,
    [Piece.L]: 0xf0a000,
    [Piece.J]: 0x0000f0,
    [Piece.S]: 0x00f000,
    [Piece.T]: 0xa000f0,
    [Piece.Z]: 0xf00000,
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

import { PieceName } from '@bloccs/client';

export const DictDefault = {
  [PieceName.I]: 0x0caee8,
  [PieceName.O]: 0xf2f200,
  [PieceName.L]: 0xffce0d,
  [PieceName.J]: 0xebaf0c,
  [PieceName.S]: 0x0cb14a,
  [PieceName.T]: 0xac0ce8,
  [PieceName.Z]: 0xe82c0c,
  [PieceName.B]: 0x333333,
};

export default class PieceColorMap {
  private readonly colorDict: Record<PieceName, number>;

  constructor(dict: Record<PieceName, number> = DictDefault) {
    this.colorDict = { ...dict };
  }

  public add(pieceName: PieceName, color: number) {
    this.colorDict[pieceName] = color;
  }

  public getColor(pieceName: PieceName): number {
    return this.colorDict[pieceName] === undefined
      ? 0xff00ff
      : this.colorDict[pieceName];
  }
}

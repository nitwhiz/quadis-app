export default class ColorMap {
  private readonly colorDict: Record<number, number>;

  constructor() {
    this.colorDict = {};
  }

  public add(pieceName: number, color: number) {
    this.colorDict[pieceName] = color;
  }

  public getColor(code: number): number {
    return this.colorDict[code] === undefined ? 0xff00ff : this.colorDict[code];
  }
}

export default class ColorMap {
  private readonly colors: Record<number, number>;

  constructor() {
    this.colors = {};
  }

  public add(pieceName: number, color: number) {
    this.colors[pieceName] = color;
  }

  public getColor(code: number): number {
    return this.colors[code] === undefined ? 0xff00ff : this.colors[code];
  }
}

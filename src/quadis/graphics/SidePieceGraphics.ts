import { getPieceDataXY } from '../piece/PieceTable';
import ColorMap from '../piece/color/ColorMap';
import { Graphics } from 'pixi.js';

export default class SidePieceGraphics extends Graphics {
  private readonly colorMap: ColorMap;

  private currentPieceToken: null | number;

  private currentPieceRotation: number;

  constructor(colorMap: ColorMap) {
    super();

    this.colorMap = colorMap;

    this.currentPieceToken = null;
    this.currentPieceRotation = -1;
  }

  public setPiece(pieceToken: null | number, pieceRotation = 0): void {
    if (
      pieceToken !== this.currentPieceToken ||
      pieceRotation !== this.currentPieceRotation
    ) {
      this.currentPieceToken = pieceToken;
      this.currentPieceRotation = pieceRotation;

      this.renderPiece();
    }
  }

  public renderPiece(): void {
    if (this.currentPieceToken === null) {
      return;
    }

    this.clear();

    for (let x = 0; x < 4; ++x) {
      for (let y = 0; y < 4; ++y) {
        const blockData = getPieceDataXY(
          this.currentPieceToken,
          this.currentPieceRotation,
          x,
          y,
        );

        if (blockData) {
          this.beginFill(this.colorMap.getColor(blockData));
          this.drawRect(x * 15 + 10, y * 15 + 10, 15, 15);
        }
      }
    }
  }
}

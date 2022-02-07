import * as PIXI from 'pixi.js';
import { getPieceDataXY } from '../piece/PieceTable';
import ColorMap from '../piece/color/ColorMap';

export default class SidePieceGraphics {
  private readonly graphics: PIXI.Graphics;

  private readonly colorMap: ColorMap;

  private readonly renderer: PIXI.AbstractRenderer;

  private currentPieceName: null | number;

  private currentPieceRotation: number;

  constructor(view: HTMLCanvasElement, colorMap: ColorMap) {
    this.graphics = new PIXI.Graphics();
    this.colorMap = colorMap;
    this.renderer = PIXI.autoDetectRenderer({
      view,
      width: 20 + 15 * 4,
      height: 20 + 15 * 4,
    });

    this.currentPieceName = null;
    this.currentPieceRotation = -1;
  }

  public setPiece(pieceName: null | number, pieceRotation: number): void {
    if (
      pieceName !== this.currentPieceName ||
      pieceRotation !== this.currentPieceRotation
    ) {
      this.currentPieceName = pieceName;
      this.currentPieceRotation = pieceRotation;

      this.renderPiece();
    }
  }

  public renderPiece(): void {
    if (this.currentPieceName === null) {
      return;
    }

    this.graphics.clear();

    for (let x = 0; x < 4; ++x) {
      for (let y = 0; y < 4; ++y) {
        const blockData = getPieceDataXY(
          this.currentPieceName,
          this.currentPieceRotation,
          x,
          y,
        );

        if (blockData) {
          this.graphics.beginFill(this.colorMap.getColor(blockData));
          this.graphics.drawRect(x * 15 + 10, y * 15 + 10, 15, 15);
        }
      }
    }

    this.renderer.render(this.graphics);
  }
}

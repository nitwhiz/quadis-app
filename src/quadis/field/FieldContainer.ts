import DOMLinkedContainer from '../common/DOMLinkedContainer';
import { PieceContainer } from '../piece/PieceContainer';
import { Graphics } from 'pixi.js';
import ColorMap from '../piece/color/ColorMap';
import { getPieceDataXY, Piece } from '../piece/Piece';

export default class FieldContainer extends DOMLinkedContainer {
  public static DEFAULT_FIELD_HEIGHT = 20;

  public static DEFAULT_FIELD_WIDTH = 10;

  public readonly blockSize: number;

  private fieldData: Uint8Array;

  private fieldWidth: number;

  private fieldHeight: number;

  private readonly fallingPieceContainer: PieceContainer;

  private readonly fieldGraphics: Graphics;

  public constructor(domElement: HTMLElement, blockSize: number) {
    super(domElement);

    this.blockSize = blockSize;

    this.fieldData = new Uint8Array(0);

    this.fieldWidth = FieldContainer.DEFAULT_FIELD_WIDTH;
    this.fieldHeight = FieldContainer.DEFAULT_FIELD_HEIGHT;

    this.fallingPieceContainer = new PieceContainer(this.blockSize);

    this.fallingPieceContainer.x = 0;
    this.fallingPieceContainer.y = 0;

    this.fieldGraphics = new Graphics();

    this.fieldGraphics.x = 0;
    this.fieldGraphics.y = 0;

    this.addChild(this.fieldGraphics, this.fallingPieceContainer);

    this.setDOMDimensions(
      this.blockSize * this.fieldWidth,
      this.blockSize * this.fieldHeight,
    );

    this.update(true);
  }

  public tryTranslateFallingPiece(dr: number, dx: number, dy: number): boolean {
    const destR = this.fallingPieceContainer.rotation + dr;

    const destFieldX =
      this.fallingPieceContainer.position.x / this.blockSize + dx;
    const destFieldY =
      this.fallingPieceContainer.position.y / this.blockSize + dy;

    const piece = this.fallingPieceContainer.piece;

    if (piece === null || destFieldX < 0 || destFieldY < 0) {
      return false;
    }

    for (let x = 0; x < 4; ++x) {
      for (let y = 0; y < 4; ++y) {
        if (getPieceDataXY(piece, destR, x, y) !== 0) {
          const tx = destFieldX + x;
          const ty = destFieldY + y;

          if (
            tx >= this.fieldWidth - 1 ||
            ty >= this.fieldHeight - 1 ||
            this.fieldData[tx + ty * this.fieldWidth] !== 0
          ) {
            return false;
          }
        }
      }
    }

    this.fallingPieceContainer.rotation = destR;

    const destX = this.fallingPieceContainer.position.x + dx * this.blockSize;
    const destY = this.fallingPieceContainer.position.y + dy * this.blockSize;

    this.fallingPieceContainer.position.set(destX, destY);

    return true;
  }

  public getFallingPieceContainer(): PieceContainer {
    return this.fallingPieceContainer;
  }

  public updateFallingPiece(
    piece: Piece,
    rotation: number,
    x: number,
    y: number,
  ): void {
    this.fallingPieceContainer.piece = piece;
    this.fallingPieceContainer.rotation = rotation;

    this.fallingPieceContainer.position.set(
      x * this.blockSize,
      y * this.blockSize,
    );
  }

  public updateField(width: number, height: number, data: number[]): void {
    this.fieldWidth = width;
    this.fieldHeight = height;

    if (this.fieldData.length !== this.fieldWidth * this.fieldHeight) {
      this.fieldData = new Uint8Array(data);

      this.setDOMDimensions(
        this.blockSize * this.fieldWidth,
        this.blockSize * this.fieldHeight,
      );

      this.update(true);
    } else {
      this.fieldData.set(data);
    }

    this.updateFieldGraphics();
  }

  private updateFieldGraphics(): void {
    this.fieldGraphics.clear();

    for (let x = 0; x < this.fieldWidth; ++x) {
      for (let y = 0; y < this.fieldHeight; ++y) {
        const blockData = this.fieldData[y * this.fieldWidth + x];

        if (blockData) {
          this.fieldGraphics.beginFill(
            ColorMap.DEFAULT_COLOR_MAP.getColor(blockData),
          );
          this.fieldGraphics.drawRect(
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize,
            this.blockSize,
          );
        }
      }
    }

    this.fieldGraphics.lineStyle(1, 0xffffff, 0.1);

    for (let y = 0; y < this.fieldHeight; ++y) {
      this.fieldGraphics
        .moveTo(0, y * this.blockSize)
        .lineTo(this.fieldWidth * this.blockSize, y * this.blockSize);
    }

    for (let x = 0; x < this.fieldWidth; ++x) {
      this.fieldGraphics
        .moveTo(x * this.blockSize, 0)
        .lineTo(x * this.blockSize, this.fieldHeight * this.blockSize);
    }
  }

  public reset(): void {
    this.fallingPieceContainer.piece = null;

    this.fieldData.fill(0);

    this.updateFieldGraphics();
  }
}

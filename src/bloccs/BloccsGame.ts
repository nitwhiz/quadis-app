import * as PIXI from 'pixi.js';

export type PieceType = 'I' | 'O' | 'L' | 'J' | 'S' | 'T' | 'Z';

const DEFAULT_BLOCKS_WIDTH = 10;
const DEFAULT_BLOCKS_HEIGHT = 20;

export default class BloccsGame {
  public readonly app: PIXI.Application;

  private blockSize: number;

  private fieldData: Uint8Array;

  private fieldWidth: number;

  private fieldHeight: number;

  private readonly fieldGraphics: PIXI.Graphics;

  private readonly fallingPieceGraphics: PIXI.Graphics;

  private fallingPieceType: PieceType | null;

  private fallingPieceDisplayRotation: number;

  private readonly fallingPieceDisplayData: Uint8Array;

  private readonly colorMap: Record<number, number>;

  constructor(view: HTMLCanvasElement, blockSize: number) {
    this.app = new PIXI.Application({
      view,
      width: DEFAULT_BLOCKS_WIDTH * blockSize,
      height: DEFAULT_BLOCKS_HEIGHT * blockSize,
      backgroundColor: 0x000000,
      autoStart: false,
      powerPreference: 'low-power',
    });

    this.blockSize = blockSize;

    this.fieldData = new Uint8Array(0);
    this.fieldWidth = DEFAULT_BLOCKS_WIDTH;
    this.fieldHeight = DEFAULT_BLOCKS_HEIGHT;

    this.fieldGraphics = new PIXI.Graphics();
    this.fallingPieceGraphics = new PIXI.Graphics();

    this.fallingPieceType = null;
    this.fallingPieceDisplayRotation = -1;
    this.fallingPieceDisplayData = new Uint8Array(16);

    this.colorMap = {};

    this.addColor('I', 0x8eaddb);
    this.addColor('O', 0xfdd1b4);
    this.addColor('L', 0xe3efc9);
    this.addColor('J', 0xabcdd9);
    this.addColor('S', 0xe4efc9);
    this.addColor('T', 0xf2929d);
    this.addColor('Z', 0xc18bbd);
    this.addColor('X', 0x333333);

    this.fieldGraphics.x = 0;
    this.fieldGraphics.y = 0;

    this.fallingPieceGraphics.x = 0;
    this.fallingPieceGraphics.y = 0;

    this.app.stage.addChild(this.fieldGraphics, this.fallingPieceGraphics);
  }

  public setBlockSize(size: number): void {
    this.blockSize = size;

    this.app.stage.width = this.app.view.width =
      this.blockSize * this.fieldWidth;
    this.app.stage.height = this.app.view.height =
      this.blockSize * this.fieldHeight;

    this.app.resize();
  }

  private addColor(code: string, color: number) {
    this.colorMap[code.charCodeAt(0)] = color;
  }

  private getColor(code: number): number {
    return this.colorMap[code] === undefined ? 0xff00ff : this.colorMap[code];
  }

  private updateFallingPieceGraphics(): void {
    this.fallingPieceGraphics.clear();

    for (let x = 0; x < 4; ++x) {
      for (let y = 0; y < 4; ++y) {
        const blockData = this.fallingPieceDisplayData[y * 4 + x];

        if (blockData) {
          this.fallingPieceGraphics.beginFill(this.getColor(blockData));
          this.fallingPieceGraphics.drawRect(
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize,
            this.blockSize,
          );
        }
      }
    }
  }

  public setFallingPieceData(
    pieceType: PieceType,
    pieceRotation: number,
    x: number,
    y: number,
    pieceDisplayData: number[],
  ): void {
    this.fallingPieceGraphics.x = x * this.blockSize;
    this.fallingPieceGraphics.y = y * this.blockSize;

    if (
      pieceType !== this.fallingPieceType ||
      pieceRotation !== this.fallingPieceDisplayRotation
    ) {
      this.fallingPieceType = pieceType;
      this.fallingPieceDisplayRotation = pieceRotation;
      this.fallingPieceDisplayData.set(pieceDisplayData);

      this.updateFallingPieceGraphics();
    }
  }

  private updateFieldGraphics(): void {
    this.fieldGraphics.clear();

    this.fieldGraphics.width = this.fieldWidth * this.blockSize;
    this.fieldGraphics.height = this.fieldHeight * this.blockSize;

    for (let x = 0; x < this.fieldWidth; ++x) {
      for (let y = 0; y < this.fieldHeight; ++y) {
        const blockData = this.fieldData[y * this.fieldWidth + x];

        if (blockData) {
          this.fieldGraphics.beginFill(this.getColor(blockData));
          this.fieldGraphics.drawRect(
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize,
            this.blockSize,
          );
        }
      }
    }
  }

  public setFieldData(width: number, height: number, data: number[]): void {
    this.fieldWidth = width;
    this.fieldHeight = height;

    this.app.view.width = width * this.blockSize;
    this.app.view.height = height * this.blockSize;

    if (this.fieldData.length !== this.fieldWidth * this.fieldHeight) {
      this.fieldData = new Uint8Array(data);
    } else {
      this.fieldData.set(data);
    }

    this.updateFieldGraphics();
  }
}

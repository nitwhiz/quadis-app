import * as PIXI from 'pixi.js';
import EventEmitter from 'eventemitter3';

// todo: refactor

export const PieceI = 'I'.charCodeAt(0);
export const PieceO = 'O'.charCodeAt(0);
export const PieceL = 'L'.charCodeAt(0);
export const PieceJ = 'J'.charCodeAt(0);
export const PieceS = 'S'.charCodeAt(0);
export const PieceT = 'T'.charCodeAt(0);
export const PieceZ = 'Z'.charCodeAt(0);

export type PieceType =
  | typeof PieceI
  | typeof PieceO
  | typeof PieceL
  | typeof PieceJ
  | typeof PieceS
  | typeof PieceT
  | typeof PieceZ;

const DEFAULT_BLOCKS_WIDTH = 10;
const DEFAULT_BLOCKS_HEIGHT = 20;

export const GAME_EVENT_UPDATE_SCORE = 'update_score';

type GameEventType = typeof GAME_EVENT_UPDATE_SCORE;

// todo: add piece width & height to display them centered
const pieceData = {
  [PieceI]: [
    0,
    0,
    0,
    0,
    PieceI,
    PieceI,
    PieceI,
    PieceI,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ],
  [PieceO]: [
    0,
    0,
    0,
    0,
    0,
    PieceO,
    PieceO,
    0,
    0,
    PieceO,
    PieceO,
    0,
    0,
    0,
    0,
    0,
  ],
  [PieceL]: [
    0,
    0,
    0,
    0,
    0,
    PieceL,
    0,
    0,
    0,
    PieceL,
    0,
    0,
    0,
    PieceL,
    PieceL,
    0,
  ],
  [PieceJ]: [
    0,
    0,
    0,
    0,
    0,
    0,
    PieceJ,
    0,
    0,
    0,
    PieceJ,
    0,
    0,
    PieceJ,
    PieceJ,
    0,
  ],
  [PieceS]: [
    0,
    0,
    0,
    0,
    0,
    PieceS,
    PieceS,
    0,
    PieceS,
    PieceS,
    0,
    0,
    0,
    0,
    0,
    0,
  ],
  [PieceT]: [
    0,
    0,
    0,
    0,
    0,
    PieceT,
    0,
    0,
    PieceT,
    PieceT,
    PieceT,
    0,
    0,
    0,
    0,
    0,
  ],
  [PieceZ]: [
    0,
    0,
    0,
    0,
    PieceZ,
    PieceZ,
    0,
    0,
    0,
    PieceZ,
    PieceZ,
    0,
    0,
    0,
    0,
    0,
  ],
};

export default class Game extends EventEmitter<GameEventType> {
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

  private readonly nextPieceDisplay: HTMLCanvasElement;

  private readonly nextPieceGraphics: PIXI.Graphics;

  private readonly nextPieceRenderer: PIXI.AbstractRenderer;

  private readonly holdingPieceDisplay: HTMLCanvasElement;

  private readonly holdingPieceGraphics: PIXI.Graphics;

  private readonly holdingPieceRenderer: PIXI.AbstractRenderer;

  constructor(
    view: HTMLCanvasElement,
    nextPieceDisplay: HTMLCanvasElement,
    holdingPieceDisplay: HTMLCanvasElement,
    blockSize: number,
  ) {
    super();

    this.app = new PIXI.Application({
      view,
      width: DEFAULT_BLOCKS_WIDTH * blockSize,
      height: DEFAULT_BLOCKS_HEIGHT * blockSize,
      backgroundColor: 0x000000,
      autoStart: false,
    });

    this.nextPieceDisplay = nextPieceDisplay;
    this.nextPieceGraphics = new PIXI.Graphics();
    this.nextPieceRenderer = PIXI.autoDetectRenderer({
      view: this.nextPieceDisplay,
      width: 20 + 15 * 4,
      height: 20 + 15 * 4,
    });

    this.holdingPieceDisplay = holdingPieceDisplay;
    this.holdingPieceGraphics = new PIXI.Graphics();
    this.holdingPieceRenderer = PIXI.autoDetectRenderer({
      view: this.holdingPieceDisplay,
      width: 20 + 15 * 4,
      height: 20 + 15 * 4,
    });

    console.debug('new pixi instance');

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

    this.addColor('I', 0x0caee8);
    this.addColor('O', 0xf2f200);
    this.addColor('L', 0xffce0d);
    this.addColor('J', 0xebaf0c);
    this.addColor('S', 0x0cb14a);
    this.addColor('T', 0xac0ce8);
    this.addColor('Z', 0xe82c0c);
    this.addColor('B', 0x333333);

    this.fieldGraphics.x = 0;
    this.fieldGraphics.y = 0;

    this.fallingPieceGraphics.x = 0;
    this.fallingPieceGraphics.y = 0;

    this.app.stage.addChild(this.fieldGraphics, this.fallingPieceGraphics);
  }

  public destroy(): void {
    console.debug('destroying pixi instance');

    this.app.stop();

    this.app.destroy(false, {
      baseTexture: true,
      children: true,
      texture: true,
    });
  }

  public setScore(s: number): void {
    this.emit(GAME_EVENT_UPDATE_SCORE, s);
  }

  public setNextFallingPieceType(pieceType: PieceType): void {
    this.nextPieceGraphics.clear();

    for (let x = 0; x < 4; ++x) {
      for (let y = 0; y < 4; ++y) {
        // todo: method for rendering blocks/pieces
        const blockData = pieceData[pieceType][y * 4 + x];

        if (blockData) {
          this.nextPieceGraphics.beginFill(this.getColor(blockData));
          this.nextPieceGraphics.drawRect(x * 15 + 10, y * 15 + 10, 15, 15);
        }
      }
    }

    this.nextPieceRenderer.render(this.nextPieceGraphics);
  }

  public setHoldingPieceType(pieceType: PieceType | null): void {
    this.holdingPieceGraphics.clear();

    if (pieceType !== null) {
      for (let x = 0; x < 4; ++x) {
        for (let y = 0; y < 4; ++y) {
          const blockData = pieceData[pieceType][y * 4 + x];

          if (blockData) {
            this.holdingPieceGraphics.beginFill(this.getColor(blockData));
            this.holdingPieceGraphics.drawRect(
              x * 15 + 10,
              y * 15 + 10,
              15,
              15,
            );
          }
        }
      }
    }

    this.holdingPieceRenderer.render(this.holdingPieceGraphics);
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

  public start() {
    return this.app.start();
  }
}

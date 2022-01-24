import * as PIXI from 'pixi.js';
import EventEmitter from 'eventemitter3';
import {
  getPieceDataXY,
  PieceBedrock,
  PieceI,
  PieceJ,
  PieceL,
  PieceO,
  PieceS,
  PieceT,
  PieceZ,
} from './PieceTable';

// todo: refactor

const DEFAULT_BLOCKS_WIDTH = 10;
const DEFAULT_BLOCKS_HEIGHT = 20;

export const GAME_EVENT_UPDATE_SCORE = 'update_score';

type GameEventType = typeof GAME_EVENT_UPDATE_SCORE;

// todo: add piece width & height to display them centered

export default class Game extends EventEmitter<GameEventType> {
  public readonly app: PIXI.Application;

  private readonly blockSize: number;

  private fieldData: Uint8Array;

  private fieldWidth: number;

  private fieldHeight: number;

  private readonly fieldGraphics: PIXI.Graphics;

  private readonly fallingPieceGraphics: PIXI.Graphics;

  private fallingPieceName: number | null;

  private fallingPieceRotation: number;

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

    this.fallingPieceName = null;
    this.fallingPieceRotation = -1;

    this.colorMap = {};

    this.addColor(PieceI, 0x0caee8);
    this.addColor(PieceO, 0xf2f200);
    this.addColor(PieceL, 0xffce0d);
    this.addColor(PieceJ, 0xebaf0c);
    this.addColor(PieceS, 0x0cb14a);
    this.addColor(PieceT, 0xac0ce8);
    this.addColor(PieceZ, 0xe82c0c);
    this.addColor(PieceBedrock, 0x333333);

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

  public setScore(s: number, l: number): void {
    this.emit(GAME_EVENT_UPDATE_SCORE, s, l);
  }

  public setNextPiece(pieceName: number): void {
    this.nextPieceGraphics.clear();

    for (let x = 0; x < 4; ++x) {
      for (let y = 0; y < 4; ++y) {
        // todo: method for rendering blocks/pieces
        const blockData = getPieceDataXY(pieceName, 0, x, y);

        if (blockData) {
          this.nextPieceGraphics.beginFill(this.getColor(blockData));
          this.nextPieceGraphics.drawRect(x * 15 + 10, y * 15 + 10, 15, 15);
        }
      }
    }

    this.nextPieceRenderer.render(this.nextPieceGraphics);
  }

  public setHoldPiece(pieceName: number | null): void {
    this.holdingPieceGraphics.clear();

    if (pieceName !== null) {
      for (let x = 0; x < 4; ++x) {
        for (let y = 0; y < 4; ++y) {
          const blockData = getPieceDataXY(pieceName, 0, x, y);

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

  private addColor(pieceName: number, color: number) {
    this.colorMap[pieceName] = color;
  }

  private getColor(code: number): number {
    return this.colorMap[code] === undefined ? 0xff00ff : this.colorMap[code];
  }

  private updateFallingPieceGraphics(): void {
    if (this.fallingPieceName === null) {
      return;
    }

    this.fallingPieceGraphics.clear();

    for (let x = 0; x < 4; ++x) {
      for (let y = 0; y < 4; ++y) {
        const blockData = getPieceDataXY(
          this.fallingPieceName,
          this.fallingPieceRotation,
          x,
          y,
        );

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

  public setFallingPiece(
    pieceName: number,
    pieceRotation: number,
    x: number,
    y: number,
  ): void {
    this.fallingPieceGraphics.x = x * this.blockSize;
    this.fallingPieceGraphics.y = y * this.blockSize;

    if (
      pieceName !== this.fallingPieceName ||
      pieceRotation !== this.fallingPieceRotation
    ) {
      this.fallingPieceName = pieceName;
      this.fallingPieceRotation = pieceRotation;

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

  public setField(width: number, height: number, data: number[]): void {
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

import * as PIXI from 'pixi.js';
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
} from '../piece/PieceTable';
import GameSettings from './GameSettings';
import ColorMap from '../piece/color/ColorMap';
import SidePieceGraphics from '../graphics/SidePieceGraphics';

// todo: refactor

const DEFAULT_BLOCKS_WIDTH = 10;
const DEFAULT_BLOCKS_HEIGHT = 20;

// todo: add piece width & height to display them centered

export default class Game {
  public readonly app: PIXI.Application;

  private readonly blockSize: number;

  private fieldData: Uint8Array;

  private fieldWidth: number;

  private fieldHeight: number;

  private readonly fieldGraphics: PIXI.Graphics;

  private readonly fallingPieceGraphics: PIXI.Graphics;

  private fallingPieceName: number | null;

  private fallingPieceRotation: number;

  private readonly colorMap: ColorMap;

  private readonly nextPieceGraphics: SidePieceGraphics;

  private readonly holdingPieceGraphics: SidePieceGraphics;

  constructor(settings: GameSettings) {
    this.app = new PIXI.Application({
      view: settings.view,
      width: DEFAULT_BLOCKS_WIDTH * settings.blockSize,
      height: DEFAULT_BLOCKS_HEIGHT * settings.blockSize,
      backgroundColor: 0x000000,
      autoStart: false,
    });

    this.colorMap = new ColorMap();

    this.colorMap.add(PieceI, 0x0caee8);
    this.colorMap.add(PieceO, 0xf2f200);
    this.colorMap.add(PieceL, 0xffce0d);
    this.colorMap.add(PieceJ, 0xebaf0c);
    this.colorMap.add(PieceS, 0x0cb14a);
    this.colorMap.add(PieceT, 0xac0ce8);
    this.colorMap.add(PieceZ, 0xe82c0c);
    this.colorMap.add(PieceBedrock, 0x333333);

    this.nextPieceGraphics = new SidePieceGraphics(
      settings.nextPieceView,
      this.colorMap,
    );
    this.holdingPieceGraphics = new SidePieceGraphics(
      settings.holdingPieceView,
      this.colorMap,
    );

    console.debug('new pixi instance');

    this.blockSize = settings.blockSize;

    this.fieldData = new Uint8Array(0);
    this.fieldWidth = DEFAULT_BLOCKS_WIDTH;
    this.fieldHeight = DEFAULT_BLOCKS_HEIGHT;

    this.fieldGraphics = new PIXI.Graphics();
    this.fallingPieceGraphics = new PIXI.Graphics();

    this.fallingPieceName = null;
    this.fallingPieceRotation = -1;

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

  public setNextPiece(pieceName: number): void {
    this.nextPieceGraphics.setPiece(pieceName, 0);
  }

  public setHoldPiece(pieceName: number | null): void {
    this.holdingPieceGraphics.setPiece(pieceName, 0);
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
          this.fallingPieceGraphics.beginFill(
            this.colorMap.getColor(blockData),
          );
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
          this.fieldGraphics.beginFill(this.colorMap.getColor(blockData));
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

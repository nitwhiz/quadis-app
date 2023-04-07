import DOMLinkedContainer from '../common/DOMLinkedContainer';
import { PieceContainer } from '../piece/PieceContainer';
import {
  BLOCK_SIZE_MAIN_FIELD,
  BLOCK_SIZE_OPPONENT_FIELD,
  getPieceDataXY,
  Piece,
} from '../piece/Piece';
import { codec64 } from './codec/Codec64';
import DevDataCollector from '../../console/DevDataCollector';
import { RenderTexture, Texture } from '@pixi/core';
import BlockTextureFactory, {
  BlockTextureRegistry,
} from '../piece/BlockTextureFactory';
import GameHost from '../game/GameHost';
import { Sprite } from '@pixi/sprite';

export default class FieldContainer extends DOMLinkedContainer {
  private static blockTextureRegistry: BlockTextureRegistry = {};

  public static DEFAULT_FIELD_HEIGHT = 20;

  public static DEFAULT_FIELD_WIDTH = 10;

  public readonly blockSize: number;

  private fieldData: Uint8Array;

  private fieldWidth: number;

  private fieldHeight: number;

  private readonly fallingPieceContainer: PieceContainer;

  private readonly blockTextures: Record<Piece, Texture>;

  private readonly fieldTexture: RenderTexture;

  public constructor(domElement: HTMLElement, blockSize: number) {
    super(domElement);

    if (FieldContainer.blockTextureRegistry[blockSize]) {
      this.blockTextures = FieldContainer.blockTextureRegistry[blockSize];
    } else {
      throw new Error(`no block sprites for block size ${blockSize}`);
    }

    this.blockSize = blockSize;

    this.fieldWidth = FieldContainer.DEFAULT_FIELD_WIDTH;
    this.fieldHeight = FieldContainer.DEFAULT_FIELD_HEIGHT;

    this.fieldData = new Uint8Array(this.fieldWidth * this.fieldHeight);

    this.fallingPieceContainer = new PieceContainer(this.blockSize);

    this.fallingPieceContainer.x = 0;
    this.fallingPieceContainer.y = 0;

    this.fieldTexture = RenderTexture.create({
      width: this.fieldWidth * this.blockSize,
      height: this.fieldHeight * this.blockSize,
    });

    const fieldSprite = new Sprite(this.fieldTexture);

    fieldSprite.position.set(0, 0);

    this.addChild(fieldSprite, this.fallingPieceContainer);

    this.setDOMDimensions(
      this.blockSize * this.fieldWidth,
      this.blockSize * this.fieldHeight,
    );

    this.update(true);
  }

  public static bakeBlockTextures(blockTexture: Texture): void {
    const blockTextureFactory = new BlockTextureFactory(
      blockTexture,
      GameHost.getInstance().getRenderer(),
    );

    blockTextureFactory.bake(BLOCK_SIZE_MAIN_FIELD);
    blockTextureFactory.bake(BLOCK_SIZE_OPPONENT_FIELD);

    FieldContainer.blockTextureRegistry = blockTextureFactory.getRegistry();
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
    if (this.fieldWidth !== width || this.fieldHeight !== height) {
      this.fieldWidth = width;
      this.fieldHeight = height;

      this.fieldData = new Uint8Array(data);

      this.setDOMDimensions(
        this.blockSize * this.fieldWidth,
        this.blockSize * this.fieldHeight,
      );

      this.update(true);
    } else {
      this.fieldData.set(data);

      DevDataCollector.setCurrentField(
        Array.from(
          codec64
            .encode(this.fieldData, this.fieldWidth, this.fieldHeight)
            .values(),
        ).join(' '),
      );
    }

    this.updateFieldRenderTexture();
  }

  private clearFieldRenderTexture(): void {
    // todo: there seems no real way to clear RenderTextures ...
    const blockSprite = new Sprite(this.blockTextures[Piece.B]);

    blockSprite.position.set(-this.blockSize, -this.blockSize);

    GameHost.getInstance().getRenderer().render(blockSprite, {
      renderTexture: this.fieldTexture,
      clear: true,
    });

    blockSprite.destroy({
      texture: false,
      baseTexture: true,
      children: true,
    });
  }

  private updateFieldRenderTexture(): void {
    this.clearFieldRenderTexture();

    for (let x = 0; x < this.fieldWidth; ++x) {
      for (let y = 0; y < this.fieldHeight; ++y) {
        const blockData = this.fieldData[y * this.fieldWidth + x];

        if (blockData) {
          const blockSprite = new Sprite(
            this.blockTextures[blockData as Piece],
          );

          blockSprite.position.set(x * this.blockSize, y * this.blockSize);

          GameHost.getInstance().getRenderer().render(blockSprite, {
            renderTexture: this.fieldTexture,
            clear: false,
          });

          blockSprite.destroy({
            texture: false,
            baseTexture: true,
            children: true,
          });
        }
      }
    }
  }

  public reset(): void {
    this.fallingPieceContainer.piece = null;

    this.fieldData.fill(0);

    this.updateFieldRenderTexture();
  }
}

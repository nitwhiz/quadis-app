import { RenderTexture, Texture } from '@pixi/core';
import { getFaceCount, getPieceDataXY, Piece } from './Piece';
import { Sprite } from '@pixi/sprite';
import { IRenderer } from '@pixi/core/lib/IRenderer';
import ColorMap from './color/ColorMap';

export interface PieceSpritesRegistry {
  [blockSize: number]: Record<Piece, Sprite[]>;
}

export default class PieceSpriteFactory {
  private readonly registry: PieceSpritesRegistry = {};

  constructor(
    private readonly blockTexture: Texture,
    private readonly renderer: IRenderer,
  ) {}

  public bake(blockSize: number): void {
    this.registry[blockSize] = {
      [Piece.I]: this.renderPieceFaces(Piece.I, blockSize),
      [Piece.O]: this.renderPieceFaces(Piece.O, blockSize),
      [Piece.L]: this.renderPieceFaces(Piece.L, blockSize),
      [Piece.J]: this.renderPieceFaces(Piece.J, blockSize),
      [Piece.S]: this.renderPieceFaces(Piece.S, blockSize),
      [Piece.T]: this.renderPieceFaces(Piece.T, blockSize),
      [Piece.Z]: this.renderPieceFaces(Piece.Z, blockSize),
      [Piece.B]: this.renderPieceFaces(Piece.B, blockSize),
    };
  }

  public getRegistry(): PieceSpritesRegistry {
    return this.registry;
  }

  private renderPieceFaces(piece: Piece, blockSize: number): Sprite[] {
    const scale = blockSize / this.blockTexture.width;

    const sprites: Sprite[] = [];

    const faceCount = getFaceCount(piece);
    const blockSprite = new Sprite(this.blockTexture);

    blockSprite.scale.set(scale);

    blockSprite.tint = ColorMap.CLASSIC.getColor(piece);

    for (let rot = 0; rot < faceCount; rot++) {
      const renderTexture = RenderTexture.create({
        width: 4 * blockSize,
        height: 4 * blockSize,
      });

      for (let x = 0; x < 4; ++x) {
        for (let y = 0; y < 4; ++y) {
          const blockData = getPieceDataXY(piece, rot, x, y);

          if (blockData) {
            blockSprite.position.set(x * blockSize, y * blockSize);

            this.renderer.render(blockSprite, {
              renderTexture,
              clear: false,
            });
          }
        }
      }

      sprites.push(Sprite.from(renderTexture));
    }

    blockSprite.destroy({
      texture: false,
      baseTexture: false,
      children: true,
    });

    return sprites;
  }
}

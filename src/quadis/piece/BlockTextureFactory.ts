import { getFaceCount, Piece } from './Piece';
import { Sprite } from '@pixi/sprite';
import { RenderTexture, Texture } from '@pixi/core';
import { IRenderer } from '@pixi/core/lib/IRenderer';
import ColorMap from './color/ColorMap';

export interface BlockTextureRegistry {
  [blockSize: number]: Record<Piece, Texture>;
}

export default class BlockTextureFactory {
  private readonly registry: BlockTextureRegistry = {};

  constructor(
    private readonly blockTexture: Texture,
    private readonly renderer: IRenderer,
  ) {}

  public bake(blockSize: number): void {
    this.registry[blockSize] = {
      [Piece.I]: this.renderBlock(Piece.I, blockSize),
      [Piece.O]: this.renderBlock(Piece.O, blockSize),
      [Piece.L]: this.renderBlock(Piece.L, blockSize),
      [Piece.J]: this.renderBlock(Piece.J, blockSize),
      [Piece.S]: this.renderBlock(Piece.S, blockSize),
      [Piece.T]: this.renderBlock(Piece.T, blockSize),
      [Piece.Z]: this.renderBlock(Piece.Z, blockSize),
      [Piece.B]: this.renderBlock(Piece.B, blockSize),
    };
  }

  public getRegistry(): BlockTextureRegistry {
    return this.registry;
  }

  private renderBlock(piece: Piece, blockSize: number): Texture {
    const scale = blockSize / this.blockTexture.width;

    const blockSprite = new Sprite(this.blockTexture);

    blockSprite.scale.set(scale);
    blockSprite.tint = ColorMap.CLASSIC.getColor(piece);

    const renderTexture = RenderTexture.create({
      width: blockSize,
      height: blockSize,
    });

    this.renderer.render(blockSprite, { renderTexture });

    blockSprite.destroy({
      texture: false,
      baseTexture: true,
      children: true,
    });

    return renderTexture;
  }
}

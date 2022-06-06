import PieceColorMap from '../container/piece/PieceColorMap';
import { Graphics, Texture } from 'pixi.js';
import { getPieceDataXY, PieceName } from '@bloccs/client';

export default class BlockRenderer {
  constructor(
    public readonly texture: Texture,
    public readonly colorMap: PieceColorMap,
  ) {}

  public renderPiece(
    graphics: Graphics,
    piece: PieceName,
    rotation: number,
  ): void {
    for (let x = 0; x < 4; ++x) {
      for (let y = 0; y < 4; ++y) {
        const block = getPieceDataXY(piece, rotation, x, y);

        if (block !== 0) {
          this.renderSingle(graphics, block, x, y);
        }
      }
    }
  }

  public renderSingle(
    graphics: Graphics,
    block: PieceName,
    x: number,
    y: number,
  ): void {
    graphics
      .beginTextureFill({
        texture: this.texture,
        color: this.colorMap.getColor(block),
      })
      .drawRect(
        x * this.texture.width,
        y * this.texture.height,
        this.texture.width,
        this.texture.height,
      );
  }
}

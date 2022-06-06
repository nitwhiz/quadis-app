import BaseGraphicsContainer from '../BaseGraphicsContainer';
import { Piece } from '@bloccs/client';
import { Text } from 'pixi.js';
import BlockRenderer from '../../render/BlockRenderer';

const backgroundColor = 0x000000;

export default class PieceInfoContainer extends BaseGraphicsContainer<Piece | null> {
  constructor(
    private readonly headline: string,
    protected readonly blockRenderer: BlockRenderer,
    protected readonly blockSize: number,
  ) {
    super(blockRenderer, blockSize);

    const text = new Text(this.headline, {
      fontFamily: 'Press Start 2P',
      fontSize: 14,
      fill: 0xffffff,
    });

    text.position.set(0, 0);

    this.addChild(text);

    this.graphics.position.set(0, 24);
  }

  private drawBackground(width: number, height: number): void {
    this.graphics.clear();

    this.graphics.beginFill(backgroundColor);
    this.graphics.drawRect(0, 0, width, height);
  }

  public update(piece: Piece | null) {
    this.drawBackground(
      4 * this.blockRenderer.texture.width,
      4 * this.blockRenderer.texture.height,
    );

    if (piece) {
      this.blockRenderer.renderPiece(this.graphics, piece.name, 0);
    }
  }
}

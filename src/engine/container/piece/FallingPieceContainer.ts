import BaseGraphicsContainer from '../BaseGraphicsContainer';
import { FallingPiece } from '@bloccs/client';
import { filters } from 'pixi.js';

const colorMatrixFilter = new filters.ColorMatrixFilter();

export default class FallingPieceContainer extends BaseGraphicsContainer<FallingPiece | null> {
  public setGameOver(gameOver: boolean) {
    if (gameOver) {
      this.graphics.filters = [colorMatrixFilter];
      colorMatrixFilter.greyscale(0.5, false);
    } else {
      this.graphics.filters = [];
    }
  }

  public update(fallingPiece: FallingPiece | null) {
    this.graphics.clear();

    if (fallingPiece === null) {
      return;
    }

    this.graphics.position.set(
      fallingPiece.x * this.blockSize,
      fallingPiece.y * this.blockSize,
    );

    if (fallingPiece.piece) {
      this.blockRenderer.renderPiece(
        this.graphics,
        fallingPiece.piece.name,
        fallingPiece.rotation,
      );
    }
  }
}

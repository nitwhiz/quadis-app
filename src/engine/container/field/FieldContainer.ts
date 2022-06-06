import { Field } from '@bloccs/client';
import BaseGraphicsContainer from '../BaseGraphicsContainer';
import { filters } from 'pixi.js';

const backgroundColor = 0x000000;

const colorMatrixFilter = new filters.ColorMatrixFilter();

export default class FieldContainer extends BaseGraphicsContainer<Field> {
  public setGameOver(gameOver: boolean) {
    if (gameOver) {
      this.graphics.filters = [colorMatrixFilter];
      colorMatrixFilter.greyscale(0.5, false);
    } else {
      this.graphics.filters = [];
    }
  }

  private drawBackground(width: number, height: number): void {
    this.graphics.clear();

    this.graphics.beginFill(backgroundColor);
    this.graphics.drawRect(0, 0, width, height);
  }

  public update(field: Field) {
    const arr = field.getFieldArray();

    this.drawBackground(
      arr.width * this.blockRenderer.texture.width,
      arr.height * this.blockRenderer.texture.height,
    );

    for (let x = 0; x < arr.width; ++x) {
      for (let y = 0; y < arr.height; ++y) {
        const block = arr.data.getUint8(x + y * arr.width);

        if (block !== 0) {
          this.blockRenderer.renderSingle(this.graphics, block, x, y);
        }
      }
    }
  }
}

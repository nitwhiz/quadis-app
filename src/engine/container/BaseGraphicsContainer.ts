import { Container, Graphics } from 'pixi.js';
import BlockRenderer from '../render/BlockRenderer';

export default class BaseGraphicsContainer<
  DataType = undefined,
> extends Container {
  protected readonly graphics: Graphics;

  constructor(
    protected readonly blockRenderer: BlockRenderer,
    protected readonly blockSize: number,
  ) {
    super();

    this.graphics = new Graphics();
    this.graphics.scale.set(this.blockSize / this.blockRenderer.texture.width);

    this.addChild(this.graphics);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(data: DataType): void {
    throw new Error('update not implemented');
  }
}

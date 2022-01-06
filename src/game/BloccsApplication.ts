import * as PIXI from 'pixi.js';
import { Field } from './RoomService';

// todo: refactor service & application

export default class BloccsApplication extends PIXI.Application {
  private colorMap: Record<number, number> = {};

  private field: Field;

  private readonly graphics: PIXI.Graphics;

  constructor(view: HTMLCanvasElement) {
    super({
      view,
      width: 200,
      height: 400,
      backgroundColor: 0x330033,
      autoStart: false,
      powerPreference: 'low-power',
    });

    this.field = {
      width: 10,
      height: 20,
      data: new Array(10 * 20).fill(0),
    };

    this.addColor('I', 0x8eaddb);
    this.addColor('O', 0xfdd1b4);
    this.addColor('L', 0xe3efc9);
    this.addColor('J', 0xabcdd9);
    this.addColor('S', 0xe4efc9);
    this.addColor('T', 0xf2929d);
    this.addColor('Z', 0xc18bbd);
    this.addColor('X', 0x333333);

    this.graphics = new PIXI.Graphics();

    this.stage.addChild(this.graphics);

    this.ticker.add(() => {
      this.tick();
    });
  }

  private addColor(code: string | number, color: number) {
    this.colorMap[typeof code === 'number' ? code : code.charCodeAt(0)] = color;
  }

  private getColor(code: string | number): number {
    const mapContent =
      this.colorMap[typeof code === 'number' ? code : code.charCodeAt(0)];

    return mapContent === undefined ? 0xff00ff : mapContent;
  }

  public setField(field: Field): void {
    this.field = field;
  }

  private tick() {
    this.graphics.clear();

    for (let x = 0; x < 10; ++x) {
      for (let y = 0; y < 20; ++y) {
        const data = this.field.data[y * this.field.width + x];

        if (data) {
          this.graphics.beginFill(this.getColor(data));

          if (data) {
            this.graphics.drawRect(x * 20, y * 20, 20, 20);
          }
        }
      }
    }
  }
}

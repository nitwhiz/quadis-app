import { Container, Text } from 'pixi.js';

export default class ButtonContainer extends Container {
  constructor(label: string, callback: () => void) {
    super();

    const text = new Text(label, {
      fontFamily: 'Press Start 2P',
      fontSize: 14,
      fill: 0xffffff,
    });

    text.interactive = true;

    text.on('click', () => {
      callback();
    });

    this.addChild(text);
  }
}

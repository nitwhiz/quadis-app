import { InputAdapter } from './InputAdapter';
import { Command } from '../../command/Command';

const enum KeyboardInputKey {
  ARROW_LEFT = 'ArrowLeft',
  ARROW_RIGHT = 'ArrowRight',
  ARROW_UP = 'ArrowUp',
  ARROW_DOWN = 'ArrowDown',
  SHIFT = 'Shift',
  SPACE = ' ',
  CONTROL = 'Control',
}

export default class KeyboardInputAdapter extends InputAdapter<KeyboardInputKey> {
  private boundEventListenerDown = this.eventListenerDown.bind(this);
  private boundEventListenerUp = this.eventListenerUp.bind(this);

  public init(): void {
    document.addEventListener('keydown', () => {
      this.requestUsage();
    });

    this.setInputMapping({
      [KeyboardInputKey.ARROW_LEFT]: Command.LEFT,
      [KeyboardInputKey.ARROW_RIGHT]: Command.RIGHT,
      [KeyboardInputKey.ARROW_UP]: Command.ROTATE,
      [KeyboardInputKey.ARROW_DOWN]: Command.DOWN,
      [KeyboardInputKey.SHIFT]: Command.HOLD,
      [KeyboardInputKey.SPACE]: Command.HARD_LOCK,
      [KeyboardInputKey.CONTROL]: Command.ITEM,
    });
  }

  private eventListenerDown(event: KeyboardEvent): void {
    this.tryTrigger(event.key as KeyboardInputKey);
  }

  private eventListenerUp(event: KeyboardEvent): void {
    this.unsetTrigger(event.key as KeyboardInputKey);
  }

  public register(): void {
    super.register();

    document.addEventListener('keydown', this.boundEventListenerDown);
    document.addEventListener('keyup', this.boundEventListenerUp);

    this.start();
  }

  public unregister(): void {
    super.unregister();

    this.stop();

    document.removeEventListener('keydown', this.boundEventListenerDown);
    document.removeEventListener('keyup', this.boundEventListenerUp);
  }
}

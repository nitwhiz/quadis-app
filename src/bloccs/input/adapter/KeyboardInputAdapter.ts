import { InputAdapter } from './InputAdapter';
import {
  CMD_DOWN,
  CMD_HARD_LOCK,
  CMD_HOLD,
  CMD_LEFT,
  CMD_RIGHT,
  CMD_ROTATE,
  Command,
} from '../../command/Command';

const enum InputKey {
  ARROW_LEFT = 'ArrowLeft',
  ARROW_RIGHT = 'ArrowRight',
  ARROW_UP = 'ArrowUp',
  ARROW_DOWN = 'ArrowDown',
  SHIFT = 'Shift',
  SPACE = ' ',
}

const inputMapping: Record<InputKey, Command> = {
  [InputKey.ARROW_LEFT]: CMD_LEFT,
  [InputKey.ARROW_RIGHT]: CMD_RIGHT,
  [InputKey.ARROW_UP]: CMD_ROTATE,
  [InputKey.ARROW_DOWN]: CMD_DOWN,
  [InputKey.SHIFT]: CMD_HOLD,
  [InputKey.SPACE]: CMD_HARD_LOCK,
};

export default class KeyboardInputAdapter extends InputAdapter {
  private boundEventListenerDown = this.eventListenerDown.bind(this);
  private boundEventListenerUp = this.eventListenerUp.bind(this);

  private lastTriggers!: Record<InputKey, number | null>;

  private nextInputCycle = -1;

  public init(): void {
    document.addEventListener('keydown', () => {
      this.requestUsage();
    });

    this.lastTriggers = {
      [InputKey.ARROW_LEFT]: null,
      [InputKey.ARROW_RIGHT]: null,
      [InputKey.ARROW_UP]: null,
      [InputKey.ARROW_DOWN]: null,
      [InputKey.SHIFT]: null,
      [InputKey.SPACE]: null,
    };

    this.inputCycle();
  }

  private inputCycle(): void {
    this.nextInputCycle = window.setTimeout(() => {
      const now = Date.now();

      for (const k of Object.keys(this.lastTriggers) as InputKey[]) {
        if (
          this.lastTriggers[k] !== null &&
          this.lastTriggers[k] !== undefined
        ) {
          if (now - (this.lastTriggers[k] || now) > 180) {
            this.triggerCommand(k);
          }
        }
      }

      this.inputCycle();
    }, 10);
  }

  private triggerCommand(k: InputKey) {
    this.requestCommand(inputMapping[k]);
    this.lastTriggers[k] = Date.now();
  }

  private eventListenerDown(event: KeyboardEvent): void {
    if (this.lastTriggers[event.key as InputKey] === null) {
      this.triggerCommand(event.key as InputKey);
    }
  }

  private eventListenerUp(event: KeyboardEvent): void {
    if (this.lastTriggers[event.key as InputKey] !== undefined) {
      this.lastTriggers[event.key as InputKey] = null;
    }
  }

  public register(): void {
    document.addEventListener('keydown', this.boundEventListenerDown);
    document.addEventListener('keyup', this.boundEventListenerUp);
  }

  public unregister(): void {
    window.clearTimeout(this.nextInputCycle);

    document.removeEventListener('keydown', this.boundEventListenerDown);
    document.removeEventListener('keyup', this.boundEventListenerUp);
  }
}

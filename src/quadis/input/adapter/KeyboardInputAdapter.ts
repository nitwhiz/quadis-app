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

const enum KeyboardInputKey {
  ARROW_LEFT = 'ArrowLeft',
  ARROW_RIGHT = 'ArrowRight',
  ARROW_UP = 'ArrowUp',
  ARROW_DOWN = 'ArrowDown',
  SHIFT = 'Shift',
  SPACE = ' ',
}

const inputMapping: Partial<Record<KeyboardInputKey, Command>> = {
  [KeyboardInputKey.ARROW_LEFT]: CMD_LEFT,
  [KeyboardInputKey.ARROW_RIGHT]: CMD_RIGHT,
  [KeyboardInputKey.ARROW_UP]: CMD_ROTATE,
  [KeyboardInputKey.ARROW_DOWN]: CMD_DOWN,
  [KeyboardInputKey.SHIFT]: CMD_HOLD,
  [KeyboardInputKey.SPACE]: CMD_HARD_LOCK,
};

export default class KeyboardInputAdapter extends InputAdapter {
  private boundEventListenerDown = this.eventListenerDown.bind(this);
  private boundEventListenerUp = this.eventListenerUp.bind(this);

  private lastTriggers: Partial<Record<KeyboardInputKey, number | null>> = {};

  private nextInputCycle = -1;

  private pumpKeys: KeyboardInputKey[] = [KeyboardInputKey.SPACE];

  private pumpKeyLocks: Partial<Record<KeyboardInputKey, boolean>> = {};

  public init(): void {
    document.addEventListener('keydown', () => {
      this.requestUsage();
    });

    this.lastTriggers = {
      [KeyboardInputKey.ARROW_LEFT]: null,
      [KeyboardInputKey.ARROW_RIGHT]: null,
      [KeyboardInputKey.ARROW_UP]: null,
      [KeyboardInputKey.ARROW_DOWN]: null,
      [KeyboardInputKey.SHIFT]: null,
      [KeyboardInputKey.SPACE]: null,
    };
  }

  private inputCycle(): void {
    this.nextInputCycle = window.setTimeout(() => {
      const now = Date.now();

      for (const k of Object.keys(this.lastTriggers) as KeyboardInputKey[]) {
        if (
          this.lastTriggers[k] !== null &&
          this.lastTriggers[k] !== undefined
        ) {
          const isPumpKey = this.pumpKeys.includes(k);
          const isLockedPumpKey = Boolean(this.pumpKeyLocks[k]);

          if (isPumpKey && isLockedPumpKey) {
            continue;
          }

          if (isPumpKey) {
            this.pumpKeyLocks[k] = true;
          }

          if (now - (this.lastTriggers[k] || now) > 180) {
            this.triggerCommand(k);
          }
        }
      }

      this.inputCycle();
    }, 10);
  }

  private triggerCommand(k: KeyboardInputKey) {
    const cmd = inputMapping[k];

    if (cmd) {
      this.requestCommand(cmd);
    }

    this.lastTriggers[k] = Date.now();
  }

  private eventListenerDown(event: KeyboardEvent): void {
    if (this.lastTriggers[event.key as KeyboardInputKey] === null) {
      this.triggerCommand(event.key as KeyboardInputKey);
    }
  }

  private eventListenerUp(event: KeyboardEvent): void {
    if (this.lastTriggers[event.key as KeyboardInputKey] !== undefined) {
      this.lastTriggers[event.key as KeyboardInputKey] = null;

      if (this.pumpKeys.includes(event.key as KeyboardInputKey)) {
        delete this.pumpKeyLocks[event.key as KeyboardInputKey];
      }
    }
  }

  public register(): void {
    document.addEventListener('keydown', this.boundEventListenerDown);
    document.addEventListener('keyup', this.boundEventListenerUp);

    this.inputCycle();
  }

  public unregister(): void {
    window.clearTimeout(this.nextInputCycle);
    this.nextInputCycle = -1;

    document.removeEventListener('keydown', this.boundEventListenerDown);
    document.removeEventListener('keyup', this.boundEventListenerUp);
  }
}

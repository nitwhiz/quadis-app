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

const enum GamepadInputKey {
  STANDARD_BUTTON_BOTTOM_RIGHT_CLUSTER = '0',
  STANDARD_BUTTON_RIGHT_RIGHT_CLUSTER = '1',
  STANDARD_BUTTON_LEFT_RIGHT_CLUSTER = '2',
  STANDARD_BUTTON_TOP_RIGHT_CLUSTER = '3',
  STANDARD_BUTTON_TOP_LEFT_FRONT = '4',
  STANDARD_BUTTON_TOP_RIGHT_FRONT = '5',
  STANDARD_BUTTON_BOTTOM_LEFT_FRONT = '6',
  STANDARD_BUTTON_BOTTOM_RIGHT_FRONT = '7',
  STANDARD_BUTTON_LEFT_CENTER_CLUSTER = '8',
  STANDARD_BUTTON_RIGHT_CENTER_CLUSTER = '9',
  STANDARD_BUTTON_LEFT_STICK_PRESSED = '10',
  STANDARD_BUTTON_RIGHT_STICK_PRESSED = '11',
  STANDARD_BUTTON_TOP_LEFT_CLUSTER = '12',
  STANDARD_BUTTON_BOTTOM_LEFT_CLUSTER = '13',
  STANDARD_BUTTON_LEFT_LEFT_CLUSTER = '14',
  STANDARD_BUTTON_RIGHT_LEFT_CLUSTER = '15',
  STANDARD_BUTTON_CENTER_CENTER_CLUSTER = '16',
}

const inputMapping: Partial<Record<GamepadInputKey, Command>> = {
  [GamepadInputKey.STANDARD_BUTTON_LEFT_LEFT_CLUSTER]: CMD_LEFT,
  [GamepadInputKey.STANDARD_BUTTON_RIGHT_LEFT_CLUSTER]: CMD_RIGHT,
  [GamepadInputKey.STANDARD_BUTTON_BOTTOM_RIGHT_CLUSTER]: CMD_ROTATE,
  [GamepadInputKey.STANDARD_BUTTON_BOTTOM_LEFT_CLUSTER]: CMD_DOWN,
  [GamepadInputKey.STANDARD_BUTTON_TOP_RIGHT_CLUSTER]: CMD_HOLD,
  [GamepadInputKey.STANDARD_BUTTON_RIGHT_RIGHT_CLUSTER]: CMD_HARD_LOCK,
};

export default class GamepadInputAdapter extends InputAdapter {
  private gamepadIndex = 0;

  private isRegistered = false;

  private lastTriggers: Partial<Record<GamepadInputKey, number | null>> = {};

  private nextInputCycle = -1;

  private pumpKeys: GamepadInputKey[] = [
    GamepadInputKey.STANDARD_BUTTON_RIGHT_RIGHT_CLUSTER,
  ];

  private pumpKeyLocks: Partial<Record<GamepadInputKey, boolean>> = {};

  public init(): void {
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadIndex = e.gamepad.index;
      this.requestUsage();
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (e.gamepad.index === this.gamepadIndex) {
        window.clearTimeout(this.nextInputCycle);

        this.gamepadIndex = -1;
        this.nextInputCycle = -1;
        this.isRegistered = false;
      }
    });

    this.lastTriggers = {
      [GamepadInputKey.STANDARD_BUTTON_LEFT_LEFT_CLUSTER]: null,
      [GamepadInputKey.STANDARD_BUTTON_RIGHT_LEFT_CLUSTER]: null,
      [GamepadInputKey.STANDARD_BUTTON_BOTTOM_RIGHT_CLUSTER]: null,
      [GamepadInputKey.STANDARD_BUTTON_BOTTOM_LEFT_CLUSTER]: null,
      [GamepadInputKey.STANDARD_BUTTON_TOP_RIGHT_CLUSTER]: null,
      [GamepadInputKey.STANDARD_BUTTON_RIGHT_RIGHT_CLUSTER]: null,
    };
  }

  private updateKeyStates(): void {
    const gamepad = navigator.getGamepads()[this.gamepadIndex];

    if (!gamepad) {
      return;
    }

    for (const k of Object.keys(this.lastTriggers) as GamepadInputKey[]) {
      const gpButton = parseInt(k, 10);

      if (!gamepad.buttons[gpButton].pressed) {
        this.lastTriggers[k] = null;
      } else if (this.lastTriggers[k] === null) {
        this.triggerCommand(k);
      }
    }
  }

  private processKeyStates(): void {
    const now = Date.now();

    for (const k of Object.keys(this.lastTriggers) as GamepadInputKey[]) {
      if (this.lastTriggers[k] !== null && this.lastTriggers[k] !== undefined) {
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
  }

  private inputCycle(): void {
    this.nextInputCycle = window.setTimeout(() => {
      this.updateKeyStates();
      this.processKeyStates();

      this.inputCycle();
    }, 10);
  }

  private triggerCommand(k: GamepadInputKey) {
    const cmd = inputMapping[k];

    if (cmd) {
      this.requestCommand(cmd);
    }

    this.lastTriggers[k] = Date.now();
  }

  public register(): void {
    this.isRegistered = true;

    if (this.nextInputCycle === -1) {
      this.inputCycle();
    }
  }

  public unregister(): void {
    this.isRegistered = false;
  }
}

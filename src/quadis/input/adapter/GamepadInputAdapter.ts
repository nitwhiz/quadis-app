import { InputAdapter } from './InputAdapter';
import {
  CMD_DOWN,
  CMD_HARD_LOCK,
  CMD_LEFT,
  CMD_RIGHT,
  CMD_ROTATE,
} from '../../command/Command';

const STANDARD_BUTTON_BOTTOM_RIGHT_CLUSTER = 0;
const STANDARD_BUTTON_RIGHT_RIGHT_CLUSTER = 1;
const STANDARD_BUTTON_LEFT_RIGHT_CLUSTER = 2;
const STANDARD_BUTTON_TOP_RIGHT_CLUSTER = 3;
const STANDARD_BUTTON_TOP_LEFT_FRONT = 4;
const STANDARD_BUTTON_TOP_RIGHT_FRONT = 5;
const STANDARD_BUTTON_BOTTOM_LEFT_FRONT = 6;
const STANDARD_BUTTON_BOTTOM_RIGHT_FRONT = 7;
const STANDARD_BUTTON_LEFT_CENTER_CLUSTER = 8;
const STANDARD_BUTTON_RIGHT_CENTER_CLUSTER = 9;
const STANDARD_BUTTON_LEFT_STICK_PRESSED = 10;
const STANDARD_BUTTON_RIGHT_STICK_PRESSED = 11;
const STANDARD_BUTTON_TOP_LEFT_CLUSTER = 12;
const STANDARD_BUTTON_BOTTOM_LEFT_CLUSTER = 13;
const STANDARD_BUTTON_LEFT_LEFT_CLUSTER = 14;
const STANDARD_BUTTON_RIGHT_LEFT_CLUSTER = 15;
const STANDARD_BUTTON_CENTER_CENTER_CLUSTER = 16;

export default class GamepadInputAdapter extends InputAdapter {
  private gamepadIndex = 0;

  private sampleFrame = -1;

  private sampleTimeout = -1;

  private isRegistered = false;

  private lastButtonInput = Date.now();

  public init(): void {
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadIndex = e.gamepad.index;
      this.requestUsage();
    });
  }

  private sampleCycle(): void {
    this.sampleFrame = window.requestAnimationFrame(() => {
      const now = Date.now();

      // todo: wonky AF - support is experimental for now
      if (now - this.lastButtonInput > 100) {
        const gamepad = navigator.getGamepads()[this.gamepadIndex];

        // handle non-standard gamepad.mapping?

        if (gamepad?.buttons[STANDARD_BUTTON_BOTTOM_LEFT_CLUSTER]?.pressed) {
          this.requestCommand(CMD_DOWN);
          this.lastButtonInput = now;
        } else if (
          gamepad?.buttons[STANDARD_BUTTON_LEFT_LEFT_CLUSTER]?.pressed
        ) {
          this.requestCommand(CMD_LEFT);
          this.lastButtonInput = now;
        } else if (
          gamepad?.buttons[STANDARD_BUTTON_RIGHT_LEFT_CLUSTER]?.pressed
        ) {
          this.requestCommand(CMD_RIGHT);
          this.lastButtonInput = now;
        } else if (
          gamepad?.buttons[STANDARD_BUTTON_BOTTOM_RIGHT_CLUSTER]?.pressed
        ) {
          this.requestCommand(CMD_HARD_LOCK);
          this.lastButtonInput = now;
        } else if (
          gamepad?.buttons[STANDARD_BUTTON_RIGHT_RIGHT_CLUSTER]?.pressed
        ) {
          this.requestCommand(CMD_ROTATE);
          this.lastButtonInput = now;
        }
      }

      this.sampleCycle();
    });
  }

  public register(): void {
    if (this.isRegistered) {
      return;
    }

    this.isRegistered = true;

    window.cancelAnimationFrame(this.sampleFrame);
    window.clearTimeout(this.sampleTimeout);

    this.sampleCycle();
  }

  public unregister(): void {
    // do not stop gamepad
  }
}

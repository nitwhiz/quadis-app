/**
 * only supports standard controllers, like the Xbox 360 Controller
 */

import { InputAdapter } from './InputAdapter';
import { Command } from '../../command/Command';
import { InputLogger } from '../../../logger/Logger';

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

export default class GamepadInputAdapter extends InputAdapter<GamepadInputKey> {
  private gamepadIndex = 0;

  private lastTimestamp = -1;

  public init(): void {
    window.addEventListener('gamepadconnected', (e) => {
      if (e.gamepad.mapping !== 'standard') {
        InputLogger.warn('this gamepad is not supported!');
        return;
      }

      if (this.gamepadIndex !== -1 && this.gamepadIndex !== e.gamepad.index) {
        this.stop();
      }

      this.gamepadIndex = e.gamepad.index;
      this.requestUsage();
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (e.gamepad.index === this.gamepadIndex) {
        this.stop();

        this.gamepadIndex = -1;
      }
    });

    this.setInputMapping({
      [GamepadInputKey.STANDARD_BUTTON_LEFT_LEFT_CLUSTER]: Command.LEFT,
      [GamepadInputKey.STANDARD_BUTTON_RIGHT_LEFT_CLUSTER]: Command.RIGHT,
      [GamepadInputKey.STANDARD_BUTTON_TOP_LEFT_CLUSTER]: Command.ROTATE,
      [GamepadInputKey.STANDARD_BUTTON_BOTTOM_LEFT_CLUSTER]: Command.DOWN,
      [GamepadInputKey.STANDARD_BUTTON_TOP_RIGHT_CLUSTER]: Command.HOLD,
      [GamepadInputKey.STANDARD_BUTTON_BOTTOM_RIGHT_CLUSTER]: Command.HARD_LOCK,
    });
  }

  protected updateKeyStates(): void {
    const gamepad = navigator.getGamepads()[this.gamepadIndex];

    if (!gamepad) {
      return;
    }

    if (this.lastTimestamp === gamepad.timestamp) {
      return;
    }

    for (const k of this.getMappedInputKeys()) {
      const gpButton = parseInt(k, 10);

      if (!gamepad.buttons[gpButton].pressed) {
        this.unsetTrigger(k);
      } else {
        this.requestUsage();
        this.tryTrigger(k);
      }
    }

    this.lastTimestamp = gamepad.timestamp;
  }

  public register(): void {
    super.register();
    this.start();
  }
}

import { EVENT_INPUT_ADAPTER_INPUT, InputAdapter } from './InputAdapter';
import {
  CMD_DOWN,
  CMD_HARD_LOCK,
  CMD_HOLD,
  CMD_LEFT,
  CMD_RIGHT,
  CMD_ROTATE,
} from '../../command/Command';

export default class KeyboardInputAdapter extends InputAdapter {
  private boundEventListener = this.eventListener.bind(this);

  public init(): void {
    document.addEventListener('keydown', () => {
      this.requestUsage();
    });
  }

  private eventListener(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.requestCommand(CMD_LEFT);
        break;
      case 'ArrowRight':
        this.requestCommand(CMD_RIGHT);
        break;
      case 'ArrowUp':
        this.requestCommand(CMD_ROTATE);
        break;
      case 'ArrowDown':
        this.requestCommand(CMD_DOWN);
        break;
      case 'Shift':
        this.requestCommand(CMD_HOLD);
        break;
      case ' ':
        this.requestCommand(CMD_HARD_LOCK);
        break;
      default:
        break;
    }
  }

  public register(): void {
    document.addEventListener('keydown', this.boundEventListener);
  }

  public unregister(): void {
    document.removeEventListener('keydown', this.boundEventListener);
  }
}

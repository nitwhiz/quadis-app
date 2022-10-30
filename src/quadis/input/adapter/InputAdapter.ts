import EventEmitter from 'eventemitter3';
import { Command } from '../../command/Command';

export const EVENT_INPUT_ADAPTER_INPUT = 'input_adapter_input';
export const EVENT_INPUT_ADAPTER_REQUEST = 'input_adapter_request';

export type InputAdapterEventType =
  | typeof EVENT_INPUT_ADAPTER_INPUT
  | typeof EVENT_INPUT_ADAPTER_REQUEST;

export abstract class InputAdapter extends EventEmitter<InputAdapterEventType> {
  public requestUsage(): void {
    this.emit(EVENT_INPUT_ADAPTER_REQUEST);
  }

  public requestCommand(cmd: Command): void {
    this.requestUsage();
    this.emit(EVENT_INPUT_ADAPTER_INPUT, cmd);
  }

  public abstract init(): void;

  /**
   * register is called when this adapter is to be used from now on
   */
  public abstract register(): void;

  /**
   * unregister is called when this adapter is not to be used from now on;
   * another adapter is most likely to take over
   */
  public abstract unregister(): void;
}

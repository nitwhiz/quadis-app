import {
  EVENT_INPUT_ADAPTER_INPUT,
  EVENT_INPUT_ADAPTER_REQUEST,
  InputAdapter,
} from './adapter/InputAdapter';
import { Command } from '../command/Command';
import EventEmitter from 'eventemitter3';

export const EVENT_INPUT_COMMAND = 'input_handler_input';

export default class InputHandler extends EventEmitter<
  typeof EVENT_INPUT_COMMAND
> {
  private readonly availableAdapters: InputAdapter[];

  private adapter: InputAdapter | null;

  private boundAdapterInputEventHandler =
    this.handleAdapterInputEvent.bind(this);

  constructor(availableAdapters: InputAdapter[]) {
    super();

    this.availableAdapters = availableAdapters;

    if (this.availableAdapters.length < 1) {
      throw new Error('0 input adapters available');
    }

    this.adapter = null;

    this.initAdapters();
    this.requestAdapter(this.availableAdapters[0]);
  }

  private initAdapters(): void {
    for (const adapter of this.availableAdapters) {
      ((a: InputAdapter) => {
        a.on(EVENT_INPUT_ADAPTER_REQUEST, () => {
          this.requestAdapter(a);
        });
      })(adapter);

      adapter.init();
    }
  }

  private requestAdapter(adapter: InputAdapter): void {
    if (this.adapter === adapter) {
      return;
    }

    console.log('requesting different adapter');

    this.adapter?.off(
      EVENT_INPUT_ADAPTER_INPUT,
      this.boundAdapterInputEventHandler,
    );
    this.adapter?.unregister();

    adapter.on(EVENT_INPUT_ADAPTER_INPUT, this.boundAdapterInputEventHandler);
    adapter.register();

    this.adapter = adapter;
  }

  private handleAdapterInputEvent(cmd: Command) {
    this.emit(EVENT_INPUT_COMMAND, cmd);
  }
}

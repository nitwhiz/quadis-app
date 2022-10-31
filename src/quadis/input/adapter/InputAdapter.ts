import EventEmitter from 'eventemitter3';
import { Command } from '../../command/Command';

export const EVENT_INPUT_ADAPTER_INPUT = 'input_adapter_input';
export const EVENT_INPUT_ADAPTER_REQUEST = 'input_adapter_request';

export type InputAdapterEventType =
  | typeof EVENT_INPUT_ADAPTER_INPUT
  | typeof EVENT_INPUT_ADAPTER_REQUEST;

export type KeyType = string;

/**
 * key cool down in milliseconds
 */
const KEY_COOL_DOWN = 180;

export abstract class InputAdapter<
  InputKeyType extends KeyType,
> extends EventEmitter<InputAdapterEventType> {
  private nextInputCycle = -1;

  private inputKeyToCommand: Partial<Record<InputKeyType, Command>> = {};

  private commandToInputKey: Partial<Record<Command, InputKeyType>> = {};

  protected readonly keyDownTimestamps: Partial<
    Record<InputKeyType, number | undefined>
  > = {};

  private readonly pumpCommands: Partial<Record<Command, boolean>>;

  private readonly pumpCommandLocks: Partial<Record<Command, boolean>> = {};

  private isUsed = false;

  constructor() {
    super();

    this.pumpCommands = {
      [Command.HARD_LOCK]: true,
    };
  }

  protected *getMappedInputKeys(): Generator<InputKeyType> {
    for (const k of Object.keys(this.inputKeyToCommand) as InputKeyType[]) {
      yield k;
    }
  }

  protected setInputMapping(mapping: Partial<Record<InputKeyType, Command>>) {
    this.inputKeyToCommand = {};
    this.commandToInputKey = {};

    for (const [key, cmd] of Object.entries(mapping)) {
      this.inputKeyToCommand[key as InputKeyType] = cmd as Command;
      this.commandToInputKey[cmd as Command] = key as InputKeyType;
    }
  }

  protected unsetTrigger(key: InputKeyType): void {
    const command = this.getCommand(key);

    if (!command) {
      return;
    }

    if (this.keyDownTimestamps[key] !== undefined) {
      delete this.keyDownTimestamps[key];

      if (this.isPumpCommand(command)) {
        this.setLocked(command, false);
      }
    }
  }

  private getCommand(k: InputKeyType): Command | null {
    return this.inputKeyToCommand[k] ?? null;
  }

  public requestUsage(): void {
    if (this.isUsed) {
      return;
    }

    this.emit(EVENT_INPUT_ADAPTER_REQUEST);
  }

  protected tryTrigger(key: InputKeyType): void {
    if (!this.isUsed) {
      return;
    }

    if (this.keyDownTimestamps[key] === undefined) {
      this.triggerCommand(key);
    }
  }

  public requestCommand(cmd: Command): void {
    this.requestUsage();
    this.emit(EVENT_INPUT_ADAPTER_INPUT, cmd);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected updateKeyStates(): void {}

  private inputCycle(): void {
    this.nextInputCycle = window.requestAnimationFrame(() => {
      this.updateKeyStates();
      this.processKeyStates();

      this.inputCycle();
    });
  }

  private processKeyStates(): void {
    if (!this.isUsed) {
      return;
    }

    const now = Date.now();

    for (const k of Object.keys(this.keyDownTimestamps) as InputKeyType[]) {
      if (this.keyDownTimestamps[k] !== undefined) {
        const keyCommand = this.getCommand(k);

        if (!keyCommand) {
          continue;
        }

        const isPumpCommand = this.isPumpCommand(keyCommand);
        const isLockedPumpCommand = this.isLocked(keyCommand);

        if (isPumpCommand && isLockedPumpCommand) {
          continue;
        }

        if (isPumpCommand) {
          this.setLocked(keyCommand, true);
        }

        if (now - (this.keyDownTimestamps[k] ?? now) > KEY_COOL_DOWN) {
          this.triggerCommand(k);
        }
      }
    }
  }

  protected isPumpCommand(cmd: Command): boolean {
    return this.pumpCommands[cmd] ?? false;
  }

  protected isLocked(cmd: Command): boolean {
    return this.pumpCommandLocks[cmd] ?? false;
  }

  protected setLocked(cmd: Command, locked: boolean): void {
    this.pumpCommandLocks[cmd] = locked;
  }

  protected triggerCommand(k: InputKeyType) {
    const cmd = this.inputKeyToCommand[k];

    if (cmd) {
      this.requestCommand(cmd);
    }

    this.keyDownTimestamps[k] = Date.now();
  }

  protected get isRunning(): boolean {
    return this.nextInputCycle !== -1;
  }

  protected start(): void {
    if (!this.isRunning) {
      this.inputCycle();
    }
  }

  protected stop(): void {
    window.clearTimeout(this.nextInputCycle);
    this.nextInputCycle = -1;
  }

  public abstract init(): void;

  /**
   * register is called when this adapter is to be used from now on
   */
  public register(): void {
    this.isUsed = true;
  }

  /**
   * unregister is called when this adapter is not to be used from now on;
   * another adapter is most likely to take over
   */
  public unregister(): void {
    this.isUsed = false;
  }
}

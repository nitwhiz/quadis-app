import EventEmitter from 'eventemitter3';
import RoomService from '../quadis/room/RoomService';
import DevDataCollector from './DevDataCollector';
import axios from 'axios';

export const enum ConsoleEventType {
  LOG = 'log',
}

interface ConsoleEventMap {
  [ConsoleEventType.LOG]: string;
}

const enum ConsoleCommand {
  SET_FIELD = 'set_field',
  GET_FIELD = 'get_field',
  TEST = 'test',
}

export default class DevConsole extends EventEmitter<ConsoleEventMap> {
  private roomService: RoomService | null = null;

  constructor() {
    super();

    RoomService.getInstance().then(
      (roomService) => (this.roomService = roomService),
    );
  }

  public run(cmdline: string): void {
    if (!cmdline) {
      return;
    }

    const [command, ...args] = cmdline.split(' ');

    this.exec(command as ConsoleCommand, ...args);
  }

  public exec(command: ConsoleCommand, ...args: string[]): void {
    switch (command) {
      case ConsoleCommand.SET_FIELD:
        this.setField(args.slice(0, 13).join(' '));
        break;
      case ConsoleCommand.GET_FIELD:
        this.getField();
        break;
      case ConsoleCommand.TEST:
        this.test();
        break;
      default:
        break;
    }
  }

  public getField(): void {
    this.emit(
      ConsoleEventType.LOG,
      `field: ${DevDataCollector.getCurrentField()}`,
    );
  }

  public setField(fieldWords: string): void {
    const roomId = this.roomService?.getRoomId();

    if (roomId) {
      axios
        .post(
          this.roomService?.getUrl('http', `rooms/${roomId}/console`) || '/',
          {
            cmdType: ConsoleCommand.SET_FIELD,
            payload: {
              gameId: this.roomService?.getMainPlayer()?.gameId,
              words: fieldWords,
            },
          },
        )
        .then(() => this.emit(ConsoleEventType.LOG, 'field loaded.'));
    }
  }

  public test(): void {
    this.emit(ConsoleEventType.LOG, 'hello world!');
  }
}

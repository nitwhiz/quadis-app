import EventEmitter from 'eventemitter3';
import RoomService from '../quadis/room/RoomService';
import { useRoomService } from '../composables/useRoomService';
import DebugDataCollector from './DebugDataCollector';
import { ConsoleEventType } from '../quadis/event/ConsoleEvent';

export default class Console extends EventEmitter<{ ['log']: string }> {
  private roomService: RoomService | null = null;

  constructor() {
    super();

    useRoomService().then((roomService) => (this.roomService = roomService));
  }

  public run(cmdline: string): void {
    if (!cmdline) {
      return;
    }

    const [command, ...args] = cmdline.split(' ');

    this.exec(command, ...args);
  }

  public exec(command: string, ...args: string[]): void {
    switch (command) {
      case 'set_field':
        this.setField(args.slice(0, 13).join(' '));
        break;
      case 'get_field':
        this.getField();
        break;
      case 'test':
        this.test();
        break;
      default:
        break;
    }
  }

  public getField(): void {
    this.emit('log', `field: ${DebugDataCollector.getCurrentField()}`);
  }

  public setField(fieldWords: string): void {
    this.emit('log', `loading field ${fieldWords}`);
    this.roomService?.emit(ConsoleEventType.SET_FIELD, fieldWords);
  }

  public test(): void {
    this.emit('log', 'hello world!');
  }
}

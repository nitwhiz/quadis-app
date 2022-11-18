export const enum ConsoleEventType {
  SET_FIELD = 'set_field',
}

export interface ConsoleEventMap {
  [ConsoleEventType.SET_FIELD]: string;
}

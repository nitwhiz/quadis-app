export const CMD_LEFT = 'L';
export const CMD_RIGHT = 'R';
export const CMD_DOWN = 'D';
export const CMD_ROTATE = 'X';
export const CMD_HOLD = 'H';
export const CMD_HARD_LOCK = 'P';

export type Command =
  | typeof CMD_LEFT
  | typeof CMD_RIGHT
  | typeof CMD_DOWN
  | typeof CMD_ROTATE
  | typeof CMD_HOLD
  | typeof CMD_HARD_LOCK;

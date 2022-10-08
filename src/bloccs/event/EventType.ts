export const SERVER_EVENT_HELLO = 'hello';
export const SERVER_EVENT_HELLO_ACK = 'hello_ack';

export const SERVER_EVENT_GAME_START = 'game_start';
export const SERVER_EVENT_GAME_OVER = 'game_over';

export const SERVER_EVENT_UPDATE_SCORE = 'update_score';
export const SERVER_EVENT_UPDATE_FIELD = 'update_field';
export const SERVER_EVENT_UPDATE_FALLING_PIECE = 'update_falling_piece';
export const SERVER_EVENT_UPDATE_NEXT_PIECE = 'update_next_piece';
export const SERVER_EVENT_UPDATE_HOLD_PIECE = 'update_hold_piece';

export const SERVER_EVENT_PLAYER_JOIN = 'player_join';
export const SERVER_EVENT_PLAYER_LEAVE = 'player_leave';

export const SERVER_EVENT_UPDATE_BEDROCK_TARGETS = 'update_bedrock_targets';

export type ServerEventType =
  | typeof SERVER_EVENT_HELLO
  | typeof SERVER_EVENT_HELLO_ACK
  | typeof SERVER_EVENT_GAME_START
  | typeof SERVER_EVENT_GAME_OVER
  | typeof SERVER_EVENT_UPDATE_SCORE
  | typeof SERVER_EVENT_UPDATE_FIELD
  | typeof SERVER_EVENT_UPDATE_FALLING_PIECE
  | typeof SERVER_EVENT_UPDATE_NEXT_PIECE
  | typeof SERVER_EVENT_UPDATE_HOLD_PIECE
  | typeof SERVER_EVENT_PLAYER_JOIN
  | typeof SERVER_EVENT_PLAYER_LEAVE
  | typeof SERVER_EVENT_UPDATE_BEDROCK_TARGETS;

export const EVENT_SUCCESSFUL_HELLO = 'hello_success';
export const EVENT_ADD_PLAYER = 'players_add';
export const EVENT_REMOVE_PLAYER = 'players_remove';
export const EVENT_GAME_OVER = 'game_over';
export const EVENT_ROOM_HAS_GAMES_RUNNING = 'room_has_games_running';
export const EVENT_UPDATE_SCORE = 'update_score';
export const EVENT_UPDATE_MAIN_PLAYER = 'update_main_player';

export type RoomServiceEventType =
  | typeof EVENT_ADD_PLAYER
  | typeof EVENT_REMOVE_PLAYER
  | typeof EVENT_GAME_OVER
  | typeof EVENT_ROOM_HAS_GAMES_RUNNING
  | typeof EVENT_SUCCESSFUL_HELLO
  | typeof EVENT_UPDATE_SCORE
  | typeof EVENT_UPDATE_MAIN_PLAYER
  | ServerEventType;

export const specificEvent = (event: string, id: string): string =>
  `${event}@${id}`;

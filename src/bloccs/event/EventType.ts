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
  | typeof SERVER_EVENT_PLAYER_LEAVE;

export const EVENT_SUCCESSFUL_HELLO = 'hello_success';
export const EVENT_UPDATE_PLAYERS = 'players_update';
export const EVENT_GAME_OVER = 'game_over';
export const EVENT_ROOM_HAS_GAMES_RUNNING = 'room_has_games_running';
export const EVENT_UPDATE_SCORE = 'update_score';

export type ClientEventType =
  | typeof EVENT_UPDATE_PLAYERS
  | typeof EVENT_GAME_OVER
  | typeof EVENT_ROOM_HAS_GAMES_RUNNING
  | typeof EVENT_SUCCESSFUL_HELLO
  | typeof EVENT_UPDATE_SCORE;

import Player from '../player/Player';

export const gameEventType = (eventType: string, gameId: string) =>
  `game:${gameId}:${eventType}`;

export const EVENT_READY = 'ready';
export const EVENT_ROOM_HAS_GAMES_RUNNING = 'room_has_games_running';

export const EVENT_UPDATE_MAIN_PLAYER = 'update_main_player';

export const EVENT_ADD_PLAYER = 'add_player';
export const EVENT_REMOVE_PLAYER = 'remove_player';

export interface ClientEventTypes {
  [EVENT_READY]: undefined;
  [EVENT_ROOM_HAS_GAMES_RUNNING]: undefined;
  [EVENT_UPDATE_MAIN_PLAYER]: Player;
  [EVENT_ADD_PLAYER]: Player;
  [EVENT_REMOVE_PLAYER]: string;
}

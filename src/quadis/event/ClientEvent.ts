import Player from '../player/Player';
import { Command } from '../command/Command';

export const enum ClientEventType {
  READY = 'ready',
  ROOM_HAS_GAMES_RUNNING = 'room_has_games_running',
  UPDATE_MAIN_PLAYER = 'update_main_player',
  ADD_PLAYER = 'add_player',
  REMOVE_PLAYER = 'remove_player',
  PLAYER_COMMAND = 'player_command',
}

export interface ClientEventMap {
  [ClientEventType.READY]: undefined;
  [ClientEventType.ROOM_HAS_GAMES_RUNNING]: undefined;
  [ClientEventType.UPDATE_MAIN_PLAYER]: Player;
  [ClientEventType.ADD_PLAYER]: Player;
  [ClientEventType.REMOVE_PLAYER]: string;
  [ClientEventType.PLAYER_COMMAND]: Command;
}

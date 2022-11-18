import { ServerEventType } from './ServerEvent';
import { ClientEventType } from './ClientEvent';

export type GameEventType = `game:${string}:${
  | ServerEventType
  | ClientEventType}`;

export const gameEventType = (
  eventType: ServerEventType | ClientEventType,
  gameId: string | undefined,
): GameEventType => `game:${gameId || '*'}:${eventType}`;

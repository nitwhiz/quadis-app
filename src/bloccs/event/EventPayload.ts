import { ClientEventType, ServerEventType } from './EventType';

export interface PlayerPayload {
  id: string;
  name: string;
  create_at: number;
}

export interface RoomPayload {
  id: string;
  players: PlayerPayload[];
}

export interface HelloAckPayload {
  room: RoomPayload;
  you: PlayerPayload;
}

export type PlayerJoinPayload = PlayerPayload;

export type PlayerLeavePayload = PlayerPayload;

export interface FieldUpdatePayload {
  data: number[];
  width: number;
  height: number;
}

export interface FallingPieceUpdatePayload {
  piece_name: number;
  rotation: number;
  x: number;
  y: number;
}

export interface NextPieceUpdatePayload {
  piece_name: number;
}

export interface HoldPieceUpdatePayload {
  piece_name: number;
}

export interface ScoreUpdatePayload {
  score: number;
  lines: number;
}

export interface PlayerGameOverPayload {
  player: PlayerPayload;
}

export interface ServerEvent<T> {
  channel: string;
  type: ServerEventType;
  payload: T;
}

export interface ClientEvent<T> {
  type: ClientEventType;
  payload: T;
}

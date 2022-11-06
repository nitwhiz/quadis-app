import { Piece } from '../piece/Piece';

export const enum ServerEventType {
  HELLO = 'hello',
  HELLO_ACK = 'hello_ack',
  WINDOW = 'window',
  START = 'room_start',
  JOIN = 'room_join',
  LEAVE = 'room_leave',
  BEDROCK_TARGETS_UPDATE = 'room_bedrock_targets_update',
  FIELD_UPDATE = 'field_update',
  FALLING_PIECE_UPDATE = 'falling_piece_update',
  HOLDING_PIECE_UPDATE = 'holding_piece_update',
  NEXT_PIECE_UPDATE = 'next_piece_update',
  SCORE_UPDATE = 'score_update',
  GAME_OVER = 'game_over',
  ROOM_SCORES = 'room_scores',
}

export const enum ServerEventOrigin {
  ROOM = 'room',
  GAME = 'game',
  SYSTEM = 'system',
}

export interface EventOrigin<OriginType extends ServerEventOrigin> {
  id: string;
  type: OriginType;
}

interface BaseEvent<PayloadType> {
  type: ServerEventType;
  origin: EventOrigin<ServerEventOrigin>;
  payload: PayloadType;
  publishedAt: number;
  sentAt: number;
}

export interface RoomEvent<PayloadType> extends BaseEvent<PayloadType> {
  origin: EventOrigin<ServerEventOrigin.ROOM>;
}

export interface GameEvent<PayloadType> extends BaseEvent<PayloadType> {
  origin: EventOrigin<ServerEventOrigin.GAME>;
}

export interface SystemEvent<PayloadType> extends BaseEvent<PayloadType> {
  origin: EventOrigin<ServerEventOrigin.SYSTEM>;
}

// payloads

export type HelloPayload = null;

export interface HelloAckPayload {
  room: RoomPayload;
  controlledGame: GamePayload;
  host: boolean;
}

export interface GamePayload {
  id: string;
  playerName: string;
}

export interface RoomPayload {
  id: string;
  games: GamePayload[];
}

export interface PiecePayload {
  token: Piece;
}

export interface FallingPiecePayload {
  piece: PiecePayload;
  rotation: number;
  x: number;
  y: number;
}

export interface FieldPayload {
  data: number[];
}

export interface ScorePayload {
  score: number;
  lines: number;
}

export interface BedrockTargetsPayload {
  targets: Record<string, string>;
}

export type StartPayload = null;

export type GameOverPayload = null;

export type ScoresPayload = {
  game: GamePayload;
  score: ScorePayload;
}[];

export interface EventWindowPayload {
  events: ServerEvent[];
}

// room events

export interface HelloEvent extends RoomEvent<HelloPayload> {
  type: ServerEventType.HELLO;
}

export interface HelloAckEvent extends RoomEvent<HelloAckPayload> {
  type: ServerEventType.HELLO_ACK;
}

export interface StartEvent extends RoomEvent<StartPayload> {
  type: ServerEventType.START;
}

export interface JoinEvent extends RoomEvent<GamePayload> {
  type: ServerEventType.JOIN;
}

export interface LeaveEvent extends RoomEvent<GamePayload> {
  type: ServerEventType.LEAVE;
}

export interface BedrockTargetsUpdateEvent
  extends RoomEvent<BedrockTargetsPayload> {
  type: ServerEventType.BEDROCK_TARGETS_UPDATE;
}

export interface RoomScoresEvent extends RoomEvent<ScoresPayload> {
  type: ServerEventType.ROOM_SCORES;
}

// game events

export interface FieldUpdateEvent extends GameEvent<FieldPayload> {
  type: ServerEventType.FIELD_UPDATE;
}

export interface FallingPieceUpdateEvent
  extends GameEvent<FallingPiecePayload> {
  type: ServerEventType.FALLING_PIECE_UPDATE;
}

export interface HoldingPieceUpdateEvent extends GameEvent<PiecePayload> {
  type: ServerEventType.HOLDING_PIECE_UPDATE;
}

export interface NextPieceUpdateEvent extends GameEvent<PiecePayload> {
  type: ServerEventType.NEXT_PIECE_UPDATE;
}

export interface ScoreUpdateEvent extends GameEvent<ScorePayload> {
  type: ServerEventType.SCORE_UPDATE;
}

export interface GameOverEvent extends GameEvent<GameOverPayload> {
  type: ServerEventType.GAME_OVER;
}

// system event

export interface EventWindowEvent extends SystemEvent<EventWindowPayload> {
  type: ServerEventType.WINDOW;
}

export interface ServerEventMap {
  [ServerEventType.HELLO]: HelloEvent;
  [ServerEventType.HELLO_ACK]: HelloAckEvent;
  [ServerEventType.START]: StartEvent;
  [ServerEventType.JOIN]: JoinEvent;
  [ServerEventType.LEAVE]: LeaveEvent;
  [ServerEventType.BEDROCK_TARGETS_UPDATE]: BedrockTargetsUpdateEvent;
  [ServerEventType.FIELD_UPDATE]: FieldUpdateEvent;
  [ServerEventType.FALLING_PIECE_UPDATE]: FallingPieceUpdateEvent;
  [ServerEventType.HOLDING_PIECE_UPDATE]: HoldingPieceUpdateEvent;
  [ServerEventType.NEXT_PIECE_UPDATE]: NextPieceUpdateEvent;
  [ServerEventType.SCORE_UPDATE]: ScoreUpdateEvent;
  [ServerEventType.GAME_OVER]: GameOverEvent;
  [ServerEventType.WINDOW]: EventWindowEvent;
  [ServerEventType.ROOM_SCORES]: RoomScoresEvent;
}

export type ServerEvent = ServerEventMap[keyof ServerEventMap];

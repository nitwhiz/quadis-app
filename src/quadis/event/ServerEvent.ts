import { Piece } from '../piece/Piece';
import { ItemType } from '../item/Item';

export const enum ServerEventType {
  HELLO = 'hello',
  HELLO_ACK = 'hello_ack',
  WINDOW = 'window',
  START = 'room_start',
  JOIN = 'room_join',
  LEAVE = 'room_leave',
  TARGETS_UPDATE = 'room_targets_update',
  FIELD_UPDATE = 'field_update',
  FALLING_PIECE_UPDATE = 'falling_piece_update',
  HOLDING_PIECE_UPDATE = 'holding_piece_update',
  NEXT_PIECE_UPDATE = 'next_piece_update',
  SCORE_UPDATE = 'score_update',
  GAME_OVER = 'game_over',
  ROOM_SCORES = 'room_scores',
  ITEM_UPDATE = 'item_update',
  ITEM_AFFECTION_UPDATE = 'item_affection_update',
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
  rotationLocked: boolean;
  rotation: number;
  x: number;
  y: number;
}

export interface FieldPayload {
  data: string;
}

export interface ScorePayload {
  score: number;
  lines: number;
}

export interface TargetsPayload {
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

export interface ItemPayload {
  type: ItemType;
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

export interface TargetsUpdateEvent extends RoomEvent<TargetsPayload> {
  type: ServerEventType.TARGETS_UPDATE;
}

export interface RoomScoresEvent extends RoomEvent<ScoresPayload> {
  type: ServerEventType.ROOM_SCORES;
}

export interface ItemAffectionUpdateEvent extends RoomEvent<ItemPayload> {
  type: ServerEventType.ITEM_AFFECTION_UPDATE;
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

export interface ItemUpdateEvent extends GameEvent<ItemPayload> {
  type: ServerEventType.ITEM_UPDATE;
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
  [ServerEventType.TARGETS_UPDATE]: TargetsUpdateEvent;
  [ServerEventType.FIELD_UPDATE]: FieldUpdateEvent;
  [ServerEventType.FALLING_PIECE_UPDATE]: FallingPieceUpdateEvent;
  [ServerEventType.HOLDING_PIECE_UPDATE]: HoldingPieceUpdateEvent;
  [ServerEventType.NEXT_PIECE_UPDATE]: NextPieceUpdateEvent;
  [ServerEventType.SCORE_UPDATE]: ScoreUpdateEvent;
  [ServerEventType.GAME_OVER]: GameOverEvent;
  [ServerEventType.WINDOW]: EventWindowEvent;
  [ServerEventType.ROOM_SCORES]: RoomScoresEvent;
  [ServerEventType.ITEM_UPDATE]: ItemUpdateEvent;
  [ServerEventType.ITEM_AFFECTION_UPDATE]: ItemAffectionUpdateEvent;
}

export type ServerEvent = ServerEventMap[keyof ServerEventMap];

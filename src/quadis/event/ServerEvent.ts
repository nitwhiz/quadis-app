import { Piece } from '../piece/Piece';

export const EVENT_HELLO = 'hello';
export const EVENT_HELLO_ACK = 'hello_ack';

export const EVENT_START = 'room_start';
export const EVENT_JOIN = 'room_join';
export const EVENT_LEAVE = 'room_leave';
export const EVENT_BEDROCK_TARGETS_UPDATE = 'room_bedrock_targets_update';
export const EVENT_MESSAGE = 'room_message';

export const EVENT_FIELD_UPDATE = 'field_update';
export const EVENT_FALLING_PIECE_UPDATE = 'falling_piece_update';
export const EVENT_HOLDING_PIECE_UPDATE = 'holding_piece_update';
export const EVENT_NEXT_PIECE_UPDATE = 'next_piece_update';
export const EVENT_SCORE_UPDATE = 'score_update';
export const EVENT_GAME_OVER = 'game_over';

export const EVENT_ORIGIN_ROOM = 'room';
export const EVENT_ORIGIN_GAME = 'game';

export type EventType =
  | typeof EVENT_HELLO
  | typeof EVENT_HELLO_ACK
  | typeof EVENT_START
  | typeof EVENT_JOIN
  | typeof EVENT_LEAVE
  | typeof EVENT_BEDROCK_TARGETS_UPDATE
  | typeof EVENT_MESSAGE
  | typeof EVENT_FIELD_UPDATE
  | typeof EVENT_FALLING_PIECE_UPDATE
  | typeof EVENT_HOLDING_PIECE_UPDATE
  | typeof EVENT_NEXT_PIECE_UPDATE
  | typeof EVENT_SCORE_UPDATE
  | typeof EVENT_GAME_OVER;

export type EventOriginType =
  | typeof EVENT_ORIGIN_ROOM
  | typeof EVENT_ORIGIN_GAME;

export interface EventOrigin<OriginType extends EventOriginType> {
  id: string;
  type: OriginType;
}

interface BaseEvent<PayloadType> {
  type: EventType;
  origin: EventOrigin<EventOriginType>;
  payload: PayloadType;
}

export interface RoomEvent<PayloadType> extends BaseEvent<PayloadType> {
  origin: EventOrigin<typeof EVENT_ORIGIN_ROOM>;
}

export interface GameEvent<PayloadType> extends BaseEvent<PayloadType> {
  origin: EventOrigin<typeof EVENT_ORIGIN_GAME>;
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

export interface MessagePayload {
  id: string;
  parameters: Record<string, string>;
}

export type StartPayload = null;

export type GameOverPayload = null;

// room events

export interface HelloEvent extends RoomEvent<HelloPayload> {
  type: typeof EVENT_HELLO;
}

export interface HelloAckEvent extends RoomEvent<HelloAckPayload> {
  type: typeof EVENT_HELLO_ACK;
}

export interface StartEvent extends RoomEvent<StartPayload> {
  type: typeof EVENT_START;
}

export interface JoinEvent extends RoomEvent<GamePayload> {
  type: typeof EVENT_JOIN;
}

export interface LeaveEvent extends RoomEvent<GamePayload> {
  type: typeof EVENT_LEAVE;
}

export interface BedrockTargetsUpdateEvent
  extends RoomEvent<BedrockTargetsPayload> {
  type: typeof EVENT_BEDROCK_TARGETS_UPDATE;
}

export interface MessageEvent extends RoomEvent<MessagePayload> {
  type: typeof EVENT_MESSAGE;
}

// game events

export interface FieldUpdateEvent extends GameEvent<FieldPayload> {
  type: typeof EVENT_FIELD_UPDATE;
}

export interface FallingPieceUpdateEvent
  extends GameEvent<FallingPiecePayload> {
  type: typeof EVENT_FALLING_PIECE_UPDATE;
}

export interface HoldingPieceUpdateEvent extends GameEvent<PiecePayload> {
  type: typeof EVENT_HOLDING_PIECE_UPDATE;
}

export interface NextPieceUpdateEvent extends GameEvent<PiecePayload> {
  type: typeof EVENT_NEXT_PIECE_UPDATE;
}

export interface ScoreUpdateEvent extends GameEvent<ScorePayload> {
  type: typeof EVENT_SCORE_UPDATE;
}

export interface GameOverEvent extends GameEvent<GameOverPayload> {
  type: typeof EVENT_GAME_OVER;
}

export type ServerEvent =
  | HelloEvent
  | HelloAckEvent
  | StartEvent
  | JoinEvent
  | LeaveEvent
  | BedrockTargetsUpdateEvent
  | MessageEvent
  | FieldUpdateEvent
  | FallingPieceUpdateEvent
  | HoldingPieceUpdateEvent
  | NextPieceUpdateEvent
  | ScoreUpdateEvent
  | GameOverEvent;

export interface ServerEventTypes {
  [EVENT_HELLO]: HelloEvent;
  [EVENT_HELLO_ACK]: HelloAckEvent;
  [EVENT_START]: StartEvent;
  [EVENT_JOIN]: JoinEvent;
  [EVENT_LEAVE]: LeaveEvent;
  [EVENT_BEDROCK_TARGETS_UPDATE]: BedrockTargetsUpdateEvent;
  [EVENT_MESSAGE]: MessageEvent;
  [EVENT_FIELD_UPDATE]: FieldUpdateEvent;
  [EVENT_FALLING_PIECE_UPDATE]: FallingPieceUpdateEvent;
  [EVENT_HOLDING_PIECE_UPDATE]: HoldingPieceUpdateEvent;
  [EVENT_NEXT_PIECE_UPDATE]: NextPieceUpdateEvent;
  [EVENT_SCORE_UPDATE]: ScoreUpdateEvent;
  [EVENT_GAME_OVER]: GameOverEvent;
}

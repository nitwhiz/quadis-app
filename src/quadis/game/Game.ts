import Player from '../player/Player';
import DOMLinkedContainer from '../common/DOMLinkedContainer';
import GameDOMLinks from './GameDOMLinks';
import SidePieceGraphics from '../graphics/SidePieceGraphics';
import ColorMap from '../piece/color/ColorMap';
import { Piece } from '../piece/Piece';
import RoomService from '../room/RoomService';
import { Graphics } from 'pixi.js';
import { gameEventType } from '../event/ClientEvent';
import {
  EVENT_FALLING_PIECE_UPDATE,
  EVENT_FIELD_UPDATE,
  EVENT_GAME_OVER,
  EVENT_HOLDING_PIECE_UPDATE,
  EVENT_NEXT_PIECE_UPDATE,
  EVENT_START,
  FallingPieceUpdateEvent,
  FieldUpdateEvent,
  HoldingPieceUpdateEvent,
  NextPieceUpdateEvent,
} from '../event/ServerEvent';
import { PieceContainer } from '../graphics/PieceContainer';

export default class Game {
  private static BLOCK_SIZE_MAIN = 24;

  private static BLOCK_SIZE_OPPONENT = 10;

  public static DEFAULT_FIELD_HEIGHT = 20;

  public static DEFAULT_FIELD_WIDTH = 10;

  private readonly player: Player;

  private readonly roomService: RoomService;

  private readonly colorMap: ColorMap;

  private readonly blockSize: number;

  private fieldData: Uint8Array;

  private fieldWidth: number;

  private fieldHeight: number;

  private readonly fallingPieceContainer: PieceContainer;

  private readonly linkedGameContainer: DOMLinkedContainer;

  private readonly linkedNextPieceContainer: DOMLinkedContainer | null = null;

  private readonly nextPieceGraphics: SidePieceGraphics | null = null;

  private readonly linkedHoldPieceContainer: DOMLinkedContainer | null = null;

  private readonly holdPieceGraphics: SidePieceGraphics | null = null;

  private readonly fieldGraphics: Graphics;

  private gameOver: boolean;

  constructor(
    player: Player,
    domLinks: GameDOMLinks,
    roomService: RoomService,
  ) {
    this.player = player;
    this.roomService = roomService;

    this.blockSize = this.player.isMain
      ? Game.BLOCK_SIZE_MAIN
      : Game.BLOCK_SIZE_OPPONENT;

    this.colorMap = new ColorMap();

    this.colorMap.setColor(Piece.I, 0x0caee8);
    this.colorMap.setColor(Piece.O, 0xf2f200);
    this.colorMap.setColor(Piece.L, 0xffce0d);
    this.colorMap.setColor(Piece.J, 0xebaf0c);
    this.colorMap.setColor(Piece.S, 0x0cb14a);
    this.colorMap.setColor(Piece.T, 0xac0ce8);
    this.colorMap.setColor(Piece.Z, 0xe82c0c);
    this.colorMap.setColor(Piece.B, 0x333333);

    this.fieldData = new Uint8Array(0);

    this.fieldWidth = Game.DEFAULT_FIELD_WIDTH;
    this.fieldHeight = Game.DEFAULT_FIELD_HEIGHT;

    this.fallingPieceContainer = new PieceContainer(
      this.blockSize,
      this.colorMap,
    );

    this.fallingPieceContainer.x = 0;
    this.fallingPieceContainer.y = 0;

    this.linkedGameContainer = new DOMLinkedContainer(domLinks.gameContainer);

    this.linkedGameContainer.setDOMDimensions(
      this.blockSize * this.fieldWidth,
      this.blockSize * this.fieldHeight,
    );

    if (domLinks.nextPieceContainer) {
      this.linkedNextPieceContainer = new DOMLinkedContainer(
        domLinks.nextPieceContainer,
      );

      this.nextPieceGraphics = new SidePieceGraphics(this.colorMap);

      this.linkedNextPieceContainer.addChild(this.nextPieceGraphics);
    }

    if (domLinks.holdPieceContainer) {
      this.linkedHoldPieceContainer = new DOMLinkedContainer(
        domLinks.holdPieceContainer,
      );

      this.holdPieceGraphics = new SidePieceGraphics(this.colorMap);

      this.linkedHoldPieceContainer.addChild(this.holdPieceGraphics);
    }

    this.initListeners();

    this.fieldGraphics = new Graphics();

    this.fieldGraphics.x = 0;
    this.fieldGraphics.y = 0;

    this.linkedGameContainer.addChild(
      this.fieldGraphics,
      this.fallingPieceContainer,
    );

    this.gameOver = false;
  }

  private setField(width: number, height: number, data: number[]): void {
    this.fieldWidth = width;
    this.fieldHeight = height;

    if (this.fieldData.length !== this.fieldWidth * this.fieldHeight) {
      this.fieldData = new Uint8Array(data);

      this.linkedGameContainer.setDOMDimensions(
        this.blockSize * this.fieldWidth,
        this.blockSize * this.fieldHeight,
      );
    } else {
      this.fieldData.set(data);
    }
  }

  private updateFieldGraphics(): void {
    this.fieldGraphics.clear();

    for (let x = 0; x < this.fieldWidth; ++x) {
      for (let y = 0; y < this.fieldHeight; ++y) {
        const blockData = this.fieldData[y * this.fieldWidth + x];

        if (blockData) {
          this.fieldGraphics.beginFill(this.colorMap.getColor(blockData));
          this.fieldGraphics.drawRect(
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize,
            this.blockSize,
          );
        }
      }
    }

    this.fieldGraphics.lineStyle(1, 0xffffff, 0.1);

    for (let y = 0; y < this.fieldHeight; ++y) {
      this.fieldGraphics
        .moveTo(0, y * this.blockSize)
        .lineTo(this.fieldWidth * this.blockSize, y * this.blockSize);
    }

    for (let x = 0; x < this.fieldWidth; ++x) {
      this.fieldGraphics
        .moveTo(x * this.blockSize, 0)
        .lineTo(x * this.blockSize, this.fieldHeight * this.blockSize);
    }
  }

  private getEventType(type: string): string {
    return gameEventType(type, this.getId());
  }

  private initListeners() {
    this.roomService.on(
      this.getEventType(EVENT_NEXT_PIECE_UPDATE),
      (event: NextPieceUpdateEvent) => {
        if (this.nextPieceGraphics) {
          this.nextPieceGraphics.setPiece(event.payload.token, 0);
        }
      },
    );

    this.roomService.on(
      this.getEventType(EVENT_HOLDING_PIECE_UPDATE),
      (event: HoldingPieceUpdateEvent) => {
        if (this.holdPieceGraphics) {
          this.holdPieceGraphics.setPiece(event.payload.token, 0);
        }
      },
    );

    this.roomService.on(
      this.getEventType(EVENT_FIELD_UPDATE),
      (event: FieldUpdateEvent) => {
        this.setField(10, 20, event.payload.data);

        this.updateFieldGraphics();
      },
    );

    this.roomService.on(
      this.getEventType(EVENT_FALLING_PIECE_UPDATE),
      (event: FallingPieceUpdateEvent) => {
        this.fallingPieceContainer.piece = event.payload.piece.token;
        this.fallingPieceContainer.rotation = event.payload.rotation;

        this.fallingPieceContainer.position.set(
          event.payload.x * this.blockSize,
          event.payload.y * this.blockSize,
        );
      },
    );

    this.roomService.on(this.getEventType(EVENT_GAME_OVER), () =>
      this.handleGameOver(),
    );

    this.roomService.on(EVENT_START, () => this.reset());
  }

  public reset(): void {
    this.gameOver = false;

    this.fallingPieceContainer.piece = null;

    this.fieldData.fill(0);

    this.linkedGameContainer.alpha = 1;

    this.updateFieldGraphics();

    this.nextPieceGraphics?.setPiece(null);
    this.holdPieceGraphics?.setPiece(null);
  }

  private handleGameOver(): void {
    this.gameOver = true;

    this.linkedGameContainer.alpha = 0.25;
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getDOMLinkedGameContainer(): DOMLinkedContainer {
    return this.linkedGameContainer;
  }

  public getDOMLinkedNextPieceContainer(): DOMLinkedContainer | null {
    return this.linkedNextPieceContainer;
  }

  public getDOMLinkedHoldPieceContainer(): DOMLinkedContainer | null {
    return this.linkedHoldPieceContainer;
  }

  public getId(): string {
    return this.getPlayer().gameId;
  }
}

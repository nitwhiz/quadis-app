import Player from '../player/Player';
import SidePieceContainer from '../piece/SidePieceContainer';
import RoomService from '../room/RoomService';
import { Container, IDestroyOptions, Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { EVENT_PLAYER_COMMAND, gameEventType } from '../event/ClientEvent';
import {
  EVENT_FALLING_PIECE_UPDATE,
  EVENT_FIELD_UPDATE,
  EVENT_GAME_OVER,
  EVENT_HOLDING_PIECE_UPDATE,
  EVENT_NEXT_PIECE_UPDATE,
  EVENT_SCORE_UPDATE,
  EVENT_START,
  FallingPieceUpdateEvent,
  FieldUpdateEvent,
  HoldingPieceUpdateEvent,
  NextPieceUpdateEvent,
  ScoreUpdateEvent,
} from '../event/ServerEvent';
import {
  BLOCK_SIZE_MAIN_FIELD,
  BLOCK_SIZE_OPPONENT_FIELD,
} from '../piece/Piece';
import FieldContainer from '../field/FieldContainer';
import { Command } from '../command/Command';

interface GameDOMLinks {
  gameContainer: HTMLElement;
  nextPieceContainer?: HTMLElement;
  holdingPieceContainer?: HTMLElement;
}

export default class GameContainer extends Container {
  private readonly player: Player;

  private readonly roomService: RoomService;

  private readonly fieldContainer: FieldContainer;

  private readonly nextPieceContainer: SidePieceContainer | null = null;

  private readonly holdingPieceContainer: SidePieceContainer | null = null;

  private gameOver: boolean;

  private ticker: Ticker;

  constructor(
    player: Player,
    domContainers: GameDOMLinks,
    roomService: RoomService,
  ) {
    super();

    this.ticker = new Ticker();

    this.player = player;
    this.roomService = roomService;

    this.fieldContainer = new FieldContainer(
      domContainers.gameContainer,
      this.player.isMain ? BLOCK_SIZE_MAIN_FIELD : BLOCK_SIZE_OPPONENT_FIELD,
    );

    this.addChild(this.fieldContainer);

    if (domContainers.nextPieceContainer) {
      this.nextPieceContainer = new SidePieceContainer(
        domContainers.nextPieceContainer,
      );

      this.addChild(this.nextPieceContainer);
    }

    if (domContainers.holdingPieceContainer) {
      this.holdingPieceContainer = new SidePieceContainer(
        domContainers.holdingPieceContainer,
      );

      this.addChild(this.holdingPieceContainer);
    }

    this.initListeners();

    this.ticker.add(
      () => {
        this.fieldContainer.update();
        this.nextPieceContainer?.update();
        this.holdingPieceContainer?.update();
      },
      this,
      UPDATE_PRIORITY.UTILITY,
    );

    this.gameOver = false;

    this.ticker.start();
  }

  private getEventType(type: string): string {
    return gameEventType(type, this.getId());
  }

  private initListeners() {
    this.roomService.on(
      this.getEventType(EVENT_SCORE_UPDATE),
      (event: ScoreUpdateEvent) => {
        this.player.score.score = event.payload.score;
        this.player.score.lines = event.payload.lines;
      },
    );

    this.roomService.on(
      this.getEventType(EVENT_NEXT_PIECE_UPDATE),
      (event: NextPieceUpdateEvent) => {
        if (this.nextPieceContainer) {
          this.nextPieceContainer.setPiece(event.payload.token);
        }
      },
    );

    this.roomService.on(
      this.getEventType(EVENT_HOLDING_PIECE_UPDATE),
      (event: HoldingPieceUpdateEvent) => {
        if (this.holdingPieceContainer) {
          this.holdingPieceContainer.setPiece(event.payload.token);
        }
      },
    );

    this.roomService.on(
      this.getEventType(EVENT_FIELD_UPDATE),
      (event: FieldUpdateEvent) => {
        this.fieldContainer.updateField(10, 20, event.payload.data);
      },
    );

    this.roomService.on(
      this.getEventType(EVENT_FALLING_PIECE_UPDATE),
      (event: FallingPieceUpdateEvent) => {
        this.fieldContainer.updateFallingPiece(
          event.payload.piece.token,
          event.payload.rotation,
          event.payload.x,
          event.payload.y,
        );
      },
    );

    this.roomService.on(this.getEventType(EVENT_GAME_OVER), () =>
      this.handleGameOver(),
    );

    this.roomService.on(EVENT_START, () => this.reset());

    this.roomService.on(
      this.getEventType(EVENT_PLAYER_COMMAND),
      (cmd: Command) => {
        switch (cmd) {
          case Command.ROTATE:
            this.fieldContainer.tryTranslatePiece(1, 0, 0);
            break;
          case Command.LEFT:
            this.fieldContainer.tryTranslatePiece(0, -1, 0);
            break;
          case Command.RIGHT:
            this.fieldContainer.tryTranslatePiece(0, 1, 0);
            break;
          case Command.DOWN:
            this.fieldContainer.tryTranslatePiece(0, 0, 1);
            break;
          default:
            break;
        }
      },
    );
  }

  public reset(): void {
    this.gameOver = false;

    this.fieldContainer.reset();

    this.nextPieceContainer?.setPiece(null);
    this.holdingPieceContainer?.setPiece(null);
  }

  private handleGameOver(): void {
    this.gameOver = true;
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getId(): string {
    return this.getPlayer().gameId;
  }

  public destroy(_options?: IDestroyOptions | boolean): void {
    this.ticker.stop();
    this.ticker.destroy();

    super.destroy(_options);
  }
}

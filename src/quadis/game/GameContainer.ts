import Player from '../player/Player';
import SidePieceContainer from '../piece/SidePieceContainer';
import RoomService from '../room/RoomService';
import { ClientEventType } from '../event/ClientEvent';
import {
  FallingPieceUpdateEvent,
  FieldUpdateEvent,
  HoldingPieceUpdateEvent,
  NextPieceUpdateEvent,
  ScoreUpdateEvent,
  ServerEventType,
} from '../event/ServerEvent';
import {
  BLOCK_SIZE_MAIN_FIELD,
  BLOCK_SIZE_OPPONENT_FIELD,
} from '../piece/Piece';
import FieldContainer from '../field/FieldContainer';
import { Command } from '../command/Command';
import { Container, IDestroyOptions } from '@pixi/display';
import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';
import { gameEventType } from '../event/GameEvent';
import { GameLogger } from '../../logger/Logger';
import { codec64 } from '../field/codec/Codec64';

interface GameDOMLinks {
  gameContainer: HTMLElement;
  nextPieceContainer?: HTMLElement | null;
  holdingPieceContainer?: HTMLElement | null;
}

export default class GameContainer extends Container {
  private readonly player: Player;

  private readonly roomService: RoomService;

  private readonly fieldContainer: FieldContainer;

  private rotationLocked = false;

  private readonly nextPieceContainer: SidePieceContainer | null = null;

  private readonly holdingPieceContainer: SidePieceContainer | null = null;

  private gameOver: boolean;

  private ticker: Ticker;

  private fallingPiecePredictionBuffer: {
    rotation: number;
    x: number;
    y: number;
  }[];

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

    this.fallingPiecePredictionBuffer = [];

    this.ticker.start();
  }

  private getOwnEventType(type: ServerEventType | ClientEventType) {
    return gameEventType(type, this.getId());
  }

  private initListeners() {
    this.roomService.on(
      this.getOwnEventType(ServerEventType.SCORE_UPDATE),
      (event: ScoreUpdateEvent) => {
        this.player.score.score = event.payload.score;
        this.player.score.lines = event.payload.lines;
      },
    );

    this.roomService.on(
      this.getOwnEventType(ServerEventType.NEXT_PIECE_UPDATE),
      (event: NextPieceUpdateEvent) => {
        if (this.nextPieceContainer) {
          this.nextPieceContainer.setPiece(event.payload.token);
        }
      },
    );

    this.roomService.on(
      this.getOwnEventType(ServerEventType.HOLDING_PIECE_UPDATE),
      (event: HoldingPieceUpdateEvent) => {
        if (this.holdingPieceContainer) {
          this.holdingPieceContainer.setPiece(event.payload.token);
        }
      },
    );

    this.roomService.on(
      this.getOwnEventType(ServerEventType.FIELD_UPDATE),
      (event: FieldUpdateEvent) => {
        // todo(server): send field width and height, use it here, too
        this.fieldContainer.updateField(
          10,
          20,
          codec64.decode(10, 20, event.payload.data),
        );
      },
    );

    this.roomService.on(
      this.getOwnEventType(ServerEventType.FALLING_PIECE_UPDATE),
      (event: FallingPieceUpdateEvent) => {
        this.rotationLocked = event.payload.rotationLocked;

        const prediction = this.fallingPiecePredictionBuffer.shift();

        if (
          prediction &&
          event.payload.piece.token ===
            this.fieldContainer.getFallingPieceContainer().piece &&
          event.payload.rotation === prediction.rotation &&
          event.payload.x === prediction.x &&
          event.payload.y === prediction.y
        ) {
          GameLogger.debug('dropping event; prediction was correct');
          return;
        } else {
          GameLogger.debug('incorrect prediction; clearing buffer');
          this.fallingPiecePredictionBuffer.length = 0;
        }

        this.fieldContainer.updateFallingPiece(
          event.payload.piece.token,
          event.payload.rotation,
          event.payload.x,
          event.payload.y,
        );
      },
    );

    this.roomService.on(this.getOwnEventType(ServerEventType.GAME_OVER), () =>
      this.handleGameOver(),
    );

    this.roomService.on(ServerEventType.START, () => this.reset());

    this.roomService.on(
      this.getOwnEventType(ClientEventType.PLAYER_COMMAND),
      (cmd: Command) => {
        let fallingPiecePredictionResult = false;

        switch (cmd) {
          case Command.ROTATE:
            if (this.rotationLocked) {
              fallingPiecePredictionResult = false;
            } else {
              fallingPiecePredictionResult =
                this.fieldContainer.tryTranslateFallingPiece(1, 0, 0);
            }
            break;
          case Command.LEFT:
            fallingPiecePredictionResult =
              this.fieldContainer.tryTranslateFallingPiece(0, -1, 0);
            break;
          case Command.RIGHT:
            fallingPiecePredictionResult =
              this.fieldContainer.tryTranslateFallingPiece(0, 1, 0);
            break;
          case Command.DOWN:
            fallingPiecePredictionResult =
              this.fieldContainer.tryTranslateFallingPiece(0, 0, 1);
            break;
          default:
            break;
        }

        if (fallingPiecePredictionResult) {
          const fallingPiece = this.fieldContainer.getFallingPieceContainer();

          this.fallingPiecePredictionBuffer.push({
            rotation: fallingPiece.rotation,
            x: Math.floor(
              fallingPiece.position.x / this.fieldContainer.blockSize,
            ),
            y: Math.floor(
              fallingPiece.position.y / this.fieldContainer.blockSize,
            ),
          });
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

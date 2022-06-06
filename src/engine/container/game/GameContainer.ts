import BlockRenderer from '../../render/BlockRenderer';
import FieldContainer from '../field/FieldContainer';
import FallingPieceContainer from '../piece/FallingPieceContainer';
import { FieldEvent, Game, GameEvent, ScoreEvent } from '@bloccs/client';
import PieceInfoContainer from '../piece/PieceInfoContainer';
import BaseGraphicsContainer from '../BaseGraphicsContainer';
import ScoreContainer from '../score/ScoreContainer';
import { Text } from 'pixi.js';
import { positionRelative } from '../../util/Util';
import GameHost from '../../game/GameHost';

export interface GameContainerSettings {
  showNextPiece?: boolean;
  showHoldPiece?: boolean;
  showName?: boolean;
  showScore?: boolean;
}

export default class GameContainer extends BaseGraphicsContainer {
  private readonly settings: GameContainerSettings;

  private playerNameText: Text | null;

  private scoreContainer: ScoreContainer | null;

  private fieldContainer!: FieldContainer;

  private fallingPieceContainer!: FallingPieceContainer;

  private nextPieceContainer: PieceInfoContainer | null;

  private holdPieceContainer: PieceInfoContainer | null;

  constructor(
    private readonly game: Game,
    settings: GameContainerSettings,
    blockRenderer: BlockRenderer,
    blockSize: number,
  ) {
    super(blockRenderer, blockSize);

    this.settings = {
      showNextPiece: true,
      showHoldPiece: true,
      showName: true,
      showScore: true,
      ...settings,
    };

    this.playerNameText = null;
    this.scoreContainer = null;
    this.nextPieceContainer = null;
    this.holdPieceContainer = null;

    if (this.settings.showName) {
      this.initPlayerNameText();
    }

    if (this.settings.showScore) {
      this.initScoreContainer();
    }

    this.initFieldContainer();
    this.initFallingPieceContainer();

    if (this.settings.showNextPiece) {
      this.initNextPieceContainer();
    }

    if (this.settings.showHoldPiece) {
      this.initHoldPieceContainer();
    }

    this.addEventListeners();

    this.initialUpdate();
  }

  private updateLayout(): void {
    if (this.nextPieceContainer) {
      positionRelative(this.nextPieceContainer, this.fieldContainer, {
        top: 0,
        right: 12,
      });
    }

    if (this.holdPieceContainer) {
      if (this.nextPieceContainer) {
        positionRelative(this.holdPieceContainer, this.nextPieceContainer, {
          left: 0,
          bottom: 12,
        });
      } else {
        positionRelative(this.holdPieceContainer, this.fieldContainer, {
          top: 0,
          right: 12,
        });
      }
    }
  }

  private initialUpdate(): void {
    if (this.scoreContainer) {
      this.scoreContainer.update(this.game.score);
    }

    this.fieldContainer.update(this.game.field);
    this.fallingPieceContainer.update(this.game.fallingPiece);

    if (this.nextPieceContainer) {
      this.nextPieceContainer.update(this.game.nextPiece);
    }

    if (this.holdPieceContainer) {
      this.holdPieceContainer.update(this.game.holdPiece);
    }

    this.updateLayout();
  }

  private addEventListeners(): void {
    if (this.settings.showScore) {
      this.game.score.addListener(ScoreEvent.UPDATE, () => {
        if (this.scoreContainer) {
          this.scoreContainer.update(this.game.score);
        }
      });
    }

    this.game.addListener(GameEvent.START, () => {
      this.fieldContainer.setGameOver(false);
      this.fallingPieceContainer.setGameOver(false);

      GameHost.instance.summaryContainer.visible = false;
    });

    this.game.addListener(GameEvent.OVER, () => {
      this.fieldContainer.setGameOver(true);
      this.fallingPieceContainer.setGameOver(true);
    });

    this.game.field.addListener(FieldEvent.UPDATE, () => {
      this.fieldContainer.update(this.game.field);
      this.updateLayout();
    });

    this.game.addListener(GameEvent.UPDATE_FALLING_PIECE, () => {
      this.fallingPieceContainer.update(this.game.fallingPiece);
    });

    if (this.settings.showNextPiece) {
      this.game.addListener(GameEvent.UPDATE_NEXT_PIECE, () => {
        if (this.nextPieceContainer) {
          this.nextPieceContainer.update(this.game.nextPiece);
        }
      });
    }

    if (this.settings.showHoldPiece) {
      this.game.addListener(GameEvent.UPDATE_HOLD_PIECE, () => {
        if (this.holdPieceContainer) {
          this.holdPieceContainer.update(this.game.holdPiece);
        }
      });
    }
  }

  private initPlayerNameText(): void {
    this.playerNameText = new Text(this.game.player.name, {
      fontFamily: 'Press Start 2P',
      fontSize: 14,
      fill: 0xffffff,
    });

    this.playerNameText.position.set(0, 0);

    this.addChild(this.playerNameText);
  }

  private initScoreContainer(): void {
    this.scoreContainer = new ScoreContainer();

    if (this.playerNameText) {
      positionRelative(this.scoreContainer, this.playerNameText, {
        bottom: 8,
      });
    } else {
      this.scoreContainer.position.set(0, 0);
    }

    this.addChild(this.scoreContainer);
  }

  private initFieldContainer(): void {
    this.fieldContainer = new FieldContainer(
      this.blockRenderer,
      this.blockSize,
    );

    if (this.scoreContainer) {
      positionRelative(this.fieldContainer, this.scoreContainer, {
        bottom: 12,
      });
    } else if (this.playerNameText) {
      positionRelative(this.fieldContainer, this.playerNameText, {
        bottom: 12,
      });
    } else {
      this.fieldContainer.position.set(0, 0);
    }

    this.addChild(this.fieldContainer);
  }

  private initFallingPieceContainer(): void {
    this.fallingPieceContainer = new FallingPieceContainer(
      this.blockRenderer,
      this.blockSize,
    );

    positionRelative(this.fallingPieceContainer, this.fieldContainer, {
      top: 0,
      left: 0,
    });

    this.addChild(this.fallingPieceContainer);
  }

  private initNextPieceContainer(): void {
    this.nextPieceContainer = new PieceInfoContainer(
      'NEXT',
      this.blockRenderer,
      this.blockSize / 2,
    );

    // position is set by updateLayout

    this.addChild(this.nextPieceContainer);
  }

  private initHoldPieceContainer(): void {
    this.holdPieceContainer = new PieceInfoContainer(
      'HOLD',
      this.blockRenderer,
      this.blockSize / 2,
    );

    // position is set by updateLayout

    this.addChild(this.holdPieceContainer);
  }
}

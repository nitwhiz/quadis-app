import {
  BLOCK_SIZE_MAIN_FIELD,
  BLOCK_SIZE_OPPONENT_FIELD,
  BLOCK_SIZE_SIDE_PIECE,
  clampRotation,
  Piece,
} from './Piece';
import { Container, IDestroyOptions } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import PieceSpriteFactory, { PieceSpriteRegistry } from './PieceSpriteFactory';
import GameHost from '../game/GameHost';
import { Texture } from '@pixi/core';

export class PieceContainer extends Container {
  private static pieceSpriteRegistry: PieceSpriteRegistry = {};

  private currentPiece: Piece | null;

  private currentRotation: number;

  private readonly pieceFaceSprites: Record<Piece, Sprite[]>;

  private readonly faceContainer: Container;

  public static bakePieceSprites(blockTexture: Texture): void {
    const pieceSpriteFactory = new PieceSpriteFactory(
      blockTexture,
      GameHost.getInstance().getRenderer(),
    );

    pieceSpriteFactory.bake(BLOCK_SIZE_MAIN_FIELD);
    pieceSpriteFactory.bake(BLOCK_SIZE_SIDE_PIECE);
    pieceSpriteFactory.bake(BLOCK_SIZE_OPPONENT_FIELD);

    PieceContainer.pieceSpriteRegistry = pieceSpriteFactory.getRegistry();
  }

  constructor(blockSize: number) {
    super();

    this.currentPiece = null;
    this.currentRotation = 0;

    if (PieceContainer.pieceSpriteRegistry[blockSize]) {
      this.pieceFaceSprites = PieceContainer.pieceSpriteRegistry[blockSize];
    } else {
      throw new Error(`no piece face sprites for block size ${blockSize}`);
    }

    this.faceContainer = new Container<Sprite>();
    this.faceContainer.position.set(0, 0);

    this.addChild(this.faceContainer);
  }

  public get piece(): Piece | null {
    return this.currentPiece;
  }

  public set piece(piece: Piece | null) {
    if (this.currentPiece === piece) {
      return;
    }

    if (this.currentPiece !== null) {
      const currentPieceSprite =
        this.pieceFaceSprites[this.currentPiece][this.currentRotation];

      if (currentPieceSprite) {
        this.faceContainer.removeChildren();
      }
    }

    this.currentPiece = piece;

    this.rotation = 0;
  }

  public get rotation(): number {
    return this.currentRotation;
  }

  public set rotation(angle: number) {
    if (this.currentPiece !== null) {
      const currentPieceSprite =
        this.pieceFaceSprites[this.currentPiece][this.currentRotation];

      if (currentPieceSprite) {
        this.faceContainer.removeChildren();
      }

      const clampedRotation = clampRotation(this.currentPiece, angle);

      const nextPieceSprite =
        this.pieceFaceSprites[this.currentPiece][clampedRotation];

      if (nextPieceSprite) {
        this.faceContainer.addChild(nextPieceSprite);
      }

      this.currentRotation = clampedRotation;
    } else {
      this.currentRotation = 0;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public destroy(_options?: IDestroyOptions | boolean): void {
    this.faceContainer.destroy(
      typeof _options === 'boolean'
        ? false
        : {
            ..._options,
            children: false,
          },
    );

    super.destroy(
      typeof _options === 'boolean'
        ? false
        : {
            ..._options,
            children: false,
          },
    );
  }
}

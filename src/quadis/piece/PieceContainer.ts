import { clampRotation, getFaceCount, getPieceDataXY, Piece } from './Piece';
import ColorMap from './color/ColorMap';
import { Graphics } from '@pixi/graphics';
import { Container, IDestroyOptions } from '@pixi/display';

export class PieceContainer extends Container {
  private static preBakedPieceFaceGraphicsByBlockSize: Record<
    number,
    Record<Piece, Graphics[]>
  > = {};

  private currentPiece: Piece | null;

  private currentRotation: number;

  private readonly pieceFaceGraphics: Record<Piece, Graphics[]>;

  private readonly faceContainer: Container;

  constructor(blockSize: number) {
    super();

    this.currentPiece = null;
    this.currentRotation = 0;

    if (PieceContainer.preBakedPieceFaceGraphicsByBlockSize[blockSize]) {
      this.pieceFaceGraphics =
        PieceContainer.preBakedPieceFaceGraphicsByBlockSize[blockSize];
    } else {
      const pieceFaceGraphics = {
        [Piece.I]: PieceContainer.generateFaceGraphics(Piece.I, blockSize),
        [Piece.O]: PieceContainer.generateFaceGraphics(Piece.O, blockSize),
        [Piece.L]: PieceContainer.generateFaceGraphics(Piece.L, blockSize),
        [Piece.J]: PieceContainer.generateFaceGraphics(Piece.J, blockSize),
        [Piece.S]: PieceContainer.generateFaceGraphics(Piece.S, blockSize),
        [Piece.T]: PieceContainer.generateFaceGraphics(Piece.T, blockSize),
        [Piece.Z]: PieceContainer.generateFaceGraphics(Piece.Z, blockSize),
        [Piece.B]: PieceContainer.generateFaceGraphics(Piece.B, blockSize),
      };

      this.pieceFaceGraphics = pieceFaceGraphics;
      PieceContainer.preBakedPieceFaceGraphicsByBlockSize[blockSize] =
        pieceFaceGraphics;
    }

    this.faceContainer = new Container<Graphics>();
    this.faceContainer.position.set(0, 0);

    this.addChild(this.faceContainer);
  }

  private static generateFaceGraphics(
    piece: Piece,
    blockSize: number,
  ): Graphics[] {
    const faceCount = getFaceCount(piece);
    const result: Graphics[] = [];

    for (let rot = 0; rot < faceCount; rot++) {
      const g = new Graphics();

      for (let x = 0; x < 4; ++x) {
        for (let y = 0; y < 4; ++y) {
          const blockData = getPieceDataXY(piece, rot, x, y);

          if (blockData) {
            g.beginFill(ColorMap.CLASSIC.getColor(blockData));
            g.drawRect(x * blockSize, y * blockSize, blockSize, blockSize);
          }
        }
      }

      g.position.set(0, 0);
      g.visible = true;

      result.push(g);
    }

    return result;
  }

  public get piece(): Piece | null {
    return this.currentPiece;
  }

  public set piece(piece: Piece | null) {
    if (this.currentPiece === piece) {
      return;
    }

    if (this.currentPiece !== null) {
      const currentPieceGraphics =
        this.pieceFaceGraphics[this.currentPiece][this.currentRotation];

      if (currentPieceGraphics) {
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
      const currentPieceGraphics =
        this.pieceFaceGraphics[this.currentPiece][this.currentRotation];

      if (currentPieceGraphics) {
        this.faceContainer.removeChildren();
      }

      const clampedRotation = clampRotation(this.currentPiece, angle);

      const nextPieceGraphics =
        this.pieceFaceGraphics[this.currentPiece][clampedRotation];

      if (nextPieceGraphics) {
        this.faceContainer.addChild(nextPieceGraphics.clone());
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

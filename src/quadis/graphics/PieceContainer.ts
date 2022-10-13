import { Container, Graphics } from 'pixi.js';
import {
  clampRotation,
  getFaceCount,
  getPieceDataXY,
  Piece,
} from '../piece/Piece';
import ColorMap from '../piece/color/ColorMap';

export class PieceContainer extends Container {
  private currentPiece: Piece | null;

  private currentRotation: number;

  // TODO: reuse across instances; cache per blocksize + colormap = pieceGraphics
  private readonly pieceGraphics: Record<Piece, Graphics[]>;

  constructor(blockSize: number, colorMap: ColorMap) {
    super();

    this.currentPiece = null;
    this.currentRotation = 0;

    this.pieceGraphics = {
      [Piece.I]: PieceContainer.generateFaceGraphics(
        Piece.I,
        blockSize,
        colorMap,
      ),
      [Piece.O]: PieceContainer.generateFaceGraphics(
        Piece.O,
        blockSize,
        colorMap,
      ),
      [Piece.L]: PieceContainer.generateFaceGraphics(
        Piece.L,
        blockSize,
        colorMap,
      ),
      [Piece.J]: PieceContainer.generateFaceGraphics(
        Piece.J,
        blockSize,
        colorMap,
      ),
      [Piece.S]: PieceContainer.generateFaceGraphics(
        Piece.S,
        blockSize,
        colorMap,
      ),
      [Piece.T]: PieceContainer.generateFaceGraphics(
        Piece.T,
        blockSize,
        colorMap,
      ),
      [Piece.Z]: PieceContainer.generateFaceGraphics(
        Piece.Z,
        blockSize,
        colorMap,
      ),
      [Piece.B]: PieceContainer.generateFaceGraphics(
        Piece.B,
        blockSize,
        colorMap,
      ),
    };

    for (const graphics of Object.values(this.pieceGraphics)) {
      if (graphics.length > 0) {
        this.addChild(...graphics);
      }
    }
  }

  private static generateFaceGraphics(
    piece: Piece,
    blockSize: number,
    colorMap: ColorMap,
  ): Graphics[] {
    const faceCount = getFaceCount(piece);
    const result: Graphics[] = [];

    for (let rot = 0; rot < faceCount; rot++) {
      const g = new Graphics();

      for (let x = 0; x < 4; ++x) {
        for (let y = 0; y < 4; ++y) {
          const blockData = getPieceDataXY(piece, rot, x, y);

          if (blockData) {
            g.beginFill(colorMap.getColor(blockData));
            g.drawRect(x * blockSize, y * blockSize, blockSize, blockSize);
          }
        }
      }

      g.position.set(0, 0);
      g.visible = false;

      result.push(g);
    }

    return result;
  }

  public set piece(piece: Piece | null) {
    if (this.currentPiece === piece) {
      return;
    }

    if (this.currentPiece !== null) {
      const currentPieceGraphics =
        this.pieceGraphics[this.currentPiece][this.currentRotation];

      if (currentPieceGraphics) {
        currentPieceGraphics.visible = false;
      }
    }

    this.currentPiece = piece;

    this.rotation = 0;
  }

  public set rotation(angle: number) {
    if (this.currentPiece !== null) {
      const currentPieceGraphics =
        this.pieceGraphics[this.currentPiece][this.currentRotation];

      if (currentPieceGraphics) {
        currentPieceGraphics.visible = false;
      }

      const clampedRotation = clampRotation(this.currentPiece, angle);
      const nextPieceGraphics =
        this.pieceGraphics[this.currentPiece][clampedRotation];

      if (nextPieceGraphics) {
        nextPieceGraphics.visible = true;
      }

      this.currentRotation = clampedRotation;
    } else {
      this.currentRotation = 0;
    }
  }
}

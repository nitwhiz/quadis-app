import { PieceContainer } from './PieceContainer';
import DOMLinkedContainer from '../common/DOMLinkedContainer';
import { BLOCK_SIZE_SIDE_PIECE } from './Piece';

const PIECE_CONTAINER_PADDING = 10;

export default class SidePieceContainer extends DOMLinkedContainer {
  private readonly pieceContainer: PieceContainer;

  constructor(domElement: HTMLElement) {
    super(domElement);

    this.pieceContainer = new PieceContainer(BLOCK_SIZE_SIDE_PIECE);

    this.pieceContainer.x = PIECE_CONTAINER_PADDING;
    this.pieceContainer.y = PIECE_CONTAINER_PADDING;

    this.setDOMDimensions(
      BLOCK_SIZE_SIDE_PIECE * 4 + PIECE_CONTAINER_PADDING * 2,
      BLOCK_SIZE_SIDE_PIECE * 4 + PIECE_CONTAINER_PADDING * 2,
    );
    this.update(true);

    this.addChild(this.pieceContainer);
  }

  public setPiece(pieceToken: null | number): void {
    this.pieceContainer.piece = pieceToken;
  }
}

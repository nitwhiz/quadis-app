import { ClientEvent, PlayerPayload, ServerEvent } from '../event/EventPayload';
import Score from '../score/Score';

export default class Player {
  public readonly isMain: boolean;

  public readonly id: string;

  public readonly name: string;

  public readonly createAt: number;

  public readonly score: Score;

  constructor(isMain: boolean, p: PlayerPayload) {
    this.isMain = isMain;

    this.id = p.id;
    this.name = p.name;
    this.createAt = p.create_at;

    this.score = {
      score: 0,
      lines: 0,
    };
  }

  public dispatchServerEvent(
    event: ServerEvent<unknown>,
  ): ClientEvent<unknown> | null {
    // switch (event.type) {
    //   case SERVER_EVENT_UPDATE_FALLING_PIECE:
    //     {
    //       const e = event as ServerEvent<FallingPieceUpdatePayload>;
    //
    //       this.game?.setFallingPiece(
    //         e.payload.piece_name,
    //         e.payload.rotation,
    //         e.payload.x,
    //         e.payload.y,
    //       );
    //     }
    //     break;
    //   case SERVER_EVENT_UPDATE_NEXT_PIECE:
    //     {
    //       const e = event as ServerEvent<NextPieceUpdatePayload>;
    //
    //       this.game?.setNextPiece(e.payload.piece_name);
    //     }
    //     break;
    //   case SERVER_EVENT_UPDATE_HOLD_PIECE:
    //     {
    //       const e = event as ServerEvent<HoldPieceUpdatePayload>;
    //
    //       this.game?.setHoldPiece(e.payload.piece_name);
    //     }
    //     break;
    //   case SERVER_EVENT_UPDATE_FIELD:
    //     {
    //       const e = event as ServerEvent<FieldUpdatePayload>;
    //
    //       this.game?.setField(
    //         e.payload.width,
    //         e.payload.height,
    //         e.payload.data,
    //       );
    //     }
    //     break;
    //   case SERVER_EVENT_UPDATE_SCORE:
    //     {
    //       const e = event as ServerEvent<ScoreUpdatePayload>;
    //
    //       this.score.score = e.payload.score;
    //       this.score.lines = e.payload.lines;
    //
    //       console.log(this.score);
    //     }
    //     break;
    //   case SERVER_EVENT_GAME_OVER:
    //     // todo: handle game over
    //     break;
    //   default:
    //     break;
    // }

    return null;
  }
}

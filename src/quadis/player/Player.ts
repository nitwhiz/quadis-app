import Score from '../score/Score';

export default class Player {
  public readonly isMain: boolean;

  public readonly gameId: string;

  public readonly name: string;

  public readonly score: Score;

  public readonly isHost: boolean;

  constructor(isMain: boolean, gameId: string, name: string, isHost = false) {
    this.isMain = isMain;

    this.gameId = gameId;
    this.name = name;
    this.isHost = isHost;

    this.score = {
      score: 0,
      lines: 0,
    };
  }
}

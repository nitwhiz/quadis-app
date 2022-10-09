import Score from '../score/Score';

export default class Player {
  public readonly isMain: boolean;

  public readonly gameId: string;

  public readonly name: string;

  public readonly score: Score;

  constructor(isMain: boolean, gameId: string, name: string) {
    this.isMain = isMain;

    this.gameId = gameId;
    this.name = name;

    this.score = {
      score: 0,
      lines: 0,
    };
  }
}

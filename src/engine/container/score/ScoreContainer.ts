import { Container, Text } from 'pixi.js';
import { Score } from '@bloccs/client';

export default class ScoreContainer extends Container {
  private readonly scoreText: Text;
  private readonly linesText: Text;

  constructor() {
    super();

    const textStyle = {
      fontFamily: 'Press Start 2P',
      fontSize: 14,
      fill: 0xffffff,
    };

    this.scoreText = new Text('SCORE 0', textStyle);

    this.scoreText.position.set(0, 0);

    this.addChild(this.scoreText);

    this.linesText = new Text('LINES 0', textStyle);

    this.linesText.position.set(0, 24);

    this.addChild(this.linesText);
  }

  public update(score: Score) {
    this.scoreText.text = `SCORE ${score.score}`;
    this.linesText.text = `LINES ${score.lines}`;
  }
}

import { Container, Graphics, Rectangle, Text } from 'pixi.js';
import { Game, Room } from '@bloccs/client';
import { positionRelative } from '../../util/Util';
import ButtonContainer from '../ui/ButtonContainer';

export default class GameSummaryContainer extends Container {
  private readonly background: Graphics;

  private readonly scoresContainer: Container;

  private restartRoom: Room | null;

  constructor(private readonly screen: Rectangle) {
    super();

    this.background = new Graphics();
    this.scoresContainer = new Container();

    this.addChild(this.background, this.scoresContainer);

    this.visible = false;

    this.restartRoom = null;
  }

  public setRestartRoom(room: Room) {
    this.restartRoom = room;
  }

  public update(games: Game[]) {
    this.scoresContainer.removeChildren();

    let prevText = null;

    for (const game of games) {
      const text = new Text(`${game.player.name} ${game.score.score}`, {
        fontFamily: 'Press Start 2P',
        fontSize: 14,
        fill: 0xffffff,
      });

      if (prevText === null) {
        text.position.set(50, 50);
      } else {
        positionRelative(text, prevText, {
          left: 0,
          bottom: 8,
        });
      }

      this.scoresContainer.addChild(text);

      prevText = text;
    }

    const restartBtn = new ButtonContainer('PLAY AGAIN', () => {
      if (this.restartRoom !== null) {
        this.restartRoom.start();
      }
    });

    if (prevText === null) {
      restartBtn.position.set(50, 50);
    } else {
      positionRelative(restartBtn, prevText, {
        left: 0,
        bottom: 12,
      });
    }

    this.scoresContainer.addChild(restartBtn);

    this.updateLayout();
  }

  private updateLayout() {
    this.background.clear();

    this.background.beginFill(0x000000, 0.75);
    this.background.drawRect(0, 0, this.screen.width, this.screen.height);

    this.background.position.set(0, 0);

    this.scoresContainer.position.set(
      this.screen.width / 2 - this.scoresContainer.width / 2,
      this.screen.height / 2 - this.scoresContainer.height / 2,
    );
  }
}

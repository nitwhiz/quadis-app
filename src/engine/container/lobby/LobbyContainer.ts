import { Game, Room } from '@bloccs/client';
import { Container, Text } from 'pixi.js';

export default class LobbyContainer extends Container {
  private static getEntryText(game: Game): string {
    return `${game.player.name.padEnd(8, ' ')} ${(
      game.score.score + ''
    ).padStart(6, '0')}`;
  }

  public update(room: Room): void {
    const sortedGames = Object.values(room.games).sort(
      (gameA, gameB) => gameA.player.createAt - gameB.player.createAt,
    );

    let x = 0;

    // this is rather expensive, but maybe it's okay this way
    this.removeChildren();

    for (const game of sortedGames) {
      const wrapper = new Container();

      const nameText = new Text(LobbyContainer.getEntryText(game), {
        fontFamily: 'Press Start 2P',
        fontSize: 14,
        fill: 0xffffff,
      });

      nameText.name = 'text';
      nameText.position.set(0, 0);

      wrapper.name = game.id;
      wrapper.addChild(nameText);
      wrapper.position.set(0, 20 * x);

      this.addChild(wrapper);

      ++x;
    }
  }
}

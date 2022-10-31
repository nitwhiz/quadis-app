import GameContainer from './GameContainer';
import { Application } from '@pixi/app';

export default class GameHost {
  private isInjected = false;

  private readonly app: Application;

  private readonly games: Record<string, GameContainer>;

  constructor() {
    this.app = new Application({
      resizeTo: window,
      backgroundAlpha: 0,
      autoStart: true,
    });

    this.games = {};
  }

  public addGame(game: GameContainer) {
    this.app.stage.addChild(game);

    this.games[game.getId()] = game;
  }

  public removeGame(id: string) {
    if (!this.games[id]) {
      console.warn(`unknown game id %s`, id);
      return;
    }

    this.app.stage.removeChild(this.games[id]);

    this.games[id].destroy({
      children: true,
    });

    delete this.games[id];
  }

  public injectApp(): void {
    if (!this.isInjected) {
      document.body.appendChild(this.app.view as HTMLCanvasElement);
      this.isInjected = true;
    }
  }
}

import { Application } from 'pixi.js';
import GameContainer from './GameContainer';

export default class GameHost {
  private static INSTANCE: GameHost | null;

  private isInjected = false;

  private readonly app: Application;

  private readonly games: Record<string, GameContainer>;

  private constructor() {
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
      document.body.appendChild(this.app.view);
      this.isInjected = true;
    }
  }

  public static getInstance(): GameHost {
    if (!GameHost.INSTANCE) {
      GameHost.INSTANCE = new GameHost();
    }

    return GameHost.INSTANCE;
  }
}
import GameContainer from './GameContainer';
import { Application } from '@pixi/app';
import { GameLogger } from '../../logger/Logger';

export default class GameHost {
  private static readonly instance = new GameHost();

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

  public static getInstance(): GameHost {
    return GameHost.instance;
  }

  public addGame(game: GameContainer) {
    this.app.stage.addChild(game);

    this.games[game.getId()] = game;
  }

  public removeGame(id: string) {
    if (!this.games[id]) {
      GameLogger.warn(`unknown game id %s`, id);
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

  public show(): void {
    this.app.stage.visible = true;
  }

  public hide(): void {
    this.app.stage.visible = false;
  }
}

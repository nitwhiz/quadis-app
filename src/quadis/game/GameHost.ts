import { Application, UPDATE_PRIORITY } from 'pixi.js';
import Game from './Game';

export default class GameHost {
  private static INSTANCE: GameHost | null;

  private isInjected = false;

  private readonly app: Application;

  private readonly games: Record<string, Game>;

  private readonly tickerCallbacks: Record<string, () => void>;

  private constructor() {
    this.app = new Application({
      resizeTo: window,
      backgroundColor: 0x000000,
      backgroundAlpha: 0,
      autoStart: true,
    });

    this.games = {};
    this.tickerCallbacks = {};
  }

  public addGame(game: Game) {
    const linkedGameContainer = game.getDOMLinkedGameContainer();
    const linkedNextPieceContainer = game.getDOMLinkedNextPieceContainer();
    const linkedHoldPieceContainer = game.getDOMLinkedHoldPieceContainer();

    this.app.stage.addChild(linkedGameContainer);

    if (linkedNextPieceContainer) {
      this.app.stage.addChild(linkedNextPieceContainer);

      linkedNextPieceContainer.setDOMDimensions(20 + 15 * 4, 20 + 15 * 4);
    }

    if (linkedHoldPieceContainer) {
      this.app.stage.addChild(linkedHoldPieceContainer);

      linkedHoldPieceContainer.setDOMDimensions(20 + 15 * 4, 20 + 15 * 4);
    }

    // prevent glitching layout
    linkedGameContainer.update(true);
    linkedNextPieceContainer?.update(true);
    linkedHoldPieceContainer?.update(true);

    const cb = () => {
      linkedGameContainer.update();
      linkedNextPieceContainer?.update();
      linkedHoldPieceContainer?.update();
    };

    this.app.ticker.add(cb, this, UPDATE_PRIORITY.UTILITY);

    this.games[game.getId()] = game;
    this.tickerCallbacks[game.getId()] = cb;
  }

  public removeGame(id: string) {
    if (!this.games[id]) {
      console.warn(`unknown game id %s`, id);
      return;
    }

    const linkedGameContainer = this.games[id].getDOMLinkedGameContainer();
    const linkedNextPieceContainer =
      this.games[id].getDOMLinkedNextPieceContainer();
    const linkedHoldPieceContainer =
      this.games[id].getDOMLinkedHoldPieceContainer();

    this.app.stage.removeChild(linkedGameContainer);

    if (linkedNextPieceContainer) {
      this.app.stage.removeChild(linkedNextPieceContainer);
    }

    if (linkedHoldPieceContainer) {
      this.app.stage.removeChild(linkedHoldPieceContainer);
    }

    this.app.ticker.remove(this.tickerCallbacks[id], this);

    delete this.games[id];
    delete this.tickerCallbacks[id];
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

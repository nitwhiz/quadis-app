import { Application, Loader, Texture } from 'pixi.js';
import { Game, GameCommand, GameEvent, Room } from '@bloccs/client';
import PieceColorMap, { DictDefault } from '../container/piece/PieceColorMap';
import BlockRenderer from '../render/BlockRenderer';
import FontFaceObserver from 'fontfaceobserver';
import GameContainer, {
  GameContainerSettings,
} from '../container/game/GameContainer';
import { positionRelative, RelativePosition } from '../util/Util';
import ButtonContainer from '../container/ui/ButtonContainer';
import GameSummaryContainer from '../container/game/GameSummaryContainer';

const BLOCK_TEXTURE_LOADER_NAME = 'blockTexture';

const GAMES_PER_ROW = 3;

export default class GameHost {
  private static internalInstance: GameHost | null = null;

  private readonly app: Application;

  private readonly colorMap: PieceColorMap;

  private readonly games: Record<string, Game>;

  private readonly containers: Record<string, GameContainer>;

  private readonly blockTexture: Texture;

  private readonly blockRenderer: BlockRenderer;

  private startButton: ButtonContainer | null;

  public readonly summaryContainer: GameSummaryContainer;

  constructor() {
    this.app = new Application({
      resizeTo: window,
      autoStart: true,
      backgroundColor: 0x440044,
    });

    this.games = {};
    this.containers = {};

    if (!Loader.shared.resources[BLOCK_TEXTURE_LOADER_NAME].texture) {
      throw new Error('block texture not loaded');
    }

    this.colorMap = new PieceColorMap();

    this.blockTexture =
      Loader.shared.resources[BLOCK_TEXTURE_LOADER_NAME].texture;

    this.blockRenderer = new BlockRenderer(
      this.blockTexture,
      new PieceColorMap(DictDefault),
    );

    this.startButton = null;

    this.summaryContainer = new GameSummaryContainer(this.app.screen);

    this.summaryContainer.zIndex = 100;

    this.app.stage.addChild(this.summaryContainer);

    console.log('GameHost instance created');
  }

  public static loadResources(): Promise<void[]> {
    Loader.shared.add(
      BLOCK_TEXTURE_LOADER_NAME,
      new URL('/texture/block_base.png', import.meta.url).toString(),
    );

    return Promise.all<void>([
      new Promise((resolve) => {
        Loader.shared.load(() => {
          resolve();
        });
      }),
      new FontFaceObserver('Press Start 2P').load(),
    ]);
  }

  public static get instance() {
    if (GameHost.internalInstance === null) {
      GameHost.internalInstance = new GameHost();
    }

    return GameHost.internalInstance;
  }

  public destroy() {
    console.log('GameHost instance destroyed');

    this.app.stop();
    this.app.destroy(true, {
      texture: true,
      baseTexture: true,
      children: true,
    });
  }

  public addKeyboardListener(room: Room) {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowRight':
          room.sendCommand(GameCommand.RIGHT);
          break;
        case 'ArrowDown':
          room.sendCommand(GameCommand.DOWN);
          break;
        case 'ArrowLeft':
          room.sendCommand(GameCommand.LEFT);
          break;
        case ' ':
          room.sendCommand(GameCommand.HARD_LOCK);
          break;
        case 'ArrowUp':
          room.sendCommand(GameCommand.ROTATE);
          break;
        case 'c':
          room.sendCommand(GameCommand.HOLD);
          break;
        default:
          console.log(e.key);
          break;
      }
    });
  }

  public distributeBedrock(from: Game, to: Game, amount: number) {
    // todo
    console.log(`${from.id} -[${amount}]-> ${to.id}`);
  }

  public updateBedrockTargetMap(room: Room) {
    const targetGameId = room.bedrockTargetMap[room.mainPlayer.gameId];

    if (targetGameId) {
      console.log('current target', targetGameId);
    }
  }

  public displaySummary() {
    this.summaryContainer.update(Object.values(this.games));
    this.summaryContainer.visible = true;
  }

  public updateGames(room: Room) {
    if (room.mainPlayer === room.hostPlayer) {
      if (this.startButton === null) {
        this.startButton = new ButtonContainer('START', () => {
          room.start();
        });

        this.startButton.position.set(-1000, -1000);

        this.app.stage.addChild(this.startButton);
      }

      this.summaryContainer.setRestartRoom(room);
    }

    const roomGames = Object.values(room.games).sort(
      (gameA, gameB) => gameA.player.createAt - gameB.player.createAt,
    );

    for (const game of roomGames) {
      if (this.games[game.id]) {
        continue;
      }

      const gameContainer = this.createGameContainer(game, room);

      gameContainer.zIndex = 10;

      this.app.stage.addChild(gameContainer);

      this.containers[game.id] = gameContainer;
      this.games[game.id] = game;
    }

    for (const game of Object.values(this.games)) {
      if (!room.games[game.id]) {
        this.removeGame(game);
      }
    }

    if (this.startButton !== null) {
      positionRelative(
        this.startButton,
        this.containers[room.mainPlayer.gameId],
        {
          left: 0,
          bottom: 20,
        },
      );
    }

    this.updateGameContainersLayout(
      Object.values(this.games)
        .filter((g) => g.player !== room.mainPlayer)
        .sort((gameA, gameB) => gameA.player.createAt - gameB.player.createAt)
        .map((game) => this.containers[game.id]),
      room,
    );

    this.app.stage.sortChildren();
  }

  private updateGameContainersLayout(
    nonMainGameContainers: GameContainer[],
    room: Room,
  ) {
    for (let i = 0; i < nonMainGameContainers.length; ++i) {
      const gameContainer = nonMainGameContainers[i];
      const x = i % GAMES_PER_ROW;
      const y = Math.floor(i / GAMES_PER_ROW);

      if (x === 0 && y === 0) {
        positionRelative(
          gameContainer,
          this.containers[room.mainPlayer.gameId],
          {
            top: 0,
            right: 100,
          },
        );
      } else {
        let relativeContainer;
        const relativePosition: RelativePosition = {};

        if (x === 0) {
          relativeContainer = nonMainGameContainers[(y - 1) * GAMES_PER_ROW];
          relativePosition.left = 0;
          relativePosition.bottom = 32;
        } else {
          relativeContainer = nonMainGameContainers[x - 1 + y * GAMES_PER_ROW];
          relativePosition.right = 32;
          relativePosition.top = 0;
        }

        positionRelative(gameContainer, relativeContainer, relativePosition);
      }
    }
  }

  private createGameContainer(game: Game, room: Room) {
    const isMain = game.player === room.mainPlayer;

    const gameContainerSettings: GameContainerSettings = {
      showName: true,
      showScore: true,
      showNextPiece: true,
      showHoldPiece: true,
    };

    if (!isMain) {
      gameContainerSettings.showNextPiece = false;
      gameContainerSettings.showHoldPiece = false;
    }

    const gameContainer = new GameContainer(
      game,
      gameContainerSettings,
      this.blockRenderer,
      24,
    );

    if (!isMain) {
      gameContainer.scale.set(0.75);
    } else {
      gameContainer.position.set(16, 16);
    }

    return gameContainer;
  }

  public removeGame(game: Game) {
    const gameContainer = this.containers[game.id];

    delete this.containers[game.id];
    delete this.games[game.id];

    gameContainer.destroy({
      children: true,
    });
  }

  public get view() {
    return this.app.view;
  }
}

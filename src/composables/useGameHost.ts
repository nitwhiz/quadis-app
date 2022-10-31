import GameHost from '../quadis/game/GameHost';

const gameHost = new GameHost();

export const useGameHost = () => {
  return gameHost;
};

import GameHost from '../engine/game/GameHost';
import { Room, RoomEvent, RoomService } from '@bloccs/client';
import { ref } from 'vue';

const canvasView = ref(null as HTMLCanvasElement | null);

let gameRoom: Room | null = null;

const load = (playerName: string, joinRoomId?: string) => {
  if (gameRoom !== null) {
    return Promise.resolve(gameRoom);
  }

  return GameHost.loadResources()
    .then(() => {
      canvasView.value = GameHost.instance.view;

      const roomService = new RoomService(playerName, 'localhost:7000');

      if (joinRoomId) {
        return roomService.joinRoom(joinRoomId);
      } else {
        return roomService.createRoom();
      }
    })
    .then((room) => {
      gameRoom = room;

      room.addListener(RoomEvent.UPDATE_GAMES, () => {
        GameHost.instance.updateGames(room);
      });

      room.addListener(RoomEvent.UPDATE_BEDROCK_TARGET_MAP, () => {
        GameHost.instance.updateBedrockTargetMap(room);
      });

      room.addListener(RoomEvent.DISTRIBUTE_BEDROCK, (bedrockDistribution) => {
        GameHost.instance.distributeBedrock(
          bedrockDistribution.from,
          bedrockDistribution.to,
          bedrockDistribution.amount,
        );
      });

      room.addListener(RoomEvent.STOP, () => {
        GameHost.instance.displaySummary();
      });

      GameHost.instance.addKeyboardListener(room);

      console.log('ready!');

      // room.start().then(() => {
      //   console.log('started');
      // });

      return room;
    });
};

const useGameHost = () => {
  return {
    load,
    canvasView,
  };
};

export default useGameHost;

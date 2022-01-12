import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import usePlayerName from './composables/usePlayerName';
import axios from 'axios';
import useRoomService from './composables/useRoomService';

export default createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/RoomJoinView.vue'),
    },
    {
      path: '/rooms/:roomId/lobby',
      name: 'room-lobby',
      component: () => import('./views/RoomLobbyView.vue'),
      beforeEnter: (to, from, next) => {
        // todo: go to room-main if directly accessed

        const { ensureRoomService } = useRoomService();

        if (ensureRoomService(to.params.roomId as string)) {
          next();
        } else {
          console.error('unable to create room service');

          next({
            name: 'home',
          });
        }
      },
    },
    {
      path: '/rooms/:roomId/join',
      name: 'room-join',
      component: () => import('./views/RoomJoinView.vue'),
      beforeEnter: (to, from, next) => {
        // todo: go to room-main if directly accessed

        axios
          .get(`http://localhost:7000/rooms/${to.params.roomId as string}`)
          .then(() => {
            next();
          })
          .catch(() => {
            next('/');
          });
      },
    },
    {
      path: '/rooms/:roomId',
      name: 'room-main',
      component: () => import('./views/RoomView.vue'),
      beforeEnter: (to, from, next) => {
        axios
          .get(`http://localhost:7000/rooms/${to.params.roomId as string}`)
          .then(() => {
            const { isConfirmed } = usePlayerName();

            if (!isConfirmed.value) {
              next({
                name: 'room-join',
                params: {
                  roomId: to.params.roomId,
                },
              });
            } else {
              const { ensureRoomService, roomService } = useRoomService();

              if (ensureRoomService(to.params.roomId as string)) {
                if (roomService?.isStarted()) {
                  next();
                } else {
                  next({
                    name: 'room-lobby',
                    params: {
                      roomId: to.params.roomId,
                    },
                  });
                }
              } else {
                console.error('unable to create room service');

                next({
                  name: 'home',
                });
              }
            }
          })
          .catch(() => {
            next({
              name: 'home',
            });
          });
      },
    },
  ] as RouteRecordRaw[],
});

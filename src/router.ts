import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import axios from 'axios';
import RoomService from './quadis/room/RoomService';

export default createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/HomeView.vue'),
    },
    {
      path: '/rooms/:roomId',
      name: 'room',
      component: () => import('./views/room/RoomView.vue'),
      beforeEnter: (to, from, next) => {
        const roomId = to.params.roomId;

        axios
          .get(
            `${RoomService.tls ? 'https' : 'http'}://${
              RoomService.gameServer
            }/rooms/${roomId}`,
          )
          .then(() => next())
          .catch(() =>
            next({
              name: 'home',
            }),
          );
      },
    },
  ] as RouteRecordRaw[],
});

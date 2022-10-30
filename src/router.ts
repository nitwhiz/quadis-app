import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import axios from 'axios';
import RoomService from './quadis/room/RoomService';

export default createRouter({
  history: createWebHashHistory('/'),
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
          .get(RoomService.getUrl('http', `rooms/${roomId}`))
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

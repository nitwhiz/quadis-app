import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import axios from 'axios';

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
          .get(`http://${import.meta.env.VITE_GAME_SERVER}/rooms/${roomId}`)
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

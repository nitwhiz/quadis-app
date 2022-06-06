import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import axios from 'axios';

export default createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: {
        name: 'room',
        params: {
          roomId: 'new',
        },
      },
    },
    {
      path: '/rooms/:roomId',
      name: 'room',
      component: () => import('./views/room/RoomView.vue'),
      beforeEnter: (to, from, next) => {
        const roomId = to.params.roomId;

        if (roomId !== 'new') {
          axios
            .get(`http://${import.meta.env.VITE_GAME_SERVER}/rooms/${roomId}`)
            .then(() => next())
            .catch(() =>
              next({
                name: 'room',
                params: {
                  roomId: 'new',
                },
              }),
            );
        } else {
          next();
        }
      },
    },
  ] as RouteRecordRaw[],
});

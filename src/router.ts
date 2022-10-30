import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

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
    },
  ] as RouteRecordRaw[],
});

import { createWebHashHistory, createRouter } from 'vue-router';
import DefaultRoutes from '@src/router/modules/default';
import NotFoundRoutes from '@src/router/modules/not-found';
import BigScreenRoutes from '@src/router/modules/big-screen';

const routes = [...DefaultRoutes, ...BigScreenRoutes, ...NotFoundRoutes];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

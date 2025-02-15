import { createWebHashHistory, createRouter } from 'vue-router';
import DefaultRoutes from '@src/router/modules/default';
import NotFoundRoutes from '@src/router/modules/not-found';

const routes = [...DefaultRoutes, ...NotFoundRoutes];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

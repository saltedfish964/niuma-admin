import { createWebHashHistory, createRouter } from 'vue-router';
import BasicRoutes from '@src/router/modules/basic';

const routes = [...BasicRoutes];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

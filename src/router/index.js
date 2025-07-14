import { createWebHashHistory, createRouter } from 'vue-router';
import BasicRoutes from '@src/router/modules/basic';
import { useLayoutStore } from '@src/store/modules/layout';

const routes = [...BasicRoutes];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const layoutStore = useLayoutStore();
  const meta = to.meta;
  layoutStore.updateTabByKey(meta.key);
  layoutStore.updateMenuActiveByKey(meta.key);
  next();
});

export default router;

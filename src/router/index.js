import { createWebHashHistory, createRouter } from 'vue-router';
import BasicRoutes from '@src/router/modules/basic';
import { useLayoutStore } from '@src/store/modules/layout';
import { useUserStore } from '@src/store/modules/user';
import { getMenu } from '@src/api/menu';
import { mergeNewConfigToMenuConfig } from '@src/utils/config';
import { addRoutes } from '@src/router/dynamicRoutes';

const routes = [...BasicRoutes];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const layoutStore = useLayoutStore();
  const userStore = useUserStore();

  const token = userStore.getToken();

  if (!token) {
    if (to.path === '/login') {
      next();
    } else {
      next('/login');
    }
  } else {
    if (layoutStore.menuList.length === 0) {
      const res = await getMenu();
      const config = mergeNewConfigToMenuConfig(res);
      layoutStore.generateMenuList(config);
      addRoutes(config);
      const path = sessionStorage.getItem('currentRouteFullPath');
      if (path) {
        next(path);
        sessionStorage.removeItem('currentRouteFullPath');
      } else {
        next();
      }
    } else if (to.path === '/login') {
      next(from);
    } else {
      const meta = to.meta;
      layoutStore.updateTabByKey(meta.key);
      layoutStore.updateMenuActiveByKey(meta.key);
      next();
    }
  }
});

export default router;

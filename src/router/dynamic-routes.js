import { defineComponent, h } from 'vue';
import NiuMaAsyncViewMap from 'virtual:niuma-async-view-map';
import router from '@src/router';

const allViewKey = Object.keys(NiuMaAsyncViewMap);

/**
 * 生成路由
 */
function generateRoutes(config = []) {
  let routes = [];

  function loop(loopArr) {
    loopArr.forEach((item) => {
      if (item.path) {
        const component = item?.meta?.component;
        const isInclude = allViewKey.includes(component);
        if (!isInclude) {
          console.error(`[src/views] 文件夹下没有 [${component}] 文件夹, 请检查!`);
        }
        const newItem = {
          ...item,
          component: isInclude
            ? NiuMaAsyncViewMap[component].component
            : defineComponent({
                name: 'NotHaveView',
                setup() {
                  return () => h('div', '动态路由加载失败的页面');
                },
              }),
        };
        if (!newItem.meta) newItem.meta = {};
        newItem.meta.layout = item?.meta?.layout || 'bank';
        newItem.meta.key = item.key;
        if (item?.meta?.iframeSrc) {
          newItem.props = (route) => {
            return {
              src: decodeURIComponent(route.meta.iframeSrc),
            };
          };
        }
        routes.push(newItem);
      }
      if (item.children) {
        loop(item.children);
      }
    });
  }

  loop(config);

  routes = routes.filter((item) => {
    return item?.meta?.unloadRouter !== true;
  });

  const pathSet = new Set();
  routes.forEach((item) => {
    if (pathSet.has(item.path)) {
      throw new Error(`[generateRoutes] 出现重复 path 值: ${item.path}`);
    }
    pathSet.add(item.path);
  });

  routes = routes.filter((item) => {
    return pathSet.has(item.path);
  });

  // 根据 key 过滤重复的路由
  const keySet = new Set();
  routes.forEach((item) => {
    if (keySet.has(item.key)) {
      throw new Error(`[generateRoutes] 出现重复 key 值: ${item.key}`);
    }
    keySet.add(item.key);
  });

  routes = routes.filter((item) => {
    return keySet.has(item.key);
  });

  return routes;
}

/**
 * 添加路由
 * @param {MenuItem[]} config
 */
export function addRoutes(config = []) {
  const newConfig = generateRoutes(config);
  const mainLayoutRoute = {
    component: () => import('@src/layout/main/index.vue'),
    children: [],
  };
  const bankLayoutRoute = {
    component: () => import('@src/layout/bank/index.vue'),
    children: [],
  };
  newConfig.forEach((item) => {
    switch (item?.meta?.layout) {
      case 'main':
        mainLayoutRoute.children.push(item);
        break;
      case 'bank':
        bankLayoutRoute.children.push(item);
        break;
      default:
        break;
    }
  });
  router.addRoute(mainLayoutRoute);
  router.addRoute(bankLayoutRoute);

  // 最后添加 404 路由
  router.addRoute({
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  });
}

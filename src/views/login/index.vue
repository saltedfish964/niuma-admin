<script setup>
/// <reference path="../../types/menu.js" />
import { defineComponent, h } from 'vue';
import { useRouter } from 'vue-router';
import NiuMaAsyncViewMap from 'virtual:niuma-async-view-map';
import { useLayoutStore } from '@src/store/modules/layout';
import projectConfig from '@src/config';

const layoutStore = useLayoutStore();
const router = useRouter();

const allViewKey = Object.keys(NiuMaAsyncViewMap);

function validateMenu(menu) {
  if (!menu) return true;
  const idSet = new Set();
  const stack = [...menu];
  while (stack.length) {
    const node = stack.pop();
    if (node.key === undefined) {
      console.error(`[validateMenu] 警告: 缺少 key 属性:`, node);
      return false;
    }
    if (idSet.has(node.key)) {
      console.error(`[validateMenu] 警告: 出现重复 key 值:`, node.key);
      return false;
    }
    idSet.add(node.key);
    if (node.children && Array.isArray(node.children)) {
      stack.push(...node.children);
    }
  }
  return true;
}

/**
 * 生成本地菜单
 * @param {MenuItem[]} arr config.js 中的 menu 配置
 */
function generateLocalMenu(arr = []) {
  const showMenu = arr.filter((item) => {
    const hide = item?.meta?.hide;
    return !hide;
  });
  return showMenu.map((item) => {
    const result = {
      ...item,
    };
    if (item.children) {
      result.children = generateLocalMenu(item.children);
    }
    return result;
  });
}

/**
 * 生成本地路由
 * @param {MenuItem[]} arr config.js 中的 menu 配置
 */
function generateLocalRoutes(arr = []) {
  let result = [];

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
        result.push(newItem);
      }
      if (item.children) {
        loop(item.children);
      }
    });
  }

  loop(arr);

  result = result.filter((item) => {
    return item?.meta?.unloadRouter !== true;
  });

  return result;
}

/**
 * 生成远程菜单
 * @param {MenuItem[]} arr
 */
function generateRemoteMenu(arr = []) {
  return [];
}

/**
 * 生成远程路由
 * @param {MenuItem[]} arr
 */
function generateRemoteRoutes(arr = []) {
  return [];
}

/**
 * 添加路由
 * @param {MenuItem[]} arr
 */
function addRoutes(arr = []) {
  const mainLayoutRoute = {
    component: () => import('@src/layout/main/index.vue'),
    children: [],
  };
  const bankLayoutRoute = {
    component: () => import('@src/layout/bank/index.vue'),
    children: [],
  };
  arr.forEach((item) => {
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

function onLogin() {
  const localMenuIsValid = validateMenu(projectConfig.menu);
  if (!localMenuIsValid) return;

  // 本地菜单
  const localMenu = generateLocalMenu(projectConfig.menu);
  // 远程菜单
  // TODO: 请求接口获取菜单数据
  const remoteMenu = generateRemoteMenu([]);

  let menu = [...localMenu, ...remoteMenu];
  layoutStore.setMenuList(menu);

  // 提取本地配置中的所有路由
  const localRoutes = generateLocalRoutes(projectConfig.menu);

  // 提取远程配置中的所有路由
  const remoteRoutes = generateRemoteRoutes([]);

  let routes = [...localRoutes, ...remoteRoutes];
  // 根据 path 过滤重复的路由
  const pathSet = new Set();
  routes.forEach((item) => {
    if (pathSet.has(item.path)) {
      throw new Error(`出现重复 path 值: ${item.path}`);
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
      throw new Error(`出现重复 key 值: ${item.key}`);
    }
    keySet.add(item.key);
  });

  routes = routes.filter((item) => {
    return keySet.has(item.key);
  });

  addRoutes(routes);

  router.push('/icon');
}
</script>

<template>
  <div>
    <a-button @click="onLogin">登录</a-button>
  </div>
</template>

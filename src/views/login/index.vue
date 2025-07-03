<script setup>
import { h } from 'vue';
import { useRouter } from 'vue-router';
import NiuMaAsyncViewMap from 'virtual:niuma-async-view-map';
import projectConfig from '@src/config.js';
import VIcon from '@src/components/icon/icon.vue';

const router = useRouter();

const allViewKey = Object.keys(NiuMaAsyncViewMap);

function generateMenu(menu = []) {
  const showMenu = menu.filter((item) => {
    const hide = item?.meta?.hide;
    return !hide;
  });
  return showMenu.map((item) => {
    const result = {
      ...item,
    };
    if (item.children) {
      result.children = generateMenu(item.children);
    }
    return result;
  });
}

function generateRoutes(menu = []) {
  const mainLayoutRoute = {
    component: () => import('@src/layout/main/index.vue'),
    children: [],
  };
  const bankLayoutRoute = {
    component: () => import('@src/layout/bank/index.vue'),
    children: [],
  };

  function loop(loopMenu) {
    loopMenu.forEach((item) => {
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
            : () => h('div', '动态路由加载失败的页面'),
        };
        const layout = item?.meta?.layout;
        switch (layout) {
          case 'main':
            mainLayoutRoute.children.push(newItem);
            break;
          case 'bank':
            bankLayoutRoute.children.push(newItem);
            break;

          default:
            bankLayoutRoute.children.push(newItem);
            break;
        }
      }
      if (item.children) {
        loop(item.children);
      }
    });
  }

  loop(menu);

  const result = [mainLayoutRoute, bankLayoutRoute].filter((item) => {
    return item.children.length > 0;
  });

  return [
    ...result,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ];
}

function onLogin() {
  // 菜单
  const menu = generateMenu(projectConfig.menu);
  console.log(menu);
  // 路由
  const routes = generateRoutes(projectConfig.menu);
  routes.forEach((item) => {
    router.addRoute(item);
  });
  router.push('/bank-test');
}
</script>

<template>
  <div>
    <a-button @click="onLogin">登录</a-button>
    <v-icon name="ant-design-icon-menu-unfold-outlined"></v-icon>
    <v-icon name="flat-color-icons-icon-home"></v-icon>
    <v-icon name="ant-design-icon-coffee-outlined"></v-icon>
    <v-icon name="ant-design-icon-table-outlined"></v-icon>
    <v-icon name="custom-icon-vue"></v-icon>
  </div>
</template>

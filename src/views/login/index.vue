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
 * 生成菜单
 * @param {MenuItem[]} arr config.js 中的 menu 配置
 */
function generateMenu(arr = []) {
  const showMenu = arr.filter((item) => {
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

/**
 * 生成路由
 * @param {MenuItem[]} arr config.js 中的 menu 配置
 */
function generateRoutes(arr = []) {
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
        newItem.meta.key = item.key;
        if (item?.meta?.iframeSrc) {
          newItem.props = (route) => {
            return {
              src: decodeURIComponent(route.meta.iframeSrc),
            };
          };
        }
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
  const localMenu = generateMenu(projectConfig.menu);
  // 远程菜单
  // TODO: 请求接口获取菜单数据
  const remoteMenu = generateMenu([]);

  let menu = [...localMenu, ...remoteMenu];
  layoutStore.setMenuList(menu);

  // 提取本地配置中的所有路由
  const localRoutes = generateRoutes(projectConfig.menu);

  // 提取远程配置中的所有路由
  const remoteRoutes = generateRoutes([]);

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
  <div
    class="background bg-gradient-to-r from-[#458cfb] dark:from-[#111827] to-[#f2f6fe] dark:to-[#111827] flex h-screen w-screen overflow-auto"
  >
    <div class="background-img"></div>
    <div class="right-content">
      <div class="header">
        <span class="title"> Niuma Admin </span>
      </div>
      <div class="main">
        <div class="form-content">
          <div class="form-content-title">登录</div>
          <div class="form-content-form">
            <a-form ref="formRef">
              <a-form-item name="username">
                <a-input placeholder="账号"></a-input>
              </a-form-item>
              <a-form-item name="password">
                <a-input-password placeholder="密码"></a-input-password>
              </a-form-item>
              <a-form-item>
                <a-button
                  class="form-content-form-login-btn"
                  type="primary"
                  html-type="submit"
                  @click="onLogin"
                >
                  <span>登录</span>
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>
      <div class="footer">MIT Licensed | Copyright © 2024</div>
    </div>
  </div>
</template>

<style scoped>
.background {
  background-image: linear-gradient(to right, #458cfb, #f2f6fe);
  height: 100vh;
  width: 100vw;
  overflow: auto;
  display: flex;
}
.background-img {
  background: url('@src/assets/imgs/login-bg.svg');
  background-size: auto;
  background-position: center;
  background-repeat: no-repeat;
  display: none;
  flex-grow: 1;
}
.right-content {
  width: 100%;
  flex: none;
  display: flex;
  flex-direction: column;
}
.header {
  padding: 1.5rem;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
}
.header .title {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
}
.main {
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.form-content {
  width: 100%;
  max-width: 360px;
  border-radius: 0.5rem;
  background-color: #ffffffaa;
  padding: 1.5rem;
  box-shadow:
    0 0 #0000,
    0 0 #0000,
    0 25px 50px -12px rgb(0 0 0 / 0.25);
}
.form-content-title {
  font-size: 1.5rem;
  line-height: 2rem;
}
.form-content-form {
  padding-top: 1rem;
}
.form-content-form-login-btn {
  width: 100%;
}
.footer {
  flex: none;
  padding: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #66748b;
}
@media (min-width: 1280px) {
  .background-img {
    display: block;
  }
  .right-content {
    width: 50%;
  }
}
</style>

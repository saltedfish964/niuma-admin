<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { isEqual, head } from 'lodash-es';
import { useLayoutStore } from '@src/store/modules/layout';
import MainMenuItem from '@src/layout/main/main-menu-item.vue';
import { findTreePathBFS } from '@src/utils/tree';
import VIcon from '@src/components/icon/icon.vue';
import TabsController from './tabs/tabs.vue';
import HeaderAvatar from './avatar.vue';

const layoutStore = useLayoutStore();
const router = useRouter();
const tabsRef = ref();

function mainMenuClickHandler(menu) {
  if (menu.key === layoutStore.menuActiveKey) {
    return;
  }
  if (menu.path) {
    router.push(menu.path);
  }
  layoutStore.setMenuActiveKey(menu.key);
}

function tabsChangeHandler(val) {
  if (val === layoutStore.activeTabKey) {
    return;
  }
  layoutStore.setActiveTabKey(val);
}

function tabsSelectHandler(tab) {
  const { menu } = tab;
  if (!menu) return;
  router.push(menu.path);
}

function updateOpenKeys() {
  const activeKey = layoutStore.activeTabKey;
  const result = findTreePathBFS(layoutStore.menuList, (node) => {
    return node.key === activeKey;
  });
  if (!result) return;
  const path = result.path;
  if (path.length === 0) return;
  const node = result.node;
  const root = head(path);
  let openkeys = path.map((node) => node.key);
  openkeys = new Set([...openkeys]);
  if (!layoutStore.menuCollapsed) {
    layoutStore.setSecondaryMenuOpenKeys(Array.from(openkeys));
  }
  layoutStore.setMenuActiveKey(root.key);
  layoutStore.setSecondaryMenuActiveKey([node.key]);
}

async function secondaryMenuSelectHandler({ item, keyPath }) {
  if (isEqual(keyPath, layoutStore.secondaryMenuActiveKey)) {
    return;
  }
  router.push(item.path);
}

function toggleMenuCollapsedHandler() {
  layoutStore.toggleMenuCollapsed();
  updateOpenKeys();
}
</script>

<template>
  <div class="layout">
    <div class="menu">
      <div v-if="layoutStore.hasMainMenu" class="main-menu">
        <div class="main-menu-logo">
          <v-icon name="custom-icon-vue" size="28px"></v-icon>
        </div>
        <div class="main-menu-content mini-scroll-white">
          <main-menu-item
            v-for="menu in layoutStore.menuList"
            :key="menu.key"
            :menu="menu"
            :menu-active-key="layoutStore.menuActiveKey"
            @click="mainMenuClickHandler(menu)"
          ></main-menu-item>
        </div>
      </div>
      <div
        v-if="layoutStore.secondaryMenuList.length > 0"
        class="secondary-menu"
        :style="{ width: layoutStore.menuCollapsed ? '51px' : '240px' }"
      >
        <div class="secondary-menu-title">
          <transition name="slide-up">
            <div v-if="!layoutStore.menuCollapsed" class="secondary-menu-title-text">
              NiuMa Admin
            </div>
            <div v-else class="collapsed-btn-container" @click="toggleMenuCollapsedHandler">
              <v-icon name="ant-design-icon-menu-unfold-outlined" size="20px"></v-icon>
            </div>
          </transition>
        </div>
        <div class="secondary-menu-content mini-scroll-black">
          <a-menu
            mode="inline"
            v-model:open-keys="layoutStore.secondaryMenuOpenKeys"
            :items="layoutStore.secondaryMenuList"
            :inline-collapsed="layoutStore.menuCollapsed"
            :selected-keys="layoutStore.secondaryMenuActiveKey"
            @select="secondaryMenuSelectHandler"
          ></a-menu>
        </div>
        <div class="secondary-menu-footer">
          <div class="collapsed-btn-container" @click="toggleMenuCollapsedHandler">
            <v-icon
              :name="
                layoutStore.menuCollapsed
                  ? 'ant-design-icon-menu-unfold-outlined'
                  : 'ant-design-icon-menu-fold-outlined'
              "
              size="20px"
            ></v-icon>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="content-header">
        <header-avatar></header-avatar>
      </div>
      <div class="content-tabs">
        <div class="content-tabs-container">
          <tabs-controller
            ref="tabsRef"
            :active-tab-key="layoutStore.activeTabKey"
            @update:active-tab-key="tabsChangeHandler"
            @select="tabsSelectHandler"
          ></tabs-controller>
        </div>
      </div>
      <div class="content-body">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: auto;
  --header-height: 60px;
}
.menu {
  display: flex;
  flex: none;
}
.main-menu {
  display: flex;
  flex-direction: column;
  flex: none;
  background: #031529;
}

.main-menu-logo {
  flex: none;
  display: flex;
  width: 100%;
  height: var(--header-height);
  align-items: center;
  justify-content: center;
}
.main-menu-content {
  flex: 1;
  overflow: auto;
  padding-top: 8px;
}
.secondary-menu {
  flex: none;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  width: 240px;
  transition: all 0.3s ease;
}
.secondary-menu-title {
  flex: none;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid var(--border-color);
  overflow: hidden;
}
.secondary-menu-title-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.collapsed-btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 4px;
  transition: all 0.3s ease;
}
.collapsed-btn-container:hover {
  background: #f0f0f0;
  cursor: pointer;
}
.secondary-menu-content {
  flex: 1;
  overflow: auto;
}
.secondary-menu-content :deep(.ant-menu-inline-collapsed) {
  width: 50px;
}
.secondary-menu-content .ant-menu-light.ant-menu-root.ant-menu-inline,
.secondary-menu-content :deep(.ant-menu-light.ant-menu-root.ant-menu-vertical) {
  border-inline-end: none;
}
.secondary-menu-footer {
  height: var(--header-height);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
}
.content-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 16px;
  height: var(--header-height);
  border-bottom: 1px solid var(--border-color);
}
.content-tabs {
  flex: none;
  overflow: auto;
  width: 100%;
  border-bottom: 1px solid var(--border-color);
}
.content-tabs-container {
  width: 100%;
  height: 100%;
}
.content-body {
  flex: 1;
  overflow: auto;
  background: var(--border-color);
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  font-size: 0;
}
</style>

<style>
.ant-menu-submenu.ant-menu-submenu-popup .ant-menu-item {
  display: flex;
}
.ant-menu-submenu.ant-menu-submenu-popup .ant-menu-title-content {
  flex: 1;
  max-width: 200px;
}
</style>

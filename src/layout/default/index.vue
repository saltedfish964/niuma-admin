<script setup>
import { useRouter } from 'vue-router';
import { isEqual } from 'lodash-es';
import { useLayoutStore } from '@src/store/modules/layout';
import VTabs from '@src/components/tabs/tabs.vue';
import VIcon from '@src/components/icon/icon.vue';
import MainMenuItem from '@src/layout/default/main-menu-item.vue';

const layoutStore = useLayoutStore();
const router = useRouter();

function mainMenuClickHandler(menu) {
  if (menu.key === layoutStore.menuActiveKey) {
    return;
  }
  layoutStore.setMenuActiveKey(menu.key);
}

function tabsChangeHandler(val) {
  if (val === layoutStore.activeTabKey) {
    return;
  }
  layoutStore.setActiveTabKey(val);
}

function secondaryMenuSelectHandler({ item, keyPath }) {
  if (isEqual(keyPath, layoutStore.secondaryMenuActiveKey)) {
    return;
  }

  const { originItemValue } = item;

  if (originItemValue.outlink) {
    return;
  }

  if (originItemValue.iframe) {
    originItemValue.iframe?.src &&
      router.push({
        name: 'iframe',
        query: {
          src: originItemValue.iframe.src,
        },
      });
  }

  layoutStore.setSecondaryMenuActiveKey(keyPath);
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
        :style="{ width: layoutStore.menuCollapsed ? '81px' : '240px' }"
      >
        <div class="secondary-menu-title">
          <transition name="slide-up">
            <div
              v-if="!layoutStore.menuCollapsed"
              class="secondary-menu-title-text"
            >
              NiuMa Admin
            </div>
            <div
              v-else
              class="collapsed-btn-container"
              @click="layoutStore.toggleMenuCollapsed"
            >
              <v-icon
                name="ant-design-icon-menu-unfold-outlined"
                size="24px"
              ></v-icon>
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
          <div
            class="collapsed-btn-container"
            @click="layoutStore.toggleMenuCollapsed"
          >
            <v-icon
              :name="
                layoutStore.menuCollapsed
                  ? 'ant-design-icon-menu-unfold-outlined'
                  : 'ant-design-icon-menu-fold-outlined'
              "
              size="24px"
            ></v-icon>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="content-header"></div>
      <div class="content-tabs">
        <div class="content-tabs-container">
          <v-tabs
            :active-tab-key="layoutStore.activeTabKey"
            :init-data="layoutStore.tabsConfig"
            @update:active-tab-key="tabsChangeHandler"
          ></v-tabs>
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
  flex: none;
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

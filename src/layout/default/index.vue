<script setup>
import { useLayoutStore } from '@src/store/modules/layout';
import VTabs from '@src/components/tabs/tabs.vue';
import VIcon from '@src/components/icon/icon.vue';

const layoutStore = useLayoutStore();

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

function secondaryMenuSelectHandler({ keyPath }) {
  layoutStore.setSecondaryMenuActiveKey(keyPath);
}
</script>

<template>
  <div class="layout">
    <div class="menu">
      <div class="main-menu">
        <div class="main-menu-logo">Logo</div>
        <div class="main-menu-content mini-scroll-white">
          <div
            class="main-menu-item"
            v-for="menu in layoutStore.menuList"
            :key="menu.key"
          >
            <div
              class="main-menu-item-content"
              :class="[
                layoutStore.menuActiveKey === menu.key
                  ? 'main-menu-item-content-active'
                  : '',
              ]"
              @click="mainMenuClickHandler(menu)"
            >
              <div class="main-menu-item-content-container">
                <div class="main-menu-item-content-icon">
                  <component :is="menu.icon"></component>
                </div>
                <div class="main-menu-item-content-name">{{ menu.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
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
  background: #cd9b56;
}
.main-menu-content {
  flex: 1;
  overflow: auto;
  padding-top: 8px;
}
.main-menu-item {
  width: 70px;
  display: flex;
  justify-content: center;
  padding-bottom: 8px;
}
.main-menu-item-content {
  width: 54px;
  height: 54px;
  border-radius: 4px;
  background: #061529;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: all 0.3s ease;
}
.main-menu-item-content:hover {
  background: #5594fd;
  cursor: pointer;
}
.main-menu-item-content-active,
.main-menu-item-content-active:hover {
  background: #5271fb;
}
.main-menu-item-content-container {
  width: 100%;
}
.main-menu-item-content-icon {
  display: flex;
  justify-content: center;
  padding-bottom: 4px;
}
.main-menu-item-content-name {
  flex: none;
  text-align: center;
  padding: 0 8px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

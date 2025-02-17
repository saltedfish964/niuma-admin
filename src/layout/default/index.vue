<script setup>
import { ref, h } from 'vue';
import VTabs from '@src/components/tabs/tabs.vue';
import VIcon from '@src/components/icon/icon.vue';

const items = ref([
  {
    key: 'mail',
    label: 'Navigation One',
    title: 'Navigation One',
    icon: () => h(VIcon, { name: 'material-symbols-icon-10k-outline' }),
  },
  {
    key: 'app',
    label: 'Navigation Two',
    title: 'Navigation Two',
    icon: () => h(VIcon, { name: 'custom-icon-vite' }),
  },
  {
    key: 'sub1',
    label: 'Navigation Three - Submenu',
    title: 'Navigation Three - Submenu',
    icon: h(VIcon, { name: 'custom-icon-vue' }),
    children: [
      {
        type: 'group',
        label: 'Item 1',
        children: [
          {
            label: 'Option 1',
            key: 'setting:1',
          },
          {
            label: 'Option 2',
            key: 'setting:2',
          },
        ],
      },
      {
        type: 'group',
        label: 'Item 2',
        children: [
          {
            label: 'Option 3',
            key: 'setting:3',
          },
          {
            label: 'Option 4',
            key: 'setting:4',
          },
        ],
      },
    ],
  },
  // {
  //   key: 'alipay',
  //   label: h(
  //     'a',
  //     { href: 'https://antdv.com', target: '_blank' },
  //     'Navigation Four - Link',
  //   ),
  //   title: 'Navigation Four - Link',
  // },
]);
const collapsed = ref(false);

const activeTabKey = ref('home');
const tabs = ref([
  { key: 'home', name: '首页' },
  { key: 'long', name: '这是一个很长的 Tabs 名字' },
]);
for (let i = 0; i < 10; i++) {
  tabs.value.push({
    key: `tab${i}`,
    name: `Tab ${i} - ${Math.random()
      .toString(36)
      .slice(3, Math.random() * 20 + 3)}`,
  });
}

function toggleMenuHandler() {
  collapsed.value = !collapsed.value;
}
</script>

<template>
  <div class="layout">
    <div class="menu">
      <div class="main-menu">
        <div class="main-menu-logo">Logo</div>
        <div class="main-menu-content mini-scroll-white">
          <div class="main-menu-item" v-for="item in 20" :key="item">
            <div class="main-menu-item-content"></div>
          </div>
        </div>
      </div>
      <div
        class="secondary-menu"
        :style="{ width: collapsed ? '81px' : '240px' }"
      >
        <div class="secondary-menu-title">
          <transition name="slide-up">
            <div v-if="!collapsed" class="secondary-menu-title-text">
              NiuMa Admin
            </div>
            <div
              v-else
              class="collapsed-btn-container"
              @click="toggleMenuHandler"
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
            :items="items"
            :inline-collapsed="collapsed"
          ></a-menu>
        </div>
        <div class="secondary-menu-footer">
          <div class="collapsed-btn-container" @click="toggleMenuHandler">
            <v-icon
              :name="
                collapsed
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
            v-model:active-tab-key="activeTabKey"
            :init-data="tabs"
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
}
.main-menu-item {
  width: 60px;
  height: 60px;
  padding: 8px;
}
.main-menu-item-content {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: #5271fb;
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

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  display: none;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  font-size: 0;
}
</style>

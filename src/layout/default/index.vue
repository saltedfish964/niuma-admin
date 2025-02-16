<script setup>
import { ref } from 'vue';
import VTabs from '@src/components/tabs/tabs.vue';

const items = ref([
  {
    key: 'mail',
    label: 'Navigation One',
    title: 'Navigation One',
  },
  {
    key: 'app',
    label: 'Navigation Two',
    title: 'Navigation Two',
  },
  {
    key: 'sub1',
    label: 'Navigation Three - Submenu',
    title: 'Navigation Three - Submenu',
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
</script>

<template>
  <div class="layout">
    <div class="menu">
      <div class="main-menu">
        <div class="main-menu-logo">Logo</div>
      </div>
      <div class="secondary-menu">
        <div class="secondary-menu-title">NiuMa Admin</div>
        <div class="secondary-menu-content">
          <a-menu mode="inline" :items="items"></a-menu>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="content-header">Header</div>
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
  flex: none;
  width: 60px;
  background: #24272e;
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
.secondary-menu {
  flex: none;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
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
}
.secondary-menu-content {
  flex: 1;
  overflow: auto;
}
.secondary-menu-content .ant-menu-light.ant-menu-root.ant-menu-inline {
  border-inline-end: none;
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
}
</style>

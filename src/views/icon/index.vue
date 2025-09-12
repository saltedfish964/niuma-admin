<script setup>
import {
  message,
  Row as ARow,
  Col as ACol,
  BadgeRibbon as ABadgeRibbon,
  Card as ACard,
} from 'ant-design-vue';
import iconList from 'virtual:niuma-icon-loader';
import { useClipboard } from '@src/composables/use-clipboard';
import { useLayoutStore } from '@src/store/modules/layout';
import VIcon from '@src/components/icon/icon.vue';
import MarkdownRender from '@src/components/markdown-render/index.vue';
import mainText from './main.md?raw';
import addIconText from './add-icon.md?raw';
import basicUseIconifyText from './basic-use-iconify.md?raw';
import basicUseCustomText from './basic-use-custom.md?raw';
import attributesText from './attributes.md?raw';

const layoutStore = useLayoutStore();

const [messageApi, contextHolder] = message.useMessage();
const { copy, error } = useClipboard();

const currentIconList = iconList.map((item) => {
  const [type, icon] = item.name.split(':');
  return {
    name: `${type}-icon-${icon}`,
    label: icon,
    type,
  };
});

async function copyHandler(item) {
  const value = `<v-icon name="${item.name}"></v-icon>`;
  await copy(value);
  if (error.value) {
    messageApi.error(error.value);
  }
  messageApi.success('复制成功');
}
</script>

<template>
  <div class="icon-view-container">
    <a-row class="icon-list" :gutter="[16, 16]">
      <a-col
        v-for="item in currentIconList"
        :key="item.name"
        :xs="12"
        :sm="8"
        :md="6"
        :lg="4"
        :xl="3"
      >
        <a-badge-ribbon
          :text="item.type === 'custom' ? '自定义' : 'iconify'"
          :color="item.type === 'custom' ? 'green' : ''"
        >
          <a-card>
            <div class="icon-item">
              <div class="icon-item-icon">
                <v-icon :name="item.name" size="38"></v-icon>
              </div>
            </div>
            <template #actions>
              <div @click="copyHandler(item)">复制</div>
            </template>
          </a-card>
        </a-badge-ribbon>
      </a-col>
    </a-row>
    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-card :bordered="false">
          <markdown-render :md-text="mainText" :dark="layoutStore.darkMode"></markdown-render>
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card :bordered="false">
          <markdown-render :md-text="addIconText" :dark="layoutStore.darkMode"></markdown-render>
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card :bordered="false">
          <markdown-render :md-text="'# 基本用法'" :dark="layoutStore.darkMode"></markdown-render>
          <markdown-render
            :md-text="basicUseIconifyText"
            :dark="layoutStore.darkMode"
          ></markdown-render>
          <div class="border border-solid border-border-primary p-4 rounded-lg flex items-center">
            <v-icon name="ic-icon-baseline-insert-emoticon"></v-icon>
            <v-icon name="icon-park-outline-icon-workbench"></v-icon>
            <v-icon name="ant-design-icon-file-text-outlined"></v-icon>
            <v-icon name="ant-design-icon-reload-outlined" :spin="true"></v-icon>
          </div>
          <markdown-render
            :md-text="basicUseCustomText"
            :dark="layoutStore.darkMode"
          ></markdown-render>
          <div class="border border-solid border-border-primary p-4 rounded-lg flex items-center">
            <v-icon name="custom-icon-vue"></v-icon>
            <v-icon name="custom-icon-vite"></v-icon>
          </div>
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card :bordered="false">
          <markdown-render :md-text="attributesText" :dark="layoutStore.darkMode"></markdown-render>
        </a-card>
      </a-col>
    </a-row>
    <context-holder />
  </div>
</template>

<style scoped>
.icon-view-container {
  padding: 16px;
}
.icon-list {
  padding-bottom: 16px;
}
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

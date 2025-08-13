<script setup lang="js">
import { Card as ACard, Row as ARow, Col as ACol } from 'ant-design-vue';
import { useLayoutStore } from '@src/store/modules/layout';
import MarkdownRender from '@src/components/markdown-render/index.vue';
import basicText from './basic.md?raw';
import exampleData from './markdown-example.md?raw';

const layoutStore = useLayoutStore();
</script>

<template>
  <div class="p-4 min-h-full">
    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-card>
          <markdown-render :md-text="basicText" :dark="layoutStore.darkMode"></markdown-render>
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card>
          <markdown-render :md-text="exampleData" :dark="layoutStore.darkMode"></markdown-render>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

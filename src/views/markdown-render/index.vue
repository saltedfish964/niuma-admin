<script setup lang="js">
import { ref, watch } from 'vue';
import { Card as ACard, Row as ARow, Col as ACol } from 'ant-design-vue';
import { useLayoutStore } from '@src/store/modules/layout';
import MarkdownRender from '@src/components/markdown-render/index.vue';
import basicText from './basic.md?raw';
import exampleData from './markdown-example.md?raw';

const layoutStore = useLayoutStore();
// 优化切换暗色动画卡顿问题
const showView = ref(true);
watch(
  () => layoutStore.darkMode,
  async () => {
    showView.value = false;
    await new Promise((resolve) => setTimeout(resolve, 600));
    showView.value = true;
  },
);
</script>

<template>
  <div class="p-4 min-h-full">
    <div v-show="showView">
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
    <div
      class="p-4 h-full w-full flex items-center justify-center rounded-lg bg-[var(--nm-color-bg-container)]"
      v-show="!showView"
    >
      切换主题中...
    </div>
  </div>
</template>

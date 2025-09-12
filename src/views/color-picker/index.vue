<script setup lang="js">
import { ref } from 'vue';
import {
  Row as ARow,
  Col as ACol,
  Card as ACard,
  Button as AButton,
  Switch as ASwitch,
  Divider as ADivider,
} from 'ant-design-vue';
import VColorPicker from '@src/components/color-picker/color-picker.vue';
import MarkdownRender from '@src/components/markdown-render/index.vue';
import { useLayoutStore } from '@src/store/modules/layout';
import mainText from './main.md?raw';
import basicUse from './basic-use.md?raw';
import disabledText from './disabled.md?raw';
import swatchesText from './swatches.md?raw';
import attributesText from './attributes.md?raw';

const layoutStore = useLayoutStore();

const selectedColor = ref('#000000');
const disabled = ref(false);
const swatches = ref([]);
const swatchesExample = ref(['#b55312', '#c869ea', '#fb63ce', '#2e306c', '#a570f8', '#a6e579']);

function randomSwatches() {
  swatches.value = [];
  for (let i = 0; i < 6; i++) {
    swatches.value.push(
      `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0')}`,
    );
  }
}

function onRandomColor() {
  // 生成 6 位随机颜色
  const randomHex = `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;
  selectedColor.value = randomHex;
}

randomSwatches();
</script>

<template>
  <div class="p-4">
    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-card title="演示" :bordered="false">
          <div class="pb-4 flex items-center gap-4">
            <a-switch
              v-model:checked="disabled"
              checked-children="禁用"
              un-checked-children="启用"
            ></a-switch>
            <a-button type="primary" :ghost="true" @click="onRandomColor">随机颜色</a-button>
            <a-button type="primary" :ghost="true" @click="randomSwatches">随机色板颜色</a-button>
          </div>
          <a-divider style="margin: 0 0 16px 0"></a-divider>

          <div class="pb-2">
            <v-color-picker
              v-model="selectedColor"
              :disabled="disabled"
              :swatches="swatches"
            ></v-color-picker>
          </div>
          <div class="pb-2">当前选中颜色：{{ selectedColor ? selectedColor : '未选择' }}</div>
          <div>色板颜色：{{ swatches }}</div>
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card :bordered="false">
          <markdown-render :md-text="mainText" :dark="layoutStore.darkMode"></markdown-render>
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card :bordered="false">
          <markdown-render :md-text="basicUse" :dark="layoutStore.darkMode"></markdown-render>
          <div class="border border-solid border-border-primary p-4 rounded-lg flex items-center">
            <v-color-picker v-model="selectedColor"></v-color-picker>
          </div>
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card :bordered="false">
          <markdown-render :md-text="disabledText" :dark="layoutStore.darkMode"></markdown-render>
          <div class="border border-solid border-border-primary p-4 rounded-lg flex items-center">
            <v-color-picker v-model="selectedColor"></v-color-picker>
          </div>
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card :bordered="false">
          <markdown-render :md-text="swatchesText" :dark="layoutStore.darkMode"></markdown-render>
          <div class="border border-solid border-border-primary p-4 rounded-lg flex items-center">
            <v-color-picker v-model="selectedColor" :swatches="swatchesExample"></v-color-picker>
          </div>
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card :bordered="false">
          <markdown-render :md-text="attributesText" :dark="layoutStore.darkMode"></markdown-render>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

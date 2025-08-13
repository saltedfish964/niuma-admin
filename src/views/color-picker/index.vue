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

const selectedColor = ref('');
const disabled = ref(false);
const swatches = ref([]);

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
onRandomColor();
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
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VColorPicker from '@src/components/color-picker/color-picker.vue';

const selectedColor = ref('#3498db');
const swatches = ref([
  'rgba(244, 67, 54, 1)',
  'rgba(233, 30, 99, 0.95)',
  'rgba(156, 39, 176, 0.9)',
  'rgba(103, 58, 183, 0.85)',
  'rgba(63, 81, 181, 0.8)',
  'rgba(33, 150, 243, 0.75)',
  'rgba(3, 169, 244, 0.7)',
]);

function randomColor() {
  const randomHex = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  selectedColor.value = randomHex;
}
</script>
<template>
  <div style="padding: 8px 30px">
    <h1>颜色选择器演示</h1>
    <a-button @click="randomColor">修改 v-model 值</a-button>
    <div>
      <VColorPicker v-model="selectedColor" :swatches="swatches" />
    </div>
    <p style="padding-top: 50px">当前颜色值: {{ selectedColor }}</p>
  </div>
</template>

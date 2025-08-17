# 调色板

设置 `swatches` 为十六进制颜色数组，可以在调色板中显示预设颜色。

```html
<script setup lang="js">
  import { ref } from 'vue';
  import VColorPicker from '@src/components/color-picker/color-picker.vue';

  const selectedColor = ref('#000000');
  const swatches = ref(['#b55312', '#c869ea', '#fb63ce', '#2e306c', '#a570f8', '#a6e579']);
</script>

<template>
  <v-color-picker v-model="selectedColor" :swatches="swatches"></v-color-picker>
</template>
```

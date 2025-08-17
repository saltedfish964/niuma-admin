# 基本用法

直接绑定 `v-model` 可以实现颜色选择。

```html
<script setup lang="js">
  import { ref } from 'vue';
  import VColorPicker from '@src/components/color-picker/color-picker.vue';

  const selectedColor = ref('#000000');
</script>

<template>
  <v-color-picker v-model="selectedColor"></v-color-picker>
</template>
```

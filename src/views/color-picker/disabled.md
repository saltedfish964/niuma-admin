# 禁用

设置 `disabled` 为 `true` 可以禁用颜色选择器。

```html
<script setup lang="js">
  import { ref } from 'vue';
  import VColorPicker from '@src/components/color-picker/color-picker.vue';

  const selectedColor = ref('#000000');
</script>

<template>
  <v-color-picker v-model="selectedColor" :disabled="true"></v-color-picker>
</template>
```

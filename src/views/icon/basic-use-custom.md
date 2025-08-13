使用自定义图标，只需要把 `[provider]` 写为 `custom`，即 `custom-icon-[icon-name]`。

```html
<script setup lang="js">
  import VIcon from '@src/components/icon/icon.vue';
</script>

<template>
  <v-icon name="custom-icon-vue"></v-icon>
  <v-icon name="custom-icon-vite"></v-icon>
</template>
```

使用从 [iconify](https://iconify.design/) 添加的图标。

[iconify](https://iconify.design/) 的图标命名规则 `[provider]:[icon-name]`，`provider` 是图标的供应商，`icon-name` 是图标的名称。

在图标组件中使用时，需要将 `:` 替换为 `-icon-`，即 `[provider]-icon-[icon-name]`。

设置 `spin` 为 `true` 可以添加旋转动画。

```html
<script setup lang="js">
  import VIcon from '@src/components/icon/icon.vue';
</script>

<template>
  <v-icon name="ic-icon-baseline-insert-emoticon"></v-icon>
  <v-icon name="icon-park-outline-icon-workbench"></v-icon>
  <v-icon name="ant-design-icon-file-text-outlined"></v-icon>
  <v-icon name="ant-design-icon-reload-outlined" :spin="true"></v-icon>
</template>
```

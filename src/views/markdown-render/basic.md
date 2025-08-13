# MarkdownRender 『markdown 渲染器』

从 VitePress 拆出来的一个 Markdown 渲染器。

## 何时使用

把 markdown 的内容展示到页面中时使用（比如此页面的文档效果）。

## 引入

```js
import MarkdownRender from '@src/components/markdown-render/index.vue';
```

## 基本用法

markdown 文本传入 `mdText` 属性即可。

```html
<script setup lang="js">
  import { ref } from 'vue';
  import MarkdownRender from '@src/components/markdown-render/index.vue';

  const mdText = ref('# MarkdownRender 『markdown 渲染器』');
</script>

<template>
  <markdown-render :md-text="mdText"></markdown-render>
</template>
```

## 切换暗色模式

`dark` 属性设置为 `true` 切换暗色模式。

```html
<script setup lang="js">
  import { ref } from 'vue';
  import MarkdownRender from '@src/components/markdown-render/index.vue';

  const mdText = ref('# MarkdownRender 『markdown 渲染器』');
  const dark = ref(true);
</script>

<template>
  <markdown-render :md-text="mdText" :dark="dark"></markdown-render>
</template>
```

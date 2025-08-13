<script setup lang="js">
import { ref } from 'vue';
import MarkdownRender from './index.vue'
import textData from './markdown.md?raw'

const isDark = ref(false)
</script>

<template>
  <div>
    <div>
      <button @click="isDark = !isDark">切换</button>
    </div>
    <markdown-render :md-text="textData" :dark="isDark"></markdown-render>
  </div>
</template>

<script setup lang="js">
import { defineAsyncComponent, h } from 'vue';
import LoadingPlaceholder from './loading.vue';

const props = defineProps({
  mdText: {
    type: String,
    default: '',
  },
  dark: {
    type: Boolean,
    default: false,
  },
});

const MarkdownRender = defineAsyncComponent({
  loader: () => import('./markdown-render.vue'),
  loadingComponent: LoadingPlaceholder,
});
</script>

<template>
  <markdown-render :md-text="mdText" :dark="dark"></markdown-render>
</template>

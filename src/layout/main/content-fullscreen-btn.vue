<script setup>
import VIcon from '@src/components/icon/icon.vue';
import { useLayoutStore } from '@src/store/modules/layout';

const layoutStore = useLayoutStore();

function toggleFullscreen() {
  layoutStore.toggleIsContentFullscreen();
}
</script>

<template>
  <div class="content-fullscreen-btn" @click="toggleFullscreen">
    <v-icon
      v-if="!layoutStore.isContentFullscreen"
      name="proicons-icon-full-screen-maximize"
      size="20"
    ></v-icon>
    <v-icon v-else name="proicons-icon-full-screen-minimize" size="20"></v-icon>
  </div>
</template>

<style scoped>
.content-fullscreen-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.content-fullscreen-btn:hover {
  background: var(--nm-border-color);
  cursor: pointer;
}
</style>

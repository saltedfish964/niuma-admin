<template>
  <div class="iframe-container">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">
      Failed to load iframe
      <button @click="reload">Retry</button>
    </div>
    <iframe
      ref="iframeRef"
      :src="src"
      @load="onLoad"
      @error="onError"
      class="iframe-content"
      frameborder="0"
      sandbox="allow-scripts allow-same-origin"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const iframeRef = ref(null);
const loading = ref(true);
const error = ref(false);
let timeoutId = null;

function reload() {
  error.value = false;
  loading.value = true;
  iframeRef.value.src = props.src;
}

function onLoad() {
  loading.value = false;
  clearTimeout(timeoutId);
}

function onError() {
  loading.value = false;
  error.value = true;
  console.log('出错了');
}

onMounted(() => {
  timeoutId = setTimeout(() => {
    if (loading.value) {
      onError();
    }
  }, 10000); // 10秒超时
});

onBeforeUnmount(() => {
  clearTimeout(timeoutId);
});

watch(
  () => props.src,
  () => {
    reload();
  },
);
</script>

<style scoped>
.iframe-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.iframe-content {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.loading,
.error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  text-align: center;
}

.error button {
  margin-top: 10px;
  padding: 5px 15px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>

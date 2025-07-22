<script setup>
import { useRouter } from 'vue-router';
import projectConfig from '@src/config';

const router = useRouter();

function goHome() {
  router.replace(projectConfig.homeRoutePath);
}
</script>

<template>
  <div class="not-found">
    <img class="img" src="@src/assets/imgs/404.svg" alt="404" />
    <div class="btn">
      <a-button type="primary" @click="goHome">返回首页</a-button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: var(--nm-color-bg-container);
}

.not-found .img {
  height: 60%;
}
</style>

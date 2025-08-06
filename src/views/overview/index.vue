<script setup>
import WorkingSvg from './working-svg.vue';

defineOptions({
  name: 'Overview',
});
</script>

<template>
  <div class="page-container">
    <div class="body">
      <div class="content">
        <h1>开启牛马的一天</h1>
        <div class="img-container">
          <working-svg class="img"></working-svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 16px;
  height: 100%;
}
.body {
  height: 100%;
  border-radius: 8px;
  background: var(--nm-color-bg-container);
  display: flex;
  justify-content: center;
  align-items: center;
}
.content h1 {
  text-align: center;
}
.img-container {
  display: flex;
  justify-content: center;
}
.img-container .img {
  height: 100%;
  color: var(--nm-color-text);
}
</style>

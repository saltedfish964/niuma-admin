<script setup>
import { ref } from 'vue';

const props = defineProps({
  itemWidth: {
    type: Number,
    default: 240,
  },
  itemHeight: {
    type: Number,
    default: 32,
  },
  containerRef: {
    type: Object,
  },
});

const dataList = ref([
  {
    id: 1,
    name: '预约1',
  },
  {
    id: 2,
    name: '预约2',
  },
  {
    id: 3,
    name: '预约3',
  },
]);

function onMousedown(event) {
  window.addEventListener('mousemove', onMousemove);
  window.addEventListener('mouseup', onMouseup);

  event.preventDefault();
  // 允许事件穿透
  // event.target.style.pointerEvents = 'none';
}

function onMousemove(event) {
  if (!props.containerRef) return;
  // const rect = props.containerRef.getBoundingClientRect();
  // 计算鼠标位置
  // const x = event.clientX - rect.left;
  // const y = event.clientY - rect.top;
  // 更新拖拽元素位置
  // event.target.style.transform = `translate(${x}px, ${y}px)`;
}

function onMouseup() {
  window.removeEventListener('mousemove', onMousemove);
  window.removeEventListener('mouseup', onMouseup);
}
</script>

<template>
  <div class="drag-item-list">
    <div
      v-for="item in dataList"
      :key="item.id"
      class="drag-item"
      :style="{ width: `${props.itemWidth}px` }"
    >
      <div class="drag-item-content">
        <div
          class="drag-handle"
          :style="{ height: `${props.itemHeight}px` }"
          @mousedown="onMousedown"
        ></div>
        <div>{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drag-item-list {
  position: absolute;
  top: 0;
  left: 0;
}
.drag-item {
  position: absolute;
  left: 0;
  top: 0;
  padding: 0 2px;
  z-index: 1;
  height: 60px;
}
.drag-item-content {
  width: 100%;
  height: 100%;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  border-radius: 4px;
}
.drag-handle {
  background: #f9c41f;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
</style>

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

const emit = defineEmits(['move', 'moveend']);

let currentDragItem = null;
let currentDragItemClone = null;
let currentDragItemX = 0;
let currentDragItemY = 0;

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

function getDragItemByChild(child) {
  let parent = child;
  while (parent) {
    if (parent.classList && parent.classList.contains('drag-item')) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

function onMousedown(event) {
  document.addEventListener('mousemove', onMousemove);
  document.addEventListener('mouseup', onMouseup);
  event.preventDefault();

  currentDragItem = getDragItemByChild(event.target);
  if (!currentDragItem) return;

  // 获取元素在视口中的位置
  const rect = currentDragItem.getBoundingClientRect();

  currentDragItemClone = currentDragItem.cloneNode(true);
  currentDragItemClone.style.position = 'fixed';
  currentDragItemClone.style.left = `${rect.left}px`;
  currentDragItemClone.style.top = `${rect.top}px`;
  currentDragItemClone.style.opacity = '0.8';
  currentDragItemClone.style.pointerEvents = 'none';
  currentDragItemClone.style.zIndex = '1000';
  currentDragItemClone.style.backgroundColor = 'red';

  document.body.appendChild(currentDragItemClone);

  currentDragItemX = event.clientX;
  currentDragItemY = event.clientY;
}

function onMousemove(event) {
  if (!currentDragItem) return;
  // 计算鼠标拖动的距离
  const dx = event.clientX - currentDragItemX;
  const dy = event.clientY - currentDragItemY;
  currentDragItemClone.style.left = `${parseInt(currentDragItemClone.style.left) + dx}px`;
  currentDragItemClone.style.top = `${parseInt(currentDragItemClone.style.top) + dy}px`;

  currentDragItemX = event.clientX;
  currentDragItemY = event.clientY;

  emit('move', event.clientX, event.clientY);
}

function onMouseup() {
  document.removeEventListener('mousemove', onMousemove);
  document.removeEventListener('mouseup', onMouseup);

  if (currentDragItem && currentDragItemClone) {
    const cloneRect = currentDragItemClone.getBoundingClientRect();
    const containerRect = props.containerRef.getBoundingClientRect();

    const newLeft = cloneRect.left - containerRect.left + props.containerRef.scrollLeft;
    const newTop = cloneRect.top - containerRect.top + props.containerRef.scrollTop;

    currentDragItem.style.left = `${newLeft}px`;
    currentDragItem.style.top = `${newTop}px`;
  }

  // 移除克隆元素
  if (currentDragItemClone) {
    document.body.removeChild(currentDragItemClone);
    currentDragItemClone = null;
  }

  currentDragItemX = 0;
  currentDragItemY = 0;

  emit('moveend');
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

<script setup>
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import { addMinutes, compareTime, getMinutesDiff } from './time';

const props = defineProps({
  itemWidth: {
    type: Number,
    default: 240,
  },
  itemHeight: {
    type: Number,
    default: 32,
  },
  container: {
    type: Object,
  },
  currentCell: {
    type: Object,
  },
  startTime: {
    type: String,
    default: '08:00',
  },
  endTime: {
    type: String,
    default: '20:00',
  },
  timeInterval: {
    type: Number,
    default: 30,
  },
  totalHeight: {
    type: Number,
    default: 0,
  },
  users: {
    type: Array,
    default: () => [],
  },
  columnLeftPositions: {
    type: Array,
    default: () => [],
  },
  // 时间列表
  timeSlots: {
    type: Array,
    default: () => [],
  },
  events: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['move', 'moveend', 'height-resize-move']);

const itemsRef = useTemplateRef('items');

let currentDragItem = null;
let currentDragItemClone = null;
let currentDragItemHighlight = null;
let currentDragItemX = 0;
let currentDragItemY = 0;

let currentResizeItem = null;
let startY = null;
let startHeight = null;

const currentEvents = ref(props.events);

const currentActiveItem = ref(null);

const totalMinutes = computed(() => {
  return getMinutesDiff(props.startTime, props.endTime);
});
const oneMinuteHeight = computed(() => {
  return props.totalHeight / totalMinutes.value;
});

function dragendUpdateCurrentActiveItemStyle(el, item, cell) {
  if (!el || !cell || !item) return;
  const rawDiffMinutes = getMinutesDiff(item.startTime, item.endTime);
  let height = 0;
  let multiplicand = rawDiffMinutes / props.timeInterval;
  let remainder = rawDiffMinutes % props.timeInterval;
  if (item.endTime === props.endTime && remainder > 0) {
    height = (parseInt(multiplicand) + 1) * props.itemHeight;
  } else {
    height = multiplicand * props.itemHeight;
  }
  const { top, left } = cell;
  el.style.top = `${top}px`;
  el.style.left = `${left}px`;
  el.style.height = `${height}px`;
}

function heightResizeUpdateCurrentActiveItemStyle(el, item, cell) {
  if (!el || !item) return;
  let height = 0;
  const rawDiffMinutes = getMinutesDiff(item.startTime, item.endTime);
  let multiplicand = rawDiffMinutes / props.timeInterval;
  let remainder = rawDiffMinutes % props.timeInterval;
  if (item.endTime === props.endTime && remainder > 0) {
    height = (parseInt(multiplicand) + 1) * props.itemHeight;
  } else {
    height = multiplicand * props.itemHeight;
  }
  el.style.height = `${height}px`;
}

function updateEventTimeByCellStartTime(item, cell) {
  if (!item || !cell) return;
  const { row, column } = cell;
  const user = props.users[column];
  const rawDiffMinutes = getMinutesDiff(item.startTime, item.endTime);
  const startT = props.timeSlots[row];
  let endT = addMinutes(startT, rawDiffMinutes);
  if (compareTime(endT, props.endTime) === 1) {
    endT = props.endTime;
  }
  item.startTime = startT;
  item.endTime = endT;
  item.userId = user.id;
}

function updateEventTimeByCellEndTime(item, cell) {
  if (!item || !cell) return;
  const { row, column } = cell;
  const user = props.users[column];
  let endT = addMinutes(props.timeSlots[row], props.timeInterval);

  if (getMinutesDiff(item.startTime, endT) <= 0) {
    endT = addMinutes(item.startTime, props.timeInterval);
  }

  if (compareTime(endT, props.endTime) === 1) {
    endT = props.endTime;
  }

  item.endTime = endT;
  item.userId = user.id;
}

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

function onMousedown(event, item) {
  document.addEventListener('mousemove', onMousemove);
  document.addEventListener('mouseup', onMouseup);
  event.preventDefault();

  currentActiveItem.value = item;

  currentDragItem = getDragItemByChild(event.target);
  if (!currentDragItem) return;

  // 获取元素在视口中的位置
  const rect = currentDragItem.getBoundingClientRect();

  currentDragItemHighlight = currentDragItem.cloneNode(true);
  currentDragItemHighlight.innerHTML = '';
  currentDragItemHighlight.style.zIndex = '99';
  currentDragItemHighlight.style.opacity = '0';
  currentDragItemHighlight.style.background = 'rgba(0, 0, 0, 0.2)';
  currentDragItemHighlight.style.position = 'fixed';
  currentDragItemHighlight.style.left = `${0}px`;
  currentDragItemHighlight.style.top = `${0}px`;
  document.body.appendChild(currentDragItemHighlight);

  currentDragItemClone = currentDragItem.cloneNode(true);
  currentDragItemClone.style.position = 'fixed';
  currentDragItemClone.style.left = `${rect.left}px`;
  currentDragItemClone.style.top = `${rect.top}px`;
  currentDragItemClone.style.zIndex = '100';

  currentDragItem.style.opacity = '0.5';

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

  if (currentDragItemHighlight && props.currentCell) {
    const cRect = props.container.getBoundingClientRect();

    currentDragItemHighlight.style.left = `${props.currentCell.left + cRect.x - props.container.scrollLeft}px`;
    currentDragItemHighlight.style.top = `${props.currentCell.top + cRect.y - props.container.scrollTop}px`;
    currentDragItemHighlight.style.width = `${props.currentCell.width}px`;
    currentDragItemHighlight.style.opacity = '1';
  }

  currentDragItemX = event.clientX;
  currentDragItemY = event.clientY;

  emit('move', event.clientX, event.clientY);
}

function onMouseup() {
  document.removeEventListener('mousemove', onMousemove);
  document.removeEventListener('mouseup', onMouseup);

  if (currentDragItem) {
    updateEventTimeByCellStartTime(currentActiveItem.value, props.currentCell);
    dragendUpdateCurrentActiveItemStyle(
      currentDragItem,
      currentActiveItem.value,
      props.currentCell,
    );
    currentDragItem.style.opacity = '1';
  }

  if (currentDragItemHighlight) {
    document.body.removeChild(currentDragItemHighlight);
    currentDragItemHighlight = null;
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

function onHeightResizeMousedown(event, item) {
  document.addEventListener('mousemove', onHeightResizeMousemove);
  document.addEventListener('mouseup', onHeightResizeMouseup);

  currentActiveItem.value = item;

  startY = event.clientY;

  currentResizeItem = getDragItemByChild(event.target);
  if (!currentResizeItem) return;
  startHeight = currentResizeItem.offsetHeight;

  event.preventDefault();
}

function onHeightResizeMousemove(event) {
  const newHeight = startHeight + (event.clientY - startY);

  currentResizeItem.style.height = newHeight + 'px';

  emit('height-resize-move', event.clientX, event.clientY);
}

function onHeightResizeMouseup() {
  document.removeEventListener('mousemove', onHeightResizeMousemove);
  document.removeEventListener('mouseup', onHeightResizeMouseup);

  if (currentResizeItem) {
    updateEventTimeByCellEndTime(currentActiveItem.value, props.currentCell);
    heightResizeUpdateCurrentActiveItemStyle(
      currentResizeItem,
      currentActiveItem.value,
      props.currentCell,
    );
  }
}

function initDragItemStyle() {
  nextTick(() => {
    itemsRef.value.forEach((elItem, index) => {
      const dragItem = currentEvents.value[index];
      const heightMinutes = getMinutesDiff(dragItem.startTime, dragItem.endTime);
      const topMinutes = getMinutesDiff(props.startTime, dragItem.startTime);
      let left = 0;
      const findUserIndex = props.users.findIndex((user) => user.id === dragItem.userId) || 0;
      left = props.columnLeftPositions[findUserIndex] || 0;
      left += props.itemWidth * dragItem.offset;
      elItem.style.left = `${left}px`;
      elItem.style.top = `${topMinutes * oneMinuteHeight.value}px`;
      elItem.style.height = `${heightMinutes * oneMinuteHeight.value}px`;
      elItem.style.width = `${props.itemWidth}px`;
    });
  });
}

watch(
  () => props.totalHeight,
  () => {
    initDragItemStyle();
  },
);

onMounted(() => {
  initDragItemStyle();
});
</script>

<template>
  <div class="drag-item-list">
    <div v-for="item in currentEvents" :key="item.id" ref="items" class="drag-item">
      <div class="drag-item-content">
        <div
          class="drag-handle"
          :style="{ height: '32px' }"
          @mousedown="(e) => onMousedown(e, item)"
        ></div>
        <div>{{ item.name }}</div>
        <div>{{ item.startTime }} - {{ item.endTime }}</div>
      </div>
      <div class="height-resize-handle" @mousedown="(e) => onHeightResizeMousedown(e, item)"></div>
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
}
.drag-item-content {
  width: 100%;
  height: 100%;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}
.drag-handle {
  background: #f9c41f;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.height-resize-handle {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  cursor: ns-resize;
}
</style>

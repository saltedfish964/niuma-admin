<script setup>
import { computed, ref } from 'vue';
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
});

const emit = defineEmits(['move', 'moveend']);

let currentDragItem = null;
let currentDragItemClone = null;
let currentDragItemHighlight = null;
let currentDragItemX = 0;
let currentDragItemY = 0;
const totalMinutes = computed(() => {
  return getMinutesDiff(props.startTime, props.endTime);
});
const oneMinuteHeight = computed(() => {
  return props.totalHeight / totalMinutes.value;
});

const dataList = ref([
  {
    id: 1,
    userId: 1,
    name: '预约1',
    startTime: '08:00',
    endTime: '10:00',
  },
  {
    id: 2,
    userId: 2,
    name: '预约2',
    startTime: '10:00',
    endTime: '11:00',
  },
  {
    id: 3,
    userId: 3,
    name: '预约3',
    startTime: '12:00',
    endTime: '14:00',
  },
]);
const currentActiveItem = ref(null);

function calcDragItemStyle(dragItem) {
  const heightMinutes = getMinutesDiff(dragItem.startTime, dragItem.endTime);
  const topMinutes = getMinutesDiff(props.startTime, dragItem.startTime);
  let left = 0;
  const findUserIndex = props.users.findIndex((user) => user.id === dragItem.userId) || 0;
  left = props.columnLeftPositions[findUserIndex] || 0;
  return {
    left: `${left}px`,
    top: `${topMinutes * oneMinuteHeight.value}px`,
    height: `${heightMinutes * oneMinuteHeight.value}px`,
    width: `${props.itemWidth}px`,
  };
}

function updateEventTimeByCell(item, cell) {
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
    updateEventTimeByCell(currentActiveItem.value, props.currentCell);
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
</script>

<template>
  <div class="drag-item-list">
    <div v-for="item in dataList" :key="item.id" class="drag-item" :style="calcDragItemStyle(item)">
      <div class="drag-item-content">
        <div
          class="drag-handle"
          :style="{ height: `${props.itemHeight}px` }"
          @mousedown="(e) => onMousedown(e, item)"
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
  overflow: hidden;
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
</style>

<script setup>
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useEventBus } from '@src/composables/use-event-bus';
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
  resources: {
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
  cellDisabled: {
    type: Function,
  },
  eventDisabled: {
    type: Function,
  },
  beforeEventDrop: {
    type: Function,
    default: () => Promise.resolve(true),
  },
});

const emit = defineEmits([
  'move',
  'moveend',
  'height-resize-move',
  'event-change',
  'event-scroll-to-view-end',
]);

let containerElClone = null;
let currentDragItem = null;
let currentDragItemClone = null;
let currentDragItemHighlight = null;
let currentDragItemX = 0;
let currentDragItemY = 0;

let currentResizeItem = null;
let startY = null;
let startHeight = null;

const bus = useEventBus();

const itemsRef = useTemplateRef('items');

const currentEvents = ref(props.events.map((item) => ({ ...item, key: `${item.id}` })));
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
  const newLeft = left + props.itemWidth * item.offset;
  el.style.top = `${top}px`;
  el.style.left = `${newLeft}px`;
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

async function updateEventTimeByCellStartTime(item, cell) {
  if (!item || !cell) return;
  const isDisabled = props.cellDisabled
    ? props.cellDisabled(props.resources[cell.column], props.timeSlots[cell.row])
    : false;
  if (isDisabled) {
    emit('event-change', item);
    return;
  }
  const beforeEventDropResult = await props.beforeEventDrop(item);
  if (!beforeEventDropResult) {
    emit('event-change', item);
    return;
  }
  const { row, column } = cell;
  const resource = props.resources[column];
  const rawDiffMinutes = getMinutesDiff(item.startTime, item.endTime);
  const startT = props.timeSlots[row];
  let endT = addMinutes(startT, rawDiffMinutes);
  endT = endT === '00:00' ? props.endTime : endT;
  if (compareTime(endT, props.endTime) === 1) {
    endT = props.endTime;
  }
  item.startTime = startT;
  item.endTime = endT;
  item.resourceId = resource.id;

  const newItem = {
    ...item,
  };
  delete newItem.key;

  emit('event-change', newItem);
}

function updateEventTimeByCellEndTime(item, cell) {
  if (!item || !cell) return;
  const { row, column } = cell;
  const resource = props.resources[column];
  let endT = addMinutes(props.timeSlots[row], props.timeInterval);

  if (getMinutesDiff(item.startTime, endT) <= 0) {
    endT = addMinutes(item.startTime, props.timeInterval);
  }

  if (compareTime(endT, props.endTime) === 1) {
    endT = props.endTime;
  }

  item.endTime = endT;
  item.resourceId = resource.id;

  const newItem = {
    ...item,
  };
  delete newItem.key;
  emit('event-change', newItem);
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
  const isDisabled = props.eventDisabled ? props.eventDisabled(item) : false;
  if (isDisabled) return;

  document.addEventListener('mousemove', onMousemove);
  document.addEventListener('mouseup', onMouseup);
  event.preventDefault();

  currentActiveItem.value = item;

  currentDragItem = getDragItemByChild(event.target);
  if (!currentDragItem) return;

  // 获取元素在视口中的位置
  const rect = currentDragItem.getBoundingClientRect();
  const cRect = props.container.getBoundingClientRect();

  // 克隆一个一模一样的 container
  containerElClone = props.container.cloneNode(true);
  containerElClone.innerHTML = '';
  containerElClone.style.position = 'fixed';
  containerElClone.style.left = `${cRect.left}px`;
  containerElClone.style.top = `${cRect.top}px`;
  containerElClone.style.zIndex = '99';
  containerElClone.style.watch = `${cRect.width}px`;
  containerElClone.style.height = `${cRect.height}px`;
  containerElClone.style.transform = 'none';
  containerElClone.style.overflow = 'hidden';

  currentDragItemHighlight = currentDragItem.cloneNode(true);
  currentDragItemHighlight.innerHTML = '';
  currentDragItemHighlight.style.zIndex = '99';
  currentDragItemHighlight.style.opacity = '0';
  currentDragItemHighlight.style.background = 'rgba(0, 0, 0, 0.2)';
  currentDragItemHighlight.style.position = 'absolute';
  currentDragItemHighlight.style.left = `${0}px`;
  currentDragItemHighlight.style.top = `${0}px`;
  containerElClone.appendChild(currentDragItemHighlight);
  document.body.appendChild(containerElClone);

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
    currentDragItemHighlight.style.left = `${props.currentCell.left - props.container.scrollLeft}px`;
    currentDragItemHighlight.style.top = `${props.currentCell.top - props.container.scrollTop}px`;
    currentDragItemHighlight.style.width = `${props.currentCell.width}px`;
    currentDragItemHighlight.style.opacity = '1';
  }

  if (!props.currentCell) {
    currentDragItemHighlight.style.opacity = '0';
  }

  currentDragItemX = event.clientX;
  currentDragItemY = event.clientY;

  emit('move', event.clientX, event.clientY);
}

async function onMouseup() {
  document.removeEventListener('mousemove', onMousemove);
  document.removeEventListener('mouseup', onMouseup);

  if (currentDragItemHighlight) {
    currentDragItemHighlight.remove();
    containerElClone.remove();
    currentDragItemHighlight = null;
    containerElClone = null;
  }

  // 移除克隆元素
  if (currentDragItemClone) {
    document.body.removeChild(currentDragItemClone);
    currentDragItemClone = null;
  }

  if (currentDragItem) {
    currentDragItem.style.opacity = '1';
    await updateEventTimeByCellStartTime(currentActiveItem.value, props.currentCell);
    dragendUpdateCurrentActiveItemStyle(
      currentDragItem,
      currentActiveItem.value,
      props.currentCell,
    );
    // 拖拽完成后，滚动到当前元素
    const activeKey = currentActiveItem.value.key;
    nextTick(() => {
      const scrollEle = itemsRef.value.find((el) => {
        const key = el.getAttribute('data-key');
        return key === activeKey;
      });
      setTimeout(() => {
        if (scrollEle) {
          const scrollRect = scrollEle.getBoundingClientRect();
          const containerRect = props.container.getBoundingClientRect();
          const top = scrollRect.top - containerRect.top;
          const left = scrollRect.left - containerRect.left;
          props.container.scrollTo({
            top,
            left,
          });
          emit('event-scroll-to-view-end');
        }
      });
    });
  }

  currentDragItemX = 0;
  currentDragItemY = 0;

  emit('moveend');
}

function onHeightResizeMousedown(event, item) {
  const isDisabled = props.eventDisabled ? props.eventDisabled(item) : false;
  if (isDisabled) return;
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
    if (!itemsRef.value) return;
    itemsRef.value.forEach((elItem, index) => {
      const dragItem = currentEvents.value[index];
      const heightMinutes = getMinutesDiff(dragItem.startTime, dragItem.endTime);
      const topMinutes = getMinutesDiff(props.startTime, dragItem.startTime);
      let left = 0;
      const findResourceIndex =
        props.resources.findIndex((resource) => resource.id === dragItem.resourceId) || 0;
      left = props.columnLeftPositions[findResourceIndex] || 0;
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
  bus.on('update-current-events', (data) => {
    currentEvents.value = data.map((item) => ({ ...item, key: `${item.id}` }));
    initDragItemStyle();
  });
  initDragItemStyle();
});
</script>

<template>
  <div class="drag-item-list">
    <div
      v-for="item in currentEvents"
      :key="item.id"
      :data-key="item.key"
      ref="items"
      :class="[
        'drag-item',
        props.eventDisabled && props.eventDisabled(item) ? 'drag-item-disabled' : '',
      ]"
    >
      <div class="drag-item-content">
        <div
          class="drag-handle"
          :style="{ height: '32px' }"
          @mousedown="(e) => onMousedown(e, item)"
        ></div>
        <div>{{ item.name }}</div>
        <div>{{ item.startTime }} - {{ item.endTime }}</div>
      </div>
      <div
        :class="[
          'height-resize-handle',
          props.eventDisabled && props.eventDisabled(item) ? 'height-resize-handle-disabled' : '',
        ]"
        @mousedown="(e) => onHeightResizeMousedown(e, item)"
      ></div>
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
.drag-item-disabled,
.height-resize-handle {
  cursor: not-allowed;
}
.drag-item-content {
  width: 100%;
  height: 100%;
  border: var(--nm-border, 1px solid #ddd);
  background-color: var(--nm-color-bg-container, #f5f5f5);
  border-radius: 4px;
  overflow: hidden;
}
.drag-handle {
  background: var(--nm-primary-color, #3e74fd);
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

<script setup>
import { ref, useTemplateRef, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { debounce } from 'lodash-es';
import { useEventBus } from '@src/composables/use-event-bus';
import VirtualGrid from './virtual-grid.vue';
import { generateTimeSlots } from './time';

const props = defineProps({
  /**
   * 开始时间
   */
  startTime: {
    type: String,
    default: '00:00',
  },
  /**
   * 结束时间
   */
  endTime: {
    type: String,
    default: '20:00',
  },
  /**
   * 时间间隔
   */
  timeInterval: {
    type: Number,
    default: 60,
  },
  /**
   * 资源(如：用户、场地等)
   * @description 需要包含 id 和 name，扩展属性建议放在 meta
   * @example
   *  [
        {
          id: 1,
          name: '员工 1',
          meta: {
            color: '#FF0000',
          },
        },
      ]
   */
  resources: {
    type: Array,
    default: () => [],
  },
  /**
   * 事件(如：会议、活动等)
   * @description 需要包含 id、resourceId、name、startTime、endTime，扩展属性建议放在 meta
   * @example
   *  [
        {
          id: 1,
          resourceId: 1,
          name: '预约1',
          startTime: '08:00',
          endTime: '10:00',
          meta: {
            color: '#FF0000',
          },
        },
      ]
   */
  events: {
    type: Array,
    default: () => [],
  },
  /**
   * 单元格宽度
   */
  itemWidth: {
    type: Number,
    default: 120,
  },
  /**
   * 默认单元格高度
   */
  defaultItemHeight: {
    type: Number,
    default: 32,
  },
  /**
   * 是否显示时间线
   */
  showTimeLine: {
    type: Boolean,
    default: true,
  },
  /**
   * 控制单元格是否禁用的回调
   * @description 被禁用的单元格，无法放下 event
   * @param {object} resource 资源
   * @param {string} time 时间 HH:mm
   * @returns {boolean}
   */
  cellDisabled: {
    type: Function,
    default: () => false,
  },
  /**
   * 控制事件是否禁用的回调(是否允许拖拽)
   * @param {object} event 事件
   * @returns {boolean}
   */
  eventDisabled: {
    type: Function,
    default: () => false,
  },
  /**
   * event 放下之前的回调，返回 false 可阻止事件放下，支持 Promise
   * @param {object} event 事件
   */
  beforeEventDrop: {
    type: Function,
    default: () => Promise.resolve(true),
  },
});

let observer;
let resizeTimer = null;
const resizeCount = ref(0);

const bus = useEventBus();

const containerRef = useTemplateRef('container');

const currentResources = ref(props.resources);
const currentEvents = ref([]);

// 设置列的宽度
const customWidth = ref({});
const gridHeight = ref(0);
const gridWidth = ref(0);
const timeSlots = generateTimeSlots(props.startTime, props.endTime, props.timeInterval);

const getCellData = (row, col) => {
  return `行${row}, 列${col}`;
};

function onContainerResize(entries) {
  // 增加执行次数计数
  resizeCount.value += 1;

  // 检查是否超过频率限制
  if (resizeCount.value > 30) {
    // 停止观察并清理
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    // 清除定时器
    if (resizeTimer) {
      clearTimeout(resizeTimer);
      resizeTimer = null;
    }
    // 抛出错误
    throw new Error('包含此组件的元素未设置宽高');
  }

  // 重置计数器的定时器逻辑
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  resizeTimer = setTimeout(() => {
    resizeCount.value = 0;
  }, 1000);

  // 原有的尺寸处理逻辑
  for (let entry of entries) {
    const { width, height } = entry.contentRect;
    gridWidth.value = width;
    gridHeight.value = height;
  }
}

function hasTimeOverlap(a, b) {
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const aStart = toMinutes(a.startTime);
  const aEnd = toMinutes(a.endTime);
  const bStart = toMinutes(b.startTime);
  const bEnd = toMinutes(b.endTime);

  return aStart < bEnd && bStart < aEnd;
}

function calculateOffsets(appointments) {
  // 按 resourceId 分组
  const groupedByResourceId = appointments.reduce((groups, item) => {
    const key = item.resourceId;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});

  // 计算每个分组的 offset
  Object.values(groupedByResourceId).forEach((group) => {
    // 按 startTime 排序
    group.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // 初始化 offset
    group.forEach((appointment) => {
      appointment.offset = 0;
    });

    // 检查冲突并分配 offset
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        if (hasTimeOverlap(group[i], group[j])) {
          // 如果冲突，则 j 的 offset 至少是 i 的 offset + 1
          if (group[j].offset <= group[i].offset) {
            group[j].offset = group[i].offset + 1;
          }
        }
      }
    }
  });

  return appointments;
}

function calculateMaxOffsets(events = []) {
  const result = {};
  events.forEach((event) => {
    if (!result[event.resourceId]) {
      result[event.resourceId] = {
        maxOffset: 0,
        id: event.resourceId,
      };
    }
    result[event.resourceId].maxOffset = Math.max(result[event.resourceId].maxOffset, event.offset);
  });
  return result;
}

function calculateCustomWidth(maxOffsets = {}) {
  Object.keys(maxOffsets).forEach((key) => {
    const val = maxOffsets[key];
    const colIndex = currentResources.value.findIndex((resource) => resource.id === val.id);
    if (colIndex !== -1) {
      customWidth.value[colIndex] = props.itemWidth * (val.maxOffset + 1);
    }
  });
}

function onEventChange({ type, event }) {
  if (type === 'add') {
    currentEvents.value.push(event);
  }
  if (type === 'update') {
    const index = currentEvents.value.findIndex((e) => e.id === event.id);
    if (index !== -1) {
      currentEvents.value[index].startTime = event.startTime;
      currentEvents.value[index].endTime = event.endTime;
      currentEvents.value[index].resourceId = event.resourceId;
    }
  }
  currentEvents.value = calculateOffsets(
    currentEvents.value.map((event) => {
      const newItem = { ...event };
      delete newItem.offset;
      return newItem;
    }),
  );
  calculateCustomWidth(calculateMaxOffsets(currentEvents.value));
  nextTick(() => {
    bus.emit('calc-all-sizes');
    bus.emit('update-current-events', currentEvents.value);
  });
}

function addEvent(event) {
  bus.emit('add-event', event);
}

onMounted(() => {
  currentEvents.value = calculateOffsets(props.events);
  calculateCustomWidth(calculateMaxOffsets(currentEvents.value));
  bus.emit('update-current-events', currentEvents.value);
  observer = new ResizeObserver(debounce(onContainerResize, 16));
  if (containerRef.value) {
    observer.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
});

defineExpose({
  addEvent,
});
</script>

<template>
  <div ref="container" class="v-reservation-panel">
    <virtual-grid
      :row-count="timeSlots.length"
      :col-count="currentResources.length"
      :item-width="props.itemWidth"
      :width="gridWidth"
      :height="gridHeight"
      :get-item-data="getCellData"
      :columns-width="customWidth"
      :resources="currentResources"
      :time-slots="timeSlots"
      :start-time="props.startTime"
      :end-time="props.endTime"
      :time-interval="props.timeInterval"
      :events="currentEvents"
      :cell-disabled="props.cellDisabled"
      :event-disabled="props.eventDisabled"
      :before-event-drop="props.beforeEventDrop"
      :show-time-line="props.showTimeLine"
      @event-change="onEventChange"
    >
      <template #header-item="{ resource }">
        <slot name="header-item" :resource="resource"></slot>
      </template>
      <template #drag-handle="{ event }">
        <slot name="drag-handle" :event="event"></slot>
      </template>
      <template #default="{ item, rowIndex, colIndex }">
        <div class="cell-content"></div>
      </template>
    </virtual-grid>
  </div>
</template>

<style scoped>
.v-reservation-panel {
  width: 100%;
  height: 100%;
  position: relative;
  color: var(--nm-color-text, rgba(0, 0, 0, 0.88));
  background: var(--nm-color-bg-container);
  overflow: hidden;
}
.cell-content {
  height: 100%;
}
</style>

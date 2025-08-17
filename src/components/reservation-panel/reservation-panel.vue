<script setup>
import { ref, useTemplateRef, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
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
    default: '09:00',
  },
  /**
   * 结束时间
   */
  endTime: {
    type: String,
    default: '17:00',
  },
  /**
   * 时间间隔
   */
  timeInterval: {
    type: Number,
    default: 30,
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
  cellWidth: {
    type: Number,
    default: 120,
  },
  /**
   * 默认单元格高度
   */
  cellHeight: {
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
   * 表头高度
   */
  headerHeight: {
    type: Number,
    default: 32,
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

const bus = useEventBus();

const containerRef = useTemplateRef('container');

const currentResources = ref(props.resources);
const currentEvents = ref([]);

// 设置列的宽度
const customWidth = ref({});
const gridHeight = ref(0);
const gridWidth = ref(0);
const timeSlots = ref([]);

const getCellData = (row, col) => {
  return `行${row}, 列${col}`;
};

function onContainerResize(entries) {
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
      customWidth.value[colIndex] = props.cellWidth * (val.maxOffset + 1);
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
  if (type === 'remove') {
    currentEvents.value = currentEvents.value.filter((e) => e.id !== event.id);
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

function filterEvents(events = []) {
  const [sHours, sMinutes] = props.startTime.split(':');
  const [eHours, eMinutes] = props.endTime.split(':');
  const sHoursNum = Number(sHours);
  const eHoursNum = Number(eHours);
  const sMinutesNum = Number(sMinutes);
  const eMinutesNum = Number(eMinutes);
  const result = events.filter((event) => {
    const newEvent = { ...event };
    const [ssHours, ssMinutes] = newEvent.startTime.split(':');
    const [eeHours, eeMinutes] = newEvent.endTime.split(':');
    const ssHoursNum = Number(ssHours);
    const eeHoursNum = Number(eeHours);
    const ssMinutesNum = Number(ssMinutes);
    const eeMinutesNum = Number(eeMinutes);
    const isVisible =
      (sHoursNum <= ssHoursNum || (sHoursNum === ssHoursNum && sMinutesNum <= ssMinutesNum)) &&
      (eHoursNum >= eeHoursNum || (eHoursNum === eeHoursNum && eMinutesNum >= eeMinutesNum));

    if (!isVisible) {
      console.warn(`id 为 ${event.id} 的事件不在预定的时间范围内，已被过滤`);
    }

    return isVisible;
  });

  return result;
}

function addEvent(event) {
  bus.emit('add-event', event);
}

function removeEventById(id) {
  bus.emit('remove-event-by-id', id);
}

watch(
  [() => props.startTime, () => props.endTime, () => props.timeInterval],
  () => {
    timeSlots.value = generateTimeSlots(props.startTime, props.endTime, props.timeInterval);
  },
  {
    immediate: true,
  },
);

watch(
  () => props.resources,
  () => {
    currentResources.value = props.resources;
  },
);

onMounted(() => {
  currentEvents.value = filterEvents(props.events);
  currentEvents.value = calculateOffsets(currentEvents.value);
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
});

defineExpose({
  addEvent,
  removeEventById,
});
</script>

<template>
  <div ref="container" class="v-reservation-panel">
    <virtual-grid
      :row-count="timeSlots.length"
      :col-count="currentResources.length"
      :cell-width="props.cellWidth"
      :cell-height="props.cellHeight"
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
      :header-height="props.headerHeight"
      @event-change="onEventChange"
    >
      <template #header-item="{ resource }">
        <slot name="header-item" :resource="resource"></slot>
      </template>
      <template #drag-handle="{ event }">
        <slot name="drag-handle" :event="event"></slot>
      </template>
      <template #drag-content="{ event }">
        <slot name="drag-content" :event="event"> </slot>
      </template>
      <template #cell-item="{ rowIndex, colIndex, resource, timeSlot }">
        <slot
          name="cell-item"
          :row-index="rowIndex"
          :col-index="colIndex"
          :resource="resource"
          :time-slot="timeSlot"
        ></slot>
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
</style>

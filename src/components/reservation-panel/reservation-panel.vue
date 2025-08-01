<script setup>
import { ref, useTemplateRef, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { debounce } from 'lodash-es';
import { useEventBus } from '@src/composables/use-event-bus';
import VirtualGrid from './virtual-grid.vue';
import { generateTimeSlots } from './time';

const props = defineProps({
  startTime: {
    type: String,
    default: '07:00',
  },
  endTime: {
    type: String,
    default: '20:00',
  },
  timeInterval: {
    type: Number,
    default: 60,
  },
  resources: {
    type: Array,
    default: () => [],
  },
  events: {
    type: Array,
    default: () => [],
  },
  itemWidth: {
    type: Number,
    default: 120,
  },
  cellDisabled: {
    type: Function,
  },
  eventDisabled: {
    type: Function,
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
const timeSlots = generateTimeSlots(props.startTime, props.endTime, props.timeInterval);

const getCellData = (row, col) => {
  return `行${row}, 列${col}`;
};

function onContainerResize(entries) {
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

function onEventChange(item) {
  const index = currentEvents.value.findIndex((e) => e.id === item.id);
  if (index !== -1) {
    currentEvents.value[index].startTime = item.startTime;
    currentEvents.value[index].endTime = item.endTime;
    currentEvents.value[index].resourceId = item.resourceId;
  }
  currentEvents.value = calculateOffsets(
    currentEvents.value.map((item) => {
      const newItem = { ...item };
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
      @event-change="onEventChange"
    >
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
  background: #ffffff;
  overflow: hidden;
}
.cell-content {
  height: 100%;
}
</style>

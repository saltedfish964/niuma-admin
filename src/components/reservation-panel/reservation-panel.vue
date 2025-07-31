<script setup>
import { ref, useTemplateRef, onMounted, onBeforeUnmount } from 'vue';
import { debounce } from 'lodash-es';
import VirtualGrid from './virtual-grid.vue';
import { generateTimeSlots, toMinutes } from './time';

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
  users: {
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
});

let observer;
const containerRef = useTemplateRef('container');

const currentUser = ref(props.users);
const currentEvents = ref(calculateOffsets(props.events));

// 设置列的宽度
const customWidth = ref({
  // 0: 240,
  // 1: 360,
});
const gridHeight = ref(0);
const gridWidth = ref(0);
const timeSlots = generateTimeSlots(props.startTime, props.endTime, props.timeInterval);

calculateCustomWidth(calculateMaxOffsets(currentEvents.value));

const getCellData = (row, col) => {
  return `行${row}, 列${col}`;
};

function onContainerResize(entries) {
  for (let entry of entries) {
    const { width, height } = entry.contentRect;
    gridHeight.value = height;
    gridWidth.value = width;
  }
}

function groupByUserId(appointments) {
  return appointments.reduce((grouped, item) => {
    const key = item.userId;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
    return grouped;
  }, {});
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
  // 按 userId 分组
  const groupedByUserId = appointments.reduce((groups, item) => {
    const key = item.userId;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});

  // 计算每个分组的 offset
  Object.values(groupedByUserId).forEach((group) => {
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
    if (!result[event.userId]) {
      result[event.userId] = {
        maxOffset: 0,
        id: event.userId,
      };
    }
    result[event.userId].maxOffset = Math.max(result[event.userId].maxOffset, event.offset);
  });
  return result;
}

function calculateCustomWidth(maxOffsets = {}) {
  Object.keys(maxOffsets).forEach((key) => {
    const val = maxOffsets[key];
    const colIndex = currentUser.value.findIndex((user) => user.id === val.id);
    if (colIndex !== -1) {
      customWidth.value[colIndex] = props.itemWidth * (val.maxOffset + 1);
    }
  });
}

const getCellColor = (row, col) => {
  const hue = (row * 5 + col * 7) % 360;
  return `hsl(${hue}, 80%, 90%)`;
};

onMounted(() => {
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
      :col-count="currentUser.length"
      :item-width="props.itemWidth"
      :width="gridWidth"
      :height="gridHeight"
      :get-item-data="getCellData"
      :columns-width="customWidth"
      :users="currentUser"
      :time-slots="timeSlots"
      :start-time="props.startTime"
      :end-time="props.endTime"
      :time-interval="props.timeInterval"
      :events="currentEvents"
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

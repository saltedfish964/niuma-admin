<script setup>
import { ref, useTemplateRef, onMounted, onBeforeUnmount } from 'vue';
import { debounce } from 'lodash-es';
import VirtualGrid from './virtual-grid.vue';
import { generateTimeSlots } from './time';

const props = defineProps({
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
    default: 10,
  },
});

let observer;
const containerRef = useTemplateRef('container');
const userList = ref([]);
for (let i = 0; i <= 100; i++) {
  userList.value.push({
    id: i,
    name: `用户-${i}`,
  });
}
// 设置列的宽度
const customWidth = ref({
  0: 240,
});
const gridHeight = ref(0);
const gridWidth = ref(0);
const timeSlots = generateTimeSlots(props.startTime, props.endTime, props.timeInterval);

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
      :col-count="userList.length"
      :item-width="120"
      :item-height="32"
      :width="gridWidth"
      :height="gridHeight"
      :get-item-data="getCellData"
      :columns-width="customWidth"
      :users="userList"
      :time-slots="timeSlots"
    >
      <template #default="{ item, rowIndex, colIndex }">
        <div class="cell-content" :style="{ backgroundColor: getCellColor(rowIndex, colIndex) }">
          {{ item }}
        </div>
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

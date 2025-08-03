<script setup>
import { ref, useTemplateRef, computed, onUnmounted, onMounted, nextTick } from 'vue';
import { throttle } from 'lodash-es';
import DragList from './drag.vue';
import { groupTimesByHour } from './time';
import { useVirtualGrid } from './useVirtualGrid';
import { useDomScroll } from './useDomScroll';

const props = defineProps({
  // 总行数
  rowCount: {
    type: Number,
    required: true,
  },
  // 总列数
  colCount: {
    type: Number,
    required: true,
  },
  // 默认单元格宽度
  itemWidth: {
    type: Number,
    default: 100,
  },
  // 单元格高度
  defaultItemHeight: {
    type: Number,
    default: 32,
  },
  // 可视区域宽度
  width: {
    type: Number,
    default: 800,
  },
  // 可视区域高度
  height: {
    type: Number,
    default: 600,
  },
  // 缓冲区大小（预渲染的额外行/列数）
  buffer: {
    type: Number,
    default: 5,
  },
  // 数据获取函数
  getItemData: {
    type: Function,
    default: (row, col) => `Item (${row}, ${col})`,
  },
  // 列宽配置，格式: { columnIndex: width }
  columnsWidth: {
    type: Object,
    default: () => ({}),
  },
  // 资源列表
  resources: {
    type: Array,
    default: () => [],
  },
  // 时间列表
  timeSlots: {
    type: Array,
    default: () => [],
  },
  headerHeight: {
    type: Number,
    default: 32,
  },
  leftFixedWidth: {
    type: Number,
    default: 80,
  },
  rightFixedWidth: {
    type: Number,
    default: 80,
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
  events: {
    type: Array,
    default: () => [],
  },
  showTimeLine: {
    type: Boolean,
    default: true,
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

const emit = defineEmits(['event-change']);

let lastCellHoverResult = {
  cell: null,
  clientX: -1,
  clientY: -1,
  scrollTop: -1,
  scrollLeft: -1,
};
let timeLineTimer = null;

const containerRef = useTemplateRef('container');
const scrollXBarRef = useTemplateRef('scrollXBar');
const scrollYBarRef = useTemplateRef('scrollYBar');

const autoScrollIntervalId = ref(null);
const socrollYBarWidth = ref(16);
const socrollXBarHeight = ref(16);
const currentCell = ref(null);
const lockScroll = ref(false);
const showTimeLine = ref(false);
const timeLineTop = ref(0);
const throttleOnDragListMove = throttle(onDragListMove, 16, { trailing: false });
const throttleOnHeightResizeMove = throttle(onHeightResizeMove, 16, { trailing: false });

const {
  currentItemHeight,
  hasVerticalScroll,
  hasHorizontalScroll,
  verticalScrollContentHeight,
  horizontalScrollContentWidth,
  scrollTop,
  scrollLeft,
  gridContainerHeight,
  gridContainerWidth,
  totalHeight,
  totalWidth,
  startRowIndex,
  endRowIndex,
  visibleRows,
  startColIndex,
  endColIndex,
  visibleCols,
  isScrolledToLeft,
  isScrolledToTop,
  columnLeftPositions,
  handleScroll,
  getColumnWidth,
  calcAllSizes,
  cellDisabledState,
} = useVirtualGrid(props, socrollYBarWidth, socrollXBarHeight);
const { handleContainerWheel, handleYScroll, handleXScroll } = useDomScroll(
  containerRef,
  scrollXBarRef,
  scrollYBarRef,
  totalHeight,
  totalWidth,
  gridContainerHeight,
  gridContainerWidth,
  autoScrollIntervalId,
  lockScroll,
);

const timeSlotsGroup = computed(() => {
  return groupTimesByHour(props.timeSlots).map((group) => {
    return {
      ...group,
      top: group.startIndex * currentItemHeight.value,
    };
  });
});

// 获取指定位置的数据
function getItem(rowIndex, colIndex) {
  return props.getItemData(rowIndex, colIndex);
}

/**
 * 获取元素的滚动比例（0~1范围）
 * @param {HTMLElement} element - 要计算滚动比例的DOM元素
 * @returns {Object} 包含水平和垂直滚动比例的对象，范围0~1
 */
function getScrollRatio(element) {
  if (!element) {
    return { horizontal: 0, vertical: 0 };
  }

  // 计算最大滚动距离
  const maxScrollLeft = element.scrollWidth - element.clientWidth;
  const maxScrollTop = element.scrollHeight - element.clientHeight;

  // 计算水平滚动比例（处理边界情况）
  let horizontalRatio = 0;
  if (maxScrollLeft > 0) {
    horizontalRatio = element.scrollLeft / maxScrollLeft;
    // 当接近最大值时，强制设为1（解决精度问题）
    if (element.scrollLeft + element.clientWidth >= element.scrollWidth - 1) {
      horizontalRatio = 1;
    }
  }

  // 计算垂直滚动比例（处理边界情况）
  let verticalRatio = 0;
  if (maxScrollTop > 0) {
    verticalRatio = element.scrollTop / maxScrollTop;
    // 当接近最大值时，强制设为1（解决精度问题）
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 1) {
      verticalRatio = 1;
    }
  }

  // 确保范围在0~1之间
  return {
    horizontal: Math.min(Math.max(horizontalRatio, 0), 1),
    vertical: Math.min(Math.max(verticalRatio, 0), 1),
  };
}

function isHoveredCellCacheValid(x, y) {
  // 如果上次没有悬停格子，总是重新计算
  if (!lastCellHoverResult.cell) return false;
  // 检查鼠标位置是否变化
  if (
    Math.abs(x - lastCellHoverResult.clientX) > 2 ||
    Math.abs(y - lastCellHoverResult.clientY) > 2
  ) {
    return false;
  }
  // 检查滚动位置是否变化
  if (
    Math.abs(containerRef.value.scrollTop - lastCellHoverResult.scrollTop) > 2 ||
    Math.abs(containerRef.value.scrollLeft - lastCellHoverResult.scrollLeft) > 2
  ) {
    return false;
  }
  return true;
}

function getHoveredCell(x, y) {
  if (isHoveredCellCacheValid(x, y)) {
    return lastCellHoverResult.cell;
  }

  // 计算新的悬停格子
  const containerRect = containerRef.value.getBoundingClientRect();
  const mouseX = x - containerRect.left;
  const mouseY = y - containerRect.top;

  // 快速检查是否在容器内
  if (mouseX < 0 || mouseX > containerRect.width || mouseY < 0 || mouseY > containerRect.height) {
    lastCellHoverResult = {
      cell: null,
      clientX: x,
      clientY: y,
      scrollTop: containerRef.value.scrollTop,
      scrollLeft: containerRef.value.scrollLeft,
    };
    return null;
  }

  const scrollTop = containerRef.value.scrollTop;
  const scrollLeft = containerRef.value.scrollLeft;
  const actualX = mouseX + scrollLeft;
  const actualY = mouseY + scrollTop;

  const rowIndex = Math.floor(actualY / currentItemHeight.value);
  const rowTop = rowIndex * currentItemHeight.value;

  // 计算列索引（考虑不同列宽）
  let colIndex = 0;
  let accumulatedWidth = 0;
  for (; colIndex < props.colCount; colIndex++) {
    const colWidth = getColumnWidth(colIndex);
    if (actualX < accumulatedWidth + colWidth) {
      break;
    }
    accumulatedWidth += colWidth;
  }
  const colLeft = accumulatedWidth;

  // 检查是否在有效范围内
  if (rowIndex >= 0 && rowIndex < props.rowCount && colIndex >= 0 && colIndex < props.colCount) {
    // 检查是否在当前渲染的范围内（虚拟滚动）
    if (
      rowIndex >= startRowIndex.value - props.buffer &&
      rowIndex <= endRowIndex.value + props.buffer &&
      colIndex >= startColIndex.value &&
      colIndex <= endColIndex.value
    ) {
      const result = {
        row: rowIndex,
        column: colIndex,
        x: actualX,
        y: actualY,
        screenX: x,
        screenY: y,
        top: rowTop, // 新增：格子的顶部位置
        left: colLeft, // 新增：格子的左侧位置
        width: getColumnWidth(colIndex), // 新增：格子宽度
        height: currentItemHeight.value, // 新增：格子高度
      };

      // 更新缓存
      lastCellHoverResult = {
        cell: result,
        clientX: x,
        clientY: y,
        scrollTop: scrollTop,
        scrollLeft: scrollLeft,
      };

      return result;
    }
  }

  // 更新缓存（无悬停）
  lastCellHoverResult = {
    cell: null,
    clientX: x,
    clientY: y,
    scrollTop: scrollTop,
    scrollLeft: scrollLeft,
  };

  return null;
}

function checkEdgeScroll(
  mouseX,
  mouseY,
  scrollInterval = 16,
  scrollSpeed = 8,
  scrollThreshold = 10,
) {
  // 获取容器边界
  const containerRect = containerRef.value.getBoundingClientRect();

  // 清除现有滚动定时器
  clearInterval(autoScrollIntervalId.value);
  autoScrollIntervalId.value = null;

  // 计算滚动方向和速度
  let scrollX = 0;
  let scrollY = 0;

  // 水平方向边缘检测
  if (mouseX < containerRect.left + scrollThreshold) {
    scrollX = -scrollSpeed;
  } else if (mouseX > containerRect.right - scrollThreshold) {
    scrollX = scrollSpeed;
  }

  // 垂直方向边缘检测
  if (mouseY < containerRect.top + scrollThreshold) {
    scrollY = -scrollSpeed;
  } else if (mouseY > containerRect.bottom - scrollThreshold) {
    scrollY = scrollSpeed;
  }

  // 如果需要滚动，启动滚动定时器
  if (scrollX !== 0 || scrollY !== 0) {
    autoScrollIntervalId.value = setInterval(() => {
      const { horizontal, vertical } = getScrollRatio(containerRef.value);
      containerRef.value.scrollLeft += scrollX;
      containerRef.value.scrollTop += scrollY;
      scrollYBarRef.value.scrollTop =
        vertical * (scrollYBarRef.value.scrollHeight - scrollYBarRef.value.clientHeight);
      scrollXBarRef.value.scrollLeft =
        horizontal * (scrollXBarRef.value.scrollWidth - scrollXBarRef.value.clientWidth);
    }, scrollInterval);
  }
}

function onDragListMove(x, y) {
  currentCell.value = getHoveredCell(x, y);
  checkEdgeScroll(x, y);
}

function onHeightResizeMove(x, y) {
  currentCell.value = getHoveredCell(x, y);
}

function onDragListMoveend() {
  clearInterval(autoScrollIntervalId.value);
  autoScrollIntervalId.value = null;
  currentCell.value = null;
}

function getScrollbarWidth() {
  if (!containerRef.value) return { yWidth: 0, xHeight: 0 };
  // 创建外层div
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.overflow = 'scroll'; // 强制显示滚动条
  containerRef.value.appendChild(outer);

  // 创建内层div
  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  // 计算宽度差
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  const scrollbarHeight = outer.offsetHeight - inner.offsetHeight;

  // 清理
  outer.parentNode.removeChild(outer);

  return { yWidth: scrollbarWidth, xHeight: scrollbarHeight };
}

function initScrollBarSize() {
  const res = getScrollbarWidth();
  socrollYBarWidth.value = res.yWidth;
  socrollXBarHeight.value = res.xHeight;
}

function onEventChange(item) {
  emit('event-change', item);
}

function updateScrollBarOffset() {
  lockScroll.value = true;
  const { horizontal, vertical } = getScrollRatio(containerRef.value);
  nextTick(() => {
    scrollYBarRef.value.scrollTop =
      vertical * (scrollYBarRef.value.scrollHeight - scrollYBarRef.value.clientHeight);
    scrollXBarRef.value.scrollLeft =
      horizontal * (scrollXBarRef.value.scrollWidth - scrollXBarRef.value.clientWidth);
    setTimeout(() => {
      lockScroll.value = false;
    }, 200);
  });
}

function onEventScrollToViewEnd() {
  setTimeout(() => {
    updateScrollBarOffset();
  }, 100);
}

function calculateTimeLineTop() {
  setTimeout(() => {
    if (!props.showTimeLine) {
      showTimeLine.value = false;
      return;
    }
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const [ssHours, ssMinutes] = props.startTime.split(':');
    const [eeHours, eeMinutes] = props.endTime.split(':');

    const ssHoursNumber = Number(ssHours);
    const eeHoursNumber = Number(eeHours);
    const ssMinutesNumber = Number(ssMinutes);
    const eeMinutesNumber = Number(eeMinutes);

    showTimeLine.value =
      (hours > ssHoursNumber || (hours === ssHoursNumber && minutes >= ssMinutesNumber)) &&
      (hours < eeHoursNumber || (hours === eeHoursNumber && minutes <= eeMinutesNumber));

    if (!showTimeLine.value) return;

    // 计算一共有多少分钟
    const totalMinutes = (eeHoursNumber - ssHoursNumber) * 60 + (eeMinutesNumber - ssMinutesNumber);
    const allHeight = hasVerticalScroll.value ? totalHeight.value : gridContainerHeight.value;
    const oneMinuteHeight = allHeight / totalMinutes;

    const nowMinutes = hours * 60 + minutes;
    const diffMinutes = nowMinutes - ssHoursNumber * 60 - ssMinutesNumber;

    timeLineTop.value = oneMinuteHeight * diffMinutes;
  }, 200);
}

function startTimeLineTimer() {
  if (!timeLineTimer) {
    calculateTimeLineTop();
    timeLineTimer = setInterval(() => {
      calculateTimeLineTop();
    }, 1000);
  }
}

function stopTimeLineTimer() {
  if (timeLineTimer) {
    clearInterval(timeLineTimer);
    timeLineTimer = null;
  }
}

onMounted(() => {
  initScrollBarSize();
  calcAllSizes(props.width, props.height);
  startTimeLineTimer();
});

onUnmounted(() => {
  clearInterval(autoScrollIntervalId.value);
  autoScrollIntervalId.value = null;
  stopTimeLineTimer();
});

defineExpose({
  calcAllSizes,
});
</script>

<template>
  <div class="v-reservation-panel">
    <!-- 固定表头 -->
    <div
      class="v-fixed-header-container"
      :style="{
        height: `${props.headerHeight}px`,
        width: `${gridContainerWidth}px`,
        transform: `translateX(${props.leftFixedWidth}px)`,
      }"
    >
      <div
        class="v-fixed-header"
        :style="{
          width: `${totalWidth}px`,
          transform: `translateX(${-scrollLeft}px)`,
        }"
      >
        <div
          v-for="col in visibleCols"
          :key="col.index"
          :class="[
            'v-fixed-header-col',
            isScrolledToLeft ? 'v-fixed-header-col-first-border-left-none' : '',
            !hasHorizontalScroll ? 'v-fixed-header-col-last-border-right' : '',
          ]"
          :style="{
            transform: `translateX(${col.left}px)`,
            width: `${col.width}px`,
            borderBottom: !isScrolledToTop ? 'var(--nm-border, 1px solid #ddd)' : 'none',
          }"
        >
          <slot name="header-item" :resource="props.resources[col.index]">
            {{ props.resources[col.index]?.name }}
          </slot>
        </div>
      </div>
    </div>

    <!-- 左边固定列 -->
    <div
      class="v-fixed-left-container"
      :style="{
        height: `${props.height}px`,
        width: `${props.leftFixedWidth}px`,
        paddingTop: `${props.headerHeight}px`,
      }"
      @wheel="handleContainerWheel"
    >
      <div
        :style="{
          height: `${totalHeight}px`,
          transform: `translateY(${-scrollTop}px)`,
          position: 'relative',
        }"
      >
        <div
          v-for="time in timeSlotsGroup"
          :key="time.hour"
          :class="[
            'v-time-item-container',
            !hasVerticalScroll ? 'v-time-item-container-border-bottom' : '',
          ]"
          :style="{
            height: `${time.times.length * currentItemHeight}px`,
            transform: `translateY(${time.top}px)`,
          }"
        >
          <div class="v-time-item-hour" :style="{ height: `${currentItemHeight}px` }">
            {{ time.hour }}
          </div>
          <div style="flex: 1">
            <div
              class="v-time-item"
              v-for="timeSlot in time.times"
              :key="timeSlot"
              :style="{
                height: `${currentItemHeight}px`,
              }"
            >
              {{ timeSlot }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 遮挡元素 -->
    <div
      class="v-fixed-left-mask"
      :style="{
        width: `${props.leftFixedWidth}px`,
        height: `${props.headerHeight}px`,
        borderBottom: !isScrolledToTop ? 'var(--nm-border, 1px solid #ddd)' : 'none',
      }"
    ></div>

    <!-- 右边固定列 -->
    <div
      class="v-fixed-right-container"
      :style="{
        height: `${props.height}px`,
        width: `${props.rightFixedWidth}px`,
        right: `${hasVerticalScroll ? socrollYBarWidth : 0}px`,
        paddingTop: `${props.headerHeight}px`,
      }"
      @wheel="handleContainerWheel"
    >
      <div
        :style="{
          height: `${totalHeight}px`,
          transform: `translateY(${-scrollTop}px)`,
          position: 'relative',
        }"
      >
        <div
          v-for="time in timeSlotsGroup"
          :key="time.hour"
          :class="[
            'v-time-item-container',
            !hasVerticalScroll ? 'v-time-item-container-border-bottom' : '',
          ]"
          :style="{
            height: `${time.times.length * currentItemHeight}px`,
            transform: `translateY(${time.top}px)`,
          }"
        >
          <div style="flex: 1">
            <div
              class="v-time-item"
              v-for="timeSlot in time.times"
              :key="timeSlot"
              :style="{ height: `${currentItemHeight}px` }"
            >
              {{ timeSlot }}
            </div>
          </div>
          <div class="v-time-item-hour" :style="{ height: `${currentItemHeight}px` }">
            {{ time.hour }}
          </div>
        </div>
      </div>
    </div>
    <!-- 遮挡元素 -->
    <div
      class="v-fixed-right-mask"
      :style="{
        width: `${props.rightFixedWidth}px`,
        height: `${props.headerHeight}px`,
        right: `${hasVerticalScroll ? socrollYBarWidth : 0}px`,
        borderBottom: !isScrolledToTop ? 'var(--nm-border, 1px solid #ddd)' : 'none',
      }"
    ></div>

    <!-- Y 滚动条 -->
    <div
      v-show="hasVerticalScroll"
      ref="scrollYBar"
      class="v-y-scrollbar"
      :style="{ height: `${props.height}px`, width: `${socrollYBarWidth}px` }"
      @scroll="handleYScroll"
    >
      <div
        :style="{
          height: `${verticalScrollContentHeight}px`,
          width: `${socrollYBarWidth}px`,
        }"
      ></div>
    </div>
    <!-- X 滚动条右边遮罩 -->
    <div
      v-show="hasVerticalScroll && !hasHorizontalScroll"
      class="v-y-scrollbar-mask"
      :style="{ width: `${socrollXBarHeight}px`, height: `${socrollXBarHeight}px` }"
    ></div>

    <!-- X 滚动条 -->
    <div
      v-show="hasHorizontalScroll"
      ref="scrollXBar"
      class="v-x-scrollbar"
      :style="{ height: `${socrollXBarHeight}px`, width: `${props.width}px` }"
      @scroll="handleXScroll"
    >
      <div
        :style="{
          height: `${socrollXBarHeight}px`,
          width: `${horizontalScrollContentWidth}px`,
        }"
      ></div>
    </div>
    <!-- X 滚动条右边遮罩 -->
    <div
      v-show="hasHorizontalScroll && !hasVerticalScroll"
      class="v-x-scrollbar-mask"
      :style="{ width: `${socrollXBarHeight}px`, height: `${socrollXBarHeight}px` }"
    ></div>

    <div
      class="virtual-grid-container"
      ref="container"
      :style="{
        height: `${gridContainerHeight}px`,
        width: `${gridContainerWidth}px`,
        transform: `translateX(${props.leftFixedWidth}px)`,
      }"
      @scroll="handleScroll"
      @wheel="handleContainerWheel"
    >
      <div
        class="virtual-grid-content"
        :style="{
          height: `${totalHeight}px`,
          width: `${totalWidth}px`,
        }"
      >
        <drag-list
          :container="containerRef"
          :item-width="props.itemWidth"
          :item-height="currentItemHeight"
          :current-cell="currentCell"
          :start-time="props.startTime"
          :end-time="props.endTime"
          :time-interval="props.timeInterval"
          :total-height="hasVerticalScroll ? totalHeight : gridContainerHeight"
          :resources="props.resources"
          :column-left-positions="columnLeftPositions"
          :time-slots="props.timeSlots"
          :events="props.events"
          :cell-disabled="props.cellDisabled"
          :event-disabled="props.eventDisabled"
          :before-event-drop="props.beforeEventDrop"
          @move="throttleOnDragListMove"
          @moveend="onDragListMoveend"
          @height-resize-move="throttleOnHeightResizeMove"
          @event-change="onEventChange"
          @event-scroll-to-view-end="onEventScrollToViewEnd"
        ></drag-list>
        <div
          v-for="row in visibleRows"
          :key="row.index"
          :class="[
            'virtual-grid-row',
            !hasVerticalScroll ? 'virtual-grid-row-last-border-bottom' : '',
          ]"
          :style="{
            transform: `translateY(${row.top}px)`,
            height: `${currentItemHeight}px`,
          }"
        >
          <div
            v-for="col in visibleCols"
            :key="col.index"
            :class="[
              'virtual-grid-cell',
              isScrolledToLeft ? 'virtual-grid-cell-first-border-left-none' : '',
              !hasHorizontalScroll ? 'virtual-grid-cell-last-border-right' : '',
              cellDisabledState(col.index, row.index) ? 'virtual-grid-cell-disabled' : '',
            ]"
            :style="{
              transform: `translateX(${col.left}px)`,
              width: `${col.width}px`,
            }"
          >
            <slot
              :item="getItem(row.index, col.index)"
              :row-index="row.index"
              :col-index="col.index"
            >
              {{ getItem(row.index, col.index) }}
            </slot>
          </div>
        </div>
      </div>
      <!-- 时间线 -->
      <div
        v-if="showTimeLine"
        class="v-time-line"
        :style="{ transform: `translateX(${scrollLeft}px)`, top: `${timeLineTop}px` }"
      >
        <!-- 左箭头 -->
        <div class="v-time-line-arrow-left" :style="{ left: `${socrollXBarHeight}px` }"></div>
        <div class="v-time-line-arrow-right" :style="{ right: `${socrollXBarHeight}px` }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-reservation-panel {
  width: 100%;
  height: 100%;
  position: relative;
  border-bottom: var(--nm-border, 1px solid #ddd);
  border-right: var(--nm-border, 1px solid #ddd);
}
.virtual-grid-container {
  overflow: auto;
  position: relative;
  overflow: hidden;
}
.v-fixed-header-container {
  border-top: var(--nm-border, 1px solid #ddd);
  overflow: hidden;
}
.v-fixed-header {
  position: relative;
  height: 100%;
  overflow: hidden;
}
.v-fixed-header-col {
  position: absolute;
  box-sizing: border-box;
  height: 100%;
  border-left: var(--nm-border, 1px solid #ddd);
  background-color: var(--nm-color-bg-container);
}
.v-fixed-header-col-first-border-left-none:first-child {
  border-left: none;
}
.v-fixed-header-col-last-border-right:last-child {
  border-right: var(--nm-border, 1px solid #ddd);
}
/* 左边固定 */
.v-fixed-left-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-right: var(--nm-border, 1px solid #ddd);
  border-left: var(--nm-border, 1px solid #ddd);
  z-index: 10;
}
.v-fixed-left-container .v-time-item-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
}
.v-fixed-left-container .v-time-item {
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: var(--nm-border, 1px solid #ddd);
  border-top: var(--nm-border, 1px solid #ddd);
  width: 100%;
}
.v-fixed-left-container .v-time-item-hour {
  border-top: var(--nm-border, 1px solid #ddd);
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
.v-fixed-left-mask {
  position: absolute;
  top: 0;
  left: 0;
  border-left: var(--nm-border, 1px solid #ddd);
  border-right: var(--nm-border, 1px solid #ddd);
  border-top: var(--nm-border, 1px solid #ddd);
  background: var(--nm-color-bg-container);
  z-index: 20;
}
/* 右边固定 */
.v-fixed-right-container {
  position: absolute;
  top: 0;
  height: 100%;
  overflow: hidden;
  z-index: 10;
  border-left: var(--nm-border, 1px solid #ddd);
}
.v-fixed-right-container .v-time-item-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
}
.v-fixed-right-container .v-time-item-hour {
  border-top: var(--nm-border, 1px solid #ddd);
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
.v-fixed-right-container .v-time-item {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: var(--nm-border, 1px solid #ddd);
  border-top: var(--nm-border, 1px solid #ddd);
  width: 100%;
}
.v-fixed-right-mask {
  position: absolute;
  top: 0;
  border-left: var(--nm-border, 1px solid #ddd);
  border-top: var(--nm-border, 1px solid #ddd);
  background: var(--nm-color-bg-container);
  z-index: 20;
}
.v-time-item-container-border-bottom:last-child {
  border-bottom: var(--nm-border, 1px solid #ddd);
}
/* Y 滚动条 */
.v-y-scrollbar {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background-color: var(--nm-color-bg-container);
  border-left: var(--nm-border, 1px solid #ddd);
  border-top: var(--nm-border, 1px solid #ddd);
  overflow: auto;
  z-index: 20;
}
.v-y-scrollbar-mask {
  background: var(--nm-scrollbar-bg, #2c2c2c);
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 20;
  border-left: var(--nm-border, 1px solid #ddd);
}
/* X 滚动条 */
.v-x-scrollbar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--nm-color-bg-container);
  border-left: var(--nm-border, 1px solid #ddd);
  border-top: var(--nm-border, 1px solid #ddd);
  overflow: auto;
  z-index: 20;
}
.v-x-scrollbar-mask {
  background: var(--nm-scrollbar-bg, #2c2c2c);
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 20;
  border-top: var(--nm-border, 1px solid #ddd);
}
.virtual-grid-content {
  position: relative;
}
.virtual-grid-row {
  position: absolute;
  left: 0;
  width: 100%;
}
.virtual-grid-row-last-border-bottom:last-child {
  border-bottom: var(--nm-border, 1px solid #ddd);
}
.virtual-grid-cell {
  height: 100%;
  position: absolute;
  box-sizing: border-box;
  border-left: var(--nm-border, 1px solid #ddd);
  border-top: var(--nm-border, 1px solid #ddd);
  background-color: var(--nm-color-bg-container);
  overflow: hidden;
}
.virtual-grid-cell-first-border-left-none:first-child {
  border-left: none;
}
.virtual-grid-cell-last-border-right:last-child {
  border-right: var(--nm-border, 1px solid #ddd);
}
.virtual-grid-cell-disabled {
  background: var(--nm-color-fill-tertiary, #f9f9f9);
}
/* 时间线 */
.v-time-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--nm-primary-color, #3e74fd);
  z-index: 1;
}
.v-time-line-arrow-left {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-bottom: 6px solid var(--nm-primary-color, #3e74fd);
  transform: rotate(90deg) translateX(-2px) translateY(12px);
}
.v-time-line-arrow-right {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-bottom: 6px solid var(--nm-primary-color, #3e74fd);
  transform: rotate(270deg) translateX(2px) translateY(12px);
}
</style>

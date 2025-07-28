<script setup>
import { ref, useTemplateRef, computed, watch } from 'vue';
import DragList from './drag.vue';
import { groupTimesByHour } from './time';
import { debounce, throttle } from 'lodash-es';

const DEFAULT_ITEM_HEIGHT = 32;

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
    default: DEFAULT_ITEM_HEIGHT,
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
  // 用户列表
  users: {
    type: Array,
    default: () => [],
  },
  // 时间列表
  timeSlots: {
    type: Array,
    default: () => [],
  },
});

const containerRef = useTemplateRef('container');
const scrollXBarRef = useTemplateRef('scrollXBar');
const scrollYBarRef = useTemplateRef('scrollYBar');

let scrollTicking = false;
let lastCellHoverResult = {
  cell: null,
  clientX: -1,
  clientY: -1,
  scrollTop: -1,
  scrollLeft: -1,
};
const throttleOnDragListMove = throttle(onDragListMove, 50);

const currentItemHeight = ref(props.defaultItemHeight);
const scrollTop = ref(0);
const scrollLeft = ref(0);
const headerHeight = ref(32);
const leftFixedWidth = ref(80);
const rightFixedWidth = ref(80);
const socrollYBarWidth = ref(12);
const socrollXBarHeight = ref(12);

const gridContainerHeight = ref(0);
const gridContainerWidth = ref(0);

// 判断是否需要显示垂直滚动条
const hasVerticalScroll = ref(false);
// 判断是否需要显示水平滚动条
const hasHorizontalScroll = ref(false);

const verticalScrollContentHeight = ref(0);
const horizontalScrollContentWidth = ref(0);

// 计算总高度和总宽度
const totalHeight = ref(0);
const totalWidth = ref(0);

// 计算列的左侧位置
const columnLeftPositions = computed(() => {
  const positions = new Array(props.colCount);
  let left = 0;

  for (let i = 0; i < props.colCount; i++) {
    positions[i] = left;
    left += getColumnWidth(i);
  }

  return positions;
});

// 计算可见行数
const visibleRowCount = computed(
  () => Math.ceil(props.height / currentItemHeight.value) + props.buffer * 2,
);

// 计算起始行索引
const startRowIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / currentItemHeight.value) - props.buffer),
);

// 计算结束行索引
const endRowIndex = computed(() =>
  Math.min(props.rowCount, startRowIndex.value + visibleRowCount.value),
);

// 计算可见行
const visibleRows = computed(() => {
  const rows = [];
  for (let i = startRowIndex.value; i < endRowIndex.value; i++) {
    rows.push({
      index: i,
      top: i * currentItemHeight.value,
    });
  }
  return rows;
});

// 计算起始列索引 - 考虑不同列宽
const startColIndex = computed(() => {
  let index = 0;
  while (
    index < props.colCount &&
    columnLeftPositions.value[index] < scrollLeft.value - getColumnWidth(index) * props.buffer
  ) {
    index++;
  }
  return Math.max(0, index - props.buffer);
});

// 计算结束列索引 - 考虑不同列宽
const endColIndex = computed(() => {
  let index = startColIndex.value;
  while (
    index < props.colCount &&
    columnLeftPositions.value[index] <=
      scrollLeft.value + props.width + getColumnWidth(index) * props.buffer
  ) {
    index++;
  }
  return Math.min(props.colCount, index);
});

// 计算可见列 - 包含位置和宽度
const visibleCols = computed(() => {
  const cols = [];
  for (let i = startColIndex.value; i < endColIndex.value; i++) {
    cols.push({
      index: i,
      left: columnLeftPositions.value[i],
      width: getColumnWidth(i),
    });
  }
  return cols;
});
// TODO: 虚拟滚动方式，由于分组，如果时间分段过多，会出现空白问题
// const timeSlotsGroup = computed(() => {
//   const visibleTimeSlots = props.timeSlots.slice(startRowIndex.value, endRowIndex.value);
//   const groupTime = groupTimesByHour(props.timeSlots)
//     .map((group) => {
//       return {
//         hour: group.hour,
//         startIndex: group.startIndex, // 记录该小时的起始索引
//         top: group.startIndex * currentItemHeight.value, // 计算该小时的顶部位置
//         times: group.times.filter((time) => {
//           return visibleTimeSlots.includes(time);
//         }),
//       };
//     })
//     .filter((group) => group.times.length > 0);
//   return groupTime;
// });
const timeSlotsGroup = computed(() => {
  return groupTimesByHour(props.timeSlots).map((group) => {
    return {
      ...group,
      top: group.startIndex * currentItemHeight.value,
    };
  });
});

// 判断 x 轴滚动条是否滚动到最右边
const isScrolledToRight = computed(() => {
  // 计算所有列的总宽度（不包括左右固定列）
  let columnsWidth = 0;
  for (let i = 0; i < props.colCount; i++) {
    columnsWidth += getColumnWidth(i);
  }

  // 计算最大可滚动宽度
  const maxScrollLeft = columnsWidth - gridContainerWidth.value;

  // 如果最大可滚动宽度小于等于0，或者已经滚动到接近最大位置
  // 添加1像素的容差值避免浮点数精度问题
  return maxScrollLeft <= 0 || scrollLeft.value >= maxScrollLeft - 1;
});

// 判断 y 轴是否滚动到底部
const isScrolledToBottom = computed(() => {
  // 计算最大可滚动高度
  const maxScrollTop = totalHeight.value - gridContainerHeight.value;

  // 如果最大可滚动高度小于等于0，或者已经滚动到接近最大位置
  // 添加1像素的容差值避免浮点数精度问题
  return maxScrollTop <= 0 || scrollTop.value >= maxScrollTop - 1;
});

// 判断 x 轴滚动条是否滚动到最左边
const isScrolledToLeft = computed(() => {
  // 当 scrollLeft 为 0 或非常接近 0 时，认为已滚动到最左边
  return scrollLeft.value <= 1; // 添加1像素的容差值避免浮点数精度问题
});

// 判断 y 轴是否滚动到最顶部
const isScrolledToTop = computed(() => {
  // 当 scrollTop 为 0 或非常接近 0 时，认为已滚动到最顶部
  return scrollTop.value <= 1; // 添加1像素的容差值避免浮点数精度问题
});

// 获取指定列的宽度
function getColumnWidth(colIndex) {
  return props.columnsWidth[colIndex] || props.itemWidth;
}

// 获取指定位置的数据
function getItem(rowIndex, colIndex) {
  return props.getItemData(rowIndex, colIndex);
}

// 优化滚动事件处理
function handleScroll(event) {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      scrollTop.value = event.target.scrollTop;
      scrollLeft.value = event.target.scrollLeft;
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}

function handleContainerWheel(event) {
  if (!containerRef.value || !scrollYBarRef.value || !scrollXBarRef.value) return;
  event.preventDefault();

  // 垂直滚动
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    containerRef.value.scrollTop += event.deltaY;

    const maxContainerScroll = totalHeight.value - gridContainerHeight.value;
    const maxBarScroll = scrollYBarRef.value.scrollHeight - scrollYBarRef.value.clientHeight;
    if (maxContainerScroll <= 0) return;
    const scrollRatio = Math.min(1, Math.max(0, containerRef.value.scrollTop / maxContainerScroll));
    scrollYBarRef.value.scrollTop = scrollRatio * maxBarScroll;
  } else {
    containerRef.value.scrollLeft += e.deltaX;

    const maxContainerScroll = totalWidth.value - gridContainerWidth.value;
    const maxBarScroll = scrollXBarRef.value.scrollWidth - scrollXBarRef.value.clientWidth;

    if (maxContainerScroll <= 0) return;

    const scrollRatio = Math.min(
      1,
      Math.max(0, containerRef.value.scrollLeft / maxContainerScroll),
    );
    scrollXBarRef.value.scrollLeft = scrollRatio * maxBarScroll;
  }
}

function handleYScroll(event) {
  if (!containerRef.value || !scrollYBarRef.value) return;
  event.preventDefault();
  const scrollPos = scrollYBarRef.value.scrollTop;
  const totalScroll = scrollYBarRef.value.scrollHeight;
  const visibleSize = scrollYBarRef.value.clientHeight;
  const maxScroll = Math.max(0, totalScroll - visibleSize);
  if (maxScroll <= 0) return 0;
  const percentage = Math.min(1, Math.max(0, scrollPos / maxScroll));
  containerRef.value.scrollTop = percentage * (totalHeight.value - gridContainerHeight.value);
}

function handleXScroll(event) {
  if (!containerRef.value) return;
  event.preventDefault();
  containerRef.value.scrollLeft = event.target.scrollLeft;
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
  const colIndex = Math.floor(actualX / props.itemWidth);

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

function onDragListMove(x, y) {
  const hoveredCell = getHoveredCell(x, y);
  if (hoveredCell) {
    console.log('当前悬停的格子:', hoveredCell);
    // 在这里处理悬停逻辑
  }
}

function getScrollbarWidth() {
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

  // 清理
  outer.parentNode.removeChild(outer);

  return scrollbarWidth;
}

function calcAllSizes(componentWidth, componentHeight) {
  // 重置格子高度
  currentItemHeight.value = props.defaultItemHeight;

  // 网格可视区域宽高
  let gridViewWidth = componentWidth;
  let gridViewHeight = componentHeight;

  // 网格内容宽高
  let gridContentWidth = 0;
  let gridContentHeight = 0;
  for (let i = 0; i < props.colCount; i++) {
    gridContentWidth += getColumnWidth(i);
  }
  gridContentHeight = props.rowCount * currentItemHeight.value;

  gridViewHeight -= headerHeight.value;

  // 是否有垂直滚动条
  let hasVScroll =
    gridContentHeight > gridViewHeight ||
    gridContentHeight > gridViewHeight - socrollXBarHeight.value;
  // 是否有水平滚动条
  let hasHScroll =
    gridContentWidth > gridViewWidth || gridContentWidth > gridViewWidth - socrollYBarWidth.value;

  if (hasHScroll) {
    gridViewHeight -= socrollXBarHeight.value;
  }

  gridViewWidth -= leftFixedWidth.value + rightFixedWidth.value;

  hasVerticalScroll.value = hasVScroll;
  hasHorizontalScroll.value = hasHScroll;

  verticalScrollContentHeight.value = gridContentHeight + headerHeight.value;
  horizontalScrollContentWidth.value =
    gridContentWidth + leftFixedWidth.value + rightFixedWidth.value;

  totalHeight.value = gridContentHeight;
  totalWidth.value = gridContentWidth;

  gridContainerWidth.value = gridViewWidth;
  gridContainerHeight.value = gridViewHeight;

  if (!hasVScroll) {
    currentItemHeight.value = gridViewHeight / props.rowCount;
  } else {
    currentItemHeight.value = DEFAULT_ITEM_HEIGHT;
  }
}

watch(
  [() => props.width, () => props.height],
  debounce(([w, h]) => {
    calcAllSizes(w, h);
  }, 100),
  { immediate: true },
);
</script>

<template>
  <div class="v-reservation-panel">
    <!-- 固定表头 -->
    <div
      class="v-fixed-header-container"
      :style="{
        height: `${headerHeight}px`,
        width: `${hasVerticalScroll ? gridContainerWidth - socrollYBarWidth : gridContainerWidth}px`,
        transform: `translateX(${leftFixedWidth}px)`,
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
            borderBottom: !isScrolledToTop ? '1px solid #ddd' : 'none',
          }"
        >
          {{ props.users[col.index]?.name }}
        </div>
      </div>
    </div>

    <!-- 左边固定列 -->
    <div
      class="v-fixed-left-container"
      :style="{
        height: `${props.height}px`,
        width: `${leftFixedWidth}px`,
        paddingTop: `${headerHeight}px`,
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
        width: `${leftFixedWidth}px`,
        height: `${headerHeight}px`,
        borderBottom: !isScrolledToTop ? '1px solid #ddd' : 'none',
      }"
    ></div>

    <!-- 右边固定列 -->
    <div
      class="v-fixed-right-container"
      :style="{
        height: `${props.height}px`,
        width: `${rightFixedWidth}px`,
        right: `${hasVerticalScroll ? socrollYBarWidth : 0}px`,
        paddingTop: `${headerHeight}px`,
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
        width: `${rightFixedWidth}px`,
        height: `${headerHeight}px`,
        right: `${hasVerticalScroll ? socrollYBarWidth : 0}px`,
        borderBottom: !isScrolledToTop ? '1px solid #ddd' : 'none',
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

    <div
      class="virtual-grid-container"
      ref="container"
      :style="{
        height: `${gridContainerHeight}px`,
        width: `${hasVerticalScroll ? gridContainerWidth - socrollYBarWidth : gridContainerWidth}px`,
        transform: `translateX(${leftFixedWidth}px)`,
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
          :containerRef="containerRef"
          :item-width="props.itemWidth"
          :item-height="currentItemHeight"
          @move="throttleOnDragListMove"
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
    </div>
  </div>
</template>

<style scoped>
.v-reservation-panel {
  width: 100%;
  height: 100%;
  position: relative;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
}
.virtual-grid-container {
  overflow: auto;
  position: relative;
  overflow: hidden;
}
.v-fixed-header-container {
  border-top: 1px solid #ddd;
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
  border-left: 1px solid #ddd;
  background-color: #fff;
}
.v-fixed-header-col-first-border-left-none:first-child {
  border-left: none;
}
.v-fixed-header-col-last-border-right:last-child {
  border-right: 1px solid #ddd;
}
/* 左边固定 */
.v-fixed-left-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #f9f9f9;
  border-right: 1px solid #ddd;
  border-left: 1px solid #ddd;
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
  border-left: 1px solid #ddd;
  border-top: 1px solid #ddd;
  width: 100%;
}
.v-fixed-left-container .v-time-item-hour {
  border-top: 1px solid #ddd;
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
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  border-top: 1px solid #ddd;
  background: #ffffff;
  z-index: 20;
}
/* 右边固定 */
.v-fixed-right-container {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: #f9f9f9;
  overflow: hidden;
  z-index: 10;
  border-left: 1px solid #ddd;
}
.v-fixed-right-container .v-time-item-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
}
.v-fixed-right-container .v-time-item-hour {
  border-top: 1px solid #ddd;
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
  border-right: 1px solid #ddd;
  border-top: 1px solid #ddd;
  width: 100%;
}
.v-fixed-right-mask {
  position: absolute;
  top: 0;
  border-left: 1px solid #ddd;
  border-top: 1px solid #ddd;
  background: #ffffff;
  z-index: 20;
}
.v-time-item-container-border-bottom:last-child {
  border-bottom: 1px solid #ddd;
}
/* Y 滚动条 */
.v-y-scrollbar {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background-color: #ffffff;
  border-left: 1px solid #ddd;
  border-top: 1px solid #ddd;
  overflow: auto;
  z-index: 20;
}
/* X 滚动条 */
.v-x-scrollbar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  border-left: 1px solid #ddd;
  border-top: 1px solid #ddd;
  overflow: auto;
  z-index: 20;
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
  border-bottom: 1px solid #ddd;
}
.virtual-grid-cell {
  height: 100%;
  position: absolute;
  box-sizing: border-box;
  border-left: 1px solid #ddd;
  border-top: 1px solid #ddd;
  background-color: #fff;
  overflow: hidden;
}
.virtual-grid-cell-first-border-left-none:first-child {
  border-left: none;
}
.virtual-grid-cell-last-border-right:last-child {
  border-right: 1px solid #ddd;
}
</style>

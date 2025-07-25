<script setup>
import { ref, useTemplateRef, computed } from 'vue';

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
  itemHeight: {
    type: Number,
    default: 50,
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
    default: 2,
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
const scrollTop = ref(0);
const scrollLeft = ref(0);
const headerHeight = ref(32);
const leftFixedWidth = ref(50);
const rightFixedWidth = ref(50);
const socrollYBarWidth = ref(12);
const socrollXBarHeight = ref(12);
let scrollTicking = false;

const gridContainerHeight = computed(() => {
  let height = 0;
  height += props.height;
  height -= socrollXBarHeight.value; // 减去 X 滚动条
  height -= headerHeight.value; // 减去表头高度
  return height;
});
const gridContainerWidth = computed(() => {
  let width = 0;
  width += props.width;
  width -= socrollYBarWidth.value; // 减去 Y 滚动条宽度
  width -= leftFixedWidth.value; // 减去左侧固定列宽度
  width -= rightFixedWidth.value; // 减去右侧固定列宽度
  return width;
});

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

// 计算总高度和总宽度
const totalHeight = computed(() => {
  let height = props.rowCount * props.itemHeight;
  return height;
});
const totalWidth = computed(() => {
  let width = 0;
  for (let i = 0; i < props.colCount; i++) {
    width += getColumnWidth(i);
  }
  width += leftFixedWidth.value;
  width += rightFixedWidth.value;
  return width;
});

// 计算可见行数
const visibleRowCount = computed(
  () => Math.ceil(props.height / props.itemHeight) + props.buffer * 2,
);

// 计算起始行索引
const startRowIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer),
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
      top: i * props.itemHeight,
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
  if (!containerRef.value) return;
  event.preventDefault();
  containerRef.value.scrollTop = event.target.scrollTop;
}

function handleXScroll(event) {
  if (!containerRef.value) return;
  event.preventDefault();
  containerRef.value.scrollLeft = event.target.scrollLeft;
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
</script>

<template>
  <div class="v-reservation-panel">
    <!-- 固定表头 -->
    <div
      class="v-fixed-header-container"
      :style="{
        height: `${headerHeight}px`,
        width: `${gridContainerWidth}px`,
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
          class="v-fixed-header-col"
          :style="{
            transform: `translateX(${col.left}px)`,
            width: `${col.width}px`,
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
          v-for="row in visibleRows"
          :key="row.index"
          class="v-time-item"
          :style="{ height: `${itemHeight}px`, transform: `translateY(${row.top}px)` }"
        >
          {{ props.timeSlots[row.index] }}
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
        right: `${socrollYBarWidth}px`,
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
          v-for="row in visibleRows"
          :key="row.index"
          class="v-time-item"
          :style="{ height: `${itemHeight}px`, transform: `translateY(${row.top}px)` }"
        >
          {{ props.timeSlots[row.index] }}
        </div>
      </div>
    </div>
    <!-- 遮挡元素 -->
    <div
      class="v-fixed-right-mask"
      :style="{
        width: `${rightFixedWidth}px`,
        height: `${headerHeight}px`,
        right: `${socrollYBarWidth}px`,
        borderBottom: !isScrolledToTop ? '1px solid #ddd' : 'none',
      }"
    ></div>

    <!-- Y 滚动条 -->
    <div
      ref="scrollYBar"
      class="v-y-scrollbar"
      :style="{ height: `${props.height}px`, width: `${socrollYBarWidth}px` }"
      @scroll="handleYScroll"
    >
      <div
        :style="{ height: `${totalHeight + headerHeight}px`, width: `${socrollYBarWidth}px` }"
      ></div>
    </div>

    <!-- X 滚动条 -->
    <div
      ref="scrollXBar"
      class="v-x-scrollbar"
      :style="{ height: `${socrollXBarHeight}px`, width: `${props.width}px` }"
      @scroll="handleXScroll"
    >
      <div :style="{ height: `${socrollXBarHeight}px`, width: `${totalWidth}px` }"></div>
    </div>

    <div
      class="virtual-grid-container"
      ref="container"
      :style="{
        height: `${gridContainerHeight}px`,
        width: `${gridContainerWidth}px`,
        transform: `translateX(${leftFixedWidth}px)`,
      }"
      @scroll="handleScroll"
      @wheel="handleContainerWheel"
    >
      <div
        class="virtual-grid-content"
        :style="{ height: `${totalHeight}px`, width: `${totalWidth + leftFixedWidth}px` }"
      >
        <div
          v-for="row in visibleRows"
          :key="row.index"
          class="virtual-grid-row"
          :style="{ transform: `translateY(${row.top}px)`, height: `${itemHeight}px` }"
        >
          <div
            v-for="col in visibleCols"
            :key="col.index"
            class="virtual-grid-cell"
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
  border-top: 1px solid #ddd;
  background-color: #fff;
}
/* 左边固定 */
.v-fixed-left-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #f9f9f9;
  z-index: 10;
}
.v-fixed-left-container .v-time-item {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #ddd;
  border-top: 1px solid #ddd;
  width: 100%;
}
.v-fixed-left-mask {
  position: absolute;
  top: 0;
  left: 0;
  border-left: 1px solid #ddd;
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
}
.v-fixed-right-container .v-time-item {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #ddd;
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
.virtual-grid-cell {
  height: 100%;
  position: absolute;
  box-sizing: border-box;
  border-left: 1px solid #ddd;
  border-top: 1px solid #ddd;
  background-color: #fff;
  overflow: hidden;
}
</style>

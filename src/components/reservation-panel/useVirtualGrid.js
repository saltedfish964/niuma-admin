import { ref, computed, watch } from 'vue';
import { debounce } from 'lodash-es';

export function useVirtualGrid(props, socrollYBarWidth, socrollXBarHeight) {
  // 默认格子高度
  const currentItemHeight = ref(props.defaultItemHeight);

  const scrollTop = ref(0);
  const scrollLeft = ref(0);
  let scrollTicking = false;

  // 判断是否需要显示垂直滚动条
  const hasVerticalScroll = ref(false);
  // 判断是否需要显示水平滚动条
  const hasHorizontalScroll = ref(false);

  const verticalScrollContentHeight = ref(0);
  const horizontalScrollContentWidth = ref(0);

  const gridContainerHeight = ref(0);
  const gridContainerWidth = ref(0);

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

  // 滚动事件处理
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

    gridViewHeight -= props.headerHeight;

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

    gridViewWidth -= props.leftFixedWidth + props.rightFixedWidth;

    hasVerticalScroll.value = hasVScroll;
    hasHorizontalScroll.value = hasHScroll;

    verticalScrollContentHeight.value = gridContentHeight + props.headerHeight;
    horizontalScrollContentWidth.value =
      gridContentWidth + props.leftFixedWidth + props.rightFixedWidth;

    totalHeight.value = gridContentHeight;
    totalWidth.value = gridContentWidth;

    gridContainerWidth.value = gridViewWidth;
    gridContainerHeight.value = gridViewHeight;

    if (!hasVScroll) {
      currentItemHeight.value = gridViewHeight / props.rowCount;
    } else {
      currentItemHeight.value = props.defaultItemHeight;
    }
  }

  watch(
    [() => props.width, () => props.height],
    debounce(([w, h]) => {
      calcAllSizes(w, h);
    }, 100),
  );

  return {
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
  };
}

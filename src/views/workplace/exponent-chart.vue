<script setup lang="js">
import { onBeforeMount, onMounted, useTemplateRef, watch } from 'vue';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useResizeObserver } from '@vueuse/core';
import { debounce } from 'lodash-es';
import { useLayoutStore } from '@src/store/modules/layout';

const layoutStore = useLayoutStore();

echarts.use([GridComponent, LegendComponent, TooltipComponent, RadarChart, CanvasRenderer]);

const chartRef = useTemplateRef('chart');
let chartInstance = null;
let stopResizeObserver = null;

function updateChartTheme() {
  if (chartInstance) {
    chartInstance.setTheme(layoutStore.darkMode ? 'dark' : 'default');
  }
}

watch(
  () => layoutStore.darkMode,
  () => {
    updateChartTheme();
  },
);

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    legend: {
      data: ['个人', '团队', '部门'],
    },
    tooltip: {
      trigger: 'item',
    },
    radar: {
      shape: 'circle',
      indicator: [
        { name: '引用', max: 10 },
        { name: '热度', max: 10 },
        { name: '贡献', max: 10 },
        { name: '产量', max: 10 },
        { name: '口碑', max: 10 },
      ],
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [10, 7, 5, 4, 8],
            name: '个人',
            areaStyle: true,
          },
        ],
      },
      {
        type: 'radar',
        data: [
          {
            value: [4, 7, 5, 6, 1],
            name: '部门',
            areaStyle: true,
          },
        ],
      },
      {
        type: 'radar',
        data: [
          {
            value: [3, 1, 3, 6, 9],
            name: '团队',
            areaStyle: true,
          },
        ],
      },
    ],
  };

  const { stop } = useResizeObserver(
    chartRef.value,
    debounce(() => {
      chartInstance.resize();
      chartInstance.setOption(option);
      updateChartTheme();
    }, 100),
  );

  stopResizeObserver = stop;
});

onBeforeMount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  if (stopResizeObserver) {
    stopResizeObserver();
    stopResizeObserver = null;
  }
});
</script>

<template>
  <div class="h-full w-full" ref="chart"></div>
</template>

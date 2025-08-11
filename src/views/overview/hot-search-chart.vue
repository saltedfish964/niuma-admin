<script setup lang="js">
import { onBeforeMount, onMounted, useTemplateRef } from 'vue';
import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import dayjs from 'dayjs';
import { useResizeObserver } from '@vueuse/core';

echarts.use([TooltipComponent, GridComponent, LineChart, CanvasRenderer]);

const chartRef = useTemplateRef('chart');
let chartInstance = null;
let stopResizeObserver = null;

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  // 获取过去14天的日期
  const xAxisData = [];
  for (let i = 0; i < 7; i++) {
    xAxisData.unshift(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
  }
  const option = {
    grid: {
      left: 0,
      right: 0,
      outerBounds: false,
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: [
      {
        show: false,
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
      },
    ],
    yAxis: [
      {
        show: false,
        type: 'value',
      },
    ],
    series: [
      {
        name: 'Y',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(55, 162, 255)',
            },
            {
              offset: 1,
              color: 'rgb(255, 255, 255)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: [1, 6, 4, 8, 3, 7, 2],
      },
    ],
  };

  const { stop } = useResizeObserver(chartRef.value, () => {
    chartInstance.resize();
    chartInstance.setOption(option);
  });

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

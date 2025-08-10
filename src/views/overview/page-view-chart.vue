<script setup lang="js">
import { onBeforeMount, onMounted, useTemplateRef } from 'vue';
import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import dayjs from 'dayjs';

echarts.use([TooltipComponent, GridComponent, LineChart, CanvasRenderer]);

const chartRef = useTemplateRef('chart');

onMounted(() => {
  if (!chartRef.value) return;
  const chartInstance = echarts.init(chartRef.value);
  // 获取过去14天的日期
  const xAxisData = [];
  for (let i = 0; i < 14; i++) {
    xAxisData.unshift(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
  }
  const option = {
    grid: {
      left: 0,
      right: 0,
      containLabel: false,
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
              color: 'rgb(116, 21, 219)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: [7, 5, 4, 2, 4, 7, 5, 6, 5, 9, 6, 3, 1, 5],
      },
    ],
  };

  chartInstance.setOption(option);

  onBeforeMount(() => {
    if (chartInstance) {
      chartInstance.dispose();
    }
  });
});
</script>

<template>
  <div class="h-full w-full" ref="chart"></div>
</template>

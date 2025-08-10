<script setup lang="js">
import { onBeforeMount, onMounted, useTemplateRef } from 'vue';
import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import dayjs from 'dayjs';

echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

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
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: 0,
      right: 0,
      containLabel: false,
    },
    xAxis: [
      {
        show: false,
        type: 'category',
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
        type: 'bar',
        itemStyle: {
          color: '#4886fd',
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

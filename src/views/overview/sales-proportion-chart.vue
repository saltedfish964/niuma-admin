<script setup lang="js">
import { onBeforeMount, onMounted, useTemplateRef, watch } from 'vue';
import * as echarts from 'echarts/core';
import { TooltipComponent, TitleComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useResizeObserver } from '@vueuse/core';
import { useLayoutStore } from '@src/store/modules/layout';

const layoutStore = useLayoutStore();

echarts.use([TooltipComponent, TitleComponent, PieChart, CanvasRenderer, LabelLayout]);

const chartRef = useTemplateRef('chart');
let chartInstance = null;
let stopResizeObserver = null;
const option = {
  title: {
    text: '销售额',
    left: 'left',
    textStyle: {
      color: '#fff',
    },
  },
  tooltip: {
    trigger: 'item',
  },
  series: [
    {
      name: '数据',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        position: 'outside', // 关键点：标签显示在饼图外侧
        formatter: '{b}: {c}', // 显示格式：名称: 数值 (百分比)
      },
      data: [
        { value: 1048, name: '电器' },
        { value: 735, name: '酒水' },
        { value: 580, name: '个护健康' },
        { value: 484, name: '服饰箱包' },
        { value: 300, name: '母婴产品' },
      ],
    },
  ],
};

watch(
  () => layoutStore.darkMode,
  () => {
    if (chartInstance) {
      option.series[0].itemStyle.borderColor = layoutStore.darkMode ? '#141414' : '#fff';
      option.title.textStyle.color = layoutStore.darkMode ? '#fff' : '#262626';
      chartInstance.setOption(option);
    }
  },
);

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  option.series[0].itemStyle.borderColor = layoutStore.darkMode ? '#141414' : '#fff';
  option.title.textStyle.color = layoutStore.darkMode ? '#dcdcdc' : '#1f1f1f';

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

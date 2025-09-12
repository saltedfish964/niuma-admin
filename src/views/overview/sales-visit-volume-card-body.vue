<script setup lang="js">
import { useTemplateRef, onMounted, onBeforeMount } from 'vue';
import { Row as ARow, Col as ACol } from 'ant-design-vue';
import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { debounce } from 'lodash-es';
import { useResizeObserver } from '@vueuse/core';

echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  tooltipTitle: {
    type: String,
    required: true,
  },
});

const chartRef = useTemplateRef('chart');
let chartInstance = null;
let stopResizeObserver = null;

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
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
      bottom: 0,
      top: 0,
    },
    xAxis: [
      {
        type: 'category',
        data: [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月',
        ],
        axisTick: {
          show: true,
          alignWithLabel: true,
        },
        axisLine: {
          show: false,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisTick: {
          show: true,
          alignWithLabel: true,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: props.tooltipTitle,
        type: 'bar',
        itemStyle: {
          color: '#4886fd',
        },
        data: [548, 875, 742, 590, 210, 1030, 429, 455, 531, 917, 221, 1070],
      },
    ],
  };

  const { stop } = useResizeObserver(
    chartRef.value,
    debounce(() => {
      chartInstance.resize();
      chartInstance.setOption(option);
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
  <div>
    <a-row>
      <a-col :xl="16" :lg="12" :md="24" :sm="24" :xs="24">
        <div ref="chart" class="h-75"></div>
      </a-col>
      <a-col :xl="8" :lg="12" :md="24" :sm="24" :xs="24">
        <div class="h-75 pl-6">
          <div class="pt-4 font-semibold text-base">门店{{ props.name }}排名</div>
          <ul>
            <li class="flex items-center justify-between pt-4" v-for="i in 7">
              <div class="flex items-center">
                <span
                  :class="[
                    'flex items-center justify-center rounded-full w-5 h-5  font-semibold  text-center text-xs',
                    i > 3 ? 'bg-fill-tertiary' : 'bg-bg-spotlight text-white',
                  ]"
                >
                  {{ i }}
                </span>
                <span class="pl-2 text-sm">工专路 {{ i }} 号店</span>
              </div>
              <div class="text-sm">323,234</div>
            </li>
          </ul>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

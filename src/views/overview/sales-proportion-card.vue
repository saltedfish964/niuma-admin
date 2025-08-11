<script setup lang="js">
import { ref } from 'vue';
import { Card as ACard, Segmented as ASegmented } from 'ant-design-vue';
import SalesProportionChart from './sales-proportion-chart.vue';

const type = ref('all');
const types = ref([
  {
    label: '全部渠道',
    value: 'all',
  },
  {
    label: '线上',
    value: 'online',
  },
  {
    label: '门店',
    value: 'offline',
  },
]);
</script>

<template>
  <a-card title="销售额类别占比" :bordered="false">
    <template #extra>
      <a-segmented v-model:value="type" :options="types"></a-segmented>
    </template>
    <div class="h-[384px]">
      <sales-proportion-chart></sales-proportion-chart>
    </div>
  </a-card>
</template>

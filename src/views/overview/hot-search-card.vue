<script setup lang="js">
import { ref } from 'vue';
import { Card as ACard, Tooltip as ATooltip, Table as ATable } from 'ant-design-vue';
import VIcon from '@src/components/icon/icon.vue';
import HotSearchChart from './hot-search-chart.vue';

const dataSource = ref([]);
for (let i = 0; i < 50; i++) {
  dataSource.value.push({
    key: i,
    rank: i + 1,
    keyword: `搜索关键词-${i}`,
    user: Math.floor(Math.random() * 1000),
    week: Math.floor(Math.random() * 100) + '%',
  });
}
const columns = ref([
  {
    title: '排名',
    dataIndex: 'rank',
    key: 'rank',
  },
  {
    title: '搜索关键词',
    dataIndex: 'keyword',
    key: 'keyword',
  },
  {
    title: '用户数',
    dataIndex: 'user',
    key: 'user',
    sorter: {
      compare: (a, b) => a.user - b.user,
      multiple: 1,
    },
  },
  {
    title: '周涨幅',
    dataIndex: 'week',
    key: 'week',
    sorter: {
      compare: (a, b) => a.week - b.week,
      multiple: 2,
    },
  },
]);
</script>

<template>
  <a-card title="线上热门搜索" :bordered="false">
    <div class="flex gap-[48px] h-[94px]">
      <div class="w-1/2 flex-col">
        <div class="flex h-[22px] text-[var(--nm-color-text-secondary)]">
          <div class="pr-[8px]">搜索用户数</div>
          <a-tooltip>
            <v-icon name="ant-design-icon-info-circle-outlined"></v-icon>
            <template #title>指标说明</template>
          </a-tooltip>
        </div>
        <div class="flex items-center">
          <span class="text-[16px]">17.1</span>
          <v-icon name="ant-design-icon-caret-up-filled"></v-icon>
        </div>
        <div class="h-[45px] w-full">
          <hot-search-chart></hot-search-chart>
        </div>
      </div>
      <div class="w-1/2 flex-col">
        <div class="flex h-[22px] text-[var(--nm-color-text-secondary)]">
          <div class="pr-[8px]">人均搜索次数</div>
          <a-tooltip>
            <v-icon name="ant-design-icon-info-circle-outlined"></v-icon>
            <template #title>指标说明</template>
          </a-tooltip>
        </div>
        <div class="flex items-center">
          <span class="text-[16px]">26.2</span>
          <v-icon name="ant-design-icon-caret-down-filled"></v-icon>
        </div>
        <div class="h-[45px] w-full">
          <hot-search-chart></hot-search-chart>
        </div>
      </div>
    </div>
    <div class="h-[290px] pt-[16px] overflow-auto">
      <a-table
        size="small"
        style="height: 100%"
        :dataSource="dataSource"
        :columns="columns"
        :pagination="{
          pageSize: 5,
          showSizeChanger: false,
        }"
      ></a-table>
    </div>
  </a-card>
</template>

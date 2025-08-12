<script setup lang="js">
import { ref, defineAsyncComponent } from 'vue';
import { Card as ACard, Button as AButton, RangePicker as ARangePicker } from 'ant-design-vue';
import dayjs from 'dayjs';

const SalesVisitVolumeCardBody = defineAsyncComponent(
  () => import('./sales-visit-volume-card-body.vue'),
);

const tabList = ref([
  {
    key: 'sales',
    tab: '销售额',
  },
  {
    key: 'visit',
    tab: '访问量',
  },
]);
const activeTabKey = ref('sales');

const dateButtonList = ref([
  {
    key: 'today',
    text: '今日',
  },
  {
    key: 'week',
    text: '本周',
  },
  {
    key: 'month',
    text: '本月',
  },
  {
    key: 'year',
    text: '本年',
  },
]);
const activeDateButtonKey = ref('today');
const date = ref([dayjs(), dayjs()]);

function onTabChange(key) {
  activeTabKey.value = key;
}

function onDateButtonClick(key) {
  activeDateButtonKey.value = key;
  switch (key) {
    case 'today':
      date.value = [dayjs(), dayjs()];
      break;
    case 'week':
      date.value = [dayjs().startOf('week'), dayjs().endOf('week')];
      break;
    case 'month':
      date.value = [dayjs().startOf('month'), dayjs().endOf('month')];
      break;
    case 'year':
      date.value = [dayjs().startOf('year'), dayjs().endOf('year')];
      break;
    default:
      break;
  }
}
</script>

<template>
  <a-card
    :bordered="false"
    :tab-list="tabList"
    :active-tab-key="activeTabKey"
    @tab-change="onTabChange"
  >
    <template #tabBarExtraContent>
      <div class="flex items-center">
        <div class="flex max-xl:hidden">
          <a-button
            type="text"
            v-for="item in dateButtonList"
            :key="item.key"
            :class="[activeDateButtonKey === item.key ? 'active' : '']"
            @click="onDateButtonClick(item.key)"
          >
            {{ item.text }}
          </a-button>
        </div>
        <div class="pl-6">
          <a-range-picker v-model:value="date" />
        </div>
      </div>
    </template>

    <template v-if="activeTabKey === 'sales'">
      <sales-visit-volume-card-body
        name="销售额"
        tooltip-title="销售量"
      ></sales-visit-volume-card-body>
    </template>
    <template v-else>
      <sales-visit-volume-card-body
        name="访问量"
        tooltip-title="访问量"
      ></sales-visit-volume-card-body>
    </template>
  </a-card>
</template>

<style scoped>
.active {
  color: var(--nm-color-primary);
  font-weight: bold;
}
</style>

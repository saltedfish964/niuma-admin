<script setup>
import { defineAsyncComponent } from 'vue';
import {
  Tooltip as ATooltip,
  Row as ARow,
  Col as ACol,
  Card as ACard,
  Divider as ADivider,
  Progress as AProgress,
} from 'ant-design-vue';
import VIcon from '@src/components/icon/icon.vue';
import SalesVisitVolumeCard from './sales-visit-volume-card.vue';

const PageViewChart = defineAsyncComponent(() => import('./page-view-chart.vue'));
const PayChart = defineAsyncComponent(() => import('./pay-chart.vue'));
const HotSearchCard = defineAsyncComponent(() => import('./hot-search-card.vue'));
const SalesProportionCard = defineAsyncComponent(() => import('./sales-proportion-card.vue'));

defineOptions({
  name: 'Overview',
});
</script>

<template>
  <div class="p-4 w-full h-full overflow-auto">
    <a-row :gutter="[16, 16]">
      <a-col :xl="6" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card title="总销售额" :bordered="false">
          <div class="flex justify-between h-5.5 text-[var(--nm-color-text-secondary)]">
            <div>总销售额</div>
            <a-tooltip>
              <v-icon name="ant-design-icon-info-circle-outlined"></v-icon>
              <template #title>指标说明</template>
            </a-tooltip>
          </div>
          <div class="pb-2">
            <div class="h-9.5 text-3xl">¥ 126,560</div>
          </div>
          <div class="h-11.5 relative">
            <div class="absolute bottom-0 w-full flex">
              <div class="pr-4 flex items-center">
                <span>周同比</span>
                <span class="pl-2">12%</span>
                <v-icon
                  name="ant-design-icon-caret-up-filled"
                  class="text-[var(--nm-red-6)]"
                ></v-icon>
              </div>
              <div class="flex items-center">
                <span>日同比</span>
                <span class="pl-2">11%</span>
                <v-icon
                  name="ant-design-icon-caret-down-filled"
                  class="text-[var(--nm-green-6)]"
                ></v-icon>
              </div>
            </div>
          </div>
          <a-divider style="margin: 8px 0"></a-divider>
          <div class="h-5.5">
            <span>日销售额</span>
            <span class="pl-2">￥12,423</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xl="6" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card title="访问量" :bordered="false">
          <div class="flex justify-between h-5.5 text-[var(--nm-color-text-secondary)]">
            <div>访问量</div>
            <a-tooltip>
              <v-icon name="ant-design-icon-info-circle-outlined"></v-icon>
              <template #title>指标说明</template>
            </a-tooltip>
          </div>
          <div class="pb-2">
            <div class="h-9.5 text-3xl">8,846</div>
          </div>
          <div class="h-11.5 relative">
            <page-view-chart></page-view-chart>
          </div>
          <a-divider style="margin: 8px 0"></a-divider>
          <div class="h-5.5">
            <span>日访问量</span>
            <span class="pl-2">1,234</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xl="6" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card title="支付笔数" :bordered="false">
          <div class="flex justify-between h-5.5 text-[var(--nm-color-text-secondary)]">
            <div>支付笔数</div>
            <a-tooltip>
              <v-icon name="ant-design-icon-info-circle-outlined"></v-icon>
              <template #title>指标说明</template>
            </a-tooltip>
          </div>
          <div class="pb-2">
            <div class="h-9.5 text-3xl">6,560</div>
          </div>
          <div class="h-11.5 relative">
            <pay-chart></pay-chart>
          </div>
          <a-divider style="margin: 8px 0"></a-divider>
          <div class="h-5.5">
            <span>转化率</span>
            <span class="pl-2">60%</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xl="6" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card title="运营活动效果" :bordered="false">
          <div class="flex justify-between h-5.5 text-[var(--nm-color-text-secondary)]">
            <div>运营活动效果</div>
            <a-tooltip>
              <v-icon name="ant-design-icon-info-circle-outlined"></v-icon>
              <template #title>指标说明</template>
            </a-tooltip>
          </div>
          <div class="pb-2">
            <div class="h-9.5 text-3xl">78%</div>
          </div>
          <div class="h-11.5 relative">
            <div class="absolute bottom-0 w-full">
              <a-progress
                :stroke-color="{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }"
                :percent="78"
              />
            </div>
          </div>
          <a-divider style="margin: 8px 0"></a-divider>
          <div class="h-5.5 relative">
            <div class="absolute bottom-0 w-full flex">
              <div class="pr-4 flex items-center">
                <span>周同比</span>
                <span class="pl-2">12%</span>
                <v-icon
                  name="ant-design-icon-caret-up-filled"
                  class="text-[var(--nm-red-6)]"
                ></v-icon>
              </div>
              <div class="flex items-center">
                <span>日同比</span>
                <span class="pl-2">11%</span>
                <v-icon
                  name="ant-design-icon-caret-down-filled"
                  class="text-[var(--nm-green-6)]"
                ></v-icon>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="24">
        <sales-visit-volume-card></sales-visit-volume-card>
      </a-col>
      <a-col :lg="12" :md="24" :sm="24" :xs="24">
        <hot-search-card></hot-search-card>
      </a-col>
      <a-col :lg="12" :md="24" :sm="24" :xs="24">
        <sales-proportion-card></sales-proportion-card>
      </a-col>
    </a-row>
  </div>
</template>

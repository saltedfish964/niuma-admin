<script setup>
import {
  Tooltip as ATooltip,
  Row as ARow,
  Col as ACol,
  Card as ACard,
  Divider as ADivider,
  Progress as AProgress,
} from 'ant-design-vue';
import VIcon from '@src/components/icon/icon.vue';
import PageViewChart from './page-view-chart.vue';
import PayChart from './pay-chart.vue';
import SalesVisitVolumeCard from './sales-visit-volume-card.vue';

defineOptions({
  name: 'Overview',
});
</script>

<template>
  <div class="page-container">
    <a-row :gutter="[16, 16]">
      <a-col :xl="6" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card title="总销售额" :bordered="false">
          <div class="flex justify-between h-[22px] text-[var(--nm-color-text-secondary)]">
            <div>总销售额</div>
            <a-tooltip>
              <v-icon name="ant-design-icon-info-circle-outlined"></v-icon>
              <template #title>指标说明</template>
            </a-tooltip>
          </div>
          <div class="h-[38px] text-[30px] pb-[8px]">¥ 126,560</div>
          <div class="h-[46px] relative">
            <div class="absolute bottom-0 w-full flex">
              <div class="pr-[16px] flex items-center">
                <span>周同比</span>
                <span class="pl-[8px]">12%</span>
                <v-icon
                  name="ant-design-icon-caret-up-filled"
                  class="text-[var(--nm-red-6)]"
                ></v-icon>
              </div>
              <div class="flex items-center">
                <span>日同比</span>
                <span class="pl-[8px]">11%</span>
                <v-icon
                  name="ant-design-icon-caret-down-filled"
                  class="text-[var(--nm-green-6)]"
                ></v-icon>
              </div>
            </div>
          </div>
          <a-divider style="margin: 8px 0"></a-divider>
          <div class="h-[22px]">
            <span>日销售额</span>
            <span class="pl-[8px]">￥12,423</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xl="6" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card title="访问量" :bordered="false">
          <div class="flex justify-between h-[22px] text-[var(--nm-color-text-secondary)]">
            <div>访问量</div>
            <a-tooltip>
              <v-icon name="ant-design-icon-info-circle-outlined"></v-icon>
              <template #title>指标说明</template>
            </a-tooltip>
          </div>
          <div class="h-[38px] text-[30px] pb-[8px]">8,846</div>
          <div class="h-[46px] relative">
            <page-view-chart></page-view-chart>
          </div>
          <a-divider style="margin: 8px 0"></a-divider>
          <div class="h-[22px]">
            <span>日访问量</span>
            <span class="pl-[8px]">1,234</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xl="6" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card title="支付笔数" :bordered="false">
          <div class="flex justify-between h-[22px] text-[var(--nm-color-text-secondary)]">
            <div>支付笔数</div>
            <a-tooltip>
              <v-icon name="ant-design-icon-info-circle-outlined"></v-icon>
              <template #title>指标说明</template>
            </a-tooltip>
          </div>
          <div class="h-[38px] text-[30px] pb-[8px]">6,560</div>
          <div class="h-[46px] relative">
            <pay-chart></pay-chart>
          </div>
          <a-divider style="margin: 8px 0"></a-divider>
          <div class="h-[22px]">
            <span>转化率</span>
            <span class="pl-[8px]">60%</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xl="6" :lg="12" :md="24" :sm="24" :xs="24">
        <a-card title="运营活动效果" :bordered="false">
          <div class="flex justify-between h-[22px] text-[var(--nm-color-text-secondary)]">
            <div>运营活动效果</div>
            <a-tooltip>
              <v-icon name="ant-design-icon-info-circle-outlined"></v-icon>
              <template #title>指标说明</template>
            </a-tooltip>
          </div>
          <div class="h-[38px] text-[30px] pb-[8px]">78%</div>
          <div class="h-[46px] relative">
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
          <div class="h-[22px] relative">
            <div class="absolute bottom-0 w-full flex">
              <div class="pr-[16px] flex items-center">
                <span>周同比</span>
                <span class="pl-[8px]">12%</span>
                <v-icon
                  name="ant-design-icon-caret-up-filled"
                  class="text-[var(--nm-red-6)]"
                ></v-icon>
              </div>
              <div class="flex items-center">
                <span>日同比</span>
                <span class="pl-[8px]">11%</span>
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
    </a-row>
  </div>
</template>

<style scoped>
.page-container {
  padding: 16px;
  height: 100%;
  overflow: auto;
}
.body {
  height: 100%;
  border-radius: 8px;
  background: var(--nm-color-bg-container);
  display: flex;
  justify-content: center;
  align-items: center;
}
.content h1 {
  text-align: center;
}
.img-container {
  display: flex;
  justify-content: center;
}
.img-container .img {
  height: 100%;
  color: var(--nm-color-text);
}
</style>

<script setup lang="js">
import { computed, ref, useTemplateRef } from 'vue';
import {
  Row as ARow,
  Col as ACol,
  Card as ACard,
  CheckboxGroup as ACheckboxGroup,
  TimeRangePicker as ATimeRangePicker,
  Slider as ASlider,
  Button as AButton,
  Space as ASpace,
  Switch as ASwitch,
} from 'ant-design-vue';
import VReservationPanel from '@src/components/reservation-panel/reservation-panel.vue';
import dayjs from 'dayjs';

const reservationPanel = useTemplateRef('reservationPanel');

// 工作时间
const workTime = ref([dayjs('09:00', 'HH:mm'), dayjs('17:00', 'HH:mm')]);
const wordStartTime = computed(() => workTime.value[0].format('HH:mm'));
const wordEndTime = computed(() => workTime.value[1].format('HH:mm'));

// 时间间隔
const timeInterval = ref(30);

// 资源
const resourcesList = ref([
  {
    value: 1,
    label: '场地1',
  },
  {
    value: 2,
    label: '场地2',
  },
  {
    value: 3,
    label: '场地3',
  },
]);
const resourcesChecked = ref([1, 2, 3]);
const resources = computed(() => {
  return resourcesList.value
    .filter((item) => resourcesChecked.value.includes(item.value))
    .map((item) => {
      return {
        id: item.value,
        name: item.label,
      };
    });
});

// 事件
const events = ref([
  {
    id: 1,
    resourceId: 2,
    name: '预约 1',
    startTime: '10:00',
    endTime: '12:00',
  },
]);
/**
 * 返回一个落在 [start, end] 区间内的随机时间
 * @param {string} start   'HH:mm'
 * @param {string} end     'HH:mm'
 * @param {number} minDiff 两个时间的最小间隔（分钟），必须 ≥ 0
 * @returns {[string, string]} [随机时间, 随机时间]（保证后者 ≥ 前者 + minDiff）
 */
function randomTimePair(start, end, minDiff = 0) {
  minDiff = Math.max(0, minDiff | 0); // 确保为整数且 ≥ 0

  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toHHmm = (m) => {
    const h = String(Math.floor(m / 60)).padStart(2, '0');
    const min = String(m % 60).padStart(2, '0');
    return `${h}:${min}`;
  };

  const s = toMin(start);
  const e = toMin(end);

  // 只要区间长度不足 minDiff，就不断重试
  while (true) {
    const maxT1 = e - minDiff;
    if (maxT1 < s) continue; // 极端情况，再抽一次

    const t1 = Math.floor(Math.random() * (maxT1 - s + 1)) + s;
    const t2 = Math.floor(Math.random() * (e - (t1 + minDiff) + 1)) + (t1 + minDiff);

    return [toHHmm(t1), toHHmm(t2)];
  }
}
function addRandomEvent() {
  // 随机 resourceId
  const resourceIds = resourcesList.value.map((item) => item.value);
  const resourceIdIndex = Math.floor(Math.random() * resourceIds.length);
  const [start, end] = randomTimePair(wordStartTime.value, wordEndTime.value, timeInterval.value);
  reservationPanel.value.addEvent({
    id: Date.now(),
    resourceId: resourceIds[resourceIdIndex],
    name: `预约 ${events.value.length + 1}`,
    startTime: start,
    endTime: end,
    meta: {
      color: '#FF0000',
      randomText: `随机文本 ${events.value.length + 1}`,
    },
  });
}

function addResource() {
  const resourceId = resourcesList.value.length + 1;
  resourcesList.value.push({
    value: resourceId,
    label: `场地 ${resourceId}`,
  });
  resourcesChecked.value.push(resourceId);
}

const cellWidth = ref(150);

const cellHeight = ref(32);

const showTimeLine = ref(true);

const headerHeight = ref(32);
</script>

<template>
  <div class="p-4">
    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-card title="演示" :bordered="false">
          <div class="pb-6">
            <a-row :gutter="[16, 16]">
              <a-col :xs="24" :md="12" :xxl="6">
                <div class="h-full flex items-center justify-center">
                  <div class="flex-none">工作时间：</div>
                  <div class="flex-grow">
                    <a-time-range-picker
                      v-model:value="workTime"
                      format="HH:mm"
                      :allow-clear="false"
                      style="width: 100%"
                    ></a-time-range-picker>
                  </div>
                </div>
              </a-col>
              <a-col :xs="24" :md="12" :xxl="6">
                <a-space>
                  <a-button type="primary" @click="addRandomEvent">随机增加 event</a-button>
                  <a-button type="primary" @click="addResource">增加 resource</a-button>
                </a-space>
              </a-col>
              <a-col :xs="24" :md="12" :xxl="6">
                <div class="h-full flex items-center justify-center">
                  <div class="flex-none">场地：</div>
                  <div class="flex-grow">
                    <a-checkbox-group v-model:value="resourcesChecked" :options="resourcesList" />
                  </div>
                </div>
              </a-col>
              <a-col :xs="24" :md="12" :xxl="6">
                <div class="h-full flex items-center justify-center">
                  <div class="flex-none">是否显示时间轴：</div>
                  <div class="flex-grow">
                    <a-switch v-model:checked="showTimeLine"></a-switch>
                  </div>
                </div>
              </a-col>
              <a-col :xs="24" :md="12" :xxl="6">
                <div class="h-full flex items-center justify-center">
                  <div class="flex-none">时间间隔：</div>
                  <div class="flex-grow">
                    <a-slider v-model:value="timeInterval" :step="5" :min="5" :max="60" />
                  </div>
                </div>
              </a-col>
              <a-col :xs="24" :md="12" :xxl="6">
                <div class="h-full flex items-center justify-center">
                  <div class="flex-none">单元格宽度：</div>
                  <div class="flex-grow">
                    <a-slider v-model:value="cellWidth" :step="50" :min="100" :max="300" />
                  </div>
                </div>
              </a-col>
              <a-col :xs="24" :md="12" :xxl="6">
                <div class="h-full flex items-center justify-center">
                  <div class="flex-none">单元格高度：</div>
                  <div class="flex-grow">
                    <a-slider v-model:value="cellHeight" :step="1" :min="30" :max="50" />
                  </div>
                </div>
              </a-col>
              <a-col :xs="24" :md="12" :xxl="6">
                <div class="h-full flex items-center justify-center">
                  <div class="flex-none">表头高度：</div>
                  <div class="flex-grow">
                    <a-slider v-model:value="headerHeight" :step="1" :min="30" :max="50" />
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>
          <div class="h-180 w-full overflow-auto">
            <v-reservation-panel
              ref="reservationPanel"
              :start-time="wordStartTime"
              :end-time="wordEndTime"
              :time-interval="timeInterval"
              :resources="resources"
              :cell-width="cellWidth"
              :cell-height="cellHeight"
              :show-time-line="showTimeLine"
              :header-height="headerHeight"
              v-model:events="events"
            ></v-reservation-panel>
          </div>
          <div class="h-180 w-full overflow-auto">
            <v-reservation-panel
              ref="reservationPanel"
              :start-time="wordStartTime"
              :end-time="wordEndTime"
              :time-interval="timeInterval"
              :resources="resources"
              :cell-width="cellWidth"
              :cell-height="cellHeight"
              :show-time-line="showTimeLine"
              :header-height="headerHeight"
              v-model:events="events"
            ></v-reservation-panel>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

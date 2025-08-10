<script setup>
import { ref, useTemplateRef } from 'vue';
import VReservationPanel from './reservation-panel.vue';

const reservationPanel = useTemplateRef('reservationPanel');

const events = ref([
  {
    id: 1,
    resourceId: 1,
    name: '预约1',
    startTime: '08:00',
    endTime: '10:00',
  },
  {
    id: 2,
    resourceId: 2,
    name: '预约2',
    startTime: '10:00',
    endTime: '11:00',
  },
  {
    id: 3,
    resourceId: 3,
    name: '预约3',
    startTime: '12:00',
    endTime: '14:00',
  },
  {
    id: 4,
    resourceId: 3,
    name: '预约4',
    startTime: '13:00',
    endTime: '15:00',
  },
  {
    id: 5,
    resourceId: 1,
    name: '预约5',
    startTime: '09:00',
    endTime: '10:00',
  },
  {
    id: 6,
    resourceId: 1,
    name: '预约6',
    startTime: '09:00',
    endTime: '15:00',
  },
  {
    id: 7,
    resourceId: 1,
    name: '预约7',
    startTime: '15:00',
    endTime: '17:00',
  },
]);

const resources = ref([
  {
    id: 1,
    name: '张三',
  },
  {
    id: 2,
    name: '李四',
  },
  {
    id: 3,
    name: '王五',
  },
]);

/**
 *
 * @param currentResource
 * @param currentTime HH:mm
 */
function cellDisabled(currentResource, currentTime) {
  return false;
}

function eventDisabled(event) {
  return event.id === 1;
}

function addEvent() {
  // 随机 resourceId
  const resourceId = Math.floor(Math.random() * resources.value.length) + 1;
  // 随机一个 9 到 17 之间的时间
  const hour = Math.floor(Math.random() * (15 - 9 + 1)) + 9;
  const startTime = `${hour.toString().padStart(2, '0')}:00`;
  const endTime = `${(hour + 2).toString().padStart(2, '0')}:00`;
  reservationPanel.value.addEvent({
    id: Date.now(),
    resourceId,
    name: '预约8',
    startTime,
    endTime,
  });
}

function removeEvent(event) {
  reservationPanel.value.removeEventById(event.id);
}

function beforeEventDrop(event) {
  return new Promise((resolve) => {
    let result = confirm('您确定要执行此操作吗？');
    if (result) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
  // return true;
}
</script>

<template>
  <div class="reservation-panel-example-container">
    <div class="card">
      <div class="controls">
        <a-button type="primary" @click="addEvent">添加预约</a-button>
      </div>
      <div class="panel">
        <v-reservation-panel
          ref="reservationPanel"
          :events="events"
          :resources="resources"
          :cell-disabled="cellDisabled"
          :event-disabled="eventDisabled"
          :before-event-drop="beforeEventDrop"
        >
          <template #header-item="{ resource }">
            <div style="height: 100%; display: flex; align-items: center; padding: 0 8px">
              {{ resource.name }}
            </div>
          </template>
          <template #drag-handle="{ event }">
            <div class="custom-drag-handle">
              <span data-drag>拖拽</span>
              <button @click="removeEvent(event)">删除</button>
            </div>
          </template>
        </v-reservation-panel>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reservation-panel-example-container {
  width: 100%;
  height: 100%;
  padding: 8px;
}
.card {
  height: 100%;
  padding: 8px;
  background: var(--nm-color-bg-container, #ffffff);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}
.controls {
  flex: none;
  padding-bottom: 8px;
}
.panel {
  flex: 1;
  overflow: auto;
}
.custom-drag-handle {
  height: 32px;
}
</style>

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
  reservationPanel.value.addEvent({
    id: Date.now(),
    resourceId: 1,
    name: '预约8',
    startTime: '15:00',
    endTime: '17:00',
  });
}
</script>

<template>
  <div class="container">
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
        >
          <template #header-item="{ resource }">
            <div style="height: 100%; display: flex; align-items: center; padding: 0 8px">
              {{ resource.name }}
            </div>
          </template>
          <template #drag-handle="{ event }">
            <div style="height: 100%">
              <!-- 给元素加上 data-drag，可以拖拽 -->
              <button data-drag>拖拽区域</button>
            </div>
          </template>
        </v-reservation-panel>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
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
</style>

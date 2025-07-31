<script setup>
import { ref } from 'vue';
import VReservationPanel from './reservation-panel.vue';

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
</script>

<template>
  <div style="width: 100%; height: 100%; padding: 50px">
    <v-reservation-panel :events="events" :resources="resources"></v-reservation-panel>
  </div>
</template>

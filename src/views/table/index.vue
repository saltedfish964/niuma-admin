<script setup>
import { ref } from 'vue';
import VTable from '@src/components/table/table.vue';

const gridOptions = ref({
  columns: [
    {
      field: 'name',
      title: '姓名',
      editRender: {},
      slots: {
        edit: 'edit-name',
      },
    },
    {
      field: 'age',
      title: '年龄',
    },
    {
      field: 'address',
      title: '地址',
    },
  ],
  data: [
    {
      key: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖底公园1号',
    },
    {
      key: '2',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖底公园1号',
    },
  ],
});

for (let i = 0; i < 60; i++) {
  gridOptions.value.data.push({
    key: `id-${i}`,
    name: '胡彦祖',
    age: i + 18,
    address: '西湖区湖底公园1号',
  });
}

function dataFunc() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(gridOptions.value.data);
    }, 2000);
  });
}
</script>

<template>
  <div class="container">
    <a-row :gutter="[0, 16]">
      <a-col :span="24">
        <a-card title="自定义封装 vxe-table" :bordered="false">
          <div class="table-container">
            <v-table v-bind="gridOptions">
              <template #edit-name="{ row }">
                <a-input></a-input>
              </template>
            </v-table>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.container {
  padding: 16px;
}
.table-container {
  height: 300px;
}
</style>

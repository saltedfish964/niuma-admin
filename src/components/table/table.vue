<script setup>
import { ref, watch, computed, onMounted, useAttrs, useSlots, defineAsyncComponent } from 'vue';
import { isFunction, isArray } from 'lodash-es';

// 异步导入组件
const VxeGrid = defineAsyncComponent({
  loader: () =>
    import('vxe-table').then((m) => {
      return m.VxeGrid;
    }),
  loadingComponent: () => 'Loading...',
  delay: 200,
  timeout: 3000,
});

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  data: {
    type: [Array, Function],
    default: () => [],
  },
  height: {
    type: [Number, String],
    default: 'auto',
  },
  border: {
    type: Boolean,
    default: true,
  },
  stripe: {
    type: Boolean,
    default: true,
  },
  round: {
    type: Boolean,
    default: true,
  },
  checkboxConfig: {
    type: Object,
    default: () => ({}),
  },
  rowConfig: {
    type: Object,
    default: () => ({}),
  },
  showSeq: {
    type: Boolean,
    default: true,
  },
  showRadio: {
    type: Boolean,
    default: true,
  },
  showCheckbox: {
    type: Boolean,
    default: true,
  },
  dataParams: {
    type: Object,
    default: () => ({}),
  },
});

const attrs = useAttrs();
const slots = useSlots();

const gridRef = ref();
const loaded = ref(false);
const dataLoading = ref(false);
const gridData = ref([]);
const paginationData = ref({
  current: 1,
  pageSize: 10,
  total: 500,
});

const processedCheckboxConfig = computed(() => {
  return Object.assign(
    {
      highlight: true,
    },
    props.checkboxConfig,
  );
});

const processedRowConfig = computed(() => {
  return Object.assign(
    {
      isCurrent: true,
      isHover: true,
    },
    props.rowConfig,
  );
});

const processedColumns = computed(() => {
  let newColumns = [...props.columns];

  if (props.showRadio) {
    newColumns = newColumns.filter((column) => column.type !== 'radio');
    const radioColumn = props.columns.find((column) => column.type === 'radio');
    const newRadioColumn = Object.assign(
      {
        type: 'radio',
        width: 40,
        align: 'center',
        fixed: 'left',
        slots: {
          radio: 'radio_cell',
        },
      },
      radioColumn ?? {},
    );
    newColumns.unshift(newRadioColumn);
  }

  if (props.showCheckbox) {
    newColumns = newColumns.filter((column) => column.type !== 'checkbox');
    const checkboxColumn = props.columns.find((column) => column.type === 'checkbox');
    const newCheckboxColumn = Object.assign(
      {
        type: 'checkbox',
        width: 40,
        align: 'center',
        fixed: 'left',
        slots: {
          header: 'checkbox_header',
          checkbox: 'checkbox_cell',
        },
      },
      checkboxColumn ?? {},
    );
    newColumns.unshift(newCheckboxColumn);
  }

  if (props.showSeq) {
    newColumns = newColumns.filter((column) => column.type !== 'seq');
    const seqColumn = props.columns.find((column) => column.type === 'seq');
    const newSeqColumn = Object.assign(
      {
        type: 'seq',
        title: '序号',
        width: 60,
        align: 'center',
        fixed: 'left',
      },
      seqColumn ?? {},
    );
    newColumns.unshift(newSeqColumn);
  }

  return newColumns;
});

function setSelectRow(row) {
  if (!gridRef.value) return;
  gridRef.value.setRadioRow(row);
}

function toggleCheckboxEvent(row) {
  if (!gridRef.value) return;
  gridRef.value.toggleCheckboxRow(row);
}

function toggleAllCheckboxEvent() {
  if (!gridRef.value) return;
  gridRef.value.toggleAllCheckboxRow();
}

async function refreshGridData() {
  if (isArray(props.data)) {
    const start = (paginationData.value.current - 1) * paginationData.value.pageSize;
    gridData.value = props.data.slice(start, start + paginationData.value.pageSize);
    paginationData.value.total = props.data.length;
    return;
  }

  startLoading();
  try {
    const params = {
      page: paginationData.value.current,
      pageSize: paginationData.value.pageSize,
      ...props.dataParams,
    };
    console.log(params);
    const result = await props.data(params);
    if (isArray(result)) {
      gridData.value = result;
      paginationData.value.total = result.length;
    } else if (result?.data) {
      // 此处逻辑可根据实际情况调整
      gridData.value = result.data;
      paginationData.value.total = result.total || 0;
    } else {
      throw new Error('data 返回值数据格式不正确');
    }
  } catch (error) {
    console.error(error.message);
  } finally {
    endLoading();
  }
}

function startLoading() {
  dataLoading.value = true;
}

function endLoading() {
  dataLoading.value = false;
}

watch(
  () => props.data,
  () => {
    refreshGridData();
  },
  {
    immediate: true,
    deep: true,
  },
);

onMounted(async () => {
  await import('vxe-table/lib/style.css');
  loaded.value = true;
});

defineExpose({
  refreshGridData,
});
</script>

<template>
  <div class="v-table">
    <a-spin :spinning="!loaded || dataLoading">
      <div class="v-table-container">
        <div class="v-table-container-header"></div>
        <div class="v-table-container-body">
          <vxe-grid
            v-if="loaded"
            v-bind="attrs"
            ref="gridRef"
            :columns="processedColumns"
            :data="gridData"
            :checkbox-config="processedCheckboxConfig"
            :row-config="processedRowConfig"
            :height="props.height"
            :border="props.border"
            :stripe="props.stripe"
            :round="props.round"
          >
            <template #radio_cell="{ row, checked }">
              <a-radio
                class="v-table-radio"
                :checked="checked"
                @click.stop="setSelectRow(row)"
              ></a-radio>
            </template>
            <template #checkbox_header="{ checked, indeterminate }">
              <a-checkbox
                :checked="checked"
                :indeterminate="indeterminate"
                @click.stop="toggleAllCheckboxEvent"
              ></a-checkbox>
            </template>
            <template #checkbox_cell="{ row, checked, indeterminate }">
              <a-checkbox
                :checked="checked"
                :indeterminate="indeterminate"
                @click.stop="toggleCheckboxEvent(row)"
              ></a-checkbox>
            </template>
            <template v-for="(_, slotName) in slots" #[slotName]="scope">
              <slot :name="slotName" v-bind="scope" />
            </template>
          </vxe-grid>
        </div>
        <div class="v-table-container-pagination">
          <a-pagination
            v-model:current="paginationData.current"
            v-model:page-size="paginationData.pageSize"
            :total="paginationData.total"
            :show-quick-jumper="true"
            :show-total="(total) => `共 ${total} 条数据`"
            @change="refreshGridData"
            @showSizeChange="refreshGridData"
          ></a-pagination>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
.v-table {
  --vxe-ui-table-border-radius: 8px;
  --vxe-ui-table-row-checkbox-checked-background-color: #e7f4ff;
  --vxe-ui-table-row-striped-background-color: #fafafa;
  --vxe-ui-table-row-hover-background-color: #fafafa;
}
.v-table,
.v-table :deep(.ant-spin-nested-loading),
.v-table :deep(.ant-spin-container) {
  width: 100%;
  height: 100%;
}
.v-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.v-table-container-body {
  flex: 1;
  overflow: auto;
}
.v-table-radio {
  margin-inline-end: 0;
}
.v-table-container-pagination {
  padding-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>

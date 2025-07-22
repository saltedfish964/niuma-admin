<script setup>
import { ref } from 'vue';
import ColorPickerPanel from './color-picker-panel.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '#42445A',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  swatches: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const isPopoverOpen = ref(false);

function onModelValueUpdate(value) {
  emit('update:modelValue', value);
}

function onPopoverOpenChange(open) {
  isPopoverOpen.value = open;
}
</script>

<template>
  <div class="v-color-picker">
    <a-popover
      trigger="click"
      overlay-class-name="v-color-picker-popover"
      :arrow="false"
      @open-change="onPopoverOpenChange"
    >
      <div :class="['v-color-trigger', isPopoverOpen ? 'v-color-trigger-active' : '']">
        <div class="v-color-trigger-inner" :style="{ '--inner-bg-color': props.modelValue }"></div>
      </div>
      <template #content>
        <color-picker-panel
          :model-value="props.modelValue"
          :swatches="props.swatches"
          :disabled="props.disabled"
          @update:model-value="onModelValueUpdate"
        ></color-picker-panel>
      </template>
    </a-popover>
  </div>
</template>

<style scoped>
.v-color-picker {
  display: inline-flex;
}
.v-color-trigger {
  padding: 4px;
  border-radius: 6px;
  border: var(--nm-border, 1px solid #dfe1e5);
  background: var(--nm-color-bg-container, #f1f3f4);
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s var(--nm-motion-ease-in-out);
}
.v-color-trigger-active,
.v-color-trigger:hover {
  border-color: var(--nm-color-primary-hover, #3e74fd);
}
.v-color-trigger-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
}
.v-color-trigger-inner::before {
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill-opacity="0.5"><rect x="10" width="10" height="10"/><rect y="10" width="10" height="10"/></svg>');
  background-size: 8px 8px;
  border-radius: 4px;
  z-index: -1;
}
.v-color-trigger-inner::after {
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: var(--inner-bg-color, 'transparent');
}
[data-theme='dark'] .v-color-trigger-inner::before {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" fill-opacity="0.5"><rect x="10" width="10" height="10"/><rect y="10" width="10" height="10"/></svg>');
}
</style>

<style>
.v-color-picker-popover .ant-popover-inner {
  padding: 0;
}
</style>

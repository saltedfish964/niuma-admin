<script setup>
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

function onModelValueUpdate(value) {
  emit('update:modelValue', value);
}
</script>

<template>
  <div class="v-color-picker">
    <color-picker-panel
      :model-value="props.modelValue"
      :swatches="props.swatches"
      :disabled="props.disabled"
      @update:model-value="onModelValueUpdate"
    ></color-picker-panel>
  </div>
</template>

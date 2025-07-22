<script setup>
import { ref, useTemplateRef } from 'vue';
import { clamp } from './utils/utils';

const props = defineProps({
  pickerBg: {
    type: String,
    default: '#2ecc71',
  },
  type: {
    type: String,
    validate: (value) => ['hex', 'opacity'].includes(value),
    default: 'hex',
  },
});

const emit = defineEmits(['change', 'changeIsInteractive']);

const chooserRef = useTemplateRef('chooser');
const pickerRef = useTemplateRef('picker');
let chooserCache;
const pickerStyle = ref({
  left: '-9px',
  cursor: 'grab',
});

function onMousemove(event) {
  if (!chooserRef.value || !pickerRef.value) return;

  const rect = chooserRef.value.getBoundingClientRect();

  let x = 0;
  let y = 0;
  if (event) {
    x = event.clientX;
    y = event.clientY;

    if (x < rect.left) {
      x = rect.left;
    } else if (x > rect.left + rect.width) {
      x = rect.left + rect.width;
    }
    if (y < rect.top) {
      y = rect.top;
    } else if (y > rect.top + rect.height) {
      y = rect.top + rect.height;
    }

    x -= rect.left;
    y -= rect.top;
  } else if (chooserCache) {
    x = chooserCache.x * rect.width;
    y = chooserCache.y * rect.height;
  }

  const left = `calc(${(x / rect.width) * 100}% - ${pickerRef.value.offsetWidth / 2}px)`;

  pickerStyle.value.left = left;

  chooserCache = { x: x / rect.width };

  const cx = clamp(x / rect.width);

  if (Number.isNaN(cx)) return;

  emit('change', cx);
}

function onMousedown(event) {
  emit('changeIsInteractive', true);
  pickerStyle.value.cursor = 'grabbing';
  document.addEventListener('mouseup', onMouseup);
  document.addEventListener('mousemove', onMousemove);
  event.preventDefault();

  onMousemove(event);
}

function onMouseup() {
  pickerStyle.value.cursor = 'grab';
  document.removeEventListener('mouseup', onMouseup);
  document.removeEventListener('mousemove', onMousemove);
}

function update(x = 0, y = 0) {
  if (!chooserRef.value) return;
  const { left, top, width, height } = chooserRef.value.getBoundingClientRect();

  y = x;

  onMousemove({
    clientX: left + width * x,
    clientY: top + height * y,
  });
}

defineExpose({
  update,
});
</script>

<template>
  <div ref="chooser" class="v-color-chooser" @mousedown="onMousedown">
    <div
      ref="picker"
      class="v-picker"
      :style="{ ...pickerStyle, background: props.pickerBg }"
      @mousedown="onMousedown"
    ></div>
    <div :class="['v-slider', props.type === 'hex' ? 'v-slider-hex' : 'v-slider-opacity']"></div>
  </div>
</template>

<style scoped>
.v-color-chooser {
  position: relative;
  height: 8px;
  cursor: grab;
}
.v-picker {
  position: absolute;
  left: -9px;
  top: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  user-select: none;
  border: 2px solid #fff;
  top: 50%;
  transform: translateY(-50%);
}
.v-slider {
  height: 8px;
  border-radius: 4px;
}
.v-slider-hex {
  background: linear-gradient(
    to right,
    hsl(0, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(0, 100%, 50%)
  );
}
.v-slider-opacity {
  background:
    linear-gradient(to right, transparent, black),
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill-opacity="0.5"><rect x="10" width="10" height="10"/><rect y="10" width="10" height="10"/></svg>');
  background-size: 100%, 4px;
}
[data-theme='dark'] .v-slider-opacity {
  background:
    linear-gradient(to right, transparent, black),
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" fill-opacity="0.5"><rect x="10" width="10" height="10"/><rect y="10" width="10" height="10"/></svg>');
  background-size: 100%, 4px;
}
</style>

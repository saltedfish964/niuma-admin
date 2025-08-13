<script setup>
import { computed, nextTick, ref, useTemplateRef } from 'vue';
import { clamp } from './utils/utils';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  pickerBg: {
    type: String,
    default: '#2ecc71',
  },
  paletteBg: {
    type: String,
    default: '#42445A',
  },
});

const emit = defineEmits(['change', 'changeIsInteractive']);

const paletteRef = useTemplateRef('palette');
const pickerRef = useTemplateRef('picker');
let paletteCache;
const pickerStyle = ref({
  left: '-9px',
  top: '-9px',
  cursor: 'grab',
});
const testBg = computed(() => {
  return props.paletteBg || '#2ecc71';
});

function onMousemove(event) {
  if (!paletteRef.value || !pickerRef.value || props.disabled) return;

  const rect = paletteRef.value.getBoundingClientRect();

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
  } else if (paletteCache) {
    x = paletteCache.x * rect.width;
    y = paletteCache.y * rect.height;
  }

  const left = `calc(${(x / rect.width) * 100}% - ${pickerRef.value.offsetWidth / 2}px)`;
  const top = `calc(${(y / rect.height) * 100}% - ${pickerRef.value.offsetHeight / 2}px)`;

  pickerStyle.value.left = left;
  pickerStyle.value.top = top;

  paletteCache = { x: x / rect.width, y: y / rect.height };

  const cx = clamp(x / rect.width);
  const cy = clamp(y / rect.height);

  emit('change', cx, cy);
}

function onMousedown(event) {
  if (props.disabled) return;
  emit('changeIsInteractive', true);
  pickerStyle.value.cursor = 'grabbing';
  document.addEventListener('mouseup', onMouseup);
  document.addEventListener('mousemove', onMousemove);
  event.preventDefault();

  nextTick(() => {
    onMousemove(event);
  });
}

function onMouseup() {
  pickerStyle.value.cursor = 'grab';
  document.removeEventListener('mouseup', onMouseup);
  document.removeEventListener('mousemove', onMousemove);
}

function update(x = 0, y = 0) {
  if (!paletteRef.value) return;
  const { left, top, width, height } = paletteRef.value.getBoundingClientRect();

  onMousemove({
    clientX: left + width * x,
    clientY: top + height * y,
  });
}

function trigger() {
  onMousemove();
}

defineExpose({
  update,
  trigger,
});
</script>

<template>
  <div class="v-color-palette">
    <div
      ref="picker"
      class="v-picker"
      :style="{ ...pickerStyle, background: props.pickerBg }"
      @mousedown="onMousedown"
    ></div>
    <div
      ref="palette"
      class="v-palette"
      :style="{ background: testBg }"
      @mousedown="onMousedown"
    ></div>
  </div>
</template>

<style scoped>
.v-color-palette {
  height: 128px;
  width: 100%;
  position: relative;
  z-index: 1;
}
.v-picker {
  position: absolute;
  left: -9px;
  top: -9px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  user-select: none;
  border: 2px solid #fff;
  cursor: grab;
}
.v-palette {
  width: 100%;
  height: 100%;
  background:
    linear-gradient(to top, rgb(0, 0, 0), transparent),
    linear-gradient(to left, rgb(0, 21, 255), rgb(255, 255, 255));
  border-radius: 2px;
  cursor: grab;
}
.v-palette::before {
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill-opacity="0.5"><rect x="10" width="10" height="10"/><rect y="10" width="10" height="10"/></svg>');
  background-size: 8px 8px;
  border-radius: 2px;
  z-index: -1;
}
[data-theme='dark'] .v-palette::before {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" fill-opacity="0.5"><rect x="10" width="10" height="10"/><rect y="10" width="10" height="10"/></svg>');
}
</style>

<script setup>
import { ref, useTemplateRef, onMounted } from 'vue';
import ColorPalette from './palette.vue';
import ColorChooser from './chooser.vue';
import { HSVaColor } from './utils/hsvacolor';
import { parseToHSVA } from './utils/color';

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

const emit = defineEmits(['update:modelValue', 'apply']);

let color = HSVaColor();
let lastColor = HSVaColor();

const paletteRef = useTemplateRef('palette');
const hueRef = useTemplateRef('hue');
const opacityRef = useTemplateRef('opacity');
// 用于控制阻止 change 事件更新 colorText
const colorTextIsSilent = ref(false);
const colorText = ref('');
const palettePickerBg = ref('#2ecc71');
const paletteBg = ref('#42445A');
const huePickerBg = ref('#2ecc71');
const opacityPickerBg = ref('rgba(0, 0, 0, 1)');
// 是否为在界面中操作
const isInteractive = ref(false);

const currentColorStyle = ref({
  backgroundColor: props.modelValue,
});
const lastColorStyle = ref({
  backgroundColor: props.modelValue,
});

function setHSVA(h = 360, s = 0, v = 0, a = 1, silent = false) {
  isInteractive.value = false;
  if (h < 0 || h > 360 || s < 0 || s > 100 || v < 0 || v > 100 || a < 0 || a > 1) {
    return false;
  }

  color = HSVaColor(h, s, v, a);

  hueRef.value.update(h / 360);
  opacityRef.value.update(a);
  paletteRef.value.update(s / 100, 1 - v / 100);

  if (!silent) {
    applyColor();
  }

  return true;
}

function setColor(str, silent = false) {
  if (str === null) {
    clearColor();
    return true;
  }
  const { values } = parseLocalColor(str);

  if (values) {
    setHSVA(...values, silent);
  }
}

function getColor() {
  if (color) {
    return color;
  }
  color = lastColor.clone();
  return color;
}

function clearColor() {
  lastColor = null;
}

function parseLocalColor(str) {
  const { values, type } = parseToHSVA(str);
  return {
    values: !values ? null : values,
    type,
  };
}

function applyColor() {
  const cssRGBaString = color.toRGBA().toString();
  const hexa = color.toHEXA().toString();
  colorText.value = hexa;
  currentColorStyle.value.backgroundColor = cssRGBaString;
  lastColorStyle.value.backgroundColor = cssRGBaString;
  lastColor = color.clone();
}

function onColorPaletteChange(x, y) {
  const color = getColor();

  if (isInteractive.value) {
    color.s = x * 100;
    color.v = 100 - y * 100;
    color.v < 0 ? (color.v = 0) : 0;
  }
  const cssRGBaString = color.toRGBA().toString();
  palettePickerBg.value = cssRGBaString;
  paletteBg.value = `
    linear-gradient(to top, rgba(0, 0, 0, ${color.a}), transparent),
    linear-gradient(to left, hsla(${color.h}, 100%, 50%, ${color.a}), rgba(255, 255, 255, ${color.a}))
  `;
  const hexa = color.toHEXA().toString();
  if (!colorTextIsSilent.value) {
    colorText.value = hexa;
  }
  currentColorStyle.value.backgroundColor = cssRGBaString;
}

function onHueColorChooserChange(v) {
  const color = getColor();
  color.h = v * 360;
  huePickerBg.value = `hsl(${color.h}, 100%, 50%)`;
  paletteRef.value.trigger();
}

function onOpacityColorChooserChange(v) {
  const color = getColor();
  color.a = Math.round(v * 1e2) / 100;
  opacityPickerBg.value = `rgba(0, 0, 0, ${color.a})`;
  paletteRef.value.trigger();
}

function onInput(event) {
  colorTextIsSilent.value = true;
  setColor(event.target.value, true);
}

function onInputKeyup() {
  colorTextIsSilent.value = false;
}

function onBlur() {
  const cssRGBaString = color.toRGBA().toString();
  const hexa = color.toHEXA().toString();
  colorText.value = hexa;
  currentColorStyle.value.backgroundColor = cssRGBaString;
}

function onLastColorClick() {
  setColor(lastColor.toHEXA().toString());
}

function onChangeIsInteractive(val) {
  isInteractive.value = val;
}

function onSwatchClick(color) {
  setColor(color, true);
}

function onApply() {
  applyColor();
  const hexa = color.toHEXA().toString();
  emit('update:modelValue', hexa);
  emit('apply', hexa);
}

function onClear() {
  clearColor();
  emit('update:modelValue', null);
}

function getValue() {
  const { values } = parseToHSVA(colorText.value);

  return !values ? null : HSVaColor(...values);
}

onMounted(() => {
  setColor(props.modelValue);
});

defineExpose({
  getValue,
});
</script>

<template>
  <div class="v-color-picker-panel">
    <div class="v-color-preview-container">
      <div class="v-color-preview">
        <div class="v-last-color" :style="lastColorStyle" @click="onLastColorClick"></div>
        <div class="v-current-color" :style="currentColorStyle"></div>
      </div>
    </div>
    <color-palette
      ref="palette"
      :palette-bg="paletteBg"
      :picker-bg="palettePickerBg"
      :is-interactive="isInteractive"
      @change="onColorPaletteChange"
      @change-is-interactive="onChangeIsInteractive"
    ></color-palette>
    <div class="v-color-chooser-container">
      <color-chooser
        ref="hue"
        :picker-bg="huePickerBg"
        :is-interactive="isInteractive"
        @change="onHueColorChooserChange"
        @change-is-interactive="onChangeIsInteractive"
      ></color-chooser>
    </div>
    <div class="v-color-chooser-container">
      <color-chooser
        ref="opacity"
        type="opacity"
        :picker-bg="opacityPickerBg"
        :is-interactive="isInteractive"
        @change="onOpacityColorChooserChange"
        @change-is-interactive="onChangeIsInteractive"
      ></color-chooser>
    </div>
    <div class="v-swatches-container">
      <div class="v-swatches">
        <div
          v-for="s in swatches"
          :key="s"
          class="v-swatches-item"
          :style="{ '--swatch-color': s }"
          @click="onSwatchClick(s)"
        ></div>
      </div>
    </div>
    <div class="v-interaction" :style="{ paddingTop: swatches.length ? '12px' : '0' }">
      <input
        v-model="colorText"
        name="colorText"
        class="v-result"
        type="text"
        @keyup="onInputKeyup"
        @input="onInput"
        @blur="onBlur"
      />
      <button class="v-btn" :disabled="props.disabled" @click="onApply">应用</button>
      <button class="v-btn v-btn-reset" :disabled="props.disabled" @click="onClear">清除</button>
    </div>
  </div>
</template>

<style scoped>
.v-color-picker-panel {
  width: 230px;
  background: var(--nm-color-bg-container, #ffffff);
  padding: 16px;
  box-shadow:
    0 0.15em 1.5em 0 rgba(0, 0, 0, 0.1),
    0 0 1em 0 rgba(0, 0, 0, 0.03);
}
[data-theme='dark'] .v-color-picker-panel {
  box-shadow: none;
}
.v-color-preview-container {
  padding-bottom: 8px;
}
.v-color-preview {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 16px;
  border-radius: 2px;
  overflow: hidden;
}
.v-color-preview::before {
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill-opacity="0.5"><rect x="10" width="10" height="10"/><rect y="10" width="10" height="10"/></svg>');
  background-size: 0.5em;
  border-radius: 0.15em;
  z-index: -1;
}
.v-last-color,
.v-current-color {
  flex: 1;
  height: 100%;
}
.v-last-color {
  cursor: pointer;
}

.v-picker {
  position: absolute;
  left: 0;
  top: 0;
  background: #2ecc71;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  user-select: none;
  border: 2px solid #fff;
}
.v-color-chooser-container {
  padding-top: 12px;
}

.v-swatches-container {
  padding-top: 12px;
}

.v-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.v-swatches-item {
  position: relative;
  z-index: 1;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.v-swatches-item::before {
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
.v-swatches-item::after {
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: var(--swatch-color, 'transparent');
}
.v-interaction {
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
}
.v-result {
  color: #75797e;
  text-align: left;
  flex: none;
  width: 106px;
  height: 24px;
  transition: all 0.2s;
  border-radius: 2px;
  background: #f1f3f4;
  cursor: text;
  font-size: 12px;
  outline: none;
  border: none;
  padding: 0 8px;
}
.v-btn {
  flex: none;
  width: 40px;
  height: 24px;
  border-radius: 2px;
  background: var(--nm-primary-color, #3e74fd);
  color: #ffffff;
  font-size: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.v-btn-reset {
  background: var(--nm-color-error, #e0e0e0);
}
</style>

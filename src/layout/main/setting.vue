<script setup>
import { ref } from 'vue';
import { Drawer as ADrawer, Switch as ASwitch, Divider as ADivider } from 'ant-design-vue';
import VIcon from '@src/components/icon/icon.vue';
import VColorPickerPanel from '@src/components/color-picker/color-picker-panel.vue';
import { useLayoutStore } from '@src/store/modules/layout';
import projectConfig from '@src/config';
import { applyTheme, toggleDarkMode } from '@src/utils/theme';

const layoutStore = useLayoutStore();

const open = ref(false);
const customColor = ref(layoutStore.themeColor);

function onSettingClick() {
  open.value = true;
}

function onHasMainMenuChange(checked) {
  layoutStore.setHasMainMenu(checked);
}

function onDarkModeChange(e) {
  toggleDarkMode(e);
}

function onThemeItemClick(color) {
  layoutStore.setThemeColor(color);
  applyTheme(color, layoutStore.darkMode);
}

function onCustomColorChange(color) {
  customColor.value = color;
  layoutStore.setThemeColor(color);
  applyTheme(color, layoutStore.darkMode);
}
</script>

<template>
  <div class="setting" @click="onSettingClick">
    <v-icon name="ant-design-icon-setting-outlined" size="20px"></v-icon>
    <a-drawer
      v-model:open="open"
      :body-style="{ color: 'var(--nm-color-text)' }"
      width="300"
      title="设置"
      placement="right"
    >
      <div class="switch-item">
        <div>双菜单</div>
        <a-switch :checked="layoutStore.hasMainMenu" @change="onHasMainMenuChange" />
      </div>
      <div class="switch-item">
        <div>深色模式</div>
        <a-switch :checked="layoutStore.darkMode" @change="(_, e) => onDarkModeChange(e)" />
      </div>
      <a-divider />
      <div class="theme-item">
        <div class="theme-item-title">主题颜色</div>
        <div class="theme-list">
          <div
            :class="[
              'theme-list-item',
              layoutStore.themeColor === color.color ? 'theme-list-item-active' : '',
            ]"
            v-for="color in projectConfig.themeColors"
            :key="color.color"
            @click="onThemeItemClick(color.color)"
          >
            <div class="theme-item-color" :style="{ background: color.color }"></div>
            <div class="theme-item-name">{{ color.name }}</div>
          </div>
        </div>
        <div
          :class="[
            'custom-theme',
            layoutStore.themeColor === customColor &&
            !projectConfig.themeColors.map((item) => item.color).includes(customColor)
              ? 'custom-theme-active'
              : '',
          ]"
        >
          <v-color-picker-panel
            :model-value="customColor"
            :hide-clear-button="true"
            @update:model-value="onCustomColorChange"
          ></v-color-picker-panel>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<style scoped>
.setting {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
}
.setting:hover {
  background: var(--nm-border-color);
  cursor: pointer;
}
.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}
.theme-item-title {
  padding: 8px 0 16px 0;
}
.theme-list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 10px 10px;
}
.theme-list-item {
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
}
.theme-list-item-active {
  background: var(--nm-border-color);
}
.theme-list-item:hover {
  background: var(--nm-border-color);
  cursor: pointer;
}
.theme-item-color {
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
}
.theme-item-name {
  text-align: center;
  padding: 4px 0;
}
.custom-theme {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  border-radius: 4px;
}
.custom-theme-active {
  background: var(--nm-border-color);
}
</style>

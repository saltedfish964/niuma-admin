<script setup>
import { ref } from 'vue';
import VIcon from '@src/components/icon/icon.vue';
import { useLayoutStore } from '@src/store/modules/layout';

const layoutStore = useLayoutStore();

const open = ref(false);

function onSettingClick() {
  open.value = true;
}

function onHasMainMenuChange(checked) {
  layoutStore.setHasMainMenu(checked);
}
</script>

<template>
  <div class="setting" @click="onSettingClick">
    <v-icon name="ant-design-icon-setting-outlined" size="20px"></v-icon>
    <a-drawer v-model:open="open" width="300" title="设置" placement="right">
      <div class="switch-item">
        <div>双菜单</div>
        <a-switch :checked="layoutStore.hasMainMenu" @change="onHasMainMenuChange" />
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
  background: #f0f0f0;
  cursor: pointer;
}
.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

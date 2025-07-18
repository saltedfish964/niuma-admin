<script setup>
import { theme } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { useRouter } from 'vue-router';
import { useBeforeUnload } from '@src/composables/useBeforeUnload';
import { useLayoutStore } from '@src/store/modules/layout';

const router = useRouter();
const layoutStore = useLayoutStore();

useBeforeUnload(() => {
  const currentRouteFullPath = router.currentRoute.value.fullPath;
  sessionStorage.setItem('currentRouteFullPath', currentRouteFullPath);
});
</script>

<template>
  <a-config-provider
    :locale="zhCN"
    :theme="{
      algorithm: layoutStore.darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: layoutStore.themeColor,
      },
    }"
  >
    <router-view></router-view>
  </a-config-provider>
</template>

<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { useRouter } from 'vue-router';
import { useBeforeUnload } from '@src/composables/useBeforeUnload';

const router = useRouter();

useBeforeUnload(() => {
  const currentRouteFullPath = router.currentRoute.value.fullPath;
  sessionStorage.setItem('currentRouteFullPath', currentRouteFullPath);
});
</script>

<template>
  <a-config-provider :locale="zhCN">
    <router-view></router-view>
  </a-config-provider>
</template>

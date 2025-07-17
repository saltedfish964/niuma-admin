<script setup>
import { ref, h } from 'vue';
import { useRouter } from 'vue-router';
import VIcon from '@src/components/icon/icon.vue';
import AvatarImg from '@src/assets/imgs/avatar.jpg';
import { useUserStore } from '@src/store/modules/user';
import { useLayoutStore } from '@src/store/modules/layout';

const router = useRouter();
const userStore = useUserStore();
const layoutStore = useLayoutStore();

const menuList = ref([
  {
    key: 'logout',
    label: '退出登录',
    icon: () => h(VIcon, { name: 'material-symbols-icon-logout-rounded' }),
  },
]);

function onMenuClick({ key }) {
  switch (key) {
    case 'logout':
      userStore.$reset();
      layoutStore.$reset();
      router.replace('/login');
      break;
    default:
      break;
  }
}
</script>

<template>
  <a-dropdown>
    <div class="avatar-container">
      <div class="avatar">
        <img :src="AvatarImg" />
      </div>
    </div>
    <template #overlay>
      <a-menu :items="menuList" @click="onMenuClick"></a-menu>
    </template>
  </a-dropdown>
</template>

<style scoped>
.avatar-container {
  transition: all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
  padding: 4px;
  border-radius: 8px;
}
.avatar-container:hover {
  background: #f0f0f0;
  cursor: pointer;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid var(--border-color);
}
.avatar img {
  width: 100%;
}
</style>

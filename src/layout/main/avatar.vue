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
      <div class="menu-container">
        <div class="user-info">
          <div class="avatar">
            <img :src="AvatarImg" />
          </div>
          <div class="name">Niuma</div>
          <a-tag style="margin: 0" color="green">在线</a-tag>
        </div>
        <a-divider style="margin: 8px 0 0 0" />
        <a-menu :items="menuList" @click="onMenuClick"></a-menu>
      </div>
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
.menu-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
}
.menu-container .user-info {
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 8px;
  display: flex;
  align-items: center;
}
.menu-container .user-info .name {
  padding: 0 8px;
}
.menu-container .ant-dropdown-menu {
  box-shadow: none;
}
</style>

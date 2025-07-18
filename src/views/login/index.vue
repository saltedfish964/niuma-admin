<script setup>
/// <reference path="../../types/menu.js" />
import { useRouter } from 'vue-router';
import { useLayoutStore } from '@src/store/modules/layout';
import { useUserStore } from '@src/store/modules/user';
import { getMenu } from '@src/api/menu';
import { mergeNewConfigToMenuConfig } from '@src/utils/config';
import { addRoutes } from '@src/router/dynamicRoutes';
import projectConfig from '@src/config';

const layoutStore = useLayoutStore();
const userStore = useUserStore();
const router = useRouter();

async function onLogin() {
  const res = await getMenu();
  const config = mergeNewConfigToMenuConfig(res);
  layoutStore.generateMenuList(config);
  addRoutes(config);

  userStore.setToken('ok');

  router.push(projectConfig.homeRoutePath);
}
</script>

<template>
  <div
    class="background"
    :style="{
      backgroundImage: layoutStore.darkMode ? '' : 'linear-gradient(to right, #458cfb, #f2f6fe)',
      backgroundColor: layoutStore.darkMode ? '#141414' : '',
    }"
  >
    <div class="background-img"></div>
    <div class="right-content">
      <div class="header">
        <span class="title"> Niuma Admin </span>
      </div>
      <div class="main">
        <div
          class="form-content"
          :style="{
            shadow: layoutStore.darkMode
              ? ''
              : '0 0 #0000, 0 0 #0000, 0 25px 50px -12px rgb(0 0 0 / 0.25)',
            background: layoutStore.darkMode ? '' : '#ffffffaa',
            border: layoutStore.darkMode ? 'var(--nm-border)' : '',
          }"
        >
          <div class="form-content-title">登录</div>
          <div class="form-content-form">
            <a-form ref="formRef">
              <a-form-item name="username">
                <a-input placeholder="账号"></a-input>
              </a-form-item>
              <a-form-item name="password">
                <a-input-password placeholder="密码"></a-input-password>
              </a-form-item>
              <a-form-item>
                <a-button
                  class="form-content-form-login-btn"
                  type="primary"
                  html-type="submit"
                  @click="onLogin"
                >
                  <span>登录</span>
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>
      <div class="footer">MIT Licensed | Copyright © 2024</div>
    </div>
  </div>
</template>

<style scoped>
.background {
  height: 100vh;
  width: 100vw;
  overflow: auto;
  display: flex;
  color: var(--nm-color-text);
}
.background-img {
  background: url('@src/assets/imgs/login-bg.svg');
  background-size: auto;
  background-position: center;
  background-repeat: no-repeat;
  display: none;
  flex-grow: 1;
}
.right-content {
  width: 100%;
  flex: none;
  display: flex;
  flex-direction: column;
}
.header {
  padding: 1.5rem;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
}
.header .title {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
}
.main {
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.form-content {
  width: 100%;
  max-width: 360px;
  border-radius: 0.5rem;
  padding: 1.5rem;
}
.form-content-title {
  font-size: 1.5rem;
  line-height: 2rem;
}
.form-content-form {
  padding-top: 1rem;
}
.form-content-form-login-btn {
  width: 100%;
}
.footer {
  flex: none;
  padding: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #66748b;
}
@media (min-width: 1280px) {
  .background-img {
    display: block;
  }
  .right-content {
    width: 50%;
  }
}
</style>

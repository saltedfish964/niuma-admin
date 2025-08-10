<script setup>
/// <reference path="../../types/menu.js" />
import { useRouter } from 'vue-router';
import { useLayoutStore } from '@src/store/modules/layout';
import { useUserStore } from '@src/store/modules/user';
import { getMenu } from '@src/api/menu';
import { mergeNewConfigToMenuConfig } from '@src/utils/config';
import { addRoutes } from '@src/router/dynamic-routes';
import projectConfig from '@src/config';
import { toggleDarkMode } from '@src/utils/theme';

const layoutStore = useLayoutStore();
const userStore = useUserStore();
const router = useRouter();

function onDarkModeChange(e) {
  toggleDarkMode(e);
}

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
  <div class="login-view-container">
    <div
      class="left-content"
      :style="{
        background: layoutStore.darkMode
          ? '#141414'
          : 'linear-gradient(to right, #458cfb, #f2f6fe)',
      }"
    >
      <div class="background-deep">
        <div class="background-inner"></div>
        <div class="background-img"></div>
      </div>
    </div>
    <div class="right-content">
      <div class="header">
        <span class="title"> Niuma Admin </span>
        <a-switch
          checked-children="深色"
          un-checked-children="浅色"
          :checked="layoutStore.darkMode"
          @change="(_, e) => onDarkModeChange(e)"
        />
      </div>
      <div class="main">
        <div
          class="form-content"
          :style="{
            shadow: layoutStore.darkMode
              ? ''
              : '0 0 #0000, 0 0 #0000, 0 25px 50px -12px rgb(0 0 0 / 0.25)',
            background: layoutStore.darkMode ? '' : '#ffffffaa',
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
.login-view-container {
  height: 100vh;
  width: 100vw;
  overflow: auto;
  display: flex;
  color: var(--nm-color-text);
}
.background-img {
  background: url('@src/assets/imgs/login-bg.svg');
  background-size: 50%;
  background-position: center;
  background-repeat: no-repeat;
  display: none;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}
.right-content {
  width: 100%;
  flex: none;
  display: flex;
  flex-direction: column;
  background: var(--nm-color-bg-container);
}
.header {
  padding: 1.5rem;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
}
.header .title {
  color: var(--nm-color-text);
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
  .left-content {
    flex: 1;
    overflow: hidden;
    position: relative;
  }
  .background-img {
    display: block;
    width: 100%;
    height: 100%;
  }
  .background-deep {
    background: #f0f2f5;
    width: 100%;
    height: 100%;
  }
  .background-inner {
    background: linear-gradient(
      154deg,
      #07070915 30%,
      color-mix(in srgb, var(--nm-primary-color) 30%, transparent) 48%,
      #07070915 64%
    );
    width: 100%;
    height: 100%;
    filter: blur(100px);
  }
  .right-content {
    flex: none;
    width: 34%;

    border-left: var(--nm-border);
  }
  [data-theme='dark'] .background-deep {
    background: #141414;
  }
  [data-theme='dark'] .right-content {
    background: #141414;
  }
}
</style>

<script setup>
import { message } from 'ant-design-vue';
import iconList from 'virtual:niuma-icon-loader';
import { useClipboard } from '@src/hooks/use-clipboard';
import VIcon from '@src/components/icon/icon.vue';

const [messageApi, contextHolder] = message.useMessage();
const { copy, error } = useClipboard();

const preText = `├─.gitignore
├─.prettierrc
├─.vscode
│ └─extensions.json
├─doc
│ └─images
│   └─preview.png
├─index.html
├─package-lock.json
├─package.json
├─plugins
│ ├─niuma-icon-loader.js
│ └─restart-on-folder-change.js
├─public
│ └─vite.svg
├─README.md
├─src
│ ├─App.vue
│ ├─assets
│ │ └─icons
│ │   ├─example.svg
│ │   ├─gitee.svg
│ │   ├─juejin.svg
│ │   ├─vite.svg
│ │   └─vue.svg
│ ├─components
│ │ ├─icon
│ │ │ └─icon.vue
│ │ └─tabs
│ │   ├─close-icon.vue
│ │   └─tabs.vue
│ ├─config.js
│ ├─hooks
│ │ └─useClipboard.js
│ ├─layout
│ │ └─default
│ │   ├─index.vue
│ │   └─main-menu-item.vue
│ ├─main.js
│ ├─router
│ │ ├─index.js
│ │ └─modules
│ │   ├─default.js
│ │   └─not-found.js
│ ├─store
│ │ ├─index.js
│ │ └─modules
│ │   ├─layout.js
│ │   └─user.js
│ ├─styles
│ │ ├─root.css
│ │ └─scroll.css
│ ├─utils
│ │ ├─antd-components-register.js
│ │ └─tree.js
│ └─views
│   ├─home
│   │ └─index.vue
│   ├─icon
│   │ └─index.vue
│   ├─iframe
│   │ └─index.vue
│   ├─not-found
│   │ └─index.vue
│   ├─overview
│   │ └─index.vue
│   └─workbench
│     └─index.vue
└─vite.config.js`;

const currentIconList = iconList.map((item) => {
  const [type, icon] = item.name.split(':');
  return {
    name: `${type}-icon-${icon}`,
    label: icon,
    type,
  };
});

async function copyHandler(item) {
  const value = `<v-icon name="${item.name}"></v-icon>`;
  await copy(value);
  if (error.value) {
    messageApi.error(error.value);
  }
  messageApi.success('复制成功');
}
</script>

<template>
  <div class="container">
    <a-row class="icon-list" :gutter="[16, 16]">
      <a-col
        v-for="item in currentIconList"
        :key="item.name"
        :xs="12"
        :sm="8"
        :md="6"
        :lg="4"
        :xl="3"
      >
        <a-badge-ribbon
          :text="item.type === 'custom' ? '自定义' : 'iconify'"
          :color="item.type === 'custom' ? 'green' : ''"
        >
          <a-card>
            <div class="icon-item">
              <div class="icon-item-icon">
                <v-icon :name="item.name" size="38"></v-icon>
              </div>
            </div>
            <template #actions>
              <div @click="copyHandler(item)">复制</div>
            </template>
          </a-card>
        </a-badge-ribbon>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="24">
        <a-card :bordered="false">
          <a-typography-title>图标 VIcon</a-typography-title>
          <a-typography-paragraph>
            <a-typography-text :code="true">VIcon</a-typography-text>
            组件可以使用的图标列表展示。
          </a-typography-paragraph>
          <a-typography-title :level="2">组件位置</a-typography-title>
          <a-typography-paragraph>
            <pre>src\components\icon\icon.vue</pre>
          </a-typography-paragraph>
          <a-typography-title :level="2">引入方式</a-typography-title>
          <a-typography-paragraph>
            <pre>import VIcon from '@src/components/icon/icon.vue';</pre>
          </a-typography-paragraph>
          <a-typography-title :level="2">添加 Iconify 图标</a-typography-title>
          <a-typography-paragraph>
            可以直接在
            <a-typography-link href="https://icon-sets.iconify.design/">
              Iconify 官网
            </a-typography-link>
            获取图标的名字后，添加到
            <a-typography-text :code="true">src\config.js</a-typography-text>
            中的
            <a-typography-text :code="true">iconsList</a-typography-text>
            数组中即可使用。
          </a-typography-paragraph>
          <a-typography-paragraph>
            下方红色框住的就是图标的名字，
            <a-typography-text :code="true">Iconify</a-typography-text>
            的图标名字都会有个冒号分隔，我们使用图标组件的时候，只需将冒号改为
            <a-typography-text :code="true">-icon-</a-typography-text>
            即可正常加载图标。
          </a-typography-paragraph>
          <a-typography-paragraph>
            <a-image src="/doc-image/icon-01.png" />
          </a-typography-paragraph>
          <a-typography-title :level="2">添加自定义图标</a-typography-title>
          <a-typography-paragraph>
            自定义只可以使用 svg 文件，将 svg 图标文件复制到
            <a-typography-text :code="true">src\assets\icons</a-typography-text>
            文件夹中后，图标组件的
            <a-typography-text :code="true">name</a-typography-text>
            为
            <a-typography-text :code="true">custom-icon-文件名</a-typography-text>
            ,即可正常使用。
          </a-typography-paragraph>
        </a-card>
      </a-col>
    </a-row>
    <context-holder />
  </div>
</template>

<style scoped>
.container {
  padding: 16px;
}
.icon-list {
  padding-bottom: 16px;
}
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

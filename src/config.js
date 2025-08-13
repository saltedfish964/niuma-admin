/// <reference path="./types/menu.js" />

const MENU_KEYS = {
  INDEX: 'index',
  OVERVIEW: 'overview',
  WORKPLACE: 'workplace',
  COMPONENT: 'component',
  MARKDOWN_RENDER: 'markdown-render',
};

/**
 * 菜单
 * @type {MenuItem[]}
 */
const menu = [
  {
    key: MENU_KEYS.INDEX,
    title: '主页',
    meta: {
      icon: 'ant-design-icon-home-filled',
    },
    children: [
      {
        key: MENU_KEYS.OVERVIEW,
        title: '概览',
        path: '/overview',
        meta: {
          icon: 'solar-icon-chart-outline',
          layout: 'main',
          component: 'overview',
        },
      },
      {
        key: MENU_KEYS.WORKPLACE,
        title: '工作台',
        path: '/workplace',
        meta: {
          icon: 'ant-design-icon-desktop-outlined',
          layout: 'main',
          component: 'workplace',
        },
      },
    ],
  },
  {
    key: MENU_KEYS.COMPONENT,
    title: '组件',
    meta: {
      icon: 'ant-design-icon-home-filled',
    },
    children: [
      {
        key: MENU_KEYS.MARKDOWN_RENDER,
        title: 'Markdown 渲染器',
        path: '/markdown-render',
        meta: {
          icon: 'solar-icon-chart-outline',
          layout: 'main',
          component: 'markdown-render',
        },
      },
    ],
  },
];

/**
 * 图标
 * @type {string[]}
 */
const iconsList = [
  'ant-design:menu-unfold-outlined',
  'ant-design:menu-fold-outlined',
  'ant-design:home-filled',
  'flat-color-icons:home',
  'material-symbols:iframe',
  'ic:baseline-insert-emoticon',
  'line-md:link',
  'solar:chart-outline',
  'icon-park-outline:workbench',
  'ant-design:table-outlined',
  'carbon:screen',
  'material-symbols:logout-rounded',
  'ant-design:setting-outlined',
  'proicons:full-screen-maximize',
  'proicons:full-screen-minimize',
  'ant-design:close-outlined',
  'icon-park-outline:to-right',
  'icon-park-outline:to-left',
  'ant-design:swap-outlined',
  'ant-design:reload-outlined',
  'ant-design:file-text-outlined',
  'ant-design:info-circle-outlined',
  'ant-design:caret-down-filled',
  'ant-design:caret-up-filled',
  'ant-design:desktop-outlined',
  'ant-design:plus-outlined',
];

/**
 * 主题色
 * @type {ThemeColorItem[]}
 */
const themeColors = [
  { name: '极客蓝', color: '#2f54eb' },
  { name: '拂晓蓝', color: '#1677ff' },
  { name: '薄暮', color: '#f5222d' },
  { name: '火山', color: '#fa541c' },
  { name: '日出', color: '#fadb14' },
  { name: '日暮', color: '#fa8c16' },
  { name: '金盏花', color: '#faad14' },
  { name: '明青', color: '#13c2c2' },
  { name: '极光绿', color: '#52c41a' },
  { name: '酱紫', color: '#722ed1' },
  { name: '法式洋红', color: '#eb2f96' },
  { name: '青柠', color: '#a0d911' },
];

export default {
  homeRoutePath: '/overview',
  menu,
  iconsList,
  themeColors,
};

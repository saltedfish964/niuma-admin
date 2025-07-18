/// <reference path="./types/menu.js" />

const MENU_KEYS = {
  INDEX: 'index',
  OVERVIEW: 'overview',
  ICON: 'icon',
  EXAMPLE: 'example',
  VUEROUTER_IFRAME: 'vue-router-iframe',
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
    ],
  },
  {
    key: MENU_KEYS.EXAMPLE,
    title: '示例',
    meta: {
      icon: 'custom-icon-example',
    },
    children: [
      {
        key: MENU_KEYS.ICON,
        title: '图标',
        path: '/icon',
        meta: {
          icon: 'ic-icon-baseline-insert-emoticon',
          layout: 'main',
          component: 'icon',
        },
      },
      {
        key: MENU_KEYS.VUEROUTER_IFRAME,
        title: 'Vue Router Iframe',
        path: '/vue-router-iframe',
        meta: {
          icon: 'material-symbols-icon-iframe',
          layout: 'main',
          component: 'iframe',
          iframeSrc: 'https://router.vuejs.org/zh/',
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
];

export default {
  homeRoutePath: '/overview',
  menu,
  iconsList,
};

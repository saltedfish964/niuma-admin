const MENU_KEYS = {
  INDEX: 'index',
  OVERVIEW: 'overview',
  ICON: 'icon',
};

/**
 * @typedef {Object} MenuItemMeta
 * @property {string} icon - 菜单图标
 * @property {string} layout - 路由布局
 * @property {string} component - 路由组件
 * @property {boolean} hide - 是否隐藏菜单
 * @property {boolean} unloadRouter - 不加载路由
 */
/**
 * @typedef {Object} MenuItem
 * @property {string} key - 菜单 key
 * @property {string} title - 菜单标题
 * @property {string} [path] - 路由路径
 * @property {MenuItemMeta} meta - 菜单 meta
 * @property {MenuItem[]} [children] - 子菜单
 */
/**
 * 菜单
 * @type {MenuItem[]}
 */
const menu = [
  {
    key: MENU_KEYS.INDEX,
    title: '首页',
    meta: {
      icon: 'ant-design-icon-home-filled',
      // hide: false,
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
        key: MENU_KEYS.ICON,
        title: '图标',
        path: '/icon',
        meta: {
          icon: 'ic-icon-baseline-insert-emoticon',
          layout: 'main',
          component: 'icon',
        },
      },
    ],
  },
  {
    key: 'test',
    title: '测试',
    path: '/bank-test',
    meta: {
      icon: 'ic-icon-baseline-insert-emoticon',
      layout: 'bank',
      hide: true, // 在菜单中隐藏
      component: 'icon',
    },
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
];

export default {
  menu,
  iconsList,
};

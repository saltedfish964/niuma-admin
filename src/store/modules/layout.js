import { ref, computed, h } from 'vue';
import { defineStore } from 'pinia';
import { isString } from 'lodash-es';
import VIcon from '@src/components/icon/icon.vue';
import { findTreeNodeBFS, findTreePathBFS } from '@src/utils/tree';

// 将数据格式化成适合 a-menu 的数据格式
function formatterMenuList(treeArray) {
  return treeArray.map((item) => {
    const { icon } = item.meta;
    const newItem = {
      ...item,
      label: item.title,
      title: item.title,
      children: item.children ? formatterMenuList(item.children) : [],
      meta: item.meta || {},
    };
    if (newItem.children.length === 0) {
      delete newItem.children;
    }

    if (icon) {
      if (isString(icon)) {
        newItem.icon = () => h(VIcon, { name: icon });
      } else {
        newItem.icon = () =>
          h(VIcon, {
            ...icon,
          });
      }
    }
    console.log('newItem: ', newItem);
    return newItem;
  });
}

export const useLayoutStore = defineStore(
  'layout',
  () => {
    const hasMainMenu = ref(false);
    // const menuConfig = ref([
    //   {
    //     key: 'main',
    //     label: '主页',
    //     title: '主页',
    //     icon: 'ant-design-icon-home-filled',
    //     children: [
    //       {
    //         key: 'overview',
    //         label: '概览',
    //         title: '概览',
    //         icon: 'solar-icon-chart-outline',
    //         route: {
    //           name: 'overview',
    //           path: '/overview',
    //         },
    //       },
    //       {
    //         key: 'workbench',
    //         label: '工作台',
    //         title: '工作台',
    //         icon: 'icon-park-outline-icon-workbench',
    //         route: {
    //           name: 'workbench',
    //           path: '/workbench',
    //         },
    //       },
    //     ],
    //   },
    //   {
    //     key: 'example',
    //     label: '示例',
    //     title: '示例',
    //     icon: 'custom-icon-example',
    //     children: [
    //       {
    //         key: 'icon',
    //         label: '图标',
    //         title: '图标',
    //         icon: 'ic-icon-baseline-insert-emoticon',
    //         route: {
    //           name: 'icon',
    //           path: '/icon',
    //         },
    //       },
    //       {
    //         key: 'iframe',
    //         label: 'iframe',
    //         title: 'iframe',
    //         icon: 'material-symbols-icon-iframe',
    //         children: [
    //           {
    //             key: 'iframe-juejin',
    //             label: '掘金',
    //             title: '掘金',
    //             icon: 'custom-icon-juejin',
    //             iframe: {
    //               src: 'https://juejin.cn/',
    //             },
    //           },
    //         ],
    //       },
    //       {
    //         key: 'outlink',
    //         label: '外链',
    //         title: '外链',
    //         icon: 'line-md-icon-link',
    //         children: [
    //           {
    //             key: 'outlink-gitee',
    //             label: '码云',
    //             title: '码云',
    //             icon: 'custom-icon-gitee',
    //             outlink: {
    //               target: '_blank',
    //               href: 'https://gitee.com/du-dudu/niuma-admin',
    //             },
    //             children: [],
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   {
    //     key: 'gitee',
    //     label: '码云',
    //     title: '码云',
    //     icon: 'custom-icon-gitee',
    //     outlink: {
    //       target: '_blank',
    //       href: 'https://gitee.com/du-dudu/niuma-admin',
    //     },
    //     children: [],
    //   },
    // ]);
    const menuCollapsed = ref(false);
    const menuActiveKey = ref();
    const menuList = ref([]);
    const secondaryMenuActiveKey = ref([]);
    const secondaryMenuOpenKeys = ref([]);
    const secondaryMenuList = computed(() => {
      if (hasMainMenu.value) {
        return menuList.value.find((item) => item.key === menuActiveKey.value)?.children || [];
      }
      return menuList.value;
    });

    // tabs
    const activeTabKey = ref('');
    const tabsList = ref([]);

    function toggleMenuCollapsed() {
      menuCollapsed.value = !menuCollapsed.value;
    }

    function setMenuActiveKey(key) {
      menuActiveKey.value = key;
    }

    function setSecondaryMenuActiveKey(keyPath) {
      secondaryMenuActiveKey.value = keyPath;
    }

    function setSecondaryMenuOpenKeys(openKeys) {
      secondaryMenuOpenKeys.value = openKeys;
    }

    function setActiveTabKey(key) {
      activeTabKey.value = key;
    }

    function setMenuList(list) {
      menuList.value = formatterMenuList(list);
    }

    function addTab(tab) {
      tabsList.value.push(tab);
    }

    function removeTabByKey(key) {
      tabsList.value = tabsList.value.filter((tab) => tab.key !== key);
    }

    function hasTab(key) {
      return tabsList.value.some((tab) => tab.key === key);
    }

    function updateTabByRouteFullPath(routeFullPath) {
      const menu = findTreeNodeBFS(menuList.value, (tab) => {
        return tab.path === routeFullPath;
      });
      if (!menu) return;
      if (hasTab(routeFullPath)) {
        setActiveTabKey(routeFullPath);
      } else {
        addTab({
          key: routeFullPath,
          name: menu.title,
          closable: true,
          menu,
        });
        setActiveTabKey(routeFullPath);
      }
    }

    function updateMenuActiveByRouteFullPath(routeFullPath) {
      const info = findTreePathBFS(menuList.value, (tab) => {
        return tab.path === routeFullPath;
      });
      if (!info) return;
      setSecondaryMenuActiveKey([info.node.key]);
      setSecondaryMenuOpenKeys(info.path.map((node) => node.key));
      if (hasMainMenu.value) {
        setMenuActiveKey(info.path[0].key);
      }
    }

    return {
      hasMainMenu,
      menuActiveKey,
      menuList,
      secondaryMenuActiveKey,
      secondaryMenuOpenKeys,
      secondaryMenuList,
      activeTabKey,
      tabsList,
      menuCollapsed,
      setMenuList,
      setMenuActiveKey,
      setActiveTabKey,
      toggleMenuCollapsed,
      setSecondaryMenuActiveKey,
      setSecondaryMenuOpenKeys,
      hasTab,
      addTab,
      removeTabByKey,
      updateTabByRouteFullPath,
      updateMenuActiveByRouteFullPath,
    };
  },
  // {
  //   persist: {
  //     omit: ['menuList', 'secondaryMenuList'],
  //   },
  // },
);

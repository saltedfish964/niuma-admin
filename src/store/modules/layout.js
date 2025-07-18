import { ref, computed, h } from 'vue';
import { defineStore } from 'pinia';
import { isArray, isString } from 'lodash-es';
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
    return newItem;
  });
}

function generateMenu(config) {
  if (!isArray(config)) return [];
  const showMenu = config.filter((item) => {
    const hide = item?.meta?.hide;
    return !hide;
  });
  return showMenu.map((item) => {
    const result = {
      ...item,
    };
    if (item.children) {
      result.children = generateMenu(item.children);
    }
    return result;
  });
}

export const useLayoutStore = defineStore(
  'layout',
  () => {
    const hasMainMenu = ref(true);
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

    // breadcrumb
    const breadcrumbList = computed(() => {
      const info = findTreePathBFS(menuList.value, (tab) => {
        return tab.key === activeTabKey.value;
      });
      if (info) return info.path;
      return [];
    });

    // content fullscreen
    const isContentFullscreen = ref(false);

    // theme
    const darkMode = ref(false);
    const themeColor = ref('#1890ff');

    function setThemeColor(color) {
      themeColor.value = color;
    }

    function setDarkMode(isDark) {
      darkMode.value = isDark;
    }

    function toggleIsContentFullscreen() {
      isContentFullscreen.value = !isContentFullscreen.value;
    }

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

    function addTab(tab) {
      tabsList.value.push(tab);
    }

    function removeTabByKey(key) {
      tabsList.value = tabsList.value.filter((tab) => tab.key !== key);
    }

    function hasTab(key) {
      return tabsList.value.some((tab) => tab.key === key);
    }

    function updateTabClosable() {
      tabsList.value = tabsList.value.map((tab) => {
        return {
          ...tab,
          closable: tabsList.value.length > 1,
        };
      });
    }

    function updateTabByKey(key) {
      const menu = findTreeNodeBFS(menuList.value, (tab) => {
        return tab.key === key;
      });
      if (!menu) return;
      if (hasTab(key)) {
        setActiveTabKey(key);
      } else {
        addTab({
          key,
          name: menu.title,
          closable: true,
          menu,
        });
        setActiveTabKey(key);
      }
      updateTabClosable();
    }

    function updateMenuActiveByKey(key) {
      const info = findTreePathBFS(menuList.value, (tab) => {
        return tab.key === key;
      });
      if (!info) return;
      setSecondaryMenuActiveKey([info.node.key]);
      if (menuCollapsed.value) {
        setSecondaryMenuOpenKeys([]);
      } else {
        setSecondaryMenuOpenKeys(info.path.map((node) => node.key));
      }
      setMenuActiveKey(info.path[0].key);
    }

    function generateMenuList(config) {
      const menu = generateMenu(config);
      menuList.value = formatterMenuList(menu);
    }

    function getActiveTab() {
      const tab = findTreeNodeBFS(tabsList.value, (tab) => {
        return tab.key === activeTabKey.value;
      });
      return tab;
    }

    function setHasMainMenu(has) {
      hasMainMenu.value = has;
    }

    function $reset() {
      menuActiveKey.value = undefined;
      menuList.value = [];
      secondaryMenuActiveKey.value = [];
      secondaryMenuOpenKeys.value = [];
      activeTabKey.value = '';
      tabsList.value = [];
    }

    return {
      isContentFullscreen,
      hasMainMenu,
      menuActiveKey,
      menuList,
      secondaryMenuActiveKey,
      secondaryMenuOpenKeys,
      secondaryMenuList,
      activeTabKey,
      tabsList,
      menuCollapsed,
      breadcrumbList,
      darkMode,
      themeColor,
      setThemeColor,
      setDarkMode,
      toggleIsContentFullscreen,
      getActiveTab,
      generateMenuList,
      setMenuActiveKey,
      setActiveTabKey,
      toggleMenuCollapsed,
      setSecondaryMenuActiveKey,
      setSecondaryMenuOpenKeys,
      hasTab,
      addTab,
      updateTabClosable,
      removeTabByKey,
      updateTabByKey,
      updateMenuActiveByKey,
      setHasMainMenu,
      $reset,
    };
  },
  {
    persist: {
      omit: ['menuList', 'secondaryMenuList'],
    },
  },
);

import { ref, computed, h } from 'vue';
import { defineStore } from 'pinia';
import { isString } from 'lodash-es';
import VIcon from '@src/components/icon/icon.vue';

function formatterMenuList(treeArray) {
  return treeArray.map((item) => {
    const newItem = {
      ...item,
      children: item.children ? formatterMenuList(item.children) : [],
    };
    if (newItem.children.length === 0) {
      delete newItem.children;
    }
    if (item.icon) {
      if (isString(item.icon)) {
        newItem.icon = () => h(VIcon, { name: item.icon });
      } else {
        newItem.icon = () =>
          h(VIcon, {
            ...item.icon,
          });
      }
    }
    return newItem;
  });
}

export const useLayoutStore = defineStore(
  'layout',
  () => {
    const menuConfig = ref([
      {
        key: 'main',
        label: '主页',
        title: '主页',
        icon: 'flat-color-icons-icon-home',
        children: [
          {
            key: 'overview',
            label: '概览',
            title: '概览',
            icon: 'ant-design-icon-menu-unfold-outlined',
          },
          {
            key: 'workbench',
            label: '工作台',
            title: '工作台',
            icon: 'ant-design-icon-menu-unfold-outlined',
          },
        ],
      },
      {
        key: 'example',
        label: '示例',
        title: '示例',
        icon: 'ant-design-icon-menu-unfold-outlined',
        children: [
          {
            key: 'icon',
            label: '图标',
            title: '图标',
            icon: 'ant-design-icon-menu-unfold-outlined',
          },
        ],
      },
    ]);
    const menuCollapsed = ref(false);
    const menuActiveKey = ref('main');
    const menuList = computed(() => {
      return formatterMenuList(menuConfig.value);
    });
    const secondaryMenuActiveKey = ref(['overview']);
    const secondaryMenuList = computed(() => {
      return (
        menuList.value.find((item) => item.key === menuActiveKey.value)
          ?.children || []
      );
    });

    const activeTabKey = ref('home');
    const tabsConfig = ref([
      { key: 'home', name: '首页' },
      { key: 'long', name: '这是一个很长的 Tabs 名字' },
    ]);

    function toggleMenuCollapsed() {
      menuCollapsed.value = !menuCollapsed.value;
    }

    function setMenuActiveKey(key) {
      menuActiveKey.value = key;
    }

    function setActiveTabKey(key) {
      activeTabKey.value = key;
    }

    function setSecondaryMenuActiveKey(keyPath) {
      secondaryMenuActiveKey.value = keyPath;
    }

    return {
      menuActiveKey,
      menuList,
      secondaryMenuActiveKey,
      secondaryMenuList,
      activeTabKey,
      tabsConfig,
      menuCollapsed,
      setMenuActiveKey,
      setActiveTabKey,
      toggleMenuCollapsed,
      setSecondaryMenuActiveKey,
    };
  },
  {
    persist: true,
  },
);

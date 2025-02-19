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
    if (item.outlink) {
      newItem.label = h(
        'a',
        {
          ...item.outlink,
          style: {
            display: 'flex',
            alignItems: 'center',
          },
        },
        [
          h(
            'span',
            {
              style: {
                flex: '1',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                paddingRight: '4px',
              },
            },
            item.label,
          ),
          h(VIcon, {
            name: 'line-md-icon-link',
            size: 12,
            style: {
              position: 'relative',
              top: '2px',
            },
          }),
        ],
      );
    }
    return newItem;
  });
}

export const useLayoutStore = defineStore(
  'layout',
  () => {
    const hasMainMenu = ref(true);
    const menuConfig = ref([
      {
        key: 'main',
        label: '主页',
        title: '主页',
        icon: 'ant-design-icon-home-filled',
        children: [
          {
            key: 'overview',
            label: '概览',
            title: '概览',
            icon: 'solar-icon-chart-outline',
            route: {
              name: 'overview',
              path: '/overview',
            },
          },
          {
            key: 'workbench',
            label: '工作台',
            title: '工作台',
            icon: 'icon-park-outline-icon-workbench',
            route: {
              name: 'workbench',
              path: '/workbench',
            },
          },
        ],
      },
      {
        key: 'example',
        label: '示例',
        title: '示例',
        icon: 'custom-icon-example',
        children: [
          {
            key: 'icon',
            label: '图标',
            title: '图标',
            icon: 'ic-icon-baseline-insert-emoticon',
            route: {
              name: 'icon',
              path: '/icon',
            },
          },
          {
            key: 'iframe',
            label: 'iframe',
            title: 'iframe',
            icon: 'material-symbols-icon-iframe',
            children: [
              {
                key: 'iframe-juejin',
                label: '掘金',
                title: '掘金',
                icon: 'custom-icon-juejin',
                iframe: {
                  src: 'https://juejin.cn/',
                },
              },
            ],
          },
          {
            key: 'outlink',
            label: '外链',
            title: '外链',
            icon: 'line-md-icon-link',
            children: [
              {
                key: 'outlink-gitee',
                label: '码云',
                title: '码云',
                icon: 'custom-icon-gitee',
                outlink: {
                  target: '_blank',
                  href: 'https://gitee.com/du-dudu/niuma-admin',
                },
                children: [],
              },
            ],
          },
        ],
      },
      {
        key: 'gitee',
        label: '码云',
        title: '码云',
        icon: 'custom-icon-gitee',
        outlink: {
          target: '_blank',
          href: 'https://gitee.com/du-dudu/niuma-admin',
        },
        children: [],
      },
    ]);
    const menuCollapsed = ref(false);
    const menuActiveKey = ref('main');
    const menuList = ref(formatterMenuList(menuConfig.value));
    const secondaryMenuActiveKey = ref(['overview']);
    const secondaryMenuOpenKeys = ref([]);
    const secondaryMenuList = computed(() => {
      if (hasMainMenu.value) {
        return (
          menuList.value.find((item) => item.key === menuActiveKey.value)
            ?.children || []
        );
      }
      return menuList.value;
    });

    const activeTabKey = ref('overview');
    const tabsConfig = ref([]);

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
      tabsConfig.value.push(tab);
    }

    function removeTabByKey(key) {
      tabsConfig.value = tabsConfig.value.filter((tab) => tab.key !== key);
    }

    function hasTab(key) {
      return tabsConfig.value.some((tab) => tab.key === key);
    }

    return {
      hasMainMenu,
      menuConfig,
      menuActiveKey,
      menuList,
      secondaryMenuActiveKey,
      secondaryMenuOpenKeys,
      secondaryMenuList,
      activeTabKey,
      tabsConfig,
      menuCollapsed,
      setMenuActiveKey,
      setActiveTabKey,
      toggleMenuCollapsed,
      setSecondaryMenuActiveKey,
      setSecondaryMenuOpenKeys,
      hasTab,
      addTab,
      removeTabByKey,
    };
  },
  {
    persist: {
      omit: ['menuList', 'secondaryMenuList'],
    },
  },
);

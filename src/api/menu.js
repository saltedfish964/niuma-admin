/**
 * 模拟从后端获取菜单
 * @returns {Promise<Array>}
 */
export function getMenu() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          key: 'test',
          title: '测试 Iframe',
          path: '/test-iframe',
          meta: {
            icon: 'material-symbols-icon-iframe',
            layout: 'main',
            component: 'iframe',
            iframeSrc: 'https://juejin.cn/',
          },
        },
      ]);
    }, 100);
  });
}

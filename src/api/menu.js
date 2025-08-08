/**
 * 模拟从后端获取菜单
 * @returns {Promise<Array>}
 */
export function getMenu() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          key: 'doc',
          title: '文档',
          meta: {
            icon: 'ant-design-icon-file-text-outlined',
            outlink: 'https://niuma-admin-doc.salted-fish.top/',
          },
        },
      ]);
    }, 100);
  });
}

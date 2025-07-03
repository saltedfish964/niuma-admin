import { readdirSync } from 'fs';
import { resolve, extname } from 'path';

const defaultOptions = {
  pageMainName: 'index',
  // 自定义页面入口, key 为 views 文件夹下的文件夹名, value 为入口名字
  customPageMainNameMap: {},
};

function generateAsyncViewMap(options) {
  let currentPageMainName = options.pageMainName;
  const viewsDir = resolve(__dirname, '..', 'src', 'views');
  const viewDirs = readdirSync(viewsDir);
  let result = '{';
  viewDirs.forEach((dir) => {
    const files = readdirSync(resolve(viewsDir, dir));
    files.forEach((file) => {
      const customPageMainName = options.customPageMainNameMap[dir];
      if (customPageMainName) {
        currentPageMainName = customPageMainName;
      }
      if (extname(file) === '.vue' && file === `${currentPageMainName}.vue`) {
        const path = `views/${dir}/${file}`;
        result += `\n  "${dir}": {
          path: "${path}",
          component: () => import('@src/${path}'),
        },`;
      }
    });
  });
  result += '}';
  return result;
}

export default function niumaAsyncViewMap(options = {}) {
  const currentOptions = Object.assign({}, defaultOptions, options);
  return {
    name: 'niuma-async-view-map',
    enforce: 'pre',
    resolveId: (id) => {
      return id.startsWith('virtual:niuma-async-view-map')
        ? `${id.slice('virtual:'.length)}.js`
        : undefined;
    },
    load: (id) => {
      if (id === 'niuma-async-view-map.js') {
        const val = generateAsyncViewMap(currentOptions);
        return `export default ${val};`;
      }
    },
  };
}

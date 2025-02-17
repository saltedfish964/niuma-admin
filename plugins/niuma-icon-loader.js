import { readdirSync } from 'fs';
import { resolve, extname } from 'path';
import ConfigData from '../src/config';

function generateCustomIconsList() {
  const customIconDir = resolve(__dirname, '..', 'src', 'assets', 'icons');
  const svgFiles = readdirSync(customIconDir)
    .filter((file) => extname(file) === '.svg')
    .map((file) => `custom:${file.replace('.svg', '')}`);
  return svgFiles;
}

export default {
  name: 'niuma-icon-loader',
  enforce: 'pre',
  resolveId: (id) => {
    return id.startsWith('virtual:niuma-icon-loader')
      ? `${id.slice('virtual:'.length)}.js`
      : undefined;
  },
  load: (id) => {
    if (id === 'niuma-icon-loader.js') {
      // iconsList 去重
      const uniqueList = [
        ...new Set(ConfigData.iconsList),
        ...new Set(generateCustomIconsList()),
      ];
      const iconsObj = {};
      uniqueList.forEach((item) => {
        const [type, name] = item.split(':');
        iconsObj[item] = {
          rawName: item,
          component: `() => import('~icons/${type}/${name}')`,
        };
      });
      const exportCode = uniqueList
        .map((item) => {
          return `{ name: '${iconsObj[item].rawName}', component: ${iconsObj[item].component} }`;
        })
        .join(', ');
      return `export default [${exportCode}];`;
    }
  },
};

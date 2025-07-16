import { isArray } from 'lodash-es';
import projectConfig from '@src/config';

function validateConfig(menu) {
  if (!menu) return true;
  const idSet = new Set();
  const stack = [...menu];
  while (stack.length) {
    const node = stack.pop();
    if (node.key === undefined) {
      console.error(`[validateConfig] 警告: 缺少 key 属性:`, node);
      return false;
    }
    if (idSet.has(node.key)) {
      console.error(`[validateConfig] 警告: 出现重复 key 值:`, node.key);
      return false;
    }
    idSet.add(node.key);
    if (node.children && Array.isArray(node.children)) {
      stack.push(...node.children);
    }
  }
  return true;
}

function addIsLocalAttr(config, isLocal = true) {
  if (!isArray(config)) return [];
  return config.map((item) => {
    const result = {
      ...item,
    };
    if (!result.meta) result.meta = {};
    result.meta.isLocal = isLocal;
    if (item.children) {
      result.children = addIsLocalAttr(item.children);
    }
    return result;
  });
}

export function mergeNewConfigToMenuConfig(config) {
  if (!isArray(config)) return;
  let newConfig = [...projectConfig.menu, ...config];
  const isOk = validateConfig(newConfig);
  if (!isOk) return;
  newConfig = [...addIsLocalAttr(projectConfig.menu), ...addIsLocalAttr(config, false)];
  return newConfig;
}

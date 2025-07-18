import { theme } from 'ant-design-vue';
import { useLayoutStore } from '@src/store/modules/layout';
import projectConfig from '@src/config';

/**
 * 将 Token 对象转换为 CSS 变量对象
 * @param {Object} tokens - Token 对象
 * @param {string} prefix - CSS 变量前缀
 * @returns {Object} - 格式为 {--prefix-token-name: value} 的对象
 */
export function convertTokensToCssVars(tokens, prefix = 'nm') {
  const cssVars = {};

  Object.entries(tokens).forEach(([key, value]) => {
    let cssValue = value;

    if (typeof value === 'number') {
      const lowerCaseKey = key.toLowerCase();
      if (
        (lowerCaseKey.includes('size') ||
          lowerCaseKey.includes('width') ||
          lowerCaseKey.includes('height') ||
          lowerCaseKey.includes('margin') ||
          lowerCaseKey.includes('padding') ||
          lowerCaseKey.includes('radius')) &&
        !lowerCaseKey.includes('lineheight')
      ) {
        cssValue = `${value}px`;
      }
    }
    const cssVarName = `--${prefix}-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    cssVars[cssVarName] = cssValue;
  });

  return cssVars;
}

export function generateThemeToken(primaryColor, isDark) {
  const { defaultAlgorithm, darkAlgorithm, defaultSeed } = theme;
  const algorithm = isDark ? darkAlgorithm : defaultAlgorithm;

  return algorithm({
    ...defaultSeed,
    primaryColor,
  });
}

export function applyTheme(primaryColor, isDark = false) {
  const root = document.documentElement;

  // 设置 data-theme 属性
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');

  const themeToken = generateThemeToken(primaryColor, isDark);

  // 生成并应用所有变量
  const allVariables = convertTokensToCssVars(themeToken);

  Object.entries(allVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  const layoutStore = useLayoutStore();
  layoutStore.setThemeColor(primaryColor);
  layoutStore.setDarkMode(isDark);
}

export function initTheme() {
  const layoutStore = useLayoutStore();
  const savedColor = layoutStore.themeColor || projectConfig.themeColors[1].color;
  const isDark = layoutStore.darkMode === true;
  applyTheme(savedColor, isDark);
  return { primaryColor: savedColor, isDark };
}

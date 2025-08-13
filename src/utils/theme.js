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

/**
 * 带过渡的切换暗黑模式
 * @param {Event} e
 */
export function toggleDarkMode(e) {
  const layoutStore = useLayoutStore();
  layoutStore.setDarkMode(!layoutStore.darkMode);
  applyTheme(layoutStore.themeColor, layoutStore.darkMode);
  // TODO: 原本的动画，元素多了之后会有卡顿(需要优化)
  // const transition = document.startViewTransition(() => {
  //   layoutStore.setDarkMode(!layoutStore.darkMode);
  //   applyTheme(layoutStore.themeColor, layoutStore.darkMode);
  // });
  // transition.ready.then(() => {
  //   const { clientX, clientY } = e;
  //   const radius = Math.hypot(
  //     Math.max(clientX, innerWidth - clientX),
  //     Math.max(clientY, innerHeight - clientY),
  //   );
  //   const clipPath = [
  //     `circle(0% at ${clientX}px ${clientY}px)`,
  //     `circle(${radius}px at ${clientX}px ${clientY}px)`,
  //   ];
  //   const isDark = layoutStore.darkMode;
  //   // 自定义动画
  //   document.documentElement.animate(
  //     {
  //       // 如果要切换到暗色主题，我们在过渡的时候从半径 100% 的圆开始，到 0% 的圆结束
  //       clipPath: isDark ? clipPath.reverse() : clipPath,
  //     },
  //     {
  //       duration: 300,
  //       // 如果要切换到暗色主题，我们应该裁剪 view-transition-old(root) 的内容
  //       pseudoElement: isDark ? '::view-transition-old(root)' : '::view-transition-new(root)',
  //     },
  //   );
  // });
}

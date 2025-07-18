/**
 * @typedef {Object} MenuItemMeta
 * @property {string} icon - 菜单图标
 * @property {string} layout - 路由布局
 * @property {string} component - 路由组件
 * @property {boolean} hide - 是否隐藏菜单
 * @property {boolean} unloadRouter - 不加载路由
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} key - 菜单 key
 * @property {string} title - 菜单标题
 * @property {string} [path] - 路由路径
 * @property {MenuItemMeta} meta - 菜单 meta
 * @property {MenuItem[]} [children] - 子菜单
 */

/**
 * @typedef {Object} ThemeColorItem
 * @property {string} name - 颜色名称
 * @property {string} color - 颜色值
 */

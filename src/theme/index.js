/**
 * 主题系统入口
 * 统一的主题管理，支持浅色和深色模式
 */
// 导出主题对象
import lightTheme from "./lightTheme"
import darkTheme from "./darkTheme"
// 导出颜色常量（供需要直接使用颜色的场景）
export * from "./colors"



// 导出主题常量
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
}

// 主题映射
export const themeMap = {
  [THEMES.LIGHT]: lightTheme,
  [THEMES.DARK]: darkTheme,
}

/**
 * 获取指定主题
 * @param {string} themeName - 主题名称 ('light' | 'dark')
 * @returns {Object} 主题对象
 */
export function getTheme(themeName) {
  return themeMap[themeName] || lightTheme
}

/**
 * 根据当前模式获取主题
 * @param {boolean} isDark - 是否为深色模式
 * @returns {Object} 主题对象
 */
export function getThemeByMode(isDark) {
  return isDark ? darkTheme : lightTheme
}

// 默认导出
export default { light: lightTheme, dark: darkTheme }

/**
 * 浅色主题 & 深色主题定义
 *
 * 删除了 10 个未使用的变量：
 *   primaryLight, primaryBg, btnBg, btnHoverBg, settingGradient,
 *   addNewHoverBg, groupOtherColor, menuBorder, cardShadow, border2
 *
 * 提取了 13 个两套主题值相同的共享常量到 shared 对象
 */

// === 两套主题共享 (不随明暗切换变化) ===
const shared = {
  primary: "rgb(25, 103, 210)",
  success: "#52c41a",
  warning: "#f8ad14",
  info: "#1890ff",

  channelBeta: "#73d13d",
  channelStable: "#40a9ff",
  channelDev: "#ffa940",
  channelLocal: "#ff4d4f",
  channelBgAlpha: "33",

  menuHoverBg: "#1e90ff",
  menuHoverText: "#fff",
  disableText: "#888",
}

export const lightTheme = {
  ...shared,
  isDark: false,

  // === 基础 ===
  bg: "#fff",
  fg: "#222",

  // === 文字层级 ===
  muted: "#888",
  subtle: "#ddd",

  // === 语义色 (仅 danger 两套不同) ===
  danger: "#ff4d4f",

  // === Hover ===
  hoverBgMedium: "rgba(0, 0, 0, 0.06)",
  hoverBgStrong: "rgba(0, 0, 0, 0.1)",

  // === 滚动条 ===
  scrollbarThumb: "#ccc",
  scrollbarThumbHover: "#999",

  // === 阴影 ===
  shadow: "rgba(0, 0, 0, 0.06)",

  // === 边框 ===
  border: "#eee",
  borderDivider: "rgba(0, 0, 0, 0.04)",

  // === 菜单 ===
  menuBg: "#fff",
  menuText: "#1f1f1f",
  menuDivider: "#d4d4d4",

  // === 其他 ===
  tooltipBg: "rgba(0, 0, 0, 0.75)",
  disabled: "rgba(0, 0, 0, 0.25)",




  // === 可排序列表项 (通过 CSS 变量传递) ===
  sortableItemBg: "#fff",
  sortableItemColor: "#222",
  sortableShadow:
    "0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05), 0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15)",

  // === 拖拽手柄 ===
  dragHandleHoverBg: "rgba(0, 0, 0, 0.05)",
  dragHandleFill: "#919eab",


  // === 选中状态 ===
  selectedBg: "rgb(25 103 210 / 20%)",
  selectedHoverBg: "#d2e3fc",
  selectedFg: "rgb(25, 103, 210)",
}

export const darkTheme = {
  ...shared,
  isDark: true,

  // === 基础 ===
  bg: "#1a1a1a",
  fg: "#C9CACF",

  // === 文字层级 ===
  muted: "#aaa",
  subtle: "#666",

  // === 语义色 (仅 danger 两套不同) ===
  danger: "#ff7875",

  // === Hover ===
  hoverBgMedium: "rgba(255, 255, 255, 0.08)",
  hoverBgStrong: "rgba(255, 255, 255, 0.1)",

  // === 滚动条 ===
  scrollbarThumb: "#555",
  scrollbarThumbHover: "#777",

  // === 阴影 ===
  shadow: "rgba(255, 255, 255, 0.05)",

  // === 边框 ===
  border: "#3a3a3a",
  borderDivider: "rgba(255, 255, 255, 0.04)",

  // === 菜单 ===
  menuBg: "#1a1a1a",
  menuText: "#e4e4e4",
  menuDivider: "#4a4a4a",

  // === 其他 ===
  tooltipBg: "rgba(255, 255, 255, 0.75)",
  disabled: "rgba(255, 255, 255, 0.3)",




  // === 可排序列表项 (通过 CSS 变量传递) ===
  sortableItemBg: "#444",
  sortableItemColor: "#C9CACF",
  sortableShadow:
    "0 0 0 calc(1px / var(--scale-x, 1)) rgba(200, 200, 200, 0.1), 0 1px calc(3px / var(--scale-x, 1)) 0 rgba(0, 0, 0, 0.3)",

  // === 拖拽手柄 ===
  dragHandleHoverBg: "rgba(255, 255, 255, 0.1)",
  dragHandleFill: "#666",

  // === 选中状态 ===
  selectedBg: "rgba(25, 103, 210, 0.5)",
  selectedHoverBg: "rgba(25, 103, 210, 0.25)",
  selectedFg: "#fff",
}

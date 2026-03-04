/**
 * 浅色主题 & 深色主题定义
 * 颜色值直接内联，无需单独常量文件
 */

export const lightTheme = {
  isDark: false,

  // === 基础 ===
  bg: "#fff",
  fg: "#222",

  // === 文字层级 ===
  muted: "#888",
  subtle: "#ddd",


  // === 主题色 ===
  primary: "rgb(25, 103, 210)",
  primaryLight: "#9cd2f6",
  primaryBg: "rgba(25, 103, 210, 0.1)",

  // === 语义色 ===
  success: "#52c41a",
  warning: "#f8ad14",
  info: "#1890ff",
  danger: "#ff4d4f",

  // === 频道标签 ===
  channelBeta: "#73d13d",
  channelStable: "#40a9ff",
  channelDev: "#ffa940",
  channelLocal: "#ff4d4f",
  channelBgAlpha: "33",

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
  border2: "#eee",
  border3: "#ccc",
  inputBorder: "#eee",
  borderFocus: "#66afe9cc",
  borderDivider: "rgba(0, 0, 0, 0.08)",

  // === 菜单 ===
  menuBg: "#fff",
  menuBorder: "#c4c4c4",
  menuText: "#1f1f1f",
  menuHoverBg: "#1e90ff",
  menuHoverText: "#fff",
  menuDivider: "#d4d4d4",

  // === 其他 ===
  tooltipBg: "rgba(0, 0, 0, 0.75)",
  disabled: "rgba(0, 0, 0, 0.25)",

  // === 导航 ===
  navHoverBg: "#eee",

  // === 设置项 ===
  settingBorderBottom: "#eee6",
  settingGradient: "linear-gradient(to bottom, #f5f5f5, #fff)",

  // === 分组 ===
  groupOtherBg: "#f5f5f5",
  groupOtherColor: "#888",

  // === 可排序列表项 ===
  sortableItemBg: "#fff",
  sortableItemColor: "#222",
  sortableShadow:
    "0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05), 0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15)",
  cardShadow: "1px 1px 4px 0px rgba(0, 0, 0, 0.1)",

  // === 拖拽手柄 ===
  dragHandleHoverBg: "rgba(0, 0, 0, 0.05)",
  dragHandleFill: "#919eab",

  // === 按钮 ===
  btnBg: "#f5f5f5",
  btnHoverBg: "#dfdfdf",

  // === 文字 ===
  enableText: "#222",
  disableText: "#888",

  // === 选中状态 ===
  selectedBg: "rgb(25 103 210 / 20%)",
  selectedHoverBg: "#d2e3fc",
  selectedFg: "rgb(25, 103, 210)",
  addNewHoverBg: "#f8fbff",
}

// 兼容 border2
Object.defineProperty(lightTheme, "border2", {
  get() { return this.border },
})

export const darkTheme = {
  isDark: true,

  // === 基础 ===
  bg: "#1a1a1a",
  fg: "#C9CACF",

  // === 文字层级 ===
  muted: "#aaa",
  subtle: "#666",


  // === 主题色 ===
  primary: "rgb(25, 103, 210)",
  primaryLight: "#9cd2f6",
  primaryBg: "rgba(25, 103, 210, 0.2)",

  // === 语义色 ===
  success: "#52c41a",
  warning: "#f8ad14",
  info: "#1890ff",
  danger: "#ff7875",

  // === 频道标签 ===
  channelBeta: "#73d13d",
  channelStable: "#40a9ff",
  channelDev: "#ffa940",
  channelLocal: "#ff4d4f",
  channelBgAlpha: "33",

  // === Hover ===
  hoverBgMedium: "rgba(255, 255, 255, 0.08)",
  hoverBgStrong: "rgba(255, 255, 255,  0.1)",

  // === 滚动条 ===
  scrollbarThumb: "#555",
  scrollbarThumbHover: "#777",

  // === 阴影 ===
  shadow: "rgba(255, 255, 255, 0.05)",

  // === 边框 ===
  border: "#3a3a3a",
  border2: "#3a3a3a",
  border3: "#3a3a3a",
  inputBorder: "#3a3a3a",
  borderFocus: "#66afe9cc",
  borderDivider: "rgba(255, 255, 255, 0.08)",

  // === 菜单 ===
  menuBg: "#1a1a1a",
  menuBorder: "#4a4a4a",
  menuText: "#e4e4e4",
  menuHoverBg: "#1e90ff",
  menuHoverText: "#fff",
  menuDivider: "#4a4a4a",

  // === 其他 ===
  tooltipBg: "rgba(255, 255, 255, 0.75)",
  disabled: "rgba(255, 255, 255, 0.3)",

  // === 导航 ===
  navHoverBg: "#333",

  // === 设置项 ===
  settingBorderBottom: "#3a3a3a",
  settingGradient: "linear-gradient(to bottom, #444, #1a1a1a)",

  // === 分组 ===
  groupOtherBg: "#444",
  groupOtherColor: "#ccc",

  // === 可排序列表项 ===
  sortableItemBg: "#444",
  sortableItemColor: "#C9CACF",
  sortableShadow:
    "0 0 0 calc(1px / var(--scale-x, 1)) rgba(200, 200, 200, 0.1), 0 1px calc(3px / var(--scale-x, 1)) 0 rgba(0, 0, 0, 0.3)",
  cardShadow: "1px 1px 4px 0px rgba(0, 0, 0, 0.5)",

  // === 拖拽手柄 ===
  dragHandleHoverBg: "rgba(255, 255, 255, 0.1)",
  dragHandleFill: "#666",

  // === 按钮 ===
  btnBg: "#313131",
  btnHoverBg: "#474747",

  // === 文字 ===
  enableText: "#e4e4e4",
  disableText: "#888",

  // === 选中状态 ===
  selectedBg: "rgba(25, 103, 210, 0.5)",
  selectedHoverBg: "rgba(25, 103, 210, 0.25)",
  selectedFg: "#fff",
  addNewHoverBg: "rgba(25, 103, 210, 0.2)",
}

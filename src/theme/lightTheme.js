/**
 * 浅色主题定义 - 简化版
 */
import {
  PRIMARY,
  PRIMARY_LIGHT,
  PRIMARY_BG,
  PRIMARY_BG_SELECTED,
  SUCCESS,
  WARNING,
  INFO,
  DANGER,
  CHANNEL_BETA,
  CHANNEL_STABLE,
  CHANNEL_DEV,
  CHANNEL_LOCAL,
  CHANNEL_ALPHA,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  TEXT_DISABLED,
  TEXT_SUBTLE,
  BG_LIGHT,
  BG_SECONDARY_LIGHT,
  BORDER_LIGHT,
  BORDER_FOCUS,
  HOVER_BG,
  HOVER_BG_STRONG,
  SCROLLBAR_LIGHT,
  SCROLLBAR_HOVER_LIGHT,
  SHADOW,
  SHADOW_LARGE,
  SHADOW_TOOLTIP,
  MENU_BG_LIGHT,
  MENU_BORDER_LIGHT,
  MENU_TEXT_LIGHT,
  MENU_HOVER_BG,
  MENU_HOVER_TEXT,
  MENU_DIVIDER_LIGHT,
  TOOLTIP_BG,
  DIVIDER,
  DISABLED,
  DRAG_HANDLE_HOVER_BG,
  DRAG_HANDLE_FILL,
  BTN_BG_LIGHT,
  BTN_HOVER_BG_LIGHT,
  NAV_HOVER_BG_LIGHT,
} from "./colors"

const lightTheme = {
  isDark: false,

  // === 基础 ===
  bg: BG_LIGHT,
  fg: TEXT_PRIMARY,

  // === 文字层级 ===
  muted: TEXT_MUTED,
  disabled: TEXT_DISABLED,
  subtle: TEXT_SUBTLE,

  // === 兼容旧代码（待删除）===
  fg2: TEXT_MUTED,
  fg3: TEXT_MUTED,
  fg4: TEXT_MUTED,
  fg5: TEXT_DISABLED,
  fg6: TEXT_SUBTLE,

  // === 主题色 ===
  primary: PRIMARY,
  primaryLight: PRIMARY_LIGHT,
  primaryBg: PRIMARY_BG,

  // === 语义色 ===
  success: SUCCESS,
  warning: WARNING,
  info: INFO,
  danger: DANGER,

  // === 频道标签 ===
  channelBeta: CHANNEL_BETA,
  channelStable: CHANNEL_STABLE,
  channelDev: CHANNEL_DEV,
  channelLocal: CHANNEL_LOCAL,
  channelBgAlpha: CHANNEL_ALPHA,

  // === Hover ===
  hoverBg: HOVER_BG,
  hoverBgMedium: HOVER_BG, // 兼容旧代码
  hoverBgStrong: HOVER_BG_STRONG,

  // === 滚动条 ===
  scrollbarThumb: SCROLLBAR_LIGHT,
  scrollbarThumbHover: SCROLLBAR_HOVER_LIGHT,

  // === 阴影 ===
  shadow: SHADOW,
  shadowLarge: SHADOW_LARGE,
  shadowTooltip: SHADOW_TOOLTIP,

  // === 边框 ===
  border: BORDER_LIGHT,
  border2: BORDER_LIGHT, // 兼容旧代码
  border3: "#ccc",          // 兼容旧代码
  inputBorder: BORDER_LIGHT,
  borderFocus: BORDER_FOCUS,
  borderDivider: DIVIDER,

  // === 菜单 ===
  menuBg: MENU_BG_LIGHT,
  menuBorder: MENU_BORDER_LIGHT,
  menuText: MENU_TEXT_LIGHT,
  menuHoverBg: MENU_HOVER_BG,
  menuHoverText: MENU_HOVER_TEXT,
  menuDivider: MENU_DIVIDER_LIGHT,

  // === 其他 ===
  tooltipBg: TOOLTIP_BG,
  disabled: DISABLED,

  // === 导航 ===
  navHoverBg: NAV_HOVER_BG_LIGHT,

  // === 设置项 ===
  settingBorderBottom: "#eee6",
  settingGradient: `linear-gradient(to bottom, ${BG_SECONDARY_LIGHT}, ${BG_LIGHT})`,

  // === 分组 ===
  groupOtherBg: BG_SECONDARY_LIGHT,
  groupOtherColor: TEXT_SECONDARY,

  // === 可排序列表项 ===
  sortableItemBg: BG_LIGHT,
  sortableItemColor: TEXT_PRIMARY,
  sortableShadow:
    "0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05), 0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15)",
  cardShadow: `1px 1px 4px 0px rgba(0, 0, 0, 0.1)`,

  // === 拖拽手柄 ===
  dragHandleHoverBg: DRAG_HANDLE_HOVER_BG,
  dragHandleFill: DRAG_HANDLE_FILL,

  // === 按钮 ===
  btnBg: BTN_BG_LIGHT,
  btnHoverBg: BTN_HOVER_BG_LIGHT,

  // === 文字 ===
  enableText: TEXT_PRIMARY,
  disableText: TEXT_SECONDARY,

  // === 选中状态 ===
  selectedBg: PRIMARY_BG_SELECTED,
  selectedHoverBg: "#d2e3fc",
  selectedFg: PRIMARY,
  addNewHoverBg: "#f8fbff",
}

// 兼容 border2
Object.defineProperty(lightTheme, "border2", {
  get() { return this.border }
})

export default lightTheme

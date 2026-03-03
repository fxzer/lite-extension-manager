/**
 * 深色主题定义 - 简化版
 */
import {
  PRIMARY,
  PRIMARY_LIGHT,
  PRIMARY_BG_DARK,
  PRIMARY_BG_HOVER,
  PRIMARY_BG_SELECTED_DARK,
  SUCCESS,
  WARNING,
  INFO,
  DANGER_DARK,
  CHANNEL_BETA,
  CHANNEL_STABLE,
  CHANNEL_DEV,
  CHANNEL_LOCAL,
  CHANNEL_BG_ALPHA,
  TEXT_PRIMARY_DARK,
  TEXT_MUTED_DARK,
  TEXT_DISABLED_DARK,
  TEXT_SUBTLE_DARK,
  BG_DARK,
  BG_SECONDARY_DARK,
  BORDER_DARK,
  BORDER_FOCUS,
  DIVIDER_DARK,
  HOVER_BG_DARK,
  HOVER_BG_STRONG,
  SCROLLBAR_DARK,
  SCROLLBAR_HOVER_DARK,
  SHADOW_DARK,
  SHADOW_LARGE,
  SHADOW_TOOLTIP,
  MENU_BG_DARK,
  MENU_BORDER_DARK,
  MENU_TEXT_DARK,
  MENU_HOVER_BG,
  MENU_HOVER_TEXT,
  MENU_DIVIDER_DARK,
  TOOLTIP_BG,
  DISABLED_DARK,
  DRAG_HANDLE_HOVER_BG_DARK,
  DRAG_HANDLE_FILL_DARK,
  BTN_BG_DARK,
  BTN_HOVER_BG_DARK,
  WHITE,
  NAV_HOVER_BG_DARK,
  DARK_GRAY_100,
  DARK_GRAY_200,
  DARK_GRAY_400,
} from "./colors"

const darkTheme = {
  isDark: true,

  // === 基础 ===
  bg: BG_DARK,
  fg: TEXT_PRIMARY_DARK,

  // === 文字层级 ===
  muted: TEXT_MUTED_DARK,
  disabled: TEXT_DISABLED_DARK,
  subtle: TEXT_SUBTLE_DARK,

  // === 兼容旧代码（待删除）===
  fg2: TEXT_MUTED_DARK,
  fg3: TEXT_MUTED_DARK,
  fg4: TEXT_MUTED_DARK,
  fg5: TEXT_DISABLED_DARK,
  fg6: TEXT_SUBTLE_DARK,

  // === 主题色 ===
  primary: PRIMARY,
  primaryLight: PRIMARY_LIGHT,
  primaryBg: PRIMARY_BG_DARK,

  // === 语义色 ===
  success: SUCCESS,
  warning: WARNING,
  info: INFO,
  danger: DANGER_DARK,

  // === 频道标签 ===
  channelBeta: CHANNEL_BETA,
  channelStable: CHANNEL_STABLE,
  channelDev: CHANNEL_DEV,
  channelLocal: CHANNEL_LOCAL,
  channelBgAlpha: CHANNEL_BG_ALPHA,

  // === Hover ===
  hoverBg: HOVER_BG_DARK,
  hoverBgMedium: HOVER_BG_DARK,   // 兼容旧代码
  hoverBgStrong: HOVER_BG_STRONG,

  // === 滚动条 ===
  scrollbarThumb: SCROLLBAR_DARK,
  scrollbarThumbHover: SCROLLBAR_HOVER_DARK,

  // === 阴影 ===
  shadow: SHADOW_DARK,
  shadowLarge: SHADOW_LARGE,
  shadowTooltip: SHADOW_TOOLTIP,

  // === 边框 ===
  border: BORDER_DARK,
  border2: BORDER_DARK,    // 兼容旧代码
  border3: BORDER_DARK,    // 兼容旧代码
  inputBorder: BORDER_DARK,
  borderFocus: BORDER_FOCUS,
  borderDivider: DIVIDER_DARK,

  // === 菜单 ===
  menuBg: MENU_BG_DARK,
  menuBorder: MENU_BORDER_DARK,
  menuText: MENU_TEXT_DARK,
  menuHoverBg: MENU_HOVER_BG,
  menuHoverText: MENU_HOVER_TEXT,
  menuDivider: MENU_DIVIDER_DARK,

  // === 其他 ===
  tooltipBg: TOOLTIP_BG,
  disabled: DISABLED_DARK,

  // === 导航 ===
  navHoverBg: NAV_HOVER_BG_DARK,

  // === 设置项 ===
  settingBorderBottom: BORDER_DARK,
  settingGradient: `linear-gradient(to bottom, ${BG_SECONDARY_DARK}, ${BG_DARK})`,

  // === 分组 ===
  groupOtherBg: BG_SECONDARY_DARK,
  groupOtherColor: DARK_GRAY_200,

  // === 可排序列表项 ===
  sortableItemBg: BG_SECONDARY_DARK,
  sortableItemColor: TEXT_PRIMARY_DARK,
  sortableShadow:
    "0 0 0 calc(1px / var(--scale-x, 1)) rgba(200, 200, 200, 0.1), 0 1px calc(3px / var(--scale-x, 1)) 0 rgba(0, 0, 0, 0.3)",
  cardShadow: `1px 1px 4px 0px rgba(0, 0, 0, 0.5)`,

  // === 拖拽手柄 ===
  dragHandleHoverBg: DRAG_HANDLE_HOVER_BG_DARK,
  dragHandleFill: DRAG_HANDLE_FILL_DARK,

  // === 按钮 ===
  btnBg: BTN_BG_DARK,
  btnHoverBg: BTN_HOVER_BG_DARK,

  // === 文字 ===
  enableText: DARK_GRAY_100,
  disableText: DARK_GRAY_400,

  // === 选中状态 ===
  selectedBg: PRIMARY_BG_SELECTED_DARK,
  selectedHoverBg: PRIMARY_BG_HOVER,
  selectedFg: WHITE,
  addNewHoverBg: PRIMARY_BG_DARK,
}

export default darkTheme

import { styled } from "styled-components"

export const ExtensionGridItemStyle = styled.div`
  position: relative;

  img {
    width: 42px;
    height: 42px;
    user-select: none;
  }

  .grid-display-item {
    position: relative;
    transition: transform 0.3s ease;
    cursor: pointer;
  }

  .grid-display-item-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .grid-display-item-title {
    max-width: 66px;
    margin-top: 4px;
    color: ${(props) => props.theme.enableText};

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    user-select: none;
  }

  .grid-name-tooltip {
    display: none;
    position: fixed;
    z-index: 99999;

    max-width: 300px;
    padding: 4px 8px;

    font-size: 12px;
    line-height: 1.4;
    color: ${(props) => props.theme.bg};
    background-color: ${(props) => props.theme.tooltipBg};
    border-radius: 4px;
    white-space: normal;
    word-break: break-word;
    pointer-events: none;
    user-select: none;

  }

  .grid-name-tooltip-show {
    display: block;
  }

  .tooltip-arrow {
    position: absolute;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    transform: translateX(-50%);
  }

  .tooltip-arrow-top {
    top: -4px;
    border-bottom: 4px solid ${(props) => props.theme.tooltipBg};
  }

  .tooltip-arrow-bottom {
    bottom: -4px;
    border-top: 4px solid ${(props) => props.theme.tooltipBg};
  }

  .grid-display-item-title-gray {
    color: ${(props) => props.theme.disableText};
  }

  .operation-menu {
    display: none;
    position: absolute;
    width: 72px;
    min-height: 60px;
    padding: 4px 0;

    z-index: 100000;

    border-radius: 6px;
    background-color: ${(props) => props.theme.menuBg};
    border: 1px solid ${(props) => props.theme.borderDivider};

    box-shadow: 0 4px 12px ${(props) => props.theme.shadow};
  }

  /* 扩展禁用时，hover 菜单的样式 */
  .operation-menu-disable {
    filter: grayscale(70%);
  }

  .operation-menu-items {
    display: flex;
    flex-direction: column;
    gap: 0px;
  }

  .menu-on {
    display: block;
  }

  @keyframes menu-right-in {
    0% {
      opacity: 0;
      transform: translateX(-5%);
    }

    100% {
      opacity: 1;
      transform: translateX(0%);
    }
  }

  @keyframes menu-left-in {
    0% {
      opacity: 0;
      transform: translateX(5%);
    }

    100% {
      opacity: 1;
      transform: translateX(0%);
    }
  }

  .menu-right {
    opacity: 0;
    top: -10px;
    left: 58px;

    animation: menu-right-in 0.2s ease-out ${(props) => props.animation_delay}s forwards;
  }

  .menu-left {
    opacity: 0;
    top: -10px;
    right: 58px;

    animation: menu-left-in 0.2s ease-out ${(props) => props.animation_delay}s forwards;
  }

  .operation-menu-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 8px;

    font-size: 12px;
    color: ${(props) => props.theme.menuText};
    cursor: pointer;
    transition: background-color 0.15s;

    &:hover {
      background-color: ${(props) => props.theme.menuHoverBg};
      color: ${(props) => props.theme.menuHoverText};
    }

    & span {
      white-space: nowrap;
      color: inherit;
    }

    & .anticon {
      font-size: 13px;
      flex-shrink: 0;
      color: inherit;
    }
  }

  /* 分割线 */
  .operation-menu-divider {
    height: 1px;
    margin: 2px 6px;
    background-color: ${(props) => props.theme.menuDivider};
  }

  /* 危险操作样式 */
  .operation-menu-item-danger {
    color: ${(props) => props.theme.danger};

    &:hover {
      background-color: ${(props) => props.theme.danger};
      color: ${(props) => props.theme.bg};
    }

    & .anticon {
      color: inherit;
    }

    & span {
      color: inherit;
    }
  }

  .operation-menu-item-disabled {
    color: ${(props) => props.theme.disabled} !important;
    cursor: not-allowed;
    opacity: 0.7;

    &:hover {
      background-color: transparent;
    }

    & .anticon {
      color: ${(props) => props.theme.disabled} !important;
    }

    & span {
      color: ${(props) => props.theme.disabled} !important;
    }
  }

  .grid-item-disable {
    filter: grayscale(100%) opacity(50%);

    &:hover {
      filter: none;
    }
  }
`

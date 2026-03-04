import { createGlobalStyle, styled } from "styled-components"

const Style = styled.div`
  display: flex;
  align-items: center;

  height: 42px;
  padding: 0px 5px;
  margin-bottom: 2px;

  box-shadow: 0px 0px 3px 1px ${(props) => props.theme.shadow};

  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.fg};

  .left,
  .right {
    display: flex;
    align-items: center;
  }

  .left {
    flex-grow: 1;

    img {
      margin-left: 8px;
      margin-right: 12px;
      width: 24px;
      height: 24px;
    }
  }

  .right .ant-space {
    &:hover {
      color: ${(props) => props.theme.primary};
      cursor: pointer;
    }
  }

  .right .dropdown {
    margin: 0 4px;
  }

  .right .search {
    margin: 0 4px;
  }

  .right .layout {
    margin: 0 4px;
  }

  .right .theme {
    margin: 0 4px;
  }

  .right .setting {
    margin: -2px 4px 0 4px;
  }

  .right .more-operation {
    margin: -2px 4px 0 4px;
  }

  .setting-icon {
    font-size: 20px;
    &:hover {
      color: ${(props) => props.theme.primary};
      cursor: pointer;
    }
  }

  .menu-item-text {
    display: inline-block;
    max-width: 80px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`

const SearchStyle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px 10px 10px;

  .search-input-wrapper {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  input {
    width: 100%;
    height: 32px;
    padding: 0 12px;
    padding-right: 32px;
    box-sizing: border-box;

    outline-style: none;
    border: 1px solid ${(props) => props.theme.inputBorder};
    border-radius: 4px;

    &:focus {
      border-color: ${(props) => props.theme.borderFocus};
      outline: 0;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 2px rgba(102, 175, 233, 0.6);
    }

    background-color: ${(props) => props.theme.bg};
    color: ${(props) => props.theme.fg};
  }

  .clear-icon {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: ${(props) => props.theme.disabled};
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: ${(props) => props.theme.muted};
    }
  }
`

export const ZoomDropdownGlobalStyle = createGlobalStyle`
  .ant-message {
    top: auto !important;
    bottom: 8px;
  }

  .more-op-dropdown-overlay {
    .ant-dropdown-menu-submenu-title {
      font-size: 14px;
    }

    .zoom-control-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2px 0;
      cursor: default;
      user-select: none;

      .zoom-label {
        font-size: 13px;
        color: inherit;
      }

      .zoom-stepper {
        display: flex;
        align-items: center;
        gap: 4px;

        .zoom-btn {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: background-color 0.15s;

          &:hover {
            background-color: ${(props) => props.theme.hoverBgMedium};
          }

          &.zoom-btn-disabled {
            opacity: 0.3;
            cursor: not-allowed;
            &:hover {
              background-color: transparent;
            }
          }
        }

        .zoom-value {
          min-width: 36px;
          text-align: center;
          font-size: 12px;
          font-variant-numeric: tabular-nums;
        }
      }
    }
  }
`

export default Style
export { SearchStyle }

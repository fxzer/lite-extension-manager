import styled from "styled-components"

export const ModeContentStyle = styled.div`
  overflow-x: hidden;
  width: 100%;

  & > * {
    max-width: 100%;
  }

  .search-sort-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .search {
    max-width: 400px;
    flex: 1;
  }

  .shortcut-display {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    width: 150px;
    border: 1px solid ${(props) => props.theme.border};
    border-radius: 6px;
    background-color: transparent;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
    flex-shrink: 0;
    user-select: none;

    &:hover {
      border-color: ${(props) => props.theme.primary};
    }

    &:focus {
      outline: none;
      border-color: ${(props) => props.theme.primary};
      box-shadow: 0 0 0 2px ${(props) => props.theme.primary}33;
    }

    &.recording {
      border-color: ${(props) => props.theme.primary};
      box-shadow: 0 0 0 2px ${(props) => props.theme.primary}33;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 2px ${(props) => props.theme.primary}33;
      }
      50% {
        box-shadow: 0 0 0 3px ${(props) => props.theme.primary}22;
      }
    }

    .shortcut-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;

      path {
        fill: ${(props) => props.theme.subtle};
      }
    }

    .shortcut-text {
      font-family: monospace;
      font-size: 13px;
      color: ${(props) => props.theme.fg};
      min-width: 60px;
    }

    .shortcut-clear {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      font-size: 14px;
      line-height: 1;
      color: ${(props) => props.theme.subtle};
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: ${(props) => props.theme.danger};
      }
    }
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    margin-bottom: 12px;
    margin-top: 5px;

    border: 1px solid ${(props) => props.theme.border};
    border-radius: 4px;

    span {
      flex: 1 1 auto;
      font-size: 14px;
      color: ${(props) => props.theme.fg};
    }
  }

  .desc {
    margin: 20px 36px 0 10px;
    padding-left: 5px;

    color: ${(props) => props.theme.subtle};
    font-size: 14px;
    line-height: 20px;

    border-left: 2px solid ${(props) => props.theme.border};
  }

  .other-mode-info-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: -16px 0 0 0;
  }

  .other-mode-info-name {
    margin: 1px 0;
    padding: 2px 4px;
    color: ${(props) => props.theme.muted};
    border-radius: 2px;
    background-color: ${(props) => props.theme.hoverBgMedium};
  }

  .mode-name-title {
    font-size: 18px;
    font-weight: 700;

    margin-bottom: 10px;
    padding-bottom: 5px;

    color: ${(props) => props.theme.fg};
    border-bottom: 1px solid ${(props) => props.theme.border};
  }
}
`

import styled from "styled-components"

export const SnapshotNavStyle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;

  /* 拖拽容器样式 - 带滚动 */
  & > div:first-child {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;

    /* 隐藏滚动条但保持滚动功能 */
    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: ${(props) => props.theme.hoverBgStrong};
      border-radius: 2px;

      &:hover {
        background: ${(props) =>
    props.theme.isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"};
      }
    }
  }

  .empty-state {
    padding: 20px;
    text-align: center;
    color: ${(props) => props.theme.subtle};
    font-size: 14px;
  }

  .item-container {
    flex-shrink: 0;
    position: relative;
    cursor: pointer !important;
  }

  .tab-container {
    position: relative;
    display: flex;
    align-items: center;

    min-height: 36px;
    max-width: 200px;
    padding: 0 14px;

    border-radius: 6px;
    background-color: ${(props) => props.theme.hoverBgMedium};
    transition: all 0.2s ease;

    user-select: none;
    cursor: pointer;

    &:hover {
      background-color: ${(props) => props.theme.hoverBgStrong};

      .delete-confirm {
        opacity: 1;
      }
    }

    h3 {
      font-size: 14px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
      color: inherit;
      line-height: normal;
      flex: 1;
      min-width: 0;
    }

    /* 可编辑的名称样式 */
    .editable-name {
      cursor: pointer;
    }

    /* 编辑输入框 */
    .edit-input {
      width: auto;
      min-width: 40px;
      max-width: 120px;
      border: none;
      background: transparent;
      font-size: 14px;
      font-weight: 500;
      color: inherit;
      outline: none;
      padding: 0;
      margin: 0;
      font-family: inherit;
      flex-shrink: 0;
    }
  }

  /* 删除确认按钮 - 绝对定位在右上角 */
  .delete-confirm {
    position: absolute;
    top: 50%;
    right: -8px;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: pointer;
    z-index: 10;

    .delete-icon {
      font-size: 12px;
      color: ${(props) => props.theme.danger};
      transition: background-color 0.2s ease;
      border-radius: 2px;
      padding: 2px;
      display: block;
    }
  }

  .selected-snapshot-item {
    background-color: ${(props) => props.theme.selectedBg};
    &:hover {
      background-color: ${(props) => props.theme.selectedHoverBg};
    }

    h3 {
      color: ${(props) => props.theme.selectedFg};
    }
  }
`

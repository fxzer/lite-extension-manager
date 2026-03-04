import { styled } from "styled-components"

export const ExtensionManageStyle = styled.div`
  .extension-manage-tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .extension-manage-tools-left {
    display: flex;
    align-items: baseline;

    .search {
      width: 400px;
      margin-right: 10px;
    }

    .settings-checkbox {
      margin: 0 0 0 10px;
    }
  }

  .extension-manage-tools-right {
    display: flex;
    align-items: baseline;

    margin-right: 24px;

    & > a {
      margin-right: 12px;
    }
  }

  .ant-table-wrapper {
    margin-right: 5px;
    border: 1px solid ${(props) => props.theme.border};
    border-radius: 6px;
  }

  .column-index {
    display: inline-block;
    width: 100%;
    text-align: left;
  }

  .ant-table-expanded-row .ant-table-cell {
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .ant-form-item {
    margin-bottom: 8px;
  }

  .column-hidden {
    display: none;
  }

  /* 控制文本换行最多不超过2行 */
  .text-wrap-max-two-line {
    min-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`

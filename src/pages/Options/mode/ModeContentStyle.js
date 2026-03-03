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
    gap: 12px;
    margin-bottom: 10px;
  }

  .search {
    width: 300px;
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
    color: ${(props) => props.theme.group_other_color};
    border-radius: 2px;
    background-color: ${(props) => props.theme.group_other_bg};
  }

  .mode-name-title {
    font-size: 18px;
    font-weight: 700;

    margin-bottom: 10px;
    padding-bottom: 5px;

    color: ${(props) => props.theme.fg};
    border-bottom: 1px solid ${(props) => props.theme.border};
  }
`

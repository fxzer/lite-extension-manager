import styled from "styled-components"

export const NavigationStyle = styled.div`
  width: 120px;
  /* 确保导航栏不会出现滚动条，避免影响布局 */
  flex-shrink: 0;
  overflow: visible;

  a {
    text-decoration: none;
    color: ${(props) => props.theme.primary};
    cursor: pointer;
  }

  h1 {
    color: ${(props) => props.theme.fg};
    margin-bottom: 30px;
    font-size: 24px;
    &:hover {
      color: ${(props) => props.theme.primary};
      text-decoration: underline;
    }
  }

  .nav-item {
    display: flex;
    justify-content: center;
    height: 36px;
    margin-bottom: 6px;
    font-size: 14px;
    line-height: 36px;
    color: ${(props) => props.theme.fg};
    border-radius: 18px;
    text-align: center;

    &:hover {
      background-color: ${(props) => props.theme.hoverBgMedium};
    }

    &.active {
      background-color: ${(props) => props.theme.selectedBg};
      color: ${(props) => props.theme.selectedFg};
    }

    & > .anticon {
      position: relative;
      top: 1px;
    }

    & > .text {
      margin-left: 6px;
    }
  }
`

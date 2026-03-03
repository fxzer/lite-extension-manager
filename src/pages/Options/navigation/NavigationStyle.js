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
    display: block;
    height: 36px;

    margin-bottom: 6px;
    padding-left: 10px;

    font-size: 14px;
    line-height: 36px;
    color: ${(props) => props.theme.fg};

    border-radius: 4px;

    &:hover {
      background-color: ${(props) => props.theme.navHoverBg};
    }

    &.active {
      background-color: ${(props) => props.theme.primary};
      color: ${(props) => props.theme.bg};
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

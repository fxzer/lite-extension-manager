import styled from "styled-components"

export const ModeStyle = styled.div`
  position: relative;
  height: 100%;

  .mode-edit-box {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .left-box {
    flex-shrink: 0;
    margin-bottom: 10px;
  }

  .right-box {
    flex-grow: 1;
    min-height: 0;
  }

  .view-hidden {
    display: none;
  }

  .scene-edit-panel {
    position: absolute;
    margin-top: 60px;
    top: 0px;
    left: 0px;
    right: 0px;
    height: calc(100% - 60px);
  }

  .mode-not-include-filter {
    display: flex;
    align-items: center;

    margin: 0 20px 0 0;
    padding: 5px 0 5px 5px;

    border-radius: 4px;
    border: 1px solid ${(props) => props.theme.border};

    & > * {
      margin-right: 16px;
    }
  }
`

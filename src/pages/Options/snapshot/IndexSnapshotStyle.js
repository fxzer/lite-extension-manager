import styled from "styled-components"

export const SnapshotStyle = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .snapshot-container {
    margin-bottom: 20px;
  }

  .restore-action-bar {
    display: flex;
    justify-content: center;
    padding: 16px 0;
    margin-bottom: 16px;
    border-top: 1px solid ${(props) => props.theme.border};
    border-bottom: 1px solid ${(props) => props.theme.border};
  }
`

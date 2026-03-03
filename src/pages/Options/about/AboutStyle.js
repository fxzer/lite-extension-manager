import styled from "styled-components"

export const AboutStyle = styled.div`
  .header-icon {
    display: flex;
    align-items: center;

    margin-top: 30px;
    margin-bottom: 30px;

    img {
      width: 64px;
      height: 64px;
    }

    .header-icon-text {
      margin-left: 20px;
      h3 {
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 12px;
        color: ${(props) => props.theme.fg};
      }
      span {
        font-size: 14px;
      }
    }
  }

  .content-button {
    & > * {
      margin-right: 10px;
    }
  }

    .version {
      font-size: 18px;
      margin : 20px 0;
    }
  .footer {
    display: flex;
    flex-direction: column;

    margin-top: 50px;


    .version-update {
      width: 500px;
      margin-bottom: 12px;
    }

    .ant-tag-has-color {
      padding: 0px 5px 1px 5px;
    }

    .badges-tag {
      &:hover {
        cursor: pointer;
      }
    }
  }

  .footer-storage {
    display: inline-flex;
    align-items: center;

    padding-top: 5px;
    border-top: 1px solid ${(props) => props.theme.border};

    .storage-detail-tip-icon {
      margin-left: 5px;
      &:hover {
        color: ${(props) => props.theme.subtle};
      }
    }
  }
`

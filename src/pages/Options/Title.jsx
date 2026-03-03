import React from "react"

import styled from "styled-components"

const TitleStyle = styled.div`
  color: ${(props) => props.theme.fg};

  h1 {
    font-size: 30px;
    line-height: 60px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title-extra {
    font-size: 14px;
    font-weight: normal;
    margin-left: 8px;
  }

  .box {
    border-bottom: 1px solid ${(props) => props.theme.border};
    margin-bottom: 10px;
  }
`

function Title({ title, extra }) {
  return (
    <TitleStyle>
      <div className="box">
        <h1>
          {title}
          {extra && <span className="title-extra">{extra}</span>}
        </h1>
      </div>
    </TitleStyle>
  )
}

export default Title

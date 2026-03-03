import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react"

import { Button, Checkbox, Radio, Steps } from "antd"
import styled from "styled-components"

import { getLang } from ".../utils/utils"

const ShareContent = ({ config }, ref) => {
  const [exportRange, setExportRange] = useState([])

  useImperativeHandle(ref, () => ({
    getContent: () => {
      return exportRange
    }
  }))

  useEffect(() => {
    if (!config) {
      return
    }
    setExportRange(config.exportRange)
  }, [config])

  return (
    <Style>
      <Checkbox checked disabled>
        {getLang("management_export_extension_base_info")}
      </Checkbox>
    </Style>
  )
}

export default memo(forwardRef(ShareContent))

const Style = styled.div`
  display: flex;
  flex-direction: column;

  & > label {
    margin-bottom: 12px;
  }
`

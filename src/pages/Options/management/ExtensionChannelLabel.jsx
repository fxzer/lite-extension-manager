import React, { memo } from "react"

import classNames from "classnames"
import styled from "styled-components"

import { isEdgeRuntime } from ".../utils/channelHelper"

/**
 * 标记扩展的来源渠道
 */
const ExtensionChannelLabel = memo(({ channel }) => {
  if (!channel) {
    return null
  }

  if (!isEdgeRuntime() && channel === "Chrome") {
    return null
  }

  let text = channel
  if (channel === "Development") {
    text = "Dev"
  }

  return (
    <Style>
      <span className={classNames(["column-name-channel", `column-name-channel-${channel}`])}>
        {text}
      </span>
    </Style>
  )
})

export default ExtensionChannelLabel

const Style = styled.span`
  .column-name-channel {
    position: relative;
    left: 8px;

    padding: 1px 5px;
    font-size: 12px;
    border-radius: 5px;
    background-color: ${(props) => props.theme.channelBeta + props.theme.channelBgAlpha};
  }

  .column-name-channel-Edge {
    background-color: ${(props) => props.theme.channelStable + props.theme.channelBgAlpha};
  }

  .column-name-channel-Chrome {
    background-color: ${(props) => props.theme.channelDev + props.theme.channelBgAlpha};
  }

  .column-name-channel-Development {
    background-color: ${(props) => props.theme.channelLocal + props.theme.channelBgAlpha};
  }
`

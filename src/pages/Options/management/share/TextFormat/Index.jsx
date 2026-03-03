import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { Input } from "antd"
import LZString from "lz-string"
import styled from "styled-components"

import { getLang } from ".../utils/utils"

const { TextArea } = Input

const Index = ({ extensions, options, exportRange, targetExtensionIds }, ref) => {
  const [value, setValue] = useState("")

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!extensions || extensions.length === 0) {
        return ""
      }
      return value
    }
  }))

  useEffect(() => {
    const result = buildShareContent(extensions, exportRange, targetExtensionIds)
    setValue(result)
  }, [extensions, exportRange, targetExtensionIds])

  return (
    <Style>
      <TextArea className="share-textarea" value={value} rows={12} readOnly></TextArea>
    </Style>
  )
}

export default memo(forwardRef(Index))

const Style = styled.div`
  .share-textarea {
    margin: 12px 0;
    overflow-x: hidden;
  }
`

function buildShareContent(extensions, exportRange, targetExtensionIds) {
  const [content, length] = build(extensions, exportRange, targetExtensionIds)

  const title = getLang("management_export_share_text_title", length)

  // 当没有扩展时，content 为空，BEGIN 和 END 之间应该完全为空
  if (!content) {
    return `${title}\n\n--------BEGIN--------\n--------END--------\n\nPower by https://github.com/fxzer/lite-extension-manager.git\n`
  }

  return `${title}\n\n--------BEGIN--------\n${content}\n--------END--------\n\nPower by https://github.com/fxzer/lite-extension-manager.git\n`
}

function build(extensions, exportRange, targetExtensionIds) {
  const target = extensions
    .filter((ext) => targetExtensionIds.includes(ext.id))
    .map((ext) => {
      const r = {
        id: ext.id,
        name: ext.name,
        channel: ext.channel
      }
      return r
    })

  // 如果没有扩展，返回空内容
  if (target.length === 0) {
    return ["", 0]
  }

  const content = target.map((ext) => {
    let str = `##<#${ext.id}#><#${ext.name}#><#${ext.channel}#>`
    return str
  })

  return [LZString.compressToBase64(content.join("")), target.length]
}

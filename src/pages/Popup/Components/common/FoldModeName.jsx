import React, { memo, useEffect, useState } from "react"

import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons"
import { Space } from "antd"
import localforage from "localforage"
import styled from "styled-components"

const modeExpandForage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "LocalOptions",
  version: 1.0,
  storeName: "popupModeExpand"
})

/**
 * Popup 中，按模式显示时，可触发折叠功能的模式名称显示
 */
const FoldModeName = memo(({ mode, onFoldChanged }) => {
  // 是否折叠模式显示
  const [fold, setFold] = useState(false)

  useEffect(() => {
    modeExpandForage.getItem(mode.id).then((value) => {
      setFold(value ? true : false)
    })
  }, [mode])

  useEffect(() => {
    onFoldChanged?.(fold)
  }, [fold, onFoldChanged])

  const onFoldClick = () => {
    const newValue = !fold
    setFold(newValue)
    if (newValue) {
      modeExpandForage.setItem(mode.id, newValue)
    } else {
      modeExpandForage.removeItem(mode.id)
    }
  }

  return (
    <Style>
      <span className="fold-text" onClick={onFoldClick}>
        <Space className="fold-icon">{fold ? <CaretRightOutlined /> : <CaretDownOutlined />}</Space>{" "}
        {mode.name}
      </span>
    </Style>
  )
})

export default FoldModeName

const Style = styled.span`
  .fold-text {
    display: flex;
    align-items: center;
  }

  .fold-icon {
    margin-right: 4px;
    color: #888;
    font-size: 10px;
  }
`

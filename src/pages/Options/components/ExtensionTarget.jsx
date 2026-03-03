import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { Divider, Empty, Input } from "antd"
import { styled } from "styled-components"

import isMatch from ".../utils/searchHelper"
import ExtensionItems from "./ExtensionItems"

const { Search } = Input

const ExtensionTarget = ({ options, config, extensions, searchText, params, children }, ref) => {
  let emptyMessage = params.emptyMessage
  if (!emptyMessage) {
    emptyMessage = "Not set any target"
  }

  useImperativeHandle(ref, () => ({
    // 获取配置
    getExtensionSelectConfig: () => {
      if (selectedExtensions.length === 0) {
        throw Error(emptyMessage)
      }

      return {
        groups: [],
        extensions: selectedExtensions.map((e) => e.id)
      }
    }
  }))

  // 已选择的扩展
  const [selectedExtensions, setSelectedExtensions] = useState([])
  // 未选择的扩展
  const [unselectedExtensions, setUnselectedExtensions] = useState([])
  // 显示到界面上的未选择扩展（搜索之后的结果）
  const [displayUnselectedExtensions, setDisplayUnselectedExtensions] = useState([])
  // 显示到界面上的已选择扩展（搜索之后的结果）
  const [displaySelectedExtensions, setDisplaySelectedExtensions] = useState([])

  // 根据配置进行初始化
  useEffect(() => {
    const myConfig = config.target ?? {}

    // 初始化已选择的扩展
    if (!myConfig.extensions) {
      setSelectedExtensions([])
      setUnselectedExtensions(extensions)
      setDisplayUnselectedExtensions(extensions)
      setDisplaySelectedExtensions([])
    } else {
      const inExtensions = extensions.filter((e) => myConfig.extensions?.includes(e.id))
      const outExtension = extensions.filter((e) => !myConfig.extensions?.includes(e.id))
      setSelectedExtensions(inExtensions)
      setUnselectedExtensions(outExtension)
      setDisplayUnselectedExtensions(outExtension)
      setDisplaySelectedExtensions(inExtensions)
    }
  }, [config, extensions])

  // 当搜索关键字变化时，更新界面显示
  useEffect(() => {
    if (!searchText || searchText.trim() === "") {
      setDisplaySelectedExtensions(selectedExtensions)
      setDisplayUnselectedExtensions(unselectedExtensions)
      return
    }

    const displaySelected = selectedExtensions.filter((ext) => {
      return isMatch(
        [ext.name, ext.shortName, ext.description, ext.__attach__?.alias, ext.__attach__?.remark],
        searchText,
        true
      )
    })
    setDisplaySelectedExtensions(displaySelected)

    const displayUnselected = unselectedExtensions.filter((ext) => {
      return isMatch(
        [ext.name, ext.shortName, ext.description, ext.__attach__?.alias, ext.__attach__?.remark],
        searchText,
        true
      )
    })
    setDisplayUnselectedExtensions(displayUnselected)
  }, [selectedExtensions, unselectedExtensions, searchText])

  /**
   * 点击已选择的扩展（移除）
   */
  const onSelectedExtensionClick = (e, item) => {
    const selected = selectedExtensions.filter((e) => e.id !== item.id)
    setSelectedExtensions(selected)

    const unselected = [...unselectedExtensions, item]
    setUnselectedExtensions(unselected)
  }

  /**
   * 点击未选择的扩展（添加）
   */
  const onUnselectedExtensionClick = (e, item) => {
    const unselected = unselectedExtensions.filter((e) => e.id !== item.id)
    setUnselectedExtensions(unselected)

    const selected = [...selectedExtensions, item]
    setSelectedExtensions(selected)
  }

  return (
    <Style>
      {children}

      <div className="extension-container">
        <Divider orientation="center">已选择</Divider>

        {displaySelectedExtensions.length > 0 ? (
          <ExtensionItems
            items={displaySelectedExtensions}
            placeholder=""
            onClick={onSelectedExtensionClick}
            options={options}></ExtensionItems>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
        )}

        <Divider orientation="center">未选择</Divider>

        {displayUnselectedExtensions.length > 0 ? (
          <ExtensionItems
            items={displayUnselectedExtensions}
            placeholder=""
            onClick={onUnselectedExtensionClick}
            options={options}></ExtensionItems>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
        )}
      </div>
    </Style>
  )
}

export default memo(forwardRef(ExtensionTarget))

const Style = styled.div`
  .extension-container {
    margin-top: 12px;
  }
`

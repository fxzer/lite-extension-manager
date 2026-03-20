import React, { memo, useEffect, useState } from "react"

import { Checkbox, Divider, Empty, Input, message } from "antd"

import { isExtensionMatch } from ".../utils/searchHelper"
import { getLang } from ".../utils/utils"
import ModeContentSpace from "./ModeContentSpace"
import { ModeContentStyle } from "./ModeContentStyle"

const { Search } = Input

/**
 * 模式内容：标题，在模式中的扩展，不在模式中的扩展，描述
 */
const ModeContent = memo((props) => {
  const { mode, modeList, options, onItemClick, onEnableAll, onDisableAll, enabledExtensions, disabledExtensions } = props

  const [messageApi, contextHolder] = message.useMessage()

  // 显示到界面的，在模式中的扩展（配合搜索功能）
  const [shownEnabledExts, setShownEnabledExts] = useState([])
  // 显示到界面的，没有在模式中的扩展（配合搜索功能）
  const [shownDisabledExts, setShownDisabledExts] = useState([])
  // 搜索词
  const [searchWord, setSearchWord] = useState("")

  // 搜索
  useEffect(() => {
    if (!searchWord || searchWord.trim() === "") {
      setShownEnabledExts(enabledExtensions)
      setShownDisabledExts(disabledExtensions)
      return
    }

    const shownEnabledExts = enabledExtensions.filter((ext) => isExtensionMatch(ext, searchWord))
    const shownDisabledExts = disabledExtensions.filter((ext) => isExtensionMatch(ext, searchWord))
    setShownEnabledExts(shownEnabledExts)
    setShownDisabledExts(shownDisabledExts)
  }, [searchWord, enabledExtensions, disabledExtensions])

  // 搜索
  const onSearch = (value) => {
    setSearchWord(value)
  }

  return (
    <ModeContentStyle>
      {contextHolder}
      <div className="search-sort-bar">
        <Search
          className="search"
          placeholder={getLang("mode_search_placeholder")}
          allowClear
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)}
        />
        <Checkbox
          className="enable-all-checkbox"
          checked={disabledExtensions.length === 0 && enabledExtensions.length > 0}
          indeterminate={enabledExtensions.length > 0 && disabledExtensions.length > 0}
          onChange={(e) => (e.target.checked ? onEnableAll() : onDisableAll())}>
          {getLang("mode_enable_all")}
        </Checkbox>
      </div>

      <Divider orientation="center">已启用</Divider>

      {shownEnabledExts.length > 0 ? (
        <ModeContentSpace
          shownItems={shownEnabledExts}
          isModeEnabled={true}
          mode={mode}
          modeList={modeList}
          options={options}
          notificationApi={messageApi}
          onItemClick={onItemClick}></ModeContentSpace>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
      )}

      <Divider orientation="center">未启用</Divider>

      <div>{props.children}</div>

      {shownDisabledExts.length > 0 ? (
        <ModeContentSpace
          shownItems={shownDisabledExts}
          isModeEnabled={false}
          mode={mode}
          modeList={modeList}
          options={options}
          notificationApi={messageApi}
          onItemClick={onItemClick}></ModeContentSpace>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
      )}

      <p className="desc">{mode.desc}</p>
    </ModeContentStyle>
  )
})

export default ModeContent

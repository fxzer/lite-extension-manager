import React, { memo, useEffect, useState } from "react"

import { Divider, Empty, Input, message, Segmented } from "antd"

import { LocalOptions } from "../../../storage/local"
import { isExtensionMatch } from ".../utils/searchHelper"
import { getLang } from ".../utils/utils"
import ModeContentSpace from "./ModeContentSpace"
import ModeTableContent from "./ModeTableContent"
import { ModeContentStyle } from "./ModeContentStyle"

const { Search } = Input

/**
 * 模式内容：标题，在模式中的扩展，不在模式中的扩展，描述
 */
const ModeContent = memo((props) => {
  const { mode, modeList, options, onItemClick, enabledExtensions, disabledExtensions } = props

  const [messageApi, contextHolder] = message.useMessage()

  // 显示到界面的，在模式中的扩展（配合搜索功能）
  const [shownEnabledExts, setShownEnabledExts] = useState([])
  // 显示到界面的，没有在模式中的扩展（配合搜索功能）
  const [shownDisabledExts, setShownDisabledExts] = useState([])
  // 搜索词
  const [searchWord, setSearchWord] = useState("")
  // 视图模式：grid（网格）或 table（表格）
  const [viewMode, setViewMode] = useState("grid")

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

  // 初始化时恢复上次的视图模式
  useEffect(() => {
    const local = new LocalOptions()
    local.getValue("modeViewMode").then((savedMode) => {
      if (savedMode && ["grid", "table"].includes(savedMode)) {
        setViewMode(savedMode)
      }
    }).catch((err) => {
      console.error("[ModeContent] Failed to read viewMode:", err)
    })
  }, [])

  // 搜索
  const onSearch = (value) => {
    setSearchWord(value)
  }

  // 视图切换处理
  const onViewModeChange = (value) => {
    setViewMode(value)
    // 保存到本地存储
    const local = new LocalOptions()
    local.setValue("modeViewMode", value).catch((err) => {
      console.error("[ModeContent] Failed to save viewMode:", err)
    })
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
        <Segmented
          value={viewMode}
          onChange={onViewModeChange}
          options={[
            { label: "网格", value: "grid" },
            { label: "列表", value: "table" }
          ]}
        />
      </div>

      {viewMode === "grid" ? (
        <>
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
        </>
      ) : (
        <ModeTableContent
          mode={mode}
          extensions={[...enabledExtensions, ...disabledExtensions]}
          modeList={modeList}
          options={options}
        />
      )}
    </ModeContentStyle>
  )
})

export default ModeContent

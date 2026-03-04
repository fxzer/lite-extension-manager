import React, { memo, useEffect, useState, useRef } from "react"

import { Divider, Empty, Input, message } from "antd"

import { isExtensionMatch } from ".../utils/searchHelper"
import { getLang } from ".../utils/utils"
import ModeContentSpace from "./ModeContentSpace"
import { ModeContentStyle } from "./ModeContentStyle"

const { Search } = Input

/**
 * 快捷键显示组件
 */
const ShortcutDisplay = memo(({ mode, allModes, onBindingChange }) => {
  const [shortcut, setShortcut] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  // 使用 ref 追踪上一次的 mode.id，用于检测模式切换
  const prevModeIdRef = useRef(null)

  useEffect(() => {
    const currentModeId = mode?.id

    // 检测是否切换了模式
    const hasModeChanged = prevModeIdRef.current !== null && prevModeIdRef.current !== currentModeId

    // 加载快捷键配置
    loadShortcut()

    // 当切换到其他模式时，取消录制状态
    if (hasModeChanged && isRecording) {
      setIsRecording(false)
    }

    // 更新 ref
    prevModeIdRef.current = currentModeId
  }, [mode?.id])

  // 单独的 effect 处理录制状态变化
  useEffect(() => {
    if (isRecording) {
      // 录制时，确保快捷键显示为空
      setShortcut(null)
    }
  }, [isRecording])

  const loadShortcut = async () => {
    const result = await chrome.storage.local.get(`mode_shortcut_${mode.id}`)
    setShortcut(result[`mode_shortcut_${mode.id}`] || null)
  }

  const handleClick = () => {
    setIsRecording(true)
    setShortcut(null)
  }

  const handleKeyDown = (e) => {
    if (!isRecording) return

    e.preventDefault()
    e.stopPropagation()

    const { altKey, key, code } = e

    // ESC 取消录入
    if (key === 'Escape') {
      setIsRecording(false)
      loadShortcut() // 恢复原值
      return
    }

    // 允许 Alt/Option + 数字键
    if (altKey && /^Digit[1-9]$/.test(code)) {
      const number = code.replace('Digit', '')
      const newShortcut = `Alt+${number}`

      // 从 storage 获取所有快捷键进行检查
      chrome.storage.local.get().then(result => {
        for (const [key, value] of Object.entries(result)) {
          if (key.startsWith('mode_shortcut_') && key !== `mode_shortcut_${mode.id}` && value === newShortcut) {
            const modeId = key.replace('mode_shortcut_', '')
            const conflictMode = allModes?.find(m => m.id === modeId)
            if (conflictMode) {
              messageApi.warning(getLang("mode_shortcut_conflict", conflictMode.name || modeId, newShortcut))
              setIsRecording(false)
              loadShortcut()
              return
            }
          }
        }

        // 没有冲突，保存快捷键
        setShortcut(newShortcut)
        setIsRecording(false)
        saveShortcut(newShortcut)
      })
    }
  }

  const handleBlur = () => {
    if (isRecording) {
      setIsRecording(false)
      loadShortcut() // 恢复原值
    }
  }

  const saveShortcut = async (shortcut) => {
    await chrome.storage.local.set({
      [`mode_shortcut_${mode.id}`]: shortcut
    })
    onBindingChange?.()
  }

  const formatShortcut = (s) => {
    if (!s) return getLang("mode_shortcut_empty")
    return s.replace('Alt', 'Option').replace('+', ' + ')
  }

  const shortcutIconSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="shortcut-icon">
      <path fill="currentColor" d="M3 20q-.825 0-1.412-.587T1 18V6q0-.825.588-1.412T3 4h18q.825 0 1.413.588T23 6v12q0 .825-.587 1.413T21 20zm0-2h18V6H3zm6-1h6q.425 0 .713-.288T16 16t-.288-.712T15 15H9q-.425 0-.712.288T8 16t.288.713T9 17m-6 1V6zm3-8q.425 0 .713-.288T7 9t-.288-.712T6 8t-.712.288T5 9t.288.713T6 10m4 0q.425 0 .713-.288T11 9t-.288-.712T10 8t-.712.288T9 9t.288.713T10 10m4 0q.425 0 .713-.288T15 9t-.288-.712T14 8t-.712.288T13 9t.288.713T14 10m4 0q.425 0 .713-.288T19 9t-.288-.712T18 8t-.712.288T17 9t.288.713T18 10M6 13.5q.425 0 .713-.288T7 12.5t-.288-.712T6 11.5t-.712.288T5 12.5t.288.713T6 13.5m4 0q.425 0 .713-.288T11 12.5t-.288-.712T10 11.5t-.712.288T9 12.5t.288.713t.712.287m4 0q.425 0 .713-.288T15 12.5t-.288-.712T14 11.5t-.712.288T13 12.5t.288.713t.712.287m4 0q.425 0 .713-.288T19 12.5t-.288-.712T18 11.5t-.712.288T17 12.5t.288.713t.712.287"/>
    </svg>
  )

  return (
    <div
      className={`shortcut-display${isRecording ? ' recording' : ''}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}>
      {shortcutIconSvg}
      <span className="shortcut-text">
        {isRecording ? getLang("mode_shortcut_press_key") : formatShortcut(shortcut)}
      </span>
      {shortcut && !isRecording && (
        <span
          className="shortcut-clear"
          onClick={(e) => {
            e.stopPropagation()
            chrome.storage.local.remove(`mode_shortcut_${mode.id}`)
            setShortcut(null)
            onBindingChange?.()
          }}>
          ×
          </span>
      )}
    </div>
  )
})

/**
 * 模式内容：标题，在模式中的扩展，不在模式中的扩展，描述
 */
const ModeContent = memo((props) => {
  const { mode, modeList, options, onItemClick, enabledExtensions, disabledExtensions, onShortcutBindingChange } = props

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
        <ShortcutDisplay
          mode={mode}
          allModes={modeList}
          onBindingChange={onShortcutBindingChange}
        />
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

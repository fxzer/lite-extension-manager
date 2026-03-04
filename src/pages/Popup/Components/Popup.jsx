import React, { useEffect, useState } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { getPopupWidth } from ".../pages/Popup/utils/popupLayoutHelper"
import storage from ".../storage/sync"
import { isExtExtension } from "../../../utils/extensionHelper.js"
import { handleExtensionOnOff } from "../ExtensionOnOffHandler.js"
import { useSearchController } from "../hooks/useSearchController"
import { useShowAppController } from "../hooks/useShowAppController"
import AppList from "./AppList"
import Header from "./Header"
import ExtensionGrid from "./grid-view/ExtensionGridView.jsx"
import ExtensionList from "./list-view/ExtensionListView"
import { DropdownGlobalStyle } from "./HeaderStyle"

function IndexPopup({ originExtensions, options: initialOptions, params }) {
  const [extensions, setExtensions] = useState(originExtensions)
  // 将 options 改为 state，以便在 storage 变化时更新
  const [options, setOptions] = useState(initialOptions)
  // 当前选中的模式
  const [currentMode, setCurrentMode] = useState(null)

  // ✅ 双向同步：Popup → 模式管理
  // 当用户手动启用/禁用扩展时，同步更新当前模式的 extensions 列表
  const syncModeExtensions = async (extensionId, enabled) => {
    if (!currentMode || currentMode.id === "all") {
      return
    }

    try {
      // 获取最新模式数据
      const modes = await storage.mode.getModes()
      const mode = modes.find((m) => m.id === currentMode.id)

      if (!mode) {
        console.warn("[Popup→模式同步] 未找到模式:", currentMode.id)
        return
      }

      // 更新模式的 extensions 列表
      let modeExtensions = mode.extensions || []

      if (enabled) {
        // 启用：添加到列表（如果不存在）
        if (!modeExtensions.includes(extensionId)) {
          mode.extensions = [...modeExtensions, extensionId]
          await storage.mode.update(mode)
        }
      } else {
        // 禁用：从列表中移除
        if (modeExtensions.includes(extensionId)) {
          mode.extensions = modeExtensions.filter((id) => id !== extensionId)
          await storage.mode.update(mode)
        }
      }
    } catch (error) {
      console.error("[Popup→模式同步] 同步失败:", error)
    }
  }

  // 启用的扩展数量（不包括 APP 类型）
  const [activeExtensionCount, setActiveExtensionCount] = useState(0)
  // 总扩展数量，不包括 APP 类型
  const [allExtensionCount, setAllExtensionCount] = useState(0)

  // 是否显示 APP 类型扩展
  const [isShowAppExtension, setIsShowAppExtension] = useShowAppController(options)

  // 搜索控制
  const [pluginExtensions, appExtensions, onSearchByTextChange, onSearchByModeChange] =
    useSearchController(extensions)

  // 布局样式
  const [layout, setLayout] = useState(options.setting.layout)

  // 数量显示
  useEffect(() => {
    const list = extensions.filter((ext) => isExtExtension(ext))
    setActiveExtensionCount(list.filter((ext) => ext.enabled).length)
    setAllExtensionCount(list.length)
  }, [extensions])

  // 扩展启用与禁用之后，更新显示
  useEffect(() => {
    const onEnabled = (info) => {
      // ✅ 修复：使用不可变更新，创建新对象而不是直接修改
      setExtensions((prevExtensions) =>
        prevExtensions.map((ext) =>
          ext.id === info.id ? { ...ext, enabled: true } : ext
        )
      )
      // ✅ 双向同步：同步更新当前模式的 extensions 列表
      syncModeExtensions(info.id, true)
    }
    const onDisabled = (info) => {
      // ✅ 修复：使用不可变更新，创建新对象而不是直接修改
      setExtensions((prevExtensions) =>
        prevExtensions.map((ext) =>
          ext.id === info.id ? { ...ext, enabled: false } : ext
        )
      )
      // ✅ 双向同步：同步更新当前模式的 extensions 列表
      syncModeExtensions(info.id, false)
    }
    chrome.management.onEnabled.addListener(onEnabled)
    chrome.management.onDisabled.addListener(onDisabled)
    return () => {
      chrome.management.onEnabled.removeListener(onEnabled)
      chrome.management.onDisabled.removeListener(onDisabled)
    }
  }, [currentMode])  // ✅ 依赖 currentMode，确保能访问最新模式

  // 监听 storage 变化（模式配置更新时同步刷新）
  useEffect(() => {
    const handleStorageChange = async (changes, areaName) => {
      if (areaName !== "sync") {
        return
      }

      // 检查是否有任何相关数据的变化
      const changedKeys = Object.keys(changes)

      // 检查 modes 相关的 key（largeSync 格式：LS__modes.0, LS__modes.meta 等）
      const hasModesChange = changedKeys.some((key) => {
        return key.startsWith("LS__modes.") || key === "modes"
      })

      // 检查 setting 相关的 key
      const hasSettingChange = changedKeys.includes("setting")

      if (hasModesChange || hasSettingChange) {

        // 模式配置已更新，重新获取配置
        const newOptions = await storage.options.getAll()
        setOptions(newOptions)

        if (hasModesChange && currentMode && newOptions.setting?.isRaiseEnableWhenSwitchGroup
          && currentMode.id !== "all") {
          const modes = await storage.mode.getModes()
          const updatedMode = modes.find((m) => m.id === currentMode.id)

          if (updatedMode) {
            // 重新应用模式配置
            const newExtensions = await handleExtensionOnOff(
              extensions,
              newOptions,
              [updatedMode],
              updatedMode
            )
            setExtensions(newExtensions)
          }
        }

        // 同时更新 localforage 缓存
        try {
          const localforage = await import("localforage")
          const forage = localforage.default.createInstance({
            driver: localforage.default.LOCALSTORAGE,
            name: "TempCache",
            version: 1.0,
            storeName: "options"
          })
          await forage.setItem("all_options", newOptions)
        } catch (e) {
          console.error("[Popup] Failed to update cache:", e)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    // 同时监听窗口焦点事件，当 Popup 重新获得焦点时刷新数据
    const handleFocus = async () => {
      const newOptions = await storage.options.getAll()
      setOptions(newOptions)
    }

    window.addEventListener("focus", handleFocus)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  // 模式切换
  const onModeChanged = async (args) => {
    /*
    args.action    true:开启了切换模式启用或禁用扩展的配置
    args.select    所选的模式，为 null 表示没有选中任何模式（单选）
    args.selectIds 所选模式集合，为 [] 表示没有选中任何模式（多选）
    */

    // 更新当前模式状态
    setCurrentMode(args.select)

    if (args.action && args.select && args.select.id !== "all") {
      const newExtensions = await handleExtensionOnOff(
        extensions,
        options,
        [args.select],
        args.select
      )
      setExtensions(newExtensions)
    }

    // 多选（多选模式下不应该包含默认模式，但为了保险起见也加上判断）
    if (args.action && args.selects && args.current) {
      const newExtensions = await handleExtensionOnOff(
        extensions,
        options,
        args.selects,
        args.current
      )
      setExtensions(newExtensions)
    }

    if (!args.action) {
      // 如果没有开启配置，切换模式意味着：切换模式显示，没有扩展启用与禁用功能
      setIsShowAppExtension(!args.select) // 切换到特定模式时，不显示 APP
      onSearchByModeChange(args.select)
    }
  }

  // 布局切换
  const onLayoutChanged = (layout) => {
    setLayout(layout)
    document.body.style.width = getPopupWidth(
      layout,
      originExtensions.length,
      options.setting.columnCountInGirdView
    )
  }

  const getExtensionDisplay = () => {
    if (!layout || layout === "list") {
      return (
        <ExtensionList
          extensions={pluginExtensions}
          options={options}
          currentMode={currentMode}></ExtensionList>
      )
    } else {
      return (
        <ExtensionGrid
          extensions={pluginExtensions}
          options={options}
          currentMode={currentMode}
          isShowBottomDivider={isShowAppExtension && appExtensions.length > 0}></ExtensionGrid>
      )
    }
  }

  return (
    <Style>
      <DropdownGlobalStyle />
      <div className="header-container">
        <Header
          activeCount={activeExtensionCount}
          totalCount={allExtensionCount}
          options={options}
          onModeChanged={onModeChanged}
          onLayoutChanged={onLayoutChanged}
          onSearch={onSearchByTextChange}
          isDarkMode={params.isDarkMode}></Header>
      </div>

      <div
        className={classNames([
          "extension-container",
          { "extension-container-grid": layout === "grid" }
        ])}>
        {getExtensionDisplay()}
        {isShowAppExtension && <AppList items={appExtensions}></AppList>}
      </div>
    </Style>
  )
}

export default IndexPopup

const Style = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.fg};

  &::-webkit-scrollbar {
    display: none;
  }

  .header-container {
    flex: 0 0 auto;

    position: fixed;
    left: 0;
    right: 0;
    z-index: 1;
  }

  .extension-container {
    flex: 1 1 auto;
    overflow: auto;
    margin-left: 0px;
    margin-top: var(--header-height);
    min-height: 60px;
  }
    .extension-container ul{
      margin-bottom: 0px;
    }

  .extension-container::-webkit-scrollbar {
    width: 4px;
  }

  .extension-container::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    opacity: 1;
    background: ${(props) => props.theme.scrollbarThumb};
  }

  .extension-container::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: ${(props) => props.theme.disabled};
  }

  .extension-container-grid::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }
`

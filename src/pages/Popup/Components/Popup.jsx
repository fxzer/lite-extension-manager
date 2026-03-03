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

function IndexPopup({ originExtensions, options: initialOptions, params }) {
  const [extensions, setExtensions] = useState(originExtensions)
  // 将 options 改为 state，以便在 storage 变化时更新
  const [options, setOptions] = useState(initialOptions)
  // 当前选中的模式
  const [currentMode, setCurrentMode] = useState(null)

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
      const one = extensions.find((ext) => ext.id === info.id)
      if (one) {
        one.enabled = true
        setExtensions([...extensions])
      }
    }
    const onDisabled = (info) => {
      const one = extensions.find((ext) => ext.id === info.id)
      if (one) {
        one.enabled = false
        setExtensions([...extensions])
      }
    }
    chrome.management.onEnabled.addListener(onEnabled)
    chrome.management.onDisabled.addListener(onDisabled)
    return () => {
      chrome.management.onEnabled.removeListener(onEnabled)
      chrome.management.onDisabled.removeListener(onDisabled)
    }
  }, [extensions])

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
        console.log("[Popup] Storage changed, refreshing options...", changedKeys)

        // 模式配置已更新，重新获取配置
        const newOptions = await storage.options.getAll()
        setOptions(newOptions)

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
          console.log("[Popup] Cache updated")
        } catch (e) {
          console.error("[Popup] Failed to update cache:", e)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    // 同时监听窗口焦点事件，当 Popup 重新获得焦点时刷新数据
    const handleFocus = async () => {
      console.log("[Popup] Window focused, refreshing options...")
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

    // 如果开启了配置，切换模式意味着：执行扩展的启用与禁用，没有切换显示的功能
    // 如果开启了配置，并且当前模式不为空，则执行扩展的启用与禁用
    if (args.action && args.select) {
      const newExtensions = await handleExtensionOnOff(
        extensions,
        options,
        [args.select],
        args.select
      )
      setExtensions(newExtensions)
    }

    // 多选
    if (args.action && args.selects) {
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

  :root {
    /* HeaderStyle 中设置的 Header 高度，不包括搜索框 */
    --header-height: 42px;
    /* 背景颜色 */
    --bg: ${(props) => props.theme.menuBg};
    /* 前景颜色 */
    --fg: ${(props) => props.theme.menuText};
    /* 边框颜色 */
    --border-color: ${(props) => props.theme.inputBorder};
    --divider-color: ${(props) => props.theme.inputBorder}33;
    /* 菜单边框颜色 - 比普通边框更淡 */
    --menu-border-color: ${(props) => props.theme.borderDivider};
    /* 菜单 hover 背景色 - 暗黑模式使用白色半透明 */
    --menu-hover-bg: ${(props) => props.theme.hoverBgMedium};
    /* 阴影颜色 - 暗黑模式下使用白色阴影 */
    --shadow-color: ${(props) => props.theme.shadow};
  }

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

    /* Header 的高度 */
    margin-top: var(--header-height);

    min-height: 60px;
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

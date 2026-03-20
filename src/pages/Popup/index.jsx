import ".../utils/devConsoleFilter"
import "../../wdyr"

import React from "react"
import { createRoot } from "react-dom/client"

import "antd/dist/reset.css"

import { message } from "antd"
import { ConfigProvider, theme } from "antd"
import { ThemeProvider } from "styled-components"

import "./index.css"

import storage from ".../storage/sync"
import { isEdgePackage, isEdgeRuntime } from ".../utils/channelHelper"
import analytics from ".../utils/googleAnalyze"
import { getLang } from ".../utils/googleAnalyzeHelper"
import { getThemeByMode } from "../../theme"
import { ExtensionIconBuilder } from "../Background/extension/ExtensionIconBuilder"
import Popup from "./Components/Popup"
import { prepare } from "./prepare"

const container = document.getElementById("app-container")
const root = createRoot(container)

const storageViewApi = storage.helper.view.getApi()
storageViewApi.message = message

// ✅ 缓存优先：直接调用 prepare（内部已优化为缓存优先）
prepare().then((props) => {
  const settingMode = props.options.setting.darkMode ?? "system"
  let isDarkMode = settingMode === "dark"
  if (settingMode === "system") {
    isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  }

  props.params.isDarkMode = isDarkMode

  // 使用统一主题系统
  const styledTheme = getThemeByMode(isDarkMode)

  root.render(
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}>
      <ThemeProvider theme={styledTheme}>
        <Popup
          style={{ height: "100%" }}
          originExtensions={props.extensions}
          options={props.options}
          params={props.params}
        />
      </ThemeProvider>
    </ConfigProvider>
  )

  // 设置 body 背景色
  document.body.style.backgroundColor = styledTheme.bg

  fireEvent(props)
})

ExtensionIconBuilder.build()

function fireEvent(props) {
  const firePopupOpen = async () => {
    const version = chrome.runtime.getManifest().version
    const ul = await getLang()
    analytics.fireEvent("page_view_popup", {
      browser: isEdgeRuntime() ? "edge" : "chrome",
      package: isEdgePackage() ? "edge" : "chrome",
      version: version,
      layout: props.options.setting.layout,
      display: "byEnabled",
      action: props.options.setting.isRaiseEnableWhenSwitchGroup ? "raise" : "normal",
      menuDisplay: "rightClick",
      lang: ul
    })
  }
  if (document.readyState === "complete") {
    firePopupOpen()
  } else {
    window.addEventListener("load", firePopupOpen, {
      once: true
    })
  }
}

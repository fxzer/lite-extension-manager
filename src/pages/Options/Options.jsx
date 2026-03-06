import React, { useEffect, useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { ConfigProvider, theme } from "antd"
import { ThemeProvider } from "styled-components"

import "./Options.css"
import "./index.css"

import storage from ".../storage/sync"
import { PRIMARY, getThemeByMode } from "../../theme"
import About from "./about/About.jsx"
import IndexExport from "./export/IndexExport.jsx"
import ExtensionHistoryIndex from "./history/ExtensionHistoryIndex"
import IndexImport from "./import/IndexImport.jsx"
import ExtensionImport from "./management/import/ExtensionImport"
import ExtensionShare from "./management/share/ExtensionShare"
import ModeManagement from "./mode/IndexMode.jsx"
import Navigation from "./navigation/Navigation.jsx"

function Options() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [themeReady, setThemeReady] = useState(false)

  useEffect(() => {
    const updateTheme = (options) => {
      const settingMode = options?.setting?.darkMode ?? "system"
      let dark = settingMode === "dark"
      if (settingMode === "system") {
        dark = window.matchMedia("(prefers-color-scheme: dark)").matches
      }
      setIsDarkMode(dark)
      setThemeReady(true)

      // 使用统一主题系统
      const t = getThemeByMode(dark)
      document.body.style.backgroundColor = t.bg
      document.body.style.color = t.fg

      // 设置 CSS 变量供纯 CSS 文件使用
      const root = document.documentElement
      root.style.setProperty("--sortable-item-bg", t.sortableItemBg)
      root.style.setProperty("--sortable-item-color", t.sortableItemColor)
      root.style.setProperty("--sortable-shadow", t.sortableShadow)
      root.style.setProperty("--drag-handle-hover-bg", t.dragHandleHoverBg)
      root.style.setProperty("--drag-handle-fill", t.dragHandleFill)
      // 设置滚动条颜色
      root.style.setProperty("--scrollbar-thumb", t.scrollbarThumb)
      root.style.setProperty("--scrollbar-thumb-hover", t.scrollbarThumbHover)
    }

    storage.options.getAll().then(updateTheme)

    const handleStorageChange = (changes, areaName) => {
      if (areaName === "sync") {
        const hasSettingChange = Object.keys(changes).some((k) => k.startsWith("LS__setting"))
        if (hasSettingChange) {
          storage.options.getAll().then(updateTheme)
        }
      }
    }

    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)")
    const handleMediaChange = () => {
      storage.options.getAll().then(updateTheme)
    }

    matchMedia.addEventListener("change", handleMediaChange)
    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      matchMedia.removeEventListener("change", handleMediaChange)
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  if (!themeReady) {
    return null
  }

  const currentTheme = getThemeByMode(isDarkMode)

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: PRIMARY
        }
      }}>
      <ThemeProvider theme={currentTheme}>
        <div className="option-container">
          <Navigation></Navigation>

          <div className="option-content">
            <Routes>
              <Route path="/" element={<Navigate to="/about" replace />}></Route>
              <Route path="/about" element={<About />} />
              <Route path="/mode" element={<ModeManagement />} />
              <Route path="/export" element={<IndexExport />}>
                <Route index element={<ExtensionShare />} />
              </Route>
              <Route path="/import" element={<IndexImport />}>
                <Route index element={<ExtensionImport />} />
              </Route>
              <Route path="/history" element={<ExtensionHistoryIndex />} />
            </Routes>
          </div>
        </div>
      </ThemeProvider>
    </ConfigProvider>
  )
}

export default Options

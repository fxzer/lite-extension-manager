import React, { memo, useEffect, useRef, useState } from "react"

import {
  AppstoreOutlined,
  BulbOutlined,
  CloseOutlined,
  DesktopOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  MoonOutlined,
  SearchOutlined,
  SettingOutlined,
  UnorderedListOutlined
} from "@ant-design/icons"
import { Space, message } from "antd"
import _ from "lodash"

import DarkIcon from ".../assets/Dark.svg"
import LightIcon from ".../assets/Light.svg"
import storage from ".../storage/sync"
import { getLang } from ".../utils/utils"
import Style, { SearchStyle, ZoomDropdownGlobalStyle } from "./HeaderStyle"
import MoreOperationDropdown from "./header/MoreOperationDropdown"
import SearchSourceDropdown, { getSearchUrl } from "./header/SearchSourceDropdown"
import ModeDropdown from "./header/mode/ModeDropdown"

// 已移除模式切换功能 - ModeDropdown

const Header = memo((props) => {
  const { activeCount, totalCount, options, onModeChanged, onLayoutChanged, onSearch, isDarkMode } =
    props

  const [messageApi, contextHolder] = message.useMessage()

  // 是否显示操作菜单，用于控制延迟渲染
  const [isShowOperations, setIsShowOperations] = useState(false)
  // 是否显示搜索框
  const [isShowSearch, setIsShowSearch] = useState(options.setting.isShowSearchBarDefault)
  // 布局样式
  const [layout, setLayout] = useState(options.setting.layout)
  // 主题模式
  const [themeMode, setThemeMode] = useState(options.setting.darkMode || "system")

  const [searchText, setSearchText] = useState("")
  const searchInputRef = useRef(null)

  useEffect(() => {
    setIsShowOperations(true)
  }, [])

  useEffect(() => {
    if (isShowSearch) {
      searchInputRef.current.focus()
    }

    if (isShowSearch) {
      document.documentElement.style.setProperty("--header-height", `90px`)
    } else {
      document.documentElement.style.setProperty("--header-height", `42px`)
    }
  }, [isShowSearch])

  // layout 变更时，保存配置
  const saveLayout = (layout) => {
    storage.options.getAll().then((options) => {
      const setting = { ...options.setting, layout: layout }
      storage.options.set({ setting: setting })
    })
  }

  const onSearchClick = () => {
    const show = !isShowSearch
    setIsShowSearch(show)
    if (!show) {
      setSearchText("")
    }
  }

  const onSearchClear = () => {
    setSearchText("")
    onSearch?.("")
    searchInputRef.current.focus()
  }

  const onLayoutClick = () => {
    if (!layout || layout === "list") {
      setLayout("grid")
      onLayoutChanged("grid")
      saveLayout("grid")
    } else {
      setLayout("list")
      onLayoutChanged("list")
      saveLayout("list")
    }
  }

  const onThemeClick = async () => {
    const modes = ["light", "dark", "system"]
    const currentIndex = modes.indexOf(themeMode)
    const nextIndex = (currentIndex + 1) % modes.length
    const newTheme = modes[nextIndex]

    setThemeMode(newTheme)

    const allOptions = await storage.options.getAll()
    const setting = { ...allOptions.setting, darkMode: newTheme }
    await storage.options.set({ setting: setting })

    const newIsDarkMode =
      newTheme === "dark" ||
      (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    window.location.reload()
  }

  const getThemeIcon = () => {
    // 显示点击后将要切换到的模式
    const modes = ["light", "dark", "system"]
    const currentIndex = modes.indexOf(themeMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]

    switch (nextMode) {
      case "light":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ verticalAlign: "middle", marginBottom: "2px" }}>
            <path d="M15 2h2v5h-2zm6.688 6.9l3.506-3.506l1.414 1.414l-3.506 3.506zM25 15h5v2h-5zm-3.312 8.1l1.414-1.413l3.506 3.506l-1.414 1.414zM15 25h2v5h-2zm-9.606.192L8.9 21.686l1.414 1.414l-3.505 3.506zM2 15h5v2H2zm3.395-8.192l1.414-1.414L10.315 8.9L8.9 10.314zM16 12a4 4 0 1 1-4 4a4.005 4.005 0 0 1 4-4m0-2a6 6 0 1 0 6 6a6 6 0 0 0-6-6" />
          </svg>
        )
      case "dark":
        return <MoonOutlined />
      case "system":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ verticalAlign: "middle", marginBottom: "2px" }}>
            <path
              d="M22 6H9a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h30a3 3 0 0 0 3-3v-9M24 34v8m-10 0h20"
              fill="none"
            />
            <path
              d="M33.3 6C31.478 6 30 7.435 30 9.205c0 3.204 3.9 6.117 6 6.795c2.1-.678 6-3.59 6-6.795C42 7.435 40.523 6 38.7 6A3.33 3.33 0 0 0 36 7.362A3.33 3.33 0 0 0 33.3 6"
              fill="currentColor"
            />
          </svg>
        )
      default:
        return <DesktopOutlined />
    }
  }

  const onSettingClick = (e) => {
    chrome.management.getSelf((self) => {
      const optionsBase = self.optionsUrl.split("#")[0]
      chrome.tabs.create({ url: `${optionsBase}#/mode` })
    })
  }

  const onSearchTextChange = (e) => {
    const text = e.target.value
    setSearchText(text)
    throttleSearch(text)
  }

  const throttleSearch = _.throttle((text) => {
    onSearch?.(text)
  }, 500)

  useEffect(() => {
    const onKeydown = (e) => {
      switch (e.key) {
        case "f":
          if (!isShowSearch) {
            setIsShowSearch(true)
            e.preventDefault()
          }
          return
        case "s":
          if (isShowSearch) {
            return
          }
          onSettingClick(e)
          e.preventDefault()
          return
        default:
          return
      }
    }

    document.addEventListener("keydown", onKeydown)
    return () => {
      document.removeEventListener("keydown", onKeydown)
    }
  }, [isShowSearch])

  /**
   * 应用商店搜索
   */
  const onStoreSearch = () => {
    if (!searchText || searchText.trim() === "") {
      return
    }
    const url = getSearchUrl(searchText)
    chrome.tabs.create({ url })
  }

  return (
    <>
      <ZoomDropdownGlobalStyle />
      {contextHolder}
      <Style>
        <div className="left">
          <img src={isDarkMode ? DarkIcon : LightIcon} alt="" />
          <h2>
            {activeCount}/{totalCount}
          </h2>
        </div>

        {isShowOperations && (
          <div className="right">
            <ModeDropdown
              className="dropdown"
              options={options}
              onModeChanged={onModeChanged}></ModeDropdown>

            <Space className="search setting-icon" onClick={onSearchClick}>
              <SearchOutlined />
            </Space>

            <Space className="layout setting-icon" onClick={onLayoutClick}>
              {!layout || layout === "list" ? <AppstoreOutlined /> : <UnorderedListOutlined />}
            </Space>

            <Space className="theme setting-icon" onClick={onThemeClick} title={themeMode}>
              {getThemeIcon()}
            </Space>

            <Space className="setting setting-icon" onClick={(e) => onSettingClick(e)}>
              <SettingOutlined />
            </Space>

            <MoreOperationDropdown
              className="dropdown more-operation"
              options={options}
              messageApi={messageApi}
            />
          </div>
        )}
      </Style>

      {isShowSearch && (
        <SearchStyle>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder={getLang("search_placeholder_local_store")}
              value={searchText}
              onChange={(e) => onSearchTextChange(e)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.shiftKey) {
                    // Shift+Enter 触发商店搜索
                    onStoreSearch()
                  } else {
                    // Enter 触发本地搜索
                    throttleSearch(searchText)
                  }
                }
              }}
              ref={searchInputRef}></input>
            {searchText && <CloseOutlined className="clear-icon" onClick={onSearchClear} />}
          </div>
          <SearchSourceDropdown />
        </SearchStyle>
      )}
    </>
  )
})

export default Header

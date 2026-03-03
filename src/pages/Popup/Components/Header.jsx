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
    switch (themeMode) {
      case "light":
        return <BulbOutlined />
      case "dark":
        return <MoonOutlined />
      case "system":
        return <DesktopOutlined />
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

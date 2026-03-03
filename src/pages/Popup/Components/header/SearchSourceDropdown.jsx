import React, { memo, useState } from "react"

import { DownOutlined } from "@ant-design/icons"
import { Button, Dropdown } from "antd"

// 固定的搜索源列表
const SEARCH_SOURCES = [
  {
    key: "chrome",
    label: "谷歌",
    urlBuilder: (kw) => `https://chromewebstore.google.com/search/${kw}`
  },
  {
    key: "edge",
    label: "微软",
    urlBuilder: (kw) => `https://microsoftedge.microsoft.com/addons/search/${kw}`
  },
  { key: "zzzmh", label: "极简", urlBuilder: (kw) => `https://chrome.zzzmh.cn/search/${kw}` },
  {
    key: "crxsoso",
    label: "搜搜",
    urlBuilder: (kw) => `https://www.crxsoso.com/search?keyword=${kw}`
  }
]

const STORAGE_KEY = "popup_search_source"

export function getSearchUrl(kw) {
  const key = localStorage.getItem(STORAGE_KEY) ?? "chrome"
  const source = SEARCH_SOURCES.find((s) => s.key === key) ?? SEARCH_SOURCES[0]
  return source.urlBuilder(kw.trim())
}

const SearchSourceDropdown = memo(() => {
  const [selected, setSelected] = useState(() => localStorage.getItem(STORAGE_KEY) ?? "chrome")

  const handleSelect = (key) => {
    setSelected(key)
    localStorage.setItem(STORAGE_KEY, key)
  }

  const current = SEARCH_SOURCES.find((s) => s.key === selected) ?? SEARCH_SOURCES[0]

  // 构建菜单项
  const menuItems = SEARCH_SOURCES.map((s) => ({
    key: s.key,
    label: s.label
  }))

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: ({ key }) => {
          handleSelect(key)
        },
        selectedKeys: [selected]
      }}
      trigger={["click"]}
      placement="bottomRight">
      <Button color="default" variant="filled" size="small" style={{ height: 32 }}>
        {current.label} <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
      </Button>
    </Dropdown>
  )
})

export default SearchSourceDropdown

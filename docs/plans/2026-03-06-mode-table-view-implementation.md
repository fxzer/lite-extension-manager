# 模式管理表格视图实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将扩展管理功能合并到模式管理页面，添加网格/列表视图切换

**Architecture:** 在 `ModeContent` 组件内添加 Segmented 切换器，新建 `ModeTableContent` 表格组件，条件渲染两种视图。视图选择持久化到 `LocalOptions`。

**Tech Stack:** React, styled-components, Ant Design (Segmented, Table), chrome.storage API

---

## Task 1: 创建 ModeTableContent 表格组件

**Files:**
- Create: `src/pages/Options/mode/ModeTableContent.jsx`
- Create: `src/pages/Options/mode/ModeTableContentStyle.js`

**Step 1: 创建表格组件文件**

创建 `src/pages/Options/mode/ModeTableContent.jsx`:

```javascript
import React, { memo, useEffect, useState } from "react"
import { Empty, Segmented, Table } from "antd"
import styled from "styled-components"

import { LocalOptions } from ".../storage/local"
import { getHomepageUrl, getOriginSettingUrl } from ".../utils/extensionHelper"
import { getLang } from ".../utils/utils"
import ExtensionChannelLabel from "../management/ExtensionChannelLabel"
import ExtensionNameItem from "../management/ExtensionNameItem"
import ExtensionOperationItem from "../management/ExtensionOperationItem"
import { ModeTableContentStyle } from "./ModeTableContentStyle"

const localOptions = new LocalOptions()

/**
 * 模式扩展表格视图
 */
const ModeTableContent = memo((props) => {
  const { mode, extensions, modeList, options } = props

  const [messageApi, contextHolder] = message.useMessage()

  // 表格数据
  const [tableData, setTableData] = useState([])
  // 搜索后的显示数据
  const [shownData, setShownData] = useState([])
  // 搜索词
  const [searchWord, setSearchWord] = useState("")

  // 初始化表格数据
  useEffect(() => {
    const data = buildTableData(extensions, mode, modeList)
    setTableData(data)
    setShownData(data)
  }, [extensions, mode, modeList])

  // 搜索过滤
  useEffect(() => {
    if (!searchWord || searchWord.trim() === "") {
      setShownData(tableData)
      return
    }
    const filtered = tableData.filter((record) => {
      const target = [record.name, record.shortName, record.description, record.alias]
      return isMatch(target, searchWord, true)
    })
    setShownData(filtered)
  }, [tableData, searchWord])

  const onSearch = (value) => {
    setSearchWord(value)
  }

  const [columns, setColumns] = useState([])
  useEffect(() => {
    setColumns(buildColumns())
  }, [])

  const buildColumns = () => {
    return [
      {
        title: getLang("column_extension"),
        dataIndex: "name",
        key: "name",
        width: 380,
        render: (name, record) => {
          return <ExtensionNameItem name={name} record={record} reload={() => {}}></ExtensionNameItem>
        }
      },
      {
        title: "所属模式",
        dataIndex: "otherModes",
        key: "otherModes",
        width: 120,
        render: (modes) => {
          if (!modes || modes.length === 0) {
            return <span style={{ color: "#999" }}>-</span>
          }
          return (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {modes.map((m) => (
                <span key={m} style={{ fontSize: 12, padding: "2px 6px", background: "#f0f0f0", borderRadius: 4 }}>
                  {m}
                </span>
              ))}
            </div>
          )
        }
      },
      {
        title: getLang("column_operation"),
        key: "operation",
        width: 180,
        render: (_, record) => {
          return <ExtensionOperationItem record={record} options={options}></ExtensionOperationItem>
        }
      }
    ]
  }

  return (
    <ModeTableContentStyle>
      {contextHolder}
      {shownData.length > 0 ? (
        <Table
          size="middle"
          pagination={{ pageSize: 100, showSizeChanger: false }}
          scroll={{ y: "calc(100vh - 290px)" }}
          columns={columns}
          dataSource={shownData}
          rowKey="id"
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </ModeTableContentStyle>
  )
})

/**
 * 构建表格数据
 */
function buildTableData(extensions, currentMode, modeList) {
  return extensions.map((ext) => {
    // 找出扩展所属的其他模式
    const otherModes = modeList
      .filter((m) => {
        if (!m.extensions || m.id === currentMode.id) {
          return false
        }
        return m.extensions.includes(ext.id)
      })
      .map((m) => m.name)

    return {
      ...ext,
      otherModes
    }
  })
}

/**
 * 搜索匹配函数（复用自 searchHelper）
 */
function isMatch(targets, searchText, ignoreCase) {
  if (!searchText || searchText.trim() === "") {
    return true
  }
  const search = ignoreCase ? searchText.toLowerCase() : searchText
  return targets.some((target) => {
    if (!target) {
      return false
    }
    const text = ignoreCase ? String(target).toLowerCase() : String(target)
    return text.includes(search)
  })
}

export default ModeTableContent
```

**Step 2: 创建表格样式文件**

创建 `src/pages/Options/mode/ModeTableContentStyle.js`:

```javascript
import styled from "styled-components"

export const ModeTableContentStyle = styled.div`
  .ant-table-wrapper {
    .ant-table-tbody > tr > td {
      padding: 8px 12px;
    }
  }
`
```

**Step 3: 提交**

```bash
git add src/pages/Options/mode/ModeTableContent.jsx src/pages/Options/mode/ModeTableContentStyle.js
git commit -m "feat: create ModeTableContent table component"
```

---

## Task 2: 修改 ModeContent 添加视图切换

**Files:**
- Modify: `src/pages/Options/mode/ModeContent.jsx`
- Modify: `src/pages/Options/mode/ModeContentStyle.js`

**Step 1: 添加视图状态和切换器**

修改 `src/pages/Options/mode/ModeContent.jsx`:

在文件顶部添加导入:
```javascript
import { Segmented } from "antd"
```

在 `ModeContent` 组件内，`searchWord` 状态后添加:
```javascript
// 视图模式：grid（网格）或 table（表格）
const [viewMode, setViewMode] = useState("grid")
```

在 `onSearch` 函数后添加:
```javascript
// 视图切换处理
const onViewModeChange = (value) => {
  setViewMode(value)
  // 保存到本地存储
  const local = new LocalOptions()
  local.setValue("modeViewMode", value).catch((err) => {
    console.error("[ModeContent] Failed to save viewMode:", err)
  })
}
```

**Step 2: 添加初始化视图模式**

在现有的 `useEffect` hooks 之后添加:
```javascript
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
```

**Step 3: 修改渲染结构**

将 `return` 中的 `<div className="search-sort-bar">` 部分修改为:
```javascript
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
```

**Step 4: 添加条件渲染和组件导入**

在文件顶部添加导入:
```javascript
import ModeTableContent from "./ModeTableContent.jsx"
import { LocalOptions } from ".../storage/local"
```

在 `return` 的 `<ModeContentStyle>` 内，条件渲染网格或表格视图。

找到两个 `<Divider>` 及其内容，将整个"已启用"和"未启用"部分替换为:

```javascript
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
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
```

**Step 5: 更新样式**

修改 `src/pages/Options/mode/ModeContentStyle.js`，在 `.search-sort-bar` 样式中添加 flex 布局:

```javascript
export const ModeContentStyle = styled.div`
  /* ... 现有样式 ... */

  .search-sort-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 12px;

    .search {
      flex: 1;
    }
  }
`
```

**Step 6: 提交**

```bash
git add src/pages/Options/mode/ModeContent.jsx src/pages/Options/mode/ModeContentStyle.js
git commit -m "feat: add view mode switcher (grid/table) to ModeContent"
```

---

## Task 3: 更新导航移除扩展管理入口

**Files:**
- Modify: `src/pages/Options/navigation/Navigation.jsx`

**Step 1: 移除扩展管理菜单项**

找到 `Navigation.jsx` 中扩展管理相关的菜单项并删除。

通常类似这样:
```javascript
// 删除类似这样的菜单项
{
  key: "extension-manage",
  label: "扩展管理",
  // ...
}
```

**Step 2: 提交**

```bash
git add src/pages/Options/navigation/Navigation.jsx
git commit -m "refactor: remove extension management from navigation"
```

---

## Task 4: 删除废弃的扩展管理文件

**Files:**
- Delete: `src/pages/Options/management/ExtensionManage.jsx`
- Delete: `src/pages/Options/management/ExtensionManageStyle.js`
- Delete: `src/pages/Options/management/ExtensionManageIndex.jsx`
- Delete: `src/pages/Options/management/ExtensionManageTable.jsx`
- Delete: `src/pages/Options/management/ExtensionNameItem.jsx`

**Step 1: 删除文件**

```bash
rm src/pages/Options/management/ExtensionManage.jsx
rm src/pages/Options/management/ExtensionManageStyle.js
rm src/pages/Options/management/ExtensionManageIndex.jsx
rm src/pages/Options/management/ExtensionManageTable.jsx
rm src/pages/Options/management/ExtensionNameItem.jsx
```

**Step 2: 提交**

```bash
git add -A
git commit -m "refactor: remove deprecated extension management files"
```

---

## Task 5: 清理导入引用

**Files:**
- Modify: 搜索并更新任何引用已删除文件的代码

**Step 1: 搜索残留引用**

```bash
grep -r "ExtensionManage" src/ --include="*.jsx" --include="*.js"
```

**Step 2: 清理路由配置**

如果有路由配置引用了扩展管理页面，将其移除。

**Step 3: 提交**

```bash
git add -A
git commit -m "chore: clean up extension management imports"
```

---

## Task 6: 验证功能

**Step 1: 启动开发服务器**

```bash
npm run dev
# 或
npm start
```

**Step 2: 测试功能**

- [ ] 打开模式管理页面
- [ ] 切换到任意模式
- [ ] 点击"列表"切换到表格视图
- [ ] 验证表格显示当前模式的扩展
- [ ] 验证搜索功能正常
- [ ] 验证操作按钮（启用/禁用、设置、卸载）正常
- [ ] 切换到"网格"视图
- [ ] 刷新页面，验证视图模式被记住
- [ ] 切换到不同模式，验证表格数据更新

**Step 3: 提交最终版本**

```bash
git add -A
git commit -m "test: verify mode table view functionality"
```

---

## 测试检查清单

- [ ] 网格视图显示正常
- [ ] 表格视图显示正常
- [ ] 视图切换流畅无错误
- [ ] 视图模式持久化（刷新后保持）
- [ ] 搜索功能在两种视图下都正常
- [ ] 扩展操作（启用/禁用、设置、卸载）正常
- [ ] 空状态显示正确
- [ ] 所属模式标签显示正确
- [ ] 导航中无扩展管理入口

## 可选优化（延后）

- [ ] 添加表格列排序功能
- [ ] 添加表格列筛选功能
- [ ] 优化移动端响应式布局

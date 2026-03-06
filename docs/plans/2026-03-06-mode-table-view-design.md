# 模式管理表格视图设计文档

**日期**: 2026-03-06
**目标**: 将扩展管理功能合并到模式管理页面，添加网格/列表视图切换

## 1. 需求概述

扩展管理的独立存在意义不大，因为扩展启用/禁用状态与模式强绑定。本设计将扩展管理合并到模式管理页面，提供网格和表格两种视图方式。

## 2. 组件架构

### 2.1 新增组件

**`ModeTableContent.jsx`** - 表格视图组件
- 位置: `src/pages/Options/mode/ModeTableContent.jsx`
- Props:
  ```javascript
  {
    mode: Mode,              // 当前模式
    extensions: Extension[], // 当前模式的扩展列表
    modeList: Mode[],        // 所有模式列表
    options: Options         // 全局配置
  }
  ```

### 2.2 修改组件

| 组件 | 修改内容 |
|------|----------|
| `ModeContent.jsx` | 添加 Segmented 切换器、条件渲染网格/表格视图 |
| `ModeContentStyle.js` | 添加 Segmented 样式 |
| `LocalOptions` | 添加 `modeViewMode` 键支持 |

### 2.3 组件层级

```
IndexMode (模式管理页面)
├── ModeNav (左侧导航)
└── ModeContent (右侧内容区)
    ├── Segmented (视图切换器)
    ├── Search (搜索框)
    ├── ModeContentSpace (网格视图)
    └── ModeTableContent (表格视图)
```

## 3. 数据流与状态

### 3.1 状态设计

```javascript
// ModeContent 内部状态
const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
```

### 3.2 视图切换流程

1. 用户点击 Segmented 切换视图
2. 更新 `viewMode` 状态
3. 保存到 `LocalOptions.modeViewMode`
4. 重新渲染对应视图组件

### 3.3 初始化流程

```
组件挂载 → 读取 LocalOptions.modeViewMode → 有值则恢复，无值默认 'grid' → 渲染
```

## 4. UI 设计

### 4.1 搜索工具栏

```jsx
<div className="search-sort-bar">
  <Search placeholder="搜索扩展" allowClear />
  <Segmented
    value={viewMode}
    onChange={setViewMode}
    options={[
      { label: '网格', value: 'grid' },
      { label: '列表', value: 'table' }
    ]}
  />
</div>
```

### 4.2 表格列

| 列名 | 宽度 | 内容 |
|------|------|------|
| 状态 | 60px | Switch 启用/禁用 |
| 扩展名称 | 380px | 图标 + 名称 + 描述 |
| 所属模式 | 120px | 其他模式标签 |
| 操作 | 180px | 设置、商店、主页、卸载 |

### 4.3 空状态

- 当前模式无扩展: `<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />`
- 搜索无结果: 同上

## 5. 文件变更清单

### 5.1 新增文件

| 文件 | 说明 |
|------|------|
| `src/pages/Options/mode/ModeTableContent.jsx` | 表格视图组件 |
| `src/pages/Options/mode/ModeTableContentStyle.js` | 表格视图样式 |

### 5.2 修改文件

| 文件 | 修改内容 |
|------|----------|
| `src/pages/Options/mode/ModeContent.jsx` | 添加视图切换逻辑 |
| `src/pages/Options/mode/ModeContentStyle.js` | 添加 Segmented 样式 |
| `src/storage/local.js` | 添加 modeViewMode 支持 |
| `src/pages/Options/navigation/Navigation.jsx` | 移除扩展管理菜单项 |

### 5.3 删除文件

```
src/pages/Options/management/
├── ExtensionManage.jsx
├── ExtensionManageStyle.js
├── ExtensionManageIndex.jsx
├── ExtensionManageTable.jsx
└── ExtensionNameItem.jsx
```

### 5.4 复用组件

以下组件保留，供 `ModeTableContent` 复用：
- `ExtensionOperationItem.jsx` - 操作按钮
- `ExtensionChannelLabel.jsx` - 渠道标签
- `utils.js` - 工具函数

## 6. 实施步骤

1. **阶段一**: 创建 `ModeTableContent` 组件
2. **阶段二**: 修改 `ModeContent` 添加视图切换
3. **阶段三**: 添加 `LocalOptions.modeViewMode` 持久化
4. **阶段四**: 更新导航，移除扩展管理入口
5. **阶段五**: 删除废弃文件

# Extension Manager

> 一个轻量、支持模式管理的浏览器扩展管理工具

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web_Store-green.svg)](https://chrome.google.com/webstore)
[![Edge Add-ons](https://img.shields.io/badge/Edge-Add_ons-blue.svg)](https://microsoftedge.microsoft.com/addons)

## 功能特性

- **模式管理** - 创建自定义模式，一键切换不同场景下的扩展组合
  - 内置默认、极简、开发三种模式
  - 支持自定义创建新模式
  - 拖拽排序扩展列表
- **扩展管理** - 快速启用/禁用扩展
  - 支持本地搜索和商店搜索
  - 按名称或安装时间排序
  - 批量启用/禁用操作
- **导入/导出** - 分享你的扩展配置
  - 支持导出为文本文件
  - 从剪贴板或文件导入
  - 选择性导出部分扩展
- **历史记录** - 追踪扩展操作历史
  - 记录安装、卸载、启用、禁用等操作
  - 按扩展筛选历史记录
- **主题支持** - 浅色/深色/跟随系统
- **多语言** - 支持中文和英文

## 安装

### Chrome / Edge (Chromium)

1. 下载最新的 `extension-manager-chrome-*.zip` 文件
2. 解压 zip 文件
3. 打开浏览器的扩展管理页面：
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的文件夹

### 从商店安装

> 即将上架 Chrome Web Store 和 Edge Add-ons

## 开发

```bash
# 安装依赖
npm install

# 开发模式（Chrome）
npm start

# 构建 Chrome 版本
npm run build

# 构建 Edge 版本
npm run build:edge

# 代码格式化
npm run prettier
```

## 项目结构

```
src/
├── pages/
│   ├── Background/     # 后台服务
│   ├── Options/        # 选项页面
│   └── Popup/          # 弹出窗口
├── _locales/          # 国际化文件
├── manifest.json      # 扩展清单
└── theme/            # 主题配置
```

## 截图

### 模式管理
创建不同的模式，一键切换扩展组合：

### 扩展管理
快速管理所有已安装的扩展：

### 导入导出
分享你的扩展配置给朋友：

## 常见问题

### 如何创建新模式？

1. 打开扩展选项页面
2. 进入"模式管理"标签
3. 点击"新模式"按钮
4. 设置模式名称和需要启用的扩展
5. 保存即可

### 模式之间如何切换？

在弹出窗口（Popup）中点击模式按钮即可快速切换。

### 如何导入扩展配置？

1. 进入"导入扩展"页面
2. 选择从剪贴板粘贴或从文件读取
3. 确认导入的扩展列表
4. 点击"安装扩展"完成导入

## 致谢

本项目基于 [auto-extension-manager](https://github.com/ZJYYDS/auto-extension-manager) 修改而来，感谢原作者的贡献。

## 许可证

[AGPL-3.0](LICENSE)

---

Made with ❤️ by [fxzer](https://github.com/fxzer)

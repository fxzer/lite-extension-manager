# Lite Extension Manager

> 一个轻量、支持模式管理的浏览器扩展管理工具

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web_Store-green.svg)](https://chrome.google.com/webstore)
[![Edge Add-ons](https://img.shields.io/badge/Edge-Add_ons-blue.svg)](https://microsoftedge.microsoft.com/addons)

## 功能特性

- **模式管理** - 创建自定义模式，一键切换不同场景下的扩展组合
- **扩展管理** - 快速启用/禁用扩展，支持搜索、排序和批量操作
- **导入/导出** - 分享你的扩展配置，支持文本文件和剪贴板
- **历史记录** - 追踪扩展的安装、卸载、启用、禁用等操作
- **主题支持** - 支持浅色、深色和跟随系统主题
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

<div align="center">
  <img src="./docs/screenshot.svg" alt="Extension Manager 截图" width="800">
</div>





## 致谢

本项目基于 [auto-extension-manager](https://github.com/JasonGrass/auto-extension-manager) 修改而来，感谢原作者的贡献。

## 许可证

[AGPL-3.0](LICENSE)

---

Made with ❤️ by [fxzer](https://github.com/fxzer)

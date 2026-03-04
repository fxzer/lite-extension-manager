import React, { memo, useEffect, useState } from "react"

import {
  CheckOutlined,
  CloseOutlined,
  MenuOutlined,
  MinusOutlined,
  PlusOutlined
} from "@ant-design/icons"
import { Dropdown, Space } from "antd"

import storage from ".../storage/sync"
import { getLang } from ".../utils/utils"

const ZOOM_MIN = 50
const ZOOM_MAX = 100
const ZOOM_STEP = 5

/**
 * 时间切片工具函数：让出主线程，允许浏览器 UI 渲染
 * @param {number} ms 延迟毫秒数，默认 25ms（约 40fps）
 * @returns {Promise<void>}
 */
const yieldToMain = (ms = 25) => new Promise((resolve) => setTimeout(resolve, ms))

const MoreOperationDropdown = memo(({ options, className, messageApi }) => {
  const [hasEnabledExtensions, setHasEnabledExtensions] = useState(true)
  const [zoomRatio, setZoomRatio] = useState(options?.setting?.zoomRatio ?? 100)

  const onZoomChange = async (delta) => {
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomRatio + delta))
    if (next === zoomRatio) return
    setZoomRatio(next)
    document.body.style.zoom = next / 100
    const allOptions = await storage.options.getAll()
    const setting = { ...allOptions.setting, zoomRatio: next }
    await storage.options.set({ setting })
  }

  // 检查是否还有已启用的扩展
  const checkEnabledState = async () => {
    const allExtensions = await chrome.management.getAll()
    const self = await chrome.management.getSelf()
    const selfId = self.id
    const anyEnabled = allExtensions.some(
      (ext) => ext.type === "extension" && ext.id !== selfId && ext.enabled
    )
    setHasEnabledExtensions(anyEnabled)
  }

  /**
   * 禁用全部扩展（除了自己）- 性能优化版本
   * 优化策略：
   * - 时间切片：每次操作后让出主线程
   * - 正确的 async/await：等待每次操作完成
   * - 错误处理：捕获单个扩展失败不影响整体
   */
  const disableAllExtension = async () => {
    const allExtensions = await chrome.management.getAll()
    const self = await chrome.management.getSelf()
    const selfId = self.id

    for (const ext of allExtensions) {
      if (ext.id === selfId) continue
      if (ext.type !== "extension" || ext.enabled === false) continue
      try {
        await chrome.management.setEnabled(ext.id, false)
        // ✅ 时间切片：让浏览器 UI 保持响应
        await yieldToMain()
      } catch (error) {
        console.warn(`[disable all] failed for ${ext.id}`, error)
      }
    }
    setHasEnabledExtensions(false)
  }

  /**
   * 启用全部扩展（除了自己）- 性能优化版本
   * 优化策略：
   * - 时间切片：每次操作后让出主线程
   * - 正确的 async/await：等待每次操作完成
   * - 错误处理：捕获单个扩展失败不影响整体
   */
  const enableAllExtension = async () => {
    const allExtensions = await chrome.management.getAll()
    const self = await chrome.management.getSelf()
    const selfId = self.id

    for (const ext of allExtensions) {
      if (ext.id === selfId) continue
      if (ext.type !== "extension" || ext.enabled === true) continue
      try {
        await chrome.management.setEnabled(ext.id, true)
        // ✅ 时间切片：让浏览器 UI 保持响应
        await yieldToMain()
      } catch (error) {
        console.warn(`[enable all] failed for ${ext.id}`, error)
      }
    }
    setHasEnabledExtensions(true)
  }

  // MenuProps["items"]
  const toggleAllExtItem = hasEnabledExtensions
    ? {
      key: "disable-all-ext",
      label: getLang("disable_all_extensions"),
      icon: <CloseOutlined />,
      danger: true,
      onClick: disableAllExtension
    }
    : {
      key: "enable-all-ext",
      label: getLang("enable_all_extensions"),
      icon: <CheckOutlined />,
      onClick: enableAllExtension
    }

  const zoomItem = {
    key: "zoom-control",
    label: (
      <div className="zoom-control-row" onClick={(e) => e.stopPropagation()}>
        <div className="zoom-stepper">
          <MinusOutlined
            className={`zoom-btn${zoomRatio <= ZOOM_MIN ? " zoom-btn-disabled" : ""}`}
            onClick={(e) => {
              e.stopPropagation()
              onZoomChange(-ZOOM_STEP)
            }}
          />
          <span className="zoom-value">{zoomRatio}%</span>
          <PlusOutlined
            className={`zoom-btn${zoomRatio >= ZOOM_MAX ? " zoom-btn-disabled" : ""}`}
            onClick={(e) => {
              e.stopPropagation()
              onZoomChange(ZOOM_STEP)
            }}
          />
        </div>
      </div>
    )
  }

  const moreOperationMenuItems = [
    zoomItem,
    { type: "divider" },
    toggleAllExtItem
  ]

  return (
    <div className={className}>
      <Space className="setting-icon">
        <Dropdown
          menu={{ items: moreOperationMenuItems }}
          placement="bottomLeft"
          trigger={["click"]}
          overlayClassName="more-op-dropdown-overlay">
          <MenuOutlined />
        </Dropdown>
      </Space>
    </div>
  )
})

export default MoreOperationDropdown

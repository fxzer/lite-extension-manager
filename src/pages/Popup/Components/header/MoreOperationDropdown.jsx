import React, { memo, useEffect, useState } from "react"

import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  EditOutlined,
  MenuOutlined,
  MinusOutlined,
  PlusOutlined,
  RedoOutlined
} from "@ant-design/icons"
import { Dropdown, Space } from "antd"
import dayjs from "dayjs"
import localforage from "localforage"

import storage from ".../storage/sync"
import { getLang } from ".../utils/utils"

const forage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "Popup",
  version: 1.0,
  storeName: "ext-snapshot"
})

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
  const [refreshKey, setRefreshKey] = useState(0)
  const [zoomRatio, setZoomRatio] = useState(options?.setting?.zoomRatio ?? 100)

  useEffect(() => {
    readSnapshot()
    checkEnabledState()
  }, [refreshKey])

  const onZoomChange = async (delta) => {
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomRatio + delta))
    if (next === zoomRatio) return
    setZoomRatio(next)
    document.body.style.zoom = next / 100
    const allOptions = await storage.options.getAll()
    const setting = { ...allOptions.setting, zoomRatio: next }
    await storage.options.set({ setting })
  }

  // 删除所有快照
  const deleteAllSnapshot = async () => {
    forage.clear()
    messageApi.info(getLang("snapshot_delete_all_success"))
    updateView()
  }

  // 初始化快照子菜单
  const initSnapshotMenu = [
    {
      key: "delete-all-snapshot",
      label: getLang("snapshot_delete_all"),
      onClick: deleteAllSnapshot
    }
  ]

  const [snapshotMenuList, setSnapshotMenuList] = useState(initSnapshotMenu)

  /**
   * 恢复快照（智能跳过策略 + 性能优化版本）
   *
   * 优化策略：
   * 1. 预先获取已安装扩展列表（1 次 API 调用）
   * 2. 用 Set.has() 预检查扩展是否存在（O(1) 查找）
   * 3. 跳过已卸载的扩展，不调用 setEnabled()（避免浪费 API 调用）
   * 4. 时间切片：每次操作后让出主线程
   * 5. 错误处理：捕获单个扩展失败不影响整体
   *
   * 性能对比：
   * - 旧方案：N 次 setEnabled() 调用，包括已卸载的扩展
   * - 新方案：1 次 getAll() + M 次 setEnabled()（M = 已安装扩展数）
   */
  async function resumeSnapshot(snapshot) {
    messageApi.info(getLang("snapshot_resume_success", snapshot.name || snapshot.key))

    // ✅ 优化：预先批量获取已安装扩展列表（1 次 API 调用）
    const installedExtensions = await chrome.management.getAll()
    const installedIds = new Set(installedExtensions.map((ext) => ext.id))

    // 统计信息
    let skippedCount = 0
    let restoredCount = 0
    let failedCount = 0

    for (const extState of snapshot.states) {
      // ✅ 优化：预检查扩展是否存在（O(1) 查找）
      if (!installedIds.has(extState.id)) {
        skippedCount++
        continue
      }

      // 只处理已安装的扩展
      try {
        await chrome.management.setEnabled(extState.id, extState.enabled)
        // ✅ 时间切片：让浏览器 UI 保持响应
        await yieldToMain()
        restoredCount++
      } catch (ex) {
        console.warn(`[快照恢复] ${extState.id} 恢复失败`, ex)
        failedCount++
      }
    }

    // ✅ 输出恢复统计

    updateView()
  }

  function deleteSnapshot(snapshot) {
    messageApi.info(getLang("snapshot_delete_success", snapshot.name || snapshot.key))
    forage.removeItem(snapshot.key)
    updateView()
  }

  function renameSnapshot(snapshot) {
    const newName = prompt(
      getLang("snapshot_rename") || "Rename snapshot",
      snapshot.name || snapshot.key
    )
    if (newName !== null && newName.trim() !== "") {
      snapshot.name = newName.trim()
      forage.setItem(snapshot.key, snapshot)
      messageApi.info(getLang("snapshot_rename_success", newName.trim()))
      updateView()
    }
  }

  function updateView() {
    setRefreshKey((prevKey) => prevKey + 1)
  }

  const readSnapshot = async () => {
    const allSnapshotKeys = await forage.keys()
    const snapshotItems = []
    for (const key of allSnapshotKeys) {
      const snapshot = await forage.getItem(key)
      const resumeOne = () => {
        resumeSnapshot(snapshot)
      }
      const deleteOne = () => {
        deleteSnapshot(snapshot)
      }
      const renameOne = () => {
        renameSnapshot(snapshot)
      }

      snapshotItems.push({
        key: key,
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="snapshot-label" onClick={resumeOne} style={{ flex: 1 }}>
              {snapshot.name || key}
            </span>
            <Space className="snapshot-action-btn snapshot-rename-btn" onClick={renameOne}>
              <EditOutlined />
            </Space>
            <Space className="snapshot-action-btn snapshot-close-btn" onClick={deleteOne}>
              <CloseOutlined />
            </Space>
          </span>
        )
      })
    }
    snapshotItems.sort((a, b) => (Number(a.key) || 0) - (Number(b.key) || 0))
    setSnapshotMenuList([...snapshotItems, ...initSnapshotMenu])
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

  // 保存当前快照
  const saveExtensionStateSnapshot = async () => {
    const allExtensions = await chrome.management.getAll()
    const self = await chrome.management.getSelf()
    const selfId = self.id
    const extSnapshotStats = []
    for (const ext of allExtensions) {
      if (ext.id === selfId) {
        continue
      }
      if (ext.type !== "extension") {
        continue
      }

      // 获取图标 URL
      let iconUrl = null
      if (ext.icons && ext.icons.length > 0) {
        const largestIcon = ext.icons.reduce((prev, current) =>
          current.size > prev.size ? current : prev
        )
        iconUrl = largestIcon.url
      }

      // 获取商店 URL
      const webStoreUrl = ext.webStoreUrl || `https://chrome.google.com/webstore/detail/${ext.id}`

      extSnapshotStats.push({
        id: ext.id,
        enabled: ext.enabled,
        name: ext.name,
        iconUrl: iconUrl,
        homepageUrl: ext.homepageUrl || null,
        webStoreUrl: webStoreUrl
      })
    }

    if (extSnapshotStats.length < 1) {
      messageApi.info(getLang("snapshot_no_extensions"))
      return
    }

    const now = Date.now()
    const snapshotKey = now
    const snapshotName = dayjs(now).format("MMDD-HHmm")
    forage.setItem(snapshotKey, {
      key: snapshotKey,
      name: snapshotName,
      states: extSnapshotStats
    })
    messageApi.info(getLang("snapshot_save_success", snapshotName))

    updateView()
  }

  // MenuProps["items"]
  const toggleAllExtItem = hasEnabledExtensions
    ? {
      key: "disable-all-ext",
      label: getLang("snapshot_disable_all"),
      icon: <CloseOutlined />,
      danger: true,
      onClick: disableAllExtension
    }
    : {
      key: "enable-all-ext",
      label: getLang("snapshot_enable_all"),
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
    toggleAllExtItem,
    {
      key: "save-ext-snapshot",
      label: getLang("snapshot_capture"),
      icon: <CopyOutlined />,
      onClick: saveExtensionStateSnapshot
    },
    {
      key: "restore-snapshot",
      label: getLang("snapshot_restore"),
      icon: <RedoOutlined />,
      children: snapshotMenuList
    }
  ]

  return (
    <div className={className} key={refreshKey}>
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

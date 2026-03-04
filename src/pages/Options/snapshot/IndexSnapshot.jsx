import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { InfoCircleOutlined, RedoOutlined } from "@ant-design/icons"
import { Alert, Button, message } from "antd"
import localforage from "localforage"

import analytics from ".../utils/googleAnalyze.js"
import { getLang } from ".../utils/utils.js"
import Title from "../Title.jsx"
import { SnapshotStyle } from "./IndexSnapshotStyle.js"
import SnapshotNav from "./SnapshotNav.jsx"
import SnapshotContent from "./SnapshotContent.jsx"

const forage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "Popup",
  version: 1.0,
  storeName: "ext-snapshot"
})

/**
 * 时间切片工具函数：让出主线程，允许浏览器 UI 渲染
 */
const yieldToMain = (ms = 25) => new Promise((resolve) => setTimeout(resolve, ms))

function SnapshotManagement() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const paramSnapshotKey = searchParams.get("key")

  const [extensions, setExtensions] = useState([])
  const [selectedSnapshot, setSelectedSnapshot] = useState()
  const [snapshotList, setSnapshotList] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  const [messageApi, contextHolder] = message.useMessage()

  // 从 storage 同步的扩展信息（用于显示扩展名称和图标）
  const [extensionMap, setExtensionMap] = useState(new Map())

  // 加载所有快照
  const loadSnapshots = async () => {
    try {
      const allSnapshotKeys = await forage.keys()
      const snapshots = []
      for (const key of allSnapshotKeys) {
        const snapshot = await forage.getItem(key)
        if (snapshot) {
          snapshots.push(snapshot)
        }
      }
      snapshots.sort((a, b) => (Number(a.key) || 0) - (Number(b.key) || 0))
      setSnapshotList(snapshots)
    } catch (error) {
      console.error("[Snapshot] Failed to load snapshots:", error)
    }
  }

  // 初始化
  useEffect(() => {
    // 获取已安装扩展列表
    chrome.management.getAll().then((exts) => {
      const filtered = exts.filter(
        (ext) => ext.type === "extension" && !ext.isApp
      )
      setExtensions(filtered)

      // 构建 ID 到扩展信息的映射
      const map = new Map()
      filtered.forEach((ext) => {
        map.set(ext.id, ext)
      })
      setExtensionMap(map)
    })

    loadSnapshots()

    analytics.fireEvent("snapshot_setting_open", {
      totalCount: snapshotList.length
    })
  }, [])

  // 如果 URL 中有 key 参数，则切换到对应快照
  useEffect(() => {
    if (!paramSnapshotKey) {
      return
    }
    const snapshot = snapshotList.find((s) => s.key === paramSnapshotKey)
    if (snapshot) {
      setSelectedSnapshot(snapshot)
      searchParams.delete("key")
      navigate(`?${searchParams.toString()}`, { replace: true })
    } else {
      messageApi.warning(`Snapshot ${paramSnapshotKey} not found`)
      setTimeout(() => {
        searchParams.delete("key")
        navigate(`?${searchParams.toString()}`, { replace: true })
      }, 2000)
    }
  }, [snapshotList, paramSnapshotKey, messageApi])

  // 初始化时恢复上次选中的快照
  useEffect(() => {
    if (isInitialized) {
      return
    }
    if (paramSnapshotKey) {
      return
    }
    if (!snapshotList || snapshotList.length === 0) {
      return
    }

    // 默认选择第一个快照
    if (snapshotList[0]) {
      setSelectedSnapshot(snapshotList[0])
      setIsInitialized(true)
    }
  }, [isInitialized, paramSnapshotKey, snapshotList])

  // 标记初始化完成（当有 URL 参数时）
  useEffect(() => {
    if (paramSnapshotKey && selectedSnapshot && !isInitialized) {
      setIsInitialized(true)
    }
  }, [paramSnapshotKey, selectedSnapshot, isInitialized])

  const onSelectedChanged = async (snapshot) => {
    setSelectedSnapshot(snapshot)
  }

  const onSnapshotDeleted = async () => {
    await loadSnapshots()
  }

  const onSnapshotRenamed = async (snapshot) => {
    await loadSnapshots()
    if (selectedSnapshot?.key === snapshot.key) {
      setSelectedSnapshot(snapshot)
    }
  }

  // 恢复快照
  const handleRestoreSnapshot = async () => {
    if (!selectedSnapshot) {
      return
    }

    messageApi.info(getLang("snapshot_resume_success", selectedSnapshot.name || selectedSnapshot.key))

    const installedExtensions = await chrome.management.getAll()
    const installedIds = new Set(installedExtensions.map((ext) => ext.id))

    let skippedCount = 0
    let restoredCount = 0
    let failedCount = 0

    for (const extState of selectedSnapshot.states) {
      if (!installedIds.has(extState.id)) {
        skippedCount++
        continue
      }

      try {
        await chrome.management.setEnabled(extState.id, extState.enabled)
        await yieldToMain()
        restoredCount++
      } catch (ex) {
        console.warn(`[快照恢复] ${extState.id} 恢复失败`, ex)
        failedCount++
      }
    }

    // 刷新扩展列表
    const allExtensions = await chrome.management.getAll()
    const filtered = allExtensions.filter(
      (ext) => ext.type === "extension" && !ext.isApp
    )
    setExtensions(filtered)

    messageApi.success(
      getLang("snapshot_restore_complete") +
        `: ${getLang("snapshot_restored_count", restoredCount)}` +
        (skippedCount > 0 ? ` ${getLang("snapshot_skipped_count", skippedCount)}` : "") +
        (failedCount > 0 ? ` ${getLang("snapshot_failed_count", failedCount)}` : "")
    )
  }

  return (
    <SnapshotStyle>
      <Title title={getLang("snapshot_title")}></Title>
      {contextHolder}
      <Alert
        description={getLang("snapshot_description")}
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 16 }}
      />
      <div className="snapshot-container">
        <SnapshotNav
          snapshotList={snapshotList}
          current={selectedSnapshot}
          onSelectedChanged={onSelectedChanged}
          onSnapshotDeleted={onSnapshotDeleted}
          onSnapshotRenamed={onSnapshotRenamed}
        />
      </div>

      {selectedSnapshot && (
        <>
          <div className="restore-action-bar">
            <Button
              type="primary"
              icon={<RedoOutlined />}
              onClick={handleRestoreSnapshot}
              size="large">
              {getLang("snapshot_restore_button")}
            </Button>
          </div>

          <SnapshotContent
            snapshot={selectedSnapshot}
            extensionMap={extensionMap}
            extensions={extensions}
          />
        </>
      )}
    </SnapshotStyle>
  )
}

export default SnapshotManagement

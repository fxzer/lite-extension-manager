import React, { useState } from "react"

import { CloseCircleFilled } from "@ant-design/icons"
import { Modal, message } from "antd"
import classNames from "classnames"
import localforage from "localforage"

import { getLang } from ".../utils/utils"
import { SnapshotNavStyle } from "./SnapshotNavStyle"

const forage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "Popup",
  version: 1.0,
  storeName: "ext-snapshot"
})

function SnapshotNav({
  snapshotList,
  current,
  onSelectedChanged,
  onSnapshotDeleted,
  onSnapshotRenamed
}) {
  const [messageApi, contextHolder] = message.useMessage()

  const [editingSnapshotKey, setEditingSnapshotKey] = useState(null)
  const [editingSnapshotName, setEditingSnapshotName] = useState("")

  const onSnapshotTabClick = (e, snapshot) => {
    onSelectedChanged?.(snapshot)
  }

  const saveEdit = async (snapshot) => {
    if (!editingSnapshotName || editingSnapshotName.trim() === "") {
      messageApi.warning(getLang("snapshot_name_cannot_empty"))
      return
    }

    if (editingSnapshotName !== snapshot.name) {
      try {
        snapshot.name = editingSnapshotName.trim()
        await forage.setItem(snapshot.key, snapshot)
        onSnapshotRenamed?.(snapshot)
      } catch (error) {
        messageApi.error(error.message)
      }
    }
    setEditingSnapshotKey(null)
  }

  const handleSnapshotNameChange = (e) => {
    setEditingSnapshotName(e.target.value)
  }

  const onDeleteSnapshotClick = (e, snapshot) => {
    e.stopPropagation()

    Modal.confirm({
      title: getLang("snapshot_delete_title"),
      content: getLang("snapshot_delete_confirm", snapshot.name || snapshot.key),
      okText: getLang("confirm_ok"),
      cancelText: getLang("confirm_cancel"),
      onOk: async () => {
        await forage.removeItem(snapshot.key)
        if (snapshot.key === current?.key) {
          const remaining = snapshotList.filter((s) => s.key !== snapshot.key)
          if (remaining.length > 0) {
            onSelectedChanged?.(remaining[0])
          } else {
            onSelectedChanged?.(null)
          }
        }
        onSnapshotDeleted?.()
        messageApi.success(getLang("snapshot_delete_success", snapshot.name || snapshot.key))
      }
    })
  }

  // 开始编辑快照名
  const startEdit = (e, snapshot) => {
    e.stopPropagation()
    setEditingSnapshotKey(snapshot.key)
    setEditingSnapshotName(snapshot.name || snapshot.key)
  }

  // 单个 Snapshot Item 的显示
  const buildSnapshotItemView = (snapshot) => {
    const isEditing = editingSnapshotKey === snapshot.key

    return (
      <div
        className={classNames(["tab-container", { "selected-snapshot-item": snapshot.key === current?.key }])}
        onClick={(e) => !isEditing && onSnapshotTabClick(e, snapshot)}>
        {isEditing ? (
          <input
            className="edit-input"
            autoFocus
            value={editingSnapshotName}
            onChange={handleSnapshotNameChange}
            onBlur={() => saveEdit(snapshot)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveEdit(snapshot)
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            title={snapshot.name || snapshot.key}
            className="editable-name"
            onDoubleClick={(e) => startEdit(e, snapshot)}>
            {snapshot.name || snapshot.key}
          </h3>
        )}

        {!isEditing && (
          <span
            className="delete-confirm"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteSnapshotClick(e, snapshot)
            }}>
            <CloseCircleFilled className="delete-icon" />
          </span>
        )}
      </div>
    )
  }

  return (
    <SnapshotNavStyle>
      {contextHolder}
      {snapshotList.length > 0 ? (
        <div>
          {snapshotList.map((snapshotItem) => (
            <div className="item-container" key={snapshotItem.key}>
              {buildSnapshotItemView(snapshotItem)}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {getLang("snapshot_empty_state")}
        </div>
      )}
    </SnapshotNavStyle>
  )
}

export default SnapshotNav

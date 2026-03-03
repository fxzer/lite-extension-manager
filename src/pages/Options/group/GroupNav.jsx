import React, { useEffect, useState } from "react"

import { CloseOutlined, PlusOutlined } from "@ant-design/icons"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { Modal, message } from "antd"
import classNames from "classnames"
import { nanoid } from "nanoid"

import { storage } from ".../storage/sync"
import { getLang } from "../../../utils/utils"
import { GroupNavStyle } from "./GroupNavStyle"

function GroupNav({
  groupInfo,
  current,
  onSelectedChanged,
  onGroupItemDeleted,
  onGroupListChange,
  onGroupOrdered
}) {
  const [messageApi, contextHolder] = message.useMessage()

  const [groupItems, setGroupItems] = useState([])
  const [editingGroupId, setEditingGroupId] = useState(null)
  const [editingGroupName, setEditingGroupName] = useState("")

  // 初始化
  useEffect(() => {
    const showGroupItems = groupInfo.filter(Boolean)
    setGroupItems(showGroupItems)
  }, [groupInfo])

  const onGroupTabClick = (e, item) => {
    onSelectedChanged?.(item)
  }

  const onAddNewGroupClick = async (e) => {
    const baseName = getLang("group_new") || "New Group"
    let newName = baseName
    let counter = 1

    const nameExists = (name) => groupItems.some((g) => g.name === name)
    while (nameExists(newName)) {
      newName = `${baseName} ${counter}`
      counter++
    }

    const newId = nanoid()
    const newGroup = {
      id: newId,
      name: newName,
      desc: ""
    }

    try {
      await storage.group.addGroup(newGroup)
      onGroupListChange?.()
      onSelectedChanged?.(newGroup)
      setEditingGroupId(newId)
      setEditingGroupName(newName)
    } catch (error) {
      messageApi.error(error.message)
    }
  }

  const saveEdit = async (group) => {
    if (!editingGroupName || editingGroupName.trim() === "") {
      messageApi.warning(getLang("group_name_cannot_empty"))
      return
    }

    if (editingGroupName.length > 6) {
      messageApi.warning(getLang("group_name_too_long"))
      return
    }

    if (editingGroupName !== group.name) {
      try {
        const info = { ...group, name: editingGroupName }
        await storage.group.update(info)
        onGroupListChange?.(info)
      } catch (error) {
        messageApi.error(error.message)
      }
    }
    setEditingGroupId(null)
  }

  const handleGroupNameChange = (e) => {
    const value = e.target.value
    if (value.length > 6) {
      messageApi.warning(getLang("group_name_too_long"))
    }
    setEditingGroupName(value.slice(0, 6))
  }

  function selectFirstGroupTab(except) {
    if (!groupInfo) {
      onSelectedChanged?.()
      return
    }

    // 没有排除项，则指定为第一个
    if (!except && groupInfo[0]) {
      onSelectedChanged?.(groupInfo[0])
      return
    }

    // 有排除项，则选择排除项之外的第一个
    if (except) {
      const one = groupInfo.filter((g) => g.id !== except.id)[0]
      if (one) {
        onSelectedChanged?.(one)
        return
      }
    }
    onSelectedChanged?.()
  }

  const onDeleteGroupClick = (e, group) => {
    e.stopPropagation()

    if (storage.helper.isSpecialGroup(group)) {
      messageApi.warning(getLang("group_inner_cannot_delete"))
      return
    }

    Modal.confirm({
      title: getLang("group_delete_title"),
      content: getLang("group_delete_confirm", group.name),
      okText: getLang("confirm_ok"),
      cancelText: getLang("confirm_cancel"),
      onOk: async () => {
        await storage.group.deleteGroup(group.id)
        if (group.id === current?.id) {
          selectFirstGroupTab(group)
        }
        onGroupItemDeleted?.(group)
        messageApi.success(getLang("group_delete_success", group.name))
      }
    })
  }

  const handleDrop = (droppedItem) => {
    if (!droppedItem.destination) return
    if (droppedItem.droppableId === "fixed") {
      return
    }

    var updatedList = [...groupItems]
    // Remove dragged item
    const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1)
    // Add dropped item
    updatedList.splice(droppedItem.destination.index, 0, reorderedItem)
    // Update State
    setGroupItems(updatedList)

    onGroupOrdered?.(updatedList)
  }

  // 开始编辑分组名
  const startEdit = (e, group) => {
    e.stopPropagation()
    // 默认分组不能编辑
    if (storage.helper.isSpecialGroup(group)) {
      return
    }
    setEditingGroupId(group.id)
    setEditingGroupName(group.name)
  }

  // 单个 Group Item 的显示
  const buildGroupItemView = (group) => {
    const isEditing = editingGroupId === group.id
    const isSpecialGroup = storage.helper.isSpecialGroup(group)

    return (
      <div
        className={classNames([
          "tab-container",
          { "selected-group-item": group.id === current?.id }
        ])}
        onClick={(e) => !isEditing && onGroupTabClick(e, group)}>
        {isEditing ? (
          <input
            className="edit-input"
            autoFocus
            value={editingGroupName}
            onChange={handleGroupNameChange}
            onBlur={() => saveEdit(group)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveEdit(group)
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            title={group.name}
            className={classNames({ "editable-name": !isSpecialGroup })}
            onDoubleClick={(e) => startEdit(e, group)}>
            {group.name}
          </h3>
        )}

        {!isEditing && !isSpecialGroup && (
          <span
            className="delete-confirm"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteGroupClick(e, group)
            }}>
            <CloseOutlined className="delete-icon" />
          </span>
        )}
      </div>
    )
  }

  return (
    <GroupNavStyle>
      {contextHolder}
      <DragDropContext onDragEnd={handleDrop}>
        <Droppable droppableId="group-droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {groupItems.map((group, index) => (
                <Draggable key={group.id} draggableId={group.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      className="item-container"
                      ref={provided.innerRef}
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}>
                      {buildGroupItemView(group)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div
        className={classNames(["tab-container", "add-new-group"])}
        onClick={(e) => onAddNewGroupClick(e)}>
        <PlusOutlined />
      </div>
    </GroupNavStyle>
  )
}

export default GroupNav

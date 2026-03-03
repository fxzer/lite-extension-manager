import React, { useEffect, useState } from "react"

import { CloseCircleFilled, PlusOutlined } from "@ant-design/icons"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { Modal, message } from "antd"
import classNames from "classnames"
import { nanoid } from "nanoid"

import { storage } from ".../storage/sync"
import { getLang } from "../../../utils/utils"
import { ModeNavStyle } from "./ModeNavStyle"

function ModeNav({
  modeInfo,
  current,
  onSelectedChanged,
  onModeItemDeleted,
  onModeListChange,
  onModeOrdered
}) {
  const [messageApi, contextHolder] = message.useMessage()

  const [modeItems, setModeItems] = useState([])
  const [editingModeId, setEditingModeId] = useState(null)
  const [editingModeName, setEditingModeName] = useState("")

  // 初始化
  useEffect(() => {
    const showModeItems = modeInfo.filter(Boolean)
    setModeItems(showModeItems)
  }, [modeInfo])

  const onModeTabClick = (e, item) => {
    onSelectedChanged?.(item)
  }

  const onAddNewModeClick = async (e) => {
    const baseName = getLang("mode_new") || "New Mode"
    let newName = baseName
    let counter = 1

    const nameExists = (name) => modeItems.some((m) => m.name === name)
    while (nameExists(newName)) {
      newName = `${baseName} ${counter}`
      counter++
    }

    const newId = nanoid()
    const newMode = {
      id: newId,
      name: newName,
      desc: ""
    }

    try {
      await storage.mode.addMode(newMode)
      onModeListChange?.()
      onSelectedChanged?.(newMode)
      setEditingModeId(newId)
      setEditingModeName(newName)
    } catch (error) {
      messageApi.error(error.message)
    }
  }

  const saveEdit = async (mode) => {
    if (!editingModeName || editingModeName.trim() === "") {
      messageApi.warning(getLang("mode_name_cannot_empty"))
      return
    }

    if (editingModeName.length > 6) {
      messageApi.warning(getLang("mode_name_too_long"))
      return
    }

    if (editingModeName !== mode.name) {
      try {
        const info = { ...mode, name: editingModeName }
        await storage.mode.update(info)
        onModeListChange?.(info)
      } catch (error) {
        messageApi.error(error.message)
      }
    }
    setEditingModeId(null)
  }

  const handleModeNameChange = (e) => {
    const value = e.target.value
    if (value.length > 6) {
      messageApi.warning(getLang("mode_name_too_long"))
    }
    setEditingModeName(value.slice(0, 6))
  }

  function selectFirstModeTab(except) {
    if (!modeInfo) {
      onSelectedChanged?.()
      return
    }

    // 没有排除项，则指定为第一个
    if (!except && modeInfo[0]) {
      onSelectedChanged?.(modeInfo[0])
      return
    }

    // 有排除项，则选择排除项之外的第一个
    if (except) {
      const one = modeInfo.filter((m) => m.id !== except.id)[0]
      if (one) {
        onSelectedChanged?.(one)
        return
      }
    }
    onSelectedChanged?.()
  }

  const onDeleteModeClick = (e, mode) => {
    e.stopPropagation()

    if (storage.helper.isSystemMode(mode)) {
      messageApi.warning(getLang("mode_system_cannot_delete"))
      return
    }

    Modal.confirm({
      title: getLang("mode_delete_title"),
      content: getLang("mode_delete_confirm", mode.name),
      okText: getLang("confirm_ok"),
      cancelText: getLang("confirm_cancel"),
      onOk: async () => {
        await storage.mode.deleteMode(mode.id)
        if (mode.id === current?.id) {
          selectFirstModeTab(mode)
        }
        onModeItemDeleted?.(mode)
        messageApi.success(getLang("mode_delete_success", mode.name))
      }
    })
  }

  const handleDrop = (droppedItem) => {
    if (!droppedItem.destination) return
    // 不允许拖动 default 模式
    if (droppedItem.draggableId === "default") {
      return
    }

    var updatedList = [...modeItems]
    // Remove dragged item
    const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1)
    // Add dropped item
    updatedList.splice(droppedItem.destination.index, 0, reorderedItem)
    // Update State
    setModeItems(updatedList)

    onModeOrdered?.(updatedList)
  }

  // 开始编辑模式名 - 允许编辑内置模式
  const startEdit = (e, mode) => {
    e.stopPropagation()
    setEditingModeId(mode.id)
    setEditingModeName(mode.name)
  }

  // 单个 Mode Item 的显示
  const buildModeItemView = (mode) => {
    const isEditing = editingModeId === mode.id
    const isSystemMode = storage.helper.isSystemMode(mode)

    return (
      <div
        className={classNames(["tab-container", { "selected-mode-item": mode.id === current?.id }])}
        onClick={(e) => !isEditing && onModeTabClick(e, mode)}>
        {isEditing ? (
          <input
            className="edit-input"
            autoFocus
            value={editingModeName}
            onChange={handleModeNameChange}
            onBlur={() => saveEdit(mode)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveEdit(mode)
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            title={mode.name}
            className={classNames({ "editable-name": !isSystemMode })}
            onDoubleClick={(e) => startEdit(e, mode)}>
            {mode.name}
          </h3>
        )}

        {!isEditing && !isSystemMode && (
          <span
            className="delete-confirm"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteModeClick(e, mode)
            }}>
            <CloseCircleFilled className="delete-icon" />
          </span>
        )}
      </div>
    )
  }

  return (
    <ModeNavStyle>
      {contextHolder}
      <DragDropContext onDragEnd={handleDrop}>
        <Droppable droppableId="mode-droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {modeItems.map((mode, index) => (
                <Draggable key={mode.id} draggableId={mode.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      className="item-container"
                      ref={provided.innerRef}
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}>
                      {buildModeItemView(mode)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <div
                className={classNames(["tab-container", "add-new-mode"])}
                onClick={(e) => onAddNewModeClick(e)}>
                <PlusOutlined />
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ModeNavStyle>
  )
}

export default ModeNav

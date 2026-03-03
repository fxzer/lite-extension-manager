import React, { memo, useState } from "react"

import { CloseCircleFilled, EditOutlined, InfoCircleOutlined } from "@ant-design/icons"
import { Input, Tooltip, message } from "antd"
import classNames from "classnames"
import styled from "styled-components"

import storage from ".../storage/sync"
import { getLang } from ".../utils/utils"
import ExtensionChannelLabel from "./ExtensionChannelLabel"

/**
 * 扩展管理设置中的列表 Item 项
 * 支持直接编辑扩展名称（实际存储为 alias）
 */
const ExtensionNameItem = memo(({ name, record, reload }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(record.alias || "")
  const [showEditIcon, setShowEditIcon] = useState(false)

  // 显示的名称：alias 优先，否则显示原名
  const displayName = record.alias || name

  // 失焦或回车保存
  const handleSave = async () => {
    const newValue = editValue.trim()
    setIsEditing(false)

    if (newValue === (record.alias || "")) {
      return
    }

    try {
      await storage.management.updateExtension(record.id, { alias: newValue })
      record.alias = newValue
      message.success(getLang("save_success"))
      reload?.()
    } catch (error) {
      message.error(getLang("save_failed"))
      setEditValue(record.alias || "")
    }
  }

  // 点击进入编辑模式，默认值为当前显示的名称
  const handleEnterEdit = () => {
    setIsEditing(true)
    setEditValue(displayName)
  }

  // 清空输入
  const handleClear = () => {
    setEditValue("")
  }

  return (
    <Wrapper onMouseEnter={() => setShowEditIcon(true)} onMouseLeave={() => setShowEditIcon(false)}>
      <div className="name-row">
        <img src={record.icon} alt="" width={16} height={16} />

        {isEditing ? (
          <Input
            className="name-input"
            size="small"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            maxLength={50}
            autoFocus
            placeholder={getLang("input_name")}
            suffix={
              editValue && (
                <CloseCircleFilled
                  className="clear-icon"
                  onClick={handleClear}
                  onMouseDown={(e) => e.preventDefault()} // 防止失焦
                />
              )
            }
          />
        ) : (
          <>
            <Tooltip placement="topLeft" title={record.alias ? name : displayName}>
              <span className={classNames("column-name-title", { renamed: !!record.alias })}>
                {displayName}
              </span>
            </Tooltip>
            <ExtensionChannelLabel channel={record.channel} />
            {record.description && (
              <Tooltip placement="topLeft" title={record.description}>
                <InfoCircleOutlined className="desc-icon" />
              </Tooltip>
            )}
            <EditOutlined
              className={classNames("edit-icon", { visible: showEditIcon })}
              onClick={handleEnterEdit}
            />
          </>
        )}
      </div>
    </Wrapper>
  )
})

export default ExtensionNameItem

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  .name-row {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;

    img {
      flex-shrink: 0;
    }

    .column-name-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;

      &.renamed {
        color: #9254de;
        font-weight: 500;
      }
    }

    .name-input {
      width: 320px;
      height: 22px;
      font-size: 12px;
      line-height: 22px;

      .clear-icon {
        color: ${(props) => props.theme.muted};
        cursor: pointer;
        font-size: 12px;

        &:hover {
          color: ${(props) => props.theme.disabled};
        }
      }
    }

    .desc-icon {
      flex-shrink: 0;
      font-size: 12px;
      color: ${(props) => props.theme.muted};
      cursor: default;
      margin-left: 12px;

      &:hover {
        color: ${(props) => props.theme.info};
      }
    }
  }

  .edit-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.muted};
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s;
    flex-shrink: 0;

    &.visible {
      opacity: 0.6;
    }

    &:hover {
      color: ${(props) => props.theme.info};
      opacity: 1 !important;
    }
  }
`

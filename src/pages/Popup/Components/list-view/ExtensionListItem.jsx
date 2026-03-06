import React, { memo, useEffect, useState } from "react"

import {
  CloseCircleFilled,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  SettingOutlined,
  ShopOutlined,
  ToolOutlined
} from "@ant-design/icons"
import { Button, Input, Switch, Tooltip, message } from "antd"
import classNames from "classnames"

import "./ExtensionListItem.css"

import { ManualEnableCounter } from ".../storage/local/ManualEnableCounter"
import { storage } from ".../storage/sync"
import { getHomepageUrl, getIcon, getOriginSettingUrl } from ".../utils/extensionHelper.js"
import { getLang } from ".../utils/utils"
import { isStringEmpty } from ".../utils/utils.js"

const manualEnableCounter = new ManualEnableCounter()

/**
 * 扩展列表项
 */
const ExtensionListItem = memo(({ item, enabled, options, currentMode, onItemEnableChanged }) => {
  const [messageApi, contextHolder] = message.useMessage()

  const isShowOperationAlways = options.setting?.isShowItemOperationAlways ?? false

  const [itemEnable, setItemEnable] = useState(enabled ?? item.enabled)
  const existOptionPage = !isStringEmpty(item.optionsUrl)
  const existHomePage = !isStringEmpty(item.homepageUrl)

  // 扩展名编辑
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(item.__attach__?.alias || "")
  const [displayAlias, setDisplayAlias] = useState(item.__attach__?.alias || "")

  // 禁用扩展使用灰色（默认启用）
  const grayStyleOfDisable = options.setting.isGaryStyleOfDisableInGridView ?? true

  // 在切换分组可以控制扩展的开启或关闭时，这里需要主动更新 enabled，否则 UI 显示会有问题
  useEffect(() => {
    setItemEnable(item.enabled)
  }, [item, enabled])

  const onSwitchChange = async (checked, item) => {
    await chrome.management.setEnabled(item.id, checked)
    setItemEnable(checked)
    item.enabled = checked
    if (checked) {
      manualEnableCounter.count(item.id)
    }
    onItemEnableChanged?.(item, currentMode)
  }

  // 扩展名称被点击，则执行扩展启用与禁用
  const onItemNameClick = () => {
    onSwitchChange(!item.enabled, item)
  }

  const confirmDeleteExtension = (e, item) => {
    chrome.management.uninstall(item.id)
  }

  /**
   * 打开扩展设置页面
   */
  const handleSettingButtonClick = (e, item) => {
    if (!item.enabled) {
      messageApi.info(getLang("extension_not_enable"))
      return
    }
    chrome.tabs.create({ url: item.optionsUrl })
  }

  /**
   * 打开扩展主页
   */
  const handleHomeButtonClick = (e, item) => {
    const url = getHomepageUrl(item, true)
    if (url) {
      chrome.tabs.create({ url })
    }
  }

  /**
   * 打开浏览器自带的扩展设置页面
   */
  const handleOriginSettingButtonClick = (e, item) => {
    const url = getOriginSettingUrl(item)
    if (url) {
      chrome.tabs.create({ url })
    }
  }

  // 如果存在别名，则显示别名
  const showName = displayAlias || item.name

  // 保存别名
  const handleAliasSave = async () => {
    const newValue = editValue.trim()
    setIsEditing(false)

    if (newValue === (displayAlias || "")) {
      return
    }

    try {
      await storage.management.updateExtension(item.id, { alias: newValue })
      if (item.__attach__) {
        item.__attach__.alias = newValue
      }
      setDisplayAlias(newValue)
      messageApi.success(getLang("save_success"))
    } catch (error) {
      messageApi.error(getLang("save_failed"))
      setEditValue(displayAlias || "")
    }
  }

  const handleEnterEdit = (e) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditValue(showName)
  }

  return (
    <div
      className={classNames([
        "list-item-container",
        {
          "is-enable": itemEnable,
          "not-enable": !itemEnable,
          "item-is-top": item.__top__,
          "show-operation-always": isShowOperationAlways
        }
      ])}>
      {contextHolder}

      <div
        className={classNames([
          "list-item-img-box",
          { "list-item-disable": !itemEnable && grayStyleOfDisable }
        ])}>
        <img src={getIcon(item, 128)} alt="" />
      </div>

      {isEditing ? (
        <Input
          className="ext-name-input"
          size="small"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleAliasSave}
          onKeyDown={(e) => e.key === "Enter" && handleAliasSave()}
          maxLength={50}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          placeholder={item.name}
          suffix={
            editValue && (
              <CloseCircleFilled
                style={{ color: "#bbb", fontSize: 12, cursor: "pointer" }}
                onClick={() => setEditValue("")}
                onMouseDown={(e) => e.preventDefault()}
              />
            )
          }
        />
      ) : (
        <span className="ext-name" onClick={(e) => onItemNameClick(e, item)}>
          {showName}
        </span>
      )}
      {buildOperationButton()}
    </div>
  )

  function buildOperationButton() {
    return (
      <div className="li-operation">
        <Switch
          className="switch"
          size="small"
          checked={itemEnable}
          onChange={(e) => onSwitchChange(e, item)}></Switch>

        <Tooltip title={getLang("extension_settings")}>
          <Button
            type="text"
            icon={<ToolOutlined />}
            onClick={(e) => handleOriginSettingButtonClick(e, item)}></Button>
        </Tooltip>

        <Tooltip title={getLang("option_title")}>
          <Button
            disabled={!existOptionPage}
            type="text"
            icon={<SettingOutlined />}
            onClick={(e) => handleSettingButtonClick(e, item)}
          />
        </Tooltip>

        <Tooltip title={getLang("rename_extension") || "重命名"}>
          <Button type="text" icon={<EditOutlined />} onClick={(e) => handleEnterEdit(e)} />
        </Tooltip>

        <Tooltip title={getLang("detail_webstore")}>
          <Button
            disabled={!existHomePage}
            type="text"
            icon={<ShopOutlined />}
            onClick={(e) => handleHomeButtonClick(e, item)}
          />
        </Tooltip>

        {item.homepageUrl && item.homepageUrl !== getHomepageUrl(item, true) && (
          <Tooltip title={getLang("detail_homepage") || "主页"}>
            <Button
              type="text"
              icon={<HomeOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                chrome.tabs.create({ url: item.homepageUrl })
              }}
            />
          </Tooltip>
        )}

        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={(e) => confirmDeleteExtension(e, item)}
        />
      </div>
    )
  }
})

export default ExtensionListItem

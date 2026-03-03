import React, { memo, useState } from "react"

import {
  DeleteOutlined,
  HomeOutlined,
  SettingOutlined,
  ShopOutlined,
  ToolOutlined
} from "@ant-design/icons"
import { Space, Switch, Tooltip, message } from "antd"
import classNames from "classnames"
import styled from "styled-components"

import { getHomepageUrl, getOriginSettingUrl } from ".../utils/extensionHelper"
import { getLang } from ".../utils/utils"

const ExtensionOperationItem = memo(({ record, options }) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [itemEnable, setItemEnable] = useState(record.enabled)

  // 获取商店 URL
  const webStoreUrl = getHomepageUrl(record, true)

  // 判断是否是商店链接（只有真正的商店扩展才有商店图标）
  const isStoreExtension =
    webStoreUrl &&
    (webStoreUrl.includes("chrome.google.com") ||
      webStoreUrl.includes("chromewebstore.google.com") ||
      webStoreUrl.includes("microsoftedge.microsoft.com") ||
      webStoreUrl.includes("addons.mozilla.org"))

  // 判断是否显示主页图标
  // - 如果是商店扩展：只有当主页与商店链接不同时才显示
  // - 如果不是商店扩展（如本地开发）：显示主页图标
  const showHomepageIcon =
    record.homepageUrl && (!isStoreExtension || record.homepageUrl !== webStoreUrl)

  /**
   * 启用与禁用扩展
   */
  const onSwitchChange = async (checked, item) => {
    await chrome.management.setEnabled(item.id, checked)
    setItemEnable(checked)
    item.enabled = checked
  }

  /**
   * 打开扩展设置页面
   */
  const handleSettingButtonClick = (e, item) => {
    e.stopPropagation()
    if (item.optionsUrl) {
      if (!item.enabled) {
        messageApi.info(getLang("extension_not_enable"))
        return
      }
      chrome.tabs.create({ url: item.optionsUrl })
    }
  }

  /**
   * 打开浏览器自带的扩展设置页面
   */
  const handleOriginSettingButtonClick = (e, item) => {
    e.stopPropagation()
    const url = getOriginSettingUrl(item)
    if (url) {
      chrome.tabs.create({ url })
    }
  }

  /**
   * 打开商店链接
   */
  const handleStoreClick = (e) => {
    e.stopPropagation()
    // 只有真正的商店扩展才能打开商店链接
    if (isStoreExtension && webStoreUrl) {
      chrome.tabs.create({ url: webStoreUrl })
    }
  }

  /**
   * 打开主页链接
   */
  const handleHomepageClick = (e) => {
    e.stopPropagation()
    // 使用与 showHomepageIcon 相同的逻辑
    if (showHomepageIcon && record.homepageUrl) {
      chrome.tabs.create({ url: record.homepageUrl })
    }
  }

  /**
   * 删除扩展
   */
  const confirmDeleteExtension = (e, item) => {
    e.stopPropagation()
    chrome.management.uninstall(item.id)
  }

  return (
    <Style onClick={(e) => e.stopPropagation()}>
      {contextHolder}

      <Switch
        size="small"
        checked={itemEnable}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onSwitchChange(e, record)}></Switch>

      <Tooltip title={getLang("extension_settings")}>
        <Space
          className="operation-menu-item"
          onClick={(e) => handleOriginSettingButtonClick(e, record)}>
          <ToolOutlined />
        </Space>
      </Tooltip>

      <Tooltip title={getLang("option_title")}>
        <Space
          className={classNames({
            "operation-menu-item-disabled": !record.optionsUrl,
            "operation-menu-item": record.optionsUrl
          })}
          onClick={(e) => handleSettingButtonClick(e, record)}>
          <SettingOutlined />
        </Space>
      </Tooltip>

      <Tooltip title={getLang("detail_webstore")}>
        <Space
          className={classNames({
            "operation-menu-item-disabled": !isStoreExtension,
            "operation-menu-item": isStoreExtension
          })}
          onClick={handleStoreClick}>
          <ShopOutlined />
        </Space>
      </Tooltip>

      {/* 主页图标 - 仅当主页与商店不同时显示 */}
      {showHomepageIcon && (
        <Tooltip title={getLang("detail_homepage")}>
          <Space
            className={classNames({
              "operation-menu-item-disabled": !record.homepageUrl,
              "operation-menu-item": record.homepageUrl
            })}
            onClick={handleHomepageClick}>
            <HomeOutlined />
          </Space>
        </Tooltip>
      )}

      <Tooltip title={getLang("uninstall_extension")} >
        <Space className="operation-menu-item" onClick={(e) => confirmDeleteExtension(e, record)}>
          <DeleteOutlined />
        </Space>
      </Tooltip>
    </Style>
  )
})

export default ExtensionOperationItem

const Style = styled.span`
  display: flex;
  align-items: center;

  .operation-menu-item-disabled {
    color: ${(props) => props.theme.disabled};
    margin-left: 10px;
    font-size: 14px;
    cursor: not-allowed;
  }

  .operation-menu-item {
    margin-left: 10px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      color: ${(props) => props.theme.primary};
    }
  }
`

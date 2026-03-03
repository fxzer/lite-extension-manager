import React, { memo } from "react"

import { Empty, message } from "antd"
import styled from "styled-components"

import ImportItem from "./ImportItem"
import { useAlreadyInstall } from "./helper/useAlreadyInstall"
import { useReadyInstall } from "./helper/useReadyInstall"

/**
 * 导入扩展的处理
 */
const ImportHandler = memo(({ extensions, inputs }) => {
  const [messageApi, contextHolder] = message.useMessage()

  // 待导入的扩展
  const [inputItems] = useReadyInstall(extensions, inputs)
  // 已经安装的扩展
  const [existItems] = useAlreadyInstall(extensions, inputs, false, false)

  const openStoreLink = (ext) => {
    if (!ext.webStoreUrl) {
      messageApi.warning(`no valid web store url of ${ext.name}`)
      return
    }

    const source = localStorage.getItem("popup_search_source") ?? "chrome"

    if (source === "crxsoso") {
      if (ext.channel === "Edge") {
        chrome.tabs.create({
          url: `https://www.crxsoso.com/addon/detail/${ext.id}`
        })
      } else {
        chrome.tabs.create({
          url: `https://www.crxsoso.com/webstore/detail/${ext.id}`
        })
      }
    } else {
      chrome.tabs.create({ url: ext.webStoreUrl })
    }
  }

  return (
    <Style>
      {contextHolder}
      <div className="import-header">
        <h2 className="import-sub-title">
          待安装
          {inputItems.length > 0 && (
            <span className="import-no-exist-count"> ({inputItems.length}个)</span>
          )}
        </h2>
        {existItems.length > 0 && (
          <span className="import-exist-count">{existItems.length}个已存在</span>
        )}
      </div>

      {inputItems.length > 0 ? (
        <ul>
          {inputItems.map((ext) => {
            ext.openStoreLink = openStoreLink
            return <ImportItem key={ext.id} extension={ext}></ImportItem>
          })}
        </ul>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
      )}
    </Style>
  )
})

export default ImportHandler

const Style = styled.div`
  .import-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .import-sub-title {
    margin: 0;
    font-weight: bold;
    font-size: 16px;
  }

  .import-exist-count {
    color: ${(props) => props.theme.success};
    font-size: 16px;
    font-weight: bold;
  }

  .import-no-exist-count {
    color: ${(props) => props.theme.warning};
  }

  ul {
    margin-bottom: 24px;
  }
`

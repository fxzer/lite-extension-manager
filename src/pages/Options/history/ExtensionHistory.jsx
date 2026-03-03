import React, { memo, useEffect, useState } from "react"

import { CloseCircleOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons"
import { Button, Divider, Dropdown, Input, Popconfirm, Space, Table, Tooltip } from "antd"
import styled from "styled-components"
import chromeP from "webext-polyfill-kinda"

import { isEdgeRuntime } from ".../utils/channelHelper"
import { useBatchEffect } from ".../utils/reactUtils"
import { getLang } from ".../utils/utils"
import { downloadIconDataUrl } from "../../../utils/extensionHelper"
import isMatch from "../../../utils/searchHelper"
import { ExtensionRepo } from "../../Background/extension/ExtensionRepo"
import { HistoryRepo } from "../../Background/history/HistoryRepo"
import ExtensionChannelLabel from "../management/ExtensionChannelLabel"
import Style from "./ExtensionHistoryStyle"
import { formatEventText, formatTimeAbsolute, formatTimeRelative } from "./formatter"
import { addHiddenExtId, removeHiddenExtId } from "./hiddenRecordHelper"

const { Search } = Input

const ExtensionHistory = memo(({ records, hiddenExtensionIds, loading }) => {
  // 搜索词
  const [searchWord, setSearchWord] = useState("")

  // 显示的记录
  const [shownRecords, setShownRecords] = useState(records)

  // 隐藏的扩展
  const [hiddenExtIds, setHiddenExtIds] = useState(hiddenExtensionIds)

  useEffect(() => {
    setHiddenExtIds(hiddenExtensionIds)
  }, [hiddenExtensionIds])

  // 仅显示当前扩展相关的记录
  const solo = (e, record) => {
    e.stopPropagation()
    setSearchWord(record.extensionId)
  }

  // 隐藏指定扩展的显示
  const hide = async (e, record) => {
    e.stopPropagation()
    await addHiddenExtId(record.extensionId)
    setHiddenExtIds((prev) => [...prev, record.extensionId])
  }

  // 回复显示隐藏的扩展
  const recover = async (e, record) => {
    e.stopPropagation()
    await removeHiddenExtId(record.extensionId)
    setHiddenExtIds((prev) => prev.filter((id) => id !== record.extensionId))
  }

  const hiddenRecordMenuItemOnClick = (e, item) => {
    e.stopPropagation()
    recover(e, item)
  }

  const getHiddenRecordsMenu = () => {
    const hiddenRecords = records.filter((item) => hiddenExtIds.includes(item.extensionId))
    const map = new Map(hiddenRecords.map((obj) => [obj.extensionId, obj]))
    const items = Array.from(map.values())

    const buildLabel = (item) => {
      return (
        <HiddenItemStyle>
          <img src={item.icon} alt="icon" width={24} />
          <div className="hidden-record-name">{item.name}</div>
          <Space
            className="hidden-record-close"
            onClick={(e) => hiddenRecordMenuItemOnClick(e, item)}>
            <CloseCircleOutlined />
          </Space>
        </HiddenItemStyle>
      )
    }

    const menuItems = items.map((item) => {
      return {
        label: buildLabel(item),
        key: item.id,
        title: item.name
      }
    })

    return {
      items: menuItems,
      multiple: true,
      selectable: true
    }
  }

  const columns = [
    {
      title: getLang("column_index"),
      dataIndex: "index",
      key: "index",
      width: 60,
      align: "left",
      render: (dataIndex, record, index) => {
        return <span className="column-index">{(dataIndex + 1).toString().padStart(3, "0")}</span>
      }
    },
    {
      title: getLang("column_event"),
      dataIndex: "event",
      key: "event",
      width: 80,
      render: (event, record, index) => {
        return <span className="column-event">{formatEventText(event)}</span>
      },
      filters: [
        { text: formatEventText("install"), value: "install" },
        { text: formatEventText("uninstall"), value: "uninstall" },
        { text: formatEventText("updated"), value: "updated" },
        { text: formatEventText("enabled"), value: "enabled" },
        { text: formatEventText("disabled"), value: "disabled" }
      ],
      onFilter: (value, record) => {
        return record.event === value
      }
    },
    {
      title: getLang("column_name"),
      dataIndex: "name",
      key: "name",
      width: 320,
      ellipsis: {
        showTitle: false
      },
      render: (name, record, index) => {
        let showName = name
        if (record.__attach__?.alias) {
          showName = record.__attach__.alias
        }

        return (
          <span className="column-name">
            <div className="column-name-title">
              <img src={record.icon} alt="" width={16} height={16} />
              <span>{showName}</span>
              <ExtensionChannelLabel
                channel={record.__extension__?.channel}></ExtensionChannelLabel>
            </div>
            <div className="column-name-solo">
              <Tooltip title={getLang("history_solo_ext")}>
                <Space onClick={(e) => solo(e, record)}>
                  <EyeOutlined />
                </Space>
              </Tooltip>
              <Tooltip title={getLang("history_hide_ext")}>
                <Space onClick={(e) => hide(e, record)}>
                  <EyeInvisibleOutlined />
                </Space>
              </Tooltip>
            </div>
          </span>
        )
      },
      filters: isEdgeRuntime()
        ? [
            {
              text: "Edge",
              value: "Edge"
            },
            {
              text: "Chrome",
              value: "Chrome"
            },
            {
              text: "Dev",
              value: "Development"
            }
          ]
        : [
            {
              text: "Dev",
              value: "Development"
            }
          ],
      onFilter: (value, record) => {
        return record.__extension__?.channel === value
      },
      sorter: (a, b) => {
        const nameA = a.__attach__?.alias || a.name
        const nameB = b.__attach__?.alias || b.name
        return nameA.localeCompare(nameB)
      }
    },
    {
      title: getLang("column_time"),
      dataIndex: "timestamp",
      key: "time",
      width: 130,
      render: (timestamp, record, index) => {
        return (
          <Tooltip title={formatTimeAbsolute(timestamp)}>
            <span className="column-time">{formatTimeRelative(timestamp)}</span>
          </Tooltip>
        )
      }
    },
    {
      title: getLang("column_version"),
      dataIndex: "version",
      key: "version",
      width: 100,
      render: (version, record, index) => {
        return <span className="column-version">{version} </span>
      }
    }
  ]

  // 执行搜索
  useBatchEffect(
    () => {
      if (hiddenExtIds.length === 0) {
        setShownRecords(search(records, searchWord))
      } else {
        setShownRecords(
          search(
            records.filter((r) => !hiddenExtIds.includes(r.extensionId)),
            searchWord
          )
        )
      }
    },
    [records, searchWord, hiddenExtIds],
    100
  )

  const onSearch = (value) => {
    setSearchWord(value)
  }

  // 清空历史记录
  const confirmClearHistoryRecords = async () => {
    setShownRecords([])
    setSearchWord("")
    // 清除记录
    await HistoryRepo.clearAll()
    // 清除 Extension 缓存
    const extRepo = new ExtensionRepo()
    await extRepo.clear()
    // 重建 Extension 缓存
    const list = await chromeP.management.getAll()
    const now = Date.now()
    for (const item of list) {
      const iconDataUrl = await downloadIconDataUrl(item)
      const ext = { ...item, icon: iconDataUrl, recordUpdateTime: now }
      extRepo.set(ext)
    }
  }

  return (
    <Style>
      <div className="history-manage-tools">
        {/* 左侧工具栏 */}
        <div className="history-manage-tools-left">
          {/* 搜索 */}
          <Search
            className="search"
            placeholder="search"
            allowClear
            value={searchWord}
            onSearch={onSearch}
            onChange={(e) => onSearch(e.target.value)}
            prefix={
              hiddenExtIds.length > 0 ? (
                <>
                  <Dropdown
                    menu={getHiddenRecordsMenu()}
                    trigger={["click"]}
                    placement="bottomLeft">
                    <Tooltip title={getLang("history_hidden_record")}>
                      <EyeInvisibleOutlined
                        style={{ color: "#ff4d4f", cursor: "pointer", marginRight: "8px" }}
                      />
                    </Tooltip>
                  </Dropdown>
                  <Divider type="vertical" />
                </>
              ) : null
            }
          />
        </div>
        {/* 右侧操作工具栏 */}
        <div className="history-manage-tools-right">
          {/* 隐藏的记录已被整合到左侧搜索框前缀 */}
          {/* 清空记录 */}
          <Popconfirm
            title={getLang("history_clean_confirm_title")}
            description={getLang("history_clean_confirm_content")}
            onConfirm={confirmClearHistoryRecords}
            okText={getLang("confirm_ok")}
            cancelText={getLang("confirm_cancel")}>
            <Button danger className="setting-operation-item">
              {getLang("history_clean_record")}
            </Button>
          </Popconfirm>
        </div>
      </div>

      <Table
        rowKey="id"
        size="middle"
        pagination={{ pageSize: 100, showSizeChanger: false }}
        scroll={{ y: "calc(100vh - 290px)" }}
        columns={columns}
        loading={loading}
        dataSource={shownRecords}></Table>
    </Style>
  )
})

export default ExtensionHistory

const search = (records, word) => {
  if (!word || word.trim() === "") return records

  return records.filter((record) => {
    const target = [
      record.name,
      record.__extension__?.shortName,
      record.__extension__?.description,
      record.__attach__?.alias,
      record.__attach__?.remark,
      record.extensionId
    ]

    return isMatch(target, word, true)
  })
}

const HiddenItemStyle = styled.div`
  display: flex;
  align-items: center;

  img {
    margin-right: 8px;
  }

  .hidden-record-name {
    flex: 1 0 auto;
    max-width: 120px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hidden-record-close {
    margin-left: 4px;
    color: ${(props) => props.theme.danger};
  }
`

import React, { memo, useEffect, useState } from "react"
import { Empty, message, Table } from "antd"
import styled from "styled-components"

import { LocalOptions } from "../../../storage/local"
import { getLang } from "../../../utils/utils"
import ExtensionChannelLabel from "../management/ExtensionChannelLabel"
import ExtensionNameItem from "../management/ExtensionNameItem"
import ExtensionOperationItem from "../management/ExtensionOperationItem"
import { ModeTableContentStyle } from "./ModeTableContentStyle"

const localOptions = new LocalOptions()

/**
 * 模式扩展表格视图
 */
const ModeTableContent = memo((props) => {
  const { mode, extensions, modeList, options } = props

  const [messageApi, contextHolder] = message.useMessage()

  // 表格数据
  const [tableData, setTableData] = useState([])
  // 搜索后的显示数据
  const [shownData, setShownData] = useState([])
  // 搜索词
  const [searchWord, setSearchWord] = useState("")

  // 初始化表格数据
  useEffect(() => {
    const data = buildTableData(extensions, mode, modeList)
    setTableData(data)
    setShownData(data)
  }, [extensions, mode, modeList])

  // 搜索过滤
  useEffect(() => {
    if (!searchWord || searchWord.trim() === "") {
      setShownData(tableData)
      return
    }
    const filtered = tableData.filter((record) => {
      const target = [record.name, record.shortName, record.description, record.alias]
      return isMatch(target, searchWord, true)
    })
    setShownData(filtered)
  }, [tableData, searchWord])

  const onSearch = (value) => {
    setSearchWord(value)
  }

  const [columns, setColumns] = useState([])
  useEffect(() => {
    setColumns(buildColumns())
  }, [])

  const buildColumns = () => {
    return [
      {
        title: getLang("column_extension"),
        dataIndex: "name",
        key: "name",
        width: 380,
        render: (name, record) => {
          return <ExtensionNameItem name={name} record={record} reload={() => {}}></ExtensionNameItem>
        }
      },
      {
        title: "所属模式",
        dataIndex: "otherModes",
        key: "otherModes",
        width: 120,
        render: (modes) => {
          if (!modes || modes.length === 0) {
            return <span style={{ color: "#999" }}>-</span>
          }
          return (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {modes.map((m) => (
                <span key={m} style={{ fontSize: 12, padding: "2px 6px", background: "#f0f0f0", borderRadius: 4 }}>
                  {m}
                </span>
              ))}
            </div>
          )
        }
      },
      {
        title: getLang("column_operation"),
        key: "operation",
        width: 180,
        render: (_, record) => {
          return <ExtensionOperationItem record={record} options={options}></ExtensionOperationItem>
        }
      }
    ]
  }

  return (
    <ModeTableContentStyle>
      {contextHolder}
      {shownData.length > 0 ? (
        <Table
          size="middle"
          pagination={{ pageSize: 100, showSizeChanger: false }}
          scroll={{ y: "calc(100vh - 290px)" }}
          columns={columns}
          dataSource={shownData}
          rowKey="id"
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </ModeTableContentStyle>
  )
})

/**
 * 构建表格数据
 */
function buildTableData(extensions, currentMode, modeList) {
  return extensions.map((ext) => {
    // 找出扩展所属的其他模式
    const otherModes = modeList
      .filter((m) => {
        if (!m.extensions || m.id === currentMode.id) {
          return false
        }
        return m.extensions.includes(ext.id)
      })
      .map((m) => m.name)

    return {
      ...ext,
      otherModes
    }
  })
}

/**
 * 搜索匹配函数（复用自 searchHelper）
 */
function isMatch(targets, searchText, ignoreCase) {
  if (!searchText || searchText.trim() === "") {
    return true
  }
  const search = ignoreCase ? searchText.toLowerCase() : searchText
  return targets.some((target) => {
    if (!target) {
      return false
    }
    const text = ignoreCase ? String(target).toLowerCase() : String(target)
    return text.includes(search)
  })
}

export default ModeTableContent

import React, { memo, useEffect, useState } from "react"

import { Input, Table } from "antd"

import storage from ".../storage/sync"
import { isEdgeRuntime } from ".../utils/channelHelper"
import analytics from ".../utils/googleAnalyze"
import isMatch from ".../utils/searchHelper"
import { getLang } from ".../utils/utils"
import { ExtensionManageStyle } from "./ExtensionManageStyle"
import ExtensionNameItem from "./ExtensionNameItem"
import ExtensionOperationItem from "./ExtensionOperationItem"
import { buildRecords } from "./utils"

const { Search } = Input

const ExtensionManage = memo(({ extensions, options }) => {
  // 全部数据
  const [data, setData] = useState([])
  // 展示的数据
  const [shownData, setShownData] = useState([])

  // 搜索词
  const [searchWord, setSearchWord] = useState("")

  // 初始化
  useEffect(() => {
    if (!options.management) {
      return
    }
    const initData = buildRecords(extensions, options.management)
    setData(initData)
    setShownData(initData)
  }, [extensions, options])

  // 搜索
  useEffect(() => {
    setShownData(search(data, searchWord))
  }, [data, searchWord])

  // 执行搜索
  const onSearch = (value) => {
    setSearchWord(value)
  }

  // 重新加载配置
  const reload = () => {
    storage.management.get().then((res) => {
      var reloadData = buildRecords(extensions, res)
      setData(reloadData)
    })
  }

  const [columns, setColumns] = useState([])
  useEffect(() => {
    setColumns(buildColumns())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const buildColumns = () => {
    const columns = [
      {
        title: getLang("column_index"),
        dataIndex: "index",
        key: "index",
        width: 60,
        align: "left",
        render: (text, record, index) => {
          return <span className="column-index">{(index + 1).toString().padStart(2, "0")}</span>
        }
      },
      {
        title: getLang("column_extension"),
        dataIndex: "name",
        key: "name",
        width: 380,
        ellipsis: {
          showTitle: false
        },
        render: (name, record, index) => {
          return <ExtensionNameItem name={name} record={record} reload={reload}></ExtensionNameItem>
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
          return record.channel === value
        },
        sorter: (a, b) => {
          return a.name.localeCompare(b.name)
        }
      }
    ]

    columns.splice(2, 0, {
      title: getLang("column_operation"),
      key: "operation",
      width: 140,
      render: (_, record, index) => {
        return <ExtensionOperationItem record={record} options={options}></ExtensionOperationItem>
      },
      sorter: (a, b) => {
        if (a.enabled === b.enabled) {
          return a.name.localeCompare(b.name) // Sort by name
        }
        return a.enabled < b.enabled ? 1 : -1 // Sort by state
      }
    })
    return columns
  }

  return (
    <ExtensionManageStyle>
      <div className="extension-manage-tools">
        <div className="extension-manage-tools-left">
          <Search
            className="search"
            placeholder={getLang("mode_search_placeholder")}
            allowClear
            onSearch={onSearch}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="extension-manage-tools-right">
          {/* 分享和导入功能已移至侧边栏独立菜单 */}
        </div>
      </div>

      {/* [实现 antd table 自动调整可视高度 - 掘金](https://juejin.cn/post/6922375503798075400#comment ) */}
      <Table
        size="middle"
        pagination={{ pageSize: 100, showSizeChanger: false }}
        scroll={{ y: "calc(100vh - 290px)" }}
        columns={columns}
        dataSource={shownData}
      />
    </ExtensionManageStyle>
  )
})

function search(records, searchText) {
  if (!searchText || searchText.trim() === "") {
    return records
  }

  return records.filter((record) => {
    const target = [record.name, record.shortName, record.description, record.alias]
    return isMatch(target, searchText, true)
  })
}

export default ExtensionManage

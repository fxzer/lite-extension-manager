import React, { useCallback, useEffect, useState } from "react"

import { Switch } from "antd"

import { LocalOptions } from ".../storage/local"
import { storage } from ".../storage/sync"
import { getLang } from ".../utils/utils"
import { ExtensionIconBuilder } from "../../Background/extension/ExtensionIconBuilder"
import { ExtensionRepo } from "../../Background/extension/ExtensionRepo"
import { HistoryRepo } from "../../Background/history/HistoryRepo"
import { HistoryService } from "../../Background/history/HistoryService"
import Title from "../Title.jsx"
import ExtensionHistory from "./ExtensionHistory.jsx"
import { getHiddenExtIds } from "./hiddenRecordHelper"

const ExtensionManageIndex = () => {
  // 历史记录
  const [historyRecords, setHistoryRecords] = useState([])
  // 隐藏的数据
  const [hiddenExtensionIds, setHiddenExtensionIds] = useState([])
  // 历史记录功能是否关闭
  const [isHistoryClosed, setIsHistoryClosed] = useState(false)

  // 表格的 loading 显示
  const [loading, setLoading] = useState(true)

  const localOptions = new LocalOptions()

  const onHistoryClosedChange = (checked) => {
    setIsHistoryClosed(checked)
    // 反转逻辑：checked = true 表示"开启记录"，即"不关闭功能"
    localOptions.setValue("isHistoryRecordFeatureClosed", !checked)
  }

  useEffect(() => {
    localOptions.getValue("isHistoryRecordFeatureClosed").then((v) => {
      // 反转逻辑：存储的是"是否关闭"，UI 显示的是"是否开启"
      setIsHistoryClosed(!(v ?? false))
    })
  }, [])

  const init = async () => {
    // 读取历史记录
    const repo = HistoryRepo
    const service = new HistoryService(repo)
    const records = await service.queryAll()
    // 最新的在最前
    records.reverse()
    // 附加序号
    records.forEach((item, index) => {
      item.index = index
    })
    // 填充 ICON 数据
    await ExtensionIconBuilder.fill(records)
    // 填充附加数据(别名与备注)
    const attach = await storage.management.get()
    const attachExtensionInfo = attach.extensions ?? []
    for (const attachItem of attachExtensionInfo) {
      records
        .filter((item) => item.extensionId === attachItem.extId)
        .forEach((item) => {
          item.__attach__ = attachItem
        })
    }

    // 附加扩展数据本身
    const extRepo = new ExtensionRepo()
    for (const record of records) {
      const cache = await extRepo.get(record.extensionId)
      record.__extension__ = cache
    }

    const hiddenExtIds = await getHiddenExtIds()

    setHiddenExtensionIds(hiddenExtIds)
    setHistoryRecords(records)

    // ExtensionHistory 内部使用 useBatchEffect 延迟了 100ms
    setTimeout(() => {
      setLoading(false)
    }, 100)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <div>
      <Title
        title={getLang("history_title")}
        extra={
          <Switch
            checked={isHistoryClosed}
            onChange={onHistoryClosedChange}
            checkedChildren={getLang("record_on")}
            unCheckedChildren={getLang("record_off")}
            style={{ transform: "scale(1.3)" }}
          />
        }
      />
      <ExtensionHistory
        records={historyRecords}
        hiddenExtensionIds={hiddenExtensionIds}
        loading={loading}></ExtensionHistory>
    </div>
  )
}

export default ExtensionManageIndex

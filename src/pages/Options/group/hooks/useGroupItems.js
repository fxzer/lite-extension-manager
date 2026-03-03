import { memo, useCallback, useEffect, useState } from "react"

import { storage } from ".../storage/sync"
import { isAppExtension } from ".../utils/extensionHelper"
import { appendAdditionInfo } from ".../utils/extensionHelper"
import { ExtensionRepo } from "../../../Background/extension/ExtensionRepo"

const extensionRepo = new ExtensionRepo()

/**
 * 根据数据，计算出在当前分组中的扩展和不在当前分组中的扩展
 * 固定按名称排序
 */
const useGroupItems = (selectedGroup, groupListInfo, extensions, hiddenQuickFilter) => {
  // 原始数据（未排序），由 calc 和 onItemClick 更新
  const [rawContainExts, setRawContains] = useState([])
  const [rawNoneGroupExts, setRawNoneGroupExts] = useState([])

  // 排序后的数据，最终返回给外部使用
  const [containExts, setContains] = useState([])
  const [noneGroupExts, setNoneGroupExts] = useState([])

  // 计算分组内外的扩展（不含排序）
  const calc = async () => {
    const [inGroupExts, outGroupExts] = await calcInOutGroupExtensions(
      selectedGroup,
      groupListInfo,
      extensions
    )

    const filterOutGroupExts = filterByNotShowSetting(outGroupExts, hiddenQuickFilter)

    setRawContains(inGroupExts)
    setRawNoneGroupExts(filterOutGroupExts)
  }

  useEffect(() => {
    calc()
    // 在业务中，切换分组一定会导致 groupListInfo 变化，所以这里不用依赖 selectedGroup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    groupListInfo,
    extensions,
    hiddenQuickFilter.hiddenFixedGroupInNoneGroup,
    hiddenQuickFilter.hiddenHiddenGroupInNoneGroup,
    hiddenQuickFilter.hiddenOtherGroupInNoneGroup
  ])

  // 排序：当原始数据变化时，按名称排序
  useEffect(() => {
    let cancelled = false
    const doSort = async () => {
      const sortedIn = sortExtensions(rawContainExts)
      const sortedOut = sortExtensions(rawNoneGroupExts)
      if (!cancelled) {
        setContains(sortedIn)
        setNoneGroupExts(sortedOut)
      }
    }
    doSort()
    return () => {
      cancelled = true
    }
  }, [rawContainExts, rawNoneGroupExts])

  // 保存分组中的扩展记录
  const save = async (contains, group) => {
    const duplicateGroup = { ...group }
    duplicateGroup.extensions = contains.map((ext) => ext.id)
    storage.group.update(duplicateGroup)
  }

  const onItemClick = ({ item, group, action }) => {
    if (action === "remove") {
      const contain = rawContainExts.filter((ext) => ext.id !== item.id)
      const none = [...rawNoneGroupExts, item]
      setRawContains(contain)
      setRawNoneGroupExts(none)
      save(contain, group)
    } else if (action === "add") {
      const none = rawNoneGroupExts.filter((ext) => ext.id !== item.id)
      const contain = [...rawContainExts, item]
      setRawContains(contain)
      setRawNoneGroupExts(none)
      save(contain, group)
    }
  }

  return [containExts, noneGroupExts, onItemClick]
}

export default useGroupItems

/**
 * 计算在当前分组内和在分组外的扩展
 */
async function calcInOutGroupExtensions(group, groupList, extensions) {
  if (!group || !groupList) {
    return [[], extensions]
  }

  // 包含在当前分组中的扩展
  const containsExts =
    group?.extensions?.map((id) => extensions.find((e) => e.id === id)).filter((ext) => ext) ?? []
  const containsExtIds = containsExts.map((ext) => ext.id)

  // 剩余未分组：展示不在当前分组中的扩展（至于这些分组是不是在其他分组中，不考虑。一个扩展可以放在多个分组中）
  const noneGroupedExtensions = extensions
    .filter((ext) => !containsExtIds.includes(ext.id))
    .filter((ext) => !isAppExtension(ext))

  // 为每个扩展附加其所在分组的信息
  const extMap = new Map(extensions.map((ext) => [ext.id, ext]))
  for (const group of groupList ?? []) {
    for (const extId of group.extensions ?? []) {
      const ext = extMap.get(extId)
      if (ext) {
        ext.__group_ids__ = ext.__group_ids__ ?? []
        ext.__group_ids__ = [...ext.__group_ids__, group.id]
      }
    }
  }

  const managementOptions = await storage.management.get()
  appendAdditionInfo(containsExts, managementOptions)
  appendAdditionInfo(noneGroupedExtensions, managementOptions)

  return [containsExts, noneGroupedExtensions]
}

/**
 * 根据 “不显示” 的过滤器设置，过滤掉部分扩展
 */
function filterByNotShowSetting(extensions, hiddenQuickFilter) {
  const hiddenFixedGroupInNoneGroup = hiddenQuickFilter.hiddenFixedGroupInNoneGroup
  const hiddenHiddenGroupInNoneGroup = hiddenQuickFilter.hiddenHiddenGroupInNoneGroup
  const hiddenOtherGroupInNoneGroup = hiddenQuickFilter.hiddenOtherGroupInNoneGroup

  return extensions
    .filter((e) => {
      return !hiddenFixedGroupInNoneGroup || !e.__group_ids__?.includes("fixed")
    })
    .filter((e) => {
      return !hiddenHiddenGroupInNoneGroup || !e.__group_ids__?.includes("hidden")
    })
    .filter((e) => {
      let groupIds = e.__group_ids__ ?? []
      groupIds = groupIds.filter((id) => id !== "fixed").filter((id) => id !== "hidden")
      return !hiddenOtherGroupInNoneGroup || !groupIds.length > 0
    })
}

/**
 * 按名称对扩展列表排序
 * @param {Array} extensions 扩展列表
 * @returns {Array} 排序后的扩展列表（新数组）
 */
function sortExtensions(extensions) {
  if (!extensions || extensions.length === 0) {
    return extensions
  }

  return [...extensions].sort((a, b) => {
    const nameA = (a.__alias__ || a.name || "").toLowerCase()
    const nameB = (b.__alias__ || b.name || "").toLowerCase()
    return nameA.localeCompare(nameB)
  })
}

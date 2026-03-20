import { useCallback, useEffect, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import { LocalOptions } from ".../storage/local"
import { storage } from ".../storage/sync"
import { appendAdditionInfo, isAppExtension } from ".../utils/extensionHelper"

const localOptions = new LocalOptions()

/**
 * 根据数据，计算出在当前模式中的扩展和不在当前模式中的扩展
 */
const useModeItems = (selectedMode, modeListInfo, extensions, hiddenQuickFilter) => {
  // 原始数据（未排序），由 calc 和 onItemClick 更新
  const [rawEnabledExts, setRawEnabledExts] = useState([])
  const [rawDisabledExts, setRawDisabledExts] = useState([])

  // 排序后的数据，最终返回给外部使用
  const [enabledExts, setEnabledExts] = useState([])
  const [disabledExts, setDisabledExts] = useState([])

  // 计算模式内外的扩展（不含排序）
  const calc = async () => {
    const [inModeExts, outModeExts] = await calcInOutModeExtensions(
      selectedMode,
      modeListInfo,
      extensions
    )

    const filterOutModeExts = filterByNotShowSetting(outModeExts, hiddenQuickFilter)

    setRawEnabledExts(inModeExts)
    setRawDisabledExts(filterOutModeExts)
  }

  useEffect(() => {
    calc()
    // 在业务中，切换模式一定会导致 modeListInfo 变化，所以这里不用依赖 selectedMode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    modeListInfo,
    extensions,
    hiddenQuickFilter.hiddenFixedGroupInNoneGroup,
    hiddenQuickFilter.hiddenHiddenGroupInNoneGroup,
    hiddenQuickFilter.hiddenOtherGroupInNoneGroup
  ])

  // 排序：当原始数据变化时，重新排序（默认按名称排序）
  useEffect(() => {
    let cancelled = false
    const doSort = async () => {
      const sortedIn = await sortExtensions(rawEnabledExts, "name")
      const sortedOut = await sortExtensions(rawDisabledExts, "name")
      if (!cancelled) {
        setEnabledExts(sortedIn)
        setDisabledExts(sortedOut)
      }
    }
    doSort()
    return () => {
      cancelled = true
    }
  }, [rawEnabledExts, rawDisabledExts])

  // 保存模式中的扩展记录
  const save = async (enabled, mode) => {
    const duplicateMode = { ...mode }
    duplicateMode.extensions = enabled.map((ext) => ext.id)

    // 调试日志

    await storage.mode.update(duplicateMode)

    // 验证保存结果
    const modes = await storage.mode.getModes()
    const savedMode = modes.find((m) => m.id === mode.id)
  }

  const onItemClick = ({ item, mode, action }) => {
    if (action === "remove") {
      const enabled = rawEnabledExts.filter((ext) => ext.id !== item.id)
      const disabled = [...rawDisabledExts, item]
      setRawEnabledExts(enabled)
      setRawDisabledExts(disabled)
      save(enabled, mode)
      applyToActiveMode(item.id, mode.id, false)
    } else if (action === "add") {
      const disabled = rawDisabledExts.filter((ext) => ext.id !== item.id)
      const enabled = [...rawEnabledExts, item]
      setRawEnabledExts(enabled)
      setRawDisabledExts(disabled)
      save(enabled, mode)
      applyToActiveMode(item.id, mode.id, true)
    }
  }

  // 批量将所有未启用的扩展加入当前模式
  const onEnableAll = useCallback(async () => {
    if (!rawDisabledExts.length || !selectedMode) return
    const newEnabled = [...rawEnabledExts, ...rawDisabledExts]
    setRawEnabledExts(newEnabled)
    setRawDisabledExts([])
    await save(newEnabled, selectedMode)
    for (const ext of rawDisabledExts) {
      applyToActiveMode(ext.id, selectedMode.id, true)
    }
  }, [rawEnabledExts, rawDisabledExts, selectedMode])

  // 批量将所有已启用的扩展从当前模式移除
  const onDisableAll = useCallback(async () => {
    if (!rawEnabledExts.length || !selectedMode) return
    const newDisabled = [...rawDisabledExts, ...rawEnabledExts]
    setRawEnabledExts([])
    setRawDisabledExts(newDisabled)
    await save([], selectedMode)
    for (const ext of rawEnabledExts) {
      applyToActiveMode(ext.id, selectedMode.id, false)
    }
  }, [rawEnabledExts, rawDisabledExts, selectedMode])

  return [enabledExts, disabledExts, onItemClick, onEnableAll, onDisableAll]
}

export default useModeItems

/**
 * 如果被编辑的模式正好是 Popup 当前激活的模式，立即通过 Chrome API 应用变更，
 * 这样用户不需要打开 Popup 就能让扩展启用/禁用立即生效。
 */
async function applyToActiveMode(extensionId, modeId, enabled) {
  try {
    const activeModeId = await localOptions.getActiveModeId()
    if (activeModeId !== modeId) return

    const allOptions = await storage.options.getAll()
    if (!(allOptions.setting?.isRaiseEnableWhenSwitchGroup ?? true)) return

    await chromeP.management.setEnabled(extensionId, enabled)
  } catch (error) {
    console.error("[useModeItems] Failed to apply to active mode:", error)
  }
}

/**
 * 计算在当前模式内和在模式外的扩展
 */
async function calcInOutModeExtensions(mode, modeList, extensions) {
  if (!mode || !modeList) {
    return [[], extensions]
  }

  // 获取插件管理自身的 ID
  const selfExtensionId = chrome.runtime.id

  // 包含在当前模式中的扩展（排除插件管理自身）
  const enabledExts =
    mode?.extensions
      ?.map((id) => extensions.find((e) => e.id === id))
      .filter((ext) => ext)
      .filter((ext) => ext.id !== selfExtensionId) ?? []
  const enabledExtIds = enabledExts.map((ext) => ext.id)

  // 剩余未在模式中：展示不在当前模式中的扩展（至于这些扩展是不是在其他模式中，不考虑。一个扩展可以放在多个模式中）
  // 排除应用类型扩展和插件管理自身
  const disabledExtensions = extensions
    .filter((ext) => !enabledExtIds.includes(ext.id))
    .filter((ext) => !isAppExtension(ext))
    .filter((ext) => ext.id !== selfExtensionId)

  // 为每个扩展附加其所在模式的信息
  const extMap = new Map(extensions.map((ext) => [ext.id, ext]))
  for (const mode of modeList ?? []) {
    for (const extId of mode.extensions ?? []) {
      const ext = extMap.get(extId)
      if (ext) {
        ext.__mode_ids__ = ext.__mode_ids__ ?? []
        ext.__mode_ids__ = [...ext.__mode_ids__, mode.id]
      }
    }
  }

  const managementOptions = await storage.management.get()
  appendAdditionInfo(enabledExts, managementOptions)
  appendAdditionInfo(disabledExtensions, managementOptions)

  return [enabledExts, disabledExtensions]
}

/**
 * 根据 "不显示" 的过滤器设置，过滤掉部分扩展
 */
function filterByNotShowSetting(extensions, hiddenQuickFilter) {
  const hiddenFixedGroupInNoneGroup = hiddenQuickFilter.hiddenFixedGroupInNoneGroup
  const hiddenHiddenGroupInNoneGroup = hiddenQuickFilter.hiddenHiddenGroupInNoneGroup
  const hiddenOtherGroupInNoneGroup = hiddenQuickFilter.hiddenOtherGroupInNoneGroup

  return extensions
    .filter((e) => {
      return !hiddenFixedGroupInNoneGroup || !e.__mode_ids__?.includes("fixed")
    })
    .filter((e) => {
      return !hiddenHiddenGroupInNoneGroup || !e.__mode_ids__?.includes("hidden")
    })
    .filter((e) => {
      let modeIds = e.__mode_ids__ ?? []
      modeIds = modeIds.filter((id) => id !== "fixed").filter((id) => id !== "hidden")
      return !hiddenOtherGroupInNoneGroup || !modeIds.length > 0
    })
}

/**
 * 根据排序方式对扩展列表排序
 * @param {Array} extensions 扩展列表
 * @returns {Promise<Array>} 排序后的扩展列表（新数组）
 */
async function sortExtensions(extensions, sortType) {
  if (!extensions || extensions.length === 0) {
    return extensions
  }

  // 按名称排序
  return [...extensions].sort((a, b) => {
    const nameA = (a.__alias__ || a.name || "").toLowerCase()
    const nameB = (b.__alias__ || b.name || "").toLowerCase()
    return nameA.localeCompare(nameB)
  })
}

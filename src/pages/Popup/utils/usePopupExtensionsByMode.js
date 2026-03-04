import { useEffect, useMemo, useState } from "react"

import { ManualEnableCounter } from ".../storage/local/ManualEnableCounter"
import { appendAdditionInfo, sortExtension } from ".../utils/extensionHelper"
import { getLang } from ".../utils/utils"
import { findTopExtensions, sortByReferenceList } from "./usePopupExtensions"

const manualEnableCounter = new ManualEnableCounter()

/**
 * 根据浏览器 extension 和配置信息，对 popup 显示的扩展列表进行预处理
 * 1 附加别名等额外的信息
 * 2 根据配置进行排序
 * 返回按模式归类的扩展组
 */
export const usePopupExtensionsByMode = (extensions, options, moved) => {
  // 置顶的扩展 开启状态的扩展 禁用状态的扩展

  const [items, setItems] = useState([])

  const build = async (extensions, options) => {
    if (!extensions || extensions.length === 0) {
      setItems([])
      return
    }

    const modes = await buildShowItems(extensions, options)
    if (modes.length === 0) {
      return
    }

    setItems(modes)
  }

  useEffect(() => {
    build(extensions, options)
  }, [extensions, options, moved])

  return [items]
}

async function buildShowItems(extensions, options) {
  const list = appendAdditionInfo(extensions, options)

  // 筛选置顶的扩展
  const topExtensions = await findTopExtensions(extensions, options)
  const listTop = list.filter((i) => topExtensions.includes(i.id))

  const shownModes = []
  if (listTop.length > 0) {
    shownModes.push({
      id: "__v_top__",
      name: "",
      extensions: sortByReferenceList(topExtensions, listTop)
    })
  }

  const modeArray = options.modes ?? []


  const asyncModes = modeArray.map(async (m) => {
    // 不显示空模式
    if (!m.extensions || m.extensions.length === 0) {
      return null
    }

    // 筛选出当前模式的扩展
    let extArray = list.filter((i) => m.extensions.includes(i.id))

    if (extArray.length === 0) {
      return null
    }

    const modeName = m.name

    appendModeInfo(extArray, m)

    return {
      id: m.id,
      name: modeName,
      extensions: await sortShowItems(options, extArray)
    }
  })

  let modes = await Promise.all(asyncModes)
  modes = modes.filter(Boolean)

  // 调试日志：输出处理后的模式
  console.log(
    "[usePopupExtensionsByMode] Processed modes:",
    modes.map((m) => ({
      id: m.id,
      name: m.name,
      extensionsCount: m.extensions?.length || 0
    }))
  )

  // 没有任何模式的扩展
  const modeExtensionIds = Array.from(new Set(modeArray.map((m) => m.extensions).flat()))
  const noneModeExtensions = list.filter((i) => !modeExtensionIds.includes(i.id))

  const sortedNoneModeExtensions = await sortShowItems(options, noneModeExtensions)
  const noneModeExtensionsGroup = {
    id: "default",
    name: getLang("mode_default_name"),
    extensions: sortedNoneModeExtensions
  }

  return [...shownModes, ...modes, noneModeExtensionsGroup]
}

async function sortShowItems(options, list) {
  // 先按照名称排序执行一次

  const list_pre = sortExtension(list, {
    ignoreEnable: true
  })

  if (!options.setting.isSortByFrequency) {
    return list_pre
  }

  // 如果有需要，再按照频率排序
  const refList = await manualEnableCounter.getOrder()
  return sortByReferenceList(refList, list_pre)
}

function appendModeInfo(extensions, mode) {
  if (!mode) {
    return
  }

  for (const extension of extensions) {
    if (!extension.__attach__) {
      extension.__attach__ = {}
    }
    extension.__attach__.modeName = mode.name
  }
}

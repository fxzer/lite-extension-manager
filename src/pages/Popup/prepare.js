import localforage from "localforage"

import { getPopupWidth } from ".../pages/Popup/utils/popupLayoutHelper"
import storage from ".../storage/sync"
import { appendAdditionInfo } from ".../utils/extensionHelper"

const forage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "TempCache",
  version: 1.0,
  storeName: "options"
})

/**
 * 获取配置信息（优先缓存，后台刷新）
 * 如果有新扩展安装标志，跳过缓存直接获取最新数据
 */
async function getOptionsWithCache() {
  try {
    // 检查是否有新扩展安装标志
    const installFlag = await new Promise((resolve) => {
      chrome.storage.local.get("_extensionRecentlyInstalled", (result) => {
        resolve(result._extensionRecentlyInstalled)
      })
    })

    // 如果有新扩展安装标志，跳过缓存
    if (installFlag) {
      console.log("[prepare] New extension detected, skipping cache")
      // 清除标志
      chrome.storage.local.remove("_extensionRecentlyInstalled")
      // 直接从 storage 获取
      const allOptions = await storage.options.getAll()
      await forage.setItem("all_options", allOptions)
      return allOptions
    }

    // 正常缓存逻辑
    const cachedOptions = await forage.getItem("all_options")
    if (cachedOptions) {
      // 后台静默刷新最新数据（不阻塞）
      storage.options.getAll()
        .then((allOptions) => forage.setItem("all_options", allOptions))
        .catch(() => {}) // 静默失败，不影响当前渲染

      return cachedOptions
    }
  } catch (_) {
    // 缓存读取失败，继续从 storage 获取
  }

  // 缓存未命中，直接从 storage 获取并缓存
  const allOptions = await storage.options.getAll()
  await forage.setItem("all_options", allOptions)
  return allOptions
}

/**
 * 获取自身的扩展ID，优先从缓存中读取
 */
async function getSelfId() {
  const selfId = await forage.getItem("self_id")
  if (selfId) {
    return selfId
  }

  const self = await chrome.management.getSelf()
  await forage.setItem("self_id", self.id)
  return self.id
}

/**
 * 过滤要显示的扩展
 */
function filterExtensions(allExtensions, selfId, allOptions) {
  return appendAdditionInfo(
    allExtensions
      .filter((ext) => ext.type !== "theme")
      .filter((ext) => ext.id !== selfId),
    allOptions.management
  )
}

/**
 * 准备 Popup 所需数据
 * 优化：并行获取，缓存优先
 */
export const prepare = async function () {
  // ✅ 并行获取：配置、扩展列表、自身ID
  const [allOptions, allExtensions, selfId] = await Promise.all([
    getOptionsWithCache(),
    chrome.management.getAll(),
    getSelfId()
  ])

  // 过滤扩展
  const extensions = filterExtensions(allExtensions, selfId, allOptions)

  // 设置 popup 宽度
  document.body.style.width = getPopupWidth(
    allOptions.setting.layout,
    extensions.length,
    allOptions.setting.columnCountInGirdView
  )

  // 设置缩放比例
  if (allOptions.setting.zoomRatio) {
    document.body.style.zoom = allOptions.setting.zoomRatio / 100
  }

  return {
    extensions,
    options: allOptions,
    params: {}
  }
}

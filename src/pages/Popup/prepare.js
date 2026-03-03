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

export const prepare = async function () {
  const allOptions = await getOptions()

  const extensions = await getShownExtensions(allOptions)

  // popup 宽度设置
  document.body.style.width = getPopupWidth(
    allOptions.setting.layout,
    extensions.length,
    allOptions.setting.columnCountInGirdView
  )

  let zoom = 1
  if (allOptions.setting.zoomRatio) {
    zoom = allOptions.setting.zoomRatio / 100
  }

  document.body.style.zoom = zoom

  return {
    // 插件信息
    extensions: extensions,
    // 用户配置信息
    options: allOptions,
    // 运行时临时参数
    params: {}
  }
}

/**
 * 获取要显示的扩展
 */
async function getShownExtensions(allOptions) {
  let allExtensions = await chrome.management.getAll()

  // 不展示主题类的扩展，不展示自己
  const selfId = await getSelfId()
  allExtensions = allExtensions
    .filter((ext) => ext.type !== "theme")
    .filter((ext) => ext.id !== selfId)

  // 填充附加信息
  const extensions = appendAdditionInfo(allExtensions, allOptions.management)

  return extensions
}

/**
 * 获取所有配置信息
 * 每次都从 storage 获取最新数据，确保与模式管理同步
 */
async function getOptions() {
  // 直接从 storage 获取最新数据
  const allOptions = await storage.options.getAll()

  // 调试日志：输出模式数据
  console.log(
    "[prepare.js] Loaded modes:",
    allOptions.modes?.map((m) => ({
      id: m.id,
      name: m.name,
      extensionsCount: m.extensions?.length || 0,
      extensions: m.extensions
    }))
  )

  // 更新缓存（供下次使用）
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

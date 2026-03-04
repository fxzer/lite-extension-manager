import localforage from "localforage"
import OptionsSync from "webext-options-sync"

import strCompress from "../utils/ConfigCompress"
import largeSync from "../utils/LargeSyncStorage"

const OptionsStorage = new OptionsSync({
  storageType: "sync",
  defaults: {
    // 模式数据
    // modes: [],
    // 通用配置
    setting: {},
    // 扩展管理类数据
    management: {}
  }
})

class ChromeSyncStorage {
  /**
   * 获取全部的配置数据
   * 优化：移除不必要的 chrome.storage.sync.get(null) 调用
   */
  async getAll() {
    // 直接从 largeSync 获取数据（已处理数据迁移的用户）
    return new Promise((resolve, reject) => {
      largeSync.get(["setting", "management", "modes"], (items) => {
        resolve(items)
      })
    })
  }

  /**
   * 设置配置项
   */
  async set(options) {
    return new Promise((resolve, reject) => {
      largeSync.set(options, () => {
        resolve()
      })
    })
  }
}

const LargeSyncStorage = new ChromeSyncStorage()

export const SyncOptionsStorage = {
  /**
   * 获取全部配置
   */
  async getAll() {
    const options = await LargeSyncStorage.getAll()

    if (!options.setting) {
      options.setting = {}
    }
    // setting 中的默认值 (尤其是默认为 true 的值，需要额外处理)
    if (options.setting.isShowFixedExtension === undefined) {
      options.setting.isShowFixedExtension = true
    }
    if (options.setting.isShowDotOfFixedExtension === undefined) {
      options.setting.isShowDotOfFixedExtension = true
    }
    if (options.setting.isShowAppNameInGirdView === undefined) {
      // 默认显示扩展名称
      options.setting.isShowAppNameInGirdView = true
    }
    // 默认排序方式修改成 name
    if (options.setting.defaultSortField === undefined) {
      options.setting.defaultSortField = "name"
    }

    // default for show hidden extension is set to false
    if (options.setting.isShowHiddenExtension === undefined) {
      options.setting.isShowHiddenExtension = false
    }

    // 扩展管理
    if (!options.management) {
      options.management = {}
    } else {
      options.management = strCompress.decompress(options.management)
    }

    if (!options.management.extensions) {
      options.management.extensions = []
    }

    return options
  },

  /**
   * 输出 sync 存储使用总量
   */
  async getUsage() {
    const total = await chrome.storage.sync.getBytesInUse(null)
    return total
  },

  /**
   * 更新配置中的某一项，e.g. set({setting: settingObj})
   */
  async set(option) {
    if (option.management) {
      option.management = strCompress.compress(option.management)
    }

    try {
      await LargeSyncStorage.set(option)
      await updateCache()
    } catch (error) {
      console.error("Failed to save config", error)
      if (error.message.includes("QUOTA_BYTES_PER_ITEM") || error.message.includes("QUOTA_BYTES")) {
        tryShowErrorMessage(chrome.i18n.getMessage("data_save_failed_quota"))
      } else {
        tryShowErrorMessage(`${chrome.i18n.getMessage("data_save_failed")}, ${error.message}`)
      }
    }
  },

  /**
   * 覆盖式更新所有配置
   */
  async setAll(options) {
    await chrome.storage.sync.clear()
    // 确保 modes 存在，否则设为空数组
    if (!options.modes) {
      options.modes = []
    }
    options.management = strCompress.compress(options.management)
    await LargeSyncStorage.set(options)
    await updateCache()
  }
}

class OptionStorageViewBuilder {
  getApi() {
    if (this.api) {
      return this.api
    } else {
      this.api = {}
      return this.api
    }
  }
}

// 让外部注入 message 的实现，因为在 background 下，不支持 UI，不能在这里写 UI 相关的代码，如引入 antd
export const OptionStorageViewProvider = new OptionStorageViewBuilder()

function tryShowErrorMessage(text) {
  try {
    if (typeof window === "undefined") {
      return
    }
    const api = OptionStorageViewProvider.getApi()
    if (api.message) {
      api.message.error(text)
    }
  } catch (error) {
  }
}

/**
 * 更新本地的 options 缓存
 */
async function updateCache() {
  const forage = localforage.createInstance({
    driver: localforage.LOCALSTORAGE,
    name: "TempCache",
    version: 1.0,
    storeName: "options"
  })

  const allOptions = await SyncOptionsStorage.getAll()
  await forage.setItem("all_options", allOptions)
}

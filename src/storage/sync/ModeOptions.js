import { nanoid } from "nanoid"

import { getLang } from ".../utils/utils"
import { SyncOptionsStorage } from "./options-storage"

// 内置系统模式定义
const SYSTEM_MODES = {
  default: { id: "default", name: "默认", extensions: [] },
  minimal: { id: "minimal", name: "极简", extensions: [] },
  development: { id: "development", name: "开发", extensions: [] }
}

export const ModeOptions = {
  async getModes() {
    const all = await SyncOptionsStorage.getAll()

    let modes = all.modes ? [...all.modes] : []
    let needsSave = false

    // 确保三个内置模式存在
    const builtinModeIds = ["default", "minimal", "development"]
    for (const modeId of builtinModeIds) {
      if (!modes.find((m) => m.id === modeId)) {
        const newMode = {
          ...SYSTEM_MODES[modeId],
          extensions: []
        }
        // default 放在最前面，其他按顺序添加
        if (modeId === "default") {
          modes.unshift(newMode)
        } else {
          // 找到 default 的位置，在它之后插入
          const defaultIndex = modes.findIndex((m) => m.id === "default")
          if (defaultIndex >= 0) {
            modes.splice(defaultIndex + 1, 0, newMode)
          } else {
            modes.unshift(newMode)
          }
        }
        needsSave = true
      }
    }

    // 如果添加了内置模式，保存到 storage
    if (needsSave) {
      await SyncOptionsStorage.set({ modes })
    }

    return formatModes(modes)
  },

  async addMode(mode) {
    const all = await SyncOptionsStorage.getAll()
    let modes = all.modes ? [...all.modes] : []

    const exist = modes.find((m) => m.name === mode.name)
    if (exist) {
      throw Error(`[Add Mode] Already exist same mode named ${mode.name}`)
    }

    if (mode.id) {
      const exist = modes.find((m) => m.id === mode.id)
      if (exist) {
        throw Error(`[Add Mode] Already exist same mode id is ${mode.id}`)
      }
    } else {
      mode.id = nanoid()
    }

    // 新模式添加到所有已有模式之后
    modes.push(mode)

    await SyncOptionsStorage.set({ modes })
  },

  async update(info) {
    const all = await SyncOptionsStorage.getAll()
    let modes = all.modes ? [...all.modes] : []

    const exist = modes.find((item) => item.id === info.id)
    if (!exist) {
      throw Error(`cannot find mode id is ${info.id}(${info.name})`)
    }

    const existSameName = modes
      .filter((i) => i.id !== info.id)
      .find((item) => item.name === info.name)
    if (existSameName) {
      throw Error(`already exist same mode named ${info.name}`)
    }

    Object.assign(exist, info)
    await SyncOptionsStorage.set({ modes })
  },

  async deleteMode(id) {
    // 内置模式不可删除
    if (isSystemMode(id)) {
      throw Error(`System mode cannot be deleted: ${id}`)
    }

    const all = await SyncOptionsStorage.getAll()
    if (!all.modes) {
      return
    }
    const newModes = all.modes.filter((m) => m.id !== id)
    await SyncOptionsStorage.set({ modes: newModes })
  },

  async orderModes(items) {
    const all = await SyncOptionsStorage.getAll()
    if (!all.modes) {
      return
    }

    // 允许自由排序，除了 default 必须在第一个位置
    const orderedModes = []

    // 先确保 default 在第一位
    const defaultMode = items.find((m) => m.id === "default")
    if (defaultMode) {
      orderedModes.push(defaultMode)
    }

    // 添加其他所有模式（保持相对顺序）
    items.forEach((item) => {
      if (item.id !== "default") {
        const exist = all.modes.find((m) => m.id === item.id)
        if (exist) {
          orderedModes.push(exist)
        }
      }
    })

    await SyncOptionsStorage.set({ modes: orderedModes })
  },

  /**
   * 将扩展添加到指定分组
   * @param {string} modeId 分组 ID
   * @param {string} extensionId 扩展 ID
   */
  async addExtensionToMode(modeId, extensionId) {
    const all = await SyncOptionsStorage.getAll()
    if (!all.modes) {
      return
    }

    const mode = all.modes.find((m) => m.id === modeId)
    if (!mode) {
      console.warn(`[ModeOptions] Mode not found: ${modeId}`)
      return
    }

    // 确保 extensions 数组存在
    if (!mode.extensions) {
      mode.extensions = []
    }

    // 避免重复添加
    if (!mode.extensions.includes(extensionId)) {
      mode.extensions.push(extensionId)
      await SyncOptionsStorage.set({ modes: all.modes })
      console.log(`[ModeOptions] Added extension ${extensionId} to mode ${modeId}`)
    }
  }
}

export default ModeOptions

export const formatModes = (modes) => {
  if (!modes) {
    return []
  }
  return modes.map((m) => {
    // 使用国际化名称
    if (m.id === "default") {
      m.name = getLang("mode_default_name") || "默认"
    } else if (m.id === "minimal") {
      m.name = getLang("mode_minimal_name") || "极简"
    } else if (m.id === "development") {
      m.name = getLang("mode_development_name") || "开发"
    }

    if (!m.extensions) {
      m.extensions = []
    }

    return m
  })
}

export const isSystemMode = (mode) => {
  if (!mode) {
    return false
  }

  // 只有 "default" 模式不可删除
  const protectedModeId = "default"

  if (typeof mode === "string") {
    return mode === protectedModeId
  }

  return mode.id === protectedModeId
}

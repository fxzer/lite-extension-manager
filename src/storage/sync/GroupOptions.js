import { nanoid } from "nanoid"

import { getLang } from ".../utils/utils"
import { SyncOptionsStorage } from "./options-storage"

export const GroupOptions = {
  async getGroups() {
    const all = await SyncOptionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []

    // 移除旧的 fixed / hidden 内置分组（升级兼容）
    const legacyIds = ["fixed", "hidden"]
    groups = groups.filter((g) => !legacyIds.includes(g.id))

    if (!groups.find((g) => g.id === "default")) {
      const defaultGroup = {
        id: "default",
        name: getLang("group_default_name"),
        extensions: []
      }
      groups.unshift(defaultGroup)
      await SyncOptionsStorage.set({ groups })
    }

    return formatGroups(groups)
  },

  async addGroup(group) {
    const all = await SyncOptionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []

    const exist = groups.find((g) => g.name === group.name)
    if (exist) {
      throw Error(`[Add Group] Already exist same group named ${group.name}`)
    }

    if (group.id) {
      const exist = groups.find((g) => g.id === group.id)
      if (exist) {
        throw Error(`[Add Group] Already exist same group id is ${group.id}`)
      }
    } else {
      group.id = nanoid()
    }

    if (group.id === "default") {
      groups.unshift(group)
    } else {
      groups.push(group)
    }

    if (group.id === "default") {
      group.desc = undefined
    }

    await SyncOptionsStorage.set({ groups })
  },

  async update(info) {
    const all = await SyncOptionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []

    const exist = groups.find((item) => item.id === info.id)
    if (!exist) {
      throw Error(`cannot find group id is ${info.id}(${info.name})`)
    }

    const existSameName = groups
      .filter((i) => i.id !== info.id)
      .find((item) => item.name === info.name)
    if (existSameName) {
      throw Error(`already exist same group named ${info.name}`)
    }

    if (info.id === "default") {
      info.desc = undefined
    }

    Object.assign(exist, info)
    await SyncOptionsStorage.set({ groups })
  },

  async deleteGroup(id) {
    const all = await SyncOptionsStorage.getAll()
    if (!all.groups) {
      return
    }
    const newGroups = all.groups.filter((g) => g.id !== id)
    await SyncOptionsStorage.set({ groups: newGroups })
  },

  async orderGroups(items) {
    const all = await SyncOptionsStorage.getAll()
    if (!all.groups) {
      return
    }
    const newGroups = []
    for (const item of items) {
      const exist = all.groups.find((g) => g.id === item.id)
      if (exist) {
        newGroups.push(exist)
      }
    }

    await SyncOptionsStorage.set({ groups: newGroups })
  }
}

export default GroupOptions

export const formatGroups = (groups) => {
  if (!groups) {
    return []
  }
  return groups.map((g) => {
    if (g.id === "default") {
      g.name = getLang("group_default_name")
    }

    if (!g.extensions) {
      g.extensions = []
    }

    return g
  })
}

export const isSpecialGroup = (group) => {
  if (!group) {
    return false
  }

  if (typeof group === "string") {
    return group === "default"
  }

  return group.id === "default"
}

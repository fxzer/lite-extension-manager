import localforage from "localforage"

import { DATABASE_NAME, DATABASE_VERSION } from "../DatabaseVersion"

/**
 * 保存在本地的配置项
 */
export class LocalOptions {
  private forage: LocalForage

  constructor() {
    this.forage = localforage.createInstance({
      driver: localforage.INDEXEDDB,
      name: DATABASE_NAME,
      version: DATABASE_VERSION,
      storeName: "options"
    })
  }

  /*
   * 迁移旧的配置
   */
  async migrate() {
    // 清理残留的 activeModeId，确保指向有效的模式
    const activeModeId = await this.getActiveModeId()
    if (activeModeId) {
      // 验证 activeModeId 是否指向有效的模式
      const validModeIds = ["default", "minimal", "development"]
      if (!validModeIds.includes(activeModeId) && !activeModeId.startsWith("mode_")) {
        await this.forage.removeItem("activeModeId")
      }
    }
  }

  async getActiveModeId(): Promise<string | null> {
    const id = await this.forage.getItem<string>("activeModeId")
    if (id === null || id === undefined) {
      return null
    }
    return id
  }

  async setActiveModeId(id: string) {
    await this.forage.setItem("activeModeId", id ?? "")
  }

  async getValue<T>(key: string): Promise<T | null> {
    const value = await this.forage.getItem<T>(key)
    if (value === null || value === undefined) {
      return null
    }
    return value
  }

  async setValue<T>(key: string, value: T) {
    await this.forage.setItem<T>(key, value)
  }

  async getLastInitialTime(): Promise<number> {
    const time = await this.forage.getItem<number>("lastInitialExtensionTime")
    return time ?? 0
  }

  async setLastInitialTime(time: number) {
    await this.forage.setItem("lastInitialExtensionTime", time)
  }

  async getNeedBuildExtensionIcon(): Promise<boolean> {
    const str = await this.forage.getItem<string>("isNeedBuildExtensionIcon")
    if (str === "true") {
      return true
    } else if (str === "false") {
      return false
    }
    return true
  }

  async setNeedBuildExtensionIcon(isNeedBuildExtensionIcon: boolean) {
    await this.forage.setItem(
      "isNeedBuildExtensionIcon",
      isNeedBuildExtensionIcon.toString().toLowerCase()
    )
  }
}

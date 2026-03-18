import localforage from "localforage"

import { DATABASE_NAME, DATABASE_VERSION } from "../../../storage/DatabaseVersion"
import { ExtensionRecord } from "./ExtensionRecord"

/**
 * 本地缓存的 Extension 信息
 */
export class ExtensionRepo {
  private forage: LocalForage

  constructor() {
    this.forage = localforage.createInstance({
      // ✅ 优先使用 IndexedDB，如果不可用则降级到 localStorage
      driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
      name: DATABASE_NAME,
      version: DATABASE_VERSION,
      storeName: "extensions"
    })
  }

  public async get(id: string): Promise<ExtensionRecord | null> {
    return await this.forage.getItem(id)
  }

  public async set(extension: ExtensionRecord): Promise<void> {
    if (!extension.id) {
      throw new Error("Extension id is required.")
    }
    const old = await this.get(extension.id)
    if (old) {
      const icon = extension.icon || old.icon
      await this.forage.setItem(extension.id, { ...old, ...extension, icon: icon })
    } else {
      await this.forage.setItem(extension.id, extension)
    }
  }

  public async remove(id: string): Promise<void> {
    await this.forage.removeItem(id)
  }

  public async getKeys(): Promise<string[]> {
    return await this.forage.keys()
  }

  /**
   * 批量获取所有扩展记录
   * 用于消除 N+1 查询问题
   */
  public async getAll(): Promise<Map<string, ExtensionRecord>> {
    const keys = await this.forage.keys()
    const records = new Map<string, ExtensionRecord>()

    // 使用 Promise.all 并行获取所有记录
    const promises = keys.map(async (key) => {
      const record = await this.forage.getItem<ExtensionRecord>(key)
      if (record) {
        records.set(key, record)
      }
    })

    await Promise.all(promises)
    return records
  }

  /**
   * 批量获取指定 ID 的扩展记录
   */
  public async getByIds(ids: string[]): Promise<Map<string, ExtensionRecord>> {
    const records = new Map<string, ExtensionRecord>()

    const promises = ids.map(async (id) => {
      const record = await this.forage.getItem<ExtensionRecord>(id)
      if (record) {
        records.set(id, record)
      }
    })

    await Promise.all(promises)
    return records
  }

  public async clear(): Promise<void> {
    await this.forage.clear()
  }
}

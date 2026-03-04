/**
 * IndexedDB 数据库版本号常量
 *
 * 重要：所有使用 "ExtensionManagerForage" 数据库的 localforage 实例
 * 必须使用相同的版本号，否则会导致版本冲突错误
 *
 * IndexedDB 规则：版本号只能递增，不能递减
 */
export const DATABASE_VERSION = 1.0

/**
 * 数据库名称
 */
export const DATABASE_NAME = "ExtensionManagerForage"

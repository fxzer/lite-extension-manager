import { useCallback, useEffect, useState } from "react"

import { filterExtensions, isAppExtension, isExtExtension } from ".../utils/extensionHelper"
import isMatch from ".../utils/searchHelper"

/**
 * 扩展搜索控制器
 *
 * 功能说明：
 * - Popup 始终显示所有扩展（快捷管理入口）
 * - 模式切换只影响"启用/禁用"操作，不影响显示
 * - 搜索功能可以按名称、描述等过滤扩展
 */
export const useSearchController = (extensions) => {
  // 普通扩展
  const [pluginExtensions, setPluginExtensions] = useState([])
  // APP 类型的扩展
  const [appExtensions, setAppExtensions] = useState([])

  // 当前的搜索词
  const [currentSearchText, setSearchText] = useState("")

  // 执行普通扩展的搜索
  // ✅ 修复：移除 mode 参数，始终显示所有扩展
  const searchPlugin = useCallback(
    (search) => {
      // ✅ 始终显示所有扩展，不再根据模式过滤
      let allExtensions = filterExtensions(extensions, isExtExtension)

      if (!search || search.trim() === "") {
        return allExtensions
      } else {
        const result = allExtensions.filter((ext) => {
          return isMatch(
            [
              ext.name,
              ext.shortName,
              ext.description,
              ext.__attach__?.alias,
              ext.__attach__?.remark,
              ext.__attach__?.groupName
            ],
            search
          )
        })
        return result
      }
    },
    [extensions]
  )

  // 执行 APP 类型扩展的搜索
  const searchApp = useCallback(
    (text) => {
      const allApp = filterExtensions(extensions, isAppExtension)

      if (!text || text.trim() === "") {
        return allApp
      }
      const searchResult = allApp.filter((ext) => {
        return isMatch([ext.name, ext.shortName, ext.description], text)
      })
      return searchResult
    },
    [extensions]
  )

  // 初始化扩展列表
  useEffect(() => {
    setPluginExtensions(searchPlugin(currentSearchText))
    setAppExtensions(searchApp(currentSearchText))
  }, [currentSearchText, searchPlugin, searchApp])

  // 执行搜索，搜索词变更时调用
  const onSearchByTextChange = (text) => {
    setSearchText(text)
  }

  // ✅ 保留此函数以兼容现有接口，但内部不再做任何过滤
  // 模式切换现在只影响"启用/禁用"操作，不影响显示
  const onSearchByModeChange = (mode) => {
    // 不再需要根据模式过滤扩展列表
    // 此函数保留是为了向后兼容，但不执行任何操作
  }

  return [pluginExtensions, appExtensions, onSearchByTextChange, onSearchByModeChange]
}

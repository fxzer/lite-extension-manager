import { useCallback, useEffect, useState } from "react"

import { filterExtensions, isAppExtension, isExtExtension } from ".../utils/extensionHelper"
import isMatch from ".../utils/searchHelper"

/**
 * 根据搜索词和当前选择的模式变化，执行搜索
 */
export const useSearchController = (extensions) => {
  // 普通扩展
  const [pluginExtensions, setPluginExtensions] = useState([])
  // APP 类型的扩展
  const [appExtensions, setAppExtensions] = useState([])

  // 当前模式（空表示显示全部）
  const [currentMode, setCurrentMode] = useState(null)
  // 当前的搜索词
  const [currentSearchText, setSearchText] = useState("")

  // 执行普通扩展的搜索
  const searchPlugin = useCallback(
    (mode, search) => {
      let modeExtensions = []
      if (mode) {
        if (!mode.extensions || mode.extensions.length === 0) {
          return modeExtensions
        }

        modeExtensions = extensions.filter((ext) => mode.extensions.includes(ext.id))
      } else {
        modeExtensions = filterExtensions(extensions, isExtExtension)
      }

      if (!search || search.trim() === "") {
        return modeExtensions
      } else {
        const result = modeExtensions.filter((ext) => {
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
    setPluginExtensions(searchPlugin(currentMode, currentSearchText))
    setAppExtensions(searchApp(currentSearchText))
  }, [currentMode, currentSearchText, searchPlugin, searchApp])

  // 执行搜索，搜索词变更时调用
  const onSearchByTextChange = (text) => {
    setSearchText(text)
  }

  // 执行搜索，当前模式变更时调用
  const onSearchByModeChange = (mode) => {
    setCurrentMode(mode)
  }

  return [pluginExtensions, appExtensions, onSearchByTextChange, onSearchByModeChange]
}

import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { InfoCircleOutlined } from "@ant-design/icons"
import { Alert, Switch, message } from "antd"
import classNames from "classnames"
import chromeP from "webext-polyfill-kinda"

import { LocalOptions } from ".../storage/local"
import storage from ".../storage/sync"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper"
import { handleExtensionOnOff } from "../../Popup/ExtensionOnOffHandler.js"
import analytics from ".../utils/googleAnalyze.js"
import { getLang, isStringEmpty } from ".../utils/utils.js"
import Title from "../Title.jsx"
import { ModeStyle } from "./IndexModeStyle.js"
import ModeContent from "./ModeContent.jsx"
import ModeNav from "./ModeNav.jsx"
import useModeItems from "./hooks/useModeItems.js"

const localOptions = new LocalOptions()

function ModeManagement() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const paramModeId = searchParams.get("id")

  const [extensions, setExtensions] = useState([])
  const [selectedMode, setSelectedMode] = useState()

  // 不能使用其中的 modes 的数据，因为这里就是编辑 modes，随时可能会有变动
  const [options, setOptions] = useState(null)
  // 模式信息，保持快速更新
  const [modeListInfo, setModeListInfo] = useState([])

  const [messageApi, contextHolder] = message.useMessage()

  // 是否已完成初始化（包括恢复上次选中的模式）
  const [isInitialized, setIsInitialized] = useState(false)

  // 未模式扩展中，不显示其它模式的扩展
  const [hiddenOtherGroupInNoneGroup, setHiddenOtherGroupInNoneGroup] = useState(false)

  // 快捷键映射缓存
  const [shortcutMap, setShortcutMap] = useState(new Map())

  const [enabledExtensions, disabledExtensions, onItemClick] = useModeItems(
    selectedMode,
    modeListInfo,
    extensions,
    {
      hiddenFixedGroupInNoneGroup: false,
      hiddenHiddenGroupInNoneGroup: false,
      hiddenOtherGroupInNoneGroup
    }
  )

  // 加载所有快捷键映射
  const loadShortcutMap = async () => {
    const result = await chrome.storage.local.get()
    const map = new Map()
    for (const mode of modeListInfo) {
      const shortcut = result[`mode_shortcut_${mode.id}`]
      if (shortcut) {
        map.set(shortcut, mode)
      }
    }
    setShortcutMap(map)
  }

  // 初始化默认快捷键（只执行一次）
  const initializeDefaultShortcuts = async () => {
    const result = await chrome.storage.local.get()
    const hasShortcuts = Object.keys(result).some(key => key.startsWith('mode_shortcut_'))

    // 如果没有任何快捷键，设置默认值
    if (!hasShortcuts && modeListInfo.length > 0) {
      const shortcuts = {}
      modeListInfo.slice(0, 9).forEach((mode, index) => {
        shortcuts[`mode_shortcut_${mode.id}`] = `Alt+${index + 1}`
      })
      await chrome.storage.local.set(shortcuts)
      await loadShortcutMap()
    }
  }

  async function updateByModeConfigs() {
    const modeList = await storage.mode.getModes()
    setModeListInfo(modeList)
    await loadShortcutMap()
  }

  // 初始化
  useEffect(() => {
    storage.options.getAll().then((o) => {
      setOptions(o)
    })

    chromeP.management.getAll().then((exts) => {
      setExtensions(filterExtensions(exts, isExtExtension))
    })

    storage.mode.getModes().then((modes) => {
      setModeListInfo(modes)

      analytics.fireEvent("mode_setting_open", {
        totalCount: modes.length
      })
    })
  }, [])

  // 初始化默认快捷键
  useEffect(() => {
    if (modeListInfo.length > 0) {
      initializeDefaultShortcuts()
    }
  }, [modeListInfo])

  // 全局快捷键监听
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 只在选项页面激活时响应
      if (document.hidden) return

      const { altKey, code } = e

      // 检查是否是 Alt + 数字键
      if (altKey && /^Digit[1-9]$/.test(code)) {
        const number = code.replace('Digit', '')
        const shortcut = `Alt+${number}`
        const mode = shortcutMap.get(shortcut)

        if (mode) {
          e.preventDefault()
          switchToMode(mode)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcutMap])

  // 切换到指定模式
  const switchToMode = async (mode) => {
    setSelectedMode(mode)
    await localOptions.setValue("selectedModeIdInSettings", mode.id)
    // 保存到 LocalOptions，让 Popup 知道当前模式已切换
    await localOptions.setActiveModeId(mode.id)

    // 真正执行模式切换：启用/禁用扩展
    if (options?.setting?.isRaiseEnableWhenSwitchGroup && mode.id !== "all") {
      try {
        const newExtensions = await handleExtensionOnOff(
          extensions,
          options,
          [mode],
          mode
        )
        setExtensions(newExtensions)
      } catch (error) {
        console.error("[快捷键切换] 模式切换失败:", error)
      }
    }

    const message = getLang("mode_switched_shortcut", mode.name)
    messageApi.success(message || `已切换到模式：${mode.name}`)
  }

  // 如果 URL 中有 ID 参数，则切换到对应模式
  useEffect(() => {
    if (!paramModeId) {
      return
    }
    const mode = modeListInfo.find((m) => m.id === paramModeId)
    if (mode) {
      setSelectedMode(mode)
      // 切换模式之后，就删除 URL 参数中的 ID
      searchParams.delete("id")
      navigate(`?${searchParams.toString()}`, { replace: true })
    } else {
      messageApi.warning(`Mode ${paramModeId} not found`)
      setTimeout(() => {
        searchParams.delete("id")
        navigate(`?${searchParams.toString()}`, { replace: true })
      }, 2000)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeListInfo, paramModeId, messageApi])

  // 更新模式数据
  useEffect(() => {
    updateByModeConfigs()
  }, [selectedMode])

  // 初始化时恢复上次选中的模式（优先级低于 URL 参数，但高于默认模式）
  useEffect(() => {
    // 如果已经初始化过，跳过
    if (isInitialized) {
      return
    }

    // 如果有 URL 参数，让 URL 参数的处理逻辑去处理，这里跳过
    if (paramModeId) {
      return
    }

    // 如果模式列表还没加载，等待
    if (!modeListInfo || modeListInfo.length === 0) {
      return
    }

    // 执行恢复逻辑
    const restoreLastSelectedMode = async () => {
      try {
        const lastSelectedModeId = await localOptions.getValue("selectedModeIdInSettings")

        if (lastSelectedModeId) {
          const lastMode = modeListInfo.find((m) => m.id === lastSelectedModeId)
          if (lastMode) {
            setSelectedMode(lastMode)
            setIsInitialized(true)
            return
          } else {
          }
        }
      } catch (error) {
        console.error("[IndexMode] Failed to restore last selected mode:", error)
      }

      // 如果没有保存的模式或模式不存在，选择默认模式
      const defaultMode = modeListInfo.find((m) => m.id === "default")
      if (defaultMode) {
        setSelectedMode(defaultMode)
        setIsInitialized(true)
      }
    }

    restoreLastSelectedMode()
  }, [isInitialized, paramModeId, modeListInfo])

  // 标记初始化完成（当有 URL 参数时）
  useEffect(() => {
    if (paramModeId && selectedMode && !isInitialized) {
      setIsInitialized(true)
    }
  }, [paramModeId, selectedMode, isInitialized])

  const onSelectedChanged = async (item) => {
    setSelectedMode(item)

    // 保存选中的模式 ID 到本地存储
    if (item?.id) {
      try {
        await localOptions.setValue("selectedModeIdInSettings", item.id)
      } catch (error) {
        console.error("[IndexMode] Failed to save selected mode:", error)
      }
    } else {
      // 清除保存的模式 ID（当取消选择时）
      try {
        await localOptions.setValue("selectedModeIdInSettings", "")
      } catch (error) {
        console.error("[IndexMode] Failed to clear selected mode:", error)
      }
    }
  }

  const onModeDeleted = async (item) => {
    await updateByModeConfigs()
  }

  const onModeListChange = async (updatedMode) => {
    await updateByModeConfigs()
    if (updatedMode && selectedMode?.id === updatedMode.id) {
      setSelectedMode(updatedMode)
    }
  }

  const onModeOrdered = async (items) => {
    await storage.mode.orderModes(items)
    await updateByModeConfigs()
  }

  // 快捷键绑定变化时重新加载映射
  const onShortcutBindingChange = async () => {
    await loadShortcutMap()
  }

  if (!options) {
    return null
  }

  return (
    <ModeStyle>
      <Title title={getLang("mode_title")}></Title>
      {contextHolder}
      <Alert
        description={
          <span>
            {getLang("mode_description")}{" "}
            <span style={{ marginLeft: 8, opacity: 0.8 }}>
              {getLang("mode_shortcut_hint")}
            </span>
          </span>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 16 }}
      />
      <div className="mode-edit-box">
        <div className="left-box">
          <ModeNav
            modeInfo={modeListInfo}
            current={selectedMode}
            onSelectedChanged={onSelectedChanged}
            onModeItemDeleted={onModeDeleted}
            onModeListChange={onModeListChange}
            onModeOrdered={onModeOrdered}></ModeNav>
        </div>

        <div className="right-box">
          <div
            className={classNames({
              "view-hidden": isStringEmpty(selectedMode?.id)
            })}>
            {selectedMode && (
              <ModeContent
                enabledExtensions={enabledExtensions}
                disabledExtensions={disabledExtensions}
                mode={selectedMode}
                modeList={modeListInfo}
                options={options}
                onItemClick={onItemClick}
                onShortcutBindingChange={onShortcutBindingChange}>
                <div className="setting-item">
                  <span>排除其他模式中的扩展</span>
                  <Switch
                    size="small"
                    checked={hiddenOtherGroupInNoneGroup}
                    onChange={(value) => setHiddenOtherGroupInNoneGroup(value)}
                  />
                </div>
              </ModeContent>
            )}
          </div>
        </div>
      </div>
    </ModeStyle>
  )
}

export default ModeManagement

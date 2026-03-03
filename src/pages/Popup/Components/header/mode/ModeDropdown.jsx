import React, { memo, useCallback, useEffect, useMemo, useState } from "react"

import { DownOutlined } from "@ant-design/icons"
import { Button, Dropdown } from "antd"

import { LocalOptions } from ".../storage/local/LocalOptions"
import { getLang } from ".../utils/utils"

const localOptions = new LocalOptions()

const ModeDropdown = memo(({ options, className, onModeChanged }) => {
  const { modes: rawModes } = options
  const [selectedMode, setSelectedMode] = useState(null)

  // 确保 modes 至少包含默认模式
  const modes = useMemo(() => {
    if (rawModes?.length > 0) {
      return rawModes
    }
    return [{ id: "default", name: getLang("mode_default_name") }]
  }, [rawModes])

  const raiseEnable = options.setting?.isRaiseEnableWhenSwitchGroup ?? true

  // 执行模式切换
  const handleModeChange = useCallback(
    (mode) => {
      setSelectedMode(mode)
      localOptions.setActiveModeId(mode?.id)

      if (!mode || mode.id === "all") {
        onModeChanged({
          select: null,
          action: raiseEnable
        })
      } else {
        onModeChanged({
          select: mode,
          action: raiseEnable
        })
      }
    },
    [raiseEnable, onModeChanged]
  )

  // 初始化选中模式
  useEffect(() => {
    if (!selectedMode && modes.length > 0) {
      localOptions.getActiveModeId().then((modeId) => {
        let mode = modes.find((m) => m.id === modeId)

        // 如果保存的模式 ID 不存在（可能是残留数据），清除并使用默认模式
        if (modeId && !mode) {
          console.log("[ModeDropdown] Invalid activeModeId, clearing:", modeId)
          localOptions.setActiveModeId("")
        }

        // 使用找到的模式或默认模式
        mode = mode || modes.find((m) => m.id === "default") || modes[0]
        setSelectedMode(mode)

        // 初始化时触发模式切换，确保扩展状态同步
        // 无论是启用还是禁用了"切换模式时启用/禁用扩展"功能，都需要同步
        if (mode) {
          console.log("[ModeDropdown] Initial mode sync:", mode.id, mode.name)
          handleModeChange(mode)
        }
      })
    }
  }, [selectedMode, modes, handleModeChange])

  // 当前显示的模式名称
  const displayMode = selectedMode || modes[0]

  // 构建菜单项
  const menuItems = modes.map((m) => ({
    key: m.id,
    label: m.name
  }))

  return (
    <div className={className}>
      <Dropdown
        menu={{
          items: menuItems,
          onClick: ({ key }) => {
            const mode = modes.find((m) => m.id === key)
            handleModeChange(mode)
          },
          selectedKeys: selectedMode ? [selectedMode.id] : []
        }}
        trigger={["click"]}
        placement="bottomLeft"
        overlayClassName="mode-dropdown-overlay">
        <Button color="default" variant="filled" size="small" style={{ height: 26 }}>
          {displayMode?.name || getLang("mode_default_name")}{" "}
          <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
        </Button>
      </Dropdown>
    </div>
  )
})

export default ModeDropdown

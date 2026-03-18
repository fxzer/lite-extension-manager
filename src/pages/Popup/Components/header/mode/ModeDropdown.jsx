import React, { memo, useCallback, useEffect, useMemo, useState } from "react"

import { DownOutlined } from "@ant-design/icons"
import { Button, Dropdown } from "antd"

import { LocalOptions } from ".../storage/local/LocalOptions"
import { formatModes } from "../../../../../storage/sync/ModeOptions"
import { getLang } from ".../utils/utils"

const localOptions = new LocalOptions()

const ModeDropdown = memo(({ options, className, onModeChanged }) => {
  const { modes: rawModes } = options
  const [selectedMode, setSelectedMode] = useState(null)

  // 确保 modes 至少包含默认模式，并使用 formatModes 进行国际化处理
  const modes = useMemo(() => {
    if (rawModes?.length > 0) {
      return formatModes(rawModes)
    }
    return [{ id: "default", name: getLang("mode_default_name") }]
  }, [rawModes])

  const raiseEnable = options.setting?.isRaiseEnableWhenSwitchGroup ?? true

  // 执行模式切换（初始化和用户点击都会调用）
  const handleModeChange = useCallback(
    async (mode) => {
      setSelectedMode(mode)
      // ✅ 确保存储操作完成后再继续
      await localOptions.setActiveModeId(mode?.id ?? "")

      // ✅ 根据 raiseEnable 配置决定是否应用模式配置
      if (raiseEnable) {
        if (!mode || mode.id === "all") {
          onModeChanged({
            select: null,
            action: true  // 应用配置
          })
        } else {
          onModeChanged({
            select: mode,
            action: true  // 应用配置
          })
        }
      } else {
        // 用户关闭了"切换模式时启用/禁用扩展"功能
        onModeChanged({
          select: mode,
          action: false  // 不应用配置
        })
      }
    },
    [raiseEnable, onModeChanged]
  )

  // 初始化选中模式（会触发模式应用）
  useEffect(() => {
    if (!selectedMode && modes.length > 0) {
      localOptions.getActiveModeId().then(async (modeId) => {
        let mode = modes.find((m) => m.id === modeId)

        // 如果保存的模式 ID 不存在（可能是残留数据），清除并使用默认模式
        if (modeId && !mode) {
          await localOptions.setActiveModeId("")
        }

        // 使用找到的模式或默认模式
        mode = mode || modes.find((m) => m.id === "default") || modes[0]

        // ✅ 初始化时也应用模式配置
        await handleModeChange(mode)
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

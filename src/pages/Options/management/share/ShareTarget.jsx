import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react"

import { Segmented } from "antd"
import styled from "styled-components"

import ExtensionTarget from ".../pages/Options/components/ExtensionTarget"
import { getLang } from ".../utils/utils"

const ShareTarget = ({ extensions, options, config }, ref) => {
  // 获取插件管理自身的 ID 并过滤掉
  const selfExtensionId = chrome.runtime.id
  const filteredExtensions = extensions.filter((ext) => ext.id !== selfExtensionId)

  const [targetRange, setTargetRange] = useState("all")
  const [partConfig, setPartConfig] = useState({})

  const targetRef = useRef()

  useImperativeHandle(ref, () => ({
    // 获取选择的目标扩展
    getTarget: () => {
      let extensionIds = []

      if (targetRange === "part") {
        // 部分扩展：从用户选择中获取
        const selected = targetRef.current.getExtensionSelectConfig()
        extensionIds = selected.extensions || []
      } else if (targetRange.startsWith("mode_")) {
        // 选择了特定模式
        const modeId = targetRange.replace("mode_", "")
        const mode = (options.modes || []).find((m) => m.id === modeId)
        if (mode) {
          extensionIds = (mode.extensions || []).filter((id) => id !== selfExtensionId)
        }
      } else {
        // 全部扩展
        extensionIds = filteredExtensions.map((ext) => ext.id)
      }

      return {
        extensionIds: extensionIds
      }
    },

    getConfig: () => {
      return {
        targetRange: targetRange,
        partConfig: targetRef?.current?.getExtensionSelectConfig()
      }
    }
  }))

  useEffect(() => {
    if (!config) {
      return
    }
    setTargetRange(config.targetRange)
    if (config.targetRange === "part") {
      setPartConfig({
        target: config.partConfig
      })
    }
  }, [config])

  // 构建分段选择器选项
  const buildSegmentOptions = () => {
    const baseOptions = [
      { label: getLang("management_export_all_extension"), value: "all" },
      { label: getLang("management_export_part_extension"), value: "part" }
    ]

    // 添加模式选项
    const modes = options.modes || []
    const modeOptions = modes.map((mode) => ({
      label: mode.name || mode.id,
      value: `mode_${mode.id}`
    }))

    return [...baseOptions, ...modeOptions]
  }

  return (
    <Style>
      <Segmented
        value={targetRange}
        onChange={(v) => setTargetRange(v)}
        options={buildSegmentOptions()}
      />

      {targetRange === "part" && (
        <div className="ext-select-target-wrapper">
          <ExtensionTarget
            ref={targetRef}
            extensions={filteredExtensions}
            options={options}
            searchText=""
            config={partConfig}
            params={{
              emptyMessage: getLang("management_export_no_extension_selected")
            }}
          />
        </div>
      )}
    </Style>
  )
}

export default memo(forwardRef(ShareTarget))

const Style = styled.div`
  .ext-select-target-wrapper {
    margin-top: 12px;
  }
`

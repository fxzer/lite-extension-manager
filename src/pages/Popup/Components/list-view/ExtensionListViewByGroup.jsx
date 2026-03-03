import React, { memo, useCallback, useState } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { storage } from ".../storage/sync"
import { usePopupExtensionsByGroup } from "../../utils/usePopupExtensionsByGroup"
import FoldGroupName from "../common/FoldGroupName"
import ExtensionListItem from "./ExtensionListItem"

/**
 * 普通扩展的列表展示
 */
const ExtensionListViewByGroup = memo(({ extensions, options, currentMode }) => {
  const [moved, setMoved] = useState("") // 没有业务意义，就是一个依赖值，值发生变化，则重新执行 usePopupExtensions

  const [groups] = usePopupExtensionsByGroup(extensions, options, moved)

  const onItemEnableChanged = useCallback(async (item, mode) => {
    setMoved(Date.now().toString())

    // 如果有当前模式，同步更新模式的 extensions 数组
    if (mode && mode.id) {
      console.log("[ExtensionListViewByGroup] Updating mode extensions:", {
        modeId: mode.id,
        modeName: mode.name,
        extensionId: item.id,
        extensionEnabled: item.enabled
      })

      try {
        // 获取所有模式
        const allModes = await storage.mode.getModes()
        const targetMode = allModes.find((m) => m.id === mode.id)

        if (targetMode) {
          // 更新模式的 extensions 数组
          if (item.enabled) {
            // 启用：添加到模式的 extensions 数组（如果不存在）
            if (!targetMode.extensions.includes(item.id)) {
              targetMode.extensions = [...targetMode.extensions, item.id]
            }
          } else {
            // 禁用：从模式的 extensions 数组中移除
            targetMode.extensions = targetMode.extensions.filter((id) => id !== item.id)
          }

          // 保存更新后的模式
          await storage.mode.update(targetMode)

          console.log("[ExtensionListViewByGroup] Mode updated:", {
            modeId: targetMode.id,
            extensionsCount: targetMode.extensions.length,
            extensions: targetMode.extensions
          })
        }
      } catch (error) {
        console.error("[ExtensionListViewByGroup] Failed to update mode:", error)
      }
    }
  }, [])

  return (
    <Style>
      {groups
        .filter((g) => g.extensions.length > 0)
        .map((group) => {
          return (
            <ExtensionListSpace
              group={group}
              options={options}
              key={group.id}
              onItemEnableChanged={onItemEnableChanged}></ExtensionListSpace>
          )
        })}
    </Style>
  )
})

export default ExtensionListViewByGroup

const ExtensionListSpace = memo(({ group, options, onItemEnableChanged }) => {
  // 是否折叠分组显示
  const [fold, setFold] = useState(false)

  const onFoldChanged = useCallback((fold) => {
    setFold(fold)
  }, [])

  return (
    <div>
      {group.name && (
        <span className="group-name">
          <FoldGroupName group={group} onFoldChanged={onFoldChanged}></FoldGroupName>
        </span>
      )}

      <ul
        className={classNames({
          "show-list": !fold,
          "hide-list": fold
        })}>
        {group.extensions.map((item) => (
          <li key={item.id}>
            <ExtensionListItem
              item={item}
              enabled={item.enabled}
              options={options}
              currentMode={currentMode}
              onItemEnableChanged={onItemEnableChanged}
            />
          </li>
        ))}
      </ul>
    </div>
  )
})

const Style = styled.ul`
  li {
    border-bottom: 1px solid ${(props) => props.theme.settingBorderBottom};
  }

  li:last-child {
    border-bottom: none;
  }

  .group-name {
    display: flex;
    align-items: center;

    margin: 12px 8px;
    user-select: none;

    &::before,
    &::after {
      border-bottom: 1px solid ${(props) => props.theme.inputBorder};
    }

    &::before {
      content: "";
      width: 20px;
      margin: auto 8px auto 0;
    }

    &::after {
      content: "";
      flex: 1 1;
      margin: auto 0 auto 8px;
    }
  }

  .show-list {
    opacity: 1;
    transition: all 0.4s;
  }

  .hide-list {
    overflow: hidden;
    opacity: 0;
    max-height: 0px;
    transition: all 0.4s;
  }
`

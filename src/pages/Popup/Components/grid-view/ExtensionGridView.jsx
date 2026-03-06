import React, { memo, useCallback, useState, useEffect } from "react"

import { EyeInvisibleOutlined, EyeOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons"
import { Divider, Empty } from "antd"
import { styled } from "styled-components"

import { MAX_COLUMN_COUNT, MIN_COLUMN_COUNT } from ".../constants/popup"
import { storage } from "../../../../storage/sync"
import { getLang } from "../../../../utils/utils"
import { usePopupExtensions } from "../../utils/usePopupExtensions"
import ExtensionGridItem from "./ExtensionGridItem"

const INITIAL_RENDER_COUNT = 30

const ExtensionGrid = memo(({ extensions, options, currentMode, isShowBottomDivider }) => {
  const [moved, setMoved] = useState("") // 没有业务意义，就是一个依赖值，值发生变化，则重新执行 usePopupExtensions

  const [items] = usePopupExtensions(extensions, options, moved)

  const items0 = items.top
  const items1 = items.enabled
  const items2 = items.disabled

  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT)

  useEffect(() => {
    const totalItems = items0.length + items1.length + items2.length
    if (totalItems > INITIAL_RENDER_COUNT && visibleCount === INITIAL_RENDER_COUNT) {
      const timer = setTimeout(() => {
        setVisibleCount(totalItems)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [items0.length, items1.length, items2.length, visibleCount])

  let remainingCount = visibleCount
  
  const displayItems0 = items0.slice(0, remainingCount)
  remainingCount = Math.max(0, remainingCount - items0.length)
  
  const displayItems1 = items1.slice(0, remainingCount)
  remainingCount = Math.max(0, remainingCount - items1.length)
  
  const displayItems2 = items2.slice(0, remainingCount)

  // 1. 显示/隐藏名称控制（本地 state 保证立即响应）
  const [isShowAppName, setIsShowAppName] = useState(options.setting.isShowAppNameInGirdView ?? true)
  const onToggleShowAppName = async () => {
    const newVal = !isShowAppName
    setIsShowAppName(newVal)
    const allOptions = await storage.options.getAll()
    const setting = { ...allOptions.setting, isShowAppNameInGirdView: newVal }
    await storage.options.set({ setting: setting })
  }

  // 2. 列数控制（本地 state 保证立即响应）
  const [columnCount, setColumnCount] = useState(options.setting.columnCountInGirdView ?? 6)
  const onChangeColumnCount = async (delta) => {
    const current = columnCount
    let newCount = Number(current) + delta
    if (newCount < MIN_COLUMN_COUNT) newCount = MIN_COLUMN_COUNT
    if (newCount > MAX_COLUMN_COUNT) newCount = MAX_COLUMN_COUNT

    if (newCount === current) return

    setColumnCount(newCount)
    document.body.style.width = `${newCount * 80}px`
    const allOptions = await storage.options.getAll()
    const setting = { ...allOptions.setting, columnCountInGirdView: newCount }
    await storage.options.set({ setting: setting })
  }

  const onItemMove = useCallback(async (item, mode) => {
    setMoved(Date.now().toString())

    // 如果有当前模式，同步更新模式的 extensions 数组
    if (mode && mode.id) {

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

        }
      } catch (error) {
        console.error("[ExtensionGridView] Failed to update mode:", error)
      }
    }
  }, [])

  // 置顶分区下方的分割线是否显示
  const dividerShow0 = items0.length > 0 && (items1.length > 0 || items2.length > 0)

  // 判断是否没有扩展
  const hasNoExtensions = items0.length === 0 && items1.length === 0 && items2.length === 0

  return (
    <GridViewSpaceStyle>
      {/* 头部控制栏 */}
      <div className="grid-header-control">
        <div
          className="left-control"
          onClick={onToggleShowAppName}
          title={isShowAppName ? getLang("popup_hide_ext_name") : getLang("popup_show_ext_name")}>
          {isShowAppName ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </div>

        <div className="right-control">
          <MinusOutlined
            onClick={() => onChangeColumnCount(-1)}
            className={columnCount <= MIN_COLUMN_COUNT ? "disabled" : ""}
          />
          <span className="column-count-text">{columnCount}</span>
          <PlusOutlined
            onClick={() => onChangeColumnCount(1)}
            className={columnCount >= MAX_COLUMN_COUNT ? "disabled" : ""}
          />
        </div>
      </div>

      {hasNoExtensions ? (
        <GridEmptyWrapper>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
        </GridEmptyWrapper>
      ) : (
        <>
          {displayItems0.length > 0 && (<ul>
            {displayItems0.map((item) => {
              return (
                <li key={item.id}>
                  <ExtensionGridItem
                    item={item}
                    options={options}
                    isShowAppName={isShowAppName}
                    currentMode={currentMode}></ExtensionGridItem>
                </li>
              )
            })}
            {new Array(10).fill("").map((_, index) => (
              <i key={index}></i>
            ))}
          </ul>)}
          {dividerShow0 && displayItems1.length > 0 && <div className="divider"></div>}
          {displayItems1.length > 0 && (<ul>
            {displayItems1.map((item) => {
              return (
                <li key={item.id}>
                  <ExtensionGridItem
                    item={item}
                    options={options}
                    isShowAppName={isShowAppName}
                    currentMode={currentMode}
                    onItemMove={onItemMove}></ExtensionGridItem>
                </li>
              )
            })}
            {new Array(10).fill("").map((_, index) => (
              <i key={index}></i>
            ))}
          </ul>)}
          {displayItems1.length > 0 && displayItems2.length > 0 && (
            <Divider style={{ margin: "8px 10px", fontSize: "12px" }}>未启用</Divider>
          )}
          {displayItems2.length > 0 && (<ul>
            {displayItems2.map((item) => {
              return (
                <li key={item.id}>
                  <ExtensionGridItem
                    item={item}
                    options={options}
                    isShowAppName={isShowAppName}
                    currentMode={currentMode}
                    onItemMove={onItemMove}></ExtensionGridItem>
                </li>
              )
            })}
            {new Array(10).fill("").map((_, index) => (
              <i key={index}></i>
            ))}
          </ul>)}
          {isShowBottomDivider && <div className="divider"></div>}
        </>
      )}
    </GridViewSpaceStyle>
  )
})

export default ExtensionGrid

const imgSize = "46px"
const imgMargin = "16px"

export const GridViewSpaceStyle = styled.div`
  .grid-header-control {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    height: 32px;
    margin-bottom: 0px;
    color: ${(props) => props.theme.fg};

    .left-control {
      cursor: pointer;
      font-size: 16px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;

      &:hover {
        background-color: ${(props) => props.theme.hoverBgMedium};
      }
    }

    .right-control {
      display: flex;
      align-items: center;
      gap: 4px;

      .anticon {
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-size: 12px;

        &:hover {
          background-color: ${(props) => props.theme.hoverBgMedium};
        }
        &.disabled {
          cursor: not-allowed;
          opacity: 0.3;
          &:hover {
            background-color: transparent;
          }
        }
      }

      .column-count-text {
        min-width: 16px;
        text-align: center;
        font-size: 12px;
        user-select: none;
      }
    }
  }

  ul {
    display: flex;
    justify-content: center;
    align-content: flex-start;
    flex-wrap: wrap;
    margin-bottom: 0px;

    li {
      width: ${imgSize};
      margin: 16px ${imgMargin};
    }

    i {
      width: ${imgSize};
      margin: 0px ${imgMargin};
    }
  }

  .divider {
    height: 1px;
    background-color: ${(props) => props.theme.input_border};
    margin: 0px 10px 0px 10px;
  }
`

const GridEmptyWrapper = styled.div`
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`

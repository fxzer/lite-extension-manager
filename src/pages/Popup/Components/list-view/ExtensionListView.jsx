import React, { memo, useEffect, useState } from "react"

import { Empty } from "antd"
import { styled } from "styled-components"

import { usePopupExtensions } from "../../utils/usePopupExtensions"
import ExtensionListItem from "./ExtensionListItem"

const INITIAL_RENDER_COUNT = 30

/**
 * 普通扩展的列表展示
 */
const ExtensionList = memo(({ extensions, options, currentMode }) => {
  const [showItems, setItems] = useState([])
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT)

  const [items] = usePopupExtensions(extensions, options)

  useEffect(() => {
    const items0 = items.top
    const items1 = items.enabled
    const items2 = items.disabled

    items0.forEach((i) => (i.__top__ = true))
    const result = items0.concat(items1, items2)

    setItems(result)
  }, [items])

  useEffect(() => {
    // 渐进式渲染：首屏快速显示少量节点，避免 UI 阻塞
    if (showItems.length > INITIAL_RENDER_COUNT && visibleCount === INITIAL_RENDER_COUNT) {
      const timer = setTimeout(() => {
        setVisibleCount(showItems.length)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [showItems, visibleCount])

  return (
    <Style>
      {showItems.length === 0 ? (
        <EmptyWrapper>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
        </EmptyWrapper>
      ) : (
        showItems.slice(0, visibleCount).map((item) => {
          return (
            <li key={item.id}>
              <ExtensionListItem
                item={item}
                options={options}
                currentMode={currentMode}></ExtensionListItem>
            </li>
          )
        })
      )}
    </Style>
  )
})

export default ExtensionList

const Style = styled.ul`
  li {
    border-bottom: 1px solid ${(props) => props.theme.borderDivider};
  }

  li:last-child {
    border-bottom: none;
  }
`

const EmptyWrapper = styled.div`
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`

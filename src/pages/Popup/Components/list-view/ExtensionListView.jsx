import React, { memo, useEffect, useState } from "react"

import classNames from "classnames"
import { Empty } from "antd"
import { styled } from "styled-components"

import { usePopupExtensions } from "../../utils/usePopupExtensions"
import ExtensionListItem from "./ExtensionListItem"

/**
 * 普通扩展的列表展示
 */
const ExtensionList = memo(({ extensions, options, currentMode }) => {
  const [showItems, setItems] = useState([])

  const [items] = usePopupExtensions(extensions, options)

  useEffect(() => {
    const items0 = items.top
    const items1 = items.enabled
    const items2 = items.disabled

    items0.forEach((i) => (i.__top__ = true))
    const result = items0.concat(items1, items2)

    setItems(result)
  }, [items])

  return (
    <Style>
      {showItems.length === 0 ? (
        <EmptyWrapper>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
        </EmptyWrapper>
      ) : (
        showItems.map((item) => {
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

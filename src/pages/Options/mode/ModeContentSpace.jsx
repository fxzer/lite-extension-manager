import React, { memo } from "react"

import { Button } from "antd"
import styled from "styled-components"

import { LocalOptions } from ".../storage/local"
import { getLang } from ".../utils/utils"
import ExtensionItems from "../components/ExtensionItems"

/**
 * 扩展模式：展示在模式中的扩展，或者不在模式中的扩展
 */
const ModeContentSpace = memo((props) => {
  const { shownItems, isModeEnabled, mode, modeList, options, onItemClick, notificationApi } = props
  const onIconClick = (e, item) => {
    onItemClick?.({
      item,
      mode,
      action: isModeEnabled ? "remove" : "add"
    })

    if (!isModeEnabled) {
      showAlreadyEnabledTip(item)
    }
  }

  // 如果扩展已经在默认模式中，在将扩展添加到其它模式时，给个提示
  const showAlreadyEnabledTip = async (item) => {
    if (mode.id === "default") {
      return // 默认模式中的操作不管
    }
    if (!options.setting.isRaiseEnableWhenSwitchGroup) {
      return // 切换模式时，不执行扩展的启用与禁用，则不用提示
    }

    const local = new LocalOptions()
    const isShowAlreadyEnabledTip = await local.getValue("isShowAlreadyEnabledTip")
    if (isShowAlreadyEnabledTip === false) {
      return
    }

    const textKnow = getLang("got_it")

    const onTipClick = (e) => {
      if (e.target.innerText === textKnow) {
        notificationApi.destroy("repeat-notification")
      }
    }

    const onClosePrompt = async () => {
      await local.setValue("isShowAlreadyEnabledTip", false)
      notificationApi.destroy("repeat-notification")
    }

    const defaultMode = modeList.find((m) => m.id === "default")
    if (defaultMode?.extensions?.includes(item.id)) {
      // 扩展已经在默认模式中，切换模式时扩展将始终被激活
      notificationApi.info({
        message: getLang("mode_may_redundant"),
        key: "repeat-notification",
        duration: 6,
        onClick: onTipClick,
        description: (
          <AlreadyEnabledTipStyle>
            <p>{item.name}</p>
            <p>{getLang("mode_may_redundant_desc")}</p>
            <div>
              <Button className="btn-already-enabled-tip">{textKnow}</Button>
              <Button className="btn-already-enabled-tip" onClick={onClosePrompt}>
                {getLang("no_more_prompts")}
              </Button>
            </div>
          </AlreadyEnabledTipStyle>
        ),
        placement: "topRight"
      })
    }
  }

  // 显示扩展所在的其它模式
  function otherModeInfoFooter(item) {
    if (!modeList) {
      return null
    }

    const names = modeList
      .filter((m) => {
        if (!m.extensions) {
          return false
        }
        return m.extensions.includes(item.id)
      })
      .filter((m) => m.id !== mode.id)
      .map((m) => m.name)

    return (
      <div className="other-mode-info-container">
        {names.map((n) => {
          return (
            <div key={n} className="other-mode-info-name">
              {n}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <ExtensionItems
      items={shownItems}
      onClick={onIconClick}
      placeholder="none"
      options={options}
      showFixedPin={() => false}
      footer={otherModeInfoFooter}
      skipSort={true}></ExtensionItems>
  )
})

export default ModeContentSpace

const AlreadyEnabledTipStyle = styled.div`
  .btn-already-enabled-tip {
    margin-right: 10px;
  }
`

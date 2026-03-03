import React, { memo, useEffect, useRef, useState } from "react"

import { Button, Checkbox, Radio, Steps, message } from "antd"
import styled from "styled-components"

import { getLang } from ".../utils/utils"
import { useInit } from "../hooks/useInit"
import ShareMode from "./ShareMode"
import ShareTarget from "./ShareTarget"

const ExtensionShare = memo(() => {
  const [messageApi, contextHolder] = message.useMessage()

  const [extensions, options] = useInit()

  const [currentStep, setCurrentStep] = useState(0)

  const [targetExtensionIds, setTargetExtensionIds] = useState([])
  const [targetConfig, setTargetConfig] = useState(null)

  const targetRef = useRef()

  const onNext = () => {
    if (currentStep === 0) {
      try {
        const selected = targetRef.current.getTarget()
        const config = targetRef.current.getConfig()
        setTargetExtensionIds(selected.extensionIds)
        setTargetConfig(config)
      } catch (error) {
        messageApi.warning(error.message)
        return
      }
    }

    setCurrentStep(currentStep + 1)
  }

  if (!options) {
    return null
  }

  return (
    <Style>
      {contextHolder}
      <div className="ext-share-steps">
        <Steps
          current={currentStep}
          items={[
            {
              title: getLang("management_export_target"),
              description: getLang("management_export_target_desc")
            },
            {
              title: getLang("management_export_type"),
              description: getLang("management_export_type_desc")
            }
          ]}
        />
      </div>

      <div className="ext-share-step-actions">
        <Button
          className="ext-share-step-btn"
          disabled={currentStep <= 0}
          onClick={() => setCurrentStep(currentStep - 1)}>
          {getLang("management_prev_step")}
        </Button>

        <Button className="ext-share-step-btn" disabled={currentStep >= 1} onClick={onNext}>
          {getLang("management_next_step")}
        </Button>
      </div>

      <div className="ext-share-step-content">
        {currentStep === 0 && (
          <ShareTarget
            ref={targetRef}
            config={targetConfig}
            extensions={extensions}
            options={options}></ShareTarget>
        )}

        {currentStep === 1 && (
          <ShareMode
            targetExtensionIds={targetExtensionIds}
            exportRange={[]}
            extensions={extensions}
            options={options}></ShareMode>
        )}
      </div>
    </Style>
  )
})

export default ExtensionShare

const Style = styled.div`
  padding-bottom: 24px;

  .ext-share-steps {
    margin: 12px 0;
  }

  .ext-share-step-actions {
    display: flex;
    justify-content: space-between;
    margin: 12px 0;
  }

  .ext-share-step-content {
    margin: 12px 0;
    padding: 12px;
    border: 1px solid ${(props) => props.theme.border};
    border-radius: 4px;
  }
`

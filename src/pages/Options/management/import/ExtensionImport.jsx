import React, { memo, useEffect, useRef, useState } from "react"

import { Button, Checkbox, Radio, Steps, message } from "antd"
import styled from "styled-components"

import { getLang } from ".../utils/utils"
import { useInit } from "../hooks/useInit"
import { buildRecords } from "../utils"
import ImportHandler from "./ImportHandler"
import ImportTarget from "./ImportTarget"
import { parse } from "./helper/importParser"

const ExtensionImport = memo(() => {
  const [messageApi, contentHolder] = message.useMessage()
  const [extensions, options] = useInit()
  const [currentStep, setCurrentStep] = useState(0)

  // 本机已经安装的扩展记录
  const [records, setRecords] = useState([])
  // 解析之后的，导入的扩展信息
  const [inputs, setInputs] = useState([])
  // 输入的待解析文本内容
  const [inputText, setInputText] = useState("")
  const textRef = useRef(null)
  // 输入是否有效
  const [isInputValid, setIsInputValid] = useState(false)

  // 初始化
  useEffect(() => {
    if (!options) {
      return
    }

    setRecords(buildRecords(extensions, options.management))
  }, [extensions, options])

  // 下一步
  const onNext = () => {
    if (currentStep === 0) {
      const text = textRef.current.getValue()
      if (!text || text.trim() === "") {
        messageApi.warning(getLang("management_import_no_input"))
        return
      }
      setInputText(text)

      const result = parse(text)
      if (result && result.length > 0) {
        setInputs(result)
      } else {
        messageApi.warning(getLang("management_import_parse_failed"))
        return
      }
    }
    setCurrentStep(currentStep + 1)
  }

  // 验证输入
  const validateInput = (value) => {
    const isValid = value && value.trim() !== ""
    setIsInputValid(isValid)
  }

  if (!options) {
    return null
  }

  return (
    <Style>
      {contentHolder}

      <div className="ext-import-steps">
        <Steps
          current={currentStep}
          items={[
            {
              title: getLang("management_import_source"),
              description: getLang("management_import_file_text")
            },
            {
              title: getLang("management_import"),
              description: getLang("management_import_install_extension")
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

        <Button
          className="ext-share-step-btn"
          disabled={currentStep >= 1 || !isInputValid}
          onClick={onNext}>
          {getLang("management_next_step")}
        </Button>
      </div>

      <div className="ext-import-step-content">
        {currentStep === 0 && (
          <ImportTarget
            ref={textRef}
            config={{ value: inputText }}
            onInputValidChange={validateInput}></ImportTarget>
        )}

        {currentStep === 1 && (
          <ImportHandler extensions={records} inputs={inputs} options={options}></ImportHandler>
        )}
      </div>
    </Style>
  )
})

export default ExtensionImport

const Style = styled.div`
  padding-bottom: 24px;

  .ext-import-steps {
    margin: 12px 0;
  }

  .ext-share-step-actions {
    display: flex;
    justify-content: space-between;
    margin: 12px 0;
  }

  .ext-import-step-content {
    margin: 12px 0;
    padding: 12px;
    border: 1px solid ${(props) => props.theme.border};
    border-radius: 4px;
  }
`

import React, { memo, useEffect, useState } from "react"

import { Col, Row } from "antd"
import dayjs from "dayjs"
import { styled } from "styled-components"

import { isEdgeRuntime } from ".../utils/channelHelper"
import { getHomepageUrl } from ".../utils/extensionHelper"
import { getLang } from ".../utils/utils"
import { ExtensionRepo } from "../../Background/extension/ExtensionRepo"

const extensionRepo = new ExtensionRepo()

/**
 * 扩展的展开详情，在别名、历史记录表格行中展开，展示的更多信息
 */
const ExtensionExpandedDetails = memo(({ ext, showTitle, showMore }) => {
  const [installTime, setInstallTime] = useState()
  const [updateTime, setUpdateTime] = useState()

  useEffect(() => {
    if (!showMore || !ext) {
      return
    }

    extensionRepo.get(ext.id).then((record) => {
      if (record.installDate) {
        setInstallTime(dayjs(record.installDate).format("YYYY-MM-DD HH:mm:ss"))
      }
      if (record.updateDate) {
        setUpdateTime(dayjs(record.updateDate).format("YYYY-MM-DD HH:mm:ss"))
      }
    })
  }, [ext, showMore])

  if (!ext) {
    return null
  }

  return (
    <Style>
      {/* 描述 */}
      <Row className="detail-row">
        <Col span={3} className="detail-label">
          {getLang("detail_description")}:
        </Col>
        <Col span={21} className="detail-value description-text">
          {ext.description || "-"}
        </Col>
      </Row>

      {/* 更多信息 */}
      {showMore && (
        <>
          <Row className="detail-row">
            <Col span={3} className="detail-label">
              {getLang("detail_id")}:
            </Col>
            <Col span={21} className="detail-value">
              <code className="id-code">{ext.id}</code>
            </Col>
          </Row>

          <Row className="detail-row">
            <Col span={3} className="detail-label">
              {getLang("detail_version")}:
            </Col>
            <Col span={5} className="detail-value">
              {ext.version || getLang("detail_unknown")}
            </Col>
            <Col span={3} className="detail-label">
              {getLang("detail_type")}:
            </Col>
            <Col span={5} className="detail-value">
              {ext.type || getLang("detail_unknown")}
            </Col>
            <Col span={3} className="detail-label">
              {getLang("detail_install_type")}:
            </Col>
            <Col span={5} className="detail-value">
              {ext.installType || getLang("detail_unknown")}
            </Col>
          </Row>

          <Row className="detail-row">
            <Col span={3} className="detail-label">
              {getLang("detail_install_time")}:
            </Col>
            <Col span={9} className="detail-value">
              {installTime || getLang("detail_unknown")}
            </Col>
            <Col span={3} className="detail-label">
              {getLang("detail_update_time")}:
            </Col>
            <Col span={9} className="detail-value">
              {updateTime || getLang("detail_unknown")}
            </Col>
          </Row>
        </>
      )}
    </Style>
  )
})

export default ExtensionExpandedDetails

const Style = styled.div`
  .detail-row {
    margin-top: 4px;
    margin-bottom: 4px;
  }

  .detail-label {
    text-align: right;
    padding-right: 12px;
    font-weight: 500;
    color: ${(props) => props.theme.fg};
    white-space: nowrap;
    font-size: 13px;
  }

  .detail-value {
    color: ${(props) => props.theme.muted};
    word-break: break-all;
    font-size: 13px;
  }

  .description-text {
    line-height: 1.5;
  }

  .id-code {
    font-family: "Monaco", "Consolas", monospace;
    font-size: 12px;
    padding: 2px 8px;
    background-color: ${(props) => props.theme.groupOtherBg};
    border-radius: 4px;
    color: ${(props) => props.theme.muted};
  }

  .detail-remark {
    display: inline-block;
    padding: 6px 10px;
    background-color: ${(props) => props.theme.groupOtherBg};
    border: 1px dashed ${(props) => props.theme.border};
    border-radius: 4px;
    font-size: 12px;

    .remark-label {
      font-weight: 500;
      color: ${(props) => props.theme.fg};
      margin-right: 8px;
    }

    .remark-content {
      color: ${(props) => props.theme.subtle};
    }
  }
`

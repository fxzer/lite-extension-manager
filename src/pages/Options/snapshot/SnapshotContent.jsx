import React, { memo, useMemo } from "react"

import { Divider, Tooltip } from "antd"
import { Flipped, Flipper } from "react-flip-toolkit"
import classNames from "classnames"
import styled from "styled-components"

import { getIcon } from ".../utils/extensionHelper"
import { getLang } from ".../utils/utils"

/**
 * 快照内容：显示快照中的扩展，区分已安装和已卸载
 */
const SnapshotContent = memo((props) => {
  const { snapshot, extensionMap, extensions } = props

  // 分离已安装和已卸载的扩展
  const { installedExtensions, uninstalledExtensions } = useMemo(() => {
    const installed = []
    const uninstalled = []

    for (const extState of snapshot.states) {
      const ext = extensionMap.get(extState.id)
      if (ext) {
        installed.push({ ...ext, snapshotEnabled: extState.enabled })
      } else {
        // 已卸载的扩展，使用快照中保存的信息
        uninstalled.push({
          id: extState.id,
          enabled: extState.enabled,
          name: extState.name || getLang("snapshot_uninstalled_extension"),
          iconUrl: extState.iconUrl,
          webStoreUrl: extState.webStoreUrl,
          homepageUrl: extState.homepageUrl
        })
      }
    }

    return { installedExtensions: installed, uninstalledExtensions: uninstalled }
  }, [snapshot, extensionMap])

  const flipKey = snapshot.key

  return (
    <SnapshotContentStyle>
      <Divider orientation="center">{getLang("snapshot_installed")}</Divider>

      {installedExtensions.length > 0 ? (
        <Flipper flipKey={flipKey + "-installed"}>
          <ul>
            {installedExtensions.map((ext) => (
              <Flipped key={ext.id} flipId={ext.id}>
                <li
                  key={ext.id}
                  className={classNames({
                    "not-enabled": !ext.snapshotEnabled
                  })}>
                  <Tooltip placement="top" title={ext.name}>
                    <div className="ext-item">
                      <div>
                        <img src={getIcon(ext, 128)} alt="" />
                      </div>
                      <span>{ext.name}</span>
                    </div>
                  </Tooltip>
                </li>
              </Flipped>
            ))}
          </ul>
        </Flipper>
      ) : (
        <p className="placeholder">{getLang("snapshot_no_installed")}</p>
      )}

      {uninstalledExtensions.length > 0 && (
        <>
          <Divider orientation="center">{getLang("snapshot_uninstalled")}</Divider>

          <Flipper flipKey={flipKey + "-uninstalled"}>
            <ul>
              {uninstalledExtensions.map((ext) => (
                <Flipped key={ext.id} flipId={ext.id}>
                  <li
                    key={ext.id}
                    className={classNames({
                      "not-enabled": !ext.enabled,
                      "uninstalled": true
                    })}>
                    <Tooltip placement="top" title={`${ext.name} - ${getLang("snapshot_click_to_install")}`}>
                      <a
                        href={ext.webStoreUrl || ext.homepageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ext-item-link">
                        <div className="ext-item">
                          <div>
                            {ext.iconUrl ? (
                              <img src={ext.iconUrl} alt="" />
                            ) : (
                              <div className="icon-placeholder">
                                <span>?</span>
                              </div>
                            )}
                          </div>
                          <span className="uninstalled-name">{ext.name}</span>
                        </div>
                      </a>
                    </Tooltip>
                  </li>
                </Flipped>
              ))}
            </ul>
          </Flipper>
        </>
      )}
    </SnapshotContentStyle>
  )
})

export default SnapshotContent

const SnapshotContentStyle = styled.div`
  ul {
    display: flex;
    flex-wrap: wrap;
  }

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .ext-item-link {
    text-decoration: none;
    color: inherit;

    &:hover {
      text-decoration: none;
    }

    &:hover .ext-item {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .ext-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100px;
    margin: 12px 15px;
    margin-bottom: 20px;
    transition: all 0.2s ease;

    div {
      position: relative;
    }

    .icon-placeholder {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${(props) => props.theme.hoverBgMedium};
      border-radius: 4px;
      font-size: 16px;
      color: ${(props) => props.theme.subtle};

      span {
        font-size: 18px;
      }
    }

    img {
      width: 32px;
      height: 32px;
    }

    span:first-of-type:not(.uninstalled-name) {
      width: 100%;
      margin-top: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
    }

    .uninstalled-name {
      width: 100%;
      margin-top: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
      font-size: 12px;
      color: ${(props) => props.theme.primary};

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .not-enabled {
    opacity: 0.5;
  }

  .uninstalled {
    .ext-item {
      opacity: 0.8;
      border: 1px dashed
        ${(props) =>
          props.theme.isDark
            ? "rgba(255, 255, 255, 0.4)"
            : "rgba(0, 0, 0, 0.3)"};
      border-radius: 6px;
      padding: 8px 4px;
    }
  }

  .placeholder {
    margin-top: 20px;
    margin-bottom: 20px;
    padding-left: 5px;
    color: ${(props) => props.theme.subtle};
    font-size: 14px;
    line-height: 20px;
    border-left: 2px solid ${(props) => props.theme.border};
  }
`

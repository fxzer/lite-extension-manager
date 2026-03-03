import React, { useEffect, useState } from "react"

import { GithubOutlined, HeartOutlined, StarOutlined } from "@ant-design/icons"
import { Alert, Button, Space, Tag } from "antd"
import newGithubIssueUrl from "new-github-issue-url"
import { useTheme } from "styled-components"

import DarkIcon from ".../assets/Dark.svg"
import LightIcon from ".../assets/Light.svg"
import { closeAlertTemp, compareVersion } from ".../pages/Options/utils/LatestVersionChecker.js"
import { storage } from ".../storage/sync"
import { isEdgePackage } from ".../utils/channelHelper.js"
import { getLang } from ".../utils/utils"
import Title from "../Title.jsx"
import { AboutStyle } from "./AboutStyle"

function About() {
  const theme = useTheme()
  const isDarkMode = theme.bg === "#242529"

  const [version, setVersion] = useState("UNKNOWN")
  const [latestVersion, setLatestVersion] = useState("")
  const [storageMessage, setStorageMessage] = useState("")

  useEffect(() => {
    chrome.management.getSelf((self) => {
      setVersion(self.version)
    })
  }, [])

  useEffect(() => {
    storage.options.getUsage().then((usage) => {
      const use = (usage / 1024).toFixed(2)
      setStorageMessage(`Cloud Storage Usage: ${use}KB / 100KB`)
    })
  }, [])

  useEffect(() => {
    compareVersion(version).then((result) => {
      if (!result) {
        return
      }
      if (result.needUpdate) {
        setLatestVersion(result.latestVersion)
      }
    })
  }, [version])

  const openIssue = () => {
    const url = newGithubIssueUrl({
      user: "fxzer",
      repo: "lite-extension-manager",
      body: `
\n\n\n---
<!-- ↑请在此行上方填写问题/建议详情↑ -->
Extension Manager ${version}
${navigator.userAgent}`
    })

    chrome.tabs.create({ url })
  }

  const openGithub = () => {
    chrome.tabs.create({
      url: "https://github.com/fxzer/lite-extension-manager.git"
    })
  }

  const openUpgradeHelpPage = () => {
    chrome.tabs.create({
      url: "https://github.com/fxzer/lite-extension-manager.git/wiki/Extension-Upgrade-Help"
    })
  }

  const onUpgradeAlertClose = () => {
    closeAlertTemp()
  }

  return (
    <AboutStyle>
      <Title title={getLang("about_title")}></Title>

      <div className="header-icon">
        <img src={isDarkMode ? DarkIcon : LightIcon} alt="icon" />
        <div className="header-icon-text">
          <h3>Lite Extension Manager</h3>
          <span>{getLang("ext_desc")}</span>
        </div>
      </div>
      <div className="content-button">
        <Button onClick={openIssue}>{getLang("about_feedback")}</Button>
        <Button icon={<GithubOutlined />} onClick={openGithub}>
          Github
        </Button>
        {latestVersion && (
          <div className="version-update">
            <Alert
              message={getLang("about_version_update_tip")}
              type="warning"
              showIcon
              closable
              onClose={onUpgradeAlertClose}
              action={
                <Button size="small" type="text" onClick={openUpgradeHelpPage}>
                  Upgrade
                </Button>
              }
            />
          </div>
        )}
      </div>
      <div className="version">
        {getLang("about_version")} {version}
      </div>
      <div className="footer-storage">
        <span>{storageMessage}</span>
      </div>
    </AboutStyle>
  )
}

export default About

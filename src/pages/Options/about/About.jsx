import React, { useEffect, useState } from "react"

import { GithubOutlined, } from "@ant-design/icons"
import { Button, } from "antd"
import newGithubIssueUrl from "new-github-issue-url"
import { useTheme } from "styled-components"

import DarkIcon from ".../assets/Dark.svg"
import LightIcon from ".../assets/Light.svg"
import { storage } from ".../storage/sync"
import { getLang } from ".../utils/utils"
import Title from "../Title.jsx"
import { AboutStyle } from "./AboutStyle"

function About() {
  const theme = useTheme()
  const isDarkMode = theme.bg === "#242529"

  const [version, setVersion] = useState("UNKNOWN")
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

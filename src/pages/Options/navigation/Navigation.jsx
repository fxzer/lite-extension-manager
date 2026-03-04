import React, { useState } from "react"
import { NavLink } from "react-router-dom"

import {
  ExportOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  ImportOutlined,
  ToolOutlined
} from "@ant-design/icons"

import analytics from ".../utils/googleAnalyze"
import { getLang } from ".../utils/utils"
import { NavigationStyle } from "./NavigationStyle"

function Navigation() {
  const reportEvent = (title) => {
    analytics.firePageViewEvent(title)
  }

  return (
    <NavigationStyle>
      <NavLink to="">
        <h1>Extension Manager</h1>
      </NavLink>

      <NavLink to="/mode" className="nav-item" onClick={() => reportEvent("mode")}>
        <FolderOpenOutlined />
        <span className="text">{getLang("mode_title")}</span>
      </NavLink>
      <NavLink to="/management" className="nav-item" onClick={() => reportEvent("management")}>
        <ToolOutlined />
        <span className="text">{getLang("management_title")}</span>
      </NavLink>

      <NavLink to="/export" className="nav-item" onClick={() => reportEvent("export")}>
        <ExportOutlined />
        <span className="text">{getLang("management_export_title")}</span>
      </NavLink>

      <NavLink to="/import" className="nav-item" onClick={() => reportEvent("import")}>
        <ImportOutlined />
        <span className="text">{getLang("management_import_title")}</span>
      </NavLink>

      <NavLink to="/history" className="nav-item" onClick={() => reportEvent("history")}>
        <HistoryOutlined />
        <span className="text">{getLang("history_title")}</span>
      </NavLink>
    </NavigationStyle>
  )
}

export default Navigation

import ".../utils/devConsoleFilter"
import React, { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter } from "react-router-dom"

import "antd/dist/reset.css"

import { message } from "antd"

import "../reset.css"
import "./index.css"

import { ExtensionChannelWorker } from ".../pages/Options/management/worker/ExtensionChannelWorker"
import { storage } from ".../storage/sync"
import analytics from ".../utils/googleAnalyze"
import { ExtensionIconBuilder } from "../Background/extension/ExtensionIconBuilder"
import Options from "./Options"

const storageViewApi = storage.helper.view.getApi()
storageViewApi.message = message

const container = document.getElementById("app-container")
const root = createRoot(container)
root.render(
  <StrictMode>
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
      <Options />
    </HashRouter>
  </StrictMode>
)

ExtensionIconBuilder.build()
ExtensionChannelWorker.build()


// Fire a page view event on load
if (document.readyState === "complete") {
  analytics.fireEvent("page_view_options")
} else {
  window.addEventListener("load", () => {
    analytics.fireEvent("page_view_options")
  })
}

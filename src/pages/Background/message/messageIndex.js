import { listen } from ".../utils/messageHelper"
import { createManualChangeModeHandler } from "./historyMessage"

/**
 * 自定义 message 的处理（popup / options 页面发送过来的 message）
 */
const createMessageHandler = (EM) => {
  // 监听其它页面（popup / options）发送给 background 的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const ctx = {
      message,
      sender,
      sendResponse
    }

    createHistoryMessage(EM, ctx)
  })
}

/**
 * 处理历史记录相关的 message
 */
const createHistoryMessage = (EM, ctx) => {
  listen("manual-change-mode", ctx, createManualChangeModeHandler(EM))

  ctx.sendResponse({ state: "success" })
}

export default createMessageHandler

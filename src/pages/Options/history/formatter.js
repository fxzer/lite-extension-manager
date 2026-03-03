import dayjs from "dayjs"
import "dayjs/locale/en"
import "dayjs/locale/ja"
import "dayjs/locale/ru"
import "dayjs/locale/zh"
import relativeTime from "dayjs/plugin/relativeTime"

import { getLang } from ".../utils/utils"

dayjs.extend(relativeTime)

// 根据 Chrome UI 语言设置 dayjs 的语言环境
const browserLang = chrome.i18n.getUILanguage()
// 浏览器返回的语言代码可能是 'zh-CN', 'ja', 'ru', 'en' 等
// dayjs 使用的是 'zh', 'ja', 'ru', 'en' 等
const dayjsLocale = browserLang ? browserLang.split("-")[0] : "en"
dayjs.locale(dayjsLocale)

export const formatTimeAbsolute = (timestamp) => {
  return dayjs(timestamp).format("YY-MM-DD HH:mm:ss")
}

export const formatTimeRelative = (timestamp) => {
  return dayjs(timestamp).fromNow()
}

export const formatEventText = (event) => {
  switch (event) {
    case "install":
      return getLang("history_install")
    case "uninstall":
      return getLang("history_uninstall")
    case "updated":
      return getLang("history_update")
    case "enabled":
      return getLang("history_enable")
    case "disabled":
      return getLang("history_disable")
    case "browser_updated":
      return getLang("history_browser_update")
    default:
      return "UNKNOWN"
  }
}

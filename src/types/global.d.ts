import { History } from ".../pages/Background/history/History"
import { EventCache } from "../pages/Background/event/EventCache"
import { ExtensionService } from "../pages/Background/extension/ExtensionService"
import { LocalOptions } from "../storage/local"

declare interface IExtensionManager {
  LocalOptions: LocalOptions
  Extension: {
    items: chrome.management.ExtensionInfo[]
    service: ExtensionService
  }
  History: History
  EventCache: EventCache
}

import { ManageOptions } from "./ManageOptions"
import { ModeOptions, formatModes, isSystemMode } from "./ModeOptions"
import { OptionStorageViewProvider, SyncOptionsStorage } from "./options-storage"

const helper = {
  formatGroups: formatModes, // 兼容旧命名
  isSpecialGroup: isSystemMode, // 兼容旧命名
  formatModes,
  isSystemMode,
  view: OptionStorageViewProvider
}

const storage = {
  options: SyncOptionsStorage,
  mode: ModeOptions,
  group: ModeOptions, // 兼容旧引用
  management: ManageOptions,
  helper
}

export default storage

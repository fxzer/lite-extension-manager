import { ManageOptions } from "./ManageOptions"
import { ModeOptions, formatModes, isSystemMode } from "./ModeOptions"
import { OptionStorageViewProvider, SyncOptionsStorage } from "./options-storage"

const helper = {
  formatModes,
  isSystemMode,
  view: OptionStorageViewProvider
}

const storage = {
  options: SyncOptionsStorage,
  mode: ModeOptions,
  management: ManageOptions,
  helper
}

export default storage

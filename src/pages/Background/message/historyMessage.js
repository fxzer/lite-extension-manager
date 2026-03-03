import logger from ".../utils/logger"

export const createManualChangeModeHandler = (EM) => {
  return (ctx) => {
    logger().debug("Mode switch caused extension status change", ctx)

    const actuallyEnabledIds = ctx.params.actuallyEnabledIds
    const actuallyDisabledIds = ctx.params.actuallyDisabledIds
    const mode = ctx.params.mode

    const items = EM.Extension.items

    const actuallyEnabledExts = items.filter((ext) => actuallyEnabledIds.includes(ext.id))
    const actuallyDisabledExts = items.filter((ext) => actuallyDisabledIds.includes(ext.id))

    EM.History.EventHandler.onManualEnabled(actuallyEnabledExts, mode)
    EM.History.EventHandler.onManualDisabled(actuallyDisabledExts, mode)
  }
}

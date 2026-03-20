/**
 * 开发环境下抑制第三方依赖尚未适配 React 未来行为时的重复告警，
 * 避免控制台被刷屏；本仓库代码已不使用 memo + defaultProps 反模式。
 *
 * 需在入口文件最靠前 import（在 react-dom 渲染之前）。
 */
if (process.env.NODE_ENV === "development" && typeof console !== "undefined") {
  const patterns = [
    /Support for defaultProps will be removed from memo components/i,
    /defaultProps will be removed from memo/i
  ]

  const shouldSuppress = (args) => {
    const text = args
      .map((a) => {
        if (typeof a === "string") return a
        if (a instanceof Error) return a.message
        return ""
      })
      .join(" ")
    return patterns.some((re) => re.test(text))
  }

  const origError = console.error.bind(console)
  console.error = (...args) => {
    if (shouldSuppress(args)) return
    origError(...args)
  }

  const origWarn = console.warn.bind(console)
  console.warn = (...args) => {
    if (shouldSuppress(args)) return
    origWarn(...args)
  }
}

/**
 * 开发构建：监听文件变化并写入 build/，不启动 webpack-dev-server。
 * 避免在扩展页面中注入 dev-server 客户端导致的 localhost:5300 WebSocket 连接失败
 *（扩展常从磁盘加载，dev server 未运行时会产生大量 ERR_CONNECTION_REFUSED）。
 *
 * 使用：npm start → 修改代码后在 chrome://extensions 里点「重新加载」扩展即可。
 */
process.env.BABEL_ENV = "development"
process.env.NODE_ENV = "development"
process.env.ASSET_PATH = "/"

const webpack = require("webpack")
const baseConfig = require("../webpack.config")

const config = { ...baseConfig }
delete config.chromeExtensionBoilerplate

const compiler = webpack(config)

compiler.watch(
  {
    aggregateTimeout: 300,
    ignored: /node_modules/
  },
  (err, stats) => {
    if (err) {
      console.error(err)
      return
    }
    const info = stats.toJson({ all: false, errors: true, warnings: true })
    if (stats.hasErrors()) {
      console.error(stats.toString({ colors: true, errors: true, warnings: true }))
      return
    }
    if (stats.hasWarnings()) {
      console.warn(stats.toString({ colors: true, errors: false, warnings: true }))
    }
    console.log(
      stats.toString({
        colors: true,
        chunks: false,
        modules: false,
        assets: true,
        errors: false,
        warnings: false
      })
    )
    console.log("[watch] build 已更新，请在浏览器中重新加载扩展。")
  }
)

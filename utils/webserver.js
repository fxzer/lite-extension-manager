/**
 * webpack-dev-server + HMR（会连接 localhost:PORT 的 WebSocket）。
 * 扩展从磁盘加载时若未同时运行本服务，控制台会出现 ERR_CONNECTION_REFUSED。
 * 日常开发请优先使用 `npm start`（utils/watch.js，无 WebSocket）。
 * 需要 HMR 时再运行：`npm run dev:server`
 */
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development"
process.env.NODE_ENV = "development"
process.env.ASSET_PATH = "/"

var WebpackDevServer = require("webpack-dev-server"),
  webpack = require("webpack"),
  config = require("../webpack.config"),
  env = require("./env"),
  path = require("path")

var options = config.chromeExtensionBoilerplate || {}
var excludeEntriesToHotReload = options.notHotReload || []

for (var entryName in config.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    config.entry[entryName] = [
      "webpack/hot/dev-server",
      `webpack-dev-server/client?hot=true&hostname=localhost&port=${env.PORT}`
    ].concat(config.entry[entryName])
  }
}

delete config.chromeExtensionBoilerplate

var compiler = webpack(config)

var server = new WebpackDevServer(
  {
    https: false,
    hot: true,
    liveReload: false,
    client: {
      webSocketTransport: "sockjs"
    },
    webSocketServer: "sockjs",
    host: "localhost",
    port: env.PORT,
    static: {
      directory: path.join(__dirname, "../build")
    },
    devMiddleware: {
      publicPath: `http://localhost:${env.PORT}/`,
      writeToDisk: true
    },
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    allowedHosts: "all"
  },
  compiler
)

;(async () => {
  await server.start()
})()

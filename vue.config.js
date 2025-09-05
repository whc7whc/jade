const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  transpileDependencies: true,

  // Webpack 配置
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        // Vue 3 功能標誌
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
      })
    ]
  },

  // 開發服務器配置
  devServer: {
    port: 8084,
    host: 'localhost',
    open: true,
    // 開發環境：為了讓現有程式碼中使用相對路徑 '/api/...' 的請求
    // 能在本地開發時正確轉發到 Railway 的生產 API，啟用 proxy。
    // 這可以避免大量修改多個檔案，快速驗證 API 是否可連通。
    proxy: {
      '^/api': {
        target: process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app',
        changeOrigin: true,
        secure: false,
        ws: false,
        logLevel: 'warn'
      }
    }
  },

  // 生產環境配置
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',

  // 禁用生產環境的 source map 以加快構建速度
  productionSourceMap: false,

  // CSS 配置
  css: {
    extract: process.env.NODE_ENV === 'production'
  }
})
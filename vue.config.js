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
    // 代理 API 請求到後端服務器
    proxy: {
      '/api': {
        target: 'https://localhost:7106',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        onProxyReq(proxyReq, req, res) {
          console.log('🔗 代理請求到後端:', proxyReq.path);
          console.log('📋 原始請求:', req.url);
        },
        onProxyRes(proxyRes, req, res) {
          console.log('✅ 後端回應狀態:', proxyRes.statusCode);
          console.log('📡 回應到:', req.url);
        },
        onError(err, req, res) {
          console.error('❌ 後端代理錯誤:', err);
        }
      },
      // Mock 廠商登入 API（開發用）
      '/mock': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        pathRewrite: {
          '^/mock': ''
        },
        onError(err, req, res) {
          // 如果 mock 服務器不存在，返回預設回應
          if (req.url.includes('/auth/vendor/login')) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              token: `mock_token_${Date.now()}`,
              sellerId: 1,
              sellerInfo: {
                id: 1,
                name: '測試廠商1',
                email: 'vendor1@test.com',
                status: 'Active'
              }
            }));
          }
        }
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
// 建置時環境變數檢查腳本
console.log('🔍 建置時環境變數檢查：')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('VUE_APP_API_BASE_URL:', process.env.VUE_APP_API_BASE_URL)
console.log('VUE_APP_API_URL:', process.env.VUE_APP_API_URL)

// 只在 Netlify 環境檢查（有 NETLIFY 環境變數時）
if (process.env.NETLIFY && !process.env.VUE_APP_API_BASE_URL) {
  console.error('❌ VUE_APP_API_BASE_URL 未設定！')
  process.exit(1)
} else if (process.env.VUE_APP_API_BASE_URL) {
  console.log('✅ VUE_APP_API_BASE_URL 已設定:', process.env.VUE_APP_API_BASE_URL)
} else {
  console.log('ℹ️ 本地建置，使用預設 API URL')
}

// 輸出到建置產出中
const fs = require('fs')
const envInfo = {
  timestamp: new Date().toISOString(),
  nodeEnv: process.env.NODE_ENV,
  apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
  apiUrl: process.env.VUE_APP_API_URL
}

fs.writeFileSync('./public/build-env.json', JSON.stringify(envInfo, null, 2))

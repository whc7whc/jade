// 建置時環境變數檢查腳本
console.log('🔍 建置時環境變數檢查：')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('VUE_APP_API_BASE_URL:', process.env.VUE_APP_API_BASE_URL)
console.log('VUE_APP_API_URL:', process.env.VUE_APP_API_URL)

// 檢查是否正確載入
if (!process.env.VUE_APP_API_BASE_URL) {
  console.error('❌ VUE_APP_API_BASE_URL 未設定！')
  process.exit(1)
} else {
  console.log('✅ VUE_APP_API_BASE_URL 已設定:', process.env.VUE_APP_API_BASE_URL)
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

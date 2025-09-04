// API 配置管理
export const API_CONFIG = {
  // 基礎 URL
  BASE_URL: process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app/api',
  
  // 完整的端點 URL
  get FULL_BASE_URL() {
    return this.BASE_URL.replace('/api', '')
  },
  
  // 常用端點
  ENDPOINTS: {
    AUTH: '/Auth',
    PRODUCTS: '/Products',
    CARTS: '/Carts',
    CHECKOUT: '/Checkout',
    BANNERS: '/Banners',
    NOTIFICATIONS: '/notifications',
    THIRD_PARTY_AUTH: '/third-party-auth'
  },
  
  // 獲取完整端點 URL
  getEndpoint(endpoint) {
    return `${this.BASE_URL}${endpoint}`
  },
  
  // 獲取完整 URL（不含 /api）
  getFullUrl(path) {
    return `${this.FULL_BASE_URL}${path}`
  }
}

// 導出常用方法
export const getApiUrl = (endpoint = '') => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

export const getFullApiUrl = (path = '') => {
  return `${API_CONFIG.FULL_BASE_URL}${path}`
}

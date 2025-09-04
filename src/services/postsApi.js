// postsApi.js - 修正版
import axios from 'axios'

// 🔥 修正：創建正確的 FormData 格式
export function createPostFormData(postData) {
  const formData = new FormData()
  
  // 🔥 重要：這些欄位名稱必須與後端 CreatePostDto 屬性名稱完全一致
  formData.append('Title', postData.title || '')
  formData.append('Content', postData.content || '')
  formData.append('MembersId', postData.membersId || 0)
  formData.append('Status', postData.status || 'draft')
  
  // 🔥 圖片檔案，參數名稱必須是 'imageFile'（與 Controller 參數名稱一致）
  if (postData.imageFile) {
    formData.append('imageFile', postData.imageFile)
  }
  
  // 🔥 Debug: 查看 FormData 內容
  console.log('📋 FormData 內容:')
  for (let pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`)
    } else {
      console.log(`${pair[0]}: ${pair[1]}`)
    }
  }
  
  return formData
}

// 圖片檔案驗證函數
export function validateImageFile(file) {
  const errors = []
  
  // 檔案大小檢查 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('圖片檔案不能超過 5MB')
  }
  
  // 檔案類型檢查
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    errors.push('不支援的圖片格式，請使用 JPG、PNG 或 WEBP')
  }
  
  return errors
}

// 🔥 偵測 API 基礎 URL
function getApiBaseUrl() {
  // 統一使用 Railway API
  return process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'
}

// 🔥 設定 Axios 預設配置
const apiClient = axios.create({
  baseURL: getApiBaseUrl(), // 🔥 注意：這裡不包含 /api，因為後端路由已經有了
  timeout: 30000, // 30秒超時
  withCredentials: false, // 如果需要發送 cookies，設為 true
})

// 🔥 請求攔截器 - 自動添加 Authorization header
apiClient.interceptors.request.use(
  (config) => {
    // 🔥 Debug: 顯示完整的請求 URL
    const fullUrl = `${config.baseURL}${config.url}`
    console.log('🚀 發送請求到:', fullUrl)
    
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 🔥 對於 FormData，不要設定 Content-Type，讓 axios 自動處理
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    console.log('🚀 請求詳情:', {
      method: config.method?.toUpperCase(),
      url: fullUrl,
      hasData: !!config.data,
      isFormData: config.data instanceof FormData,
      headers: Object.keys(config.headers || {})
    })
    
    return config
  },
  (error) => {
    console.error('❌ 請求攔截器錯誤:', error)
    return Promise.reject(error)
  }
)

// 🔥 回應攔截器 - 統一錯誤處理
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API 成功回應:', {
      status: response.status,
      url: response.config.url,
      dataType: typeof response.data,
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
    })
    return response
  },
  (error) => {
    const errorInfo = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      responseData: error.response?.data
    }
    
    console.error('❌ API 回應錯誤:', errorInfo)
    
    // 🔥 特別處理 404 錯誤
    if (error.response?.status === 404) {
      console.error('🔍 404 錯誤分析:')
      console.error('  請求的 URL:', `${error.config?.baseURL}${error.config?.url}`)
      console.error('  可能的原因:')
      console.error('    1. 後端服務未啟動')
      console.error('    2. API 端點路徑錯誤')
      console.error('    3. 後端端口不正確')
      console.error('    4. CORS 設定問題')
    }
    
    // 統一錯誤訊息處理
    let errorMessage = '操作失敗，請稍後再試'
    
    if (error.response) {
      // 伺服器回應了錯誤狀態碼
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data?.message || '請檢查輸入資料格式'
          break
        case 401:
          errorMessage = '未授權，請重新登入'
          break
        case 403:
          errorMessage = '沒有權限執行此操作'
          break
        case 404:
          errorMessage = `找不到 API 端點：${error.config?.url}`
          break
        case 422:
          errorMessage = '資料驗證失敗'
          break
        case 500:
          errorMessage = '伺服器內部錯誤'
          break
        default:
          errorMessage = error.response.data?.message || `HTTP ${error.response.status}`
      }
    } else if (error.request) {
      // 請求已發出但沒有收到回應
      errorMessage = '網路連線問題，請檢查網路狀態或後端服務是否啟動'
    }
    
    // 將錯誤訊息附加到 error 物件上
    error.message = errorMessage
    
    return Promise.reject(error)
  }
)

// 🔥 測試 API 連線
async function testApiConnection() {
  try {
    console.log('🔗 測試 API 連線...')
    console.log('📍 基礎 URL:', getApiBaseUrl())
    console.log('📍 完整測試 URL:', `${getApiBaseUrl()}/api/Posts`)
    
    const response = await apiClient.get('/api/Posts')
    console.log('✅ API 連線成功')
    return true
  } catch (error) {
    console.error('❌ API 連線失敗:', error.message)
    console.error('🔍 錯誤詳情:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`
    })
    
    // 🔥 提供詳細的解決建議
    console.log('💡 解決建議:')
    if (error.response?.status === 404) {
      console.log('  ❌ 404 錯誤 - API 端點不存在')
      console.log('  1. 檢查後端 Controller 路由是否正確')
      console.log('  2. 確認後端服務在正確端口運行')
      console.log('  3. 確認 PostsController 有 [Route("api/[controller]")] 屬性')
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.log('  ❌ 連線被拒絕 - 後端服務未啟動')
      console.log('  1. 啟動後端服務：dotnet run')
      console.log('  2. 檢查端口是否正確：7106')
      console.log('  3. 檢查防火牆設定')
    } else {
      console.log('  ❌ 其他錯誤')
      console.log('  1. 檢查 CORS 設定')
      console.log('  2. 檢查 SSL 證書設定')
      console.log('  3. 查看後端 Console 錯誤訊息')
    }
    
    console.log('  📝 當前設定:')
    console.log(`    - API 基礎 URL: ${getApiBaseUrl()}`)
    console.log(`    - 環境: ${process.env.NODE_ENV}`)
    console.log(`    - 請求 URL: ${getApiBaseUrl()}/api/Posts`)
    
    return false
  }
}

// API 呼叫函數
export const postsApi = {
  // 🔥 測試連線方法
  async testConnection() {
    return await testApiConnection()
  },

  // 創建貼文
  async createPost(formData) {
    try {
      console.log('📝 創建貼文 API 呼叫')
      
      // 🔥 確保是 FormData 格式
      if (!(formData instanceof FormData)) {
        throw new Error('數據格式錯誤：必須是 FormData')
      }
      
      const response = await apiClient.post('/api/Posts', formData)
      
      return { data: response.data }
    } catch (error) {
      console.error('❌ 創建貼文失敗:', error)
      throw error
    }
  },

  // 更新貼文
  async updatePost(postId, formData) {
    try {
      console.log(`📝 更新貼文 API 呼叫 (ID: ${postId})`)
      
      // 🔥 確保是 FormData 格式
      if (!(formData instanceof FormData)) {
        throw new Error('數據格式錯誤：必須是 FormData')
      }
      
      const response = await apiClient.put(`/api/Posts/${postId}`, formData)
      
      return { data: response.data }
    } catch (error) {
      console.error('❌ 更新貼文失敗:', error)
      throw error
    }
  },

  // 🔥 取得貼文列表 - 主要方法
  async getPosts(params = {}) {
    try {
      console.log('📡 取得貼文列表，參數:', params)
      
      // 🔥 先測試連線
      const isConnected = await this.testConnection()
      if (!isConnected) {
        throw new Error('API 服務無法連接，請檢查後端服務狀態')
      }
      
      const response = await apiClient.get('/api/Posts', { params })
      
      console.log('✅ 成功取得貼文列表:', {
        count: response.data?.length || 0,
        firstPost: response.data?.[0]?.title || 'N/A'
      })
      
      return { data: response.data }
    } catch (error) {
      console.error('❌ 取得貼文列表失敗:', error)
      throw error
    }
  },

  // 切換按讚狀態
  async toggleLike(postId) {
    try {
      console.log(`❤️ 切換按讚狀態 (貼文 ID: ${postId})`)
      
      const response = await apiClient.post('/api/PostLikes/toggle', {
        postId: postId
      })

      console.log('✅ 切換按讚成功:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ 切換按讚失敗:', error)
      throw error
    }
  },

  // 取得貼文的按讚狀態
  async getLikeStatus(postId) {
    try {
      console.log(`📊 取得按讚狀態 (貼文 ID: ${postId})`)
      
      const response = await apiClient.get(`/api/PostLikes/post/${postId}/status`)

      console.log('✅ 取得按讚狀態成功:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ 取得按讚狀態失敗:', error)
      throw error
    }
  },

  
getCurrentUserId() {
    try {
      // 優先使用 memberId
      const memberId = localStorage.getItem('memberId')
      if (memberId) {
        return parseInt(memberId)
      }

      // 其次從 currentUser 取得
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      if (currentUser.id) {
        return parseInt(currentUser.id)
      }

      console.warn('⚠️ 無法取得當前用戶 ID')
      return 1 // 預設值，實際應用中可能需要導向登入頁面
    } catch (error) {
      console.error('❌ 取得當前用戶 ID 失敗:', error)
      return 1
    }
  },

  async loadRealLikeData() {
  try {
    console.log('💖 載入真實按讚數據...')
    
    const postIds = this.posts.map(post => post.id).filter(id => id)
    
    if (postIds.length === 0) {
      console.log('❌ 沒有貼文 ID 可以載入按讚數據')
      return
    }
    
    console.log(`📊 正在載入 ${postIds.length} 個貼文的按讚數據`)
    
    // 🔥 呼叫按讚狀態 API
    const likeStatusResponse = await postsApi.getBatchLikeStatus(postIds)
    
    if (likeStatusResponse.Success || likeStatusResponse.success) {
      const likeStatusData = likeStatusResponse.Data || likeStatusResponse.data
      
      console.log('✅ 成功取得按讚數據:', likeStatusData)
      
      // 🔥 更新每個貼文的按讚數據
      likeStatusData.forEach(status => {
        const post = this.posts.find(p => p.id === (status.PostId || status.postId))
        if (post) {
          post.likesCount = status.LikesCount || status.likesCount || 0
          post.isLiked = status.IsLiked || status.isLiked || false // 🔥 也可以儲存是否已按讚
          
          console.log(`📝 更新貼文 ${post.id} 按讚數: ${post.likesCount}`)
        }
      })
      
      console.log('🎉 所有按讚數據已更新完成')
    } else {
      console.warn('⚠️ 取得按讚數據失敗:', likeStatusResponse)
    }
    
  } catch (error) {
    console.error('❌ 載入按讚數據失敗:', error)
    // 不要因為按讚數據載入失敗就中斷頁面
  }
},
   async togglePostLike(request) {
    try {
      console.log('🔄 發送按讚切換請求:', request)
      
      const response = await apiClient.post('/api/PostLikes/toggle', request)
      
      console.log('✅ 按讚切換成功:', response.data)
      return response.data
      
    } catch (error) {
      console.error('❌ 按讚切換失敗:', error)
      throw error
    }
  },

  // 🔥 新增：批量取得按讚狀態
  async getBatchLikeStatus(request) {
    try {
      console.log('🔄 發送批量按讚狀態查詢:', request)
      
      const response = await apiClient.post('/api/PostLikes/batch-like-status', request)
      
      console.log('✅ 批量按讚狀態查詢成功:', response.data)
      return response.data
      
    } catch (error) {
      console.error('❌ 批量按讚狀態查詢失敗:', error)
      throw error
    }
  },

  // 🔥 新增：取得單一貼文按讚狀態
  async getSingleLikeStatus(postId, userId = null) {
    try {
      console.log(`🔄 查詢貼文 ${postId} 的按讚狀態`)
      
      const params = userId ? { userId } : {}
      const response = await apiClient.get(`/api/PostLikes/post/${postId}/status`, { params })
      
      console.log('✅ 單一按讚狀態查詢成功:', response.data)
      return response.data
      
    } catch (error) {
      console.error('❌ 單一按讚狀態查詢失敗:', error)
      throw error
    }
  },


  // 取得授權 token 的輔助方法
  getAuthToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  },

  // 🔥 相容性方法：支援舊的方法名稱
  async getAllPosts(params = {}) {
    return this.getPosts(params)
  },

  async fetchPosts(params = {}) {
    return this.getPosts(params)
  },

  async getPostList(params = {}) {
    return this.getPosts(params)
  },

  // 取得單一貼文
  async getPost(postId) {
    try {
      console.log(`📄 取得單一貼文 (ID: ${postId})`)
      const response = await apiClient.get(`/api/Posts/${postId}`)
      return { data: response.data }
    } catch (error) {
      console.error('❌ 取得貼文失敗:', error)
      throw error
    }
  },

  // 🔥 相容性方法
  async getPostById(postId) {
    return this.getPost(postId)
  },

  async fetchPost(postId) {
    return this.getPost(postId)
  },

  // 刪除貼文
  async deletePost(postId) {
    try {
      console.log(`🗑️ 刪除貼文 (ID: ${postId})`)
      const response = await apiClient.delete(`/api/Posts/${postId}`)
      return { data: response.data }
    } catch (error) {
      console.error('❌ 刪除貼文失敗:', error)
      throw error
    }
  },

  // 🔥 相容性方法
  async removePost(postId) {
    return this.deletePost(postId)
  },

  // 🔥 取得會員貼文
  async getMyPosts(memberId, params = {}) {
    try {
      console.log(`👤 取得會員貼文 (ID: ${memberId})`)
      const response = await apiClient.get(`/api/Posts/member/${memberId}`, { params })
      return { data: response.data }
    } catch (error) {
      console.error('❌ 取得我的貼文失敗:', error)
      throw error
    }
  },

  async getMemberPosts(memberId, params = {}) {
    return this.getMyPosts(memberId, params)
  },

  // 🔥 取得待審核貼文
  async getPendingPosts(params = {}) {
    try {
      console.log('⏳ 取得待審核貼文')
      const response = await apiClient.get('/api/Posts/pending', { params })
      return { data: response.data }
    } catch (error) {
      console.error('❌ 取得待審核貼文失敗:', error)
      throw error
    }
  },

  // 搜尋貼文
  async searchPosts(keyword, params = {}) {
    try {
      console.log(`🔍 搜尋貼文 (關鍵字: ${keyword})`)
      const response = await apiClient.get('/api/Posts/search', { 
        params: { ...params, keyword } 
      })
      return { data: response.data }
    } catch (error) {
      console.error('❌ 搜尋貼文失敗:', error)
      throw error
    }
  },

  // 按狀態取得貼文
  async getPostsByStatus(status, params = {}) {
    try {
      console.log(`📊 按狀態取得貼文 (狀態: ${status})`)
      const response = await apiClient.get('/api/Posts', { 
        params: { ...params, status } 
      })
      return { data: response.data }
    } catch (error) {
      console.error('❌ 按狀態取得貼文失敗:', error)
      throw error
    }
  },

  // 🔥 審核貼文
  async approvePost(postId, approved, reason = null) {
    try {
      console.log(`✅ 審核貼文 (ID: ${postId}, 結果: ${approved})`)
      const response = await apiClient.put(`/api/Posts/${postId}/approve`, {
        approved,
        reason
      })
      return { data: response.data }
    } catch (error) {
      console.error('❌ 審核貼文失敗:', error)
      throw error
    }
  }
}

// 🔥 初始化時測試連線
if (process.env.NODE_ENV === 'development') {
  // 延遲測試，避免在模組載入時立即執行
  setTimeout(() => {
    testApiConnection()
  }, 1000)
}

export default postsApi
<template>
  <div class="notice-all-page">
    <!-- 頁面標題區 -->
    <div class="container my-4">
      <div class="row">
        <div class="col-12">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <router-link to="/" class="text-decoration-none">首頁</router-link>
              </li>
              <li class="breadcrumb-item active">所有通知</li>
            </ol>
          </nav>
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h2 mb-0">
              <i class="fas me-2 text-primary"></i>所有通知
            </h1>
            <button 
              @click="refreshNotifications" 
              class="btn btn-outline-primary" 
              :disabled="loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }" me-2></i>
              {{ loading ? '載入中...' : '重新整理' }}
            </button>
        </div>
      </div>
    </div>
    
    <!-- 主要內容 -->
    <div class="container">
      <!-- 通知統計卡片 -->
      <div class="row mb-4">
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="text-primary mb-2">
                <i class="fas fa-bell fa-2x"></i>
              </div>
              <h4 class="card-title">{{ totalNotifications }}</h4>
              <p class="card-text text-muted mb-0">全部通知</p>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="text-warning mb-2">
                <i class="fas fa-exclamation-triangle fa-2x"></i>
              </div>
              <h4 class="card-title">{{ highPriorityCount }}</h4>
              <p class="card-text text-muted mb-0">重要通知</p>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="text-success mb-2">
                <i class="fas fa-calendar-day fa-2x"></i>
              </div>
              <h4 class="card-title">{{ todayCount }}</h4>
              <p class="card-text text-muted mb-0">今日新增</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 過濾器和搜尋 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="row g-3 align-items-center">
                <div class="col-md-12">
                  <label class="form-label fw-semibold">
                    <i class="fas fa-search me-2"></i>關鍵字搜尋
                  </label>
                  <div class="input-group">
                    <input 
                      v-model="searchKeyword" 
                      @input="filterNotifications" 
                      type="text" 
                      class="form-control" 
                      placeholder="搜尋通知標題或內容..."
                    >
                    <button class="btn btn-outline-secondary" type="button">
                      <i class="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- 通知列表 -->
        <div class="row">
          <div class="col-12">
            <div class="notices-container">
              <!-- 載入中狀態 -->
              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">載入中...</span>
                </div>
                <p class="mt-3 text-muted">正在載入通知...</p>
              </div>

              <!-- 錯誤狀態 -->
              <div v-else-if="error" class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>載入失敗：</strong>{{ error }}
                <button @click="refreshNotifications" class="btn btn-outline-danger btn-sm ms-3">
                  <i class="fas fa-redo"></i> 重試
                </button>
              </div>

              <!-- 無通知狀態 -->
              <div v-else-if="filteredNotifications.length === 0" class="empty-state text-center py-5">
                <i class="fas fa-bell-slash text-muted display-1 mb-3"></i>
                <h4 class="text-muted">暫無相關通知</h4>
                <p class="text-muted">{{ searchKeyword ? '嘗試調整搜尋關鍵字' : '目前沒有任何通知' }}</p>
              </div>

              <!-- 通知卡片列表 -->
              <div v-else class="notices-list">
                <div 
                  v-for="notification in paginatedNotifications" 
                  :key="notification.id"
                  class="notice-card"
                  :class="{
                    'notice-expanded': expandedNotice === notification.id
                  }"
                >
                  <div class="notice-header" @click="toggleExpand(notification.id)">
                    <div class="notice-meta">
                      <span class="notice-date">
                        <i class="fas fa-clock me-1"></i>
                        {{ formatDate(notification.createdAt) }}
                      </span>
                      <span v-if="notification.scheduledAt && new Date(notification.scheduledAt) <= new Date()" class="badge bg-success">
                        <i class="fas fa-check-circle me-1"></i>
                        已發送
                      </span>
                      <span v-if="notification.scheduledAt" class="badge bg-info">
                        <i class="fas fa-calendar me-1"></i>
                        排程：{{ formatDate(notification.scheduledAt) }}
                      </span>
                    </div>
                    <h5 class="notice-title">
                      <i class="fas fa-bullhorn me-2 text-primary"></i>
                      {{ notification.title }}
                    </h5>
                    <div class="notice-publisher">
                      <div class="publisher-info">
                        <i class="fas fa-user me-1"></i>
                        發布者：{{ notification.publisher || '系統管理員' }}
                      </div>
                      <div class="notice-details">
                        <span v-if="notification.category" class="category-badge">
                          <i class="fas fa-tag me-1"></i>
                          {{ getCategoryText(notification.category) }}
                        </span>
                      </div>
                    </div>
                    <button class="expand-btn" :class="{ expanded: expandedNotice === notification.id }">
                      <i class="fas fa-chevron-down"></i>
                    </button>
                  </div>
                  
                  <div v-if="expandedNotice === notification.id" class="notice-content">
                    <!-- 通知內容 -->
                    <div class="content-body" v-html="notification.content"></div>
                    
                    <!-- 額外的通知資訊 -->
                    <div class="notice-metadata mt-3">
                      <div class="row">
                        <div class="col-md-12">
                          <div class="metadata-item">
                            <strong>建立時間：</strong>
                            {{ new Date(notification.createdAt).toLocaleString('zh-TW') }}
                          </div>
                          <div v-if="notification.updatedAt && notification.updatedAt !== notification.createdAt" class="metadata-item">
                            <strong>更新時間：</strong>
                            {{ new Date(notification.updatedAt).toLocaleString('zh-TW') }}
                          </div>
                          <div v-if="notification.scheduledAt" class="metadata-item">
                            <strong>排程時間：</strong>
                            {{ new Date(notification.scheduledAt).toLocaleString('zh-TW') }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 分頁控制 -->
              <div v-if="totalPages > 1" class="pagination-container mt-4">
                <nav aria-label="通知分頁">
                  <ul class="pagination justify-content-center">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                        <i class="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    <li 
                      v-for="page in visiblePages" 
                      :key="page"
                      class="page-item" 
                      :class="{ active: page === currentPage }"
                    >
                      <button class="page-link" @click="changePage(page)">{{ page }}</button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                        <i class="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
                <div class="pagination-info text-center text-muted mt-2">
                  顯示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredNotifications.length) }} 項，
                  共 {{ filteredNotifications.length }} 項通知
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoticeAllView',
  data() {
    return {
      // 通知資料
      notifications: [],
      filteredNotifications: [],
      
      // 載入狀態
      loading: false,
      error: null,
      
      // 篩選條件
      searchKeyword: '',
      
      // 展開狀態
      expandedNotice: null,
      
      // 分頁
      currentPage: 1,
      pageSize: 10,
      
      // 統計資料
      totalNotifications: 0,
      highPriorityCount: 0,
      todayCount: 0
    }
  },
  computed: {
    // 分頁相關計算
    totalPages() {
      return Math.ceil(this.filteredNotifications.length / this.pageSize)
    },
    paginatedNotifications() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredNotifications.slice(start, end)
    },
    visiblePages() {
      const total = this.totalPages
      const current = this.currentPage
      const delta = 2
      
      let range = []
      let rangeStart = Math.max(1, current - delta)
      let rangeEnd = Math.min(total, current + delta)
      
      for (let i = rangeStart; i <= rangeEnd; i++) {
        range.push(i)
      }
      
      return range
    }
  },
  async mounted() {
    await this.refreshNotifications()
  },
  methods: {
    // 載入通知資料
    async refreshNotifications() {
      this.loading = true
      this.error = null
      
      try {
        console.log('📢 開始載入通知資料...')
        
        // 構建查詢參數
        const queryParams = {
          search: this.searchKeyword,
          page: this.currentPage,
          itemsPerPage: this.pageSize,
          sortBy: 'CreatedAt',
          sortDirection: 'desc'
        }
        
        console.log('📋 查詢參數:', queryParams)
        
        const response = await this.$api.getNotifications(queryParams)
        console.log('🔍 API 回應:', response)
        
        if (response.success) {
          console.log('✅ API 成功，原始資料:', response.data)
          
          // 處理後端回應的資料結構
          this.notifications = this.processNotificationData(response.data || [])
          console.log('📊 處理後的通知:', this.notifications)
          
          this.totalNotifications = response.totalCount || 0
          this.currentPage = response.currentPage || 1
          
          await this.loadNotificationStats()
          this.updateStatistics()
          this.filterNotifications()
          
          console.log(`✅ 載入完成: ${this.notifications.length} 個通知`)
        } else {
          throw new Error(response.message || '載入通知失敗')
        }
      } catch (error) {
        console.error('❌ 載入通知失敗:', error)
        this.error = error.message || '無法載入通知資料，請稍後再試'
        this.notifications = []
      } finally {
        this.loading = false
      }
    },

    // 載入通知統計資料
    async loadNotificationStats() {
      try {
        const response = await this.$api.getNotificationStats()
        if (response.success && response.data) {
          const stats = response.data
          this.totalNotifications = Math.max(this.totalNotifications, stats.totalCount || 0)
          this.highPriorityCount = stats.categoryStats?.urgent || stats.categoryStats?.important || 0
          this.todayCount = stats.todayCount || 0
          console.log('📊 統計資料載入成功:', stats)
        } else {
          console.warn('⚠️ 統計資料 API 回應格式不正確:', response)
          // 不拋出錯誤，使用本地計算
          this.calculateLocalStats()
        }
      } catch (error) {
        console.warn('⚠️ 載入統計資料失敗，使用本地計算:', error)
        // 統計資料載入失敗時，使用本地資料計算
        this.calculateLocalStats()
      }
    },

    // 使用本地資料計算統計
    calculateLocalStats() {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // 先篩選出符合顯示條件的通知
      const visibleNotifications = this.notifications.filter(notification => {
        // 如果有排程時間，必須是已發送狀態
        if (notification.scheduledAt) {
          const scheduledTime = new Date(notification.scheduledAt)
          return scheduledTime <= now && (notification.emailStatus === 'sent' || notification.emailStatus === 'delivered')
        }
        
        // 只顯示非 email 通知
        if (notification.channel && notification.channel.toLowerCase() === 'email') {
          return false
        }
        
        return true
      })
      
      this.totalNotifications = visibleNotifications.length
      this.highPriorityCount = visibleNotifications.filter(n => n.priority === 'high').length
      this.todayCount = visibleNotifications.filter(n => {
        const createdDate = new Date(n.createdAt)
        return createdDate >= today
      }).length
      
      console.log('📊 使用本地統計:', {
        total: this.totalNotifications,
        high: this.highPriorityCount,
        today: this.todayCount
      })
    },

    // 處理通知資料，將後端格式轉換為前端格式
    processNotificationData(notifications) {
      console.log('🔄 開始處理通知資料:', notifications)
      
      if (!Array.isArray(notifications)) {
        console.warn('⚠️ 通知資料不是陣列:', notifications)
        return []
      }
      
      return notifications.map((notification, index) => {
        try {
          console.log(`📋 處理通知 ${index + 1}:`, notification)
          
          const processed = {
            id: notification.id || `temp-${index}`,
            title: this.extractTitleFromMessage(notification.message || ''),
            content: notification.message || '',
            priority: this.mapCategoryToPriority(notification.category),
            publisher: notification.emailAddress ? '系統通知' : '管理員',
            isRead: notification.emailStatus === 'delivered' || notification.emailStatus === 'sent',
            createdAt: notification.createdAt || notification.sentAt || new Date().toISOString(),
            updatedAt: notification.updatedAt,
            scheduledAt: notification.scheduledAt,
            emailStatus: notification.emailStatus || 'pending',
            emailStatusLabel: notification.emailStatusLabel || notification.emailStatus,
            category: notification.category || 'general',
            categoryLabel: notification.categoryLabel || notification.category,
            // 判斷通道類型，如果有 emailAddress 就是 email，否則是 push
            channel: notification.emailAddress ? 'email' : (notification.channel || 'push'),
            channelLabel: notification.emailAddress ? 'Email' : (notification.channelLabel || notification.channel || 'Push'),
            emailAddress: notification.emailAddress,
            memberId: notification.memberId,
            sellerId: notification.sellerId
          }
          
          console.log(`✅ 通知 ${index + 1} 處理完成:`, processed)
          return processed
        } catch (error) {
          console.error(`❌ 處理通知 ${index + 1} 失敗:`, error, notification)
          // 回傳一個基本的通知物件，避免整個陣列處理失敗
          return {
            id: `error-${index}`,
            title: '資料處理錯誤',
            content: '此通知的資料格式有問題',
            priority: 'normal',
            publisher: '系統',
            isRead: false,
            createdAt: new Date().toISOString(),
            emailStatus: 'error'
          }
        }
      }).filter(notification => notification.id) // 過濾掉無效通知
    },

    // 從訊息中提取標題（取前30字元作為標題）
    extractTitleFromMessage(message) {
      if (!message) return '無標題通知'
      
      // 移除 HTML 標籤
      const textContent = message.replace(/<[^>]*>/g, '').trim()
      
      // 取前30字元作為標題
      if (textContent.length <= 30) {
        return textContent
      }
      
      return textContent.substring(0, 30) + '...'
    },

    // 將類別映射為優先級
    mapCategoryToPriority(category) {
      const categoryMap = {
        'urgent': 'high',
        'important': 'high',
        'system': 'medium',
        'maintenance': 'medium',
        'general': 'normal',
        'info': 'normal'
      }
      return categoryMap[category?.toLowerCase()] || 'normal'
    },
    
    // 更新統計資料
    updateStatistics() {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // 先篩選出符合顯示條件的通知
      const visibleNotifications = this.notifications.filter(notification => {
        // 如果有排程時間，必須是已發送狀態
        if (notification.scheduledAt) {
          const scheduledTime = new Date(notification.scheduledAt)
          return scheduledTime <= now && (notification.emailStatus === 'sent' || notification.emailStatus === 'delivered')
        }
        
        // 只顯示非 email 通知
        if (notification.channel && notification.channel.toLowerCase() === 'email') {
          return false
        }
        
        return true
      })
      
      this.totalNotifications = visibleNotifications.length
      this.highPriorityCount = visibleNotifications.filter(n => n.priority === 'high').length
      this.todayCount = visibleNotifications.filter(n => {
        const createdDate = new Date(n.createdAt)
        return createdDate >= today
      }).length
    },
    
    // 篩選通知
    filterNotifications() {
      let filtered = [...this.notifications]
      
      // 只顯示已發送的排程通知和非 email 通知
      filtered = filtered.filter(notification => {
        // 如果有排程時間，必須是已發送狀態
        if (notification.scheduledAt) {
          const scheduledTime = new Date(notification.scheduledAt)
          const now = new Date()
          return scheduledTime <= now && (notification.emailStatus === 'sent' || notification.emailStatus === 'delivered')
        }
        
        // 只顯示 push 通知，不顯示 email 通知
        if (notification.channel && notification.channel.toLowerCase() === 'email') {
          return false
        }
        
        return true
      })
      
      // 關鍵字搜尋
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase().trim()
        filtered = filtered.filter(n => 
          n.title.toLowerCase().includes(keyword) || 
          (n.content && n.content.toLowerCase().includes(keyword))
        )
      }
      
      // 排序：按時間倒序
      filtered.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      
      this.filteredNotifications = filtered
      this.currentPage = 1 // 重置頁碼
    },
    
    // 展開/收合通知
    toggleExpand(notificationId) {
      if (this.expandedNotice === notificationId) {
        this.expandedNotice = null
      } else {
        this.expandedNotice = notificationId
      }
    },
    
    // 分頁切換
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        // 滾動到頂部
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = now - date
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return '今天 ' + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      } else if (diffDays === 1) {
        return '昨天 ' + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        return date.toLocaleDateString('zh-TW')
      }
    },

    // 獲取通知圖示
    getNotificationIcon(type) {
      const map = {
        info: 'fas fa-info-circle text-info',
        warning: 'fas fa-exclamation-triangle text-warning',
        error: 'fas fa-times-circle text-danger',
        success: 'fas fa-check-circle text-success',
        system: 'fas fa-cog text-secondary'
      }
      return map[type] || 'fas fa-bell text-primary'
    },

    // 格式化相對時間
    formatRelativeTime(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = now - date
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffMinutes < 1) {
        return '剛剛'
      } else if (diffMinutes < 60) {
        return `${diffMinutes}分鐘前`
      } else if (diffHours < 24) {
        return `${diffHours}小時前`
      } else {
        return `${diffDays}天前`
      }
    },

    // 獲取分頁數字
    getPageNumbers() {
      const current = this.currentPage
      const total = this.totalPages
      const delta = 2
      
      let range = []
      let rangeStart = Math.max(1, current - delta)
      let rangeEnd = Math.min(total, current + delta)
      
      for (let i = rangeStart; i <= rangeEnd; i++) {
        range.push(i)
      }
      
      return range
    },

    // 獲取類別文字
    getCategoryText(category) {
      const map = {
        system: '系統通知',
        announcement: '公告通知',
        security: '安全警告',
        maintenance: '維護通知',
        feature: '功能更新',
        promotion: '促銷活動',
        account: '帳戶相關',
        order: '訂單通知',
        payment: '付款通知',
        shipping: '配送通知'
      }
      return map[category] || '一般通知'
    },
  }
}
</script>

<style scoped>
/* 頁面標題區樣式 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 0 3rem;
  color: white;
  position: relative;
  margin-bottom: 0;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.page-header .container {
  position: relative;
  z-index: 2;
  text-align: center;
}

.page-header h1 {
  color: white;
  margin-bottom: 0.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-header .lead {
  font-size: 1.25rem;
  margin-bottom: 0;
  opacity: 0.9;
}

.breadcrumb-item a {
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-item a:hover {
  color: white !important;
}

/* 主要內容區樣式 */
.notice-main-content {
  background-color: #f8f9fa;
  min-height: 70vh;
  padding-bottom: 3rem;
}

/* 統計卡片樣式 */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.stat-card-total::before { background: linear-gradient(90deg, #007bff, #0056b3); }
.stat-card-unread::before { background: linear-gradient(90deg, #dc3545, #bd2130); }
.stat-card-high::before { background: linear-gradient(90deg, #ffc107, #e0a800); }
.stat-card-today::before { background: linear-gradient(90deg, #28a745, #1e7e34); }

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.stat-card-total .stat-icon { background: rgba(0, 123, 255, 0.1); color: #007bff; }
.stat-card-unread .stat-icon { background: rgba(220, 53, 69, 0.1); color: #dc3545; }
.stat-card-high .stat-icon { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
.stat-card-today .stat-icon { background: rgba(40, 167, 69, 0.1); color: #28a745; }

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #2c3e50;
}

.stat-content p {
  color: #6c757d;
  margin: 0;
  font-weight: 500;
}

/* 過濾器卡片樣式 */
.filter-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.filter-card .form-label {
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.filter-card .form-select,
.filter-card .form-control {
  border-radius: 8px;
  border: 1px solid #ced4da;
  transition: all 0.3s ease;
}

.filter-card .form-select:focus,
.filter-card .form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.text-transparent {
  color: transparent !important;
}

/* 通知容器樣式 */
.notices-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 空狀態樣式 */
.empty-state {
  padding: 3rem 1.5rem;
}

.empty-state .display-1 {
  font-size: 4rem;
  opacity: 0.3;
}

/* 通知卡片樣式 */
.notice-card {
  border-bottom: 1px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
}

.notice-card:last-child {
  border-bottom: none;
}

.notice-card.notice-high-priority {
  border-left: 4px solid #dc3545;
}

.notice-card:hover {
  background-color: #f8f9fa;
}

.notice-header {
  padding: 1.5rem;
  cursor: pointer;
  position: relative;
  user-select: none;
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.notice-date {
  color: #6c757d;
  font-size: 0.875rem;
}

.notice-title {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.4;
}

.notice-publisher {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0;
}

.publisher-info {
  margin-bottom: 0.5rem;
}

.notice-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  background: rgba(108, 117, 125, 0.1);
  color: #495057;
  white-space: nowrap;
}

.category-badge {
  background: rgba(0, 123, 255, 0.1);
  color: #0056b3;
}

.expand-btn {
  position: absolute;
  top: 50%;
  right: 1.5rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 50%;
}

.expand-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #495057;
}

.expand-btn.expanded {
  transform: translateY(-50%) rotate(180deg);
  color: #007bff;
}

/* 通知內容樣式 */
.notice-content {
  padding: 0 1.5rem 1.5rem;
  border-top: 1px solid #f8f9fa;
  background: rgba(248, 249, 250, 0.5);
  animation: expandDown 0.3s ease-out;
}

@keyframes expandDown {
  from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
}

.content-body {
  color: #495057;
  line-height: 1.6;
}

.content-body h1, .content-body h2, .content-body h3 {
  color: #2c3e50;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.content-body p {
  margin-bottom: 1rem;
}

.content-body ul, .content-body ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

/* 通知元資料樣式 */
.notice-metadata {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e9ecef;
  margin-top: 1rem;
}

.metadata-item {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #495057;
}

.metadata-item:last-child {
  margin-bottom: 0;
}

.metadata-item strong {
  color: #2c3e50;
  font-weight: 600;
}

/* 分頁樣式 */
.pagination-container {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.pagination .page-link {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  color: #495057;
  margin: 0 0.125rem;
  transition: all 0.3s ease;
}

.pagination .page-link:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.4);
}

.pagination .page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .page-header {
    padding: 3rem 0 2rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-header .lead {
    font-size: 1.1rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .filter-card {
    padding: 1rem;
  }
  
  .filter-card .row > .col-md-3,
  .filter-card .row > .col-md-4,
  .filter-card .row > .col-md-2 {
    margin-bottom: 1rem;
  }
  
  .notice-header {
    padding: 1rem;
  }
  
  .notice-content {
    padding: 0 1rem 1rem;
  }
  
  .expand-btn {
    right: 1rem;
  }
  
  .notice-meta {
    gap: 0.5rem;
  }
}

@media (max-width: 576px) {
  .page-header h1 {
    font-size: 1.75rem;
  }
  
  .page-header .lead {
    font-size: 1rem;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
  
  .filter-card {
    padding: 0.75rem;
  }
  
  .notice-title {
    font-size: 1.1rem;
  }
  
  .pagination-container {
    padding: 1rem;
  }
}

/* 動畫效果 */
.stat-card,
.filter-card,
.notices-container {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 載入動畫 */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Badge 樣式 */
.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.5rem;
  border-radius: 12px;
}

/* 警告樣式 */
.alert {
  border-radius: 8px;
  border: none;
  margin: 1.5rem;
}

.alert-danger {
  background: rgba(220, 53, 69, 0.1);
  color: #721c24;
}
</style>

<template>
  <div class="coupons-page">
    <!-- 頁面標題區 -->
    <div class="container my-4">
      <div class="row">
        <div class="col-12">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <router-link to="/" class="text-decoration-none">首頁</router-link>
              </li>
              <li class="breadcrumb-item">
                <router-link to="/member/basic-info" class="text-decoration-none">會員中心</router-link>
              </li>
              <li class="breadcrumb-item active">我的優惠券</li>
            </ol>
          </nav>
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h2 mb-0">
              <i class="fas fa-ticket-alt me-2 text-primary"></i>我的優惠券
            </h1>
            <button 
              @click="refreshData" 
              class="btn btn-outline-primary" 
              :disabled="isRefreshing"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }" me-2></i>
              {{ isRefreshing ? '重新整理中...' : '重新整理' }}
            </button>
          </div>
          
          <!-- 錯誤提示 -->
          <div v-if="error" class="alert alert-danger mt-3" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ error }}
            <button @click="refreshData" class="btn btn-sm btn-outline-danger ms-2">
              重試
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要內容 -->
    <div class="container">
      
      <div class="row">
        <!-- 側邊欄 -->
        <div class="col-lg-3 col-md-4 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">
                <i class="fas fa-bars me-2 text-primary"></i>優惠券分類
              </h5>
              <div class="list-group list-group-flush">
                <button 
                  v-for="category in categories" 
                  :key="category.key"
                  @click="selectCategory(category.key)"
                  class="list-group-item list-group-item-action border-0 px-0"
                  :class="{ 'active': selectedCategory === category.key }"
                  :disabled="loading"
                >
                  <i :class="category.icon + ' me-2'"></i>
                  {{ category.name }}
                  <span class="badge bg-secondary float-end">{{ category.count }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 優惠券統計 -->
          <div class="card border-0 shadow-sm mt-3">
            <div class="card-body">
              <h6 class="card-title">
                <i class="fas fa-chart-pie me-2 text-info"></i>優惠券統計
              </h6>
              <div class="row text-center">
                <div class="col-6 mb-2">
                  <div class="text-success">
                    <i class="fas fa-check-circle fa-lg"></i>
                    <div class="fw-bold">{{ availableCoupons }}</div>
                    <small class="text-muted">可使用</small>
                  </div>
                </div>
                <div class="col-6 mb-2">
                  <div class="text-warning">
                    <i class="fas fa-clock fa-lg"></i>
                    <div class="fw-bold">{{ expiringSoon }}</div>
                    <small class="text-muted">即將到期</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-info">
                    <i class="fas fa-history fa-lg"></i>
                    <div class="fw-bold">{{ usedCoupons }}</div>
                    <small class="text-muted">已使用</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-danger">
                    <i class="fas fa-times-circle fa-lg"></i>
                    <div class="fw-bold">{{ expiredCoupons }}</div>
                    <small class="text-muted">已過期</small>
                  </div>
                </div>
              </div>
              
              <!-- 最後更新時間 -->
              <div v-if="lastRefreshTime" class="text-muted mt-3 text-center">
                <small>
                  <i class="fas fa-clock me-1"></i>
                  最後更新：{{ formatExpiryDate(lastRefreshTime.toISOString()) }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- 主要內容區 -->
        <div class="col-lg-9 col-md-8">
          <!-- 篩選器 -->
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <div class="row g-3 align-items-center">
                <div class="col-md-4">
                  <label class="form-label fw-semibold">
                    <i class="fas fa-filter me-2"></i>狀態篩選
                  </label>
                  <select v-model="selectedStatus" @change="filterCoupons" class="form-select">
                    <option value="">全部狀態</option>
                    <option value="available">可使用</option>
                    <option value="used">已使用</option>
                    <option value="expired">已過期</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">
                    <i class="fas fa-sort me-2"></i>排序方式
                  </label>
                  <select v-model="sortBy" @change="sortCoupons" class="form-select">
                    <option value="expiry">到期時間</option>
                    <option value="value">優惠金額</option>
                    <option value="created">獲得時間</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">
                    <i class="fas fa-search me-2"></i>搜尋優惠券
                  </label>
                  <div class="input-group">
                    <input 
                      v-model="searchKeyword" 
                      @input="filterCoupons" 
                      type="text" 
                      class="form-control" 
                      placeholder="搜尋優惠券名稱..."
                    >
                    <button class="btn btn-outline-secondary" type="button">
                      <i class="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 優惠券列表 -->
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <!-- 載入中狀態 -->
              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">載入中...</span>
                </div>
                <p class="mt-3 text-muted">正在載入優惠券...</p>
              </div>

              <!-- 無優惠券狀態 -->
              <div v-else-if="filteredCoupons.length === 0" class="empty-state text-center py-5">
                <i class="fas fa-ticket-alt text-muted display-1 mb-3"></i>
                <h4 class="text-muted">暫無優惠券</h4>
                <p class="text-muted">{{ searchKeyword || selectedStatus ? '嘗試調整篩選條件' : '快去獲取您的第一張優惠券吧！' }}</p>
              </div>

              <!-- 優惠券列表 -->
              <div v-else>
                <div 
                  v-for="coupon in paginatedCoupons" 
                  :key="coupon.id"
                  class="coupon-item mb-3"
                >
                  <div class="coupon-card" :class="getCouponCardClass(coupon.status)">
                    <div class="row g-0 align-items-center">
                      <div class="col-md-3">
                        <div class="coupon-value text-center p-3">
                          <div class="value-amount">
                            <span v-if="coupon.type === 'jcoin'" class="currency"></span>
                            <span v-else class="currency">$</span>
                            <span class="amount">{{ coupon.discount }}</span>
                            <span v-if="coupon.type === 'jcoin'" class="percent">%</span>
                          </div>
                          <div class="value-type">{{ getCouponTypeText(coupon.type) }}</div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="coupon-info p-3">
                          <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="coupon-title mb-0">{{ coupon.title }}</h5>
                            <!-- 即將到期警告 -->
                            <span 
                              v-if="coupon.status === 'available' && isExpiringSoon(coupon.expiryDate)"
                              class="badge bg-warning text-dark"
                            >
                              <i class="fas fa-exclamation-triangle me-1"></i>即將到期
                            </span>
                          </div>
                          <p class="coupon-description text-muted mb-2">{{ coupon.description }}</p>
                          <div class="coupon-conditions">
                            <small class="text-muted">
                              <i class="fas fa-info-circle me-1"></i>
                              <span v-if="coupon.type === 'jcoin'">
                                滿 ${{ coupon.minAmount }} 享 {{ coupon.discount }}% J Coin回饋
                              </span>
                              <span v-else>
                                滿 ${{ coupon.minAmount }} 可使用
                              </span>
                            </small>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-3">
                        <div class="coupon-actions text-center p-3">
                          <div class="coupon-status mb-2">
                            <span class="badge" :class="getStatusBadgeClass(coupon.status)">
                              {{ getStatusText(coupon.status) }}
                            </span>
                          </div>
                          <div class="coupon-expiry mb-2">
                            <small class="text-muted">
                              <i class="fas fa-calendar me-1"></i>
                              {{ formatExpiryDate(coupon.expiryDate) }}
                            </small>
                          </div>
                          <button 
                            v-if="coupon.status === 'available'"
                            @click="useCoupon(coupon)"
                            class="btn btn-primary btn-sm"
                          >
                            <i class="fas fa-shopping-cart me-1"></i>立即使用
                          </button>
                          <button 
                            v-else
                            class="btn btn-outline-secondary btn-sm" 
                            disabled
                          >
                            {{ coupon.status === 'used' ? '已使用' : '已過期' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 分頁控制 -->
                <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
                  <nav aria-label="優惠券分頁">
                    <ul class="pagination">
                      <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                        <button 
                          class="page-link" 
                          @click="changePage(pagination.currentPage - 1)" 
                          :disabled="pagination.currentPage === 1 || loading"
                        >
                          <i class="fas fa-chevron-left"></i>
                        </button>
                      </li>
                      <li 
                        v-for="page in visiblePages" 
                        :key="page" 
                        class="page-item" 
                        :class="{ active: page === pagination.currentPage }"
                      >
                        <button 
                          class="page-link" 
                          @click="changePage(page)"
                          :disabled="loading"
                        >
                          {{ page }}
                        </button>
                      </li>
                      <li class="page-item" :class="{ disabled: pagination.currentPage === totalPages }">
                        <button 
                          class="page-link" 
                          @click="changePage(pagination.currentPage + 1)" 
                          :disabled="pagination.currentPage === totalPages || loading"
                        >
                          <i class="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                  
                  <!-- 分頁資訊 -->
                  <div class="d-flex justify-content-center mt-2">
                    <small class="text-muted">
                      顯示第 {{ (pagination.currentPage - 1) * pagination.itemsPerPage + 1 }} - 
                      {{ Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems) }} 筆，
                      共 {{ pagination.totalItems }} 筆優惠券
                    </small>
                  </div>
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
import memberCouponService from '@/services/memberCouponService'
import userIdentityService from '@/services/userIdentityService'

export default {
  name: "CouponsView",
  data() {
    return {
      loading: true,
      error: null,
      selectedCategory: '',
      selectedStatus: '',
      sortBy: 'expiry',
      searchKeyword: '',
      currentPage: 1,
      itemsPerPage: 8,
      
      // API 資料
      coupons: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 8
      },
      
      // 統計資料
      stats: {
        available: 0,
        used: 0,
        expired: 0,
        expiringSoon: 0,
        totalValue: 0
      },
      
      // 分類數據（動態計算）
      categories: [
        { key: '', name: '全部優惠券', icon: 'fas fa-th-list', count: 0 },
        { key: 'discount', name: '折扣券', icon: 'fas fa-percent', count: 0 },
        { key: 'cash', name: '現金券', icon: 'fas fa-dollar-sign', count: 0 },
        { key: 'jcoin', name: 'J Coin回饋券', icon: 'fas fa-coins', count: 0 }
      ],
      
      // 操作狀態
      isRefreshing: false,
      lastRefreshTime: null
    }
  },
  
  async mounted() {
    await this.loadCouponsData()
    await this.loadStats()
  },
  computed: {
    filteredCoupons() {
      // 前端資料已經經過 API 篩選，這裡主要處理額外的本地篩選
      let filtered = [...this.coupons]

      // 分類篩選（如果 API 未處理）
      if (this.selectedCategory) {
        filtered = filtered.filter(c => c.type === this.selectedCategory)
      }

      // 狀態篩選（如果 API 未處理）
      if (this.selectedStatus) {
        filtered = filtered.filter(c => c.status === this.selectedStatus)
      }

      // 關鍵字搜尋（如果 API 未處理）
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(c => 
          c.title.toLowerCase().includes(keyword) ||
          c.description.toLowerCase().includes(keyword)
        )
      }

      return filtered
    },
    
    paginatedCoupons() {
      // 使用 API 分頁，直接返回當前資料
      return this.coupons
    },
    
    totalPages() {
      return this.pagination.totalPages
    },
    
    visiblePages() {
      const pages = []
      const maxVisible = 5
      const current = this.pagination.currentPage
      const total = this.pagination.totalPages
      const start = Math.max(1, current - Math.floor(maxVisible / 2))
      const end = Math.min(total, start + maxVisible - 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    },
    
    availableCoupons() {
      return this.stats.available
    },
    
    expiringSoon() {
      return this.stats.expiringSoon
    },
    
    usedCoupons() {
      return this.stats.used
    },
    
    expiredCoupons() {
      return this.stats.expired
    }
  },
  methods: {
    /**
     * 載入優惠券資料
     */
    async loadCouponsData() {
      try {
        this.loading = true
        this.error = null
        
        // 使用 memberCouponService 來獲取會員 ID
        const memberId = memberCouponService.getCurrentMemberId()
        
        console.log('CouponsView - 會員 ID:', memberId)
        
        // 如果沒有會員 ID，提示錯誤
        if (!memberId) {
          throw new Error('無法獲取會員資訊，請確認您的登入狀態')
        }
        
        const params = {
          page: this.currentPage,
          pageSize: this.itemsPerPage, // 使用後端參數名稱
        }
        
        // 添加篩選條件 - 適配後端參數
        if (this.selectedStatus) {
          // 轉換前端狀態到後端狀態
          const statusMap = {
            'available': 'Active',
            'used': 'Used', 
            'expired': 'Expired'
          }
          params.status = statusMap[this.selectedStatus] || this.selectedStatus
        }
        
        // 如果只要顯示可用的
        if (this.selectedStatus === 'available') {
          params.activeOnly = true
        }
        
        console.log('CouponsView - 請求參數:', params)
        const response = await memberCouponService.getMemberCoupons(params)
        
        this.coupons = response.coupons
        this.pagination = response.pagination
        this.updateCategoryStats()
        
      } catch (error) {
        console.error('載入優惠券失敗:', error)
        this.error = error.message || '載入優惠券失敗，請稍後再試'
        this.coupons = []
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 載入統計資料
     */
    async loadStats() {
      try {
        this.stats = await memberCouponService.getCouponStats()
      } catch (error) {
        console.error('載入統計資料失敗:', error)
      }
    },
    
    /**
     * 更新分類統計
     */
    updateCategoryStats() {
      // 重置計數
      this.categories.forEach(cat => cat.count = 0)
      
      // 計算各分類數量
      this.coupons.forEach(coupon => {
        const category = this.categories.find(cat => cat.key === coupon.type)
        if (category) category.count++
        
        // 更新總數
        const allCategory = this.categories.find(cat => cat.key === '')
        if (allCategory) allCategory.count++
      })
    },
    
    /**
     * 重新整理資料
     */
    async refreshData() {
      this.isRefreshing = true
      try {
        await Promise.all([
          this.loadCouponsData(),
          this.loadStats()
        ])
        this.lastRefreshTime = new Date()
      } catch (error) {
        console.error('重新整理失敗:', error)
      } finally {
        this.isRefreshing = false
      }
    },
    
    /**
     * 篩選優惠券
     */
    async filterCoupons() {
      this.currentPage = 1
      await this.loadCouponsData()
    },
    
    /**
     * 排序優惠券
     */
    async sortCoupons() {
      await this.loadCouponsData()
    },
    
    /**
     * 切換頁面
     */
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page
        await this.loadCouponsData()
      }
    },
    
    /**
     * 選擇分類
     */
    async selectCategory(categoryKey) {
      this.selectedCategory = categoryKey
      await this.filterCoupons()
    },
    
    /**
     * 使用優惠券
     */
    async useCoupon(coupon) {
      try {
        // 檢查優惠券可用性
        const checkResult = memberCouponService.checkCouponUsability(coupon)
        if (!checkResult.canUse) {
          this.$toast?.warning(checkResult.reason)
          return
        }
        
        // 導航到購物頁面並帶上優惠券參數
        this.$router.push({
          path: '/products',
          query: { 
            coupon: coupon.id,
            type: coupon.type
          }
        })
        
      } catch (error) {
        console.error('使用優惠券失敗:', error)
        this.$toast?.error('使用優惠券失敗，請稍後再試')
      }
    },
    
    /**
     * 領取優惠券（如果有推廣碼功能）
     */
    async claimCoupon(couponCode) {
      try {
        const result = await memberCouponService.claimCoupon(couponCode)
        this.$toast?.success('優惠券領取成功！')
        await this.refreshData()
        return result
      } catch (error) {
        console.error('領取優惠券失敗:', error)
        this.$toast?.error(error.message || '領取優惠券失敗')
        throw error
      }
    },
    
    /**
     * 計算優惠金額
     */
    calculateDiscount(coupon, orderAmount = 0) {
      return memberCouponService.calculateDiscount(coupon, orderAmount)
    },
    
    getCouponCardClass(status) {
      return {
        'coupon-available': status === 'available',
        'coupon-used': status === 'used',
        'coupon-expired': status === 'expired'
      }
    },
    
    getStatusBadgeClass(status) {
      switch (status) {
        case 'available': return 'bg-success'
        case 'used': return 'bg-info'
        case 'expired': return 'bg-danger'
        default: return 'bg-secondary'
      }
    },
    
    getStatusText(status) {
      switch (status) {
        case 'available': return '可使用'
        case 'used': return '已使用'
        case 'expired': return '已過期'
        default: return '未知'
      }
    },
    
    getCouponTypeText(type) {
      switch (type) {
        case 'discount': return '折扣券'
        case 'cash': return '現金券'
        case 'jcoin': return 'J Coin回饋券'
        default: return '優惠券'
      }
    },
    
    formatExpiryDate(date) {
      if (!date) return '無期限'
      
      try {
        return new Date(date).toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch (error) {
        return '日期格式錯誤'
      }
    },
    
    /**
     * 檢查優惠券是否即將過期
     */
    isExpiringSoon(expiryDate, days = 7) {
      if (!expiryDate) return false
      
      const expiry = new Date(expiryDate)
      const soon = new Date()
      soon.setDate(soon.getDate() + days)
      
      return expiry <= soon && expiry >= new Date()
    }
  },
  
  /**
   * 監聽篩選條件變化
   */
  watch: {
    selectedCategory: {
      handler() {
        this.filterCoupons()
      }
    },
    selectedStatus: {
      handler() {
        this.filterCoupons()
      }
    },
    searchKeyword: {
      handler() {
        // 使用防抖處理搜尋
        clearTimeout(this.searchTimeout)
        this.searchTimeout = setTimeout(() => {
          this.filterCoupons()
        }, 500)
      }
    }
  },
  
  /**
   * 清理計時器
   */
  beforeUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  }
}
</script>

<style scoped>
.coupons-page {
  min-height: 100vh;
}

/* 側邊欄樣式 */
.list-group-item.active {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

/* 優惠券卡片樣式 */
.coupon-card {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.coupon-available {
  border-color: #28a745;
  background: linear-gradient(135deg, #fff 0%, #f8fff9 100%);
}

.coupon-used {
  border-color: #17a2b8;
  background: linear-gradient(135deg, #fff 0%, #f0faff 100%);
  opacity: 0.8;
}

.coupon-expired {
  border-color: #dc3545;
  background: linear-gradient(135deg, #fff 0%, #fff5f5 100%);
  opacity: 0.6;
}

/* 優惠券價值顯示 */
.coupon-value {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.coupon-available .coupon-value {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.coupon-used .coupon-value {
  background: linear-gradient(135deg, #6c757d 0%, #adb5bd 100%);
}

.coupon-expired .coupon-value {
  background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
}

.value-amount {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1.2;
}

.currency {
  font-size: 0.8em;
  vertical-align: top;
}

.percent {
  font-size: 0.8em;
  vertical-align: top;
  margin-left: 2px;
}

.amount {
  font-size: 1.8em;
}

.value-type {
  font-size: 0.85rem;
  opacity: 0.9;
}

/* 優惠券信息 */
.coupon-title {
  font-weight: 600;
  color: #333;
}

.coupon-description {
  font-size: 0.9rem;
  line-height: 1.4;
}

.coupon-conditions {
  border-top: 1px solid #e9ecef;
  padding-top: 0.5rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .coupon-card .row {
    text-align: center;
  }
  
  .coupon-value {
    border-radius: 8px;
    margin: 0.5rem;
  }
  
  .coupon-info, .coupon-actions {
    padding: 1rem !important;
  }
}

/* 空狀態樣式 */
.empty-state {
  color: #6c757d;
}

.empty-state i {
  opacity: 0.5;
}

/* 分頁樣式 */
.pagination .page-link {
  border-radius: 8px;
  margin: 0 2px;
  border: 1px solid #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

/* 卡片陰影 */
.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.breadcrumb {
  background: none;
  padding: 0;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
  color: #6c757d;
}
</style>

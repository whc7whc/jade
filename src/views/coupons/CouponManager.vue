<template>
  <div class="coupon-manager">
    <!-- 優惠券統計概覽 -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <i class="fas fa-tags fa-2x text-primary mb-2"></i>
            <h5 class="card-title text-primary">總優惠券</h5>
            <h3 class="text-primary">{{ couponStats.total }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
            <h5 class="card-title text-success">啟用中</h5>
            <h3 class="text-success">{{ couponStats.active }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <i class="fas fa-pause-circle fa-2x text-warning mb-2"></i>
            <h5 class="card-title text-warning">停用中</h5>
            <h3 class="text-warning">{{ couponStats.inactive }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <i class="fas fa-calendar-times fa-2x text-danger mb-2"></i>
            <h5 class="card-title text-danger">已過期</h5>
            <h3 class="text-danger">{{ couponStats.expired }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- 篩選和操作區 -->
    <div class="row mb-4">
      <div class="col-md-2">
        <label class="form-label">狀態篩選</label>
        <select class="form-select" v-model="filters.status" @change="applyFilters">
          <option value="">全部狀態</option>
          <option value="active">啟用中</option>
          <option value="inactive">停用中</option>
          <option value="expired">已過期</option>
        </select>
      </div>
      <div class="col-md-2">
        <label class="form-label">折扣類型</label>
        <select class="form-select" v-model="filters.discountType" @change="applyFilters">
          <option value="">全部類型</option>
          <option value="percentage">百分比折扣</option>
          <option value="fixed">固定金額</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">搜尋優惠券</label>
        <input 
          type="text" 
          class="form-control" 
          placeholder="搜尋優惠券名稱或描述..."
          v-model="filters.searchText"
          @input="applyFilters"
        >
      </div>
      <div class="col-md-2">
        <label class="form-label">每頁顯示</label>
        <select class="form-select" v-model="pagination.itemsPerPage" @change="applyFilters">
          <option value="12">12 張</option>
          <option value="24">24 張</option>
          <option value="48">48 張</option>
        </select>
      </div>
      <div class="col-md-3 d-flex align-items-end">
        <button class="btn btn-outline-primary me-2" @click="refreshCoupons" :disabled="loading">
          <i class="fas fa-sync me-1" :class="{ 'fa-spin': loading }"></i>重新整理
        </button>
        <button class="btn btn-primary" @click="showModal" :disabled="loading">
          <i class="fas fa-plus me-2"></i>新增優惠券
        </button>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="alert alert-danger mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <span>{{ error }}</span>
        <button @click="loadCoupons" class="btn btn-outline-danger btn-sm">
          重新載入
        </button>
      </div>
    </div>

    <!-- Loading 狀態 -->
    <div v-if="loading && coupons.length === 0" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-3 text-muted">正在載入優惠券...</p>
    </div>

    <!-- 優惠券列表 -->
    <div v-if="!loading || filteredCoupons.length > 0" class="row">
      <div class="col-lg-4 col-md-6 mb-4" v-for="coupon in paginatedCoupons" :key="coupon.id">
        <div class="card h-100 shadow-sm" :class="getCouponCardClass(coupon)">
          <div class="card-header d-flex justify-content-between align-items-center" :class="getCouponHeaderClass(coupon)">
            <div class="d-flex align-items-center">
              <i class="fas fa-ticket-alt me-2"></i>
              <span class="fw-bold">{{ coupon.title }}</span>
            </div>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click.prevent="editCoupon(coupon)">
                  <i class="fas fa-edit me-2"></i>編輯
                </a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="duplicateCoupon(coupon)">
                  <i class="fas fa-copy me-2"></i>複製
                </a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" @click.prevent="deleteCoupon(coupon)">
                  <i class="fas fa-trash me-2"></i>刪除
                </a></li>
              </ul>
            </div>
          </div>
          
          <div class="card-body">
            <!-- 折扣資訊 -->
            <div class="text-center mb-3">
              <div class="discount-display">
                <span class="display-5 fw-bold" :class="getCouponDiscountClass(coupon)">
                  {{ coupon.discount_Amount }}{{ coupon.discount_Type === 'percentage' ? '%' : '元' }}
                </span>
                <div class="small text-muted">
                  {{ coupon.discount_Type === 'percentage' ? '百分比折扣' : '固定金額折扣' }}
                </div>
              </div>
            </div>

            <!-- 優惠券詳情 -->
            <div class="coupon-details">
              <div class="row text-center mb-2">
                <div class="col-6">
                  <small class="text-muted d-block">最低消費</small>
                  <strong>NT$ {{ formatCurrency(coupon.min_Spend) }}</strong>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">使用限制</small>
                  <strong>{{ coupon.usage_Limit || '無限制' }}</strong>
                </div>
              </div>
              
              <div class="row text-center mb-3">
                <div class="col-6">
                  <small class="text-muted d-block">已使用</small>
                  <strong>{{ coupon.used_Count || 0 }}</strong>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">剩餘</small>
                  <strong>{{ getRemainingUsage(coupon) }}</strong>
                </div>
              </div>
            </div>

            <!-- 描述 -->
            <p class="card-text small text-muted mb-3" v-if="coupon.description">
              {{ coupon.description }}
            </p>

            <!-- 時間資訊 -->
            <div class="time-info small">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">開始時間:</span>
                <span>{{ formatDateTime(coupon.start_At) }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">結束時間:</span>
                <span :class="isExpired(coupon) ? 'text-danger' : ''">
                  {{ formatDateTime(coupon.expired_At) }}
                </span>
              </div>
            </div>
          </div>

          <div class="card-footer bg-transparent">
            <div class="d-flex justify-content-between align-items-center">
              <div class="coupon-status">
                <span class="badge fs-6" :class="getCouponStatusBadge(coupon)">
                  <i class="fas" :class="getCouponStatusIcon(coupon)"></i>
                  {{ getCouponStatusText(coupon) }}
                </span>
              </div>
              <div class="coupon-actions">
                <button 
                  class="btn btn-sm me-1" 
                  :class="coupon.is_Active ? 'btn-warning' : 'btn-success'"
                  @click="toggleCouponStatus(coupon)"
                  :disabled="loading"
                >
                  <i class="fas" :class="coupon.is_Active ? 'fa-pause' : 'fa-play'"></i>
                  {{ coupon.is_Active ? '停用' : '啟用' }}
                </button>
                <button 
                  class="btn btn-sm btn-outline-primary" 
                  @click="editCoupon(coupon)"
                  :disabled="loading"
                >
                  <i class="fas fa-edit"></i>
                  編輯
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分頁控制 -->
    <div v-if="pagination.totalPages > 1" class="row mt-4">
      <div class="col-12">
        <nav>
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(pagination.currentPage - 1)">
                <i class="fas fa-chevron-left"></i>
              </a>
            </li>
            <li 
              class="page-item" 
              :class="{ active: page === pagination.currentPage }"
              v-for="page in getPageNumbers()" 
              :key="page"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(pagination.currentPage + 1)">
                <i class="fas fa-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
        <div class="text-center mt-2">
          <small class="text-muted">
            顯示第 {{ (pagination.currentPage - 1) * pagination.itemsPerPage + 1 }} - 
            {{ Math.min(pagination.currentPage * pagination.itemsPerPage, filteredCoupons.length) }} 項，
            共 {{ filteredCoupons.length }} 項優惠券
          </small>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-if="!loading && filteredCoupons.length === 0 && !error" class="text-center py-5">
      <i class="fas fa-tags fa-4x text-muted mb-3"></i>
      <h5 class="text-muted">
        {{ coupons.length === 0 ? '目前沒有優惠券' : '沒有符合篩選條件的優惠券' }}
      </h5>
      <p class="text-muted">
        {{ coupons.length === 0 ? '點擊「新增優惠券」按鈕來建立第一張優惠券' : '請嘗試調整篩選條件' }}
      </p>
      <button v-if="coupons.length === 0" class="btn btn-primary" @click="showModal">
        <i class="fas fa-plus me-2"></i>新增優惠券
      </button>
    </div>

    <!-- 新增/編輯優惠券 Modal -->
    <div v-if="showCouponModal" class="modal d-block" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingCoupon ? '編輯優惠券' : '新增優惠券' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">優惠券名稱 *</label>
              <input type="text" class="form-control" v-model="formData.title" required>
            </div>
            <div class="mb-3">
              <label class="form-label">描述</label>
              <textarea class="form-control" v-model="formData.description" rows="3"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">折扣類型 *</label>
              <select class="form-control" v-model="formData.discount_Type" required>
                <option value="percentage">百分比折扣</option>
                <option value="fixed">固定金額</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">折扣金額 *</label>
              <input type="number" class="form-control" v-model.number="formData.discount_Amount" required min="0">
            </div>
            <div class="mb-3">
              <label class="form-label">最低消費金額</label>
              <input type="number" class="form-control" v-model.number="formData.min_Spend" min="0">
            </div>
            <div class="mb-3">
              <label class="form-label">使用限制次數</label>
              <input type="number" class="form-control" v-model.number="formData.usage_Limit" min="1">
            </div>
            <div class="mb-3">
              <label class="form-label">開始時間</label>
              <input type="datetime-local" class="form-control" v-model="formData.start_At">
            </div>
            <div class="mb-3">
              <label class="form-label">結束時間</label>
              <input type="datetime-local" class="form-control" v-model="formData.expired_At">
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="formData.is_Active">
                <label class="form-check-label">啟用優惠券</label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
            <button type="button" class="btn btn-primary" @click="saveCoupon">
              {{ editingCoupon ? '更新' : '新增' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService.js'

export default {
  name: 'CouponManager',
  data() {
    return {
      showCouponModal: false,
      editingCoupon: null,
      coupons: [],
      filteredCoupons: [],
      loading: false,
      error: null,
      sellerId: null, // 從 API 動態獲取
      memberId: null,
      successfulApiPath: null, // 儲存成功的 API 路徑
      currentVendorInfo: null, // 儲存當前賣家資訊
      
      // 篩選條件
      filters: {
        status: '', // 'active', 'inactive', 'expired'
        discountType: '', // 'percentage', 'fixed'
        searchText: ''
      },
      
      // 分頁設定
      pagination: {
        currentPage: 1,
        itemsPerPage: 12,
        totalItems: 0,
        totalPages: 0
      },
      
      formData: {
        title: '',
        description: '',
        discount_Type: 'percentage',
        discount_Amount: 0,
        min_Spend: 0,
        usage_Limit: 100,
        start_At: '',
        expired_At: '',
        is_Active: true
      }
    }
  },
  computed: {
    currentVendor() {
      return this.currentVendorInfo || { name: `賣家 ${this.sellerId}`, email: '' }
    },
    
    // 優惠券統計
    couponStats() {
      const stats = {
        total: this.coupons.length,
        active: 0,
        inactive: 0,
        expired: 0
      }
      
      this.coupons.forEach(coupon => {
        if (this.isExpired(coupon)) {
          stats.expired++
        } else if (coupon.is_Active) {
          stats.active++
        } else {
          stats.inactive++
        }
      })
      
      return stats
    },
    
    // 分頁後的優惠券
    paginatedCoupons() {
      const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage
      const end = start + this.pagination.itemsPerPage
      return this.filteredCoupons.slice(start, end)
    }
  },
  async mounted() {
    await this.initializeSeller()
  },
  methods: {
    // 初始化賣家 ID
    async initializeSeller() {
      try {
        this.loading = true
        this.error = null

        // 1. 獲取會員 ID 和賣家狀態
        this.memberId = localStorage.getItem('memberId')
        const isSeller = localStorage.getItem('isSeller')
        
        if (!this.memberId) {
          throw new Error('請先登入才能查看優惠券')
        }

        if (isSeller !== 'true') {
          throw new Error('您需要先申請成為賣家並通過審核才能管理優惠券')
        }

        // 2. 使用 ApplySeller API 獲取正確的賣家 ID
        this.sellerId = parseInt(this.memberId) // fallback 值
        
        try {
          console.log('🔍 嘗試獲取賣家 ID...')
          
          const sellerIdResponse = await this.$api.get(`/api/ApplySeller/${this.memberId}/seller-id`)
          console.log('🔍 賣家 ID API 回應:', sellerIdResponse)
          
          if (sellerIdResponse.success && sellerIdResponse.data) {
            // 處理多種可能的回應格式
            let actualSellerId = null
            
            if (typeof sellerIdResponse.data === 'number') {
              actualSellerId = sellerIdResponse.data
            } else if (sellerIdResponse.data.sellerId) {
              actualSellerId = sellerIdResponse.data.sellerId
            } else if (sellerIdResponse.data.id) {
              actualSellerId = sellerIdResponse.data.id
            }
            
            if (actualSellerId && !isNaN(parseInt(actualSellerId))) {
              this.sellerId = parseInt(actualSellerId)
              console.log('✅ 獲取到正確的賣家 ID:', this.sellerId)
            } else {
              console.log('⚠️ API 回應中沒有有效的賣家 ID，使用會員 ID:', this.sellerId)
            }
          }
        } catch (sellerApiError) {
          console.log('❌ 獲取賣家 ID 時發生錯誤，使用會員 ID 作為賣家 ID:', this.sellerId)
          console.log('📋 錯誤詳情:', sellerApiError)
        }

        // 3. 設定基本賣家資訊
        this.currentVendorInfo = {
          id: this.sellerId,
          name: `賣家 ${this.sellerId}`,
          email: '',
          status: 'Active'
        }

        console.log('🎯 最終確定的賣家 ID:', this.sellerId)
        console.log('👤 賣家資訊:', this.currentVendorInfo)

        // 設置到 authService 中供其他服務使用
        authService.setCurrentSellerId(this.sellerId)

        // 4. 載入優惠券
        await this.loadCoupons()

      } catch (error) {
        console.error('❌ 初始化賣家失敗:', error)
        this.error = error.message || '初始化失敗，請確認您的賣家權限'
      } finally {
        this.loading = false
      }
    },

    async loadCoupons() {
      // 如果還沒初始化賣家 ID，先進行初始化
      if (!this.sellerId) {
        console.log('⚠️ 賣家 ID 尚未初始化，先進行初始化...')
        return await this.initializeSeller()
      }
      
      this.loading = true
      this.error = null
      
      try {
        console.log(`📊 載入賣家 ${this.sellerId} 的優惠券...`)
        
        // 嘗試多個可能的 API 路徑，把正確的路徑放在第一位
        const possiblePaths = [
          `/api/Coupons?sellerId=${this.sellerId}`,
          `/api/Coupons/seller/${this.sellerId}`,
          `/api/Coupons`,
          `/api/coupons/seller/${this.sellerId}`,
          `/api/coupons`
        ]
        
        let response = null
        let usedPath = ''
        
        // 測試每個可能的路徑
        for (const path of possiblePaths) {
          try {
            console.log(`🔍 測試 API 路徑: ${path}`)
            response = await fetch(path, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            })
            
            console.log(`� ${path} 回應狀態: ${response.status}`)
            
            if (response.ok) {
              usedPath = path
              console.log(`✅ 成功的 API 路徑: ${path}`)
              break
            }
          } catch (pathError) {
            console.log(`❌ ${path} 失敗: ${pathError.message}`)
            continue
          }
        }
        
        if (!response || !response.ok) {
          throw new Error(`所有 API 路徑都失敗了。最後嘗試的回應狀態: ${response?.status || 'unknown'}`)
        }
        
        console.log('✅ 成功的 API 路徑:', usedPath)
        console.log('🔗 API Response Status:', response.status)
        
        // 儲存成功的 API 路徑供其他方法使用
        this.successfulApiPath = usedPath
        
        // 先檢查回應內容
        const text = await response.text()
        console.log('📋 Raw API Response:', text)
        
        let data
        try {
          // 如果回應不為空，才嘗試解析 JSON
          const response_data = text ? JSON.parse(text) : {}
          console.log('✅ Parsed API Data:', response_data)
          
          // 檢查是否為包裝的回應格式
          if (response_data.success && response_data.data) {
            data = response_data.data
          } else if (Array.isArray(response_data)) {
            data = response_data
          } else {
            data = []
          }
          
          console.log('📦 提取的優惠券資料:', data)
          
          // 將後端的欄位轉換為前端使用的格式
          if (Array.isArray(data)) {
            data = data.map(coupon => ({
              id: coupon.Id || coupon.id,
              title: coupon.Title || coupon.title,
              description: coupon.Description || coupon.description,
              discount_Type: coupon.DiscountType || coupon.discountType || coupon.discount_Type,
              discount_Amount: coupon.DiscountAmount || coupon.discountAmount || coupon.discount_Amount,
              min_Spend: coupon.MinSpend || coupon.minSpend || coupon.min_Spend,
              max_Discount: coupon.MaxDiscount || coupon.maxDiscount || coupon.max_Discount,
              usage_Limit: coupon.UsageLimit || coupon.usageLimit || coupon.usage_Limit,
              used_Count: coupon.UsedCount || coupon.usedCount || coupon.used_Count,
              start_At: coupon.StartAt || coupon.startAt || coupon.start_At,
              expired_At: coupon.ExpiredAt || coupon.expiredAt || coupon.expired_At,
              is_Active: coupon.IsActive !== undefined ? coupon.IsActive : 
                        coupon.isActive !== undefined ? coupon.isActive : coupon.is_Active,
              sellers_Id: coupon.SellersId || coupon.sellersId || coupon.sellers_Id,
              created_At: coupon.CreatedAt || coupon.createdAt || coupon.created_At,
              updated_At: coupon.UpdatedAt || coupon.updatedAt || coupon.updated_At
            }))
            console.log('🔄 轉換後的資料:', data)
          }
        } catch (jsonError) {
          console.error('❌ JSON Parse Error:', jsonError)
          throw new Error('無法解析服務器回應')
        }
        
        this.coupons = Array.isArray(data) ? data : []
        console.log(`✅ 成功載入 ${this.coupons.length} 筆優惠券`)
        
      } catch (error) {
        console.error('❌ 載入優惠券失敗:', error)
        this.error = error.message || '載入優惠券失敗，請稍後再試'
      } finally {
        this.loading = false
      }
    },
    
    showModal() {
      this.resetFormData()
      this.editingCoupon = null
      this.showCouponModal = true
    },
    
    closeModal() {
      this.showCouponModal = false
      this.editingCoupon = null
      this.resetFormData()
    },

    resetFormData() {
      this.formData = {
        title: '',
        description: '',
        discount_Type: 'percentage',
        discount_Amount: 0,
        min_Spend: 0,
        usage_Limit: 100,
        start_At: '',
        expired_At: '',
        is_Active: true
      }
    },
    
    editCoupon(coupon) {
      this.editingCoupon = coupon
      this.formData = { ...coupon }
      this.showCouponModal = true
    },
    
    async saveCoupon() {
      try {
        this.loading = true
        
        // 驗證必填欄位
        if (!this.formData.title || !this.formData.title.trim()) {
          throw new Error('請輸入優惠券標題')
        }
        
        if (!this.formData.discount_Amount || this.formData.discount_Amount <= 0) {
          throw new Error('請輸入有效的折扣金額')
        }
        
        // 準備 API 資料，使用後端期望的 PascalCase 欄位名稱
        const couponData = {
          Title: this.formData.title.trim(),
          Description: this.formData.description || '',
          DiscountType: this.formData.discount_Type,
          DiscountAmount: Number(this.formData.discount_Amount),
          MinSpend: Number(this.formData.min_Spend) || 0,
          UsageLimit: Number(this.formData.usage_Limit) || 100,
          StartAt: this.formData.start_At ? new Date(this.formData.start_At).toISOString() : new Date().toISOString(),
          ExpiredAt: this.formData.expired_At ? new Date(this.formData.expired_At).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          IsActive: Boolean(this.formData.is_Active),
          SellersId: Number(this.sellerId),
          UsedCount: 0
        }
        
        console.log('📋 準備發送的優惠券資料:', JSON.stringify(couponData, null, 2))
        
        if (this.editingCoupon) {
          // 更新現有優惠券
          console.log('📝 更新優惠券:', this.editingCoupon.id)
          
          const response = await fetch(`/api/Coupons/${this.editingCoupon.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(couponData)
          })
          
          console.log('📋 更新回應狀態:', response.status)
          
          if (!response.ok) {
            // 嘗試讀取錯誤訊息
            const errorText = await response.text()
            console.error('❌ 更新錯誤回應:', errorText)
            throw new Error(`更新失敗 (HTTP ${response.status}): ${errorText}`)
          }
          
          alert('✅ 優惠券已更新')
        } else {
          // 新增優惠券
          console.log('➕ 新增優惠券:', couponData)
          
          const response = await fetch('/api/Coupons', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(couponData)
          })
          
          console.log('📋 新增回應狀態:', response.status)
          
          if (!response.ok) {
            // 嘗試讀取錯誤訊息
            const errorText = await response.text()
            console.error('❌ 新增錯誤回應:', errorText)
            throw new Error(`新增失敗 (HTTP ${response.status}): ${errorText}`)
          }
          
          const responseData = await response.text()
          console.log('✅ 新增成功回應:', responseData)
          
          alert('✅ 優惠券已新增')
        }
        
        this.closeModal()
        // 重新載入優惠券列表
        await this.loadCoupons()
        
      } catch (error) {
        console.error('❌ 儲存優惠券失敗:', error)
        alert('❌ 儲存失敗：' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    async deleteCoupon(coupon) {
      if (!confirm(`確定要刪除優惠券「${coupon.title}」嗎？此操作無法復原。`)) {
        return
      }
      
      try {
        this.loading = true
        
        console.log('🗑️ 刪除優惠券:', coupon.id)
        
        const response = await fetch(`/api/Coupons/${coupon.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`刪除失敗 (HTTP ${response.status})`)
        }
        
        alert('✅ 優惠券已刪除')
        
        // 重新載入優惠券列表
        await this.loadCoupons()
        
      } catch (error) {
        console.error('❌ 刪除優惠券失敗:', error)
        alert('❌ 刪除失敗：' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    // 新增的篩選和格式化方法
    applyFilters() {
      let filtered = [...this.coupons]
      
      // 狀態篩選
      if (this.filters.status) {
        filtered = filtered.filter(coupon => {
          switch (this.filters.status) {
            case 'active':
              return coupon.is_Active && !this.isExpired(coupon)
            case 'inactive':
              return !coupon.is_Active && !this.isExpired(coupon)
            case 'expired':
              return this.isExpired(coupon)
            default:
              return true
          }
        })
      }
      
      // 折扣類型篩選
      if (this.filters.discountType) {
        filtered = filtered.filter(coupon => coupon.discount_Type === this.filters.discountType)
      }
      
      // 文字搜尋
      if (this.filters.searchText) {
        const searchLower = this.filters.searchText.toLowerCase()
        filtered = filtered.filter(coupon => 
          coupon.title.toLowerCase().includes(searchLower) ||
          (coupon.description && coupon.description.toLowerCase().includes(searchLower))
        )
      }
      
      this.filteredCoupons = filtered
      this.pagination.totalItems = filtered.length
      this.pagination.totalPages = Math.ceil(filtered.length / this.pagination.itemsPerPage)
      this.pagination.currentPage = 1 // 重置到第一頁
    },
    
    // 分頁方法
    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.currentPage = page
      }
    },
    
    getPageNumbers() {
      const pages = []
      const total = this.pagination.totalPages
      const current = this.pagination.currentPage
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages.filter(page => page !== '...')
    },
    
    // 重新整理
    refreshCoupons() {
      this.loadCoupons()
    },
    
    // 格式化相關方法
    formatCurrency(amount) {
      if (!amount) return '0'
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    
    formatDateTime(dateTime) {
      if (!dateTime) return '未設定'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    isExpired(coupon) {
      if (!coupon.expired_At) return false
      return new Date(coupon.expired_At) < new Date()
    },
    
    getRemainingUsage(coupon) {
      if (!coupon.usage_Limit) return '無限制'
      const remaining = coupon.usage_Limit - (coupon.used_Count || 0)
      return remaining > 0 ? remaining : 0
    },
    
    // 樣式相關方法
    getCouponCardClass(coupon) {
      if (this.isExpired(coupon)) return 'border-danger'
      if (!coupon.is_Active) return 'border-secondary'
      return 'border-success'
    },
    
    getCouponHeaderClass(coupon) {
      if (this.isExpired(coupon)) return 'bg-danger text-white'
      if (!coupon.is_Active) return 'bg-secondary text-white'
      return 'bg-success text-white'
    },
    
    getCouponDiscountClass(coupon) {
      if (this.isExpired(coupon)) return 'text-danger'
      if (!coupon.is_Active) return 'text-secondary'
      return coupon.discount_Type === 'percentage' ? 'text-success' : 'text-primary'
    },
    
    getCouponStatusBadge(coupon) {
      if (this.isExpired(coupon)) return 'bg-danger'
      if (!coupon.is_Active) return 'bg-secondary'
      return 'bg-success'
    },
    
    getCouponStatusIcon(coupon) {
      if (this.isExpired(coupon)) return 'fa-calendar-times'
      if (!coupon.is_Active) return 'fa-pause-circle'
      return 'fa-check-circle'
    },
    
    getCouponStatusText(coupon) {
      if (this.isExpired(coupon)) return '已過期'
      if (!coupon.is_Active) return '停用中'
      return '啟用中'
    },
    
    // 優惠券操作
    async toggleCouponStatus(coupon) {
      if (this.isExpired(coupon)) {
        alert('已過期的優惠券無法修改狀態')
        return
      }
      
      const newStatus = !coupon.is_Active
      const actionText = newStatus ? '啟用' : '停用'
      
      // 確認操作
      if (!confirm(`確定要${actionText}此優惠券嗎？`)) {
        return
      }
      
      try {
        this.loading = true
        
        // 準備更新數據（只更新狀態，保持其他欄位不變）
        // 使用後端期望的 PascalCase 欄位格式
        const updateData = {
          Title: coupon.title,
          Description: coupon.description || '',
          DiscountType: coupon.discount_Type,
          DiscountAmount: Number(coupon.discount_Amount),
          MinSpend: Number(coupon.min_Spend) || 0,
          MaxDiscount: Number(coupon.max_Discount) || 0,
          UsageLimit: Number(coupon.usage_Limit) || 100,
          UsedCount: Number(coupon.used_Count) || 0,
          StartAt: coupon.start_At ? new Date(coupon.start_At).toISOString() : new Date().toISOString(),
          ExpiredAt: coupon.expired_At ? new Date(coupon.expired_At).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          IsActive: Boolean(newStatus), // 只改變狀態
          SellersId: Number(this.sellerId)
        }
        
        console.log(`🔄 ${actionText}優惠券:`, coupon.id, '新狀態:', newStatus)
        
        const response = await fetch(`/api/Coupons/${coupon.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(updateData)
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`${actionText}失敗 (HTTP ${response.status}): ${errorText}`)
        }
        
        // 更新本地狀態
        coupon.is_Active = newStatus
        
        // 重新應用篩選器以更新統計
        this.applyFilters()
        
        console.log(`✅ 優惠券已${actionText}`)
        
      } catch (error) {
        console.error(`❌ ${actionText}優惠券失敗:`, error)
        alert(`❌ ${actionText}失敗：` + error.message)
      } finally {
        this.loading = false
      }
    },
    
    duplicateCoupon(coupon) {
      const duplicated = { ...coupon }
      duplicated.id = null
      duplicated.title = `${coupon.title} (副本)`
      duplicated.used_Count = 0
      
      // 設定新的開始和結束時間
      const now = new Date()
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      duplicated.start_At = now.toISOString().slice(0, 16)
      duplicated.expired_At = nextMonth.toISOString().slice(0, 16)
      
      this.formData = duplicated
      this.editingCoupon = null
      this.showCouponModal = true
    }
  },
  
  watch: {
    coupons() {
      this.applyFilters()
    }
  }
}
</script>

<style scoped>
.coupon-manager {
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 優惠券卡片樣式 */
.card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.card-header {
  border-bottom: none;
  padding: 1rem;
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  border-top: 1px solid rgba(0,0,0,0.1);
  padding: 1rem;
}

/* 折扣顯示 */
.discount-display {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

/* 優惠券詳情 */
.coupon-details {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.coupon-details .row div {
  border-right: 1px solid #dee2e6;
}

.coupon-details .row div:last-child {
  border-right: none;
}

/* 時間資訊 */
.time-info {
  background-color: #fff;
  border-radius: 6px;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
}

/* 狀態徽章 */
.badge {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
}

/* 按鈕樣式 */
.btn-sm {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
}

/* 統計卡片 */
.card.text-center .card-body {
  padding: 2rem 1rem;
}

.card.text-center i {
  margin-bottom: 1rem;
}

/* 篩選器樣式 */
.form-control, .form-select {
  border-radius: 8px;
  border: 1px solid #ced4da;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* 分頁樣式 */
.pagination {
  margin-bottom: 0;
}

.page-link {
  border-radius: 8px;
  margin: 0 2px;
  border: 1px solid #dee2e6;
  color: #6c757d;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.page-link:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .coupon-manager {
    padding: 1rem !important;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .discount-display {
    padding: 0.75rem;
  }
  
  .btn {
    margin-bottom: 0.5rem;
    width: 100%;
  }
  
  .btn-sm {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    width: auto;
    margin-bottom: 0.25rem;
  }
  
  .coupon-actions {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (max-width: 576px) {
  .col-md-3, .col-md-2 {
    margin-bottom: 1rem;
  }
  
  .d-flex.align-items-end {
    align-items: stretch !important;
    flex-direction: column;
  }
  
  .pagination {
    justify-content: center !important;
    flex-wrap: wrap;
  }
  
  .page-item {
    margin-bottom: 0.25rem;
  }
}

/* 動畫效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeIn 0.5s ease-out;
}

/* 空狀態樣式 */
.text-center.py-5 {
  background: white;
  border-radius: 12px;
  margin: 2rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Loading 狀態 */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* 錯誤狀態 */
.alert {
  border-radius: 8px;
  border: none;
}

.alert-danger {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
}

.alert-info {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
  color: #0c5460;
}
</style>

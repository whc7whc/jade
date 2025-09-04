<template>
  <div class="purchase-list-container">
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
              <li class="breadcrumb-item active">購買清單</li>
            </ol>
          </nav>
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h2 mb-0">
              <i class="fas fa-list-ul me-2 text-primary"></i>我的訂單
            </h1>
          </div>
        </div>
      </div>
    </div>

    <!-- 訂單內容 -->
    <div class="container my-5">
      <!-- 載入中狀態 -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>載入訂單中...</p>
      </div>

      <!-- 錯誤消息 -->
      <div v-if="errorMessage && !loading" class="alert alert-warning" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ errorMessage }}
      </div>

      <!-- 搜尋和篩選 -->
      <div v-if="!loading" class="search-box">
        <div class="row align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="搜尋訂單編號或商品名稱" 
                v-model="searchQuery"
                @input="onSearchInput"
              >
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="statusFilter" @change="applyFilters">
              <option value="">所有狀態</option>
              <option value="pending">待付款</option>
              <option value="paid">已付款</option>
              <option value="shipped">已出貨</option>
              <option value="delivered">已送達</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="dateFilter" @change="applyFilters">
              <option value="">所有時間</option>
              <option value="7">最近7天</option>
              <option value="30">最近30天</option>
              <option value="90">最近3個月</option>
              <option value="365">最近一年</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 狀態篩選標籤 -->
      <div v-if="!loading" class="filter-tabs">
        <button 
          class="filter-tab" 
          :class="{ active: activeTab === '' }"
          @click="filterByStatus('')"
        >
          全部
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeTab === 'pending' }"
          @click="filterByStatus('pending')"
        >
          待付款
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeTab === 'paid' }"
          @click="filterByStatus('paid')"
        >
          已付款
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeTab === 'shipped' }"
          @click="filterByStatus('shipped')"
        >
          已出貨
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeTab === 'delivered' }"
          @click="filterByStatus('delivered')"
        >
          已送達
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeTab === 'completed' }"
          @click="filterByStatus('completed')"
        >
          已完成
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeTab === 'cancelled' }"
          @click="filterByStatus('cancelled')"
        >
          已取消
        </button>
      </div>

      <!-- 訂單列表 -->
      <div v-if="!loading" class="orders-list">
        <!-- 沒有訂單 -->
        <div v-if="orders.length === 0" class="no-orders">
          <div class="no-orders-icon">
            <i class="fas fa-shopping-bag"></i>
          </div>
          <h3>{{ searchQuery || statusFilter || dateFilter ? '沒有找到符合條件的訂單' : '您還沒有任何訂單' }}</h3>
          <p>{{ searchQuery || statusFilter || dateFilter ? '請嘗試調整搜尋條件' : '開始購物，建立您的第一筆訂單吧！' }}</p>
          <button v-if="!searchQuery && !statusFilter && !dateFilter" @click="goShopping" class="btn btn-primary">
            <i class="fas fa-shopping-cart"></i>
            開始購物
          </button>
        </div>

        <!-- 訂單卡片 -->
        <div 
          v-for="order in orders" 
          :key="order.orderNumber"
          class="order-card"
        >
          <div class="order-header">
            <div class="row align-items-center">
              <div class="col-md-3">
                <strong>訂單編號: {{ formatOrderNumber(order.orderNumber) }}</strong><br>
                <small class="text-muted">{{ formatDate(order.createdAt) }}</small>
              </div>
              <div class="col-md-2">
                <span class="status-badge" :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
              <div class="col-md-2">
                <strong>總金額: NT$ {{ formatPrice(order.totalAmount) }}</strong>
                <div v-if="order.trackingNumber" class="text-muted small">
                  <i class="fas fa-truck"></i> {{ order.trackingNumber }}
                </div>
              </div>
              <div class="col-md-5 text-end">
                <div class="order-actions">
                  <button 
                    @click="viewOrderDetail(order)" 
                    class="btn btn-outline-primary btn-sm-custom"
                  >
                    <i class="fas fa-eye"></i>
                    查看詳情
                  </button>
                  <button 
                    v-if="order.status === 'pending'" 
                    @click="payOrder(order.orderNumber)" 
                    class="btn btn-success btn-sm-custom"
                  >
                    <i class="fas fa-credit-card"></i>
                    立即付款
                  </button>
                  <button 
                    v-if="order.status === 'delivered'" 
                    @click="completeOrder(order)" 
                    class="btn btn-success btn-sm-custom"
                  >
                    <i class="fas fa-check-circle"></i>
                    完成訂單
                  </button>
                  <button 
                    v-if="['pending', 'paid'].includes(order.status)" 
                    @click="cancelOrder(order)" 
                    class="btn btn-outline-danger btn-sm-custom"
                  >
                    <i class="fas fa-times"></i>
                    取消訂單
                  </button>
                  <button 
                    v-if="order.status === 'delivered'" 
                    @click="downloadInvoice(order.orderNumber)" 
                    class="btn btn-outline-secondary btn-sm-custom"
                  >
                    <i class="fas fa-download"></i>
                    下載發票
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="order-body">
            <!-- 商品列表 -->
            <div 
              v-for="item in order.items" 
              :key="item.id"
              class="product-item"
            >
              <img 
                :src="item.productImage || '/images/default-product.png'" 
                :alt="item.productName" 
                class="product-image"
                @error="handleImageError"
              >
              <div class="flex-grow-1">
                <h6 class="mb-1">{{ item.productName }}</h6>
                <small class="text-muted" v-if="item.specifications">
                  {{ item.specifications }}
                </small>
              </div>
              <div class="text-end">
                <div>x{{ item.quantity }}</div>
                <div class="fw-bold text-primary">NT$ {{ formatPrice(item.price) }}</div>
              </div>
            </div>
            
            <!-- 訂單進度 -->
            <div v-if="order.status !== 'cancelled'" class="timeline">
              <div class="timeline-item">
                <div class="timeline-icon" :class="getTimelineClass(order.status, 'created')">
                  <i class="fas fa-check"></i>
                </div>
                <div>
                  <strong>訂單已建立</strong>
                  <div class="text-muted">{{ formatDate(order.createdAt) }}</div>
                </div>
              </div>
              
              <div v-if="order.status !== 'pending'" class="timeline-item">
                <div class="timeline-icon" :class="getTimelineClass(order.status, 'paid')">
                  <i class="fas fa-credit-card"></i>
                </div>
                <div>
                  <strong>付款完成</strong>
                  <div class="text-muted" v-if="order.paidAt">{{ formatDate(order.paidAt) }}</div>
                </div>
              </div>
              
              <div v-if="['shipped', 'delivered', 'completed'].includes(order.status)" class="timeline-item">
                <div class="timeline-icon" :class="getTimelineClass(order.status, 'shipped')">
                  <i class="fas fa-truck"></i>
                </div>
                <div>
                  <strong>商品已出貨</strong>
                  <div class="text-muted" v-if="order.shippedAt">{{ formatDate(order.shippedAt) }}</div>
                  <div class="text-muted small" v-if="order.trackingNumber">
                    追蹤號碼: {{ order.trackingNumber }}
                  </div>
                </div>
              </div>
              
              <div v-if="['delivered', 'completed'].includes(order.status)" class="timeline-item">
                <div class="timeline-icon" :class="getTimelineClass(order.status, 'delivered')">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div>
                  <strong>配送完成</strong>
                  <div class="text-muted" v-if="order.deliveredAt">{{ formatDate(order.deliveredAt) }}</div>
                </div>
              </div>
              
              <div v-if="order.status === 'completed'" class="timeline-item">
                <div class="timeline-icon timeline-completed">
                  <i class="fas fa-star"></i>
                </div>
                <div>
                  <strong>交易完成</strong>
                  <div class="text-muted" v-if="order.completedAt">{{ formatDate(order.completedAt) }}</div>
                </div>
              </div>
            </div>
            
            <!-- 付款提醒 -->
            <div v-if="order.status === 'pending'" 
                 class="alert mb-0 mt-2"
                 :class="{
                   'alert-danger': formatPaymentDeadline(order.paymentDeadline).isExpired,
                   'alert-warning': formatPaymentDeadline(order.paymentDeadline).isUrgent && !formatPaymentDeadline(order.paymentDeadline).isExpired,
                   'alert-info': !formatPaymentDeadline(order.paymentDeadline).isUrgent && !formatPaymentDeadline(order.paymentDeadline).isExpired
                 }">
              <i class="fas fa-clock"></i> 
              <span v-if="order.paymentDeadline">
                <span v-if="formatPaymentDeadline(order.paymentDeadline).isExpired">
                  付款期限已過期（{{ formatPaymentDeadline(order.paymentDeadline).text }}），訂單可能已被取消
                </span>
                <span v-else-if="formatPaymentDeadline(order.paymentDeadline).isUrgent">
                  ⚠️ 緊急！請於 <strong>{{ formatPaymentDeadline(order.paymentDeadline).text }}</strong> 前完成付款
                  （剩餘 {{ formatPaymentDeadline(order.paymentDeadline).hoursLeft }} 小時）
                </span>
                <span v-else>
                  請於 <strong>{{ formatPaymentDeadline(order.paymentDeadline).text }}</strong> 前完成付款，逾期訂單將自動取消
                </span>
              </span>
              <span v-else>
                請儘速完成付款，以免訂單被取消
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分頁 -->
      <nav v-if="!loading && totalPages > 1" aria-label="訂單分頁">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" @click="changePage(currentPage - 1)" href="#">上一頁</a>
          </li>
          <li 
            v-for="page in visiblePages" 
            :key="page"
            class="page-item" 
            :class="{ active: page === currentPage }"
          >
            <a class="page-link" @click="changePage(page)" href="#">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" @click="changePage(currentPage + 1)" href="#">下一頁</a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- 訂單詳情Modal -->
    <div class="modal fade" id="orderDetailModal" tabindex="-1" ref="orderDetailModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-receipt"></i> 
              訂單詳情 - {{ formatOrderNumber(selectedOrder?.orderNumber) }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedOrder">
            <!-- 訂單基本資訊 -->
            <div class="row">
              <div class="col-md-6">
                <h6>訂單資訊</h6>
                <p><strong>訂單編號:</strong> {{ formatOrderNumber(selectedOrder.orderNumber) }}</p>
                <p><strong>下單時間:</strong> {{ formatDate(selectedOrder.createdAt) }}</p>
                <p><strong>訂單狀態:</strong> {{ getStatusText(selectedOrder.status) }}</p>
                <p><strong>付款方式:</strong> {{ getPaymentMethodText(selectedOrder.paymentMethod) }}</p>
                <p><strong>總金額:</strong> NT$ {{ formatPrice(selectedOrder.totalAmount) }}</p>
              </div>
              <div class="col-md-6">
                <h6>收貨資訊</h6>
                <p><strong>收件人:</strong> {{ selectedOrder.recipientName }}</p>
                <p><strong>聯絡電話:</strong> {{ selectedOrder.phoneNumber }}</p>
                <p><strong>收貨地址:</strong> {{ selectedOrder.shippingAddress }}</p>
                <p><strong>配送方式:</strong> {{ getDeliveryMethodText(selectedOrder.deliveryMethod) }}</p>
                <p v-if="selectedOrder.trackingNumber">
                  <strong>追蹤號碼:</strong> {{ selectedOrder.trackingNumber }}
                </p>
              </div>
            </div>
            
            <!-- 出貨信息 -->
            <div v-if="['shipped', 'delivered', 'completed'].includes(selectedOrder.status)" class="mt-3">
              <hr>
              <h6><i class="fas fa-truck"></i> 出貨信息</h6>
              <div class="row">
                <div class="col-md-6">
                  <p v-if="selectedOrder.shippedAt">
                    <strong>出貨時間:</strong> {{ formatDate(selectedOrder.shippedAt) }}
                  </p>
                  <p v-if="selectedOrder.trackingNumber">
                    <strong>追蹤號碼:</strong> 
                    <span class="badge bg-primary">{{ selectedOrder.trackingNumber }}</span>
                  </p>
                </div>
                <div class="col-md-6">
                  <p v-if="selectedOrder.deliveredAt">
                    <strong>送達時間:</strong> {{ formatDate(selectedOrder.deliveredAt) }}
                  </p>
                  <p v-if="selectedOrder.completedAt">
                    <strong>完成時間:</strong> {{ formatDate(selectedOrder.completedAt) }}
                  </p>
                </div>
              </div>
              
              <!-- 物流追蹤按鈕 -->
              <div v-if="selectedOrder.trackingNumber" class="text-center mt-2">
                <button 
                  @click="trackShipment(selectedOrder.trackingNumber)" 
                  class="btn btn-outline-primary"
                >
                  <i class="fas fa-route"></i> 查看物流狀態
                </button>
              </div>
            </div>
            
            <hr>
            
            <!-- 商品清單 -->
            <h6>商品清單</h6>
            <div 
              v-for="item in selectedOrder.items" 
              :key="item.id"
              class="d-flex justify-content-between align-items-center py-2 border-bottom"
            >
              <div class="d-flex align-items-center">
                <img 
                  :src="item.productImage || '/images/default-product.png'" 
                  :alt="item.productName"
                  style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 12px;"
                  @error="handleImageError"
                >
                <div>
                  <h6 class="mb-1">{{ item.productName }}</h6>
                  <small class="text-muted">{{ item.specifications }}</small>
                </div>
              </div>
              <div class="text-end">
                <div>× {{ item.quantity }}</div>
                <div class="fw-bold">NT$ {{ formatPrice(item.price) }}</div>
              </div>
            </div>
            
            <!-- 金額明細 -->
            <div class="mt-3">
              <div class="d-flex justify-content-between">
                <span>商品小計:</span>
                <span>NT$ {{ formatPrice(selectedOrder.subtotal) }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span>運費:</span>
                <span>NT$ {{ formatPrice(selectedOrder.shippingFee) }}</span>
              </div>
              <div v-if="selectedOrder.discount > 0" class="d-flex justify-content-between text-success">
                <span>優惠折扣:</span>
                <span>-NT$ {{ formatPrice(selectedOrder.discount) }}</span>
              </div>
              <div v-if="selectedOrder.processingFee > 0" class="d-flex justify-content-between">
                <span>付款手續費:</span>
                <span>NT$ {{ formatPrice(selectedOrder.processingFee) }}</span>
              </div>
              <div class="d-flex justify-content-between fw-bold border-top pt-2">
                <span>總計:</span>
                <span>NT$ {{ formatPrice(selectedOrder.totalAmount) }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
            <button 
              v-if="selectedOrder?.status === 'pending'" 
              @click="payOrder(selectedOrder.orderNumber)" 
              class="btn btn-success"
            >
              立即付款
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatPrice, handleImageError } from '@/utils/cartUtils'
import orderService from '@/services/orderService'

export default {
  name: "PurchaseListView",
  data() {
    return {
      loading: true,
      orders: [],
      searchQuery: '',
      statusFilter: '',
      dateFilter: '',
      activeTab: '',
      selectedOrder: null,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      totalCount: 0,
      
      // 錯誤狀態
      errorMessage: '',
      
      // 會員ID
      memberId: null,
      
      // 防抖計時器
      searchTimer: null
    }
  },

  computed: {
    visiblePages() {
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)
      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },

  async mounted() {
    console.log('🔄 PurchaseListView 組件已掛載')
    this.memberId = this.getMemberId()
    await this.loadOrders()
  },

  beforeUnmount() {
    // 清理防抖計時器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  },

  methods: {
    formatPrice,
    handleImageError,

    // 格式化訂單編號
    formatOrderNumber(orderNumber) {
      if (!orderNumber) return '#未知'
      
      // 生成格式: #ORD + 年月日 + 3位序號
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const sequence = String(orderNumber).padStart(3, '0')
      
      return `#ORD${year}${month}${day}${sequence}`
    },

    // 獲取會員ID
    getMemberId() {
      // 優先從 localStorage 直接獲取 memberId
      const directMemberId = localStorage.getItem('memberId')
      if (directMemberId && directMemberId !== 'null' && directMemberId !== '' && directMemberId !== 'undefined') {
        const parsedId = parseInt(directMemberId, 10)
        if (!isNaN(parsedId) && parsedId > 0) {
          return parsedId
        }
      }
      
      // 備用：從用戶資料中獲取
      try {
        const currentUser = localStorage.getItem('currentUser')
        if (currentUser) {
          const user = JSON.parse(currentUser)
          return user.id || user.memberId
        }
      } catch (error) {
        console.warn('解析用戶資料失敗:', error)
      }
      
      return null
    },

    async loadOrders() {
      try {
        this.loading = true
        this.errorMessage = ''
        
        this.memberId = this.getMemberId()
        if (!this.memberId) {
          this.errorMessage = '請先登入會員'
          this.orders = []
          return
        }
        
        console.log('🔍 載入會員訂單，會員 ID:', this.memberId)
        
        // 調用真實 API
        const params = {
          status: this.statusFilter,
          page: this.currentPage,
          pageSize: this.pageSize,
          search: this.searchQuery,
          days: this.dateFilter ? parseInt(this.dateFilter) : undefined
        }
        
        const result = await orderService.getMemberOrders(this.memberId, params)
        
        if (result.success && result.data) {
          console.log('✅ 成功載入訂單:', result.data)
          this.orders = result.data.orders || []
          this.totalCount = result.data.totalCount || 0
          this.totalPages = result.data.totalPages || 1
          this.currentPage = result.data.page || 1
        } else {
          console.warn('⚠️ API 回應失敗:', result.error)
          // 如果 API 失敗，使用模擬數據作為備用
          const mockData = orderService.getMockOrders()
          this.orders = mockData
          this.totalCount = mockData.length
          this.calculatePagination()
          
          this.errorMessage = '載入訂單失敗，目前顯示模擬數據'
        }
        
      } catch (error) {
        console.error('❌ 載入訂單異常:', error)
        
        // 錯誤時使用模擬數據
        const mockData = orderService.getMockOrders()
        this.orders = mockData
        this.totalCount = mockData.length
        this.calculatePagination()
        
        this.errorMessage = '網路連線異常，目前顯示模擬數據'
      } finally {
        this.loading = false
      }
    },

    filterByStatus(status) {
      this.activeTab = status
      this.statusFilter = status
      this.onStatusFilter()
    },

    calculatePagination() {
      this.totalPages = Math.ceil(this.totalCount / this.pageSize)
      if (this.currentPage > this.totalPages) {
        this.currentPage = Math.max(1, this.totalPages)
      }
    },

    async changePage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page
        await this.loadOrders()
      }
    },

    async applyFilters() {
      this.currentPage = 1
      await this.loadOrders()
    },

    // 搜尋輸入處理（防抖）
    onSearchInput() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.applyFilters()
      }, 300) // 300ms 防抖延遲
    },

    async onSearch() {
      await this.applyFilters()
    },

    async onStatusFilter() {
      await this.applyFilters()
    },

    async onDateFilter() {
      await this.applyFilters()
    },

    formatDate(dateString) {
      if (!dateString) {
        return '未設定'
      }
      
      const date = new Date(dateString)
      
      // 檢查是否為有效日期
      if (isNaN(date.getTime())) {
        return '無效日期'
      }
      
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // 格式化付款期限，帶有顏色提示
    formatPaymentDeadline(dateString) {
      if (!dateString) {
        return { text: '未設定', isUrgent: false }
      }
      
      const deadline = new Date(dateString)
      const now = new Date()
      
      if (isNaN(deadline.getTime())) {
        return { text: '無效日期', isUrgent: false }
      }
      
      const timeDiff = deadline.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 3600)
      
      const text = deadline.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      // 如果剩餘時間少於24小時，標記為緊急
      const isUrgent = hoursDiff < 24 && hoursDiff > 0
      const isExpired = timeDiff < 0
      
      return { 
        text, 
        isUrgent,
        isExpired,
        hoursLeft: Math.max(0, Math.ceil(hoursDiff))
      }
    },

    getStatusText(status) {
      const statusMap = {
        'pending': '待付款',
        'paid': '已付款',
        'shipped': '已出貨',
        'delivered': '已送達',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    },

    getStatusClass(status) {
      return `status-${status}`
    },

    getPaymentMethodText(method) {
      const methodMap = {
        'credit': '信用卡',
        'transfer': '銀行轉帳',
        'cod': '貨到付款',
        'linepay': 'LINE Pay'
      }
      return methodMap[method] || method
    },

    getDeliveryMethodText(method) {
      const methodMap = {
        'HOME_TCAT': '黑貓宅急便',
        'UNIMART': '7-ELEVEN 超商取貨',
        'FAMI': '全家便利商店取貨'
      }
      return methodMap[method] || method
    },

    getTimelineClass(orderStatus, stage) {
      const statusOrder = ['created', 'paid', 'shipped', 'delivered', 'completed']
      const currentIndex = statusOrder.indexOf(this.getOrderStage(orderStatus))
      const stageIndex = statusOrder.indexOf(stage)
      
      if (stageIndex <= currentIndex) {
        return 'timeline-completed'
      } else if (stageIndex === currentIndex + 1) {
        return 'timeline-current'
      } else {
        return 'timeline-pending'
      }
    },

    getOrderStage(status) {
      const stageMap = {
        'pending': 'created',
        'paid': 'paid',
        'shipped': 'shipped',
        'delivered': 'delivered',
        'completed': 'completed',
        'cancelled': 'created'
      }
      return stageMap[status] || 'created'
    },

    async viewOrderDetail(order) {
      try {
        console.log('🔍 查看訂單詳細資料:', order.orderNumber)
        console.log('🆔 使用會員ID:', this.memberId)
        
        // 調用 API 獲取完整訂單詳細資料，傳遞 memberId
        const result = await orderService.getOrderDetail(order.id, this.memberId)
        
        if (result.success && result.data) {
          this.selectedOrder = result.data
          console.log('✅ 成功獲取訂單詳細資料:', this.selectedOrder)
        } else {
          // 如果 API 失敗，使用當前訂單數據
          this.selectedOrder = order
          console.warn('⚠️ 獲取訂單詳細資料失敗，使用列表數據')
        }
        
        // 顯示模態視窗
        const modal = new bootstrap.Modal(this.$refs.orderDetailModal)
        modal.show()
        
      } catch (error) {
        console.error('❌ 查看訂單詳細資料失敗:', error)
        this.$swal.fire('錯誤', '無法載入訂單詳細資料', 'error')
      }
    },

    payOrder(orderNumber) {
      this.$swal.fire({
        title: '確認付款',
        text: `確定要為訂單 #${orderNumber} 進行付款嗎？`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '確認付款',
        cancelButtonText: '取消'
      }).then((result) => {
        if (result.isConfirmed) {
          // TODO: 實作付款邏輯
          this.$swal.fire('成功', '正在跳轉到付款頁面...', 'success')
        }
      })
    },

    async cancelOrder(order) {
      try {
        const result = await this.$swal.fire({
          title: '確認取消訂單',
          text: `確定要取消訂單 ${order.orderNumber} 嗎？`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: '確認取消',
          cancelButtonText: '返回'
        })
        
        if (result.isConfirmed) {
          console.log('🔄 取消訂單:', order.orderNumber)
          
          // 修復：使用正確的參數調用 cancelOrder
          const cancelResult = await orderService.cancelOrder(order.id, this.memberId, '使用者取消')
          
          if (cancelResult.success) {
            this.$swal.fire('成功', '訂單已成功取消', 'success')
            await this.loadOrders() // 重新載入訂單列表
          } else {
            this.$swal.fire('失敗', cancelResult.error || '取消訂單失敗', 'error')
          }
        }
        
      } catch (error) {
        console.error('❌ 取消訂單失敗:', error)
        this.$swal.fire('錯誤', '取消訂單時發生錯誤', 'error')
      }
    },

    async completeOrder(order) {
      try {
        const result = await this.$swal.fire({
          title: '完成訂單',
          text: `確認要完成訂單 ${order.orderNumber} 嗎？完成後此訂單將無法再進行任何操作`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#28a745',
          cancelButtonColor: '#6c757d',
          confirmButtonText: '確認完成',
          cancelButtonText: '取消'
        })
        
        if (result.isConfirmed) {
          console.log('🏁 完成訂單:', order.orderNumber)
          
          // 使用 orderNumber 而不是 id，因為後端 API 期待訂單編號
          const completeResult = await orderService.completeOrder(order.orderNumber, this.memberId)
          
          if (completeResult.success) {
            this.$swal.fire('成功', '訂單已完成！感謝您的購買', 'success')
            await this.loadOrders() // 重新載入訂單列表
          } else {
            this.$swal.fire('失敗', completeResult.error || '完成訂單失敗', 'error')
          }
        }
        
      } catch (error) {
        console.error('❌ 完成訂單失敗:', error)
        this.$swal.fire('錯誤', '完成訂單時發生錯誤', 'error')
      }
    },

    trackShipment(trackingNumber) {
      if (!trackingNumber) {
        this.$swal.fire('提示', '沒有追蹤號碼', 'info')
        return
      }
      
      // 這裡可以根據不同的物流公司跳轉到對應的追蹤頁面
      this.$swal.fire({
        title: '物流追蹤',
        html: `
          <p>追蹤號碼: <strong>${trackingNumber}</strong></p>
          <p>請選擇查詢方式:</p>
          <div class="d-grid gap-2">
            <button class="btn btn-primary" onclick="window.open('https://www.t-cat.com.tw/inquiry.aspx', '_blank')">黑貓宅急便</button>
            <button class="btn btn-success" onclick="window.open('https://emap.pcsc.com.tw/', '_blank')">7-ELEVEN</button>
            <button class="btn btn-info" onclick="window.open('https://www.famiport.com.tw/', '_blank')">全家便利商店</button>
          </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: '關閉'
      })
    },

    downloadInvoice(orderNumber) {
      this.$swal.fire('準備下載', '正在準備發票下載...', 'info')
      // TODO: 實作發票下載邏輯
    },

    goShopping() {
      this.$router.push('/products')
    }
  }
}
</script>

<style scoped>
.purchase-list-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%);
}

/* 麵包屑導航樣式 */
.breadcrumb {
  background: transparent;
  padding: 0;
  margin-bottom: 1rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
  color: #6b7280;
  font-weight: 600;
}

.breadcrumb-item a {
  color: #4f46e5;
  text-decoration: none !important;
}

.breadcrumb-item a:hover {
  color: #3730a3;
  text-decoration: underline !important;
}

.breadcrumb-item.active {
  color: #6b7280;
  font-weight: 600;
}

/* 頁面標題樣式 */
.h2 {
  color: #1f2937;
  font-weight: 700;
}

/* 載入中樣式 */
.loading-container {
  text-align: center;
  padding: 3rem;
}

.spinner {
  border: 4px solid #f1f5f9;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 搜尋框樣式 */
.search-box {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

/* 篩選標籤樣式 */
.filter-tabs {
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 2rem;
}

.filter-tab {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  color: #6c757d;
  font-weight: 500;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
  cursor: pointer;
}

.filter-tab.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

.filter-tab:hover {
  color: #4f46e5;
}

/* 訂單卡片樣式 */
.order-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.order-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
  border-color: #c7d2fe;
}

.order-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

.order-body {
  padding: 1rem;
}

/* 狀態標籤樣式 */
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-paid {
  background: #d1ecf1;
  color: #0c5460;
}

.status-shipped {
  background: #d4edda;
  color: #155724;
}

.status-delivered {
  background: #c3e6cb;
  color: #155724;
}

.status-completed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

/* 商品項目樣式 */
.product-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1rem;
}

/* 操作按鈕樣式 */
.order-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-sm-custom {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 6px;
}

/* 時間軸樣式 */
.timeline {
  margin: 1rem 0;
}

.timeline-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timeline-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.timeline-completed {
  background: #28a745;
  color: white;
}

.timeline-current {
  background: #ffc107;
  color: white;
}

.timeline-pending {
  background: #e9ecef;
  color: #6c757d;
}

/* 沒有訂單時的樣式 */
.no-orders {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.no-orders-icon {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.no-orders h3 {
  color: #6c757d;
  margin-bottom: 1rem;
}

.no-orders p {
  color: #adb5bd;
  margin-bottom: 2rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .order-header .row > div {
    margin-bottom: 0.5rem;
  }
  
  .order-actions {
    justify-content: flex-start;
  }
  
  .btn-sm-custom {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>

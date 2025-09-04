<template>
  <div class="order-management">
    <!-- 標題 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2><i class="fas fa-clipboard-list me-2"></i>訂單管理</h2>
        <small class="text-muted">管理您店家的所有訂單</small>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="my-4">
      <div class="row">
        <div class="col-md-3" v-for="stat in stats" :key="stat.id">
          <div class="stats-card">
            <div class="stats-icon mx-auto" :class="stat.iconClass">
              <i :class="stat.icon"></i>
            </div>
            <h3 class="text-center mb-1">{{ stat.value }}</h3>
            <p class="text-center text-muted mb-0">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要內容 -->
    <div class="row">
        <div class="col-lg-9">
          <!-- 篩選器 -->
          <div class="filter-section">
            <h5 class="mb-3"><i class="fas fa-filter"></i> 篩選器</h5>
            <div class="row">
              <div class="col-md-3">
                <label class="form-label">訂單狀態</label>
                <select class="form-select" v-model="filters.status">
                  <option value="">所有狀態</option>
                  <option value="pending">待付款</option>
                  <option value="paid">已付款</option>
                  <option value="shipped">已出貨</option>
                  <option value="delivered">已送達</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">日期範圍</label>
                <select class="form-select" v-model="filters.dateRange">
                  <option value="">所有時間</option>
                  <option value="today">今天</option>
                  <option value="week">本週</option>
                  <option value="month">本月</option>
                  <option value="quarter">本季</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">搜尋</label>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="訂單編號、顧客姓名、商品名稱" 
                  v-model="filters.search"
                  @input="debouncedFilter"
                >
              </div>
              <div class="col-md-2">
                <label class="form-label">&nbsp;</label>
                <button class="btn btn-primary w-100" @click="filterOrders">
                  <i class="fas fa-search"></i> 搜尋
                </button>
              </div>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="quick-actions">
            <h5 class="mb-3"><i class="fas fa-bolt"></i> 快速操作</h5>
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-outline-warning btn-sm" @click="bulkAction('process')">
                <i class="fas fa-play"></i> 批量處理
              </button>
              <button class="btn btn-outline-info btn-sm" @click="bulkAction('ship')">
                <i class="fas fa-shipping-fast"></i> 批量出貨
              </button>
              <button class="btn btn-outline-success btn-sm" @click="exportOrders">
                <i class="fas fa-download"></i> 匯出訂單
              </button>
              <button class="btn btn-outline-primary btn-sm" @click="printLabels">
                <i class="fas fa-print"></i> 列印標籤
              </button>
            </div>
          </div>

          <!-- 訂單表格 -->
          <div class="order-table">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>
                      <input 
                        type="checkbox" 
                        class="form-check-input" 
                        v-model="selectAll"
                        @change="toggleSelectAll"
                      >
                    </th>
                    <th>訂單編號</th>
                    <th>顧客資訊</th>
                    <th>商品</th>
                    <th>金額</th>
                    <th>狀態</th>
                    <th>下單時間</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="order in filteredOrders" 
                    :key="order.orderNumber"
                    :class="getPriorityClass(order.priority)"
                  >
                    <td>
                      <input 
                        type="checkbox" 
                        class="form-check-input order-checkbox" 
                        :value="order.orderNumber"
                        v-model="selectedOrders"
                        @change="updateSelectAllState"
                      >
                    </td>
                    <td>
                      <strong>{{ formatOrderNumber(order.orderNumber) }}</strong><br>
                      <small class="text-muted" v-if="order.isUrgent">緊急訂單</small>
                    </td>
                    <td>
                      <strong>{{ order.memberInfo?.username || '未知客戶' }}</strong><br>
                      <small class="text-muted">{{ order.memberInfo?.email || '' }}</small>
                    </td>
                    <td>
                      <div class="product-list">
                        <div 
                          v-for="(item, index) in order.vendorItems" 
                          :key="item.id"
                          class="product-item mb-2"
                          :class="{ 'border-bottom': index < order.vendorItems.length - 1 }"
                        >
                          <div class="d-flex align-items-center">
                            <img 
                              :src="item.productImage || '/images/default-product.png'" 
                              :alt="item.productName" 
                              class="product-image me-2"
                              style="width: 50px; height: 50px; object-fit: cover;"
                            >
                            <div class="flex-grow-1">
                              <strong>{{ item.productName }}</strong><br>
                              <small class="text-muted">
                                數量: {{ item.quantity }} | 
                                單價: NT$ {{ item.unitPrice.toLocaleString() }}
                              </small>
                              <br>
                              <span class="badge" :class="getItemStatusClass(item)">
                                {{ getItemStatusText(item) }}
                              </span>
                            </div>
                            <div class="item-actions ms-2">
                              <!-- 商品級別的出貨控制 -->
                              <button 
                                v-if="canShipItem(item)" 
                                class="btn btn-info btn-sm" 
                                @click="shipOrderItem(order, item)"
                                title="標記此商品為已出貨"
                              >
                                <i class="fas fa-shipping-fast"></i>
                              </button>
                              <button 
                                v-if="canDeliverItem(item)" 
                                class="btn btn-success btn-sm" 
                                @click="deliverOrderItem(order, item)"
                                title="標記此商品為已送達"
                              >
                                <i class="fas fa-truck"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><strong>NT$ {{ order.totalAmount?.toLocaleString() || 0 }}</strong></td>
                    <td>
                      <span class="status-badge" :class="getStatusClass(order.status)">
                        {{ getStatusText(order.status) }}
                      </span>
                    </td>
                    <td>
                      {{ formatDate(order.createdAt) }}<br>
                      <small class="text-muted">{{ formatTime(order.createdAt) }}</small>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <!-- 查看詳情按鈕 -->
                        <button 
                          class="btn btn-secondary btn-sm-custom" 
                          @click="viewOrderDetail(order.orderNumber)"
                          title="查看完整訂單詳情"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <!-- 訂單備註按鈕 -->
                        <button 
                          class="btn btn-outline-info btn-sm-custom" 
                          @click="addOrderNote(order)"
                          title="新增訂單備註"
                        >
                          <i class="fas fa-sticky-note"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 分頁 -->
          <nav aria-label="訂單分頁" class="mt-4">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">上一頁</a>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page"
                class="page-item" 
                :class="{ active: page === currentPage }"
              >
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">下一頁</a>
              </li>
            </ul>
          </nav>
        </div>

        <!-- 側邊欄 -->
        <div class="col-lg-3">
          <div class="order-detail-sidebar">
            <h5 class="mb-3"><i class="fas fa-chart-bar"></i> 今日統計</h5>
            
            <div class="mb-3" v-for="stat in todayStats" :key="stat.label">
              <div class="d-flex justify-content-between mb-2">
                <span>{{ stat.label }}</span>
                <strong :class="stat.colorClass">{{ stat.value }}</strong>
              </div>
              <div class="progress" style="height: 8px;">
                <div 
                  class="progress-bar" 
                  :class="stat.progressClass" 
                  :style="{ width: stat.percentage + '%' }"
                ></div>
              </div>
            </div>

            <hr>

            <h6><i class="fas fa-exclamation-triangle text-warning"></i> 待處理事項</h6>
            <ul class="list-unstyled">
              <li class="mb-2" v-for="task in pendingTasks" :key="task">
                <small class="text-muted">• {{ task }}</small>
              </li>
            </ul>

            <hr>

            <h6><i class="fas fa-clock"></i> 最近活動</h6>
            <div class="small text-muted">
              <p class="mb-1" v-for="activity in recentActivities" :key="activity.id">
                {{ activity.time }} - {{ activity.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 訂單詳情Modal -->
    <div 
      class="modal fade" 
      id="orderDetailModal" 
      tabindex="-1"
      ref="orderDetailModal"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-receipt"></i> 訂單詳情</h5>
            <button type="button" class="btn-close" @click="closeModal('orderDetail')"></button>
          </div>
          <div class="modal-body" v-if="selectedOrderDetail">
            <div class="row">
              <div class="col-md-6">
                <h6>訂單資訊</h6>
                <table class="table table-sm">
                  <tr><td>訂單編號:</td><td><strong>{{ selectedOrderDetail.orderNumber }}</strong></td></tr>
                  <tr><td>優先級:</td><td>
                    <span class="badge" :class="selectedOrderDetail.priority === 'high' ? 'bg-danger' : 'bg-warning'">
                      {{ selectedOrderDetail.priority === 'high' ? '緊急' : '一般' }}
                    </span>
                  </td></tr>
                  <tr><td>總金額:</td><td><strong>${{ selectedOrderDetail.amount?.toLocaleString() }}</strong></td></tr>
                  <tr><td>付款方式:</td><td>{{ selectedOrderDetail.paymentMethod }}</td></tr>
                  <tr><td>配送方式:</td><td>{{ selectedOrderDetail.shippingMethod }}</td></tr>
                </table>
              </div>
              <div class="col-md-6">
                <h6>顧客資訊</h6>
                <table class="table table-sm">
                  <tr><td>姓名:</td><td>{{ selectedOrderDetail.customer?.name }}</td></tr>
                  <tr><td>電話:</td><td>{{ selectedOrderDetail.customer?.phone }}</td></tr>
                  <tr><td>信箱:</td><td>{{ selectedOrderDetail.customer?.email }}</td></tr>
                  <tr><td>地址:</td><td>{{ selectedOrderDetail.customer?.address }}</td></tr>
                </table>
              </div>
            </div>
            
            <hr>
            
            <h6>商品清單</h6>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>商品名稱</th>
                    <th>規格</th>
                    <th>數量</th>
                    <th>單價</th>
                    <th>小計</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ selectedOrderDetail.product?.name }}</td>
                    <td>{{ selectedOrderDetail.product?.spec }}</td>
                    <td>{{ selectedOrderDetail.quantity }}</td>
                    <td>${{ selectedOrderDetail.product?.price?.toLocaleString() }}</td>
                    <td><strong>${{ selectedOrderDetail.amount?.toLocaleString() }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="alert alert-info" v-if="selectedOrderDetail.notes">
              <strong>備註:</strong> {{ selectedOrderDetail.notes }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal('orderDetail')">關閉</button>
            <button type="button" class="btn btn-warning" @click="processCurrentOrder">處理訂單</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 出貨Modal -->
    <div 
      class="modal fade" 
      id="shipmentModal" 
      tabindex="-1"
      ref="shipmentModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-truck"></i> 安排出貨</h5>
            <button type="button" class="btn-close" @click="closeModal('shipment')"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="confirmShipment">
              <div class="mb-3">
                <label class="form-label">物流公司</label>
                <select class="form-select" v-model="shipmentForm.carrier" required>
                  <option value="">請選擇物流公司</option>
                  <option value="blackcat">黑貓宅急便</option>
                  <option value="post">中華郵政</option>
                  <option value="fedex">FedEx</option>
                  <option value="dhl">DHL</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">追蹤號碼</label>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="輸入追蹤號碼" 
                  v-model="shipmentForm.trackingNumber"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">預計到貨日</label>
                <input 
                  type="date" 
                  class="form-control" 
                  v-model="shipmentForm.expectedDate"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">備註</label>
                <textarea 
                  class="form-control" 
                  rows="3" 
                  placeholder="出貨備註（選填）"
                  v-model="shipmentForm.notes"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal('shipment')">取消</button>
            <button type="button" class="btn btn-primary" @click="confirmShipment">確認出貨</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 通知 -->
    <div 
      v-if="toast.show"
      class="alert position-fixed"
      :class="getToastClass()"
      style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;"
    >
      <div class="d-flex align-items-center">
        <i :class="getToastIcon()" class="me-2"></i>
        {{ toast.message }}
        <button type="button" class="btn-close ms-auto" @click="hideToast"></button>
      </div>
    </div>
</template>

<script>
import SellerOrderService from '@/services/sellerOrderService.js'
import Swal from 'sweetalert2'

export default {
  name: 'OrderManagerView',
  data() {
    return {
      // 賣家資訊
      vendorId: null, // 動態設定，從登入資訊獲取
      currentUser: null, // 當前登入使用者資訊
      showDebugTools: true, // 調試工具開關
      
      // 統計數據
      stats: [
        { id: 1, icon: 'fas fa-clock', iconClass: 'bg-warning text-white', value: 0, label: '待處理訂單' },
        { id: 2, icon: 'fas fa-boxes', iconClass: 'bg-info text-white', value: 0, label: '準備出貨' },
        { id: 3, icon: 'fas fa-shipping-fast', iconClass: 'bg-success text-white', value: 0, label: '已出貨' },
        { id: 4, icon: 'fas fa-dollar-sign', iconClass: 'bg-primary text-white', value: '$0', label: '本月營收' }
      ],
      
      // 篩選器
      filters: {
        status: '',
        dateRange: '',
        search: ''
      },
      
      // 分頁
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      
      // 選擇狀態
      selectAll: false,
      selectedOrders: [],
      
      // 訂單數據
      orders: [],
      loading: false,
      
      // 今日統計
      todayStats: [
        { label: '新訂單', value: 0, colorClass: 'text-warning', progressClass: 'bg-warning', percentage: 0 },
        { label: '已處理', value: 0, colorClass: 'text-info', progressClass: 'bg-info', percentage: 0 },
        { label: '已出貨', value: 0, colorClass: 'text-success', progressClass: 'bg-success', percentage: 0 }
      ],
      
      // 待處理事項
      pendingTasks: [],
      
      // 最近活動
      recentActivities: [],
      
      // Modal 狀態
      selectedOrderDetail: null,
      currentOrderId: null,
      
      // 出貨表單
      shipmentForm: {
        carrier: '',
        trackingNumber: '',
        expectedDate: '',
        notes: ''
      },
      
      // Toast 通知
      toast: {
        show: false,
        message: '',
        type: 'info'
      },
      
      // 防抖
      filterTimeout: null
    }
  },
  
  async mounted() {
    console.log('🔄 賣家訂單管理頁面已掛載')
    
    // 初始化賣家資訊
    await this.initializeVendorInfo()
    
    if (this.vendorId) {
      console.log('✅ 賣家ID:', this.vendorId)
      await this.loadOrders()
      this.updateStats()
    } else {
      console.error('❌ 無法獲取賣家ID')
      this.showToast('無法獲取賣家資訊，請重新登入', 'error')
    }
  },
  
  computed: {
    filteredOrders() {
      // 由於篩選邏輯已移到 API 調用，這裡直接返回訂單數據
      return this.orders
    },
    
    totalPages() {
      return Math.ceil(this.totalCount / this.pageSize)
    }
  },
  
  methods: {
    // 初始化賣家資訊
    async initializeVendorInfo() {
      try {
        // 1) URL 覆蓋（若有提供則優先）
        const urlParams = new URLSearchParams(window.location.search)
        const vendorIdFromUrl = urlParams.get('vendorId')

        // 2) 使用共用解析（與優惠券一致）：localStorage 檢查 → API → 快取 → fallback memberId
        const { ensureSellerId } = await import('@/services/sellerIdentityService.js')
        const resolved = await ensureSellerId({ fallbackToMemberId: true })

        // 若 URL 指定的賣家ID與當前使用者的 sellerId 一致才接受，否則忽略，避免跨帳號殘留
        if (vendorIdFromUrl && !isNaN(parseInt(vendorIdFromUrl))) {
          const urlId = parseInt(vendorIdFromUrl)
          if (resolved && urlId === resolved) {
            this.vendorId = urlId
            console.log('🏪 使用 URL 指定的賣家ID:', this.vendorId)
          } else {
            this.vendorId = resolved
            console.log('⚠️ URL 指定的賣家ID與當前使用者不符，已忽略，改用解析ID:', this.vendorId)
          }
        } else {
          this.vendorId = resolved
        }

        console.log('🏪 最終賣家ID:', this.vendorId)
        
      } catch (error) {
        console.error('❌ 初始化賣家資訊失敗:', error)
        this.vendorId = null
      }
    },

    // 切換賣家ID (調試用)
    async switchVendor() {
      try {
        console.log('🔄 切換到賣家ID:', this.vendorId)
        this.orders = []
        this.totalCount = 0
        await this.loadOrders()
        this.updateStats()
        this.showToast(`已切換到賣家 ${this.vendorId}`, 'info')
      } catch (error) {
        console.error('❌ 切換賣家失敗:', error)
        this.showToast('切換賣家失敗', 'error')
      }
    },
    // 載入訂單數據
    async loadOrders() {
      try {
        this.loading = true
        // 確保有正確的賣家ID
        if (!this.vendorId) {
          const { ensureSellerId } = await import('@/services/sellerIdentityService.js')
          this.vendorId = await ensureSellerId({ fallbackToMemberId: true })
          if (!this.vendorId) {
            throw new Error('缺少賣家ID，請重新登入')
          }
        }
        const params = {
          status: this.filters.status || undefined,
          page: this.currentPage,
          pageSize: this.pageSize,
          search: this.filters.search || undefined
        }
        
        // 日期範圍處理
        if (this.filters.dateRange) {
          const now = new Date()
          let startDate
          
          switch (this.filters.dateRange) {
            case 'today':
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
              break
            case 'week':
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
              break
            case 'month':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1)
              break
            case 'quarter':
              startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
              break
          }
          
          if (startDate) {
            params.startDate = startDate.toISOString().split('T')[0]
            params.endDate = now.toISOString().split('T')[0]
          }
        }
        
        const result = await SellerOrderService.getVendorOrders(this.vendorId, params)
        
        console.log('🔍 賣家訂單 API 回應:', result)
        
        if (result.success) {
          // 檢查數據結構
          console.log('📦 訂單數據結構:', result.data)
          
          // 使用 SellerOrderListResponseDto 格式
          if (result.data && result.data.orders) {
            this.orders = result.data.orders
            this.totalCount = result.data.totalCount || 0
            this.currentPage = result.data.page || 1
            console.log('✅ 成功載入訂單:', this.orders.length, '筆')
            
            // 調試：檢查商品圖片
            this.orders.forEach(order => {
              if (order.vendorItems && order.vendorItems.length > 0) {
                order.vendorItems.forEach(item => {
                  console.log('🖼️ 商品圖片:', item.productName, '->', item.productImage)
                })
              }
            })
          }
          // 如果 result.data 直接是陣列
          else if (Array.isArray(result.data)) {
            this.orders = result.data
            this.totalCount = result.data.length
            this.currentPage = 1
            console.log('✅ 成功載入訂單(陣列格式):', this.orders.length, '筆')
          } 
          // 其他情況
          else {
            this.orders = []
            this.totalCount = 0
            this.currentPage = 1
            console.warn('⚠️ 未知的數據格式:', result.data)
          }
          
          // 重置選取狀態
          this.selectedOrders = []
          this.selectAll = false
        } else {
          throw new Error(result.error || '載入訂單失敗')
        }
        
      } catch (error) {
        console.error('載入訂單失敗:', error)
        this.showToast('載入訂單失敗: ' + error.message, 'error')
        this.orders = []
        this.totalCount = 0
      } finally {
        this.loading = false
      }
    },

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

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '未設定'
      
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '無效日期'
      
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '/')
    },
    
    // 格式化時間
    formatTime(dateString) {
      if (!dateString) return '未設定'
      
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '無效時間'
      
      return date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    // 取得優先級樣式
    getPriorityClass(priority) {
      const classes = {
        high: 'priority-high',
        medium: 'priority-medium',
        low: 'priority-low'
      }
      return classes[priority] || ''
    },
    
    // 取得狀態樣式
    getStatusClass(status) {
      const classes = {
        new: 'status-new',
        processing: 'status-processing',
        shipped: 'status-shipped',
        completed: 'status-completed',
        cancelled: 'status-cancelled'
      }
      return classes[status] || ''
    },
    
    // 取得狀態文字
    getStatusText(status) {
      const texts = {
        'pending': '待付款',
        'paid': '已付款', 
        'shipped': '已出貨',
        'delivered': '已送達',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return texts[status] || status
    },
    
    // 切換全選
    toggleSelectAll() {
      if (this.selectAll) {
        // 選取所有訂單
        this.selectedOrders = this.filteredOrders.map(order => order.orderNumber)
      } else {
        // 取消所有選取
        this.selectedOrders = []
      }
      console.log('🔘 全選狀態:', this.selectAll, '已選取:', this.selectedOrders.length)
    },

    // 更新全選狀態
    updateSelectAllState() {
      // 檢查是否所有訂單都被選取
      const allOrderNumbers = this.filteredOrders.map(order => order.orderNumber)
      this.selectAll = allOrderNumbers.length > 0 && 
                      allOrderNumbers.every(orderNumber => this.selectedOrders.includes(orderNumber))
      
      console.log('📝 更新全選狀態:', {
        總訂單數: allOrderNumbers.length,
        已選取數: this.selectedOrders.length,
        全選狀態: this.selectAll
      })
    },
    
    // 處理訂單
    processOrder(orderNumber) {
      if (confirm('確定要處理這個訂單嗎？')) {
        const orderIndex = this.orders.findIndex(order => order.orderNumber === orderNumber)
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = 'processing'
          this.showToast('訂單已開始處理', 'success')
          this.updateStats()
        }
      }
    },

    // 驗證出貨表單
    validateShipmentForm() {
      if (!this.shipmentForm.carrier) {
        this.showToast('請選擇物流公司', 'warning')
        return false
      }
      if (!this.shipmentForm.trackingNumber) {
        this.showToast('請輸入追蹤號碼', 'warning')
        return false
      }
      if (!this.shipmentForm.expectedDate) {
        this.showToast('請選擇預計到貨日', 'warning')
        return false
      }
      return true
    },
    
    // 重置出貨表單
    resetShipmentForm() {
      this.shipmentForm = {
        carrier: '',
        trackingNumber: '',
        expectedDate: '',
        notes: ''
      }
    },
    
    // 追蹤物流
    trackShipment(trackingNumber) {
      this.showToast(`正在查詢物流狀態，追蹤號碼: ${trackingNumber}`, 'info')
      // 這裡可以整合實際的物流追蹤 API
    },

    // ========== 商品級別出貨管理 ==========
    
    // 取得商品項目狀態樣式
    getItemStatusClass(item) {
      const status = item.shippingStatus || 'pending'
      const classes = {
        'pending': 'bg-warning text-dark',
        'shipped': 'bg-info text-white', 
        'delivered': 'bg-success text-white',
        'completed': 'bg-primary text-white'
      }
      return classes[status] || 'bg-secondary text-white'
    },
    
    // 取得商品項目狀態文字
    getItemStatusText(item) {
      const status = item.shippingStatus || 'pending'
      const texts = {
        'pending': '待出貨',
        'shipped': '已出貨',
        'delivered': '已送達', 
        'completed': '已完成'
      }
      return texts[status] || '未知狀態'
    },

    // 檢查商品是否可以出貨
    canShipItem(item) {
      const status = item.shippingStatus || 'pending'
      return status === 'pending'
    },
    
    // 檢查商品是否可以標記送達
    canDeliverItem(item) {
      const status = item.shippingStatus || 'pending'
      return status === 'shipped'
    },

    // 出貨單一商品項目
    async shipOrderItem(order, orderItem) {
      try {
        const result = await Swal.fire({
          title: '確認出貨',
          html: `
            <div class="text-start">
              <p><strong>訂單編號：</strong>${this.formatOrderNumber(order.orderNumber)}</p>
              <p><strong>商品：</strong>${orderItem.productName}</p>
              <p><strong>數量：</strong>${orderItem.quantity}</p>
              <p><strong>金額：</strong>NT$ ${orderItem.subtotal.toLocaleString()}</p>
              <div class="mt-3">
                <label for="trackingNumber" class="form-label">追蹤號碼（選填）：</label>
                <input type="text" id="trackingNumber" class="form-control" placeholder="請輸入追蹤號碼">
              </div>
            </div>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '確認出貨',
          cancelButtonText: '取消',
          preConfirm: () => {
            const trackingNumber = document.getElementById('trackingNumber').value
            return { trackingNumber }
          }
        })

        if (result.isConfirmed) {
          console.log('🚚 商品出貨:', orderItem.id, 'vendorId:', this.vendorId)
          
          const response = await SellerOrderService.updateOrderItemShipping(
            orderItem.id,
            this.vendorId,
            { 
              status: 'shipped',
              trackingNumber: result.value.trackingNumber 
            }
          )

          if (response.success) {
            // 更新前端狀態
            orderItem.shippingStatus = 'shipped'
            orderItem.shippedAt = new Date()
            orderItem.trackingNumber = result.value.trackingNumber
            
            this.showToast('商品已標記為出貨', 'success')
            
            // 檢查是否所有商品都已出貨
            this.checkVendorOrderStatus(order)
            
            // 重新載入訂單以獲取最新狀態
            setTimeout(() => {
              this.loadOrders()
            }, 1000)
          } else {
            throw new Error(response.error)
          }
        }
      } catch (error) {
        console.error('❌ 商品出貨失敗:', error)
        this.showToast('商品出貨失敗: ' + error.message, 'error')
      }
    },

    // 標記單一商品為已送達
    async deliverOrderItem(order, orderItem) {
      try {
        const result = await Swal.fire({
          title: '確認送達',
          html: `
            <div class="text-start">
              <p><strong>訂單編號：</strong>${this.formatOrderNumber(order.orderNumber)}</p>
              <p><strong>商品：</strong>${orderItem.productName}</p>
              <p><strong>數量：</strong>${orderItem.quantity}</p>
              <p>確認此商品已送達客戶手中？</p>
            </div>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '確認送達',
          cancelButtonText: '取消'
        })

        if (result.isConfirmed) {
          console.log('📦 商品送達:', orderItem.id, 'vendorId:', this.vendorId)
          
          const response = await SellerOrderService.updateOrderItemShipping(
            orderItem.id,
            this.vendorId,
            { status: 'delivered' }
          )

          if (response.success) {
            // 更新前端狀態
            orderItem.shippingStatus = 'delivered'
            orderItem.deliveredAt = new Date()
            
            this.showToast('商品已標記為送達', 'success')
            
            // 檢查是否所有商品都已送達
            this.checkVendorOrderStatus(order)
          } else {
            throw new Error(response.error)
          }
        }
      } catch (error) {
        console.error('❌ 商品送達失敗:', error)
        this.showToast('商品送達失敗: ' + error.message, 'error')
      }
    },

    // 檢查賣家在此訂單的完成狀態
    checkVendorOrderStatus(order) {
      const allItemsDelivered = order.vendorItems.every(item => 
        item.shippingStatus === 'delivered'
      )
      
      if (allItemsDelivered) {
        order.vendorStatus = 'completed'
        this.showToast('🎉 您在此訂單的所有商品都已完成！', 'success')
      }
    },

    // 新增訂單備註
    async addOrderNote(order) {
      try {
        const result = await Swal.fire({
          title: '新增訂單備註',
          html: `
            <div class="text-start">
              <p><strong>訂單編號：</strong>${this.formatOrderNumber(order.orderNumber)}</p>
              <textarea id="orderNote" class="form-control" rows="4" placeholder="請輸入備註內容..."></textarea>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: '儲存備註',
          cancelButtonText: '取消',
          preConfirm: () => {
            const note = document.getElementById('orderNote').value
            if (!note.trim()) {
              Swal.showValidationMessage('請輸入備註內容')
              return false
            }
            return note
          }
        })

        if (result.isConfirmed) {
          // TODO: 實作備註儲存 API
          this.showToast('備註已儲存', 'success')
        }
      } catch (error) {
        console.error('❌ 儲存備註失敗:', error)
        this.showToast('儲存備註失敗: ' + error.message, 'error')
      }
    },
    
    // 查看訂單詳情
    viewOrderDetail(orderNumber) {
      const order = this.orders.find(order => order.orderNumber === orderNumber)
      if (order) {
        this.selectedOrderDetail = order
        this.currentOrderId = orderNumber
        this.showModal('orderDetail')
      }
    },
    
    // 篩選訂單
    async filterOrders() {
      this.currentPage = 1 // 重置到第一頁
      await this.loadOrders()
      this.showToast('篩選完成', 'success')
    },
    
    // 防抖篩選
    debouncedFilter() {
      clearTimeout(this.filterTimeout)
      this.filterTimeout = setTimeout(async () => {
        await this.filterOrders()
      }, 300)
    },
    
    // 批量操作
    bulkAction(action) {
      if (this.selectedOrders.length === 0) {
        this.showToast('請先選擇要操作的訂單', 'warning')
        return
      }

      const actionText = {
        'process': '處理',
        'ship': '出貨',
        'cancel': '取消'
      }

      if (confirm(`確定要批量${actionText[action]} ${this.selectedOrders.length} 個訂單嗎？`)) {
        this.showToast(`正在批量${actionText[action]}訂單...`, 'info')
        
        const selectedCount = this.selectedOrders.length
        
        setTimeout(() => {
          // 執行批量操作
          this.selectedOrders.forEach(orderNumber => {
            const orderIndex = this.orders.findIndex(order => order.orderNumber === orderNumber)
            if (orderIndex !== -1) {
              switch (action) {
                case 'process':
                  if (this.orders[orderIndex].status === 'pending') {
                    this.orders[orderIndex].status = 'processing'
                  }
                  break
                case 'ship':
                  if (['pending', 'paid'].includes(this.orders[orderIndex].status)) {
                    this.orders[orderIndex].status = 'shipped'
                    this.orders[orderIndex].trackingNumber = 'TW' + Math.random().toString().substr(2, 9)
                  }
                  break
              }
            }
          })
          
          this.selectedOrders = []
          this.selectAll = false
          this.showToast(`成功${actionText[action]} ${selectedCount} 個訂單`, 'success')
          this.updateStats()
        }, 1500)
      }
    },
    
    // 匯出訂單
    exportOrders() {
      this.showToast('正在準備匯出檔案...', 'info')
      setTimeout(() => {
        // 這裡可以實作實際的匯出功能
        this.showToast('訂單資料匯出完成！', 'success')
      }, 2000)
    },
    
    // 列印標籤
    printLabels() {
      if (this.selectedOrders.length === 0) {
        this.showToast('請先選擇要列印標籤的訂單', 'warning')
        return
      }

      this.showToast(`正在準備列印 ${this.selectedOrders.length} 個出貨標籤...`, 'info')
      setTimeout(() => {
        // 這裡可以實作實際的列印功能
        this.showToast('出貨標籤列印完成！', 'success')
      }, 1500)
    },
    
    // 處理當前訂單
    processCurrentOrder() {
      if (this.currentOrderId) {
        this.processOrder(this.currentOrderId)
        this.closeModal('orderDetail')
      }
    },
    
    // 更新統計
    async updateStats() {
      try {
        console.log('📊 載入賣家統計數據...')
        const result = await SellerOrderService.getVendorStatistics(this.vendorId, 30)
        
        if (result.success && result.data) {
          const stats = result.data
          console.log('✅ 統計數據:', stats)
          
          // 更新統計卡片
          this.stats = [
            {
              id: 1,
              label: '總訂單',
              value: stats.totalOrders || 0,
              icon: 'fas fa-shopping-cart',
              iconClass: 'text-primary'
            },
            {
              id: 2,
              label: '待付款',
              value: stats.pendingOrders || 0,
              icon: 'fas fa-clock',
              iconClass: 'text-warning'
            },
            {
              id: 3,
              label: '已出貨',
              value: stats.shippedOrders || 0,
              icon: 'fas fa-truck',
              iconClass: 'text-info'
            },
            {
              id: 4,
              label: '已完成',
              value: (stats.deliveredOrders || 0),
              icon: 'fas fa-check-circle',
              iconClass: 'text-success'
            }
          ]
          
          // 更新今日統計（使用相同數據，因為API已經按天數篩選）
          this.todayStats = [
            {
              label: '新訂單',
              value: stats.pendingOrders || 0,
              percentage: Math.min(100, ((stats.pendingOrders || 0) / Math.max(1, stats.totalOrders || 1)) * 100),
              colorClass: 'text-warning',
              progressClass: 'bg-warning'
            },
            {
              label: '處理中',
              value: stats.paidOrders || 0,
              percentage: Math.min(100, ((stats.paidOrders || 0) / Math.max(1, stats.totalOrders || 1)) * 100),
              colorClass: 'text-info',
              progressClass: 'bg-info'
            },
            {
              label: '已完成',
              value: stats.deliveredOrders || 0,
              percentage: Math.min(100, ((stats.deliveredOrders || 0) / Math.max(1, stats.totalOrders || 1)) * 100),
              colorClass: 'text-success',
              progressClass: 'bg-success'
            }
          ]
          
        } else {
          console.warn('⚠️ 統計數據載入失敗:', result.error)
          // 使用預設統計
          this.setDefaultStats()
        }
        
      } catch (error) {
        console.error('❌ 載入統計數據失敗:', error)
        this.setDefaultStats()
      }
    },
    
    // 設置預設統計數據
    setDefaultStats() {
      this.stats = [
        { id: 1, label: '總訂單', value: 0, icon: 'fas fa-shopping-cart', iconClass: 'text-primary' },
        { id: 2, label: '待付款', value: 0, icon: 'fas fa-clock', iconClass: 'text-warning' },
        { id: 3, label: '已出貨', value: 0, icon: 'fas fa-truck', iconClass: 'text-info' },
        { id: 4, label: '已完成', value: 0, icon: 'fas fa-check-circle', iconClass: 'text-success' }
      ]
      this.todayStats = [
        { label: '新訂單', value: 0, percentage: 0, colorClass: 'text-warning', progressClass: 'bg-warning' },
        { label: '處理中', value: 0, percentage: 0, colorClass: 'text-info', progressClass: 'bg-info' },
        { label: '已完成', value: 0, percentage: 0, colorClass: 'text-success', progressClass: 'bg-success' }
      ]
    },
    
    // 分頁切換
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page
        await this.loadOrders()
      }
    },
    
    // 顯示 Modal
    showModal(type) {
      const modalElement = this.$refs[`${type}Modal`]
      if (modalElement) {
        modalElement.style.display = 'block'
        modalElement.classList.add('show')
        document.body.classList.add('modal-open')
      }
    },
    
    // 關閉 Modal
    closeModal(type) {
      const modalElement = this.$refs[`${type}Modal`]
      if (modalElement) {
        modalElement.style.display = 'none'
        modalElement.classList.remove('show')
        document.body.classList.remove('modal-open')
      }
      
      if (type === 'shipment') {
        this.resetShipmentForm()
      }
    },
    
    // 顯示 Toast
    showToast(message, type = 'info') {
      this.toast = {
        show: true,
        message,
        type
      }
      
      setTimeout(() => {
        this.hideToast()
      }, 3000)
    },
    
    // 隱藏 Toast
    hideToast() {
      this.toast.show = false
    },
    
    // 取得 Toast 樣式
    getToastClass() {
      const classes = {
        success: 'alert-success',
        error: 'alert-danger',
        warning: 'alert-warning',
        info: 'alert-info'
      }
      return classes[this.toast.type] || 'alert-info'
    },
    
    // 取得 Toast 圖示
    getToastIcon() {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-triangle',
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
      }
      return icons[this.toast.type] || 'fas fa-info-circle'
    }
  },
  
  watch: {
    // 監聽選中訂單變化
    selectedOrders() {
      this.selectAll = this.selectedOrders.length === this.filteredOrders.length && this.filteredOrders.length > 0
    },
    'filters.status'() {
      this.debouncedFilter()
    },
    'filters.dateRange'() {
      this.debouncedFilter()
    }
  }
}
</script>

<style scoped>
.vendor-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 2rem 0;
}

.stats-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.order-table {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.table th {
  background: #f8f9fa;
  border: none;
  padding: 1rem;
  font-weight: 600;
}

.table td {
  padding: 1rem;
  vertical-align: middle;
  border: none;
  border-bottom: 1px solid #f8f9fa;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
}

.status-new {
  background: #fff3cd;
  color: #856404;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-shipped {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: #c3e6cb;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-sm-custom {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 6px;
}

.filter-section {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.quick-actions {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.order-detail-sidebar {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1rem;
}

.priority-high {
  border-left: 4px solid #dc3545;
}

.priority-medium {
  border-left: 4px solid #ffc107;
}

.priority-low {
  border-left: 4px solid #28a745;
}

/* Modal 遮罩層 */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .stats-card {
    margin-bottom: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .filter-section .row > div {
    margin-bottom: 1rem;
  }
  
  .quick-actions .d-flex {
    flex-direction: column;
    align-items: stretch;
  }
  
  .product-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .product-list {
    max-width: 400px;
  }

  .product-item {
    padding: 8px 0;
  }
  
  .product-item.border-bottom {
    border-bottom: 1px solid #e9ecef !important;
    margin-bottom: 8px;
    padding-bottom: 8px;
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .item-actions .btn {
    padding: 4px 8px;
    font-size: 12px;
  }

  .product-image {
    margin-bottom: 0.5rem;
    margin-right: 0;
  }
}
</style>


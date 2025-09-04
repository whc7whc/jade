<template>
  <div class="seller-center-sidebar d-flex min-vh-100">
    <!-- 手機版側邊欄切換按鈕 -->
    <button 
      class="btn sidebar-toggle-btn d-lg-none position-fixed"
      @click="toggleSidebar"
      style="top: 130px; left: 0; z-index: 1026;"
      title="開啟側邊欄"
    >
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/>
      </svg>
    </button>
    
    <!-- 側邊欄覆蓋層 (手機版用) -->
    <div 
      class="sidebar-overlay d-lg-none"
      :class="{ 'show': sidebarOpen }"
      @click="closeSidebar"
    ></div>
    
    <!-- 側邊欄 -->
    <nav class="sidebar" :class="{ 'show': sidebarOpen }">
      <div class="sidebar-header p-3 border-bottom">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">賣家中心</h5>
          <!-- 手機版關閉按鈕 -->
          <button 
            class="btn sidebar-close-btn d-lg-none"
            @click="closeSidebar"
            title="關閉側邊欄"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="sidebar-body">
        <ul class="nav flex-column p-3">
          <li class="nav-item mb-2">
            <a class="nav-link d-flex align-items-center" 
               href="#" 
               @click.prevent="setActiveView('dashboard'); closeSidebar()"
               :class="{ 'active': activeView === 'dashboard' }">
              <svg width="20" height="20" class="me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v4m8-4v4"/>
              </svg>
              儀表板
            </a>
          </li>
          
          <li class="nav-item mb-2">
            <a class="nav-link d-flex align-items-center" 
               href="#" 
               @click.prevent="setActiveView('products'); closeSidebar()"
               :class="{ 'active': activeView === 'products' }">
              <svg width="20" height="20" class="me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              商品管理
            </a>
          </li>
          
          <li class="nav-item mb-2">
            <a class="nav-link d-flex align-items-center" 
               href="#" 
               @click.prevent="setActiveView('orders'); closeSidebar()"
               :class="{ 'active': activeView === 'orders' }">
              <svg width="20" height="20" class="me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              訂單管理
            </a>
          </li>
          
          <li class="nav-item mb-2">
            <a class="nav-link d-flex align-items-center" 
               href="#" 
               @click.prevent="setActiveView('analytics'); closeSidebar()"
               :class="{ 'active': activeView === 'analytics' }">
              <svg width="20" height="20" class="me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              銷售報表
            </a>
          </li>
          
          <li class="nav-item mb-2">
            <a class="nav-link d-flex align-items-center" 
               href="#" 
               @click.prevent="setActiveView('coupons'); closeSidebar()"
               :class="{ 'active': activeView === 'coupons' }">
              <svg width="20" height="20" class="me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
              </svg>
              優惠券管理
            </a>
          </li>
          
<li class="nav-item mb-2">
  <a class="nav-link d-flex align-items-center" 
     href="#" 
     @click.prevent="setActiveView('sellerInfo'); closeSidebar()"
     :class="{ 'active': activeView === 'sellerInfo' }">
    <svg width="20" height="20" class="me-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7"></path>
      <path d="M9 22V12h6v10"></path>
      <circle cx="12" cy="16" r="2"></circle>
    </svg>
    賣家資訊
  </a>
</li>
       
        </ul>
      </div>
    </nav>
    
    <!-- 主要內容區 -->
    <main class="main-content flex-fill">
      <div class="container-fluid p-4">
        <!-- 儀表板視圖 -->
        <div v-if="activeView === 'dashboard'" class="dashboard-view">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>賣場資料總覽</h2>
            <div class="d-flex align-items-center gap-3">
              <button 
                class="btn btn-sm btn-outline-primary"
                @click="loadStats"
                :disabled="isLoadingStats"
                title="重新載入統計數據"
              >
                <span v-if="isLoadingStats" class="spinner-border spinner-border-sm me-1"></span>
                <svg v-else width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                {{ isLoadingStats ? '載入中...' : '刷新數據' }}
              </button>
              <div class="text-muted">歡迎回到賣家中心</div>
            </div>
          </div>
          
          <!-- 統計卡片 -->
          <div class="row g-3 mb-4">
            <div class="col-md-3">
              <div class="card border-0 bg-primary text-white">
                <div class="card-body">
                  <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                    </div>
                    <div class="flex-grow-1 ms-3">
                      <div class="h4 mb-0">{{ stats.products }}</div>
                      <div class="small">商品數量</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-3">
              <div class="card border-0 bg-success text-white">
                <div class="card-body">
                  <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                    </div>
                    <div class="flex-grow-1 ms-3">
                      <div class="h4 mb-0">
                        <span v-if="isLoadingStats" class="spinner-border spinner-border-sm me-1"></span>
                        {{ stats.orders }}
                      </div>
                      <div class="small">待處理訂單</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-3">
              <div class="card border-0 bg-info text-white">
                <div class="card-body">
                  <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19A2 2 0 0 0 5 21H19A2 2 0 0 0 21 19V9M19 3H17V9H19V3Z"/>
                      </svg>
                    </div>
                    <div class="flex-grow-1 ms-3">
                      <div class="h4 mb-0">
                        <span v-if="isLoadingStats" class="spinner-border spinner-border-sm me-1"></span>
                        NT$ {{ stats.revenue.toLocaleString() }}
                      </div>
                      <div class="small">本月營收</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-3">
              <div class="card border-0 bg-warning text-white">
                <div class="card-body">
                  <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7 17 9.24 17 12 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15 15 13.66 15 12 13.66 9 12 9Z"/>
                      </svg>
                    </div>
                    <div class="flex-grow-1 ms-3">
                      <div class="h4 mb-0">
                        <span v-if="isLoadingStats" class="spinner-border spinner-border-sm me-1"></span>
                        {{ stats.views.toLocaleString() }}
                      </div>
                      <div class="small">商品瀏覽量</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 最近活動 -->
          <div class="row">
            <div class="col-lg-8">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h6 class="mb-0">最近訂單</h6>
                </div>
                <div class="card-body">
                  <div class="text-center text-muted py-4">
                    <div class="mb-2">
                      <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                    </div>
                    <p>目前沒有訂單</p>
                    <small>當有新訂單時，將會在這裡顯示</small>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-lg-4">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h6 class="mb-0">快速操作</h6>
                </div>
                <div class="card-body">
                  <div class="d-grid gap-2">
                    <button class="btn btn-primary" @click="setActiveView('products')">
                      新增商品
                    </button>
                    <button class="btn btn-outline-secondary" @click="setActiveView('orders')">
                      查看訂單
                    </button>
                    <button class="btn btn-outline-secondary" @click="setActiveView('analytics')">
                      查看報表
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 商品管理視圖 -->
        <div v-if="activeView === 'products'" class="products-view">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>商品管理</h2>
              <small class="text-muted">
                共 {{ filteredProducts.length }} / {{ products.length }} 個商品
              </small>
            </div>
            
            <!-- 調試和操作按鈕 -->
            <div class="d-flex gap-2">
              <button 
                class="btn btn-sm btn-outline-info"
                @click="debugProductState"
                title="除錯商品狀態">
                🔍 除錯
              </button>
            </div>
          </div>

          <!-- 篩選與搜尋 -->
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <div class="row g-3 align-items-end">
                <div class="col-md-3 col-sm-6">
                  <label class="form-label">主分類</label>
                  <select class="form-select" v-model="selectedCategoryId" @change="onCategoryChange">
                    <option :value="null">全部</option>
                    <option v-for="cat in categories" :key="cat.id || cat.Id" :value="cat.id || cat.Id">
                      {{ cat.name || cat.Name }} ({{ getCategoryProductCount(cat.id || cat.Id) }})
                    </option>
                  </select>
                </div>

                <div class="col-md-3 col-sm-6">
                  <label class="form-label">子分類</label>
                  <select class="form-select" v-model="selectedSubCategoryId" :disabled="!selectedCategoryId">
                    <option :value="null">{{ selectedCategoryId ? '全部' : '請先選主分類' }}</option>
                    <option v-for="sub in getSubCategories(selectedCategoryId)" :key="sub.id || sub.Id" :value="sub.id || sub.Id">
                      {{ sub.name || sub.Name }} ({{ getSubCategoryProductCount(sub.id || sub.Id) }})
                    </option>
                  </select>
                </div>

                <div class="col-md-3 col-sm-6">
                  <label class="form-label">風格</label>
                  <select class="form-select" v-model="selectedStyleId">
                    <option :value="null">全部</option>
                    <option v-for="style in styleAttributes" :key="style.id || style.Id" :value="style.id || style.Id">
                      {{ style.value || style.Value }} ({{ getStyleProductCount(style.id || style.Id) }})
                    </option>
                  </select>
                </div>

                <div class="col-md-3 col-sm-6">
                  <label class="form-label">搜尋商品</label>
                  <div class="input-group">
                    <input type="text" class="form-control" v-model.trim="searchQuery" placeholder="輸入商品名稱..." />
                    <button class="btn btn-outline-secondary" type="button" @click="clearFilters">清除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          <!-- 商品網格組件 -->
          <ProductGrid 
            :products="filteredProducts"
            @add-product="handleNewProduct"
            @edit-product="handleEditProduct"
            @delete-product="confirmDeleteProduct"
          />
        </div>
        
        <!-- 其他視圖的佔位符 -->
        
        <!-- 訂單管理視圖 -->
        <OrderManager v-if="activeView === 'orders'" />

        <div v-else-if="activeView === 'analytics'" class="analytics-view">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>銷售報表</h2>
          </div>
          <SalesAnalytics />
        </div>
        

        <!-- 賣家資訊視圖 -->
        <SellerManager v-if="activeView === 'sellerInfo'" />
        
       
        
        <!-- 優惠券管理視圖 -->
  <CouponManager v-if="activeView === 'coupons'" />
      </div>
    </main>
    
    <!-- 商品編輯 Modal 組件 -->
    <ProductEditModal 
      :show="showProductModal"
      :editingProduct="editingProduct"
      @close="showProductModal = false"
      @save="handleSaveProduct"
    />

    <!-- Toast 通知系統 -->
    <ToastNotification ref="toast" />

    <!-- 刪除確認 Modal -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title">確認刪除</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-2">確定要刪除商品「<strong>{{ pendingDeleteProduct?.name }}</strong>」嗎？</p>
            <!-- <div class="small text-muted">此操作會將商品狀態設為「未上架」（IsActive=false），並更新資料庫。</div> -->
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger" :disabled="deleting" @click="performDelete">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
              確認刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductGrid from '../product/ProductGrid.vue'
import ProductEditModal from '../product/ProductEditModal.vue'
import CouponManager from '../coupons/CouponManager.vue'
import SellerManager from '../apply/infor.vue'
import SalesAnalytics from '@/components/seller/SalesAnalytics.vue'
import OrderManager from './OrderManagerView.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import { Modal } from 'bootstrap'

export default {
  name: 'SellerView',
  components: {
    ProductGrid,
    ProductEditModal,
    CouponManager,
    SellerManager,
    SalesAnalytics,
    OrderManager,
    ToastNotification
  },
  data() {
    return {
      activeView: 'dashboard', // 改為儀表板模式
      sidebarOpen: false, // 響應式側邊欄狀態
      isLoadingStats: false, // 統計數據載入狀態
      stats: {
        products: 0,
        orders: 0,
        revenue: 0,
        views: 0
      },
      
      // 商品管理相關
      showProductModal: false,
      editingProduct: null,
      
  // 商品資料 - 初始為空陣列，從後端載入
  products: [],
  filteredProducts: [],
  // 篩選資料
  categories: [],
  subCategories: [],
  allAttributes: [],
  allAttributeValues: [],
  styleAttributes: [],
  selectedCategoryId: null,
  selectedSubCategoryId: null,
  selectedStyleId: null,
  searchQuery: '',
  // 刪除流程狀態
  pendingDeleteProduct: null,
  deleting: false,
  deleteModalInstance: null
    }
  },
  
  mounted() {
    document.title = '賣家中心 - JADE'
  // 先載入篩選所需資料，再載入產品
  this.bootstrapData()
    
    // 監聽視窗大小變化，大螢幕時自動關閉行動版側邊欄
    window.addEventListener('resize', this.handleResize)
    
    // 監聽鍵盤事件
    window.addEventListener('keydown', this.handleKeydown)
    
    // 初始化時檢查螢幕大小
    this.handleResize()
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('keydown', this.handleKeydown)
  },
  watch: {
    selectedStyleId() { this.filterProducts() },
    selectedCategoryId() { /* handled in onCategoryChange, but keep sync */ this.filterProducts() },
    selectedSubCategoryId() { this.filterProducts() },
    searchQuery() { this.filterProducts() }
  },
  methods: {
    async bootstrapData() {
      try {
        await Promise.all([
          this.loadCategories(),
          this.loadAllAttributes(),
          this.loadAllAttributeValues()
        ])
        await this.processStyleAttributes()
        await this.loadProducts()
      } catch (e) {
        console.error('初始化篩選資料失敗:', e)
        await this.loadProducts() // 仍嘗試載入產品
      }
    },
    setActiveView(view) {
      this.activeView = view
    },
    
    // 響應式側邊欄控制方法
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    
    closeSidebar() {
      this.sidebarOpen = false
    },
    
    // 處理鍵盤快捷鍵
    handleKeydown(event) {
      // ESC 鍵關閉 modal
      if (event.key === 'Escape') {
        if (this.showProductModal) {
          this.showProductModal = false
        }
      }
    },

    // 處理視窗大小變化
    handleResize() {
      if (window.innerWidth >= 992) {
        this.sidebarOpen = false
      }
    },
    
    // === 調試方法 ===
    
    debugProductState() {
      console.log('🔍 === 商品狀態調試資訊 ===')
      console.log('📊 總商品數:', this.products.length)
      
      console.log('\n📦 所有商品詳細資訊:')
      this.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id})`)
      })
      
      alert(`調試資訊已輸出到控制台\n\n總商品: ${this.products.length}`)
    },
    
    async loadProducts() {
      try {
        console.log('📦 載入產品資料...')
        
        // 檢查是否已登入並且是已核准的賣家
        const memberId = localStorage.getItem('memberId')
        const isSeller = localStorage.getItem('isSeller')
        
        if (!memberId) {
          this.showErrorMessage('請先登入才能查看商品')
          return
        }
        
        if (isSeller !== 'true') {
          this.showErrorMessage('您需要先申請成為賣家並通過審核才能查看商品')
          return
        }
        
        // 嘗試獲取賣家 ID（使用正確的 API 端點）
        let sellersId = parseInt(memberId)
        try {
          console.log('🔍 嘗試獲取賣家 ID...')
          
          // 使用正確的 API 端點獲取賣家 ID
          const sellerIdResponse = await this.$api.get(`/api/ApplySeller/${memberId}/seller-id`)
          console.log('🔍 賣家 ID API 回應:', sellerIdResponse)
          
          if (sellerIdResponse.success && sellerIdResponse.data) {
            // 處理可能的回應格式
            let actualSellerId = null
            
            if (typeof sellerIdResponse.data === 'number') {
              actualSellerId = sellerIdResponse.data
            } else if (sellerIdResponse.data.sellerId) {
              actualSellerId = sellerIdResponse.data.sellerId
            } else if (sellerIdResponse.data.id) {
              actualSellerId = sellerIdResponse.data.id
            }
            
            if (actualSellerId && !isNaN(parseInt(actualSellerId))) {
              sellersId = parseInt(actualSellerId)
              console.log('✅ 獲取到正確的賣家 ID:', sellersId)
            } else {
              console.log('⚠️ API 回應中沒有有效的賣家 ID，使用會員 ID:', sellersId)
              console.log('📋 完整回應:', sellerIdResponse.data)
            }
          } else {
            console.log('ℹ️ 賣家 ID API 呼叫失敗，使用會員 ID 作為賣家 ID:', sellersId)
            console.log('📋 API 回應:', sellerIdResponse)
          }
        } catch (error) {
          console.log('❌ 獲取賣家 ID 時發生錯誤，使用會員 ID 作為賣家 ID:', sellersId)
          console.log('📋 錯誤詳情:', error)
        }
        
        // 取得所有產品然後過濾該賣家的產品
        console.log('🔍 獲取賣家產品，sellersId:', sellersId)
        const result = await this.$api.get('/api/Products')
        
  if (result.success && result.data) {
          // 前端過濾該賣家的產品 (根據 API 回應，欄位名稱是 sellerId)
          const allProducts = Array.isArray(result.data) ? result.data : result.data.products || []
          const sellerProducts = allProducts.filter(product => {
            console.log(`📋 檢查產品 ${product.id}:`, {
              productSellerId: product.sellerId,
              targetSellersId: sellersId,
              match: product.sellerId === sellersId
            })
            return product.sellerId === sellersId
          })
          
          console.log(`✅ 找到 ${sellerProducts.length} 個賣家 ID ${sellersId} 的產品`)
          result.data = sellerProducts
        }
        
        console.log('📋 完整 API 回應:', result)
        console.log('📋 回應狀態:', result.success)
        console.log('📋 回應數據:', result.data)
        console.log('📋 會員ID:', memberId)
        console.log('📋 賣家ID:', sellersId)
        console.log('📋 賣家狀態:', isSeller)
        
        if (result.success && result.data) {
          this.processProductsResponse(result.data)
          
        } else {
          // 更詳細的錯誤訊息處理
          let errorMessage = '載入產品失敗'
          
          if (result.error) {
            errorMessage += `: ${result.error}`
          } else if (result.message) {
            errorMessage += `: ${result.message}`
          } else if (!result.success) {
            errorMessage += ': API 回應不成功'
          } else {
            errorMessage += ': 無產品資料'
          }
          
          console.error('❌ 載入產品失敗詳情:', {
            result: result,
            error: result.error,
            message: result.message,
            success: result.success,
            data: result.data
          })
          
          this.showErrorMessage(errorMessage)
        }
      } catch (error) {
        console.error('❌ 載入產品時發生錯誤:', error)
        this.showErrorMessage('載入產品失敗，請稍後再試')
      }
    },

    // 處理產品回應數據的共用方法
    processProductsResponse(responseData) {
      // 處理 API 回應數據 - 嘗試多種可能的數據結構
      let products = []
      
      if (Array.isArray(responseData)) {
        products = responseData
        console.log('🎯 直接使用 responseData (陣列)')
      } else if (responseData.data && Array.isArray(responseData.data)) {
        products = responseData.data
        console.log('🎯 使用 responseData.data (嵌套結構)')
      } else if (responseData.success && Array.isArray(responseData.data)) {
        products = responseData.data
        console.log('🎯 使用 responseData.data (API 回應格式)')
      } else {
        console.log('🔍 未知的數據結構，嘗試處理:', responseData)
        products = []
      }
      
      console.log('📦 解析到的產品數量:', products.length)
      
    this.products = products.map((product, index) => {
        console.log(`📋 處理產品 ${index + 1}: ${product.name}`)
        return {
          id: product.id,
          name: product.name,
          category: product.category,
          originalPrice: product.originalPrice,
          price: product.salePrice || product.price,
          status: product.status || 'active',
          image: this.getProductMainImage(product),
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
      // 便於篩選
      categoryId: product.categoryId || product.CategoryId,
      subCategoryId: product.subCategoryId || product.SubCategoryId,
      productAttributeValues: product.productAttributeValues || product.ProductAttributeValues || [],
      fullData: product
        }
      })
      
      console.log(`✅ 產品資料載入成功 - 總計: ${this.products.length}`)
      
    // 建立 styleId 映射並初始化篩選
    this.updateProductStyleIds()
    this.filterProducts()

      // 產品載入完成後，更新統計資料
      this.updateStatsAfterProductLoad()
    },

// 添加获取产品主图的方法
getProductMainImage(product) {
  if (product.productImages && product.productImages.length > 0) {
    const sortedImages = product.productImages
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    return sortedImages[0].imagePath || sortedImages[0].imagesUrl
  }
  
  if (product.variants && product.variants.length > 0) {
    const firstVariantWithImage = product.variants.find(v => v.image)
    if (firstVariantWithImage) {
      return firstVariantWithImage.image
    }
  }
  
  return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop&auto=format'
},
    
    updateStatsAfterProductLoad() {
      // 更新商品數量統計
      this.stats.products = this.products.length
      console.log(`📊 統計資料已更新 - 商品數量: ${this.stats.products}`)
      
      // 重新載入完整的統計數據（包括訂單和營收）
      this.loadStats()
    },

    // === 篩選資料載入 ===
    async loadCategories() {
      try {
        const res = await fetch('/api/Categories')
        if (res.ok) {
          this.categories = await res.json()
        }
        const resSub = await fetch('/api/SubCategories')
        if (resSub.ok) {
          this.subCategories = await resSub.json()
        }
      } catch (e) {
        console.warn('載入分類失敗', e)
        this.categories = []
        this.subCategories = []
      }
    },
    async loadAllAttributes() {
      try {
        const res = await fetch('/api/Attributes')
        this.allAttributes = res.ok ? await res.json() : []
      } catch (e) {
        this.allAttributes = []
      }
    },
    async loadAllAttributeValues() {
      try {
        const res = await fetch('/api/AttributeValues')
        this.allAttributeValues = res.ok ? await res.json() : []
      } catch (e) {
        this.allAttributeValues = []
      }
    },
    async processStyleAttributes() {
      if (!this.allAttributes.length || !this.allAttributeValues.length) return
      const styleAttrs = this.allAttributes.filter(a => a.name?.includes('風格') || a.Name?.includes('風格'))
      const styleAttrIds = new Set(styleAttrs.map(a => a.id || a.Id))
      this.styleAttributes = this.allAttributeValues.filter(av => styleAttrIds.has(av.attributeId || av.Attribute_Id || av.attribute_id))
    },

    // === 風格對應 ===
    getProductStyleId(product) {
      const pavs = product.productAttributeValues || []
      for (const pav of pavs) {
        const attributeValueId = pav.attributeValueId || pav.AttributeValueId || pav.attribute_value_id
        if (!attributeValueId) continue
        const av = this.allAttributeValues.find(v => (v.id || v.Id) == attributeValueId)
        if (!av) continue
        const attrId = av.attributeId || av.Attribute_Id || av.attribute_id
        const attr = this.allAttributes.find(a => (a.id || a.Id) == attrId)
        if (attr && (attr.name?.includes('風格') || attr.Name?.includes('風格'))) {
          return av.id || av.Id
        }
      }
      return null
    },
    updateProductStyleIds() {
      this.products.forEach(p => {
        p.styleId = this.getProductStyleId(p.fullData || p) // 嘗試從完整資料取得
      })
    },

    // === 篩選與搜尋 ===
    getSubCategories(categoryId) {
      if (!categoryId) return []
      return this.subCategories.filter(sc => (sc.categoryId || sc.CategoryId) == categoryId)
    },
    getStyleProductCount(styleId) {
      return this.products.filter(p => p.styleId == styleId).length
    },
    getCategoryProductCount(categoryId) {
      // 直接屬於主分類或屬於其子分類的商品
      const subIds = this.subCategories.filter(sc => (sc.categoryId || sc.CategoryId) == categoryId).map(sc => sc.id || sc.Id)
      return this.products.filter(p => {
        const catId = p.categoryId || p.fullData?.categoryId
        const subId = p.subCategoryId || p.fullData?.subCategoryId
        return catId == categoryId || subIds.includes(subId)
      }).length
    },
    getSubCategoryProductCount(subCategoryId) {
      return this.products.filter(p => (p.subCategoryId || p.fullData?.subCategoryId) == subCategoryId).length
    },
    onCategoryChange() {
      // 切換主分類時重置子分類
      this.selectedSubCategoryId = null
      this.filterProducts()
    },
    clearFilters() {
      this.selectedCategoryId = null
      this.selectedSubCategoryId = null
      this.selectedStyleId = null
      this.searchQuery = ''
      this.filterProducts()
    },
    filterProducts() {
      let list = [...this.products]
      if (this.selectedStyleId) {
        list = list.filter(p => p.styleId == this.selectedStyleId)
      }
      if (this.selectedSubCategoryId) {
        list = list.filter(p => (p.subCategoryId || p.fullData?.subCategoryId) == this.selectedSubCategoryId)
      } else if (this.selectedCategoryId) {
        const subIds = this.getSubCategories(this.selectedCategoryId).map(s => s.id || s.Id)
        list = list.filter(p => (p.categoryId || p.fullData?.categoryId) == this.selectedCategoryId || subIds.includes(p.subCategoryId))
      }
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase()
        list = list.filter(p => (p.name || '').toLowerCase().includes(q))
      }
      this.filteredProducts = list
    },
    
    async loadStats() {
      console.log('📊 開始載入統計數據...')
      this.isLoadingStats = true
      
      try {
        // 獲取會員ID和賣家ID
        const memberId = localStorage.getItem('memberId')
        const isSeller = localStorage.getItem('isSeller')
        
        if (!memberId || isSeller !== 'true') {
          console.warn('⚠️ 用戶未登入或非賣家，使用預設統計數據')
          this.stats = {
            products: this.products.length,
            orders: 0,
            revenue: 0,
            views: 0
          }
          return
        }

        // 獲取賣家ID
        let sellersId = parseInt(memberId)
        try {
          const sellerIdResponse = await this.$api.get(`/api/ApplySeller/${memberId}/seller-id`)
          if (sellerIdResponse.success && sellerIdResponse.data) {
            let actualSellerId = null
            if (typeof sellerIdResponse.data === 'number') {
              actualSellerId = sellerIdResponse.data
            } else if (sellerIdResponse.data.sellerId) {
              actualSellerId = sellerIdResponse.data.sellerId
            } else if (sellerIdResponse.data.id) {
              actualSellerId = sellerIdResponse.data.id
            }
            if (actualSellerId && !isNaN(parseInt(actualSellerId))) {
              sellersId = parseInt(actualSellerId)
            }
          }
        } catch (error) {
          console.log('❌ 獲取賣家ID失敗，使用會員ID:', memberId)
        }

        // 並行載入統計數據
        const [ordersResult, analyticsResult] = await Promise.allSettled([
          this.loadSellerOrders(sellersId),
          this.loadSellerAnalytics(sellersId)
        ])

        // 處理訂單統計
        let pendingOrders = 0
        if (ordersResult.status === 'fulfilled' && ordersResult.value.success) {
          const orders = ordersResult.value.data || []
          // 計算待處理訂單（狀態為 pending, paid, processing 的訂單）
          pendingOrders = orders.filter(order => 
            ['pending', 'paid', 'processing', 'confirmed'].includes(order.status?.toLowerCase())
          ).length
          console.log(`📦 待處理訂單: ${pendingOrders}`)
        }

        // 處理營收統計
        let monthlyRevenue = 0
        let totalViews = 0
        if (analyticsResult.status === 'fulfilled' && analyticsResult.value.success) {
          const analytics = analyticsResult.value.data || {}
          monthlyRevenue = analytics.monthlyRevenue || 0
          totalViews = analytics.totalViews || 0
          console.log(`💰 本月營收: NT$ ${monthlyRevenue.toLocaleString()}`)
          console.log(`👁️ 商品瀏覽量: ${totalViews.toLocaleString()}`)
        }

        // 更新統計數據
        this.stats = {
          products: this.products.length,
          orders: pendingOrders,
          revenue: monthlyRevenue,
          views: totalViews
        }

        console.log('✅ 統計數據載入完成:', this.stats)
        
      } catch (error) {
        console.error('❌ 載入統計數據失敗:', error)
        // 使用預設數據
        this.stats = {
          products: this.products.length,
          orders: 0,
          revenue: 0,
          views: 0
        }
      } finally {
        this.isLoadingStats = false
      }
    },

    // 載入賣家訂單
    async loadSellerOrders(sellersId) {
      try {
        console.log('📋 載入賣家訂單，賣家ID:', sellersId)
        
        // 嘗試獲取所有訂單，然後篩選該賣家的訂單
        const result = await this.$api.get('/api/Orders')
        
        if (result.success && result.data) {
          const allOrders = Array.isArray(result.data) ? result.data : result.data.orders || []
          
          // 過濾屬於該賣家的訂單（通過訂單項目中的商品賣家ID）
          const sellerOrders = allOrders.filter(order => {
            if (order.orderItems && Array.isArray(order.orderItems)) {
              return order.orderItems.some(item => 
                item.product && item.product.sellerId === sellersId
              )
            }
            return false
          })
          
          console.log(`✅ 找到 ${sellerOrders.length} 個賣家訂單`)
          return {
            success: true,
            data: sellerOrders
          }
        } else {
          throw new Error('無法獲取訂單數據')
        }
      } catch (error) {
        console.error('❌ 載入賣家訂單失敗:', error)
        return {
          success: false,
          data: [],
          error: error.message
        }
      }
    },

    // 載入賣家分析數據
    async loadSellerAnalytics(sellersId) {
      try {
        console.log('📈 載入賣家分析數據，賣家ID:', sellersId)
        
        // 嘗試獲取賣家分析數據
        // 如果後端沒有專門的分析端點，我們從訂單和產品數據計算
        const [ordersResult, productsResult] = await Promise.allSettled([
          this.$api.get('/api/Orders'),
          this.$api.get('/api/Products')
        ])

        let monthlyRevenue = 0
        let totalViews = 0

        // 計算本月營收
        if (ordersResult.status === 'fulfilled' && ordersResult.value.success) {
          const allOrders = Array.isArray(ordersResult.value.data) ? ordersResult.value.data : ordersResult.value.data?.orders || []
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()
          
          monthlyRevenue = allOrders
            .filter(order => {
              // 篩選本月且已完成的訂單
              const orderDate = new Date(order.createdAt || order.CreatedAt)
              const isThisMonth = orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
              const isCompleted = ['delivered', 'completed'].includes(order.status?.toLowerCase())
              
              // 檢查是否是該賣家的訂單
              const isSellerOrder = order.orderItems && Array.isArray(order.orderItems) && 
                order.orderItems.some(item => item.product && item.product.sellerId === sellersId)
              
              return isThisMonth && isCompleted && isSellerOrder
            })
            .reduce((total, order) => {
              // 只計算該賣家商品的金額
              const sellerItemsTotal = order.orderItems
                .filter(item => item.product && item.product.sellerId === sellersId)
                .reduce((itemTotal, item) => itemTotal + (item.price * item.quantity), 0)
              return total + sellerItemsTotal
            }, 0)
        }

        // 計算商品瀏覽量（模擬數據，實際需要後端提供）
        if (productsResult.status === 'fulfilled' && productsResult.value.success) {
          const allProducts = Array.isArray(productsResult.value.data) ? productsResult.value.data : productsResult.value.data?.products || []
          const sellerProducts = allProducts.filter(product => product.sellerId === sellersId)
          
          // 模擬瀏覽量（實際應該從分析系統獲取）
          totalViews = sellerProducts.reduce((total, product) => {
            // 假設每個商品有 50-500 的隨機瀏覽量
            return total + (product.viewCount || Math.floor(Math.random() * 450) + 50)
          }, 0)
        }

        console.log('📊 分析數據計算完成:', { monthlyRevenue, totalViews })
        
        return {
          success: true,
          data: {
            monthlyRevenue,
            totalViews
          }
        }
        
      } catch (error) {
        console.error('❌ 載入賣家分析數據失敗:', error)
        return {
          success: false,
          data: {
            monthlyRevenue: 0,
            totalViews: 0
          },
          error: error.message
        }
      }
    },
    
    // 商品管理方法
    handleNewProduct() {
      this.editingProduct = null
      this.showProductModal = true
    },

    handleEditProduct(product) {
      console.log('🔧 開始編輯產品:', product)
      // 傳遞完整的原始產品資料而不是處理過的資料
      this.editingProduct = product.fullData || product
      console.log('📝 傳遞給編輯器的產品資料:', this.editingProduct)
      this.showProductModal = true
    },

    // 觸發刪除確認
    confirmDeleteProduct(product) {
      this.pendingDeleteProduct = product
      // 初始化並開啟 Bootstrap Modal
      const el = document.getElementById('deleteConfirmModal')
      this.deleteModalInstance = Modal.getOrCreateInstance(el)
      this.deleteModalInstance.show()
    },

    // 執行刪除（切換 IsActive 並更新資料庫）
    async performDelete() {
      if (!this.pendingDeleteProduct) return
      this.deleting = true
      try {
        const productId = this.pendingDeleteProduct.id
        // 使用後端刪除端點（後端已實作為軟刪除：IsActive=false）
        const response = await fetch(`/api/Products/${productId}`, { method: 'DELETE' })
        if (!response.ok && response.status !== 204) {
          const text = await response.text()
          throw new Error(text || `HTTP ${response.status}`)
        }

        // 關閉 Modal
        if (this.deleteModalInstance) this.deleteModalInstance.hide()

        // 重新載入商品
        await this.loadProducts()

        this.showSuccessMessage(`已刪除商品「${this.pendingDeleteProduct.name}」`)
      } catch (err) {
        console.error('刪除商品失敗:', err)
        this.showErrorMessage('刪除商品失敗，請稍後再試')
      } finally {
        this.deleting = false
        this.pendingDeleteProduct = null
      }
    },

    // 顯示成功訊息
    showSuccessMessage(message) {
      if (this.$refs.toast) {
        this.$refs.toast.success(message)
      } else {
        console.log('✅', message)
      }
    },

    // 顯示錯誤訊息
    showErrorMessage(message) {
      if (this.$refs.toast) {
        this.$refs.toast.error(message)
      } else {
        console.error('❌', message)
      }
    },

    // 顯示警告訊息
    showWarningMessage(message) {
      if (this.$refs.toast) {
        this.$refs.toast.warning(message)
      } else {
        console.warn('⚠️', message)
      }
    },

    // 顯示提示訊息
    showInfoMessage(message) {
      if (this.$refs.toast) {
        this.$refs.toast.info(message)
      } else {
        console.info('ℹ️', message)
      }
    },

   async handleSaveProduct(savedProduct) {
  try {
    console.log('✅ SellerView: 收到已保存的商品資料:', savedProduct)
    
    // 重新载入产品列表以获取最新数据
    await this.loadProducts()
    
    if (this.editingProduct) {
      this.showSuccessMessage(`商品「${savedProduct.name}」更新成功！`)
    } else {
      this.showSuccessMessage(`商品「${savedProduct.name}」建立成功！`)
    }
    
    // loadProducts 完成後統計會自動更新，不需要再次調用 loadStats
    this.showProductModal = false
    
  } catch (error) {
    console.error('❌ SellerView: 處理已保存商品時發生錯誤:', error)
    this.showErrorMessage(`更新商品列表失敗: ${error.message}`)
  }
},

    // 儲存商品到資料庫的方法（準備連接後端API時使用）
    async saveProductToDatabase(productData) {
      try {
        const apiData = {
          name: productData.formData.name,
          description: productData.formData.description,
          category: productData.formData.category,
          originalPrice: productData.formData.originalPrice,
          salePrice: productData.formData.salePrice,
          variants: productData.variants
        }
        
        // 使用真實的 API 服務
        let result
        if (this.editingProduct) {
          result = await this.$api.products.update(this.editingProduct.id, apiData)
        } else {
          result = await this.$api.products.create(apiData)
        }
        
        if (result.success) {
          console.log('資料庫儲存成功:', result.data)
          return result.data
        } else {
          throw new Error(result.error)
        }
        
      } catch (error) {
        console.error('資料庫儲存失敗:', error)
        throw error
      }
    }
  }
}
</script>

<style scoped>
.seller-center-sidebar {
  padding-top: 0; /* 移除多餘的padding */
  background-color: #f8f9fa;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  position: fixed;
  top: 90px; /* 再增加 10px，確保與 header 有更多間距 */
  bottom: 0;
  left: 0;
  z-index: 1000;
  overflow-y: auto;
  background-color: #e4dcd1; /* 改為淺棕色背景 */
}

.sidebar-header {
  background-color: rgba(0, 0, 0, 0.1); /* 深色半透明背景以提供對比 */
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: #333; /* 深色文字 */
}

.nav-link {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  color: #555; /* 深灰色文字 */
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.1); /* 深色半透明懸停背景 */
  transform: translateX(4px);
  color: #333; /* 更深的文字色 */
}

.nav-link.active {
  background-color: rgba(0, 0, 0, 0.15) !important; /* 深色半透明活動背景 */
  color: #222 !important; /* 最深的文字色 */
  font-weight: 600;
}

.main-content {
  margin-left: 280px; /* 與側邊欄寬度相同 */
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 5px; /* header 高度 90px + 10px 間距 */
}

.card {
  transition: all 0.3s ease;
  border: none !important;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
}

/* 商品管理特定樣式 */
.border-dashed {
  border-style: dashed !important;
}

.cursor-pointer {
  cursor: pointer;
}

.object-fit-cover {
  object-fit: cover;
}

.ratio-1x1 {
  aspect-ratio: 1 / 1;
}

/* 產品卡片懸停效果 */
.product-card:hover .edit-btn-container {
  opacity: 1 !important;
}

.product-card {
  transition: all 0.2s ease-in-out;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* 新增商品卡片懸停效果 */
.hover-border-dark:hover {
  border-color: #6c757d !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 響應式設計 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1024; /* 在側邊欄下方 */
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.sidebar-overlay.show {
  opacity: 1;
  visibility: visible;
}

.sidebar-toggle-btn {
  background: linear-gradient(135deg, #e4dcd1 0%, #d4ccbf 100%);
  border: 2px solid #c4bcaf;
  border-left: none;
  border-radius: 0 15px 15px 0;
  width: 32px; /* 減少寬度，讓按鈕更窄 */
  height: 80px; /* 增加高度，讓按鈕更長 */
  padding: 0;
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.15);
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  transform: translateX(0);
}

.sidebar-toggle-btn:hover {
  background: linear-gradient(135deg, #d4ccbf 0%, #c4bcaf 100%);
  border-color: #b4ac9f;
  transform: translateX(4px);
  box-shadow: 4px 6px 16px rgba(0, 0, 0, 0.2);
  color: #222;
  width: 38px; /* 懸停時稍微變寬 */
}

.sidebar-toggle-btn:focus {
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 3px rgba(228, 220, 193, 0.4);
  outline: none;
}

.sidebar-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s ease;
}

.sidebar-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #333;
}

@media (max-width: 991.98px) {
  .seller-center-sidebar {
    padding-top: 0;
  }
  
  .sidebar {
    width: 280px;
    position: fixed;
    top: 90px; /* 統一的 header 高度 */
    left: -280px;
    height: calc(100vh - 90px);
    transition: left 0.3s ease;
    z-index: 1025; /* 調整 z-index 避免與 header 衝突 */
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  }
  
  .sidebar.show {
    left: 0;
  }
  
  .main-content {
    margin-left: 0;
    padding-top: 100px; /* 調整為與桌面版一致 */
    width: 100%;
  }
  
  /* 調整側邊欄按鈕位置 */
  .sidebar-toggle-btn {
    top: 130px !important;
    z-index: 1026; /* 確保在側邊欄上方 */
  }
  
  /* 手機版側邊欄標題調整 */
  .sidebar-header {
    padding: 1rem 1.5rem !important;
  }
  
  .sidebar-header h5 {
    font-size: 1.1rem;
  }
}

@media (min-width: 992px) {
  .sidebar-toggle-btn {
    display: none !important;
  }
  
  .sidebar-overlay {
    display: none !important;
  }
  
  /* 桌面版側邊欄設定 */
  .sidebar {
    position: fixed;
    top: 90px; /* 統一的 header 高度 */
    left: 0;
    width: 280px;
    height: calc(100vh - 90px);
    z-index: 1020; /* 低於 header 但高於一般內容 */
    transform: translateX(0);
    box-shadow: none; /* 桌面版不需要陰影 */
  }
  
  .main-content {
    margin-left: 280px; /* 為側邊欄留出空間 */
    padding-top: 5px; /* header 高度 + 間距 */
  }
}

/* 統計卡片樣式 - 使用主色調系統 */
.bg-primary { background-color: #fc4600 !important; }
.bg-success { background-color: #28a745 !important; }
.bg-info { background-color: #17a2b8 !important; }
.bg-warning { background-color: #ffc107 !important; }

/* 動畫效果 */
.dashboard-view, .products-view, .orders-view, 
.analytics-view, .settings-view, .support-view {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 刪除確認 Modal 樣式 */
.modal.show {
  animation: modalFadeIn 0.3s ease-out;
}

.modal-dialog {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content {
  border: none;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1.5rem 1.5rem 0.5rem;
}

.modal-body {
  padding: 1rem 1.5rem;
}

.modal-footer {
  padding: 0.5rem 1.5rem 1.5rem;
}

.btn-danger:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* 產品預覽樣式 */
.modal-body img {
  border: 2px solid #f8f9fa;
  transition: all 0.3s ease;
}

.modal-body img:hover {
  border-color: #dee2e6;
  transform: scale(1.05);
}

/* 表單樣式改進 */
.form-select:focus,
.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* 警告樣式 */
.alert-warning.bg-opacity-10 {
  background-color: rgba(255, 193, 7, 0.1) !important;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

/* 按鈕動畫 */
.btn {
  transition: all 0.3s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
  border-color: #bd2130;
}
</style>
<template>
  <div class="products-view">
    <!-- 頁面標題 -->
    <div class="container my-4">
      <div class="row">
        <div class="col-12">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <router-link to="/" class="text-decoration-none">首頁</router-link>
              </li>
              <!-- 無篩選：顯示商品列表為當前 -->
              <li v-if="!selectedCategoryId && !selectedSubCategoryId && !selectedStyleId && !searchQuery" class="breadcrumb-item active">
                商品列表
              </li>

              <!-- 有搜尋：首頁 > 商品列表(可點) > 搜尋結果(當前) -->
              <template v-else-if="searchQuery && !selectedCategoryId && !selectedSubCategoryId && !selectedStyleId">
                <li class="breadcrumb-item">
                  <router-link to="/products" class="text-decoration-none">商品列表</router-link>
                </li>
                <li class="breadcrumb-item active">搜尋結果: "{{ searchQuery }}"</li>
              </template>

              <!-- 有風格篩選：首頁 > 商品列表(可點) > 風格館 > 風格名稱(當前) -->
              <template v-else-if="selectedStyleId">
                <li class="breadcrumb-item">
                  <router-link to="/products" class="text-decoration-none">商品列表</router-link>
                </li>
                <li class="breadcrumb-item">
                  <router-link :to="{ path: '/products', query: { showStyle: 1 } }" class="text-decoration-none">風格館</router-link>
                </li>
                <li class="breadcrumb-item active">{{ getStyleNameById(selectedStyleId) }}</li>
              </template>

              <!-- 有子分類篩選：首頁 > 商品列表(可點) > 主分類(可點：切到該主分類) > 子分類(當前) -->
              <template v-else-if="selectedSubCategoryId">
                <li class="breadcrumb-item">
                  <router-link to="/products" class="text-decoration-none">商品列表</router-link>
                </li>
                <li class="breadcrumb-item">
                  <router-link :to="{ path: '/products', query: { categoryId: selectedCategoryId } }" class="text-decoration-none">
                    {{ getCategoryNameById(selectedCategoryId) }}
                  </router-link>
                </li>
                <li class="breadcrumb-item active">{{ getSubCategoryNameById(selectedSubCategoryId) }}</li>
              </template>

              <!-- 只有主分類篩選：首頁 > 商品列表(可點) > 主分類(當前) -->
              <template v-else-if="selectedCategoryId">
                <li class="breadcrumb-item">
                  <router-link to="/products" class="text-decoration-none">商品列表</router-link>
                </li>
                <li class="breadcrumb-item active">{{ getCategoryNameById(selectedCategoryId) }}</li>
              </template>
            </ol>
          </nav>
          <!-- <h1 class="h2 mb-4"></h1> -->
        </div>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="container">
      <div class="row">
        <!-- 左側分類選單 -->
        <div class="col-lg-3 col-md-4 mb-4">
          <div class="category-sidebar">
            <!-- 手機版分類切換按鈕 -->
            <button 
              class="btn btn-outline-primary w-100 d-md-none mb-3"
              @click="toggleCategorySidebar"
            >
              <i class="fas fa-list me-2"></i>商品分類
              <i class="fas" :class="showCategorySidebar ? 'fa-chevron-up' : 'fa-chevron-down'" style="float: right;"></i>
            </button>

            <!-- 分類清單 -->
            <div class="category-list" :class="{ 'd-none d-md-block': !showCategorySidebar }">
              <div class="card">
                <div class="card-header" style="background-color: #e4dcd1; color: #022c5c;">
                  <h5 class="mb-0">
                    <i class="fas fa-tags me-2"></i>商品分類
                  </h5>
                </div>
                <div class="card-body p-0">
                  <!-- 全部商品選項 -->
                  <div class="category-item">
                    <button 
                      class="category-btn w-100 text-start"
                      :class="{ 'active': selectedCategoryId === null && selectedSubCategoryId === null && selectedStyleId === null }"
                      @click="selectCategory(null, null, null)"
                    >
                      <i class="fas fa-th-large me-2"></i>全部商品
                      <span class="product-count">({{ totalProductCount }})</span>
                    </button>
                  </div>

                  <!-- 風格館 -->
                  <div class="category-group">
                    <div class="category-item">
                      <button 
                        class="category-btn w-100 text-start d-flex justify-content-between align-items-center"
                        :class="{ 'active': selectedStyleId !== null && selectedCategoryId === null }"
                        @click="toggleStyleCategory()"
                      >
                        <span>
                          <i class="fas fa-palette me-2"></i>風格館
                          <span class="product-count">({{ getStyleTotalCount() }})</span>
                        </span>
                        <i 
                          class="fas fa-chevron-right transition-icon"
                          :class="{ 'rotate': showStyleCategory }"
                        ></i>
                      </button>
                    </div>

                    <!-- 風格選項清單 -->
                    <div 
                      class="sub-category-list"
                      :class="{ 'show': showStyleCategory }"
                    >
                      <div 
                        v-for="style in styleAttributes" 
                        :key="style.id || style.Id"
                        class="sub-category-item"
                      >
                        <button 
                          class="sub-category-btn w-100 text-start"
                          :class="{ 'active': selectedStyleId === (style.id || style.Id) }"
                          @click="selectStyle(style.id || style.Id)"
                        >
                          <i class="fas fa-circle me-2" style="font-size: 0.5rem;"></i>{{ style.value }}
                          <span class="product-count">({{ getStyleProductCount(style.id || style.Id) }})</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- 主分類清單 -->
                  <div 
                    v-for="category in categories" 
                    :key="category.id"
                    class="category-group"
                  >
                    <!-- 主分類 -->
                    <div class="category-item">
                      <button 
                        class="category-btn w-100 text-start d-flex justify-content-between align-items-center"
                        :class="{ 'active': selectedCategoryId === category.id && selectedSubCategoryId === null && selectedStyleId === null }"
                        @click="toggleCategory(category.id)"
                      >
                        <span>
                          <i :class="category.icon" class="me-2"></i>{{ category.name }}
                          <span class="product-count">({{ getCategoryProductCount(category.id) }})</span>
                        </span>
                        <i 
                          class="fas fa-chevron-right transition-icon"
                          :class="{ 'rotate': expandedCategories.includes(category.id) }"
                        ></i>
                      </button>
                    </div>

                    <!-- 子分類清單 -->
                    <div 
                      class="sub-category-list"
                      :class="{ 'show': expandedCategories.includes(category.id) }"
                    >
                      <div 
                        v-for="subCategory in getSubCategories(category.id)" 
                        :key="subCategory.id"
                        class="sub-category-item"
                      >
                        <button 
                          class="sub-category-btn w-100 text-start"
                          :class="{ 'active': selectedSubCategoryId === subCategory.id }"
                          @click="selectCategory(category.id, subCategory.id, null)"
                        >
                          <i class="fas fa-circle me-2" style="font-size: 0.5rem;"></i>{{ subCategory.name }}
                          <span class="product-count">({{ getSubCategoryProductCount(subCategory.id) }})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側商品區域 -->
        <div class="col-lg-9 col-md-8">
          <!-- 篩選器和排序 -->
          <div class="row mb-4">
            <div class="col-md-4 mb-3">
              <label class="form-label">排序方式</label>
              <select v-model="sortBy" class="form-select" @change="sortProducts">
                <option value="newest">最新上架</option>
                <option value="price-low">價格由低到高</option>
                <option value="price-high">價格由高到低</option>
                <option value="popular">熱門商品</option>
              </select>
            </div>
            <div class="col-md-8 mb-3">
              <label class="form-label">搜尋商品</label>
              <div class="input-group">
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  class="form-control" 
                  placeholder="輸入商品名稱..."
                  @input="searchProducts"
                >
                <button class="btn btn-outline-secondary" type="button">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 目前選擇的分類顯示 -->
          <!-- <div v-if="selectedCategoryId || selectedSubCategoryId || selectedStyleId" class="mb-3">
            <div class="alert alert-info d-flex justify-content-between align-items-center">
              <span>
                <i class="fas fa-filter me-2"></i>
                目前篩選：{{ getCurrentFilterName() }}
              </span>
              <button 
                class="btn btn-sm btn-outline-secondary"
                @click="clearAllFilters"
              >
                <i class="fas fa-times me-1"></i>清除篩選
              </button>
            </div>
          </div> -->

          <!-- 商品網格 -->
          <!-- 商品網格 -->
          <div class="row">
            <div class="col-12" v-if="loading">
              <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">載入中...</span>
                </div>
                <p class="mt-2">載入商品中...</p>
              </div>
            </div>
            
            <div class="col-12" v-else-if="filteredProducts.length === 0">
              <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>沒有找到符合條件的商品</h4>
                <p class="text-muted">請嘗試調整搜尋條件或選擇其他分類</p>
              </div>
            </div>

            <template v-else>
              <div 
                v-for="product in paginatedProducts" 
                :key="product.id" 
                class="col-lg-4 col-md-6 mb-4"
              >
                <!-- 商品卡片 -->
                <div class="card h-100 shadow-sm product-card" @click="goToProduct(product.id)">
                  <div class="card-img-top position-relative overflow-hidden" style="aspect-ratio: 1;">
                    <img 
                      :src="product.image" 
                      :alt="product.name" 
                      class="w-100 h-100 object-fit-cover"
                    >
                    <div v-if="product.isNew" class="position-absolute top-0 start-0 m-2">
                      <span class="badge bg-danger">新品</span>
                    </div>
                    <div class="card-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                      <button class="btn btn-detail btn-sm">查看詳情</button>
                    </div>
                  </div>
                  <div class="card-body">
                    <h6 class="card-title text-truncate mb-2" :title="product.name">{{ product.name }}</h6>
                    <div class="d-flex align-items-center mb-2">
                      <div class="rating me-2">
                        <i 
                          v-for="star in 5" 
                          :key="star"
                          class="fas fa-star fa-sm"
                          :class="star <= Math.floor(product.rating) ? 'text-warning' : 'text-light'"
                        ></i>
                        <span class="ms-1 small text-muted">{{ formatRating(product.rating) }}</span>
                      </div>
                    </div>
                    <div class="price-section">
                      <span class="h6 text-danger mb-0">NT$ {{ product.price.toLocaleString() }}</span>
                      <span 
                        v-if="product.originalPrice > product.price" 
                        class="small text-muted text-decoration-line-through ms-2"
                      >
                        NT$ {{ product.originalPrice.toLocaleString() }}
                      </span>
                    </div>
                    <div class="small text-muted mt-1">已售 {{ product.soldCount }} 件</div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- 分頁 -->
          <div class="row mt-5" v-if="totalPages > 1">
            <div class="col-12">
              <nav aria-label="商品分頁">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="changePage(currentPage - 1)">上一頁</button>
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
                    <button class="page-link" @click="changePage(currentPage + 1)">下一頁</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductsView',
  data() {
    return {
      products: [],
      filteredProducts: [],
      loading: true,
      searchQuery: '',
      sortBy: 'newest',
      currentPage: 1,
      itemsPerPage: 12,
      
      // 分類相關
      categories: [],
      subCategories: [],
      selectedCategoryId: null,
      selectedSubCategoryId: null,
      expandedCategories: [],
      showCategorySidebar: false,
      
      // 風格相關
      allAttributes: [], // 儲存所有屬性資料
      allAttributeValues: [], // 儲存所有屬性值資料
      productAttributeValues: [], // 儲存商品與屬性值的關聯
      styleAttributes: [],
      selectedStyleId: null,
      showStyleCategory: false
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage)
    },
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, start + 4)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredProducts.slice(start, end)
    },
    totalProductCount() {
      return this.products.length
    }
  },
  mounted() {
    // 按正確順序載入資料
    this.loadData()
  },
  methods: {
    // 依路由 query 自動套用分類/子分類/風格篩選
    applyFiltersFromQuery() {
      const q = (this.$route && this.$route.query) || {}
      console.log('🔍 路由查詢參數:', q)
      
      // 兼容不同命名
      const pick = (obj, keys) => keys.reduce((acc, k) => (acc !== undefined ? acc : obj[k]), undefined)
      const toNumOrKeep = (v) => {
        if (v === undefined || v === null || v === '') return null
        const n = Number(v)
        return Number.isNaN(n) ? v : n
      }

      let categoryId = toNumOrKeep(pick(q, ['categoryId', 'categoryID', 'catId']))
      let subCategoryId = toNumOrKeep(pick(q, ['subCategoryId', 'subCategoryID', 'subId']))
      let styleId = toNumOrKeep(pick(q, ['styleId', 'styleID']))
      const showStyle = toNumOrKeep(pick(q, ['showStyle']))
      const searchQuery = pick(q, ['q', 'query', 'search']) || ''
      const sortBy = pick(q, ['sortBy']) || 'newest'
      const sortDirection = pick(q, ['sortDirection']) || 'desc'
      const isNew = pick(q, ['isNew']) === 'true'
      
      console.log('🎯 搜尋查詢:', searchQuery)
      console.log('📊 排序設定:', { sortBy, sortDirection, isNew })

      // 先重置，確保 /products 無參數時為『全部商品』
      this.selectedCategoryId = null
      this.selectedSubCategoryId = null
      this.selectedStyleId = null
      this.searchQuery = searchQuery
      
      // 設定排序方式
      if (isNew && (sortBy === 'CreatedAt' || sortDirection === 'desc')) {
        this.sortBy = 'newest'
        console.log('🆕 設定為新品排序模式')
      } else if (sortBy && ['newest', 'price-low', 'price-high', 'popular'].includes(sortBy)) {
        this.sortBy = sortBy
      }
      
      console.log('📝 設置搜尋查詢為:', this.searchQuery)
      console.log('📊 設置排序為:', this.sortBy)

      // 優先順序：風格 > 子分類 > 主分類
      if (styleId !== null) {
        this.selectedStyleId = styleId
        this.showStyleCategory = true
      } else if (showStyle) {
        // 只展開風格面板，不套用特定風格
        this.showStyleCategory = true
      } else if (subCategoryId !== null) {
        this.selectedSubCategoryId = subCategoryId
        // 從子分類推回主分類
        const sub = this.subCategories.find(s => (s.id || s.Id) == subCategoryId)
        const parentCatId = sub ? (sub.categoryId || sub.CategoryId) : (categoryId !== null ? categoryId : null)
        this.selectedCategoryId = parentCatId
        if (parentCatId !== null && !this.expandedCategories.includes(parentCatId)) {
          this.expandedCategories.push(parentCatId)
        }
      } else if (categoryId !== null) {
        this.selectedCategoryId = categoryId
        if (!this.expandedCategories.includes(categoryId)) {
          this.expandedCategories.push(categoryId)
        }
      } else {
        // 無任何參數：回到全部商品，可選擇隱藏風格區塊
        // this.showStyleCategory = false
      }

      // 若商品已載入則套用篩選
      if (Array.isArray(this.products) && this.products.length > 0) {
        this.currentPage = 1
        this.filterProducts()
      } else {
        // 如果商品還沒載入，至少初始化 filteredProducts
        this.filteredProducts = []
      }
    },
    // 按順序載入所有資料
    async loadData() {
      try {
        // 1. 先載入所有屬性和屬性值（用於商品風格匹配）
        await Promise.all([
          this.loadAllAttributes(),
          this.loadAllAttributeValues()
        ])
        
        // 2. 載入分類和處理風格屬性
        await Promise.all([
          this.loadCategories(),
          this.processStyleAttributes()
        ])
        
        // 3. 載入商品資料
        await this.loadProducts()
        
        // 4. 載入 ProductAttributeValues 關聯（如果需要）
        await this.loadProductAttributeValues()
        
        // 5. 處理商品風格ID匹配
        this.updateProductStyleIds()

        // 6. 依路由參數自動套用篩選
        this.applyFiltersFromQuery()
        
        console.log('🎉 所有資料載入完成')
      } catch (error) {
        console.error('💥 資料載入失敗:', error)
      }
    },

    // 載入所有屬性資料
    async loadAllAttributes() {
      try {
        console.log('🏷️ 載入所有屬性資料...')
        const response = await fetch('/api/Attributes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        this.allAttributes = data
        console.log('✅ 所有屬性資料載入完成:', this.allAttributes.length, '項')
        
      } catch (error) {
        console.error('❌ 載入屬性資料失敗:', error)
        this.allAttributes = []
      }
    },

    // 載入所有屬性值資料
    async loadAllAttributeValues() {
      try {
        console.log('🎨 載入所有屬性值資料...')
        const response = await fetch('/api/AttributeValues', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        this.allAttributeValues = data
        console.log('✅ 所有屬性值資料載入完成:', this.allAttributeValues.length, '項')
        
      } catch (error) {
        console.error('❌ 載入屬性值資料失敗:', error)
        this.allAttributeValues = []
      }
    },

    // 載入 ProductAttributeValues 關聯資料
    async loadProductAttributeValues() {
      try {
        console.log('🔗 載入 ProductAttributeValues 關聯資料...')
        
        // 嘗試載入 ProductAttributeValues API
        const response = await fetch('/api/ProductAttributeValues', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          this.productAttributeValues = data
          console.log('✅ ProductAttributeValues 載入完成:', data.length, '項')
          
          // 將 ProductAttributeValues 關聯到對應的商品
          this.mapProductAttributeValues()
        } else {
          console.log('⚠️ ProductAttributeValues API 不存在，假設商品資料已包含關聯')
        }
        
      } catch (error) {
        console.log('⚠️ ProductAttributeValues API 載入失敗，假設商品資料已包含關聯:', error)
      }
    },

    // 將 ProductAttributeValues 對應到商品
    mapProductAttributeValues() {
      if (!this.productAttributeValues || !this.products) return
      
      console.log('🔗 開始對應 ProductAttributeValues 到商品...')
      
      this.products.forEach(product => {
        // 找到屬於這個商品的所有 ProductAttributeValues
        const productPAVs = this.productAttributeValues.filter(pav => {
          const productId = pav.productId || pav.ProductId || pav.product_id
          return productId == product.id
        })
        
        if (productPAVs.length > 0) {
          product.productAttributeValues = productPAVs
          console.log(`🔗 商品 "${product.name}" 關聯了 ${productPAVs.length} 個屬性值`)
        }
      })
    },

    // 處理風格屬性 - 從所有屬性值中篩選出風格相關的
    async processStyleAttributes() {
      try {
        console.log('🎭 開始處理風格屬性...')
        
        if (this.allAttributes.length === 0 || this.allAttributeValues.length === 0) {
          console.log('⚠️ 缺少屬性或屬性值資料，無法處理風格屬性')
          return
        }
        
        // 找到風格相關的屬性
        const styleAttributesList = this.allAttributes.filter(attr => 
          attr.name && attr.name.includes('風格')
        )
        
        console.log('🎨 找到風格屬性:', styleAttributesList)
        
        // 收集所有風格屬性的 AttributeValues
        this.styleAttributes = []
        
        for (const styleAttr of styleAttributesList) {
          const styleAttrId = styleAttr.id || styleAttr.Id
          
          // 找到屬於這個風格屬性的所有屬性值
          const styleValues = this.allAttributeValues.filter(av => {
            const avAttrId = av.attributeId || av.Attribute_Id || av.attribute_id
            return avAttrId == styleAttrId
          })
          
          // 將風格屬性值加入到 styleAttributes 中
          this.styleAttributes.push(...styleValues)
        }
        
        console.log('✅ 風格屬性處理完成:', this.styleAttributes)
        
      } catch (error) {
        console.error('❌ 處理風格屬性失敗:', error)
        this.styleAttributes = []
      }
    },

    // 載入分類資料
    async loadCategories() {
      try {
        console.log('載入分類資料...')
        const response = await fetch('/api/Categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        console.log('Categories API Response Status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Categories API Data:', data)
        
        // 篩選可見的分類並排序
        this.categories = data
          .filter(category => category.isVisible !== false)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map(category => ({
            ...category,
            icon: this.getCategoryIcon(category.name)
          }))

        // 載入子分類
        if (this.categories.length > 0) {
          await this.loadSubCategories()
        }
        
      } catch (error) {
        console.error('載入分類失敗:', error)
        // 當 API 載入失敗時，使用空的分類列表
        this.categories = []
        this.subCategories = []
      }
    },

    // 載入子分類資料
    async loadSubCategories() {
      try {
        console.log('載入子分類資料...')
        
        // 使用正確的 API 端點命名 (PascalCase 無底線)
        const response = await fetch('/api/SubCategories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        console.log('SubCategories API Response Status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('SubCategories API Data:', data)
          
          // 篩選可見的子分類並排序
          this.subCategories = data
            .filter(subCategory => subCategory.isVisible !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            
          console.log('✅ 成功載入子分類資料:', this.subCategories.length, '個子分類')
        } else {
          console.log('SubCategories API 不存在，使用測試資料')
          throw new Error('API not found')
        }
        
      } catch (error) {
        console.error('載入子分類失敗，使用空的子分類列表:', error)
        // 當 API 載入失敗時，使用空的子分類列表
        this.subCategories = []
      }
    },

    // 根據分類名稱取得圖示
    getCategoryIcon(categoryName) {
      const iconMap = {
        '男裝': 'fas fa-male',
        '女裝': 'fas fa-female',
  '配件': 'fas fa-shopping-bag',
        '鞋子': 'fas fa-shoe-prints',
        '包包': 'fas fa-shopping-bag',
        '飾品': 'fas fa-gem'
      }
      return iconMap[categoryName] || 'fas fa-tag'
    },

    // 載入商品資料
    async loadProducts() {
      try {
        this.loading = true
        console.log('載入商品資料...')
        
        const response = await fetch('/api/Products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        console.log('Products API Response Status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Products API Data (raw):', data)

        // 資料結構相容處理：後端為 C# DTO 可能使用 PascalCase (ProductImages, ProductAttributeValues, ImagesUrl)
        const normalizeImages = (p) => {
          const rawImages = p.productImages || p.ProductImages || []
          return rawImages.map(img => ({
            id: img.id || img.Id,
            sortOrder: img.sortOrder || img.SortOrder || 0,
            // 統一取圖片 URL 欄位 (ImagesUrl / imagePath / url)
            url: img.ImagesUrl || img.imagePath || img.url || img.imagesUrl
          })).filter(i => i.url)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        }

        const normalizeAttributeValues = (p) => p.productAttributeValues || p.ProductAttributeValues || []

        this.products = data.map(product => {
          const imagesArr = normalizeImages(product)
          return {
            id: product.id || product.Id,
            name: product.name || product.Name,
            price: product.price ?? product.Price ?? 0,
            originalPrice: product.originalPrice || product.OriginalPrice || product.discountPrice || product.DiscountPrice || product.price || product.Price,
            description: product.description || product.Description,
            stock: product.totalStock || product.TotalStock || product.stock || product.Stock,
            categoryId: product.categoryId || product.CategoryId,
            subCategoryId: product.subCategoryId || product.SubCategoryId,
            rating: product.rating ?? product.Rating ?? 4.0,
            soldCount: product.soldCount || product.SoldCount || 0,
            isNew: product.isNew || product.IsNew || false,
            image: imagesArr[0]?.url || this.getFallbackImage(),
            images: imagesArr.map(i => i.url).length ? imagesArr.map(i => i.url) : [this.getFallbackImage()],
            productImages: imagesArr, // 保留正規化後的圖片陣列
            productAttributeValues: normalizeAttributeValues(product),
            styleId: null
          }
        })
        
        console.log('Processed Products:', this.products)
        
      } catch (error) {
        console.error('載入商品失敗:', error)
        // 當 API 載入失敗時，顯示空的商品列表
        this.products = []
        this.filteredProducts = []
        this.filteredProducts = []
      } finally {
        this.loading = false
      }
    },

    // 預設圖片 (僅在後端沒資料時顯示)
    getFallbackImage() {
      return 'https://via.placeholder.com/400?text=No+Image'
    },

    // 舊方法保留兼容 (若其他地方呼叫)
    getProductImage(product) {
      if (!product) return this.getFallbackImage()
      if (product.productImages && product.productImages.length > 0) {
        const first = [...product.productImages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))[0]
        return first.imagePath || first.ImagesUrl || first.url || this.getFallbackImage()
      }
      if (product.ProductImages && product.ProductImages.length > 0) {
        const first = [...product.ProductImages].sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0))[0]
        return first.ImagesUrl || first.imagePath || first.url || this.getFallbackImage()
      }
      return this.getFallbackImage()
    },

    getProductImages(product) {
      if (!product) return [this.getFallbackImage()]
      const imgs = product.productImages || product.ProductImages
      if (imgs && imgs.length > 0) {
        return [...imgs]
          .sort((a, b) => (a.sortOrder || a.SortOrder || 0) - (b.sortOrder || b.SortOrder || 0))
          .map(i => i.imagePath || i.ImagesUrl || i.url)
          .filter(Boolean)
      }
      return [this.getProductImage(product)]
    },

    // 取得商品風格ID - 通過 ProductAttributeValues 查找
    getProductStyleId(product) {
      console.log(`🎨 開始查找商品 "${product.name}" (ID: ${product.id}) 的風格屬性...`)
      
      // 檢查商品是否有 ProductAttributeValues
      if (!product.productAttributeValues || product.productAttributeValues.length === 0) {
        console.log(`⚠️ 商品 "${product.name}" 沒有 ProductAttributeValues`)
        return null
      }
      
      console.log(`🔍 商品 "${product.name}" 的 ProductAttributeValues:`, product.productAttributeValues)
      
      // 遍歷商品的所有屬性值關聯
      for (const pav of product.productAttributeValues) {
        console.log(`🔗 檢查 ProductAttributeValue:`, pav)
        
        // 確認這個 ProductAttributeValue 屬於當前商品
        const productId = pav.productId || pav.ProductId || pav.product_id
        if (productId && productId != product.id) {
          console.log(`⚠️ ProductAttributeValue 不屬於當前商品 (Product ID: ${productId} vs ${product.id})`)
          continue
        }
        
        // 取得 AttributeValueId
        const attributeValueId = pav.attributeValueId || pav.AttributeValueId || pav.attribute_value_id
        
        if (!attributeValueId) {
          console.log(`❌ ProductAttributeValue 缺少 AttributeValueId:`, pav)
          continue
        }
        
        console.log(`🔍 檢查 AttributeValueId: ${attributeValueId}`)
        
        // 在所有 AttributeValues 中尋找匹配的ID
        const matchingAttributeValue = this.allAttributeValues.find(av => {
          const avId = av.id || av.Id
          return avId == attributeValueId
        })
        
        if (matchingAttributeValue) {
          console.log(`✅ 找到匹配的 AttributeValue:`, matchingAttributeValue)
          
          // 檢查這個 AttributeValue 是否屬於風格屬性
          const avAttrId = matchingAttributeValue.attributeId || matchingAttributeValue.Attribute_Id || matchingAttributeValue.attribute_id
          
          const styleAttribute = this.allAttributes.find(attr => {
            const attrId = attr.id || attr.Id
            const isStyleAttribute = attr.name && attr.name.includes('風格')
            const isMatch = attrId == avAttrId && isStyleAttribute
            
            if (isMatch) {
              console.log(`🎯 找到風格屬性: ${attr.name} (ID: ${attrId})`)
            }
            
            return isMatch
          })
          
          if (styleAttribute) {
            console.log(`🎯 商品 "${product.name}" 的風格: ${matchingAttributeValue.value} (AttributeValue ID: ${matchingAttributeValue.id || matchingAttributeValue.Id})`)
            // 返回 AttributeValue 的 ID，這樣才能與 styleAttributes 中的項目匹配
            return matchingAttributeValue.id || matchingAttributeValue.Id
          }
        } else {
          console.log(`❌ 找不到 ID 為 ${attributeValueId} 的 AttributeValue`)
        }
      }
      
      console.log(`❌ 商品 "${product.name}" 沒有找到對應的風格屬性`)
      return null
    },

    // 更新所有商品的風格 ID
    updateProductStyleIds() {
      console.log('🔄 重新處理商品風格 ID...')
      console.log('📊 資料狀態檢查:')
      console.log(`  - 商品數量: ${this.products?.length || 0}`)
      console.log(`  - 風格屬性數量: ${this.styleAttributes?.length || 0}`)
      console.log(`  - 所有屬性數量: ${this.allAttributes?.length || 0}`)
      console.log(`  - 所有屬性值數量: ${this.allAttributeValues?.length || 0}`)
      
      if (!this.products || this.products.length === 0) {
        console.log('❌ 沒有商品資料')
        return
      }
      
      if (!this.allAttributes || this.allAttributes.length === 0) {
        console.log('❌ 沒有屬性資料')
        return
      }
      
      if (!this.allAttributeValues || this.allAttributeValues.length === 0) {
        console.log('❌ 沒有屬性值資料')
        return
      }
      
      let updatedCount = 0
      let matchedCount = 0
      
      this.products.forEach(product => {
        const newStyleId = this.getProductStyleId(product)
        
        if (newStyleId !== product.styleId) {
          console.log(`🔄 更新商品 ${product.name} 的風格 ID: ${product.styleId} → ${newStyleId}`)
          product.styleId = newStyleId
          updatedCount++
        }
        
        if (newStyleId) {
          matchedCount++
        }
      })
      
      console.log(`✅ 商品風格 ID 更新完成`)
      console.log(`📊 統計結果:`)
      console.log(`  - 共更新: ${updatedCount} 個商品`)
      console.log(`  - 有風格的商品: ${matchedCount}/${this.products.length}`)
      
      // 更新風格統計
      this.updateStyleCounts()
      
      // 觸發響應式更新
      this.filteredProducts = [...this.products]
    },

    // 更新風格商品統計
    updateStyleCounts() {
      if (!this.styleAttributes || !this.products) return
      
      console.log('🔢 開始更新風格統計...')
      
      this.styleAttributes.forEach(style => {
        const styleId = style.id || style.Id
        const count = this.products.filter(product => {
          return product.styleId == styleId || 
                 product.styleId === parseInt(styleId) ||
                 product.styleId === String(styleId)
        }).length
        
        style.productCount = count
        console.log(`📊 風格 "${style.value}" (ID: ${styleId}) 有 ${count} 個商品`)
      })
    },

    // 分類相關方法
    getSubCategories(categoryId) {
      return this.subCategories.filter(sub => sub.categoryId === categoryId)
    },

    getCategoryProductCount(categoryId) {
      // 計算該分類下所有商品（包含子分類的商品）
      return this.products.filter(product => {
        // 直接屬於該分類的商品
        if (product.categoryId === categoryId) {
          return true
        }
        // 屬於該分類下子分類的商品
        const subCategories = this.subCategories.filter(sub => sub.categoryId === categoryId)
        const subCategoryIds = subCategories.map(sub => sub.id)
        return subCategoryIds.includes(product.subCategoryId)
      }).length
    },

    getSubCategoryProductCount(subCategoryId) {
      return this.products.filter(product => product.subCategoryId === subCategoryId).length
    },

    // 風格相關方法
    getStyleProductCount(styleId) {
      const count = this.products.filter(product => {
        // 檢查不同格式的 ID 匹配
        return product.styleId === styleId || 
               product.styleId === parseInt(styleId) ||
               product.styleId === String(styleId)
      }).length
      return count
    },

    getStyleTotalCount() {
      // 返回所有有風格標籤的商品數量
      const count = this.products.filter(product => product.styleId).length
      return count
    },

    toggleStyleCategory() {
      this.showStyleCategory = !this.showStyleCategory
    },

    selectStyle(styleId) {
      this.selectedStyleId = styleId
      this.selectedCategoryId = null
      this.selectedSubCategoryId = null
      this.currentPage = 1
      this.filterProducts()
      
      // 關閉手機版側邊欄
      this.showCategorySidebar = false
    },

    toggleCategory(categoryId) {
      const index = this.expandedCategories.indexOf(categoryId)
      if (index > -1) {
        this.expandedCategories.splice(index, 1)
      } else {
        this.expandedCategories.push(categoryId)
      }
      
      // 如果已經選擇了這個分類，就直接選擇它
      if (this.selectedCategoryId !== categoryId || this.selectedSubCategoryId !== null) {
        this.selectCategory(categoryId, null, null)
      }
    },

    selectCategory(categoryId, subCategoryId, styleId = null) {
      this.selectedCategoryId = categoryId
      this.selectedSubCategoryId = subCategoryId
      this.selectedStyleId = styleId
      this.currentPage = 1
      this.filterProducts()
      
      // 關閉手機版側邊欄
      this.showCategorySidebar = false
    },

    clearAllFilters() {
      this.selectedCategoryId = null
      this.selectedSubCategoryId = null
      this.selectedStyleId = null
      this.filterProducts()
    },

    // 供麵包屑顯示名稱
    getCategoryNameById(id) {
      if (!id) return ''
      const c = this.categories.find(cat => (cat.id || cat.Id) == id)
      return c ? (c.name || c.Name) : ''
    },
    getSubCategoryNameById(id) {
      if (!id) return ''
      const s = this.subCategories.find(sc => (sc.id || sc.Id) == id)
      return s ? (s.name || s.Name) : ''
    },
    getStyleNameById(id) {
      if (!id) return ''
      const st = this.styleAttributes.find(st => (st.id || st.Id) == id)
      return st ? (st.value || st.Value) : ''
    },

    getCurrentFilterName() {
      if (this.selectedStyleId) {
        const style = this.styleAttributes.find(style => style.id === this.selectedStyleId)
        return `風格館 > ${style?.value || ''}`
      } else if (this.selectedSubCategoryId) {
        const subCategory = this.subCategories.find(sub => sub.id === this.selectedSubCategoryId)
        const category = this.categories.find(cat => cat.id === this.selectedCategoryId)
        return `${category?.name} > ${subCategory?.name}`
      } else if (this.selectedCategoryId) {
        const category = this.categories.find(cat => cat.id === this.selectedCategoryId)
        return category?.name
      }
      return ''
    },

    toggleCategorySidebar() {
      this.showCategorySidebar = !this.showCategorySidebar
    },
    // 篩選商品
    filterProducts() {
      console.log('🎯 開始篩選商品')
      console.log('🎯 總商品數量:', this.products.length)
      console.log('🎯 搜尋查詢:', this.searchQuery)
      console.log('🎯 選擇的分類ID:', this.selectedCategoryId)
      console.log('🎯 選擇的子分類ID:', this.selectedSubCategoryId)
      console.log('🎯 選擇的風格ID:', this.selectedStyleId)
      
      let filtered = [...this.products]
      
      // 依風格篩選
      if (this.selectedStyleId) {
        console.log(`🎯 篩選風格 ID: ${this.selectedStyleId}`)
        filtered = filtered.filter(product => {
          const match = product.styleId == this.selectedStyleId || 
                       product.styleId === parseInt(this.selectedStyleId) ||
                       product.styleId === String(this.selectedStyleId)
          if (match) {
            console.log(`✅ 商品 "${product.name}" 符合風格篩選 (styleId: ${product.styleId})`)
          }
          return match
        })
        console.log(`📊 風格篩選結果: ${filtered.length} 個商品`)
      }
      // 依分類篩選（當沒有選擇風格時）
      else if (this.selectedSubCategoryId) {
        // 選擇了子分類
        filtered = filtered.filter(product => product.subCategoryId === this.selectedSubCategoryId)
      } else if (this.selectedCategoryId) {
        // 選擇了主分類，包含該分類下的所有子分類商品
        filtered = filtered.filter(product => {
          // 直接屬於該分類的商品
          if (product.categoryId === this.selectedCategoryId) {
            return true
          }
          // 屬於該分類下子分類的商品
          const subCategories = this.subCategories.filter(sub => sub.categoryId === this.selectedCategoryId)
          const subCategoryIds = subCategories.map(sub => sub.id)
          return subCategoryIds.includes(product.subCategoryId)
        })
      }
      
      // 依搜尋關鍵字篩選
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        console.log('🔍 搜尋關鍵字:', query)
        console.log('🔍 搜尋前商品數量:', filtered.length)
        
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query))
        )
        
        console.log('🔍 搜尋後商品數量:', filtered.length)
        console.log('🔍 符合搜尋的商品:', filtered.map(p => p.name))
      }
      
      this.filteredProducts = filtered
      console.log('🎯 最終篩選結果:', this.filteredProducts.length, '個商品')
      this.sortProducts()
      this.currentPage = 1
    },
    sortProducts() {
      switch (this.sortBy) {
        case 'price-low':
          this.filteredProducts.sort((a, b) => a.price - b.price)
          break
        case 'price-high':
          this.filteredProducts.sort((a, b) => b.price - a.price)
          break
        case 'popular':
          this.filteredProducts.sort((a, b) => b.soldCount - a.soldCount)
          break
        case 'newest':
        default:
          this.filteredProducts.sort((a, b) => b.id - a.id)
          break
      }
    },
    searchProducts() {
      this.filterProducts()
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    // 顯示評分（四捨五入到小數第一位）
    formatRating(value) {
      const n = Number(value)
      if (Number.isNaN(n)) return '0.0'
      return n.toFixed(1)
    },
    goToProduct(productId) {
      this.$router.push(`/product/${productId}`)
    }
  },
  watch: {
    $route() {
      // 當路由 query 改變時，依參數套用篩選（不重抓資料）
      this.applyFiltersFromQuery()
    }
  }
}
</script>

<style scoped>
.products-view {
  min-height: calc(100vh - 200px);
  margin-top: 90px; /* 為固定的 AppHeader 留出空間 */
}

.breadcrumb {
  background: none;
  padding: 0px 0px 0px 30px;
  margin-bottom: 1rem;
}

.btn-detail{
  background-color: #022c5c;
  border: none;
  color: #faf6eb;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.btn-detail:hover{
  background-color: #e4dcd1;
  color:#022c5c;
}

/* 分類側邊欄樣式 */
.category-sidebar {
  position: sticky;
  top: 100px;
}

.category-list .card {
  border: 1px solid #e4dcd1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.category-item {
  border-bottom: 1px solid #e4dcd1;
}

.category-item:last-child {
  border-bottom: none;
}

.category-btn {
  background: #faf6eb;
  border: none;
  padding: 12px 16px;
  color: #022c5c;
  transition: all 0.3s ease;
  position: relative;
}

.category-btn:hover {
  background-color: #e4dcd1;
  color: #022c5c;
}

.category-btn.active {
  background-color: #022c5c;
  color: #e4dcd1;
  font-weight: 500;
}

.category-btn.active .product-count {
  color: rgba(255, 255, 255, 0.8);
}

.product-count {
  color: #022c5c;
  font-size: 0.875rem;
  margin-left: 4px;
}

.transition-icon {
  transition: transform 0.3s ease;
}

.transition-icon.rotate {
  transform: rotate(90deg);
}

/* 子分類樣式 */
.sub-category-list {
  background-color: #faf6eb;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.sub-category-list.show {
  max-height: 300px;
}

.sub-category-item {
  border-bottom: 1px solid #faf6eb;
}

.sub-category-item:last-child {
  border-bottom: none;
}

.sub-category-btn {
  background: none;
  border: none;
  padding: 10px 16px 10px 32px;
  color: #022c5c;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.sub-category-btn:hover {
  background-color: #e4dcd1;
  color: #022c5c;
}

.sub-category-btn.active {
  background-color: #022c5c;
  color: #faf6eb;
  font-weight: 500;
}

.sub-category-btn.active .product-count {
  color: rgba(255, 255, 255, 0.8);
}

/* 手機版分類切換 */
@media (max-width: 767px) {
  .category-sidebar {
    position: static;
  }
  
  .category-list {
    margin-bottom: 1rem;
  }
}

/* 商品卡片樣式 */
.pagination .page-link {
  color: #022c5c;
  background-color: #faf6eb;
  border-color: #e4dcd1;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.pagination .page-link:hover {
  color: #022c5c;
  background-color: #e4dcd1;
  border-color: #e4dcd1;
}

.pagination .page-link:focus {
  color: #022c5c;
  background-color: #e4dcd1;
  box-shadow: 0 0 0 0.2rem rgba(2, 44, 92, 0.15);
}

.pagination .page-item.active .page-link {
  color: #faf6eb;
  background-color: #022c5c;
  border-color: #022c5c;
}

.pagination .page-item.disabled .page-link {
  color: rgba(2, 44, 92, 0.4);
  background-color: #faf6eb;
  border-color: #e4dcd1;
  opacity: 0.6;
}

.form-select:focus,
.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.product-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}

.product-card .card-overlay {
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.product-card:hover .card-overlay {
  opacity: 1;
}

.product-card .card-body {
  /* 背景色與文字色在這裡改 */
  background-color: #faf6eb; /* 改成你要的顏色 */
  color: #022c5c;
}
/* 若滑過卡片也要變色可加這段 */
.product-card:hover .card-body {
  background-color: #e4dcd1;
}
.rating .fa-star {
  font-size: 0.75rem;
}

/* 分類篩選提示 */
.alert-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}
</style>

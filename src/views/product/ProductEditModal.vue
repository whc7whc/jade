<template>
  <div v-if="show" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); z-index: 1060;">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ editingProduct ? '編輯商品資料' : '新增商品資料' }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body">
          <!-- 基本資料 -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label fw-semibold">商品名稱 <span class="text-danger">*</span></label>
              <input 
                type="text" 
                class="form-control"
                v-model="formData.name"
                maxlength="100"
              />
              <div class="form-text">{{ formData.name.length }}/100字</div>
            </div>
             <!-- 主分類選擇 -->
            <div class="col-md-3">
              <label class="form-label fw-semibold">主分類 <span class="text-danger">*</span></label>
              <select class="form-select" v-model="formData.categoryId" @change="onCategoryChange">
                <option value="">請選擇主分類</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            
            <!-- 子分類選擇 -->
            <div class="col-md-3">
              <label class="form-label fw-semibold">子分類 <span class="text-danger">*</span></label>
              <select class="form-select" v-model="formData.subCategoryId" :disabled="!formData.categoryId">
                <option value="">請選擇子分類</option>
                <option v-for="subCategory in filteredSubCategories" :key="subCategory.id" :value="subCategory.id">
                  {{ subCategory.name }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label fw-semibold mb-0">風格館</label>
    <button type="button"
                        class="btn btn-sm btn-outline-secondary"
                        @click="fillWithTestProduct(29)"
      v-if="!editingProduct"
                        :disabled="loadingProductData">
                  <span v-if="loadingProductData" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  測試用
                </button>
              </div>
              <select class="form-select" v-model="formData.styleId">
                <option value="">請選擇風格館</option>
                <option v-for="style in styleOptions" :key="style.value" :value="style.value">
                  {{ style.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- 🔥 更新的商品圖片管理 -->
          <div class="mb-4">
            <h6 class="fw-semibold mb-3">商品圖片</h6>
            
            <!-- 圖片上傳區域 -->
            <div class="border-2 border-dashed border-secondary rounded p-4 text-center mb-3">
              <i class="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
              <p class="text-muted mb-2">拖拽圖片到這裡或點擊選擇</p>
              <input 
                type="file" 
                ref="fileInput"
                @change="handleFileSelect"
                multiple 
                accept="image/*"
                class="form-control"
                style="max-width: 300px; margin: 0 auto;"
              />
            </div>
            
            <!-- 顯示已選擇的圖片 -->
            <div v-if="selectedImages.length > 0" class="mt-3">
              <h6>已選擇圖片 ({{ selectedImages.length }}/10)</h6>
              <div class="row g-2">
                <div v-for="(image, index) in selectedImages" :key="index" class="col-md-2">
                  <div class="card">
                    <img :src="image.preview || image.url" class="card-img-top" style="height: 100px; object-fit: cover;">
                    <div class="card-body p-2">
                      <small class="text-muted">{{ image.name }}</small>
                      <div class="d-flex gap-1 mt-1">
                        <button @click="setAsMainImage(index)" class="btn btn-sm btn-outline-primary flex-fill">主圖</button>
                        <button @click="removeSelectedImage(index)" class="btn btn-sm btn-outline-danger">×</button>
                      </div>
                      <!-- 🔥 顯示上傳狀態 -->
                      <div v-if="image.file && !image.isUploaded" class="mt-1">
                        <small class="text-warning">📤 待上傳</small>
                      </div>
                      <div v-else-if="image.isUploaded" class="mt-1">
                        <small class="text-success">✅ 已上傳</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 價格設定 -->
          <div class="mb-4">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">原價 <span class="text-danger">*</span></label>
                <div class="form-text mb-2">商品建議零售價格</div>
                <div class="input-group">
                  <span class="input-group-text">NT$</span>
                  <input 
                    type="number" 
                    min="1"
                    class="form-control"
                    v-model.number="formData.originalPrice"
                    @input="validatePrices"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">售價 <span class="text-danger">*</span></label>
                <div class="form-text mb-2">設定需要比原價低</div>
                <div class="input-group">
                  <span class="input-group-text">NT$</span>
                  <input 
                    type="number" 
                    min="1"
                    :max="formData.originalPrice || undefined"
                    class="form-control"
                    v-model.number="formData.salePrice"
                    @input="validateSalePrice"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 商品變體管理 -->
          <div class="mb-4">
            <h6 class="fw-semibold mb-3">商品款式管理 <span class="text-danger">*</span></h6>
            
            <div v-for="variant in variants" :key="variant.id" class="row align-items-center g-2 mb-3 p-2 border rounded">
              <!-- 顏色選擇器（改為色塊 + Color Picker） -->
              <div class="col-md-3">
                <label class="form-label d-block">顏色</label>
                <div class="d-flex align-items-center gap-2">
                  <button type="button"
                          class="btn p-0 border rounded-circle d-inline-flex align-items-center justify-content-center color-chip"
                          :style="{ backgroundColor: variant.color || '#ffffff', color: getChipTextColor(variant.color), borderColor: chipBorderColor(variant.color) }"
                          title="點擊選擇顏色"
                          @click="openColorPicker(variant)">
                    <span class="fw-bold">{{ (variant.colorName || '').slice(0,1) || '選' }}</span>
                  </button>
                  <div class="small text-muted">
                    <div>
                      <span class="fw-semibold">{{ variant.colorName || '未選擇' }}</span>
                      <span v-if="variant.color" class="ms-2">{{ variant.color }}</span>
                    </div>
                    <div class="text-secondary">點擊色塊以更換顏色</div>
                  </div>
                </div>
              </div>

              <!-- 尺寸庫存 -->
              <div class="col-md-7">
                <label class="form-label">尺寸庫存</label>
                <div class="row g-1">
                  <div v-for="size in sizeOptions" :key="size" class="col">
                    <div class="text-center small mb-1">{{ size }}</div>
                    <input 
                      type="number" 
                      min="0"
                      class="form-control form-control-sm text-center"
                      :value="variant.sizes[size]"
                      @input="(e) => handleSizeChange(variant.id, size, e.target.value)"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <!-- 操作 -->
              <div class="col-md-2">
                <label class="form-label">&nbsp;</label>
                <div class="d-flex flex-column gap-1">
                  <button @click="addNewVariant" class="btn btn-sm btn-outline-success" :disabled="variants.length >= 10">
                    + 款式
                  </button>
                  <button v-if="variants.length > 1" @click="removeVariant(variant.id)" class="btn btn-sm btn-outline-danger">
                    刪除
                  </button>
                </div>
              </div>
            </div>

            <!-- 總庫存顯示 -->
            <div class="alert alert-info">
              <strong>總庫存：{{ totalStock }} 件</strong>
            </div>
          </div>

          <!-- 商品描述 -->
          <div class="mb-3">
            <label class="form-label fw-semibold">商品描述</label>
            <textarea 
              rows="6"
              class="form-control"
              placeholder="請輸入商品描述..."
              v-model="formData.description"
              maxlength="3000"
            ></textarea>
            <div class="form-text">{{ formData.description.length }}/3000字</div>
          </div>
        </div>

        <!-- 顏色選擇器 Modal -->
        <ColorPicker
          :show="colorPicker.show"
          :color-options="colorOptions"
          :custom-color="colorPicker.customColor"
          @close="colorPicker.show = false"
          @select-color="onColorSelected"
          @update-custom-color="val => (colorPicker.customColor = val)"
        />

        <!-- Modal 底部按鈕 -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal" :disabled="saving">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="saveProduct" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ saving ? '儲存中...' : (editingProduct ? '更新' : '新增') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ColorPicker from './ColorPicker.vue'

export default {
  name: 'ProductEditModal',
  components: { ColorPicker },

  props: {
    show: {
      type: Boolean,
      default: false
    },
    editingProduct: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      saving: false,
      loadingProductData: false,  // 🔥 新增：防止重複載入

      // 表單資料
      formData: {
        name: '',
        styleId: '',
        categoryId: '',      
        subCategoryId: '',   
        originalPrice: 0,
        salePrice: 0,
        description: ''
      },

      // 分類資料
      categories: [],
      subCategories: [],

      // 🔥 屬性相關資料
      allAttributeValues: [], // 儲存所有屬性值資料
      allAttributes: [], // 儲存所有屬性資料

      // 圖片相關
      selectedImages: [],

      // 商品變體
      variants: [
        { 
          id: 1, 
          color: null,
          colorName: '',
          sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0 },
          bulkStock: 0
        }
      ],

      // 選項資料
      sizeOptions: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      styleOptions: [],
      colorOptions: [],
      
      // Color Picker 狀態
      colorPicker: {
        show: false,
        variantId: null,
        customColor: '#000000'
      },
      
      // 備用的靜態資料（如果 API 失敗時使用）
      defaultStyleOptions: [
        { value: 1, label: '韓系館' },
        { value: 2, label: '日系館' },
        { value: 3, label: '歐美館' },
        { value: 4, label: '工裝館' },
        { value: 5, label: '插畫館' },
        { value: 6, label: '動漫館' }
      ],

      defaultColorOptions: [
        { value: 'purple', label: '紫', color: '#8B5CF6' },
        { value: 'orange', label: '橘', color: '#F97316' },
        { value: 'blue', label: '藍', color: '#3B82F6' },
        { value: 'white', label: '白', color: '#FFFFFF' },
        { value: 'black', label: '黑', color: '#000000' },
        { value: 'yellow', label: '黃', color: '#EAB308' },
        { value: 'pink', label: '粉', color: '#EC4899' },
        { value: 'green', label: '綠', color: '#22C55E' },
        { value: 'red', label: '紅', color: '#EF4444' },
        { value: 'gray', label: '灰', color: '#6B7280' }
      ]
    }
  },

  computed: {
    filteredSubCategories() {
      if (!this.formData.categoryId) {
        return []
      }
      return this.subCategories.filter(sub => sub.categoryId == this.formData.categoryId)
    },
    
    totalStock() {
      return this.variants.reduce((total, variant) => {
        return total + Object.values(variant.sizes).reduce((variantTotal, qty) => {
          return variantTotal + (parseInt(qty) || 0)
        }, 0)
      }, 0)
    }
  },

  watch: {
    show(newVal) {
      if (newVal) {
        console.log('🔄 Modal 顯示，檢查資料是否已載入')
        
        if (!this.allAttributeValues || this.allAttributeValues.length === 0) {
          this.initializeData()
        } else {
          this.initForm()
        }
      }
    },
    
    editingProduct: {
      handler(product) {
        console.log('👀 editingProduct 變更:', product)
        
        // 🔥 修復：只有在資料確實變更且不在編輯過程中時才重新載入
        if (product && this.allAttributeValues && this.allAttributeValues.length > 0 && !this.saving && !this.loadingProductData) {
          console.log('🔄 資料已準備好，載入商品資料')
          this.$nextTick(() => {
            this.loadProductData(product)
          })
        } else if (product) {
          console.log('⚠️ 商品資料存在但屬性值未載入或正在處理中')
        } else if (!this.saving && !this.loadingProductData) {
          // 只有在不是儲存或載入過程中才重置表單
          this.resetForm()
        }
      },
      immediate: true,
      deep: false  // 🔥 改為淺層監聽，避免編輯過程中觸發
    }
  },

  mounted() {
    console.log('📱 ProductEditModal 組件已掛載')
    this.initializeData()
  },
  
  methods: {
    // 顯示 Color Picker
    openColorPicker(variant) {
      this.colorPicker.variantId = variant.id
      this.colorPicker.customColor = variant.color || '#000000'
      this.colorPicker.show = true
    },

    // 測試用：一鍵帶入指定商品資料（預設 ID=29）
    async fillWithTestProduct(productId = 29) {
      try {
        if (this.loadingProductData) return

        // 確保基本資料已載入（分類、屬性、選項）
        if (!this.allAttributeValues?.length || !this.categories?.length || !this.subCategories?.length) {
          await this.initializeData()
        }

        this.showToast('正在載入測試商品資料...', 'info')

        const resp = await fetch(`/api/Products/${productId}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          throw new Error(`HTTP ${resp.status} ${txt || ''}`)
        }

        let data = await resp.json()
        const product = (data && data.data) ? data.data : data
        if (!product) throw new Error('找不到商品資料')

        // 正規化 id 欄位
        if (product.Id && !product.id) product.id = product.Id

        // 使用既有流程帶入所有欄位（含圖片、變體、屬性值）
        await this.loadProductData(product)

        this.showToast('已帶入測試商品資料', 'success')
      } catch (err) {
        console.error('❌ 載入測試商品失敗:', err)
        this.showToast(`載入測試商品失敗：${err.message || err}`, 'danger')
      }
    },

    // Color Picker 選色回傳
  onColorSelected(colorValue, colorLabel) {
      const variant = this.variants.find(v => v.id === this.colorPicker.variantId)
      if (variant) {
        variant.color = colorValue
        variant.colorName = colorLabel
        // 若選的是預設色，確保與 options 對齊一次
        const option = this.colorOptions.find(o => o.label === colorLabel)
        if (option) {
          variant.color = option.color || colorValue
        }
      }
      this.colorPicker.show = false
    },

    // 色塊文字顏色
    getChipTextColor(hex) {
      const h = (hex || '').toUpperCase()
      if (!h || h === '#FFFFFF' || h === '#FFFFFE' || h === '#EAB308' || h === '#F97316') return '#000000'
      return '#FFFFFF'
    },
    chipBorderColor(hex) {
      const h = (hex || '').toUpperCase()
      return (!h || h === '#FFFFFF') ? '#dee2e6' : 'transparent'
    },
    // === 🔥 修復：showToast 方法 ===
    showToast(message, type = 'info') {
      const typeClassMap = {
        'success': 'text-bg-success',
        'danger': 'text-bg-danger', 
        'warning': 'text-bg-warning',
        'info': 'text-bg-primary'
      }
      
      const typeClass = typeClassMap[type] || typeClassMap['info']
      
      const toastHtml = `
        <div class="toast align-items-center ${typeClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      `
      
      let toastContainer = document.getElementById('toast-container')
      if (!toastContainer) {
        toastContainer = document.createElement('div')
        toastContainer.id = 'toast-container'
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3'
        toastContainer.style.zIndex = '1055'
        document.body.appendChild(toastContainer)
      }
      
      const toastDiv = document.createElement('div')
      toastDiv.innerHTML = toastHtml
      const toast = toastDiv.firstElementChild
      toastContainer.appendChild(toast)
      
      if (window.bootstrap && window.bootstrap.Toast) {
        const bsToast = new window.bootstrap.Toast(toast, {
          autohide: true,
          delay: 3000
        })
        bsToast.show()
        
        toast.addEventListener('hidden.bs.toast', () => {
          toast.remove()
        })
      } else {
        toast.style.display = 'block'
        setTimeout(() => {
          toast.remove()
        }, 3000)
      }
    },

    // === 🔥 統一：初始化資料方法 ===
    async initializeData() {
      try {
        console.log('🔄 開始初始化資料...')
        
        // 同時載入分類和屬性資料
        await Promise.all([
          this.loadCategories(),
          this.loadAllAttributes(),
          this.loadAllAttributeValues(),
          this.loadAttributeOptions()
        ])
        
        console.log('✅ 基礎資料載入完成')
        console.log('📊 載入狀態檢查:')
        console.log(`  - 屬性數量: ${this.allAttributes?.length || 0}`)
        console.log(`  - 屬性值數量: ${this.allAttributeValues?.length || 0}`)
        console.log(`  - 風格選項數量: ${this.styleOptions?.length || 0}`)
        console.log(`  - 顏色選項數量: ${this.colorOptions?.length || 0}`)
        
        // 如果有編輯商品，在資料載入完成後再處理
        if (this.editingProduct && this.show) {
          console.log('🔄 資料載入完成，開始處理編輯商品資料')
          await this.$nextTick()
          this.loadProductData(this.editingProduct)
        }
        
      } catch (error) {
        console.error('❌ 初始化資料失敗:', error)
        this.showToast('資料載入失敗，部分功能可能無法正常使用', 'warning')
      }
    },

    // === 載入所有屬性資料 ===
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

    // === 載入所有屬性值資料 ===
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

    // === 載入分類資料 ===
    async loadCategories() {
      try {
        // 載入主分類
        const categoriesResponse = await fetch('/api/Categories')
        const categoriesData = await categoriesResponse.json()
        this.categories = categoriesData
        
        // 載入子分類
        const subCategoriesResponse = await fetch('/api/SubCategories')
        const subCategoriesData = await subCategoriesResponse.json()
        this.subCategories = subCategoriesData
        
        console.log('✅ 分類資料載入完成')
      } catch (error) {
        console.error('❌ 載入分類失敗:', error)
        // 使用測試資料
        this.categories = [
          { id: 1, name: '男裝', description: '男士服飾' },
          { id: 2, name: '女裝', description: '女士服飾' }
        ]
        this.subCategories = [
          { id: 1, categoryId: 1, name: 'T 恤', description: '男士 T 恤' },
          { id: 2, categoryId: 2, name: 'T恤', description: '女士 T恤' }
        ]
      }
    },

    // === 🔥 缺失的方法：載入屬性選項（風格館、顏色） ===
    async loadAttributeOptions() {
      try {
        console.log('🔄 處理屬性選項...')
        
        // 如果 allAttributeValues 還沒載入，先載入
        if (!this.allAttributeValues || this.allAttributeValues.length === 0) {
          await this.loadAllAttributeValues()
        }
        
        // 🎨 處理風格館選項 (attributeId = 1)
        const styleValues = this.allAttributeValues.filter(av => av.attributeId === 1)
        this.styleOptions = styleValues.map(av => ({
          value: av.id,
          label: av.value
        }))
        
        console.log('🎨 風格館選項:', this.styleOptions)
        
        // 🌈 處理顏色選項 (attributeId = 2)  
        const colorValues = this.allAttributeValues.filter(av => av.attributeId === 2)
        this.colorOptions = colorValues.map(av => ({
          value: av.value.toLowerCase(),
          label: av.value,
          color: av.hexCode,
          id: av.id
        }))
        
        console.log('🌈 顏色選項:', this.colorOptions)
        
        // 🔥 如果沒有載入到資料，使用預設值
        if (this.styleOptions.length === 0) {
          console.warn('⚠️ 沒有載入到風格館資料，使用預設值')
          this.styleOptions = this.defaultStyleOptions
        }
        
        if (this.colorOptions.length === 0) {
          console.warn('⚠️ 沒有載入到顏色資料，使用預設值')
          this.colorOptions = this.defaultColorOptions
        }
        
        console.log('✅ 屬性選項處理完成')
        
      } catch (error) {
        console.error('❌ 載入屬性選項失敗:', error)
        console.log('🔄 使用預設選項資料')
        
        // 使用預設值
        this.styleOptions = this.defaultStyleOptions
        this.colorOptions = this.defaultColorOptions
      }
    },

    // === 🔥 統一：載入商品資料 ===
    async loadProductData(product) {
      // 🔥 防止重複載入
      if (this.loadingProductData) {
        console.log('⚠️ 正在載入商品資料，跳過重複請求')
        return
      }
      
      this.loadingProductData = true
      
      try {
        console.log('🔄 載入商品資料進行編輯:', product)
        
        // 載入基本商品資訊
        this.formData = {
          name: product.name || '',
          styleId: '',
          categoryId: product.categoryId ? product.categoryId.toString() : '',
          subCategoryId: product.subCategoryId ? product.subCategoryId.toString() : '',
          originalPrice: product.originalPrice || product.price || 0,
          salePrice: product.salePrice || product.discountPrice || product.price || 0,
          description: product.description || ''
        }
        
        console.log('📋 載入的基本表單資料:', this.formData)
        
        // 處理現有圖片
        if (product.productImages && product.productImages.length > 0) {
          this.selectedImages = product.productImages.map((img, index) => ({
            name: `existing_image_${index + 1}.jpg`,
            size: 0,
            preview: img.imagesUrl || img.imagePath,
            file: null,
            url: img.imagesUrl || img.imagePath,
            isUploaded: true,
            isExisting: true
          }))
          console.log('🖼️ 載入的圖片資料:', this.selectedImages)
        } else if (product.images && product.images.length > 0) {
          this.selectedImages = product.images.map((img, index) => ({
            name: `existing_image_${index + 1}.jpg`,
            size: 0,
            preview: typeof img === 'string' ? img : img.url,
            file: null,
            url: typeof img === 'string' ? img : img.url,
            isUploaded: true,
            isExisting: true
          }))
          console.log('🖼️ 載入的圖片資料 (備用格式):', this.selectedImages)
        } else {
          this.selectedImages = []
          console.log('🖼️ 沒有圖片資料')
        }

        // 🔥 關鍵修復：從後端載入 ProductAttributeValues
        await this.loadProductAttributeValuesFromAPI(product.id)
        
      } catch (error) {
        console.error('❌ 載入商品資料失敗:', error)
        this.showToast('載入商品資料失敗', 'danger')
      } finally {
        this.loadingProductData = false
      }
    },

    // === 🔥 從 API 載入商品的 ProductAttributeValues ===
    async loadProductAttributeValuesFromAPI(productId) {
      try {
        console.log('🎨 從 API 載入商品屬性值:', productId)
        
        const response = await fetch(`/api/ProductAttributeValues/product/${productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        if (!response.ok) {
          console.warn('⚠️ 載入商品屬性值失敗，可能是新商品')
          this.resetToDefaultVariants()
          return
        }
        
        const productAttributeValues = await response.json()
        console.log('📊 載入的商品屬性值:', productAttributeValues)
        
        if (!productAttributeValues || productAttributeValues.length === 0) {
          console.log('⚠️ 沒有商品屬性值記錄，使用預設變體')
          this.resetToDefaultVariants()
          return
        }
        
        // 🔥 解析 ProductAttributeValues 並重建變體
        this.parseProductAttributeValues(productAttributeValues)
        
      } catch (error) {
        console.error('❌ 載入商品屬性值失敗:', error)
        this.resetToDefaultVariants()
      }
    },

    // === 🔥 解析 ProductAttributeValues 並重建變體 ===
    parseProductAttributeValues(productAttributeValues) {
  console.log('🔍 開始解析商品屬性值...')
  console.log('📊 原始資料:', JSON.stringify(productAttributeValues, null, 2))
  
  // 用於組織資料的 Map
  const colorMap = new Map() // 顏色 ID -> 顏色資訊
  const stockMap = new Map() // "顏色ID-尺寸" -> 庫存數量
  let detectedStyleId = null
  
  // 🔥 遍歷所有 ProductAttributeValues
  for (const pav of productAttributeValues) {
    console.log('🔍 處理 ProductAttributeValue:', JSON.stringify(pav, null, 2))
    
    const attributeValue = pav.attributeValue
    if (!attributeValue || !attributeValue.attribute) {
      console.warn('⚠️ 跳過無效的屬性值記錄:', pav)
      continue
    }
    
    const attribute = attributeValue.attribute
    const attributeId = attribute.id
    const attributeName = attribute.name
    
    console.log(`🔍 處理屬性: ${attributeName} (ID: ${attributeId}), 值: ${attributeValue.value}, PAV-ID: ${pav.id}, SkuGroupId: ${pav.skuGroupId}`)
    
    // 🎨 處理風格館 (attributeId = 1)
    if (attributeId === 1) {
      detectedStyleId = attributeValue.id
      console.log('🎨 發現風格館:', attributeValue.value, 'ID:', detectedStyleId)
    }
    
    // 🌈 處理顏色 (attributeId = 2)
    else if (attributeId === 2) {
      // 🔥 調試：檢查 SkuGroupId 的不同情況
      console.log(`🔍 顏色屬性值 - AttributeValue.Id: ${attributeValue.id}, PAV.SkuGroupId: ${pav.skuGroupId}`)
      
      const colorId = pav.skuGroupId || attributeValue.id
      if (!colorMap.has(colorId)) {
        colorMap.set(colorId, {
          id: colorId,
          name: attributeValue.value,
          hexCode: attributeValue.hexCode || '#000000'
        })
        console.log(`🌈 記錄顏色: ${attributeValue.value} (GroupID: ${colorId})`)
      } else {
        console.log(`🔄 顏色 ${attributeValue.value} 已存在於 colorMap`)
      }
    }
    
    // 📏 處理尺寸 (attributeId = 3)
    else if (attributeId === 3) {
      const sizeName = attributeValue.value
      const stock = pav.stock || 0
      const skuGroupId = pav.skuGroupId
      
      console.log(`📏 尺寸記錄 - 尺寸: ${sizeName}, 庫存: ${stock}, SkuGroupId: ${skuGroupId}`)
      
      if (skuGroupId) {
        const key = `${skuGroupId}-${sizeName}`
        stockMap.set(key, stock)
        console.log(`📝 記錄庫存: Key="${key}", Stock=${stock}`)
        
        // 🔥 檢查是否需要自動創建顏色映射
        if (!colorMap.has(skuGroupId)) {
          console.warn(`⚠️ colorMap 中沒有 GroupID ${skuGroupId}，正在尋找對應的顏色...`)
          
          // 查找對應的顏色屬性值
          const colorPav = productAttributeValues.find(p => {
            console.log(`🔍 檢查 PAV ${p.id}: attributeId=${p.attributeValue?.attributeId}, skuGroupId=${p.skuGroupId}`)
            return p.attributeValue?.attributeId === 2 && p.skuGroupId === skuGroupId
          })
          
          if (colorPav) {
            colorMap.set(skuGroupId, {
              id: skuGroupId,
              name: colorPav.attributeValue.value,
              hexCode: colorPav.attributeValue.hexCode || '#000000'
            })
            console.log(`🌈 自動添加顏色: ${colorPav.attributeValue.value} (GroupID: ${skuGroupId})`)
          } else {
            console.error(`❌ 找不到 SkuGroupId ${skuGroupId} 對應的顏色記錄`)
            
            // 🔥 詳細列出所有顏色記錄供調試
            const colorRecords = productAttributeValues.filter(p => p.attributeValue?.attributeId === 2)
            console.log('🎨 所有顏色記錄:', colorRecords.map(c => ({
              id: c.id,
              value: c.attributeValue.value,
              skuGroupId: c.skuGroupId
            })))
          }
        }
      } else {
        console.warn(`⚠️ ProductAttributeValue ID ${pav.id} 缺少 SkuGroupId`)
      }
    }
  }
  
  console.log('📊 解析結果統計:')
  console.log(`  - 風格館 ID: ${detectedStyleId}`)
  console.log(`  - 顏色數量: ${colorMap.size}`)
  console.log(`  - 庫存記錄數量: ${stockMap.size}`)
  
  console.log('🌈 colorMap 內容:')
  for (const [id, colorInfo] of colorMap) {
    console.log(`  - ID ${id}: ${colorInfo.name} (${colorInfo.hexCode})`)
  }
  
  console.log('📦 stockMap 內容:')
  for (const [key, stock] of stockMap) {
    console.log(`  - ${key}: ${stock}`)
  }
  
  // 🔥 設定風格館
  if (detectedStyleId) {
    this.formData.styleId = detectedStyleId.toString()
    console.log('✅ 設定風格館 ID:', this.formData.styleId)
  }
  
  // 🔥 重建變體陣列
  this.variants = []
  
  if (colorMap.size > 0) {
    console.log('🔄 開始重建變體陣列...')
    
    // 為每個顏色創建變體
    for (const [colorId, colorInfo] of colorMap) {
      const sizes = { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0 }
      
      console.log(`🔍 處理顏色 ${colorInfo.name} (ID: ${colorId})`)
      
      // 填入該顏色的各尺寸庫存
      for (const sizeName of Object.keys(sizes)) {
        const key = `${colorId}-${sizeName}`
        if (stockMap.has(key)) {
          sizes[sizeName] = stockMap.get(key)
          console.log(`✅ 設定庫存: ${colorInfo.name} ${sizeName} = ${sizes[sizeName]}`)
        } else {
          console.log(`ℹ️ 沒有庫存記錄: ${key}`)
        }
      }
      
      const newVariant = {
        id: colorId,
        color: colorInfo.hexCode,
        colorName: colorInfo.name,
        sizes: sizes,
        bulkStock: 0
      }
      
      this.variants.push(newVariant)
      console.log(`✅ 創建變體:`, newVariant)
    }
  } else {
    console.log('⚠️ 沒有顏色資料，創建預設變體')
    this.resetToDefaultVariants()
  }
  
  console.log('✅ 商品屬性值解析完成，最終變體資料:', this.variants)
},

    // === 🔥 重置為預設變體 ===
    resetToDefaultVariants() {
      this.variants = [{
        id: Date.now(),
        color: null,
        colorName: '',
        sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0 },
        bulkStock: 0
      }]
      console.log('✅ 已重置為預設變體')
    },

    // === 初始化表單 ===
    initForm() {
      console.log('🔄 初始化表單，編輯商品:', this.editingProduct)
      
      // 🔥 防止在載入過程中重複初始化
      if (this.loadingProductData) {
        console.log('⚠️ 正在載入商品資料，跳過表單初始化')
        return
      }
      
      if (this.editingProduct) {
        console.log('📝 編輯模式：載入現有商品資料')
        this.loadProductData(this.editingProduct)
      } else {
        console.log('➕ 新增模式：重置表單為預設值')
        this.resetForm()
      }
    },

    resetForm() {
      console.log('🗑️ 重置表單為預設值')
      
      this.formData = {
        name: '',
        styleId: '',
        categoryId: '',
        subCategoryId: '',
        originalPrice: 0,
        salePrice: 0,
        description: ''
      }
      
      this.variants = [{
        id: Date.now(),
        color: null,
        colorName: '',
        sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0 },
        bulkStock: 0
      }]

      this.selectedImages = []
      
      console.log('✅ 表單重置完成')
      
      this.$nextTick(() => {
        if (this.$refs.imageUploader) {
          this.$refs.imageUploader.clearResults()
        }
      })
    },

    // === 分類處理 ===
    onCategoryChange() {
      this.formData.subCategoryId = ''
    },

    // === 表單驗證 ===
    validateForm() {
      if (!this.formData.name.trim()) {
        this.showToast('請輸入商品名稱', 'warning')
        return false
      }
      
      if (!this.formData.categoryId) {
        this.showToast('請選擇主分類', 'warning')
        return false
      }
      
      if (!this.formData.subCategoryId) {
        this.showToast('請選擇子分類', 'warning')
        return false
      }
      
      if (!this.formData.originalPrice || this.formData.originalPrice <= 0) {
        this.showToast('請輸入有效的原價', 'warning')
        return false
      }
      
      if (!this.formData.salePrice || this.formData.salePrice <= 0) {
        this.showToast('請輸入有效的售價', 'warning')
        return false
      }
      
      if (this.formData.salePrice > this.formData.originalPrice) {
        this.showToast('售價不能高於原價', 'warning')
        return false
      }
      
      const hasStock = this.variants.some(variant => 
        Object.values(variant.sizes).some(stock => stock > 0)
      )
      
      if (!hasStock) {
        this.showToast('請至少設定一個款式的庫存', 'warning')
        return false
      }
      
      return true
    },

    validatePrices() {
      if (this.formData.originalPrice && this.formData.salePrice && 
          this.formData.salePrice > this.formData.originalPrice) {
        this.showToast('售價不能高於原價', 'warning')
        this.formData.salePrice = this.formData.originalPrice
      }
    },

    validateSalePrice() {
      if (this.formData.originalPrice && this.formData.salePrice && 
          this.formData.salePrice > this.formData.originalPrice) {
        this.showToast(`售價不能高於原價 NT$ ${this.formData.originalPrice}`, 'warning')
        this.formData.salePrice = this.formData.originalPrice
      }
    },

    // === 圖片處理方法 ===
    handleFileSelect(event) {
      const files = Array.from(event.target.files)
      if (files.length === 0) return
      
      console.log('📸 選擇了', files.length, '個檔案')
      
      const availableSlots = 10 - this.selectedImages.length
      const filesToProcess = files.slice(0, availableSlots)
      
      if (files.length > availableSlots) {
        this.showToast(`只能選擇 ${availableSlots} 張圖片`, 'warning')
      }
      
      filesToProcess.forEach(file => {
        const errors = this.validateImageFile(file)
        if (errors.length > 0) {
          this.showToast(errors[0], 'danger')
          return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          this.selectedImages.push({
            name: file.name,
            size: file.size,
            preview: e.target.result,
            file: file,
            url: null,
            isUploaded: false
          })
          console.log('✅ 圖片預覽建立完成:', file.name)
        }
        reader.readAsDataURL(file)
      })
      
      event.target.value = ''
    },

    validateImageFile(file) {
      const errors = []
      
      if (file.size > 5 * 1024 * 1024) {
        errors.push('圖片檔案不能超過 5MB')
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        errors.push('不支援的圖片格式，請使用 JPG、PNG 或 WEBP')
      }
      
      return errors
    },

    setAsMainImage(index) {
      if (index < this.selectedImages.length) {
        const mainImage = this.selectedImages.splice(index, 1)[0]
        this.selectedImages.unshift(mainImage)
        this.showToast('已設為主圖', 'success')
      }
    },

    removeSelectedImage(index) {
      this.selectedImages.splice(index, 1)
      this.showToast('圖片已移除', 'info')
    },

    // === 圖片上傳方法 ===
    async uploadProductImages() {
      const uploadPromises = []
      
      for (const image of this.selectedImages) {
        if (image.file && !image.isUploaded) {
          console.log('📤 準備上傳圖片:', image.name)
          
          const formData = new FormData()
          formData.append('file', image.file)
          
          const uploadPromise = fetch('/api/Products/upload-image', {
            method: 'POST',
            body: formData
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`圖片上傳失敗: ${response.status}`)
            }
            return response.json()
          })
          .then(result => {
            console.log('📡 後端回應:', result)
            
            if (result.success && result.url) {
              image.url = result.url
              image.isUploaded = true
              console.log('✅ 圖片上傳成功:', image.name, '→', image.url)
              return image
            } else {
              throw new Error(result.message || '上傳失敗')
            }
          })
          .catch(error => {
            console.error('❌ 圖片上傳失敗:', image.name, error)
            throw new Error(`圖片 ${image.name} 上傳失敗: ${error.message}`)
          })
          
          uploadPromises.push(uploadPromise)
        }
      }
      
      if (uploadPromises.length > 0) {
        console.log('📤 開始批量上傳', uploadPromises.length, '張圖片')
        await Promise.all(uploadPromises)
        console.log('✅ 所有圖片上傳完成')
      }
    },

    // === 變體管理方法 ===
    addNewVariant() {
      if (this.variants.length >= 10) {
        this.showToast('最多只能新增10個款式', 'warning')
        return
      }
      
      this.variants.push({
        id: Date.now() + Math.random(),
        color: null,
        colorName: '',
        sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0 },
        bulkStock: 0
      })
    },

    removeVariant(variantId) {
      if (this.variants.length <= 1) {
        this.showToast('至少需要保留一個款式', 'warning')
        return
      }
      this.variants = this.variants.filter(variant => variant.id !== variantId)
    },

    handleSizeChange(variantId, size, value) {
      const index = this.variants.findIndex(v => v.id === variantId)
      if (index !== -1) {
        this.variants[index].sizes[size] = parseInt(value) || 0
      }
    },

    // === 顏色選擇 ===
    updateVariantColor(variantId) {
      const variant = this.variants.find(v => v.id === variantId)
      if (variant) {
        const colorOption = this.colorOptions.find(c => c.label === variant.colorName)
        if (colorOption) {
          variant.color = colorOption.color
          console.log('🎨 更新顏色:', variant.colorName, '→', variant.color)
        }
      }
    },

    // === 儲存商品 ===
    async saveProduct() {
      if (!this.validateForm()) {
        return
      }

      // 檢查是否已登入並且是已核准的賣家
      const memberId = localStorage.getItem('memberId')
      const isSeller = localStorage.getItem('isSeller')
      
      if (!memberId) {
        this.showToast('請先登入才能建立商品', 'error')
        return
      }
      
      if (isSeller !== 'true') {
        this.showToast('您需要先申請成為賣家並通過審核才能建立商品', 'error')
        return
      }

      try {
        this.saving = true
        console.log('💾 開始保存商品... 會員ID:', memberId, '賣家狀態:', isSeller)
        
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
              console.log('� 完整回應:', sellerIdResponse.data)
            }
          } else {
            console.log('ℹ️ 賣家 ID API 呼叫失敗，使用會員 ID 作為賣家 ID:', sellersId)
            console.log('📋 API 回應:', sellerIdResponse)
          }
        } catch (error) {
          console.log('❌ 獲取賣家 ID 時發生錯誤，使用會員 ID 作為賣家 ID:', sellersId)
          console.log('📋 錯誤詳情:', error)
        }
        
        // 驗證賣家是否在後端存在 - 嘗試驗證賣家 ID 的有效性
        console.log('🔍 最終使用的賣家 ID:', sellersId, '會員 ID:', memberId)
        
        // 額外驗證：檢查賣家 ID 是否存在於後端
        try {
          const validateResponse = await this.$api.get(`/api/Sellers/${sellersId}`)
          if (validateResponse.success) {
            console.log('✅ 賣家 ID 驗證通過:', sellersId)
          } else {
            console.warn('⚠️ 賣家 ID 驗證失敗，但仍嘗試使用:', sellersId)
          }
        } catch (validateError) {
          console.warn('⚠️ 無法驗證賣家 ID，但仍嘗試使用:', sellersId)
          console.log('驗證錯誤詳情:', validateError)
        }
        
        // 如果仍然使用會員 ID 作為賣家 ID，嘗試檢查是否需要創建賣家記錄
        if (sellersId === parseInt(memberId)) {
          console.log('🔍 正在使用會員 ID 作為賣家 ID，檢查是否需要創建賣家記錄...')
          
          try {
            // 嘗試創建或確保賣家記錄存在
            const createSellerResponse = await this.$api.post('/api/Sellers/ensure-seller', {
              memberId: parseInt(memberId)
            })
            
            if (createSellerResponse.success && createSellerResponse.data?.id) {
              sellersId = parseInt(createSellerResponse.data.id)
              console.log('✅ 已確保賣家記錄存在，使用賣家 ID:', sellersId)
            }
          } catch (createError) {
            console.log('⚠️ 無法確保賣家記錄，繼續使用會員 ID:', createError.message)
          }
        }
        
        console.log('🎯 最終確定的賣家 ID:', sellersId)
        
        // 確保屬性值資料已載入
        if (!this.allAttributeValues || this.allAttributeValues.length === 0) {
          console.log('⚠️ 屬性值資料未載入，正在載入...')
          await this.loadAllAttributeValues()
        }
        
        // 第一步：先上傳圖片
        if (this.selectedImages.some(img => img.file && !img.isUploaded)) {
          console.log('📤 先上傳圖片...')
          await this.uploadProductImages()
        }
        
        // 收集所有圖片 URL
        const imageUrls = this.selectedImages
          .filter(img => img.url)
          .map(img => img.url)
          .filter(url => url && url.trim() !== '') // 過濾空的 URL
        
        console.log('🖼️ 收集到的圖片 URLs:', imageUrls)
        
        // 驗證圖片 URL 格式
        const invalidUrls = imageUrls.filter(url => {
          try {
            new URL(url)
            return false
          } catch {
            return true
          }
        })
        
        if (invalidUrls.length > 0) {
          console.warn('⚠️ 發現無效的圖片 URL:', invalidUrls)
        }
        
        // 準備商品資料 - 確保包含必要的 ProductImages 欄位
        const productData = {
          name: this.formData.name.trim(),
          description: this.formData.description?.trim() || '',
          price: parseInt(this.formData.originalPrice) || 0,
          subCategoryId: parseInt(this.formData.subCategoryId),
          sellersId: sellersId,
          isActive: true,
          productImages: [] // 後端要求必填，即使是空陣列也要提供
        }
        
        // 根據折扣狀態決定是否添加折扣相關欄位
        if (this.formData.salePrice && 
            parseInt(this.formData.salePrice) < parseInt(this.formData.originalPrice)) {
          productData.isDiscount = true
          productData.discountPrice = parseInt(this.formData.salePrice)
        } else {
          productData.isDiscount = false
          // 不設置 discountPrice，讓後端處理預設值
        }
        
        // 只在有有效風格ID時才添加（避免無效值）
        if (this.formData.styleId && !isNaN(parseInt(this.formData.styleId))) {
          productData.styleId = parseInt(this.formData.styleId)
        }
        
        // 如果有圖片，添加到 productImages 陣列
        if (imageUrls.length > 0) {
          productData.productImages = imageUrls.map((url, index) => ({
            imagesUrl: url,
            sortOrder: index + 1
          }))
          console.log('📸 添加了', imageUrls.length, '張圖片')
        } else {
          console.log('📸 沒有圖片，使用空的 productImages 陣列')
        }
        
        // 詳細的資料驗證和日誌
        console.log('📦 準備保存的商品資料:', productData)
        console.log('🔍 資料驗證檢查:')
        console.log('  - 商品名稱:', productData.name, '(長度:', productData.name?.length, ')')
        console.log('  - 商品描述:', productData.description, '(長度:', productData.description?.length, ')')
        console.log('  - 商品價格:', productData.price, '(類型:', typeof productData.price, ')')
        console.log('  - 子分類ID:', productData.subCategoryId, '(類型:', typeof productData.subCategoryId, ')')
        console.log('  - 賣家ID:', productData.sellersId, '(類型:', typeof productData.sellersId, ')')
        console.log('  - 是否有折扣:', productData.isDiscount)
        console.log('  - 折扣價格:', productData.discountPrice)
        console.log('  - 風格ID:', productData.styleId)
        console.log('  - 圖片數量:', productData.productImages?.length || 0)
        console.log('  - ProductImages 陣列:', productData.productImages)
        
        // 更嚴格的必填欄位檢查
        if (!productData.name || productData.name.length === 0) {
          throw new Error('商品名稱不能為空')
        }
        if (productData.name.length > 100) {
          throw new Error('商品名稱不能超過100個字元')
        }
        if (!Number.isInteger(productData.sellersId) || productData.sellersId <= 0) {
          throw new Error('賣家ID必須是正整數')
        }
        if (!Number.isInteger(productData.subCategoryId) || productData.subCategoryId <= 0) {
          throw new Error('請選擇有效的子分類')
        }
        if (!Number.isInteger(productData.price) || productData.price <= 0) {
          throw new Error('商品價格必須是大於0的整數')
        }
        if (productData.discountPrice && (!Number.isInteger(productData.discountPrice) || productData.discountPrice >= productData.price)) {
          throw new Error('折扣價格必須小於原價且為正整數')
        }
        
        // 確保 ProductImages 陣列存在（後端必填）
        if (!Array.isArray(productData.productImages)) {
          throw new Error('ProductImages 必須是陣列')
        }
        
        // 第二步：建立或更新商品
        let savedProduct
        if (this.editingProduct) {
          savedProduct = await this.updateProduct(this.editingProduct.id, productData)
        } else {
          savedProduct = await this.createProduct(productData)
        }
        
        const productId = savedProduct.id || savedProduct.Id
        console.log('✅ 商品資料保存成功，ID:', productId)
        
        // 第三步：保存商品屬性值（款式、顏色、尺寸組合）
        if (this.variants && this.variants.length > 0) {
          const hasStock = this.variants.some(variant => 
            Object.values(variant.sizes).some(stock => stock > 0)
          )
          
          if (hasStock) {
            console.log('💾 開始保存庫存資料...')
            await this.saveProductAttributeValues(productId)
            console.log('✅ 庫存資料保存成功')
          } else {
            console.log('⚠️ 沒有庫存資料需要保存')
          }
        }
        
        console.log('✅ 商品完整保存成功!')
        this.showToast('商品保存成功！', 'success')
        
        // 觸發父組件更新
        this.$emit('save', savedProduct)
        this.closeModal()
        
      } catch (error) {
        console.error('❌ 保存商品失敗:', error)
        this.showToast(`保存失敗: ${error.message}`, 'danger')
      } finally {
        this.saving = false
      }
    },

    // === 保存商品屬性值 ===
    async saveProductAttributeValues(productId) {
  try {
    console.log('🎨 開始保存商品屬性值...')
    console.log('📦 當前變體資料:', JSON.stringify(this.variants, null, 2))
    
    // 檢查必要的資料是否已載入
    if (!this.allAttributeValues || this.allAttributeValues.length === 0) {
      console.warn('⚠️ allAttributeValues 尚未載入，嘗試重新載入...')
      await this.loadAllAttributeValues()
      
      if (!this.allAttributeValues || this.allAttributeValues.length === 0) {
        throw new Error('無法載入屬性值資料，請稍後再試')
      }
    }
    
    console.log('📊 可用的屬性值總數:', this.allAttributeValues.length)
    
    // 🔥 關鍵修復：先刪除現有的屬性值記錄
    console.log('🗑️ 準備刪除現有記錄...')
    await this.deleteExistingProductAttributeValues(productId)
    
    const productAttributeValues = []
    
    // 🔥 1. 先處理風格館屬性（如果有設定）
    if (this.formData.styleId) {
      const styleAttributeValue = this.allAttributeValues.find(av => 
        av.attributeId === 1 && av.id == this.formData.styleId
      )
      
      if (styleAttributeValue) {
        productAttributeValues.push({
          productId: productId,
          attributeValueId: styleAttributeValue.id,
          stock: 0, // 風格館不儲存庫存
          sku: `${productId}-style-${styleAttributeValue.id}`,
          skuGroupId: null, // 風格館不需要 SkuGroupId
          additionalPrice: 0
        })
        console.log('🎨 添加風格館屬性值:', styleAttributeValue.value)
      }
    }
    
    // 🔥 2. 處理每個變體的顏色和尺寸組合
    for (const variant of this.variants) {
      if (!variant.colorName) {
        console.log(`⚠️ 跳過沒有顏色的變體:`, variant)
        continue
      }
      
      console.log(`🔍 處理變體: ${variant.colorName}`)
      console.log(`📊 變體庫存:`, variant.sizes)
      
      // 找到對應的顏色屬性值（先以名稱，其次以 hexCode 對應）；若皆無，嘗試在後端建立
      let colorAttributeValue = this.allAttributeValues.find(av => 
        av.attributeId === 2 && av.value === variant.colorName
      )
      if (!colorAttributeValue && variant.color) {
        const targetHex = (variant.color || '').toLowerCase()
        colorAttributeValue = this.allAttributeValues.find(av => av.attributeId === 2 && (av.hexCode || '').toLowerCase() === targetHex)
        if (colorAttributeValue) {
          // 對齊顏色名稱，避免後續流程找不到
          variant.colorName = colorAttributeValue.value
          console.log('🎨 依 hexCode 對應到顏色屬性值：', colorAttributeValue.value)
        }
      }

      // 若仍未找到，建立新的 AttributeValue (AttributeId=2)
      if (!colorAttributeValue && variant.color) {
        try {
          const payload = {
            attributeId: 2,
            value: variant.colorName || '自訂色',
            hexCode: variant.color
          }
          console.log('✨ 建立自訂顏色 AttributeValue:', payload)
          const createRes = await fetch('/api/AttributeValues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (createRes.ok) {
            let created = await createRes.json()
            // 兼容包裝格式 { success, data }
            if (created && created.data) created = created.data
            if (!created || created.id == null) {
              console.warn('⚠️ API 回傳未包含新建 id，嘗試重新載入顏色列表')
              await this.loadAllAttributeValues()
              await this.loadAttributeOptions()
              colorAttributeValue = this.allAttributeValues.find(av => av.attributeId === 2 && av.value === payload.value)
            } else {
              // 更新本地快取與 colorOptions
              this.allAttributeValues.push(created)
              this.colorOptions.push({
                value: (created.value || '').toLowerCase(),
                label: created.value,
                color: created.hexCode,
                id: created.id
              })
              colorAttributeValue = created
              variant.colorName = created.value
              console.log('✅ 已建立並加入顏色選項:', created)
            }
          } else {
            const errText = await createRes.text()
            console.warn('⚠️ 建立 AttributeValue 失敗:', errText)
          }
        } catch (e) {
          console.warn('⚠️ 建立新顏色時發生錯誤:', e)
        }
      }

      if (!colorAttributeValue) {
        console.warn(`找不到或建立失敗：顏色 "${variant.colorName}"`)
        const availableColors = this.allAttributeValues
          .filter(av => av.attributeId === 2)
          .map(av => av.value)
        console.warn('可用的顏色選項:', availableColors)
        continue
      }
      
      console.log(`✅ 找到顏色屬性值:`, colorAttributeValue)
      
      // 🔥 3. 為該顏色創建一個顏色屬性記錄（使用顏色ID作為SkuGroupId）
      const skuGroupId = colorAttributeValue.id
      
      // 🔥 重要：只有當有庫存時才創建顏色記錄
      const hasStock = Object.values(variant.sizes).some(stock => (parseInt(stock) || 0) > 0)
      
      if (hasStock) {
        productAttributeValues.push({
          productId: productId,
          attributeValueId: colorAttributeValue.id, // 顏色屬性值ID
          stock: 0, // 顏色本身不儲存庫存
          sku: `${productId}-color-${colorAttributeValue.id}`,
          skuGroupId: skuGroupId, // 使用顏色ID作為群組ID
          additionalPrice: 0
        })
        console.log(`🌈 添加顏色記錄: ${variant.colorName}`)
      }
      
      // 🔥 4. 為每個有庫存的尺寸創建記錄
      for (const [size, stock] of Object.entries(variant.sizes)) {
        const stockValue = parseInt(stock) || 0
        
        // 🔥 修復：即使庫存為 0 也要保存記錄，以便正確更新
        console.log(`📏 處理尺寸 ${size}: 原始值="${stock}", 轉換後=${stockValue}`)
        
        // 找到對應的尺寸屬性值 ID
        const sizeAttributeValue = this.allAttributeValues.find(av => 
          av.attributeId === 3 && av.value === size
        )
        
        if (!sizeAttributeValue) {
          console.warn(`找不到尺寸 "${size}" 的屬性值`)
          continue
        }
        
        // 創建尺寸-庫存記錄，關聯到顏色群組
        const sku = `${productId}-${variant.colorName}-${size}`
        
        productAttributeValues.push({
          productId: productId,
          attributeValueId: sizeAttributeValue.id, // 尺寸屬性值ID
          stock: stockValue, // 在尺寸記錄中儲存實際庫存
          sku: sku,
          skuGroupId: skuGroupId, // 關聯到顏色群組
          additionalPrice: 0
        })
        
        console.log(`📝 添加尺寸記錄: ${variant.colorName} ${size} = ${stockValue} (SkuGroupId: ${skuGroupId})`)
      }
    }
    
    console.log('📦 準備批量保存的屬性值記錄:')
    productAttributeValues.forEach((pav, index) => {
      console.log(`  ${index + 1}. AttributeValueId: ${pav.attributeValueId}, Stock: ${pav.stock}, SKU: ${pav.sku}, SkuGroupId: ${pav.skuGroupId}`)
    })
    
    if (productAttributeValues.length === 0) {
      console.log('⚠️ 沒有需要保存的屬性值記錄')
      return
    }
    
    // 🔥 批量保存
    console.log('💾 發送批量保存請求...')
    const response = await fetch('/api/ProductAttributeValues/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(productAttributeValues)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 批量保存 API 錯誤:', errorText)
      throw new Error(`批量保存失敗: ${errorText}`)
    }
    
    const result = await response.json()
    console.log('✅ 批量保存成功:', result.message || result)
    
    // 🔥 驗證：保存後立即查詢確認
    console.log('🔍 驗證保存結果...')
    await this.verifyStockUpdate(productId)
    
  } catch (error) {
    console.error('❌ 保存商品屬性值失敗:', error)
    throw error
  }
},

// 🔥 新增：驗證庫存更新的方法
async verifyStockUpdate(productId) {
  try {
    const response = await fetch(`/api/ProductAttributeValues/product/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    if (response.ok) {
      const savedData = await response.json()
      console.log('🔍 保存後的驗證資料:')
      savedData.forEach(pav => {
        if (pav.attributeValue?.attributeId === 3) { // 只顯示尺寸記錄
          console.log(`  📦 ${pav.attributeValue.value}: ${pav.stock} (SkuGroupId: ${pav.skuGroupId})`)
        }
      })
    }
  } catch (error) {
    console.warn('⚠️ 驗證保存結果時發生錯誤:', error)
  }
},

    // === 刪除現有屬性值的方法 ===
   async deleteExistingProductAttributeValues(productId) {
  try {
    console.log('🗑️ 刪除商品現有的屬性值記錄...')
    
    // 先查詢現有記錄數量
    const getResponse = await fetch(`/api/ProductAttributeValues/product/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    if (getResponse.ok) {
      const existingRecords = await getResponse.json()
      console.log(`🔍 找到 ${existingRecords.length} 個現有記錄`)
      
      if (existingRecords.length > 0) {
        // 嘗試批量刪除
        const deleteResponse = await fetch(`/api/ProductAttributeValues/product/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        if (deleteResponse.ok) {
          const result = await deleteResponse.json()
          console.log('✅ 批量刪除成功:', result.message || '已刪除現有記錄')
        } else {
          console.warn('⚠️ 批量刪除失敗，嘗試逐一刪除...')
          
          // 逐一刪除
          for (const record of existingRecords) {
            const singleDeleteResponse = await fetch(`/api/ProductAttributeValues/${record.id}`, {
              method: 'DELETE'
            })
            
            if (singleDeleteResponse.ok) {
              console.log(`✅ 刪除記錄 ID ${record.id}`)
            } else {
              console.warn(`⚠️ 刪除記錄 ID ${record.id} 失敗`)
            }
          }
        }
      } else {
        console.log('ℹ️ 沒有現有記錄需要刪除')
      }
    } else {
      console.warn('⚠️ 查詢現有記錄失敗')
    }
    
  } catch (error) {
    console.warn('⚠️ 刪除現有屬性值時發生錯誤:', error)
    // 不拋出錯誤，允許繼續保存新記錄
  }
},

    // === API 呼叫方法 ===
    async createProduct(productData) {
      try {
        console.log('🚀 發送商品創建請求...')
        console.log('📤 請求數據:', JSON.stringify(productData, null, 2))
        
        const response = await fetch('/api/Products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(productData)
        })

        console.log('📥 API 回應狀態:', response.status, response.statusText)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API 錯誤回應:', errorText)
          let errorMessage = `HTTP ${response.status}: ${errorText}`
          
          // 嘗試解析錯誤訊息
          try {
            const errorObj = JSON.parse(errorText)
            if (errorObj.message) {
              errorMessage = errorObj.message
            }
            if (errorObj.error) {
              errorMessage += ` - ${errorObj.error}`
            }
            // 如果有詳細的驗證錯誤
            if (errorObj.errors) {
              console.error('📋 詳細驗證錯誤:', errorObj.errors)
              errorMessage += '\n詳細錯誤:\n' + JSON.stringify(errorObj.errors, null, 2)
            }
          } catch (parseError) {
            console.log('無法解析錯誤回應為 JSON')
          }
          
          throw new Error(errorMessage)
        }

        const result = await response.json()
        console.log('✅ 商品創建成功:', result)
        return result
        
      } catch (error) {
        console.error('❌ 商品創建失敗:', error)
        console.error('❌ 錯誤堆疊:', error.stack)
        throw error
      }
    },

    async updateProduct(productId, productData) {
      try {
        const updateData = { ...productData, id: productId }
        
        const response = await fetch(`/api/Products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(updateData)
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        return { id: productId, ...productData }
        
      } catch (error) {
        console.error('❌ 更新商品失敗:', error)
        throw error
      }
    },

    // 關閉模態框
    closeModal() {
      // 🔥 清除載入狀態
      this.loadingProductData = false
      this.saving = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.modal {
  display: block !important;
}

.preview-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.image-order-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  margin-bottom: 10px;
  background: white;
}

.order-number {
  background: #007bff;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
}

.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn:disabled {
  opacity: 0.65;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>

<style scoped>
/* 重用原本的樣式 */
.border-dashed {
  border-style: dashed !important;
}

.object-fit-cover {
  object-fit: cover;
}

/* Modal 動畫 */
.modal.d-block {
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  animation: modalSlideIn 0.3s ease-out;
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

/* 圖片上傳區域樣式增強 */
.position-relative:has(input[type="file"]):hover {
  border-color: #0d6efd !important;
  background-color: rgba(13, 110, 253, 0.05);
}

/* 顏色圓圈邊框 */
.rounded-circle.border {
  border-width: 2px !important;
}

.rounded-circle.border:hover {
  border-color: #0d6efd !important;
  transform: scale(1.1);
  transition: all 0.2s ease-in-out;
}

/* 顏色圓圈固定為正圓與尺寸 */
.color-chip {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

/* 款式管理區域邊框樣式 */
.row.border.rounded {
  background-color: #f8f9fa;
  border-color: #dee2e6 !important;
  transition: all 0.2s ease-in-out;
}

.row.border.rounded:hover {
  border-color: #adb5bd !important;
  background-color: #e9ecef;
}

/* Badge 樣式 */
.badge {
  font-size: 0.75em;
  min-width: 2rem;
}

/* 滾動條樣式（適用於 WebKit 瀏覽器） */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ImageUploader 款式樣式 */
.variant-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

/* 款式區域的 ImageUploader 特殊樣式 */
.col-2{
  display: flex;
  align-items: center;
  gap: 20px;
}
.col-2 .image-uploader {
  height: 60px;
  width: 60px;
}

.col-2 .image-preview-container {
  height: 60px;
  width: 60px;
  position: relative;
}

.col-2 .upload-zone {
  min-height: 60px;
  height: 60px;
  width: 60px;
  padding: 0.375rem 0.25rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.col-2 .upload-icon {
  font-size: 1rem;
  margin-bottom: 0.125rem;
}

.col-2 .upload-text {
  font-size: 0.55rem;
  margin-bottom: 0;
  line-height: 1;
}

.col-2 .upload-hint {
  font-size: 0.5rem;
  margin-bottom: 0;
  line-height: 1;
  opacity: 0.8;
}

.col-2 .preview-image {
  height: 60px;
  width: 60px;
  border-radius: 6px;
  border-width: 1px;
}

.col-2 .image-overlay {
  border-radius: 6px;
}

.col-2 .image-actions .btn {
  font-size: 0.55rem;
  padding: 0.125rem 0.25rem;
}

.col-2 .image-actions .btn i {
  font-size: 0.65rem;
}
</style>

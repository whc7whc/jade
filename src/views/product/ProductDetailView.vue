<template>
  <div class="product-detail-view">
    <!-- 載入中狀態 -->
    <div v-if="loading" class="container my-5">
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>

      </div>
    </div>
    <div v-else class="container">

      <div class="row">
        <!-- 商品圖片區域 -->
        <div class="col-lg-6 mb-4">
          <!-- 主要圖片輪播 -->
          <div 
            class="main-image-container mb-3 position-relative"
            @keydown.left.prevent="prevImage"
            @keydown.right.prevent="nextImage"
            tabindex="0"
            ref="carouselContainer"
          >
            <transition name="fade" mode="out-in">
              <img
                :key="currentImage"
                :src="currentImage"
                :alt="product.name"
                class="img-fluid rounded shadow-sm w-100 main-image"
                style="aspect-ratio:1; object-fit:cover;"
                @touchstart="onTouchStart"
                @touchmove="onTouchMove"
                @touchend="onTouchEnd"
                draggable="false"
              />
            </transition>
            <!-- 導航按鈕 -->
            <button v-if="hasMultipleImages" class="carousel-nav prev" @click="prevImage" aria-label="上一張">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button v-if="hasMultipleImages" class="carousel-nav next" @click="nextImage" aria-label="下一張">
              <i class="fas fa-chevron-right"></i>
            </button>
            <!-- 指示點 -->
            <div v-if="hasMultipleImages" class="carousel-indicators">
              <button
                v-for="(img, idx) in product.images"
                :key="idx"
                :class="['indicator',{active: idx===currentImageIndex}]"
                @click="goToImage(idx)"
                :aria-label="`跳到第 ${idx+1} 張`"
              ></button>
            </div>
          </div>
          
          <!-- 圖片縮略圖（Swiper 輪播，一次4格、每次滑動1格） -->
          <div class="thumbnail-container" v-if="hasMultipleImages">
            <div class="thumb-swiper swiper" ref="thumbSwiperEl">
              <div class="swiper-wrapper">
                <div class="swiper-slide" v-for="(image, index) in product.images" :key="index">
                  <div class="thumb-wrapper" :class="{active: index===currentImageIndex}" @click="goToImage(index)">
                    <img
                      :src="image"
                      :alt="`${product.name} 圖片 ${index + 1}`"
                      class="img-fluid rounded cursor-pointer"
                      style="aspect-ratio:1; object-fit:cover;"
                      draggable="false"
                    />
                  </div>
                </div>
              </div>
              <!-- <div class="swiper-button-prev thumbs-prev" aria-label="上一組縮圖"></div>
              <div class="swiper-button-next thumbs-next" aria-label="下一組縮圖"></div> -->
            </div>
          </div>
        </div>

        <!-- 商品資訊區域 -->
        <div class="col-lg-6">
          <!-- 商品標題與評價 -->
          <div class="mb-3">
            <h1 class="h3 mb-2">{{ product.name }}</h1>
            <div class="d-flex align-items-center mb-2">
              <div class="rating me-2">
                <i 
                  v-for="star in 5" 
                  :key="star"
                  class="fas fa-star"
                  :class="star <= Math.floor(product.rating) ? 'text-warning' : 'text-muted'"
                ></i>
                <span class="ms-1">{{ product.rating }}</span>
              </div>
              <span class="text-muted">|</span>
              <span class="text-muted ms-2">已售出 {{ product.soldCount }} 件</span>
            </div>
          </div>

          <!-- 價格 -->
          <div class="price-section mb-4">
            <div class="d-flex align-items-center">
              <span class="h4 text-danger fw-bold me-3">NT$ {{ product.price.toLocaleString() }}</span>
              <span 
                v-if="product.originalPrice > product.price" 
                class="text-muted text-decoration-line-through"
              >
                NT$ {{ product.originalPrice.toLocaleString() }}
              </span>
            </div>
            <div 
              v-if="product.originalPrice > product.price" 
              class="badge bg-danger mt-1"
            >
              省 NT$ {{ (product.originalPrice - product.price).toLocaleString() }}
            </div>
          </div>

          <!-- 商品選項 -->
          <div class="product-options mb-4">
            <!-- 顏色選擇 -->
            <div v-if="product.colors && product.colors.length > 0" class="mb-3">
              <label class="form-label fw-semibold">顏色</label>
              <div class="d-flex gap-2">
                <button
                  v-for="color in product.colors"
                  :key="color.name"
                  class="btn color-option"
                  :class="{ 'active': selectedColor === color.name }"
                  :style="{ backgroundColor: color.code }"
                  @click="selectedColor = color.name"
                  :title="color.name"
                >
                  <span v-if="selectedColor === color.name">✓</span>
                </button>
              </div>
              <small class="text-muted">已選擇: {{ selectedColor }}</small>
            </div>

            <!-- 尺寸選擇 -->
            <div v-if="product.sizes && product.sizes.length > 0" class="mb-3">
              <label class="form-label fw-semibold">尺寸</label>
              <div class="d-flex gap-2 flex-wrap">
                <button
                  v-for="size in displaySizes"
                  :key="size"
                  class="btn btn-detail-reverse size-option"
                  :class="{ 'active': selectedSize === size }"
                  :disabled="getSizeStock(size) === 0"
                  @click="selectedSize = size"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- 數量選擇 -->
            <div class="mb-3">
              <label class="form-label fw-semibold">數量</label>
              <div class="d-flex align-items-center">
                <button 
                  class="btn btn-detail-reverse"
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                >
                  -
                </button>
                <input 
                  v-model.number="quantity" 
                  type="number"
                  min="1"
                  :max="currentStock"
                  class="form-control mx-2 text-center no-spinner"
                  style="width: 80px;"
                  readonly
                  @wheel.prevent
                  @blur="validateQuantity"
                >
                <button 
                  class="btn btn-detail-reverse"
                  @click="increaseQuantity"
                  :disabled="quantity >= currentStock"
                >
                  +
                </button>
                <span class="text-muted ms-3">庫存: {{ currentStock }} 件</span>
              </div>
              <!-- 庫存不足警告 -->
              <div v-if="quantity > currentStock" class="text-danger small mt-1">
                <i class="fas fa-exclamation-triangle me-1"></i>
                數量不可超過庫存 {{ currentStock }} 件
              </div>
              <!-- 庫存低警告 -->
              <div v-else-if="currentStock <= 5 && currentStock > 0" class="text-warning small mt-1">
                <i class="fas fa-exclamation-circle me-1"></i>
                庫存不多，僅剩 {{ currentStock }} 件
              </div>
            </div>
          </div>

          <!-- 購買按鈕 -->
          <PurchaseButtons
            :product="product"
            :selected-color="selectedColor"
            :selected-size="selectedSize"
            :quantity="quantity"
            :current-stock="currentStock"
            :current-image="currentImage"
            @cart-updated="handleCartUpdated"
            @need-login="handleNeedLogin"
          />

          <!-- 商品特色 -->
          <div class="product-features">
            <div class="row text-center">
              <div class="col-4">
                <i class="fas fa-shipping-fast text-primary mb-2 d-block"></i>
                <small>免費配送</small>
              </div>
              <div class="col-4">
                <i class="fas fa-undo text-primary mb-2 d-block"></i>
                <small>7天鑑賞期</small>
              </div>
              <div class="col-4">
                <i class="fas fa-shield-alt text-primary mb-2 d-block"></i>
                <small>品質保證</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品詳細說明 -->
      <div class="row mt-5">
        <div class="col-12">
          <ul class="nav nav-tabs" id="productTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link active" 
                id="description-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#description" 
                type="button" 
                role="tab"
              >
                商品介紹
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                id="specifications-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#specifications" 
                type="button" 
                role="tab"
              >
                規格說明
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                id="reviews-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#reviews" 
                type="button" 
                role="tab"
              >
                商品評價
              </button>
            </li>
          </ul>
          
          <div class="tab-content" id="productTabsContent">
            <!-- 商品介紹 -->
            <div class="tab-pane fade show active" id="description" role="tabpanel">
              <div class="p-4">
                <div v-html="product.description"></div>
              </div>
            </div>
            
            <!-- 規格說明 -->
            <div class="tab-pane fade" id="specifications" role="tabpanel">
              <div class="p-4">
                <table class="table">
                  <tbody>
                    <tr v-for="(spec, key) in product.specifications" :key="key">
                      <td class="fw-semibold" style="width: 150px;">{{ key }}</td>
                      <td>{{ spec }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- 商品評價 -->
            <div class="tab-pane fade" id="reviews" role="tabpanel">
              <div class="p-4">
                <!-- 新增評價表單 -->
                <div class="card mb-4">
                  <div class="card-body">
                    <h6 class="mb-3">新增評價</h6>
                    <div class="d-flex align-items-center mb-3">
                      <span class="me-2">評分：</span>
                      <i v-for="i in 5" :key="i"
                         class="fas fa-star fa-lg cursor-pointer"
                         :class="i <= (reviewHover || newReview.rating) ? 'text-warning' : 'text-muted'"
                         @mouseover="reviewHover = i"
                         @mouseleave="reviewHover = 0"
                         @click="newReview.rating = i"
                      ></i>
                      <span class="ms-2 text-muted">{{ newReview.rating || 0 }}/5</span>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">留言</label>
                      <textarea v-model.trim="newReview.comment" rows="3" class="form-control" placeholder="分享你的使用心得吧"></textarea>
                    </div>
                    <div class="text-end">
                      <button class="btn btn-detail" :disabled="submittingReview || !newReview.rating || !newReview.comment" @click="submitReview">
                        {{ submittingReview ? '送出中...' : '送出評價' }}
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="product.reviews && product.reviews.length > 0">
                  <div v-for="review in product.reviews" :key="review.id" class="border-bottom pb-3 mb-3">
                    <div class="d-flex align-items-center mb-2">
                      <div class="rating me-2">
                        <i 
                          v-for="star in 5" 
                          :key="star"
                          class="fas fa-star fa-sm"
                          :class="star <= review.rating ? 'text-warning' : 'text-muted'"
                        ></i>
                      </div>
                      <span class="fw-semibold me-2">{{ review.username }}</span>
                      <small class="text-muted">{{ formatDate(review.date) }}</small>
                    </div>
                    <p class="mb-0">{{ review.comment }}</p>
                  </div>
                </div>
                <div v-else class="text-center text-muted py-4">
                  <i class="fas fa-comment-slash fa-2x mb-3"></i>
                  <p>尚無評價</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 相關商品推薦 -->
      <div class="row mt-5" v-if="relatedProducts.length > 0">
        <div class="col-12">
          <h4 class="mb-4">
            <i class="fas fa-heart me-2 text-danger"></i>您可能也喜歡
          </h4>
          <div class="row">
            <div 
              v-for="relatedProduct in relatedProducts" 
              :key="relatedProduct.id"
              class="col-lg-3 col-md-4 col-sm-6 mb-4"
            >
              <div class="card h-100 shadow-sm related-product-card" @click="goToProduct(relatedProduct.id)">
                <div class="card-img-top position-relative overflow-hidden" style="aspect-ratio: 1;">
                  <img 
                    :src="getRelatedProductImage(relatedProduct)" 
                    :alt="relatedProduct.name"
                    class="w-100 h-100 object-fit-cover"
                  >
                  <div class="card-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <button class="btn btn-detail btn-sm">查看詳情</button>
                  </div>
                </div>
                <div class="card-body">
                  <h6 class="card-title text-truncate mb-2" :title="relatedProduct.name">
                    {{ relatedProduct.name }}
                  </h6>
                  <div class="d-flex align-items-center mb-2">
                    <div class="rating me-2">
                      <i 
                        v-for="star in 5" 
                        :key="star"
                        class="fas fa-star fa-sm"
                        :class="star <= Math.floor(relatedProduct.rating || 4) ? 'text-warning' : 'text-light'"
                      ></i>
                      <span class="ms-1 small text-muted">{{ relatedProduct.rating || 4.0 }}</span>
                    </div>
                  </div>
                  <div class="price-section">
                    <span class="h6 text-danger mb-0">NT$ {{ relatedProduct.price.toLocaleString() }}</span>
                    <span 
                      v-if="relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price" 
                      class="small text-muted text-decoration-line-through ms-2"
                    >
                      NT$ {{ relatedProduct.originalPrice.toLocaleString() }}
                    </span>
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
// import cartService from '@/services/cartService' // 暫時不使用

import Swiper, { Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'

import PurchaseButtons from '@/components/PurchaseButtons.vue'


export default {
  name: 'ProductDetailView',
  components: {
    PurchaseButtons
  },
  data() {
    return {
      product: null,
      loading: true,
  // 圖片輪播控制
  currentImageIndex: 0,
  isTransitioning: false,
      selectedColor: '',
      selectedSize: '',
      quantity: 1,
  relatedProducts: [], // 新增相關商品
  // 評價表單
  newReview: { rating: 0, comment: '' },
  reviewHover: 0,
  submittingReview: false
    }
  },
  computed: {
    // 顯示用尺寸清單：若只有一種且為常見服飾尺寸，展開為完整尺寸表，其餘情況維持原樣
  displaySizes() {
  const baseScale = ['XS','S','M','L','XL','2XL']
      const sizes = Array.isArray(this.product?.sizes) ? this.product.sizes : []
      if (sizes.length === 1) {
    const single = String(sizes[0]).toUpperCase()
    if (baseScale.includes(single)) return baseScale
      }
      return sizes
    },
    currentImage() {
      if (!this.product || !this.product.images || !this.product.images.length) return this.getFallbackImage()
      return this.product.images[this.currentImageIndex] || this.product.images[0]
    },
    hasMultipleImages() {
      return this.product && this.product.images && this.product.images.length > 1
    },
    // 目前顏色下各尺寸的庫存表
    sizeStocks() {
      const map = {}
      if (!this.product) return map
      const pavs = this.product.productAttributeValues || []
      const sizes = Array.isArray(this.product.sizes) ? this.product.sizes : []

      // 找出當前顏色的 skuGroupId
      let selectedGroupId = null
      if (this.selectedColor) {
        const colorPav = pavs.find(p => {
          const av = p.attributeValue
          const isColorAttr = av && (av.attribute?.id === 2 || /顏色|color/i.test(av.attribute?.name || ''))
          return isColorAttr && (av.value === this.selectedColor)
        })
        selectedGroupId = colorPav?.skuGroupId || null
      }

      for (const size of sizes) {
        // 精準: 以顏色 groupId + 尺寸匹配
        let stock = 0
        if (selectedGroupId) {
          const sizePav = pavs.find(p => {
            const av = p.attributeValue
            const isSizeAttr = av && (av.attribute?.id === 3 || /尺寸|size/i.test(av.attribute?.name || ''))
            return isSizeAttr && p.skuGroupId === selectedGroupId && av.value === size
          })
          stock = parseInt(sizePav?.stock || 0) || 0
        } else {
          // 若沒有 groupId，聚合該尺寸所有記錄
          const sizePavs = pavs.filter(p => {
            const av = p.attributeValue
            const isSizeAttr = av && (av.attribute?.id === 3 || /尺寸|size/i.test(av.attribute?.name || ''))
            return isSizeAttr && av.value === size
          })
          stock = sizePavs.reduce((sum, p) => sum + (parseInt(p.stock || 0) || 0), 0)
        }
        map[size] = stock
      }

      return map
    },
    // 依據所選顏色與尺寸計算目前庫存
    currentStock() {
      // 若尚未載入商品或沒有尺寸/顏色，回退至商品總庫存
      if (!this.product) return 0
      const pavs = this.product.productAttributeValues || []
      // 若無尺寸或顏色概念，使用總庫存
      const hasSizes = Array.isArray(this.product.sizes) && this.product.sizes.length > 0
      const hasColors = Array.isArray(this.product.colors) && this.product.colors.length > 0
      if (!hasSizes && !hasColors) return this.product.stock || 0

      // 推論當前選取的 color 對應的 skuGroupId（顏色分組）
      let selectedGroupId = null
      if (hasColors && this.selectedColor) {
        // 從 PAV 中找 attributeId=2 的顏色項，名稱匹配 selectedColor，取其 skuGroupId
        const colorPav = pavs.find(p => {
          const av = p.attributeValue
          const isColorAttr = av && (av.attribute?.id === 2 || /顏色|color/i.test(av.attribute?.name || ''))
          return isColorAttr && (av.value === this.selectedColor)
        })
        selectedGroupId = colorPav?.skuGroupId || null
      }

      // 計算顏色+尺寸的單一變體庫存
      if (hasSizes && this.selectedSize) {
        // 先以 skuGroupId+Size 精準查找
        if (selectedGroupId) {
          // PAV 設計：尺寸記錄 (attributeId=3) 同一 skuGroupId 下每個尺寸一筆，stock 在該 PAV 上
          const sizePav = pavs.find(p => {
            const av = p.attributeValue
            const isSizeAttr = av && (av.attribute?.id === 3 || /尺寸|size/i.test(av.attribute?.name || ''))
            return isSizeAttr && p.skuGroupId === selectedGroupId && av.value === this.selectedSize
          })
          if (sizePav) return parseInt(sizePav.stock || 0)
        }

        // 若無顏色（或找不到 groupId），可能沒有分組，直接找尺寸對應的 stock 加總或取首筆
        const sizePavs = pavs.filter(p => {
          const av = p.attributeValue
          const isSizeAttr = av && (av.attribute?.id === 3 || /尺寸|size/i.test(av.attribute?.name || ''))
          return isSizeAttr && av.value === this.selectedSize
        })
        if (sizePavs.length > 0) {
          // 常見情況是一 size 一顏色對應一筆，這裡取加總以避免低估
          return sizePavs.reduce((sum, p) => sum + (parseInt(p.stock || 0) || 0), 0)
        }
      }

      // 若只選了顏色未選尺寸，回傳該顏色所有尺寸庫存加總，供顯示
      if (selectedGroupId) {
        const colorSizePavs = pavs.filter(p => {
          const av = p.attributeValue
          const isSizeAttr = av && (av.attribute?.id === 3 || /尺寸|size/i.test(av.attribute?.name || ''))
          return isSizeAttr && p.skuGroupId === selectedGroupId
        })
        if (colorSizePavs.length > 0) {
          return colorSizePavs.reduce((sum, p) => sum + (parseInt(p.stock || 0) || 0), 0)
        }
      }

      // 退回總庫存
      return this.product.stock || 0
    }
  },
  async mounted() {
    await this.loadProduct()
  this.$nextTick(() => this.initThumbSwiper())
  },
  methods: {
    // 計算平均評分（四捨五入到一位小數）
    computeAverageRating(reviews) {
      if (!Array.isArray(reviews) || reviews.length === 0) return 0
      const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0)
      return Math.round((sum / reviews.length) * 10) / 10
    },
    getSizeStock(size) {
  return this.sizeStocks?.[size] ?? 0
    },
    async loadProduct() {
      try {
        this.loading = true
        const productId = this.$route.params.id
        
        console.log('🛍️ 載入商品詳情，ID:', productId)
        
        // 使用與 ProductsView 相同的 API 結構
        const response = await fetch(`/api/Products/${productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        console.log('Product Detail API Response Status:', response.status)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('商品不存在')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Product Detail API Data:', data)
        
        // 額外調用 ProductAttributeValues API 來取得最新的庫存和屬性資料
        console.log('📡 調用 ProductAttributeValues API...')
        let productAttributeValues = data.productAttributeValues || []
        
        try {
          // 先嘗試使用 productId 參數
          let attributeValuesResponse = await fetch(`/api/ProductAttributeValues?productId=${productId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })
          
          // 如果有錯誤，嘗試不使用參數
          if (!attributeValuesResponse.ok) {
            console.log('🔄 嘗試調用所有 ProductAttributeValues...')
            attributeValuesResponse = await fetch('/api/ProductAttributeValues', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            })
          }
          
          console.log('ProductAttributeValues API Response Status:', attributeValuesResponse.status)
          
          if (attributeValuesResponse.ok) {
            const attributeValuesData = await attributeValuesResponse.json()
            console.log('ProductAttributeValues API Data:', attributeValuesData)
            
            // 如果是陣列，過濾出目前商品的屬性值
            if (Array.isArray(attributeValuesData)) {
              productAttributeValues = attributeValuesData.filter(item => 
                item.productId === parseInt(productId)
              )
              console.log(`🎯 找到 ${productAttributeValues.length} 個相關的 ProductAttributeValues`)
            } else {
              // 如果直接返回商品的屬性值
              productAttributeValues = attributeValuesData || []
            }
          } else {
            console.warn('⚠️ ProductAttributeValues API 調用失敗，使用 Product API 中的資料')
          }
        } catch (error) {
          console.warn('⚠️ ProductAttributeValues API 調用錯誤:', error)
          console.warn('使用 Product API 中的 productAttributeValues 資料')
        }
        
        // 正規化圖片資料 (支援 ProductImages / productImages 與 ImagesUrl 欄位)
        const normalizeImages = (p) => {
          const raw = p.productImages || p.ProductImages || []
          return raw.map(img => ({
            id: img.id || img.Id,
            sortOrder: img.sortOrder || img.SortOrder || 0,
            url: img.ImagesUrl || img.imagePath || img.url || img.imagesUrl
          })).filter(i => i.url).sort((a, b) => a.sortOrder - b.sortOrder)
        }

        const normImages = normalizeImages(data)

        this.product = {
          id: data.id || data.Id,
            name: data.name || data.Name,
            price: data.price ?? data.Price ?? 0,
            originalPrice: data.originalPrice || data.OriginalPrice || data.discountPrice || data.DiscountPrice || data.price || data.Price,
            description: data.description || data.Description || this.getDefaultDescription(data.name),
            rating: data.rating || data.Rating || 4.0,
            soldCount: data.soldCount || data.SoldCount || 0,
            stock: this.getProductStock({ ...data, productAttributeValues }),
            categoryId: data.categoryId || data.CategoryId,
            subCategoryId: data.subCategoryId || data.SubCategoryId,
            images: normImages.length ? normImages.map(i => i.url) : this.getProductImages(data),
            colors: this.getProductColors({ ...data, productAttributeValues }),
            sizes: this.getProductSizes({ ...data, productAttributeValues }),
            specifications: this.getProductSpecifications(data),
            reviews: this.getProductReviews(data),
            productImages: normImages.length ? normImages : (data.productImages || data.ProductImages || []),
            productAttributeValues: productAttributeValues,
            productReviews: data.productReviews || data.ProductReviews || []
        }
        
  // 設定預設索引
  this.currentImageIndex = 0
        this.selectedColor = this.product.colors?.[0]?.name || ''
        this.selectedSize = this.product.sizes?.[0] || ''
        
  // 確保已載入分類/子分類名稱，並回填到商品與規格
  await this.ensureCategoryData()
  const _catName = this.getCategoryNameById(this.product.categoryId)
  const _subCatName = this.getSubCategoryNameById(this.product.subCategoryId)
  if (_catName) this.product.categoryName = _catName
  if (_subCatName) this.product.subCategoryName = _subCatName
  // 以名稱重算規格顯示
  this.product.specifications = this.getProductSpecifications(this.product)

        console.log('✅ 商品資料處理完成:', this.product)
        
        // 載入相關商品
  await this.loadRelatedProducts()
  // 載入評價
  await this.loadReviews(this.product.id)
  // 初始化或更新縮略圖輪播
  this.$nextTick(() => this.initThumbSwiper())
        
      } catch (error) {
        console.error('❌ 載入商品失敗:', error)
        
        if (error.message === '商品不存在') {
          this.product = null
        } else {
          // 使用測試資料作為備案，但保持與後端API一致的結構
          console.log('⚠️ 使用測試資料作為備案')
          this.product = {
            id: parseInt(this.$route.params.id),
            name: '春季條紋長袖上衣',
            price: 1280,
            originalPrice: 1600,
            description: this.getDefaultDescription('春季條紋長袖上衣'),
            rating: 4.5,
            soldCount: 128,
            stock: 50, // 確保有庫存
            categoryId: 1,
            subCategoryId: 1,
            images: [
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&h=500&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=500&h=500&fit=crop&auto=format'
            ],
            colors: [
              { name: '白色', code: '#ffffff' },
              { name: '黑色', code: '#000000' },
              { name: '灰色', code: '#808080' }
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            specifications: {
              '材質': '100% 純棉',
              '產地': '台灣',
              '洗滌方式': '機洗冷水，低溫烘乾',
              '版型': '修身版',
              '適用季節': '春秋季'
            },
            reviews: [
              {
                id: 1,
                username: '小美',
                rating: 5,
                comment: '質料很好，穿起來很舒服，版型也很好看！',
                date: new Date('2024-01-15')
              },
              {
                id: 2,
                username: '阿華',
                rating: 4,
                comment: '顏色跟圖片一樣，品質不錯，推薦！',
                date: new Date('2024-01-10')
              }
            ],
            // 模擬後端資料結構
            productImages: [
              {
                id: 1,
                productId: parseInt(this.$route.params.id),
                imagePath: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&auto=format',
                sortOrder: 1
              },
              {
                id: 2,
                productId: parseInt(this.$route.params.id),
                imagePath: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&h=500&fit=crop&auto=format',
                sortOrder: 2
              }
            ],
            productAttributeValues: [
              // 模擬真實 API 結構的庫存資料
              {
                id: 1,
                productId: parseInt(this.$route.params.id),
                attributeValueId: 11,
                stock: 25, // 直接在 ProductAttributeValue 中的庫存欄位
                sku: "SKU001-BLACK-M",
                skuGroupId: 1,
                additionalPrice: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                attributeValue: {
                  id: 11,
                  value: "黑色",
                  hexCode: "#000000",
                  attributeId: 2,
                  sellersId: 1,
                  attribute: {
                    id: 2,
                    name: "顏色",
                    description: "商品顏色選項",
                    sellersId: 1,
                    isApproved: true
                  }
                }
              },
              {
                id: 2,
                productId: parseInt(this.$route.params.id),
                attributeValueId: 12,
                stock: 15, // 另一個變體的庫存
                sku: "SKU001-WHITE-M",
                skuGroupId: 1,
                additionalPrice: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                attributeValue: {
                  id: 12,
                  value: "白色",
                  hexCode: "#ffffff",
                  attributeId: 2,
                  sellersId: 1,
                  attribute: {
                    id: 2,
                    name: "顏色",
                    description: "商品顏色選項",
                    sellersId: 1,
                    isApproved: true
                  }
                }
              }
            ],
            productReviews: []
          }
          
          // 設定預設索引
          this.currentImageIndex = 0
          this.selectedColor = this.product.colors?.[0]?.name || ''
          this.selectedSize = this.product.sizes?.[0] || ''
        }
      } finally {
        this.loading = false
      }
    },
    async loadReviews(productId) {
      try {
        const res = await fetch(`/api/Reviews?productId=${productId}`, { headers: { 'Accept': 'application/json' } })
        if (!res.ok) throw new Error(`reviews http ${res.status}`)
        const list = await res.json()
        // 寫入 product.productReviews 以共用現有 getProductReviews 邏輯
        this.product.productReviews = Array.isArray(list) ? list : []
  const mapped = this.getProductReviews({ productReviews: this.product.productReviews })
  // 僅顯示 isVerified === true 的評論
  const verified = mapped.filter(r => r.isVerified === true)
  this.product.reviews = verified
  // 重新計算並回寫平均評分與評論數（基於已核可的評論）
  this.product.rating = this.computeAverageRating(verified)
  this.product.reviewCount = verified.length
      } catch (e) {
        console.warn('載入評價失敗，維持空清單', e)
        this.product.reviews = []
  this.product.rating = 0
  this.product.reviewCount = 0
      }
    },
    async submitReview() {
      if (!this.product?.id) return
      if (!this.newReview.rating || !this.newReview.comment) return
      // 新增：未登入先導向登入頁
      const memberId = parseInt(localStorage.getItem('memberId')) || null
      const memberName = localStorage.getItem('memberName') || null
      if (!memberId) {
        this.showToast('請先登入後再留下評價', 'warning')
        this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } })
        return
      }
      this.submittingReview = true
      try {
        // 會員已登入，送出

        const payload = {
          productId: this.product.id,
          rating: this.newReview.rating,
          comment: this.newReview.comment,
          customerId: memberId,
          customerName: memberName
        }
        const res = await fetch('/api/Reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const text = await res.text()
          // 根據狀態碼提供更友善提示
          if (res.status === 401) {
            this.showToast('請先登入後再留下評價', 'warning')
            this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } })
            return
          }
          if (res.status === 403) {
            this.showToast('僅限已完成訂單的會員可評價此商品', 'danger')
            return
          }
          if (res.status === 409) {
            this.showToast('每筆完成訂單限留一則評價，您已達上限', 'warning')
            return
          }
          throw new Error(text || `http ${res.status}`)
        }
        this.showToast('評價已送出，感謝您的回饋！', 'success')
        // 重置表單
        this.newReview.rating = 0
        this.newReview.comment = ''
        // 重新載入
        await this.loadReviews(this.product.id)
      } catch (e) {
        console.error(e)
        this.showToast('僅限已完成訂單的會員可評價此商品', 'danger')
      } finally {
        this.submittingReview = false
      }
    },
    initThumbSwiper() {
      if (!this.$refs.thumbSwiperEl || !this.hasMultipleImages) {
        if (this._thumbSwiper) {
          this._thumbSwiper.destroy(true, true)
          this._thumbSwiper = null
        }
        return
      }
      if (this._thumbSwiper) {
        this._thumbSwiper.update()
        return
      }
      Swiper.use([Navigation])
      this._thumbSwiper = new Swiper(this.$refs.thumbSwiperEl, {
        slidesPerView: 4,
        spaceBetween: 8,
        slidesPerGroup: 1,
        navigation: {
          nextEl: '.thumbs-next',
          prevEl: '.thumbs-prev'
        },
        watchOverflow: true,
        breakpoints: {
          0: { slidesPerView: 4 },
          576: { slidesPerView: 4 },
          768: { slidesPerView: 4 },
          992: { slidesPerView: 4 }
        }
      })
    },

    // 取得商品圖片 - 支援 ImagesUrl 欄位
    getProductImages(product) {
      if (!product) return [this.getFallbackImage()] 
      const imgs = product.productImages || product.ProductImages
      if (imgs && imgs.length) {
        return [...imgs]
          .sort((a, b) => (a.sortOrder || a.SortOrder || 0) - (b.sortOrder || b.SortOrder || 0))
          .map(i => i.imagePath || i.ImagesUrl || i.url)
          .filter(Boolean)
      }
      if (product.imagePath) return [product.imagePath]
      return [this.getFallbackImage()]
    },
    getFallbackImage() {
      return 'https://via.placeholder.com/500?text=No+Image'
    },

    // 取得商品顏色選項 - 兼容多種欄位命名（camelCase/PascalCase）
    getProductColors(product) {
      const pavs = product.productAttributeValues || []
      if (!Array.isArray(pavs) || pavs.length === 0) {
        return [
          { name: '黑色', code: '#000000' },
          { name: '白色', code: '#ffffff' }
        ]
      }

      const isColorAttr = (attrObj) => {
        const name = (attrObj?.name || attrObj?.Name || '').toString()
        return /顏色|color|色彩/i.test(name)
      }

      const pickHex = (av) =>
        av?.hexCode ||
        av?.HexCode ||
        av?.color_code ||
        av?.ColorCode ||
        av?.hex ||
        av?.Hex ||
        av?.hexColor ||
        av?.HexColor ||
        null

      const colors = []
      const seen = new Set()

      for (const pav of pavs) {
        const av = pav.attributeValue || pav.AttributeValue || pav
        const attr = av.attribute || av.Attribute
        if (!attr) continue
        if (!isColorAttr(attr)) continue

        const name = (av.value || av.Value || av.name || av.Name || '').toString().trim()
        if (!name) continue

        let code = pickHex(av)
        if (!code) code = this.getDefaultColorCode(name)

        const key = `${name}|${code}`.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        colors.push({ name, code })
      }

      if (colors.length === 0) {
        return [
          { name: '黑色', code: '#000000' },
          { name: '白色', code: '#ffffff' }
        ]
      }
      return colors
    },

    // 取得商品尺寸選項 - 僅回傳真實尺寸（去重），無預設假資料
    getProductSizes(product) {
      const pavs = product.productAttributeValues || []
      if (!Array.isArray(pavs) || pavs.length === 0) return []

      const sizes = []
      const seen = new Set()
      for (const pav of pavs) {
        const av = pav.attributeValue || pav
        const attr = av.attribute || av.Attribute
        const attrName = (attr?.name || attr?.Name || '').toString()
        const isSize = /尺寸|size|大小/i.test(attrName) || av.attributeId === 3 || av.attribute_id === 3
        if (!isSize) continue
        const val = (av.value || av.Value || av.name || av.Name || '').toString().trim()
        if (!val || seen.has(val)) continue
        seen.add(val)
        sizes.push(val)
      }
      return sizes
    },

    // 取得預設顏色代碼
    getDefaultColorCode(colorName) {
      const colorMap = {
        '黑色': '#000000',
        '白色': '#ffffff',
        '紅色': '#ff0000',
        '藍色': '#0000ff',
        '綠色': '#00ff00',
        '黃色': '#ffff00',
        '紫色': '#800080',
        '粉色': '#ffc0cb',
        '灰色': '#808080',
        '棕色': '#a52a2a',
        '橙色': '#ffa500'
      }
      
      return colorMap[colorName] || '#cccccc'
    },

    // 取得商品庫存 - 根據真實 ProductAttributeValues API 結構
    getProductStock(product) {
      console.log('📦 開始處理商品庫存...')
      console.log('🔍 商品資料:', product)
      
      // 1. 優先從 ProductAttributeValues 中的 stock 欄位取得庫存
      if (product.productAttributeValues && product.productAttributeValues.length > 0) {
        console.log('🔍 在 ProductAttributeValues 中尋找庫存資料...')
        console.log('📊 ProductAttributeValues:', product.productAttributeValues)
        
        // 根據真實 API 結構，每個 ProductAttributeValue 都有自己的 stock 欄位
        let totalStock = 0
        let hasValidStock = false
        
        product.productAttributeValues.forEach((pav, index) => {
          console.log(`📦 檢查 ProductAttributeValue ${index}:`, pav)
          
          // 直接從 ProductAttributeValue 的 stock 欄位取得庫存
          if (pav.stock !== undefined && pav.stock !== null) {
            const stockValue = parseInt(pav.stock) || 0
            console.log(`✅ 找到庫存 (PAV ${index}): ${stockValue}`)
            totalStock += stockValue
            hasValidStock = true
          }
        })
        
        if (hasValidStock) {
          console.log(`✅ 總庫存量 (來自 ProductAttributeValues): ${totalStock}`)
          return totalStock
        }
        
        // 如果沒有在 stock 欄位找到，嘗試在 attributeValue 的 value 中找庫存相關資料
        for (const pav of product.productAttributeValues) {
          if (pav.attributeValue && pav.attributeValue.attribute) {
            const attrName = pav.attributeValue.attribute.name?.toLowerCase() || ''
            
            if (attrName.includes('庫存') || attrName.includes('stock') || attrName.includes('數量')) {
              const stockValue = parseInt(pav.attributeValue.value) || 0
              console.log(`✅ 從屬性值找到庫存 (${pav.attributeValue.attribute.name}): ${stockValue}`)
              return stockValue
            }
          }
        }
      }
      
      // 2. 從商品主資料的 stock 欄位查找
      if (product.stock !== undefined && product.stock !== null) {
        const stockValue = parseInt(product.stock) || 0
        console.log(`✅ 從商品主資料取得庫存: ${stockValue}`)
        return stockValue
      }
      
      // 3. 檢查其他可能的庫存欄位
      const stockFields = ['stockQuantity', 'inventory', 'quantity', 'availableStock']
      for (const field of stockFields) {
        if (product[field] !== undefined && product[field] !== null) {
          const stockValue = parseInt(product[field]) || 0
          console.log(`✅ 從 ${field} 欄位取得庫存: ${stockValue}`)
          return stockValue
        }
      }
      
      // 4. 預設庫存值
      console.log('⚠️ 未找到庫存資料，使用預設值: 50')
      return 50
    },

    // 取得商品規格 - 整合後端資料
    getProductSpecifications(product) {
      const specs = {
        '商品編號': product.sku || product.id || 'N/A',
        '品牌': product.brand || 'JADE'
      }
      
      // 從基本商品資訊取得規格
      if (product.weight) specs['重量'] = `${product.weight}g`
      if (product.dimensions) specs['尺寸'] = product.dimensions
      if (product.material) specs['材質'] = product.material
  // 顯示分類與子分類名稱（取代 ID 顯示）
  const categoryName = product.categoryName || this.getCategoryNameById?.(product.categoryId)
  if (categoryName) specs['分類'] = categoryName
  const subCategoryName = product.subCategoryName || this.getSubCategoryNameById?.(product.subCategoryId)
  if (subCategoryName) specs['子分類'] = subCategoryName
      
      // 從 ProductAttributeValues 取得額外規格資訊
      if (product.productAttributeValues && product.productAttributeValues.length > 0) {
        product.productAttributeValues.forEach(pav => {
          const attributeValue = pav.attributeValue || pav
          
          if (attributeValue.attribute && attributeValue.value) {
            const attrName = attributeValue.attribute.name
            const attrValue = attributeValue.value
            
            // 避免重複的基本屬性（顏色、尺寸已在別處顯示）
            const skipAttributes = ['顏色', 'color', '尺寸', 'size', '風格', 'style']
            const shouldSkip = skipAttributes.some(skip => 
              attrName.toLowerCase().includes(skip.toLowerCase())
            )
            
            if (!shouldSkip) {
              specs[attrName] = attrValue
            }
          }
        })
      }
      
      return specs
    },
    
    // 取得分類/子分類名稱（使用本地快取，必要時載入）
    getCategoryNameById(id) {
      if (!id) return null
      const list = this._categoriesCache || []
      const found = list.find(c => (c.id || c.Id) == id)
      return found ? (found.name || found.Name) : null
    },
    getSubCategoryNameById(id) {
      if (!id) return null
      const list = this._subCategoriesCache || []
      const found = list.find(sc => (sc.id || sc.Id) == id)
      return found ? (found.name || found.Name) : null
    },
    async ensureCategoryData() {
      // 已載入則略過
      if (this._categoriesCache && this._subCategoriesCache) return
      try {
        // 並行抓取，任何一邊失敗都不阻斷頁面
        const [catRes, subRes] = await Promise.allSettled([
          fetch('/api/Categories', { headers: { 'Accept': 'application/json' } }),
          fetch('/api/SubCategories', { headers: { 'Accept': 'application/json' } })
        ])
        if (catRes.status === 'fulfilled' && catRes.value.ok) {
          const cats = await catRes.value.json()
          this._categoriesCache = Array.isArray(cats) ? cats : []
        } else {
          this._categoriesCache = this._categoriesCache || []
        }
        if (subRes.status === 'fulfilled' && subRes.value.ok) {
          const subs = await subRes.value.json()
          this._subCategoriesCache = Array.isArray(subs) ? subs : []
        } else {
          this._subCategoriesCache = this._subCategoriesCache || []
        }
      } catch (e) {
        // 失敗時保持空陣列，避免中斷
        this._categoriesCache = this._categoriesCache || []
        this._subCategoriesCache = this._subCategoriesCache || []
      }
    },

    // 取得商品評價 - 整合後端評價資料
    getProductReviews(product) {
      if (product.productReviews && product.productReviews.length > 0) {
        console.log('💬 處理商品評價:', product.productReviews)
        
        return product.productReviews.map(review => ({
          id: review.id,
          username: review.customerName || review.customer?.name || review.userName || '匿名用戶',
          rating: review.rating || review.score || 5,
          comment: review.comment || review.content || review.reviewText || '',
          date: new Date(review.reviewDate || review.createdAt || review.created_at || new Date()),
          isVerified: review.isVerified === true || review.IsVerified === true
        }))
      }
      
      // 如果沒有評價，返回空陣列
      console.log('⚠️ 沒有找到商品評價')
      return []
    },

    // 取得預設商品描述
    getDefaultDescription(/* productName */) {
      return `
        <h5>商品特色</h5>
        <ul>
          <li>精選優質材料，舒適耐用</li>
          <li>時尚設計，展現個人風格</li>
          <li>多種顏色尺寸可選</li>
          <li>適合日常穿搭，百搭實用</li>
        </ul>
        <h5>注意事項</h5>
        <p>請依據尺寸表選擇合適尺寸，如有疑問請聯繫客服。</p>
      `
    },
    increaseQuantity() {
      if (this.quantity < this.currentStock) {
        this.quantity++
      } else {
        this.showStockWarning()
      }
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    validateQuantity() {
      // 確保數量是正整數
      if (!this.quantity || this.quantity < 1) {
        this.quantity = 1
      }
      
      // 確保數量不超過庫存（依目前選擇）
      if (this.quantity > this.currentStock) {
        this.quantity = this.currentStock
        this.showStockWarning()
      }
    },
    showStockWarning() {
      // 顯示庫存不足警告
      const message = `庫存不足！目前僅剩 ${this.currentStock} 件`
      
      // 可以使用 toast 或其他通知方式
      if (window.bootstrap && window.bootstrap.Toast) {
        // 如果有 Bootstrap Toast，使用 Toast
        this.showToast(message, 'warning')
      } else {
        // 否則使用 alert
        alert(message)
      }
    },
    showToast(message, type = 'info') {
      // 改良的 Toast 通知實作，支援不同類型
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
            <div class="toast-body">
              ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      `
      
      // 創建 toast 容器（如果不存在）
      let toastContainer = document.getElementById('toast-container')
      if (!toastContainer) {
        toastContainer = document.createElement('div')
        toastContainer.id = 'toast-container'
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3'
        toastContainer.style.zIndex = '1055'
        document.body.appendChild(toastContainer)
      }
      
      // 添加 toast
      const toastDiv = document.createElement('div')
      toastDiv.innerHTML = toastHtml
      const toast = toastDiv.firstElementChild
      toastContainer.appendChild(toast)
      
      // 顯示 toast
      if (window.bootstrap && window.bootstrap.Toast) {
        const bsToast = new window.bootstrap.Toast(toast, {
          autohide: true,
          delay: 3000
        })
        bsToast.show()
        
        // 自動移除 toast
        toast.addEventListener('hidden.bs.toast', () => {
          toast.remove()
        })
      } else {
        // 如果沒有 Bootstrap，顯示toast並3秒後自動移除
        toast.style.display = 'block'
        setTimeout(() => {
          toast.remove()
        }, 3000)
      }
    },
    async addToCart() {
      // 驗證庫存
  if (this.quantity > this.currentStock) {
        this.showStockWarning()
        return
      }
      
      if (this.quantity <= 0) {
        alert('請選擇商品數量')
        return
      }
      
      // 驗證必選項目（如果有顏色或尺寸選項）
  if (this.product.colors && this.product.colors.length > 1 && !this.selectedColor) {
        alert('請選擇顏色')
        return
      }
      
  if (this.product.sizes && this.product.sizes.length > 1 && !this.selectedSize) {
        alert('請選擇尺寸')
        return
      }
      
      // 準備購物車項目資料
      const cartItem = {
        productId: this.product.id,
        name: this.product.name,
        price: this.product.price,
        quantity: this.quantity,
        color: this.selectedColor,
        size: this.selectedSize,
        image: this.currentImage,
        // 新增商品詳細資訊
        originalPrice: this.product.originalPrice,
  stock: this.currentStock,
        categoryId: this.product.categoryId,
        subCategoryId: this.product.subCategoryId
      }
      
      console.log('🛒 加入購物車:', cartItem)
      
      try {
        // 使用購物車服務
        const cartService = await import('@/services/cartService.js')
        const service = cartService.default
        
        // 準備購物車項目資料
        const cartItem = {
          productId: this.product.id,
          name: this.product.name,
          price: this.product.price,
          quantity: this.quantity,
          color: this.selectedColor,
          size: this.selectedSize,
          image: this.currentImage
        }
        
        console.log('🛒 加入購物車資料:', cartItem)
        
        // 使用購物車服務加入商品
        const result = await service.addToCartServer(cartItem, this.product)
        
        console.log('🛒 購物車服務回應:', result)
        
        if (result.success) {
          // 顯示成功訊息
          this.showToast(result.message, 'success')
          
          // 觸發全域購物車更新事件
          this.$eventBus?.emit('cart-updated', result.data)
        } else {
          console.error('❌ 加入購物車失敗:', result)
          this.showToast(result.message, 'danger')
        }
        
      } catch (error) {
        console.error('❌ 加入購物車失敗:', error)
        this.showToast('加入購物車失敗，請稍後再試', 'danger')
      }
    },

    // 儲存到本地購物車（暫時方案）
    saveToLocalCart(cartItem) {
      try {
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
        
        // 檢查是否已存在相同商品（相同ID、顏色、尺寸）
        const existingItemIndex = existingCart.findIndex(item => 
          item.productId === cartItem.productId &&
          item.color === cartItem.color &&
          item.size === cartItem.size
        )
        
        if (existingItemIndex >= 0) {
          // 如果已存在，增加數量
          existingCart[existingItemIndex].quantity += cartItem.quantity
        } else {
          // 如果不存在，新增項目
          existingCart.push({
            ...cartItem,
            cartItemId: Date.now() + Math.random() // 簡單的ID生成
          })
        }
        
        localStorage.setItem('cart', JSON.stringify(existingCart))
        console.log('💾 購物車已更新到本地存儲')
        
      } catch (error) {
        console.error('❌ 存儲購物車失敗:', error)
        throw error
      }
    },

    // 載入相關商品
    async loadRelatedProducts() {
      try {
        console.log('🔍 載入相關商品...')
        
        // 基於當前商品的分類載入相關商品
        const categoryId = this.product.categoryId
        const subCategoryId = this.product.subCategoryId
        const currentProductId = this.product.id
        
        // 構建查詢參數
        let apiUrl = '/api/Products'
        const queryParams = []
        
        if (categoryId) {
          queryParams.push(`categoryId=${categoryId}`)
        }
        if (subCategoryId) {
          queryParams.push(`subCategoryId=${subCategoryId}`)
        }
        
        if (queryParams.length > 0) {
          apiUrl += '?' + queryParams.join('&')
        }
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()

          const normalizeImages = (p) => {
            const raw = p.productImages || p.ProductImages || []
            return raw.map(img => ({
              id: img.id || img.Id,
              sortOrder: img.sortOrder || img.SortOrder || 0,
              url: img.ImagesUrl || img.imagePath || img.url || img.imagesUrl
            })).filter(i => i.url).sort((a, b) => a.sortOrder - b.sortOrder)
          }
          
          this.relatedProducts = data
            .filter(p => (p.id || p.Id) !== currentProductId)
            .slice(0, 4)
            .map(p => {
              const imgs = normalizeImages(p)
              const firstUrl = imgs[0]?.url
              return {
                id: p.id || p.Id,
                name: p.name || p.Name,
                price: p.price ?? p.Price ?? 0,
                originalPrice: p.originalPrice || p.OriginalPrice || p.discountPrice || p.DiscountPrice || p.price || p.Price,
                rating: p.rating || p.Rating || 4.0,
                soldCount: p.soldCount || p.SoldCount || 0,
                productImages: imgs,
                image: this.resolveImageUrl(firstUrl)
              }
            })

          console.log('✅ 相關商品載入完成:', this.relatedProducts.length, '個', this.relatedProducts)
          
        } else {
          console.log('⚠️ 無法載入相關商品，使用模擬資料')
          this.loadMockRelatedProducts()
        }
        
      } catch (error) {
        console.error('❌ 載入相關商品失敗:', error)
        this.loadMockRelatedProducts()
      }
    },

    // 載入模擬相關商品
    loadMockRelatedProducts() {
      this.relatedProducts = [
        {
          id: 101,
          name: '韓版寬鬆牛仔外套',
          price: 2100,
          originalPrice: 2680,
          rating: 4.2,
          soldCount: 89,
          image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=400&fit=crop&auto=format'
        },
        {
          id: 102,
          name: '復古格紋襯衫',
          price: 1580,
          originalPrice: 1980,
          rating: 4.7,
          soldCount: 156,
          image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=300&h=400&fit=crop&auto=format'
        },
        {
          id: 103,
          name: '優雅洋裝',
          price: 1680,
          originalPrice: 2200,
          rating: 4.6,
          soldCount: 234,
          image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop&auto=format'
        },
        {
          id: 104,
          name: '時尚小包包',
          price: 890,
          originalPrice: 1200,
          rating: 4.3,
          soldCount: 67,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop&auto=format'
        }
      ]
    },

    // 取得相關商品圖片
    getRelatedProductImage(product) {
      if (!product) return this.getFallbackImage()
      // 已預先正規化 image
      if (product.image) return this.resolveImageUrl(product.image)
      const imgs = product.productImages || product.ProductImages
      if (imgs && imgs.length) {
        const first = [...imgs].sort((a, b) => (a.sortOrder || a.SortOrder || 0) - (b.sortOrder || b.SortOrder || 0))[0]
        const raw = first.imagePath || first.ImagesUrl || first.url
        return this.resolveImageUrl(raw)
      }
      return this.getFallbackImage()
    },
    resolveImageUrl(raw) {
      const fallback = this.getFallbackImage()
      if (!raw) return fallback
      if (/^https?:/i.test(raw)) return raw
      // 標準化路徑：移除開頭 ~ 或 # 或 /，將反斜線轉成正斜線
      let path = raw.replace(/^[~#/]+/, '').replace(/\\/g, '/').replace(/^\//, '')
      const base = (process.env.VUE_APP_API_BASE_URL || '').replace(/\/$/, '')
      if (!base) return '/' + path
      return `${base}/${path}`
    },

    // 跳轉到商品詳情
    goToProduct(productId) {
      this.$router.push(`/product/${productId}`)
    },
    buyNow() {
      // 驗證庫存
  if (this.quantity > this.currentStock) {
        this.showStockWarning()
        return
      }
      
      if (this.quantity <= 0) {
        alert('請選擇商品數量')
        return
      }
      
      // 驗證必選項目
  if (this.product.colors && this.product.colors.length > 1 && !this.selectedColor) {
        alert('請選擇顏色')
        return
      }
      
  if (this.product.sizes && this.product.sizes.length > 1 && !this.selectedSize) {
        alert('請選擇尺寸')
        return
      }
      
      // 準備訂單項目資料
      const orderItem = {
        productId: this.product.id,
        name: this.product.name,
        price: this.product.price,
        originalPrice: this.product.originalPrice,
        quantity: this.quantity,
        color: this.selectedColor,
        size: this.selectedSize,
        image: this.currentImage,
        totalPrice: this.product.price * this.quantity,
        // 商品詳細資訊
        categoryId: this.product.categoryId,
        subCategoryId: this.product.subCategoryId,
  stock: this.currentStock
      }
      
      console.log('⚡ 立即購買:', orderItem)
      
      try {
        // 將商品資訊存到 sessionStorage，供結帳頁面使用
        sessionStorage.setItem('checkoutItems', JSON.stringify([orderItem]))
        
        // 跳轉到結帳頁面
        this.$router.push({
          path: '/checkout',
          query: {
            type: 'direct', // 直接購買類型
            productId: this.product.id,
            quantity: this.quantity,
            color: this.selectedColor,
            size: this.selectedSize
          }
        })
        
      } catch (error) {
        console.error('❌ 立即購買失敗:', error)
        this.showToast('處理訂單失敗，請稍後再試', 'danger')
      }
    },
    formatDate(date) {
      return new Intl.DateTimeFormat('zh-TW').format(new Date(date))
    },
    // 輪播方法
    nextImage() {
      if (!this.hasMultipleImages) return
      this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length
    },
    prevImage() {
      if (!this.hasMultipleImages) return
      this.currentImageIndex = (this.currentImageIndex - 1 + this.product.images.length) % this.product.images.length
    },
    goToImage(index) {
      if (index < 0 || index >= this.product.images.length) return
      this.currentImageIndex = index
    },
    onTouchStart(e) {
      if (!this.hasMultipleImages) return
      this.touchStartX = e.changedTouches[0].clientX
    },
    onTouchMove(e) {
      if (!this.hasMultipleImages) return
      this.touchMoveX = e.changedTouches[0].clientX
    },
    onTouchEnd() {
      if (!this.hasMultipleImages || this.touchStartX == null || this.touchMoveX == null) return
      const diff = this.touchMoveX - this.touchStartX
      const threshold = 40
      if (Math.abs(diff) > threshold) {
        if (diff < 0) {
          this.nextImage()
        } else {
          this.prevImage()
        }
      }
      this.touchStartX = null
      this.touchMoveX = null
    },

    /**
     * 處理購物車更新事件
     */
    handleCartUpdated(cartItem) {
      console.log('🛒 商品已加入購物車:', cartItem)
      // 觸發全域購物車更新事件
      if (this.$eventBus) {
        this.$eventBus.emit('cart-updated', cartItem)
      }
    },

    /**
     * 處理需要登入事件
     */
    handleNeedLogin() {
      console.log('🔒 需要登入')
      // 重導到登入頁面
      this.$router.push('/login')
    }
  },
  watch: {
    '$route.params.id'() {
      this.loadProduct()
    },
    currentImageIndex(newIdx) {
      // 讓縮略圖輪播保持把當前縮圖顯示在可視範圍
      if (this._thumbSwiper) {
        this._thumbSwiper.slideTo(newIdx)
      }
    }
  }
}

</script>

<style scoped>
/* 尺寸按鈕：庫存為 0（disabled）時灰階樣式 */
.size-option:disabled {
  filter: grayscale(100%);
  opacity: 0.6;
  cursor: not-allowed;
}
.size-option:disabled:hover,
.size-option:disabled:focus {
  transform: none;
  box-shadow: none;
}

/* 在停用的尺寸按鈕中央加上一條橫線（刪除線視覺） */
.size-option { position: relative; }
.size-option:disabled::after {
  content: '';
  position: absolute;
  left: 10%;
  right: 10%;
  top: 50%;
  height: 2px;
  background: rgba(0, 0, 0, 0.55);
  transform: translateY(-50%);
  pointer-events: none;
}

/* 預留：若未來也要禁用顏色按鈕，可套同樣灰階 */
.color-option:disabled {
  filter: grayscale(100%);
  opacity: 0.6;
  cursor: not-allowed;
}

.product-detail-view {
  min-height: calc(100vh - 200px);
  margin-top: 90px; /* 為固定的 AppHeader 留出空間 */
}

.breadcrumb {
  background: none;
  padding: 0px 0px 0px 30px;
}

.main-image-container {
  max-width: 500px;
  margin: 0 auto;
}

.main-image-container:focus {
  outline: 2px solid #e4dcd1;
  outline-offset: 2px;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.45);
  color: #faf6eb;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .25s;
  z-index: 2;
}

.carousel-nav.prev { left: 10px; background-color: #faf6eb;border: 1px solid #e4dcd1;}
.carousel-nav.next { right: 10px; background-color: #faf6eb;border: 1px solid #e4dcd1;}
.carousel-nav:hover { background: #e4dcd1; }

.carousel-nav .fa-chevron-left,
.carousel-nav .fa-chevron-right {
  color: #022c5c;
}
.carousel-indicators {
  position: absolute;
  bottom: 8px;
  left: 0;
  /* right: 0; */
  /* width: 100%; */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  z-index: 3;
  pointer-events: none; /* 讓區塊不阻擋點擊 */
}
.carousel-indicators .indicator { pointer-events: auto; }

.carousel-indicators .indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid #e4dcd1;
  background: rgba(255,255,255,0.35);
  padding: 0;
  cursor: pointer;
  transition: background .3s, transform .3s;
}

.carousel-indicators .indicator.active {
  background: #e4dcd1;
  transform: scale(1.2);
  border-color: #e4dcd1;
}

.fade-enter-active, .fade-leave-active { transition: opacity .3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.thumb-wrapper {
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color .25s;
}
.thumb-wrapper.active { border-color: #e4dcd1; }
.thumb-wrapper:hover { border-color: #faf6eb; }

.thumbnail-container {
  max-width: 500px;
  margin: 0 auto;
  margin-top: 15px;
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

.btn-detail-reverse{
  background-color: #faf6eb;
  border-color: #e4dcd1;
  color: #022c5c;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}
.btn-detail-reverse:hover{
  background-color: #022c5c;
  border-color: #022c5c;
  color:#e4dcd1;
}
/* 縮略圖輪播樣式 */
.thumb-swiper {
  position: relative;
}
.thumb-swiper .swiper-slide {
  width: calc(25% - 6px); /* 4格 並與 spaceBetween 對齊視覺 */
}
.thumbs-prev, .thumbs-next {
  color: #333;
  width: 28px; height: 28px;
}
.thumbs-prev::after, .thumbs-next::after {
  font-size: 16px;
}
.thumbs-prev { left: -6px; }
.thumbs-next { right: -6px; }

/* 庫存相關樣式 */
.buy-buttons .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.buy-buttons .alert {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

/* 數量輸入框樣式 */
.form-control:invalid {
  border-color: #eb5757;
}

/* Toast 容器樣式 */
#toast-container {
  z-index: 1055;
}

.toast {
  min-width: 200px;
}

/* 庫存警告動畫 */
.text-danger, .text-warning {
  animation: fadeInAlert 0.3s ease-in-out;
}

@keyframes fadeInAlert {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cursor-pointer {
  cursor: pointer;
}

/* 隱藏數字輸入的上下箭頭（保留 +/- 按鈕控制） */
:deep(input.no-spinner::-webkit-outer-spin-button),
:deep(input.no-spinner::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
:deep(input.no-spinner[type="number"]) {
  -moz-appearance: textfield;
  appearance: textfield;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #faf6eb;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 讓非常淺色也能看清邊界 */
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);
}

.color-option.active {
  border-color: #022c5c;
  border-width: 3px;
}

.color-option span {
  color: white;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
  font-weight: bold;
}

.size-option.active {
  background-color: #022c5c;
  color: #e4dcd1;
  border-color: #022c5c;
}

.rating .fa-star {
  font-size: 0.9rem;
}

.product-features i {
  font-size: 1.5rem;
}

.nav-tabs .nav-link { 
  color: #022c5c;
  background-color: #faf6eb; 
  border-color: #e4dcd1 #e4dcd1 #faf6eb;
}
.nav-tabs .nav-link:hover { 
  color: #022c5c;
  background-color: #e4dcd1; 
  border-color: #e4dcd1 #e4dcd1 #faf6eb;
}
  
.nav-tabs .nav-link.active {
  color: #faf6eb;
  background-color: #022c5c;
  border-color: #e4dcd1 #e4dcd1 #faf6eb;
}
.tab-content {
  border: 1px solid #e4dcd1;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
}

.table td {
  border-top: 1px solid #faf6eb;
  padding: 0.75rem;
}

/* 相關商品樣式 */
.related-product-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.related-product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}

.related-product-card .card-body {
  background-color: #faf6eb; /* 在這裡改成你要的背景色 */
  color: #022c5c;            /* 文字色 */
}
.related-product-card:hover .card-body {
  background-color: #e4dcd1; /* 滑過時的背景色（可選） */
}

.related-product-card .card-overlay {
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.related-product-card:hover .card-overlay {
  opacity: 1;
}

.related-product-card .rating .fa-star {
  font-size: 0.75rem;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .product-detail-view {
    margin-top: 60px;
  }
  
  .thumbnail-container .col-3 {
    flex: 0 0 auto;
    width: 20%;
  }
  
  .color-option {
    width: 35px;
    height: 35px;
  }
  
  .product-features i {
    font-size: 1.2rem;
  }
}
</style>

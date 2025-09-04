// 購物車 API 服務
import axios from 'axios'

// 使用相對路徑，讓代理處理
const API_BASE_URL = '/api'

class CartService {
  constructor() {
    this.http = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 直接後端 API URL（用於新的購物車功能）
    this.directApiUrl = 'https://localhost:7106/api/Carts'

    // 請求攔截器 - 添加認證 token
    this.http.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') ||
                     localStorage.getItem('authToken') ||
                     localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 響應攔截器 - 統一錯誤處理
    this.http.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 未授權，清除所有 token 並導向登入
          localStorage.removeItem('token')
          localStorage.removeItem('authToken')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('currentUser')
          localStorage.removeItem('memberId')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * 取得用戶ID
   * @returns {number} 用戶ID
   */
  getUserId() {
    // 優先從各種可能的存儲位置獲取用戶ID
    const userId = parseInt(localStorage.getItem('userId')) || 
                  parseInt(localStorage.getItem('memberId')) || 
                  parseInt(localStorage.getItem('currentUserId')) ||
                  parseInt(sessionStorage.getItem('userId')) ||
                  parseInt(sessionStorage.getItem('memberId'))

    if (!userId) {
      console.warn('⚠️ 無法取得用戶ID，請確認用戶已登入')
      throw new Error('用戶未登入，請先登入後再進行操作')
    }

    console.log('👤 當前用戶ID:', userId)
    return userId
  }

  /**
   * 從商品屬性值中找到對應的 attributeValueId
   * @param {Object} product - 商品物件
   * @param {string} selectedColor - 選中的顏色
   * @param {string} selectedSize - 選中的尺寸
   * @returns {number|null} attributeValueId
   */
  findAttributeValueId(product, selectedColor, selectedSize) {
    const pavs = product.productAttributeValues || []
    
    console.log('🔍 分析商品屬性:', {
      productId: product.id,
      productName: product.name,
      pavs: pavs,
      pavsLength: pavs.length,
      selectedColor,
      selectedSize
    })
    
    if (!pavs || pavs.length === 0) {
      console.log('🔍 商品沒有屬性變體，將嘗試不帶屬性加入購物車')
      return null
    }

    // 先找 color 的 skuGroupId（如果有選顏色）
    let skuGroupId = null
    if (selectedColor) {
      const colorPav = pavs.find(p => {
        const av = p.attributeValue || p
        const attrName = (av.attribute?.name || av.attribute?.Name || '').toString()
        const isColor = /顏色|color|色彩/i.test(attrName)
        const val = (av.value || av.Value || av.name || av.Name || '').toString()
        return isColor && val === selectedColor
      })
      skuGroupId = colorPav?.skuGroupId ?? null
    }

    // 若同時有尺寸與 color group，用 skuGroupId + size 找對應的變體
    if (selectedSize && skuGroupId) {
      const sizePav = pavs.find(p => {
        const av = p.attributeValue || p
        const attrName = (av.attribute?.name || av.attribute?.Name || '').toString()
        const isSize = /尺寸|size|大小/i.test(attrName)
        const val = (av.value || av.Value || av.name || av.Name || '').toString()
        return isSize && p.skuGroupId === skuGroupId && val === selectedSize
      })
      if (sizePav) return sizePav.id ?? sizePav.attributeValueId ?? sizePav.attributeValue?.id ?? null
    }

    // 若只有顏色，回傳該顏色的 PAV id
    if (selectedColor) {
      const colorPav = pavs.find(p => {
        const av = p.attributeValue || p
        const attrName = (av.attribute?.name || av.attribute?.Name || '').toString()
        const isColor = /顏色|color|色彩/i.test(attrName)
        const val = (av.value || av.Value || av.name || av.Name || '').toString()
        return isColor && val === selectedColor
      })
      if (colorPav) return colorPav.id ?? colorPav.attributeValueId ?? colorPav.attributeValue?.id ?? null
    }

    // 若只有尺寸，直接找尺寸 PAV
    if (selectedSize) {
      const sizePav = pavs.find(p => {
        const av = p.attributeValue || p
        const attrName = (av.attribute?.name || av.attribute?.Name || '').toString()
        const isSize = /尺寸|size|大小/i.test(attrName)
        const val = (av.value || av.Value || av.name || av.Name || '').toString()
        return isSize && val === selectedSize
      })
      if (sizePav) return sizePav.id ?? sizePav.attributeValueId ?? sizePav.attributeValue?.id ?? null
    }

    // 如果沒有指定顏色和尺寸，但商品有屬性變體，使用第一個可用的屬性
    if (!selectedColor && !selectedSize && pavs.length > 0) {
      const any = pavs.find(p => p.id || p.attributeValueId || p.attributeValue?.id)
      const result = any ? (any.id ?? any.attributeValueId ?? any.attributeValue?.id) : null
      console.log('🔍 使用預設屬性變體:', result)
      return result
    }

    console.log('🔍 找不到匹配的屬性變體')
    return null
  }

  /**
   * 加入商品到後端購物車
   * @param {Object} cartItem - 購物車項目
   * @param {Object} product - 完整商品資訊
   * @returns {Promise<{success: boolean, message: string, data?: any}>}
   */
  async addToCartServer(cartItem, product) {
    const userId = this.getUserId()
    
    // 推論 attributeValueId
    const attributeValueId = this.findAttributeValueId(product, cartItem.color, cartItem.size)
    
    console.log('🔍 商品屬性分析:', {
      product: product,
      productAttributeValues: product.productAttributeValues,
      attributeValueId: attributeValueId,
      selectedColor: cartItem.color,
      selectedSize: cartItem.size
    })
    
    // 如果找不到 attributeValueId，嘗試使用預設值或直接不帶屬性
    let finalAttributeValueId = attributeValueId
    if (!attributeValueId) {
      console.warn('⚠️ 無法推論 attributeValueId，將嘗試不帶屬性加入購物車')
      // 對於沒有變體的商品，可以使用 null 或 0
      finalAttributeValueId = null
    }

    const payload = {
      productId: cartItem.productId,
      quantity: cartItem.quantity
    }
    
    // 只有在有 attributeValueId 的時候才加入
    if (finalAttributeValueId) {
      payload.attributeValueId = Number(finalAttributeValueId)
    }

    const url = `${this.directApiUrl}/user/${userId}/items`

    try {
      console.log('🛒 正在加入購物車:', { url, payload })
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const responseText = await response.text()
        console.log('✅ 成功加入購物車:', responseText)
        
        return {
          success: true,
          message: `已將 ${cartItem.quantity} 件「${cartItem.name}」加入購物車`,
          data: responseText
        }
      } else {
        const errorText = await response.text().catch(() => null)
        console.error('❌ 購物車 API 錯誤:', response.status, errorText)
        
        return {
          success: false,
          message: `加入購物車失敗 (${response.status}): ${errorText || '未知錯誤'}`
        }
      }
    } catch (error) {
      console.error('❌ 網路錯誤:', error)
      return {
        success: false,
        message: '網路連線失敗，請檢查網路狀態後重試'
      }
    }
  }

  /**
   * 立即購買（重導到結帳頁面）
   * @param {Object} cartItem - 購物車項目
   * @param {Object} product - 完整商品資訊
   * @returns {Promise<{success: boolean, message: string, redirectUrl?: string}>}
   */
  async buyNowServer(cartItem, product) {
    // 先嘗試加入購物車
    const result = await this.addToCartServer(cartItem, product)
    
    if (result.success) {
      // 成功後重導到結帳頁面
      return {
        success: true,
        message: '正在跳轉到結帳頁面...',
        redirectUrl: '/checkout'
      }
    } else {
      return result
    }
  }

  /**
   * 取得購物車內容
   */
  async getCart(userId) {
    if (!userId) {
      throw new Error('未提供用戶 ID')
    }
    
    try {
      console.log(`🔄 正在從 API 獲取用戶 ${userId} 的購物車...`)
      const response = await this.http.get(`/Carts/user/${userId}`)
      console.log('📦 原始 API 回應:', response.data)
      
      // 根據新的 API 格式處理回應
      if (response.data.success) {
        console.log('✅ API 回應成功，原始購物車資料:', response.data.data)
        return {
          success: true,
          data: this.transformCartData(response.data.data)
        }
      } else {
        console.warn('⚠️ API 回應失敗:', response.data.message)
        return {
          success: false,
          data: { items: [], subtotal: 0, total: 0 },
          error: response.data.message || '獲取購物車失敗'
        }
      }
    } catch (error) {
      console.error('❌ 獲取購物車失敗:', error)
      
      return {
        success: false,
        data: { items: [], subtotal: 0, total: 0 },
        error: error.response?.data?.message || error.message || '獲取購物車失敗',
        message: `無法載入購物車，API 地址: ${this.http.defaults.baseURL}`
      }
    }
  }

  /**
   * 添加商品到購物車
   */
  async addToCart(productId, attributeValueId, quantity = 1, userId) {
    if (!userId) {
      throw new Error('未提供用戶 ID')
    }
    
    try {
      console.log(`🛒 正在添加商品到用戶 ${userId} 的購物車...`, { productId, attributeValueId, quantity })
      
      const response = await this.http.post(`/Carts/user/${userId}/items`, {
        productId: parseInt(productId),
        attributeValueId: parseInt(attributeValueId),
        quantity: parseInt(quantity)
      })
      
      console.log('✅ 商品添加成功:', response.data)
      
      // 根據新的 API 格式處理回應
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || '商品已加入購物車'
        }
      } else {
        return {
          success: false,
          error: response.data.message || '添加商品失敗',
          errors: response.data.errors || []
        }
      }
    } catch (error) {
      console.error('❌ 添加到購物車失敗:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || '添加商品失敗',
        message: '無法添加商品到購物車'
      }
    }
  }

  /**
   * 更新購物車商品數量
   */
  async updateQuantity(itemId, quantity, userId) {
    if (!userId) {
      throw new Error('未提供用戶 ID')
    }
    
    try {
      const response = await this.http.put(`/Carts/user/${userId}/items/${itemId}`, {
        quantity: parseInt(quantity)
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || '數量已更新'
        }
      } else {
        return {
          success: false,
          error: response.data.message || '更新購物車失敗'
        }
      }
    } catch (error) {
      console.error('更新購物車失敗:', error)
      return {
        success: false,
        error: error.response?.data?.message || '更新購物車失敗'
      }
    }
  }

  /**
   * 移除購物車商品
   */
  async removeCartItem(itemId, userId) {
    if (!userId) {
      throw new Error('未提供用戶 ID')
    }
    
    try {
      const response = await this.http.delete(`/Carts/user/${userId}/items/${itemId}`)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || '商品已移除'
        }
      } else {
        return {
          success: false,
          error: response.data.message || '移除商品失敗'
        }
      }
    } catch (error) {
      console.error('移除商品失敗:', error)
      return {
        success: false,
        error: error.response?.data?.message || '移除商品失敗'
      }
    }
  }

  /**
   * 清空購物車
   */
  async clearCart(userId) {
    if (!userId) {
      throw new Error('未提供用戶 ID')
    }
    
    try {
      const response = await this.http.delete(`/Carts/user/${userId}`)
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || '購物車已清空'
        }
      } else {
        return {
          success: false,
          error: response.data.message || '清空購物車失敗'
        }
      }
    } catch (error) {
      console.error('清空購物車失敗:', error)
      return {
        success: false,
        error: error.response?.data?.message || '清空購物車失敗'
      }
    }
  }

  /**
   * 套用優惠券
   */
  async applyCoupon(userId, couponCode) {
    if (!userId) {
      throw new Error('未提供用戶 ID')
    }
    
    if (!couponCode) {
      throw new Error('未提供優惠券代碼')
    }
    
    try {
      const response = await this.http.post(`/Carts/user/${userId}/coupon`, {
        couponCode
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || '優惠券套用成功'
        }
      } else {
        return {
          success: false,
          error: response.data.message || '優惠券套用失敗'
        }
      }
    } catch (error) {
      console.error('套用優惠券失敗:', error)
      return {
        success: false,
        error: error.response?.data?.message || '套用優惠券失敗'
      }
    }
  }

  /**
   * 移除優惠券
   */
  async removeCoupon(userId) {
    if (!userId) {
      throw new Error('未提供用戶 ID')
    }
    
    try {
      // 方案1：嘗試使用 DELETE 方法移除優惠券
      const response = await this.http.delete(`/Carts/user/${userId}/coupon`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || '優惠券已移除'
        }
      } else {
        return {
          success: false,
          error: response.data.message || '移除優惠券失敗'
        }
      }
    } catch (error) {
      console.error('移除優惠券失敗:', error)
      
      // 方案2：如果沒有專門的移除 API，嘗試套用空的優惠券代碼
      try {
        console.log('嘗試套用空優惠券來清除...')
        const clearResponse = await this.http.post(`/Carts/user/${userId}/coupon`, {
          couponCode: ''
        })
        
        if (clearResponse.data.success) {
          return {
            success: true,
            data: clearResponse.data.data,
            message: '優惠券已移除'
          }
        }
      } catch (clearError) {
        console.error('清除優惠券也失敗:', clearError)
      }
      
      return {
        success: false,
        error: error.response?.data?.message || '移除優惠券失敗'
      }
    }
  }

  /**
   * 取得購物車摘要
   * GET /api/Carts/user/{userId}/summary
   */
  async getCartSummary(userId) {
    if (!userId) {
      throw new Error('未提供用戶 ID')
    }
    
    try {
      console.log(`🔄 正在取得用戶 ${userId} 的購物車摘要...`)
      const response = await this.http.get(`/Carts/user/${userId}/summary`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || '取得購物車摘要成功'
        }
      } else {
        return {
          success: false,
          error: response.data.message || '取得購物車摘要失敗'
        }
      }
    } catch (error) {
      console.error('❌ 取得購物車摘要失敗:', error)
      return {
        success: false,
        error: error.response?.data?.message || '取得購物車摘要失敗'
      }
    }
  }

  /**
   * 批量移除購物車商品
   * DELETE /api/Carts/user/{userId}/items/batch
   */
  async removeBatchItems(userId, itemIds) {
    if (!userId) {
      throw new Error('未提供用戶 ID')
    }
    
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      throw new Error('未提供要移除的商品 ID 陣列')
    }
    
    try {
      console.log(`🔄 正在批量移除用戶 ${userId} 的購物車商品...`, itemIds)
      const response = await this.http.delete(`/Carts/user/${userId}/items/batch`, {
        data: itemIds
      })
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || '商品已批量移除'
        }
      } else {
        return {
          success: false,
          error: response.data.message || '批量移除商品失敗'
        }
      }
    } catch (error) {
      console.error('❌ 批量移除商品失敗:', error)
      return {
        success: false,
        error: error.response?.data?.message || '批量移除商品失敗'
      }
    }
  }

  /**
   * 驗證購物車
   * POST /api/Carts/user/{userId}/validate
   */
  async validateCart(userId) {
    if (!userId) {
      throw new Error('未提供用戶 ID')
    }
    
    try {
      console.log(`🔄 正在驗證用戶 ${userId} 的購物車...`)
      const response = await this.http.post(`/Carts/user/${userId}/validate`)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || '購物車驗證完成'
        }
      } else {
        return {
          success: false,
          error: response.data.message || '購物車驗證失敗',
          errors: response.data.errors || []
        }
      }
    } catch (error) {
      console.error('❌ 購物車驗證失敗:', error)
      return {
        success: false,
        error: error.response?.data?.message || '購物車驗證失敗'
      }
    }
  }

  /**
   * 轉換購物車資料格式
   */
  transformCartData(cartData) {
    console.log('🔧 開始轉換購物車資料:', cartData)
    
    if (!cartData || !cartData.items) {
      console.log('⚠️ 購物車資料為空或無商品')
      return {
        id: null,
        items: [],
        subtotal: 0,
        total: 0
      }
    }

    const transformedData = {
      id: cartData.cartId || cartData.id,
      memberId: cartData.memberId,
      items: cartData.items.map(item => {
        console.log('🔧 轉換商品項目:', item)
        
        // 從 API 回應可以看到正確的欄位名稱
        const transformedItem = {
          id: item.itemId,                    // API 中是 itemId
          itemId: item.itemId,               // 確保 itemId 屬性可用
          productId: item.productId,         // API 中是 productId
          productName: item.productName,     // API 中是 productName
          productImage: item.productImage || '/images/default-product.png',
          sku: item.productSku || item.sku,  // API 中是 productSku
          attributeValues: this.formatAttributeValues(item),
          // API 回應中價格欄位是 price: 20
          unitPrice: parseFloat(item.price || 0),
          originalPrice: parseFloat(item.price || 0), // 如果沒有原價，使用現價
          discountPrice: item.discountPrice ? parseFloat(item.discountPrice) : null,
          quantity: parseInt(item.quantity || 1),
          subtotal: parseFloat(item.subtotal || 0),
          stock: parseInt(item.stock || 0),
          attributeValueId: item.attributeValueId,
          attributeName: item.attributeName,
          attributeValue: item.attributeValue,
          isActive: item.isActive,
          createdAt: item.createdAt
        }
        
        console.log('✅ 轉換後的商品項目:', transformedItem)
        return transformedItem
      }),
      itemCount: cartData.itemCount || cartData.items.length,
      subtotal: parseFloat(cartData.subtotal || 0),
      shipping: parseFloat(cartData.shipping || 0),
      discount: parseFloat(cartData.discount || 0),
      total: parseFloat(cartData.total || 0),
      couponCode: cartData.couponCode,
      createdAt: cartData.createdAt,
      updatedAt: cartData.updatedAt
    }
    
    console.log('✅ 轉換後的完整購物車資料:', transformedData)
    return transformedData
  }

  /**
   * 格式化商品屬性值
   */
  formatAttributeValues(item) {
    // 如果有單獨的屬性名稱和值
    if (item.attributeName && item.attributeValue) {
      return `${item.attributeName}: ${item.attributeValue}`
    }
    
    // 如果有原來的 attributeValues 欄位
    if (item.attributeValues) {
      if (typeof item.attributeValues === 'string') {
        return item.attributeValues
      }
      
      if (Array.isArray(item.attributeValues)) {
        return item.attributeValues.map(attr => `${attr.name}: ${attr.value}`).join(', ')
      }
      
      if (typeof item.attributeValues === 'object') {
        return Object.entries(item.attributeValues)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      }
    }
    
    return ''
  }


}

// 建立單例
const cartService = new CartService()

export default cartService

// 具名匯出
export { CartService }

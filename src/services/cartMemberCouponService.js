// 購物車會員優惠券 API 服務
import axios from 'axios'
import userIdentityService from './userIdentityService'

// API 基礎設定
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'

class CartMemberCouponService {
  constructor() {
    this.http = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 請求攔截器 - 添加認證 token
    this.http.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken') ||
                     localStorage.getItem('auth_token') ||
                     localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        console.log(`🌐 優惠券 API 請求: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('優惠券 API 請求攔截器錯誤:', error)
        return Promise.reject(error)
      }
    )

    // 響應攔截器 - 統一錯誤處理
    this.http.interceptors.response.use(
      (response) => {
        console.log(`✅ 優惠券 API 回應: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
        return response
      },
      (error) => {
        console.error(`❌ 優惠券 API 錯誤: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message)
        
        if (error.response?.status === 401) {
          userIdentityService.clearUserData()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * 確保用戶已登入並獲取會員ID
   * @returns {number} 會員ID
   */
  _ensureLoggedInUser() {
    if (!userIdentityService.isLoggedIn()) {
      throw new Error('用戶未登入')
    }

    const memberId = userIdentityService.getMemberId()
    if (!memberId) {
      throw new Error('無法獲取會員ID')
    }

    return memberId
  }

  /**
   * 獲取用戶可用的優惠券
   */
  async getUserCoupons(memberId = null) {
    try {
      const actualMemberId = memberId || this._ensureLoggedInUser()
      console.log(`🎫 正在獲取會員 ${actualMemberId} 的優惠券列表...`)
      const response = await this.http.get(`/Members/${actualMemberId}/MemberCoupons`)
      console.log('✅ 優惠券列表:', response.data)
      
      return {
        success: true,
        data: this.transformCouponsData(response.data.data || []),
        totalCount: response.data.totalCount || 0
      }
    } catch (error) {
      console.error('❌ 獲取優惠券失敗:', error)
      
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || '獲取優惠券失敗'
      }
    }
  }

  /**
   * 驗證優惠券是否可用（通過代碼）
   * 改為使用購物車的套用優惠券 API 進行驗證
   */
  async validateCoupon(couponCode, cartSubtotal, memberId = null) {
    try {
      const actualMemberId = memberId || this._ensureLoggedInUser()
      console.log(`🎫 正在驗證優惠券...`, { couponCode, cartSubtotal, memberId: actualMemberId })
      
      // 使用購物車的套用優惠券 API 進行驗證
      const response = await this.http.post(`/Carts/user/${actualMemberId}/coupon`, {
        couponCode
      })
      
      if (response.data.success) {
        console.log('✅ 優惠券驗證成功:', response.data.data)
        
        // 從購物車響應中提取優惠券和折扣資訊
        const cartData = response.data.data
        const couponInfo = {
          code: couponCode,
          // 假設後端會在購物車中包含優惠券資訊
          discountAmount: (cartData.subtotal || cartSubtotal) - (cartData.total - (cartData.shipping || 0))
        }
        
        return {
          success: true,
          data: {
            coupon: couponInfo,
            discountAmount: couponInfo.discountAmount
          }
        }
      } else {
        return {
          success: false,
          error: response.data.message || '優惠券驗證失敗'
        }
      }
    } catch (error) {
      console.error('❌ 優惠券驗證失敗:', error)
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || '優惠券驗證失敗'
      }
    }
  }

  /**
   * 轉換優惠券資料格式
   */
  transformCouponsData(couponsData) {
    if (!Array.isArray(couponsData)) {
      return []
    }

    return couponsData.map(coupon => ({
      id: coupon.memberCouponId,
      couponId: coupon.couponId,
      code: coupon.verificationCode,
      title: coupon.title,
      description: coupon.formattedDiscount || this.generateCouponDescription(coupon),
      discountType: this.mapDiscountType(coupon.discountType),
      discountValue: coupon.discountAmount,
      minAmount: coupon.minSpend || 0,
      maxDiscountAmount: null,
      startDate: coupon.startAt,
      expiryDate: coupon.expiredAt,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount || 0,
      isActive: coupon.isActive && coupon.isCurrentlyActive,
      isUsed: coupon.status === 'used',
      status: coupon.status,
      assignedAt: coupon.assignedAt,
      usedAt: coupon.usedAt,
      orderId: coupon.orderId,
      sellerId: coupon.sellersId,
      sellerName: coupon.sellerName,
      validityPeriod: coupon.validityPeriod,
      usageInfo: coupon.usageInfo,
      source: coupon.source
    }))
  }

  /**
   * 生成優惠券描述文字
   */
  generateCouponDescription(coupon) {
    if (coupon.formattedDiscount) {
      return coupon.formattedDiscount
    }
    
    const discountType = coupon.discountType
    const discountAmount = coupon.discountAmount
    const minSpend = coupon.minSpend
    
    if (discountType === '滿減' && minSpend > 0) {
      return `滿 NT$${minSpend.toLocaleString()} 減 NT$${discountAmount.toLocaleString()}`
    } else if (discountType === '折扣') {
      return `${discountAmount}% 折扣`
    } else if (discountType === '免運') {
      return '免運費'
    } else {
      return `NT$${discountAmount.toLocaleString()} 優惠`
    }
  }

  /**
   * 映射折扣類型
   */
  mapDiscountType(apiDiscountType) {
    const typeMap = {
      '滿減': 'fixed',
      '折扣': 'percentage', 
      '免運': 'shipping',
      '固定金額': 'fixed'
    }
    
    return typeMap[apiDiscountType] || 'fixed'
  }

  /**
   * 格式化優惠券顯示文字
   * 使用後端回傳的資料，不進行前端計算
   */
  formatCouponDisplay(coupon) {
    if (!coupon) return ''
    
    // 優先使用後端回傳的格式化描述
    if (coupon.formattedDiscount) {
      return coupon.formattedDiscount
    }
    
    // 如果有描述且包含金額，直接使用
    if (coupon.description && coupon.description.includes('NT$')) {
      return coupon.description
    }
    
    // 基本格式化（基於後端提供的資料）
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% 折扣`
    } else if (coupon.discountType === 'fixed') {
      return `NT$${coupon.discountValue.toLocaleString()} 折扣`
    } else if (coupon.discountType === 'shipping') {
      return '免運費'
    } else {
      return coupon.description || `NT$${coupon.discountValue.toLocaleString()} 優惠`
    }
  }
}

// 建立單例
const cartMemberCouponService = new CartMemberCouponService()

export default cartMemberCouponService

// 具名匯出
export { CartMemberCouponService }

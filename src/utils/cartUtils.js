// 購物車工具函數
import cartMemberCouponService from '@/services/cartMemberCouponService'

/**
 * 格式化優惠券顯示值
 */
export const formatCouponValue = (coupon) => {
  return cartMemberCouponService.formatCouponDisplay(coupon)
}

/**
 * 格式化日期
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('zh-TW')
  } catch {
    return dateString
  }
}

/**
 * 處理圖片錯誤
 */
export const handleImageError = (event) => {
  event.target.src = '/images/default-product.png'
}

/**
 * 格式化價格顯示
 */
export const formatPrice = (price) => {
  // 處理 undefined, null 或非數字的情況
  if (price === undefined || price === null || isNaN(price)) {
    return '0'
  }
  
  // 確保是數字型別
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(numPrice)) {
    return '0'
  }
  
  return numPrice.toLocaleString()
}

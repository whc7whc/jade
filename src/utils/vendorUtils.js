/**
 * 賣家相關工具函數
 */

/**
 * 按賣家分組購物車商品
 * @param {Array} cartItems 購物車商品列表
 * @returns {Array} 按賣家分組的商品列表
 */
export function groupCartItemsByVendor(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    return []
  }

  // 按賣家ID分組
  const grouped = cartItems.reduce((groups, item) => {
    const sellerId = item.sellerId || item.SellerId || 0 // 支援不同的屬性名稱
    const sellerName = item.sellerName || item.SellerName || '未知賣家'
    
    if (!groups[sellerId]) {
      groups[sellerId] = {
        sellerId: sellerId,
        sellerName: sellerName,
        items: [],
        subtotal: 0,
        itemCount: 0
      }
    }
    
    groups[sellerId].items.push(item)
    groups[sellerId].subtotal += (item.priceAtAdded || item.price || item.unitPrice || 0) * item.quantity
    groups[sellerId].itemCount += item.quantity
    
    return groups
  }, {})

  // 轉換為陣列並排序（平台商品在前，其他賣家按ID排序）
  return Object.values(grouped).sort((a, b) => {
    if (a.sellerId === 0) return -1 // 平台商品排在最前面
    if (b.sellerId === 0) return 1
    return a.sellerId - b.sellerId
  })
}

/**
 * 計算各賣家的小計
 * @param {Array} vendorGroups 賣家分組資料
 * @returns {Object} 各賣家小計統計
 */
export function calculateVendorSubtotals(vendorGroups) {
  return vendorGroups.reduce((totals, vendor) => {
    totals[vendor.sellerId] = {
      subtotal: vendor.subtotal,
      itemCount: vendor.itemCount,
      shippingFee: 0 // 預設為0，可根據需要計算各賣家運費
    }
    return totals
  }, {})
}

/**
 * 格式化賣家名稱顯示
 * @param {string} sellerName 賣家名稱
 * @param {number} sellerId 賣家ID
 * @returns {string} 格式化後的賣家名稱
 */
export function formatVendorName(sellerName, sellerId) {
  if (sellerId === 0 || !sellerId) {
    return '🏪 平台自營'
  }
  return `🏪 ${sellerName || '賣家商店'}`
}

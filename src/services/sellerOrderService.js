/**
 * 賣家訂單管理服務
 */

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://localhost:7106/api'

const SellerOrderService = {
  /**
   * 獲取賣家訂單列表
   * @param {number} vendorId - 賣家ID
   * @param {Object} params - 查詢參數
   * @param {string} params.status - 訂單狀態篩選
   * @param {number} params.page - 頁碼
   * @param {number} params.pageSize - 每頁數量
   * @param {s  /**
   * 更新單一商品項目的出貨狀態
   * @param {number} orderDetailId - 訂單明細ID
   * @param {number} vendorId - 賣家ID
   * @param {Object} statusData - 狀態更新數據
   */
  async updateOrderItemShipping(orderDetailId, vendorId, statusData) {
    try {
      const response = await fetch(`${API_BASE_URL}/SellerOrders/detail/${orderDetailId}/vendor/${vendorId}/shipping-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: statusData.status,
          trackingNumber: statusData.trackingNumber || '',
          vendorId: vendorId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || '商品狀態更新成功'
      }
    } catch (error) {
      console.error('更新商品出貨狀態失敗:', error)
      return {
        success: false,
        error: error.message || '更新商品出貨狀態失敗',
        data: null
      }
    }
  },

  /**
   * 獲取賣家統計數據
   * @param {number} vendorId - 賣家ID
   * @param {number} days - 統計天數
   */
  async getVendorOrders(vendorId, params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.status) queryParams.append('status', params.status)
      if (params.page) queryParams.append('page', params.page)
      if (params.pageSize) queryParams.append('pageSize', params.pageSize)
      if (params.search) queryParams.append('search', params.search)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      if (params.memberId) queryParams.append('memberId', params.memberId)

      const url = `${API_BASE_URL}/SellerOrders/vendor/${vendorId}${queryParams.toString() ? `?${queryParams}` : ''}`
      console.log('🔗 SellerOrders API URL:', url)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || ''
      }
    } catch (error) {
      console.error('獲取賣家訂單失敗:', error)
      return {
        success: false,
        error: error.message || '獲取賣家訂單失敗',
        data: null
      }
    }
  },

  /**
   * 獲取訂單詳情
   * @param {string} orderId - 訂單ID
   * @param {number} vendorId - 賣家ID
   */
  async getOrderDetail(orderId, vendorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/SellerOrders/${orderId}/vendor/${vendorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || ''
      }
    } catch (error) {
      console.error('獲取訂單詳情失敗:', error)
      return {
        success: false,
        error: error.message || '獲取訂單詳情失敗',
        data: null
      }
    }
  },

  /**
   * 更新訂單狀態
   * @param {string} orderId - 訂單ID
   * @param {number} vendorId - 賣家ID
   * @param {string} status - 新狀態
   * @param {string} notes - 備註
   */
  async updateOrderStatus(orderId, vendorId, status, notes = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/SellerOrders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          vendorId,
          status,
          notes
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || '訂單狀態更新成功'
      }
    } catch (error) {
      console.error('更新訂單狀態失敗:', error)
      return {
        success: false,
        error: error.message || '更新訂單狀態失敗',
        data: null
      }
    }
  },

  /**
   * 安排出貨
   * @param {string} orderId - 訂單ID
   * @param {number} vendorId - 賣家ID
   * @param {Object} shipmentData - 出貨資料
   * @param {string} shipmentData.carrier - 物流公司
   * @param {string} shipmentData.trackingNumber - 追蹤號碼
   * @param {Date} shipmentData.expectedDate - 預計到貨日
   * @param {string} shipmentData.notes - 備註
   */
  async arrangeShipment(orderId, vendorId, shipmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/SellerOrders/${orderId}/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          vendorId,
          ...shipmentData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || '出貨安排成功'
      }
    } catch (error) {
      console.error('安排出貨失敗:', error)
      return {
        success: false,
        error: error.message || '安排出貨失敗',
        data: null
      }
    }
  },

  /**
   * 批量操作訂單
   * @param {Array} orderIds - 訂單ID陣列
   * @param {number} vendorId - 賣家ID
   * @param {string} action - 操作類型 (process, ship, cancel)
   * @param {Object} actionData - 操作資料
   */
  async bulkOrderAction(orderIds, vendorId, action, actionData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/SellerOrders/bulk-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderIds,
          vendorId,
          action,
          actionData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || '批量操作完成'
      }
    } catch (error) {
      console.error('批量操作失敗:', error)
      return {
        success: false,
        error: error.message || '批量操作失敗',
        data: null
      }
    }
  },

  /**
   * 獲取訂單統計
   * @param {number} vendorId - 賣家ID
   * @param {string} period - 統計期間 (today, week, month, quarter)
   */
  async getOrderStats(vendorId, period = 'today') {
    try {
      const response = await fetch(`${API_BASE_URL}/SellerOrders/vendor/${vendorId}/stats?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || ''
      }
    } catch (error) {
      console.error('獲取訂單統計失敗:', error)
      return {
        success: false,
        error: error.message || '獲取訂單統計失敗',
        data: null
      }
    }
  },

  /**
   * 匯出訂單資料
   * @param {number} vendorId - 賣家ID
   * @param {Object} params - 篩選參數
   * @param {string} format - 匯出格式 (csv, excel)
   */
  async exportOrders(vendorId, params = {}, format = 'csv') {
    try {
      const queryParams = new URLSearchParams()
      
      Object.entries(params).forEach(([key, value]) => {
        if (value != null) queryParams.append(key, value)
      })
      
      queryParams.append('format', format)

      const response = await fetch(`${API_BASE_URL}/SellerOrders/vendor/${vendorId}/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 處理檔案下載
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `orders_${vendorId}_${new Date().toISOString().slice(0, 10)}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return {
        success: true,
        message: '訂單資料匯出成功'
      }
    } catch (error) {
      console.error('匯出訂單失敗:', error)
      return {
        success: false,
        error: error.message || '匯出訂單失敗'
      }
    }
  },

  /**
   * 更新出貨狀態
   * @param {string} orderNumber - 訂單編號
   * @param {number} vendorId - 賣家ID
   * @param {string} status - 新狀態 (shipped/delivered)
   * @param {string} trackingNumber - 追蹤號碼 (可選)
   */
  async updateShippingStatus(orderNumber, vendorId, status, trackingNumber = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/SellerOrders/${orderNumber}/shipping-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          vendorId: vendorId,
          status: status,
          trackingNumber: trackingNumber
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || '出貨狀態更新成功'
      }
    } catch (error) {
      console.error('更新出貨狀態失敗:', error)
      return {
        success: false,
        error: error.message || '更新出貨狀態失敗'
      }
    }
  },

  /**
   * 獲取賣家統計數據
   * @param {number} vendorId - 賣家ID
   * @param {number} days - 統計天數，預設30天
   */
  async getVendorStatistics(vendorId, days = 30) {
    try {
      const response = await fetch(`${API_BASE_URL}/SellerOrders/vendor/${vendorId}/statistics?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || '統計數據獲取成功'
      }
    } catch (error) {
      console.error('獲取賣家統計失敗:', error)
      return {
        success: false,
        error: error.message || '獲取統計數據失敗'
      }
    }
  }
}

export default SellerOrderService

/**
 * 訂單相關服務
 */

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://localhost:7106/api'

const orderService = {
  /**
   * 獲取會員訂單列表
   * @param {number} memberId - 會員ID
   * @param {Object} params - 查詢參數
   * @param {string} params.status - 訂單狀態篩選
   * @param {number} params.page - 頁碼
   * @param {number} params.pageSize - 每頁數量
   * @param {string} params.search - 搜尋關鍵字
   * @param {number} params.days - 日期範圍（天數）
   */
  async getMemberOrders(memberId, params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.status) queryParams.append('status', params.status)
      if (params.page) queryParams.append('page', params.page)
      if (params.pageSize) queryParams.append('pageSize', params.pageSize)
      if (params.search) queryParams.append('search', params.search)
      if (params.days) queryParams.append('days', params.days)
      
      const response = await fetch(`${API_BASE_URL}/Orders/member/${memberId}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
        message: result.message || '成功獲取訂單列表'
      }
    } catch (error) {
      console.error('獲取訂單列表失敗:', error)
      return {
        success: false,
        error: error.message || '獲取訂單列表失敗',
        data: null
      }
    }
  },

  /**
   * 獲取訂單詳情
   * @param {string} orderNumber - 訂單編號
   * @param {number} memberId - 會員ID
   */
  async getOrderDetail(orderNumber, memberId) {
    try {
      const response = await fetch(`${API_BASE_URL}/Orders/${orderNumber}?memberId=${memberId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
        message: result.message || '成功獲取訂單詳情'
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
   * 取消訂單
   * @param {string} orderNumber - 訂單編號
   * @param {number} memberId - 會員ID
   * @param {string} reason - 取消原因
   */
  async cancelOrder(orderNumber, memberId, reason = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/Orders/${orderNumber}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          memberId,
          reason
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || '訂單已成功取消'
      }
    } catch (error) {
      console.error('取消訂單失敗:', error)
      return {
        success: false,
        error: error.message || '取消訂單失敗',
        data: null
      }
    }
  },

  /**
   * 確認收貨
   * @param {string} orderNumber - 訂單編號
   * @param {number} memberId - 會員ID
   */
  async confirmDelivery(orderNumber, memberId) {
    try {
      const response = await fetch(`${API_BASE_URL}/Orders/${orderNumber}/confirm-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          memberId
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || '已確認收貨'
      }
    } catch (error) {
      console.error('確認收貨失敗:', error)
      return {
        success: false,
        error: error.message || '確認收貨失敗',
        data: null
      }
    }
  },

  /**
   * 完成訂單
   * @param {string|number} orderIdentifier - 訂單ID或訂單編號
   * @param {number} memberId - 會員ID  
   */
  async completeOrder(orderIdentifier, memberId) {
    try {
      // 如果傳入的是數字ID，需要轉換為訂單編號
      // 但目前後端期待的是訂單編號，所以直接使用
      const response = await fetch(`${API_BASE_URL}/Orders/${orderIdentifier}/confirm-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          memberId: memberId || parseInt(localStorage.getItem('memberId'), 10)
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || '訂單已完成'
      }
    } catch (error) {
      console.error('完成訂單失敗:', error)
      return {
        success: false,
        error: error.message || '完成訂單失敗',
        data: null
      }
    }
  },

  /**
   * 申請退款
   * @param {string} orderNumber - 訂單編號
   * @param {number} memberId - 會員ID
   * @param {string} reason - 退款原因
   * @param {Array} items - 退款商品項目
   */
  async requestRefund(orderNumber, memberId, reason, items = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/Orders/${orderNumber}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          memberId,
          reason,
          items
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return {
        success: true,
        data: result.data || result,
        message: result.message || '退款申請已提交'
      }
    } catch (error) {
      console.error('申請退款失敗:', error)
      return {
        success: false,
        error: error.message || '申請退款失敗',
        data: null
      }
    }
  },

  /**
   * 下載發票
   * @param {string} orderNumber - 訂單編號
   * @param {number} memberId - 會員ID
   */
  async downloadInvoice(orderNumber, memberId) {
    try {
      const response = await fetch(`${API_BASE_URL}/Orders/${orderNumber}/invoice?memberId=${memberId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // 處理 PDF 下載
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice_${orderNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      return {
        success: true,
        message: '發票下載成功'
      }
    } catch (error) {
      console.error('下載發票失敗:', error)
      return {
        success: false,
        error: error.message || '下載發票失敗'
      }
    }
  },

  /**
   * 獲取物流追蹤資訊
   * @param {string} trackingNumber - 追蹤號碼
   * @param {string} courier - 物流公司代碼
   */
  async getTrackingInfo(trackingNumber, courier = 'TCAT') {
    try {
      const response = await fetch(`${API_BASE_URL}/Logistics/tracking?trackingNumber=${trackingNumber}&courier=${courier}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
        message: result.message || '成功獲取物流資訊'
      }
    } catch (error) {
      console.error('獲取物流資訊失敗:', error)
      return {
        success: false,
        error: error.message || '獲取物流資訊失敗',
        data: null
      }
    }
  }
}

export default orderService

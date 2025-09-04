// 銷售報表服務
import authService from './authService'

class SalesReportService {
  constructor() {
    // 使用相對路徑，讓 Vue proxy 處理路由到正確的後端
    this.baseUrl = '/api/SellerReports'
  }

  // 獲取儀表板統計資料
  async getDashboardData(sellerId, params = {}) {
    try {
      console.log('📊 開始獲取儀表板資料，賣家 ID:', sellerId)

      // 確保只包含活躍商品
      const enhancedParams = {
        ...params,
        isActive: true  // 只計入 IsActive 為 true 的商品
      }

      const queryParams = new URLSearchParams(enhancedParams)
      const url = `${this.baseUrl}/${sellerId}/dashboard${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...authService.getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error(`儀表板API錯誤: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ 儀表板資料載入成功:', result)

      return result.data || result
    } catch (error) {
      console.error('❌ 獲取儀表板資料失敗:', error)
      throw error
    }
  }

  // 獲取訂單列表
  async getOrdersData(sellerId, params = {}) {
    try {
      console.log('🛒 開始獲取訂單列表，賣家 ID:', sellerId)

      // 確保只包含活躍商品的訂單
      const enhancedParams = {
        ...params,
        isActive: true  // 只計入 IsActive 為 true 的商品訂單
      }

      const queryParams = new URLSearchParams(enhancedParams)
      const url = `${this.baseUrl}/${sellerId}/orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...authService.getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error(`訂單列表API錯誤: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ 訂單列表載入成功:', result)

      return result.data || result
    } catch (error) {
      console.error('❌ 獲取訂單列表失敗:', error)
      throw error
    }
  }

  // 獲取統計資料
  async getStatisticsData(sellerId, params = {}) {
    try {
      console.log('📈 開始獲取統計資料，賣家 ID:', sellerId)

      // 確保只包含活躍商品的統計
      const enhancedParams = {
        ...params,
        isActive: true  // 只計入 IsActive 為 true 的商品
      }

      const queryParams = new URLSearchParams(enhancedParams)
      const url = `${this.baseUrl}/${sellerId}/statistics${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...authService.getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error(`統計資料API錯誤: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ 統計資料載入成功:', result)

      return result.data || result
    } catch (error) {
      console.error('❌ 獲取統計資料失敗:', error)
      throw error
    }
  }

  // 獲取商品分析資料
  async getProductsData(sellerId, params = {}) {
    try {
      console.log('🎯 開始獲取商品分析，賣家 ID:', sellerId)

      // 確保只包含活躍商品的分析
      const enhancedParams = {
        ...params,
        isActive: true  // 只計入 IsActive 為 true 的商品
      }

      const queryParams = new URLSearchParams(enhancedParams)
      const url = `${this.baseUrl}/${sellerId}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...authService.getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error(`商品分析API錯誤: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ 商品分析載入成功:', result)

      return result.data || result
    } catch (error) {
      console.error('❌ 獲取商品分析失敗:', error)
      throw error
    }
  }

  // 獲取銷售報表資料 (向後相容方法)
  async getSalesData(sellerId, params = {}) {
    try {
      // 確保只包含活躍商品
      const enhancedParams = {
        ...params,
        isActive: true  // 只計入 IsActive 為 true 的商品
      }

      // 使用儀表板資料作為主要資料來源
      const dashboardData = await this.getDashboardData(sellerId, enhancedParams)
      return this.transformSalesDataFromDashboard(dashboardData, sellerId)
    } catch (error) {
      console.error('❌ 獲取銷售資料失敗:', error)
      throw error
    }
  }

  // 從儀表板資料轉換為銷售資料格式 (向後相容)
  transformSalesDataFromDashboard(dashboardData, sellerId) {
    try {
      if (!dashboardData.summary) {
        return []
      }

      // 創建基本的銷售資料結構
      const summary = dashboardData.summary
      const mockSalesData = [{
        id: `dashboard-${sellerId}`,
        orderNumber: `DASH-${sellerId}`,
        orderDate: new Date().toISOString(),
        productName: '儀表板摘要 (包含所有有效狀態)',
        productSku: 'DASHBOARD',
        quantity: summary.totalOrders || 0,
        unitPrice: summary.averageOrderValue || 0,
        totalAmount: summary.totalRevenue || 0,
        status: 'completed',
        sellerId: sellerId,
        customerName: '系統摘要',
        customerEmail: ''
      }]

      console.log('🔄 從儀表板轉換的銷售資料 (包含所有有效狀態):', mockSalesData)
      return mockSalesData
    } catch (error) {
      console.error('❌ 轉換儀表板資料失敗:', error)
      return []
    }
  }

  // 轉換銷售資料格式 (保留原有方法以確保相容性)
  transformSalesData(rawData, sellerId) {
    try {
      let data = rawData

      // 檢查是否為包裝的回應格式
      if (rawData.success && rawData.data) {
        data = rawData.data
      } else if (rawData.result) {
        data = rawData.result
      }

      // 確保是陣列格式
      if (!Array.isArray(data)) {
        data = [data].filter(Boolean)
      }

      // 轉換欄位格式
      const transformedData = data.map(sale => ({
        id: sale.Id || sale.id || sale.SaleId || Math.random().toString(36).substr(2, 9),
        orderNumber: sale.OrderNumber || sale.orderNumber || sale.OrderId || `ORD${Date.now()}`,
        orderDate: sale.OrderDate || sale.orderDate || sale.SaleDate || sale.CreatedAt || new Date().toISOString(),
        productName: sale.ProductName || sale.productName || sale.ItemName || '未知商品',
        productSku: sale.ProductSku || sale.productSku || sale.SKU || sale.Sku || 'N/A',
        quantity: parseInt(sale.Quantity || sale.quantity || sale.Amount || 0),
        unitPrice: parseFloat(sale.UnitPrice || sale.unitPrice || sale.Price || sale.ItemPrice || 0),
        totalAmount: parseFloat(sale.TotalAmount || sale.totalAmount || sale.Total || sale.TotalPrice || 0),
        status: sale.Status || sale.status || sale.OrderStatus || 'pending',
        sellerId: sale.SellerId || sale.sellerId || sellerId,
        customerName: sale.CustomerName || sale.customerName || sale.BuyerName || '',
        customerEmail: sale.CustomerEmail || sale.customerEmail || sale.BuyerEmail || ''
      }))

      console.log('🔄 轉換後的銷售資料 (包含所有有效狀態):', transformedData)
      return transformedData

    } catch (error) {
      console.error('❌ 轉換銷售資料失敗:', error)
      return []
    }
  }

  // 計算銷售摘要
  calculateSummary(salesData) {
    // 排除已取消的訂單，包含所有其他狀態 (pending, paid, shipped, delivered, completed, processing 等)
    const validSales = salesData.filter(sale =>
      !['cancelled', 'canceled', 'refunded'].includes(sale.status)
    )

    // 計算總訂單數（包含所有有效狀態）
    const totalOrders = validSales.length

    // 只有已完成的訂單才計入收益
    const completedSales = validSales.filter(sale =>
      ['completed', 'delivered', 'finished', 'paid'].includes(sale.status)
    )

    const totalRevenue = completedSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const totalProducts = validSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0)

    return {
      totalRevenue,
      totalOrders,  // 包含 pending 等所有有效狀態的訂單
      avgOrderValue,
      totalProducts
    }
  }

  // 根據日期範圍篩選資料
  filterByDateRange(salesData, startDate, endDate) {
    if (!startDate && !endDate) return salesData

    return salesData.filter(sale => {
      const saleDate = new Date(sale.orderDate)
      const start = startDate ? new Date(startDate) : new Date('1970-01-01')
      const end = endDate ? new Date(endDate) : new Date('2099-12-31')

      return saleDate >= start && saleDate <= end
    })
  }

  // 根據狀態篩選資料
  filterByStatus(salesData, status) {
    if (!status || status === 'all') return salesData

    return salesData.filter(sale => sale.status === status)
  }
}

export default new SalesReportService()

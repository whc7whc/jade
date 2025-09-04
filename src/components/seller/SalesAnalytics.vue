<template>
  <div class="sales-analytics">
    <!-- 時間篩選器 -->
    <div class="row mb-4">
      <div class="col-md-3">
        <label class="form-label">開始日期</label>
        <input 
          type="date" 
          class="form-control" 
          v-model="dateRange.startDate"
          @change="loadSalesData"
        >
      </div>
      <div class="col-md-3">
        <label class="form-label">結束日期</label>
        <input 
          type="date" 
          class="form-control" 
          v-model="dateRange.endDate"
          @change="loadSalesData"
        >
      </div>
      <div class="col-md-3">
        <label class="form-label">報表類型</label>
        <select class="form-select" v-model="reportType" @change="loadSalesData">
          <option value="daily">每日報表</option>
          <option value="weekly">每週報表</option>
          <option value="monthly">每月報表</option>
        </select>
      </div>
      <div class="col-md-3 d-flex align-items-end">
        <button class="btn btn-outline-primary me-2" @click="refreshReport" :disabled="loading">
          <i class="fas fa-sync me-1" :class="{ 'fa-spin': loading }"></i>重新整理
        </button>
        <button class="btn btn-success" @click="exportReport" :disabled="loading">
          <i class="fas fa-download me-1"></i>匯出
        </button>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="alert alert-danger mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <span>{{ error }}</span>
        <button @click="loadSalesData" class="btn btn-outline-danger btn-sm">
          重新載入
        </button>
      </div>
    </div>

    <!-- Loading 狀態 -->
    <div v-if="loading && salesData.length === 0" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-3 text-muted">正在載入銷售資料...</p>
    </div>

    <!-- 銷售概覽卡片 -->
    <div v-if="!loading || salesData.length > 0" class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <i class="fas fa-dollar-sign fa-2x text-success mb-2"></i>
            <h5 class="card-title text-success">總銷售額</h5>
            <h3 class="text-success">NT$ {{ formatCurrency(salesSummary.totalRevenue) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <i class="fas fa-shopping-cart fa-2x text-info mb-2"></i>
            <h5 class="card-title text-info">總訂單數</h5>
            <h3 class="text-info">{{ salesSummary.totalOrders }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <i class="fas fa-chart-line fa-2x text-warning mb-2"></i>
            <h5 class="card-title text-warning">平均訂單</h5>
            <h3 class="text-warning">NT$ {{ formatCurrency(salesSummary.avgOrderValue) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <i class="fas fa-box fa-2x text-secondary mb-2"></i>
            <h5 class="card-title text-secondary">商品數量</h5>
            <h3 class="text-secondary">{{ salesSummary.totalProducts }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- 銷售統計圖表 -->
    <div v-if="!loading || salesData.length > 0" class="row mb-4">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-chart-line me-2"></i>銷售趨勢
            </h5>
          </div>
          <div class="card-body">
            <canvas id="salesTrendChart" width="400" height="200"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-chart-pie me-2"></i>訂單狀態分佈
            </h5>
          </div>
          <div class="card-body">
            <canvas id="statusChart" width="300" height="200"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品績效排行 -->
    <div v-if="!loading && productPerformance.length > 0" class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-trophy me-2"></i>商品績效排行
            </h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>排名</th>
                    <th>商品名稱</th>
                    <th>銷售額</th>
                    <th>銷售量</th>
                    <th>平均價格</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(product, index) in productPerformance.slice(0, 10)" :key="product.productId">
                    <td>
                      <span class="badge" :class="getRankBadgeClass(index + 1)">
                        {{ index + 1 }}
                      </span>
                    </td>
                    <td>{{ product.productName }}</td>
                    <td class="text-success fw-bold">NT$ {{ formatCurrency(product.totalSales) }}</td>
                    <td>{{ product.totalQuantity }}</td>
                    <td>NT$ {{ formatCurrency(product.averagePrice) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 銷售資料表格 -->
    <div v-if="!loading || salesData.length > 0" class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="fas fa-table me-2"></i>銷售明細
        </h5>
        <div class="d-flex align-items-center">
          <small class="text-muted me-3">共 {{ salesData.length }} 筆記錄</small>
          <select class="form-select form-select-sm" v-model="statusFilter" @change="loadSalesData" style="width: auto;">
            <option value="all">全部狀態</option>
            <option value="pending">待付款</option>
            <option value="paid">已付款</option>
            <option value="processing">處理中</option>
            <option value="shipped">已出貨</option>
            <option value="delivered">已送達</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>訂單編號</th>
                <th>日期</th>
                <th>商品名稱</th>
                <th>數量</th>
                <th>單價</th>
                <th>總金額</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in paginatedSalesData" :key="sale.id">
                <td>
                  <span class="badge bg-light text-dark">{{ sale.orderNumber }}</span>
                </td>
                <td>{{ formatDate(sale.orderDate) }}</td>
                <td>
                  <div>
                    <strong>{{ sale.productName }}</strong>
                    <br>
                    <small class="text-muted">SKU: {{ sale.productSku }}</small>
                  </div>
                </td>
                <td>
                  <span class="badge bg-primary">{{ sale.quantity }}</span>
                </td>
                <td>NT$ {{ formatCurrency(sale.unitPrice) }}</td>
                <td>
                  <strong class="text-success">NT$ {{ formatCurrency(sale.totalAmount) }}</strong>
                </td>
                <td>
                  <span 
                    class="badge" 
                    :class="getStatusClass(sale.status)"
                  >
                    {{ getStatusText(sale.status) }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary" 
                    @click="viewOrderDetails(sale)"
                    title="查看詳情"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分頁控制 -->
        <nav v-if="salesData.length > itemsPerPage" class="p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted small">
              顯示 {{ (currentPage - 1) * itemsPerPage + 1 }} - 
              {{ Math.min(currentPage * itemsPerPage, salesData.length) }} / 
              {{ salesData.length }} 筆
            </div>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                  上一頁
                </button>
              </li>
              <li 
                class="page-item" 
                v-for="page in visiblePages" 
                :key="page"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="goToPage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                  下一頁
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>

    <!-- 訂單詳情 Modal -->
    <div class="modal fade" tabindex="-1" ref="orderDetailModal" id="orderDetailModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-receipt me-2"></i>
              訂單詳情 - {{ selectedOrder?.orderNumber }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedOrder">
            <div class="row">
              <div class="col-md-6">
                <h6><i class="fas fa-info-circle me-2"></i>基本資訊</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>訂單編號：</strong></td>
                      <td>{{ selectedOrder.orderNumber }}</td>
                    </tr>
                    <tr>
                      <td><strong>下單日期：</strong></td>
                      <td>{{ formatDate(selectedOrder.orderDate) }}</td>
                    </tr>
                    <tr>
                      <td><strong>狀態：</strong></td>
                      <td>
                        <span class="badge" :class="getStatusClass(selectedOrder.status)">
                          {{ getStatusText(selectedOrder.status) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <h6><i class="fas fa-box me-2"></i>商品資訊</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>商品名稱：</strong></td>
                      <td>{{ selectedOrder.productName }}</td>
                    </tr>
                    <tr>
                      <td><strong>SKU：</strong></td>
                      <td>{{ selectedOrder.productSku }}</td>
                    </tr>
                    <tr>
                      <td><strong>數量：</strong></td>
                      <td>{{ selectedOrder.quantity }}</td>
                    </tr>
                    <tr>
                      <td><strong>單價：</strong></td>
                      <td>NT$ {{ formatCurrency(selectedOrder.unitPrice) }}</td>
                    </tr>
                    <tr>
                      <td><strong>總金額：</strong></td>
                      <td>
                        <span class="text-success fw-bold">
                          NT$ {{ formatCurrency(selectedOrder.totalAmount) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'
import salesReportService from '@/services/salesReportService'
import { ensureSellerId } from '@/services/sellerIdentityService.js'
import Chart from 'chart.js/auto'

export default {
  name: 'SalesAnalytics',
  data() {
    return {
      // 賣家相關資訊
      sellerId: null,
      memberId: null,
      currentVendorInfo: null,

      // 載入狀態
      loading: false,
      error: null,

      // 篩選條件
      dateRange: {
        startDate: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 30)
          return date.toISOString().split('T')[0]
        })(),
        endDate: (() => {
          const date = new Date()
          date.setDate(date.getDate() + 1)  // 包含今天
          return date.toISOString().split('T')[0]
        })()
      },
      reportType: 'daily',
      statusFilter: 'all',

      // 銷售資料
      salesData: [],
      salesSummary: {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        totalProducts: 0
      },
      
      // 圖表資料
      dailySalesData: [],
      orderStatusData: [],
      productPerformance: [],
      
      // 圖表實例
      salesTrendChart: null,
      statusChart: null,

      // 分頁
      currentPage: 1,
      itemsPerPage: 8,

      // Modal
      selectedOrder: null
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.salesData.length / this.itemsPerPage)
    },
    paginatedSalesData() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.salesData.slice(start, end)
    },
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  async mounted() {
    await this.initializeSeller()
  },
  beforeUnmount() {
    // 清理圖表實例
    if (this.salesTrendChart) {
      this.salesTrendChart.destroy()
    }
    if (this.statusChart) {
      this.statusChart.destroy()
    }
  },
  methods: {
    // 初始化賣家 ID（共用 sellerIdentityService 的方法，與優惠券一致）
    async initializeSeller() {
      try {
        this.loading = true
        this.error = null

        // 1. 獲取會員 ID 和賣家狀態
        this.memberId = localStorage.getItem('memberId')
        const isSeller = localStorage.getItem('isSeller')
        
        if (!this.memberId) {
          throw new Error('請先登入才能查看銷售報表')
        }

        if (isSeller !== 'true') {
          throw new Error('您需要先申請成為賣家並通過審核才能查看銷售報表')
        }

        // 2. 透過共用服務解析當前賣家 ID（含快取與 fallback 規則）
        console.log('🔍 [SalesAnalytics] 嘗試解析當前賣家 ID...')
        const resolvedId = await ensureSellerId({ fallbackToMemberId: true })
        if (!resolvedId) {
          throw new Error('無法解析賣家 ID，請重新登入或稍後再試')
        }
        this.sellerId = resolvedId
        console.log('✅ [SalesAnalytics] 確認賣家 ID:', this.sellerId)

        // 3. 設定基本賣家資訊
        this.currentVendorInfo = {
          id: this.sellerId,
          name: `賣家 ${this.sellerId}`,
          email: '',
          status: 'Active'
        }

        console.log('🎯 [SalesAnalytics] 最終確定的賣家 ID:', this.sellerId)
        console.log('👤 [SalesAnalytics] 賣家資訊:', this.currentVendorInfo)

  // 設置到 authService 中供其他服務使用（ensureSellerId 已做快取，這裡重設亦可）
  authService.setCurrentSellerId(this.sellerId)

        // 4. 載入銷售資料
        await this.loadSalesData()

      } catch (error) {
        console.error('❌ [SalesAnalytics] 初始化賣家失敗:', error)
        this.error = error.message || '初始化失敗，請確認您的賣家權限'
      } finally {
        this.loading = false
      }
    },

    async loadSalesData() {
      if (!this.sellerId) {
        console.log('⚠️ [SalesAnalytics] 賣家 ID 尚未初始化，先進行初始化...')
        return await this.initializeSeller()
      }
      
      this.loading = true
      this.error = null

      try {
        console.log('📊 [SalesAnalytics] 開始載入銷售資料，賣家 ID:', this.sellerId)

        // 構建查詢參數
        const params = {
          startDate: this.dateRange.startDate,
          endDate: this.dateRange.endDate,
          reportType: this.reportType
        }

        if (this.statusFilter !== 'all') {
          params.status = this.statusFilter
        }

        console.log('🔍 [SalesAnalytics] 查詢參數:', params)
        console.log('🔍 [SalesAnalytics] 狀態篩選器:', this.statusFilter)
        console.log('🔍 [SalesAnalytics] 日期範圍:', this.dateRange)

        // 使用新的 API 端點獲取儀表板資料
        const dashboardData = await salesReportService.getDashboardData(this.sellerId, params)
        
        // 直接使用儀表板摘要資料
        if (dashboardData && dashboardData.summary) {
          this.salesSummary = {
            totalRevenue: dashboardData.summary.totalRevenue || 0,
            totalOrders: dashboardData.summary.totalOrders || 0,
            avgOrderValue: dashboardData.summary.averageOrderValue || 0,
            totalProducts: dashboardData.summary.totalProducts || 0
          }
          
          // 設定賣家資訊
          if (dashboardData.sellerName) {
            this.currentVendorInfo.name = dashboardData.sellerName
          }
        }

        // 獲取詳細的訂單列表資料
        try {
          const ordersData = await salesReportService.getOrdersData(this.sellerId, {
            ...params,
            page: 1,
            pageSize: 100 // 獲取更多資料用於顯示
          })
          
          if (ordersData && ordersData.orders) {
            console.log('🔍 [SalesAnalytics] 原始訂單資料:', ordersData)
            console.log('🔍 [SalesAnalytics] 訂單數量:', ordersData.orders.length)
            
            // 轉換訂單資料格式
            this.salesData = ordersData.orders.map(order => {
              const transformedOrder = {
                id: order.id,
                orderNumber: order.orderNumber,
                orderDate: order.orderDate,
                productName: order.products?.[0]?.productName || '複合訂單',
                productSku: order.products?.[0]?.productSku || '',
                quantity: order.itemCount || 0,
                unitPrice: order.products?.[0]?.unitPrice || (order.totalAmount / (order.itemCount || 1)),
                totalAmount: order.totalAmount,
                status: order.status,
                sellerId: this.sellerId,
                customerName: order.customerName,
                customerEmail: order.customerEmail
              }
              
              console.log('🔍 [SalesAnalytics] 轉換訂單:', {
                原始: { id: order.id, status: order.status, orderNumber: order.orderNumber },
                轉換後: { id: transformedOrder.id, status: transformedOrder.status, orderNumber: transformedOrder.orderNumber }
              })
              
              return transformedOrder
            })
            
            console.log(`✅ [SalesAnalytics] 成功載入 ${this.salesData.length} 筆訂單記錄`)
            console.log('🔍 [SalesAnalytics] 轉換後的銷售資料:', this.salesData)
          }
        } catch (orderError) {
          console.warn('⚠️ [SalesAnalytics] 載入詳細訂單失敗，使用摘要資料:', orderError)
          console.warn('⚠️ [SalesAnalytics] 錯誤詳情:', {
            message: orderError.message,
            stack: orderError.stack,
            sellerId: this.sellerId,
            params
          })
          // 如果無法獲取詳細訂單，創建基本的資料結構
          this.salesData = []
        }

        // 獲取統計圖表資料
        try {
          const statisticsData = await salesReportService.getStatisticsData(this.sellerId, {
            reportType: this.reportType,
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1
          })
          
          if (statisticsData && statisticsData.charts) {
            this.dailySalesData = statisticsData.charts.dailySales || []
            this.orderStatusData = statisticsData.charts.orderStatus || []
            this.productPerformance = statisticsData.charts.productPerformance || []
            
            // 更新圖表
            this.updateCharts()
          }
        } catch (statsError) {
          console.warn('⚠️ [SalesAnalytics] 載入統計資料失敗:', statsError)
        }

        // 獲取商品分析資料
        try {
          const productsData = await salesReportService.getProductsData(this.sellerId, params)
          
          if (productsData && productsData.products) {
            // 如果統計API沒有商品績效資料，使用商品分析資料
            if (this.productPerformance.length === 0) {
              this.productPerformance = productsData.products.map((product, index) => ({
                productId: product.productId,
                productName: product.productName,
                totalSales: product.totalSales,
                totalQuantity: product.totalQuantity,
                averagePrice: product.averagePrice,
                rank: index + 1
              }))
            }
          }
        } catch (productError) {
          console.warn('⚠️ [SalesAnalytics] 載入商品分析失敗:', productError)
        }
        
      } catch (error) {
        console.error('❌ [SalesAnalytics] 載入銷售資料失敗:', error)
        this.error = error.message || '載入銷售資料失敗，請稍後再試'
      } finally {
        this.loading = false
      }
    },

    // 重新整理報表
    async refreshReport() {
      await this.loadSalesData()
    },

    // 更新圖表
    updateCharts() {
      this.$nextTick(() => {
        this.createSalesTrendChart()
        this.createStatusChart()
      })
    },

    // 創建銷售趨勢圖表
    createSalesTrendChart() {
      if (this.salesTrendChart) {
        this.salesTrendChart.destroy()
      }

      const ctx = document.getElementById('salesTrendChart')
      if (!ctx) return

      this.salesTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.dailySalesData.map(item => item.date),
          datasets: [
            {
              label: '銷售額',
              data: this.dailySalesData.map(item => item.revenue),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
              yAxisID: 'y'
            },
            {
              label: '訂單數',
              data: this.dailySalesData.map(item => item.orders),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.1,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: false
            },
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: '銷售額 (NT$)'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: '訂單數'
              },
              grid: {
                drawOnChartArea: false,
              },
            }
          }
        }
      })
    },

    // 創建狀態分佈圖表
    createStatusChart() {
      if (this.statusChart) {
        this.statusChart.destroy()
      }

      const ctx = document.getElementById('statusChart')
      if (!ctx) return

      const statusColors = {
        completed: '#28a745',    // 綠色 - 已完成
        pending: '#ffc107',      // 黃色 - 待付款
        paid: '#17a2b8',         // 藍色 - 已付款
        processing: '#6f42c1',   // 紫色 - 處理中
        shipped: '#007bff',      // 深藍色 - 已出貨
        delivered: '#20c997',    // 青色 - 已送達
        cancelled: '#dc3545',    // 紅色 - 已取消
        finished: '#28a745'      // 綠色 - 已完成
      }

      this.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.orderStatusData.map(item => item.statusLabel),
          datasets: [
            {
              data: this.orderStatusData.map(item => item.count),
              backgroundColor: this.orderStatusData.map(item => statusColors[item.status] || '#6c757d'),
              borderWidth: 2,
              borderColor: '#fff'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || ''
                  const value = context.parsed || 0
                  const total = context.dataset.data.reduce((a, b) => a + b, 0)
                  const percentage = ((value / total) * 100).toFixed(1)
                  return `${label}: ${value} (${percentage}%)`
                }
              }
            }
          }
        }
      })
    },

    // 獲取排名徽章樣式
    getRankBadgeClass(rank) {
      if (rank === 1) return 'bg-warning text-dark'
      if (rank === 2) return 'bg-secondary'
      if (rank === 3) return 'bg-info'
      return 'bg-light text-dark'
    },

    // 匯出報表
    exportReport() {
      const csvContent = this.generateCSV()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `sales_report_${this.sellerId}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },

    // 產生 CSV 內容
    generateCSV() {
      const headers = ['訂單編號', '日期', '商品名稱', 'SKU', '數量', '單價', '總金額', '狀態']
      const rows = this.salesData.map(sale => [
        sale.orderNumber,
        this.formatDate(sale.orderDate),
        sale.productName,
        sale.productSku,
        sale.quantity,
        sale.unitPrice,
        sale.totalAmount,
        this.getStatusText(sale.status)
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    },

    // 查看訂單詳情
    viewOrderDetails(sale) {
      this.selectedOrder = sale
      
      // 使用 Bootstrap Modal
      const modalElement = document.getElementById('orderDetailModal')
      if (modalElement && window.bootstrap) {
        const modal = new window.bootstrap.Modal(modalElement)
        modal.show()
      }
    },

    // 分頁控制
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    // 格式化金額
    formatCurrency(amount) {
      return new Intl.NumberFormat('zh-TW').format(parseFloat(amount) || 0)
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },

    // 獲取狀態樣式類別
    getStatusClass(status) {
      const statusClasses = {
        completed: 'bg-success',
        pending: 'bg-warning',
        paid: 'bg-info',
        shipped: 'bg-primary',
        delivered: 'bg-success',
        cancelled: 'bg-danger',
        processing: 'bg-info',
        finished: 'bg-success'
      }
      return statusClasses[status] || 'bg-secondary'
    },

    // 獲取狀態文字
    getStatusText(status) {
      const statusTexts = {
        completed: '已完成',
        pending: '待付款',
        paid: '已付款', 
        shipped: '已出貨',
        delivered: '已送達',
        cancelled: '已取消',
        processing: '處理中',
        finished: '已完成'
      }
      return statusTexts[status] || status
    },

    // 獲取預設開始日期（30天前）
    getDefaultStartDate() {
      const date = new Date()
      date.setDate(date.getDate() - 30)
      return date.toISOString().split('T')[0]
    },

    // 獲取預設結束日期（今天）
    getDefaultEndDate() {
      const date = new Date()
      // 確保包含今天的資料，設定為明天
      date.setDate(date.getDate() + 1) 
      return date.toISOString().split('T')[0]
    }
  }
}
</script>

<style scoped>
.sales-analytics {
  padding: 0;
}

.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 8px;
  border: none;
}

.table th {
  font-weight: 600;
  border-top: none;
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.85em;
}

.btn:hover {
  transform: translateY(-1px);
  transition: all 0.2s;
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.9rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .d-flex.align-items-end {
    flex-direction: column;
    align-items: stretch !important;
  }
  
  .d-flex.align-items-end .btn {
    margin-bottom: 0.5rem;
  }
}
</style>

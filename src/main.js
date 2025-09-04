import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Bootstrap CSS 和 JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import * as bootstrap from 'bootstrap'

// SweetAlert2
import Swal from 'sweetalert2'

// 導入通知系統和事件匯流排
import NoticePlugin from './utils/noticeManager.js'
import EventBusPlugin from './utils/eventBus.js'
import { ToastPlugin } from './services/toastService.js'

// 將 Bootstrap 設為全局可用
window.bootstrap = bootstrap

// 導入上傳服務
import uploadService from './services/uploadService.js'
import productApi from './services/productApi.js'

// 創建 Vue 應用
const app = createApp(App)

// 全域屬性和方法
app.config.globalProperties.$api = {
  baseURL: process.env.NODE_ENV === 'development'
    ? '' // 開發模式使用代理，生產模式使用完整 URL
    : process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app',

  // API 客戶端類別
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    console.log(`🌐 API 請求: ${config.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);
      console.log(`📡 API 回應狀態: ${response.status}`);

      let data;
      let responseText;
      try {
        // 🔥 修復：檢查回應是否有內容
        responseText = await response.text();
        console.log(`📄 原始回應內容: "${responseText}"`);
        
        if (responseText) {
          data = JSON.parse(responseText);
        } else {
          // 🔥 空回應處理 - DELETE 操作通常回傳空內容
          data = response.ok ? { success: true, message: '操作成功' } : { error: '操作失敗' };
          console.log('ℹ️ 空回應，使用預設數據:', data);
        }
      } catch (jsonError) {
        console.error('❌ JSON 解析錯誤:', jsonError);
        console.error('❌ 原始回應:', responseText);
        data = { error: '無法解析回應資料', rawResponse: responseText };
      }

      const result = {
        success: response.ok,
        status: response.status,
        data: data
      };

      console.log('✅ API 結果:', result);
      return result;
    } catch (error) {
      console.error('❌ API 請求錯誤:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  },

  // HTTP 方法
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async delete(endpoint, options = {}) {
    const config = {
      method: 'DELETE'
    };
    
    // 🔥 修復：處理 DELETE 請求的 data 參數
    if (options.data) {
      config.body = JSON.stringify(options.data);
    }
    
    return this.request(endpoint, config);
  },

  // 通知相關 API - 根據後端 DTO 更新
  async getNotifications(queryParams = {}) {
    const params = new URLSearchParams();

    // 根據 NotificationQueryDto 設置查詢參數
    if (queryParams.search) params.append('search', queryParams.search);
    if (queryParams.category) params.append('category', queryParams.category);
    if (queryParams.emailStatus) params.append('emailStatus', queryParams.emailStatus);
    if (queryParams.channel) params.append('channel', queryParams.channel);
    if (queryParams.startDate) params.append('startDate', queryParams.startDate);
    if (queryParams.endDate) params.append('endDate', queryParams.endDate);
    if (queryParams.scheduledStartDate) params.append('scheduledStartDate', queryParams.scheduledStartDate);
    if (queryParams.scheduledEndDate) params.append('scheduledEndDate', queryParams.scheduledEndDate);

    // 分頁參數
    params.append('page', queryParams.page || 1);
    params.append('itemsPerPage', queryParams.itemsPerPage || 10);
    params.append('sortBy', queryParams.sortBy || 'CreatedAt');
    params.append('sortDirection', queryParams.sortDirection || 'desc');

    const queryString = params.toString();
    const endpoint = queryString ? `/api/notifications?${queryString}` : '/api/notifications';

    const response = await this.get(endpoint);

    console.log('🔍 API 回應詳情:', response);

    // 處理不同可能的回應格式
    let notifications = [];
    let totalCount = 0;
    let currentPage = 1;
    let totalPages = 1;
    let itemsPerPage = 10;

    if (response.success) {
      // 情況1: 標準 ApiResponseDto 格式
      if (response.data?.success) {
        notifications = response.data.data || [];
        totalCount = response.data.totalCount || 0;
        currentPage = response.data.currentPage || 1;
        totalPages = response.data.totalPages || 1;
        itemsPerPage = response.data.itemsPerPage || 10;
      }
      // 情況2: PagedResponseDto 格式
      else if (response.data && typeof response.data === 'object' && response.data.data) {
        notifications = response.data.data || [];
        totalCount = response.data.totalCount || 0;
        currentPage = response.data.currentPage || 1;
        totalPages = response.data.totalPages || 1;
        itemsPerPage = response.data.itemsPerPage || 10;
      }
      // 情況3: 直接回傳陣列
      else if (Array.isArray(response.data)) {
        notifications = response.data;
        totalCount = response.data.length;
      }
      // 情況4: 回應內容本身就是資料
      else if (response.data) {
        notifications = Array.isArray(response.data) ? response.data : [];
      }

      console.log(`📊 處理後的資料: ${notifications.length} 個通知`);

      return {
        success: true,
        data: notifications,
        message: response.data?.message || '載入成功',
        totalCount,
        currentPage,
        totalPages,
        itemsPerPage
      };
    }

    return {
      success: false,
      data: [],
      message: response.data?.message || response.error || '載入通知失敗',
      error: response.error
    };
  },

  async getNotificationById(id) {
    const response = await this.get(`/api/notifications/${id}`);

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }

    return {
      success: false,
      message: response.data?.message || response.error || '載入通知詳情失敗',
      error: response.error
    };
  },

  async createNotification(notificationDto) {
    // 根據 CreateNotificationDto 格式化請求資料
    const createDto = {
      memberId: notificationDto.memberId || null,
      sellerId: notificationDto.sellerId || null,
      emailAddress: notificationDto.emailAddress || '',
      category: notificationDto.category || 'general',
      emailStatus: notificationDto.emailStatus || 'pending',
      channel: notificationDto.channel || 'email',
      message: notificationDto.message || notificationDto.content || '',
      sentAt: notificationDto.sentAt || null,
      scheduledAt: notificationDto.scheduledAt || null,
      targetType: notificationDto.targetType || null,
      specificAccount: notificationDto.specificAccount || null
    };

    const response = await this.post('/api/notifications', createDto);

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || '通知建立成功'
      };
    }

    return {
      success: false,
      message: response.data?.message || response.error || '建立通知失敗',
      error: response.error,
      errors: response.data?.errors
    };
  },

  async updateNotification(id, notificationDto) {
    // 根據 UpdateNotificationDto 格式化請求資料
    const updateDto = {
      memberId: notificationDto.memberId,
      sellerId: notificationDto.sellerId,
      emailAddress: notificationDto.emailAddress,
      category: notificationDto.category,
      emailStatus: notificationDto.emailStatus,
      channel: notificationDto.channel,
      message: notificationDto.message || notificationDto.content,
      sentAt: notificationDto.sentAt,
      scheduledAt: notificationDto.scheduledAt
    };

    const response = await this.put(`/api/notifications/${id}`, updateDto);

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || '通知更新成功'
      };
    }

    return {
      success: false,
      message: response.data?.message || response.error || '更新通知失敗',
      error: response.error,
      errors: response.data?.errors
    };
  },

  async deleteNotification(id) {
    const response = await this.delete(`/api/notifications/${id}`);

    if (response.success && response.data?.success) {
      return {
        success: true,
        message: response.data.message || '通知刪除成功'
      };
    }

    return {
      success: false,
      message: response.data?.message || response.error || '刪除通知失敗',
      error: response.error
    };
  },

  async batchDeleteNotifications(ids) {
    const response = await this.post('/api/notifications/batch-delete', { ids });

    if (response.success && response.data?.success) {
      return {
        success: true,
        message: response.data.message || '批量刪除成功'
      };
    }

    return {
      success: false,
      message: response.data?.message || response.error || '批量刪除失敗',
      error: response.error
    };
  },

  async acknowledgeNotification(id) {
    // 根據後端 DTO，標記已讀可能是更新 EmailStatus
    const response = await this.put(`/api/notifications/${id}/acknowledge`, {
      emailStatus: 'delivered',
      acknowledgedAt: new Date().toISOString()
    });

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || '已標記為已讀'
      };
    }

    return {
      success: false,
      message: response.data?.message || response.error || '標記已讀失敗',
      error: response.error
    };
  },

  async getNotificationStats() {
    try {
      const response = await this.get('/api/notifications/stats');
      console.log('📊 統計資料 API 回應:', response);

      if (response.success && response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }

      // 如果 API 存在但格式不正確
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: '統計資料載入成功'
        };
      }

    } catch (error) {
      console.warn('⚠️ 統計資料 API 不可用:', error);
    }

    // 回傳預設值，不報錯
    return {
      success: false,
      data: {
        totalCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        todayCount: 0,
        scheduledCount: 0,
        successRate: 0,
        categoryStats: {},
        statusStats: {},
        channelStats: {}
      },
      message: '統計資料 API 不可用，使用預設值',
      error: null
    };
  },

  async createBulkNotification(bulkDto) {
    // 根據 CreateBulkNotificationDto
    const response = await this.post('/api/notifications/bulk', bulkDto);

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || '批量通知建立成功'
      };
    }

    return {
      success: false,
      message: response.data?.message || response.error || '批量通知建立失敗',
      error: response.error,
      errors: response.data?.errors
    };
  },

  // 格式化價格
  formatPrice(price) {
    if (typeof price === 'string') {
      return price
    }
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(price).replace('NT$', 'NT$ ')
  },

  // 格式化日期
  formatDate(date) {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date))
  },

  // 圖片載入錯誤處理
  handleImageError(event, fallbackSrc = '/images/placeholder.png') {
    event.target.src = fallbackSrc
    event.target.onerror = null // 防止無限循環
  },

  // 產品 API
  products: productApi
}

// 註冊全局上傳方法
app.config.globalProperties.$upload = {
  // 上傳頭像
  avatar: (file, options = {}) => uploadService.uploadFile(file, 'avatar', options),

  // 上傳商品圖片
  product: (file, options = {}) => uploadService.uploadFile(file, 'product', options),

  // 上傳廣告圖片
  banner: (file, options = {}) => uploadService.uploadFile(file, 'banner', options),

  // 上傳分類圖片
  category: (file, options = {}) => uploadService.uploadFile(file, 'category', options),

  // 通用上傳方法
  upload: (file, type, options = {}) => uploadService.uploadFile(file, type, options),

  // 批次上傳
  multiple: (files, type, options = {}) => uploadService.uploadMultiple(files, type, options),

  // 刪除檔案
  delete: (filename, type) => uploadService.deleteFile(filename, type),

  // 取得縮圖
  thumbnail: (url, size) => uploadService.getThumbnailUrl(url, size),

  // 格式化檔案大小
  formatSize: (bytes) => uploadService.formatFileSize(bytes)
}

// 註冊簡化的全域上傳方法
app.config.globalProperties.$uploadFile = (file, type = 'product', options = {}) => {
  return uploadService.uploadFile(file, type, options)
}

// 全域錯誤處理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 錯誤:', err)
  console.error('錯誤資訊:', info)

  // 在生產環境中可以發送錯誤報告到服務器
  if (process.env.NODE_ENV === 'production') {
    // 發送錯誤報告
    // sendErrorReport(err, info)
  }
}

// 全域組件註冊
app.component('ProductCard', {
  props: ['product'],
  template: `
    <div class="product-item">
      <div class="product-image-placeholder">
        <span>{{ product.image || '商品圖片' }}</span>
      </div>
      <div class="product-content p-3">
        <h5 class="text-uppercase fs-6">
          <router-link :to="'/product/' + product.id" class="text-decoration-none text-dark">
            {{ product.name }}
          </router-link>
        </h5>
        <p class="text-muted mb-2">{{ product.description }}</p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="h6 mb-0">{{ $api.formatPrice(product.price) }}</span>
          <button class="btn btn-sm btn-outline-dark" @click="$emit('add-to-cart', product)">
            加入購物車
          </button>
        </div>
      </div>
    </div>
  `,
  emits: ['add-to-cart']
})

// 配置 SweetAlert2
app.config.globalProperties.$swal = Swal

// 使用插件
app.use(router)
app.use(NoticePlugin)
app.use(EventBusPlugin)
app.use(ToastPlugin)

// 掛載應用
app.mount('#app')

// 全域事件處理
window.addEventListener('unhandledrejection', event => {
  console.error('未處理的 Promise 拒絕:', event.reason)
  event.preventDefault()
})

// 檢查瀏覽器支援
if (!window.fetch) {
  console.warn('瀏覽器不支援 fetch API，請考慮使用 polyfill')
}

// PWA 支援檢查
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW 註冊成功:', registration)
      })
      .catch(registrationError => {
        console.log('SW 註冊失敗:', registrationError)
      })
  })
}

export default app
<template>
  <div class="cart-debug-container">
    <h2>🛒 購物車調試工具</h2>
    
    <div class="debug-section">
      <h3>📱 當前狀態</h3>
      <div class="status-grid">
        <div class="status-item" :class="{ 'success': isLoggedIn, 'error': !isLoggedIn }">
          <strong>登入狀態:</strong> {{ isLoggedIn ? '✅ 已登入' : '❌ 未登入' }}
        </div>
        <div class="status-item" :class="{ 'success': apiConnected, 'error': !apiConnected }">
          <strong>API 連接:</strong> {{ apiConnected ? '✅ 已連接' : '❌ 未連接' }}
        </div>
        <div class="status-item">
          <strong>購物車項目:</strong> {{ cartItems.length }} 件
        </div>
        <div class="status-item">
          <strong>總金額:</strong> NT$ {{ cartSummary.total || 0 }}
        </div>
      </div>
    </div>

    <div class="debug-section">
      <h3>🔧 調試操作</h3>
      <div class="action-buttons">
        <button @click="testLogin" class="btn btn-primary">測試登入</button>
        <button @click="loadCartData" class="btn btn-secondary" :disabled="loading">
          {{ loading ? '載入中...' : '重新載入購物車' }}
        </button>
        <button @click="showDebugInfo" class="btn btn-info">顯示調試信息</button>
        <button @click="clearDebugLog" class="btn btn-warning">清除日誌</button>
      </div>
    </div>

    <div class="debug-section" v-if="debugLogs.length > 0">
      <h3>📝 調試日誌</h3>
      <div class="debug-log">
        <div 
          v-for="(log, index) in debugLogs" 
          :key="index" 
          class="log-entry"
          :class="log.type"
        >
          <small class="log-time">{{ log.time }}</small>
          <strong class="log-level">{{ log.level }}:</strong>
          <span class="log-message">{{ log.message }}</span>
          <pre v-if="log.data" class="log-data">{{ JSON.stringify(log.data, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div class="debug-section" v-if="cartItems.length > 0">
      <h3>🛍️ 購物車內容</h3>
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id || item.itemId" class="cart-item">
          <h4>{{ item.productName || 'Unknown Product' }}</h4>
          <p>數量: {{ item.quantity || 0 }}</p>
          <p>價格: NT$ {{ item.price || item.priceAtAdded || 0 }}</p>
          <details>
            <summary>詳細信息</summary>
            <pre>{{ JSON.stringify(item, null, 2) }}</pre>
          </details>
        </div>
      </div>
    </div>

    <div class="debug-section" v-if="error">
      <h3>❌ 錯誤信息</h3>
      <div class="error-message">
        <strong>錯誤:</strong> {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { useCart } from '@/composables/useCart'
import { ref, onMounted } from 'vue'

export default {
  name: 'CartDebugComponent',
  setup() {
    const {
      cartItems,
      cartSummary,
      loading,
      error,
      isLoggedIn,
      apiConnected,
      loadCartData: originalLoadCartData,
      getCartMemberId,
      checkCartLoginStatus
    } = useCart()

    const debugLogs = ref([])

    const addDebugLog = (level, message, data = null) => {
      debugLogs.value.push({
        time: new Date().toLocaleTimeString(),
        level,
        message,
        data,
        type: level.toLowerCase()
      })
      
      // 同時輸出到控制台
      console[level.toLowerCase() === 'error' ? 'error' : 'log'](`[CartDebug] ${message}`, data)
      
      // 保持最新的 50 條日誌
      if (debugLogs.value.length > 50) {
        debugLogs.value.shift()
      }
    }

    const testLogin = () => {
      addDebugLog('INFO', '開始測試登入狀態檢查')
      
      const loginStatus = checkCartLoginStatus()
      const memberId = getCartMemberId()
      
      const loginData = {
        isLoggedIn: loginStatus,
        memberId: memberId,
        localStorage: {
          memberId: localStorage.getItem('memberId'),
          authToken: localStorage.getItem('authToken') ? '***有值***' : null,
          currentUser: localStorage.getItem('currentUser') ? '***有值***' : null
        }
      }
      
      addDebugLog(loginStatus ? 'SUCCESS' : 'ERROR', '登入狀態檢查完成', loginData)
      
      if (!loginStatus) {
        addDebugLog('WARNING', '未登入，嘗試設置測試登入狀態')
        localStorage.setItem('memberId', '123')
        localStorage.setItem('authToken', 'test-token')
        localStorage.setItem('currentUser', JSON.stringify({ id: 123, name: 'Test User' }))
        addDebugLog('INFO', '已設置測試登入狀態，請重新檢查')
      }
    }

    const loadCartData = async () => {
      addDebugLog('INFO', '開始載入購物車資料')
      
      try {
        await originalLoadCartData()
        addDebugLog('SUCCESS', '購物車資料載入完成', {
          itemsCount: cartItems.value.length,
          summary: cartSummary.value,
          apiConnected: apiConnected.value
        })
      } catch (err) {
        addDebugLog('ERROR', '載入購物車資料失敗', err)
      }
    }

    const showDebugInfo = () => {
      const debugInfo = {
        environment: process.env.NODE_ENV,
        apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
        cartState: {
          items: cartItems.value.length,
          summary: cartSummary.value,
          loading: loading.value,
          error: error.value,
          isLoggedIn: isLoggedIn.value,
          apiConnected: apiConnected.value
        },
        localStorage: Object.keys(localStorage).reduce((acc, key) => {
          const value = localStorage.getItem(key)
          acc[key] = value && value.length > 100 ? `${value.substring(0, 100)}...` : value
          return acc
        }, {}),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
      
      addDebugLog('INFO', '系統調試信息', debugInfo)
    }

    const clearDebugLog = () => {
      debugLogs.value = []
    }

    onMounted(() => {
      addDebugLog('INFO', 'CartDebug 組件已掛載')
      showDebugInfo()
    })

    return {
      cartItems,
      cartSummary,
      loading,
      error,
      isLoggedIn,
      apiConnected,
      debugLogs,
      testLogin,
      loadCartData,
      showDebugInfo,
      clearDebugLog
    }
  }
}
</script>

<style scoped>
.cart-debug-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.debug-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.status-item {
  padding: 10px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #ccc;
}

.status-item.success {
  border-left-color: #28a745;
  background-color: #d4edda;
}

.status-item.error {
  border-left-color: #dc3545;
  background-color: #f8d7da;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-info { background: #17a2b8; color: white; }
.btn-warning { background: #ffc107; color: black; }

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.debug-log {
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.log-entry {
  margin: 5px 0;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #ccc;
}

.log-entry.info { border-left-color: #17a2b8; background: #d1ecf1; }
.log-entry.success { border-left-color: #28a745; background: #d4edda; }
.log-entry.warning { border-left-color: #ffc107; background: #fff3cd; }
.log-entry.error { border-left-color: #dc3545; background: #f8d7da; }

.log-time {
  color: #666;
  font-size: 12px;
}

.log-level {
  color: #333;
  margin: 0 5px;
}

.log-message {
  color: #333;
}

.log-data {
  margin: 5px 0 0 0;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 3px;
  font-size: 12px;
  overflow-x: auto;
}

.cart-items {
  display: grid;
  gap: 15px;
}

.cart-item {
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.cart-item h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.cart-item p {
  margin: 5px 0;
  color: #666;
}

.cart-item details {
  margin-top: 10px;
}

.cart-item summary {
  cursor: pointer;
  color: #007bff;
}

.cart-item pre {
  margin: 10px 0 0 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.error-message {
  padding: 15px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
}

@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>

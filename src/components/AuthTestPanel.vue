<template>
  <div class="auth-test-panel">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-user-circle me-2"></i>
          用戶身份切換測試
        </h5>
      </div>
      <div class="card-body">
        <!-- 當前用戶狀態 -->
        <div v-if="currentUser" class="current-user-info mb-4">
          <div class="alert alert-success">
            <div class="d-flex align-items-center">
              <img :src="currentUser.avatar" :alt="currentUser.username" class="rounded-circle me-3" width="40" height="40">
              <div>
                <div class="fw-bold">{{ currentUser.username }}</div>
                <small class="text-muted">
                  {{ currentUser.userType === 'member' ? '會員' : '賣家' }} | {{ currentUser.email }}
                  <span v-if="currentUser.userType === 'seller'" class="ms-2">
                    <i class="fas fa-star text-warning"></i> {{ currentUser.rating }}
                  </span>
                  <span v-if="currentUser.userType === 'member'" class="ms-2">
                    <i class="fas fa-gem text-primary"></i> {{ currentUser.membershipLevel }}
                  </span>
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速登入按鈕 -->
        <div v-else class="quick-login-section">
          <h6 class="mb-3">快速登入測試用戶:</h6>
          <div class="row g-2">
            <div class="col-6">
              <button 
                @click="quickLogin('member', 123)"
                class="btn btn-outline-primary w-100"
                :disabled="loading"
              >
                <i class="fas fa-shopping-bag me-2"></i>
                買家小明<br>
                <small>會員 (金卡)</small>
              </button>
            </div>
            <div class="col-6">
              <button 
                @click="quickLogin('member', 124)"
                class="btn btn-outline-primary w-100"
                :disabled="loading"
              >
                <i class="fas fa-crown me-2"></i>
                時尚達人<br>
                <small>會員 (白金)</small>
              </button>
            </div>
            <div class="col-6">
              <button 
                @click="quickLogin('seller', 456)"
                class="btn btn-outline-success w-100"
                :disabled="loading"
              >
                <i class="fas fa-store me-2"></i>
                時尚小店<br>
                <small>賣家 (⭐4.8)</small>
              </button>
            </div>
            <div class="col-6">
              <button 
                @click="quickLogin('seller', 789)"
                class="btn btn-outline-success w-100"
                :disabled="loading"
              >
                <i class="fas fa-tshirt me-2"></i>
                韓風服飾<br>
                <small>賣家 (⭐4.6)</small>
              </button>
            </div>
          </div>

          <div class="mt-3">
            <small class="text-muted">
              <i class="fas fa-info-circle me-1"></i>
              點擊上方按鈕快速切換不同身份進行測試
            </small>
          </div>
        </div>

        <!-- 登出按鈕 -->
        <div v-if="currentUser" class="logout-section">
          <button 
            @click="logout"
            class="btn btn-outline-danger"
            :disabled="loading"
          >
            <i class="fas fa-sign-out-alt me-2"></i>
            登出
          </button>
        </div>

        <!-- 手動登入表單 -->
        <div v-if="!currentUser" class="manual-login-section mt-4">
          <hr>
          <h6 class="mb-3">或手動輸入登入資訊:</h6>
          <form @submit.prevent="manualLogin">
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                class="form-control" 
                id="email"
                v-model="loginForm.email"
                placeholder="輸入測試帳號 email"
                required
              >
              <div class="form-text">
                測試帳號: ming@example.com, shop@fashion.com 等
              </div>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">密碼</label>
              <input 
                type="password" 
                class="form-control" 
                id="password"
                v-model="loginForm.password"
                placeholder="任意密碼 (測試環境)"
                required
              >
            </div>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="loading"
            >
              <i class="fas fa-sign-in-alt me-2"></i>
              登入
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  name: 'AuthTestPanel',
  data() {
    return {
      currentUser: null,
      loading: false,
      loginForm: {
        email: '',
        password: ''
      }
    }
  },
  mounted() {
    this.checkAuthStatus()
  },
  methods: {
    // 檢查認證狀態
    checkAuthStatus() {
      this.currentUser = authService.getCurrentUser()
    },

    // 快速登入
    async quickLogin(userType, userId) {
      this.loading = true
      
      try {
        const user = await authService.quickLogin(userType, userId)
        this.currentUser = user
        
        // 觸發全局事件通知其他組件
        this.$eventBus?.emit('userAuthenticated', user)
        
        this.$emit('authChanged', user)
        
        // 顯示成功訊息
        this.showMessage(`已登入為 ${user.username} (${user.userType === 'member' ? '會員' : '賣家'})`, 'success')
        
      } catch (error) {
        console.error('快速登入失敗:', error)
        this.showMessage('登入失敗: ' + error.message, 'error')
      } finally {
        this.loading = false
      }
    },

    // 手動登入
    async manualLogin() {
      this.loading = true
      
      try {
        const user = await authService.login(this.loginForm)
        this.currentUser = user
        
        // 觸發全局事件
        this.$eventBus?.emit('userAuthenticated', user)
        this.$emit('authChanged', user)
        
        // 清空表單
        this.loginForm = { email: '', password: '' }
        
        this.showMessage(`歡迎回來，${user.username}！`, 'success')
        
      } catch (error) {
        console.error('登入失敗:', error)
        this.showMessage('登入失敗: ' + error.message, 'error')
      } finally {
        this.loading = false
      }
    },

    // 登出
    logout() {
      this.loading = true
      
      try {
        authService.logout()
        this.currentUser = null
        
        // 觸發全局事件
        this.$eventBus?.emit('userLoggedOut')
        this.$emit('authChanged', null)
        
        this.showMessage('已成功登出', 'info')
        
      } catch (error) {
        console.error('登出失敗:', error)
        this.showMessage('登出失敗', 'error')
      } finally {
        this.loading = false
      }
    },

    // 顯示訊息
    showMessage(message, type = 'info') {
      // 這裡可以整合您的通知系統
      if (type === 'error') {
        alert('❌ ' + message)
      } else if (type === 'success') {
        alert('✅ ' + message)
      } else {
        alert('ℹ️ ' + message)
      }
    }
  }
}
</script>

<style scoped>
.auth-test-panel {
  max-width: 500px;
  margin: 0 auto;
}

.current-user-info img {
  object-fit: cover;
}

.btn:disabled {
  opacity: 0.6;
}

.quick-login-section .btn {
  height: 60px;
  font-size: 0.9rem;
}

.manual-login-section {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
}
</style>

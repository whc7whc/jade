<template>
  <div class="jcoins-page">
    <!-- 頁面標題區 -->
    <div class="container my-4">
      <div class="row">
        <div class="col-12">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <router-link to="/" class="text-decoration-none">首頁</router-link>
              </li>
              <li class="breadcrumb-item">
                <router-link to="/member/basic-info" class="text-decoration-none">會員中心</router-link>
              </li>
              <li class="breadcrumb-item active">J-Coins</li>
            </ol>
          </nav>
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h2 mb-0">
              <i class="fas fa-coins me-2 text-warning"></i>J-Coins 管理
            </h1>
            <button 
              @click="refreshData" 
              class="btn btn-outline-primary" 
              :disabled="loading || refreshing"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshing }"></i>
              {{ refreshing ? '載入中...' : '重新整理' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 需要登入提示 -->
    <div v-if="!memberId && !isSellerUser" class="container">
      <div class="alert alert-warning text-center">
        <i class="fas fa-sign-in-alt me-2"></i>
        請先登入會員帳號才能查看 J Coin
        <div class="mt-3">
          <router-link to="/login" class="btn btn-primary">前往登入</router-link>
        </div>
      </div>
    </div>

    <!-- 賣家用戶提示 -->
    <div v-if="!memberId && isSellerUser" class="container">
      <div class="alert alert-info text-center">
        <i class="fas fa-store me-2"></i>
        您目前是賣家身份
        <div class="mt-2">
          <p class="mb-3">J Coin 點數功能僅供會員使用。如果您也是會員，請確認：</p>
          <ul class="list-unstyled">
            <li><i class="fas fa-check text-success me-2"></i>您的帳號已綁定會員資料</li>
            <li><i class="fas fa-check text-success me-2"></i>localStorage 中存在 memberId</li>
            <li><i class="fas fa-check text-success me-2"></i>或 currentUser 包含有效的會員 ID</li>
          </ul>
          <div class="mt-3">
            <button @click="checkUserData" class="btn btn-outline-primary me-2">
              <i class="fas fa-search me-1"></i>檢查用戶資料
            </button>
            <router-link to="/member/basic-info" class="btn btn-primary">
              <i class="fas fa-user me-1"></i>會員中心
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要內容 -->
    <div v-else>
  <!-- 已移除會員ID/用戶類型顯示 -->

      <!-- J-Coins 餘額卡片 -->
      <div class="container mb-4">
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="card jcoins-card h-100">
              <div class="card-body text-center">
                <div class="jcoins-icon mb-3">
                  <i class="fas fa-coins fa-3x text-warning"></i>
                </div>
                <h5 class="card-title">當前餘額</h5>
                <div v-if="balanceLoading" class="balance-display">
                  <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">載入中...</span>
                  </div>
                </div>
                <div v-else-if="balanceError" class="balance-display text-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  載入失敗
                  <div class="mt-2">
                    <button @click="loadBalance" class="btn btn-outline-danger btn-sm">
                      重試
                    </button>
                  </div>
                </div>
                <div v-else class="balance-display text-warning">
                  <span class="balance-number">{{ formatBalance(balance) }}</span>
                  <span class="balance-unit">J-Coins</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 簽到功能卡片 -->
          <div class="col-md-8 mb-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="card-title mb-0">
                  <i class="fas fa-calendar-check me-2"></i>每日簽到
                </h6>
                <!-- 離線模式標示 -->
                <span v-if="offlineMode" class="badge bg-warning text-dark">
                  <i class="fas fa-wifi-slash me-1"></i>離線模式
                </span>
              </div>
              <div class="card-body d-flex flex-column align-items-center justify-content-center">
                <button 
                  class="btn px-4 py-2" 
                  :class="signedToday ? 'btn-secondary' : 'btn-success'"
                  :disabled="loading || signedToday" 
                  @click="handleCheckin"
                >
                  <i class="fas me-2" :class="signedToday ? 'fa-check-circle' : 'fa-calendar-plus'"></i>
                  {{ signedToday ? '今日已簽到' : '簽到領取J幣' }}
                </button>
                
                <!-- 簽到資訊 -->
                <div class="mt-3 text-center">
                  <div v-if="signedToday" class="text-success">
                    <i class="fas fa-gift me-1"></i>已領取 {{ todayReward }} J幣
                  </div>
                  <div v-else class="text-primary">
                    <i class="fas fa-coins me-1"></i>今日可領取 {{ todayReward }} J幣
                  </div>
                  
                  <!-- 連續簽到天數 -->
                  <div class="mt-2 small text-muted">
                    <i class="fas fa-fire me-1 text-orange"></i>
                    連續簽到 {{ checkinStreak }} 天
                  </div>
                  
                  <!-- 離線模式提示 -->
                  <div v-if="offlineMode" class="mt-2 small text-warning">
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    資料以後端為準
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 篩選控制 -->
      <!-- 篩選與明細合併 -->
      <div class="container mb-4" ref="historySection">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="card-title mb-0">
              <i class="fas fa-filter me-2"></i>點數記錄篩選與明細
            </h6>
            <small class="text-muted">共 {{ pagination.total }} 筆記錄</small>
          </div>
          <div class="card-body">
            <div class="row g-3 mb-3">
              <div class="col-md-3">
                <label class="form-label small">類型篩選</label>
                <select class="form-select form-select-sm" v-model="filters.type" @change="handleFilterChange" :disabled="loading">
                  <option value="">全部類型</option>
                  <option value="signin">簽到獲得</option>
                  <option value="earned">活動獲得</option>
                  <option value="used">購物使用</option>
                  <option value="refund">退款回補</option>
                  <option value="expired">點數過期</option>
                  <option value="adjustment">人工調整</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small">開始日期</label>
                <input type="date" class="form-control form-control-sm" v-model="filters.startDate" @change="handleFilterChange" :disabled="loading">
              </div>
              <div class="col-md-3">
                <label class="form-label small">結束日期</label>
                <input type="date" class="form-control form-control-sm" v-model="filters.endDate" @change="handleFilterChange" :disabled="loading">
              </div>
              <div class="col-md-3 d-flex align-items-end">
                <button class="btn btn-outline-secondary btn-sm w-100" @click="clearFilters" :disabled="loading">
                  <i class="fas fa-times me-1"></i>清除篩選
                </button>
              </div>
            </div>
            <!-- 點數記錄明細表格直接放這裡 -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">載入中...</span>
              </div>
              <div class="text-muted">載入點數記錄中...</div>
            </div>
            <div v-else-if="error" class="alert alert-danger">
              <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
              <div class="mt-2">
                <button @click="loadHistory" class="btn btn-outline-danger btn-sm">
                  <i class="fas fa-redo me-1"></i>重試
                </button>
              </div>
            </div>
            <div v-else>
              <div v-if="history.length === 0" class="card">
                <div class="card-body text-center py-5">
                  <i class="fas fa-history fa-4x text-muted mb-3"></i>
                  <h5 class="text-muted mb-2">{{ getEmptyMessage() }}</h5>
                  <p class="text-muted">開始使用 J Coin 來記錄您的點數變化</p>
                </div>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th scope="col">類型</th>
                      <th scope="col">描述</th>
                      <th scope="col">金額</th>
                      <th scope="col">餘額</th>
                      <th scope="col">時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in history" :key="item.id" class="history-row">
                      <td>
                        <span class="badge" :class="getTypeBadgeClass(item.type)">
                          <i :class="getTypeInfo(item.type).icon + ' me-1'"></i>
                          {{ getTypeInfo(item.type).text }}
                        </span>
                      </td>
                      <td>{{ item.reason || '無描述' }}</td>
                      <td>
                        <span class="fw-bold" :class="getAmountClass(item.type)">
                          {{ formatAmount(item.amount, item.type) }}
                        </span>
                      </td>
                      <td>
                        <span class="text-muted">{{ formatBalance(item.balanceAfter) }}</span>
                      </td>
                      <td>
                        <span class="text-muted small">{{ formatDate(item.createdAt) }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 載入中狀態 -->
  <!-- 已移除重複的點數記錄明細區塊 -->
        <!-- 分頁器 -->
        <nav v-if="pagination.total > pagination.pageSize" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
              <button class="page-link" @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1 || loading">
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>
            <li v-for="page in getPageNumbers()" :key="page" class="page-item" :class="{ active: page === pagination.page }">
              <button class="page-link" @click="changePage(page)" :disabled="loading">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.page >= totalPages }">
              <button class="page-link" @click="changePage(pagination.page + 1)" :disabled="pagination.page >= totalPages || loading">
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
          <div class="text-center text-muted small mt-2">
            第 {{ pagination.page }} 頁 / 共 {{ totalPages }} 頁 ({{ pagination.total }} 筆記錄)
          </div>
        </nav>
  <!-- 結尾標籤已移除，修正結構 -->
    </div>
  </div>
</template>

<script>
import jcoinService from '@/services/jcoinService'
import userIdentityService from '@/services/userIdentityService'

export default {
  name: 'JCoinsView',
  data() {
    return {
      memberId: null,
      isSellerUser: false,
      balance: 0,
      history: [],
      loading: false,
      balanceLoading: false,
      refreshing: false,
      error: null,
      balanceError: null,
      filters: {
        type: '',
        startDate: '',
        endDate: ''
      },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      signedToday: false,
      todayReward: 1,  // 預設第1天獎勵1個J幣
      checkinStreak: 1,
      offlineMode: false  // 新增：標記是否為離線模式
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.pagination.total / this.pagination.pageSize)
    }
  },
  async mounted() {
    console.log('JCoinsView - 開始初始化...')
    
    // 檢查用戶身份
    this.checkUserStatus()
    if (this.memberId) {
      await this.loadData()
      await this.checkCheckinStatus()
    } else {
      console.log('JCoinsView - 沒有會員 ID，顯示適當提示')
    }
  },
  methods: {
    async checkCheckinStatus() {
      // 檢查今日是否已簽到，優先使用後端 API，失敗時降級到本地模式
      try {
        console.log('🔍 檢查簽到狀態...')
        
        // 優先嘗試後端 API
        try {
          const info = await jcoinService.getCheckinInfo(this.memberId)
          console.log('✅ 後端 API 獲取簽到資訊成功:', info)
          
          // 使用後端回應更新狀態
          this.signedToday = info.signedToday
          this.checkinStreak = info.checkinStreak
          this.todayReward = info.todayReward
          this.offlineMode = false
          
          // 更新本地快取
          const today = info.today || new Date().toISOString().split('T')[0]
          this.updateLocalCache(today, info.signedToday, info.checkinStreak, info.todayReward)
          
          return
        } catch (apiError) {
          console.log('⚠️ 後端 API 不可用，切換至離線模式:', apiError.message)
          this.offlineMode = true
        }

        // 降級到本地模式
        await this.checkCheckinStatusOffline()
        
      } catch (error) {
        console.error('❌ 檢查簽到狀態失敗:', error)
        // 設置默認值
        this.signedToday = false
        this.checkinStreak = 1
        this.todayReward = 1  // 預設第1天獎勵1個J幣
        this.offlineMode = true
      }
    },

    async checkCheckinStatusOffline() {
      console.log('🔧 使用離線模式檢查簽到狀態')
      
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      
      // 使用新的 localStorage 快取鍵格式
      const lastDateKey = `checkin:lastDate:${this.memberId}`
      const streakKey = `checkin:streak:${this.memberId}`
      const todayRewardKey = `checkin:todayReward:${this.memberId}:${today}`
      
      // 檢查今日是否已簽到
      const lastDate = localStorage.getItem(lastDateKey)
      
      if (lastDate === today) {
        // 今天已簽到
        this.signedToday = true
        this.checkinStreak = parseInt(localStorage.getItem(streakKey) || '1')
        this.todayReward = parseFloat(localStorage.getItem(todayRewardKey) || '1')  // 預設1個J幣
      } else {
        // 今天未簽到
        this.signedToday = false
        
        // 計算連續天數
        if (lastDate) {
          const lastCheckinDate = new Date(lastDate)
          const todayDate = new Date(today)
          const diffTime = todayDate - lastCheckinDate
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays === 1) {
            // 昨天簽到，可以繼續連續
            this.checkinStreak = parseInt(localStorage.getItem(streakKey) || '1')
          } else {
            // 間隔超過1天，重置連續天數
            this.checkinStreak = 1
          }
        } else {
          // 首次簽到
          this.checkinStreak = 1
        }
        
        // 計算今日獎勵
        this.calculateTodayReward()
      }
      
      console.log('📋 離線模式簽到狀態:', {
        signedToday: this.signedToday,
        checkinStreak: this.checkinStreak,
        todayReward: this.todayReward
      })
    },

    updateLocalCache(date, signed, streak, reward) {
      // 更新本地快取，使用新的鍵格式
      const lastDateKey = `checkin:lastDate:${this.memberId}`
      const streakKey = `checkin:streak:${this.memberId}`
      const todayRewardKey = `checkin:todayReward:${this.memberId}:${date}`
      
      if (signed) {
        localStorage.setItem(lastDateKey, date)
        localStorage.setItem(streakKey, streak.toString())
      }
      localStorage.setItem(todayRewardKey, reward.toString())
      
      console.log('💾 更新本地快取:', { date, signed, streak, reward })
    },

    calculateTodayReward() {
      // 計算今日簽到獎勵：第1-6天對應1-6個J幣，第7天給10個J幣，然後重複循環
      const dayInCycle = ((this.checkinStreak - 1) % 7) + 1
      
      if (dayInCycle === 7) {
        this.todayReward = 10  // 第7天給10個J幣
      } else {
        this.todayReward = dayInCycle  // 第1-6天分別給1-6個J幣
      }
      
      console.log(`第${this.checkinStreak}天簽到，週期內第${dayInCycle}天，獎勵: ${this.todayReward} J幣`)
    },

    async handleCheckin() {
      if (this.signedToday) {
        this.$swal.fire({
          title: '已簽到',
          text: '今日已經簽到過了！',
          icon: 'info',
          confirmButtonText: '確定'
        })
        return
      }
      
      this.loading = true
      try {
        console.log('🎯 執行簽到...')
        
        // 優先嘗試後端 API
        try {
          const result = await jcoinService.checkin(this.memberId)
          console.log('✅ 後端簽到成功:', result)
          
          // 使用後端回應更新狀態
          this.signedToday = result.signedToday
          this.checkinStreak = result.checkinStreak
          this.todayReward = result.reward
          this.offlineMode = false
          
          // 更新餘額（後端已修復，直接使用回傳值）
          if (result.afterBalance !== undefined) {
            this.balance = result.afterBalance
          }
          
          // 更新本地快取
          const today = new Date().toISOString().split('T')[0]
          this.updateLocalCache(today, true, result.checkinStreak, result.reward)
          
          // 重新載入數據以確保同步
          await this.loadBalance()
          await this.loadHistory()
          
          // 顯示成功訊息（後端已修復，直接使用回傳值）
          this.$swal.fire({
            title: '簽到成功！',
            html: `
              <div class="text-center">
                <p class="mb-2">🎉 獲得 <strong>${result.reward} J幣</strong></p>
                <p class="mb-2">📅 連續第 <strong>${result.checkinStreak}</strong> 天</p>
                <p class="mb-0">💰 餘額：<strong>${result.afterBalance || this.balance} J幣</strong></p>
                ${result.verificationCode ? `<p class="small text-muted mt-2">驗證碼：${result.verificationCode}</p>` : ''}
              </div>
            `,
            icon: 'success',
            confirmButtonText: '太棒了！'
          })
          
          return
        } catch (apiError) {
          console.log('⚠️ 後端 API 不可用，切換至離線模式:', apiError.message)
          this.offlineMode = true
        }
        
        // 降級到離線模式簽到
        await this.handleCheckinOffline()
        
      } catch (error) {
        console.error('❌ 簽到失敗:', error)
        this.$swal.fire({
          title: '簽到失敗',
          text: '簽到過程中發生錯誤，請稍後再試',
          icon: 'error',
          confirmButtonText: '確定'
        })
      } finally {
        this.loading = false
      }
    },

    async handleCheckinOffline() {
      console.log('🔧 使用離線模式執行簽到')
      
      const today = new Date().toISOString().split('T')[0]
      
      // 更新狀態
      this.checkinStreak += 1
      this.signedToday = true
      this.calculateTodayReward()
      
      // 模擬增加餘額
      this.balance += this.todayReward
      
      // 更新本地快取
      this.updateLocalCache(today, true, this.checkinStreak, this.todayReward)
      
      // 模擬新增歷史記錄
      const newRecord = {
        id: Date.now(),
        type: 'signin',
        amount: this.todayReward,
        balanceAfter: this.balance,
        reason: `每日簽到獎勵 (第${this.checkinStreak}天) [離線模式]`,
        createdAt: new Date().toISOString()
      }
      
      // 將新記錄加到歷史前面
      this.history.unshift(newRecord)
      this.pagination.total += 1
      
      console.log('🔧 離線簽到完成:', {
        streak: this.checkinStreak,
        reward: this.todayReward,
        newBalance: this.balance
      })
      
      // 顯示離線模式成功訊息
      this.$swal.fire({
        title: '簽到成功（離線模式）',
        html: `
          <div class="text-center">
            <p class="mb-2">🎉 獲得 <strong>${this.todayReward} J幣</strong></p>
            <p class="mb-2">📅 連續第 <strong>${this.checkinStreak}</strong> 天</p>
            <p class="mb-2">💰 模擬餘額：<strong>${this.balance} J幣</strong></p>
            <div class="alert alert-warning mt-3 small">
              <i class="fas fa-exclamation-triangle me-1"></i>
              後端不可用，已採用本地簽到<br>
              實際資料以後端為準
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonText: '了解'
      })
    },
    checkUserStatus() {
      // 使用統一的身份服務檢查用戶狀態
      try {
        console.log('=== JCoinsView 用戶狀態檢查 ===')
        
        // 使用統一的身份服務
        const user = userIdentityService.getCurrentUser()
        this.memberId = userIdentityService.getMemberId()
        this.isSellerUser = userIdentityService.hasRole('seller')
        
        console.log('用戶資料:', user)
        console.log('會員 ID:', this.memberId)
        console.log('是否為賣家:', this.isSellerUser)
        console.log('可訪問會員功能:', userIdentityService.canAccessMemberFeatures())
        console.log('身份描述:', userIdentityService.getUserTypeDescription())
        
        // 如果開啟調試模式，顯示完整資訊
        if (process.env.NODE_ENV === 'development') {
          userIdentityService.debugUserInfo()
        }
        
        console.log('=== 最終狀態 ===')
        console.log('memberId:', this.memberId)
        console.log('isSellerUser:', this.isSellerUser)
        console.log('===============')
        
      } catch (error) {
        console.error('JCoinsView - 檢查用戶狀態失敗:', error)
        this.isSellerUser = false
        this.memberId = null
      }
    },

    checkUserData() {
      // 顯示當前用戶的詳細資料供調試
      console.log('=== JCoin 用戶資料檢查 ===')
      
      const currentUser = localStorage.getItem('currentUser')
      const memberId = localStorage.getItem('memberId')
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
      
      console.log('currentUser:', currentUser ? JSON.parse(currentUser) : null)
      console.log('memberId:', memberId)
      console.log('authToken:', authToken ? '存在' : '不存在')
      
      // 顯示提示
      const userInfo = currentUser ? JSON.parse(currentUser) : {}
      const message = `
用戶類型: ${userInfo.userType || '未知'}
用戶 ID: ${userInfo.userId || userInfo.id || '無'}
會員 ID: ${memberId || '無'}
認證狀態: ${authToken ? '已認證' : '未認證'}
      `
      
      alert('用戶資料檢查結果：\n' + message)
    },

    async loadData() {
      await Promise.all([this.loadBalance(), this.loadHistory()])
    },

    async loadBalance() {
      this.balanceLoading = true
      this.balanceError = null
      try {
        console.log('JCoinsView - 載入點數餘額...')
        const result = await jcoinService.getBalance()
        this.balance = result.balance || 0
        console.log('JCoinsView - 成功載入餘額:', this.balance)
      } catch (error) {
        console.error('JCoinsView - 載入餘額失敗:', error)
        this.balanceError = error.message || '載入餘額失敗'
      } finally {
        this.balanceLoading = false
      }
    },

    async loadHistory() {
      if (!this.memberId) return
      this.loading = true
      this.error = null
      try {
        console.log('JCoinsView - 載入點數記錄...')
        const result = await jcoinService.getHistory({
          type: this.filters.type,
          startDate: this.filters.startDate,
          endDate: this.filters.endDate,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        })
        this.history = result.items || []
        this.pagination.total = result.total || 0
        this.pagination.page = result.page || 1
        this.pagination.pageSize = result.pageSize || 20
        console.log('JCoinsView - 成功載入記錄:', this.history.length, '筆')
      } catch (error) {
        console.error('JCoinsView - 載入記錄失敗:', error)
        this.error = error.message || '載入點數記錄失敗'
        if (error.message.includes('無法獲取會員資訊') || error.message.includes('重新登入')) {
          this.memberId = null
        }
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    async handleFilterChange() {
      this.pagination.page = 1
      await this.loadHistory()
    },

    async changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.pagination.page = page
      await this.loadHistory()
      this.scrollToHistory()
    },

    async refreshData() {
      this.refreshing = true
      await this.loadData()
    },

    async clearFilters() {
      this.filters = { type: '', startDate: '', endDate: '' }
      this.pagination.page = 1
      await this.loadHistory()
    },

    scrollToHistory() {
      this.$nextTick(() => {
        if (this.$refs.historySection) {
          this.$refs.historySection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },

    getTypeInfo(type) {
      return jcoinService.getTypeInfo(type)
    },

    getTypeBadgeClass(type) {
      const badgeMap = {
        signin: 'bg-success', earned: 'bg-primary', used: 'bg-danger',
        refund: 'bg-warning', expired: 'bg-secondary', adjustment: 'bg-info'
      }
      return badgeMap[type] || 'bg-secondary'
    },

    getAmountClass(type) {
      return ['signin', 'earned', 'refund', 'adjustment'].includes(type) ? 'text-success' : 'text-danger'
    },

    formatAmount(amount, type) {
      return jcoinService.formatAmount(amount, type)
    },

    formatDate(dateString) {
      return jcoinService.formatDate(dateString)
    },

    formatBalance(balance) {
      return (balance || 0).toLocaleString('zh-TW')
    },

    getEmptyMessage() {
      if (this.filters.type) {
        const typeInfo = this.getTypeInfo(this.filters.type)
        return `沒有「${typeInfo.text}」的記錄`
      }
      if (this.filters.startDate || this.filters.endDate) {
        return '指定日期範圍內沒有點數記錄'
      }
      return '您目前沒有任何點數記錄'
    },

    getPageNumbers() {
      const total = this.totalPages
      const current = this.pagination.page
      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
      }
      const delta = 2
      const range = []
      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i)
      }
      const result = [1]
      if (current - delta > 2) result.push('...')
      result.push(...range)
      if (current + delta < total - 1) result.push('...')
      if (total > 1) result.push(total)
      return result.filter(item => item !== '...')
    }
  }
}
</script>

<style scoped>
.jcoins-page { min-height: 100vh; background-color: #f8f9fa; }
.jcoins-card { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); border: none; color: #333; box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3); border-radius: 15px; }
.balance-number { font-size: 2.5rem; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
.balance-unit { font-size: 1rem; opacity: 0.9; margin-left: 8px; }
.card { border: none; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 10px; }
.card-header { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-bottom: 1px solid #dee2e6; border-radius: 10px 10px 0 0 !important; }
.history-row:hover { background-color: rgba(0,123,255,0.05); }
.btn { border-radius: 8px; transition: all 0.3s ease; }
.btn:hover { transform: translateY(-1px); }
.pagination .page-link { border-radius: 8px; margin: 0 2px; border: 1px solid #dee2e6; }
.pagination .page-item.active .page-link { background-color: #007bff; border-color: #007bff; }

/* 離線模式相關樣式 */
.text-orange { color: #ff6b35 !important; }
.badge.bg-warning { 
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .balance-number { font-size: 2rem; }
  .table-responsive { font-size: 0.9rem; }
  .pagination .page-link { padding: 0.375rem 0.5rem; font-size: 0.85rem; }
  
  /* 手機版離線模式標示調整 */
  .badge.bg-warning {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>

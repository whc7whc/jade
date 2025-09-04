<template>
  <div class="level-page">
    <!-- 升等慶祝彈窗 -->
    <div 
      v-if="showLevelUpModal"
      class="level-up-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style="z-index: 2000; background: rgba(0,0,0,0.8);"
      @click="closeLevelUpModal"
    >
      <div class="level-up-content text-center p-4" @click.stop>
        <!-- 增強的煙火動畫背景 -->
        <div class="fireworks-container">
          <div class="firework firework-1"></div>
          <div class="firework firework-2"></div>
          <div class="firework firework-3"></div>
          <div class="firework firework-4"></div>
          <div class="firework firework-5"></div>
          <div class="confetti confetti-1"></div>
          <div class="confetti confetti-2"></div>
          <div class="confetti confetti-3"></div>
          <div class="star-particle star-1">⭐</div>
          <div class="star-particle star-2">✨</div>
          <div class="star-particle star-3">🌟</div>
        </div>
        
        <!-- 主要內容 -->
        <div class="level-up-main position-relative">
          <div class="congratulations-text mb-4">
            <h1 class="text-warning fw-bold mb-2 level-up-title">🎉 恭喜升等！🎉</h1>
            <h2 class="text-white mb-3 level-message">{{ levelUpMessage }}</h2>
          </div>
          
          <!-- 等級圖示 -->
          <div class="level-badge-container mb-4">
            <div class="level-badge">
              <i :class="newLevel?.icon + ' fa-4x'" :style="{ color: newLevel?.color }"></i>
            </div>
            <div class="level-glow"></div>
            <div class="level-ring ring-1"></div>
            <div class="level-ring ring-2"></div>
          </div>
          
          <!-- 新等級名稱 -->
          <h3 class="text-white mb-4 level-name">{{ newLevel?.name }}</h3>
          
          <!-- 新權益預覽 -->
          <div class="new-benefits mb-4" v-if="newBenefits && newBenefits.length > 0">
            <h5 class="text-warning mb-3">🎁 新增權益</h5>
            <div class="row justify-content-center">
              <div 
                v-for="(benefit, index) in newBenefits" 
                :key="benefit.id"
                class="col-6 col-md-4 mb-2"
              >
                <div class="benefit-preview p-2 rounded bg-white bg-opacity-10"
                     :style="{ animationDelay: `${index * 0.2}s` }">
                  <i :class="benefit.icon + ' text-warning mb-1'"></i>
                  <div class="small text-white">{{ benefit.title }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 關閉按鈕 -->
          <button 
            class="btn btn-warning btn-lg px-4"
            @click="closeLevelUpModal"
          >
            <i class="fas fa-thumbs-up me-2"></i>太棒了！
          </button>
        </div>
      </div>
    </div>

    <!-- 頁面標題區 -->
    <div class="container my-4">
      <!-- 三大功能按鈕集中於會員等級區塊上方 -->
      <div class="row mb-3">
        <div class="col-12 d-flex justify-content-end align-items-center gap-2">
          <button 
            @click="refreshData" 
            class="btn btn-outline-primary" 
            :disabled="loading"
          >
            <i class="fas fa-sync-alt me-2" :class="{ 'fa-spin': loading }"></i>
            {{ loading ? '載入中...' : '重新整理' }}
          </button>
        </div>
      </div>

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
              <li class="breadcrumb-item active">會員等級</li>
            </ol>
          </nav>
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h2 mb-0">
              <i class="fas fa-star me-2 text-warning"></i>會員等級
            </h1>
            <!-- 這裡原本的按鈕群組已移除，避免重複顯示 -->
          </div>
        </div>
      </div>
    </div>
    
    <!-- 主要內容 -->
    <div class="container">
      <!-- 會員等級統計卡片 -->
      <div class="row mb-4">
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="text-warning mb-2">
                <i class="fas fa-crown fa-2x"></i>
              </div>
              <h4 class="card-title">{{ summary?.currentLevel?.name || '載入中...' }}</h4>
              <p class="card-text text-muted mb-0">目前等級</p>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="text-primary mb-2">
                <i class="fas fa-chart-line fa-2x"></i>
              </div>
              <h4 class="card-title">{{ formatAmount(summary?.totalSpent || 0) }}</h4>
              <p class="card-text text-muted mb-0">累積消費 (元)</p>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="text-success mb-2">
                <i class="fas fa-gift fa-2x"></i>
              </div>
              <h4 class="card-title">{{ currentBenefits.length }}</h4>
              <p class="card-text text-muted mb-0">專屬權益</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 等級進度條 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">
                <i class="fas fa-rocket me-2 text-primary"></i>升級進度
              </h5>
              
              <!-- 載入狀態 -->
              <div v-if="loading" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                載入進度資訊...
              </div>
              
              <!-- 錯誤狀態 -->
              <div v-else-if="error" class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                無法載入進度資訊
              </div>
              
              <!-- 正常狀態 -->
              <div v-else class="level-progress">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-semibold">{{ summary?.currentLevel?.name || '' }}</span>
                  <span class="text-muted">
                    {{ summary?.progress?.isMaxLevel 
                        ? '已達最高等級' 
                        : `距離 ${summary?.nextLevel?.name || ''} 還需 ${formatAmount(summary?.progress?.requiredForNext || 0)} 元` 
                    }}
                  </span>
                </div>
                <div class="progress mb-2" style="height: 20px;">
                  <div 
                    class="progress-bar bg-gradient" 
                    :class="currentLevelStyle?.progressClass || 'bg-primary'"
                    role="progressbar" 
                    :style="{ width: (summary?.progress?.percentage || 0) + '%' }"
                    :aria-valuenow="summary?.progress?.percentage || 0" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {{ Math.round(summary?.progress?.percentage || 0) }}%
                  </div>
                </div>
                <div class="d-flex justify-content-between text-sm text-muted">
                  <span>{{ formatAmount(summary?.currentLevel?.requiredAmount || 0) }} 元</span>
                  <span v-if="!summary?.progress?.isMaxLevel">{{ formatAmount(summary?.nextLevel?.requiredAmount || 0) }} 元</span>
                  <span v-else>MAX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 當前等級權益 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">
                <i class="fas fa-medal me-2 text-warning"></i>{{ summary?.currentLevel?.name || '載入中...' }} 專屬權益
              </h5>
              <div class="row">
                <div 
                  v-for="benefit in currentBenefits" 
                  :key="benefit.id"
                  class="col-lg-6 col-md-12 mb-3"
                >
                  <div class="benefit-item p-3 bg-light rounded">
                    <div class="d-flex align-items-center">
                      <i :class="benefit.icon + ' fa-lg me-3'" :style="{ color: benefit.color }"></i>
                      <div>
                        <h6 class="mb-1">{{ benefit.title }}</h6>
                        <p class="mb-0 text-muted small">{{ benefit.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="currentBenefits.length === 0" class="col-12 text-center py-3">
                  <i class="fas fa-info-circle text-muted me-2"></i>
                  <span class="text-muted">暂无权益资料</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 所有等級說明 -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">
                <i class="fas fa-info-circle me-2 text-info"></i>會員等級說明
              </h5>
              <div class="level-explanation">
                <div 
                  v-for="level in memberLevels" 
                  :key="level.id"
                  class="level-item p-3 mb-3 border rounded"
                  :class="{ 'border-warning bg-warning bg-opacity-10': level.id === summary?.currentLevel?.id }"
                >
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <i :class="level.icon + ' fa-2x me-3'" :style="{ color: level.color }"></i>
                      <div>
                        <h6 class="mb-1 d-flex align-items-center">
                          {{ level.name }}
                          <span v-if="level.id === summary?.currentLevel?.id" class="badge bg-warning ms-2">目前等級</span>
                        </h6>
                        <p class="mb-0 text-muted">升級條件：累積消費 {{ level.requiredPoints }} 點</p>
                      </div>
                    </div>
                    <div class="text-end">
                      <small class="text-muted">{{ (level.benefits || []).length }} 項權益</small>
                    </div>
                  </div>
                  <div class="mt-2">
                    <div class="row">
                      <div 
                        v-for="benefit in (level.benefits || []).slice(0, 3)" 
                        :key="benefit.id"
                        class="col-md-4 col-sm-6 mb-1"
                      >
                        <small class="text-muted">
                          <i :class="benefit.icon + ' me-1'"></i>{{ benefit.title }}
                        </small>
                      </div>
                      <div v-if="(level.benefits || []).length > 3" class="col-12">
                        <small class="text-muted">...等 {{ (level.benefits || []).length }} 項權益</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import memberLevelService from '@/services/memberLevelService'
import userIdentityService from '@/services/userIdentityService'

export default {
  name: "LevelView",
  data() {
    return {
      loading: false,
      error: null,
      summary: null, // 後端返回的等級摘要
      memberLevels: [], // 從新API載入的等級列表
      showLevelUpModal: false,
      levelUpMessage: '',
      newLevel: null,
      newBenefits: [],
      previousLevel: null
    };
  },
  computed: {
    // 當前等級樣式資訊（從後端或本地獲取）
    currentLevelStyle() {
      if (this.summary?.currentLevel?.id) {
        return memberLevelService.getLevelStyleInfo(this.summary.currentLevel.id)
      }
      return memberLevelService.getLevelStyleInfo(1) // 預設
    },
    
    // 當前等級權益（優先使用後端資料）
    currentBenefits() {
      // 如果後端有 benefits 資料，優先使用
      if (this.summary?.currentLevel?.benefits && this.summary.currentLevel.benefits.length > 0) {
        return this.summary.currentLevel.benefits
      }
      
      // 否則使用本地對應的權益
      if (this.summary?.currentLevel?.id) {
        return memberLevelService.getLocalBenefitsByLevelId(this.summary.currentLevel.id)
      }
      
      return []
    }
  },
  async mounted() {
    console.log('LevelView - 開始初始化...')
    
    // 載入等級列表和個人摘要
    const results = await Promise.allSettled([
      this.loadMembershipLevels(),
      this.loadLevelSummary()
    ])
    
    // 記錄載入結果
    const names = ['等級列表', '個人摘要']
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`LevelView - ${names[index]}載入失敗:`, result.reason)
      }
    })
    
    const successCount = results.filter(r => r.status === 'fulfilled').length
    console.log(`LevelView - 初始化完成，成功載入 ${successCount}/2 項資料`)
  },
  methods: {
    /**
     * 載入會員等級列表 (新API)
     */
    async loadMembershipLevels() {
      try {
        console.log('LevelView - 載入會員等級列表...')
        
        const apiLevels = await memberLevelService.getAllMembershipLevels({
          activeOnly: true,
          includeDescription: true,
          includeMonthlyCoupon: false
        })
        
        // 轉換API格式為前端需要的格式
        this.memberLevels = memberLevelService.transformApiLevelsToFrontend(apiLevels)
        
        console.log('LevelView - 成功載入會員等級列表:', this.memberLevels)
      } catch (error) {
        console.error('LevelView - 載入會員等級列表失敗:', error)
        // 如果失敗，使用本地備用資料
        this.memberLevels = memberLevelService.getLocalFallbackLevels()
      }
    },

    /**
     * 載入等級摘要資訊
     */
    async loadLevelSummary() {
      this.loading = true
      this.error = null
      
      try {
        console.log('LevelView - 載入等級摘要...')
        this.summary = await memberLevelService.getLevelSummary()
        console.log('LevelView - 成功載入等級摘要:', this.summary)
        
        // 🔧 修正：檢查是否為新會員提供的預設資料
        if (this.summary?.currentLevel?.id === 1 && this.summary?.totalSpent === 0) {
          console.log('LevelView - 檢測到新會員，顯示預設升級進度')
        }
        
      } catch (error) {
        console.error('LevelView - 載入等級摘要失敗:', error)
        this.error = error.message || '載入等級資訊失敗'
        
        // 🔧 增強錯誤處理：為新會員提供更友善的訊息
        if (error.message.includes('無法獲取會員資訊')) {
          this.error = '請先登入會員帳號以查看等級資訊'
          setTimeout(() => {
            this.$router.push('/login')
          }, 3000)
        } else if (error.message.includes('重新登入')) {
          this.error = '登入已過期，即將跳轉至登入頁面'
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 重新整理所有資料
     */
    async refreshData() {
      this.loading = true
      try {
        // 載入核心資料
        const results = await Promise.allSettled([
          this.loadMembershipLevels(),
          this.loadLevelSummary()
        ])
        
        // 檢查結果並記錄任何失敗
        results.forEach((result, index) => {
          const names = ['等級列表', '個人摘要']
          if (result.status === 'rejected') {
            console.warn(`LevelView - ${names[index]}載入失敗:`, result.reason)
          }
        })
        
        // 只要有任一個成功就算整體成功
        const successCount = results.filter(r => r.status === 'fulfilled').length
        if (successCount === 0) {
          throw new Error('所有資料載入都失敗')
        }
        
        console.log(`LevelView - 重新整理完成，成功載入 ${successCount}/2 項資料`)
        
      } catch (error) {
        console.error('LevelView - 重新整理資料失敗:', error)
        this.error = error.message || '重新整理失敗'
      } finally {
        this.loading = false
      }
    },

    /**
     * 觸發升級通知
     */
    triggerLevelUpNotification(oldLevel, newLevel) {
      this.previousLevel = oldLevel
      this.newLevel = newLevel
      this.levelUpMessage = `從 ${oldLevel.name} 升級為 ${newLevel.name}！`
      
      // 計算新增的權益
      const oldBenefitIds = (oldLevel.benefits || []).map(b => b.id)
      const newLevelBenefits = newLevel.benefits || memberLevelService.getLocalBenefitsByLevelId(newLevel.id)
      this.newBenefits = newLevelBenefits.filter(benefit => !oldBenefitIds.includes(benefit.id))
      
      this.showLevelUpModal = true
      
      // 播放升等音效
      this.playLevelUpSound()
    },

    /**
     * 關閉升級彈窗
     */
    closeLevelUpModal() {
      this.showLevelUpModal = false
      setTimeout(() => {
        this.newLevel = null
        this.newBenefits = []
        this.levelUpMessage = ''
        this.previousLevel = null
      }, 300)
    },

    /**
     * 播放升級音效和震動
     */
    playLevelUpSound() {
      try {
        // 嘗試播放音效
        const audio = new Audio('/sounds/level-up.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {
          // 如果沒有音效檔案，使用 Web Audio API 製作簡單音效
          this.playBeepSound()
        })

        // 手機震動效果 (如果支援)
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 400])
        }

        // 頁面標題閃爍效果
        this.flashPageTitle()
        
      } catch (error) {
        console.log('音效播放失敗，但不影響功能')
      }
    },

    /**
     * 使用 Web Audio API 製作升級音效
     */
    playBeepSound() {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        
        // 創建三個音符的升級音效
        const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
        
        frequencies.forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
            oscillator.type = 'triangle'
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)
            
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.3)
          }, index * 150)
        })
      } catch (error) {
        console.log('Web Audio API 不支援')
      }
    },

    /**
     * 頁面標題閃爍效果
     */
    flashPageTitle() {
      const originalTitle = document.title
      let flashCount = 0
      const maxFlashes = 6
      
      const flashInterval = setInterval(() => {
        document.title = flashCount % 2 === 0 ? '🎉 升等了！🎉' : originalTitle
        flashCount++
        
        if (flashCount >= maxFlashes) {
          clearInterval(flashInterval)
          document.title = originalTitle
        }
      }, 500)
    },

    /**
     * 格式化金額顯示
     */
    formatAmount(amount) {
      return memberLevelService.formatAmount(amount)
    },

    /**
     * 格式化日期顯示
     */
    formatDate(dateString) {
      return memberLevelService.formatDate(dateString)
    }
  }
};
</script>

<style scoped>
.level-page {
  min-height: 100vh;
}

/* 升等彈窗樣式 */
.level-up-modal {
  backdrop-filter: blur(10px);
  animation: modalFadeIn 0.5s ease-out;
}

.level-up-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  max-width: 500px;
  width: 90%;
  position: relative;
  overflow: hidden;
  animation: modalSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.level-up-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
  animation: shimmer 2s infinite;
}

/* 煙火動畫 */
.fireworks-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.firework {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, #fff 0%, transparent 70%);
  border-radius: 50%;
  animation: fireworkExplode 2s infinite;
}

.firework-1 {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
  background: radial-gradient(circle, #ff6b6b 0%, transparent 70%);
}

.firework-2 {
  top: 30%;
  right: 20%;
  animation-delay: 0.7s;
  background: radial-gradient(circle, #4ecdc4 0%, transparent 70%);
}

.firework-3 {
  bottom: 30%;
  left: 30%;
  animation-delay: 1.4s;
  background: radial-gradient(circle, #ffe66d 0%, transparent 70%);
}

.firework-4 {
  top: 60%;
  right: 30%;
  animation-delay: 0.3s;
  background: radial-gradient(circle, #a8e6cf 0%, transparent 70%);
}

.firework-5 {
  top: 70%;
  left: 60%;
  animation-delay: 1.8s;
  background: radial-gradient(circle, #ffa8a8 0%, transparent 70%);
}

/* 彩帶效果 */
.confetti {
  position: absolute;
  width: 8px;
  height: 20px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #ffe66d, #a8e6cf);
  animation: confettiFall 3s infinite linear;
}

.confetti-1 {
  top: -20px;
  left: 25%;
  animation-delay: 0.5s;
}

.confetti-2 {
  top: -20px;
  left: 75%;
  animation-delay: 1.2s;
}

.confetti-3 {
  top: -20px;
  left: 50%;
  animation-delay: 2s;
}

/* 星星粒子 */
.star-particle {
  position: absolute;
  font-size: 1.5rem;
  animation: starFloat 4s infinite ease-in-out;
}

.star-1 {
  top: 15%;
  left: 15%;
  animation-delay: 0.8s;
}

.star-2 {
  top: 20%;
  right: 15%;
  animation-delay: 1.5s;
}

.star-3 {
  bottom: 25%;
  right: 25%;
  animation-delay: 2.2s;
}

/* 等級環動畫 */
.level-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.ring-1 {
  width: 160px;
  height: 160px;
  animation: ringExpand 2s infinite ease-out;
}

.ring-2 {
  width: 180px;
  height: 180px;
  animation: ringExpand 2s infinite ease-out 0.5s;
}

/* 訊息動畫 */
.level-message {
  animation: messageSlide 0.8s ease-out 0.3s both;
}

.level-name {
  animation: nameGlow 1s ease-out 0.6s both;
}

/* 主標題動畫 */
.level-up-title {
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  animation: titleBounce 1s ease-out;
}

/* 等級徽章容器 */
.level-badge-container {
  position: relative;
  display: inline-block;
}

.level-badge {
  background: white;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  animation: badgeFloat 3s ease-in-out infinite;
}

.level-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite;
}

/* 權益預覽 */
.benefit-preview {
  transition: all 0.3s ease;
  border: 1px solid rgba(255,255,255,0.2);
  animation: benefitSlideIn 0.6s ease-out both;
}

.benefit-preview:hover {
  transform: translateY(-2px) scale(1.05);
  background: rgba(255,255,255,0.2) !important;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* 動畫定義 */
@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from { 
    transform: translateY(-50px) scale(0.9);
    opacity: 0;
  }
  to { 
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes fireworkExplode {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

@keyframes titleBounce {
  0% { transform: translateY(-30px); opacity: 0; }
  50% { transform: translateY(10px); }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes badgeFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes glowPulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.8;
  }
}

/* 新增的動畫 */
@keyframes confettiFall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(400px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes starFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  25% {
    transform: translateY(-15px) rotate(90deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-20px) rotate(270deg);
    opacity: 1;
  }
}

@keyframes ringExpand {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

@keyframes messageSlide {
  0% {
    transform: translateX(-30px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes nameGlow {
  0% {
    transform: scale(0.9);
    opacity: 0;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  }
}

@keyframes benefitSlideIn {
  0% {
    transform: translateY(20px) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.benefit-item {
  transition: transform 0.2s ease;
}

.benefit-item:hover {
  transform: translateY(-2px);
}

.level-item {
  transition: all 0.3s ease;
}

.level-item:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.progress-bar {
  transition: width 0.5s ease-in-out;
}

.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.breadcrumb {
  background: none;
  padding: 0;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
  color: #6c757d;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .benefit-item {
    margin-bottom: 1rem;
  }
  
  .level-up-title {
    font-size: 2rem;
  }
  
  .level-badge {
    width: 100px;
    height: 100px;
  }
  
  .level-glow {
    width: 120px;
    height: 120px;
  }
}
</style>

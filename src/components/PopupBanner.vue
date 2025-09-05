<!-- PopupBanner.vue -->
<template>
  <div v-if="isVisible" class="popup-overlay" @click="handleOverlayClick">
    <div class="popup-content" @click.stop>
      <!-- 關閉按鈕 -->
      <button @click="closeBanner" class="close-btn">
        <i class="fas fa-times"></i>
      </button>

      <!-- 廣告內容 - 全圖片背景 -->
      <div class="banner-container" :style="{ backgroundImage: `url(${currentBanner.image})` }">
        <!-- 背景遮罩 -->
        <div class="banner-overlay"></div>
        
        <!-- 輪播控制 -->
        <div v-if="banners.length > 1" class="carousel-controls">
          <button @click="prevBanner" class="carousel-btn prev">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button @click="nextBanner" class="carousel-btn next">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <!-- 疊加的文字內容 -->
        <div class="banner-content">
          <div class="content-wrapper">
            <div class="text-content">
              <h1 class="banner-title">{{ currentBanner.title }}</h1>
              <p class="banner-description">{{ currentBanner.description }}</p>
              
              <button 
                @click="handleButtonClick(currentBanner.buttonLink)"
                class="action-btn"
              >
                {{ currentBanner.buttonText }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部控制 -->
      <div class="banner-footer">
        <!-- 輪播指示器 -->
        <div v-if="banners.length > 1" class="indicators">
          <button
            v-for="(banner, index) in banners"
            :key="banner.id"
            @click="setCurrentIndex(index)"
            :class="['indicator', { 'active': index === currentIndex }]"
          ></button>
        </div>
        
        <!-- 今天不再顯示 -->
        <div class="dont-show-option">
          <input
            type="checkbox"
            id="dontShowToday"
            v-model="dontShowToday"
          />
          <label for="dontShowToday">今天不再顯示</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PopupBanner',
  data() {
    return {
      isVisible: false,
      currentIndex: 0,
      dontShowToday: false,
      autoPlayInterval: null,
      
      // 廣告數據 - 可以從 API 載入
      banners: [
        {
          id: 1,
          title: "夏季新品上市！",
          subtitle: "全館服飾8折起",
          description: "精選夏季穿搭，涼爽舒適又時尚",
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop",
          buttonText: "立即購買",
          buttonLink: "/shop",
          backgroundClass: "bg-pink"
        },
        {
          id: 2,
          title: "會員獨享優惠",
          subtitle: "註冊即享9折優惠券",
          description: "成為JADE會員，享受更多專屬福利",
          image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=500&fit=crop",
          buttonText: "立即註冊",
          buttonLink: "/register",
          backgroundClass: "bg-blue"
        },
        {
          id: 3,
          title: "穿搭分享活動",
          subtitle: "分享穿搭贏大獎",
          description: "上傳你的JADE穿搭照片，有機會獲得購物金",
          image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=500&fit=crop",
          buttonText: "立即參加",
          buttonLink: "/posts",
          backgroundClass: "bg-green"
        }
      ]
    }
  },
  
  computed: {
    currentBanner() {
      return this.banners[this.currentIndex] || this.banners[0]
    }
  },
  
  mounted() {
    this.loadBannersFromAPI()
  },
  
  beforeUnmount() {
    this.clearAutoPlay()
  },
  
  methods: {
    // 🔥 從專門的彈出廣告 API 載入數據
    async loadBannersFromAPI() {
      try {
        console.log('🔍 從彈出廣告 API 載入...')
        
        // 🔥 使用專門的 PopupBanners API
        const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'
        const response = await fetch(`${API_BASE_URL}/api/PopupBanners/active`)
        const data = await response.json()
        
        if (data.success && data.data && data.data.length > 0) {
          console.log(`✅ 成功載入 ${data.data.length} 個彈出廣告`)
          
          // 轉換 API 數據格式
          this.banners = data.data.map(banner => ({
            id: banner.id,
            title: banner.title,
            subtitle: banner.subtitle,
            description: banner.description,
            image: banner.image,
            buttonText: banner.buttonText,
            buttonLink: banner.buttonLink,
            backgroundClass: banner.backgroundClass
          }))
        } else {
          console.log('⚠️ 沒有找到啟用的彈出廣告，使用預設廣告')
        }
        
      } catch (error) {
        console.error('❌ 載入彈出廣告 API 失敗:', error)
        console.log('🔄 使用預設廣告')
      }
      
      // 🔥 不管 API 成功或失敗，都檢查是否顯示
      this.checkShouldShow()
    },

    // 🔥 修改彈出邏輯 - 更積極的顯示策略
    checkShouldShow() {
      const now = new Date()
      const today = now.toDateString()
      const currentTime = now.getTime()
      
      // 檢查是否勾選了"今天不再顯示"
      const dontShowToday = localStorage.getItem('popup-banner-dont-show-today')
      if (dontShowToday === today) {
        console.log('⏭️ 今天不再顯示廣告 (用戶已勾選)')
        return
      }
      
      // 🔥 新的顯示邏輯：每次頁面載入都有機會顯示
      const lastShown = localStorage.getItem('popup-banner-last-shown-time')
      const minInterval = 1 * 60 * 1000 // 1分鐘間隔 (可以調整)

      if (!lastShown || (currentTime - parseInt(lastShown)) > minInterval) {
        console.log('✅ 顯示彈出廣告')
        setTimeout(() => {
          this.isVisible = true
          this.startAutoPlay()
          this.recordImpression()
          // 記錄這次顯示的時間
          localStorage.setItem('popup-banner-last-shown-time', currentTime.toString())
        }, 500) // 🔥 減少延遲到 0.5秒
      } else {
        const remainingTime = minInterval - (currentTime - parseInt(lastShown))
        console.log(`⏰ 距離下次可顯示還有 ${Math.round(remainingTime/1000/60)} 分鐘`)
      }
    },

    // 🔥 新增：強制顯示廣告的方法 (供測試使用)
    forceShow() {
      console.log('🎯 強制顯示廣告')
      this.isVisible = true
      this.startAutoPlay()
      this.recordImpression()
    },

    // 🔥 新增：清除所有限制的方法 (供測試使用)
    clearAllRestrictions() {
      localStorage.removeItem('popup-banner-last-shown-time')
      localStorage.removeItem('popup-banner-dont-show-today')
      console.log('🗑️ 已清除所有顯示限制')
    },
    
    // 關閉彈窗
    closeBanner() {
      this.isVisible = false
      this.clearAutoPlay()
      
      // 🔥 只有勾選"今天不再顯示"才設定限制
      if (this.dontShowToday) {
        const today = new Date().toDateString()
        localStorage.setItem('popup-banner-dont-show-today', today)
        console.log('✋ 設定今天不再顯示')
      }
    },
    
    // 點擊遮罩關閉
    handleOverlayClick() {
      this.closeBanner()
    },
    
    // 下一個廣告
    nextBanner() {
      this.currentIndex = (this.currentIndex + 1) % this.banners.length
    },
    
    // 上一個廣告
    prevBanner() {
      this.currentIndex = (this.currentIndex - 1 + this.banners.length) % this.banners.length
    },
    
    // 設置當前索引
    setCurrentIndex(index) {
      this.currentIndex = index
    },
    
    // 開始自動播放
    startAutoPlay() {
      if (this.banners.length <= 1) return
      
      this.autoPlayInterval = setInterval(() => {
        this.nextBanner()
      }, 5000) // 每5秒切換
    },
    
    // 清除自動播放
    clearAutoPlay() {
      if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval)
        this.autoPlayInterval = null
      }
    },
    
    // 點擊按鈕
    async handleButtonClick(link) {
      console.log('點擊廣告按鈕:', link)
      
      // 🔥 記錄點擊到彈出廣告專用 API
      try {
        const currentBannerId = this.currentBanner.id
        const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'
        const response = await fetch(`${API_BASE_URL}/api/PopupBanners/${currentBannerId}/click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sourcePage: window.location.pathname,
            userAgent: navigator.userAgent,
            clickTime: new Date().toISOString()
          })
        })
        
        const result = await response.json()
        if (result.success) {
          console.log(`✅ 已記錄彈出廣告 ${currentBannerId} 的點擊`)
          console.log(`📊 總點擊數: ${result.data.clickCount}`)
        }
      } catch (error) {
        console.error('❌ 記錄彈出廣告點擊失敗:', error)
      }
      
      this.$toast?.success('感謝您的點擊！')
      this.closeBanner()
      
      // 導向指定頁面
      if (link && link !== '#') {
        if (link.startsWith('/')) {
          this.$router.push(link)
        } else if (link.startsWith('http')) {
          window.open(link, '_blank')
        }
      }
    },

    // 🔥 記錄廣告展示
    async recordImpression() {
      if (!this.currentBanner?.id) return
      
      try {
        const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'
        const response = await fetch(`${API_BASE_URL}/api/PopupBanners/${this.currentBanner.id}/impression`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const result = await response.json()
        if (result.success) {
          console.log(`✅ 已記錄彈出廣告 ${this.currentBanner.id} 的展示`)
        }
      } catch (error) {
        console.error('❌ 記錄廣告展示失敗:', error)
      }
    },
  }
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.popup-content {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  max-width: 900px;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  animation: slideIn 0.3s ease-out;
}

/* 關閉按鈕 */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  color: white;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

/* 廣告容器 - 全圖片背景 */
.banner-container {
  position: relative;
  height: 400px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景圖片遮罩層 */
.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
}

/* 輪播控制 */
.carousel-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  pointer-events: none;
  z-index: 2;
}

.carousel-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s;
  color: white;
  backdrop-filter: blur(10px);
}

.carousel-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

/* 內容區域 - 疊加在圖片上 */
.banner-content {
  position: relative;
  z-index: 3;
  color: white;
  text-align: center;
  padding: 40px;
  max-width: 600px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.text-content {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.banner-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}


.banner-description {
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 24px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.action-btn {
  background: linear-gradient(135deg, #E5D2D2);
  color: white;
  border: none;
  padding: 14px 36px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  text-shadow: none;
  letter-spacing: 0.5px;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

/* 底部控制 */
.banner-footer {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.indicators {
  display: flex;
  gap: 8px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.indicator.active {
  background: white;
  border-color: white;
  transform: scale(1.2);
}

.dont-show-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.dont-show-option input[type="checkbox"] {
  margin: 0;
  accent-color: #667eea;
}

.dont-show-option label {
  cursor: pointer;
  user-select: none;
}

/* 動畫 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 響應式設計 */
@media (min-width: 768px) {
  .banner-container {
    height: 500px;
  }
  
  .banner-title {
    font-size: 3rem;
  }
  
  .banner-subtitle {
    font-size: 1.5rem;
  }
  
  .banner-content {
    padding: 60px;
  }
}

@media (max-width: 767px) {
  .popup-content {
    margin: 10px;
    max-height: 95vh;
    overflow-y: auto;
  }
  
  .banner-container {
    height: 350px;
  }
  
  .banner-title {
    font-size: 1.8rem;
  }
  
  .banner-content {
    padding: 20px;
  }
  
  .text-content {
    padding: 20px;
  }
  
  .banner-footer {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  .carousel-btn {
    width: 40px;
    height: 40px;
  }
}

/* 平板尺寸優化 */
@media (min-width: 768px) and (max-width: 1024px) {
  .banner-container {
    height: 450px;
  }
  
  .banner-content {
    padding: 40px;
  }
  
  .text-content {
    padding: 28px;
  }
}
</style>
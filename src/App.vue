<template>
  <div id="app">
    <AppHeader @openSearch="handleOpenSearch" />
    <main class="main-content">
      <router-view ref="currentView" />
    </main>
    <AppFooter />
    <PopupBanner />
    
    <!-- Search Modal -->
    <SearchModal v-model:show="showSearch" />
    
    <!-- 懸浮 AI 助理 -->
    <div class="ai-assistant-wrapper">
      <button 
        class="ai-assistant-btn" 
        @click="toggleAIAssistant"
        :class="{ 'active': showAIAssistant }"
        title="AI 助理"
      >
        <div class="ai-icon">
          <svg v-if="!showAIAssistant" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H16A5,5 0 0,1 21,13A5,5 0 0,1 16,18V16A3,3 0 0,0 13,13H11A3,3 0 0,0 8,16V18A5,5 0 0,1 3,13A5,5 0 0,1 8,8H10A1,1 0 0,0 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,10A0.5,0.5 0 0,0 7,10.5A0.5,0.5 0 0,0 7.5,11A0.5,0.5 0 0,0 8,10.5A0.5,0.5 0 0,0 7.5,10M16.5,10A0.5,0.5 0 0,0 16,10.5A0.5,0.5 0 0,0 16.5,11A0.5,0.5 0 0,0 17,10.5A0.5,0.5 0 0,0 16.5,10M12,14A4,4 0 0,1 16,18A4,4 0 0,1 12,22A4,4 0 0,1 8,18A4,4 0 0,1 12,14M12,16A2,2 0 0,0 10,18A2,2 0 0,0 12,20A2,2 0 0,0 14,18A2,2 0 0,0 12,16Z"/>
          </svg>
          <svg v-else width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </div>
        <div class="ai-pulse" v-if="!showAIAssistant"></div>
      </button>
      
      <!-- AI 助理對話框 -->
      <div class="ai-chat-panel" v-show="showAIAssistant">
        <div class="ai-chat-header">
          <h6 class="mb-0">AI 客服</h6>
          <small class="text-muted">為您提供購物建議</small>
        </div>
        <div class="ai-chat-body">
          <div class="ai-message">
            <div class="message-bubble ai">
              <p class="mb-1">您好！我是您的AI客服小玉</p>
              <p class="mb-0">請問有什麼可以幫助您的嗎？</p>
            </div>
          </div>
          <div class="ai-message" v-for="message in aiMessages" :key="message.id">
            <div class="message-bubble" :class="message.sender">
              <p class="mb-0">{{ message.text }}</p>
            </div>
          </div>
        </div>
        <div class="ai-chat-footer">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control"
              placeholder="輸入您的問題..."
              v-model="aiInput"
              @keypress.enter="sendAIMessage"
            >
            <button 
              class="btn btn-primary" 
              type="button" 
              @click="sendAIMessage"
              :disabled="!aiInput.trim()"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- SVG Icons -->
    <svg style="display: none;">
      <defs>
        <symbol id="user" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </symbol>
        <symbol id="cart" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </symbol>
        <symbol id="search-icon" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </symbol>
      </defs>
    </svg>
  </div>
</template>

<script>


import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import SearchModal from './components/SearchModal.vue'
import PopupBanner from './components/PopupBanner.vue'
import axios from 'axios'
import { on, sendPrivateMessage } from './services/chatService';


export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
    SearchModal,
    PopupBanner
  },
mounted() {
 
  // 將 toggleAIAssistant 方法暴露到 $root，讓子組件可以調用
  this.$root.toggleAIAssistant = this.toggleAIAssistant;
  this.$root.showAIAssistant = this.showAIAssistant;
},
async login(email, password) {
  try {
    const response = await fetch(`${process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      // 儲存 token 到 localStorage
      localStorage.setItem('authToken', data.token);
      return true;
    } else {
      const errorData = await response.json();
      console.error('登入失敗:', errorData);
      return false;
    }
  } catch (error) {
    console.error('登入過程發生錯誤:', error);
    return false;
  }
},

  data() {
    return {
      showSearch: false,
      showAIAssistant: false,
      aiInput: '',
      aiMessages: []
    }
  },
  methods: {
    handleOpenSearch() {
      // 如果在首頁，觸發首頁的搜尋功能
      if (this.$route.name === 'Home') {
        // 為了簡化，直接使用 SearchModal
        this.showSearch = true
      } else {
        // 其他頁面使用 SearchModal
        this.showSearch = true
      }
    },
    
    toggleAIAssistant() {
      this.showAIAssistant = !this.showAIAssistant;
      // 同步更新 $root 的值
      this.$root.showAIAssistant = this.showAIAssistant;
    },
    
    async sendAIMessage() {
      if (!this.aiInput.trim()) return

      // 添加用戶訊息
      const userMessage = {
        id: Date.now(),
        sender: 'user',
        text: this.aiInput
      }
      this.aiMessages.push(userMessage)

      const input = this.aiInput
      this.aiInput = ''

      // 顯示 loading 訊息
      const loadingId = Date.now() + 1
      this.aiMessages.push({
        id: loadingId,
        sender: 'ai',
        text: '思考中...'
      })

      try {
        // 改為新版 Web API 路徑
        const res = await axios.post(`${process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'}/OpenAI/SendMessage`, { message: input })
        const aiText = res.data.reply || '很抱歉，AI 沒有回應。'
        // 替換 loading 訊息（Vue 3 直接賦值）
        const idx = this.aiMessages.findIndex(m => m.id === loadingId)
        if (idx !== -1) {
          this.aiMessages[idx] = {
            id: loadingId,
            sender: 'ai',
            text: aiText
          }
        }
      } catch (err) {
        const idx = this.aiMessages.findIndex(m => m.id === loadingId)
        if (idx !== -1) {
          this.aiMessages[idx] = {
            id: loadingId,
            sender: 'ai',
            text: 'AI 回覆失敗，請稍後再試。'
          }
        }
      }
    },

    sendMessage() {
      // 發送訊息到伺服器
      sendPrivateMessage('targetUserId', 'Hello from Vue!');
    },
  }
}
</script>

<style>
/* 全局樣式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
}

/* 為固定的 header 預留空間 */
.main-content {
  padding-top: 90px; /* 根據 header 高度調整 (logo 60px + padding 24px + 邊距) */
}

/* 響應式調整 */
@media (max-width: 768px) {
  .main-content {
    padding-top: 90px; /* 手機版稍微小一點 */
  }
}

a {
  color: #4a4a4a;
  text-decoration: none;
}

a:hover {
  color: #000;
}

.btn {
  border-radius: 0;
  padding: 0.5rem 1.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-dark {
  background-color: #000;
  border-color: #000;
}

.btn-dark:hover {
  background-color: #333;
  border-color: #333;
}

.section-title {
  font-weight: 700;
  letter-spacing: 1px;
}

/* 動畫效果 */
.border-animation-left a {
  position: relative;
  transition: color 0.3s ease;
}

.border-animation-left a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #000;
  transition: width 0.3s ease;
}

.border-animation-left a:hover::after {
  width: 100%;
}

/* 圖片縮放效果 */
.image-zoom-effect {
  overflow: hidden;
}

.image-zoom-effect img {
  transition: transform 0.3s ease;
}

.image-zoom-effect:hover img {
  transform: scale(1.05);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .text-uppercase {
    font-size: 0.9rem;
  }
}

/* AI 助理樣式 */
.ai-assistant-wrapper {
  position: fixed;
  bottom: 160px; /* 調整位置，避免與 TOP 按鈕重疊 */
  right: 24px;
  z-index: 1050;
}

.ai-assistant-btn {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #022c5c;
  background: #022c5c;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(2, 44, 92, 0.4);
  transition: all 0.3s ease;
  overflow: hidden;
}

.ai-assistant-btn:hover {
  transform: translateY(-2px);
  background: #034078;
  border-color: #034078;
  box-shadow: 0 6px 24px rgba(2, 44, 92, 0.6);
  color: white;
}

.ai-assistant-btn.active {
  background: #0652DD;
  border-color: #0652DD;
  box-shadow: 0 4px 20px rgba(6, 82, 221, 0.4);
  color: white;
}

.ai-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  border: 2px solid rgba(2, 44, 92, 0.6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ai-pulse 2s infinite;
}

@keyframes ai-pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.ai-chat-panel {
  position: absolute;
  bottom: 75px;
  right: 0;
  width: 350px;
  max-height: 500px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(2, 44, 92, 0.2);
  border: 2px solid #022c5c;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-chat-header {
  padding: 20px 20px 15px;
  border-bottom: 1px solid rgba(2, 44, 92, 0.2);
  background: #022c5c;
  color: white;
  border-radius: 15px 15px 0 0;
  text-align: center;
}

.ai-chat-body {
  flex: 1;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-message {
  display: flex;
  margin-bottom: 10px;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
}

.message-bubble.ai {
  background: linear-gradient(135deg, #f0f8ff 0%, #e8f2ff 100%);
  color: #022c5c;
  margin-right: auto;
  border-bottom-left-radius: 8px;
  border: 1px solid rgba(2, 44, 92, 0.2);
}

.message-bubble.user {
  background: #022c5c;
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 8px;
  border: 1px solid #022c5c;
}

.ai-chat-footer {
  padding: 15px;
  border-top: 1px solid rgba(2, 44, 92, 0.2);
  border-radius: 0 0 15px 15px;
}

.ai-chat-footer .form-control {
  border-radius: 20px;
  border: 2px solid rgba(2, 44, 92, 0.2);
  padding: 10px 15px;
}

.ai-chat-footer .form-control:focus {
  border-color: #022c5c;
  box-shadow: 0 0 0 0.2rem rgba(2, 44, 92, 0.25);
}

.ai-chat-footer .btn {
  border-radius: 20px;
  padding: 10px 15px;
  background: #022c5c;
  border: 1px solid #022c5c;
  color: white;
}

.ai-chat-footer .btn:hover {
  background: #034078;
  border-color: #034078;
  color: white;
}

/* 響應式調整 */
@media (max-width: 576px) {
  .ai-assistant-wrapper {
    bottom: 170px; /* 調整手機版位置，避免與 TOP 按鈕重疊 */
    right: 20px;
  }
  
  .ai-assistant-btn {
    width: 56px;
    height: 56px;
  }
  
  .ai-chat-panel {
    width: calc(100vw - 40px);
    right: -20px;
    bottom: 70px;
    max-width: 320px;
  }
}
</style>
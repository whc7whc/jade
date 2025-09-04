<template>
  <div class="chat-room-container" :class="{ 'fullscreen-mode': isFullscreen, 'floating-mode': !isFullscreen }">
    <!-- 聊天室主體 -->
    <div class="chat-room d-flex h-100">
      <!-- 左側：聊天清單 -->
      <aside class="chat-sidebar d-flex flex-column">
        <!-- 標題區域 -->
        <div class="sidebar-header d-flex align-items-center justify-content-between p-3">
          <div>
            <h6 class="mb-0 fw-bold sidebar-title">聊天列表</h6>
          </div>
          <button 
            v-if="!isFullscreen" 
            class="btn btn-sm btn-outline-light close-btn"
            @click="$emit('close')"
            title="關閉"
          >
            ×
          </button>
        </div>

        <!-- 搜尋區域 -->
        <div class="search-section px-3 py-2">
          <div class="input-group input-group-sm mb-2">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input 
              v-model="searchText" 
              type="text" 
              class="form-control" 
              placeholder="搜尋聊天或會員"
            >
          </div>
          
          <div class="d-flex gap-2 mb-2">
            <button 
              :class="['btn btn-sm', activeTab === 'members' ? 'btn-primary' : 'btn-outline-secondary']"
              @click="switchTab('members')"
            >
              會員
            </button>
            <button 
              :class="['btn btn-sm', activeTab === 'vendors' ? 'btn-primary' : 'btn-outline-secondary']"
              @click="switchTab('vendors')"
            >
              廠商
            </button>
          </div>
          
          <div class="current-user">
            <small class="text-primary fw-medium">{{ currentUser }}</small>
          </div>
        </div>

        <!-- 聊天列表 -->
        <div class="chat-list flex-grow-1 overflow-auto px-2">
          <div 
            v-for="chat in filteredChats" 
            :key="chat.id"
            class="chat-item d-flex align-items-start p-2 mb-1 rounded"
            :class="{ 'active': selectedChat && selectedChat.id === chat.id }"
            @click="selectChat(chat)"
          >
            <div class="chat-avatar me-2">
              <div 
                class="avatar-circle d-flex align-items-center justify-content-center"
                :style="{ backgroundColor: chat.avatarColor }"
              >
                {{ chat.name.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="chat-info flex-grow-1 min-w-0">
              <div class="d-flex justify-content-between align-items-start mb-1">
                <span class="chat-name fw-medium text-truncate">{{ chat.name }}</span>
                <small class="chat-time text-muted">{{ chat.time }}</small>
              </div>
              <div class="chat-preview small text-muted text-truncate">
                {{ chat.lastMessage }}
              </div>
              <span v-if="chat.unread && chat.unread > 0" class="badge bg-danger">
                {{ chat.unread }}
              </span>
            </div>
          </div>
          
          <div v-if="filteredChats.length === 0" class="text-center text-muted py-4">
            <small>沒有找到聊天記錄</small>
          </div>
        </div>
      </aside>

      <!-- 右側：聊天視窗 -->
      <main class="chat-main d-flex flex-column">
        <!-- 聊天頂部資訊 -->
        <div v-if="selectedChat" class="chat-header border-bottom p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-0">{{ selectedChat.name }}</h6>
              <small class="text-muted">
                {{ selectedChat.type === 'vendor' ? '廠商' : '會員' }} • {{ selectedChat.date }}
              </small>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-success">在線</span>
            </div>
          </div>
        </div>

        <!-- 聊天內容區域 -->
        <div class="chat-content flex-grow-1 d-flex flex-column">
          <div v-if="!selectedChat" class="no-chat-selected d-flex align-items-center justify-content-center h-100">
            <div class="text-center text-muted">
              <i class="fas fa-comments fa-3x mb-3 opacity-50"></i>
              <p>請選擇一個聊天開始對話</p>
            </div>
          </div>

          <template v-else>
            <!-- 訊息區域 -->
            <div class="messages-container flex-grow-1 p-3" ref="messagesContainer">
              <div 
                v-for="message in selectedChat.messages" 
                :key="message.id"
                class="message-wrapper mb-3"
              >
                <div 
                  class="message-row d-flex"
                  :class="{ 'justify-content-end': message.isOwn }"
                >
                  <div 
                    class="message-bubble"
                    :class="{
                      'bg-primary text-white': message.isOwn,
                      'bg-light': !message.isOwn
                    }"
                  >
                    <div class="message-text">{{ message.text }}</div>
                    <div class="message-time">
                      <small :class="message.isOwn ? 'text-white-50' : 'text-muted'">
                        {{ message.time }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 輸入區域 -->
            <div class="chat-input border-top p-3">
              <div class="input-group">
                <textarea 
                  v-model="newMessage"
                  class="form-control"
                  rows="2"
                  placeholder="輸入訊息，按 Enter 發送..."
                  @keydown.enter.exact.prevent="sendMessage"
                  @keydown.enter.shift.exact="addNewLine"
                  ref="messageInput"
                ></textarea>
                <button 
                  class="btn btn-primary"
                  type="button"
                  :disabled="!canSend"
                  @click="sendMessage"
                >
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatRoomComponent',
  emits: ['close'],
  props: {
    isFullscreen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentUser: 'yeesall_tw',
      activeTab: 'members',
      searchText: '',
      newMessage: '',
      selectedChat: null,
  sending: false,
  replyTimer: null,
      chats: [
        {
          id: 'member_1',
          name: 'asasasa0704',
          type: 'member',
          time: '08/05',
          date: '8月5日',
          lastMessage: '您好 收到您的訂單明...',
          avatarColor: '#e4dcd1',
          unread: 2,
          messages: [
            {
              id: 'm1_1',
              text: '您好，請問這個商品還有庫存嗎？',
              time: '14:20',
              isOwn: false
            },
            {
              id: 'm1_2',
              text: '您好！目前還有庫存，請問您需要幾件呢？',
              time: '14:25',
              isOwn: true
            },
            {
              id: 'm1_3',
              text: '我需要2件，可以幫我保留嗎？',
              time: '14:30',
              isOwn: false
            }
          ]
        },
        {
          id: 'vendor_1',
          name: 'yeesall_tw',
          type: 'vendor',
          time: '07/25',
          date: '7月25日',
          lastMessage: '不客氣喔',
          avatarColor: '#4ecdc4',
          unread: 0,
          messages: [
            {
              id: 'v1_1',
              text: '請問這個零件是否夠強嗎？但這樣強不完，會兄',
              time: '21:28',
              isOwn: false
            },
            {
              id: 'v1_2',
              text: '您好，麻煩您提供照片給我們師傅看，然後這邊幫您諮詢一下技師',
              time: '22:03',
              isOwn: true
            },
            {
              id: 'v1_3',
              text: '我們昨天會訂好幾天，終於好了，謝謝！',
              time: '09:14',
              isOwn: false
            },
            {
              id: 'v1_4',
              text: '客服004 會為您服務',
              time: '10:00',
              isOwn: true
            },
            {
              id: 'v1_5',
              text: '不客氣喔',
              time: '09:35',
              isOwn: true
            }
          ]
        },
        {
          id: 'member_2',
          name: 'marsden',
          type: 'member',
          time: '07/14',
          date: '7月14日',
          lastMessage: '【許願卡】評價我們的服...',
          avatarColor: '#a8e6cf',
          unread: 1,
          messages: [
            {
              id: 'm2_1',
              text: '【許願卡】評價我們的服務如何呢？',
              time: '16:20',
              isOwn: false
            }
          ]
        }
      ]
    }
  },
  computed: {
    filteredChats() {
      // 修正過濾邏輯
      let filtered = this.chats.filter(chat => {
        const typeMatch = this.activeTab === 'members' ? chat.type === 'member' : chat.type === 'vendor'
        return typeMatch
      })
      
      if (this.searchText.trim()) {
        const search = this.searchText.toLowerCase()
        filtered = filtered.filter(chat => 
          chat.name.toLowerCase().includes(search) ||
          chat.lastMessage.toLowerCase().includes(search)
        )
      }
      
      // 修正排序邏輯
      return filtered.sort((a, b) => {
        const timeA = this.parseTime(a.time)
        const timeB = this.parseTime(b.time)
        return timeB - timeA
      })
    },
    canSend() {
      return this.newMessage.trim().length > 0 && this.selectedChat
    }
  },
  methods: {
    parseTime(timeStr) {
      // 簡單的時間解析，實際應用中應該使用更完整的時間格式
      const [month, day] = timeStr.split('/')
      const currentYear = new Date().getFullYear()
      return new Date(currentYear, parseInt(month) - 1, parseInt(day))
    },
    switchTab(tab) {
      this.activeTab = tab
      this.selectedChat = null
      this.searchText = ''
      
      // 切換後自動選擇第一個聊天
      this.$nextTick(() => {
        if (this.filteredChats.length > 0) {
          this.selectChat(this.filteredChats[0])
        }
      })
    },
    selectChat(chat) {
      this.selectedChat = { ...chat }
      // 清除未讀數量
      if (chat.unread) {
        chat.unread = 0
        // 同步更新原始數據
        const originalChat = this.chats.find(c => c.id === chat.id)
        if (originalChat) {
          originalChat.unread = 0
        }
      }
      
      this.$nextTick(() => {
        this.scrollToBottom()
        // 聚焦到輸入框
        if (this.$refs.messageInput) {
          this.$refs.messageInput.focus()
        }
      })
    },
    sendMessage() {
  if (!this.canSend) return
  // 防止短時間內多次觸發 sendMessage
  if (this.sending) return
  this.sending = true
  setTimeout(() => { this.sending = false }, 800)

      const now = new Date()
      const message = {
        id: `msg_${Date.now()}`,
        text: this.newMessage.trim(),
        time: now.toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        isOwn: true
      }

      // 添加訊息到當前選中的聊天
      this.selectedChat.messages.push(message)
      
      // 更新聊天列表中的最後訊息和時間
      const originalChat = this.chats.find(c => c.id === this.selectedChat.id)
      if (originalChat) {
        originalChat.messages.push(message)
        originalChat.lastMessage = message.text.length > 20 
          ? message.text.substring(0, 20) + '...' 
          : message.text
        originalChat.time = now.toLocaleDateString('zh-TW', {
          month: '2-digit',
          day: '2-digit'
        })
      }
      
      this.newMessage = ''
      
      this.$nextTick(() => {
        this.scrollToBottom()
      })

      // 模擬對方回覆
  this.simulateReply()
    },
    addNewLine() {
      this.newMessage += '\n'
    },
    simulateReply() {
      // 清除上一次尚未執行的回覆定時器，避免重複回覆
      if (this.replyTimer) {
        clearTimeout(this.replyTimer)
        this.replyTimer = null
      }
      this.replyTimer = setTimeout(() => {
        if (!this.selectedChat) return
        
        const replies = [
          '收到，謝謝您的訊息！',
          '好的，我了解了',
          '讓我確認一下相關資訊',
          '謝謝您的耐心等待',
          '請問還有其他問題嗎？',
          '我們會盡快為您處理'
        ]
        
        const now = new Date()
        const reply = {
          id: `reply_${Date.now()}`,
          text: replies[Math.floor(Math.random() * replies.length)],
          time: now.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          isOwn: false
        }
        
        // 添加回覆到當前選中的聊天
        this.selectedChat.messages.push(reply)
        
        // 更新原始聊天數據
        const originalChat = this.chats.find(c => c.id === this.selectedChat.id)
        if (originalChat) {
          originalChat.messages.push(reply)
          originalChat.lastMessage = reply.text.length > 20 
            ? reply.text.substring(0, 20) + '...' 
            : reply.text
        }
        
        this.$nextTick(() => {
          this.scrollToBottom()
        })
  }, 1000 + Math.random() * 2000)
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight
        }, 100)
      }
    }
  },
  mounted() {
    // 預設選擇第一個聊天
    if (this.filteredChats.length > 0) {
      this.selectChat(this.filteredChats[0])
    }
  },
  beforeUnmount() {
    // 清理可能還在等待的回覆計時器
    if (this.replyTimer) {
      clearTimeout(this.replyTimer)
      this.replyTimer = null
    }
  },
  watch: {
    // 監聽篩選結果變化，確保有聊天被選中
    filteredChats: {
      handler(newChats) {
        if (newChats.length > 0 && !this.selectedChat) {
          this.selectChat(newChats[0])
        } else if (newChats.length === 0) {
          this.selectedChat = null
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.chat-room-container.fullscreen-mode {
  width: 100%;
  height: 100vh;
}

.chat-room-container.floating-mode {
  width: 800px;
  height: 600px;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1050;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.chat-room {
  /* component-scoped brand variables (keep changes local to this component) */
  /* --brand-primary: #022c5c; */
  /* --brand-secondary: #8a742d; */
  --brand-primary-opaque: #faf6eb;
  --brand-primary-focus: #e4dcd1;
  --brand-primary-active: #faf6eb;

  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.chat-sidebar {
  width: 320px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
}

.sidebar-header {
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
  color: white;
}

/* 只覆寫標題文字為黑色，保留 header 其餘文字（例如按鈕）為原本樣式 */
.sidebar-header .sidebar-title {
  color: #000 !important;
}

/* 關閉按鈕的 X 使用黑色字體（僅此按鈕） */
.sidebar-header .close-btn {
  color: #000 !important;
  /* 保留 btn-outline-light 的背景與邊框行為 */
}

.search-section {
  background: #fff;
  border-bottom: 1px solid #dee2e6;
}

/* 將搜尋區塊內的啟用按鈕（會員 / 廠商）預設藍色改為 #022c5c，僅影響此區域 */
.search-section .btn.btn-sm.btn-primary {
  background-color: #022c5c !important;
  border-color: #022c5c !important;
  color: #fff !important;
}
.search-section .btn.btn-sm.btn-primary:hover,
.search-section .btn.btn-sm.btn-primary:focus {
  background-color: #021f4a !important; /* 稍微深一點的 hover 色 */
  border-color: #021f4a !important;
  color: #fff !important;
}

.current-user {
  padding: 8px 0;
}

.chat-list {
  background: #f8f9fa;
}

.chat-item {
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.chat-item:hover {
  background: var(--brand-primary-opaque);
}

.chat-item.active {
  background: var(--brand-primary-active);
  border-left: 4px solid var(--brand-primary);
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 11px;
}

.chat-main {
  flex: 1;
  background: #fff;
}

.chat-content {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0; /* important for children with overflow */
}

.chat-header {
  background: #fff;
}

.no-chat-selected {
  background: #fafafa;
}

.messages-container {
  background: #f7f8fa;
  overflow-y: auto;
  flex: 1 1 auto; /* occupy remaining space inside .chat-content */
  min-height: 0; /* allow the container to shrink inside flex parent */
}

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
}

.message-bubble.bg-primary {
  border-bottom-right-radius: 4px;
}

/* 將預設的藍色泡泡改為淺米色，並覆寫 .text-white 的影響以維持可讀性 */
.message-bubble.bg-primary,
.message-bubble.bg-primary.text-white {
  background: #e4dcd1 !important;
  color: #000 !important;
}

.message-bubble.bg-primary .message-time small {
  color: rgba(0,0,0,0.6) !important;
}

.message-bubble.bg-light {
  border-bottom-left-radius: 4px;
  border: 1px solid #e9ecef;
}

.message-time {
  margin-top: 4px;
  text-align: right;
}

.chat-input {
  background: #fff;
}

.chat-input textarea {
  resize: none;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.chat-input textarea:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 0.2rem var(--brand-primary-focus);
}

/* 將輸入區的發送按鈕顏色改為 #022c5c（僅影響此組件） */
.chat-input .btn.btn-primary {
  background-color: #022c5c !important;
  border-color: #022c5c !important;
  color: #fff !important;
}
.chat-input .btn.btn-primary:hover,
.chat-input .btn.btn-primary:focus {
  background-color: #021f4a !important;
  border-color: #021f4a !important;
  color: #fff !important;
}

/* 滾動條樣式 */
.chat-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.chat-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.chat-list::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .chat-room-container.floating-mode {
    width: calc(100vw - 20px);
    height: calc(100vh - 40px);
    bottom: 10px;
    right: 10px;
  }
  
  .chat-sidebar {
    width: 100%;
    max-height: 40vh;
  }
  
  .chat-room {
    flex-direction: column;
  }
}
</style>
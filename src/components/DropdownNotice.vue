<template>
  <div class="dropdown-notice-container">
    <!-- 通知下拉按鈕 -->
    <div class="dropdown" ref="dropdown">
      <button 
        class="notice-dropdown-btn"
        @click="toggleDropdown"
        :class="{ 'active': isOpen, 'has-unread': hasUnreadNotices }"
      >
        <i class="fas fa-bell"></i>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
      </button>

      <!-- 下拉選單 -->
      <div class="dropdown-menu" :class="{ 'show': isOpen }">
        <!-- 選單標題 -->
        <div class="dropdown-header">
          <div class="header-content">
            <h6 class="dropdown-title">
              <i class="fas fa-bell me-2"></i>
              通知中心
            </h6>
            <div class="header-actions">
              <button 
                v-if="hasUnreadNotices" 
                @click="markAllAsRead" 
                class="btn-mark-read"
                title="全部已讀"
              >
                <i class="fas fa-check-double"></i>
              </button>
              <button 
                @click="clearAll" 
                class="btn-clear-all"
                title="清除全部"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 通知列表 -->
        <div class="dropdown-body">
          <div v-if="notices.length === 0" class="empty-state">
            <i class="fas fa-bell-slash"></i>
            <p>目前沒有通知</p>
          </div>
          
          <div v-else class="notice-list">
            <div 
              v-for="notice in displayNotices" 
              :key="notice.id"
              class="notice-item"
              :class="{ 
                'unread': !notice.acknowledged,
                [`priority-${notice.priority}`]: true 
              }"
              @click="handleNoticeClick(notice)"
            >
              <!-- 優先級指示器 -->
              <div class="priority-indicator"></div>

              <!-- 通知內容 -->
              <div class="notice-content">
                <div class="notice-header">
                  <h6 class="notice-title">{{ notice.title }}</h6>
                  <div class="notice-meta">
                    <span class="notice-time">{{ formatTime(notice.date) }}</span>
                    <span v-if="notice.priority === 'high'" class="priority-badge high">
                      緊急
                    </span>
                    <span v-else-if="notice.priority === 'medium'" class="priority-badge medium">
                      重要
                    </span>
                  </div>
                </div>
                
                <p class="notice-text">{{ getNoticePreview(notice.content) }}</p>
                
                <div class="notice-footer">
                  <span class="publisher">{{ notice.publisher || '系統' }}</span>
                  <div class="notice-actions">
                    <button 
                      v-if="!notice.acknowledged"
                      @click.stop="acknowledgeNotice(notice.id)"
                      class="btn-acknowledge"
                    >
                      已讀
                    </button>
                    <button 
                      @click.stop="removeNotice(notice.id)"
                      class="btn-remove"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 查看更多 -->
          <div v-if="notices.length > maxDisplayNotices" class="dropdown-footer">
            <button @click="showAllNotices" class="btn-show-more">
              查看全部 {{ notices.length }} 則通知
              <i class="fas fa-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知詳情模態框 -->
    <div v-if="selectedNotice" class="notice-modal-overlay" @click="closeModal">
      <div class="notice-modal" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">{{ selectedNotice.title }}</h5>
          <button @click="closeModal" class="btn-close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-meta">
            <span class="modal-time">{{ formatDateTime(selectedNotice.date) }}</span>
            <span class="modal-publisher">發布者：{{ selectedNotice.publisher }}</span>
          </div>
          <div class="modal-content" v-html="selectedNotice.content"></div>
        </div>
        <div class="modal-footer">
          <button 
            v-if="!selectedNotice.acknowledged"
            @click="acknowledgeNotice(selectedNotice.id); closeModal()"
            class="btn btn-primary"
          >
            確認已讀
          </button>
          <button @click="closeModal" class="btn btn-secondary">
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { noticeManager } from '../utils/noticeManager.js'

export default {
  name: 'DropdownNotice',
  data() {
    return {
      isOpen: false,
      notices: [],
      selectedNotice: null,
      maxDisplayNotices: 5,
      removeListener: null
    }
  },
  computed: {
    unreadCount() {
      return this.notices.filter(n => !n.acknowledged).length
    },
    hasUnreadNotices() {
      return this.unreadCount > 0
    },
    displayNotices() {
      return this.notices.slice(0, this.maxDisplayNotices)
    }
  },
  mounted() {
    this.loadNotices()
    this.setupNoticeListener()
    this.setupClickOutside()
  },
  beforeUnmount() {
    if (this.removeListener) {
      this.removeListener()
    }
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    loadNotices() {
      this.notices = noticeManager.getAllNotices()
    },
    
    setupNoticeListener() {
      this.removeListener = noticeManager.addListener((type, notice) => {
        this.loadNotices()
      })
    },

    setupClickOutside() {
      document.addEventListener('click', this.handleClickOutside)
    },

    handleClickOutside(event) {
      if (!this.$refs.dropdown?.contains(event.target)) {
        this.isOpen = false
      }
    },

    toggleDropdown() {
      this.isOpen = !this.isOpen
    },

    acknowledgeNotice(id) {
      noticeManager.acknowledgeNotice(id)
    },

    removeNotice(id) {
      noticeManager.removeNotice(id)
    },

    markAllAsRead() {
      this.notices.forEach(notice => {
        if (!notice.acknowledged) {
          noticeManager.acknowledgeNotice(notice.id)
        }
      })
    },

    clearAll() {
      if (confirm('確定要清除所有通知嗎？')) {
        noticeManager.clearAll()
        this.isOpen = false
      }
    },

    handleNoticeClick(notice) {
      this.selectedNotice = notice
      this.isOpen = false
    },

    closeModal() {
      this.selectedNotice = null
    },

    showAllNotices() {
      this.$router.push('/member/notification-overview')
      this.isOpen = false
    },

    formatTime(date) {
      const now = new Date()
      const noticeDate = new Date(date)
      const diffInMinutes = Math.floor((now - noticeDate) / 60000)
      
      if (diffInMinutes < 1) {
        return '剛剛'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} 分鐘前`
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)} 小時前`
      } else {
        return noticeDate.toLocaleDateString('zh-TW')
      }
    },

    formatDateTime(date) {
      const d = new Date(date)
      return d.toLocaleString('zh-TW')
    },

    getNoticePreview(content) {
      // 移除 HTML 標籤並截取前 60 個字符
      const text = content.replace(/<[^>]*>/g, '')
      return text.length > 60 ? text.substring(0, 60) + '...' : text
    }
  }
}
</script>

<style scoped>
.dropdown-notice-container {
  position: relative;
  z-index: 1000;
}

.dropdown {
  position: relative;
}

.notice-dropdown-btn {
  background: #007bff;
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  position: relative;
}

.notice-dropdown-btn:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.notice-dropdown-btn.active {
  background: #0056b3;
}

.notice-dropdown-btn.has-unread {
  animation: pulse 2s infinite;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #dc3545;
  color: white;
  font-size: 11px;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-width: 90vw;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1001;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-mark-read,
.btn-clear-all {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-mark-read:hover {
  color: #007bff;
  background: rgba(0, 123, 255, 0.1);
}

.btn-clear-all:hover {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.dropdown-body {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-state i {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.notice-list {
  padding: 8px 0;
}

.notice-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 12px;
  position: relative;
  border-left: 3px solid transparent;
}

.notice-item:hover {
  background: #f8f9fa;
}

.notice-item.unread {
  background: rgba(0, 123, 255, 0.05);
}

.notice-item.priority-high {
  border-left-color: #dc3545;
}

.notice-item.priority-medium {
  border-left-color: #fd7e14;
}

.notice-item.priority-normal {
  border-left-color: #007bff;
}

.notice-item.priority-low {
  border-left-color: #6c757d;
}

.priority-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #007bff;
  margin-top: 6px;
  flex-shrink: 0;
}

.notice-item.priority-high .priority-indicator {
  background: #dc3545;
}

.notice-item.priority-medium .priority-indicator {
  background: #fd7e14;
}

.notice-item.unread .priority-indicator {
  animation: blink 1.5s infinite;
}

.notice-content {
  flex: 1;
  min-width: 0;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notice-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
  margin-left: 8px;
}

.notice-time {
  font-size: 11px;
  color: #6c757d;
  white-space: nowrap;
}

.priority-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.high {
  background: #dc3545;
  color: white;
}

.priority-badge.medium {
  background: #fd7e14;
  color: white;
}

.notice-text {
  margin: 4px 0;
  font-size: 13px;
  color: #495057;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.publisher {
  font-size: 11px;
  color: #6c757d;
}

.notice-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.notice-item:hover .notice-actions {
  opacity: 1;
}

.btn-acknowledge,
.btn-remove {
  background: none;
  border: none;
  font-size: 11px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-acknowledge {
  color: #007bff;
}

.btn-acknowledge:hover {
  background: rgba(0, 123, 255, 0.1);
}

.btn-remove {
  color: #6c757d;
}

.btn-remove:hover {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.dropdown-footer {
  padding: 12px 20px;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.btn-show-more {
  background: none;
  border: none;
  color: #007bff;
  font-size: 13px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.btn-show-more:hover {
  background: rgba(0, 123, 255, 0.1);
}

/* 通知詳情模態框 */
.notice-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.notice-modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 16px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.btn-close-modal:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 13px;
  color: #6c757d;
}

.modal-content {
  line-height: 1.6;
  color: #495057;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* 動畫效果 */
@keyframes pulse {
  0% {
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  }
  50% {
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.6);
  }
  100% {
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
}

/* 響應式設計 */
@media (max-width: 480px) {
  .dropdown-menu {
    width: 320px;
    right: -140px;
  }
  
  .notice-modal {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
}
</style>

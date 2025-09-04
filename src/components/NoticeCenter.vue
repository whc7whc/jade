<template>
  <div class="notice-container">
    <!-- 浮動通知 -->
    <div class="floating-notices">
      <transition-group name="notice-slide" tag="div">
        <div
          v-for="notice in floatingNotices"
          :key="notice.id"
          class="floating-notice"
          :class="[`priority-${notice.priority}`, { 'auto-hide': notice.autoHide }]"
        >
          <SimpleNotice
            :title="notice.title"
            :content="notice.content"
            :date="notice.date"
            :priority="notice.priority"
            :acknowledged="notice.acknowledged"
            :show-actions="false"
            :closable="true"
            @close="removeNotice(notice.id)"
            @acknowledge="acknowledgeNotice(notice.id)"
          />
        </div>
      </transition-group>
    </div>

    <!-- 通知中心按鈕 -->
    <button
      class="notice-center-btn"
      @click="showNoticeCenter = !showNoticeCenter"
      :class="{ 'has-unread': hasUnreadNotices }"
    >
      <i class="fas fa-bell"></i>
      <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
    </button>

    <!-- 通知中心面板 -->
    <div v-if="showNoticeCenter" class="notice-center-panel">
      <div class="panel-header">
        <h6>通知中心</h6>
        <div class="panel-actions">
          <button @click="markAllAsRead" class="btn-link">全部已讀</button>
          <button @click="clearAllNotices" class="btn-link">清除全部</button>
          <button @click="showNoticeCenter = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="panel-body">
        <div v-if="allNotices.length === 0" class="empty-notices">
          <i class="fas fa-bell-slash"></i>
          <p>目前沒有通知</p>
        </div>
        
        <div v-else class="notices-list">
          <SimpleNotice
            v-for="notice in allNotices"
            :key="notice.id"
            :title="notice.title"
            :content="notice.content"
            :date="notice.date"
            :priority="notice.priority"
            :acknowledged="notice.acknowledged"
            :show-actions="true"
            :closable="true"
            @close="removeNotice(notice.id)"
            @acknowledge="acknowledgeNotice(notice.id)"
          />
        </div>
      </div>
    </div>

    <!-- 背景遮罩 -->
    <div
      v-if="showNoticeCenter"
      class="notice-overlay"
      @click="showNoticeCenter = false"
    ></div>
  </div>
</template>

<script>
import SimpleNotice from './SimpleNotice.vue'
import { noticeManager } from '../utils/noticeManager.js'

export default {
  name: 'NoticeCenter',
  components: {
    SimpleNotice
  },
  data() {
    return {
      showNoticeCenter: false,
      allNotices: [],
      removeListener: null
    }
  },
  computed: {
    floatingNotices() {
      return this.allNotices.filter(notice => 
        notice.autoHide && !notice.acknowledged
      ).slice(0, 3) // 最多顯示 3 個浮動通知
    },
    unreadCount() {
      return this.allNotices.filter(n => !n.acknowledged).length
    },
    hasUnreadNotices() {
      return this.unreadCount > 0
    }
  },
  mounted() {
    this.loadNotices()
    this.setupNoticeListener()

    // 點擊外部關閉通知中心
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    if (this.removeListener) {
      this.removeListener()
    }
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    loadNotices() {
      this.allNotices = noticeManager.getAllNotices()
    },
    
    setupNoticeListener() {
      this.removeListener = noticeManager.addListener((type, notice) => {
        this.loadNotices()
      })
    },

    acknowledgeNotice(id) {
      noticeManager.acknowledgeNotice(id)
    },

    removeNotice(id) {
      noticeManager.removeNotice(id)
    },

    markAllAsRead() {
      this.allNotices.forEach(notice => {
        if (!notice.acknowledged) {
          noticeManager.acknowledgeNotice(notice.id)
        }
      })
    },

    clearAllNotices() {
      noticeManager.clearAll()
      this.showNoticeCenter = false
    },

    handleClickOutside(event) {
      const panel = event.target.closest('.notice-center-panel')
      const button = event.target.closest('.notice-center-btn')
      
      if (!panel && !button && this.showNoticeCenter) {
        this.showNoticeCenter = false
      }
    }
  }
}
</script>

<style scoped>
.notice-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
}

.floating-notices {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-width: calc(100vw - 40px);
  pointer-events: auto;
  z-index: 1001;
}

.floating-notice {
  margin-bottom: 16px;
  animation: slideInRight 0.3s ease-out;
}

.notice-center-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 123, 255, 0.3);
  pointer-events: auto;
  z-index: 1000;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.notice-center-btn:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.notice-center-btn.has-unread {
  animation: pulse 2s infinite;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc3545;
  color: white;
  font-size: 12px;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.notice-center-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  z-index: 1002;
  display: flex;
  flex-direction: column;
}

.notice-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
  z-index: 1001;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.panel-header h6 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-link {
  background: none;
  border: none;
  color: #007bff;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.btn-link:hover {
  color: #0056b3;
}

.btn-close {
  background: none;
  border: none;
  font-size: 16px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.btn-close:hover {
  color: #495057;
  background: #f8f9fa;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-notices {
  text-align: center;
  color: #6c757d;
  padding: 40px 20px;
}

.empty-notices i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-notices p {
  margin: 0;
  font-size: 16px;
}

.notices-list {
  max-height: 400px;
  overflow-y: auto;
}

/* 動畫 */
.notice-slide-enter-active,
.notice-slide-leave-active {
  transition: all 0.3s ease;
}

.notice-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notice-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 16px rgba(0, 123, 255, 0.3);
  }
  50% {
    box-shadow: 0 4px 16px rgba(0, 123, 255, 0.6);
  }
  100% {
    box-shadow: 0 4px 16px rgba(0, 123, 255, 0.3);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .floating-notices {
    width: 320px;
    right: 10px;
    top: 10px;
  }

  .notice-center-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
    bottom: 20px;
    right: 20px;
  }

  .notice-center-panel {
    width: 95vw;
    max-height: 85vh;
  }

  .panel-header {
    padding: 16px;
  }

  .panel-body {
    padding: 16px;
  }

  .panel-actions {
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }
}

@media (max-width: 480px) {
  .floating-notices {
    width: calc(100vw - 20px);
    right: 10px;
  }

  .panel-header h6 {
    font-size: 16px;
  }

  .panel-actions {
    flex-direction: row;
    gap: 12px;
  }
}
</style>

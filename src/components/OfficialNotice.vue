<template>
  <div class="official-notice">
    <div class="notice-container">
      <!-- 通知圖標和標識 -->
      <div class="notice-header">
        <div class="notice-icon">
          <i class="fas fa-megaphone"></i>
        </div>
        <div class="notice-badge">
          <span class="badge-text">官方通知</span>
        </div>
      </div>

      <!-- 通知內容 -->
      <div class="notice-content">
        <!-- 日期時間 -->
        <div class="notice-datetime">
          <i class="far fa-calendar-alt"></i>
          <span class="date">{{ formatDate(notice.date) }}</span>
          <i class="far fa-clock"></i>
          <span class="time">{{ formatTime(notice.date) }}</span>
        </div>

        <!-- 標題 -->
        <h3 class="notice-title">{{ notice.title }}</h3>

        <!-- 內容 -->
        <div class="notice-body" v-html="notice.content"></div>

        <!-- 重要性標籤 -->
        <div class="notice-priority" v-if="notice.priority">
          <span class="priority-badge" :class="priorityClass">
            {{ priorityText }}
          </span>
        </div>
      </div>

      <!-- 通知底部 -->
      <div class="notice-footer">
        <div class="notice-actions">
          <button class="btn-acknowledge" @click="acknowledgeNotice" v-if="!isAcknowledged">
            <i class="fas fa-check"></i>
            我知道了
          </button>
          <span class="acknowledged-text" v-else>
            <i class="fas fa-check-circle"></i>
            已確認
          </span>
        </div>
        <div class="notice-meta">
          <span class="publisher">發布者：{{ notice.publisher || '系統管理員' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OfficialNotice',
  props: {
    notice: {
      type: Object,
      required: true,
      default: () => ({
        title: '',
        content: '',
        date: new Date(),
        priority: 'normal',
        publisher: '系統管理員'
      })
    },
    acknowledged: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isAcknowledged: this.acknowledged
    }
  },
  computed: {
    priorityClass() {
      const priorityMap = {
        high: 'priority-high',
        medium: 'priority-medium',
        normal: 'priority-normal',
        low: 'priority-low'
      }
      return priorityMap[this.notice.priority] || 'priority-normal'
    },
    priorityText() {
      const textMap = {
        high: '緊急',
        medium: '重要',
        normal: '一般',
        low: '提醒'
      }
      return textMap[this.notice.priority] || '一般'
    }
  },
  methods: {
    formatDate(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}年${month}月${day}日`
    },
    formatTime(date) {
      const d = new Date(date)
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    },
    acknowledgeNotice() {
      this.isAcknowledged = true
      this.$emit('acknowledge', this.notice.id)
    }
  }
}
</script>

<style scoped>
.official-notice {
  margin: 20px 0;
  animation: slideIn 0.5s ease-out;
}

.notice-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  color: white;
  position: relative;
  overflow: hidden;
}

.notice-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  opacity: 0.6;
  pointer-events: none;
}

.notice-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.notice-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.notice-icon i {
  font-size: 24px;
  color: #fff;
}

.notice-badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 8px 20px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-text {
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.notice-content {
  margin-bottom: 20px;
}

.notice-datetime {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  opacity: 0.9;
}

.notice-datetime i {
  margin-right: 5px;
}

.notice-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 15px;
  line-height: 1.3;
  color: #fff;
}

.notice-body {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  opacity: 0.95;
}

.notice-body p {
  margin-bottom: 10px;
}

.notice-body strong {
  font-weight: 600;
}

.notice-priority {
  margin-bottom: 20px;
}

.priority-badge {
  display: inline-block;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-high {
  background: #ff4757;
  color: white;
  animation: pulse 2s infinite;
}

.priority-medium {
  background: #ffa502;
  color: white;
}

.priority-normal {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.priority-low {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.notice-actions {
  display: flex;
  gap: 10px;
}

.btn-acknowledge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-acknowledge:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.acknowledged-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4ade80;
  font-weight: 500;
}

.notice-meta {
  font-size: 12px;
  opacity: 0.8;
}

/* 動畫效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 71, 87, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 71, 87, 0);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .notice-container {
    padding: 20px;
    margin: 0 10px;
  }
  
  .notice-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .notice-title {
    font-size: 20px;
  }
  
  .notice-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .notice-datetime {
    flex-wrap: wrap;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .notice-container {
    padding: 15px;
  }
  
  .notice-title {
    font-size: 18px;
  }
  
  .notice-body {
    font-size: 14px;
  }
}

/* 暗色主題變體 */
.official-notice.dark-theme .notice-container {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

/* 成功主題變體 */
.official-notice.success-theme .notice-container {
  background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
}

/* 警告主題變體 */
.official-notice.warning-theme .notice-container {
  background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
}

/* 錯誤主題變體 */
.official-notice.error-theme .notice-container {
  background: linear-gradient(135deg, #d63031 0%, #e84393 100%);
}
</style>

<template>
  <div class="simple-notice" :class="[priorityClass, { 'acknowledged': acknowledged }]">
    <div class="notice-wrapper">
      <!-- 通知圖標 -->
      <div class="notice-icon">
        <i class="fas fa-bell"></i>
      </div>

      <!-- 通知內容 -->
      <div class="notice-content">
        <!-- 日期時間 -->
        <div class="notice-meta">
          <span class="notice-date">{{ formatDateTime(date) }}</span>
          <span class="notice-priority">{{ priorityLabel }}</span>
        </div>

        <!-- 標題 -->
        <h4 class="notice-title">{{ title }}</h4>

        <!-- 內容 -->
        <div class="notice-text">{{ content }}</div>

        <!-- 操作按鈕 -->
        <div class="notice-actions" v-if="showActions">
          <button 
            v-if="!acknowledged" 
            @click="handleAcknowledge" 
            class="btn-acknowledge"
          >
            確認已讀
          </button>
          <span v-else class="acknowledged-label">
            <i class="fas fa-check-circle"></i>
            已確認
          </span>
        </div>
      </div>

      <!-- 關閉按鈕 -->
      <button v-if="closable" @click="$emit('close')" class="btn-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleNotice',
  emits: ['acknowledge', 'close'],
  props: {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    date: {
      type: [String, Date],
      default: () => new Date()
    },
    priority: {
      type: String,
      default: 'normal',
      validator: value => ['high', 'medium', 'normal', 'low'].includes(value)
    },
    acknowledged: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: true
    },
    closable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    priorityClass() {
      return `priority-${this.priority}`
    },
    priorityLabel() {
      const labels = {
        high: '緊急',
        medium: '重要', 
        normal: '一般',
        low: '提醒'
      }
      return labels[this.priority] || '一般'
    }
  },
  methods: {
    formatDateTime(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      
      return `${year}/${month}/${day} ${hours}:${minutes}`
    },
    handleAcknowledge() {
      this.$emit('acknowledge')
    }
  }
}
</script>

<style scoped>
.simple-notice {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.simple-notice:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.notice-wrapper {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  gap: 16px;
  position: relative;
}

.notice-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.notice-content {
  flex: 1;
}

.notice-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
}

.notice-date {
  color: #6c757d;
}

.notice-priority {
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notice-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.notice-text {
  font-size: 14px;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 16px;
}

.notice-actions {
  display: flex;
  align-items: center;
}

.btn-acknowledge {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-acknowledge:hover {
  background: #0056b3;
}

.acknowledged-label {
  color: #28a745;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 16px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-close:hover {
  color: #495057;
  background: #f8f9fa;
}

/* 優先級樣式 */
.priority-high {
  border-left: 4px solid #dc3545;
}

.priority-high .notice-icon {
  background: #dc3545;
}

.priority-high .notice-priority {
  background: #dc3545;
  color: white;
}

.priority-medium {
  border-left: 4px solid #fd7e14;
}

.priority-medium .notice-icon {
  background: #fd7e14;
}

.priority-medium .notice-priority {
  background: #fd7e14;
  color: white;
}

.priority-normal {
  border-left: 4px solid #007bff;
}

.priority-normal .notice-icon {
  background: #007bff;
}

.priority-normal .notice-priority {
  background: #007bff;
  color: white;
}

.priority-low {
  border-left: 4px solid #6c757d;
}

.priority-low .notice-icon {
  background: #6c757d;
}

.priority-low .notice-priority {
  background: #6c757d;
  color: white;
}

/* 已確認狀態 */
.simple-notice.acknowledged {
  opacity: 0.7;
  background: #f8f9fa;
}

.simple-notice.acknowledged .notice-title {
  color: #6c757d;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .notice-wrapper {
    padding: 16px;
    gap: 12px;
  }
  
  .notice-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .notice-title {
    font-size: 16px;
  }
  
  .notice-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .notice-wrapper {
    flex-direction: column;
    gap: 16px;
  }
  
  .notice-icon {
    align-self: flex-start;
  }
  
  .btn-close {
    position: static;
    align-self: flex-end;
    margin-top: -32px;
  }
}
</style>

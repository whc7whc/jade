<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">
    <div v-for="toast in toasts" 
         :key="toast.id"
         :class="[
           'toast', 
           'show',
           'fade-in',
           `toast-${toast.type}`
         ]"
         role="alert">
      <div class="toast-header">
        <i :class="getIconClass(toast.type)" class="me-2"></i>
        <strong class="me-auto">{{ getTitle(toast.type) }}</strong>
        <small>{{ formatTime(toast.createdAt) }}</small>
        <button type="button" 
                class="btn-close" 
                @click="removeToast(toast.id)"></button>
      </div>
      <div class="toast-body">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToastNotification',
  data() {
    return {
      toasts: []
    }
  },
  methods: {
    // 顯示通知
    show(message, type = 'info', duration = 5000) {
      const toast = {
        id: Date.now() + Math.random(),
        message,
        type,
        createdAt: new Date(),
        duration
      }
      
      this.toasts.push(toast)
      
      // 自動移除
      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(toast.id)
        }, duration)
      }
      
      return toast.id
    },
    
    // 移除通知
    removeToast(id) {
      const index = this.toasts.findIndex(toast => toast.id === id)
      if (index > -1) {
        this.toasts.splice(index, 1)
      }
    },
    
    // 清除所有通知
    clear() {
      this.toasts = []
    },
    
    // 獲取圖標類別
    getIconClass(type) {
      const icons = {
        success: 'fas fa-check-circle text-success',
        error: 'fas fa-exclamation-circle text-danger',
        warning: 'fas fa-exclamation-triangle text-warning',
        info: 'fas fa-info-circle text-info'
      }
      return icons[type] || icons.info
    },
    
    // 獲取標題
    getTitle(type) {
      const titles = {
        success: '成功',
        error: '錯誤',
        warning: '警告',
        info: '提示'
      }
      return titles[type] || titles.info
    },
    
    // 格式化時間
    formatTime(date) {
      return date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    // 便捷方法
    success(message, duration = 5000) {
      return this.show(message, 'success', duration)
    },
    
    error(message, duration = 8000) {
      return this.show(message, 'error', duration)
    },
    
    warning(message, duration = 6000) {
      return this.show(message, 'warning', duration)
    },
    
    info(message, duration = 5000) {
      return this.show(message, 'info', duration)
    }
  }
}
</script>

<style scoped>
.toast-container {
  z-index: 9999 !important;
}

.toast {
  min-width: 350px;
  margin-bottom: 0.5rem;
  border: none;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.toast-success {
  border-left: 4px solid #28a745;
}

.toast-error {
  border-left: 4px solid #dc3545;
}

.toast-warning {
  border-left: 4px solid #ffc107;
}

.toast-info {
  border-left: 4px solid #17a2b8;
}

.toast-header {
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1rem 0.5rem;
}

.toast-body {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.fade-in {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 響應式調整 */
@media (max-width: 576px) {
  .toast {
    min-width: 280px;
    margin: 0 1rem 0.5rem 1rem;
  }
  
  .toast-container {
    right: 0 !important;
    left: 0 !important;
    padding: 1rem !important;
  }
}
</style>

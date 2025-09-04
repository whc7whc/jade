<template>
  <!-- Toast 通知 -->
  <div 
    v-for="toast in toasts" 
    :key="toast.id"
    class="toast-notification"
    :class="`toast-${toast.type}`"
  >
    <div class="d-flex align-items-center">
      <i :class="getToastIcon(toast.type)" class="me-2"></i>
      {{ toast.message }}
      <button 
        type="button" 
        class="btn-close ms-auto" 
        @click="$emit('remove-toast', toast.id)"
      ></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToastNotification',
  props: {
    toasts: {
      type: Array,
      required: true
    },
    getToastIcon: {
      type: Function,
      required: true
    }
  },
  emits: ['remove-toast']
}
</script>

<style scoped>
/* Toast 通知樣式 */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 300px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 10px;
  animation: slideIn 0.3s ease;
}

.toast-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.toast-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.toast-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.toast-info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>

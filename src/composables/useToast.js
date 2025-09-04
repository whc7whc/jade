// Toast 通知 Composable
import { ref } from 'vue'

export function useToast() {
  const toasts = ref([])

  const showToast = (message, type = 'info') => {
    const toast = {
      id: Date.now(),
      message,
      type
    }
    toasts.value.push(toast)
    
    setTimeout(() => {
      removeToast(toast.id)
    }, 3000)
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle'
      case 'error': return 'fas fa-exclamation-triangle'
      case 'warning': return 'fas fa-exclamation-circle'
      default: return 'fas fa-info-circle'
    }
  }

  return {
    toasts,
    showToast,
    removeToast,
    getToastIcon
  }
}

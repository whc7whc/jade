// 簡單的 Toast 通知系統
class ToastService {
  constructor() {
    this.container = null
    this.createContainer()
  }

  createContainer() {
    // 創建 Toast 容器
    this.container = document.createElement('div')
    this.container.id = 'toast-container'
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `
    document.body.appendChild(this.container)
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div')
    toast.style.cssText = `
      background: ${this.getBackgroundColor(type)};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transform: translateX(100%);
      transition: all 0.3s ease;
      pointer-events: auto;
      min-width: 250px;
      font-size: 14px;
      font-weight: 500;
    `

    const icon = this.getIcon(type)
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
      </div>
    `

    this.container.appendChild(toast)

    // 動畫顯示
    setTimeout(() => {
      toast.style.transform = 'translateX(0)'
    }, 10)

    // 自動隱藏
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, duration)

    return toast
  }

  success(message, duration) {
    return this.show(message, 'success', duration)
  }

  error(message, duration) {
    return this.show(message, 'error', duration)
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration)
  }

  info(message, duration) {
    return this.show(message, 'info', duration)
  }

  getBackgroundColor(type) {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    }
    return colors[type] || colors.info
  }

  getIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-triangle',
      warning: 'exclamation-circle',
      info: 'info-circle'
    }
    return icons[type] || icons.info
  }
}

// 創建全局實例
const toastService = new ToastService()

// Vue 插件
const ToastPlugin = {
  install(app) {
    app.config.globalProperties.$toast = toastService
    app.provide('toast', toastService)
  }
}

export default toastService
export { ToastPlugin }

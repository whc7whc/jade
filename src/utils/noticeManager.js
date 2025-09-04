// 通知管理系統
class NoticeManager {
    constructor() {
        this.notices = []
        this.listeners = []
    }

    // 添加通知
    addNotice(notice) {
        const id = Date.now() + Math.random()
        const newNotice = {
            id,
            title: notice.title || '系統通知',
            content: notice.content || '',
            date: notice.date || new Date(),
            priority: notice.priority || 'normal',
            acknowledged: false,
            persistent: notice.persistent || false,
            publisher: notice.publisher || '系統',
            ...notice
        }

        this.notices.unshift(newNotice)
        this.notifyListeners('add', newNotice)

        return id
    }

    // 移除通知
    removeNotice(id) {
        const index = this.notices.findIndex(n => n.id === id)
        if (index > -1) {
            const notice = this.notices[index]
            this.notices.splice(index, 1)
            this.notifyListeners('remove', notice)
        }
    }

    // 確認通知
    acknowledgeNotice(id) {
        const notice = this.notices.find(n => n.id === id)
        if (notice) {
            notice.acknowledged = true
            this.notifyListeners('acknowledge', notice)
        }
    }

    // 獲取所有通知
    getAllNotices() {
        return [...this.notices]
    }

    // 獲取未確認通知
    getUnacknowledgedNotices() {
        return this.notices.filter(n => !n.acknowledged)
    }

    // 獲取特定優先級的通知
    getNoticesByPriority(priority) {
        return this.notices.filter(n => n.priority === priority)
    }

    // 清除所有已確認的通知
    clearAcknowledged() {
        const acknowledged = this.notices.filter(n => n.acknowledged)
        this.notices = this.notices.filter(n => !n.acknowledged)
        acknowledged.forEach(notice => {
            this.notifyListeners('remove', notice)
        })
    }

    // 清除所有通知
    clearAll() {
        const allNotices = [...this.notices]
        this.notices = []
        allNotices.forEach(notice => {
            this.notifyListeners('remove', notice)
        })
    }

    // 添加監聽器
    addListener(callback) {
        this.listeners.push(callback)
        return () => {
            const index = this.listeners.indexOf(callback)
            if (index > -1) {
                this.listeners.splice(index, 1)
            }
        }
    }

    // 通知所有監聽器
    notifyListeners(type, notice) {
        this.listeners.forEach(callback => {
            try {
                callback(type, notice)
            } catch (error) {
                console.error('通知監聽器錯誤:', error)
            }
        })
    }

    // 從 localStorage 載入通知
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('app_notices')
            if (saved) {
                const parsed = JSON.parse(saved)
                this.notices = parsed.map(notice => ({
                    ...notice,
                    date: new Date(notice.date)
                }))
            }
        } catch (error) {
            console.error('載入通知失敗:', error)
        }
    }

    // 保存通知到 localStorage
    saveToStorage() {
        try {
            // 只保存持久通知
            const persistentNotices = this.notices.filter(n => n.persistent)
            localStorage.setItem('app_notices', JSON.stringify(persistentNotices))
        } catch (error) {
            console.error('保存通知失敗:', error)
        }
    }

    // 創建預設通知類型的快捷方法
    success(message, options = {}) {
        return this.addNotice({
            title: '操作成功',
            content: message,
            priority: 'low',
            ...options
        })
    }

    info(message, options = {}) {
        return this.addNotice({
            title: '提示訊息',
            content: message,
            priority: 'normal',
            ...options
        })
    }

    warning(message, options = {}) {
        return this.addNotice({
            title: '警告訊息',
            content: message,
            priority: 'medium',
            persistent: true,
            ...options
        })
    }

    error(message, options = {}) {
        return this.addNotice({
            title: '錯誤訊息',
            content: message,
            priority: 'high',
            persistent: true,
            ...options
        })
    }

    // 系統公告
    announcement(title, content, options = {}) {
        return this.addNotice({
            title,
            content,
            priority: 'medium',
            persistent: true,
            publisher: '官方公告',
            ...options
        })
    }
}

// 創建全域實例
const noticeManager = new NoticeManager()

// Vue 插件
const NoticePlugin = {
    install(app) {
        // 載入保存的通知
        noticeManager.loadFromStorage()

        // 添加全域屬性
        app.config.globalProperties.$notice = noticeManager
        app.provide('noticeManager', noticeManager)

        // 在應用關閉前保存通知
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                noticeManager.saveToStorage()
            })
        }
    }
}

export { noticeManager, NoticePlugin }
export default NoticePlugin

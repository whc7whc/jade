// 簡單的事件匯流排實現 - 不依賴外部庫
class EventBus {
    constructor() {
        this.events = {}
    }

    // 註冊事件監聽器
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = []
        }
        this.events[event].push(callback)
    }

    // 移除事件監聽器
    off(event, callback) {
        if (!this.events[event]) return

        if (callback) {
            // 移除特定的監聽器
            const index = this.events[event].indexOf(callback)
            if (index > -1) {
                this.events[event].splice(index, 1)
            }
        } else {
            // 移除所有監聽器
            delete this.events[event]
        }
    }

    // 觸發事件
    emit(event, data) {
        if (!this.events[event]) return

        // 過濾掉無效的回調函數
        this.events[event] = this.events[event].filter(callback => typeof callback === 'function')

        this.events[event].forEach(callback => {
            try {
                if (typeof callback === 'function') {
                    callback(data)
                }
            } catch (error) {
                console.error(`EventBus error in ${event}:`, error)
            }
        })
    }

    // 註冊一次性事件監聽器
    once(event, callback) {
        const onceCallback = (data) => {
            callback(data)
            this.off(event, onceCallback)
        }
        this.on(event, onceCallback)
    }

    // 取得所有事件名稱
    getEvents() {
        return Object.keys(this.events)
    }

    // 清除所有事件
    clear() {
        this.events = {}
    }
}

// 創建全域事件匯流排實例
const eventBus = new EventBus()

// 全域事件匯流排插件
export default {
    install(app) {
        // 在全域屬性中提供事件匯流排
        app.config.globalProperties.$eventBus = eventBus
        app.provide('eventBus', eventBus)
    }
}

// 直接匯出實例供其他地方使用
export { eventBus }

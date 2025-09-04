import axios from 'axios'
import userIdentityService from './userIdentityService'

// API 基礎 URL
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://localhost:7106/api'

// 創建專用的 axios 實例
const memberLevelApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// 請求攔截器 - 添加認證 token
memberLevelApi.interceptors.request.use(
    (config) => {
        // 從 localStorage 獲取 token
        const authToken = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`
        }
        return config
    },
    (error) => {
        console.error('MemberLevel Request interceptor error:', error)
        return Promise.reject(error)
    }
)

// 響應攔截器 - 處理錯誤
memberLevelApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('MemberLevel API Error:', error.response || error.message)

        // 401 未授權 - 清除 token 並跳轉登入
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('auth_token')
            localStorage.removeItem('currentUser')
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

/**
 * 會員等級服務類
 */
class MemberLevelService {

    /**
     * 獲取當前使用者的 memberId（使用統一的身份服務）
     * @returns {number|null} 會員 ID
     */
    getCurrentMemberId() {
        const memberId = userIdentityService.getMemberId()
        console.log('MemberLevel: 獲取會員 ID:', memberId)
        return memberId
    }

    /**
     * 獲取會員等級摘要資訊
     * @returns {Promise<Object>} 等級摘要響應
     */
    async getLevelSummary() {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('無法獲取會員資訊，請先登入或確認您是會員用戶')
            }

            console.log('MemberLevel: 正在為會員 ID', memberId, '獲取等級摘要')

            const response = await memberLevelApi.get(`/Members/${memberId}/Level/Summary`)

            console.log('MemberLevel: 成功獲取等級摘要:', response.data)
            return response.data
        } catch (error) {
            console.error('MemberLevel: 獲取等級摘要失敗:', error)

            if (error.message.includes('無法獲取會員資訊')) {
                throw error
            }

            if (error.response?.status === 404) {
                // 🔧 修正：會員等級資料不存在，嘗試初始化
                console.log('MemberLevel: 會員等級資料不存在，嘗試初始化...')

                try {
                    // 重新獲取 memberId 以確保在 catch 塊中可用
                    const memberIdForInit = this.getCurrentMemberId()
                    if (!memberIdForInit) {
                        throw new Error('無法獲取會員資訊進行初始化')
                    }

                    // 嘗試初始化會員統計資料
                    const initResult = await this.initializeMemberStats(memberIdForInit)
                    if (initResult) {
                        console.log('MemberLevel: 初始化成功，使用初始化後的資料')
                        return initResult
                    }
                } catch (initError) {
                    console.warn('MemberLevel: 初始化失敗，使用預設資料:', initError)
                }

                // 如果初始化失敗，使用預設資料
                console.log('MemberLevel: 使用預設等級資訊')
                return this.createDefaultMemberLevelSummary()
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒有權限查看等級資料，請重新登入')
            }

            throw new Error('獲取等級摘要失敗，請稍後再試')
        }
    }

    /**
     * 為新會員創建預設等級摘要
     * @returns {Object} 預設等級摘要
     */
    createDefaultMemberLevelSummary() {
        const defaultLevel = {
            id: 1,
            name: "銅卡會員",
            requiredAmount: 0,
            description: "新會員預設等級"
        }

        const nextLevel = {
            id: 2,
            name: "銀卡會員",
            requiredAmount: 1000,
            description: "進階會員等級"
        }

        console.log('MemberLevel: 創建新會員預設等級摘要')

        return {
            currentLevel: defaultLevel,
            nextLevel: nextLevel,
            totalSpent: 0,
            progress: {
                percentage: 0,
                currentAmount: 0,
                requiredForNext: 1000,
                isMaxLevel: false
            }
        }
    }

    /**
     * 獲取所有會員等級列表 (新API)
     * @param {Object} options - 查詢選項
     * @param {boolean} options.activeOnly - 只顯示啟用的等級 (預設: true)
     * @param {boolean} options.includeDescription - 是否包含等級描述 (預設: true)
     * @param {boolean} options.includeMonthlyCoupon - 是否包含每月配券ID (預設: false)
     * @param {number} options.pageSize - 每頁筆數 (預設: 100)
     * @returns {Promise<Array>} 等級列表
     */
    async getAllMembershipLevels(options = {}) {
        try {
            const {
                activeOnly = true,
                includeDescription = true,
                includeMonthlyCoupon = false,
                pageSize = 100
            } = options

            console.log('MemberLevel: 正在獲取會員等級列表...')

            // 建構查詢參數
            const params = new URLSearchParams({
                activeOnly: activeOnly.toString(),
                includeDescription: includeDescription.toString(),
                includeMonthlyCoupon: includeMonthlyCoupon.toString(),
                pageSize: pageSize.toString()
            })

            // 使用公開API，不需要認證
            const response = await axios.get(`${memberLevelApi.defaults.baseURL}/MembershipLevels?${params}`)

            if (response.data.success) {
                console.log('MemberLevel: 成功獲取等級列表:', response.data.data)
                return response.data.data || []
            } else {
                throw new Error(response.data.message || '獲取等級列表失敗')
            }
        } catch (error) {
            console.error('MemberLevel: 獲取等級列表失敗:', error)

            // 如果API失敗，返回本地備用資料
            console.log('MemberLevel: 使用本地備用等級資料')
            return this.getLocalFallbackLevels()
        }
    }

    /**
     * 獲取會員等級統計資料
     * @returns {Promise<Object>} 統計資料
     */
    async getMembershipLevelStats() {
        try {
            console.log('MemberLevel: 正在獲取等級統計...')

            const response = await axios.get(`${memberLevelApi.defaults.baseURL}/MembershipLevels/Stats`)

            // 檢查回應格式
            if (response.data) {
                // 如果是包裝格式 {success: true, data: {...}}
                if (response.data.success && response.data.data) {
                    console.log('MemberLevel: 成功獲取等級統計 (包裝格式):', response.data.data)
                    return response.data.data
                }
                // 如果是直接返回統計物件 {totalLevels: 3, activeLevels: 3, ...}
                else if (response.data.totalLevels !== undefined) {
                    console.log('MemberLevel: 成功獲取等級統計 (直接格式):', response.data)
                    return response.data
                }
                // 其他情況
                else {
                    console.log('MemberLevel: 統計API回應格式異常:', response.data)
                    throw new Error('統計API回應格式不正確')
                }
            } else {
                throw new Error('統計API無回應資料')
            }
        } catch (error) {
            console.error('MemberLevel: 獲取等級統計失敗:', error)
            return null
        }
    }    /**
     * 本地備用等級資料 (API失效時使用)
     * @returns {Array} 本地等級列表
     */
    getLocalFallbackLevels() {
        return [
            {
                id: 1,
                levelName: "銅卡會員",
                requiredAmount: 0,
                isActive: true,
                description: "新會員預設等級",
                // 本地樣式配置
                icon: "fas fa-medal",
                color: "#CD7F32",
                benefits: this.getLocalBenefitsByLevelId(1)
            },
            {
                id: 2,
                levelName: "銀卡會員",
                requiredAmount: 1000,
                isActive: true,
                description: "進階會員等級",
                icon: "fas fa-medal",
                color: "#C0C0C0",
                benefits: this.getLocalBenefitsByLevelId(2)
            },
            {
                id: 3,
                levelName: "金卡會員",
                requiredAmount: 3000,
                isActive: true,
                description: "高級會員等級",
                icon: "fas fa-medal",
                color: "#FFD700",
                benefits: this.getLocalBenefitsByLevelId(3)
            }
        ]
    }
    async recalculateLevel() {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('無法獲取會員資訊，請先登入或確認您是會員用戶')
            }

            console.log('MemberLevel: 正在為會員 ID', memberId, '重新計算等級')

            const response = await memberLevelApi.post(`/Members/${memberId}/Level/Recalculate`)

            console.log('MemberLevel: 成功重新計算等級:', response.data)
            return response.data
        } catch (error) {
            console.error('MemberLevel: 重新計算等級失敗:', error)

            if (error.message.includes('無法獲取會員資訊')) {
                throw error
            }

            if (error.response?.status === 404) {
                throw new Error('會員不存在或無等級資料')
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒有權限重新計算等級，請重新登入')
            }

            throw new Error('重新計算等級失敗，請稍後再試')
        }
    }

    /**
     * 格式化金額顯示
     * @param {number} amount - 金額
     * @returns {string} 格式化後的金額
     */
    formatAmount(amount) {
        return (amount || 0).toLocaleString('zh-TW')
    }

    /**
     * 格式化日期顯示
     * @param {string} dateString - ISO 日期字串
     * @returns {string} 格式化後的日期
     */
    formatDate(dateString) {
        if (!dateString) return ''

        try {
            return new Date(dateString).toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            console.warn('MemberLevel: 日期格式化失敗:', dateString, error)
            return dateString
        }
    }

    /**
     * 根據等級 ID 獲取本地權益資訊（備用）
     * @param {number} levelId - 等級 ID
     * @returns {Array} 權益陣列
     */
    getLocalBenefitsByLevelId(levelId) {
        const localBenefits = {
            1: [ // 銅卡會員
                {
                    id: 1,
                    title: "基本購物權益",
                    description: "享有平台基本購物服務",
                    icon: "fas fa-shopping-cart",
                    color: "#CD7F32"
                },
                {
                    id: 2,
                    title: "生日優惠",
                    description: "生日當月享 9 折優惠",
                    icon: "fas fa-birthday-cake",
                    color: "#CD7F32"
                }
            ],
            2: [ // 銀卡會員
                {
                    id: 3,
                    title: "免運費優惠",
                    description: "單筆消費滿 800 元免運費",
                    icon: "fas fa-shipping-fast",
                    color: "#C0C0C0"
                },
                {
                    id: 4,
                    title: "會員專屬折扣",
                    description: "享有會員專屬 95 折優惠",
                    icon: "fas fa-percent",
                    color: "#C0C0C0"
                },
                {
                    id: 5,
                    title: "優先客服",
                    description: "享有優先客服處理權",
                    icon: "fas fa-headset",
                    color: "#C0C0C0"
                }
            ],
            3: [ // 金卡會員
                {
                    id: 6,
                    title: "全站免運",
                    description: "全站商品免運費",
                    icon: "fas fa-truck",
                    color: "#FFD700"
                },
                {
                    id: 7,
                    title: "VIP 折扣",
                    description: "享有 VIP 專屬 9 折優惠",
                    icon: "fas fa-crown",
                    color: "#FFD700"
                },
                {
                    id: 8,
                    title: "專屬客服",
                    description: "一對一專屬客服服務",
                    icon: "fas fa-user-tie",
                    color: "#FFD700"
                },
                {
                    id: 9,
                    title: "生日禮品",
                    description: "生日月份專屬禮品",
                    icon: "fas fa-gift",
                    color: "#FFD700"
                }
            ]
        }

        return localBenefits[levelId] || []
    }

    /**
     * 根據等級 ID 或等級物件獲取等級樣式資訊
     * @param {number|Object} levelIdOrObject - 等級 ID 或等級物件
     * @returns {Object} 樣式資訊
     */
    getLevelStyleInfo(levelIdOrObject) {
        let levelId = levelIdOrObject

        // 如果傳入的是等級物件，提取ID
        if (typeof levelIdOrObject === 'object' && levelIdOrObject.id) {
            levelId = levelIdOrObject.id
        }

        const styleInfo = {
            1: {
                name: "銅卡會員",
                icon: "fas fa-medal",
                color: "#CD7F32",
                progressClass: "bg-secondary"
            },
            2: {
                name: "銀卡會員",
                icon: "fas fa-medal",
                color: "#C0C0C0",
                progressClass: "bg-info"
            },
            3: {
                name: "金卡會員",
                icon: "fas fa-medal",
                color: "#FFD700",
                progressClass: "bg-warning"
            }
        }

        return styleInfo[levelId] || {
            name: "未知等級",
            icon: "fas fa-question",
            color: "#999999",
            progressClass: "bg-secondary"
        }
    }

    /**
     * 將新API的等級資料轉換為前端需要的格式
     * @param {Array} apiLevels - 來自API的等級資料
     * @returns {Array} 轉換後的等級資料
     */
    transformApiLevelsToFrontend(apiLevels) {
        return apiLevels.map(level => {
            const styleInfo = this.getLevelStyleInfo(level.id)

            return {
                id: level.id,
                name: level.levelName, // API用 levelName，前端用 name
                requiredPoints: level.requiredAmount, // API用 requiredAmount，前端用 requiredPoints
                description: level.description || styleInfo.name,
                isActive: level.isActive,
                monthlyCouponId: level.monthlyCouponId,
                // 前端額外的樣式資訊
                icon: styleInfo.icon,
                color: styleInfo.color,
                progressClass: styleInfo.progressClass,
                // 權益資訊（暫時使用本地資料，未來可從API獲取）
                benefits: this.getLocalBenefitsByLevelId(level.id)
            }
        })
    }

    /**
     * 初始化新會員的統計資料
     * @param {number} memberId - 會員 ID
     * @returns {Promise<Object>} 初始化結果
     */
    async initializeMemberStats(memberId) {
        try {
            console.log('MemberLevel: 正在為會員', memberId, '初始化統計資料...')

            // 嘗試調用後端 API 建立會員統計資料
            const response = await memberLevelApi.post(`/Members/${memberId}/stats/initialize`)

            console.log('MemberLevel: 會員統計資料初始化成功:', response.data)
            return response.data
        } catch (error) {
            console.error('MemberLevel: 初始化會員統計資料失敗:', error)

            // 如果是 404 錯誤，可能是後端沒有這個 API
            if (error.response?.status === 404) {
                console.log('MemberLevel: 後端沒有初始化 API，嘗試其他方法')

                // 嘗試調用等級摘要 API，這可能會觸發後端自動建立統計資料
                try {
                    const summaryResponse = await memberLevelApi.get(`/Members/${memberId}/Level/Summary`)
                    console.log('MemberLevel: 透過等級摘要 API 成功觸發統計資料建立')
                    return summaryResponse.data
                } catch (summaryError) {
                    console.warn('MemberLevel: 等級摘要 API 也失敗，使用預設資料')
                    return this.createDefaultMemberLevelSummary()
                }
            }

            throw error
        }
    }
}

// 創建並匯出服務實例
const memberLevelService = new MemberLevelService()

export default memberLevelService
export { MemberLevelService }

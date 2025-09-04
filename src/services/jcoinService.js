import axios from 'axios'
import userIdentityService from './userIdentityService'

// API 基礎 URL
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://localhost:7106/api'

// 創建專用的 axios 實例
const jcoinApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// 請求攔截器 - 添加認證 token
jcoinApi.interceptors.request.use(
    (config) => {
        // 從 localStorage 獲取 token
        const authToken = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`
        }
        return config
    },
    (error) => {
        console.error('JCoin Request interceptor error:', error)
        return Promise.reject(error)
    }
)

// 響應攔截器 - 處理錯誤
jcoinApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('JCoin API Error:', error.response || error.message)

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
 * JCoin 點數服務類
 */
class JCoinService {

    /**
     * 獲取當前使用者的 memberId（使用統一的身份服務）
     * @returns {number|null} 會員 ID
     */
    getCurrentMemberId() {
        const memberId = userIdentityService.getMemberId()
        console.log('JCoin: 獲取會員 ID:', memberId)
        return memberId
    }

    /**
     * 獲取會員點數餘額
     * @returns {Promise<Object>} 點數餘額響應
     */
    async getBalance() {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('無法獲取會員資訊，請先登入或確認您是會員用戶')
            }

            console.log('JCoin: 正在為會員 ID', memberId, '獲取點數餘額')

            const response = await jcoinApi.get(`/Members/${memberId}/Points/Balance`)

            console.log('JCoin: 成功獲取點數餘額:', response.data)
            return response.data
        } catch (error) {
            console.error('JCoin: 獲取點數餘額失敗:', error)

            if (error.message.includes('無法獲取會員資訊')) {
                throw error
            }

            if (error.response?.status === 404) {
                throw new Error('會員不存在或無點數資料')
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒有權限查看點數資料，請重新登入')
            }

            throw new Error('獲取點數餘額失敗，請稍後再試')
        }
    }

    /**
     * 獲取會員點數歷史記錄
     * @param {Object} params - 查詢參數
     * @param {number} params.page - 頁碼 (預設 1)
     * @param {number} params.pageSize - 每頁筆數 (預設 20)
     * @param {string} params.type - 類型篩選 (signin|used|refund|earned|expired|adjustment)
     * @param {string} params.startDate - 開始日期 (YYYY-MM-DD)
     * @param {string} params.endDate - 結束日期 (YYYY-MM-DD)
     * @returns {Promise<Object>} 點數歷史響應
     */
    async getHistory(params = {}) {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('無法獲取會員資訊，請先登入或確認您是會員用戶')
            }

            console.log('JCoin: 正在為會員 ID', memberId, '獲取點數歷史，參數:', params)

            const queryParams = new URLSearchParams()

            // 設定分頁參數
            queryParams.append('page', params.page || 1)
            queryParams.append('pageSize', params.pageSize || 20)

            // 設定篩選條件
            if (params.type) {
                queryParams.append('type', params.type)
            }
            if (params.startDate) {
                queryParams.append('startDate', params.startDate)
            }
            if (params.endDate) {
                queryParams.append('endDate', params.endDate)
            }

            const url = `/Members/${memberId}/Points/History?${queryParams.toString()}`
            console.log('JCoin: 請求 URL:', url)

            const response = await jcoinApi.get(url)

            console.log('JCoin: 成功獲取點數歷史:', response.data)

            // 轉換 API 回傳格式以符合前端期望
            const apiData = response.data
            return {
                items: apiData.data || [],
                total: apiData.totalCount || 0,
                page: apiData.currentPage || 1,
                pageSize: apiData.itemsPerPage || 20,
                totalPages: apiData.totalPages || 1,
                success: apiData.success,
                message: apiData.message
            }
        } catch (error) {
            console.error('JCoin: 獲取點數歷史失敗:', error)

            if (error.message.includes('無法獲取會員資訊')) {
                throw error
            }

            if (error.response?.status === 404) {
                throw new Error('會員不存在或無歷史資料')
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒有權限查看點數歷史，請重新登入')
            }

            throw new Error('獲取點數歷史失敗，請稍後再試')
        }
    }

    /**
     * 使用點數
     * @param {Object} data - 使用點數資料
     * @param {number} data.amount - 使用金額 (必須為正整數)
     * @param {string} data.reason - 使用原因
     * @param {string} data.verificationCode - 驗證碼 (冪等性保證)
     * @returns {Promise<Object>} 使用點數響應
     */
    async usePoints(data) {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('無法獲取會員資訊，請先登入或確認您是會員用戶')
            }

            console.log('JCoin: 正在為會員 ID', memberId, '使用點數:', data)

            // 驗證輸入資料
            if (!data.amount || data.amount <= 0) {
                throw new Error('使用金額必須大於 0')
            }
            if (!data.reason) {
                throw new Error('請提供使用原因')
            }
            if (!data.verificationCode) {
                throw new Error('請提供驗證碼')
            }

            const response = await jcoinApi.post(`/Members/${memberId}/Points/Use`, data)

            console.log('JCoin: 成功使用點數:', response.data)
            return response.data
        } catch (error) {
            console.error('JCoin: 使用點數失敗:', error)

            if (error.message.includes('無法獲取會員資訊') ||
                error.message.includes('使用金額') ||
                error.message.includes('請提供')) {
                throw error
            }

            if (error.response?.status === 400) {
                // 可能是餘額不足或其他業務邏輯錯誤
                const errorMessage = error.response.data?.message || error.response.data?.error || '使用點數失敗'
                throw new Error(errorMessage)
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒有權限使用點數，請重新登入')
            }

            throw new Error('使用點數失敗，請稍後再試')
        }
    }

    /**
     * 獲得點數
     * @param {Object} data - 獲得點數資料
     * @param {number} data.amount - 獲得金額 (必須為正整數)
     * @param {string} data.reason - 獲得原因
     * @param {string} data.type - 類型：earned|adjustment
     * @param {string} data.verificationCode - 驗證碼 (冪等性保證)
     * @returns {Promise<Object>} 獲得點數響應
     */
    async earnPoints(data) {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('無法獲取會員資訊，請先登入或確認您是會員用戶')
            }

            console.log('JCoin: 正在為會員 ID', memberId, '獲得點數:', data)

            // 驗證輸入資料
            if (!data.amount || data.amount <= 0) {
                throw new Error('獲得金額必須大於 0')
            }
            if (!data.reason) {
                throw new Error('請提供獲得原因')
            }
            if (!data.type || !['earned', 'adjustment'].includes(data.type)) {
                throw new Error('類型必須是 earned 或 adjustment')
            }
            if (!data.verificationCode) {
                throw new Error('請提供驗證碼')
            }

            const response = await jcoinApi.post(`/Members/${memberId}/Points/Earn`, data)

            console.log('JCoin: 成功獲得點數:', response.data)
            return response.data
        } catch (error) {
            console.error('JCoin: 獲得點數失敗:', error)

            if (error.message.includes('無法獲取會員資訊') ||
                error.message.includes('獲得金額') ||
                error.message.includes('請提供') ||
                error.message.includes('類型必須是')) {
                throw error
            }

            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || error.response.data?.error || '獲得點數失敗'
                throw new Error(errorMessage)
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒有權限獲得點數，請重新登入')
            }

            throw new Error('獲得點數失敗，請稍後再試')
        }
    }

    /**
     * 退款點數
     * @param {Object} data - 退款資料
     * @param {number} data.amount - 退款金額 (必須為正整數)
     * @param {string} data.reason - 退款原因
     * @param {string} data.verificationCode - 驗證碼 (冪等性保證)
     * @returns {Promise<Object>} 退款響應
     */
    async refundPoints(data) {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('無法獲取會員資訊，請先登入或確認您是會員用戶')
            }

            console.log('JCoin: 正在為會員 ID', memberId, '退款點數:', data)

            // 驗證輸入資料
            if (!data.amount || data.amount <= 0) {
                throw new Error('退款金額必須大於 0')
            }
            if (!data.reason) {
                throw new Error('請提供退款原因')
            }
            if (!data.verificationCode) {
                throw new Error('請提供驗證碼')
            }

            const response = await jcoinApi.post(`/Members/${memberId}/Points/Refund`, data)

            console.log('JCoin: 成功退款點數:', response.data)
            return response.data
        } catch (error) {
            console.error('JCoin: 退款點數失敗:', error)

            if (error.message.includes('無法獲取會員資訊') ||
                error.message.includes('退款金額') ||
                error.message.includes('請提供')) {
                throw error
            }

            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || error.response.data?.error || '退款點數失敗'
                throw new Error(errorMessage)
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒有權限申請退款，請重新登入')
            }

            throw new Error('退款點數失敗，請稍後再試')
        }
    }

    /**
     * 格式化點數變動類型顯示
     * @param {string} type - 類型
     * @returns {Object} - { text: string, class: string, icon: string }
     */
    getTypeInfo(type) {
        const typeMap = {
            signin: {
                text: '簽到獲得',
                class: 'text-success',
                bgClass: 'bg-success-light',
                icon: 'fas fa-calendar-check'
            },
            used: {
                text: '購物使用',
                class: 'text-danger',
                bgClass: 'bg-danger-light',
                icon: 'fas fa-shopping-cart'
            },
            refund: {
                text: '退款回補',
                class: 'text-warning',
                bgClass: 'bg-warning-light',
                icon: 'fas fa-undo'
            },
            earned: {
                text: '活動獲得',
                class: 'text-primary',
                bgClass: 'bg-primary-light',
                icon: 'fas fa-gift'
            },
            expired: {
                text: '點數過期',
                class: 'text-secondary',
                bgClass: 'bg-secondary-light',
                icon: 'fas fa-clock'
            },
            adjustment: {
                text: '人工調整',
                class: 'text-info',
                bgClass: 'bg-info-light',
                icon: 'fas fa-edit'
            }
        }

        return typeMap[type?.toLowerCase()] || {
            text: type || '未知類型',
            class: 'text-muted',
            bgClass: 'bg-muted-light',
            icon: 'fas fa-question-circle'
        }
    }

    /**
     * 格式化點數金額顯示
     * @param {number} amount - 金額
     * @param {string} type - 類型
     * @returns {string} - 格式化的金額字串
     */
    formatAmount(amount, type) {
        const isPositive = ['signin', 'earned', 'refund', 'adjustment'].includes(type?.toLowerCase())
        const sign = isPositive ? '+' : '-'
        return `${sign}${Math.abs(amount)?.toLocaleString() || 0}`
    }

    /**
     * 格式化日期顯示
     * @param {string} dateString - 日期字串
     * @returns {string} - 格式化的日期
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A'

        try {
            const date = new Date(dateString)
            return date.toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            console.warn('JCoin: 日期格式化失敗:', dateString, error)
            return dateString
        }
    }

    /**
     * 獲取會員簽到資訊
     * @param {number} memberId - 會員 ID
     * @returns {Promise<Object>} 簽到資訊
     */
    async getCheckinInfo(memberId) {
        try {
            console.log('JCoin: 正在獲取會員', memberId, '的簽到資訊')

            // 使用正確的後端 API 端點
            const response = await jcoinApi.get(`/Members/${memberId}/Checkin/Info`)

            console.log('JCoin: 成功獲取簽到資訊:', response.data)
            
            // 直接返回後端回應資料，現在統一使用整數 J幣值
            const data = response.data
            return {
                memberId: data.memberId,
                today: data.today,
                signedToday: data.signedToday,
                checkinStreak: data.checkinStreak,
                todayReward: data.todayReward,  // 直接使用整數值（1, 2, 3, ..., 10）
                serverTime: data.serverTime,
                unit: data.unit,
                scale: data.scale
            }
        } catch (error) {
            console.log('JCoin: 後端簽到 API 調用失敗，將拋出錯誤供前端降級處理:', error.message)
            throw error
        }
    }

    /**
     * 執行會員簽到
     * @param {number} memberId - 會員 ID
     * @returns {Promise<Object>} 簽到結果
     */
    async checkin(memberId) {
        try {
            console.log('JCoin: 正在執行會員', memberId, '的簽到')

            // 使用正確的後端 API 端點，發送空的 POST 請求體
            const response = await jcoinApi.post(`/Members/${memberId}/Checkin`, {})

            console.log('JCoin: 簽到成功:', response.data)
            
            // 直接返回後端回應資料，現在統一使用整數 J幣值
            const data = response.data
            return {
                memberId: data.memberId,
                signedToday: data.signedToday,
                checkinStreak: data.checkinStreak,
                reward: data.reward,  // 直接使用整數值（1, 2, 3, ..., 10）
                beforeBalance: data.beforeBalance,
                afterBalance: data.afterBalance,
                verificationCode: data.verificationCode,
                createdAt: data.createdAt
            }
        } catch (error) {
            console.log('JCoin: 後端簽到 API 調用失敗，將拋出錯誤供前端降級處理:', error.message)
            throw error
        }
    }

    /**
     * 生成唯一驗證碼
     * @param {string} prefix - 前綴 (預設 'jcoin')
     * @returns {string} - 唯一驗證碼
     */
    generateVerificationCode(prefix = 'jcoin') {
        const timestamp = Date.now()
        const random = Math.random().toString(36).substr(2, 9)
        return `${prefix}_${timestamp}_${random}`
    }

    /**
     * 檢查點數類型是否有效
     * @param {string} type - 點數類型
     * @returns {boolean} - 是否有效
     */
    isValidPointsType(type) {
        const validTypes = ['signin', 'used', 'refund', 'earned', 'expired', 'adjustment']
        return validTypes.includes(type?.toLowerCase())
    }

    /**
     * 獲取所有可用的點數類型
     * @returns {Array} - 點數類型列表
     */
    getAvailableTypes() {
        return [
            { value: '', label: '全部類型' },
            { value: 'signin', label: '簽到獲得' },
            { value: 'earned', label: '活動獲得' },
            { value: 'used', label: '購物使用' },
            { value: 'refund', label: '退款回補' },
            { value: 'expired', label: '點數過期' },
            { value: 'adjustment', label: '人工調整' }
        ]
    }
}

// 創建並匯出服務實例
const jcoinService = new JCoinService()

export default jcoinService
export { JCoinService }

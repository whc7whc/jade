import axios from 'axios'
import userIdentityService from './userIdentityService'

// API ?��? URL
const API_BASE_URL = `${process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'}/api`

// ?�建專用??axios 實�?
const jcoinApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// 請�??�截??- 添�?認�? token
jcoinApi.interceptors.request.use(
    (config) => {
        // �?localStorage ?��? token
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

// ?��??�截??- ?��??�誤
jcoinApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('JCoin API Error:', error.response || error.message)

        // 401 ?��?�?- 清除 token 並跳轉登??
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
 * JCoin 點數?��?�?
 */
class JCoinService {

    /**
     * ?��??��?使用?��? memberId（使?�統一?�身份�??��?
     * @returns {number|null} ?�員 ID
     */
    getCurrentMemberId() {
        const memberId = userIdentityService.getMemberId()
        console.log('JCoin: ?��??�員 ID:', memberId)
        return memberId
    }

    /**
     * ?��??�員點數餘�?
     * @returns {Promise<Object>} 點數餘�??��?
     */
    async getBalance() {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('?��??��??�員資�?，�??�登?��?確�??�是?�員?�戶')
            }

            console.log('JCoin: �?��?��???ID', memberId, '?��?點數餘�?')

            const response = await jcoinApi.get(`/Members/${memberId}/Points/Balance`)

            console.log('JCoin: ?��??��?點數餘�?:', response.data)
            return response.data
        } catch (error) {
            console.error('JCoin: ?��?點數餘�?失�?:', error)

            if (error.message.includes('?��??��??�員資�?')) {
                throw error
            }

            if (error.response?.status === 404) {
                throw new Error('?�員不�??��??��??��???)
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒�?權�??��?點數資�?，�??�新?�入')
            }

            throw new Error('?��?點數餘�?失�?，�?稍�??�試')
        }
    }

    /**
     * ?��??�員點數歷史記�?
     * @param {Object} params - ?�詢?�數
     * @param {number} params.page - ?�碼 (?�設 1)
     * @param {number} params.pageSize - 每�?筆數 (?�設 20)
     * @param {string} params.type - 類�?篩選 (signin|used|refund|earned|expired|adjustment)
     * @param {string} params.startDate - ?��??��? (YYYY-MM-DD)
     * @param {string} params.endDate - 結�??��? (YYYY-MM-DD)
     * @returns {Promise<Object>} 點數歷史?��?
     */
    async getHistory(params = {}) {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('?��??��??�員資�?，�??�登?��?確�??�是?�員?�戶')
            }

            console.log('JCoin: �?��?��???ID', memberId, '?��?點數歷史，�???', params)

            const queryParams = new URLSearchParams()

            // 設�??��??�數
            queryParams.append('page', params.page || 1)
            queryParams.append('pageSize', params.pageSize || 20)

            // 設�?篩選條件
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
            console.log('JCoin: 請�? URL:', url)

            const response = await jcoinApi.get(url)

            console.log('JCoin: ?��??��?點數歷史:', response.data)

            // 轉�? API ?�傳?��?以符?��?端�???
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
            console.error('JCoin: ?��?點數歷史失�?:', error)

            if (error.message.includes('?��??��??�員資�?')) {
                throw error
            }

            if (error.response?.status === 404) {
                throw new Error('?�員不�??��??�歷?��???)
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒�?權�??��?點數歷史，�??�新?�入')
            }

            throw new Error('?��?點數歷史失�?，�?稍�??�試')
        }
    }

    /**
     * 使用點數
     * @param {Object} data - 使用點數資�?
     * @param {number} data.amount - 使用?��? (必�??�正?�數)
     * @param {string} data.reason - 使用?��?
     * @param {string} data.verificationCode - 驗�?�?(?��??��?�?
     * @returns {Promise<Object>} 使用點數?��?
     */
    async usePoints(data) {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('?��??��??�員資�?，�??�登?��?確�??�是?�員?�戶')
            }

            console.log('JCoin: �?��?��???ID', memberId, '使用點數:', data)

            // 驗�?輸入資�?
            if (!data.amount || data.amount <= 0) {
                throw new Error('使用?��?必�?大於 0')
            }
            if (!data.reason) {
                throw new Error('請�?供使?��???)
            }
            if (!data.verificationCode) {
                throw new Error('請�?供�?證碼')
            }

            const response = await jcoinApi.post(`/Members/${memberId}/Points/Use`, data)

            console.log('JCoin: ?��?使用點數:', response.data)
            return response.data
        } catch (error) {
            console.error('JCoin: 使用點數失�?:', error)

            if (error.message.includes('?��??��??�員資�?') ||
                error.message.includes('使用?��?') ||
                error.message.includes('請�?�?)) {
                throw error
            }

            if (error.response?.status === 400) {
                // ?�能?��?額�?足�??��?業�??�輯?�誤
                const errorMessage = error.response.data?.message || error.response.data?.error || '使用點數失�?'
                throw new Error(errorMessage)
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒�?權�?使用點數，�??�新?�入')
            }

            throw new Error('使用點數失�?，�?稍�??�試')
        }
    }

    /**
     * ?��?點數
     * @param {Object} data - ?��?點數資�?
     * @param {number} data.amount - ?��??��? (必�??�正?�數)
     * @param {string} data.reason - ?��??��?
     * @param {string} data.type - 類�?：earned|adjustment
     * @param {string} data.verificationCode - 驗�?�?(?��??��?�?
     * @returns {Promise<Object>} ?��?點數?��?
     */
    async earnPoints(data) {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('?��??��??�員資�?，�??�登?��?確�??�是?�員?�戶')
            }

            console.log('JCoin: �?��?��???ID', memberId, '?��?點數:', data)

            // 驗�?輸入資�?
            if (!data.amount || data.amount <= 0) {
                throw new Error('?��??��?必�?大於 0')
            }
            if (!data.reason) {
                throw new Error('請�?供獲得�???)
            }
            if (!data.type || !['earned', 'adjustment'].includes(data.type)) {
                throw new Error('類�?必�???earned ??adjustment')
            }
            if (!data.verificationCode) {
                throw new Error('請�?供�?證碼')
            }

            const response = await jcoinApi.post(`/Members/${memberId}/Points/Earn`, data)

            console.log('JCoin: ?��??��?點數:', response.data)
            return response.data
        } catch (error) {
            console.error('JCoin: ?��?點數失�?:', error)

            if (error.message.includes('?��??��??�員資�?') ||
                error.message.includes('?��??��?') ||
                error.message.includes('請�?�?) ||
                error.message.includes('類�?必�???)) {
                throw error
            }

            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || error.response.data?.error || '?��?點數失�?'
                throw new Error(errorMessage)
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒�?權�??��?點數，�??�新?�入')
            }

            throw new Error('?��?點數失�?，�?稍�??�試')
        }
    }

    /**
     * ?�款�???
     * @param {Object} data - ?�款�???
     * @param {number} data.amount - ?�款�?�?(必�??�正?�數)
     * @param {string} data.reason - ?�款�???
     * @param {string} data.verificationCode - 驗�?�?(?��??��?�?
     * @returns {Promise<Object>} ?�款響??
     */
    async refundPoints(data) {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('?��??��??�員資�?，�??�登?��?確�??�是?�員?�戶')
            }

            console.log('JCoin: �?��?��???ID', memberId, '?�款�???', data)

            // 驗�?輸入資�?
            if (!data.amount || data.amount <= 0) {
                throw new Error('?�款�?額�??�大??0')
            }
            if (!data.reason) {
                throw new Error('請�?供退款�???)
            }
            if (!data.verificationCode) {
                throw new Error('請�?供�?證碼')
            }

            const response = await jcoinApi.post(`/Members/${memberId}/Points/Refund`, data)

            console.log('JCoin: ?��??�款�???', response.data)
            return response.data
        } catch (error) {
            console.error('JCoin: ?�款�??�失??', error)

            if (error.message.includes('?��??��??�員資�?') ||
                error.message.includes('?�款�?�?) ||
                error.message.includes('請�?�?)) {
                throw error
            }

            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || error.response.data?.error || '?�款�??�失??
                throw new Error(errorMessage)
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒�?權�??��??�款�?請�??�登??)
            }

            throw new Error('?�款�??�失?��?請�?後�?�?)
        }
    }

    /**
     * ?��??��??��??��??�顯�?
     * @param {string} type - 類�?
     * @returns {Object} - { text: string, class: string, icon: string }
     */
    getTypeInfo(type) {
        const typeMap = {
            signin: {
                text: '簽到?��?',
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
                text: '?�款�?�?,
                class: 'text-warning',
                bgClass: 'bg-warning-light',
                icon: 'fas fa-undo'
            },
            earned: {
                text: '活�??��?',
                class: 'text-primary',
                bgClass: 'bg-primary-light',
                icon: 'fas fa-gift'
            },
            expired: {
                text: '點數?��?',
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
            text: type || '?�知類�?',
            class: 'text-muted',
            bgClass: 'bg-muted-light',
            icon: 'fas fa-question-circle'
        }
    }

    /**
     * ?��??��??��?額顯�?
     * @param {number} amount - ?��?
     * @param {string} type - 類�?
     * @returns {string} - ?��??��??��?字串
     */
    formatAmount(amount, type) {
        const isPositive = ['signin', 'earned', 'refund', 'adjustment'].includes(type?.toLowerCase())
        const sign = isPositive ? '+' : '-'
        return `${sign}${Math.abs(amount)?.toLocaleString() || 0}`
    }

    /**
     * ?��??�日?�顯�?
     * @param {string} dateString - ?��?字串
     * @returns {string} - ?��??��??��?
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
            console.warn('JCoin: ?��??��??�失??', dateString, error)
            return dateString
        }
    }

    /**
     * ?��??�員簽到資�?
     * @param {number} memberId - ?�員 ID
     * @returns {Promise<Object>} 簽到資�?
     */
    async getCheckinInfo(memberId) {
        try {
            console.log('JCoin: �?��?��??�員', memberId, '?�簽?��?�?)

            // 使用�?��?��?�?API 端�?
            const response = await jcoinApi.get(`/Members/${memberId}/Checkin/Info`)

            console.log('JCoin: ?��??��?簽到資�?:', response.data)
            
            // ?�接返�?後端?��?資�?，現?�統一使用?�數 J�?�?
            const data = response.data
            return {
                memberId: data.memberId,
                today: data.today,
                signedToday: data.signedToday,
                checkinStreak: data.checkinStreak,
                todayReward: data.todayReward,  // ?�接使用?�數?��?1, 2, 3, ..., 10�?
                serverTime: data.serverTime,
                unit: data.unit,
                scale: data.scale
            }
        } catch (error) {
            console.log('JCoin: 後端簽到 API 調用失�?，�??�出?�誤供�?端�?級�???', error.message)
            throw error
        }
    }

    /**
     * ?��??�員簽到
     * @param {number} memberId - ?�員 ID
     * @returns {Promise<Object>} 簽到結�?
     */
    async checkin(memberId) {
        try {
            console.log('JCoin: �?��?��??�員', memberId, '?�簽??)

            // 使用�?��?��?�?API 端�?，發?�空??POST 請�?�?
            const response = await jcoinApi.post(`/Members/${memberId}/Checkin`, {})

            console.log('JCoin: 簽到?��?:', response.data)
            
            // ?�接返�?後端?��?資�?，現?�統一使用?�數 J�?�?
            const data = response.data
            return {
                memberId: data.memberId,
                signedToday: data.signedToday,
                checkinStreak: data.checkinStreak,
                reward: data.reward,  // ?�接使用?�數?��?1, 2, 3, ..., 10�?
                beforeBalance: data.beforeBalance,
                afterBalance: data.afterBalance,
                verificationCode: data.verificationCode,
                createdAt: data.createdAt
            }
        } catch (error) {
            console.log('JCoin: 後端簽到 API 調用失�?，�??�出?�誤供�?端�?級�???', error.message)
            throw error
        }
    }

    /**
     * ?��??��?驗�?�?
     * @param {string} prefix - ?�綴 (?�設 'jcoin')
     * @returns {string} - ?��?驗�?�?
     */
    generateVerificationCode(prefix = 'jcoin') {
        const timestamp = Date.now()
        const random = Math.random().toString(36).substr(2, 9)
        return `${prefix}_${timestamp}_${random}`
    }

    /**
     * 檢查點數類�??�否?��?
     * @param {string} type - 點數類�?
     * @returns {boolean} - ?�否?��?
     */
    isValidPointsType(type) {
        const validTypes = ['signin', 'used', 'refund', 'earned', 'expired', 'adjustment']
        return validTypes.includes(type?.toLowerCase())
    }

    /**
     * ?��??�?�可?��?點數類�?
     * @returns {Array} - 點數類�??�表
     */
    getAvailableTypes() {
        return [
            { value: '', label: '?�部類�?' },
            { value: 'signin', label: '簽到?��?' },
            { value: 'earned', label: '活�??��?' },
            { value: 'used', label: '購物使用' },
            { value: 'refund', label: '?�款�?�? },
            { value: 'expired', label: '點數?��?' },
            { value: 'adjustment', label: '人工調整' }
        ]
    }
}

// ?�建並匯?��??�實�?
const jcoinService = new JCoinService()

export default jcoinService
export { JCoinService }

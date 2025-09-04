import axios from 'axios'
import userIdentityService from './userIdentityService'

// API 基礎 URL
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'

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

        // 401 錯誤 - 清除 token 並跳轉登入
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
 * JCoin 點數服務
 */
class JCoinService {

    /**
     * 獲取當前使用者的 memberId（使用統一身份服務）
     * @returns {number|null} 會員 ID
     */
    getCurrentMemberId() {
        const memberId = userIdentityService.getMemberId()
        console.log('JCoin: 獲取會員 ID:', memberId)
        return memberId
    }

    /**
     * 獲取會員點數餘額
     * @returns {Promise<Object>} 點數餘額資料
     */
    async getBalance() {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('會員ID不存在，請先登入')
            }

            console.log('🪙 JCoin: 開始獲取點數餘額...')
            console.log('🔍 會員 ID:', memberId)

            const response = await jcoinApi.get(`/JCoin/balance/${memberId}`)
            
            console.log('✅ JCoin: 成功獲取點數餘額')
            console.log('💰 餘額資料:', response.data)

            return {
                success: true,
                balance: response.data.balance || 0,
                memberId: memberId,
                timestamp: new Date().toISOString()
            }

        } catch (error) {
            console.error('❌ JCoin: 獲取點數餘額失敗', error)

            if (error.message.includes('會員資料')) {
                throw error
            }

            if (error.response?.status === 404) {
                throw new Error('會員不存在或查詢失敗')
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('沒有權限獲取點數資料，請重新登入')
            }

            throw new Error('獲取點數餘額失敗，請稍後再試')
        }
    }

    /**
     * 獲取點數交易記錄
     * @returns {Promise<Object>} 交易記錄
     */
    async getTransactionHistory() {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('會員ID不存在，請先登入')
            }

            console.log('📊 JCoin: 開始獲取交易記錄...')
            const response = await jcoinApi.get(`/JCoin/transactions/${memberId}`)
            
            console.log('✅ JCoin: 成功獲取交易記錄')
            return {
                success: true,
                transactions: response.data || [],
                memberId: memberId
            }

        } catch (error) {
            console.error('❌ JCoin: 獲取交易記錄失敗', error)
            throw new Error('獲取交易記錄失敗，請稍後再試')
        }
    }

    /**
     * 使用點數
     * @param {number} amount - 使用金額
     * @param {string} description - 使用描述
     * @returns {Promise<Object>} 使用結果
     */
    async usePoints(amount, description = '商品購買') {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('會員ID不存在，請先登入')
            }

            console.log('💸 JCoin: 開始使用點數...')
            console.log('💰 使用金額:', amount)
            console.log('📝 描述:', description)

            const response = await jcoinApi.post('/JCoin/use', {
                memberId: memberId,
                amount: amount,
                description: description
            })

            console.log('✅ JCoin: 點數使用成功')
            return {
                success: true,
                transactionId: response.data.transactionId,
                remainingBalance: response.data.remainingBalance,
                memberId: memberId
            }

        } catch (error) {
            console.error('❌ JCoin: 使用點數失敗', error)

            if (error.response?.status === 400) {
                throw new Error('點數不足或使用金額無效')
            }

            throw new Error('使用點數失敗，請稍後再試')
        }
    }

    /**
     * 增加點數（通常由系統呼叫）
     * @param {number} amount - 增加金額
     * @param {string} reason - 增加原因
     * @returns {Promise<Object>} 增加結果
     */
    async addPoints(amount, reason = '系統獎勵') {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('會員ID不存在，請先登入')
            }

            console.log('💎 JCoin: 開始增加點數...')
            console.log('💰 增加金額:', amount)
            console.log('📝 原因:', reason)

            const response = await jcoinApi.post('/JCoin/add', {
                memberId: memberId,
                amount: amount,
                reason: reason
            })

            console.log('✅ JCoin: 點數增加成功')
            return {
                success: true,
                transactionId: response.data.transactionId,
                newBalance: response.data.newBalance,
                memberId: memberId
            }

        } catch (error) {
            console.error('❌ JCoin: 增加點數失敗', error)
            throw new Error('增加點數失敗，請稍後再試')
        }
    }

    /**
     * 檢查點數是否足夠
     * @param {number} requiredAmount - 需要的點數
     * @returns {Promise<boolean>} 是否足夠
     */
    async checkSufficientBalance(requiredAmount) {
        try {
            const balanceData = await this.getBalance()
            return balanceData.balance >= requiredAmount
        } catch (error) {
            console.error('❌ JCoin: 檢查餘額失敗', error)
            return false
        }
    }

    /**
     * 格式化點數顯示
     * @param {number} amount - 點數金額
     * @returns {string} 格式化後的顯示文字
     */
    formatPoints(amount) {
        if (typeof amount !== 'number') return '0 J幣'
        return `${amount.toLocaleString()} J幣`
    }
}

// 創建並導出服務實例
const jcoinService = new JCoinService()
export default jcoinService

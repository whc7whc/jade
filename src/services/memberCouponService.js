import axios from 'axios'
import userIdentityService from './userIdentityService'

// API 基礎 URL
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'

// 創建專用的 axios 實例
const memberCouponApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// 請求攔截器 - 添加認證 token
memberCouponApi.interceptors.request.use(
    (config) => {
        // 從 localStorage 獲取 token
        const authToken = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`
        }
        return config
    },
    (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
    }
)

// 響應攔截器 - 處理錯誤
memberCouponApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response || error.message)

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
 * 會員優惠券服務類
 */
class MemberCouponService {

    /**
     * 獲取當前使用者的 memberId（使用統一的身份服務）
     * @returns {number|null} 會員 ID
     */
    getCurrentMemberId() {
        const memberId = userIdentityService.getMemberId()
        console.log('Coupon: 獲取會員 ID:', memberId)
        return memberId
    }

    /**
     * 獲取會員的所有優惠券
     * @param {Object} params - 查詢參數
     * @param {string} params.status - 優惠券狀態 (active, used, expired, cancelled)
     * @param {boolean} params.activeOnly - 只顯示可用優惠券
     * @param {number} params.page - 頁碼
     * @param {number} params.pageSize - 每頁筆數 (後端參數名稱)
     * @returns {Promise<Object>} API 響應
     */
    async getMemberCoupons(params = {}) {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('無法獲取會員資訊，請先登入或確認您是會員用戶')
            }

            console.log('正在為會員 ID', memberId, '獲取優惠券，參數:', params)

            const queryParams = new URLSearchParams()

            // 適配後端參數名稱
            if (params.status) queryParams.append('status', params.status)
            if (params.activeOnly !== undefined) queryParams.append('activeOnly', params.activeOnly)
            if (params.page) queryParams.append('page', params.page)
            if (params.pageSize || params.limit) {
                queryParams.append('pageSize', params.pageSize || params.limit)
            }

            // 構建後端 API 路由
            const url = `/api/Members/${memberId}/MemberCoupons?${queryParams}`
            console.log('API 請求 URL:', `${API_BASE_URL}${url}`)

            const response = await memberCouponApi.get(url)
            return this.formatApiResponse(response.data)
        } catch (error) {
            console.error('獲取會員優惠券失敗:', error)
            throw this.formatError(error)
        }
    }

    /**
     * 獲取優惠券統計資訊
     * @returns {Promise<Object>} 統計資訊
     */
    async getCouponStats() {
        try {
            // 由於後端只有一個 API，我們需要透過查詢所有優惠券來計算統計
            const allCoupons = await this.getMemberCoupons({ page: 1, pageSize: 1000 })

            const stats = {
                available: 0,
                used: 0,
                expired: 0,
                expiringSoon: 0,
                totalValue: 0
            }

            const now = new Date()
            const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

            allCoupons.coupons.forEach(coupon => {
                switch (coupon.status) {
                    case 'available':
                        stats.available++
                        // 檢查是否即將到期
                        if (coupon.expiryDate && new Date(coupon.expiryDate) <= sevenDaysLater) {
                            stats.expiringSoon++
                        }
                        break
                    case 'used':
                        stats.used++
                        break
                    case 'expired':
                        stats.expired++
                        break
                }

                // 計算總價值（只計算可用的）
                if (coupon.status === 'available') {
                    stats.totalValue += coupon.discount || 0
                }
            })

            return stats
        } catch (error) {
            console.error('獲取優惠券統計失敗:', error)
            // 返回默認值避免錯誤
            return {
                available: 0,
                used: 0,
                expired: 0,
                expiringSoon: 0,
                totalValue: 0
            }
        }
    }

    /**
     * 格式化 API 響應
     * @param {Object} data - 原始 API 響應
     * @returns {Object} 格式化後的資料
     */
    formatApiResponse(data) {
        // 適配後端的 PagedResponseDto 格式
        const items = data.data || data.items || []

        return {
            coupons: items.map(coupon => this.formatCouponData(coupon)),
            pagination: {
                currentPage: data.pageNumber || data.currentPage || 1,
                totalPages: data.totalPages || Math.ceil((data.totalCount || 0) / (data.pageSize || 10)),
                totalItems: data.totalCount || data.totalItems || 0,
                itemsPerPage: data.pageSize || data.itemsPerPage || 10
            },
            stats: data.stats || {}
        }
    }

    /**
     * 格式化單張優惠券資料
     * @param {Object} coupon - 原始優惠券資料
     * @returns {Object} 格式化後的優惠券
     */
    formatCouponData(coupon) {
        // 先獲取後端狀態
        let status = this.mapCouponStatus(coupon.status)
        
        // ✅ 客戶端過期檢查：如果狀態是 available 但已過期，改為 expired
        if (status === 'available' && coupon.expiredAt) {
            const now = new Date()
            const expiryDate = new Date(coupon.expiredAt)
            
            // 如果過期日期小於當前日期，設為已過期
            if (expiryDate < now) {
                status = 'expired'
                console.log(`優惠券 ${coupon.title} 已過期：${coupon.expiredAt}`)
            }
        }
        
        return {
            id: coupon.memberCouponId || coupon.id,
            title: coupon.title || '未知優惠券',
            description: coupon.description || '',
            type: this.mapDiscountType(coupon.discountType),
            discount: coupon.discountAmount || 0,
            minAmount: coupon.minSpend || 0,
            maxDiscount: coupon.maxDiscount || null,
            status: status, // 使用修正後的狀態
            expiryDate: this.formatDate(coupon.expiredAt),
            createdDate: this.formatDate(coupon.assignedAt),
            usedDate: this.formatDate(coupon.usedAt),
            startDate: this.formatDate(coupon.startAt),
            vendor: coupon.sellerName || null,
            source: coupon.source || 'platform',
            code: coupon.verificationCode || '',
            couponId: coupon.couponId,
            orderId: coupon.orderId,
            formattedDiscount: coupon.formattedDiscount || this.formatDiscount(coupon.discountType, coupon.discountAmount),
            validityPeriod: coupon.validityPeriod || this.formatValidityPeriod(coupon.startAt, coupon.expiredAt),
            usageInfo: coupon.usageInfo || this.formatUsageInfo(coupon.usageLimit, coupon.usedCount),
            isTransferable: false // 預設不可轉讓
        }
    }

    /**
     * 對應後端的 DiscountType 到前端類型
     * @param {string} discountType - 後端折扣類型
     * @returns {string} 前端標準化類型
     */
    mapDiscountType(discountType) {
        const typeMap = {
            'Amount': 'cash',
            'Percentage': 'discount',
            'FixedAmount': 'cash',
            'Percent': 'discount',
            'JCoin': 'jcoin',
            'Point': 'jcoin'
        }
        return typeMap[discountType] || 'discount'
    }

    /**
     * 對應後端的狀態到前端狀態
     * @param {string} status - 後端狀態
     * @returns {string} 前端標準化狀態
     */
    mapCouponStatus(status) {
        const statusMap = {
            'Active': 'available',
            'Used': 'used',
            'Expired': 'expired',
            'Cancelled': 'expired'
        }
        return statusMap[status] || 'available'
    }

    /**
     * 格式化折扣顯示
     * @param {string} discountType - 折扣類型
     * @param {number} discountAmount - 折扣金額
     * @returns {string} 格式化的折扣顯示
     */
    formatDiscount(discountType, discountAmount) {
        switch (discountType) {
            case 'Amount':
            case 'FixedAmount':
                return `$${discountAmount}`
            case 'Percentage':
            case 'Percent':
                return `${discountAmount}%`
            case 'JCoin':
            case 'Point':
                return `${discountAmount}% 回饋`
            default:
                return `${discountAmount}`
        }
    }

    /**
     * 格式化有效期顯示
     * @param {string} startAt - 開始時間
     * @param {string} expiredAt - 到期時間
     * @returns {string} 格式化的有效期
     */
    formatValidityPeriod(startAt, expiredAt) {
        const start = startAt ? this.formatDisplayDate(startAt) : '即日起'
        const end = expiredAt ? this.formatDisplayDate(expiredAt) : '無期限'
        return `${start} 至 ${end}`
    }

    /**
     * 格式化使用資訊
     * @param {number} usageLimit - 使用限制
     * @param {number} usedCount - 已使用次數
     * @returns {string} 格式化的使用資訊
     */
    formatUsageInfo(usageLimit, usedCount) {
        if (!usageLimit) return '無使用限制'
        return `已使用 ${usedCount || 0}/${usageLimit} 次`
    }

    /**
     * 格式化顯示日期
     * @param {string} dateString - 日期字串
     * @returns {string} 格式化的顯示日期
     */
    formatDisplayDate(dateString) {
        if (!dateString) return ''

        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        } catch (error) {
            return dateString
        }
    }

    /**
     * 標準化優惠券類型
     * @param {string} type - 原始類型
     * @returns {string} 標準化類型
     */
    normalizeCouponType(type) {
        const typeMap = {
            'discount': 'discount',
            'percentage': 'discount',
            'cash': 'cash',
            'amount': 'cash',
            'jcoin': 'jcoin',
            'point': 'jcoin',
            'cashback': 'jcoin'
        }
        return typeMap[type?.toLowerCase()] || 'discount'
    }

    /**
     * 標準化優惠券狀態
     * @param {string} status - 原始狀態
     * @returns {string} 標準化狀態
     */
    normalizeCouponStatus(status) {
        const statusMap = {
            'active': 'available',
            'available': 'available',
            'unused': 'available',
            'used': 'used',
            'redeemed': 'used',
            'expired': 'expired',
            'inactive': 'expired'
        }
        return statusMap[status?.toLowerCase()] || 'available'
    }

    /**
     * 格式化日期
     * @param {string} dateString - 日期字串
     * @returns {string} 格式化的日期
     */
    formatDate(dateString) {
        if (!dateString) return null

        try {
            const date = new Date(dateString)
            return date.toISOString().split('T')[0] // YYYY-MM-DD 格式
        } catch (error) {
            console.warn('日期格式化失敗:', dateString)
            return null
        }
    }

    /**
     * 格式化錯誤資訊
     * @param {Error} error - 錯誤物件
     * @returns {Object} 格式化的錯誤
     */
    formatError(error) {
        const errorInfo = {
            message: '操作失敗，請稍後再試',
            code: 'UNKNOWN_ERROR',
            details: error.message
        }

        if (error.response) {
            errorInfo.code = error.response.status
            errorInfo.message = error.response.data?.message || errorInfo.message

            // 特定錯誤處理
            switch (error.response.status) {
                case 400:
                    errorInfo.message = '請求參數錯誤'
                    break
                case 401:
                    errorInfo.message = '請先登入'
                    break
                case 403:
                    errorInfo.message = '沒有權限執行此操作'
                    break
                case 404:
                    errorInfo.message = '找不到指定的優惠券'
                    break
                case 409:
                    errorInfo.message = '優惠券已被使用或已過期'
                    break
                case 500:
                    errorInfo.message = '伺服器錯誤，請稍後再試'
                    break
            }
        }

        return errorInfo
    }

    /**
     * 檢查優惠券是否可用
     * @param {Object} coupon - 優惠券物件
     * @param {number} orderAmount - 訂單金額
     * @returns {Object} 檢查結果
     */
    checkCouponUsability(coupon, orderAmount = 0) {
        const result = {
            canUse: false,
            reason: ''
        }

        if (coupon.status !== 'available') {
            result.reason = coupon.status === 'used' ? '此優惠券已使用' : '此優惠券已過期'
            return result
        }

        if (new Date(coupon.expiryDate) < new Date()) {
            result.reason = '此優惠券已過期'
            return result
        }

        if (orderAmount < coupon.minAmount) {
            result.reason = `訂單金額需滿 $${coupon.minAmount} 才能使用`
            return result
        }

        result.canUse = true
        return result
    }

    /**
     * 計算優惠券折扣金額
     * @param {Object} coupon - 優惠券物件
     * @param {number} orderAmount - 訂單金額
     * @returns {number} 折扣金額
     */
    calculateDiscount(coupon, orderAmount) {
        if (!this.checkCouponUsability(coupon, orderAmount).canUse) {
            return 0
        }

        switch (coupon.type) {
            case 'cash':
                return Math.min(coupon.discount, orderAmount)

            case 'discount': {
                const discountAmount = orderAmount * (coupon.discount / 100)
                return coupon.maxDiscount ? Math.min(discountAmount, coupon.maxDiscount) : discountAmount
            }

            case 'jcoin':
                // J Coin 回饋券不直接減免，而是回饋
                return 0

            default:
                return 0
        }
    }

    /**
     * 取得用戶可用的優惠券
     * GET /api/Coupons/UserAvailable/{userId}
     */
    async getUserAvailableCoupons() {
        try {
            const memberId = this.getCurrentMemberId()
            if (!memberId) {
                throw new Error('無法獲取會員資訊，請先登入')
            }

            console.log(`🎫 正在取得用戶 ${memberId} 的可用優惠券...`)
            
            const response = await memberCouponApi.get(`/api/Coupons/UserAvailable/${memberId}`)
            
            console.log('📦 可用優惠券回應:', response.data)
            
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data || [],
                    message: response.data.message
                }
            } else {
                return {
                    success: false,
                    data: [],
                    error: response.data.message || '取得可用優惠券失敗'
                }
            }
        } catch (error) {
            console.error('❌ 取得可用優惠券失敗:', error)
            return {
                success: false,
                data: [],
                error: error.response?.data?.message || '取得可用優惠券失敗'
            }
        }
    }

    /**
     * 判斷優惠券是否可用於當前購物車
     */
    isCouponUsableForCart(coupon, cartTotal = 0) {
        console.log('🔍 檢查優惠券可用性:', { 
            title: coupon.title,
            code: coupon.code,
            status: coupon.status,
            isCurrentlyActive: coupon.isCurrentlyActive,
            isActive: coupon.isActive,
            cartTotal,
            coupon 
        })
        
        // 檢查狀態 - 支援多種狀態和活躍狀態欄位
        const validStatuses = ['active', 'available', 'Active', 'Available', 'ACTIVE', 'AVAILABLE']
        const isStatusValid = validStatuses.includes(coupon.status)
        const isActiveValid = coupon.isCurrentlyActive === true || coupon.isActive === true
        
        // 至少需要其中一個條件成立
        if (!isStatusValid && !isActiveValid) {
            console.log('❌ 狀態檢查失敗:', { 
                status: coupon.status,
                isStatusValid,
                isCurrentlyActive: coupon.isCurrentlyActive,
                isActive: coupon.isActive,
                isActiveValid
            })
            return { usable: false, reason: '優惠券未啟用' }
        }
        
        // 檢查是否已過期
        if (coupon.isExpired || (coupon.expiredAt && new Date(coupon.expiredAt) < new Date())) {
            console.log('❌ 優惠券已過期:', { 
                expiredAt: coupon.expiredAt, 
                isExpired: coupon.isExpired,
                now: new Date().toISOString()
            })
            return { usable: false, reason: '優惠券已過期' }
        }
        
        // 檢查是否尚未開始
        if (coupon.isNotStarted || (coupon.startAt && new Date(coupon.startAt) > new Date())) {
            console.log('❌ 優惠券尚未開始:', { 
                startAt: coupon.startAt, 
                isNotStarted: coupon.isNotStarted,
                now: new Date().toISOString()
            })
            return { usable: false, reason: '優惠券尚未開始' }
        }
        
        // 檢查最低消費金額
        const minSpendAmount = coupon.minSpend || coupon.minAmount || 0
        if (minSpendAmount && cartTotal < minSpendAmount) {
            console.log('❌ 最低消費不足:', { minSpend: minSpendAmount, cartTotal })
            return { 
                usable: false, 
                reason: `需滿 $${minSpendAmount} 才能使用，目前購物車金額 $${cartTotal}` 
            }
        }
        
        // 檢查使用次數限制
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            console.log('❌ 使用次數已達上限:', { usageLimit: coupon.usageLimit, usedCount: coupon.usedCount })
            return { usable: false, reason: '優惠券使用次數已達上限' }
        }
        
        console.log('✅ 優惠券可用性檢查通過:', {
            title: coupon.title,
            code: coupon.code,
            isStatusValid,
            isActiveValid,
            cartTotal,
            minSpendAmount
        })
        return { usable: true, reason: null }
    }

    /**
     * 格式化優惠券顯示資訊
     */
    formatCouponForDisplay(coupon) {
        console.log('🔄 格式化優惠券顯示資訊，原始數據:', coupon)
        
        // 處理過期時間字段
        const expiredAtField = coupon.expiredAt || coupon.expiryDate || coupon.validUntil
        const isExpired = expiredAtField && new Date(expiredAtField) < new Date()
        
        // 處理開始時間字段
        const startAtField = coupon.startAt || coupon.startDate || coupon.validFrom
        const isNotStarted = startAtField && new Date(startAtField) > new Date()
        
        // 處理折扣金額和類型
        const discountAmount = coupon.discountAmount || coupon.discount || coupon.value || 0
        const discountType = coupon.discountType || coupon.type
        
        // 處理最低消費金額
        const minSpend = coupon.minSpend || coupon.minAmount || coupon.minOrderAmount || coupon.minimumAmount || 0
        
        // 處理優惠券代碼
        const code = coupon.verificationCode || coupon.code || coupon.couponCode
        console.log('🔍 處理優惠券代碼:', {
            verificationCode: coupon.verificationCode,
            code: coupon.code,
            couponCode: coupon.couponCode,
            finalCode: code
        })
        
        // 處理活躍狀態
        const isCurrentlyActive = coupon.isCurrentlyActive !== undefined ? coupon.isCurrentlyActive : coupon.isActive
        
        const formatted = {
            id: coupon.couponId || coupon.id || coupon.memberCouponId,
            memberCouponId: coupon.memberCouponId,
            code: code,
            title: coupon.title || coupon.name || '未知優惠券',
            description: coupon.description || '',
            discountType: discountType,
            discountAmount: discountAmount,
            minSpend: minSpend,
            formattedDiscount: coupon.formattedDiscount || this.formatDiscount(discountType, discountAmount),
            validityPeriod: coupon.validityPeriod || coupon.validPeriod,
            usageInfo: coupon.usageInfo || coupon.formattedUsage,
            isCurrentlyActive: isCurrentlyActive,
            isActive: coupon.isActive,
            status: coupon.status,
            expiredAt: expiredAtField,
            startAt: startAtField,
            isExpired: isExpired,
            isNotStarted: isNotStarted,
            usageLimit: coupon.usageLimit || coupon.maxUses,
            usedCount: coupon.usedCount || coupon.usedTimes || 0
        }
        
        console.log('✅ 格式化完成:', formatted)
        return formatted
    }
}

// 導出服務實例
export default new MemberCouponService()

// 也導出類別以便測試
export { MemberCouponService }

/**
 * 用戶身份管理服務
 * 處理 member 和 seller 共用帳號的身份識別問題
 */
class UserIdentityService {
    /**
     * 獲取當前用戶資訊
     * @returns {Object|null} 用戶資訊物件
     */
    getCurrentUser() {
        try {
            const currentUserStr = localStorage.getItem('currentUser')
            return currentUserStr ? JSON.parse(currentUserStr) : null
        } catch (error) {
            console.error('解析用戶資訊失敗:', error)
            return null
        }
    }

    /**
     * 檢查用戶是否具有指定角色
     * @param {string} role - 角色名稱 ('member', 'seller', 'admin' 等)
     * @returns {boolean} 是否具有該角色
     */
    hasRole(role) {
        const user = this.getCurrentUser()
        if (!user) return false

        // 檢查用戶是否具有指定角色
        return user.userType === role || (user.roles && user.roles.includes(role))
    }

    /**
     * 獲取會員 ID
     * @returns {number|null} 會員 ID
     */
    getMemberId() {
        try {
            // 優先從 localStorage 直接獲取 memberId
            const directMemberId = localStorage.getItem('memberId')
            if (directMemberId) {
                console.log('UserIdentity: 從 localStorage 獲取會員 ID:', directMemberId)
                return parseInt(directMemberId, 10)
            }

            // 如果沒有直接的 memberId，檢查 currentUser
            const user = this.getCurrentUser()
            if (user && user.memberId) {
                console.log('UserIdentity: 從 currentUser 獲取會員 ID:', user.memberId, '用戶類型:', user.userType)
                return user.memberId
            }

            // 檢查是否有認證 token
            const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('auth_token')
            if (token) {
                console.warn('UserIdentity: 已登入但無法獲取會員 ID')
                return null
            }

            console.warn('UserIdentity: 未登入 - 沒有找到會員 ID 或認證 token')
            return null
        } catch (error) {
            console.error('UserIdentity: 獲取會員 ID 時發生錯誤:', error)
            return null
        }
    }

    /**
     * 獲取賣家 ID
     * @returns {number|string|null} 賣家 ID
     */
    getSellerId() {
        const user = this.getCurrentUser()
        return user?.sellerId || user?.vendorId || null
    }

    /**
     * 檢查是否可以訪問會員功能
     * @returns {boolean} 是否可以訪問會員功能
     */
    canAccessMemberFeatures() {
        // 只要有會員 ID 就可以訪問會員功能，不論用戶類型
        return this.getMemberId() !== null
    }

    /**
     * 檢查是否可以訪問賣家功能
     * @returns {boolean} 是否可以訪問賣家功能
     */
    canAccessSellerFeatures() {
        // 只要有賣家 ID 就可以訪問賣家功能
        return this.getSellerId() !== null
    }

    /**
     * 檢查用戶是否已登入
     * @returns {boolean} 是否已登入
     */
    isLoggedIn() {
        const token = localStorage.getItem('authToken') ||
            localStorage.getItem('auth_token') ||
            localStorage.getItem('token')
        const user = this.getCurrentUser()

        return !!(token && user)
    }

    /**
     * 獲取用戶身份描述
     * @returns {string} 身份描述
     */
    getUserTypeDescription() {
        const user = this.getCurrentUser()
        if (!user) return '未登入'

        const descriptions = []

        if (this.canAccessMemberFeatures()) {
            descriptions.push('會員')
        }

        if (this.canAccessSellerFeatures()) {
            descriptions.push('賣家')
        }

        if (descriptions.length === 0) {
            return user.userType || '未知身份'
        }

        return descriptions.join(' & ')
    }

    /**
     * 獲取身份徽章資訊
     * @returns {Array} 身份徽章陣列
     */
    getIdentityBadges() {
        const badges = []

        if (this.canAccessMemberFeatures()) {
            badges.push({
                type: 'member',
                text: '會員',
                class: 'badge bg-primary',
                icon: 'fas fa-user'
            })
        }

        if (this.canAccessSellerFeatures()) {
            badges.push({
                type: 'seller',
                text: '賣家',
                class: 'badge bg-success',
                icon: 'fas fa-store'
            })
        }

        return badges
    }

    /**
     * 清除用戶資料
     */
    clearUserData() {
        localStorage.removeItem('currentUser')
        localStorage.removeItem('memberId')
        localStorage.removeItem('authToken')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('token')
    }

    /**
     * 調試用：顯示當前用戶的所有資訊
     */
    debugUserInfo() {
        const user = this.getCurrentUser()
        const memberId = this.getMemberId()
        const sellerId = this.getSellerId()
        const isLoggedIn = this.isLoggedIn()

        const debugInfo = {
            '當前用戶': user,
            '會員 ID': memberId,
            '賣家 ID': sellerId,
            '登入狀態': isLoggedIn,
            '可訪問會員功能': this.canAccessMemberFeatures(),
            '可訪問賣家功能': this.canAccessSellerFeatures(),
            '身份描述': this.getUserTypeDescription(),
            'localStorage tokens': {
                authToken: localStorage.getItem('authToken') ? '存在' : '無',
                auth_token: localStorage.getItem('auth_token') ? '存在' : '無',
                token: localStorage.getItem('token') ? '存在' : '無'
            }
        }

        console.table(debugInfo)
        return debugInfo
    }
}

// 創建單例實例
const userIdentityService = new UserIdentityService()

export default userIdentityService

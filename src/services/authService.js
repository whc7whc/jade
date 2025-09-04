// 用戶認證服務
import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app/api';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.eventListeners = [];
        this.loadUserFromStorage();
    }

    // 從 localStorage 載入用戶資料
    loadUserFromStorage() {
        try {
            // 嘗試從 currentUser 載入
            let storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                return;
            }

            // 🔧 兼容現有登入系統：從 localStorage 重建用戶資料
            const memberId = localStorage.getItem('memberId');
            const isSeller = localStorage.getItem('isSeller') === 'true';

            if (memberId) {
                // 基於現有資料重建用戶物件
                this.currentUser = {
                    userId: memberId,
                    memberId: memberId,
                    userType: isSeller ? 'seller' : 'member',
                    role: isSeller,
                    isSeller: isSeller,
                    isLogin: true,
                    // 其他屬性可能從別的地方補充
                    username: '用戶', // 預設值
                    email: '',
                    avatar: ''
                };
                console.log('Auth: 從 localStorage 重建用戶資料:', this.currentUser);
            }
        } catch (error) {
            console.error('載入用戶資料失敗:', error);
            localStorage.removeItem('currentUser');
            this.currentUser = null;
        }
    }

    // 保存用戶資料到 localStorage
    saveUserToStorage(user) {
        try {
            // 切換用戶時清除與用戶關聯的快取（例如 sellerId）
            localStorage.removeItem('currentSellerId')
            localStorage.removeItem('currentSellerId_owner')
            localStorage.setItem('currentUser', JSON.stringify(user));

            // 🔧 修正：適應新的登入系統格式
            // 統一使用 memberId，不區分 member/seller
            if (user.memberId) {
                localStorage.setItem('memberId', user.memberId.toString());
                console.log('Auth: 會員ID已設定:', user.memberId);
            }

            // 設定賣家狀態 (基於 role 或 isSeller 屬性)
            const isSellerStatus = user.role === true || user.role === 'true' ||
                user.isSeller === true || user.isSeller === 'true' ||
                user.userType === 'seller';
            localStorage.setItem('isSeller', isSellerStatus ? 'true' : 'false');
            console.log('Auth: 賣家狀態已設定:', isSellerStatus);

            this.currentUser = user;
            // 通知登入狀態變更
            this.notifyChange('login', user);
        } catch (error) {
            console.error('保存用戶資料失敗:', error);
        }
    }

    // 模擬登入功能 (實際應該連接到您的認證 API)
    async login(credentials) {
        try {
            // 這裡應該調用實際的登入 API
            // const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);

            // 模擬登入成功，根據 email 判斷用戶類型
            const mockUser = this.getMockUserByEmail(credentials.email);

            if (!mockUser) {
                throw new Error('用戶不存在或密碼錯誤');
            }

            this.saveUserToStorage(mockUser);
            return mockUser;
        } catch (error) {
            console.error('登入失敗:', error);
            throw error;
        }
    }

    // 登出
    logout() {
        const oldUser = this.currentUser;
        this.currentUser = null;

        // 🔧 修正：不重複清除 localStorage，避免與主要登入系統衝突
        // localStorage 清除由主要登入系統處理

        // 通知登出狀態變更
        this.notifyChange('logout', oldUser);
    }

    // 獲取當前用戶
    getCurrentUser() {
        return this.currentUser;
    }

    // 檢查是否已登入
    isAuthenticated() {
        return !!this.currentUser;
    }

    // 檢查用戶角色
    hasRole(role) {
        return this.currentUser && this.currentUser.userType === role;
    }

    // 獲取模擬用戶資料 (開發階段使用)
    getMockUserByEmail(email) {
        const mockUsers = {
            'ming@example.com': {
                userId: 123,
                memberId: 123, // 🔧 修正：增加會員ID
                username: '買家小明',
                userType: 'member',
                email: 'ming@example.com',
                avatar: 'https://via.placeholder.com/40/007bff/white?text=明',
                membershipLevel: 'gold',
                totalOrders: 25,
                totalSpent: 15000, // 🔧 新增：累積消費金額
                joinDate: '2024-01-15'
            },
            'fashion@example.com': {
                userId: 124,
                memberId: 124, // 🔧 修正：增加會員ID
                username: '時尚達人',
                userType: 'member',
                email: 'fashion@example.com',
                avatar: 'https://via.placeholder.com/40/007bff/white?text=時',
                membershipLevel: 'platinum',
                totalOrders: 58,
                totalSpent: 35000, // 🔧 新增：累積消費金額
                joinDate: '2023-11-20'
            },
            'shop@fashion.com': {
                userId: 456,
                sellerId: 456, // 🔧 修正：增加賣家ID
                username: '時尚小店',
                userType: 'seller',
                email: 'shop@fashion.com',
                avatar: 'https://via.placeholder.com/40/28a745/white?text=店',
                shopName: '時尚小店',
                shopDescription: '專營韓系時尚服飾，品質保證',
                businessLicense: 'BL456789123',
                rating: 4.8,
                totalSales: 1250,
                verificationStatus: 'verified'
            },
            'korean@style.com': {
                userId: 789,
                sellerId: 789, // 🔧 修正：增加賣家ID
                username: '韓風服飾',
                userType: 'seller',
                email: 'korean@style.com',
                avatar: 'https://via.placeholder.com/40/28a745/white?text=韓',
                shopName: '韓風服飾',
                shopDescription: '正宗韓國進口服飾，跟上最新流行趨勢',
                businessLicense: 'BL789456123',
                rating: 4.6,
                totalSales: 890,
                verificationStatus: 'verified'
            }
        };

        return mockUsers[email] || null;
    }

    // 模擬快速登入 (開發階段使用)
    async quickLogin(userType, userId) {
        const mockUsers = {
            member_123: {
                userId: 123,
                username: '買家小明',
                userType: 'member',
                email: 'ming@example.com',
                avatar: 'https://via.placeholder.com/40/007bff/white?text=明',
                membershipLevel: 'gold',
                totalOrders: 25,
                joinDate: '2024-01-15'
            },
            member_124: {
                userId: 124,
                username: '時尚達人',
                userType: 'member',
                email: 'fashion@example.com',
                avatar: 'https://via.placeholder.com/40/007bff/white?text=時',
                membershipLevel: 'platinum',
                totalOrders: 58,
                joinDate: '2023-11-20'
            },
            seller_456: {
                userId: 456,
                username: '時尚小店',
                userType: 'seller',
                email: 'shop@fashion.com',
                avatar: 'https://via.placeholder.com/40/28a745/white?text=店',
                shopName: '時尚小店',
                shopDescription: '專營韓系時尚服飾，品質保證',
                businessLicense: 'BL456789123',
                rating: 4.8,
                totalSales: 1250,
                verificationStatus: 'verified'
            },
            seller_789: {
                userId: 789,
                username: '韓風服飾',
                userType: 'seller',
                email: 'korean@style.com',
                avatar: 'https://via.placeholder.com/40/28a745/white?text=韓',
                shopName: '韓風服飾',
                shopDescription: '正宗韓國進口服飾，跟上最新流行趨勢',
                businessLicense: 'BL789456123',
                rating: 4.6,
                totalSales: 890,
                verificationStatus: 'verified'
            }
        };

        const key = `${userType}_${userId}`;
        const user = mockUsers[key];

        if (user) {
            this.saveUserToStorage(user);
            return user;
        } else {
            throw new Error('用戶不存在');
        }
    }

    // 註冊新用戶
    async register(userData) {
        try {
            // 這裡應該調用實際的註冊 API
            // const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);

            // 生成唯一ID
            const userId = Date.now();

            // 模擬註冊成功
            const newUser = {
                userId: userId, // 用戶ID
                username: userData.username,
                userType: userData.userType || 'member',
                email: userData.email,
                avatar: userData.avatar || this.getDefaultAvatar(userData.userType, userData.username),
                ...(userData.userType === 'member' && {
                    memberId: userId, // 🔧 修正：為會員設定 memberId
                    membershipLevel: 'bronze',
                    totalOrders: 0,
                    totalSpent: 0, // 🔧 新增：累積消費金額
                    joinDate: new Date().toISOString().split('T')[0]
                }),
                ...(userData.userType === 'seller' && {
                    sellerId: userId, // 🔧 修正：為賣家設定 sellerId  
                    shopName: userData.shopName,
                    shopDescription: userData.shopDescription || '',
                    rating: 0,
                    totalSales: 0,
                    verificationStatus: 'pending'
                })
            };

            this.saveUserToStorage(newUser);
            return newUser;
        } catch (error) {
            console.error('註冊失敗:', error);
            throw error;
        }
    }

    // 獲取預設頭像
    getDefaultAvatar(userType, username) {
        const color = userType === 'seller' ? '28a745' : '007bff';
        const text = username ? username.charAt(0) : (userType === 'seller' ? '店' : '會');
        return `https://via.placeholder.com/40/${color}/white?text=${text}`;
    }

    // 獲取當前賣家 ID (為了相容性)
    getCurrentSellerId() {
        // 先檢查 localStorage 中是否有暫存的 seller ID
        const cachedSellerId = localStorage.getItem('currentSellerId')
        if (cachedSellerId) {
            return parseInt(cachedSellerId)
        }

        // 如果沒有，返回 null，讓調用方自行處理
        return null
    }

    // 設置當前賣家 ID (供其他服務使用)
    setCurrentSellerId(sellerId) {
        if (sellerId) {
            localStorage.setItem('currentSellerId', sellerId.toString())
        } else {
            localStorage.removeItem('currentSellerId')
        }
    }

    // 獲取認證標頭
    getAuthHeaders() {
        const token = localStorage.getItem('token') ||
            localStorage.getItem('authToken') ||
            localStorage.getItem('auth_token')

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        return headers
    }

    // 更新用戶資料
    async updateProfile(updates) {
        if (!this.currentUser) {
            throw new Error('用戶未登入');
        }

        try {
            // 這裡應該調用實際的更新 API
            // const response = await axios.patch(`${API_BASE_URL}/api/users/${this.currentUser.userId}`, updates);

            // 模擬更新成功
            const updatedUser = { ...this.currentUser, ...updates };
            this.saveUserToStorage(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('更新資料失敗:', error);
            throw error;
        }
    }

    // 事件訂閱機制
    addEventListener(callback) {
        if (typeof callback === 'function' && !this.eventListeners.includes(callback)) {
            this.eventListeners.push(callback);
        }
        return callback;
    }

    removeEventListener(callback) {
        const index = this.eventListeners.indexOf(callback);
        if (index !== -1) {
            this.eventListeners.splice(index, 1);
        }
    }

    notifyChange(type, data) {
        this.eventListeners.forEach(callback => {
            try {
                callback({ type, data });
            } catch (error) {
                console.error('執行認證事件回調時出錯:', error);
            }
        });
    }
}

// 創建單例實例
const authService = new AuthService();

export default authService;

// 會員地址服務
import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://localhost:7106/api'

class MemberAddressService {
  constructor() {
    this.http = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 請求攔截器 - 添加認證 token
    this.http.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') ||
                     localStorage.getItem('authToken') ||
                     localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  /**
   * 獲取會員所有地址
   * @param {number} memberId - 會員ID
   * @returns {Promise<Array>} 地址列表
   */
  async getMemberAddresses(memberId) {
    if (!memberId) {
      throw new Error('會員ID不能為空')
    }

    try {
      console.log(`🏠 正在獲取會員 ${memberId} 的地址列表...`)
      const response = await this.http.get(`/members/${memberId}/addresses`)
      
      console.log('✅ 地址列表獲取成功:', response.data)
      return {
        success: true,
        data: response.data || []
      }
    } catch (error) {
      console.error('❌ 獲取地址列表失敗:', error)
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || '獲取地址失敗'
      }
    }
  }

  /**
   * 獲取單一地址詳情
   * @param {number} memberId - 會員ID
   * @param {number} addressId - 地址ID
   * @returns {Promise<Object>} 地址詳情
   */
  async getMemberAddress(memberId, addressId) {
    if (!memberId || !addressId) {
      throw new Error('會員ID和地址ID不能為空')
    }

    try {
      console.log(`🏠 正在獲取會員 ${memberId} 的地址 ${addressId}...`)
      const response = await this.http.get(`/members/${memberId}/addresses/${addressId}`)
      
      console.log('✅ 地址詳情獲取成功:', response.data)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('❌ 獲取地址詳情失敗:', error)
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || '獲取地址詳情失敗'
      }
    }
  }

  /**
   * 新增會員地址
   * @param {number} memberId - 會員ID
   * @param {Object} addressData - 地址資料
   * @returns {Promise<Object>} 新增結果
   */
  async createMemberAddress(memberId, addressData) {
    if (!memberId) {
      throw new Error('會員ID不能為空')
    }

    try {
      console.log(`🏠 正在為會員 ${memberId} 新增地址...`, addressData)
      const response = await this.http.post(`/members/${memberId}/addresses`, addressData)
      
      console.log('✅ 地址新增成功:', response.data)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('❌ 新增地址失敗:', error)
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || '新增地址失敗'
      }
    }
  }

  /**
   * 更新會員地址
   * @param {number} memberId - 會員ID
   * @param {number} addressId - 地址ID
   * @param {Object} addressData - 更新的地址資料
   * @returns {Promise<Object>} 更新結果
   */
  async updateMemberAddress(memberId, addressId, addressData) {
    if (!memberId || !addressId) {
      throw new Error('會員ID和地址ID不能為空')
    }

    try {
      console.log(`🏠 正在更新會員 ${memberId} 的地址 ${addressId}...`, addressData)
      const response = await this.http.put(`/members/${memberId}/addresses/${addressId}`, addressData)
      
      console.log('✅ 地址更新成功:', response.data)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('❌ 更新地址失敗:', error)
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || '更新地址失敗'
      }
    }
  }

  /**
   * 刪除會員地址
   * @param {number} memberId - 會員ID
   * @param {number} addressId - 地址ID
   * @returns {Promise<Object>} 刪除結果
   */
  async deleteMemberAddress(memberId, addressId) {
    if (!memberId || !addressId) {
      throw new Error('會員ID和地址ID不能為空')
    }

    try {
      console.log(`🏠 正在刪除會員 ${memberId} 的地址 ${addressId}...`)
      const response = await this.http.delete(`/members/${memberId}/addresses/${addressId}`)
      
      console.log('✅ 地址刪除成功')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('❌ 刪除地址失敗:', error)
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || '刪除地址失敗'
      }
    }
  }

  /**
   * 設定預設地址
   * @param {number} memberId - 會員ID
   * @param {number} addressId - 地址ID
   * @returns {Promise<Object>} 設定結果
   */
  async setDefaultAddress(memberId, addressId) {
    if (!memberId || !addressId) {
      throw new Error('會員ID和地址ID不能為空')
    }

    try {
      console.log(`🏠 正在設定會員 ${memberId} 的預設地址為 ${addressId}...`)
      const response = await this.http.patch(`/members/${memberId}/addresses/${addressId}/set-default`)
      
      console.log('✅ 預設地址設定成功')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('❌ 設定預設地址失敗:', error)
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || '設定預設地址失敗'
      }
    }
  }

  /**
   * 格式化地址顯示文字
   * @param {Object} address - 地址物件
   * @returns {string} 格式化的地址文字
   */
  formatAddressText(address) {
    if (!address) return ''
    
    const parts = []
    if (address.zipCode) parts.push(address.zipCode)
    if (address.city) parts.push(address.city)
    if (address.district) parts.push(address.district)
    if (address.streetAddress) parts.push(address.streetAddress)
    
    return parts.join('')
  }

  /**
   * 驗證地址資料
   * @param {Object} address - 地址物件
   * @returns {Object} 驗證結果
   */
  validateAddress(address) {
    const errors = []
    
    if (!address.recipientName || address.recipientName.trim() === '') {
      errors.push('收件人姓名不能為空')
    }
    
    if (!address.phoneNumber || address.phoneNumber.trim() === '') {
      errors.push('聯絡電話不能為空')
    }
    
    if (!address.city || address.city.trim() === '') {
      errors.push('城市不能為空')
    }
    
    if (!address.district || address.district.trim() === '') {
      errors.push('區域不能為空')
    }
    
    if (!address.streetAddress || address.streetAddress.trim() === '') {
      errors.push('詳細地址不能為空')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// 創建並導出實例
const memberAddressService = new MemberAddressService()
export default memberAddressService

// 優惠券 API 服務
import authService from './authService.js'

class CouponService {
    constructor() {
        this.baseURL = '/api/Coupons'
    }

    // 獲取當前廠商的優惠券（加入廠商權限控制）
    async getAllCoupons(sellerId = null) {
        try {
            console.log('開始載入優惠券...')

            // 如果沒有傳入 sellerId，則從認證服務獲取
            const currentSellerId = sellerId || authService.getCurrentSellerId()

            if (!currentSellerId) {
                throw new Error('未找到廠商ID，請重新登入')
            }

            // 加入 sellerId 參數，只獲取該廠商的優惠券
            const url = `${this.baseURL}?sellerId=${currentSellerId}`
            console.log('Request URL:', url)

            const response = await fetch(url, {
                method: 'GET',
                headers: authService.getAuthHeaders()
            })

            console.log('Coupon API Response Status:', response.status)

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('認證已過期，請重新登入')
                }
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const text = await response.text()
            console.log('Raw Coupon API Response:', text)

            const responseData = text ? JSON.parse(text) : []
            console.log('Parsed Coupon Data:', responseData)

            // 檢查是否為新的包裝格式 {success: true, data: []}
            let rawData
            if (responseData.success && Array.isArray(responseData.data)) {
                rawData = responseData.data
                console.log('使用新 API 格式，資料筆數:', rawData.length)
            } else if (Array.isArray(responseData)) {
                rawData = responseData
                console.log('使用舊 API 格式，資料筆數:', rawData.length)
            } else {
                rawData = []
                console.log('未知 API 格式，使用空陣列')
            }

            // 額外的安全檢查：確保回傳的優惠券都屬於當前廠商
            const filteredData = this.filterCouponsBySeller(rawData, currentSellerId)

            // 轉換 API 資料格式到前端期望的格式
            const transformedData = filteredData.map(item => this.transformCouponData(item))
            console.log('Transformed Coupon Data:', transformedData)

            return transformedData
        } catch (error) {
            console.error('獲取優惠券失敗:', error)
            throw error
        }
    }

    // 安全過濾：確保優惠券屬於指定廠商
    filterCouponsBySeller(coupons, sellerId) {
        if (!Array.isArray(coupons)) return []

        return coupons.filter(coupon => {
            // 檢查 sellersId 欄位（注意欄位名稱可能是 sellersId 而不是 sellerId）
            const couponSellerId = coupon.sellersId || coupon.sellerId
            return couponSellerId && couponSellerId.toString() === sellerId.toString()
        })
    }

    // 資料轉換方法：將後端資料格式轉換為前端期望的格式
    transformCouponData(apiData) {
        return {
            id: apiData.id,
            name: apiData.title || '', // API: title -> Frontend: name
            code: `COUPON${apiData.id}`, // 產生優惠券代碼
            description: this.generateDescription(apiData), // 產生描述
            discount: apiData.discountAmount || 0, // API: discountAmount -> Frontend: discount
            type: this.mapDiscountType(apiData.discountType), // API: discountType -> Frontend: type
            minAmount: apiData.minSpend || 0, // API: minSpend -> Frontend: minAmount
            startDate: apiData.startAt || null, // API: startAt -> Frontend: startDate
            endDate: apiData.expiredAt || null, // API: expiredAt -> Frontend: endDate
            maxUses: apiData.usageLimit || null, // API: usageLimit -> Frontend: maxUses
            usedCount: apiData.usedCount || 0, // API: usedCount -> Frontend: usedCount
            isActive: apiData.isActive || false, // API: isActive -> Frontend: isActive
            createdAt: apiData.createdAt || null,
            updatedAt: apiData.updatedAt || null
        }
    }

    // 將後端的折扣類型映射到前端期望的類型
    mapDiscountType(apiType) {
        const typeMapping = {
            '%數折扣': 'percentage',
            '滿減': 'fixed',
            'percentage': 'percentage',
            'fixed': 'fixed',
            'shipping': 'shipping'
        }
        return typeMapping[apiType] || 'fixed'
    }

    // 產生優惠券描述
    generateDescription(apiData) {
        const { discountType, discountAmount, minSpend } = apiData

        if (discountType === '%數折扣') {
            const description = `享 ${discountAmount}% 折扣`
            return minSpend ? `${description}，滿 NT$${minSpend} 可用` : description
        } else if (discountType === '滿減') {
            const description = `折抵 NT$${discountAmount}`
            return minSpend ? `滿 NT$${minSpend} ${description}` : description
        } else {
            return `${discountType} 優惠券`
        }
    }

    // 新增優惠券（加入廠商權限控制）
    async createCoupon(couponData) {
        try {
            const currentSellerId = authService.getCurrentSellerId()
            if (!currentSellerId) {
                throw new Error('未找到廠商ID，請重新登入')
            }

            console.log('新增優惠券 - 前端資料:', couponData)

            // 將前端格式轉換為後端期望的格式
            const backendCouponData = this.transformToBackendFormat(couponData, currentSellerId)
            console.log('新增優惠券 - 後端格式:', backendCouponData)

            const url = `${this.baseURL}?sellerId=${currentSellerId}`
            const response = await fetch(url, {
                method: 'POST',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(backendCouponData)
            })

            console.log('Create Coupon Response Status:', response.status)

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('認證已過期，請重新登入')
                }
                const errorText = await response.text()
                console.error('Create Coupon Error:', errorText)
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            const text = await response.text()
            const responseData = text ? JSON.parse(text) : {}
            console.log('Created Coupon Response:', responseData)

            // 檢查是否為新的包裝格式
            let createdCoupon
            if (responseData.success && responseData.data) {
                createdCoupon = responseData.data
                console.log('使用新 API 格式，新增的優惠券:', createdCoupon)
            } else {
                createdCoupon = responseData
                console.log('使用舊 API 格式，新增的優惠券:', createdCoupon)
            }

            return this.transformCouponData(createdCoupon)
        } catch (error) {
            console.error('新增優惠券失敗:', error)
            throw error
        }
    }

    // 將前端資料格式轉換為後端期望的格式
    transformToBackendFormat(frontendData, sellerId) {
        return {
            title: frontendData.name || '', // Frontend: name -> Backend: title
            discountAmount: parseFloat(frontendData.discount) || 0, // Frontend: discount -> Backend: discountAmount
            discountType: this.mapFrontendTypeToBackend(frontendData.type), // Frontend: type -> Backend: discountType
            minSpend: parseFloat(frontendData.minAmount) || 0, // Frontend: minAmount -> Backend: minSpend
            startAt: frontendData.startDate || new Date().toISOString(), // Frontend: startDate -> Backend: startAt
            expiredAt: frontendData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Frontend: endDate -> Backend: expiredAt
            usageLimit: parseInt(frontendData.maxUses) || null, // Frontend: maxUses -> Backend: usageLimit
            isActive: frontendData.isActive !== undefined ? frontendData.isActive : true, // Frontend: isActive -> Backend: isActive
            sellersId: parseInt(sellerId), // 廠商ID
            applicableLevelId: frontendData.applicableLevelId || null,
            categoryId: frontendData.categoryId || null
        }
    }

    // 將前端類型映射到後端類型
    mapFrontendTypeToBackend(frontendType) {
        const typeMapping = {
            'percentage': '%數折扣',
            'fixed': '滿減',
            'shipping': '免運費'
        }
        return typeMapping[frontendType] || '滿減'
    }

    // 更新優惠券（加入廠商權限控制）
    async updateCoupon(id, couponData) {
        try {
            const currentSellerId = authService.getCurrentSellerId()
            if (!currentSellerId) {
                throw new Error('未找到廠商ID，請重新登入')
            }

            console.log('更新優惠券 - 前端資料:', id, couponData)

            // 將前端格式轉換為後端期望的格式
            const backendCouponData = this.transformToBackendFormat(couponData, currentSellerId)
            console.log('更新優惠券 - 後端格式:', backendCouponData)

            const url = `${this.baseURL}/${id}?sellerId=${currentSellerId}`
            const response = await fetch(url, {
                method: 'PUT',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify(backendCouponData)
            })

            console.log('Update Coupon Response Status:', response.status)

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('認證已過期，請重新登入')
                }
                const errorText = await response.text()
                console.error('Update Coupon Error:', errorText)
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            const text = await response.text()
            const responseData = text ? JSON.parse(text) : {}
            console.log('Updated Coupon Response:', responseData)

            // 檢查是否為新的包裝格式
            let updatedCoupon
            if (responseData.success && responseData.data) {
                updatedCoupon = responseData.data
                console.log('使用新 API 格式，更新的優惠券:', updatedCoupon)
            } else {
                updatedCoupon = responseData
                console.log('使用舊 API 格式，更新的優惠券:', updatedCoupon)
            }

            return this.transformCouponData(updatedCoupon)
        } catch (error) {
            console.error('更新優惠券失敗:', error)
            throw error
        }
    }

    // 刪除優惠券（加入廠商權限控制）
    async deleteCoupon(id) {
        try {
            const currentSellerId = authService.getCurrentSellerId()
            if (!currentSellerId) {
                throw new Error('未找到廠商ID，請重新登入')
            }

            console.log('刪除優惠券:', id)

            const url = `${this.baseURL}/${id}?sellerId=${currentSellerId}`
            const response = await fetch(url, {
                method: 'DELETE',
                headers: authService.getAuthHeaders()
            })

            console.log('Delete Coupon Response Status:', response.status)

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('認證已過期，請重新登入')
                }
                const errorText = await response.text()
                console.error('Delete Coupon Error:', errorText)
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            console.log('Coupon deleted successfully')
            return true
        } catch (error) {
            console.error('刪除優惠券失敗:', error)
            throw error
        }
    }

    // 切換優惠券狀態（加入廠商權限控制）
    async toggleCouponStatus(id, isActive) {
        try {
            const currentSellerId = authService.getCurrentSellerId()
            if (!currentSellerId) {
                throw new Error('未找到廠商ID，請重新登入')
            }

            console.log('切換優惠券狀態:', id, isActive)

            const url = `${this.baseURL}/${id}/status?sellerId=${currentSellerId}`
            const response = await fetch(url, {
                method: 'PATCH',
                headers: authService.getAuthHeaders(),
                body: JSON.stringify({ isActive })
            })

            console.log('Toggle Coupon Status Response:', response.status)

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('認證已過期，請重新登入')
                }
                const errorText = await response.text()
                console.error('Toggle Status Error:', errorText)
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            const text = await response.text()
            const responseData = text ? JSON.parse(text) : {}
            console.log('Updated Coupon Status Response:', responseData)

            // 檢查是否為新的包裝格式
            let updatedCoupon
            if (responseData.success && responseData.data) {
                updatedCoupon = responseData.data
                console.log('使用新 API 格式，狀態更新的優惠券:', updatedCoupon)
            } else {
                updatedCoupon = responseData
                console.log('使用舊 API 格式，狀態更新的優惠券:', updatedCoupon)
            }

            return this.transformCouponData(updatedCoupon)
        } catch (error) {
            console.error('切換優惠券狀態失敗:', error)
            throw error
        }
    }
}

// 匯出單例實例
export default new CouponService()

import axios from 'axios'

// 創建 axios 實例
const api = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 請求攔截器
api.interceptors.request.use(
    config => {
        // 添加認證 token
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => Promise.reject(error)
)

// 響應攔截器
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
    }
)

// 產品 API 服務
export const productApi = {
    // 獲取所有產品
    async getAll(includeDeleted = false) {
        try {
            const response = await api.get(`/products?includeDeleted=${includeDeleted}`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || '獲取產品列表失敗'
            }
        }
    },

    // 根據 ID 獲取產品
    async getById(id) {
        try {
            const response = await api.get(`/products/${id}`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || '獲取產品詳情失敗'
            }
        }
    },

    // 創建新產品
    async create(productData) {
        try {
            const payload = {
                name: productData.name,
                description: productData.description,
                category: productData.category,
                originalPrice: productData.originalPrice,
                salePrice: productData.salePrice,

                // 處理變體資料
                variants: productData.variants.map(variant => ({
                    color: variant.color,
                    colorName: variant.colorName,
                    imageUrl: variant.image,
                    // 儲存圖片的詳細資訊
                    imageData: variant.imageData ? {
                        filename: variant.imageData.filename,
                        originalName: variant.imageData.originalName,
                        size: variant.imageData.size,
                        publicId: variant.imageData.publicId
                    } : null,
                    // 尺寸庫存
                    sizeStock: Object.entries(variant.sizes).map(([size, quantity]) => ({
                        size,
                        quantity: parseInt(quantity) || 0
                    }))
                })),

                // 計算總庫存
                totalStock: productData.variants.reduce((total, variant) => {
                    return total + Object.values(variant.sizes).reduce((sum, qty) =>
                        sum + (parseInt(qty) || 0), 0)
                }, 0),

                // 主圖片（第一個變體的圖片）
                mainImageUrl: productData.variants[0]?.image || null,

                // 時間戳
                createdAt: new Date().toISOString(),
                isActive: true
            }

            const response = await api.post('/products', payload)
            return {
                success: true,
                data: response.data,
                message: '產品創建成功'
            }
        } catch (error) {
            console.error('創建產品失敗:', error)
            return {
                success: false,
                error: error.response?.data?.message || '創建產品失敗'
            }
        }
    },

    // 更新產品
    async update(id, productData) {
        try {
            const payload = {
                name: productData.name,
                description: productData.description,
                category: productData.category,
                originalPrice: productData.originalPrice,
                salePrice: productData.salePrice,

                variants: productData.variants.map(variant => ({
                    id: variant.id,
                    color: variant.color,
                    colorName: variant.colorName,
                    imageUrl: variant.image,
                    imageData: variant.imageData ? {
                        filename: variant.imageData.filename,
                        originalName: variant.imageData.originalName,
                        size: variant.imageData.size,
                        publicId: variant.imageData.publicId
                    } : null,
                    sizeStock: Object.entries(variant.sizes).map(([size, quantity]) => ({
                        size,
                        quantity: parseInt(quantity) || 0
                    }))
                })),

                totalStock: productData.variants.reduce((total, variant) => {
                    return total + Object.values(variant.sizes).reduce((sum, qty) =>
                        sum + (parseInt(qty) || 0), 0)
                }, 0),

                mainImageUrl: productData.variants[0]?.image || null,
                updatedAt: new Date().toISOString()
            }

            const response = await api.put(`/products/${id}`, payload)
            return {
                success: true,
                data: response.data,
                message: '產品更新成功'
            }
        } catch (error) {
            console.error('更新產品失敗:', error)
            return {
                success: false,
                error: error.response?.data?.message || '更新產品失敗'
            }
        }
    },

    // 軟刪除產品
    async softDelete(id, deleteData = {}) {
        try {
            const payload = {
                reason: deleteData.reason || 'no_reason',
                customReason: deleteData.customReason || null,
                deletedAt: new Date().toISOString()
            }

            const response = await api.patch(`/products/${id}/soft-delete`, payload)
            return {
                success: true,
                data: response.data,
                message: '產品已移至回收站'
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || '刪除產品失敗'
            }
        }
    },

    // 復原產品
    async restore(id) {
        try {
            const payload = {
                restoredAt: new Date().toISOString()
            }

            const response = await api.patch(`/products/${id}/restore`, payload)
            return {
                success: true,
                data: response.data,
                message: '產品復原成功'
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || '復原產品失敗'
            }
        }
    },

    // 永久刪除產品
    async hardDelete(id) {
        try {
            const response = await api.delete(`/products/${id}`)
            return {
                success: true,
                message: '產品已永久刪除'
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || '永久刪除失敗'
            }
        }
    },

    // 批量操作
    async batchSoftDelete(ids, deleteData = {}) {
        try {
            const payload = {
                productIds: ids,
                reason: deleteData.reason || 'batch_delete',
                customReason: deleteData.customReason || null,
                deletedAt: new Date().toISOString()
            }

            const response = await api.patch('/products/batch-soft-delete', payload)
            return {
                success: true,
                data: response.data,
                message: `已刪除 ${ids.length} 個產品`
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || '批量刪除失敗'
            }
        }
    },

    async batchRestore(ids) {
        try {
            const payload = {
                productIds: ids,
                restoredAt: new Date().toISOString()
            }

            const response = await api.patch('/products/batch-restore', payload)
            return {
                success: true,
                data: response.data,
                message: `已復原 ${ids.length} 個產品`
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || '批量復原失敗'
            }
        }
    },

    // 搜索產品
    async search(query, options = {}) {
        try {
            const params = new URLSearchParams({
                q: query,
                includeDeleted: options.includeDeleted || false,
                category: options.category || '',
                minPrice: options.minPrice || '',
                maxPrice: options.maxPrice || '',
                sortBy: options.sortBy || 'createdAt',
                sortOrder: options.sortOrder || 'desc',
                page: options.page || 1,
                limit: options.limit || 20
            })

            const response = await api.get(`/products/search?${params}`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || '搜索失敗'
            }
        }
    },

    // 獲取產品統計
    async getStats() {
        try {
            const response = await api.get('/products/stats')
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || '獲取統計失敗'
            }
        }
    },

    // 更新產品狀態
    async updateStatus(id, status) {
        try {
            const response = await api.patch(`/products/${id}/status`, { status })
            return {
                success: true,
                data: response.data,
                message: '產品狀態更新成功'
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || '狀態更新失敗'
            }
        }
    }
}

export default productApi

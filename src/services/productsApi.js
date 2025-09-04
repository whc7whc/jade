import axios from 'axios'

// 創建 axios 實例
const api = axios.create({
    baseURL: `${process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 請求攔截器
api.interceptors.request.use(
    config => {
        // 添加認證 token (如果有的話)
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
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
export const productsApi = {
    // 獲取所有產品（包含已刪除的）
    async getAll(includeDeleted = false) {
        const response = await api.get(`/products?includeDeleted=${includeDeleted}`)
        return response.data
    },

    // 獲取活躍產品
    async getActive() {
        const response = await api.get('/products/active')
        return response.data
    },

    // 獲取已刪除產品
    async getDeleted() {
        const response = await api.get('/products/deleted')
        return response.data
    },

    // 根據 ID 獲取產品
    async getById(id) {
        const response = await api.get(`/products/${id}`)
        return response.data
    },

    // 創建新產品
    async create(productData) {
        const response = await api.post('/products', productData)
        return response.data
    },

    // 更新產品
    async update(id, productData) {
        const response = await api.put(`/products/${id}`, productData)
        return response.data
    },

    // 軟刪除產品
    async softDelete(id, deleteData = {}) {
        const payload = {
            reason: deleteData.reason || 'no_reason',
            customReason: deleteData.customReason || null,
            deletedAt: new Date().toISOString()
        }

        const response = await api.patch(`/products/${id}/soft-delete`, payload)
        return response.data
    },

    // 硬刪除產品（永久刪除）
    async hardDelete(id) {
        const response = await api.delete(`/products/${id}`)
        return response.data
    },

    // 復原已刪除的產品
    async restore(id) {
        const response = await api.patch(`/products/${id}/restore`, {
            restoredAt: new Date().toISOString()
        })
        return response.data
    },

    // 批量軟刪除
    async batchSoftDelete(ids, deleteData = {}) {
        const payload = {
            productIds: ids,
            reason: deleteData.reason || 'batch_delete',
            customReason: deleteData.customReason || null,
            deletedAt: new Date().toISOString()
        }

        const response = await api.patch('/products/batch-soft-delete', payload)
        return response.data
    },

    // 批量復原
    async batchRestore(ids) {
        const payload = {
            productIds: ids,
            restoredAt: new Date().toISOString()
        }

        const response = await api.patch('/products/batch-restore', payload)
        return response.data
    },

    // 上傳產品圖片
    async uploadImage(file, productId = null) {
        const formData = new FormData()
        formData.append('image', file)
        if (productId) {
            formData.append('productId', productId)
        }

        const response = await api.post('/products/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    },

    // 搜索產品
    async search(query, options = {}) {
        const params = new URLSearchParams({
            q: query,
            includeDeleted: options.includeDeleted || false,
            category: options.category || '',
            minPrice: options.minPrice || '',
            maxPrice: options.maxPrice || '',
            sortBy: options.sortBy || 'name',
            sortOrder: options.sortOrder || 'asc',
            page: options.page || 1,
            limit: options.limit || 20
        })

        const response = await api.get(`/products/search?${params}`)
        return response.data
    },

    // 獲取產品統計
    async getStats() {
        const response = await api.get('/products/stats')
        return response.data
    }
}

export default productsApi

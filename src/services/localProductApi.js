// 本地儲存版本的產品 API 服務
class LocalProductApi {
    constructor() {
        this.storageKey = 'jade_products'
        this.initialize()
    }

    initialize() {
        // 如果本地儲存沒有產品資料，初始化一些範例資料
        if (!localStorage.getItem(this.storageKey)) {
            const sampleProducts = [
                {
                    id: 1,
                    name: '時尚T恤',
                    category: 'casual',
                    originalPrice: 890,
                    salePrice: 690,
                    description: '舒適百搭的經典T恤',
                    status: 'active',
                    variants: [
                        {
                            id: 1,
                            colorName: '黑色',
                            colorCode: '#000000',
                            sizes: [
                                { size: 'S', stock: 10 },
                                { size: 'M', stock: 15 },
                                { size: 'L', stock: 12 }
                            ],
                            image: 'https://res.cloudinary.com/jadetainan/image/upload/v1755593136/sample_tshirt.jpg'
                        }
                    ],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ]
            localStorage.setItem(this.storageKey, JSON.stringify(sampleProducts))
        }
    }

    // 模擬 API 延遲
    delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    // 獲取所有產品
    async getProducts() {
        await this.delay(300)

        try {
            const products = JSON.parse(localStorage.getItem(this.storageKey) || '[]')
            console.log('📦 LocalProductApi: 獲取產品', products)

            return {
                success: true,
                data: products
            }
        } catch (error) {
            console.error('❌ LocalProductApi: 獲取產品失敗', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 獲取單一產品
    async getProduct(id) {
        await this.delay(200)

        try {
            const products = JSON.parse(localStorage.getItem(this.storageKey) || '[]')
            const product = products.find(p => p.id === parseInt(id))

            if (!product) {
                throw new Error('產品不存在')
            }

            console.log('📦 LocalProductApi: 獲取產品', product)

            return {
                success: true,
                data: product
            }
        } catch (error) {
            console.error('❌ LocalProductApi: 獲取產品失敗', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 新增產品
    async createProduct(productData) {
        await this.delay(800)

        try {
            console.log('📝 LocalProductApi: 新增產品', productData)

            const products = JSON.parse(localStorage.getItem(this.storageKey) || '[]')

            // 生成新的 ID
            const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0
            const newId = maxId + 1

            // 準備新產品資料
            const newProduct = {
                id: newId,
                name: productData.name,
                category: productData.category,
                originalPrice: productData.originalPrice,
                salePrice: productData.salePrice,
                description: productData.description || '',
                status: productData.status || 'active',
                variants: productData.variants || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            // 處理款式資料
            if (productData.variants && productData.variants.length > 0) {
                newProduct.variants = productData.variants.map((variant, index) => ({
                    id: index + 1,
                    colorName: variant.colorName,
                    colorCode: variant.colorCode,
                    sizes: variant.sizes || [],
                    image: variant.image || '',
                    imageData: variant.imageData || null
                }))
            }

            products.push(newProduct)
            localStorage.setItem(this.storageKey, JSON.stringify(products))

            console.log('✅ LocalProductApi: 產品新增成功', newProduct)

            return {
                success: true,
                data: newProduct,
                message: '產品新增成功！'
            }
        } catch (error) {
            console.error('❌ LocalProductApi: 新增產品失敗', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 更新產品
    async updateProduct(id, productData) {
        await this.delay(800)

        try {
            console.log('📝 LocalProductApi: 更新產品', { id, productData })

            const products = JSON.parse(localStorage.getItem(this.storageKey) || '[]')
            const productIndex = products.findIndex(p => p.id === parseInt(id))

            if (productIndex === -1) {
                throw new Error('產品不存在')
            }

            // 更新產品資料
            const updatedProduct = {
                ...products[productIndex],
                name: productData.name,
                category: productData.category,
                originalPrice: productData.originalPrice,
                salePrice: productData.salePrice,
                description: productData.description || '',
                status: productData.status || 'active',
                variants: productData.variants || [],
                updatedAt: new Date().toISOString()
            }

            // 處理款式資料
            if (productData.variants && productData.variants.length > 0) {
                updatedProduct.variants = productData.variants.map((variant, index) => ({
                    id: variant.id || (index + 1),
                    colorName: variant.colorName,
                    colorCode: variant.colorCode,
                    sizes: variant.sizes || [],
                    image: variant.image || '',
                    imageData: variant.imageData || null
                }))
            }

            products[productIndex] = updatedProduct
            localStorage.setItem(this.storageKey, JSON.stringify(products))

            console.log('✅ LocalProductApi: 產品更新成功', updatedProduct)

            return {
                success: true,
                data: updatedProduct,
                message: '產品更新成功！'
            }
        } catch (error) {
            console.error('❌ LocalProductApi: 更新產品失敗', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 刪除產品
    async deleteProduct(id) {
        await this.delay(500)

        try {
            console.log('🗑️ LocalProductApi: 刪除產品', id)

            const products = JSON.parse(localStorage.getItem(this.storageKey) || '[]')
            const productIndex = products.findIndex(p => p.id === parseInt(id))

            if (productIndex === -1) {
                throw new Error('產品不存在')
            }

            const deletedProduct = products[productIndex]
            products.splice(productIndex, 1)
            localStorage.setItem(this.storageKey, JSON.stringify(products))

            console.log('✅ LocalProductApi: 產品刪除成功', deletedProduct)

            return {
                success: true,
                data: deletedProduct,
                message: '產品刪除成功！'
            }
        } catch (error) {
            console.error('❌ LocalProductApi: 刪除產品失敗', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 批次操作
    async batchUpdate(operations) {
        await this.delay(1000)

        try {
            console.log('📦 LocalProductApi: 批次操作', operations)

            const results = []

            for (const operation of operations) {
                switch (operation.action) {
                    case 'create':{
                        const createResult = await this.createProduct(operation.data)
                        results.push(createResult)
                        break
                    }

                    case 'update':{
                        const updateResult = await this.updateProduct(operation.id, operation.data)
                        results.push(updateResult)
                        break
                    }

                    case 'delete':{
                        const deleteResult = await this.deleteProduct(operation.id)
                        results.push(deleteResult)
                        break
                    }

                    default:{
                        results.push({
                            success: false,
                            error: `未知操作: ${operation.action}`
                        })
                        break
                    }
                }
            }

            return {
                success: true,
                data: results,
                message: '批次操作完成！'
            }
        } catch (error) {
            console.error('❌ LocalProductApi: 批次操作失敗', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 清除所有資料 (開發用)
    clearAll() {
        localStorage.removeItem(this.storageKey)
        this.initialize()
        console.log('🧹 LocalProductApi: 已清除所有產品資料')
    }

    // 匯出資料
    exportData() {
        const products = JSON.parse(localStorage.getItem(this.storageKey) || '[]')
        const dataStr = JSON.stringify(products, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })

        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        link.download = `jade_products_${new Date().toISOString().split('T')[0]}.json`
        link.click()

        console.log('📁 LocalProductApi: 資料已匯出')
    }

    // 匯入資料
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = (e) => {
                try {
                    const products = JSON.parse(e.target.result)
                    localStorage.setItem(this.storageKey, JSON.stringify(products))
                    console.log('📁 LocalProductApi: 資料已匯入', products)
                    resolve({
                        success: true,
                        data: products,
                        message: '資料匯入成功！'
                    })
                } catch (error) {
                    reject({
                        success: false,
                        error: '匯入檔案格式錯誤'
                    })
                }
            }

            reader.onerror = () => {
                reject({
                    success: false,
                    error: '檔案讀取失敗'
                })
            }

            reader.readAsText(file)
        })
    }
}

// 創建單例
const localProductApi = new LocalProductApi()

export default localProductApi

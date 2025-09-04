class UploadService {
    constructor() {
        this.baseURL = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'

        // Cloudinary 配置
        this.cloudinaryConfig = {
            cloudName: process.env.VUE_APP_CLOUDINARY_CLOUD_NAME || 'jadetainan',
            apiKey: process.env.VUE_APP_CLOUDINARY_API_KEY || '384776688611428',
            uploadPreset: process.env.VUE_APP_CLOUDINARY_UPLOAD_PRESET || 'jade-products'
        }

        // 調試：輸出配置資訊
        console.log('🚀 UploadService 初始化', {
            cloudinaryConfig: this.cloudinaryConfig,
            env: {
                VUE_APP_CLOUDINARY_CLOUD_NAME: process.env.VUE_APP_CLOUDINARY_CLOUD_NAME,
                VUE_APP_CLOUDINARY_API_KEY: process.env.VUE_APP_CLOUDINARY_API_KEY,
                VUE_APP_CLOUDINARY_UPLOAD_PRESET: process.env.VUE_APP_CLOUDINARY_UPLOAD_PRESET
            }
        })
        this.uploadConfigs = {
            avatar: {
                endpoint: '/api/upload/avatar',
                maxSize: 2, // MB
                maxWidth: 500,
                maxHeight: 500,
                quality: 0.8,
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
                folder: 'avatars'
            },
            product: {
                endpoint: '/api/upload/product',
                maxSize: 5,
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.9,
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
                folder: 'products'
            },
            banner: {
                endpoint: '/api/upload/banner',
                maxSize: 10,
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 0.9,
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
                folder: 'banners'
            },
            category: {
                endpoint: '/api/upload/category',
                maxSize: 3,
                maxWidth: 800,
                maxHeight: 600,
                quality: 0.8,
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
                folder: 'categories'
            }
        }
    }

    // 取得上傳配置
    getConfig(type) {
        return this.uploadConfigs[type] || this.uploadConfigs.product
    }

    // 驗證檔案
    validateFile(file, type) {
        const config = this.getConfig(type)
        const errors = []

        // 檢查檔案類型
        if (!config.allowedTypes.includes(file.type)) {
            errors.push(`不支援的檔案格式，支援格式：${config.allowedTypes.map(type => type.split('/')[1]).join(', ')}`)
        }

        // 檢查檔案大小
        if (file.size > config.maxSize * 1024 * 1024) {
            errors.push(`檔案大小不能超過 ${config.maxSize}MB`)
        }

        return {
            valid: errors.length === 0,
            errors
        }
    }

    // 圖片預處理
    async preprocessImage(file, type) {
        const config = this.getConfig(type)

        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()

            img.onload = () => {
                // 計算新尺寸
                const { width, height } = this.calculateNewSize(
                    img.width,
                    img.height,
                    config.maxWidth,
                    config.maxHeight
                )

                canvas.width = width
                canvas.height = height

                // 繪製圖片
                ctx.drawImage(img, 0, 0, width, height)

                // 轉換為 Blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            }))
                        } else {
                            reject(new Error('圖片處理失敗'))
                        }
                    },
                    file.type,
                    config.quality
                )
            }

            img.onerror = () => reject(new Error('圖片載入失敗'))
            img.src = URL.createObjectURL(file)
        })
    }

    // 計算新尺寸
    calculateNewSize(originalWidth, originalHeight, maxWidth, maxHeight) {
        let width = originalWidth
        let height = originalHeight

        if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
        }

        if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
        }

        return {
            width: Math.round(width),
            height: Math.round(height)
        }
    }

    // 上傳檔案到 Cloudinary
    async uploadToCloudinary(file) {
        // 調試：檢查 Cloudinary 配置
        console.log('🔧 uploadToCloudinary: 配置檢查', {
            cloudName: this.cloudinaryConfig.cloudName,
            uploadPreset: this.cloudinaryConfig.uploadPreset,
            envCloudName: process.env.VUE_APP_CLOUDINARY_CLOUD_NAME,
            envUploadPreset: process.env.VUE_APP_CLOUDINARY_UPLOAD_PRESET
        })

        if (!this.cloudinaryConfig.cloudName) {
            console.error('❌ cloudName 未設定')
            return {
                success: false,
                error: 'Cloudinary cloudName 未正確設定'
            }
        }

        if (!this.cloudinaryConfig.uploadPreset) {
            console.error('❌ uploadPreset 未設定')
            return {
                success: false,
                error: 'Cloudinary uploadPreset 未正確設定'
            }
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', this.cloudinaryConfig.uploadPreset)
        formData.append('cloud_name', this.cloudinaryConfig.cloudName)

        const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/image/upload`

        console.log('📤 uploadToCloudinary: 開始上傳', {
            url: uploadUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        })

        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData
            })

            console.log('📥 uploadToCloudinary: 收到回應', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ Cloudinary 錯誤回應:', errorText)

                let errorMessage = '上傳到 Cloudinary 失敗'

                try {
                    const errorData = JSON.parse(errorText)
                    errorMessage = errorData.error?.message || errorData.message || errorMessage
                } catch (e) {
                    errorMessage = errorText || errorMessage
                }

                throw new Error(errorMessage)
            }

            const data = await response.json()

            console.log('✅ uploadToCloudinary: 上傳成功', data)

            return {
                success: true,
                url: data.secure_url,
                publicId: data.public_id,
                width: data.width,
                height: data.height,
                format: data.format,
                bytes: data.bytes,
                createdAt: data.created_at
            }
        } catch (error) {
            console.error('❌ uploadToCloudinary: 上傳錯誤:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 上傳檔案到後端API（同時上傳到 Cloudinary）
    async uploadFile(file, type, options = {}) {
        // 驗證檔案
        const validation = this.validateFile(file, type)
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '))
        }

        // 預處理圖片
        const processedFile = await this.preprocessImage(file, type)
        const config = this.getConfig(type)

        const formData = new FormData()
        formData.append('file', processedFile)
        formData.append('type', type)
        formData.append('folder', config.folder)

        // 添加額外參數
        if (options.metadata) {
            Object.keys(options.metadata).forEach(key => {
                formData.append(key, options.metadata[key])
            })
        }

        try {
            // 首先上傳到 Cloudinary
            const cloudinaryResult = await this.uploadToCloudinary(processedFile)

            if (!cloudinaryResult.success) {
                throw new Error(cloudinaryResult.error)
            }

            // 然後將資訊儲存到後端資料庫（可選）
            const dbResult = await this.saveToDatabase(cloudinaryResult, type, options)

            return {
                success: true,
                data: {
                    url: cloudinaryResult.url,
                    publicId: cloudinaryResult.publicId,
                    filename: `${cloudinaryResult.publicId}.${cloudinaryResult.format}`,
                    originalName: file.name,
                    size: cloudinaryResult.bytes,
                    width: cloudinaryResult.width,
                    height: cloudinaryResult.height,
                    format: cloudinaryResult.format,
                    type: type,
                    uploadedAt: cloudinaryResult.createdAt
                }
            }

        } catch (error) {
            console.error('Upload error:', error)
            return {
                success: false,
                error: error.message || '上傳失敗'
            }
        }
    }

    // 儲存圖片資訊到資料庫
    async saveToDatabase(cloudinaryResult, type, options) {
        try {
            const payload = {
                url: cloudinaryResult.url,
                publicId: cloudinaryResult.publicId,
                type: type,
                width: cloudinaryResult.width,
                height: cloudinaryResult.height,
                format: cloudinaryResult.format,
                size: cloudinaryResult.bytes,
                uploadedAt: cloudinaryResult.createdAt,
                ...options.metadata
            }

            // 這裡可以呼叫後端API儲存圖片資訊
            // const response = await fetch(`${this.baseURL}/api/images`, {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            //   },
            //   body: JSON.stringify(payload)
            // })

            console.log('圖片資訊已準備儲存到資料庫:', payload)
            return { success: true, data: payload }

        } catch (error) {
            console.error('資料庫儲存錯誤:', error)
            // 即使資料庫儲存失敗，Cloudinary 上傳已成功，所以不拋出錯誤
            return { success: false, error: error.message }
        }
    }

    // 批次上傳
    async uploadMultiple(files, type, options = {}) {
        const results = []

        for (const file of files) {
            try {
                const result = await this.uploadFile(file, type, options)
                results.push(result)
            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    filename: file.name
                })
            }
        }

        return results
    }

    // 刪除檔案
    async deleteFile(filename, type) {
        const config = this.getConfig(type)

        try {
            const response = await fetch(`${this.baseURL}${config.endpoint}/${filename}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
                }
            })

            if (!response.ok) {
                throw new Error('刪除失敗')
            }

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // 產生縮圖 URL
    getThumbnailUrl(url, size = 'medium') {
        const sizes = {
            small: 150,
            medium: 300,
            large: 600
        }

        if (!url) return ''

        // 如果 URL 包含參數，添加縮圖參數
        const separator = url.includes('?') ? '&' : '?'
        return `${url}${separator}thumbnail=${sizes[size] || sizes.medium}`
    }

    // 格式化檔案大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
}

// 創建單例
const uploadService = new UploadService()
export default uploadService

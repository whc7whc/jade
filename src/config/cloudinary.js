// Cloudinary 配置
export const cloudinaryConfig = {
    cloudName: 'jadetainan',
    apiKey: '384776688611428',
    // 注意：apiSecret 不應該暴露在前端，只在後端使用
    uploadPreset: 'jade-products' // 需要在 Cloudinary 控制台創建此 preset
}

// Cloudinary上傳函數
export const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', cloudinaryConfig.uploadPreset)
    formData.append('cloud_name', cloudinaryConfig.cloudName)

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        )

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || '上傳失敗')
        }

        const data = await response.json()
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
        console.error('Cloudinary上傳錯誤:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

// 生成Cloudinary轉換URL
export const getTransformedUrl = (publicId, transformations = {}) => {
    if (!publicId) return ''

    const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`

    // 構建轉換參數
    const transforms = []

    if (transformations.width) transforms.push(`w_${transformations.width}`)
    if (transformations.height) transforms.push(`h_${transformations.height}`)
    if (transformations.crop) transforms.push(`c_${transformations.crop}`)
    if (transformations.quality) transforms.push(`q_${transformations.quality}`)
    if (transformations.format) transforms.push(`f_${transformations.format}`)

    const transformString = transforms.length > 0 ? transforms.join(',') + '/' : ''

    return `${baseUrl}/${transformString}${publicId}`
}

// 生成縮圖URL
export const getThumbnailUrl = (publicId, size = 'medium') => {
    const sizes = {
        small: { width: 150, height: 150, crop: 'fill' },
        medium: { width: 300, height: 300, crop: 'fill' },
        large: { width: 600, height: 600, crop: 'fit' }
    }

    const sizeConfig = sizes[size] || sizes.medium
    return getTransformedUrl(publicId, sizeConfig)
}

// 刪除Cloudinary圖片（需要後端支援）
export const deleteFromCloudinary = async (publicId) => {
    try {
        // 前端無法直接刪除，需要透過後端API
        const response = await fetch('/api/cloudinary/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ publicId })
        })

        if (!response.ok) {
            throw new Error('刪除圖片失敗')
        }

        return await response.json()
    } catch (error) {
        console.error('刪除圖片錯誤:', error)
        return { success: false, error: error.message }
    }
}

export default {
    config: cloudinaryConfig,
    upload: uploadToCloudinary,
    getTransformedUrl,
    getThumbnailUrl,
    deleteImage: deleteFromCloudinary
}

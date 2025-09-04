// components/ProductImageUploader.vue
<template>
  <div class="product-image-uploader">
    <div class="upload-section">
      <h6 class="mb-3">商品圖片管理</h6>
      
      <!-- 上傳區域 -->
      <div class="upload-zone" :class="{ 'dragover': isDragOver }" 
           @dragover.prevent="isDragOver = true"
           @dragleave.prevent="isDragOver = false"
           @drop.prevent="handleDrop">
        <input 
          ref="fileInput"
          type="file" 
          :multiple="multiple"
          accept="image/*"
          @change="handleFileSelect"
          class="d-none"
        >
        
        <div class="upload-content text-center py-4">
          <div v-if="uploading" class="uploading-state">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">上傳中...</span>
            </div>
            <p class="mb-0">正在上傳圖片... ({{ uploadProgress }}%)</p>
          </div>
          
          <div v-else class="upload-prompt">
            <i class="fas fa-cloud-upload-alt fa-2x text-muted mb-3"></i>
            <p class="mb-2">拖拽圖片到此處或</p>
            <button type="button" class="btn btn-outline-primary btn-sm" @click="selectFiles">
              <i class="fas fa-plus me-1"></i>選擇圖片
            </button>
            <small class="text-muted d-block mt-2">
              支援 JPG、PNG、GIF、WebP 格式，單檔最大 5MB
              {{ multiple ? '，一次最多 10 張' : '' }}
            </small>
          </div>
        </div>
      </div>

      <!-- 上傳結果 -->
      <div v-if="uploadResults.length > 0" class="upload-results mt-3">
        <h6>已上傳的圖片</h6>
        <div class="row g-3">
          <div v-for="(result, index) in uploadResults" :key="index" class="col-6 col-md-4 col-lg-3">
            <div class="uploaded-image-card">
              <div class="image-container">
                <img :src="result.url" :alt="result.fileName" class="img-fluid rounded">
                <div class="image-overlay">
                  <button type="button" class="btn btn-sm btn-danger" @click="removeImage(index)">
                    <i class="fas fa-trash"></i>
                  </button>
                  <button type="button" class="btn btn-sm btn-primary" @click="copyUrl(result.url)">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              <small class="text-muted mt-1 d-block text-truncate" :title="result.fileName">
                {{ result.fileName }}
              </small>
              <small class="text-success">
                <i class="fas fa-check me-1"></i>已上傳
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="errorMessages.length > 0" class="error-messages mt-3">
        <div class="alert alert-danger">
          <h6>上傳失敗的檔案：</h6>
          <ul class="mb-0">
            <li v-for="error in errorMessages" :key="error">{{ error }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductImageUploader',
  props: {
    multiple: {
      type: Boolean,
      default: true
    },
    maxFiles: {
      type: Number,
      default: 10
    },
    maxSize: {
      type: Number,
      default: 5 * 1024 * 1024 // 5MB
    },
    folder: {
      type: String,
      default: 'products'
    }
  },
  emits: ['upload-success', 'upload-error', 'images-updated'],
  data() {
    return {
      uploading: false,
      uploadProgress: 0,
      isDragOver: false,
      uploadResults: [],
      errorMessages: []
    }
  },
  methods: {
    // 選擇檔案
    selectFiles() {
      this.$refs.fileInput.click()
    },

    // 處理檔案選擇
    async handleFileSelect(event) {
      const files = Array.from(event.target.files)
      await this.uploadFiles(files)
      
      // 清空 input
      event.target.value = ''
    },

    // 處理拖拽上傳
    async handleDrop(event) {
      this.isDragOver = false
      const files = Array.from(event.dataTransfer.files)
      await this.uploadFiles(files)
    },

    // 驗證檔案
    validateFiles(files) {
      const errors = []
      const validFiles = []

      // 檢查檔案數量
      if (this.multiple && files.length > this.maxFiles) {
        errors.push(`最多只能選擇 ${this.maxFiles} 個檔案`)
        return { validFiles: [], errors }
      }

      for (const file of files) {
        // 檢查檔案類型
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name} 不是有效的圖片格式`)
          continue
        }

        // 檢查檔案大小
        if (file.size > this.maxSize) {
          errors.push(`${file.name} 檔案過大（限制 ${this.formatFileSize(this.maxSize)}）`)
          continue
        }

        validFiles.push(file)
      }

      return { validFiles, errors }
    },

    // 上傳檔案
    async uploadFiles(files) {
      if (files.length === 0) return

      this.errorMessages = []
      const { validFiles, errors } = this.validateFiles(files)
      
      if (errors.length > 0) {
        this.errorMessages = errors
        this.$emit('upload-error', errors)
        return
      }

      try {
        this.uploading = true
        this.uploadProgress = 0

        if (this.multiple && validFiles.length > 1) {
          // 批量上傳
          await this.uploadMultipleFiles(validFiles)
        } else {
          // 單檔上傳
          await this.uploadSingleFile(validFiles[0])
        }

        this.$emit('upload-success', this.uploadResults)
        this.$emit('images-updated', this.uploadResults)
        
      } catch (error) {
        console.error('上傳失敗:', error)
        this.errorMessages.push(error.message || '上傳失敗，請稍後再試')
        this.$emit('upload-error', error)
      } finally {
        this.uploading = false
        this.uploadProgress = 0
      }
    },

    // 單檔上傳
    async uploadSingleFile(file) {
      const formData = new FormData()
      formData.append('file', file)

      // 🔥 修復：使用正確的 API 基礎 URL
      const apiBaseUrl = process.env.VUE_APP_API_BASE_URL || 'https://localhost:7106'
      const uploadUrl = `${apiBaseUrl}/api/Products/upload-image`
      
      console.log('📡 單檔上傳 URL:', uploadUrl)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 單檔上傳失敗:', errorText)
        throw new Error(`上傳失敗: ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        this.uploadResults.push({
          url: result.url,
          fileName: result.fileName,
          size: result.size,
          uploadedAt: result.uploadedAt
        })
        this.uploadProgress = 100
      } else {
        throw new Error(result.message || '上傳失敗')
      }
    },

    // 批量上傳
    async uploadMultipleFiles(files) {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      // 🔥 修復：使用正確的 API 基礎 URL
      const apiBaseUrl = process.env.VUE_APP_API_BASE_URL || 'https://localhost:7106'
      const uploadUrl = `${apiBaseUrl}/api/Products/upload-multiple-images`
      
      console.log('📡 批量上傳 URL:', uploadUrl)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 批量上傳失敗:', errorText)
        throw new Error(`批量上傳失敗: ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        this.uploadResults.push(...result.uploadedImages)
        this.uploadProgress = 100
        
        if (result.failedFiles && result.failedFiles.length > 0) {
          this.errorMessages = result.failedFiles.map(fileName => `${fileName} 上傳失敗`)
        }
      } else {
        throw new Error(result.message || '批量上傳失敗')
      }
    },

    // 移除圖片
    removeImage(index) {
      this.uploadResults.splice(index, 1)
      this.$emit('images-updated', this.uploadResults)
    },

    // 複製 URL
    async copyUrl(url) {
      try {
        await navigator.clipboard.writeText(url)
        this.showToast('圖片 URL 已複製到剪貼板', 'success')
      } catch (error) {
        console.error('複製失敗:', error)
        this.showToast('複製失敗', 'error')
      }
    },

    // 格式化檔案大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 顯示 Toast 訊息
    showToast(message, type = 'info') {
      // 簡單的 Toast 實作
      const toast = document.createElement('div')
      toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`
      toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 200px;'
      toast.textContent = message
      
      document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.remove()
      }, 3000)
    },

    // 清空結果
    clearResults() {
      this.uploadResults = []
      this.errorMessages = []
      this.$emit('images-updated', this.uploadResults)
    },

    // 取得上傳的圖片 URLs
    getUploadedUrls() {
      return this.uploadResults.map(result => result.url)
    }
  }
}
</script>

<style scoped>
.product-image-uploader {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #fff;
}

.upload-zone {
  border: 2px dashed #dee2e6;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-zone:hover,
.upload-zone.dragover {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.05);
}

.upload-content {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.uploaded-image-card {
  position: relative;
}

.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 0.375rem;
  aspect-ratio: 1;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.uploading-state {
  color: #007bff;
}

.upload-results {
  max-height: 400px;
  overflow-y: auto;
}

.error-messages {
  max-height: 200px;
  overflow-y: auto;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .upload-content {
    min-height: 100px;
    padding: 1rem;
  }
  
  .upload-results .col-6 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}
</style>
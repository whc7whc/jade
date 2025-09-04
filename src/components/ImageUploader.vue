<template>
  <div class="image-uploader">
    <!-- 圖片預覽區域 -->
    <div class="image-preview-container" v-if="previewUrl || defaultImage">
      <img 
        :src="previewUrl || defaultImage" 
        :alt="alt"
        class="preview-image"
        :class="[imageClass, { 'grayscale': readonly }]"
      />
      <div class="image-overlay" v-if="!readonly">
        <div class="image-actions">
          <button 
            type="button" 
            class="btn btn-sm btn-light me-2"
            @click="triggerFileInput"
            title="更換圖片"
          >
            <i class="fas fa-camera"></i>
            更換
          </button>
          <button 
            v-if="(previewUrl || defaultImage) && allowRemove"
            type="button" 
            class="btn btn-sm btn-danger"
            @click="removeImage"
            title="移除圖片"
          >
            <i class="fas fa-trash"></i>
            移除
          </button>
        </div>
      </div>
    </div>
    
    <!-- 上傳區域 -->
    <div 
      v-else
      class="upload-zone"
      :class="{ 'dragover': isDragOver, 'uploading': uploading }"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div v-if="uploading" class="upload-progress">
        <div class="spinner-border text-primary mb-2" role="status">
          <span class="visually-hidden">上傳中...</span>
        </div>
        <p class="mb-2">正在上傳圖片...</p>
        <div class="progress">
          <div 
            class="progress-bar" 
            :style="{ width: uploadProgress + '%' }"
          >
            {{ uploadProgress }}%
          </div>
        </div>
      </div>
      
      <div v-else class="upload-content">
        <i class="fas fa-cloud-upload-alt upload-icon"></i>
        <p class="upload-text">{{ uploadText }}</p>
        <p class="upload-hint">{{ uploadHint }}</p>
        <p class="upload-limit">最大 {{ maxSize }}MB</p>
      </div>
    </div>
    
    <!-- 隱藏的檔案輸入 -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptTypes"
      @change="handleFileSelect"
      style="display: none"
    />
    
    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="alert alert-danger mt-2">
      <i class="fas fa-exclamation-circle me-1"></i>
      {{ errorMessage }}
    </div>
    
    <!-- 成功訊息 -->
    <div v-if="successMessage" class="alert alert-success mt-2">
      <i class="fas fa-check-circle me-1"></i>
      {{ successMessage }}
    </div>
    
    <!-- 圖片資訊 -->
    <!-- <div v-if="imageInfo && (previewUrl || defaultImage)" class="image-info mt-2">
      <small class="text-muted">
        <i class="fas fa-info-circle me-1"></i>
        {{ imageInfo.name }} ({{ formatFileSize(imageInfo.size) }})
      </small>
    </div> -->
  </div>
</template>

<script>
import uploadService from '@/services/uploadService'

export default {
  name: 'ImageUploader',
  props: {
    // v-model 支援
    modelValue: {
      type: String,
      default: ''
    },
    // 上傳類型：avatar, product, banner, category 等
    uploadType: {
      type: String,
      default: 'product'
    },
    // 預設圖片
    defaultImage: {
      type: String,
      default: ''
    },
    // 圖片替代文字
    alt: {
      type: String,
      default: '圖片'
    },
    // 是否唯讀
    readonly: {
      type: Boolean,
      default: false
    },
    // 是否允許移除
    allowRemove: {
      type: Boolean,
      default: true
    },
    // 圖片 CSS 類別
    imageClass: {
      type: String,
      default: ''
    },
    // 上傳提示文字
    uploadText: {
      type: String,
      default: '點擊或拖拽上傳圖片'
    },
    uploadHint: {
      type: String,
      default: '支援 JPG、PNG、WebP 格式'
    },
    // 檔案大小限制 (MB)
    maxSize: {
      type: Number,
      default: null
    }
  },
  
  emits: ['update:modelValue', 'upload-success', 'upload-error', 'remove-image'],
  
  data() {
    return {
      previewUrl: '',
      uploading: false,
      uploadProgress: 0,
      errorMessage: '',
      successMessage: '',
      isDragOver: false,
      imageInfo: null
    }
  },
  
  computed: {
    acceptTypes() {
      const config = uploadService.getConfig(this.uploadType)
      return config.allowedTypes.join(',')
    },
    
    actualMaxSize() {
      if (this.maxSize !== null) {
        return this.maxSize
      }
      return uploadService.getConfig(this.uploadType).maxSize
    }
  },
  
  watch: {
    modelValue: {
      handler(newValue) {
        if (newValue && newValue !== this.previewUrl) {
          this.previewUrl = newValue
        }
      },
      immediate: true
    }
  },
  
  methods: {
    triggerFileInput() {
      if (!this.readonly && !this.uploading) {
        this.$refs.fileInput.click()
      }
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.processFile(file)
      }
    },
    
    handleDragOver() {
      if (!this.readonly && !this.uploading) {
        this.isDragOver = true
      }
    },
    
    handleDragLeave() {
      this.isDragOver = false
    },
    
    handleDrop(event) {
      this.isDragOver = false
      if (!this.readonly && !this.uploading) {
        const files = event.dataTransfer.files
        if (files.length > 0) {
          this.processFile(files[0])
        }
      }
    },
    
    async processFile(file) {
      this.clearMessages()
      
      // 儲存檔案資訊
      this.imageInfo = {
        name: file.name,
        size: file.size,
        type: file.type
      }
      
      try {
        this.uploading = true
        this.uploadProgress = 0
        
        console.log('🖼️ ImageUploader: 開始上傳', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadType: this.uploadType
        })
        
        // 顯示預覽
        this.previewUrl = URL.createObjectURL(file)
        
        // 模擬上傳進度
        const progressInterval = setInterval(() => {
          if (this.uploadProgress < 90) {
            this.uploadProgress += Math.random() * 15
          }
        }, 300)
        
        // 檢查 uploadService 是否可用
        if (!uploadService) {
          throw new Error('uploadService 未正確載入')
        }
        
        console.log('🚀 ImageUploader: 呼叫 uploadService.uploadFile')
        
        // 上傳檔案
        const result = await uploadService.uploadFile(file, this.uploadType)
        
        console.log('📦 ImageUploader: uploadService 回應', result)
        
        clearInterval(progressInterval)
        this.uploadProgress = 100
        
        if (result.success) {
          console.log('✅ ImageUploader: 上傳成功', result.data)
          
          // 更新 v-model
          this.$emit('update:modelValue', result.data.url)
          this.previewUrl = result.data.url
          
          // 準備事件資料
          const eventData = {
            url: result.data.url,
            filename: result.data.cloudinary?.public_id || result.data.filename,
            originalName: file.name,
            size: file.size,
            type: this.uploadType,
            publicId: result.data.cloudinary?.public_id,
            cloudinaryData: result.data.cloudinary
          }
          
          console.log('📤 ImageUploader: 發送 upload-success 事件', eventData)
          
          // 發送成功事件
          this.$emit('upload-success', eventData)
          
          this.successMessage = '圖片上傳成功！'
          
          // 清除成功訊息
          setTimeout(() => {
            this.successMessage = ''
          }, 3000)
          
        } else {
          console.error('❌ ImageUploader: 上傳失敗', result.error)
          throw new Error(result.error)
        }
        
      } catch (error) {
        console.error('圖片上傳失敗:', error)
        this.errorMessage = error.message || '上傳失敗，請重試'
        this.previewUrl = ''
        
        // 發送錯誤事件
        this.$emit('upload-error', error)
      } finally {
        this.uploading = false
        this.uploadProgress = 0
      }
    },
    
    removeImage() {
      if (confirm('確定要移除這張圖片嗎？')) {
        this.previewUrl = ''
        this.imageInfo = null
        this.clearMessages()
        
        // 更新 v-model
        this.$emit('update:modelValue', '')
        
        // 發送移除事件
        this.$emit('remove-image')
        
        // 清空文件輸入
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = ''
        }
      }
    },
    
    clearMessages() {
      this.errorMessage = ''
      this.successMessage = ''
    },
    
    formatFileSize(bytes) {
      return uploadService.formatFileSize(bytes)
    },
    
    // 外部調用方法：設定預覽圖片
    setPreviewImage(url) {
      this.previewUrl = url
      this.$emit('update:modelValue', url)
    }
  }
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.image-preview-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.preview-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #dee2e6;
  display: block;
  margin-left: 60px;
}

.preview-image.grayscale {
  filter: grayscale(100%);
}

.image-overlay {
    position: absolute;
    width: 200px;
    height: 60px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 8px;
}

.image-preview-container:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
}

.upload-zone {
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    /* padding: 3rem 2rem; */
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #f8f9fa;
    width: 200px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.upload-zone:hover:not(.uploading),
.upload-zone.dragover {
  border-color: #007bff;
  background-color: #e3f2fd;
  transform: translateY(-2px);
}

.upload-zone.uploading {
  cursor: not-allowed;
  background-color: #f0f0f0;
}

.upload-content {
  width: 100%;
}

.upload-icon {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 1rem;
  display: block;
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
}

.upload-hint {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.upload-limit {
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 0;
}

.upload-progress {
  width: 100%;
}

.progress {
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
  background-color: #e9ecef;
}

.progress-bar {
  background-color: #007bff;
  transition: width 0.3s ease;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
  font-weight: 500;
}

.alert {
  border-radius: 6px;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.image-info {
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

/* 響應式設計 */
@media (max-width: 576px) {
  .upload-zone {
    padding: 2rem 1rem;
  }
  
  .upload-icon {
    font-size: 2rem;
  }
  
  .upload-text {
    font-size: 1rem;
  }
  
  .image-actions {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .btn-sm {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>

<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>
          📷 {{ isEditing ? '編輯穿搭' : '分享新穿搭' }}
        </h2>
        <button @click="$emit('close')" class="close-btn">
          ×
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="post-form">
        <!-- 圖片上傳區域 -->
        <div class="form-group image-section">
          <label>穿搭照片 *</label>
          <div class="image-upload-container">
            <input
              ref="imageInput"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              @change="handleImageSelect"
              style="display: none"
            />
            
            <!-- 未選擇圖片時的上傳區域 -->
            <div v-if="!imagePreview" class="upload-zone" @click="triggerImageSelect">
              <div class="upload-content">
                📸
                <h4>點擊上傳穿搭照片</h4>
                <p>支援 JPG、PNG、WEBP 格式</p>
                <p class="file-limit">檔案大小限制：5MB</p>
              </div>
            </div>
            
            <!-- 🔥 修復圖片預覽區域 - 不壓縮圖片 -->
            <div v-else class="image-preview-container">
              <img :src="imagePreview" alt="預覽圖" class="preview-image" />
              <div class="image-overlay">
                <button type="button" @click="changeImage" class="overlay-btn change-btn">
                  ✏️ 更換圖片
                </button>
                <button type="button" @click="removeImage" class="overlay-btn remove-btn">
                  🗑️ 移除圖片
                </button>
              </div>
            </div>
          </div>
          
          <!-- 圖片錯誤訊息 -->
          <div v-if="imageError" class="error-message">
            ⚠️ {{ imageError }}
          </div>
        </div>

        <!-- 標題輸入 -->
        <div class="form-group">
          <label for="title">
            穿搭標題 *
            <span class="char-counter">{{ titleLength }}/100</span>
          </label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="為你的穿搭取個吸引人的標題..."
            maxlength="100"
            required
            :class="{ 'error': titleError }"
          />
          <div v-if="titleError" class="error-message">
            ⚠️ {{ titleError }}
          </div>
        </div>

        <!-- 內容描述 -->
        <div class="form-group">
          <label for="content">
            穿搭描述 *
            <span class="char-counter">{{ contentLength }}/500</span>
          </label>
          <textarea
            id="content"
            v-model="formData.content"
            placeholder="分享你的穿搭靈感、搭配心得、購買心得..."
            rows="5"
            maxlength="500"
            required
            :class="{ 'error': contentError }"
          ></textarea>
          <div v-if="contentError" class="error-message">
            ⚠️ {{ contentError }}
          </div>
        </div>

        <!-- 會員 ID 顯示 -->
        <div class="form-group">
          <label>發布身份</label>
          <div class="member-display">
            <div class="member-avatar">
              👤
            </div>
            <span v-if="formData.membersId">{{ currentUserName }} (ID: {{ formData.membersId }})</span>
            <span v-else class="text-danger">
              ⚠️ 請先登入
            </span>
          </div>
        </div>

        <!--API 狀態顯示
        <div v-if="apiStatus !== 'idle'" class="api-status-display">
          <div :class="['status-indicator', apiStatusClass]">
            <span class="status-icon">{{ apiStatusIcon }}</span>
            <span>{{ apiStatusText }}</span>
          </div>
          
           Debug 模式 
          <div v-if="debugMode && lastApiResponse" class="api-debug">
            <button 
              type="button" 
              @click="showApiDetails = !showApiDetails"
              class="toggle-debug-btn"
            >
              {{ showApiDetails ? '隱藏' : '顯示' }} API 詳情
            </button>
            
            <div v-if="showApiDetails" class="api-response">
              <h5>API 回應：</h5>
              <pre>{{ JSON.stringify(lastApiResponse, null, 2) }}</pre>
              
              <h5>發送的 FormData：</h5>
              <div class="form-data-debug">
                <div v-for="(value, key) in formDataDebug" :key="key" class="debug-item">
                  <strong>{{ key }}:</strong> {{ value }}
                </div>
              </div>
            </div>
          </div>
        </div>-->

        <!-- 表單按鈕 -->
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="action-btn cancel-btn" :disabled="uploading">
            取消
          </button>
          <button 
            type="button" 
            @click="saveDraft"
            class="action-btn draft-btn"
            :disabled="uploading || !hasBasicContent"
          >
            儲存草稿
          </button>
          <button 
            type="submit" 
            :disabled="uploading || !isFormValid"
            class="action-btn submit-btn"
          >
            <span v-if="uploading">
              ⏳ {{ uploadProgress }}
            </span>
            <span v-else>
              {{ isEditing ? '更新穿搭' : '發布穿搭' }}
            </span>
          </button>
        </div>

        <!-- Debug 切換 
        <div class="debug-toggle">
          <button 
            type="button" 
            @click="debugMode = !debugMode"
            class="debug-toggle-btn"
          >
            🐛 {{ debugMode ? '關閉' : '開啟' }} Debug 模式
          </button>
        </div>-->
      </form>
    </div>
  </div>
</template>

<script>
// 🔥 API 服務 - 內嵌版本，避免引入錯誤
const postsApiService = {
  async createPost(formData) {
    try {
      console.log('🚀 發送 API 請求到:', '/api/Posts')
      
      const token = localStorage.getItem('auth_token')
      const headers = {}
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      // 🔥 重要：不要設定 Content-Type，讓瀏覽器自動設定
      const response = await fetch('/api/Posts', {
        method: 'POST',
        headers: headers,
        body: formData
      })
      
      console.log('📡 API 回應狀態:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API 錯誤回應:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ API 成功回應:', data)
      
      return { data }
    } catch (error) {
      console.error('❌ API 請求失敗:', error)
      throw error
    }
  },

  async updatePost(postId, formData) {
    try {
      console.log('🚀 發送更新請求到:', `/api/Posts/${postId}`)
      
      const token = localStorage.getItem('auth_token')
      const headers = {}
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/Posts/${postId}`, {
        method: 'PUT',
        headers: headers,
        body: formData
      })
      
      console.log('📡 更新 API 回應狀態:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 更新 API 錯誤回應:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ 更新 API 成功回應:', data)
      
      return { data }
    } catch (error) {
      console.error('❌ 更新 API 請求失敗:', error)
      throw error
    }
  }
}

// 🔥 圖片驗證函數
function validateImageFile(file) {
  const errors = []
  
  // 檔案大小檢查 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('圖片檔案不能超過 5MB')
  }
  
  // 檔案類型檢查
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    errors.push('不支援的圖片格式，請使用 JPG、PNG 或 WEBP')
  }
  
  return errors
}

export default {
  name: 'CreatePostModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editingPost: {
      type: Object,
      default: null
    }
  },
  
  emits: ['close', 'success'],
  
  data() {
    return {
      formData: {
        title: '',
        content: '',
        membersId: null
      },
      imageFile: null,
      imagePreview: null,
      uploading: false,
      uploadProgress: '處理中...',
      currentUserName: '',
      
      // 驗證錯誤
      titleError: '',
      contentError: '',
      imageError: '',
      
      // 🔥 API 狀態追蹤
      apiStatus: 'idle', // idle, loading, success, error
      apiError: null,
      lastApiResponse: null,
      showApiDetails: false,
      debugMode: false,
      formDataDebug: {}
    }
  },
  
  computed: {
    isEditing() {
      return !!this.editingPost
    },
    
    titleLength() {
      return this.formData.title.length
    },
    
    contentLength() {
      return this.formData.content.length
    },
    
    hasBasicContent() {
      return this.formData.title.trim() && this.formData.content.trim()
    },
    
    isFormValid() {
      return this.hasBasicContent && 
             (this.imageFile || (this.isEditing && this.imagePreview)) && 
             !this.titleError && 
             !this.contentError && 
             !this.imageError &&
             this.formData.membersId
    },
    
    // 🔥 API 狀態顯示
    apiStatusClass() {
      return {
        'status-success': this.apiStatus === 'success',
        'status-error': this.apiStatus === 'error',
        'status-loading': this.apiStatus === 'loading'
      }
    },
    
    apiStatusIcon() {
      switch (this.apiStatus) {
        case 'success': return '✅'
        case 'error': return '❌'
        case 'loading': return '⏳'
        default: return '❓'
      }
    },
    
    apiStatusText() {
      switch (this.apiStatus) {
        case 'success': return '操作成功！'
        case 'error': return `錯誤: ${this.apiError}`
        case 'loading': return this.uploadProgress
        default: return ''
      }
    }
  },
  
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetForm()
        this.initializeMemberId()
        if (this.isEditing) {
          this.loadEditingData()
        }
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
    
    'formData.title'() {
      this.validateTitle()
    },
    
    'formData.content'() {
      this.validateContent()
    }
  },
  
  methods: {
    // 🔥 初始化會員 ID（修復版）
    initializeMemberId() {
      try {
        // 🔥 和其他組件使用相同的邏輯
        let memberId = localStorage.getItem('memberId')
        let currentUser = null
        
        // 嘗試解析 currentUser
        const currentUserData = localStorage.getItem('currentUser')
        if (currentUserData) {
          try {
            currentUser = JSON.parse(currentUserData)
            if (!memberId && currentUser?.id) {
              memberId = currentUser.id
            }
          } catch (error) {
            console.log('⚠️ currentUser 不是 JSON 格式')
          }
        }
        
        console.log('🔍 CreatePostModal 檢查會員資訊:')
        console.log('  memberId from localStorage:', memberId)
        console.log('  currentUser from localStorage:', currentUser)
        
        if (memberId) {
          this.formData.membersId = parseInt(memberId)
          this.currentUserName = currentUser?.name || currentUser?.username || `會員 ${memberId}`
          console.log('🔑 設定會員 ID:', this.formData.membersId, '名稱:', this.currentUserName)
        } else {
          console.warn('⚠️ 未找到會員資訊')
          this.$toast?.warning('請先登入才能發布穿搭')
          this.$emit('close')
        }
      } catch (error) {
        console.error('❌ 初始化會員資訊失敗:', error)
        this.$toast?.error('會員資訊讀取失敗')
        this.$emit('close')
      }
    },

    quickContentCheck() {
      const bannedWords = ['垃圾', '白痴', '智障', '閉嘴', '去死', '滾蛋', '廢物', '人渣', '死肥豬', '色情', '裸體', '性愛', '做愛', '性交', '強姦', '性侵',
          '毒品', '大麻', '海洛因', '搖頭丸', '安非他命', '毒販',
          '賭博', '詐騙', '洗錢', '非法', '走私', '盜版']
      const fullText = `${this.formData.title} ${this.formData.content}`.toLowerCase()
      
      for (const word of bannedWords) {
        if (fullText.includes(word)) {
          this.$toast?.error(`內容包含不當詞彙「${word}」，請修改後重試`)
          return false
        }
      }
      return true
    },

    // 載入編輯資料
    loadEditingData() {
      if (!this.editingPost) return
      
      this.formData = {
        title: this.editingPost.title || '',
        content: this.editingPost.content || '',
        membersId: this.editingPost.membersId || this.formData.membersId
      }
      
      if (this.editingPost.image) {
        this.imagePreview = this.editingPost.image
      }
      
      console.log('📝 載入編輯資料:', this.editingPost.title)
    },
    
    // 重置表單
    resetForm() {
  this.formData = {
    title: '',
    content: '',
    membersId: null
  }
  this.imageFile = null
  this.imagePreview = null
  this.uploading = false
  this.titleError = ''
  this.contentError = ''
  this.imageError = ''
  this.apiStatus = 'idle'
  this.apiError = null
  this.lastApiResponse = null
  this.showApiDetails = false
  this.formDataDebug = {}
  this.currentUserName = ''
  
  // 重置檔案輸入框
  const fileInput = this.$refs.imageInput
  if (fileInput) {
    fileInput.value = ''
  }
},
    
    // 觸發圖片選擇
    triggerImageSelect() {
      this.$refs.imageInput.click()
    },
    
    // 🔥 處理圖片選擇
    handleImageSelect(event) {
      const file = event.target.files[0]
      if (!file) return
      
      this.imageError = ''
      
      // 使用驗證函數
      const errors = validateImageFile(file)
      if (errors.length > 0) {
        this.imageError = errors[0]
        this.$toast?.error(errors[0])
        return
      }
      
      this.imageFile = file
      
      // 建立預覽
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imagePreview = e.target.result
      }
      reader.readAsDataURL(file)
      
      console.log('📷 圖片已選擇:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type
      })
    },
    
    // 更換圖片
    changeImage() {
      this.triggerImageSelect()
    },
    
    // 移除圖片
    removeImage() {
      this.imageFile = null
      this.imagePreview = null
      this.imageError = ''
      if (this.$refs.imageInput) {
        this.$refs.imageInput.value = ''
      }
    },
    
    // 驗證標題
    validateTitle() {
      this.titleError = ''
      
      if (!this.formData.title.trim()) {
        this.titleError = '請輸入穿搭標題'
      } else if (this.formData.title.length < 2) {
        this.titleError = '標題至少需要 2 個字元'
      }
    },
    
    // 驗證內容
    validateContent() {
      this.contentError = ''
      
      if (!this.formData.content.trim()) {
        this.contentError = '請輸入穿搭描述'
      } else if (this.formData.content.length < 10) {
        this.contentError = '描述至少需要 10 個字元'
      }
    },
    
    // 🔥 創建 FormData
    createFormData(status = 'draft') {
      const formData = new FormData()
      
      // 確保資料類型正確
      const title = String(this.formData.title || '').trim()
      const content = String(this.formData.content || '').trim() 
      const membersId = parseInt(this.formData.membersId) || 0
      
      console.log('🔍 創建 FormData 的資料:')
      console.log('  title:', `"${title}"`, typeof title)
      console.log('  content:', `"${content}"`, typeof content)
      console.log('  membersId:', membersId, typeof membersId)
      console.log('  status:', status)
      console.log('  imageFile:', this.imageFile)
      
      // 添加到 FormData（注意大小寫必須與後端一致）
      formData.append('Title', title)
      formData.append('Content', content)
      formData.append('MembersId', membersId.toString())
      formData.append('Status', status)
      
      if (this.imageFile) {
        formData.append('imageFile', this.imageFile)
        console.log('✅ 已添加圖片檔案')
      }
      
      // 🔧 Debug: 記錄 FormData 內容
      this.formDataDebug = {}
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          this.formDataDebug[pair[0]] = `File(${pair[1].name}, ${pair[1].size} bytes)`
          console.log(`  ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`)
        } else {
          this.formDataDebug[pair[0]] = pair[1]
          console.log(`  ${pair[0]}: "${pair[1]}"`)
        }
      }
      
      return formData
    },
    
    // 🔥 儲存草稿
    async saveDraft() {
      if (!this.hasBasicContent) {
        this.$toast?.warning('請至少填寫標題和描述')
        return
      }
      
      if (!this.formData.membersId) {
        this.$toast?.error('會員資訊錯誤，請重新登入')
        return
      }
      
      try {
        this.uploading = true
        this.uploadProgress = '儲存草稿中...'
        this.apiStatus = 'loading'
        
        const formData = this.createFormData('draft')
        
        console.log('📝 發送草稿資料到 API')
        
        let response
        if (this.isEditing) {
          response = await postsApiService.updatePost(this.editingPost.id, formData)
        } else {
          response = await postsApiService.createPost(formData)
        }
        
        this.lastApiResponse = response.data
        this.apiStatus = 'success'
        
        console.log('✅ 草稿儲存成功:', response.data)
        
        this.$emit('success', response.data, this.isEditing)
        this.$toast?.success('✨ 草稿已儲存')
        
        // 自動關閉彈窗
        setTimeout(() => {
          this.$emit('close')
        }, 1500)
        
      } catch (error) {
        console.error('❌ 儲存草稿失敗:', error)
        
        this.apiStatus = 'error'
        this.apiError = error.message
        this.$toast?.error(error.message || '儲存失敗，請稍後再試')
      } finally {
        this.uploading = false
      }
    },
    
    // 🔥 提交表單 (發布)
  async handleSubmit() {
  // 🔥 修正：使用 formData 而不是 form
  if (!this.formData.title.trim()) {
    this.$toast?.warning('請輸入標題')
    return
  }

  if (!this.formData.content.trim()) {
    this.$toast?.warning('請輸入內容')
    return
  }

  // 🔥 修正：編輯模式下的圖片處理邏輯
  if (this.isEditing) {
    // 編輯模式：如果沒有新圖片但原本有圖片，保持原圖片
    if (!this.imageFile && !this.editingPost?.image) {
      this.$toast?.warning('請選擇圖片')
      return
    }
  } else {
    // 新建模式：必須有圖片
    if (!this.imageFile) {
      this.$toast?.warning('請選擇圖片')
      return
    }
  }

  try {
    this.uploading = true
    this.uploadProgress = '提交中...'
    this.apiStatus = 'loading'
    
    // 🔥 使用現有的 createFormData 方法，但傳入 pending 狀態
    const apiFormData = this.createFormData('pending')

    console.log('📤 準備提交貼文到 API')
    
    let response
    if (this.isEditing) {
      console.log('✏️ 更新貼文:', this.editingPost.id)
      response = await postsApiService.updatePost(this.editingPost.id, apiFormData)
    } else {
      console.log('➕ 建立新貼文')
      response = await postsApiService.createPost(apiFormData)
    }

    this.lastApiResponse = response.data
    this.apiStatus = 'success'

    if (response.data) {
      console.log('✅ 貼文提交成功:', response.data)
      
      this.$emit('success', response.data, this.isEditing)
      this.$toast?.success(this.isEditing ? '✨ 貼文已更新' : '✨ 貼文已提交審核')
      
      // 自動關閉彈窗
      setTimeout(() => {
        this.$emit('close')
      }, 1500)
      
    } else {
      throw new Error('API 回應資料格式錯誤')
    }

  } catch (error) {
    console.error('❌ 提交失敗:', error)
    
    this.apiStatus = 'error'
    this.apiError = error.message
    
    // 🔥 改進錯誤處理
    if (error.message.includes('imageFile')) {
      this.$toast?.error('圖片處理失敗，請重新選擇圖片')
    } else if (error.message.includes('validation')) {
      this.$toast?.error('表單驗證失敗，請檢查所有欄位')
    } else {
      this.$toast?.error(`提交失敗: ${error.message}`)
    }
  } finally {
    this.uploading = false
  }
},

  

// 🔥 新增：初始化編輯表單的改進
initEditForm(post) {
  this.formData.title = post.title || ''
  this.formData.content = post.content || ''
  this.formData.membersId = post.membersId || this.formData.membersId
  
  // 🔥 重要：編輯時不要預設 imageFile，讓使用者選擇是否更換
  this.imageFile = null
  
  // 顯示現有圖片作為預覽
  if (post.image) {
    this.imagePreview = post.image
    console.log('📸 載入現有圖片預覽:', post.image)
  }
},


handleImageChange(event) {
  const file = event.target.files[0]
  if (!file) {
    this.imageFile = null
    this.imagePreview = null
    return
  }

  // 驗證檔案類型
  if (!file.type.startsWith('image/')) {
    this.$toast?.error('請選擇圖片檔案')
    event.target.value = ''
    return
  }

  // 驗證檔案大小 (例如：5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    this.$toast?.error('圖片檔案不能超過 5MB')
    event.target.value = ''
    return
  }

  this.imageFile = file

  // 產生預覽
  const reader = new FileReader()
  reader.onload = (e) => {
    this.imagePreview = e.target.result
  }
  reader.readAsDataURL(file)

  console.log('📸 已選擇新圖片:', file.name, `${(file.size / 1024 / 1024).toFixed(2)}MB`)
},
    // 處理遮罩點擊
    handleOverlayClick() {
      if (!this.uploading) {
        this.$emit('close')
      }
    }
  }
}
</script>

<style scoped>
/* 簡約設計變數 */
:root {
  --navy: #022c5c;
  --red: #eb5757;
  --pink: #E5D2D2;
  --green: #EBFAEC;
  --beige: #e4dcd1;
  --cream: #faf6eb;
}

/* Modal 基本樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Header */
.modal-header {
  background: var(--navy);
  color: white;
  padding: 20px 24px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 表單樣式 */
.post-form {
  padding: 24px;
  background: var(--cream);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--navy);
  font-size: 0.9rem;
}

.char-counter {
  font-size: 0.8rem;
  color: #6b7280;
  background: white;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid var(--pink);
}

/* 🔥 修復圖片上傳區域 - 不壓縮圖片 */
.image-upload-container {
  border-radius: 8px;
  overflow: hidden;
}

.upload-zone {
  border: 2px dashed var(--pink);
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.upload-zone:hover {
  border-color: var(--red);
  background: var(--green);
}

.upload-content {
  font-size: 3rem;
  margin-bottom: 16px;
}

.upload-content h4 {
  margin: 16px 0 8px 0;
  color: var(--navy);
  font-weight: 600;
  font-size: 1.1rem;
}

.upload-content p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.file-limit {
  font-size: 0.8rem;
  color: var(--red);
}

/* 🔥 修復圖片預覽 - 保持原始比例，不壓縮 */
.image-preview-container {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--pink);
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  display: block;
  object-fit: contain; /* 🔥 改為 contain 保持完整圖片 */
  background: #f8f9fa;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(2, 44, 92, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview-container:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  padding: 8px 12px;
  border: 1px solid white;
  border-radius: 20px;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.2);
}

.overlay-btn:hover {
  background: white;
  color: var(--navy);
}

/* 會員顯示區 */
.member-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--green);
  border-radius: 8px;
  border: 1px solid var(--pink);
}

.member-avatar {
  width: 40px;
  height: 40px;
  background: var(--navy);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.member-display span {
  font-weight: 500;
  color: var(--navy);
}

.text-danger {
  color: var(--red) !important;
}

/* API 狀態顯示區 */
.api-status-display {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 8px;
  background: white;
  border: 1px solid var(--pink);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 0.9rem;
}

.status-success {
  color: #059669;
}

.status-error {
  color: var(--red);
}

.status-loading {
  color: #d97706;
}

.status-icon {
  font-size: 1.1rem;
}

.api-debug {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--pink);
}

.toggle-debug-btn {
  background: var(--beige);
  color: var(--navy);
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 8px;
}

.toggle-debug-btn:hover {
  background: var(--pink);
}

.api-response {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.api-response h5 {
  margin: 0 0 8px 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.api-response pre {
  background: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--pink);
  font-size: 0.7rem;
  max-height: 150px;
  overflow-y: auto;
  margin: 0;
  white-space: pre-wrap;
}

.form-data-debug {
  background: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--pink);
  margin-top: 6px;
}

.debug-item {
  font-size: 0.75rem;
  margin-bottom: 2px;
  color: #6b7280;
}

.debug-item strong {
  color: var(--navy);
}

/* 輸入框樣式 */
input[type="text"], textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--pink);
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: white;
  font-family: inherit;
}

input[type="text"]:focus, textarea:focus {
  outline: none;
  border-color: var(--navy);
  box-shadow: 0 0 0 2px rgba(2, 44, 92, 0.1);
}

input.error, textarea.error {
  border-color: var(--red);
  background: #fef2f2;
}

textarea {
  min-height: 100px;
  line-height: 1.5;
  resize: vertical;
}

/* 錯誤訊息 */
.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--red);
  font-size: 0.8rem;
  margin-top: 6px;
  font-weight: 500;
}

/* 按鈕樣式 */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--pink);
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.cancel-btn {
  background: var(--pink);
  color: var(--navy);
}

.cancel-btn:hover:not(:disabled) {
  background: #d9bfbf;
}

.draft-btn {
  background: var(--beige);
  color: var(--navy);
}

.draft-btn:hover:not(:disabled) {
  background: #d4c7b8;
}

.submit-btn {
  background: var(--red);
  color: #eb5757;
}

.submit-btn:hover:not(:disabled) {
  background: #dc2626;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Debug 切換
.debug-toggle {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--pink);
}

.debug-toggle-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid var(--pink);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.debug-toggle-btn:hover {
  background: var(--beige);
  color: var(--navy);
} */

/* 響應式設計 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-header h2 {
    font-size: 1.1rem;
  }
  
  .post-form {
    padding: 20px 16px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .upload-zone {
    padding: 30px 16px;
  }
  
  .upload-content {
    font-size: 2.5rem;
  }
  
  .member-display {
    padding: 10px 12px;
  }
  
  .member-avatar {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
}

/* 滾動條樣式 */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--pink);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #d9bfbf;
}
</style>
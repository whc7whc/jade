<template>
  <main>
    <div class="container container-fluid">
      <div class="profile-container" :class="{ 'loaded': isLoaded }">
        
        <!-- 大頭貼區域 -->
        <div class="profile-field avatar-field">
          <div class="avatar-container">
            <img :src="user.avatar || defaultAvatar" alt="大頭貼" class="avatar" @error="handleImageError" />
            <div class="avatar-overlay" @click="triggerFileInput" v-if="!isUploading">
              <i class="fas fa-camera"></i>
              <span>更換圖片</span>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,.heic"
              @change="handleImageUpload"
              class="hidden-file-input"
            />
          </div>
          <!-- 如果有待上傳的照片，顯示提示 -->
          <div v-if="pendingImageFile" class="pending-upload-hint">
            <i class="fas fa-info-circle"></i>
            <span>照片已選取，點擊「儲存修改」按鈕完成上傳</span>
          </div>
        </div>

        <!-- 姓名欄位 -->
        <div class="profile-field">
          <i class="fas fa-user"></i>
          <span>姓名：</span>
          <div class="field-content">
            <input 
              v-if="isEditing"
              v-model="editableUser.name"
              type="text"
              class="edit-input"
              placeholder="請輸入姓名"
              maxlength="50"
            />
            <strong v-else>{{ user.name || '未設定' }}</strong>
          </div>
        </div>

        <!-- 性別欄位 -->
        <div class="profile-field">
          <i class="fas fa-venus-mars"></i>
          <span>性別：</span>
          <div class="field-content">
            <select 
              v-if="isEditing"
              v-model="editableUser.gender"
              class="edit-select"
            >
              <option value="">請選擇性別</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">其他</option>
            </select>
            <strong v-else>{{ user.gender || '未設定' }}</strong>
          </div>
        </div>

        <!-- 出生日期欄位 -->
        <div class="profile-field">
          <i class="fas fa-calendar"></i>
          <span>出生日期：</span>
          <div class="field-content">
            <input 
              v-if="isEditing && !user.birthdateModified"
              v-model="editableUser.birthdate"
              type="date"
              class="edit-input"
              :max="maxDate"
            />
            <div v-else-if="isEditing && user.birthdateModified" class="readonly-field">
              <strong>{{ formatDate(user.birthdate) || '未設定' }}</strong>
              <span class="readonly-hint">(生日僅可修改一次，已使用修改機會)</span>
            </div>
            <strong v-else>{{ formatDate(user.birthdate) || '未設定' }}</strong>
          </div>
        </div>

        <!-- 會員等級（不可編輯） -->
        <div class="profile-field">
          <i class="fas fa-user-tag"></i>
          <span>會員等級：</span>
          <strong>{{ user.level }}</strong>
        </div>
        
        <!-- 編輯/儲存按鈕 -->
        <div class="button-group">
          <button 
            v-if="!isEditing"
            @click="startEditing" 
            class="edit-button"
            :disabled="isUploading"
          >
            <i class="fas fa-edit"></i>
            修改資料
          </button>
          
          <template v-else>
            <button 
              @click="saveChanges" 
              class="edit-button save-button"
              :disabled="isUploading || !hasChanges"
            >
              <i class="fas fa-save"></i>
              儲存修改
            </button>
            
            <button 
              @click="cancelEditing" 
              class="cancel-button"
              :disabled="isUploading"
            >
              <i class="fas fa-times"></i>
              取消
            </button>
          </template>
        </div>

        <!-- 有變更提示 -->
        <div v-if="hasChanges && isEditing" class="changes-hint">
          <i class="fas fa-info-circle"></i>
          <span>資料已修改，請記得點擊「儲存修改」</span>
        </div>
      </div>
    </div>

    <!-- 上傳進度提示 -->
    <div v-if="isUploading" class="upload-overlay">
      <div class="upload-modal">
        <div class="loading-spinner"></div>
        <p>正在更新資料...</p>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="showSuccessMessage" class="success-overlay" @click="showSuccessMessage = false">
      <div class="success-modal">
        <i class="fas fa-check-circle success-icon"></i>
        <p>資料修改成功！</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import axios from 'axios'
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()

// 方便的 alert 包裝函式
const showAlert = (icon, title) => {
  return Swal.fire({
    icon,
    title,
    confirmButtonText: '確定'
  })
}

const fileInput = ref(null)
const isUploading = ref(false)
const showSuccessMessage = ref(false)
const pendingImageFile = ref(null)
const originalAvatar = ref('')
const defaultAvatar = '/images/default-avatar.png'
const isEditing = ref(false)
const isLoaded = ref(false) // 用來控制進場動畫

// 設定最大日期（今天）
const maxDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const storedId = localStorage.getItem('memberId')
const memberId = storedId ? parseInt(storedId, 10) : null

if (!memberId) {
  showAlert('warning', '尚未登入，請先登入').then(() => {
    router.push('/login')
  })
}

const user = reactive({
  name: '',
  gender: '',
  birthdate: '',
  level: '',
  avatar: defaultAvatar,
  birthdateModified: false, // 追蹤生日是否已修改過
})

const editableUser = reactive({
  name: '',
  gender: '',
  birthdate: '',
})

const originalUserData = reactive({
  name: '',
  gender: '',
  birthdate: '',
  avatar: '',
  birthdateModified: false,
})

const levelMap = { 1: '銅卡會員', 2: '銀卡會員', 3: '金卡會員', 4: '鑽石會員' }
const genderMap = {
  Male: '男性',
  Female: '女性',
  Other: '其他',
  male: '男性',
  female: '女性',
  other: '其他'
}

const genderReverseMap = {
  '男性': 'male',
  '女性': 'female',
  '其他': 'other'
}

// 檢查是否有變更
const hasChanges = computed(() => {
  return (
    editableUser.name !== originalUserData.name ||
    editableUser.gender !== originalUserData.gender ||
    editableUser.birthdate !== originalUserData.birthdate ||
    pendingImageFile.value !== null
  )
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const isValidImageFormat = (url) => {
  if (!url || url.trim() === '') return false
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const lowerUrl = url.toLowerCase()
  return validExtensions.some(ext => lowerUrl.endsWith(ext)) || 
         validExtensions.some(ext => lowerUrl.includes(ext))
}

const fetchUserProfile = async () => {
  try {
    const res = await axios.get(`https://localhost:7106/api/Auth/${memberId}/profile`)
    const data = res.data
    
    user.name = data.name || ''
    const genderKey = (data.gender || '').toLowerCase()
    user.gender = genderMap[genderKey] || data.gender
    user.birthdate = data.birthDate ? data.birthDate.split('T')[0] : ''
    user.level = levelMap[data.level] || `等級${data.level}`
    user.birthdateModified = data.birthdateModified || false // 從API取得生日修改狀態
    
    // 設定編輯用資料
    editableUser.name = data.name || ''
    editableUser.gender = genderKey || ''
    editableUser.birthdate = data.birthDate ? data.birthDate.split('T')[0] : ''
    
    // 儲存原始資料
    originalUserData.name = data.name || ''
    originalUserData.gender = genderKey || ''
    originalUserData.birthdate = data.birthDate ? data.birthDate.split('T')[0] : ''
    originalUserData.birthdateModified = data.birthdateModified || false
    
    if (data.profileImg && data.profileImg.trim() !== '') {
      let avatarUrl = ''
      if (data.profileImg.startsWith('http')) {
        avatarUrl = data.profileImg
      } else if (data.profileImg.startsWith('/')) {
        avatarUrl = `https://localhost:7106${data.profileImg}`
      } else {
        avatarUrl = `https://localhost:7106/${data.profileImg}`
      }
      user.avatar = avatarUrl
      originalAvatar.value = avatarUrl
      originalUserData.avatar = avatarUrl
    } else {
      user.avatar = defaultAvatar
      originalAvatar.value = defaultAvatar
      originalUserData.avatar = defaultAvatar
    }
  } catch (error) {
    console.error('取得會員資料失敗:', error)
    user.avatar = defaultAvatar
    originalAvatar.value = defaultAvatar
  }
}

const handleImageError = (event) => {
  if (event.target.src !== defaultAvatar) {
    user.avatar = defaultAvatar
  }
}

onMounted(() => {
  fetchUserProfile().then(() => {
    // 資料載入完成後觸發動畫
    setTimeout(() => {
      isLoaded.value = true
    }, 100)
  })
})

const startEditing = () => {
  isEditing.value = true
  // 重新設定編輯資料為當前資料
  editableUser.name = user.name
  editableUser.gender = genderReverseMap[user.gender] || ''
  editableUser.birthdate = user.birthdate
}

const cancelEditing = () => {
  isEditing.value = false
  // 恢復原始資料
  editableUser.name = originalUserData.name
  editableUser.gender = originalUserData.gender
  editableUser.birthdate = originalUserData.birthdate
  user.avatar = originalAvatar.value
  pendingImageFile.value = null
}

const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value.click()
  }
}

const validateImageFile = (file) => {
  // 根據後端 API 支援的格式進行驗證
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic']
  
  // 取得檔案副檔名
  const fileName = file.name.toLowerCase()
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
  
  // 檢查 MIME type 和副檔名
  const isValidType = validTypes.includes(file.type)
  const isValidExtension = allowedExtensions.includes(fileExtension)
  
  if (!isValidType && !isValidExtension) {
    Swal.fire({
      icon: 'error',
      title: '檔案格式不支援',
      text: '只允許上傳 JPG、JPEG、PNG、GIF、WEBP、HEIC 格式的圖片',
      confirmButtonText: '我知道了',
      customClass: {
        confirmButton: 'swal2-confirm-custom'
      }
    })
    return false
  }
  
  // 調整檔案大小限制為 2MB (與後端 API 一致)
  if (file.size > 2 * 1024 * 1024) {
    Swal.fire({
      icon: 'warning',
      title: '圖片檔案過大',
      text: '圖片大小不能超過 2MB，請選擇較小的圖片或進行壓縮',
      confirmButtonText: '重新選擇',
      customClass: {
        confirmButton: 'swal2-confirm-custom'
      }
    })
    return false
  }
  
  return true
}

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (!validateImageFile(file)) {
    fileInput.value.value = ''
    return
  }

  pendingImageFile.value = file
  const reader = new FileReader()
  reader.onload = e => {
    user.avatar = e.target.result
  }
  reader.onerror = e => {
    console.error('圖片預覽載入失敗:', e)
  }
  reader.readAsDataURL(file)

  fileInput.value.value = ''
  
  // 自動進入編輯模式
  if (!isEditing.value) {
    startEditing()
  }
}

const validateForm = () => {
  if (!editableUser.name || editableUser.name.trim() === '') {
    Swal.fire({
      icon: 'warning',
      title: '姓名必填',
      text: '請輸入您的姓名',
      confirmButtonText: '我知道了',
      customClass: {
        confirmButton: 'swal2-confirm-custom'
      }
    })
    return false
  }
  
  if (!editableUser.gender) {
    Swal.fire({
      icon: 'warning',
      title: '性別必選',
      text: '請選擇您的性別',
      confirmButtonText: '我知道了',
      customClass: {
        confirmButton: 'swal2-confirm-custom'
      }
    })
    return false
  }
  
  if (!editableUser.birthdate) {
    Swal.fire({
      icon: 'warning',
      title: '出生日期必填',
      text: '請選擇您的出生日期',
      confirmButtonText: '我知道了',
      customClass: {
        confirmButton: 'swal2-confirm-custom'
      }
    })
    return false
  }
  
  // 年齡驗證：需年滿12歲
  const birthDate = new Date(editableUser.birthdate)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())

  const actualAge = hasHadBirthdayThisYear ? age : age - 1
  
  // 檢查年齡下限
  if (actualAge < 12) {
    Swal.fire({
      icon: 'warning',
      title: '年齡限制提醒',
      text: '會員資格需年滿12歲，請確認您的出生日期是否正確',
      confirmButtonText: '重新填寫',
      customClass: {
        confirmButton: 'swal2-confirm-custom'
      }
    })
    return false
  }
  
  // 檢查年齡上限 (合理性檢查)
  if (actualAge > 150) {
    Swal.fire({
      icon: 'error',
      title: '出生日期異常',
      text: '請輸入正確的出生日期',
      confirmButtonText: '重新填寫',
      customClass: {
        confirmButton: 'swal2-confirm-custom'
      }
    })
    return false
  }
  
  return true
}

const saveChanges = async () => {
  if (!validateForm()) return

  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('Name', editableUser.name.trim())
    formData.append('Gender', editableUser.gender)
    formData.append('BirthDate', editableUser.birthdate)
    
    if (pendingImageFile.value) {
      formData.append('ProfileImgFile', pendingImageFile.value)
    }

    const response = await axios.post(
      `https://localhost:7106/api/Auth/${memberId}/profile`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)

    pendingImageFile.value = null
    isEditing.value = false
    await fetchUserProfile()
  } catch (error) {
    console.error('更新失敗:', error)
    
    // 處理後端返回的具體錯誤訊息
    let errorTitle = '資料更新失敗'
    let errorMessage = '請確認資料或稍後再試'
    
    if (error.response && error.response.data) {
      const backendMessage = error.response.data
      
      // 檢查是否為年齡限制錯誤
      if (typeof backendMessage === 'string' && backendMessage.includes('年滿12歲')) {
        Swal.fire({
          icon: 'warning',
          title: '年齡限制',
          text: backendMessage,
          confirmButtonText: '重新填寫',
          customClass: {
            confirmButton: 'swal2-confirm-custom'
          }
        })
        user.avatar = originalAvatar.value
        pendingImageFile.value = null
        return
      }
      
      // 檢查是否為圖片格式錯誤
      if (typeof backendMessage === 'string' && backendMessage.includes('只允許上傳')) {
        Swal.fire({
          icon: 'error',
          title: '圖片格式錯誤',
          text: backendMessage,
          confirmButtonText: '重新選擇',
          customClass: {
            confirmButton: 'swal2-confirm-custom'
          }
        })
        user.avatar = originalAvatar.value
        pendingImageFile.value = null
        return
      }
      
      // 檢查是否為圖片大小錯誤
      if (typeof backendMessage === 'string' && backendMessage.includes('不能超過')) {
        Swal.fire({
          icon: 'warning',
          title: '圖片檔案過大',
          text: backendMessage,
          confirmButtonText: '重新選擇',
          customClass: {
            confirmButton: 'swal2-confirm-custom'
          }
        })
        user.avatar = originalAvatar.value
        pendingImageFile.value = null
        return
      }
      
      // 檢查是否為 Email 驗證錯誤
      if (typeof backendMessage === 'string' && backendMessage.includes('Email 驗證')) {
        Swal.fire({
          icon: 'info',
          title: 'Email 驗證必要',
          text: backendMessage,
          confirmButtonText: '我知道了',
          customClass: {
            confirmButton: 'swal2-confirm-custom'
          }
        })
        user.avatar = originalAvatar.value
        pendingImageFile.value = null
        return
      }
      
      // 其他後端錯誤訊息
      if (typeof backendMessage === 'string') {
        errorMessage = backendMessage
      }
    }
    
    Swal.fire({
      icon: 'error',
      title: errorTitle,
      text: errorMessage,
      confirmButtonText: '重試',
      customClass: {
        confirmButton: 'swal2-confirm-custom'
      }
    })
    
    user.avatar = originalAvatar.value
    pendingImageFile.value = null
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.container {
    margin-top: 40px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.profile-container {
  background-color: #fff9ed;
  border-radius: 12px;
  padding: 40px 50px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 6px 12px rgba(105, 134, 94, 0.5);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  opacity: 0;
  transform: rotateY(-180deg) scale(0.8);
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

@keyframes twinkle {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes bounce {
  0%, 100% { opacity: 0.8; transform: translateY(0) rotate(0deg); }
  50% { opacity: 1; transform: translateY(-10px) rotate(15deg); }
}

.profile-container.loaded {
  opacity: 1;
  transform: rotateY(0deg) scale(1);
  animation-delay: 1s;
}


.profile-field {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  font-size: 1.6rem;
  color: #2e4e34;
  width: 100%;
  min-height: 60px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.4s ease-out forwards;
}

.profile-container.loaded .profile-field:nth-child(1) { animation-delay: 0.2s; }
.profile-container.loaded .profile-field:nth-child(2) { animation-delay: 0.3s; }
.profile-container.loaded .profile-field:nth-child(3) { animation-delay: 0.4s; }
.profile-container.loaded .profile-field:nth-child(4) { animation-delay: 0.5s; }
.profile-container.loaded .profile-field:nth-child(5) { animation-delay: 0.6s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-field i {
  margin-right: 15px;
  width: 30px;
  text-align: center;
  color: #2e4e34;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.profile-field:hover i {
  transform: scale(1.2) rotate(10deg);
  color: #69865e;
}

.profile-field strong {
  margin-left: 10px;
  color:#333;
}

.field-content {
  margin-left: 10px;
  flex: 1;
}

/* 輸入框樣式 */
.edit-input {
  width: 100%;
  max-width: 300px;
  padding: 10px 15px;
  border: 2px solid #2e4e34;
  border-radius: 8px;
  font-size: 1.4rem;
  color: #333;
  background-color: white;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.edit-input:focus {
  outline: none;
  border-color: #69865e;
  box-shadow: 0 0 0 3px rgba(105, 134, 94, 0.2);
}

.edit-select {
  width: 100%;
  max-width: 300px;
  padding: 10px 15px;
  border: 2px solid #2e4e34;
  border-radius: 8px;
  font-size: 1.4rem;
  color: #333;
  background-color: white;
  transition: border-color 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.edit-select:focus {
  outline: none;
  border-color: #69865e;
  box-shadow: 0 0 0 3px rgba(105, 134, 94, 0.2);
}

/* 大頭貼相關樣式 */
.avatar-field {
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;
}

.avatar-container {
  position: relative;
  margin-left: 10px;
  cursor: pointer;
}

.avatar-container.uploading {
  cursor: not-allowed;
}

.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #333;
  transition: all 0.3s ease;
  position: relative;
}

.avatar:hover {
  transform: scale(1.05);
  border-color: #69865e;
  box-shadow: 0 0 20px rgba(105, 134, 94, 0.3);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 1rem;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  font-size: 2rem;
  margin-bottom: 5px;
  margin-right: 0;
  width: auto;
}

.avatar-overlay span {
  font-size: 0.9rem;
  font-weight: 600;
}

.hidden-file-input {
  display: none;
}

/* 待上傳提示 */
.pending-upload-hint {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  border-radius: 4px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #1976d2;
}

.pending-upload-hint i {
  margin-right: 8px;
  width: auto;
}

/* 變更提示 */
.changes-hint {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #856404;
  width: 100%;
}

.changes-hint i {
  margin-right: 8px;
  width: auto;
}

/* 按鈕組樣式 */
.button-group {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  margin-left: auto;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.4s ease-out forwards;
  animation-delay: 0.7s;
}

.edit-button, .cancel-button {
  padding: 14px 30px;
  border: none;
  border-radius: 30px;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 700;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.edit-button:hover, .cancel-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}



.edit-button:active::before, .cancel-button:active::before {
  transform: translate(-50%, -50%) scale(1.5);
  opacity: 1;
  animation: heartPop 0.6s ease;
}

@keyframes heartPop {
  0% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(3) translateY(-20px); opacity: 0; }
}

.edit-button {
  background-color: #333;
  color: white;
}

.edit-button:hover, .cancel-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.edit-button:hover {
  background-color: #555;
}

.edit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.save-button {
  background-color: #4CAF50;
}

.save-button:hover {
  background-color: #45a049;
}

.save-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #f44336;
  color: white;
}

.cancel-button:hover {
  background-color: #d32f2f;
}

.cancel-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 有變更時的按鈕動畫 */
.save-button:not(:disabled) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

/* 上傳進度樣式 */
.upload-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.upload-modal {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 成功提示樣式 */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  cursor: pointer;
}

.success-modal {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: successPop 0.5s ease-out;
}

.success-icon {
  font-size: 3rem;
  color: #4CAF50;
  margin-bottom: 15px;
}

.success-modal p {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

@keyframes successPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* SweetAlert2 自訂樣式 */
:global(.swal2-confirm-custom) {
  background: linear-gradient(135deg, #2e4e34 0%, #69865e 100%) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 10px 20px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  transition: all 0.3s ease !important;
}

:global(.swal2-confirm-custom:hover) {
  background: linear-gradient(135deg, #69865e 0%, #2e4e34 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(46, 78, 52, 0.3) !important;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .profile-container {
    padding: 20px 25px;
    max-width: 90%;
  }
  
  .avatar {
    width: 120px;
    height: 120px;
  }
  
  .profile-field {
    font-size: 1.4rem;
    min-height: 50px;
    flex-direction: column;
    align-items: flex-start;
  }

  .field-content {
    margin-left: 0;
    margin-top: 8px;
    width: 100%;
  }

  .edit-input, .edit-select {
    max-width: 100%;
    font-size: 1.2rem;
  }

  .upload-modal, .success-modal {
    margin: 0 20px;
    padding: 20px;
  }

  .pending-upload-hint, .changes-hint {
    font-size: 0.8rem;
    padding: 8px 12px;
  }

  .button-group {
    flex-direction: column;
    width: 100%;
  }

  .edit-button, .cancel-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
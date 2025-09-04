

<template>
  <main>
    <div class="container container-fluid">
      <div class="forms-container">
        <div class="profiles">
          <form @submit.prevent="submitForm" class="member-form">
            <h2 class="title">填寫會員資料</h2>

            <div class="input-field">
              <i class="fas fa-user"></i>
              <!-- 姓名 -->
              <input 
                type="text" 
                placeholder="輸入姓名 *" 
                required 
                v-model="name"
                tabindex="1"
              />
            </div>

            <!-- 性別 -->
            <div class="input-field">
              <i class="fas fa-venus-mars"></i>
              <select 
                class="custom-input" 
                required 
                v-model="gender"
                tabindex="2"
              >
                <option value="" disabled selected>選擇性別 *</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">其他</option>
              </select>
            </div>

            <!-- 出生日期 -->
            <div class="input-field date-field">
              <i class="fas fa-calendar"></i>
              <input 
                type="date" 
                class="custom-input" 
                required 
                v-model="birthdate"
                tabindex="3"
              />
              <div class="calendar-icon"></div>
            </div>

            <!-- 大頭貼 -->
            <div class="input-field">
              <i class="fas fa-image"></i>
              <input
                type="file"
                class="custom-input"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,.heic"
                @change="handleFileChange"
                tabindex="4"
              />
            </div>

            <!-- 新增圖片預覽 -->
            <div
              v-if="previewImage"
              class="preview-image"
            >
              <img
                :src="previewImage"
                alt="預覽圖片"
              />
            </div>

            <!-- 展開式隱私條款 -->
            <div class="expandable-privacy">
              <div class="privacy-header" @click="togglePrivacyExpand">
                <input
                  type="checkbox"
                  required
                  v-model="agreeTerms"
                  @click.stop
                  id="agreeTerms"
                  tabindex="5"
                />
                <label for="agreeTerms" @click.stop>是否同意隱私權政策和服務條款</label>
                <i
                  class="fas fa-chevron-down expand-icon"
                  :class="{ rotated: isPrivacyExpanded }"
                ></i>
              </div>
              <div class="privacy-content" :class="{ expanded: isPrivacyExpanded }">
                <div class="privacy-details">
                  <div class="policy-section">
                    <h4><i class="fas fa-shield-alt"></i> 隱私權政策重點</h4>
                    <ul>
                      <li><strong>資料收集：</strong>我們收集您的姓名、性別、出生日期等基本資料</li>
                      <li><strong>圖片儲存：</strong>您的大頭貼將安全加密儲存在我們的伺服器</li>
                      <li><strong>資料保護：</strong>我們絕不會將您的個人資料提供給第三方</li>
                      <li><strong>用戶權利：</strong>您可以隨時要求查看、修改或刪除您的資料</li>
                      <li><strong>資料安全：</strong>採用 SSL 加密和多重驗證保護您的資料</li>
                    </ul>
                  </div>

                  <div class="policy-section">
                    <h4><i class="fas fa-file-contract"></i> 服務條款重點</h4>
                    <ul>
                      <li><strong>真實資料：</strong>請提供真實且準確的個人資料</li>
                      <li><strong>內容規範：</strong>禁止上傳不當、違法或侵犯他人權利的圖片內容</li>
                      <li><strong>帳號責任：</strong>您需對自己帳號的所有活動負責</li>
                      <li><strong>服務變更：</strong>我們保留修改服務條款的權利，會提前通知用戶</li>
                      <li><strong>法律遵循：</strong>使用服務時請遵守當地相關法律法規</li>
                    </ul>
                  </div>

                  <div class="policy-footer">
                    <p><i class="fas fa-info-circle"></i> 如需查看完整條款，請聯繫客服</p>
                    <p><strong>最後更新：</strong>2025年8月</p>
                  </div>
                </div>
              </div>
            </div>

            <input type="submit" value="完成" class="btn solid" tabindex="6" />
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const name = ref('')
const gender = ref('')
const birthdate = ref('')
const agreeTerms = ref(false)

const avatarFile = ref(null) // 存檔案
const previewImage = ref('') // 預覽圖

const isPrivacyExpanded = ref(false)

const getMemberId = () => {
  const id = localStorage.getItem('memberId')
  return id && id !== 'null' ? id : null
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 根據後端 API 支援的格式進行驗證
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic']
  
  // 取得檔案副檔名
  const fileName = file.name.toLowerCase()
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
  
  // 檢查 MIME type 和副檔名
  const isValidType = allowedTypes.includes(file.type)
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
    // 清空檔案輸入
    event.target.value = ''
    return
  }
  
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
    // 清空檔案輸入
    event.target.value = ''
    return
  }

  avatarFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const togglePrivacyExpand = () => {
  isPrivacyExpanded.value = !isPrivacyExpanded.value
}

const submitForm = async () => {
  console.log('表單提交被觸發')
  console.log('表單數據:', {
    name: name.value,
    gender: gender.value,
    birthdate: birthdate.value,
    agreeTerms: agreeTerms.value
  })

  if (!agreeTerms.value) {
    Swal.fire({
      icon: 'warning',
      title: '提醒',
      text: '請同意服務條款才能送出',
    })
    return
  }
    // ✅ 年齡驗證：需年滿12歲
  const birth = new Date(birthdate.value)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())

  const actualAge = hasHadBirthdayThisYear ? age : age - 1

  if (actualAge < 12) {
    Swal.fire({
      icon: 'warning',
      title: '年齡限制提醒',
      text: '申辦會員資格需年滿12歲，請確認您的出生日期是否正確',
      confirmButtonText: '重新填寫',
      customClass: {
        confirmButton: 'swal2-confirm-custom'
      }
    })
    return
  }

  const memberId = getMemberId()
  if (!memberId) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '找不到會員ID，將前往登入頁面',
      confirmButtonText: '前往登入'
    }).then(() => {
      // 導向登入頁
      window.location.href = '/login' // <-- 根據實際登入頁網址修改
    })
    return
  }

  try {
    const formData = new FormData()
    formData.append('Name', name.value)
    formData.append('Gender', gender.value)
    formData.append('BirthDate', new Date(birthdate.value).toISOString())
    if (avatarFile.value) {
      formData.append('ProfileImgFile', avatarFile.value)
    }

    await axios.post(
      `https://localhost:7106/api/Auth/${memberId}/profile`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    // 提交成功後，獲取更新後的會員資料
    let profileImageUrl = null;
    if (avatarFile.value) {
      try {
        // 嘗試獲取更新後的會員資料
        const profileResponse = await axios.get(`https://localhost:7106/api/Auth/${memberId}/profile`);
        console.log('📋 會員資料:', profileResponse.data);
        
        // 尋找頭像 URL
        profileImageUrl = profileResponse.data?.profileImg || 
                         profileResponse.data?.ProfileImg ||
                         profileResponse.data?.profileImageUrl ||
                         profileResponse.data?.ProfileImageUrl ||
                         previewImage.value; // 備用預覽圖片
        
        if (profileImageUrl) {
          localStorage.setItem('profileImgUrl', profileImageUrl);
          console.log('✅ 頭像 URL 已儲存:', profileImageUrl);
        }
      } catch (profileError) {
        console.warn('⚠️ 無法取得更新後的會員資料:', profileError);
        // 如果無法取得 API 資料，使用預覽圖片作為備用
        if (previewImage.value) {
          localStorage.setItem('profileImgUrl', previewImage.value);
          profileImageUrl = previewImage.value;
          console.log('✅ 使用預覽圖片作為頭像');
        }
      }
    }

    // 觸發 Header 更新 (如果有 EventBus)
    if (profileImageUrl && window.$eventBus) {
      window.$eventBus.emit('user-profile-updated', {
        profileImgUrl: profileImageUrl
      });
      console.log('📧 已觸發頭像更新事件');
    }

    Swal.fire({
      icon: 'success',
      title: '成功',
      text: '成功新增會員資料！',
    }).then(() => {
      router.push('/member')
    })
  } catch (error) {
    console.error(error)
    
    // 處理後端返回的具體錯誤訊息
    let errorMessage = '新增失敗，請稍後再試'
    
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
        return
      }
      
      // 其他後端錯誤訊息
      if (typeof backendMessage === 'string') {
        errorMessage = backendMessage
      }
    }
    
    Swal.fire({
      icon: 'error',
      title: '操作失敗',
      text: errorMessage,
      confirmButtonText: '重試',
      customClass: {
        confirmButton: 'swal2-confirm-custom'
      }
    })
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
input,
select,
button,
label,
h1, h2, h3, h4, h5, h6,
p, span {
  font-family: 'Poppins', 'Jost', sans-serif;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: #3d3b3b;
}

.container {
  position: relative;
  max-width: 100%;
  min-height: 100vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #efe9dd 0%, #f5f0e6 100%);
  box-sizing: border-box;
}

.forms-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 80px 20px 60px;
  flex-direction: column;
}

.profiles {
  width: 100%;
  max-width: 520px;
  display: grid;
  grid-template-columns: 1fr;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(61, 59, 59, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

form {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 40px;
  grid-column: 1/2;
  grid-row: 1/2;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #3d3b3b;
  margin-bottom: 30px;
  text-align: center;
  position: relative;
}

.title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #3d3b3b, #8b7355);
  border-radius: 2px;
}

.input-field {
  max-width: 440px;
  width: 100%;
  height: 60px;
  background: #fff;
  margin: 12px 0;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 60px 1fr;
  padding: 0;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(61, 59, 59, 0.08);
  position: relative;
  overflow: visible; /* 改為 visible 確保元素可點擊 */
  z-index: 1; /* 確保層級正確 */
}

.input-field::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(61, 59, 59, 0.03), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none; /* 確保偽元素不會阻擋點擊 */
}

.input-field:hover {
  border-color: #8b7355;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(61, 59, 59, 0.15);
}

.input-field:hover::before {
  opacity: 1;
}

.input-field:focus-within {
  border-color: #3d3b3b;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(61, 59, 59, 0.2);
}

.input-field i {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b7355;
  font-size: 1.3rem;
  transition: all 0.3s ease;
  pointer-events: none; /* 確保圖標不會阻擋點擊 */
}

.input-field:focus-within i {
  color: #3d3b3b;
  transform: scale(1.1);
}

.input-field input,
.input-field select {
  background: none;
  outline: none;
  border: none;
  font-weight: 500;
  font-size: 1rem;
  width: 100%;
  padding: 0 15px;
  color: #3d3b3b;
  height: 100%;
  transition: all 0.3s ease;
  position: relative; /* 確保輸入欄位在正確的層級 */
  z-index: 2;
}

.input-field input::placeholder {
  color: #aaa;
  font-weight: 400;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-field:focus-within input::placeholder {
  color: #8b7355;
  transform: translateX(5px);
}

.custom-input {
  font-size: 1rem;
  font-weight: 500;
  color: #3d3b3b;
  font-family: 'Poppins', sans-serif;
  background: none;
  outline: none;
  border: none;
  width: 100%;
}

select option {
  background: #fff;
  color: #3d3b3b;
  padding: 10px;
}

.input-field input[type="file"] {
  padding: 15px;
  cursor: pointer;
}

.input-field input[type="file"]::file-selector-button {
  background: linear-gradient(135deg, #3d3b3b, #5a5555);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 600;
  margin-right: 10px;
}

.input-field input[type="file"]::file-selector-button:hover {
  background: linear-gradient(135deg, #5a5555, #3d3b3b);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(61, 59, 59, 0.3);
}

.preview-image {
  margin: 20px 0;
  text-align: center;
  animation: fadeIn 0.5s ease;
  max-width: 150px;
  margin-left: 40px;
}

.preview-image img {
  width: 100%;
  max-width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 8px 20px rgba(61, 59, 59, 0.15);
  transition: all 0.3s ease;
}

.preview-image img:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 25px rgba(61, 59, 59, 0.25);
}

.expandable-privacy {
  width: 100%;
  max-width: 440px;
  margin: 20px 0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(61, 59, 59, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.expandable-privacy:hover {
  box-shadow: 0 8px 25px rgba(61, 59, 59, 0.15);
}

.privacy-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #fff 0%, #fafafa 100%);
}

.privacy-header:hover {
  background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%);
}

.privacy-header input[type="checkbox"] {
  accent-color: #3d3b3b;
  transform: scale(1.2);
  cursor: pointer;
}

.privacy-header label {
  flex: 1;
  font-weight: 600;
  color: #3d3b3b;
  cursor: pointer;
  font-size: 1rem;
}

.expand-icon {
  color: #8b7355;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.expand-icon.rotated {
  transform: rotate(180deg);
  color: #3d3b3b;
}

.privacy-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;
  background: #fff;
}

.privacy-content.expanded {
  max-height: 600px;
  overflow-y: auto;
}

.privacy-details {
  padding: 0 20px 20px;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #555;
}

.policy-section {
  margin-bottom: 25px;
}

.policy-section h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #3d3b3b;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f1f1f1;
}

.policy-section h4 i {
  color: #8b7355;
  font-size: 1.2rem;
}

.policy-section ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.policy-section li {
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
}

.policy-section li::before {
  content: '•';
  color: #8b7355;
  font-weight: bold;
  position: absolute;
  left: 0;
  font-size: 1.2rem;
}

.policy-footer {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

.policy-footer p {
  margin: 5px 0;
  font-size: 0.85rem;
}

.btn {
  width: 180px;
  height: 55px;
  border: none;
  outline: none;
  border-radius: 50px;
  cursor: pointer;
  background: linear-gradient(135deg, #3d3b3b 0%, #5a5555 100%);
  color: #fff;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 1.5px;
  margin: 30px 0 20px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(61, 59, 59, 0.3);
  position: relative;
  overflow: hidden;
  z-index: 10; /* 確保按鈕在最上層 */
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
  pointer-events: none;
}

.btn:hover {
  background: linear-gradient(135deg, #5a5555 0%, #3d3b3b 100%);
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(61, 59, 59, 0.4);
}

.btn:hover::before {
  left: 100%;
}

.btn:active {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(61, 59, 59, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* SweetAlert2 自訂樣式 */
:global(.swal2-confirm-custom) {
  background: linear-gradient(135deg, #3d3b3b 0%, #5a5555 100%) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 10px 20px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  transition: all 0.3s ease !important;
}

:global(.swal2-confirm-custom:hover) {
  background: linear-gradient(135deg, #5a5555 0%, #3d3b3b 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(61, 59, 59, 0.3) !important;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .forms-container {
    padding: 40px 15px;
  }

  form {
    padding: 30px 20px;
  }

  .title {
    font-size: 1.6rem;
  }

  .input-field {
    height: 55px;
    max-width: 100%;
  }

  .privacy-content.expanded {
    max-height: 400px;
  }

  .privacy-details {
    padding: 0 15px 15px;
    font-size: 0.85rem;
  }

  .policy-section h4 {
    font-size: 1rem;
  }

  .btn {
    width: 160px;
    height: 50px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .input-field {
    grid-template-columns: 50px 1fr;
    height: 50px;
  }

  .input-field i {
    font-size: 1.1rem;
  }

  .title {
    font-size: 1.4rem;
  }
}
</style>
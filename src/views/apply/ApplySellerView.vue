<template>
  <div class="container" :class="{ 
    'application-mode': showApplication,
    'review-mode': showReview,
    'step-1-mode': currentStep === 1,
    'step-2-mode': currentStep === 2, 
    'step-3-mode': currentStep === 3, 
    'step-4-mode': currentStep === 4,
    'loading': isLoading 
  }">
    <!-- 載入中遮罩 -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>檢查申請狀態中...</span>
      </div>
    </div>
    
    <!-- 初始申請意願畫面 -->
    <div class="initial-container" v-if="!showApplication && !showReview">
      <div class="welcome-panel">
        <div class="content">
          <div class="icon-wrapper">
            <i class="fas fa-store"></i>
          </div>
          <h1>成為我們的賣家夥伴</h1>
          <p>開始您的網路銷售事業，與我們一起創造更多可能</p>
          <ul class="benefits-list">
            <li><i class="fas fa-check-circle" style="color: red;"></i> 輕鬆上架商品</li>
            <li><i class="fas fa-check-circle"  style="color: red;"></i> 專業客服支援</li>
            <li><i class="fas fa-check-circle"  style="color: red;"></i> 快速金流處理</li>
        
          </ul>
          <button class="btn-apply" @click="startApplication">
            <i class="fas fa-rocket"></i>
            我要申請成為賣家
          </button>
          <p class="note">申請流程簡單快速，通常在3-5個工作天內完成審核</p>
        </div>
        <div class="illustration">
          <div class="floating-elements">
            <div class="element element-1"><i class="fas fa-shopping-cart"></i></div>
            <div class="element element-2"><i class="fas fa-chart-line"></i></div>
            <div class="element element-3"><i class="fas fa-heart"></i></div>
            <div class="element element-4"><i class="fas fa-star"></i></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 申請流程畫面 -->
    <div class="application-container" v-if="showApplication && !showReview">
      <!-- 進度條 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (currentStep / 4) * 100 + '%' }"></div>
        </div>
        <div class="progress-steps">
          <div 
            v-for="step in steps" 
            :key="step.number"
            class="progress-step"
            :class="{ 'active': currentStep >= step.number, 'current': currentStep === step.number }"
          >
            <div class="step-circle">
              <i :class="step.icon"></i>
            </div>
            <span class="step-label">{{ step.title }}</span>
          </div>
        </div>
      </div>

      <!-- 表單容器 -->
      <div class="forms-container">
        <div class="form-wrapper">
          
          <!-- 第一步：基本資料 -->
          <form @submit.prevent="nextStep" class="form-step step-1" :class="{ 'active': currentStep === 1 }">
            <h2 class="title">基本資料填寫</h2>
            <p class="subtitle">請填寫您的真實姓名和身分證字號</p>
            
            <div class="input-field">
              <i class="fas fa-user"></i>
              <input 
                type="text" 
                placeholder="真實姓名 *" 
                v-model="formData.RealName"
                required
              >
            </div>
            
            <div class="input-field">
              <i class="fas fa-id-card"></i>
              <input 
  type="text" 
  placeholder="身分證字號 *" 
  v-model="formData.IdNumber"
  required
  maxlength="10"
  pattern="[A-Z][12]\d{8}"
  title="格式需為大寫英文字母開頭，接著是1或2，後面8位數字"
/>
            </div>

            <div class="form-actions">
              <button type="button" class="btn outline" @click="backToWelcome">返回</button>
              <button type="submit" class="btn solid">下一步</button>
            </div>
          </form>

          <!-- 第二步：文件上傳 -->
          <form @submit.prevent="nextStep" class="form-step step-2" :class="{ 'active': currentStep === 2 }">
            <h2 class="title">身分證件上傳</h2>
            <p class="subtitle">請上傳身分證正反面清晰照片</p>
            
            <div class="upload-section">
              <div class="upload-item">
                <label class="upload-label" :class="{ 'has-file': formData.frontDoc }">
                  <div class="upload-content">
                    <i class="fas fa-id-card"></i>
                    <span>身分證正面</span>
                    <p class="upload-hint">點擊上傳圖片</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="handleFileUpload('frontDoc', $event)"
                    required
                  >
                  <div class="upload-preview" v-if="formData.frontDocPreview">
                    <img :src="formData.frontDocPreview" alt="身分證正面">
                    <div class="file-name">{{ formData.frontDoc?.name }}</div>
                  </div>
                </label>
              </div>
              
              <div class="upload-item">
                <label class="upload-label" :class="{ 'has-file': formData.backDoc }">
                  <div class="upload-content">
                    <i class="fas fa-id-card"></i>
                    <span>身分證反面</span>
                    <p class="upload-hint">點擊上傳圖片</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="handleFileUpload('backDoc', $event)"
                    required
                  >
                  <div class="upload-preview" v-if="formData.backDocPreview">
                    <img :src="formData.backDocPreview" alt="身分證反面">
                    <div class="file-name">{{ formData.backDoc?.name }}</div>
                  </div>
                </label>
              </div>
            </div>

            <div class="form-actions ">
              <button type="button" class="btn outline" @click="prevStep">上一步</button>
              <button type="submit" class="btn solid">下一步</button>
            </div>
          </form>

          <!-- 第三步：銀行帳戶 -->
          <form @submit.prevent="nextStep" class="form-step step-3" :class="{ 'active': currentStep === 3 }">
            <h2 class="title">銀行帳戶資料</h2>
            <p class="subtitle">請填寫收款用的銀行帳戶資訊</p>
            
<div class="input-field">
  <i class="fas fa-university"></i>
  <select v-model="formData.BankName" @change="onBankChange" required>
<option value="">請選擇銀行 *</option>
<option value="台灣銀行">台灣銀行</option>
<option value="土地銀行">土地銀行</option>
<option value="合作金庫">合作金庫</option>
<option value="第一銀行">第一銀行</option>
<option value="華南銀行">華南銀行</option>
<option value="彰化銀行">彰化銀行</option>
<option value="上海銀行">上海銀行</option>
<option value="台北富邦">台北富邦</option>
<option value="國泰世華">國泰世華</option>
<option value="中國輸出入銀行">中國輸出入銀行</option>
<option value="高雄銀行">高雄銀行</option>
<option value="兆豐銀行">兆豐銀行</option>
<option value="花旗銀行">花旗銀行</option>
<option value="王道銀行">王道銀行</option>
<option value="台灣中小企業銀行">台灣中小企業銀行</option>
<option value="渣打銀行">渣打銀行</option>
<option value="台中銀行">台中銀行</option>
<option value="京城銀行">京城銀行</option>
<option value="滙豐銀行">滙豐銀行</option>
<option value="瑞興銀行">瑞興銀行</option>
<option value="華泰銀行">華泰銀行</option>
<option value="新光銀行">新光銀行</option>
<option value="陽信銀行">陽信銀行</option>
<option value="板信銀行">板信銀行</option>
<option value="三信銀行">三信銀行</option>
<option value="聯邦銀行">聯邦銀行</option>
<option value="遠東銀行">遠東銀行</option>
<option value="元大銀行">元大銀行</option>
<option value="永豐銀行">永豐銀行</option>
<option value="玉山銀行">玉山銀行</option>
<option value="凱基銀行">凱基銀行</option>
<option value="星展銀行">星展銀行</option>
<option value="台新銀行">台新銀行</option>
<option value="安泰銀行">安泰銀行</option>
<option value="中國信託">中國信託</option>
<option value="將來銀行">將來銀行</option>
<option value="連線商銀">連線商銀</option>
<option value="樂天銀行">樂天銀行</option>
<option value="中華郵政">中華郵政</option>
<option value="其他">其他</option>

  </select>
</div>

<div class="input-field" v-if="formData.BankName === '其他'">
  <i class="fas fa-code"></i>
  <input
    type="text"
    placeholder="請輸入銀行代碼 *"
    v-model="formData.BankCode"
    required
  />
</div>

<!-- 銀行代碼隱藏欄位，非其他銀行時自動帶入 -->
<input type="hidden" :value="formData.BankCode" />

            
            <div class="input-field">
              <i class="fas fa-credit-card"></i>
              <input 
                type="text" 
                placeholder="銀行帳號 *" 
                v-model="formData.AccountNumber"
                required
              >
            </div>

            <div class="upload-section">
              <div class="upload-item full-width">
                <label class="upload-label" :class="{ 'has-file': formData.BankPhoto }">
                  <div class="upload-content">
                    <i class="fas fa-camera"></i>
                    <span>銀行存摺照片</span>
                    <p class="upload-hint">請上傳存摺封面或內頁含帳號的照片</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="handleFileUpload('BankPhoto', $event)"
                    required
                  >
                  <div class="upload-preview" v-if="formData.BankPhotoPreview">
                    <img :src="formData.BankPhotoPreview" alt="存摺照片">
                    <div class="file-name">{{ formData.BankPhoto?.name }}</div>
                  </div>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn outline" @click="prevStep">上一步</button>
              <button type="submit" class="btn solid">下一步</button>
            </div>
          </form>

          <!-- 第四步：退貨地址 -->
          <form @submit.prevent="submitApplication" class="form-step step-4" :class="{ 'active': currentStep === 4 }">
            <h2 class="title">退貨收件資訊</h2>
            <p class="subtitle">請填寫商品退貨時的收件地址</p>
            
            <div class="input-field">
              <i class="fas fa-user"></i>
              <input 
                type="text" 
                placeholder="收件人姓名 *" 
                v-model="formData.ContactName"
                required
              >
            </div>
            
            <div class="input-field">
              <i class="fas fa-phone"></i>
              <input 
                type="tel" 
                placeholder="聯絡電話 *" 
                v-model="formData.ContactPhone"
                required
              >
            </div>
            
            <div class="address-row">
              <div class="input-field">
                <i class="fas fa-map-marker-alt"></i>
                <select v-model="formData.City" @change="onCityChange" required>
                  <option value="">選擇縣市 *</option>
                  <option v-for="city in cities" :key="city.name" :value="city.name">{{ city.name }}</option>
                </select>
              </div>
              
              <div class="input-field">
                <i class="fas fa-map"></i>
                <select v-model="formData.District" @change="onDistrictChange" required>
                  <option value="">選擇區域 *</option>
                  <option v-for="district in availableDistricts" :key="district.name" :value="district.name">{{ district.name }}</option>
                </select>
              </div>
              
              <div class="input-field">
                <i class="fas fa-hashtag"></i>
                <input 
                  type="text" 
                  placeholder="郵遞區號 *" 
                  v-model="formData.ZipCode"
                  required
                  maxlength="5"
                  readonly
                >
              </div>
            </div>
            
            <div class="input-field">
              <i class="fas fa-home"></i>
              <textarea 
                placeholder="詳細地址 *" 
                v-model="formData.ReturnAddress"
                required
                rows="3"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn outline" @click="prevStep">上一步</button>
              <button type="submit" class="btn solid submit-btn" :disabled="isSubmitting">
                <i class="fas fa-paper-plane" v-if="!isSubmitting"></i>
                <i class="fas fa-spinner fa-spin" v-if="isSubmitting"></i>
                {{ isSubmitting ? '提交中...' : '提交申請' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>

    <!-- 審核狀態畫面 -->
    <div class="review-container" v-if="showReview">
      <div class="review-panel">
        
<!-- 審核中狀態 -->
<div class="review-content pending" v-if="reviewStatus === 'pending'">
  <div class="status-icon">
    <i class="fas fa-hourglass-half"></i>
  </div>
  <h2>申請審核中</h2>
  <p class="status-message">
    您的賣家申請已成功提交！<br>
    我們正在審核您的資料，通常會在 <strong>3-5個工作天</strong> 內完成審核。
  </p>

  <div class="review-info" v-if="applicationInfo">
    <div class="info-item">
      <i class="fas fa-calendar-alt"></i>
      <span>申請時間：{{ applicationInfo.submitTime }}</span>
    </div>
    <div class="info-item">
      <i class="fas fa-user"></i>
      <span>申請人：{{ applicationInfo.realName }}</span>
    </div>
    <div class="info-item">
      <i class="fas fa-id-card"></i>
      <span>身分證號：{{ maskIdNumber(applicationInfo.idNumber) }}</span>
    </div>
  </div>

  <div class="action-buttons">
    <button class="btn outline" @click="checkReviewStatus">
      <i class="fas fa-sync-alt"></i> 重新檢查狀態
    </button>
    <button class="btn outline" @click="backToIndex">
      <i class="fas fa-home"></i> 回到首頁
    </button>
  </div>
</div>


        <!-- 被拒絕狀態 -->
        <div class="review-content rejected" v-if="reviewStatus === 'rejected'">
          <div class="status-icon">
            <i class="fas fa-times-circle"></i>
          </div>
          <h2>申請未通過</h2>
          <p class="status-message">
            很抱歉，您的賣家申請未能通過審核。
          </p>
          <div class="rejection-reasons">
            <h3>拒絕原因：</h3>
        
    
<ul>
  <li v-for="reason in rejectionReason" :key="reason">{{ reason }}</li>
</ul>
          </div>
          <div class="action-buttons">
            <button class="btn solid" @click="reapply">
              <i class="fas fa-redo"></i>
              重新申請
            </button>
  <button class="btn outline" @click="backToHome">
    <i class="fas fa-home"></i>
    回到首頁
  </button>
          </div>
        </div>

        <!-- 通過狀態 -->
        <div class="review-content approved" v-if="reviewStatus === 'approved'">
          <div class="status-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>恭喜！申請通過</h2>
          <p class="status-message">
            您的賣家申請已通過審核！<br>
            歡迎加入我們的賣家大家庭。
          </p>
          <div class="welcome-benefits">
            <h3>開始享受賣家權益：</h3>
            <ul>
              <li><i class="fas fa-check"></i> 立即上架商品</li>
              <li><i class="fas fa-check"></i> 專屬賣家後台管理</li>
              <li><i class="fas fa-check"></i> 24/7 客服支援</li>
              <li><i class="fas fa-check"></i> 專業銷售工具</li>
            </ul>
          </div>
          <div class="action-buttons">
            <button class="btn solid large" @click="goToSellerCenter">
              <i class="fas fa-store"></i>
              進入賣家中心
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- 背景動畫元素 -->
    <div class="bg-animation">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex' // 引入 Vuex store
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import authService from '@/services/authService'
const router = useRouter()

// 獲取組件實例（用於 eventBus）
const { proxy } = getCurrentInstance()

// 設定 axios 預設 baseURL，方便呼叫 API（請依實際後端 URL 調整）
axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'

// 使用 Vuex store
const store = useStore()

// 取得登入會員ID
const memberId = ref(null)

// 在組件載入時獲取會員 ID
onMounted(() => {
  // 從 store 中獲取會員 ID
  memberId.value = store.state.auth.memberId // 假設存在 auth module 中
  
  // 如果找不到會員 ID，檢查 localStorage
  if (!memberId.value) {
const userInfo = JSON.parse(localStorage.getItem('userInfo'))
if (userInfo && userInfo.memberId) {
  memberId.value = userInfo.memberId
}
  }
    // ✅ 補寫入 localStorage，給其他邏輯用
  if (memberId.value) {
    localStorage.setItem('memberId', memberId.value)
  }

  if (!memberId.value) {
    Swal.fire({
      icon: 'warning',
      title: '請先登入',
      confirmButtonText: '確定'
    })
    router.push('/login')
    return
  }
})

// 控制畫面狀態
const showApplication = ref(false)
const showReview = ref(false)
const currentStep = ref(1)
const isSubmitting = ref(false)
const isLoading = ref(true)

// 檢查申請狀態
const checkApplicationStatus = async () => {
  try {
    isLoading.value = true
    const storedMemberId = localStorage.getItem('memberId')
    
    if (!storedMemberId) {
      // 如果沒有會員ID，顯示初始畫面
      showApplication.value = false
      showReview.value = false
      return
    }

    memberId.value = storedMemberId

    // 檢查賣家申請狀態
    const response = await axios.get(`/api/ApplySeller/${memberId.value}/seller-status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    
    const data = response.data
if (data.status === 'approved') {
  localStorage.setItem('isSeller', 'true')
  
  console.log('🎉 賣家申請通過！更新狀態為:', {
    isSeller: localStorage.getItem('isSeller'),
    memberId: memberId.value
  })
  
  // 🔧 通知 Header 更新賣家狀態
  if (proxy && proxy.$eventBus) {
    const userData = {
      memberId: memberId.value,
      role: true, // 申請通過，成為賣家
      isSeller: true,
      isLogin: true
    }
    console.log('🔔 發送賣家狀態更新事件:', userData)
    
    // 觸發賣家申請成功事件
    proxy.$eventBus.emit('seller-application-success', {
      user: userData,
      status: 'approved'
    })
    
    // 同步到 authService
    try {
      authService.saveUserToStorage(userData)
      console.log('🔧 ApplySellerView: authService 同步完成')
    } catch (error) {
      console.warn('ApplySellerView authService 同步失敗:', error)
    }
    
    proxy.$eventBus.emit('user-login', userData)
    
    // 等待一小段時間讓 Header 更新
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  // 🔧 賣家申請通過 - 直接進入賣家中心，不需要重新登入
  await Swal.fire({
    icon: 'success',
    title: '恭喜！申請通過',
    text: '您的賣家申請已通過！現在可以開始販售商品了。',
    confirmButtonText: '前往賣家中心',
    allowOutsideClick: false
  })
  
  // 直接跳轉到賣家中心，不清除登入狀態
  router.push('/seller')
  return
} else if (['pending', 'rejected', 'resubmitted'].includes(data.status)) {
  localStorage.setItem('isSeller', 'false')

// 通知 Header 更新狀態（確保顯示為一般會員）
if (proxy && proxy.$eventBus) {
  const userData = {
    memberId: memberId.value,
    role: false, // 申請未通過或審核中，仍為一般會員
    isSeller: false,
    isLogin: true
  }
  proxy.$eventBus.emit('user-login', userData)
}

reviewStatus.value = (data.status === 'resubmitted') ? 'pending' : data.status

rejectionReason.value = data.rejectedReason ? [data.rejectedReason] : []

// 設定申請資訊
applicationInfo.value = {
  submitTime: data.appliedAt 
    ? new Date(data.appliedAt).toLocaleString('zh-TW')
    : new Date().toLocaleString('zh-TW'),
  realName: data.realName || '',
  idNumber: data.idNumber || ''
}

// 保存到 localStorage
localStorage.setItem('applicationInfo', JSON.stringify(applicationInfo.value))

showReview.value = true
showApplication.value = false
}
  } catch (error) {
    if (error.response?.status === 404) {
      // 沒有申請記錄，顯示初始畫面
      showApplication.value = false
      showReview.value = false
    } else {
      console.error('檢查狀態失敗:', error)
      Swal.fire({
        icon: 'error',
        title: '無法檢查申請狀態',
        text: '請稍後再試',
        confirmButtonText: '確定'
      })
    }
  } finally {
    isLoading.value = false
  }
}

// 在組件載入時檢查狀態
onMounted(() => {
  loadApplicationInfo() // 先載入保存的申請資料
  checkApplicationStatus()
})

// 審核狀態相關
const reviewStatus = ref('pending') // pending, approved, rejected
const submitTime = ref('')
const rejectionReason = ref([])
const applicationInfo = ref({
  submitTime: '',
  realName: '',
  idNumber: ''
})
// 從 localStorage 讀取申請資料
const loadApplicationInfo = () => {
  const savedData = localStorage.getItem('applicationInfo')
  if (savedData) {
    applicationInfo.value = JSON.parse(savedData)
  }
}

const bankCodeMap = {
  '台灣銀行': '004',
  '土地銀行': '005',
  '合作金庫': '006',
  '第一銀行': '007',
  '華南銀行': '008',
  '彰化銀行': '009',
  '上海銀行': '011',
  '台北富邦': '012',
  '國泰世華': '013',
  '中國輸出入銀行': '015',
  '高雄銀行': '016',
  '兆豐銀行': '017',
  '花旗銀行': '021',
  '王道銀行': '048',
  '台灣中小企業銀行': '050',
  '渣打銀行': '052',
  '台中銀行': '053',
  '京城銀行': '054',
  '滙豐銀行': '081',
  '瑞興銀行': '101',
  '華泰銀行': '102',
  '新光銀行': '103',
  '陽信銀行': '108',
  '板信銀行': '118',
  '三信銀行': '147',
  '聯邦銀行': '803',
  '遠東銀行': '805',
  '元大銀行': '806',
  '永豐銀行': '807',
  '玉山銀行': '808',
  '凱基銀行': '809',
  '星展銀行': '810',
  '台新銀行': '812',
  '安泰銀行': '816',
  '中國信託': '822',
  '將來銀行': '823',
  '連線商銀': '824',
  '樂天銀行': '826',
  '中華郵政': '700'
};


const onBankChange = () => {
  if (formData.BankName === '其他') {
    formData.BankCode = '' // 讓使用者輸入
  } else {
    formData.BankCode = bankCodeMap[formData.BankName] || ''
  }
}

// 地址相關的方法
const onCityChange = () => {
  formData.District = ''
  formData.ZipCode = ''
}

const onDistrictChange = () => {
  const selectedDistrict = availableDistricts.value.find(d => d.name === formData.District)
  if (selectedDistrict) {
    formData.ZipCode = selectedDistrict.zipCode
  }
}
// 步驟定義
const steps = [
  { number: 1, title: '基本資料', icon: 'fas fa-user' },
  { number: 2, title: '身分證件', icon: 'fas fa-id-card' },
  { number: 3, title: '銀行帳戶', icon: 'fas fa-university' },
  { number: 4, title: '退貨地址', icon: 'fas fa-map-marker-alt' }
]

// 表單資料
const formData = reactive({
  RealName: '',
  IdNumber: '',
  frontDoc: null,
  frontDocPreview: '',
  backDoc: null,
  backDocPreview: '',
  BankName: '',
BankCode: '',  
  AccountName: '',
  AccountNumber: '',
  BankPhoto: null,
  BankPhotoPreview: '',
  ContactName: '',
  ContactPhone: '',
  ReturnAddress: '',
  City: '',
  District: '',
  ZipCode: ''
})

// 城市和區域資料（從地址頁面複製過來）
const cities = [
  {
    name: '台北市',
    districts: [
      { name: '中正區', zipCode: '100' },
      { name: '大同區', zipCode: '103' },
      { name: '中山區', zipCode: '104' },
      { name: '松山區', zipCode: '105' },
      { name: '大安區', zipCode: '106' },
      { name: '萬華區', zipCode: '108' },
      { name: '信義區', zipCode: '110' },
      { name: '士林區', zipCode: '111' },
      { name: '北投區', zipCode: '112' },
      { name: '內湖區', zipCode: '114' },
      { name: '南港區', zipCode: '115' },
      { name: '文山區', zipCode: '116' }
    ]
  },
  {
    name: '新北市',
    districts: [
      { name: '板橋區', zipCode: '220' },
      { name: '三重區', zipCode: '241' },
      { name: '中和區', zipCode: '235' },
      { name: '永和區', zipCode: '234' },
      { name: '新莊區', zipCode: '242' },
      { name: '新店區', zipCode: '231' },
      { name: '樹林區', zipCode: '238' },
      { name: '鶯歌區', zipCode: '239' },
      { name: '三峽區', zipCode: '237' },
      { name: '淡水區', zipCode: '251' },
      { name: '汐止區', zipCode: '221' },
      { name: '瑞芳區', zipCode: '224' },
      { name: '土城區', zipCode: '236' },
      { name: '蘆洲區', zipCode: '247' },
      { name: '五股區', zipCode: '248' },
      { name: '八里區', zipCode: '249' },
      { name: '林口區', zipCode: '244' }
    ]
  },
  {
    name: '基隆市',
    districts: [
      { name: '仁愛區', zipCode: '200' },
      { name: '信義區', zipCode: '201' },
      { name: '中正區', zipCode: '202' },
      { name: '中山區', zipCode: '203' },
      { name: '安樂區', zipCode: '204' },
      { name: '暖暖區', zipCode: '205' }
    ]
  },
  {
    name: '桃園市',
    districts: [
      { name: '桃園區', zipCode: '330' },
      { name: '中壢區', zipCode: '320' },
      { name: '平鎮區', zipCode: '324' },
      { name: '八德區', zipCode: '334' },
      { name: '楊梅區', zipCode: '326' },
      { name: '蘆竹區', zipCode: '338' },
      { name: '大溪區', zipCode: '335' },
      { name: '龍潭區', zipCode: '325' },
      { name: '龜山區', zipCode: '333' }
    ]
  },
  {
    name: '新竹市',
    districts: [
      { name: '東區', zipCode: '300' },
      { name: '北區', zipCode: '300' },
      { name: '香山區', zipCode: '300' }
    ]
  },
  {
    name: '新竹縣',
    districts: [
      { name: '竹北市', zipCode: '302' },
      { name: '湖口鄉', zipCode: '303' },
      { name: '新豐鄉', zipCode: '304' },
      { name: '新埔鎮', zipCode: '305' },
      { name: '關西鎮', zipCode: '306' },
      { name: '芎林鄉', zipCode: '307' },
      { name: '寶山鄉', zipCode: '308' },
      { name: '竹東鎮', zipCode: '310' },
      { name: '五峰鄉', zipCode: '311' },
      { name: '橫山鄉', zipCode: '312' },
      { name: '尖石鄉', zipCode: '313' },
      { name: '北埔鄉', zipCode: '314' },
      { name: '峨眉鄉', zipCode: '315' }
    ]
  },
  {
    name: '苗栗縣',
    districts: [
      { name: '苗栗市', zipCode: '360' },
      { name: '苑裡鎮', zipCode: '351' },
      { name: '通霄鎮', zipCode: '352' },
      { name: '竹南鎮', zipCode: '350' },
      { name: '後龍鎮', zipCode: '346' },
      { name: '卓蘭鎮', zipCode: '369' },
      { name: '造橋鄉', zipCode: '361' },
      { name: '西湖鄉', zipCode: '362' },
      { name: '頭份市', zipCode: '351' },
      { name: '三義鄉', zipCode: '367' },
      { name: '公館鄉', zipCode: '363' },
      { name: '銅鑼鄉', zipCode: '364' },
      { name: '三灣鄉', zipCode: '365' },
      { name: '獅潭鄉', zipCode: '366' }
    ]
  },
  {
    name: '台中市',
    districts: [
      { name: '中區', zipCode: '400' },
      { name: '東區', zipCode: '401' },
      { name: '南區', zipCode: '402' },
      { name: '西區', zipCode: '403' },
      { name: '北區', zipCode: '404' },
      { name: '北屯區', zipCode: '406' },
      { name: '西屯區', zipCode: '407' },
      { name: '南屯區', zipCode: '408' },
      { name: '太平區', zipCode: '411' },
      { name: '大里區', zipCode: '412' },
      { name: '霧峰區', zipCode: '413' },
      { name: '烏日區', zipCode: '414' },
      { name: '豐原區', zipCode: '420' },
      { name: '后里區', zipCode: '421' },
      { name: '石岡區', zipCode: '422' },
      { name: '東勢區', zipCode: '423' },
      { name: '和平區', zipCode: '424' },
      { name: '新社區', zipCode: '426' },
      { name: '潭子區', zipCode: '427' },
      { name: '大雅區', zipCode: '428' },
      { name: '神岡區', zipCode: '429' },
      { name: '大肚區', zipCode: '432' },
      { name: '沙鹿區', zipCode: '433' },
      { name: '龍井區', zipCode: '434' },
      { name: '梧棲區', zipCode: '435' },
      { name: '清水區', zipCode: '436' },
      { name: '大甲區', zipCode: '437' },
      { name: '外埔區', zipCode: '438' },
      { name: '大安區', zipCode: '439' }
    ]
  },
  {
    name: '彰化縣',
    districts: [
      { name: '彰化市', zipCode: '500' },
      { name: '員林市', zipCode: '510' },
      { name: '和美鎮', zipCode: '508' },
      { name: '鹿港鎮', zipCode: '505' },
      { name: '溪湖鎮', zipCode: '515' },
      { name: '二林鎮', zipCode: '520' },
      { name: '田中鎮', zipCode: '530' },
      { name: '北斗鎮', zipCode: '515' },
      { name: '花壇鄉', zipCode: '509' },
      { name: '芬園鄉', zipCode: '502' },
      { name: '秀水鄉', zipCode: '504' },
      { name: '伸港鄉', zipCode: '522' },
      { name: '福興鄉', zipCode: '521' },
      { name: '線西鄉', zipCode: '526' },
      { name: '和美鎮', zipCode: '508' },
      { name: '埔心鄉', zipCode: '523' },
      { name: '溪州鄉', zipCode: '524' },
      { name: '竹塘鄉', zipCode: '522' },
      { name: '大村鄉', zipCode: '516' },
      { name: '埔鹽鄉', zipCode: '515' },
      { name: '田尾鄉', zipCode: '522' },
      { name: '埤頭鄉', zipCode: '515' },
      { name: '芳苑鄉', zipCode: '523' },
      { name: '二水鄉', zipCode: '523' }
    ]
  },
  {
    name: '南投縣',
    districts: [
      { name: '南投市', zipCode: '540' },
      { name: '草屯鎮', zipCode: '542' },
      { name: '埔里鎮', zipCode: '545' },
      { name: '竹山鎮', zipCode: '557' },
      { name: '名間鄉', zipCode: '551' },
      { name: '集集鎮', zipCode: '552' },
      { name: '水里鄉', zipCode: '553' },
      { name: '魚池鄉', zipCode: '555' },
      { name: '國姓鄉', zipCode: '556' },
      { name: '仁愛鄉', zipCode: '542' }
    ]
  },
  {
    name: '雲林縣',
    districts: [
      { name: '斗六市', zipCode: '640' },
      { name: '斗南鎮', zipCode: '630' },
      { name: '虎尾鎮', zipCode: '632' },
      { name: '西螺鎮', zipCode: '648' },
      { name: '土庫鎮', zipCode: '633' },
      { name: '北港鎮', zipCode: '651' },
      { name: '古坑鄉', zipCode: '646' },
      { name: '莿桐鄉', zipCode: '646' },
      { name: '林內鄉', zipCode: '646' },
      { name: '二崙鄉', zipCode: '646' },
      { name: '崙背鄉', zipCode: '646' },
      { name: '大埤鄉', zipCode: '646' },
      { name: '水林鄉', zipCode: '646' },
      { name: '口湖鄉', zipCode: '646' },
      { name: '四湖鄉', zipCode: '646' },
      { name: '元長鄉', zipCode: '646' }
    ]
  },
  {
    name: '嘉義市',
    districts: [
      { name: '東區', zipCode: '600' },
      { name: '西區', zipCode: '600' }
    ]
  },
  {
    name: '嘉義縣',
    districts: [
      { name: '太保市', zipCode: '612' },
      { name: '朴子市', zipCode: '613' },
      { name: '布袋鎮', zipCode: '625' },
      { name: '大林鎮', zipCode: '622' },
      { name: '民雄鄉', zipCode: '621' },
      { name: '溪口鄉', zipCode: '622' },
      { name: '新港鄉', zipCode: '616' },
      { name: '六腳鄉', zipCode: '615' },
      { name: '東石鄉', zipCode: '625' },
      { name: '義竹鄉', zipCode: '612' },
      { name: '鹿草鄉', zipCode: '612' },
      { name: '水上鄉', zipCode: '612' }
    ]
  },
  {
    name: '台南市',
    districts: [
      { name: '中西區', zipCode: '700' },
      { name: '東區', zipCode: '701' },
      { name: '南區', zipCode: '702' },
      { name: '北區', zipCode: '704' },
      { name: '安平區', zipCode: '708' },
      { name: '安南區', zipCode: '709' },
      { name: '永康區', zipCode: '710' },
      { name: '歸仁區', zipCode: '711' },
      { name: '新化區', zipCode: '712' },
      { name: '新營區', zipCode: '730' },
      { name: '善化區', zipCode: '741' },
      { name: '新市區', zipCode: '744' },
      { name: '安定區', zipCode: '745' },
      { name: '麻豆區', zipCode: '721' },
      { name: '佳里區', zipCode: '722' },
      { name: '西港區', zipCode: '723' },
      { name: '七股區', zipCode: '724' },
      { name: '將軍區', zipCode: '725' },
      { name: '學甲區', zipCode: '726' },
      { name: '北門區', zipCode: '727' },
      { name: '新營區', zipCode: '730' },
      { name: '後壁區', zipCode: '731' },
      { name: '白河區', zipCode: '732' },
      { name: '東山區', zipCode: '733' },
      { name: '六甲區', zipCode: '734' },
      { name: '下營區', zipCode: '735' },
      { name: '柳營區', zipCode: '736' },
      { name: '鹽水區', zipCode: '737' },
      { name: '善化區', zipCode: '741' },
      { name: '大內區', zipCode: '742' },
      { name: '山上區', zipCode: '743' }
    ]
  },
  {
    name: '高雄市',
    districts: [
      { name: '新興區', zipCode: '800' },
      { name: '前金區', zipCode: '801' },
      { name: '苓雅區', zipCode: '802' },
      { name: '鹽埕區', zipCode: '803' },
      { name: '鼓山區', zipCode: '804' },
      { name: '旗津區', zipCode: '805' },
      { name: '前鎮區', zipCode: '806' },
      { name: '三民區', zipCode: '807' },
      { name: '楠梓區', zipCode: '811' },
      { name: '小港區', zipCode: '812' },
      { name: '左營區', zipCode: '813' },
      { name: '仁武區', zipCode: '814' },
      { name: '大社區', zipCode: '815' },
      { name: '岡山區', zipCode: '820' },
      { name: '路竹區', zipCode: '821' },
      { name: '阿蓮區', zipCode: '822' },
      { name: '田寮區', zipCode: '823' },
      { name: '燕巢區', zipCode: '824' },
      { name: '橋頭區', zipCode: '825' },
      { name: '梓官區', zipCode: '826' },
      { name: '彌陀區', zipCode: '827' },
      { name: '永安區', zipCode: '828' },
      { name: '湖內區', zipCode: '829' },
      { name: '茄萣區', zipCode: '830' },
      { name: '鳥松區', zipCode: '833' },
      { name: '大樹區', zipCode: '840' },
      { name: '旗山區', zipCode: '842' },
      { name: '美濃區', zipCode: '843' },
      { name: '六龜區', zipCode: '844' },
      { name: '內門區', zipCode: '845' },
      { name: '杉林區', zipCode: '846' },
      { name: '甲仙區', zipCode: '847' },
      { name: '桃源區', zipCode: '848' },
      { name: '那瑪夏區', zipCode: '849' },
      { name: '茂林區', zipCode: '851' },
      { name: '茄萣區', zipCode: '852' }
    ]
  },
  {
    name: '屏東縣',
    districts: [
      { name: '屏東市', zipCode: '900' },
      { name: '潮州鎮', zipCode: '922' },
      { name: '東港鎮', zipCode: '928' },
      { name: '恆春鎮', zipCode: '946' },
      { name: '萬丹鄉', zipCode: '923' },
      { name: '長治鄉', zipCode: '924' },
      { name: '麟洛鄉', zipCode: '925' },
      { name: '九如鄉', zipCode: '926' },
      { name: '里港鄉', zipCode: '927' },
      { name: '鹽埔鄉', zipCode: '929' },
      { name: '高樹鄉', zipCode: '931' },
      { name: '萬巒鄉', zipCode: '932' },
      { name: '內埔鄉', zipCode: '933' },
      { name: '竹田鄉', zipCode: '934' },
      { name: '新埤鄉', zipCode: '935' },
      { name: '枋寮鄉', zipCode: '936' },
      { name: '枋山鄉', zipCode: '937' },
      { name: '春日鄉', zipCode: '938' },
      { name: '獅子鄉', zipCode: '939' },
      { name: '車城鄉', zipCode: '940' },
      { name: '牡丹鄉', zipCode: '941' },
      { name: '滿州鄉', zipCode: '947' },
      { name: '琉球鄉（小琉球）', zipCode: '817' }
    ]
  },
  {
    name: '台東縣',
    districts: [
      { name: '台東市', zipCode: '950' },
      { name: '成功鎮', zipCode: '961' },
      { name: '關山鎮', zipCode: '962' },
      { name: '卑南鄉', zipCode: '963' },
      { name: '鹿野鄉', zipCode: '964' },
      { name: '池上鄉', zipCode: '965' },
      { name: '東河鄉', zipCode: '966' },
      { name: '長濱鄉', zipCode: '967' },
      { name: '太麻里鄉', zipCode: '968' },
      { name: '大武鄉', zipCode: '969' },
      { name: '綠島鄉', zipCode: '951' },
      { name: '蘭嶼鄉', zipCode: '972' }
    ]
  },
  {
    name: '花蓮縣',
    districts: [
      { name: '花蓮市', zipCode: '970' },
      { name: '鳳林鎮', zipCode: '971' },
      { name: '玉里鎮', zipCode: '973' },
      { name: '新城鄉', zipCode: '972' },
      { name: '吉安鄉', zipCode: '973' },
      { name: '壽豐鄉', zipCode: '974' },
      { name: '光復鄉', zipCode: '975' },
      { name: '豐濱鄉', zipCode: '976' },
      { name: '瑞穗鄉', zipCode: '977' },
      { name: '富里鄉', zipCode: '978' }
    ]
  },
  {
    name: '宜蘭縣',
    districts: [
      { name: '宜蘭市', zipCode: '260' },
      { name: '羅東鎮', zipCode: '265' },
      { name: '蘇澳鎮', zipCode: '270' },
      { name: '頭城鎮', zipCode: '261' },
      { name: '礁溪鄉', zipCode: '262' },
      { name: '壯圍鄉', zipCode: '263' },
      { name: '員山鄉', zipCode: '264' },
      { name: '冬山鄉', zipCode: '267' },
      { name: '五結鄉', zipCode: '268' },
      { name: '三星鄉', zipCode: '269' }
    ]
  },
  {
    name: '金門縣',
    districts: [
      { name: '金沙鎮', zipCode: '890' },
      { name: '金湖鎮', zipCode: '892' },
      { name: '金寧鄉', zipCode: '893' },
      { name: '金城鎮', zipCode: '891' },
      { name: '烈嶼鄉', zipCode: '894' }
    ]
  },
  {
    name: '連江縣',
    districts: [
      { name: '南竿鄉', zipCode: '209' },
      { name: '北竿鄉', zipCode: '210' },
      { name: '莒光鄉', zipCode: '211' },
      { name: '東引鄉', zipCode: '212' }
    ]
  },
  {
    name: '澎湖縣',
    districts: [
      { name: '馬公市', zipCode: '880' },
      { name: '湖西鄉', zipCode: '881' },
      { name: '白沙鄉', zipCode: '882' },
      { name: '西嶼鄉', zipCode: '883' },
      { name: '望安鄉', zipCode: '884' }
    ]
  }
]

// 計算可用的區域（根據選擇的縣市）
const availableDistricts = computed(() => {
  const selectedCity = cities.find(city => city.name === formData.City)
  return selectedCity ? selectedCity.districts : []
})

// 開始申請
const startApplication = () => {
  showApplication.value = true
}

// 返回歡迎頁面
const backToWelcome = () => {
  showApplication.value = false
  showReview.value = false
  currentStep.value = 1
  resetForm()
}
// 返回首頁
    const backToHome = () => {
      router.push('/');  // 跳轉到首頁
    };
    
    // 返回首頁（另一種方式）
    const backToIndex = () => {
      router.push('/');  // 跳轉到首頁
    };

// 下一步
const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 檔案上傳處理
const handleFileUpload = (field, event) => {
  const file = event.target.files[0]
  if (file) {
    formData[field] = file
    const reader = new FileReader()
    reader.onload = (e) => {
      formData[field + 'Preview'] = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 提交申請 (POST /api/ApplySeller/{memberId}/apply)

// 提交申請
const submitApplication = async () => {
  try {
    isSubmitting.value = true
    
    // 檢查會員ID
    const storedMemberId = localStorage.getItem('memberId')
    if (!storedMemberId) {
      throw new Error('請先登入再進行申請')
    }

    // 表單驗證
    if (!formData.RealName?.trim()) throw new Error('請填寫真實姓名')
    if (!formData.IdNumber?.trim()) throw new Error('請填寫身分證號碼')
    if (!formData.BankName?.trim()) throw new Error('請選擇銀行')
    if (!formData.BankCode?.trim()) throw new Error('請填寫銀行代碼')
    if (!formData.AccountNumber?.trim()) throw new Error('請填寫銀行帳號')
    if (!formData.ContactName?.trim()) throw new Error('請填寫聯絡人姓名')
    if (!formData.ContactPhone?.trim()) throw new Error('請填寫聯絡電話')
    if (!formData.City?.trim()) throw new Error('請選擇縣市')
    if (!formData.District?.trim()) throw new Error('請填寫區域')
    if (!formData.ZipCode?.trim()) throw new Error('請填寫郵遞區號')
    if (!formData.ReturnAddress?.trim()) throw new Error('請填寫詳細地址')

    // 建立 FormData
    const payload = new FormData()
    
    // 基本資料
    payload.append('RealName', formData.RealName.trim())
    payload.append('IdNumber', formData.IdNumber.trim())

    // 身分證照片
    if (formData.frontDoc instanceof File) {
      payload.append('frontDoc', formData.frontDoc)
    } else {
      throw new Error('請上傳身分證正面照片')
    }
    
    if (formData.backDoc instanceof File) {
      payload.append('backDoc', formData.backDoc)
    } else {
      throw new Error('請上傳身分證反面照片')
    }

    // 銀行資訊
    payload.append('BankName', formData.BankName.trim())
    payload.append('BankCode', formData.BankCode.trim())
    payload.append('AccountName', formData.RealName.trim()) // 使用真實姓名作為帳戶名稱
    payload.append('AccountNumber', formData.AccountNumber.trim())

    // 銀行存摺照片
    if (formData.BankPhoto instanceof File) {
      payload.append('BankPhoto', formData.BankPhoto)
    } else {
      throw new Error('請上傳存摺照片')
    }

    // 聯絡資訊
    payload.append('ContactName', formData.ContactName.trim())
    payload.append('ContactPhone', formData.ContactPhone.trim())
    payload.append('ReturnAddress', formData.ReturnAddress.trim())
    payload.append('City', formData.City.trim())
    payload.append('District', formData.District.trim())
    payload.append('ZipCode', formData.ZipCode.trim())

    
    // Debug: 印出資料
    for (let [key, value] of payload.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    // 加入 Authorization header
    const response = await axios.post(`/api/ApplySeller/${storedMemberId}/apply`, payload, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
      }
    })

    console.log('申請成功', response.data)
Swal.fire({
  icon: 'success',
  title: '申請已提交成功！',
  confirmButtonText: '好'
})

// 更新申請資訊
applicationInfo.value = {
  submitTime: response.data.appliedAt || new Date().toLocaleString('zh-TW'),
  realName: formData.RealName,
  idNumber: formData.IdNumber
}
    
    // 保存到 localStorage
localStorage.setItem('applicationInfo', JSON.stringify(applicationInfo.value))

// ✅ 改為重新確認狀態（避免畫面不同步）
await checkApplicationStatus()

    reviewStatus.value = 'pending'
    showApplication.value = false
    showReview.value = true

  } catch (error) {
    console.error('提交失敗', error)
    // 顯示更詳細的錯誤訊息
    if (error.response) {
      // 後端回傳的錯誤
      const errorMessage = error.response.data?.message || error.response.data || '提交失敗，請稍後再試'
      alert(errorMessage)
    } else if (error.message) {
      // 前端驗證的錯誤
      alert(error.message)
    } else {
      alert('提交失敗，請稍後再試')
    }
  } finally {
    isSubmitting.value = false
  }
}

// 檢查審核狀態 (GET /api/ApplySeller/{memberId}/seller-status)
const checkReviewStatus = async () => {
  try {
    isLoading.value = true
    
    // 確保有會員ID
    const storedMemberId = localStorage.getItem('memberId')
    if (!storedMemberId && !memberId.value) {
      Swal.fire({
        icon: 'warning',
        title: '請先登入',
        confirmButtonText: '確定'
      })
      router.push('/login')
      return
    }
    
    // 使用存在的會員ID
    const currentMemberId = memberId.value || storedMemberId
    
    console.log('檢查會員狀態:', currentMemberId) // Debug log
    
    const response = await axios.get(`/api/ApplySeller/${currentMemberId}/seller-status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    
    const data = response.data
    console.log('API 回應:', data) // Debug log
    
    // 檢查回應資料
    if (!data) {
      throw new Error('無法取得審核狀態資料')
    }
    
    // 如果已經是賣家，直接跳轉
    if (data.status === 'approved') {
      // 通知 Header 更新狀態 - 賣家申請成功
      if (proxy && proxy.$eventBus) {
        const userData = {
          memberId: currentMemberId,
          role: true,
          isSeller: true,
          isLogin: true
        }
        
        // 觸發賣家申請成功事件
        proxy.$eventBus.emit('seller-application-success', {
          user: userData,
          status: 'approved'
        })
        
        // 也觸發一般登入事件以確保狀態同步
        proxy.$eventBus.emit('user-login', userData)
      }
      
      Swal.fire({
        icon: 'success',
        title: '您已經是認證賣家！',
        confirmButtonText: '前往賣家中心'
      }).then(() => {
        router.push('/seller')
      })
      return
    }
    
    // 更新審核狀態
    // 處理審核狀態
const rawStatus = data.status || 'pending'

// 將 resubmitted 狀態視為 pending（或你可獨立顯示）
reviewStatus.value = rawStatus === 'resubmitted' ? 'pending' : rawStatus

// 通知 Header 更新狀態
if (proxy && proxy.$eventBus) {
  const isSellerApproved = rawStatus === 'approved'
  const userData = {
    memberId: currentMemberId,
    role: isSellerApproved, // 只有通過審核才是賣家
    isSeller: isSellerApproved,
    isLogin: true
  }
  
  // 如果狀態變更為 approved，觸發賣家申請成功事件
  if (isSellerApproved) {
    proxy.$eventBus.emit('seller-application-success', {
      user: userData,
      status: 'approved'
    })
    console.log('🎉 ApplySellerView: 觸發賣家申請成功事件')
  }
  
  // 同步到 authService
  try {
    authService.saveUserToStorage(userData)
    console.log('🔧 ApplySellerView (狀態檢查): authService 同步完成', { isSellerApproved })
  } catch (error) {
    console.warn('ApplySellerView (狀態檢查) authService 同步失敗:', error)
  }
  
  proxy.$eventBus.emit('user-login', userData)
}

// 特別處理 resubmitted 狀態顯示訊息
const statusText = getStatusText(rawStatus)

// 顯示狀態更新提示
Swal.fire({
  icon: 'info',
  title: '狀態已更新',
  text: statusText,
  confirmButtonText: '確定'
})
    
    // 處理拒絕原因
    if (data.status === 'rejected') {
      if (data.rejectedReason) {
        // 如果是字串，轉換為陣列
        rejectionReason.value = Array.isArray(data.rejectedReason) 
          ? data.rejectedReason 
          : [data.rejectedReason]
      } else {
        rejectionReason.value = ['審核未通過，請重新申請']
      }
    } else {
      rejectionReason.value = []
    }
    
    // 更新申請資訊
    applicationInfo.value = {
      submitTime: data.appliedAt 
        ? new Date(data.appliedAt).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        : applicationInfo.value.submitTime || '資料載入中...',
      realName: data.realName || applicationInfo.value.realName || formData.RealName || '未提供',
      idNumber: data.idNumber || applicationInfo.value.idNumber || formData.IdNumber || '未提供'
    }
    
    // 保存更新的資訊到 localStorage
    localStorage.setItem('applicationInfo', JSON.stringify(applicationInfo.value))
    
    // 確保顯示審核畫面
    showReview.value = true
    showApplication.value = false
    
    // 顯示狀態更新提示
    Swal.fire({
      icon: 'info',
      title: '狀態已更新',
      text: getStatusText(reviewStatus.value),
      confirmButtonText: '確定'
    })
    
  } catch (error) {
    console.error('檢查狀態失敗:', error)
    
    let errorMessage = '無法取得審核狀態'
    
    if (error.response) {
      switch (error.response.status) {
        case 404:
          errorMessage = '找不到申請記錄，請重新申請'
          // 清除相關資料並回到初始畫面
          localStorage.removeItem('applicationInfo')
          showReview.value = false
          showApplication.value = false
          break
        case 401:
          errorMessage = '登入已過期，請重新登入'
          router.push('/login')
          break
        case 500:
          errorMessage = '伺服器錯誤，請稍後再試'
          break
        default:
          errorMessage = error.response.data?.message || '檢查狀態失敗'
      }
    } else if (error.message) {
      errorMessage = error.message
    }
    
    Swal.fire({
      icon: 'error',
      title: '檢查失敗',
      text: errorMessage,
      confirmButtonText: '確定'
    })
  } finally {
    isLoading.value = false
  }
}
// 輔助函數：取得狀態文字
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '您的申請正在審核中'
    case 'approved':
      return '恭喜！您的申請已通過'
    case 'rejected':
      return '很抱歉，您的申請未通過審核'
    default:
      return '狀態未知'
  }
}

// 重新申請 (POST /api/ApplySeller/{memberId}/resubmit)

const reapply = async () => {
  try {
    if (!memberId.value) {
      throw new Error('請先登入')
    }

    // 重設表單
    resetForm()

    // 顯示申請表單、隱藏審核畫面
    showApplication.value = true
    showReview.value = false
    currentStep.value = 1

    // 如果之前有申請過，嘗試帶入基本資料
    if (applicationInfo.value) {
      formData.RealName = applicationInfo.value.realName || ''
      formData.IdNumber = applicationInfo.value.idNumber || ''
    }

    alert('您可以重新填寫申請資料')

  } catch (error) {
    console.error('重新申請失敗', error)
    alert('重新申請失敗，請洽詢客服人員。')
  }
}
// 進入賣家中心
const goToSellerCenter = () => {
  alert('即將跳轉到賣家中心...')
  // 這裡可用 Vue Router 實作跳轉
   router.push('/seller')
}

// 重置表單
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key.endsWith('Preview')) {
      formData[key] = ''
    } else if (typeof formData[key] === 'string') {
      formData[key] = ''
    } else {
      formData[key] = null
    }
  })
}

// 遮蔽身分證號碼
const maskIdNumber = (IdNumber) => {
  if (!IdNumber) return ''
  if (IdNumber.length < 8) return IdNumber // 避免越界
  return IdNumber.substring(0, 3) + '****' + IdNumber.substring(7)
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

/* === 初始歡迎畫面 === */
.initial-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: transform 1.2s ease-in-out;
}

.welcome-panel {
  background: white;
  border-radius: 30px;
  margin-top: 80px;
  padding: 80px;
  max-width: 800px;
  width: 90%;
  box-shadow: 0 30px 60px #f5020248;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.welcome-panel::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(111, 137, 193, 0.1) 0%, transparent 70%);
  animation: welcomeGlow 6s ease-in-out infinite alternate;
  z-index: 1;
}

@keyframes welcomeGlow {
  0% { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(360deg) scale(1.1); }
}

.content {
  position: relative;
  z-index: 2;
}

.icon-wrapper {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #e90606, #eb5757);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  animation: iconBounce 2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.icon-wrapper i {
  font-size: 3rem;
  color: white;
}

.welcome-panel h1 {
  font-size: 2.5rem;
  color: #3d3b3b;
  margin-bottom: 20px;
  font-weight: 700;
}

.welcome-panel p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.6;
}

.benefits-list {
  list-style: none;
  margin-bottom: 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #3d3b3b;
  font-weight: 500;
}

.benefits-list i {
  color: #6f89c1;
  font-size: 1.1rem;
}

.btn-apply {
  background: linear-gradient(135deg, #e90606, #eb5757);
  color: white;
  border: none;
  padding: 18px 40px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px #eb575740;
  margin-bottom: 20px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.btn-apply:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px #eb575760;
}

.btn-apply i {
  font-size: 1.1rem;
}

.note {
  font-size: 0.9rem;
  color: #999;
  font-style: italic;
}

/* === 申請流程畫面 === */
.application-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  transform: translateX(100%);
  transition: transform 1.2s ease-in-out;
  z-index: 10;
}

.container.application-mode .initial-container {
  transform: translateX(-100%);
}

.container.application-mode .application-container {
  transform: translateX(0);
}

/* === 審核狀態畫面 === */
.review-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
  transform: translateY(100%);
  transition: transform 1.2s ease-in-out;
}

.container.review-mode .review-container {
  transform: translateY(0);
}

.container.review-mode .application-container {
  transform: translateX(-100%);
}

.review-panel {
  background: white;
  border-radius: 20px;
  padding: 60px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  text-align: center;
  position: relative;
}

.review-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  font-size: 3rem;
}

.pending .status-icon {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

.rejected .status-icon {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.approved .status-icon {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  animation: checkmark 1s ease-in-out;
}

@keyframes checkmark {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.review-content h2 {
  font-size: 2rem;
  margin-bottom: 15px;
  font-weight: 700;
}

.pending h2 {
  color: #ff9800;
}

.rejected h2 {
  color: #dc3545;
}

.approved h2 {
  color: #28a745;
}

.status-message {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.review-info {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  width: 100%;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 0.95rem;
  color: #555;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item i {
  color: #eb5757;
  width: 16px;
}

.rejection-reasons,
.welcome-benefits {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  width: 100%;
  text-align: left;
}

.rejection-reasons h3,
.welcome-benefits h3 {
  font-size: 1.1rem;
  margin-bottom: 15px;
  color: #3d3b3b;
}

.rejection-reasons ul {
  list-style: none;
  padding: 0;
}

.rejection-reasons li {
  padding: 8px 0;
  border-bottom: 1px solid #dee2e6;
  color: #dc3545;
}

.rejection-reasons li:last-child {
  border-bottom: none;
}

.welcome-benefits ul {
  list-style: none;
  padding: 0;
}

.welcome-benefits li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: #28a745;
}

.welcome-benefits li i {
  width: 16px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 進度條 */
.progress-container {
  margin-bottom: 10px;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 0 40px 15px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #e90606, #eb5757);
  transition: width 0.8s ease;
  border-radius: 3px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin: 0 40px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.progress-step.active .step-circle {
  background: linear-gradient(135deg, #e90606, #eb5757);
  color: white;
  transform: scale(1.1);
}

.progress-step.current .step-circle {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 #eb5757; }
  70% { box-shadow: 0 0 0 10px rgba(235, 87, 87, 0); }
  100% { box-shadow: 0 0 0 0 rgba(235, 87, 87, 0); }
}

.step-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  text-align: center;
}

.progress-step.active .step-label {
  color: #eb5757;
  font-weight: 600;
}

/* 表單總容器 */
.forms-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 160px);
  padding-top: 10px;
}

/* 表單外框 */
.form-wrapper {
  width: 100%;
  max-width: 1000px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* 單一步驟表單 */
.form-step {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 60px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
  pointer-events: none;
}

/* 啟用的步驟 */
.form-step.active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
  position: relative;
}

/* 標題 */
.title {
  font-size: 1.8rem;
  color: #3d3b3b;
  margin-bottom: 8px;
  font-weight: 600;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
  font-size: 1rem;
}

/* 輸入欄位 */
.input-field {
  max-width: 100%;
  width: 100%;
  height: 60px;
  background-color: #f8f9fa;
  margin: 15px 0;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 60px 1fr;
  padding: 0;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.input-field:focus-within {
  border-color: #eb5757;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(235, 87, 87, 0.1);
}

.input-field i {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.1rem;
}

.input-field input,
.input-field select,
.input-field textarea {
  background: none;
  outline: none;
  border: none;
  padding: 0 15px;
  font-weight: 500;
  font-size: 1rem;
  color: #3d3b3b;
  font-family: 'Poppins', sans-serif;
}

.input-field textarea {
  resize: none;
  padding: 15px;
  line-height: 1.5;
}

.input-field input::placeholder,
.input-field textarea::placeholder {
  color: #aaa;
  font-weight: 400;
}

.address-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 15px;
}

/* 上傳區域 */
.upload-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 30px 0;
}

.upload-section .full-width {
  grid-column: 1 / -1;
}

.upload-label {
  display: block;
  width: 100%;
  min-height: 180px;
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-label:hover {
  border-color: #eb5757;
  background: rgba(235, 87, 87, 0.05);
}

.upload-label.has-file {
  border-color: #eb5757;
  border-style: solid;
}

.upload-label input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}

.upload-content i {
  font-size: 2rem;
  color: #999;
  margin-bottom: 10px;
}

.upload-content span {
  font-weight: 600;
  color: #3d3b3b;
  margin-bottom: 5px;
}

.upload-hint {
  font-size: 0.9rem;
  color: #999;
}

.upload-preview {
  text-align: center;
  margin-top: 10px;
}

.upload-preview img {
  width: 100px;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  display: block;
  margin: 0 auto 5px;
}

.file-name {
  font-size: 0.85rem;
  color: #666;
}

/* 按鈕樣式 */
.btn {
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.outline {
  background: white;
  color: #eb5757;
  border-color: #eb5757;
}

.btn.outline:hover:not(:disabled) {
  background: #eb5757;
  color: white;
}

.btn.solid {
  background: linear-gradient(135deg, #e90606, #eb5757);
  color: white;
}

.btn.solid:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(235, 87, 87, 0.4);
}

.btn.large {
  padding: 18px 40px;
  font-size: 1.2rem;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 40px;
}

/* icon動畫 */
.illustration {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  height: 200px;
  z-index: 1;
}

.floating-elements {
  position: relative;
  width: 100%;
  height: 100%;
}

.element {
  position: absolute;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #e90606, #eb5757);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.element-1 {
  top: 0;
  left: 0;
  animation: float1 3s ease-in-out infinite;
}

.element-2 {
  top: 0;
  right: 0;
  animation: float2 3s ease-in-out infinite 0.5s;
}

.element-3 {
  bottom: 0;
  left: 0;
  animation: float3 3s ease-in-out infinite 1s;
}

.element-4 {
  bottom: 0;
  right: 0;
  animation: float4 3s ease-in-out infinite 1.5s;
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(10px, -10px) rotate(180deg); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-10px, 10px) rotate(-180deg); }
}

@keyframes float3 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(15px, -5px) rotate(90deg); }
}

@keyframes float4 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-15px, -15px) rotate(-90deg); }
}

/* 背景動畫 */
.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #e90606, #eb5757);
  top: 10%;
  left: 10%;
  animation: floatShape1 20s ease-in-out infinite;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #eb5757, #ff9800);
  top: 70%;
  right: 10%;
  animation: floatShape2 15s ease-in-out infinite;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #ff9800, #28a745);
  bottom: 30%;
  left: 60%;
  animation: floatShape3 18s ease-in-out infinite;
}

@keyframes floatShape1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(50px, -30px) rotate(120deg); }
  66% { transform: translate(-30px, 40px) rotate(240deg); }
}

@keyframes floatShape2 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-40px, -50px) rotate(180deg); }
}

@keyframes floatShape3 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(30px, -20px) rotate(90deg); }
  75% { transform: translate(-20px, 30px) rotate(270deg); }
}

/* 載入中遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  background: white;
  padding: 20px 40px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading-spinner i {
  font-size: 2rem;
  color: #eb5757;
}

.loading-spinner span {
  color: #3d3b3b;
  font-size: 1rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .welcome-panel {
    padding: 40px 30px;
    margin-top: 40px;
  }
  
  .welcome-panel h1 {
    font-size: 2rem;
  }
  
  .form-step {
    padding: 40px 30px;
  }
  
  .progress-steps {
    margin: 0 20px;
  }
  
  .progress-bar {
    margin: 0 20px 15px;
  }
  
  .address-row {
    grid-template-columns: 1fr;
  }
  
  .upload-section {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .review-panel {
    padding: 40px 30px;
    margin: 20px;
  }
}

</style>
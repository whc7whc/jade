<template>
  <div class="container" :class="{ 'sign-up-mode': isSignUpMode }">
    <div class="forms-container">
      <div class="signin-signup">
        <!-- 登入表單 -->
        <form @submit.prevent="handleSignIn" class="signin-form">
          <h2 class="title">登入</h2>
          <div class="input-field">
            <i class="fas fa-user"></i>
            <input 
              type="email" 
              placeholder="電子郵件地址" 
              v-model="signInForm.email"
              required
            />
          </div>
          <div class="input-field">
            <i class="fas fa-lock"></i>
            <input 
              type="password" 
              placeholder="密碼" 
              v-model="signInForm.password"
              required
            />
          </div>

          <div class="forgot-password">
            <a href="#" @click.prevent="handleForgotPassword">忘記密碼？</a>
          </div>

          <div class="signup-actions">
            <input 
              type="submit" 
              :disabled="isLoading" 
              :value="isLoading ? '登入中...' : '登入'" 
              class="btn solid" 
            />
            <span class="or-text">或</span>
            <div class="google-login-btn"></div>
          </div>
        </form>

        <!-- 註冊表單 -->
        <form @submit.prevent="handleSignUp" class="signup-form">
          <h2 class="title">註冊</h2>

          <div class="input-field">
            <i class="fas fa-envelope"></i>
            <input 
              type="email" 
              placeholder="電子郵件地址 *" 
              v-model="signUpForm.email"
              required
              pattern="^[\\w._%+-]+@[\\w.-]+\\.[a-zA-Z]{2,}$"
            />
          </div>

          <div class="input-field verification-code-field">
            <i class="fas fa-key"></i>
            <input 
              type="text" 
              placeholder="驗證碼" 
              maxlength="6" 
              v-model="signUpForm.verificationCode"
              style="padding-right: 120px;"
            />
            <button 
              type="button" 
              class="btn send-code-btn" 
              @click="sendVerificationCode"
              :disabled="!signUpForm.email || sendingCode || countdown > 0"
            >
              {{ sendingCode 
                ? '發送中...' 
                : (countdown > 0 ? ` ${countdown} 秒後重發` : '寄送驗證碼') }}
            </button>
          </div>

          <div class="input-field">
            <i class="fas fa-lock"></i>
            <input 
              type="password" 
              placeholder="密碼 *（至少 8 個字元）" 
              minlength="8" 
              v-model="signUpForm.password"
              required
            />
          </div>

          <div class="input-field">
            <i class="fas fa-lock"></i>
            <input 
              type="password" 
              placeholder="確認密碼 *" 
              minlength="8" 
              v-model="signUpForm.confirmPassword"
              required
            />
          </div>

          <div class="signup-actions">
            <input type="submit" value="註冊" class="btn solid" />
            <span class="or-text">或</span>
            <a href="#" class="google-login-btn" @click.prevent="handleGoogleSignIn">
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" />
              <span>使用 Google 註冊</span>
            </a>
          </div>
        </form>
      </div>
    </div>

    <div class="panels-container">
      <div class="panel left-panel">
        <div class="content">
          <h3>新朋友？</h3>
          <p>歡迎加入我們！快來註冊成為會員吧！</p>
          <button class="btn transparent" @click="switchToSignUp">註冊</button>
        </div>
        <img src="/images/Shopping.svg" alt="Shopping" class="image" />
      </div>

      <div class="panel right-panel">
        <div class="content">
          <h3>已經是會員？</h3>
          <p>歡迎回來，請登入您的帳號。</p>
          <button class="btn transparent" @click="switchToSignIn">登入</button>
        </div>
        <img src="/images/Shopping2.svg" alt="Shopping" class="image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { ref, reactive, onMounted, onUnmounted, getCurrentInstance } from 'vue' 
import authService from '@/services/authService'

const router = useRouter()
const { proxy } = getCurrentInstance()
const API_BASE = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'

const isSignUpMode = ref(false)
const isLoading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
let countdownTimer = null

const signInForm = reactive({
  email: '',
  password: ''
})

const signUpForm = reactive({
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: ''
})

const switchToSignUp = () => isSignUpMode.value = true
const switchToSignIn = () => isSignUpMode.value = false

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

// 發送驗證碼
const sendVerificationCode = async () => {
  if (!signUpForm.email) {
    await Swal.fire('錯誤', '請先輸入電子郵件地址', 'warning')
    return
  }
  if (countdown.value > 0) {
    await Swal.fire('請稍後再試', '請稍等，60 秒後再試', 'info')
    return
  }

  sendingCode.value = true
  try {
    await axios.post(`${API_BASE}/api/Auth/send-code`, { email: signUpForm.email })
    await Swal.fire('成功', `驗證碼已發送到 ${signUpForm.email}`, 'success')

    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(countdownTimer)
    }, 1000)
  } catch (error) {
    await Swal.fire('錯誤', '發送驗證碼失敗，請稍後再試', 'error')
  } finally {
    sendingCode.value = false
  }
}

// 初始化會員統計資料
const initializeMemberStats = async (memberId, token) => {
  try {
    console.log('🔧 初始化會員統計資料:', memberId)
    
    // 首先嘗試直接調用後端 API
    const response = await axios.post(`${API_BASE}/api/Members/${memberId}/stats/initialize`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('✅ 會員統計資料初始化成功:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 初始化會員統計資料失敗:', error)
    
    // 如果是 404 錯誤，嘗試其他方法
    if (error.response?.status === 404) {
      console.log('🔄 後端沒有專用初始化 API，嘗試替代方法')
      
      try {
        // 方法1: 嘗試觸發等級摘要 API
        await axios.get(`${API_BASE}/api/Members/${memberId}/Level/Summary`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        console.log('✅ 透過等級摘要 API 觸發統計資料建立')
        return { success: true, method: 'summary-trigger' }
      } catch (summaryError) {
        console.warn('⚠️ 等級摘要 API 也失敗，嘗試 POST 方法')
        
        try {
          // 方法2: 嘗試直接 POST 到等級相關端點
          await axios.post(`${API_BASE}/api/Members/${memberId}/Level`, {
            currentLevel: 1,
            totalSpent: 0
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          console.log('✅ 透過 POST 等級 API 建立統計資料')
          return { success: true, method: 'level-post' }
        } catch (postError) {
          console.warn('⚠️ 所有方法都失敗，會員等級將使用預設值')
        }
      }
    }
    
    // 不拋出錯誤，避免影響註冊流程
    return { success: false, error: error.message }
  }
}


// 註冊
const handleSignUp = async () => {
  if (signUpForm.password !== signUpForm.confirmPassword) {
    await Swal.fire('錯誤', '密碼與確認密碼不一致！', 'error')
    return
  }

  try {
    const payload = {
      email: signUpForm.email,
      code: signUpForm.verificationCode,
      password: signUpForm.password,
      confirmPassword: signUpForm.confirmPassword
    }

    const response = await axios.post(`${API_BASE}/api/Auth/register`, payload)
    const { memberId, token } = response.data

    // 存 localStorage
    localStorage.setItem('memberId', memberId)
    if (token) localStorage.setItem('token', token)
    
    // 註冊時預設為會員，不需要處理 role
    localStorage.setItem('isSeller', 'false')

    // 🔧 新增：初始化會員統計資料
    try {
      await initializeMemberStats(memberId, token)
    } catch (error) {
      console.warn('初始化會員統計資料失敗:', error)
      // 不中斷註冊流程，只記錄警告
    }

    await Swal.fire('註冊成功', '請填寫會員資料', 'success')

    // 觸發 Header 更新登入狀態
    if (proxy && proxy.$eventBus) {
      const userData = {
        memberId: memberId,
        email: signUpForm.email,
        role: false, // 註冊時預設為會員
        isSeller: false, // 註冊時預設為會員
        isLogin: true
      }

      // 同步到 authService
      try {
        authService.saveUserToStorage(userData)
        console.log('🔧 LoginView: 註冊後 authService 同步完成')
      } catch (error) {
        console.warn('註冊後 authService 同步失敗:', error)
      }

      proxy.$eventBus.emit('user-login', userData)
    }

    // 跳轉到會員資料頁，帶 memberId 和 email
    router.push({ path: '/member/profile', query: { memberId, email: signUpForm.email } })
  } catch (error) {
    const msg = error.response?.data?.message || error.message
    if (msg.includes('already exists') || msg.includes('已存在')) {
      await Swal.fire('提示', '此帳號已註冊過，請直接登入', 'info')
    } else {
      await Swal.fire('註冊失敗', msg, 'error')
    }
  }
}


// 登入
const handleSignIn = async () => {
  isLoading.value = true
  try {
    const response = await axios.post(`${API_BASE}/api/Auth/login`, signInForm)
    const { memberId, token, role } = response.data

    localStorage.setItem('memberId', memberId)
    if (token) localStorage.setItem('token', token)

    // 直接使用登入 API 回傳的 Role 值
    // Role 為 true 表示賣家，false 表示會員
    const isSeller = !!role
    localStorage.setItem('isSeller', isSeller ? 'true' : 'false')

    // 取得會員資料檢查是否需要填寫資料
    const memberRes = await axios.get(`${API_BASE}/api/Auth/${memberId}/profile`).catch(() => ({ data: null }))

    // 構建用戶資料並發送登入事件
    const userData = {
      memberId: memberId,
      role: isSeller,
      isSeller: isSeller,
      isLogin: true,
      email: signInForm.email
    }

    // 同步到 authService
    try {
      authService.saveUserToStorage(userData)
      console.log('🔧 LoginView: authService 同步完成')
    } catch (error) {
      console.warn('authService 同步失敗:', error)
    }

    // 發送全局登入事件通知 AppHeader
    if (proxy && proxy.$eventBus) {
      console.log('🔔 LoginView: 發送登入事件', userData)
      proxy.$eventBus.emit('user-login', userData)
    }

    if (!memberRes.data || !memberRes.data.name) {
      await Swal.fire('首次登入', '請填寫會員資料', 'info')
      router.push({ path: '/member/profile', query: { memberId, email: signInForm.email } })
    } else {
      await Swal.fire('登入成功', '', 'success')
      const redirect = router.currentRoute.value.query.redirect
      router.push(redirect ? redirect.toString() : '/')
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message
    await Swal.fire('登入失敗', msg, 'error')
  } finally {
    isLoading.value = false
  }
}
// Google 登入 callback
const handleGoogleSignIn = async (response) => {
  try {
    const idToken = response?.credential;  // 防止 response 是 undefined
    if (!idToken) {
      console.warn('Google callback 無憑證，忽略此次呼叫');
      return; // 直接跳過，不丟錯誤避免打斷流程
    }

    // 傳送 Token 給後端
    const res = await axios.post(`${API_BASE}/api/third-party-auth/google-login`, { idToken });

    console.log('Google 登入/註冊回傳:', res.data);

    const { memberId, token, email, isNewUser, role, isSeller: apiIsSeller, userType } = res.data;

    if (!memberId) throw new Error('後端未回傳 memberId，無法繼續');

    // 判斷賣家狀態
    let sellerFlag = false;
    if (role === true || role === 'true' || role === 1) sellerFlag = true;
    if (apiIsSeller === true || apiIsSeller === 'true') sellerFlag = true;
    if (userType === 'seller') sellerFlag = true;

    // 儲存登入資訊
    localStorage.setItem('memberId', memberId);
    if (token) localStorage.setItem('token', token);
    localStorage.setItem('isSeller', sellerFlag ? 'true' : 'false');

    const userData = {
      memberId,
      role: sellerFlag,
      isSeller: sellerFlag,
      isLogin: true,
      loginType: "google",
      email: email
    };

    // 同步到 authService
    try {
      authService.saveUserToStorage(userData)
      console.log('🔧 Google 登入: authService 同步完成')
    } catch (error) {
      console.warn('Google 登入 authService 同步失敗:', error)
    }

    // 發送登入事件
    if (proxy && proxy.$eventBus) {
      console.log('🔔 Google 登入: 發送登入事件', userData)
      proxy.$eventBus.emit('user-login', userData)
    }

    // 發送登入事件
    if (proxy?.$eventBus) {
      console.log('🔔 LoginView: Google 登入發送事件', userData);
      proxy.$eventBus.emit('user-login', userData);
    }

    if (isNewUser) {
      // 🔧 新增：為 Google 新用戶初始化會員統計資料
      try {
        await initializeMemberStats(memberId, token)
      } catch (error) {
        console.warn('Google 新用戶初始化會員統計資料失敗:', error)
        // 不中斷註冊流程，只記錄警告
      }

      await Swal.fire({
        icon: 'success',
        title: 'Google 註冊成功',
        text: '請填寫會員資料',
        confirmButtonText: '前往',
      });

      try {
        router.push({
          path: '/member/profile',
          query: { memberId, email: email || '' },
        });
      } catch (routerErr) {
        console.error('Router push 錯誤:', routerErr);
      }

    } else {
      await Swal.fire({
        icon: 'success',
        title: 'Google 登入成功',
        text: '歡迎回來！',
        timer: 1800,
        showConfirmButton: false,
      });

      const redirect = router.currentRoute.value.query.redirect;
      try {
        router.push(redirect ? redirect.toString() : '/');
      } catch (routerErr) {
        console.error('Router push 錯誤:', routerErr);
      }
    }

  } catch (error) {
    console.error('Google 登入失敗:', error);

    let msg = '發生錯誤，請稍後再試';

    if (error.message === 'Network Error') {
      msg = '網路連線異常，請確認你的網路狀態後再試一次。';
    } else {
      const serverMsg = error.response?.data?.message || error.response?.data || '';
      const rawMsg = typeof serverMsg === 'string' ? serverMsg : '';

      if (rawMsg) {
        if (rawMsg.includes('already exists') || rawMsg.includes('已存在')) {
          msg = '此信箱已註冊，請使用帳號密碼登入';
        } else if (rawMsg.includes('audience') || rawMsg.includes('client_id')) {
          msg = 'Google 憑證驗證失敗，請稍後再試';
        } else if (rawMsg.includes('Token') || rawMsg.includes('token')) {
          msg = 'Google 登入憑證無效或已過期，請重新登入';
        } else {
          msg = rawMsg;
        }
      } else if (error.message) {
        msg = error.message;
      }
    }

    await Swal.fire({
      icon: 'error',
      title: 'Google 登入失敗',
      text: msg,
    });
  }
};


// 在組件掛載後初始化 Google 登入流程
onMounted(() => {
  // 🔧 檢查 URL 參數，如果是賣家申請通過的跳轉，顯示提示
  const urlParams = new URLSearchParams(window.location.search)
  const message = urlParams.get('message')
  
  if (message === 'seller_approved') {
    Swal.fire({
      icon: 'success',
      title: '賣家申請已通過！',
      text: '恭喜您成為賣家！請重新登入以啟用賣家功能。',
      confirmButtonText: '開始登入'
    })
    
    // 清理 URL 參數
    const url = new URL(window.location)
    url.searchParams.delete('message')
    window.history.replaceState({}, '', url)
  }
  
  const loadGoogleScript = () => {
    if (!document.querySelector('script#google-platform')) {
      const script = document.createElement('script');
      script.id = 'google-platform';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        initGoogleAuth();
      };
    } else {
      initGoogleAuth();
    }
  };

  const initGoogleAuth = () => {
    if (window.google?.accounts) {
      try {
        console.log('當前網域:', window.location.origin);
        window.google.accounts.id.initialize({
          client_id: '905313427248-3vg0kd6474kbaif9ujg41n7376ua8ajp.apps.googleusercontent.com',
          callback: handleGoogleSignIn,
          context: 'signin',
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        console.log('Google 登入初始化成功');

        // 渲染按鈕（確保容器存在）
        const containers = document.querySelectorAll('.google-login-btn');
        if (containers.length === 0) {
          console.warn('找不到 .google-login-btn 按鈕容器，請確認 HTML 是否有該 class');
          return;
        }
        containers.forEach(container => {
          window.google.accounts.id.renderButton(container, {
            type: 'standard',
            shape: 'circle',
            theme: 'outline',
            size: 'large',
            locale: 'zh_TW',
          });
        });

        // **注意這裡不要呼叫 window.google.accounts.id.prompt()**

      } catch (error) {
        console.error('Google 登入初始化失敗:', error);
      }
    } else {
      setTimeout(initGoogleAuth, 1000);
    }
  };

  loadGoogleScript();
});


// 忘記密碼
const handleForgotPassword = async () => {
  const { value: email } = await Swal.fire({
    html: `
      <div style="text-align: center; font-weight: 700; font-size: 20px; margin-bottom: 12px;">忘記密碼？</div>
      <label for="swal-input-email" style="display: block; font-weight: 600; margin-bottom: 6px;">請輸入信箱以接收驗證碼</label>
      <input id="swal-input-email" type="email" class="swal2-input" placeholder="請輸入你的電子郵件" style="margin-top: 0;">
    `,
    showCancelButton: true,
    confirmButtonText: '送出',
    cancelButtonText: '取消',
    preConfirm: () => {
      const emailInput = document.getElementById('swal-input-email').value;
      if (!emailInput) {
        Swal.showValidationMessage('Email 不可為空');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput)) {
        Swal.showValidationMessage('請輸入有效的 Email');
        return false;
      }
      return emailInput;
    }
  });

  if (!email) return;

  try {
    // 顯示寄送中 loading
    Swal.fire({
      title: '寄送中...',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    });

    // 發送驗證碼
    await axios.post(`${API_BASE}/api/Auth/send-reset-code`, { email });

    // 關閉 loading
    Swal.close();

    // 顯示成功提示
    await Swal.fire({
      icon: 'success',
      title: '驗證碼已發送',
      text: '請檢查你的電子郵件',
      timer: 2000,
      showConfirmButton: false
    });

    // 輸入驗證碼與新密碼
    const { value: formValues } = await Swal.fire({
      title: '請輸入驗證碼與新密碼',
      html: `
        <div style="text-align: left; font-weight: 600; margin-bottom: 6px;">驗證碼</div>
        <input id="swal-input-code" class="swal2-input" placeholder="請輸入驗證碼">
        <div style="text-align: left; font-weight: 600; margin-top: 12px; margin-bottom: 6px;">新密碼</div>
        <input id="swal-input-password" type="password" class="swal2-input" placeholder="請輸入新密碼">
        <div style="text-align: left; font-weight: 600; margin-top: 12px; margin-bottom: 6px;">確認密碼</div>
        <input id="swal-input-confirm-password" type="password" class="swal2-input" placeholder="請再次輸入新密碼">
      `,
      showCancelButton: true,
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      focusConfirm: false,
      preConfirm: () => {
        const code = document.getElementById('swal-input-code').value;
        const password = document.getElementById('swal-input-password').value;
        const confirmPassword = document.getElementById('swal-input-confirm-password').value;

        if (!code) return Swal.showValidationMessage('請輸入驗證碼');
        if (!password) return Swal.showValidationMessage('請輸入新密碼');
        if (!confirmPassword) return Swal.showValidationMessage('請輸入確認密碼');
        if (password !== confirmPassword) return Swal.showValidationMessage('密碼與確認密碼不一致');

        return { code, password, confirmPassword };
      }
    });

    if (!formValues) return;

    // 發送重設密碼
    await axios.post(`${API_BASE}/api/Auth/reset-password`, {
      email,
      code: formValues.code,
      newPassword: formValues.password,
      confirmPassword: formValues.confirmPassword
    });

    await Swal.fire({
      icon: 'success',
      title: '成功',
      text: '密碼已更新成功，你現在可以用新密碼登入了',
      timer: 2500,
      showConfirmButton: false
    });

  } catch (error) {
    Swal.close(); // 若錯誤時還在 loading 狀態，確保關閉它
    const msg = error.response?.data?.message || error.message || '發生錯誤，請稍後再試';
    await Swal.fire({
      icon: 'error',
      title: '驗證寄送失敗', text: '請確認信箱是否正確或稍後再試',
      timer: 2500,
      showConfirmButton: false
    });
  }
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
/* 清除 Chrome / Edge autofill 背景 */
/* 初始（未 focus）保持米色背景 */
.input-field input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0px 1000px #fff9ed inset;
  -webkit-text-fill-color: #3d3b3b;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

/* 點擊後（focus）變成白色背景 */
.input-field input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px #ffffff inset;
  -webkit-text-fill-color: #3d3b3b;
  border-radius: 5px;
}

.container {
  position: relative;
    width: 800vw;
  max-width: 100%;
  
  height: 120vh;     /* 用視窗高度確保滿版 */
   overflow: hidden; 
     background-color: #efe9dd;
  box-sizing: border-box; /* 包含 padding 在內 */
}


.container::before {
  content: "";
  position: absolute;
  width: 1000px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(-45deg, #dcd6d0, #8d8d8d);
  top: 90%;
  right: 38%;
  transform: translateY(-50%);
  z-index: 5;
  transition: transform 1.2s ease-in-out 0s;
}
input {
  font-family: 'Poppins', sans-serif;
  
}
/* 表格容器 */

.forms-container {
  position: absolute; /* 需要配合 container 的 relative */
  top: 0; left: 0; right: 0; bottom: 0;  /* 佔滿 container */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  box-sizing: border-box;
}

.signin-signup {
  position: absolute;
  top: 50%;
  left: 75%;
  transform: translate(-50%, -50%);
  width: 50%;
  display: grid;
  grid-template-columns: 1fr;
  z-index: 5;
  transition: 1.2s ease-in-out;
}

form {

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 2rem;
    overflow: hidden;
    grid-column: 1/2;
    grid-row: 1/2;
    transition: transform 0.4s ease-out, opacity 0.4s ease-out;

}

form.signin-form {
  z-index: 2;
}



form.signup-form {
    padding-top: 220px;
     padding-bottom: 100px;
  z-index: 1;
  opacity: 0;
}

.title {
  font-size: 1.6rem;
  color: #3d3b3b;
  margin-bottom: 10px;
}

.input-field {
  max-width: 400px;
  width: 100%;
  height: 60px;
  background-color: #fff9ed;
  margin: 10px 0;
  border-radius: px;
  display: grid;
  grid-template-columns: 15% 85%;
  padding: 0.2rem;
}
.input-field:focus-within {
  border: 2px solid #6f89c1; /* 你可以換成你喜歡的顏色 */
  background-color: #ffffff; /* 讓背景變亮也可以 */
  box-shadow: 0 0 5px rgba(111, 137, 193, 0.5); /* 可選：加個陰影 */
  transition: border 0.3s, box-shadow 0.3s;
}
.input-field i {
  text-align: center;
  line-height: 50px;
  color: #acacac;
  font-size: 1.1rem;
}

.input-field input {
  background: none;
  outline: none;
  border: none;
  line-height: 1;
  font-weight: 600;
  font-size: 0.9rem;
}

.input-field input::placeholder {
  color: #aaa;
  font-weight: 500;
}

.btn {
  width: 150px;
  height: 40px;
  border: none;
  outline: none;
  border-radius: 30px;
  cursor: pointer;
  background-color: #fff9ed;
   color: #3d3b3b;
  text-transform: uppercase;
  font-weight: 500;
  margin: 10px 0;
  transition: 0.5s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* 忘記密碼 */
.forgot-password {
  font-size: 20px;
  text-align: right;
  width: 320px;
  margin-top: 4px;
  margin-bottom: 12px;
}

.forgot-password a {
  color: #6f89c1;
  text-decoration: underline;
  cursor: pointer;
}

.forgot-password a:hover {
  color: #fd4948;
}

/* Google登入 */
.signup-actions {
  display: flex;
  justify-content: left;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
  flex-wrap: wrap; /* 手機自動換行 */
   border-radius: 5px;
}


.btn.solid {
    background-color: #fff9ed;
    align-items: center;
  justify-content: center;
     width: 150px;
  height: 40px;
  border-radius: 30px;
  font-size:15px;
  font-weight: 500px;
    color: black;
}

.btn.solid:hover {
  border:solid 3px #6f89c1; 
  height: 43px;
  font-size:15px;
  font-weight: 500;
}



.google-login-btn:hover {
  background-color: #6f89c1; 
  box-shadow: 0 0 6px rgba(112, 23, 23, 0.1);
    width: 150px;
  height: 50px;
  border-radius: 30px
}


.google-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
   color: #3d3b3b;
  transition: background-color 0.3s, box-shadow 0.3s;
    width: 200px;
  height: 50px;
  border-radius: 30px
}

.google-login-btn:hover {
  background-color: #6f89c1; 
  box-shadow: 0 0 6px rgba(112, 23, 23, 0.1);
  color: white;
    width: 200px;
    height: 40px;
  border:solid 5px #6f89c1; 
  font-size:15px;
  font-weight: 500;
}


/* 驗證碼按鈕樣式 */
.verification-code-field {
  position: relative;
}

.send-code-btn {
  position: absolute;
  right:2%;
  top: 30%;
  transform: translateY(-50%);
  height: 30px;
  width: 90px;
  
  background-color: #fd4948;
  white-space: nowrap;
  font-size: 12px;
  border-radius: 30px;
}

.panels-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-around;
  text-align: center;
  z-index: 7;
  
}
.left-panel {
  padding: 3rem 17% 2rem 10%;
}

.right-panel {
  pointer-events: none;
  padding: 5rem 12% 2rem 10%;
}

.panel .content {
  color: #fff9ed;
  margin-top: 50px;
  margin-right:200px ;

}

.panel h3 {
    margin-top: 20px;
  font-weight: 600;
  line-height: 1;
  font-size: 1.5rem;
  color: #3d3b3b;
}

.panel p {
  font-size: 0.95rem;
  padding: 0.7rem 0;
  color: #3d3b3b;
}

.btn.transparent {
  margin: 0;
  background: none;
  border: 2px solid #3d3b3b;
  width: 130px;
  height: 41px;
  font-weight: 600;
  font-size: 0.8rem;
  color: #3d3b3b;
}

.image {
  width: 100%;
  /* padding-left: 200px; */
}

/* 預設左面板位置 */
.left-panel .content,
.left-panel .image {
  transform: translateX(0);
  transition: transform 1s ease-in-out 0.6s;
}

.right-panel .content,
.right-panel .image {
  transform: translateX(900px);
}

/* 動畫效果 */
.container.sign-up-mode::before {
  transform: translate(100%, -50%);
  right: 52%;
}

.container.sign-up-mode .left-panel .image,
.container.sign-up-mode .left-panel .content {
  transform: translateX(-800px);
  transition: transform 1.2s ease-in-out 0s;
}

.container.sign-up-mode .right-panel .content,
.container.sign-up-mode .right-panel .image {
  transform: translateX(0px);
  transition: transform 0.6s ease-in-out 0.2s;
}

.container.sign-up-mode .left-panel {
  pointer-events: none;
}

.container.sign-up-mode .right-panel {
  pointer-events: all;
}

.container.sign-up-mode .signin-signup {
  left: 25%;
}

.container.sign-up-mode form.signin-form {
  z-index: 1;
  opacity: 0;
}

.container.sign-up-mode form.signup-form {
  z-index: 2;
  opacity: 1;
}

</style>

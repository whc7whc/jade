<template>
  <main>
    <div class="container container-fluid">
      <div class="password-container">
        <div class="header-section">
          <h2><i class="fas fa-lock"></i> 設定新密碼</h2>
          <p class="security-notice">為了您的帳戶安全，請設定一個安全的新密碼</p>
        </div>

        <!-- 安全提示 -->
        <div class="security-tips">
          <h4><i class="fas fa-shield-alt"></i> 密碼安全建議</h4>
          <ul>
            <li>密碼長度至少 8 個字元</li>
            <li>包含大小寫字母、數字和特殊符號</li>
            <li>不使用個人資訊或常見密碼</li>
            <li>定期更換密碼，不重複使用舊密碼</li>
          </ul>
        </div>

        <!-- 設定密碼表單 -->
        <div class="password-form-section">
          <form @submit.prevent="handleChangePassword" class="password-form">

            <!-- 新密碼 -->
            <div class="form-field">
              <label>新密碼 <span class="required">*</span></label>
              <div class="password-input-wrapper">
                <input 
                  :type="showNewPassword ? 'text' : 'password'"
                  v-model="passwordForm.newPassword"
                  placeholder="請輸入新密碼"
                  :class="{ 'error': errors.newPassword }"
                  @input="validateNewPassword"
                  maxlength="128"
                />
                <button 
                  type="button" 
                  class="password-toggle"
                  @click="showNewPassword = !showNewPassword"
                >
                  <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>
              
              <!-- 密碼強度指示器 -->
              <div v-if="passwordForm.newPassword" class="password-strength">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :class="passwordStrength.level"
                    :style="{ width: passwordStrength.percentage + '%' }"
                  ></div>
                </div>
                <span class="strength-text" :class="passwordStrength.level">
                  {{ passwordStrength.text }}
                </span>
              </div>

              <!-- 密碼要求檢查 -->
              <div v-if="passwordForm.newPassword" class="password-requirements">
                <div 
                  v-for="requirement in passwordRequirements" 
                  :key="requirement.key"
                  class="requirement-item"
                  :class="{ 'met': requirement.met }"
                >
                  <i :class="requirement.met ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  <span>{{ requirement.text }}</span>
                </div>
              </div>
            </div>

            <!-- 確認新密碼 -->
            <div class="form-field">
              <label>確認新密碼 <span class="required">*</span></label>
              <div class="password-input-wrapper">
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="passwordForm.confirmPassword"
                  placeholder="請再次輸入新密碼"
                  :class="{ 'error': errors.confirmPassword }"
                  @input="validateConfirmPassword"
                  maxlength="128"
                />
                <button 
                  type="button" 
                  class="password-toggle"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
              
              <!-- 密碼匹配指示 -->
              <div v-if="passwordForm.confirmPassword" class="password-match">
                <div class="match-indicator" :class="{ 'match': passwordsMatch, 'no-match': !passwordsMatch }">
                  <i :class="passwordsMatch ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  <span>{{ passwordsMatch ? '密碼匹配' : '密碼不匹配' }}</span>
                </div>
              </div>
            </div>

            <!-- 驗證碼驗證（增強安全性） -->
            <div class="form-field verification-section">
              <label>安全驗證 <span class="required">*</span></label>
              <p class="verification-info">為確保帳戶安全，我們會發送驗證碼到您的註冊信箱</p>
              
              <div class="verification-input-wrapper">
                <input 
                  type="text" 
                  v-model="passwordForm.verificationCode"
                  placeholder="請輸入驗證碼"
                  :class="{ 'error': errors.verificationCode }"
                  maxlength="6"
                  @input="clearError('verificationCode')"
                />
                <button 
                  type="button" 
                  class="send-verification-btn"
                  @click="sendVerificationCode"
                  :disabled="!canSendCode || verificationCountdown > 0"
                  :class="{ 'sent': codeSent }"
                >
                  {{ getVerificationButtonText }}
                </button>
              </div>
              <span v-if="errors.verificationCode" class="error-message">{{ errors.verificationCode }}</span>
            </div>

            <!-- 錯誤嘗試警告 -->
            <div v-if="failedAttempts > 0" class="security-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <span>已嘗試 {{ failedAttempts }} 次失敗，剩餘 {{ maxAttempts - failedAttempts }} 次機會</span>
              <span v-if="isLocked" class="lock-info">
                帳戶已被暫時鎖定，請於 {{ Math.ceil(lockTimeRemaining / 60) }} 分鐘後再試
              </span>
            </div>

            <!-- 提交按鈕 -->
            <div class="form-actions">
              <button 
                type="submit" 
                class="change-password-btn"
                :disabled="!canSubmit || isSubmitting || isLocked"
              >
                {{ isSubmitting ? '設定中...' : '設定新密碼' }}
              </button>
              <button type="button" class="cancel-btn" @click="resetForm">
                重置表單
              </button>
            </div>

            <!-- 最後更改時間 -->
            <div v-if="lastPasswordChange" class="last-change-info">
              <i class="fas fa-info-circle"></i>
              <span>上次密碼更改時間：{{ formatDate(lastPasswordChange) }}</span>
            </div>

          </form>
        </div>

        <!-- 成功提示 -->
        <div v-if="showSuccessMessage" class="success-overlay" @click="showSuccessMessage = false">
          <div class="success-modal">
            <i class="fas fa-check-circle success-icon"></i>
            <h3>密碼設定成功</h3>
            <p>您的新密碼已成功設定，請妥善保管新密碼</p>
            <button @click="showSuccessMessage = false" class="success-close-btn">確定</button>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'ChangePassword',
  data() {
    return {
      passwordForm: {
        newPassword: '',
        confirmPassword: '',
        verificationCode: ''
      },
      errors: {},
      showNewPassword: false,
      showConfirmPassword: false,
      isSubmitting: false,
      showSuccessMessage: false,
      
      // 驗證碼相關
      codeSent: false,
      verificationCountdown: 0,
      verificationTimer: null,
      
      // 安全機制相關
      failedAttempts: 0,
      maxAttempts: 5,
      isLocked: false,
      lockTimeRemaining: 0,
      lockTimer: null,
      
      // 其他
      lastPasswordChange: null,
      memberId: '',
      API_BASE: 'https://localhost:7106',
      
      // 常見弱密碼列表（實際應用中應該更完整）
      commonPasswords: [
        'password', '123456', '123456789', 'qwerty', 'abc123', 
        'password123', '111111', '123123', 'admin', 'letmein',
        '000000', 'qwerty123', 'welcome', 'monkey', 'dragon'
      ]
    };
  },
  
  computed: {
    // 密碼強度計算
    passwordStrength() {
      const password = this.passwordForm.newPassword;
      if (!password) return { level: '', percentage: 0, text: '' };
      
      let score = 0;
      let feedback = [];
      
      // 長度檢查
      if (password.length >= 8) score += 20;
      if (password.length >= 12) score += 10;
      
      // 複雜度檢查
      if (/[a-z]/.test(password)) score += 15;
      if (/[A-Z]/.test(password)) score += 15;
      if (/\d/.test(password)) score += 15;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
      
      // 不是常見密碼
      if (!this.isCommonPassword(password)) score += 5;
      
      // 不包含個人資訊（簡化版本）
      if (!this.containsPersonalInfo(password)) score += 10;
      
      let level, text;
      if (score < 40) {
        level = 'weak';
        text = '弱';
      } else if (score < 70) {
        level = 'medium';
        text = '中等';
      } else if (score < 85) {
        level = 'strong';
        text = '強';
      } else {
        level = 'very-strong';
        text = '非常強';
      }
      
      return { level, percentage: Math.min(score, 100), text };
    },
    
    // 密碼要求檢查
    passwordRequirements() {
      const password = this.passwordForm.newPassword;
      return [
        {
          key: 'length',
          text: '至少 8 個字元',
          met: password.length >= 8
        },
        {
          key: 'uppercase',
          text: '包含大寫字母',
          met: /[A-Z]/.test(password)
        },
        {
          key: 'lowercase',
          text: '包含小寫字母',
          met: /[a-z]/.test(password)
        },
        {
          key: 'number',
          text: '包含數字',
          met: /\d/.test(password)
        },
        {
          key: 'special',
          text: '包含特殊符號',
          met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        },
        {
          key: 'notCommon',
          text: '非常見密碼',
          met: !this.isCommonPassword(password)
        }
      ];
    },
    
    // 密碼是否匹配
    passwordsMatch() {
      return this.passwordForm.newPassword && 
             this.passwordForm.confirmPassword && 
             this.passwordForm.newPassword === this.passwordForm.confirmPassword;
    },
    
    // 是否可以發送驗證碼
    canSendCode() {
      return this.passwordForm.newPassword && 
             this.passwordsMatch && 
             this.passwordStrength.level !== 'weak' &&
             !this.isLocked;
    },
    
    // 驗證按鈕文字
    getVerificationButtonText() {
      if (this.verificationCountdown > 0) {
        return `${this.verificationCountdown}秒後重發`;
      }
      return this.codeSent ? '重新發送' : '發送驗證碼';
    },
    
    // 是否可以提交
    canSubmit() {
      return this.passwordForm.newPassword &&
             this.passwordForm.confirmPassword &&
             this.passwordForm.verificationCode &&
             this.passwordsMatch &&
             this.passwordStrength.level !== 'weak' &&
             this.passwordRequirements.every(req => req.met) &&
             !this.isLocked;
    }
  },
  
  mounted() {
    const memberId = localStorage.getItem('memberId');
    if (memberId) {
      this.memberId = memberId;
      this.fetchLastPasswordChange();
      this.checkLockStatus();
    } else {
      Swal.fire('請先登入', '找不到會員資料', 'warning');
    }
  },
  
  beforeUnmount() {
    if (this.verificationTimer) clearInterval(this.verificationTimer);
    if (this.lockTimer) clearInterval(this.lockTimer);
  },
  
  methods: {
    // 檢查是否為常見密碼
    isCommonPassword(password) {
      return this.commonPasswords.includes(password.toLowerCase());
    },
    
    // 檢查是否包含個人資訊（簡化版本）
    containsPersonalInfo(password) {
      const lowerPassword = password.toLowerCase();
      // 這裡可以加入更多個人資訊檢查，如生日、姓名等
      return lowerPassword.includes('user') || 
             lowerPassword.includes('admin') ||
             lowerPassword.includes('test');
    },
    
    // 清除特定錯誤
    clearError(field) {
      if (this.errors[field]) {
        delete this.errors[field];
      }
    },
    
    // 驗證新密碼
    validateNewPassword() {
      this.clearError('newPassword');
      const password = this.passwordForm.newPassword;
      
      if (!password) return;
      
      if (this.passwordStrength.level === 'weak') {
        this.errors.newPassword = '密碼強度太弱，請選擇更安全的密碼';
      }
    },
    
    // 驗證確認密碼
    validateConfirmPassword() {
      this.clearError('confirmPassword');
      if (this.passwordForm.confirmPassword && !this.passwordsMatch) {
        this.errors.confirmPassword = '密碼不匹配';
      }
    },
    
    // 表單驗證
    validateForm() {
      this.errors = {};
      
      if (!this.passwordForm.newPassword) {
        this.errors.newPassword = '請輸入新密碼';
      } else if (this.passwordStrength.level === 'weak') {
        this.errors.newPassword = '密碼強度太弱';
      }
      
      if (!this.passwordForm.confirmPassword) {
        this.errors.confirmPassword = '請確認新密碼';
      } else if (!this.passwordsMatch) {
        this.errors.confirmPassword = '密碼不匹配';
      }
      
      if (!this.passwordForm.verificationCode) {
        this.errors.verificationCode = '請輸入驗證碼';
      } else if (!/^\d{6}$/.test(this.passwordForm.verificationCode)) {
        this.errors.verificationCode = '驗證碼格式錯誤';
      }
      
      return Object.keys(this.errors).length === 0;
    },
    
    // 發送驗證碼
    async sendVerificationCode() {
      if (!this.canSendCode) return;

      try {
        await axios.post(`${this.API_BASE}/api/Auth/send-password-change-code`, {
          memberId: this.memberId
        });

        this.codeSent = true;
        this.startVerificationCountdown();

        Swal.fire({
          icon: 'success',
          title: '驗證碼已發送',
          text: '請查收您的電子郵件',
          timer: 2000,
          showConfirmButton: false
        });

      } catch (error) {
        console.error('發送驗證碼失敗', error);
        Swal.fire('發送失敗', '無法發送驗證碼，請稍後再試', 'error');
      }
    },
    
    // 開始驗證碼倒數
    startVerificationCountdown() {
      this.verificationCountdown = 60;
      this.verificationTimer = setInterval(() => {
        this.verificationCountdown--;
        if (this.verificationCountdown <= 0) {
          clearInterval(this.verificationTimer);
        }
      }, 1000);
    },
    
    // 處理密碼更改
    async handleChangePassword() {
      if (!this.validateForm() || this.isSubmitting || this.isLocked) return;
      
      this.isSubmitting = true;
      
      try {
        await axios.post(`${this.API_BASE}/api/Auth/set-new-password`, {
          memberId: this.memberId,
          newPassword: this.passwordForm.newPassword,
          confirmPassword: this.passwordForm.confirmPassword,
          verificationCode: this.passwordForm.verificationCode
        });
        
        // 重置失敗次數
        this.failedAttempts = 0;
        localStorage.removeItem('passwordChangeAttempts');
        localStorage.removeItem('passwordChangeLockTime');
        
        this.showSuccessMessage = true;
        this.resetForm();
        
      } catch (error) {
        this.handlePasswordChangeError(error);
      } finally {
        this.isSubmitting = false;
      }
    },
    
    // 處理密碼更改錯誤
    handlePasswordChangeError(error) {
      this.failedAttempts++;
      localStorage.setItem('passwordChangeAttempts', this.failedAttempts.toString());
      
      let errorMessage = '密碼設定失敗';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = '請檢查輸入的資料是否正確';
      } else if (error.response?.status === 403) {
        errorMessage = '驗證碼錯誤或已過期';
      }
      
      // 達到最大嘗試次數，鎖定帳戶
      if (this.failedAttempts >= this.maxAttempts) {
        this.lockAccount();
        errorMessage += '，帳戶已被暫時鎖定';
      }
      
      Swal.fire('設定失敗', errorMessage, 'error');
    },
    
    // 鎖定帳戶
    lockAccount() {
      this.isLocked = true;
      this.lockTimeRemaining = 15 * 60; // 15分鐘
      
      const lockEndTime = Date.now() + this.lockTimeRemaining * 1000;
      localStorage.setItem('passwordChangeLockTime', lockEndTime.toString());
      
      this.lockTimer = setInterval(() => {
        this.lockTimeRemaining--;
        if (this.lockTimeRemaining <= 0) {
          this.unlockAccount();
        }
      }, 1000);
    },
    
    // 解鎖帳戶
    unlockAccount() {
      this.isLocked = false;
      this.lockTimeRemaining = 0;
      this.failedAttempts = 0;
      
      localStorage.removeItem('passwordChangeAttempts');
      localStorage.removeItem('passwordChangeLockTime');
      
      if (this.lockTimer) {
        clearInterval(this.lockTimer);
        this.lockTimer = null;
      }
    },
    
    // 檢查鎖定狀態
    checkLockStatus() {
      const attempts = parseInt(localStorage.getItem('passwordChangeAttempts') || '0');
      const lockEndTime = parseInt(localStorage.getItem('passwordChangeLockTime') || '0');
      
      this.failedAttempts = attempts;
      
      if (lockEndTime && Date.now() < lockEndTime) {
        this.isLocked = true;
        this.lockTimeRemaining = Math.ceil((lockEndTime - Date.now()) / 1000);
        
        this.lockTimer = setInterval(() => {
          this.lockTimeRemaining--;
          if (this.lockTimeRemaining <= 0) {
            this.unlockAccount();
          }
        }, 1000);
      }
    },
    
    // 獲取最後密碼更改時間
    async fetchLastPasswordChange() {
      try {
        const response = await axios.get(`${this.API_BASE}/api/Auth/${this.memberId}/password-info`);
        this.lastPasswordChange = response.data.lastPasswordChange;
      } catch (error) {
        console.error('無法獲取密碼資訊', error);
      }
    },
    
    // 重置表單
    resetForm() {
      this.passwordForm = {
        newPassword: '',
        confirmPassword: '',
        verificationCode: ''
      };
      this.errors = {};
      this.showNewPassword = false;
      this.showConfirmPassword = false;
      this.codeSent = false;
      this.verificationCountdown = 0;
      
      if (this.verificationTimer) {
        clearInterval(this.verificationTimer);
        this.verificationTimer = null;
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-TW');
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 40px;
}

.password-container {
  background-color: #fff9ed;
  border-radius: 12px;
  padding: 40px 50px;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 6px 12px rgba(105, 134, 94, 0.5);
}

/* 頁面標題區域 */
.header-section {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.header-section h2 {
  color: #2e4e34;
  font-size: 2rem;
  margin: 0 0 10px 0;
}

.header-section h2 i {
  margin-right: 10px;
}

.security-notice {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

/* 安全提示 */
.security-tips {
  background-color: #f8f9fa;
  border-left: 4px solid #4CAF50;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 4px;
}

.security-tips h4 {
  color: #2e4e34;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
}

.security-tips h4 i {
  margin-right: 8px;
  color: #4CAF50;
}

.security-tips ul {
  margin: 0;
  padding-left: 20px;
}

.security-tips li {
  color: #555;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

/* 表單樣式 */
.password-form-section {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-field {
  margin-bottom: 25px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 1rem;
}

.required {
  color: #f44336;
}

/* 密碼輸入框樣式 */
.password-input-wrapper {
  position: relative;
}

.password-input-wrapper input {
  width: 100%;
  padding: 12px 45px 12px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.password-input-wrapper input:focus {
  outline: none;
  border-color: #2196F3;
}

.password-input-wrapper input.error {
  border-color: #f44336;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 1.1rem;
  padding: 5px;
}

.password-toggle:hover {
  color: #333;
}

/* 密碼強度指示器 */
.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
  border-radius: 3px;
}

.strength-fill.weak {
  background-color: #f44336;
}

.strength-fill.medium {
  background-color: #ff9800;
}

.strength-fill.strong {
  background-color: #2196F3;
}

.strength-fill.very-strong {
  background-color: #4CAF50;
}

.strength-text {
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 60px;
}

.strength-text.weak {
  color: #f44336;
}

.strength-text.medium {
  color: #ff9800;
}

.strength-text.strong {
  color: #2196F3;
}

.strength-text.very-strong {
  color: #4CAF50;
}

/* 密碼要求檢查 */
.password-requirements {
  margin-top: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #666;
  transition: color 0.3s;
}

.requirement-item.met {
  color: #4CAF50;
}

.requirement-item i {
  font-size: 1rem;
  color: #ccc;
  transition: color 0.3s;
}

.requirement-item.met i {
  color: #4CAF50;
}

/* 密碼匹配指示 */
.password-match {
  margin-top: 8px;
}

.match-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.match-indicator.match {
  background-color: #e8f5e8;
  color: #4CAF50;
  border: 1px solid #c8e6c9;
}

.match-indicator.no-match {
  background-color: #ffebee;
  color: #f44336;
  border: 1px solid #ffcdd2;
}

.match-indicator i {
  font-size: 1rem;
}

/* 驗證區域 */
.verification-section {
  background-color: #f0f8ff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #b3d9ff;
}

.verification-info {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 15px 0;
}

.verification-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.verification-input-wrapper input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.verification-input-wrapper input:focus {
  outline: none;
  border-color: #2196F3;
}

.verification-input-wrapper input.error {
  border-color: #f44336;
}

.send-verification-btn {
  padding: 12px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s;
  min-width: 120px;
}

.send-verification-btn:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-1px);
}

.send-verification-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.send-verification-btn.sent {
  background-color: #2196F3;
}

/* 錯誤訊息 */
.error-message {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 5px;
  display: block;
}

/* 安全警告 */
.security-warning {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 15px;
  margin: 15px 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #856404;
}

.security-warning i {
  color: #ff9800;
  font-size: 1.1rem;
  margin-top: 2px;
}

.lock-info {
  display: block;
  margin-top: 5px;
  font-weight: 600;
}

/* 表單操作按鈕 */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  justify-content: center;
}

.change-password-btn {
  background-color: #2e4e34;
  color: white;
  padding: 14px 30px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;
}

.change-password-btn:hover:not(:disabled) {
  background-color: #1a2e20;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(46, 78, 52, 0.3);
}

.change-password-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  padding: 14px 30px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;
}

.cancel-btn:hover {
  background-color: #545b62;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

/* 最後更改資訊 */
.last-change-info {
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  background-color: #e7f3ff;
  border-radius: 6px;
  color: #666;
  font-size: 0.9rem;
  border: 1px solid #bee5eb;
}

.last-change-info i {
  color: #2196F3;
  margin-right: 8px;
}

/* 成功提示覆蓋層 */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.success-modal {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-icon {
  font-size: 3rem;
  color: #4CAF50;
  margin-bottom: 20px;
}

.success-modal h3 {
  color: #2e4e34;
  margin: 0 0 15px 0;
  font-size: 1.5rem;
}

.success-modal p {
  color: #666;
  margin: 0 0 25px 0;
  font-size: 1rem;
  line-height: 1.5;
}

.success-close-btn {
  background-color: #4CAF50;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 100px;
}

.success-close-btn:hover {
  background-color: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .password-container {
    margin: 20px;
    padding: 30px 25px;
    max-width: none;
  }
  
  .header-section h2 {
    font-size: 1.5rem;
  }
  
  .verification-input-wrapper {
    flex-direction: column;
  }
  
  .send-verification-btn {
    width: 100%;
    min-width: unset;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .change-password-btn,
  .cancel-btn {
    width: 100%;
    min-width: unset;
  }
  
  .success-modal {
    margin: 20px;
    padding: 30px 20px;
  }
}

@media (max-width: 480px) {
  .password-container {
    margin: 10px;
    padding: 20px 15px;
  }
  
  .header-section h2 {
    font-size: 1.3rem;
  }
  
  .security-tips,
  .password-form-section {
    padding: 20px 15px;
  }
}

</style>
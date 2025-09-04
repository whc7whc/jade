<template>
  <div class="checkout-progress" v-if="showProgress">
    <div class="container">
      <div class="progress-steps">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-item"
          :class="{ 
            'active': currentStep === index + 1, 
            'completed': currentStep > index + 1,
            'disabled': currentStep < index + 1
          }"
        >
          <div class="step-circle">
            <i v-if="currentStep > index + 1" class="fas fa-check"></i>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="step-label">{{ step.label }}</div>
          
          <!-- 連接線 -->
          <div 
            v-if="index < steps.length - 1" 
            class="step-connector"
            :class="{ 'completed': currentStep > index + 1 }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userIdentityService from '@/services/userIdentityService'

export default {
  name: 'CheckoutProgress',
  props: {
    currentStep: {
      type: Number,
      default: 1
    },
    forceShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      steps: [
        { label: '收貨資訊', route: '/checkout' },
        { label: '付款方式', route: '/checkout/payment' },
        { label: '完成訂單', route: '/checkout/complete' }
      ]
    }
  },
  computed: {
    showProgress() {
      // 如果強制顯示，直接返回 true
      if (this.forceShow) return true
      
      // 檢查登入狀態
      return this.checkLoginStatus()
    }
  },
  methods: {
    checkLoginStatus() {
      // 使用與購物車相同的登入檢查邏輯
      const token = localStorage.getItem('authToken') ||
                   localStorage.getItem('auth_token') ||
                   localStorage.getItem('token')
      const currentUser = localStorage.getItem('currentUser')
      const memberId = localStorage.getItem('memberId')
      
      // 與購物車相容的登入檢查：只要有 memberId 就視為已登入
      const hasStandardAuth = !!(token && currentUser)
      const hasMemberAuth = !!(memberId && memberId !== 'null' && memberId !== '' && memberId !== 'undefined')
      
      const isLoggedIn = hasStandardAuth || hasMemberAuth || !!memberId
      
      console.log('CheckoutProgress: 登入狀態檢查', {
        isLoggedIn,
        memberId,
        token: !!token,
        currentUser: !!currentUser
      })
      
      return isLoggedIn
    }
  }
}
</script>

<style scoped>
.checkout-progress {
  padding: 2rem 0;
  margin-bottom: 1rem;
  /* 移除背景，直接融入頁面背景 */
}

.progress-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  animation: fadeInUp 0.6s ease-out forwards;
}

.step-item:nth-child(1) { animation-delay: 0.1s; }
.step-item:nth-child(2) { animation-delay: 0.2s; }
.step-item:nth-child(3) { animation-delay: 0.3s; }
.step-item:nth-child(4) { animation-delay: 0.4s; }

.step-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid #e9ecef;
  background: #ffffff;
  color: #adb5bd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 3;
}

.step-label {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: #6c757d;
  transition: all 0.3s ease;
  line-height: 1.3;
}

.step-connector {
  position: absolute;
  top: 25px;
  left: 50%;
  right: -50%;
  height: 3px;
  background: #e9ecef;
  z-index: 1;
  transition: all 0.5s ease;
}

/* 當前步驟樣式 */
.step-item.active .step-circle {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-color: #007bff;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  transform: scale(1.1);
}

.step-item.active .step-label {
  color: #007bff;
  font-weight: 700;
}

/* 已完成步驟樣式 */
.step-item.completed .step-circle {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-color: #28a745;
  color: white;
}

.step-item.completed .step-circle i {
  font-size: 18px;
  animation: checkmark 0.6s ease-in-out;
}

.step-item.completed .step-label {
  color: #28a745;
}

.step-connector.completed {
  background: #28a745;
}

/* 未啟用步驟樣式 */
.step-item.disabled .step-circle {
  background: #f8f9fa;
  border-color: #e9ecef;
  color: #ced4da;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.step-item.disabled .step-label {
  color: #ced4da;
}

/* 動畫效果 */
@keyframes checkmark {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
  100% {
    transform: scale(1);
    opacity: 0.2;
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .checkout-progress {
    padding: 1.5rem 0;
  }
  
  .progress-steps {
    max-width: 100%;
    padding: 0 1rem;
  }
  
  .step-circle {
    width: 45px;
    height: 45px;
    font-size: 14px;
  }
  
  .step-label {
    font-size: 13px;
  }
  
  .step-connector {
    top: 22px;
  }
  
  .step-item.active .step-circle {
    transform: scale(1.05);
  }
}

@media (max-width: 480px) {
  .progress-steps {
    padding: 0 0.5rem;
  }
  
  .step-circle {
    width: 40px;
    height: 40px;
    font-size: 12px;
  }
  
  .step-label {
    font-size: 12px;
    line-height: 1.2;
  }
  
  .step-connector {
    top: 20px;
    height: 2px;
  }
}
</style>

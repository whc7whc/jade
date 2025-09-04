<template>
  <div class="return-exchange-page">
    <div class="container py-5">
      <!-- Header Section -->
      <div class="page-header text-center mb-5">
        <h1 class="page-title">退換貨流程說明</h1>
        <p class="page-subtitle">為您提供簡單、透明的退換貨服務</p>
      </div>

      <!-- Quick Info Cards -->
      <div class="row mb-5">
        <div class="col-md-4 mb-3">
          <div class="info-card text-center">
            <div class="info-icon">
              <i class="fas fa-clock"></i>
            </div>
            <h4>7天鑑賞期</h4>
            <p>商品到貨後7天內可申請退換貨</p>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="info-card text-center">
            <div class="info-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <h4>品質保障</h4>
            <p>商品瑕疵或與描述不符，免費退換貨</p>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="info-card text-center">
            <div class="info-icon">
              <i class="fas fa-shipping-fast"></i>
            </div>
            <h4>快速處理</h4>
            <p>3-5個工作天內完成退款程序</p>
          </div>
        </div>
      </div>

      <!-- Return vs Exchange Tabs -->
      <div class="process-tabs mb-5">
        <ul class="nav nav-pills justify-content-center mb-4">
          <li class="nav-item">
            <button 
              class="nav-link"
              :class="{ active: activeTab === 'return' }"
              @click="activeTab = 'return'"
            >
              <i class="fas fa-undo-alt me-2"></i>退貨流程
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link"
              :class="{ active: activeTab === 'exchange' }"
              @click="activeTab = 'exchange'"
            >
              <i class="fas fa-exchange-alt me-2"></i>換貨流程
            </button>
          </li>
        </ul>

        <!-- Return Process -->
        <div v-if="activeTab === 'return'" class="process-content">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <div class="process-timeline">
                <div v-for="(step, index) in returnSteps" :key="index" class="process-step">
                  <div class="step-number">{{ index + 1 }}</div>
                  <div class="step-content">
                    <h5>{{ step.title }}</h5>
                    <p>{{ step.description }}</p>
                    <div v-if="step.note" class="step-note">
                      <i class="fas fa-info-circle"></i>
                      {{ step.note }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Exchange Process -->
        <div v-if="activeTab === 'exchange'" class="process-content">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <div class="process-timeline">
                <div v-for="(step, index) in exchangeSteps" :key="index" class="process-step">
                  <div class="step-number">{{ index + 1 }}</div>
                  <div class="step-content">
                    <h5>{{ step.title }}</h5>
                    <p>{{ step.description }}</p>
                    <div v-if="step.note" class="step-note">
                      <i class="fas fa-info-circle"></i>
                      {{ step.note }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Return Conditions -->
      <div class="conditions-section mb-5">
        <h2 class="section-title text-center mb-4">退換貨條件</h2>
        <div class="row">
          <div class="col-lg-6 mb-4">
            <div class="condition-card can-return">
              <h4>
                <i class="fas fa-check-circle text-success me-2"></i>
                可退換貨情況
              </h4>
              <ul>
                <li>商品有瑕疵或損壞</li>
                <li>商品與網站描述不符</li>
                <li>尺寸不合適（未穿著使用）</li>
                <li>商品寄錯或漏寄</li>
                <li>在7天鑑賞期內且商品完整</li>
              </ul>
            </div>
          </div>
          <div class="col-lg-6 mb-4">
            <div class="condition-card cannot-return">
              <h4>
                <i class="fas fa-times-circle text-danger me-2"></i>
                不可退換貨情況
              </h4>
              <ul>
                <li>個人衛生用品（內衣褲、襪類）</li>
                <li>已穿著或清洗過的商品</li>
                <li>客製化或個人訂製商品</li>
                <li>商品吊牌或包裝已損壞</li>
                <li>超過7天退換貨期限</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Refund Information -->
      <div class="refund-section mb-5">
        <h2 class="section-title text-center mb-4">退款資訊</h2>
        <div class="row">
          <div class="col-lg-4 mb-4">
            <div class="refund-card">
              <div class="refund-icon">
                <i class="fas fa-credit-card"></i>
              </div>
              <h5>信用卡退款</h5>
              <p>3-5個工作天退刷至原信用卡</p>
            </div>
          </div>
          <div class="col-lg-4 mb-4">
            <div class="refund-card">
              <div class="refund-icon">
                <i class="fas fa-university"></i>
              </div>
              <h5>ATM轉帳退款</h5>
              <p>5-7個工作天匯入指定帳戶</p>
            </div>
          </div>
          <div class="col-lg-4 mb-4">
            <div class="refund-card">
              <div class="refund-icon">
                <i class="fas fa-coins"></i>
              </div>
              <h5>J幣退款</h5>
              <p>使用J幣付款部分退回J幣</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="faq-section mb-5">
        <h2 class="section-title text-center mb-4">常見問題</h2>
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="accordion" id="faqAccordion">
              <div v-for="(faq, index) in faqs" :key="index" class="accordion-item">
                <h3 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    @click="toggleFaq(index)"
                    :class="{ collapsed: !faq.isOpen }"
                  >
                    {{ faq.question }}
                  </button>
                </h3>
                <div
                  class="accordion-collapse collapse"
                  :class="{ show: faq.isOpen }"
                >
                  <div class="accordion-body">
                    {{ faq.answer }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="contact-section">
        <div class="contact-card text-center">
          <h3>需要協助嗎？</h3>
          <p class="mb-4">如有任何退換貨問題，請聯絡我們的客服團隊</p>
          <div class="contact-buttons">
            <button class="btn me-3" @click="openChat">
              <i class="fas fa-comment me-2"></i>線上客服
            </button>
            <a href="mailto:service@jade.com.tw" class="btn me-3">
              <i class="fas fa-envelope me-2"></i>發送郵件
            </a>
            <a href="tel:02-1234-5678" class="btn ">
              <i class="fas fa-phone me-2"></i>電話客服
            </a>
          </div>
          <div class="service-hours mt-3">
            <small class="text-muted">客服時間：週一至週五 09:00-18:00</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReturnExchangeView',
  data() {
    return {
      activeTab: 'return',
      returnSteps: [
        {
          title: '登入會員中心',
          description: '進入「我的訂單」找到需要退貨的訂單，點選「申請退貨」',
          note: '請確認在7天鑑賞期內申請'
        },
        {
          title: '填寫退貨申請',
          description: '選擇退貨原因、填寫詳細說明，並上傳相關照片（如有瑕疵）'
        },
        {
          title: '等待審核通過',
          description: '客服將在24小時內審核您的申請，並以email通知審核結果'
        },
        {
          title: '寄回商品',
          description: '收到退貨同意通知後，請將商品完整包裝寄回指定地址',
          note: '退貨運費由買家負擔（商品瑕疵除外）'
        },
        {
          title: '確認收貨檢驗',
          description: '我們收到退貨商品後，將進行檢驗確認商品狀態'
        },
        {
          title: '完成退款',
          description: '檢驗無誤後，將在3-5個工作天內完成退款程序'
        }
      ],
      exchangeSteps: [
        {
          title: '登入會員中心',
          description: '進入「我的訂單」找到需要換貨的訂單，點選「申請換貨」',
          note: '請確認在7天鑑賞期內申請'
        },
        {
          title: '選擇換貨商品',
          description: '選擇要換的尺寸或顏色，確認庫存充足且價差計算'
        },
        {
          title: '填寫換貨申請',
          description: '填寫換貨原因和詳細說明，確認換貨商品資訊'
        },
        {
          title: '等待審核通過',
          description: '客服將在24小時內審核您的申請，並確認換貨商品庫存'
        },
        {
          title: '寄回原商品',
          description: '收到換貨同意通知後，請將原商品完整包裝寄回',
          note: '換貨運費由買家負擔（商品瑕疵除外）'
        },
        {
          title: '處理價差付款',
          description: '如有價差，需補足差額；如換貨商品較便宜，將退還差額'
        },
        {
          title: '寄出新商品',
          description: '確認收到原商品且檢驗無誤後，將寄出新的換貨商品'
        }
      ],
      faqs: [
        {
          question: '退換貨需要付運費嗎？',
          answer: '如果是商品瑕疵或寄錯商品，運費由我們承擔。如果是個人因素（如尺寸不合），退換貨運費需由買家負擔。',
          isOpen: false
        },
        {
          question: '可以只退部分商品嗎？',
          answer: '可以的，您可以選擇退回部分商品。但如果該訂單有使用優惠券或滿額優惠，可能會影響優惠資格。',
          isOpen: false
        },
        {
          question: '退款何時會到帳？',
          answer: '信用卡退款約3-5個工作天，ATM轉帳退款約5-7個工作天。實際到帳時間依各銀行作業時間而定。',
          isOpen: false
        },
        {
          question: '商品吊牌掉了還能退換貨嗎？',
          answer: '商品吊牌是重要的識別標記，如果吊牌遺失或損壞，可能會影響退換貨申請。建議保留完整包裝和吊牌。',
          isOpen: false
        },
        {
          question: '可以到實體店面退換貨嗎？',
          answer: '目前僅提供線上退換貨服務，請依照網站流程申請。未來如有實體店面將另行公告相關服務。',
          isOpen: false
        }
      ]
    }
  },
  mounted() {
    // 監聽AI客服相關事件
    this.setupChatIntegration()
  },
  methods: {
    setupChatIntegration() {
      // 設定AI客服整合
      setTimeout(() => {
        // 檢查是否有AI客服元素存在
        const chatElements = document.querySelectorAll('.ai-chat-widget, .floating-chat, .chat-container, .chat-widget')
        if (chatElements.length > 0) {
          console.log('✅ 檢測到AI客服元件')
          // 可以在這裡添加額外的整合邏輯
        }
      }, 1000)
    },
    toggleFaq(index) {
      this.faqs[index].isOpen = !this.faqs[index].isOpen
    },
    openChat() {
      // 觸發懸浮AI客服 - 直接控制 App.vue 中的 AI 助理
      try {
        // 方法1: 直接操作 App 組件的 showAIAssistant 屬性
        const app = this.$root.$children ? this.$root.$children[0] : this.$root;
        if (app && app.toggleAIAssistant) {
          app.toggleAIAssistant();
          return;
        }
        
        // 方法2: 直接設置 $root 的 showAIAssistant
        if (this.$root.showAIAssistant !== undefined) {
          this.$root.showAIAssistant = true;
          return;
        }
        
        // 方法3: 點擊 AI 助理按鈕
        const aiButton = document.querySelector('.ai-assistant-btn');
        if (aiButton) {
          aiButton.click();
          return;
        }
        
        // 方法4: 嘗試通過 Vue 實例找到 App 組件
        let current = this.$parent;
        while (current) {
          if (current.toggleAIAssistant) {
            current.toggleAIAssistant();
            return;
          }
          current = current.$parent;
        }
        
        console.log('無法找到 AI 助理控制方法');
      } catch (error) {
        console.error('開啟 AI 客服時發生錯誤:', error);
        // 備用方案：顯示提示訊息
        alert('客服功能即將開啟，請稍候！');
      }
    }
  }
}
</script>

<style scoped>
.return-exchange-page {
  padding-top: 50px;
  min-height: calc(100vh - 90px);
  background-color: #f8f9fa;
}

.page-header {
  background: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.info-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  height: 100%;
  transition: transform 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
}

.info-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #022c5c);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.info-icon i {
  font-size: 2rem;
  color: white;
}

.info-card h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.process-tabs {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-pills .nav-link {
  background: #f8f9fa;
  color: #666;
  border-radius: 25px;
  padding: 0.75rem 2rem;
  margin: 0 0.5rem;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
}

.nav-pills .nav-link:hover {
  background: #e9ecef;
  color: #495057;
}

.nav-pills .nav-link.active {
  background: linear-gradient(135deg, #df9dac);
  color: white;
}

.process-timeline {
  position: relative;
}

.process-step {
  display: flex;
  margin-bottom: 3rem;
  position: relative;
}

.process-step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 25px;
  top: 50px;
  width: 2px;
  height: calc(100% + 1rem);
  background: linear-gradient(to bottom, #df9dac, #e9ecef);
}

.step-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #df9dac 10%, #faf6eb 90%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  margin-right: 2rem;
  flex-shrink: 0;
}

.step-content h5 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.step-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.step-note {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
}

.condition-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  height: 100%;
}

.condition-card h4 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.condition-card ul {
  list-style: none;
  padding: 0;
}

.condition-card li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  color: #555;
}

.condition-card li:last-child {
  border-bottom: none;
}

.can-return {
  border-left: 4px solid #28a745;
}

.cannot-return {
  border-left: 4px solid #dc3545;
}

.refund-section {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.refund-card {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  background: #f8f9fa;
  height: 100%;
  transition: transform 0.3s ease;
}

.refund-card:hover {
  transform: translateY(-3px);
  background: white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.refund-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #E5D2D2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.refund-icon i {
  font-size: 1.5rem;
  color: white;
}

.refund-card h5 {
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.faq-section {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.accordion-button {
  font-weight: 600;
  color: #333;
}

.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
  color: #667eea;
  border-color: #e9ecef;
}

.contact-section {
  background: linear-gradient(135deg, #e4dcd1);
  border-radius: 12px;
  padding: 0;
}

.contact-card {
  background: rgba(255,255,255,0.95);
  border-radius: 12px;
  padding: 3rem;
  margin: 1rem;
}

.contact-card h3 {
  color: #333;
  font-weight: 600;
  margin-bottom: 1rem;
}

.contact-buttons .btn {
  margin-bottom: 0.5rem;
  background-color: #df9dac;
  border-radius: 25px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

.contact-buttons .btn:hover {
  background-color: #f7d5de;

}

.service-hours {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .process-step {
    margin-bottom: 2rem;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    font-size: 1rem;
    margin-right: 1rem;
  }
  
  .process-step:not(:last-child)::after {
    left: 20px;
    top: 40px;
  }
  
  .contact-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .contact-buttons .btn {
    margin-right: 0 !important;
  }
}
</style>
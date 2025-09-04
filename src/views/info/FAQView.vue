<template>
  <div class="faq-page">
    <div class="container py-5">
      <h1 class="text-center mb-5">顧客購物常見問題</h1>
      
      <div class="row">
        <div class="col-lg-3 mb-4">
          <!-- 側邊欄目錄 -->
          <div class="faq-sidebar sticky-top" style="top: 100px;">
            <div class="list-group">
              <a 
                v-for="(section, index) in faqSections" 
                :key="index"
                :href="'#section-' + index"
                class="list-group-item list-group-item-action"
                :class="{ active: currentSection === index }"
                @click="scrollToSection(index, $event)"
              >
                {{ section.title }}
              </a>
            </div>
          </div>
        </div>

        <div class="col-lg-9">
          <!-- FAQ 內容區 -->
          <div 
            v-for="(section, sectionIndex) in faqSections" 
            :key="sectionIndex"
            :id="'section-' + sectionIndex"
            class="faq-section mb-5"
          >
            <h2 class="section-title mb-4">{{ section.title }}</h2>
            
            <div class="accordion" :id="'accordion-' + sectionIndex">
              <div 
                v-for="(item, itemIndex) in section.items" 
                :key="itemIndex"
                class="accordion-item"
              >
                <h3 class="accordion-header">
                  <button
                    class="accordion-button"
                    :class="{ collapsed: !item.isOpen }"
                    type="button"
                    @click="toggleItem(sectionIndex, itemIndex)"
                  >
                    {{ item.question }}
                  </button>
                </h3>
                <div
                  class="accordion-collapse collapse"
                  :class="{ show: item.isOpen }"
                >
                  <div class="accordion-body" v-html="item.answer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 聯絡資訊 -->
      <div class="contact-section mt-5 p-4 bg-light rounded">
        <h3 class="text-center mb-4">還有其他問題？</h3>
        <div class="row justify-content-center text-center">
          <div class="col-md-4 mb-3">
            <div class="contact-item">
              <i class="fas fa-robot mb-2"></i>
              <h4>AI 智能客服</h4>
              <p>24/7 全天候為您服務</p>
              <button class="btn btn-outline-primary" @click="openAIChat">
                開始對話
              </button>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="contact-item">
              <i class="fas fa-envelope mb-2"></i>
              <h4>電子郵件</h4>
              <p>service@jade.com.tw</p>
              <a href="mailto:tainanjade@gmail.com" class="btn btn-outline-primary">
                寄送郵件
              </a>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="contact-item">
              <i class="fas fa-phone mb-2"></i>
              <h4>客服專線</h4>
              <p>02-1234-5678</p>
              <p class="small text-muted">週一至週五 9:00-18:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FAQView',
  data() {
    return {
      currentSection: 0,
      faqSections: [
        {
          title: '會員註冊與登入',
          items: [
            {
              question: '我要如何註冊成為 JADE 會員？',
              answer: `
                <p>您可以透過以下兩種方式註冊：</p>
                <ol>
                  <li><strong>Email 註冊</strong>：使用 Email 地址註冊，系統會發送驗證碼到您的信箱</li>
                  <li><strong>Google 快速註冊</strong>：使用 Google 帳號一鍵快速註冊</li>
                </ol>
                <p>註冊完成後，您可以隨時在會員中心編輯個人資料，包括頭像、電話號碼、地址等資訊。</p>
              `,
              isOpen: false
            },
            {
              question: '忘記密碼該怎麼辦？',
              answer: `
                <p>請在登入頁面點選「忘記密碼」，輸入您註冊時的 Email 地址，系統將發送重設密碼的連結到您的信箱。</p>
              `,
              isOpen: false
            },
            {
              question: '可以用 Google 帳號登入嗎？',
              answer: `
                <p>可以！我們支援 Google OAuth 2.0 登入，讓您免除記憶密碼的困擾。</p>
              `,
              isOpen: false
            }
          ]
        },
        {
          title: '購物流程相關',
          items: [
            {
              question: '沒有登入可以購物嗎？',
              answer: `
                <p>可以！您可以在未登入的狀態下將商品加入購物車，但進入結帳流程時需要註冊會員或登入帳號。</p>
              `,
              isOpen: false
            },
            {
              question: '購物車有數量限制嗎？',
              answer: `
                <p>購物車內的商品會顯示詳細資訊，包括商品圖片、規格、數量、價格與加入時間。您可以隨時調整購買數量，系統會自動計算總金額。</p>
              `,
              isOpen: false
            },
            {
              question: '如何搜尋想要的商品？',
              answer: `
                <p>JADE 提供多種商品篩選功能：</p>
                <ul>
                  <li><strong>風格分類</strong>：動漫、插畫、歐美、日系、韓系、街頭六大風格</li>
                  <li><strong>商品分類</strong>：依據產品類別篩選</li>
                  <li><strong>價格篩選</strong>：設定預算範圍</li>
                  <li><strong>關鍵字搜尋</strong>：輸入商品名稱或特色</li>
                </ul>
              `,
              isOpen: false
            }
          ]
        },
        {
          title: '付款與金流相關',
          items: [
            {
              question: '支援哪些付款方式？',
              answer: `
                <p>我們整合綠界金流系統，支援多種付款方式：</p>
                <ul>
                  <li>信用卡付款</li>
                  <li>ATM 轉帳</li>
                  <li>便利商店代碼繳費</li>
                </ul>
              `,
              isOpen: false
            },
            {
              question: '付款安全嗎？',
              answer: `
                <p>我們使用綠界金流 API 進行交易處理，具備完整的交易驗證與狀態回傳機制，確保您的付款安全。</p>
              `,
              isOpen: false
            }
          ]
        },
        {
          title: 'J幣與優惠券相關',
          items: [
            {
              question: '什麼是 J幣？如何獲得？',
              answer: `
                <p>J幣是 JADE 的專屬點數系統，獲得方式包括：</p>
                <ul>
                  <li><strong>每日簽到</strong>：登入即可獲得 J幣</li>
                  <li><strong>消費回饋</strong>：完成訂單後系統自動回饋</li>
                  <li><strong>官方活動</strong>：參與平台活動獲得額外 J幣</li>
                </ul>
                <p><strong>注意</strong>：J幣有效期限為 6 個月，採用先進先出的使用邏輯。</p>
              `,
              isOpen: false
            },
            {
              question: 'J幣可以當現金使用嗎？',
              answer: `
                <p>是的！J幣可以在結帳時直接折抵現金使用，1 J幣 = 1 元新台幣。</p>
              `,
              isOpen: false
            }
          ]
        },
        {
          title: '物流與配送相關',
          items: [
            {
              question: '如何追蹤我的訂單？',
              answer: `
                <p>您可以在會員中心的「訂單管理」查看訂單狀態，包括：</p>
                <ul>
                  <li>訂單處理中</li>
                  <li>已出貨</li>
                  <li>配送中</li>
                  <li>已送達</li>
                </ul>
              `,
              isOpen: false
            },
            {
              question: '運費如何計算？',
              answer: `
                <p>運費依據配送地址和商品重量計算，結帳時系統會自動顯示運費金額。部分活動期間可能提供免運費優惠。</p>
              `,
              isOpen: false
            }
          ]
        }
      ]
    }
  },
  
  mounted() {
    // 監聽滾動事件以更新當前區段
    window.addEventListener('scroll', this.onScroll)
  },
  
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  },
  
  methods: {
    scrollToSection(index, event) {
      event.preventDefault()
      const element = document.getElementById('section-' + index)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        this.currentSection = index
      }
    },
    
    toggleItem(sectionIndex, itemIndex) {
      this.faqSections[sectionIndex].items[itemIndex].isOpen = 
        !this.faqSections[sectionIndex].items[itemIndex].isOpen
    },
    
    openAIChat() {
      // 觸發懸浮AI客服
      try {
        // 方法1: 通過父組件觸發 App.vue 中的 AI 助理
        if (this.$parent && this.$parent.showAIAssistant !== undefined) {
          this.$parent.showAIAssistant = true
          console.log('✅ 通過父組件觸發AI客服')
          return
        }
        
        // 方法2: 通過 $root 觸發
        if (this.$root && this.$root.toggleAIAssistant) {
          this.$root.toggleAIAssistant()
          console.log('✅ 通過$root觸發AI客服')
          return
        }
        
        // 方法3: 通過事件總線觸發
        if (this.$root.$emit) {
          this.$root.$emit('open-ai-chat')
          console.log('✅ 通過事件總線觸發AI客服')
        }
        
        // 方法4: 通過全局對象觸發
        if (window.openAIChat && typeof window.openAIChat === 'function') {
          window.openAIChat()
          console.log('✅ 通過全局函數觸發AI客服')
          return
        }
        
        // 方法5: 查找並點擊懸浮客服按鈕
        const chatButton = document.querySelector('.ai-chat-toggle, .floating-chat-button, [data-chat-toggle], .chat-widget-trigger, .ai-assistant-toggle')
        if (chatButton) {
          chatButton.click()
          console.log('✅ 通過DOM點擊觸發AI客服')
          return
        }
        
        // 方法6: 直接操作 AI 客服容器的顯示狀態
        const aiContainer = document.querySelector('.ai-assistant-container')
        if (aiContainer) {
          aiContainer.style.display = 'block'
          console.log('✅ 直接顯示AI客服容器')
          return
        }
        
        // 如果以上方法都沒有效果，顯示提示
        console.log('⚠️ 無法找到AI客服觸發方式')
        
      } catch (error) {
        console.error('❌ 開啟AI客服失敗:', error)
      }
      
      // 備用方案：顯示提示訊息
      alert('正在為您開啟 AI 智能客服...')
    },
    
    onScroll() {
      const sections = this.faqSections.map((_, index) => 
        document.getElementById('section-' + index)
      )
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section) {
          const rect = section.getBoundingClientRect()
          if (rect.top <= 100) {
            this.currentSection = i
            break
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.faq-page {
  padding-top: 50px;
  min-height: calc(100vh - 90px);
}

.section-title {
  color: #333;
  font-size: 1.75rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 1.5rem;
}

.accordion-button {
  font-weight: 500;
}

.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
  color: #022c5c;
}

.accordion-body {
  padding: 1.25rem;
  background-color: #fff;
}

.contact-section {
  background-color: #faf6eb;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.contact-item {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  height: 100%;
  transition: transform 0.2s;
}

.contact-item:hover {
  transform: translateY(-5px);
}

.contact-item i {
  font-size: 2rem;
  color: #022c5c;
}

.faq-sidebar .list-group-item {
  border-radius: 0;
  border-left: 3px solid transparent;
}

.faq-sidebar .list-group-item.active {
  background-color: #f8f9fa;
  color: #022c5c;
  border-left-color: #022c5c;
  font-weight: 500;
}

@media (max-width: 991.98px) {
  .faq-sidebar {
    position: relative !important;
    top: 0 !important;
    margin-bottom: 2rem;
  }
  
  .contact-item {
    margin-bottom: 1rem;
  }
}
</style>
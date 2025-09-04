<template>
  <div class="terms-page">
    <div class="container py-5">
      <!-- Header Section -->
      <div class="terms-header text-center mb-5">
        <h1 class="terms-title">服務條款</h1>
        <p class="terms-subtitle">最後更新：2025年8月13日</p>
      </div>

      <div class="row">
        <!-- Sidebar Navigation -->
        <div class="col-lg-3 mb-4">
          <div class="terms-sidebar sticky-top" style="top: 100px;">
            <nav class="nav nav-pills flex-column">
              <a 
                v-for="(section, index) in termsSections" 
                :key="index"
                :href="'#section-' + index"
                class="nav-link"
                :class="{ active: currentSection === index }"
                @click="scrollToSection(index, $event)"
              >
                {{ section.title }}
              </a>
            </nav>
          </div>
        </div>

        <!-- Terms Content -->
        <div class="col-lg-9">
          <div class="terms-content">
            <div 
              v-for="(section, sectionIndex) in termsSections" 
              :key="sectionIndex"
              :id="'section-' + sectionIndex"
              class="terms-section mb-5"
            >
              <h2 class="section-title">{{ section.title }}</h2>
              <div class="section-content" v-html="section.content"></div>
            </div>

            <!-- Contact Information -->
            <div class="contact-section">
              <h2 class="section-title">聯絡我們</h2>
              <div class="contact-content">
                <p>若您對本服務條款有任何疑問，請透過以下方式與我們聯繫：</p>
                <p><strong>客服信箱：</strong>service@jade.com.tw</p>
                <p><strong>客服專線：</strong>02-1234-5678</p>
                <p><strong>服務時間：</strong>週一至週五 09:00-18:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TermsOfServiceView',
  data() {
    return {
      currentSection: 0,
      termsSections: [
        {
          title: '服務總則',
          content: `
            <p>歡迎使用 JADE 服飾專賣電商平台（以下簡稱「本平台」）。本平台由 JADE 股份有限公司（以下簡稱「本公司」）營運，專門提供六大風格服飾的線上購物服務：動漫、插畫、歐美、日系、韓系、街頭風格。</p>
            
            <p>當您使用本平台服務時，即表示您已閱讀、了解並同意遵守本服務條款。本公司保留隨時修改本條款的權利，修改後的條款將公告於本平台，並自公告之日起生效。</p>
            
            <p>本平台提供會員雙重身份服務：您可以作為買家購買商品，也可以申請成為賣家販售服飾商品。</p>
          `
        },
        {
          title: '會員註冊',
          content: `
            <h4>註冊資格</h4>
            <p>使用本平台服務需註冊成為會員，註冊者需年滿18歲，或經法定代理人同意的未成年人。</p>
            
            <h4>註冊方式</h4>
            <ul>
              <li><strong>Email 註冊：</strong>使用電子郵件地址註冊，需完成信箱驗證</li>
              <li><strong>Google 快速註冊：</strong>使用 Google 帳號進行授權登入</li>
            </ul>
            
            <h4>帳號安全</h4>
            <p>您有責任保護帳號和密碼的安全，不得將帳號借予他人使用。如發現帳號被盜用，請立即通知本公司。</p>
            
            <p>若有提供虛假資料、違反本條款或從事不當行為等情況，本公司有權停權或刪除您的帳號。</p>
          `
        },
        {
          title: '購物服務',
          content: `
            <h4>商品瀏覽</h4>
            <p>本平台提供多種搜尋和篩選功能，包括風格分類、價格範圍、關鍵字搜尋等，協助您找到合適的商品。</p>
            
            <h4>購物流程</h4>
            <ul>
              <li>未登入狀態下可將商品加入購物車，但結帳需先登入會員</li>
              <li>購物車商品保存期限為30天</li>
              <li>訂單成立後請儘速完成付款，逾期將自動取消</li>
            </ul>
            
            <h4>付款方式</h4>
            <p>本平台整合綠界金流系統，支援信用卡、ATM轉帳、便利商店代碼繳費等多種付款方式。</p>
            
            <h4>會員等級</h4>
            <p>根據累積消費金額劃分會員等級，每月28日統計（需為已完成且不可退貨的訂單）。不同等級享有不同的 J幣 回饋比例和專屬優惠。</p>
          `
        },
        {
          title: '賣家服務',
          content: `
            <h4>賣家申請</h4>
            <p>會員可申請開通賣家功能，需提供個人或公司基本資料、銀行帳戶資訊、身分證明文件等，通過審核後即可開始販售。</p>
            
            <h4>商品規範</h4>
            <ul>
              <li>商品必須符合平台六大風格分類</li>
              <li>商品資訊需真實、完整、清楚</li>
              <li>不得販售仿冒品、違法商品或侵犯智慧財產權的商品</li>
            </ul>
            
            <h4>訂單處理</h4>
            <p>賣家需在收到訂單後3個工作天內出貨，提供正確的物流追蹤資訊，並配合處理退換貨事宜。</p>
            
            <h4>費用結算</h4>
            <p>平台收取交易金額5%作為手續費，每月15日結算上月銷售金額，扣除手續費後匯入指定帳戶。</p>
          `
        },
        {
          title: 'J幣點數系統',
          content: `
            <h4>J幣介紹</h4>
            <p>J幣是本平台專屬虛擬點數，1 J幣等於1元新台幣，可用於購物時折抵金額。</p>
            
            <h4>獲得方式</h4>
            <ul>
              <li><strong>每日簽到：</strong>登入即可獲得 J幣</li>
              <li><strong>消費回饋：</strong>完成訂單後自動回饋，比例依會員等級而定</li>
              <li><strong>官方活動：</strong>參與平台舉辦的促銷活動</li>
              <li><strong>生日優惠：</strong>生日月份贈送特別 J幣</li>
            </ul>
            
            <h4>使用規則</h4>
            <ul>
              <li>J幣有效期限為6個月，採先進先出邏輯使用</li>
              <li>僅能在本平台使用，不得轉讓或兌換現金</li>
              <li>平台停止服務時，剩餘 J幣 將失效且不予退還</li>
            </ul>
          `
        },
        {
          title: '優惠券規範',
          content: `
            <h4>優惠券類型</h4>
            <ul>
              <li><strong>JADE 優惠券：</strong>平台官方發放，包含新會員禮、生日券等</li>
              <li><strong>賣場優惠券：</strong>個別賣家發放的店鋪專屬優惠券</li>
            </ul>
            
            <h4>使用限制</h4>
            <ul>
              <li>每張優惠券僅能使用一次</li>
              <li>不得轉讓或販售</li>
              <li>超過有效期限自動失效</li>
              <li>與其他促銷活動可能不得併用</li>
            </ul>
          `
        },
        {
          title: '退換貨政策',
          content: `
            <h4>退換貨條件</h4>
            <ul>
              <li>商品到貨後7天內可申請退換貨</li>
              <li>商品需保持原狀，包含包裝、配件、贈品等</li>
              <li>個人衛生用品（如內衣褲）不接受退換貨</li>
              <li>客製化商品除瑕疵外不接受退換貨</li>
            </ul>
            
            <h4>申請流程</h4>
            <ol>
              <li>登入會員中心，選擇欲退換貨的訂單</li>
              <li>填寫申請表，說明退換貨原因</li>
              <li>等待客服審核通過</li>
              <li>依指示寄回商品</li>
              <li>確認收貨後進行退款或換貨</li>
            </ol>
            
            <h4>退款方式</h4>
            <p>退款將以原付款方式處理，使用 J幣 付款部分將退回 J幣 至帳戶。</p>
          `
        },
        {
          title: '隱私權保護',
          content: `
            <h4>個人資料收集</h4>
            <p>我們僅收集提供服務所必要的個人資料，包括註冊資訊、交易資訊及使用行為資訊。</p>
            
            <h4>資料使用</h4>
            <ul>
              <li>提供電商平台服務</li>
              <li>處理訂單和客戶服務</li>
              <li>發送行銷資訊（需經同意）</li>
              <li>改善服務品質</li>
            </ul>
            
            <h4>資料保護</h4>
            <p>我們採用業界標準的安全措施保護您的個人資料，包括加密傳輸、存取控制等。除法律要求或經您同意外，不會與第三方分享個人資料。</p>
          `
        },
        {
          title: '智慧財產權',
          content: `
            <h4>平台內容保護</h4>
            <p>本平台的設計、文字、圖片、商標等內容均受智慧財產權法保護，未經授權不得使用。</p>
            
            <h4>使用者責任</h4>
            <p>使用者上傳的內容需確保不侵犯他人權利，如有侵權情形需承擔法律責任。本平台有權移除疑似侵權的內容。</p>
            
            <h4>侵權處理</h4>
            <p>如發現侵權內容，請提供相關證明文件，我們將儘速處理。</p>
          `
        },
        {
          title: '免責聲明',
          content: `
            <h4>服務可用性</h4>
            <p>本平台致力提供穩定服務，但不保證永不中斷。因系統維護、網路故障等不可抗力因素造成的服務中斷，本公司不承擔責任。</p>
            
            <h4>商品資訊</h4>
            <p>平台商品資訊由賣家提供，本公司不保證資訊完全準確。消費者應自行判斷商品是否符合需求。</p>
            
            <h4>損害賠償</h4>
            <p>除法律另有規定外，本公司對使用服務產生的損害，其賠償責任以使用者支付的服務費用為上限。</p>
          `
        },
        {
          title: '其他規定',
          content: `
            <h4>條款修改</h4>
            <p>本公司保留隨時修改服務條款的權利，修改後將於平台公告。繼續使用服務即視為同意修改內容。</p>
            
            <h4>法律適用</h4>
            <p>本服務條款適用中華民國法律，相關爭議以台灣台北地方法院為管轄法院。</p>
            
            <h4>條款效力</h4>
            <p>如本條款任何部分被認定無效，其餘部分仍繼續有效。</p>
          `
        }
      ]
    }
  },

  mounted() {
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

    onScroll() {
      const sections = this.termsSections.map((_, index) => 
        document.getElementById('section-' + index)
      )
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section) {
          const rect = section.getBoundingClientRect()
          if (rect.top <= 120) {
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
.terms-page {
  padding-top: 90px;
  min-height: calc(100vh - 90px);
  background-color: #fafafa;
}

.terms-header {
  margin-bottom: 3rem;
}

.terms-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.terms-subtitle {
  font-size: 1rem;
  color: #666;
}

.terms-sidebar {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-pills .nav-link {
  color: #666;
  font-size: 0.9rem;
  padding: 0.5rem 0;
  border-radius: 0;
  border: none;
  background: none;
  text-align: left;
  border-bottom: 1px solid #eee;
  transition: color 0.3s ease;
}

.nav-pills .nav-link:last-child {
  border-bottom: none;
}

.nav-pills .nav-link:hover {
  color: #007bff;
  background: none;
}

.nav-pills .nav-link.active {
  color: #007bff;
  background: none;
  font-weight: 600;
  border-left: 3px solid #007bff;
  padding-left: 1rem;
}

.terms-content {
  background: white;
  border-radius: 8px;
  padding: 2.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.section-content {
  color: #555;
  line-height: 1.7;
}

.section-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #444;
  margin: 2rem 0 1rem 0;
}

.section-content h4:first-child {
  margin-top: 0;
}

.section-content p {
  margin-bottom: 1rem;
}

.section-content ul,
.section-content ol {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.section-content li {
  margin-bottom: 0.5rem;
}

.contact-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.contact-content p {
  margin-bottom: 0.75rem;
  color: #555;
}

@media (max-width: 991.98px) {
  .terms-sidebar {
    position: relative !important;
    top: 0 !important;
    margin-bottom: 2rem;
  }
}

@media (max-width: 768px) {
  .terms-title {
    font-size: 2rem;
  }
  
  .terms-content {
    padding: 1.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .section-content h4 {
    font-size: 1.1rem;
  }
}

@media (max-width: 576px) {
  .terms-content {
    padding: 1rem;
  }
  
  .terms-sidebar {
    padding: 1rem;
  }
  
  .nav-pills .nav-link {
    font-size: 0.85rem;
  }
}
</style>
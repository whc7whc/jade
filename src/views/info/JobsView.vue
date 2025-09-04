<template>
  <div class="careers-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center min-vh-50">
          <div class="col-lg-6">
            <h1 class="hero-title">加入 JADE 團隊</h1>
            <p class="hero-subtitle">與我們一起打造台灣最具影響力的服飾電商平台</p>
            <p class="hero-description">
              在 JADE，我們致力於為年輕世代提供多元化的服飾風格選擇，
              從動漫、插畫到街頭時尚，讓每個人都能找到屬於自己的風格。
            </p>
            <button class="btn btn-primary btn-lg" @click="scrollToJobs">
              查看職缺
            </button>
          </div>
          <div class="col-lg-6">
            <div class="hero-image">
              <i class="fas fa-users-cog hero-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Company Culture Section -->
    <section class="culture-section py-5">
      <div class="container">
        <h2 class="section-title text-center mb-5">為什麼選擇 JADE？</h2>
        <div class="row">
          <div class="col-md-4 mb-4" v-for="(benefit, index) in benefits" :key="index">
            <div class="benefit-card">
              <h4>{{ benefit.title }}</h4>
              <p>{{ benefit.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
 <!-- Application Process Section -->
    <section class="process-section py-5">
      <div class="container">
        <h2 class="section-title text-center mb-5">應徵流程</h2>
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="process-timeline">
              <div v-for="(step, index) in applicationProcess" :key="index" class="process-step">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">
                  <h5>{{ step.title }}</h5>
                  <p>{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Job Openings Section -->
    <section class="jobs-section py-5 bg-light" id="jobs">
      <div class="container">
        <h2 class="section-title text-center mb-5">目前職缺</h2>
        
        <!-- Department Filter -->
        <div class="filter-section mb-4">
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <div class="filter-buttons text-center">
                <button 
                  v-for="department in departments" 
                  :key="department"
                  @click="filterJobs(department)"
                  class="btn filter-btn"
                  :class="{ active: selectedDepartment === department }"
                >
                  {{ department }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Job Listings -->
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div v-if="filteredJobs.length === 0" class="text-center py-5">
              <i class="fas fa-search mb-3" style="font-size: 3rem; color: #6c757d;"></i>
              <h4>暫無相關職缺</h4>
              <p class="text-muted">請嘗試其他部門分類或稍後再查看</p>
            </div>
            
            <div v-else>
              <div 
                v-for="job in filteredJobs" 
                :key="job.id"
                class="job-card mb-4"
                @click="openJobModal(job)"
              >
                <div class="job-header">
                  <div class="job-title-section">
                    <h4 class="job-title">{{ job.title }}</h4>
                    <span class="job-department">{{ job.department }}</span>
                  </div>
                  <div class="job-meta">
                    <span class="job-type">{{ job.type }}</span>
                    <span class="job-location">{{ job.location }}</span>
                  </div>
                </div>
                <p class="job-summary">{{ job.summary }}</p>
                <div class="job-skills">
                  <span v-for="skill in job.skills.slice(0, 3)" :key="skill" class="skill-tag">
                    {{ skill }}
                  </span>
                  <span v-if="job.skills.length > 3" class="skill-more">
                    +{{ job.skills.length - 3 }} more
                  </span>
                </div>
                <div class="job-footer">
                  <small class="text-muted">發布於 {{ job.publishedDate }}</small>
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

   

    <!-- Job Detail Modal -->
    <div v-if="selectedJob" class="modal-overlay" @click="closeJobModal">
      <div class="job-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedJob.title }}</h3>
          <button class="close-btn" @click="closeJobModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="job-meta-section">
            <div class="meta-item">
              <i class="fas fa-building"></i>
              <span>{{ selectedJob.department }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-briefcase"></i>
              <span>{{ selectedJob.type }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ selectedJob.location }}</span>
            </div>
          </div>
          
          <div class="job-content">
            <h5>職位描述</h5>
            <p>{{ selectedJob.description }}</p>
            
            <h5>工作職責</h5>
            <ul>
              <li v-for="responsibility in selectedJob.responsibilities" :key="responsibility">
                {{ responsibility }}
              </li>
            </ul>
            
            <h5>任職要求</h5>
            <ul>
              <li v-for="requirement in selectedJob.requirements" :key="requirement">
                {{ requirement }}
              </li>
            </ul>
            
            <h5>技能需求</h5>
            <div class="skills-section">
              <span v-for="skill in selectedJob.skills" :key="skill" class="skill-tag">
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary" @click="closeJobModal">
            取消
          </button>
          <button class="btn btn-primary" @click="applyJob">
            立即應徵
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CareersView',
  data() {
    return {
      selectedDepartment: '全部',
      selectedJob: null,
      departments: ['全部', '技術開發', '產品設計', '營運管理', '行銷企劃', '客戶服務'],
      
      benefits: [
        {
          icon: 'fas fa-rocket',
          title: '快速成長的環境',
          description: '在 JADE 服飾電商平台，您將參與台灣時尚科技的前沿發展，與團隊一起打造創新的購物體驗。'
        },
        {
          icon: 'fas fa-palette',
          title: '多元創意文化',
          description: '我們專注於六大服飾風格，從動漫、插畫到街頭時尚，讓您在充滿創意的環境中發揮才能。'
        },
        {
          icon: 'fas fa-users',
          title: '人才培育計畫',
          description: '完整的職涯發展規劃，定期技術分享與教育訓練，讓您在專業領域持續精進。'
        },
        {
          icon: 'fas fa-heart',
          title: '優質福利制度',
          description: '彈性工作時間、完善的保險制度、員工購物優惠，讓您在工作與生活間取得平衡。'
        },
        {
          icon: 'fas fa-laptop-code',
          title: '先進技術架構',
          description: '使用最新的技術堆疊，包括 Vue.js、微服務架構、雲端部署，讓您接觸業界前沿技術。'
        },
        {
          icon: 'fas fa-trophy',
          title: '績效獎勵機制',
          description: '公平的績效評估制度，優秀表現將獲得豐厚獎金與升遷機會。'
        }
      ],

      jobs: [
        {
          id: 1,
          title: '前端工程師 (Vue.js)',
          department: '技術開發',
          type: '全職',
          location: '台北市',
          summary: '負責 JADE 電商平台前端開發，打造流暢的用戶購物體驗',
          publishedDate: '2025-08-01',
          skills: ['Vue.js', 'JavaScript', 'HTML/CSS', 'Bootstrap', 'Git'],
          description: '我們正在尋找一位熱愛前端開發的工程師，負責 JADE 服飾電商平台的前端開發工作。您將與設計師和後端工程師密切合作，打造出色的用戶體驗。',
          responsibilities: [
            '開發和維護 JADE 電商平台的前端功能',
            '與 UI/UX 設計師合作，將設計稿轉化為高品質的網頁',
            '優化網站性能，確保在各種設備上的良好體驗',
            '參與技術選型和架構設計討論',
            '編寫可維護、可測試的代碼'
          ],
          requirements: [
            '2年以上前端開發經驗',
            '熟練掌握 Vue.js 框架',
            '具備良好的 JavaScript、HTML、CSS 基礎',
            '熟悉響應式網頁設計',
            '具備 Git 版本控制經驗',
            '良好的溝通能力和團隊合作精神'
          ]
        },
        {
          id: 2,
          title: '後端工程師 (.NET Core)',
          department: '技術開發',
          type: '全職',
          location: '台北市',
          summary: '開發和維護電商平台後端 API，處理高併發的交易系統',
          publishedDate: '2025-08-05',
          skills: ['.NET Core', 'C#', 'SQL Server', 'API Design', 'Azure'],
          description: '負責 JADE 電商平台的後端系統開發，包括會員系統、商品管理、訂單處理、金流整合等核心功能。',
          responsibilities: [
            '設計和開發電商平台的後端 API',
            '優化資料庫查詢性能',
            '整合第三方服務（金流、物流等）',
            '確保系統安全性和資料保護',
            '參與系統架構設計和技術選型'
          ],
          requirements: [
            '3年以上 .NET 開發經驗',
            '熟悉 .NET Core 和 C#',
            '具備 SQL Server 資料庫經驗',
            '了解 RESTful API 設計原則',
            '有雲端平台經驗（Azure 優先）',
            '具備電商或金流整合經驗者佳'
          ]
        },
        {
          id: 3,
          title: 'UI/UX 設計師',
          department: '產品設計',
          type: '全職',
          location: '台北市',
          summary: '設計直觀易用的電商介面，提升用戶購物體驗',
          publishedDate: '2025-08-03',
          skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Prototyping'],
          description: '我們需要一位富有創意的 UI/UX 設計師，負責 JADE 電商平台的視覺設計和用戶體驗優化。',
          responsibilities: [
            '進行用戶研究和體驗分析',
            '設計電商平台的使用者介面',
            '製作互動原型和設計規範',
            '與開發團隊協作確保設計實現',
            '持續優化產品的用戶體驗'
          ],
          requirements: [
            '2年以上 UI/UX 設計經驗',
            '熟練使用 Figma、Adobe Creative Suite',
            '具備電商或購物類產品設計經驗',
            '了解前端開發流程',
            '優秀的視覺設計和溝通能力',
            '對時尚服飾有敏銳度者佳'
          ]
        },
        {
          id: 4,
          title: '產品經理',
          department: '產品設計',
          type: '全職',
          location: '台北市',
          summary: '規劃產品發展藍圖，協調跨部門資源推動專案執行',
          publishedDate: '2025-08-07',
          skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research', 'SQL'],
          description: '負責 JADE 電商平台的產品規劃與管理，從市場分析到功能設計，推動產品持續優化。',
          responsibilities: [
            '制定產品發展策略和規劃',
            '進行市場研究和競品分析',
            '管理產品開發生命週期',
            '協調設計、開發、測試等跨部門合作',
            '分析產品數據並提出改進建議'
          ],
          requirements: [
            '3年以上產品管理經驗',
            '具備電商或零售業經驗',
            '熟悉敏捷開發流程',
            '具備數據分析能力',
            '優秀的專案管理和溝通能力',
            '對服飾時尚產業有深度了解者佳'
          ]
        },
        {
          id: 5,
          title: '營運專員',
          department: '營運管理',
          type: '全職',
          location: '台北市',
          summary: '負責平台日常營運，包括商品管理、訂單處理、會員服務',
          publishedDate: '2025-08-06',
          skills: ['Excel', 'Data Analysis', 'Customer Service', 'E-commerce', 'SQL'],
          description: '協助 JADE 電商平台的日常營運工作，確保平台順暢運行並提供優質的客戶服務。',
          responsibilities: [
            '管理平台商品上架和分類',
            '處理訂單異常和客戶問題',
            '監控平台營運數據',
            '協助賣家服務和教育訓練',
            '優化營運流程和提升效率'
          ],
          requirements: [
            '1年以上電商營運經驗',
            '熟練使用 Excel 和數據分析工具',
            '具備良好的客戶服務技巧',
            '細心負責，具備問題解決能力',
            '對電商流程有基本了解',
            '有服飾或時尚產業經驗者佳'
          ]
        },
        {
          id: 6,
          title: '行銷企劃專員',
          department: '行銷企劃',
          type: '全職',
          location: '台北市',
          summary: '策劃和執行數位行銷活動，提升品牌知名度和用戶轉換',
          publishedDate: '2025-08-04',
          skills: ['Digital Marketing', 'Google Analytics', 'Facebook Ads', 'SEO', 'Content Creation'],
          description: '負責 JADE 品牌的數位行銷策劃與執行，透過多元化的行銷手法提升品牌影響力。',
          responsibilities: [
            '規劃和執行數位行銷活動',
            '管理社群媒體和內容行銷',
            '分析行銷數據和優化投放效果',
            '協助品牌合作和 KOL 行銷',
            '開發創新的行銷策略和執行方案'
          ],
          requirements: [
            '2年以上數位行銷經驗',
            '熟悉 Google Analytics、Facebook 廣告',
            '具備 SEO/SEM 基礎知識',
            '良好的文案撰寫和創意思考能力',
            '對時尚趨勢和社群經營有敏銳度',
            '有電商或零售業行銷經驗者佳'
          ]
        },
        {
          id: 7,
          title: '客服專員',
          department: '客戶服務',
          type: '全職',
          location: '台北市',
          summary: '提供專業的客戶服務，解決用戶問題並維護客戶關係',
          publishedDate: '2025-08-08',
          skills: ['Customer Service', 'Communication', 'Problem Solving', 'CRM', 'Multi-tasking'],
          description: '作為 JADE 與客戶之間的重要橋樑，提供專業、溫暖的客戶服務體驗。',
          responsibilities: [
            '處理客戶諮詢和問題反映',
            '協助客戶完成訂單和退換貨流程',
            '記錄和追蹤客戶問題',
            '與內部團隊協調解決客戶需求',
            '提供產品使用建議和購買指導'
          ],
          requirements: [
            '1年以上客服相關經驗',
            '優秀的溝通和表達能力',
            '具備耐心和同理心',
            '熟悉客服系統操作',
            '能夠處理多任務和壓力',
            '有電商客服經驗者佳'
          ]
        }
      ],

      applicationProcess: [
        {
          title: '線上投遞',
          description: '透過職缺頁面投遞履歷，我們會在 3 個工作天內回覆'
        },
        {
          title: '初步面談',
          description: '人資夥伴進行 30 分鐘的電話或視訊初步面談'
        },
        {
          title: '技術/專業面試',
          description: '與部門主管進行專業能力和經驗的深度討論'
        },
        {
          title: '文化適配面試',
          description: '與團隊成員面談，了解工作風格和團隊合作能力'
        },
        {
          title: '錄取通知',
          description: '確認合適後發送 offer，歡迎加入 JADE 大家庭'
        }
      ]
    }
  },

  computed: {
    filteredJobs() {
      if (this.selectedDepartment === '全部') {
        return this.jobs
      }
      return this.jobs.filter(job => job.department === this.selectedDepartment)
    }
  },

  methods: {
    scrollToJobs() {
      document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' })
    },

    filterJobs(department) {
      this.selectedDepartment = department
    },

    openJobModal(job) {
      this.selectedJob = job
      document.body.style.overflow = 'hidden'
    },

    closeJobModal() {
      this.selectedJob = null
      document.body.style.overflow = 'auto'
    },

    applyJob() {
      // 實際應用中這裡會跳轉到應徵表單
      alert(`感謝您對「${this.selectedJob.title}」職位的興趣！\n\n請將履歷寄送至：hr@jade.com.tw\n或透過人力銀行平台應徵。`)
      this.closeJobModal()
    }
  },

  beforeUnmount() {
    document.body.style.overflow = 'auto'
  }
}
</script>

<style scoped>

.btn-primary {
  background-color: #eb5757;
  border-color: #eb5757;
}

.btn-primary:hover {
  background-color: #d94d4d; /* 稍微深一點 */
  border-color: #d94d4d;
}

.btn-primary:active,
.btn-primary:focus {
  background-color: #c34444; /* 更深的紅 */
  border-color: #c34444;
  box-shadow: 0 0 0 0.25rem rgba(235, 87, 87, 0.5);
}

.careers-page {
  padding-top: 90px;
}

.hero-section {
  margin-top: 10px;
  background: linear-gradient(135deg, #faf6eb, #e4dcd1);
  color: #022c5c;
  min-height: 45vh;
}

.hero-title {
  margin-top: 1rem;
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.hero-image {
  text-align: center;
}

.hero-icon {
  margin-top: 2rem;
  font-size: 8rem;
  opacity: 0.8;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 3rem;
}

.benefit-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  height: 100%;
  transition: transform 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-5px);
}



.benefit-card h4 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.filter-buttons {
  margin-bottom: 2rem;
}

.filter-btn {
  margin: 0 0.5rem 0.5rem 0;
  padding: 0.5rem 1.5rem;
  border: 2px solid #022c5c;
  background: white;
  color: #022c5c;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.filter-btn:hover,
.filter-btn.active {
  background: #022c5c;
  color: #faf6eb;
}

.job-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.job-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.job-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.job-department {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
}

.job-meta {
  text-align: right;
  font-size: 0.9rem;
  color: #666;
}

.job-type, .job-location {
  display: block;
  margin-bottom: 0.25rem;
}

.job-summary {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.job-skills {
  margin-bottom: 1rem;
}

.skill-tag {
  background: #f8f9fa;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.skill-more {
  color: #6c757d;
  font-size: 0.85rem;
  font-style: italic;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.process-timeline {
  position: relative;
}

.process-step {
  display: flex;
  align-items: flex-start;
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
  background: #e9ecef;
}

.step-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #eb5757 0%, #cf4f4f 100%);
  color: #faf6eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  margin-right: 2rem;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(235, 87, 87, 0.2);
}

.step-content h5 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.job-modal {
  background: white;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 2rem;
}

.job-meta-section {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.meta-item i {
  color: #eb5757;
}

.job-content h5 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.job-content h5:first-child {
  margin-top: 0;
}

.job-content ul {
  padding-left: 1.5rem;
}

.job-content li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.skills-section {
  margin-top: 1rem;
}

.skills-section .skill-tag {
  background: #022c5c;
  color: #faf6eb;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.modal-footer .btn {
  min-width: 100px;
}


@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .job-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .job-meta {
    text-align: left;
  }
  
  .job-meta-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-btn {
    margin-bottom: 0.5rem;
    width: 100%;
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
}

@media (max-width: 576px) {
  .job-modal {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .modal-header,
  .modal-footer {
    padding: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer .btn {
    width: 100%;
  }
}
</style>
<template>
  <div class="about-page">
    <!-- 頁面標題區 -->
    <section class="page-hero bg-light py-5" style="margin-top: 90px;">
      <div class="container">
        <div class="row justify-content-center text-center">
          <div class="col-md-8">
            <h1 class="display-4 text-uppercase mb-4">關於 JADE</h1>
            <p class="lead">全台最大的線上時尚購物平台</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 公司介紹 -->
    <section class="company-intro py-5">
      <div class="container">
        <div class="row align-items-center mb-5">
          <div class="col-md-6">
            <div class="content">
              <h2 class="text-uppercase mb-4">我們的故事</h2>
              <p class="mb-3">
                JADE 成立於 2025 年，致力於為台灣消費者提供最高品質的時尚商品。我們精選來自世界各地的賣家提供優質服飾與配件，讓每位顧客都能找到適合自己的完美單品。
              </p>
              <p class="mb-3">
                自創立以來，我們始終堅持品質第一的理念，與國際知名品牌合作，引進最新的流行趨勢。無論是日常穿搭還是特殊場合，JADE 都能滿足您的需求。
              </p>
              <p class="mb-4">
                我們的使命是讓時尚變得更加親民，透過線上平台，您可以輕鬆購買到最新的流行商品，同時享受優質的購物體驗和完善的售後服務。
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="company-image-container">
              <img v-if="companyImage.src" :src="companyImage.src" :alt="companyImage.alt" class="company-image">
              <div v-else class="image-placeholder">
                <span>公司形象照片</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心價值 -->
    <section class="core-values py-5 bg-light">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="text-uppercase">我們的核心價值</h2>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="value-item text-center p-4">
              <div class="icon-placeholder mb-3" style="height: 80px;">
                <span>品質圖標</span>
              </div>
              <h4>品質至上</h4>
              <p>嚴選每一件商品，確保最高品質標準</p>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="value-item text-center p-4">
              <div class="icon-placeholder mb-3" style="height: 80px;">
                <span>服務圖標</span>
              </div>
              <h4>優質服務</h4>
              <p>提供專業的客戶服務和完善的售後保障</p>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="value-item text-center p-4">
              <div class="icon-placeholder mb-3" style="height: 80px;">
                <span>創新圖標</span>
              </div>
              <h4>持續創新</h4>
              <p>不斷追求創新，引領時尚潮流</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 團隊介紹 -->
    <section class="team py-5">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="text-uppercase">我們的團隊</h2>
            <p class="text-muted">專業的團隊為您提供最好的服務</p>
          </div>
        </div>
        
        <!-- 團隊輪播 -->
        <div class="team-carousel-container position-relative">
          <div class="team-carousel" :style="{ transform: `translateX(-${currentSlide * 50}%)` }">
            <!-- 第一組團隊成員 -->
            <div class="carousel-slide">
              <div class="row">
                <div class="col-md-4 mb-4" v-for="member in teamMembers.slice(0, 3)" :key="member.id">
                  <div class="team-member text-center">
                    <div class="member-photo mb-3">
                      <img v-if="member.photo" :src="member.photo" :alt="member.name" class="member-image">
                      <div v-else class="photo-placeholder">
                        <span>{{ member.name }}</span>
                      </div>
                    </div>
                    <h5>{{ member.name }}</h5>
                    <p class="text-muted">{{ member.position }}</p>
                    <p class="small">{{ member.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 第二組團隊成員 -->
            <div class="carousel-slide">
              <div class="row">
                <div class="col-md-4 mb-4" v-for="member in teamMembers.slice(3, 6)" :key="member.id">
                  <div class="team-member text-center">
                    <div class="member-photo mb-3">
                      <img v-if="member.photo" :src="member.photo" :alt="member.name" class="member-image">
                      <div v-else class="photo-placeholder">
                        <span>{{ member.name }}</span>
                      </div>
                    </div>
                    <h5>{{ member.name }}</h5>
                    <p class="text-muted">{{ member.position }}</p>
                    <p class="small">{{ member.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 輪播指示器 -->
          <div class="carousel-indicators text-center mt-4">
            <button 
              v-for="(slide, index) in 2" 
              :key="index"
              class="carousel-dot"
              :class="{ active: currentSlide === index }"
              @click="goToSlide(index)"
            ></button>
          </div>
          
          <!-- 輪播控制按鈕 -->
          <button class="carousel-prev" @click="prevSlide">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="carousel-next" @click="nextSlide">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- 聯絡資訊 -->
    <section class="contact-info py-5 bg-light">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 text-center">
            <h2 class="text-uppercase mb-4">聯絡我們</h2>
            <div class="row">
              <div class="col-md-6 mb-3">
                <h5>電子郵件</h5>
                <p><a href="mailto:tainanjade@gmail.com">tainanjade@gmail.com</a></p>
              </div>
              <div class="col-md-6 mb-3">
                <h5>服務專線</h5>
                <p><a href="tel:+43 720 11 52 78">+43 720 11 52 78</a></p>
              </div>
            </div>
            <div class="mt-4">
              <router-link to="/" class="btn btn-primary btn-lg">返回首頁</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AboutView',
  data() {
    return {
      // 公司形象照片
      companyImage: {
        src: 'https://res.cloudinary.com/jadetainan/image/upload/v1755352073/uploads/jadeTainan_638909776542167870.jpg',
        alt: 'JADE 公司辦公室'
      },
      
      // 團隊輪播相關
      currentSlide: 0,
      autoPlayInterval: null,
      
      teamMembers: [
        {
          id: 1,
          name: '劉冠彤',
          position: '執行長',
          description: '擁有超過 15 年的時尚產業經驗，致力於打造台灣最好的時尚電商平台。',
          photo: 'https://res.cloudinary.com/jadetainan/image/upload/v1755351696/uploads/jadeTainan_638909772939379064.jpg'
        },
        {
          id: 2,
          name: '施承鋒',
          position: '設計總監',
          description: '國際知名設計師，負責品牌視覺設計和商品選品，確保每件商品都符合時尚標準。',
          photo: 'https://res.cloudinary.com/jadetainan/image/upload/v1755766415/uploads/jadeTainan_638913920126688927.jpg'
        },
        {
          id: 3,
          name: '王涵溱',
          position: '技術長',
          description: '擁有豐富的電商平台開發經驗，負責網站技術架構和用戶體驗優化。',
          photo: 'https://res.cloudinary.com/jadetainan/image/upload/v1755766514/uploads/jadeTainan_638913921123269032.jpg'
        },
        {
          id: 4,
          name: '盧祥倪',
          position: '行銷經理',
          description: '專精數位行銷策略，負責品牌推廣和客戶關係維護，提升品牌知名度。',
          photo: 'https://res.cloudinary.com/jadetainan/image/upload/v1755766664/uploads/jadeTainan_638913922626897348.jpg'
        },
        {
          id: 5,
          name: '陳佩文',
          position: '財務長',
          description: '具備豐富的財務管理經驗，負責公司財務規劃和風險控管，確保營運穩健。',
          photo: 'https://res.cloudinary.com/jadetainan/image/upload/v1755766701/uploads/jadeTainan_638913922999395668.jpg'
        },
        {
          id: 6,
          name: '鍾雅婷',
          position: '客服主管',
          description: '專注於客戶體驗優化，領導客服團隊提供優質服務，維護客戶滿意度。',
          photo: 'https://res.cloudinary.com/jadetainan/image/upload/v1755766732/uploads/jadeTainan_638913923301305864.jpg'
        }
      ]
    }
  },
  
  mounted() {
    this.startAutoPlay()
  },
  
  beforeUnmount() {
    this.stopAutoPlay()
  },
  
  methods: {
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % 2
    },
    
    prevSlide() {
      this.currentSlide = this.currentSlide === 0 ? 1 : 0
    },
    
    goToSlide(index) {
      this.currentSlide = index
    },
    
    startAutoPlay() {
      this.autoPlayInterval = setInterval(() => {
        this.nextSlide()
      }, 7000)
    },
    
    stopAutoPlay() {
      if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval)
        this.autoPlayInterval = null
      }
    }
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

.image-placeholder,
.icon-placeholder {
  background-color: #faf6eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #022c5c;
  font-size: 0.9rem;
  border-radius: 8px;
  height: 400px;
}

.company-image-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.company-image-container:hover {
  transform: scale(1.02);
}

.company-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.value-item {
  background: #e4dcd1;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;
  color: #022c5c;
}

.value-item:hover {
  transform: translateY(-5px);
}

/* 團隊輪播樣式 */
.team-carousel-container {
  overflow: hidden;
  position: relative;
  width: 100%;
}

.team-carousel {
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 200%;
}

.carousel-slide {
  width: 50%;
  flex-shrink: 0;
  padding: 0 15px;
}

.carousel-indicators {
  margin-top: 2rem;
}

.carousel-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background-color: #ccc;
  margin: 0 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.carousel-dot.active {
  background-color: #eb5757;
}

.carousel-prev,
.carousel-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(235, 87, 87, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.carousel-prev {
  left: 10px;
}

.carousel-next {
  right: 10px;
}

.carousel-prev:hover,
.carousel-next:hover {
  background: rgba(235, 87, 87, 1);
  transform: translateY(-50%) scale(1.1);
}

.team-member {
  transition: transform 0.3s ease;
}

.team-member:hover {
  transform: translateY(-3px);
}

.member-photo {
  border-radius: 50%;
  margin: 0 auto;
  width: 200px;
  height: 200px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.member-photo:hover {
  transform: scale(1.05);
}

.member-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.photo-placeholder {
  background-color: #faf6eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #022c5c;
  font-size: 0.9rem;
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .display-4 {
    font-size: 2rem;
  }
  
  .member-photo {
    width: 150px;
    height: 150px;
  }
  
  .carousel-prev,
  .carousel-next {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
  
  .carousel-prev {
    left: -20px;
  }
  
  .carousel-next {
    right: -20px;
  }
  
  .carousel-slide .col-md-4 {
    margin-bottom: 2rem;
  }
}
</style>
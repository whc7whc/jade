<template>
  <footer id="footer" class="mt-0" style="background-color:#efe8dd">
    <div class="container">
      <div class="row d-flex flex-wrap justify-content-between py-5">
        <div class="col-md-3 col-sm-6">
          <div class="footer-menu footer-menu-001">
            <div class="footer-intro mb-4">
              <router-link to="/">
                <img src="/images/main-logo.png" alt="logo" height="80">
              </router-link>
            </div>
            <p>
              全台最大服飾販售平台，每個人都能成為JADE的一份子。
            </p>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6">
          <div class="footer-menu footer-menu-002">
            <h5 class="widget-title text-uppercase mb-4">了解我們</h5>
            <ul class="menu-list list-unstyled text-uppercase border-animation-left fs-6">
              <li class="menu-item">
                <router-link to="/" class="item-anchor">首頁</router-link>
              </li>
              <li class="menu-item">
                <router-link to="/about" class="item-anchor">關於我們</router-link>
              </li>
              <li class="menu-item">
                <router-link to="/blog" class="item-anchor">部落格</router-link>
              </li>
              <li class="menu-item">
                <router-link to="/jobs" class="item-anchor">加入我們</router-link>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6">
          <div class="footer-menu footer-menu-003">
            <h5 class="widget-title text-uppercase mb-4">幫助中心</h5>
            <ul class="menu-list list-unstyled text-uppercase border-animation-left fs-6">
              <li class="menu-item">
                <router-link to="/returns" class="item-anchor">退換貨說明</router-link>
              </li>
              <li class="menu-item">
                <router-link to="/shipping" class="item-anchor">物流方式</router-link>
              </li>
              <li class="menu-item">
                <router-link to="/faq" class="item-anchor">常見Q&A</router-link>
              </li>
              <li class="menu-item">
                <router-link to="/terms" class="item-anchor">服務條款</router-link>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6">
          <div class="footer-menu footer-menu-004 border-animation-left">
            <h5 class="widget-title text-uppercase mb-4">聯絡我們</h5>
            <p>
              歡迎透過信箱聯絡我們！ 
              <a href="mailto:tainanjade@gmail.com" class="item-anchor">
                tainanjade@gmail.com
              </a>
            </p>
            <p>
              如果需要更多幫助，請撥打服務電話。 
              <a href="tel:+43 720 11 52 78" class="item-anchor">
                +43 720 11 52 78
              </a>
            </p>
            
            <!-- 社群媒體連結 -->
            <div class="social-links mt-4">
              <h6 class="text-uppercase mb-3">追蹤我們</h6>
              <div class="d-flex gap-3">
                <a href="#" class="social-link" aria-label="Facebook">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/jadetainan/" class="social-link" aria-label="Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="border-top py-4">
      <div class="container">
        <div class="row">
          <div class="col-md-6 d-flex flex-wrap">
            <div class="shipping">
              <span>We ship with:</span>
              <img src="/images/arct-icon.png" alt="運送方式" class="ms-2">
              <img src="/images/dhl-logo.png" alt="DHL" class="ms-2">
            </div>
            <div class="payment-option ms-4">
              <span>Payment Option:</span>
              <img src="/images/visa-card.png" alt="Visa" class="ms-2">
              <img src="/images/paypal-card.png" alt="PayPal" class="ms-2">
              <img src="/images/master-card.png" alt="MasterCard" class="ms-2">
            </div>
          </div>
          <div class="col-md-6 text-end">
            <p>
              © Copyright {{ currentYear }} JADE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 返回頂部按鈕 -->
    <button 
      @click="scrollToTop" 
      class="back-to-top position-fixed end-0 bottom-0 text-decoration-none border-0"
      :class="{ 'show': showBackToTop }"
      aria-label="返回頂部"
    >
      TOP
    </button>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return {
      currentYear: new Date().getFullYear(),
      showBackToTop: false
    }
  },
  methods: {
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    },
    
    handleScroll() {
      this.showBackToTop = window.scrollY > 300
    }
  },
  
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }
}
</script>

<style scoped>
.footer-menu h5 {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.menu-list {
  line-height: 1.8;
}

.item-anchor {
  color: #666;
  transition: color 0.3s ease;
  text-decoration: none;
}

.item-anchor:hover {
  color: #000;
}

.social-links .social-link {
  color: #666;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8f9fa;
}

.social-links .social-link:hover {
  color: #000;
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.social-links svg {
  fill: currentColor;
}

.shipping,
.payment-option {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.shipping span,
.payment-option span {
  font-weight: 500;
  margin-right: 0.5rem;
  white-space: nowrap;
}

.shipping img,
.payment-option img {
  height: 24px;
  object-fit: contain;
}

.back-to-top {
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e4dcd1 0%, #d4ccbf 100%);
  border: 2px solid #e4dcd1;
  color: #333;
  margin: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(228, 220, 193, 0.4);
}

.back-to-top.show {
  opacity: 1;
  visibility: visible;
}

.back-to-top:hover {
  background: linear-gradient(135deg, #d4ccbf 0%, #c4bcaf 100%);
  border-color: #c4bcaf;
  color: #222;
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(212, 204, 191, 0.6);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .footer-menu {
    margin-bottom: 2rem;
  }
  
  .shipping,
  .payment-option {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }
  
  .shipping span,
  .payment-option span {
    margin-bottom: 0.5rem;
  }
  
  .col-md-6.text-end {
    text-align: left !important;
    margin-top: 1rem;
  }
  
  .social-links {
    margin-top: 1rem;
  }
  
  .back-to-top {
    width: 60px;
    height: 60px;
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 15px;
  }
  
  .footer-menu h5 {
    font-size: 1rem;
  }
  
  .menu-list {
    font-size: 0.9rem;
  }
}
</style>
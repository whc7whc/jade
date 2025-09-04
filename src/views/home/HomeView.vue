<template>
  <div class="homepage">
    <!-- 搜尋覆蓋層 -->
    <div v-if="showSearch" id="search" class="search-bar" @click="closeSearchBar" style="background: rgba(255, 255, 255, 0.95);">
      <button type="button" class="btn-close" @click="closeSearchBar"></button>
      <div class="d-flex justify-content-center align-items-center h-100">
        <div class="w-50" @click.stop>
          <form @submit="handleSearch">
            <div class="input-group">
              <input 
                ref="searchInput"
                v-model="searchTerm" 
                type="text" 
                class="form-control" 
                placeholder="搜尋商品..." 
                autocomplete="off"
                style="border-color: #eb5757;"
              >
              <button class="btn" type="submit" style="background-color: #eb5757; color: white;">搜尋</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 主要廣告輪播區 -->
    <section id="main-banner">
      <div id="bannerCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner" id="banner-slides">
          <!-- 預設載入狀態 -->
          <div v-if="bannersLoading" class="carousel-item active">
            <div class="banner-slide">
              <div class="fallback-banner">
                <div>
                  <h1 class="display-3 fw-bold mb-4">載入中...</h1>
                  <p class="lead">請稍候，正在取得最新優惠資訊</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 廣告輪播 -->
          <div 
            v-for="(banner, index) in banners" 
            :key="banner.id || banner.Id || index"
            class="carousel-item" 
            :class="{ active: index === 0 && !bannersLoading }"
            :data-banner-id="banner.id || banner.Id"
          >
            <div class="banner-slide">
              <template v-if="getBannerImageUrl(banner)">
                <img 
                  :src="getBannerImageUrl(banner)"
                  class="d-block w-100" 
                  :alt="getBannerTitle(banner)"
                  @load="() => console.log('✅ 圖片載入成功:', getBannerImageUrl(banner))"
                              @error="handleImageError"
                />
              </template>
              <div v-else class="fallback-banner">
                <div>
                  <h1 class="display-3 fw-bold mb-4">{{ getBannerTitle(banner) }}</h1>
                  <p class="lead">{{ getBannerDescription(banner) }}</p>
                  <small class="text-white-50">未提供圖片</small>
                </div>
              </div>
              
              <!-- 內容覆蓋層 -->
              <div v-if="getBannerTitle(banner) || getBannerDescription(banner)" class="banner-content-overlay">
                <div class="container">
                  <div class="row justify-content-center">
                    <div class="col-md-8 text-center">
                      <h2 v-if="getBannerTitle(banner)" class="banner-title">
                        {{ getBannerTitle(banner) }}
                      </h2>
                      <p v-if="getBannerDescription(banner)" class="banner-description">
                        {{ getBannerDescription(banner) }}
                      </p>
                      <a 
                        v-if="getBannerLinkUrl(banner)" 
                        href="#" 
                        class="btn btn-light btn-lg"
                        @click="handleBannerClick(banner, $event)"
                      >
                        立即查看
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 如果沒有廣告，顯示預設內容 -->
          <div v-if="!bannersLoading && banners.length === 0" class="carousel-item active">
            <div class="banner-slide">
              <div class="fallback-banner">
                <div>
                  <h1 class="display-3 fw-bold mb-4">JADE 時尚電商</h1>
                  <p class="lead mb-4">全台最大的線上時尚購物平台</p>
                  <button class="btn btn-light btn-lg" @click="scrollToCategories">開始購物</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 輪播控制按鈕 -->
        <button v-if="banners.length > 1" class="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">上一個</span>
        </button>
        <button v-if="banners.length > 1" class="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">下一個</span>
        </button>
      </div>
    </section>

    <!-- 商品分類 -->
    <section id="categories" class="categories overflow-hidden py-5">
      <div class="container">
        <h2 class="text-center text-uppercase mb-5">商品分類</h2>
        <div class="row">
          <div class="col-md-4 mb-4" v-for="category in categories" :key="category.id">
            <div class="cat-item image-zoom-effect">
              <div class="category-image-container" @click="goToCategory(category.link)">
                <img 
                  v-if="category.imageUrl" 
                  :src="category.imageUrl" 
                  :alt="category.name"
                  class="category-image"
                  @error="handleCategoryImageError"
                />
                <div v-else class="product-image-placeholder">
                  <span>{{ category.name }}</span>
                </div>
              </div>
              <div class="category-content text-center mt-3">
                <div class="product-button">
                  <router-link :to="category.link" class="btn btn-dark text-uppercase">
                    {{ category.buttonText }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 六大風格館 -->
    <section id="style-galleries" class="style-galleries py-5" style="background-color: #faf6eb;">
      <div class="container">
        <h2 class="text-center text-uppercase mb-5">六大風格館</h2>
        
        <div class="row">
          <!-- 載入狀態 -->
          <div v-if="isLoadingStyleGalleries" class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">載入中...</span>
            </div>
            <p class="mt-3 text-muted">正在載入風格館...</p>
          </div>
          
          <!-- 風格館列表 -->
          <div v-else v-for="gallery in styleGalleries" :key="gallery.id" class="col-md-4 mb-4">
            <div class="style-gallery-item">
              <div class="gallery-image-container" @click="goToStyleGallery(gallery.link)">
                <img 
                  v-if="gallery.image" 
                  :src="gallery.image" 
                  :alt="gallery.name"
                  class="gallery-image"
                  @error="handleGalleryImageError"
                />
                <div v-else class="gallery-image-placeholder">
                  <i :class="gallery.icon" class="fa-3x mb-3"></i>
                  <h4>{{ gallery.name }}</h4>
                </div>
                
                <!-- 風格館名稱覆蓋層 -->
                <div class="gallery-overlay">
                  <h4 class="gallery-title">{{ gallery.name }}</h4>
                  <p class="gallery-description">{{ gallery.description }}</p>
                </div>
              </div>
              
              <div class="gallery-content text-center mt-3">
                <div class="gallery-button">
                  <router-link :to="gallery.link" class="btn btn-outline-dark text-uppercase">
                    {{ gallery.buttonText }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 新品上市 -->
    <section id="new-arrival" class="new-arrival py-5" style="background-color: #ffff;">
      <div class="container">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <h3 class="text-uppercase">新品上市</h3>
          <router-link to="/products?category=new" class="btn-link text-decoration-none" style="color: #4a4a4a;">
            查看全部商品
          </router-link>
        </div>
        
        <!-- 新品輪播 -->
        <div v-if="isLoadingNewProducts" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">載入中...</span>
          </div>
          <p class="mt-3 text-muted">正在載入新品...</p>
        </div>
        
        <div v-else-if="newProducts.length > 0" id="newProductsCarousel" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            <!-- 輪播項目 -->
            <div 
              v-for="(productGroup, groupIndex) in newProductGroups" 
              :key="groupIndex"
              class="carousel-item"
              :class="{ active: groupIndex === 0 }"
            >
              <div class="row">
                <div v-for="product in productGroup" :key="product.id" class="col-md-3 mb-4">
                  <div class="product-item">
                    <div class="product-image-container" @click="goToProduct(product.id)">
                      <img 
                        v-if="product.image" 
                        :src="product.image" 
                        :alt="product.name"
                        class="product-image"
                        @error="handleProductImageError"
                        @load="() => console.log('✅ 商品圖片載入成功:', product.image)"
                      />
                      <div v-else class="product-image-placeholder">
                        <span>{{ product.name }}</span>
                        <small class="d-block text-muted mt-1">無圖片</small>
                      </div>
                    </div>
                    <div class="product-content p-3">
                      <h5 class="text-uppercase fs-6">
                        <router-link :to="`/product/${product.id}`" class="text-decoration-none text-dark product-name-link">
                          {{ product.name }}
                        </router-link>
                      </h5>
                      <p class="text-muted mb-2" :title="product.description">
                        {{ truncateDescription(product.description, 10) }}
                      </p>
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="h6 mb-0">NT$ {{ product.price }}</span>
                        <router-link :to="`/product/${product.id}`" class="btn btn-sm btn-outline-dark text-decoration-none">
                          查看詳情
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 輪播控制按鈕 -->
          <button v-if="newProductGroups.length > 1" class="carousel-control-prev" type="button" data-bs-target="#newProductsCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">上一組</span>
          </button>
          <button v-if="newProductGroups.length > 1" class="carousel-control-next" type="button" data-bs-target="#newProductsCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">下一組</span>
          </button>
          
          <!-- 輪播指示器 -->
          <div v-if="newProductGroups.length > 1" class="carousel-indicators" style="bottom: -50px;">
            <button 
              v-for="(group, index) in newProductGroups" 
              :key="index"
              type="button" 
              :data-bs-target="`#newProductsCarousel`" 
              :data-bs-slide-to="index" 
              :class="{ active: index === 0 }"
              :aria-label="`第 ${index + 1} 組商品`"
            ></button>
          </div>
        </div>
        
        <!-- 沒有商品時的顯示 -->
        <div v-else class="text-center py-5">
          <div class="text-muted">
            <i class="fas fa-box-open fa-3x mb-3"></i>
            <p>目前沒有新品上市</p>
            <router-link to="/products" class="btn btn-outline-primary">
              瀏覽所有商品
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 熱銷商品 -->
    <section id="best-sellers" class="best-sellers py-5">
      <div class="container">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <h3 class="text-uppercase">熱銷商品</h3>
          <router-link to="/products?category=bestseller" class="btn-link text-decoration-none" style="color: #4a4a4a;">
            查看全部商品
          </router-link>
        </div>
        
        <div class="row" id="best-products">
          <!-- 載入狀態 -->
          <div v-if="isLoadingBestProducts" class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">載入中...</span>
            </div>
            <p class="mt-3 text-muted">正在載入熱銷商品...</p>
          </div>
          
          <!-- 熱銷商品列表 -->
          <div v-else-if="bestProducts.length > 0" v-for="product in bestProducts" :key="product.id" class="col-md-3 mb-4">
            <div class="product-item">
              <div class="product-image-container" @click="goToProduct(product.id)">
                <img 
                  v-if="product.image" 
                  :src="product.image" 
                  :alt="product.name"
                  class="product-image"
                  @error="handleProductImageError"
                />
                <div v-else class="product-image-placeholder">
                  <span>{{ product.name }}</span>
                </div>
              </div>
              <div class="product-content p-3">
                <h5 class="text-uppercase fs-6">
                  <router-link :to="`/product/${product.id}`" class="text-decoration-none text-dark product-name-link">
                    {{ product.name }}
                  </router-link>
                </h5>
                <p class="text-muted mb-2" :title="product.description">
                  {{ truncateDescription(product.description, 10) }}
                </p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="h6 mb-0">NT$ {{ product.price }}</span>
                  <router-link :to="`/product/${product.id}`" class="btn btn-sm btn-outline-dark text-decoration-none">
                    查看詳情
                  </router-link>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 沒有商品時的顯示 -->
          <div v-else class="col-12 text-center py-5">
            <div class="text-muted">
              <i class="fas fa-shopping-fire fa-3x mb-3"></i>
              <p>目前沒有熱銷商品</p>
              <router-link to="/products" class="btn btn-outline-primary">
                瀏覽所有商品
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 關於我們 -->
    <section id="about" class="collection bg-light position-relative py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="about-image-container" style="height: 500px;">
              <img 
                src="https://res.cloudinary.com/jadetainan/image/upload/v1755764373/uploads/jadeTainan_638913899703190666.png" 
                alt="關於我們 - JADE" 
                class="img-fluid rounded shadow-sm w-100 h-100"
                style="object-fit: cover;"
              />
            </div>
          </div>
          <div class="col-md-6">
            <div class="collection-content p-4">
              <h2 class="text-uppercase mb-4">關於 JADE</h2>
              <p class="mb-3">
                JADE 致力於為台灣消費者提供最高品質的時尚商品。我們精選來自世界各地的賣家提供優質服飾與配件，讓每位顧客都能找到適合自己的完美單品。
              </p>
              <p class="mb-3">
                自創立以來，我們始終堅持品質第一的理念，與國際知名品牌合作，引進最新的流行趨勢。無論是日常穿搭還是特殊場合，JADE 都能滿足您的需求。
              </p>
              <p class="mb-4">
                我們的使命是讓時尚變得更加親民，透過線上平台，您可以輕鬆購買到最新的流行商品，同時享受優質的購物體驗和完善的售後服務。
              </p>
              <router-link to="/about" class="btn btn-dark text-uppercase">了解更多</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 顧客評價 -->
    <section class="testimonials py-5">
      <div class="container">
        <div class="section-header text-center mb-5">
          <h3 class="text-uppercase">顧客好評</h3>
          <p class="text-muted">來自真實顧客的購物體驗分享</p>
        </div>
        <div class="row">
          <div v-for="testimonial in testimonials" :key="testimonial.id" class="col-md-4 mb-4">
            <div class="testimonial-item text-center p-4">
              <blockquote class="blockquote">
                <p class="mb-3">"{{ testimonial.content }}"</p>
                <footer class="blockquote-footer">
                  {{ testimonial.author }} 
                  <cite :title="testimonial.location">{{ testimonial.location }}</cite>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 電子報訂閱 -->
    <section class="newsletter" style="background: url(/images/pattern-bg.png) no-repeat; background-color:#e4dcd1">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 py-5 my-5">
            <div class="subscribe-header text-center pb-3">
              <h3 class="section-title text-uppercase" style="color:#022c5c">
                接收電子報獲得85折優惠券
              </h3>
            </div>
            <form @submit="handleNewsletterSignup" class="d-flex flex-wrap gap-2">
              <input 
                v-model="newsletterEmail" 
                type="email" 
                name="email" 
                placeholder="Your Email Address" 
                class="form-control form-control-lg"
                required
              >
              <button class="btn btn-primary btn-lg text-uppercase w-100" type="submit">
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Instagram -->
    <section class="instagram position-relative">
      <div class="d-flex justify-content-center w-100 position-absolute bottom-0 z-1 pb-3">
        <a href="https://www.instagram.com/jadetainan?igsh=dW5nZ2FnYnZtOHZy" target="_blank" class="btn btn-primary px-5">
          追蹤我們的 Instagram
        </a>
      </div>
      <div class="instagram-grid">
        <div v-for="(post, index) in instagramPosts" :key="index" class="instagram-item">
          <a :href="post.url" target="_blank" class="instagram-link">
            <img :src="post.imageUrl" :alt="post.caption || 'Instagram post'" class="instagram-image">
          </a>
        </div>
      </div>
    </section>

   
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      // 假的Instagram 貼文
      instagramPosts: [
        {
          imageUrl: 'https://res.cloudinary.com/jadetainan/image/upload/v1755351511/uploads/jadeTainan_638909771098399101.jpg',
          caption: '秋季新品上市'
        },
        {
          imageUrl: 'https://res.cloudinary.com/jadetainan/image/upload/v1755351311/uploads/jadeTainan_638909769046779124.jpg',
          caption: '質感穿搭'
        },
        {
          imageUrl: 'https://res.cloudinary.com/jadetainan/image/upload/v1755351173/uploads/jadeTainan_638909767733344262.jpg',
          caption: '街頭風格'
        },
        {
          imageUrl: 'https://res.cloudinary.com/jadetainan/image/upload/v1755351536/uploads/jadeTainan_638909771359792291.jpg',
          caption: '日常搭配'
        },
        {
          imageUrl: 'https://res.cloudinary.com/jadetainan/image/upload/v1755482524/uploads/jadeTainan_638911081223725676.jpg',
          caption: '精選配件'
        },
        {
          imageUrl: 'https://res.cloudinary.com/jadetainan/image/upload/v1755581202/uploads/jadeTainan_638912067987428547.jpg',
          caption: '時尚單品'
        }
      ],
      // 搜尋相關
      showSearch: false,
      searchTerm: '',
      
      // 廣告輪播
      banners: [
        {
          Id: 1,
          Title: "初秋新品上市",
          Description: "精選秋季新品，早鳥優惠85折",
          ImageUrl: "/images/banner-image-1.jpg",
          LinkUrl: "/products?category=new"
        },
        {
          Id: 2,
          Title: "質感生活提案",
          Description: "嚴選質感單品，打造理想生活",
          ImageUrl: "/images/banner-image-2.jpg",
          LinkUrl: "/products?category=lifestyle"
        },
        {
          Id: 3,
          Title: "夏季特惠",
          Description: "精選商品限時特價",
          ImageUrl: "/images/banner-image-3.jpg",
          LinkUrl: "/products?category=sale"
        }
      ],
      bannersLoading: false,
      
      // 商品分類
      categories: [
        {
          id: 1,
          name: '男裝專區',
          buttonText: '選購男裝',
          link: '/products?categoryId=1',
          imageUrl: 'https://res.cloudinary.com/jadetainan/image/upload/v1756044319/uploads/jadeTainan_638916699106533622.jpg' // 在這裡放上您的圖片網址
        },
        {
          id: 2,
          name: '女裝專區',
          buttonText: '選購女裝',
          link: '/products?categoryId=2',
          imageUrl: 'https://res.cloudinary.com/jadetainan/image/upload/v1755851002/jade-products/jade_product_638914766004695315.jpg' // 在這裡放上您的圖片網址
        },
        {
          id: 3,
          name: '配件專區',
          buttonText: '選購配件',
          link: '/products?categoryId=3',
          imageUrl: 'https://res.cloudinary.com/jadetainan/image/upload/v1756045368/1753844264000-68S2mA_vlg73x.jpg' // 在這裡放上您的圖片網址
        }
      ],
      
      // 六大風格館
      styleGalleries: [
        {
          id: 1,
          name: '韓系館',
          description: '清新甜美，韓式潮流',
          buttonText: '探索韓系',
          link: '/products', // 初始值，會在 loadStyleGalleries 中更新為正確的 styleId
          icon: 'fas fa-heart',
          image: null,
          attributeValueId: null 
        },
        {
          id: 2,
          name: '日系館',
          description: '溫柔優雅，日式美學',
          buttonText: '探索日系',
          link: '/products', // 初始值，會在 loadStyleGalleries 中更新為正確的 styleId
          icon: 'fas fa-leaf',
          image: null,
          attributeValueId: null 
        },
        {
          id: 3,
          name: '歐美館',
          description: '簡約時尚，展現都會魅力',
          buttonText: '探索歐美',
          link: '/products', // 初始值，會在 loadStyleGalleries 中更新為正確的 styleId
          icon: 'fas fa-city',
          image: null,
          attributeValueId: null 
        },
        {
          id: 4,
          name: '工裝館',
          description: '實用機能，工裝美學',
          buttonText: '探索工裝',
          link: '/products', // 初始值，會在 loadStyleGalleries 中更新為正確的 styleId
          icon: 'fas fa-hard-hat',
          image: null,
          attributeValueId: null 
        },
        {
          id: 5,
          name: '插畫館',
          description: '藝術創意，插畫風格',
          buttonText: '探索插畫',
          link: '/products', // 初始值，會在 loadStyleGalleries 中更新為正確的 styleId
          icon: 'fas fa-palette',
          image: null,
          attributeValueId: null 
        },
        {
          id: 6,
          name: '動漫館',
          description: '二次元風格，個性表達',
          buttonText: '探索動漫',
          link: '/products', // 初始值，會在 loadStyleGalleries 中更新為正確的 styleId
          icon: 'fas fa-gamepad',
          image: null,
          attributeValueId: null 
        }
      ],
      isLoadingStyleGalleries: false,
      
      // 商品資料
      newProducts: [], // 從 API 載入新品
      isLoadingNewProducts: false,
      
      bestProducts: [], // 從 API 載入熱銷商品 
      isLoadingBestProducts: false,
      
      // 顧客評價
      testimonials: [
        { 
          id: 1, 
          content: '商品品質超乎預期，服務態度也很好，包裝精美，會繼續支持！', 
          author: '王小明', 
          location: '台北市' 
        },
        { 
          id: 2, 
          content: '快速出貨，商品與網站照片相符，購物體驗很棒！', 
          author: '李小華', 
          location: '台中市' 
        },
        { 
          id: 3, 
          content: '款式新穎，價格合理，客服回覆迅速，推薦給所有愛美的朋友！', 
          author: '張小美', 
          location: '高雄市' 
        }
      ],
      
      // 表單
      newsletterEmail: '',
      
      // API 測試
      apiTestResult: null,
      apiClient: null
    }
  },
  
  computed: {
    // 將新品商品分組，每組 4 個商品
    newProductGroups() {
      const products = this.newProducts
      const groups = []
      for (let i = 0; i < products.length; i += 4) {
        groups.push(products.slice(i, i + 4))
      }
      return groups
    }
  },
  
  mounted() {
    this.initializeApi()
    this.loadHomepageBanners()
    this.loadStyleGalleries()
    this.loadNewProducts()
    this.loadBestProducts()
    this.setupEventListeners()
  },
  
  methods: {
    // ✅ API 客戶端初始化（只保留一個）
    initializeApi() {
      // 🚨 緊急修正：強制使用 Railway API
      const API_BASE_URL = 'https://jadeapi-production.up.railway.app/api'
      
      class ApiClient {
        constructor(baseUrl) {
          this.baseUrl = baseUrl
          this.workingBaseUrl = baseUrl
        }
        
        async request(endpoint, options = {}) {
          const url = `${this.baseUrl}${endpoint}`
          const config = {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...options.headers
            },
            mode: 'cors',
            ...options
          }
          
          console.log(`🌐 API 請求: ${config.method || 'GET'} ${url}`)
          
          try {
            const response = await fetch(url, config)
            console.log(`📡 API 回應狀態: ${response.status}`)
            
            let data
            const contentType = response.headers.get('content-type')
            
            if (contentType && contentType.includes('application/json')) {
              data = await response.json()
              console.log('📄 解析的JSON資料:', data)
            } else {
              const textData = await response.text()
              data = { message: textData }
            }
            
            return {
              success: response.ok,
              status: response.status,
              data: data,
              url: url
            }
            
          } catch (error) {
            console.error('❌ API 請求錯誤:', error)
            return {
              success: false,
              status: 0,
              error: error.message,
              details: error,
              url: url
            }
          }
        }
        
        async get(endpoint) {
          return this.request(endpoint, { method: 'GET' })
        }
        
        async post(endpoint, data) {
          const token = localStorage.getItem('token')
          const headers = {
            'Content-Type': 'application/json'
          }
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
          
          return this.request(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
          })
        }
      }
      
      this.apiClient = new ApiClient(API_BASE_URL)
      console.log('🔧 API 客戶端初始化完成')
    },

    // ✅ 載入首頁廣告
    async loadHomepageBanners() {
      console.log('🚀 開始載入首頁廣告...')
      try {
        const result = await this.apiClient.get('/api/Banners/homepage')
        console.log('📡 首頁廣告 API 回應:', result)
        
        if (result.success && result.data && result.data.data) {
          console.log(`✅ 找到 ${result.data.count} 個廣告:`, result.data.data)
          // 只有在成功獲取到新數據時才更新
          this.banners = result.data.data
          
          // 除錯：檢查每個廣告
          this.banners.forEach((banner, index) => {
            console.log(`🔍 廣告 ${index + 1}:`, {
              Id: banner.Id,
              ImageUrl: banner.ImageUrl,
              Title: banner.Title,
              Description: banner.Description
            })
          })
        }
        
      } catch (error) {
        console.error('❌ 載入廣告失敗:', error)
        // 保留預設廣告，不清空
      }
    },

    // ✅ 超簡化圖片 URL 方法（直接返回後端提供的 URL）
    getBannerImageUrl(banner) {
      const imageUrl = banner.ImageUrl || banner.imageUrl
      console.log('📸 廣告圖片 URL:', imageUrl)
      return imageUrl || null
    },

    // ✅ 取得廣告標題
    getBannerTitle(banner) {
      return banner.Title || banner.title || `精選商品 ${banner.Id}`
    },

    // ✅ 取得廣告描述
    getBannerDescription(banner) {
      return banner.Description || banner.description || '點擊查看更多優質商品'
    },

    // ✅ 取得廣告連結
    getBannerLinkUrl(banner) {
      const linkUrl = banner.LinkUrl || banner.linkUrl
      return linkUrl && linkUrl !== '#' ? linkUrl : '/products'
    },

    // ✅ 處理廣告點擊
    async handleBannerClick(banner, event) {
      event.preventDefault()
      const bannerId = banner.Id || banner.id
      const linkUrl = this.getBannerLinkUrl(banner)
      
      console.log(`📊 記錄廣告點擊: ID ${bannerId}`)
      
      // 記錄點擊
      if (bannerId && this.apiClient) {
        try {
          const clickResult = await this.apiClient.post(`/api/Banners/${bannerId}/click`, {})
          console.log('✅ 點擊記錄成功:', clickResult)
        } catch (error) {
          console.error('❌ 記錄點擊失敗:', error)
        }
      }
      
      // 處理導航
      if (linkUrl && linkUrl !== '#' && linkUrl !== '/products') {
        if (linkUrl.startsWith('http')) {
          window.open(linkUrl, '_blank')
        } else {
          this.$router.push(linkUrl)
        }
      } else {
        // 預設導航到商品頁面
        this.$router.push('/products')
      }
    },

    // ✅ 處理圖片載入錯誤
    handleImageError(event) {
      console.error('❌ 廣告圖片載入失敗:', event.target.src)
      const target = event.target
      const parent = target.parentElement
      
      // 替換為後備內容
      parent.innerHTML = `
        <div class="fallback-banner">
          <div>
            <h1 class="display-3 fw-bold mb-4">精選商品</h1>
            <p class="lead">查看更多優惠商品</p>
            <small class="text-white-50">圖片載入失敗</small>
          </div>
        </div>
      `
    },

    // ✅ 載入六大風格館
    async loadStyleGalleries() {
      console.log('🚀 開始載入六大風格館...')
      this.isLoadingStyleGalleries = true
      
      try {
        // 首先獲取所有商品
        console.log('📡 獲取所有商品進行風格篩選...')
        const allProductsResult = await this.apiClient.get('/api/Products')
        
        if (allProductsResult.success && allProductsResult.data) {
          const allProducts = allProductsResult.data.data || allProductsResult.data.products || allProductsResult.data
          
          if (Array.isArray(allProducts)) {
            console.log(`✅ 獲取到 ${allProducts.length} 個商品，開始風格篩選...`)
            
            // 為每個風格館找代表商品和獲取正確的風格ID
            this.styleGalleries.forEach(gallery => {
              console.log(`🔍 正在為 ${gallery.name} 尋找代表商品...`)
              
              // 篩選包含該風格的商品
              const filteredProducts = allProducts.filter(product => {
                const productAttributeValues = product.productAttributeValues || product.ProductAttributeValues || []
                
                // 檢查商品是否包含該風格屬性
                const hasStyle = productAttributeValues.some(attr => {
                  const attributeValue = attr.attributeValue || attr.AttributeValue
                  if (attributeValue) {
                    const value = attributeValue.value || attributeValue.Value
                    const attributeName = attributeValue.attribute?.name || attributeValue.Attribute?.name
                    
                    // 確保是風格屬性且值匹配
                    if (attributeName === '風格' && value === gallery.name) {
                      // 找到匹配的風格，記錄其 ID
                      const attributeValueId = attributeValue.id || attributeValue.Id
                      if (attributeValueId && !gallery.attributeValueId) {
                        gallery.attributeValueId = attributeValueId
                        // 更新連結為正確的 styleId 參數
                        gallery.link = `/products?styleId=${attributeValueId}`
                        console.log(`🎯 ${gallery.name} 設定風格ID: ${attributeValueId}`)
                      }
                      return true
                    }
                  }
                  return false
                })
                
                return hasStyle
              })
              
              if (filteredProducts.length > 0) {
                const product = filteredProducts[0]
                gallery.image = this.getProductImageUrl(product)
                console.log(`✅ ${gallery.name} 找到代表商品:`, {
                  name: product.name || product.Name,
                  id: product.id || product.Id,
                  image: gallery.image,
                  styleId: gallery.attributeValueId,
                  link: gallery.link
                })
              } else {
                console.log(`⚠️ ${gallery.name} 沒有找到對應的商品`)
                gallery.image = null
              }
            })
          } else {
            console.warn('⚠️ API 回應格式不正確:', allProductsResult.data)
          }
        } else {
          console.error('❌ 獲取商品列表失敗:', allProductsResult)
        }
        
        console.log('✅ 風格館載入完成:', this.styleGalleries)
        
      } catch (error) {
        console.error('❌ 載入風格館失敗:', error)
      } finally {
        this.isLoadingStyleGalleries = false
      }
    },

    // 處理風格館圖片載入錯誤
    handleGalleryImageError(event) {
      console.error('❌ 風格館圖片載入失敗:', event.target.src)
      const target = event.target
      const container = target.parentElement
      
      // 找到風格館名稱
      const galleryName = target.alt || '風格館'
      
      // 替換為後備內容
      container.innerHTML = `
        <div class="gallery-image-placeholder">
          <i class="fas fa-store fa-3x mb-3"></i>
          <h4>${galleryName}</h4>
        </div>
      `
    },

    // 跳轉到風格館頁面
    goToStyleGallery(galleryLink) {
      console.log('🔗 跳轉到風格館頁面:', galleryLink)
      this.$router.push(galleryLink)
    },

    // ✅ 載入新品上市商品
    async loadNewProducts() {
      console.log('🚀 開始載入新品上市商品...')
      this.isLoadingNewProducts = true
      
      try {
        // 嘗試多個可能的 API 端點來獲取最新商品
        let result
        
        // 首先嘗試按創建時間降序排列（最新的在前）
        result = await this.apiClient.get('/api/Products?orderBy=createdAt&order=desc&limit=12')
        
        // 如果不支援 orderBy，嘗試其他參數格式
        if (!result.success) {
          console.log('🔄 嘗試其他排序格式...')
          result = await this.apiClient.get('/api/Products?sortBy=createdAt&sortOrder=desc&limit=12')
        }
        
        // 如果還是不支援，嘗試簡單的排序
        if (!result.success) {
          console.log('🔄 嘗試基本排序...')
          result = await this.apiClient.get('/api/Products?sort=created&limit=12')
        }
        
        // 最後回退：獲取所有商品然後手動排序
        if (!result.success) {
          console.log('🔄 回退：獲取所有商品進行手動排序...')
          result = await this.apiClient.get('/api/Products')
        }
        
        console.log('📡 新品商品 API 回應:', result)
        
        if (result.success && result.data) {
          // 處理不同的 API 回應格式
          let products = result.data.data || result.data.products || result.data
          
          if (Array.isArray(products)) {
            console.log(`✅ 找到 ${products.length} 個商品`)
            
            // 如果獲取的是所有商品，按創建時間排序（最新的在前）
            if (products.length > 12) {
              products = products.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.CreatedAt || a.created_at || 0)
                const dateB = new Date(b.createdAt || b.CreatedAt || b.created_at || 0)
                return dateB - dateA // 降序排列（最新的在前）
              })
              console.log('🔄 已按創建時間排序，最新商品:', products.slice(0, 12))
            }
            
            this.newProducts = products.slice(0, 12).map((product, index) => {
              const mappedProduct = {
                id: product.Id || product.id,
                name: product.Name || product.name || product.ProductName,
                description: product.Description || product.description || '精選新品',
                price: this.formatPrice(product.Price || product.price || 0),
                image: this.getProductImageUrl(product),
                // 保留購物車需要的屬性資料
                productAttributeValues: product.productAttributeValues || product.ProductAttributeValues || [],
                categoryId: product.categoryId || product.CategoryId,
                subCategoryId: product.subCategoryId || product.SubCategoryId,
                originalData: product // 保留原始資料以備後用
              }
              console.log(`🔄 新品 ${index + 1} 映射結果:`, mappedProduct)
              return mappedProduct
            })
          } else {
            console.warn('⚠️ API 回應格式不正確:', result.data)
          }
        }
        
      } catch (error) {
        console.error('❌ 載入新品失敗:', error)
        // 保持空陣列，不顯示假資料
      } finally {
        this.isLoadingNewProducts = false
      }
    },

    // ✅ 載入熱銷商品
    async loadBestProducts() {
      console.log('🚀 開始載入熱銷商品...')
      this.isLoadingBestProducts = true
      
      try {
        // 嘗試多個可能的 API 端點來獲取熱銷商品
        let result
        
        // 首先嘗試按銷售數量降序排列
        result = await this.apiClient.get('/api/Products?orderBy=soldCount&order=desc&limit=4')
        
        // 如果不支援，嘗試按評分排序
        if (!result.success) {
          console.log('🔄 嘗試按評分排序...')
          result = await this.apiClient.get('/api/Products?orderBy=rating&order=desc&limit=4')
        }
        
        // 如果還是不支援，嘗試其他格式
        if (!result.success) {
          console.log('🔄 嘗試其他排序格式...')
          result = await this.apiClient.get('/api/Products?sortBy=soldCount&sortOrder=desc&limit=4')
        }
        
        // 最後回退：獲取所有商品然後手動排序
        if (!result.success) {
          console.log('🔄 回退：獲取所有商品進行手動排序...')
          result = await this.apiClient.get('/api/Products')
        }
        
        console.log('📡 熱銷商品 API 回應:', result)
        
        if (result.success && result.data) {
          // 處理不同的 API 回應格式
          let products = result.data.data || result.data.products || result.data
          
          if (Array.isArray(products)) {
            console.log(`✅ 找到 ${products.length} 個商品`)
            
            // 如果獲取的是所有商品，按銷售數量或評分排序
            if (products.length > 4) {
              products = products.sort((a, b) => {
                // 優先按銷售數量排序，次要按評分排序
                const soldCountA = a.soldCount || a.SoldCount || 0
                const soldCountB = b.soldCount || b.SoldCount || 0
                
                if (soldCountA !== soldCountB) {
                  return soldCountB - soldCountA // 銷售數量降序
                }
                
                // 如果銷售數量相同，按評分排序
                const ratingA = a.rating || a.Rating || 0
                const ratingB = b.rating || b.Rating || 0
                return ratingB - ratingA // 評分降序
              })
              console.log('🔄 已按銷售數量和評分排序，熱銷商品:', products.slice(0, 4))
            }
            
            this.bestProducts = products.slice(0, 4).map((product, index) => {
              const mappedProduct = {
                id: product.Id || product.id,
                name: product.Name || product.name || product.ProductName,
                description: product.Description || product.description || '熱銷精選',
                price: this.formatPrice(product.Price || product.price || 0),
                image: this.getProductImageUrl(product),
                // 保留購物車需要的屬性資料
                productAttributeValues: product.productAttributeValues || product.ProductAttributeValues || [],
                categoryId: product.categoryId || product.CategoryId,
                subCategoryId: product.subCategoryId || product.SubCategoryId,
                originalData: product // 保留原始資料以備後用
              }
              console.log(`🔄 熱銷商品 ${index + 1} 映射結果:`, mappedProduct)
              return mappedProduct
            })
          } else {
            console.warn('⚠️ API 回應格式不正確:', result.data)
          }
        }
        
      } catch (error) {
        console.error('❌ 載入熱銷商品失敗:', error)
        // 保持空陣列，不顯示假資料
      } finally {
        this.isLoadingBestProducts = false
      }
    },

    // ✅ 取得商品圖片 URL
    getProductImageUrl(product) {
      console.log('🖼️ 檢查商品圖片:', product)
      
      // 優先檢查 productImages 陣列
      if (product.productImages && Array.isArray(product.productImages) && product.productImages.length > 0) {
        // 取得第一張圖片
        const firstImage = product.productImages[0]
        const imageUrl = firstImage.imagesUrl || firstImage.imagePath || firstImage.imageUrl
        console.log('📸 從 productImages 找到圖片:', imageUrl)
        return imageUrl
      }
      
      // 嘗試其他可能的圖片欄位名稱
      const imageUrl = product.ImageUrl || product.imageUrl || 
                     product.Image || product.image ||
                     product.MainImage || product.mainImage ||
                     product.ProductImage || product.productImage ||
                     product.Pictures || product.pictures ||
                     product.imagePath || product.imagesUrl
      
      console.log('🔍 找到的圖片 URL:', imageUrl)
      
      // 如果是陣列（多張圖片），取第一張
      if (Array.isArray(imageUrl) && imageUrl.length > 0) {
        const firstImage = imageUrl[0]
        console.log('📸 使用第一張圖片:', firstImage)
        return typeof firstImage === 'object' ? firstImage.url || firstImage.Url || firstImage.imagePath || firstImage.imagesUrl : firstImage
      }
      
      return imageUrl || null
    },

    // ✅ 格式化價格
    formatPrice(price) {
      if (!price || price === 0) return '0'
      
      // 如果已經是字串且包含逗號，直接返回
      if (typeof price === 'string' && price.includes(',')) {
        return price
      }
      
      // 轉換為數字並格式化
      const numPrice = typeof price === 'string' ? parseFloat(price) : price
      return numPrice.toLocaleString('zh-TW')
    },

    // 處理分類圖片載入錯誤
    handleCategoryImageError(event) {
      console.error('❌ 分類圖片載入失敗:', event.target.src)
      const target = event.target
      const container = target.parentElement
      
      // 找到分類名稱
      const categoryName = target.alt || '商品分類'
      
      // 替換為後備內容
      container.innerHTML = `
        <div class="product-image-placeholder">
          <span>${categoryName}</span>
        </div>
      `
    },

    // 處理商品圖片載入錯誤
    handleProductImageError(event) {
      console.error('❌ 商品圖片載入失敗:', event.target.src)
      const target = event.target
      const container = target.parentElement
      
      // 找到商品名稱
      const productName = target.alt || '商品圖片'
      
      // 替換為後備內容
      container.innerHTML = `
        <div class="product-image-placeholder">
          <span>${productName}</span>
          <small class="d-block text-muted mt-1">圖片載入失敗</small>
        </div>
      `
    },

    // API 測試方法 - 檢查商品端點
    async testProductsApi() {
      console.log('🔧 測試商品 API 端點...')
      try {
        const result = await this.apiClient.get('/api/Products')
        console.log('📊 商品 API 測試結果:', result)
        return result
      } catch (error) {
        console.error('❌ 商品 API 測試失敗:', error)
        return { success: false, error: error.message }
      }
    },

    // API 測試方法
    async testBannerConnection() {
      console.log('🔍 測試廣告API連接...')
      try {
        const testResult = await this.apiClient.get('/api/Banners/test-connection')
        console.log('📊 連接測試結果:', testResult)
        
        this.apiTestResult = {
          success: testResult.success,
          data: testResult.data,
          timestamp: new Date().toISOString()
        }
        
        return testResult
      } catch (error) {
        console.error('❌ 連接測試錯誤:', error)
        this.apiTestResult = {
          success: false,
          error: error.message
        }
        return { success: false, error: error.message }
      }
    },

    // 搜尋功能
    openSearchBar() {
      this.showSearch = true
      this.$nextTick(() => {
        if (this.$refs.searchInput) {
          this.$refs.searchInput.focus()
        }
      })
    },
    
    closeSearchBar() {
      this.showSearch = false
      this.searchTerm = ''
    },
    
    handleSearch(event) {
      event.preventDefault()
      
      if (!this.searchTerm.trim()) {
        alert('請輸入搜尋內容')
        return
      }
      
      console.log('🔍 HomeView 搜尋內容:', this.searchTerm)
      // 導航到商品列表頁面並帶上搜尋參數
      this.$router.push({
        path: '/products',
        query: { q: this.searchTerm.trim() }
      }).then(() => {
        console.log('🔍 已導航到產品頁面')
      }).catch((error) => {
        console.error('🔍 導航失敗:', error)
      })
      this.closeSearchBar()
    },
    
    // 商品相關
    // 截斷描述文字
    truncateDescription(description, maxLength = 10) {
      if (!description) return ''
      if (description.length <= maxLength) return description
      return description.substring(0, maxLength) + '...'
    },
    
    // 跳轉到商品詳情頁
    goToProduct(productId) {
      console.log('🔗 跳轉到商品頁面:', productId)
      this.$router.push(`/product/${productId}`)
    },
    
    // 跳轉到商品分類頁面
    goToCategory(categoryLink) {
      console.log('🔗 跳轉到分類頁面:', categoryLink)
      this.$router.push(categoryLink)
    },
    
    // 跳轉到商品詳情頁面（取代原本的加入購物車功能）
    goToProductDetail(product) {
      console.log('� 跳轉到商品詳情:', product)
      this.$router.push(`/product/${product.id}`)
    },
    
    // 保留原本的加入購物車方法，供其他地方使用（如果需要的話）
    async addToCart(product) {
      // 對於首頁商品，直接跳轉到詳情頁面讓用戶選擇屬性
      this.goToProductDetail(product)
    },
    
    getCartCount() {
      // 這裡可以從 localStorage 或 Vuex 取得實際的購物車數量
      return 0
    },
    
    // 電子報訂閱
  handleNewsletterSignup(event) {
  event.preventDefault();

  if (!this.newsletterEmail) return;

  // 呼叫後端 API
  fetch("/api/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: this.newsletterEmail })
  })
    .then(res => {
      if (!res.ok) throw new Error("Server error");
      return res.json();
    })
    .then(() => {
      alert(`🎉 感謝您的訂閱！優惠券已寄送至 ${this.newsletterEmail}`);
      this.newsletterEmail = "";
    })
    .catch(err => {
      console.error("Newsletter error:", err);
      alert("⚠️ 系統錯誤，請稍後再試。");
    });
},
    
    // 滾動到分類區塊
    scrollToCategories() {
      const categoriesSection = document.getElementById('categories')
      if (categoriesSection) {
        const offsetTop = categoriesSection.offsetTop - 90
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        })
      }
    },
    
    // 事件監聽器設置
    setupEventListeners() {
      // ESC 鍵關閉搜尋
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.showSearch) {
          this.closeSearchBar()
        }
      })
    },
    
    // 公開方法供 App.vue 調用
    openSearch() {
      this.openSearchBar()
    },

    // Instagram embed 載入
    loadInstagramScript() {
      // 如果腳本已經載入，直接處理嵌入
      if (window.instgrm) {
        window.instgrm.Embeds.process()
        return
      }

      // 動態創建腳本元素
      const script = document.createElement('script')
      script.async = true
      script.src = '//www.instagram.com/embed.js'
      
      // 監聽腳本載入完成事件
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process()
        }
      }

      // 將腳本添加到文檔
      document.body.appendChild(script)

      // 設置備用檢查
      const checkInterval = setInterval(() => {
        if (window.instgrm) {
          window.instgrm.Embeds.process()
          clearInterval(checkInterval)
        }
      }, 1000)

      // 10秒後清除定時器
      setTimeout(() => clearInterval(checkInterval), 10000)
    },
    
    // API 測試方法
    async testApi() {
      try {
        const result = await this.apiClient.get('/api/OfficialPosts')
        this.apiTestResult = result
      } catch (error) {
        this.apiTestResult = { success: false, error: error.message }
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
/* 主要廣告區域樣式 */
#main-banner {
  margin-top: 0;
  padding: 0;
}

#bannerCarousel {
  width: 100%;
  height: 628px;
  overflow: hidden;
}

.banner-slide {
  height: 628px;
  position: relative;
  overflow: hidden;
  background-color: #faf6eb;
}

.banner-slide img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  background-color: #faf6eb;
}

.fallback-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.banner-content-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
  padding: 2rem 0;
}

.banner-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.banner-description {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

/* 商品相關樣式 */
.product-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #e4dcd1;
  height: 100%;
}

.product-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.product-name-link {
  font-weight: 600;
  transition: color 0.3s ease;
}

.product-name-link:hover {
  color: #eb5757 !important;
  text-decoration: underline !important;
}

.product-image-container {
  position: relative;
  height: 250px;
  overflow: hidden;
  cursor: pointer;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.product-item:hover .product-image {
  transform: scale(1.05);
}

.product-image-placeholder {
  background-color: #f8f9fa;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 0.9rem;
  border-bottom: 1px solid #f0f0f0;
}

.categories .product-image-placeholder {
  height: 350px;
}

/* 分類區域樣式 */
.cat-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.cat-item:hover {
  transform: translateY(-5px);
}

.category-image-container {
  position: relative;
  height: 420px;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.category-image-container:hover {
  transform: translateY(-3px);
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.cat-item:hover .category-image {
  transform: scale(1.05);
}

/* 六大風格館樣式 */
.style-gallery-item {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.style-gallery-item:hover {
  transform: translateY(-5px);
}

.gallery-image-container {
  position: relative;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.style-gallery-item:hover .gallery-image {
  transform: scale(1.05);
}

.gallery-image-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 2rem;
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
  padding: 1.5rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.style-gallery-item:hover .gallery-overlay {
  transform: translateY(0);
}

.gallery-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.gallery-description {
  font-size: 0.9rem;
  margin-bottom: 0;
  opacity: 0.9;
}

.gallery-content {
  padding: 1rem 0;
}

.gallery-button .btn {
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.gallery-button .btn:hover {
  background-color: #7c182e;
  color: white;
  transform: translateY(-2px);
}

/* 搜尋覆蓋層樣式 */
.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95) !important;
  z-index: 1055;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close {
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1056;
}

.btn-close:hover {
  color: #ccc;
}

/* 評價區域樣式 */
.testimonial-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  height: 100%;
}

.testimonial-item:hover {
  transform: translateY(-3px);
}

.blockquote {
  margin-bottom: 0;
}

.blockquote-footer {
  font-size: 0.9rem;
  color: #6c757d;
}

/* 電子報區域樣式 */
.newsletter {
  background-size: cover;
  background-position: center;
}

.newsletter form {
  max-width: 500px;
  margin: 0 auto;
}

.newsletter input {
  flex: 1;
  margin-bottom: 1rem;
}

.newsletter button {
  margin-top: 0;
}

/* Instagram 區域樣式 */
.instagram {
  overflow: hidden;
  background: #fafafa;
  padding: 40px 0;
  position: relative;
}

.instagram-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.instagram-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  transition: transform 0.3s ease;
}

.instagram-item:hover {
  transform: scale(1.02);
}

.instagram-link {
  display: block;
  width: 100%;
  height: 100%;
}

.instagram-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.instagram-link:hover .instagram-image {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .instagram-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    padding: 10px;
    gap: 10px;
  }
  
  .instagram-item {
    min-height: 350px;
  }
  
  .instagram-media {
    min-height: 350px !important;
  }
}

/* 響應式設計 */
@media (max-width: 1200px) {
  #bannerCarousel,
  .banner-slide {
    height: calc(100vw * 628 / 1200);
    min-height: 300px;
    max-height: 500px;
  }
}

@media (max-width: 768px) {
  #bannerCarousel,
  .banner-slide {
    height: 400px;
  }
  
  .banner-slide img {
    object-fit: cover;
  }
  
  .banner-title {
    font-size: 2rem;
  }
  
  .banner-description {
    font-size: 1rem;
  }
  
  .search-bar .w-50 {
    width: 90% !important;
  }
  
  .categories .product-image-placeholder {
    height: 250px;
  }
  
  .product-image-placeholder {
    height: 200px;
  }
  
  .newsletter input {
    margin-bottom: 0.5rem;
  }
  
  .col-6.col-sm-4.col-md-2 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (max-width: 480px) {
  .banner-title {
    font-size: 1.5rem;
  }
  
  .banner-description {
    font-size: 0.9rem;
  }
  
  .banner-content-overlay {
    padding: 1rem 0;
  }
  
  .search-bar .w-50 {
    width: 95% !important;
  }
  
  .btn-close {
    top: 10px;
    right: 10px;
  }
  
  .categories h2,
  .testimonials h3,
  .new-arrival h3,
  .best-sellers h3 {
    font-size: 1.5rem;
  }
}

/* 動畫效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-item,
.cat-item,
.testimonial-item {
  animation: fadeInUp 0.6s ease forwards;
}

/* 載入動畫 */
.carousel-item.active .fallback-banner {
  animation: fadeInUp 0.8s ease;
}

/* 滾動行為 */
html {
  scroll-behavior: smooth;
}

/* 聚焦樣式 */
.search-bar input:focus {
  border-color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

/* API 測試結果樣式 */
.alert pre {
  background-color: rgba(0,0,0,0.05);
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  max-height: 300px;
  overflow-y: auto;
}

/* 輪播控制項樣式 */
#newProductsCarousel .carousel-control-prev,
#newProductsCarousel .carousel-control-next {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  transition: all 0.3s ease;
}

#newProductsCarousel .carousel-control-prev {
  left: -20px;
}

#newProductsCarousel .carousel-control-next {
  right: -20px;
}

#newProductsCarousel .carousel-control-prev:hover,
#newProductsCarousel .carousel-control-next:hover {
  background: rgba(0, 0, 0, 0.3);
  transform: translateY(-50%) scale(1.1);
}

#newProductsCarousel .carousel-control-prev-icon,
#newProductsCarousel .carousel-control-next-icon {
  width: 20px;
  height: 20px;
}

/* 輪播指示器樣式 */
#newProductsCarousel .carousel-indicators {
  margin-bottom: 0;
}

#newProductsCarousel .carousel-indicators button {
  background-color: #dee2e6;
  border: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 5px;
  transition: all 0.3s ease;
}

#newProductsCarousel .carousel-indicators button.active {
  background-color: #c41b29;
  transform: scale(1.2);
}

/* 輪播項目樣式 */
#newProductsCarousel .carousel-item {
  transition: transform 0.6s ease-in-out;
}

@media (max-width: 768px) {
  #newProductsCarousel .carousel-control-prev,
  #newProductsCarousel .carousel-control-next {
    display: none;
  }
}
</style>
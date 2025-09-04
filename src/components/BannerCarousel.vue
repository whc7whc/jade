<template>
  <div id="bannerCarousel" class="carousel slide" data-bs-ride="carousel">
    <div class="carousel-inner">
      <!-- Loading State -->
      <div v-if="loading" class="carousel-item active">
        <div class="banner-slide">
          <div class="fallback-banner">
            <div>
              <h1 class="display-3 fw-bold mb-4">載入中...</h1>
              <p class="lead">請稍候，正在取得最新優惠資訊</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Banners -->
      <div 
        v-for="(banner, index) in banners" 
        :key="banner.Id || index"
        class="carousel-item" 
        :class="{ active: index === 0 && !loading }"
      >
        <div class="banner-slide">
          <img 
            v-if="banner.ImageUrl"
            :src="banner.ImageUrl"
            :alt="banner.Title || '廣告圖片'"
            class="d-block w-100"
            @load="onImageLoad(banner)"
            @error="onImageError(banner, $event)"
          />
          <div v-else class="fallback-banner">
            <div>
              <h1 class="display-3 fw-bold mb-4">{{ banner.Title || '精選商品' }}</h1>
              <p class="lead">{{ banner.Description || '查看更多優惠商品' }}</p>
            </div>
          </div>

          <!-- Overlay Content -->
          <div v-if="banner.Title || banner.Description" class="banner-content-overlay">
            <div class="container">
              <div class="row justify-content-center">
                <div class="col-md-8 text-center">
                  <h2 v-if="banner.Title" class="banner-title">{{ banner.Title }}</h2>
                  <p v-if="banner.Description" class="banner-description">{{ banner.Description }}</p>
                  <a 
                    v-if="banner.LinkUrl"
                    href="#" 
                    class="btn btn-light btn-lg"
                    @click.prevent="onBannerClick(banner)"
                  >
                    立即查看
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <button v-if="banners.length > 1" class="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">上一個</span>
    </button>
    <button v-if="banners.length > 1" class="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">下一個</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'BannerCarousel',
  
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    banners: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    onImageLoad(banner) {
      console.log(`✅ 廣告圖片載入成功:`, banner.ImageUrl)
    },

    onImageError(banner, event) {
      console.error(`❌ 廣告圖片載入失敗:`, banner.ImageUrl)
      const target = event.target
      const parent = target.parentNode

      // 替換為後備內容
      const fallback = document.createElement('div')
      fallback.className = 'fallback-banner'
      fallback.innerHTML = `
        <div>
          <h1 class="display-3 fw-bold mb-4">${banner.Title || '精選商品'}</h1>
          <p class="lead">${banner.Description || '查看更多優惠商品'}</p>
          <small class="text-white-50">圖片載入失敗</small>
        </div>
      `
      parent.replaceChild(fallback, target)
    },

    onBannerClick(banner) {
      this.$emit('banner-click', banner)
    }
  }
}
</script>

<style scoped>
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

/* Responsive */
@media (max-width: 1200px) {
  .banner-slide {
    height: calc(100vw * 628 / 1200);
    min-height: 300px;
    max-height: 500px;
  }
}

@media (max-width: 768px) {
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
}
</style>

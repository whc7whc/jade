<template>
  <div class="blog-post-view">
    <!-- 載入中狀態 -->
    <div v-if="loading" class="container py-5">
      <div class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
        <p class="mt-3">載入文章中...</p>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="container py-5">
      <div class="alert alert-danger text-center">
        <h4>載入失敗</h4>
        <p>{{ error }}</p>
        <button @click="loadPost" class="btn btn-primary">重新載入</button>
        <router-link to="/blog" class="btn btn-secondary ms-2">返回部落格</router-link>
      </div>
    </div>

    <!-- 文章內容 -->
    <article v-else-if="post" class="blog-post-content">
      <!-- 文章封面 -->
      <div class="post-hero" v-if="getPostCoverImage(post)" :style="getHeroStyle(post)">
        <div class="hero-overlay">
          <div class="container">
            <div class="row">
              <div class="col-lg-8 mx-auto text-center text-white">
                <nav aria-label="breadcrumb" class="mb-3">
                  <ol class="breadcrumb justify-content-center">
                    <li class="breadcrumb-item">
                      <router-link to="/blog" class="text-white-50">部落格</router-link>
                    </li>
                    <li class="breadcrumb-item">
                      <router-link 
                        :to="{ path: '/category', query: { category: post.category }}" 
                        class="text-white-50">
                        {{ getPostCategory(post) }}
                      </router-link>
                    </li>
                    <li class="breadcrumb-item active text-white" aria-current="page">
                      {{ post.title }}
                    </li>
                  </ol>
                </nav>
                
                <div class="post-meta mb-3">
                  <span class="badge bg-primary me-2">{{ getPostCategory(post) }}</span>
                  <span class="text-white-50">{{ formatDate(post.publishedAt) }}</span>
                  <span v-if="post.readingTime" class="text-white-50 ms-3">
                    <i class="far fa-clock"></i> {{ post.readingTime }} 分鐘閱讀
                  </span>
                </div>
                
                <h1 class="display-4 fw-bold mb-0">{{ post.title }}</h1>
                
                <p v-if="post.seoDescription" class="lead mt-3">
                  {{ post.seoDescription }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 無封面圖的標題區 -->
      <div v-else class="post-header bg-light py-5">
        <div class="container">
          <div class="row">
            <div class="col-lg-8 mx-auto text-center">
              <nav aria-label="breadcrumb" class="mb-3">
                <ol class="breadcrumb justify-content-center">
                  <li class="breadcrumb-item">
                    <router-link to="/blog">部落格</router-link>
                  </li>
                  <li class="breadcrumb-item">
                    <router-link 
                      :to="{ path: '/category', query: { category: post.category }}">
                      {{ getPostCategory(post) }}
                    </router-link>
                  </li>
                  <li class="breadcrumb-item active" aria-current="page">
                    {{ post.title }}
                  </li>
                </ol>
              </nav>
              
              <div class="post-meta mb-3">
                <span class="badge bg-primary me-2">{{ getPostCategory(post) }}</span>
                <span class="text-muted">{{ formatDate(post.publishedAt) }}</span>
                <span v-if="post.readingTime" class="text-muted ms-3">
                  <i class="far fa-clock"></i> {{ post.readingTime }} 分鐘閱讀
                </span>
              </div>
              
              <h1 class="display-5 fw-bold">{{ post.title }}</h1>
              
              <p v-if="post.seoDescription" class="lead text-muted">
                {{ post.seoDescription }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 文章主要內容 -->
      <div class="container py-5">
        <div class="row">
          <!-- 文章內容區 -->
          <div class="col-lg-8">
            <div class="post-content">
              <!-- 文章作者資訊 -->
              <div class="author-info d-flex align-items-center mb-4 p-3 bg-light rounded">
                <div>
                  <small class="text-muted">
                    發布於 {{ formatDate(post.publishedAt, 'full') }}
                    <span v-if="post.updatedAt && post.updatedAt !== post.createdAt">
                      · 更新於 {{ formatDate(post.updatedAt, 'full') }}
                    </span>
                  </small>
                </div>
              </div>

              <!-- 文章內容 -->
              <div class="article-body" v-html="post.content"></div>

              <!-- 文章圖片 -->
              <div v-if="post.officialPostImages && post.officialPostImages.length" 
                   class="post-images mt-4">
                <h5>相關圖片</h5>
                <div class="row g-3">
                  <div v-for="image in post.officialPostImages" 
                       :key="image.id" 
                       class="col-md-6">
                    <img :src="image.imagePath" 
                         :alt="`文章圖片 ${image.sortOrder}`"
                         class="img-fluid rounded shadow-sm"
                         @click="openImageModal(image)">
                  </div>
                </div>
              </div>

              <!-- 標籤 -->
              <div v-if="post.tags && post.tags.length" class="post-tags mt-4">
                <h6>標籤</h6>
                <span v-for="tag in post.tags" :key="tag" class="badge bg-secondary me-2">
                  {{ tag }}
                </span>
              </div>

              <!-- 社群分享 -->
              <div class="social-share mt-5 p-4 bg-light rounded">
                <h6>分享這篇文章</h6>
                <div class="d-flex gap-2">
                  <button @click="shareToFacebook" class="btn btn-primary btn-sm">
                    <i class="fab fa-facebook-f"></i> Facebook
                  </button>
                  <button @click="shareToTwitter" class="btn btn-info btn-sm">
                    <i class="fab fa-twitter"></i> Twitter
                  </button>
                  <button @click="shareToLinkedIn" class="btn btn-primary btn-sm">
                    <i class="fab fa-linkedin-in"></i> LinkedIn
                  </button>
                  <button @click="copyLink" class="btn btn-secondary btn-sm">
                    <i class="fas fa-link"></i> 複製連結
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 側邊欄 -->
          <div class="col-lg-4">
            <div class="sidebar">
              <!-- 相關文章 -->
              <div class="related-posts mb-4">
                <h5>相關文章</h5>
                <div v-for="relatedPost in relatedPosts" 
                     :key="relatedPost.id" 
                     class="related-post-item d-flex mb-3">
                  <div class="related-post-image me-3">
                    <img :src="getPostCoverImage(relatedPost)" 
                         :alt="relatedPost.title"
                         class="img-fluid rounded"
                         width="80" height="80"
                         style="object-fit: cover;">
                  </div>
                  <div class="related-post-content">
                    <router-link :to="`/blog/post/${relatedPost.id}`" 
                                 class="text-decoration-none">
                      <h6 class="mb-1">{{ truncateTitle(relatedPost.title, 50) }}</h6>
                    </router-link>
                    <small class="text-muted">{{ formatDate(relatedPost.publishedAt, 'short') }}</small>
                  </div>
                </div>
              </div>

              <!-- 文章目錄 -->
              <div class="table-of-contents mb-4" v-if="tableOfContents.length">
                <h5>文章目錄</h5>
                <ul class="list-unstyled">
                  <li v-for="(heading, index) in tableOfContents" :key="index">
                    <a :href="`#heading-${index}`" 
                       class="text-decoration-none"
                       :class="'toc-level-' + heading.level">
                      {{ heading.text }}
                    </a>
                  </li>
                </ul>
              </div>

              <!-- 返回按鈕 -->
              <div class="back-to-blog">
                <router-link to="/blog" class="btn btn-outline-primary w-100">
                  <i class="fas fa-arrow-left"></i> 返回部落格
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 上一篇/下一篇導航 -->
      <div class="post-navigation bg-light py-4">
        <div class="container">
          <div class="row">
            <div class="col-md-6">
              <div v-if="previousPost" class="nav-previous">
                <small class="text-muted">上一篇</small>
                <router-link :to="`/blog/post/${previousPost.id}`" 
                             class="d-block text-decoration-none">
                  <strong>{{ truncateTitle(previousPost.title, 60) }}</strong>
                </router-link>
              </div>
            </div>
            <div class="col-md-6 text-md-end">
              <div v-if="nextPost" class="nav-next">
                <small class="text-muted">下一篇</small>
                <router-link :to="`/blog/post/${nextPost.id}`" 
                             class="d-block text-decoration-none">
                  <strong>{{ truncateTitle(nextPost.title, 60) }}</strong>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>

    <!-- 圖片模態框 -->
    <div v-if="selectedImage" 
         class="image-modal" 
         @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <button class="btn-close" @click="closeImageModal"></button>
        <img :src="selectedImage.imagePath" 
             :alt="`圖片 ${selectedImage.sortOrder}`"
             class="img-fluid">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlogPostView',
  data() {
    return {
      // 文章資料
      post: null,
      loading: true,
      error: null,
      
      // 相關文章
      relatedPosts: [],
      previousPost: null,
      nextPost: null,
      
      // UI 狀態
      selectedImage: null,
      tableOfContents: []
    }
  },
  
  computed: {
    postId() {
      return this.$route.params.id
    }
  },
  
  methods: {
    // 載入文章
    async loadPost() {
      this.loading = true
      this.error = null
      
      try {
        console.log('📖 載入文章 ID:', this.postId)
        
        const response = await fetch(`/api/OfficialPosts/${this.postId}`)
        
        if (!response.ok) {
          throw new Error(`找不到文章 (HTTP ${response.status})`)
        }
        
        const data = await response.json()
        console.log('📖 文章資料:', data)
        
        this.post = data
        
        // 載入相關資料
        await this.loadRelatedPosts()
        this.generateTableOfContents()
        
      } catch (error) {
        console.error('❌ 載入文章失敗:', error)
        this.error = error.message
        
        // 使用測試資料作為備案
        this.loadTestPost()
      } finally {
        this.loading = false
      }
    },
    
    // 載入測試文章（當 API 失敗時）
    loadTestPost() {
      this.post = {
        id: parseInt(this.postId),
        title: "精選文章：2025 春季時尚趨勢",
        seoTitle: "2025春季時尚趨勢",
        seoDescription: "探索 2025 年春季最新的時尚趨勢，從色彩搭配到材質選擇，讓你走在時尚最前端。",
        content: `
          <h2>春季色彩趨勢</h2>
          <p>2025年春季，我們看到了色彩的大膽回歸。明亮的檸檬黃、海洋藍和薰衣草紫成為這個季節的主角。</p>
          
          <h3>主要色彩</h3>
          <ul>
            <li><strong>檸檬黃</strong>：充滿活力的陽光色彩</li>
            <li><strong>海洋藍</strong>：寧靜而深邃的藍色調</li>
            <li><strong>薰衣草紫</strong>：優雅浪漫的紫色系</li>
          </ul>
          
          <h2>材質選擇</h2>
          <p>可持續性依然是時尚界的重要議題。有機棉、亞麻和回收聚酯纖維成為熱門選擇。</p>
          
          <h3>推薦材質</h3>
          <p>天然纖維如有機棉和亞麻不僅環保，還能提供優秀的透氣性和舒適度。</p>
          
          <h2>穿搭建議</h2>
          <p>層次搭配是春季的關鍵。輕薄的開襟衫搭配基本款T恤，既實用又時尚。</p>
        `,
        coverImage: "/images/banner-image-1.jpg",
        category: "時尚趨勢",
        readingTime: 8,
        status: "published",
        publishedAt: new Date().toISOString(),
        createdBy: "JADE 編輯部",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        officialPostImages: [
          {
            id: 1,
            postId: parseInt(this.postId),
            imagePath: "/images/post/post_12.png",
            sortOrder: 1
          },
          {
            id: 2,
            postId: parseInt(this.postId),
            imagePath: "/images/post/post_18.png",
            sortOrder: 2
          }
        ]
      }
      
      this.loadTestRelatedPosts()
      this.generateTableOfContents()
    },
    
    // 載入相關文章
    async loadRelatedPosts() {
      try {
        const response = await fetch('/api/OfficialPosts')
        if (response.ok) {
          const allPosts = await response.json()
          
          // 篩選相同分類的文章，排除當前文章
          this.relatedPosts = allPosts
            .filter(p => p.id !== this.post.id && p.category === this.post.category)
            .slice(0, 3)
            
          // 找出上一篇和下一篇
          const currentIndex = allPosts.findIndex(p => p.id === this.post.id)
          if (currentIndex > 0) {
            this.previousPost = allPosts[currentIndex - 1]
          }
          if (currentIndex < allPosts.length - 1) {
            this.nextPost = allPosts[currentIndex + 1]
          }
        }
      } catch (error) {
        console.error('載入相關文章失敗:', error)
        this.loadTestRelatedPosts()
      }
    },
    
    // 載入測試相關文章
    loadTestRelatedPosts() {
      this.relatedPosts = [
        {
          id: 2,
          title: "冬季穿搭指南",
          category: "時尚趨勢",
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          coverImage: "/images/banner-image-2.jpg"
        },
        {
          id: 3,
          title: "配件搭配技巧",
          category: "時尚趨勢", 
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          coverImage: "/images/banner-image-3.jpg"
        }
      ]
    },
    
    // 生成目錄
    generateTableOfContents() {
      if (!this.post?.content) return
      
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = this.post.content
      
      const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')
      this.tableOfContents = Array.from(headings).map((heading, index) => ({
        text: heading.textContent,
        level: parseInt(heading.tagName.substring(1)),
        id: `heading-${index}`
      }))
      
      // 為標題加上 ID
      this.$nextTick(() => {
        const contentHeadings = document.querySelectorAll('.article-body h1, .article-body h2, .article-body h3, .article-body h4, .article-body h5, .article-body h6')
        contentHeadings.forEach((heading, index) => {
          heading.id = `heading-${index}`
        })
      })
    },
    
    // 工具方法
    getPostCategory(post) {
      return post?.category || 'General'
    },
    
    getPostCoverImage(post) {
      if (post?.coverImage) return post.coverImage
      if (post?.officialPostImages?.length > 0) {
        return post.officialPostImages[0].imagePath
      }
      return '/images/post/default.jpg'
    },
    
    getHeroStyle(post) {
      const coverImage = this.getPostCoverImage(post)
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${coverImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center'
      }
    },
    
    formatDate(dateString, format = 'long') {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const options = {
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        short: { month: 'short', day: 'numeric' },
        full: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      }
      
      return date.toLocaleDateString('zh-TW', options[format])
    },
    
    truncateTitle(title, maxLength = 60) {
      if (!title) return ''
      return title.length > maxLength ? 
        title.substring(0, maxLength) + '...' : 
        title
    },
    
    // 圖片模態框
    openImageModal(image) {
      this.selectedImage = image
    },
    
    closeImageModal() {
      this.selectedImage = null
    },
    
    // 社群分享
    shareToFacebook() {
      const url = encodeURIComponent(window.location.href)
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
    },
    
    shareToTwitter() {
      const url = encodeURIComponent(window.location.href)
      const text = encodeURIComponent(this.post.title)
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
    },
    
    shareToLinkedIn() {
      const url = encodeURIComponent(window.location.href)
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
    },
    
    async copyLink() {
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('連結已複製到剪貼板！')
      } catch (error) {
        console.error('複製失敗:', error)
      }
    }
  },
  
  // 生命週期
  async mounted() {
    await this.loadPost()
  },
  
  // 路由變化時重新載入
  watch: {
    '$route'() {
      if (this.$route.params.id !== this.postId) {
        this.loadPost()
      }
    }
  }
}
</script>

<style scoped>
/* 文章詳情頁樣式 */
.blog-post-view {
  margin-top: 90px;
}

.post-hero {
  position: relative;
  color: white;
}

.hero-overlay {
  background: rgba(0, 0, 0, 0.4);
  width: 100%;
  height: 100%;
}

.breadcrumb-item + .breadcrumb-item::before {
  color: rgba(255, 255, 255, 0.5);
}

.post-header {
  padding: 4rem 0;
}

.author-info {
  border-left: 4px solid #007bff;
}

.article-body {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
}

.article-body h2,
.article-body h3,
.article-body h4 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #222;
}

.article-body p {
  margin-bottom: 1.5rem;
}

.article-body ul,
.article-body ol {
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.post-images img {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-images img:hover {
  transform: scale(1.05);
}

.related-post-item {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.related-post-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.table-of-contents ul {
  padding-left: 0;
}

.table-of-contents li {
  margin-bottom: 0.5rem;
}

.table-of-contents a {
  color: #666;
  padding: 0.25rem 0;
  display: block;
}

.table-of-contents a:hover {
  color: #007bff;
}

.toc-level-1 { padding-left: 0; }
.toc-level-2 { padding-left: 1rem; }
.toc-level-3 { padding-left: 2rem; }

.post-navigation {
  border-top: 1px solid #eee;
}

.nav-previous,
.nav-next {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.nav-previous:hover,
.nav-next:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 圖片模態框 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-content img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.btn-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .post-hero {
    min-height: 300px !important;
  }
  
  .post-hero h1 {
    font-size: 2rem !important;
  }
  
  .article-body {
    font-size: 1rem;
  }
  
  .image-modal {
    padding: 1rem;
  }
}
</style>
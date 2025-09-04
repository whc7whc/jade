<template>
  <div class="blog-page">
    <!-- 文章精選區塊 -->
    <section class="official_post" style="margin-top: 0;">
      <div class="container-fluid">
        <div class="row justify-content-between" id="officialContainer">
          <!-- 文章卡片 -->
          <div v-for="(post, index) in featuredPosts" 
               :key="post.id" 
               class="official_post_1" 
               :class="'official_post_bg_' + (index + 1)"
               @click="goToPost(post.id)"
               :style="getPostBackgroundStyle(post)">
            <div class="official_post_iner text-center">
              <router-link :to="{ path: '/blog/category', query: { category: post.category }}">
                <h5>{{ getPostCategory(post) }}</h5>
              </router-link>
              <router-link :to="{ path: '/blog/post/' + post.id }">
                <h2>{{ truncateTitle(post.title) }}</h2>
              </router-link>
              <p>{{ formatDate(post.publishedAt) }}</p>
            </div>
          </div>
          
          <!-- 載入中狀態 -->
          <div v-if="loading" class="official_post_1 official_post_bg_1">
            <div class="official_post_iner text-center">
              <h5>載入中...</h5>
            </div>
          </div>
          
          <!-- 錯誤狀態 -->
          <div v-if="error" class="official_post_1 official_post_bg_1">
            <div class="official_post_iner text-center">
              <h5>載入失敗</h5>
              <p>{{ error }}</p>
              <button @click="loadPosts" class="btn btn-dark mt-3">重新載入</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 電子報訂閱區塊 -->
    <div class="subscribe_form py-5 my-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="subscribe_form_iner text-center bg-white p-5 rounded shadow-sm">
              <h3 class="mb-4" style="color:#022c5c">訂閱電子報</h3>
              <p class="text-muted mb-4">訂閱我們的電子報，獲取最新消息和優惠資訊！</p>
              <form @submit.prevent="handleNewsletterSignup" class="d-flex flex-column flex-md-row justify-content-center gap-3">
                <div class="flex-grow-1" style="max-width: 400px;">
                  <input v-model="newsletterEmail" 
                         type="email" 
                         class="form-control form-control-lg" 
                         placeholder="請輸入您的 Email" 
                         required>
                </div>
                <div>
                  <button type="submit" class="btn_1 btn-lg px-4">立即訂閱</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文章列表區塊 -->
    <section class="all_post section_padding">
      <div class="container">
        <div class="row">
          <!-- 主要文章列表 -->
          <div class="col-lg-8">
            <div class="row">
              <div v-for="post in posts" :key="post.id" class="col-lg-6 col-sm-6">
                <div class="single_post post_1">
                  <div class="single_post_img">
                    <img :src="getPostCoverImage(post)" :alt="post.title">
                  </div>
                  <div class="single_post_text text-center">
                    <router-link :to="{ path: '/blog/category', query: { category: post.category }}">
                      <h5>{{ getPostCategory(post) }}</h5>
                    </router-link>
                    <router-link :to="{ path: '/blog/post/' + post.id }">
                      <h2>{{ truncateTitle(post.title) }}</h2>
                    </router-link>
                    <p>{{ formatDate(post.publishedAt) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分頁 -->
            <div class="page_pageniation">
              <nav aria-label="Page navigation">
                <ul class="pagination justify-content-center">
                  <li :class="['page-item', { disabled: currentPage === 1 }]">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
                  </li>
                  <li v-for="page in totalPages" 
                      :key="page" 
                      :class="['page-item', { active: currentPage === page }]">
                    <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                  </li>
                  <li :class="['page-item', { disabled: currentPage === totalPages }]">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <!-- 側邊欄 -->
          <div class="col-lg-4">
            <div class="sidebar_widget">
              <!-- 搜尋框 -->
              <div class="single_sidebar_wiget search_form_widget">
                <form @submit.prevent="handleSearch">
                  <div class="form-group">
                    <input v-model="searchTerm" 
                           type="text" 
                           class="form-control" 
                           placeholder="Search Keyword"
                           @focus="$event.target.placeholder = ''"
                           @blur="$event.target.placeholder = 'Search Keyword'">
                           <p></p>
                    <button type="submit" class="btn_1">search</button>
                  </div>
                </form>
              </div>

              <!-- 分類列表 -->
              <div class="single_sidebar_wiget">
                <div class="sidebar_tittle">
                  <h3>文章分類</h3>
                </div>
                <div class="single_catagory_item category">
                  <ul class="list-unstyled">
                    <li v-for="category in categories" :key="category.name">
                      <router-link :to="{ path: '/blog/category', query: { category: category.name }}">
                        {{ category.name }}
                        <span>({{ category.count }})</span>
                      </router-link>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- 熱門文章 -->
              <div class="single_sidebar_wiget">
                <div class="sidebar_tittle mb-4">
                  <h3>熱門文章</h3>
                </div>
                <div v-for="post in popularPosts" 
                     :key="post.id" 
                     class="popular-post-item mb-3 p-3">
                  <router-link :to="{ path: '/blog/post/' + post.id }" class="text-decoration-none">
                    <h5 class="mb-2">{{ truncateTitle(post.title, 40) }}</h5>
                    <div class="post-meta">
                      <small class="text-muted">
                        {{ formatDate(post.publishedAt, 'short') }}
                      </small>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'BlogView',
  data() {
    return {
      // API 相關
      loading: true,
      error: null,
      posts: [],
      featuredPosts: [],
      popularPosts: [],
      
      // 分頁
      currentPage: 1,
      postsPerPage: 10,
      totalPosts: 0,
      
      // 搜尋和篩選
      searchTerm: '',
      categories: [
        { name: '生活', count: 0 },
        { name: '時尚', count: 0 },
        { name: '活動', count: 0 },
        { name: '其他', count: 0 },
      ],
      
      // 表單
      newsletterEmail: '',
      
      // Instagram Feed
      instagramFeed: [
        { url: '/images/insta/instagram_1.jpg', link: '#' },
        { url: '/images/insta/instagram_2.jpg', link: '#' },
        { url: '/images/insta/instagram_3.jpg', link: '#' },
        { url: '/images/insta/instagram_4.jpg', link: '#' },
        { url: '/images/insta/instagram_5.jpg', link: '#' },
        { url: '/images/insta/instagram_6.jpg', link: '#' }
      ]
    }
  },
  
  computed: {
    totalPages() {
      return Math.ceil(this.totalPosts / this.postsPerPage)
    }
  },
  
  methods: {
    // 更新分類計數
    updateCategoryCounts(posts) {
      // 計算每個分類的文章數量
      const categoryCounts = posts.reduce((acc, post) => {
        const category = post.category || 'General'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})

      // 更新分類列表
      this.categories = this.categories.map(category => ({
        ...category,
        count: categoryCounts[category.name] || 0
      }))
    },

    // 資料載入
    async loadPosts() {
      this.loading = true
      this.error = null
      
      try {
        console.log('開始載入文章...')
        
        // 使用完整的 API 路徑
        const response = await fetch('/api/OfficialPosts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        console.log('API Response Status:', response.status)
        console.log('API Response Headers:', response.headers)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        // 先檢查回應內容
        const text = await response.text()
        console.log('=== RAW API RESPONSE ===')
        console.log(text)
        console.log('=== END RAW RESPONSE ===')
        
        let data
        try {
          // 如果回應不為空，才嘗試解析 JSON
          data = text ? JSON.parse(text) : []
          
          console.log('=== PARSED API DATA ===')
          console.log('Data type:', typeof data)
          console.log('Is array:', Array.isArray(data))
          console.log('Data keys:', Object.keys(data))
          console.log('Full data:', data)
          
          // 如果是陣列，顯示第一個元素的結構
          if (Array.isArray(data) && data.length > 0) {
            console.log('First item structure:', Object.keys(data[0]))
            console.log('First item:', data[0])
          }
          
          // 如果是物件，檢查可能的資料屬性
          if (typeof data === 'object' && !Array.isArray(data)) {
            console.log('Object properties:', Object.keys(data))
            
            // 檢查常見的資料屬性
            if (data.Data) console.log('Found Data property:', data.Data)
            if (data.data) console.log('Found data property:', data.data)
            if (data.posts) console.log('Found posts property:', data.posts)
            if (data.result) console.log('Found result property:', data.result)
          }
          
          console.log('=== END PARSED DATA ===')
        } catch (jsonError) {
          console.error('JSON Parse Error:', jsonError)
          console.log('Using fallback test data...')
          
          // 使用測試資料作為備案
          data = [
            {
              id: 1,
              title: "2025春季新品預覽",
              description: "搶先看春季最新時尚趨勢",
              category: "新品",
              publishedAt: new Date().toISOString(),
              status: "Published",
              coverImage: "/images/banner-image-1.jpg",
              content: "春季新品即將上市，敬請期待..."
            },
            {
              id: 2,
              title: "冬季穿搭指南",
              description: "專業造型師教你冬季穿搭技巧",
              category: "穿搭",
              publishedAt: new Date(Date.now() - 86400000).toISOString(),
              status: "Published",
              coverImage: "/images/banner-image-2.jpg",
              content: "冬季穿搭的關鍵在於層次..."
            }
          ]
        }
        
        // 根據實際的 API 回應結構來處理資料
        let posts = []
        
        if (Array.isArray(data)) {
          console.log('API 回傳陣列格式，直接使用')
          posts = data
        } else if (data && typeof data === 'object') {
          // 嘗試各種可能的屬性名稱
          if (data.Data && Array.isArray(data.Data)) {
            console.log('使用 data.Data 屬性')
            posts = data.Data
          } else if (data.data && Array.isArray(data.data)) {
            console.log('使用 data.data 屬性')
            posts = data.data
          } else if (data.posts && Array.isArray(data.posts)) {
            console.log('使用 data.posts 屬性')
            posts = data.posts
          } else if (data.result && Array.isArray(data.result)) {
            console.log('使用 data.result 屬性')
            posts = data.result
          } else {
            console.warn('無法識別的 API 回應格式:', data)
            posts = []
          }
        } else {
          console.warn('API 回應格式錯誤:', data)
          posts = []
        }
        
        console.log('處理後的 posts 陣列:', posts)
        console.log('Posts 數量:', posts.length)
        
        // 如果有文章，顯示第一篇的結構
        if (posts.length > 0) {
          console.log('第一篇文章的屬性:', Object.keys(posts[0]))
          console.log('第一篇文章內容:', posts[0])
        }
        
        // 過濾掉社會責任分類的文章
        const filteredPosts = posts.filter(post => {
          // 檢查各種可能的分類屬性名稱
          const category = post.Category || post.category || post.CATEGORY || ''
          const isSocialResponsibility = category === '社會責任'
          
          if (isSocialResponsibility) {
            console.log(`過濾掉社會責任文章: ${post.Title || post.title} (ID: ${post.Id || post.id})`)
          }
          
          return !isSocialResponsibility && this.isPostPublished(post)
        })
        
        console.log('過濾後的文章數量:', filteredPosts.length)
        
        // 設置精選文章（前3篇）
        this.featuredPosts = filteredPosts.slice(0, 3)
        
        // 設置一般文章列表
        this.posts = filteredPosts
        this.totalPosts = filteredPosts.length
        
        console.log('Featured Posts:', this.featuredPosts)
        console.log('All Posts:', this.posts)
        
        // 設置熱門文章（這裡簡單用最新的3篇）
        this.popularPosts = filteredPosts.slice(0, 3)
        
        // 更新分類計數
        this.updateCategoryCounts(filteredPosts)
        
      } catch (error) {
        console.error('載入文章失敗:', error)
        this.error = error.message
        
        // 即使 API 失敗，也提供一些測試資料
        console.log('API 失敗，使用備用資料...')
        const fallbackData = [
          {
            id: 1,
            title: "夏日穿搭：街頭風格",
            description: "要如何在夏日穿上街頭風的裝飾呢",
            category: "測試",
            publishedAt: new Date().toISOString(),
            status: "Published",
            coverImage: "/images/banner-image-1.jpg"
          },
          {
            id: 2,
            title: "測試文章 2", 
            description: "這是另一篇測試文章",
            category: "測試",
            publishedAt: new Date().toISOString(),
            status: "Published",
            coverImage: "/images/banner-image-2.jpg"
          }
        ]
        
        this.featuredPosts = fallbackData
        this.posts = fallbackData
        this.popularPosts = fallbackData
        this.totalPosts = fallbackData.length
        
      } finally {
        this.loading = false
      }
    },
    
    // 文章處理方法
    isPostPublished(post) {
      // 檢查各種可能的狀態屬性名稱
      const status = post.Status || post.status || post.STATE || ''
      return status.toLowerCase() === 'published'
    },
    
    getPostCategory(post) {
      return post.Category || post.category || 'General'
    },
    
    truncateTitle(title, maxLength = 60) {
      if (!title) return 'No title'
      return title.length > maxLength ? 
        title.substring(0, maxLength) + '...' : 
        title
    },
    
    formatDate(dateString, format = 'long') {
      if (!dateString) return 'No date'
      
      const date = new Date(dateString)
      const options = format === 'long' ? 
        { year: 'numeric', month: 'long', day: 'numeric' } :
        { month: 'short', day: 'numeric' }
      
      return format === 'long' ?
        'Posted on ' + date.toLocaleDateString('en-US', options) :
        date.toLocaleDateString('en-US', options)
    },
    
    getPostCoverImage(post) {
      // 檢查各種可能的圖片屬性名稱
      if (post.CoverImage || post.coverImage) {
        return post.CoverImage || post.coverImage
      }
      
      if (post.OfficialPostImages?.length > 0) {
        const sortedImages = post.OfficialPostImages
          .sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0))
        return sortedImages[0].ImagePath
      }
      
      if (post.officialPostImages?.length > 0) {
        const sortedImages = post.officialPostImages
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        return sortedImages[0].imagePath
      }
      
      return '/images/post/default.jpg'
    },
    
    getPostBackgroundStyle(post) {
      const coverImage = this.getPostCoverImage(post)
      return coverImage ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${coverImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}
    },
    
    // 用戶互動方法
    goToPost(postId) {
      this.$router.push(`/blog/post/${postId}`)
    },
    
    handleSearch() {
      if (!this.searchTerm.trim()) {
        alert('請輸入搜尋內容')
        return
      }
      
      this.$router.push({
        path: '/search',
        query: { q: this.searchTerm }
      })
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
          alert(`感謝您的訂閱！確認信已發送至 ${this.newsletterEmail}`);
          this.newsletterEmail = "";
        })
        .catch(err => {
          console.error("Newsletter error:", err);
          alert("訂閱失敗，請稍後再試。");
        });
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        // 這裡可以加入分頁載入邏輯
      }
    }
  },
  
  mounted() {
    this.loadPosts()
  }
}
</script>

<style scoped>
/* 全域樣式 */
.blog-page {
  margin-top: 10px;
  background-color: #fafafa;
}

/* 覆蓋 Bootstrap 的默認連結顏色 */
.blog-page a {
  color: inherit;
  text-decoration: none;
}

.blog-page .btn-primary {
  background-color: #022c5c;
  border-color: #022c5c;
}

.blog-page .btn-primary:hover {
  background-color: #034694;
  border-color: #034694;
}

.blog-page .badge.bg-primary {
  background-color: #022c5c !important;
}

/* 精選文章區塊 */
.official_post {
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.official_post_1 {
  padding: 8rem 2rem;
  text-align: center;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  color:#eee;
}

.official_post_1:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.official_post_bg_1 { background-color: #fff; }
.official_post_bg_2 { background-color: #fff; }
.official_post_bg_3 { background-color: #fff; }

/* 電子報區域樣式 */
.btn_1 {
  background-color: #022c5c;
  color: #fff;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 5px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn_1:hover {
  background-color: #034694;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* 文章卡片樣式 */
.single_post {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.single_post:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.single_post_img img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.single_post_text {
  padding: 1.5rem;
}

.single_post_text a {
  text-decoration: none;
}

.single_post_text h2 {
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.single_post_text h5 {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.single_post_text a:hover h2 {
  color: #022c5c;
}

/* 分頁樣式 */
.pagination {
  margin-top: 2rem;
}

.pagination .page-link {
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  margin: 0 0.2rem;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.pagination .page-item:not(.active) .page-link:hover {
  background-color: #f8f9fa;
  color: #022c5c;
}

.pagination .active .page-link {
  background-color: #022c5c;
  color: #fff;
}

.pagination .disabled .page-link {
  color: #999;
  background-color: transparent;
  cursor: not-allowed;
}

/* 側邊欄樣式 */
.sidebar_widget {
  background: #fff;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.single_sidebar_wiget {
  margin-bottom: 2rem;
}

.sidebar_tittle h3 {
  position: relative;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #022c5c;
}

.sidebar_tittle h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 2px;
  background-color: #022c5c;
}

/* 熱門文章樣式 */
.popular-post-item {
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
  transition: all 0.3s ease;
}

.popular-post-item:last-child {
  border-bottom: none;
}

.popular-post-item:hover {
  background-color: #f8f9fa;
  padding-left: 1rem;
}

.popular-post-item h5 {
  color: #333;
  font-size: 1rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.popular-post-item .post-meta {
  color: #666;
  font-size: 0.875rem;
}

.popular-post-item a {
  text-decoration: none;
}

.popular-post-item:hover h5 {
  color: #022c5c;
}

/* 社群分享樣式 */
.social_share_icon {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social_share_icon a {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
  color: #022c5c;
  transition: all 0.3s ease;
}

.social_share_icon a:hover {
  background: #022c5c;
  color: #fff;
  transform: translateY(-2px);
}

/* 分類列表樣式 */
.single_catagory_item.category {
  margin-bottom: 2rem;
}

.single_catagory_item ul li {
  margin-bottom: 0.75rem;
}

.single_catagory_item ul li a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
}

.single_catagory_item ul li a:hover {
  color: #022c5c;
  padding-left: 0.5rem;
}

.single_catagory_item ul li a span {
  background: #f8f9fa;
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #666;
}

/* 訂閱區塊 */
.subscribe_form {
  background-color: #f8f9fa;
  position: relative;
}

.subscribe_form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(2, 44, 92, 0.03);
  pointer-events: none;
}

.subscribe_form_iner {
  border-radius: 15px;
}

/* 按鈕樣式 */
@media (max-width: 768px) {
  .blog-page {
    margin-top: 60px;
  }
  
  .official_post_1 {
    padding: 4rem 1rem;
  }
  
  .single_post_img img {
    height: 200px;
  }
  
  .subscribe_form_iner {
    padding: 2rem !important;
  }
  
  .sidebar_widget {
    margin-top: 2rem;
  }
}
</style>

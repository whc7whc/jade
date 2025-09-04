<template>
  <div class="category-page">
    <!-- 分類導航標籤 -->
    <section class="category-nav-tabs">
      <div class="tabs-wrapper">
        <!-- 回到部落格首頁按鈕 -->
        <button class="blog-home-btn" @click="goToBlogHome">
          <i class="fas fa-arrow-left"></i>
          <span>部落格首頁</span>
        </button>
        
        <!-- 分類標籤 -->
        <div class="category-tabs">
          <button 
            v-for="category in categories" 
            :key="category.name"
            :class="['category-tab', { active: categoryName === category.name }]"
            @click="switchCategory(category.name)">
            <i :class="category.icon"></i>
            <span>{{ category.name }}</span>
            <small class="tab-count">{{ category.count }}</small>
          </button>
        </div>
      </div>
    </section>

    <!-- 精簡的標題區 -->
    <section class="category-header-simple">
      <div class="container">
        <div class="header-info">
          <h1 class="current-category">
            <i :class="getCategoryIcon(categoryName)"></i>
            {{ categoryName }}
          </h1>
          <p class="posts-summary">{{ totalPosts }} 篇文章</p>
        </div>
      </div>
    </section>

    <!-- 文章列表區 - 重新設計 -->
    <section class="category-posts">
      <div class="container">
        <!-- 載入中狀態 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-content">
            <div class="custom-spinner"></div>
            <p class="loading-text">載入文章中...</p>
          </div>
        </div>

        <!-- 錯誤狀態 -->
        <div v-else-if="error" class="error-state">
          <div class="error-content">
            <div class="error-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4 class="error-title">載入失敗</h4>
            <p class="error-message">{{ error }}</p>
            <div class="error-actions">
              <button @click="loadPosts" class="retry-btn">
                <i class="fas fa-redo me-2"></i>重新載入
              </button>
              <router-link to="/blog" class="back-btn">
                <i class="fas fa-arrow-left me-2"></i>返回部落格
              </router-link>
            </div>
          </div>
        </div>

        <!-- 無文章狀態 -->
        <div v-else-if="!posts.length" class="empty-state">
          <div class="empty-content">
            <div class="empty-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <h3 class="empty-title">暫無文章</h3>
            <p class="empty-message">該分類下目前沒有任何文章</p>
            <router-link to="/blog" class="empty-btn">
              <i class="fas fa-arrow-left me-2"></i>返回部落格
            </router-link>
          </div>
        </div>

        <!-- 文章列表 -->
        <div v-else>
          <!-- 篩選和排序控制 -->
          <div class="posts-controls">
            <div class="controls-left">
              <h5 class="posts-count">
                找到 <span class="count-number">{{ totalPosts }}</span> 篇文章
              </h5>
            </div>
            <div class="controls-right">
              <select class="sort-select" v-model="sortBy" @change="loadPosts">
                <option value="newest">最新發布</option>
                <option value="oldest">最早發布</option>
                <option value="title">標題排序</option>
              </select>
            </div>
          </div>

          <!-- 文章卡片網格 -->
          <div class="posts-grid">
            <div v-for="post in posts" 
                 :key="post.id" 
                 class="post-card"
                 @click="navigateToPost(post.id)">
              <div class="card-image-container">
                <img :src="getPostCoverImage(post)" 
                     :alt="post.title"
                     class="card-image">
                <div class="card-overlay">
                  <div class="overlay-content">
                    <i class="fas fa-eye"></i>
                    <span>閱讀文章</span>
                  </div>
                </div>
              </div>
              
              <div class="card-content">
                <div class="card-meta">
                  <span class="post-date">
                    <i class="fas fa-calendar me-1"></i>
                    {{ formatDate(post.publishedAt) }}
                  </span>
                  <span class="post-category">{{ categoryName }}</span>
                </div>
                
                <h3 class="card-title">
                  {{ truncateTitle(post.title) }}
                </h3>
                
                <p v-if="post.description" class="card-description">
                  {{ truncateDescription(post.description) }}
                </p>
                
                <div class="card-footer">
                  <span class="read-more">
                    閱讀更多 <i class="fas fa-arrow-right ms-1"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分頁 -->
          <div v-if="totalPages > 1" class="pagination-container">
            <nav aria-label="Page navigation">
              <ul class="custom-pagination">
                <li :class="['page-item', { disabled: currentPage === 1 }]">
                  <button class="page-btn prev-btn" 
                          @click="changePage(currentPage - 1)"
                          :disabled="currentPage === 1">
                    <i class="fas fa-chevron-left"></i>
                    <span>上一頁</span>
                  </button>
                </li>
                
                <li v-for="page in getVisiblePages()" 
                    :key="page" 
                    :class="['page-item', { active: currentPage === page }]">
                  <button class="page-btn number-btn" 
                          @click="changePage(page)"
                          :class="{ active: currentPage === page }">
                    {{ page }}
                  </button>
                </li>
                
                <li :class="['page-item', { disabled: currentPage === totalPages }]">
                  <button class="page-btn next-btn" 
                          @click="changePage(currentPage + 1)"
                          :disabled="currentPage === totalPages">
                    <span>下一頁</span>
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'CategoryView',
  data() {
    return {
      posts: [],
      loading: true,
      error: null,
      currentPage: 1,
      postsPerPage: 9,
      totalPosts: 0,
      sortBy: 'newest',
      categories: [
        { name: '所有分類', icon: 'fas fa-th-large', count: 0 },
        { name: '生活', icon: 'fas fa-heart', count: 0 },
        { name: '時尚', icon: 'fas fa-gem', count: 0 },
        { name: '活動', icon: 'fas fa-calendar-alt', count: 0 },
        { name: '其他', icon: 'fas fa-folder', count: 0 }
      ]
    }
  },

  computed: {
    categoryName() {
      return this.$route.query.category || '所有分類'
    },
    totalPages() {
      return Math.ceil(this.totalPosts / this.postsPerPage)
    }
  },

  methods: {
    getCategoryIcon(category) {
      const icons = {
        '新品': 'fas fa-star',
        '穿搭': 'fas fa-tshirt',
        '品牌': 'fas fa-crown',
        '生活': 'fas fa-heart',
        '時尚': 'fas fa-gem',
        '所有分類': 'fas fa-th-large'
      }
      return icons[category] || 'fas fa-folder'
    },

    async loadPosts() {
      this.loading = true
      this.error = null
      console.log('🔍 開始載入文章，當前分類:', this.categoryName)

      try {
        console.log('📡 發送 API 請求到 /api/OfficialPosts')
        const response = await fetch('/api/OfficialPosts')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('📥 API 回應資料:', data)
        
        // 處理不同的 API 回應格式
        let allPosts = []
        if (Array.isArray(data)) {
          allPosts = data
        } else if (data && Array.isArray(data.data)) {
          allPosts = data.data
        } else if (data && Array.isArray(data.posts)) {
          allPosts = data.posts
        } else {
          throw new Error('API 回應格式不正確')
        }
        
        console.log('✅ 成功取得文章:', allPosts.length, '篇')
        
        // 更新分類計數
        this.updateCategoryCounts(allPosts)
        
        // 篩選該分類的文章
        let filteredPosts
        if (this.categoryName === '所有分類') {
          filteredPosts = allPosts
          console.log('📋 顯示所有分類的文章')
        } else {
          filteredPosts = allPosts.filter(post => {
            const postCategory = post.category || 'General'
            const matchesCategory = postCategory === this.categoryName
            console.log(`📝 文章 "${post.title}" 的分類是 "${postCategory}", 是否匹配 "${this.categoryName}": ${matchesCategory}`)
            return matchesCategory
          })
        }
        
        // 排序
        filteredPosts = this.sortPosts(filteredPosts)
        
        console.log('✅ 篩選和排序後的文章:', filteredPosts.length, '篇')
        this.totalPosts = filteredPosts.length

        // 分頁處理
        const start = (this.currentPage - 1) * this.postsPerPage
        const end = start + this.postsPerPage
        this.posts = filteredPosts.slice(start, end)
        
        console.log('📄 當前頁面顯示文章:', this.posts.length, '篇')

      } catch (error) {
        console.error('❌ 載入文章發生錯誤:', error)
        this.error = error.message || '載入文章失敗，請稍後再試'
        this.posts = []
        this.totalPosts = 0
      } finally {
        this.loading = false
      }
    },

    sortPosts(posts) {
      switch (this.sortBy) {
        case 'newest':
          return posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        case 'oldest':
          return posts.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
        case 'title':
          return posts.sort((a, b) => a.title.localeCompare(b.title, 'zh-TW'))
        default:
          return posts
      }
    },

    getPostCoverImage(post) {
      if (post?.coverImage) return post.coverImage
      if (post?.officialPostImages?.length > 0) {
        return post.officialPostImages[0].imagePath
      }
      return '/images/post/default.jpg'
    },

    truncateTitle(title, maxLength = 50) {
      if (!title) return ''
      return title.length > maxLength ? 
        title.substring(0, maxLength) + '...' : 
        title
    },

    truncateDescription(description, maxLength = 120) {
      if (!description) return ''
      return description.length > maxLength ? 
        description.substring(0, maxLength) + '...' : 
        description
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    getVisiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.loadPosts()
        // 滾動到頂部
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },

    navigateToPost(postId) {
      this.$router.push(`/blog/${postId}`)
    },

    // 🔥 切換分類
    switchCategory(categoryName) {
      console.log('切換到分類:', categoryName)
      this.$router.push({ 
        path: '/blog/category', 
        query: { category: categoryName } 
      })
    },

    // 🔥 回到部落格首頁
    goToBlogHome() {
      console.log('回到部落格首頁')
      this.$router.push('/blog')
    },

    // 🔥 更新分類文章計數
    updateCategoryCounts(allPosts) {
      console.log('更新分類計數，所有文章:', allPosts)
      
      this.categories.forEach(category => {
        if (category.name === '所有分類') {
          category.count = allPosts.length
        } else {
          category.count = allPosts.filter(post => {
            const postCategory = post.category || 'General'
            return postCategory === category.name
          }).length
        }
        console.log(`分類 "${category.name}" 的文章數量: ${category.count}`)
      })
    }
  },

  mounted() {
    this.loadPosts()
  },

  watch: {
    '$route.query.category'() {
      this.currentPage = 1
      this.loadPosts()
    }
  }
}
</script>

<style scoped>
/* 主要色調變數 */
:root {
  --primary-dark: #022c5c;
  --accent-red: #eb5757;
  --neutral-beige: #e4dcd1;
  --light-cream: #faf6eb;
  --primary-light: #1a4480;
  --text-dark: #2c3e50;
  --text-light: #6c757d;
}

.category-page {
  background: linear-gradient(135deg, var(--light-cream) 0%, #ffffff 100%);
  min-height: 100vh;
}

/* === 分類導航標籤 === */
.category-nav-tabs {
  margin-top: 80px;
  padding: 1.5rem 0;
  background: white;
  border-bottom: 2px solid var(--neutral-beige);
  position: sticky;
  top: 80px;
  z-index: 100;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
}

.tabs-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  background: transparent;
}

/* 回到部落格首頁按鈕 */
.blog-home-btn {
  background: #022c5c;
  color: white;
  border: 2px solid #022c5c;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(2, 44, 92, 0.2);
  text-decoration: none;
  font-family: inherit;
  line-height: 1;
  margin-right: 20px;
  order: -1;
}

.blog-home-btn:hover {
  background: #1a4480;
  border-color: #1a4480;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(2, 44, 92, 0.3);
}

.blog-home-btn i {
  font-size: 14px;
  color: white;
}

.blog-home-btn span {
  color: white;
  font-weight: 600;
}

/* 分類標籤容器 */
.category-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.category-tab {
  background: white;
  border: 2px solid #e4dcd1;
  color: #2c3e50;
  padding: 12px 16px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  min-height: 44px;
  transition: all 0.3s ease;
}

.category-tab:hover {
  background: #eb5757;
  color: white;
  border-color: #eb5757;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(235, 87, 87, 0.25);
}

.category-tab.active {
  background: #eb5757;
  color: white;
  border-color: #eb5757;
  box-shadow: 0 4px 15px rgba(235, 87, 87, 0.3);
}

.category-tab i {
  font-size: 14px;
}

.tab-count {
  background: rgba(0, 0, 0, 0.15);
  color: inherit;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  margin-left: 4px;
}

.category-tab.active .tab-count,
.category-tab:hover .tab-count {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

/* === 精簡的標題區域 === */
.category-header-simple {
  padding: 1.5rem 0;
  background: linear-gradient(135deg, #f8f9fa 0%, white 100%);
  border-bottom: 1px solid var(--neutral-beige);
}

.header-info {
  text-align: center;
}

.current-category {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.current-category i {
  font-size: 1.6rem;
  color: var(--accent-red);
}

.posts-summary {
  color: var(--text-light);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

/* === 文章列表區域 === */
.category-posts {
  padding: 2rem 0;
  position: relative;
}

/* 載入狀態 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-content {
  text-align: center;
}

.custom-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--neutral-beige);
  border-top: 4px solid var(--primary-dark);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-light);
  font-size: 1.1rem;
}

/* 錯誤狀態 */
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  width: 80px;
  height: 80px;
  background: var(--accent-red);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.error-icon i {
  font-size: 2rem;
  color: white;
}

.error-title {
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.error-message {
  color: var(--text-light);
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-btn, .back-btn {
  background: var(--primary-dark);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-btn:hover, .back-btn:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(2, 44, 92, 0.3);
  color: white;
}

/* 空狀態 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  width: 100px;
  height: 100px;
  background: var(--neutral-beige);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

.empty-icon i {
  font-size: 2.5rem;
  color: var(--primary-dark);
}

.empty-title {
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.empty-message {
  color: var(--text-light);
  margin-bottom: 2rem;
}

.empty-btn {
  background: var(--primary-dark);
  color: white;
  text-decoration: none;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
}

.empty-btn:hover {
  background: var(--primary-light);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(2, 44, 92, 0.3);
}

/* 控制區域 */
.posts-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--neutral-beige);
}

.posts-count {
  color: var(--text-dark);
  margin: 0;
  font-weight: 600;
}

.count-number {
  color: var(--accent-red);
  font-weight: 700;
}

.sort-select {
  background: var(--light-cream);
  border: 2px solid var(--neutral-beige);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: var(--text-dark);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-select:focus {
  outline: none;
  border-color: var(--primary-dark);
  box-shadow: 0 0 0 3px rgba(2, 44, 92, 0.1);
}

/* 文章網格 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.post-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  border: 1px solid var(--neutral-beige);
}

.post-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-image-container {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.post-card:hover .card-image {
  transform: scale(1.1);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary-dark), var(--accent-red));
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

.post-card:hover .card-overlay {
  opacity: 0.9;
}

.overlay-content {
  color: white;
  text-align: center;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.post-card:hover .overlay-content {
  transform: translateY(0);
}

.overlay-content i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.card-content {
  padding: 2rem;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.post-date {
  color: var(--text-light);
  font-size: 0.9rem;
}

.post-category {
  background: var(--accent-red);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.card-title {
  color: var(--text-dark);
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.post-card:hover .card-title {
  color: var(--primary-dark);
}

.card-description {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.read-more {
  color: var(--primary-dark);
  font-weight: 600;
  transition: all 0.3s ease;
}

.post-card:hover .read-more {
  color: var(--accent-red);
  transform: translateX(5px);
}

/* 分頁 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 4rem;
}

.custom-pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.5rem;
  align-items: center;
}

.page-btn {
  background: white;
  border: 2px solid var(--neutral-beige);
  color: var(--text-dark);
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  color: white;
  border-color: var(--primary-dark);
  transform: translateY(-2px);
}

.page-btn.active {
  background: var(--accent-red);
  color: white;
  border-color: var(--accent-red);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.number-btn {
  min-width: 45px;
  justify-content: center;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .category-nav-tabs {
    margin-top: 100px;
    padding: 1rem 0;
  }
  
  .tabs-wrapper {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
  
  .blog-home-btn {
    align-self: center;
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
    order: 0;
  }
  
  .category-tabs {
    gap: 0.6rem;
  }
  
  .category-tab {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
    border-radius: 20px;
  }
  
  .current-category {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.3rem;
  }
  
  .current-category i {
    font-size: 1.3rem;
  }
  
  .posts-summary {
    font-size: 0.95rem;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .posts-controls {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .custom-pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  .prev-btn, .next-btn {
    display: none;
  }
}

@media (max-width: 480px) {
  .category-nav-tabs {
    padding: 0.8rem 0;
  }
  
  .tabs-wrapper {
    padding: 0 0.5rem;
    gap: 0.8rem;
  }
  
  .blog-home-btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
  
  .category-tabs {
    gap: 0.5rem;
  }
  
  .category-tab {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .tab-count {
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
  }
  
  .category-header-simple {
    padding: 1rem 0;
  }
  
  .current-category {
    font-size: 1.3rem;
  }
  
  .posts-grid {
    gap: 1rem;
  }
  
  .post-card {
    border-radius: 15px;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .card-image-container {
    height: 200px;
  }
  
  .posts-controls {
    padding: 1rem;
    margin-bottom: 2rem;
  }
}

/* 額外的動畫效果 */
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

.post-card {
  animation: fadeInUp 0.6s ease-out;
}

.post-card:nth-child(1) { animation-delay: 0.1s; }
.post-card:nth-child(2) { animation-delay: 0.2s; }
.post-card:nth-child(3) { animation-delay: 0.3s; }
.post-card:nth-child(4) { animation-delay: 0.4s; }
.post-card:nth-child(5) { animation-delay: 0.5s; }
.post-card:nth-child(6) { animation-delay: 0.6s; }

/* 深色模式支援 */
@media (prefers-color-scheme: dark) {
  .category-page {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }
  
  .post-card {
    background: #2d2d2d;
    border-color: #404040;
    color: #e0e0e0;
  }
  
  .posts-controls {
    background: #2d2d2d;
    border-color: #404040;
  }
  
  .card-title {
    color: #e0e0e0;
  }
  
  .post-card:hover .card-title {
    color: var(--neutral-beige);
  }
}
</style>
<template>
  <div class="posts-container">
    <!-- 頁面標題區 -->
    <div class="page-header">
      <nav class="breadcrumb">
        <span class="breadcrumb-item">在這分享你最愛的JADE穿搭！</span>
      </nav>
      
      <div class="header-actions">
        <button 
          v-if="currentUser"
          @click="openCreatePost" 
          class="action-btn primary"
        >
          發布穿搭
        </button>
        <button @click="refreshPosts" class="action-btn secondary">
          刷新
        </button>
      </div>
    </div>

    <!-- 主要內容區 -->
    <div class="main-content">
      <!-- 左側：精選穿搭 -->
      <div class="featured-section">
        <div v-if="featuredPost" class="featured-post">
          <div class="featured-image">
            <img 
              :src="getPostImage(featuredPost)" 
              :alt="featuredPost.title"
              @click="openPostDetail(featuredPost)"
            />
          </div>
          
          <div class="featured-content">
            <h2 class="featured-title">{{ featuredPost.title }}</h2>
            <p class="featured-description">
              {{ truncateText(featuredPost.content, 100) }}
            </p>
            
            <button @click="openPostDetail(featuredPost)" class="view-btn">
              查看更多
            </button>
            
            <!-- 互動按鈕 -->
            <div class="featured-actions">
              <button 
                @click="toggleLike(featuredPost)" 
                :class="['action-icon', { 'liked': featuredPost.isLiked }]"
                :disabled="!currentUser"
              >
                <i :class="featuredPost.isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
              </button>
              
              <button @click="sharePost(featuredPost)" class="action-icon">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側：穿搭網格 -->
      <div class="content-section">
        <div class="section-header">
          <h3 class="section-title">穿搭分享</h3>
          
          <!-- 篩選控制 -->
          <div class="filter-controls">
            <select v-model="sortBy" @change="applySorting" class="sort-select">
              <option value="latest">最新發布</option>
              <option value="likes">最受歡迎</option>
              <option value="trending">本週熱門</option>
            </select>
          </div>
        </div>

        <!-- 🔥 Debug 資訊顯示 
        <div v-if="debugMode" class="debug-info">
          <div class="debug-panel">
            <h4>🔧 Debug 資訊</h4>
            <div class="debug-stats">
              <div class="stat-item">
                <strong>總貼文數:</strong> {{ posts.length }}
              </div>
              <div class="stat-item">
                <strong>已發布:</strong> {{ posts.filter(p => p.status === 'published').length }}
              </div>
              <div class="stat-item">
                <strong>待審核:</strong> {{ posts.filter(p => p.status === 'pending').length }}
              </div>
              <div class="stat-item">
                <strong>草稿:</strong> {{ posts.filter(p => p.status === 'draft').length }}
              </div>
            </div>
            
            <div class="debug-posts">
              <h5>所有貼文狀態:</h5>
              <div v-for="post in posts" :key="post.id" class="debug-post">
                <span>{{ post.title }}</span>
                <span class="status-tag" :class="'status-' + post.status">{{ post.status }}</span>
              </div>
            </div>
            
            <button @click="debugMode = false" class="close-debug">關閉 Debug</button>
          </div>
        </div>-->

        <!-- 載入狀態 -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>載入精彩穿搭中...</p>
        </div>

        <!-- 穿搭網格 -->
        <div v-else-if="displayedPosts.length" class="posts-grid">
          <div 
            v-for="post in displayedPosts" 
            :key="post.id"
            class="post-card"
            @click="openPostDetail(post)"
          >
            <div class="post-image">
              <img 
                :src="getPostImage(post)" 
                :alt="post.title"
                @error="handleImageError"
              />
              
              <!-- 熱門標籤 -->
              <div v-if="post.likesCount > 20" class="hot-badge">
                熱門
              </div>
            </div>
            
            <div class="post-info">
              <h4 class="post-title">{{ post.title }}</h4>
              <p class="post-description">{{ truncateText(post.content, 50) }}</p>
              <div class="post-likes">
                <i class="fas fa-heart"></i>
                {{ post.likesCount || 0 }} 個讚
              </div>
            </div>
          </div>
        </div>

        <!-- 空狀態 -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-tshirt"></i>
          </div>
          <h3>還沒有穿搭分享</h3>
          <p v-if="posts.length === 0">目前沒有任何貼文</p>
          <p v-else-if="posts.filter(p => p.status === 'published').length === 0">
            有 {{ posts.length }} 個貼文，但都尚未發布
          </p>
          <p v-else>所有已發布的貼文都在精選區域顯示</p>
          
          <button 
            v-if="currentUser"
            @click="openCreatePost"
            class="create-btn"
          >
            成為第一個分享者
          </button>
          
          <!-- 🔥 Debug 按鈕 
          <button @click="debugMode = true" class="debug-btn">
            🔧 顯示 Debug 資訊
          </button>-->
        </div>
      </div>
    </div>

    <!-- 發布貼文彈窗 -->
    <CreatePostModal 
      :visible="showCreatePost"
      :editing-post="editingPost"
      @close="closeCreatePost"
      @success="handlePostCreated"
    />

    <!-- 貼文詳情彈窗 -->
    <div v-if="showPostDetail" class="modal-overlay" @click="closePostDetail">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedPost?.title }}</h2>
          <button @click="closePostDetail" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div v-if="selectedPost" class="modal-body">
          <div class="detail-image">
            <img 
              :src="getPostImage(selectedPost)" 
              :alt="selectedPost.title"
            />
          </div>
          
          <div class="detail-content">
            <div class="post-meta">
              <span class="author">{{ selectedPost.memberName || '時尚達人' }}</span>
              <span class="date">{{ formatDate(selectedPost.publishedAt) }}</span>
            </div>
            
            <p class="description">{{ selectedPost.content }}</p>
            
            <div class="detail-stats">
              <span class="stat">
                <i class="fas fa-heart"></i>
                {{ selectedPost.likesCount || 0 }} 個讚
              </span>
              <span class="stat">
                <i class="fas fa-eye"></i>
                {{ selectedPost.viewsCount || 0 }} 次瀏覽
              </span>
            </div>

            <div class="detail-actions">
              <button 
                @click="toggleLike(selectedPost)" 
                :class="['detail-btn like-btn', { 'liked': selectedPost.isLiked }]"
              >
                <i :class="selectedPost.isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
                {{ selectedPost.isLiked ? '已喜歡' : '喜歡' }}
              </button>
              
              <button @click="sharePost(selectedPost)" class="detail-btn share-btn">
                <i class="fas fa-share"></i>
                分享
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { postsApi } from '@/services/postsApi'
import CreatePostModal from '@/components/modals/CreatePostModal.vue'

export default {
  name: 'FashionGridPosts',
  components: {
    CreatePostModal
  },
  data() {
    return {
      posts: [],
      loading: true,
      sortBy: 'latest',
      showCreatePost: false,
      showPostDetail: false,
      selectedPost: null,
      editingPost: null,
      currentUser: null,
      debugMode: false, // 🔥 Debug 模式
    }
  },
  
  computed: {
    // 精選貼文（第一個最受歡迎的）
    featuredPost() {
      const publishedPosts = this.posts.filter(post => {
        // 🔥 更寬鬆的狀態檢查
        const isPublished = post.status === 'published' || post.status === 'Published' || post.status === 'PUBLISHED'
        console.log(`🔍 檢查貼文 "${post.title}" 是否已發布: ${post.status} -> ${isPublished}`)
        return isPublished
      })
      
      console.log(`🎯 精選區域: 找到 ${publishedPosts.length} 個已發布貼文`)
      
      const featured = publishedPosts.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))[0]
      if (featured) {
        console.log(`⭐ 精選貼文: ${featured.title}`)
      } else {
        console.log('❌ 沒有精選貼文可顯示')
      }
      
      return featured
    },
    
    // 顯示的貼文（排除精選貼文）
    displayedPosts() {
      let filteredPosts = this.posts.filter(post => {
        // 🔥 更寬鬆的狀態檢查
        const isPublished = post.status === 'published' || post.status === 'Published' || post.status === 'PUBLISHED'
        const notFeatured = post.id !== this.featuredPost?.id
        
        return isPublished && notFeatured
      })
      
      console.log(`📋 網格區域: 顯示 ${filteredPosts.length} 個貼文`)
      
      return this.applySortingToArray(filteredPosts)
    }
  },
  
  async mounted() {
    await this.initializeUser()
    await this.fetchPosts()
  },
  
  methods: {
    async initializeUser() {
      try {
     // 🔥 直接讀取 memberId
    let memberId = localStorage.getItem('memberId')
    let currentUser = null
    
    // 如果沒有 memberId，嘗試從 currentUser 讀取
    if (!memberId) {
      try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
        memberId = currentUser?.id
      } catch (error) {
        console.error('解析 currentUser 失敗:', error)
      }
    }
    
    console.log('🔍 用戶登入資訊檢查:')
    console.log('  memberId from localStorage:', memberId)
    console.log('  currentUser from localStorage:', currentUser)
    
    // 🔥 只要有 memberId 就設置 currentUser（移除 auth_token 檢查）
    if (memberId) {
      this.currentUser = {
        id: parseInt(memberId),
        name: currentUser?.name || currentUser?.username || `會員 ${memberId}`,
        email: currentUser?.email || '',
        avatar: currentUser?.avatar || '',
        ...currentUser
      }
      
      console.log('✅ 成功設定 currentUser:', this.currentUser)
      console.log('🔘 按鈕應該顯示了！')
      
    } else {
      console.warn('⚠️ 沒有找到 memberId，無法設置 currentUser')
      this.currentUser = null
    }
    
  } catch (error) {
    console.error('❌ 初始化用戶失敗:', error)
    this.currentUser = null
      }
    },

  async loadRealLikeStatus() {
  try {
    console.log('🔄 載入真實按讚狀態...')
    
    // 取得所有貼文 ID
    const postIds = this.posts.map(post => post.id).filter(id => id)
    
    if (postIds.length === 0) {
      console.log('❌ 沒有貼文 ID 可以載入按讚狀態')
      return
    }
    
    console.log(`📊 正在載入 ${postIds.length} 個貼文的按讚狀態`)
    
    // 🔥 修正：批量取得按讚狀態，使用正確的 API 呼叫
    const likeStatusResponse = await postsApi.getBatchLikeStatus({
      PostIds: postIds,
      UserId: this.currentUser?.id || 1
    })
    
    console.log('📡 批量按讚狀態 API 回應:', likeStatusResponse)
    
    if (likeStatusResponse.Success || likeStatusResponse.success) {
      const likeStatusData = likeStatusResponse.Data || likeStatusResponse.data
      
      console.log('✅ 成功取得按讚狀態:', likeStatusData)
      
      // 🔥 修正：更新每個貼文的按讚狀態，處理不同的欄位命名
      likeStatusData.forEach(status => {
        const postId = status.PostId || status.postId
        const post = this.posts.find(p => p.id === postId)
        if (post) {
          post.isLiked = status.IsLiked || status.isLiked || false
          post.likesCount = status.LikesCount || status.likesCount || 0
          
          console.log(`📝 更新貼文 ${post.id} 按讚狀態: ${post.isLiked ? '已按讚' : '未按讚'}, 總讚數: ${post.likesCount}`)
        }
      })
      
      console.log('🎉 所有按讚狀態已更新完成')
    } else {
      console.warn('⚠️ 取得按讚狀態失敗:', likeStatusResponse)
    }
    
  } catch (error) {
    console.error('❌ 載入按讚狀態失敗:', error)
    // 不要因為按讚狀態載入失敗就中斷頁面
  }
},

    async fetchPosts() {
      try {
        this.loading = true
        console.log('🔍 開始載入貼文...')
        
        const response = await postsApi.getAllPosts()
        console.log('📡 原始 API 回應:', response.data)
        
        // 🔥 檢查回應格式
        if (!response.data || !Array.isArray(response.data)) {
          console.error('❌ API 回應格式錯誤:', response)
          this.$toast?.error('API 回應格式錯誤')
          return
        }
        
        this.posts = response.data.map(post => {
          // 🔥 處理不同的屬性名稱格式
          const processedPost = {
            // ID 處理
            id: post.id || post.Id || post.ID,
            
            // 基本資訊
            title: post.title || post.Title,
            content: post.content || post.Content,
            
            // 會員 ID
            membersId: post.membersId || post.MembersId || post.members_id,
            
            // 🔥 狀態處理 - 支援多種格式並統一為小寫
            status: (post.status || post.Status || post.STATE || 'draft').toLowerCase(),
            
            // 圖片
            image: post.image || post.Image || post.imageUrl,
            
            // 時間
            createdAt: post.createdAt || post.CreatedAt || post.created_at,
            updatedAt: post.updatedAt || post.UpdatedAt || post.updated_at,
            publishedAt: post.publishedAt || post.PublishedAt || post.published_at,
            
            // 會員資訊
            memberName: post.memberName || post.MemberName || `時尚達人 ${post.membersId || post.MembersId}`,
            memberAvatar: post.memberAvatar || post.MemberAvatar,
            
            // 互動數據
            likesCount: post.likesCount || post.LikesCount || 0,
    viewsCount: post.viewsCount || post.ViewsCount || 0,
    isLiked: post.isLiked || post.IsLiked || false
          }
          
          console.log('📝 處理貼文:', {
            原始id: post.id || post.Id,
            處理後id: processedPost.id,
            原始status: post.status || post.Status,
            處理後status: processedPost.status,
            title: processedPost.title
          })
          
          return processedPost
        })
        // 🔥 新增：載入貼文後，取得真實的按讚狀態
if (this.currentUser && this.posts.length > 0) {
  await this.loadRealLikeStatus()
}
        
        // 🔥 Debug: 顯示各狀態的貼文數量
        const statusCounts = this.posts.reduce((acc, post) => {
          acc[post.status] = (acc[post.status] || 0) + 1
          return acc
        }, {})
        
        console.log('📊 貼文狀態統計:', statusCounts)
        console.log(`📢 已發布貼文數: ${this.posts.filter(p => p.status === 'published').length}`)
        console.log(`⏳ 待審核貼文數: ${this.posts.filter(p => p.status === 'pending').length}`)
        console.log(`📝 草稿貼文數: ${this.posts.filter(p => p.status === 'draft').length}`)
        console.log(`❌ 被拒絕貼文數: ${this.posts.filter(p => p.status === 'rejected').length}`)
        
        // 🔥 列出所有已發布的貼文
        const publishedPosts = this.posts.filter(p => p.status === 'published')
        if (publishedPosts.length > 0) {
          console.log('✅ 已發布的貼文:')
          publishedPosts.forEach(post => {
            console.log(`  - ${post.title} (ID: ${post.id}, 狀態: ${post.status})`)
          })
        } else {
          console.log('❌ 沒有找到已發布的貼文！')
          console.log('🔍 所有貼文的狀態:')
          this.posts.forEach(post => {
            console.log(`  - ${post.title}: 狀態="${post.status}"`)
          })
        }
        
      } catch (error) {
        console.error('❌ 取得貼文失敗:', error)
        this.$toast?.error(`載入貼文失敗: ${error.message}`)
      } finally {
        this.loading = false
      }
    },

    applySorting() {
      this.$forceUpdate()
    },

    applySortingToArray(posts) {
      const sortedPosts = [...posts]
      
      switch (this.sortBy) {
        case 'likes': {
          return sortedPosts.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
        }
        case 'trending': {
          return sortedPosts.sort((a, b) => {
            const aScore = (a.likesCount || 0) * 2 + (a.viewsCount || 0) * 0.1
            const bScore = (b.likesCount || 0) * 2 + (b.viewsCount || 0) * 0.1
            return bScore - aScore
          })
        }
        case 'latest':
        default: {
          return sortedPosts.sort((a, b) => {
            const aDate = new Date(a.publishedAt || a.createdAt)
            const bDate = new Date(b.publishedAt || b.createdAt)
            return bDate - aDate
          })
        }
      }
    },

   async toggleLike(post) {
  if (!this.currentUser) {
    this.$toast?.warning('請先登入才能按讚')
    return
  }

  // 保存原始狀態，以便失敗時復原
  const originalState = {
    isLiked: post.isLiked,
    likesCount: post.likesCount
  }
  
  try {
    // 樂觀更新 UI（先更新界面，再呼叫 API）
    post.isLiked = !post.isLiked
    post.likesCount += post.isLiked ? 1 : -1
    
    console.log(`🔄 切換按讚狀態: 貼文 ${post.id}, 用戶 ${this.currentUser.id}`)
    
    // 🔥 修正：呼叫正確的 API 端點和格式
    const response = await postsApi.togglePostLike({
      PostId: post.id,
      UserId: this.currentUser.id
    })
    
    console.log('✅ 按讚 API 回應:', response)
    
    // 🔥 修正：使用後端回傳的實際數據更新 UI
    if (response.Success || response.success) {
      const responseData = response.Data || response.data
      post.isLiked = responseData.IsLiked || responseData.isLiked
      post.likesCount = responseData.LikesCount || responseData.likesCount
      
      if (post.isLiked) {
        this.$toast?.success('👍 已喜歡')
      } else {
        this.$toast?.info('已取消喜歡')
      }
    } else {
      // 如果後端返回失敗，復原狀態
      post.isLiked = originalState.isLiked
      post.likesCount = originalState.likesCount
      this.$toast?.error(response.Message || response.message || '操作失敗')
    }
    
  } catch (error) {
    // 發生錯誤時復原 UI 狀態
    post.isLiked = originalState.isLiked
    post.likesCount = originalState.likesCount
    
    console.error('❌ 按讚失敗:', error)
    
    // 根據錯誤類型顯示不同訊息
    if (error.message.includes('401')) {
      this.$toast?.error('登入已過期，請重新登入')
    } else if (error.message.includes('403')) {
      this.$toast?.error('沒有權限執行此操作')
    } else if (error.message.includes('404')) {
      this.$toast?.error('貼文或用戶不存在')
    } else {
      this.$toast?.error('網路錯誤，請重試')
    }
  }
},

// 新增：載入貼文時同時載入按讚狀態
async fetchPostsWithLikeStatus() {
  try {
    this.loading = true
    
    // 先載入貼文列表
    const response = await postsApi.getAllPosts()
    this.posts = this.processPostsData(response.data)
    
    // 如果有登入用戶，批量載入按讚狀態
    if (this.currentUser && this.posts.length > 0) {
      const postIds = this.posts.map(post => post.id)
      const likeStatusResponse = await postsApi.getBatchLikeStatus(postIds)
      
      if (likeStatusResponse.success) {
        // 更新每個貼文的按讚狀態
        likeStatusResponse.data.forEach(status => {
          const post = this.posts.find(p => p.id === status.postId)
          if (post) {
            post.isLiked = status.isLiked
            post.likesCount = status.likesCount
          }
        })
      }
    }
    
  } catch (error) {
    console.error('載入貼文失敗:', error)
    this.$toast?.error('載入貼文失敗')
  } finally {
    this.loading = false
  }
},
    sharePost(post) {
      try {
        if (navigator.share) {
          navigator.share({
            title: post.title,
            text: `看看這個精彩的穿搭分享：${post.title}`,
            url: window.location.href
          })
        } else {
          navigator.clipboard.writeText(`${post.title} - ${window.location.href}`)
          this.$toast?.success('📋 連結已複製到剪貼板')
        }
      } catch (error) {
        console.error('分享失敗:', error)
        this.$toast?.error('分享失敗')
      }
    },

    openPostDetail(post) {
      this.selectedPost = post
      this.showPostDetail = true
      post.viewsCount = (post.viewsCount || 0) + 1
    },

    closePostDetail() {
      this.showPostDetail = false
      this.selectedPost = null
    },

    openCreatePost() {
      if (!this.currentUser) {
        this.$toast?.warning('請先登入才能發布穿搭')
        this.$router.push('/login')
        return
      }
      
      this.editingPost = null
      this.showCreatePost = true
    },

    closeCreatePost() {
      this.showCreatePost = false
      this.editingPost = null
    },

    async refreshPosts() {
      await this.fetchPosts()
      this.$toast?.success('已更新最新穿搭')
    },

    async handlePostCreated(newPost, isEditing) {
      if (isEditing) {
        this.$toast?.success('✨ 穿搭已更新！')
      } else {
        this.$toast?.success('🎉 穿搭已發布！')
      }
      
      await this.fetchPosts()
    },

    getPostImage(post) {
      if (post.image) {
        return post.image
      }
      
      if (post.officialPostImages && post.officialPostImages.length > 0) {
        return post.officialPostImages[0].imagePath
      }
      
      return 'https://via.placeholder.com/300x400/f5f5f5/888?text=時尚穿搭'
    },

    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },

    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = now - date
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return '今天'
      } else if (diffDays === 1) {
        return '昨天'
      } else if (diffDays < 7) {
        return `${diffDays} 天前`
      } else {
        return date.toLocaleDateString('zh-TW', { 
          month: 'long', 
          day: 'numeric' 
        })
      }
    },

    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/300x400/f5f5f5/888?text=圖片載入失敗'
    }
  }
}
</script>

<style scoped>
/* 基礎設定 */
.posts-container {
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
  margin-top: 50px;
  background: #fafafa;
  min-height: 100vh;
  margin-bottom: 20px;
}

/* 頁面標題 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.breadcrumb {
  color: #999;
  font-size: 14px;
}

.breadcrumb-item {
  color: #666;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #333;
  color: white;
}

.action-btn.secondary {
  background: white;
  color: #333;
  border: 1px solid #ddd;
}

.action-btn:hover {
  opacity: 0.8;
}

/* 主要內容佈局 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  align-items: start;
}

/* 精選穿搭區 */
.featured-section {
  position: sticky;
  top: 100px;
}

.featured-post {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.featured-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
  cursor: pointer;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.featured-image:hover img {
  transform: scale(1.05);
}

.featured-content {
  padding: 24px;
}

.featured-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #333;
}

.featured-description {
  color: #666;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.view-btn {
  background: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 16px;
  transition: background 0.2s ease;
}

.view-btn:hover {
  background: #555;
}

.featured-actions {
  display: flex;
  gap: 12px;
}

.action-icon {
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.action-icon:hover {
  color: #333;
}

.action-icon.liked {
  color: #e74c3c;
}

/* 內容區域 */
.content-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.sort-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

/* 載入狀態 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 穿搭網格 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.post-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.post-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-card:hover .post-image img {
  transform: scale(1.1);
}

.hot-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #e74c3c;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.post-info {
  padding: 16px;
}

.post-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #333;
  line-height: 1.4;
}

.post-description {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.post-likes {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-likes i {
  color: #ff6b6b;
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.create-btn {
  background: #333;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  margin-top: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.create-btn:hover {
  background: #555;
}

/* Modal 樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 0;
}

.detail-image {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.detail-image img {
  max-width: 100%;
  max-height: 500px;
  height: auto;
  object-fit: contain;
}

.detail-content {
  padding: 24px;
}

.post-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #999;
}

.author {
  font-weight: 500;
  color: #333;
}

.description {
  color: #666;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.detail-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.stat i {
  color: #e74c3c;
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.detail-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.detail-btn:hover {
  background: #f8f9fa;
}

.detail-btn.like-btn.liked {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.detail-btn.share-btn {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* Debug 樣式 */
.debug-info {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  background: rgba(0, 0, 0, 0.9);
  padding: 20px;
  border-radius: 12px;
  color: white;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.debug-panel h4 {
  margin: 0 0 16px 0;
  color: #fff;
}

.debug-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.debug-posts {
  margin-bottom: 16px;
}

.debug-posts h5 {
  margin: 0 0 8px 0;
  color: #ccc;
}

.debug-post {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  margin-bottom: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-tag {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: bold;
}

.status-published {
  background: #10b981;
  color: white;
}

.status-pending {
  background: #f59e0b;
  color: black;
}

.status-draft {
  background: #6b7280;
  color: white;
}

.close-debug {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.debug-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 12px;
  cursor: pointer;
  font-size: 0.9rem;
}

.debug-btn:hover {
  background: #4b5563;
}

.empty-icon {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 8px;
}

.empty-state p {
  color: #666;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .posts-container {
    padding: 16px;
    margin-top: 60px;
  }

  .main-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .featured-section {
    position: static;
  }

  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .post-image {
    height: 150px;
  }

  .post-info {
    padding: 12px;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .filter-controls {
    justify-content: center;
  }
}
</style>
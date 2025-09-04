<template>
  <div class="container my-4">
     <div class="row">
        <div class="col-12">
  <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <router-link to="/" class="text-decoration-none">首頁</router-link>
              </li>
              <li class="breadcrumb-item">
                <router-link to="/member/basic-info" class="text-decoration-none">會員中心</router-link>
              </li>
              <li class="breadcrumb-item active">我的貼文</li>
            </ol>
          </nav>
          </div>
          </div>
          </div>
  <div class="posts-management">
    <!-- 簡約標題 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">我的穿搭</h1>
        <p class="page-subtitle">管理您的穿搭分享</p>
      </div>
      <button @click="openCreatePost" class="btn-primary">
        + 發布穿搭
      </button>
    </div>


    <!-- 簡約統計 -->
    <div class="stats-grid">
      <div v-for="status in ['published', 'pending', 'rejected', 'draft']" :key="status" class="stat-card">
        <div class="stat-number">{{ getStatusCount(status) }}</div>
        <div class="stat-label">{{ getStatusText(status) }}</div>
      </div>
    </div>

    <!-- 簡約篩選器 -->
    <div class="filters">
      <div class="filter-tabs">
        <button 
          v-for="option in statusOptions" 
          :key="option.value"
          @click="setStatusFilter(option.value)"
          :class="['filter-tab', { 'active': statusFilter === option.value }]"
        >
          {{ option.icon }} {{ option.label }}
        </button>
      </div>
      
      <select v-model="sortBy" @change="sortPosts" class="sort-select">
        <option value="latest">最新發布</option>
        <option value="updated">最近更新</option>
        <option value="published">發布時間</option>
      </select>
    </div>

    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 簡約貼文列表 -->
    <div v-else-if="filteredPosts.length" class="posts-list">
      <div v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="post-content">
          <div class="post-header">
            <h3 class="post-title">{{ post.title }}</h3>
            <span :class="['status-badge', `status-${post.status}`]">
              {{ getStatusText(post.status) }}
            </span>
          </div>
          
          <p class="post-excerpt">{{ truncateText(post.content, 120) }}</p>
          
          <!-- 被拒絕原因 -->
          <div v-if="post.status === 'rejected' && post.rejectedReason" class="rejection-notice">
            ⚠️ {{ post.rejectedReason }}
          </div>
          
          <div class="post-meta">
            <span>{{ formatDate(post.createdAt) }}</span>
            <span v-if="post.status === 'published'" class="post-stats">
              ❤️ {{ post.likesCount || 0 }}
            </span>
          </div>
        </div>

        <div class="post-actions">
          <button @click="editPost(post)" class="btn-action" title="編輯">✏️</button>
          <button @click="deletePost(post)" class="btn-action" title="刪除">🗑️</button>
          
          <!-- 狀態操作 -->
          <button 
            v-if="post.status === 'draft'"
            @click="publishPost(post)"
            class="btn-status"
          >
            提交審核
          </button>
          
          <button 
            v-if="post.status === 'rejected'"
            @click="resubmitPost(post)"
            class="btn-status"
          >
            重新提交
          </button>
          
          <button 
            v-if="post.status === 'pending'"
            @click="withdrawPost(post)"
            class="btn-status"
          >
            撤回
          </button>
          
          <button 
            v-if="post.status === 'published'"
            @click="unpublishPost(post)"
            class="btn-status"
          >
            下架
          </button>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <div class="empty-icon">👗</div>
      <h3>{{ getEmptyTitle() }}</h3>
      <p>{{ getEmptyMessage() }}</p>
      <button @click="openCreatePost" class="btn-primary">發布第一個穿搭</button>
    </div>

    <!-- 發布彈窗 -->
    <CreatePostModal 
      :visible="showCreatePost"
      :editing-post="editingPost"
      @close="closeCreatePost"
      @success="handlePostSuccess"
    />

    <!-- 預覽彈窗 -->
    <div v-if="showPostPreview" class="modal-overlay" @click="closePostPreview">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ previewPost?.title }}</h2>
          <button @click="closePostPreview" class="btn-close">×</button>
        </div>
        
        <div class="modal-body">
          <img :src="previewPost?.image" :alt="previewPost?.title" class="preview-image" />
          <div class="preview-content">
            <div :class="['preview-status', `status-${previewPost?.status}`]">
              {{ getStatusText(previewPost?.status) }}
            </div>
            <p class="preview-text">{{ previewPost?.content }}</p>
            <div class="preview-meta">
              <div>📅 {{ formatDate(previewPost?.createdAt) }}</div>
              <div v-if="previewPost?.publishedAt">🌐 {{ formatDate(previewPost?.publishedAt) }}</div>
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
  name: 'PostsView',
  components: {
    CreatePostModal
  },
  
  data() {
    return {
      posts: [],
      filteredPosts: [],
      loading: true,
      statusFilter: 'all',
      sortBy: 'latest',
      showCreatePost: false,
      showPostPreview: false,
      editingPost: null,
      previewPost: null,
      currentMemberId: null,
      
      statusOptions: [
        { value: 'all', label: '全部', icon: '📋' },
        { value: 'published', label: '已發布', icon: '✅' },
        { value: 'pending', label: '審核中', icon: '⏰' },
        { value: 'rejected', label: '被拒絕', icon: '❌' },
        { value: 'draft', label: '草稿', icon: '📝' }
      ]
    }
  },
  
  computed: {
    stats() {
      const stats = { published: 0, pending: 0, rejected: 0, draft: 0 }
      this.posts.forEach(post => {
        if (Object.prototype.hasOwnProperty.call(stats, post.status)) {
          stats[post.status]++
        }
      })
      return stats
    }
  },
  
  async mounted() {
    console.log('🚀 載入會員貼文管理頁面')
    this.initializeMemberId()
    await this.fetchMyPosts()
  },
  
  methods: {
    // 🔥 修復會員 ID 讀取方式（和 FashionGridPosts 一致）
    initializeMemberId() {
      try {
        // 🔥 和 FashionGridPosts 使用相同的邏輯
        let memberId = localStorage.getItem('memberId')
        let currentUser = null
        
        // 嘗試解析 currentUser
        const currentUserData = localStorage.getItem('currentUser')
        if (currentUserData) {
          try {
            currentUser = JSON.parse(currentUserData)
            if (!memberId && currentUser?.id) {
              memberId = currentUser.id
            }
          } catch (error) {
            console.log('⚠️ currentUser 不是 JSON 格式')
          }
        }
        
        console.log('🔍 PostsView 用戶登入資訊檢查:')
        console.log('  memberId from localStorage:', memberId)
        console.log('  currentUser from localStorage:', currentUser)
        
        // 🔥 只要有 memberId 就設置（和 FashionGridPosts 一致）
        if (memberId) {
          this.currentMemberId = parseInt(memberId)
          console.log('✅ PostsView 已登入會員 ID:', this.currentMemberId)
        } else {
          console.warn('⚠️ PostsView 沒有找到 memberId')
          this.$toast?.error('請先登入')
        }
        
      } catch (error) {
        console.error('❌ PostsView 讀取會員資訊失敗:', error)
        this.$toast?.error('讀取登入資訊失敗')
      }
    },

    async fetchMyPosts() {
  if (!this.currentMemberId) {
    console.warn('⚠️ 沒有會員ID，無法載入貼文')
    this.$toast?.warning('請先登入')
    this.loading = false
    return
  }

  try {
    this.loading = true
    console.log('📡 載入會員貼文，會員ID:', this.currentMemberId)
    
    const response = await postsApi.getAllPosts()
    console.log('📋 API 回應資料:', response)
    
    if (response.data && Array.isArray(response.data)) {
      // 篩選當前會員的貼文
      this.posts = response.data
        .filter(post => {
          const postMemberId = parseInt(post.membersId)
          const currentId = parseInt(this.currentMemberId)
          return postMemberId === currentId
        })
        .map(post => ({
          ...post,
          id: parseInt(post.id),
          membersId: parseInt(post.membersId),
          // 🔥 修正：先設為 0，之後從 API 取得真實數據
          likesCount: 0,
          commentsCount: 0,
          viewsCount: 0
        }))
      
      console.log(`✅ 載入 ${this.posts.length} 篇貼文`)
      
      // 🔥 新增：載入真實的按讚數據
      if (this.posts.length > 0) {
        await this.loadRealLikeData()
      }
      
      this.filterPosts()
      
      if (this.posts.length > 0) {
        this.$toast?.success(`成功載入 ${this.posts.length} 篇貼文`)
      }
      
    } else {
      console.error('❌ API 回應格式錯誤:', response)
      this.$toast?.error('載入貼文失敗')
    }
    
  } catch (error) {
    console.error('❌ 載入貼文失敗:', error)
    this.$toast?.error(`載入失敗: ${error.message}`)
  } finally {
    this.loading = false
  }
},

    setStatusFilter(status) {
      this.statusFilter = status
      this.filterPosts()
    },

    filterPosts() {
      if (this.statusFilter === 'all') {
        this.filteredPosts = [...this.posts]
      } else {
        this.filteredPosts = this.posts.filter(post => post.status === this.statusFilter)
      }
      this.sortPosts()
    },

    sortPosts() {
      switch (this.sortBy) {
        case 'updated':
          this.filteredPosts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          break
        case 'published':
          this.filteredPosts.sort((a, b) => {
            if (!a.publishedAt && !b.publishedAt) return 0
            if (!a.publishedAt) return 1
            if (!b.publishedAt) return -1
            return new Date(b.publishedAt) - new Date(a.publishedAt)
          })
          break
        case 'latest':
        default:
          this.filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          break
      }
    },

    getStatusCount(status) {
      return this.posts.filter(post => post.status === status).length
    },

    openCreatePost() {
      if (!this.currentMemberId) {
        this.$toast?.warning('請先登入')
        return
      }
      this.editingPost = null
      this.showCreatePost = true
    },

    closeCreatePost() {
      this.showCreatePost = false
      this.editingPost = null
    },

    editPost(post) {
      console.log('✏️ 編輯貼文:', post.title)
      this.editingPost = post
      this.showCreatePost = true
    },

    viewPost(post) {
      this.previewPost = post
      this.showPostPreview = true
    },

    closePostPreview() {
      this.showPostPreview = false
      this.previewPost = null
    },

    async deletePost(post) {
      if (!confirm(`確定要刪除「${post.title}」嗎？`)) return

      try {
        console.log('🗑️ 刪除貼文:', post.title)
        await postsApi.deletePost(post.id)
        
        this.posts = this.posts.filter(p => p.id !== post.id)
        this.filterPosts()
        this.$toast?.success('貼文已刪除')
      } catch (error) {
        console.error('❌ 刪除失敗:', error)
        this.$toast?.error(error.message || '刪除失敗')
      }
    },

    async publishPost(post) {
      try {
        console.log('📤 提交審核:', post.title)
        await postsApi.updatePost(post.id, { ...post, status: 'pending' })
        
        const index = this.posts.findIndex(p => p.id === post.id)
        if (index !== -1) {
          this.posts[index].status = 'pending'
          this.filterPosts()
        }
        this.$toast?.success('已提交審核')
      } catch (error) {
        console.error('❌ 提交失敗:', error)
        this.$toast?.error(error.message || '提交失敗')
      }
    },

    async loadRealLikeData() {
  try {
    console.log('💖 載入真實按讚數據...')
    
    // 取得所有貼文 ID
    const postIds = this.posts.map(post => post.id).filter(id => id)
    
    if (postIds.length === 0) {
      console.log('❌ 沒有貼文 ID 可以載入按讚數據')
      return
    }
    
    console.log(`📊 正在載入 ${postIds.length} 個貼文的按讚數據`)
    
    // 批量取得按讚狀態
    const likeStatusResponse = await postsApi.getBatchLikeStatus(postIds)
    
    if (likeStatusResponse.Success || likeStatusResponse.success) {
      const likeStatusData = likeStatusResponse.Data || likeStatusResponse.data
      
      console.log('✅ 成功取得按讚數據:', likeStatusData)
      
      // 更新每個貼文的按讚數據
      likeStatusData.forEach(status => {
        const post = this.posts.find(p => p.id === (status.PostId || status.postId))
        if (post) {
          post.likesCount = status.LikesCount || status.likesCount
          
          console.log(`📝 更新貼文 ${post.id} 按讚數: ${post.likesCount}`)
        }
      })
      
      console.log('🎉 所有按讚數據已更新完成')
    } else {
      console.warn('⚠️ 取得按讚數據失敗:', likeStatusResponse)
    }
    
  } catch (error) {
    console.error('❌ 載入按讚數據失敗:', error)
    // 不要因為按讚數據載入失敗就中斷頁面
  }
},

    async resubmitPost(post) {
      if (!confirm('確定要重新提交此貼文進行審核嗎？')) return

      try {
        console.log('🔄 重新提交:', post.title)
        await postsApi.updatePost(post.id, { 
          ...post, 
          status: 'pending', 
          rejectedReason: null 
        })
        
        const index = this.posts.findIndex(p => p.id === post.id)
        if (index !== -1) {
          this.posts[index].status = 'pending'
          this.posts[index].rejectedReason = null
          this.filterPosts()
        }
        this.$toast?.success('已重新提交審核')
      } catch (error) {
        console.error('❌ 重新提交失敗:', error)
        this.$toast?.error(error.message || '重新提交失敗')
      }
    },

    async withdrawPost(post) {
      if (!confirm('確定要撤回審核嗎？')) return

      try {
        console.log('↩️ 撤回審核:', post.title)
        await postsApi.updatePost(post.id, { ...post, status: 'draft' })
        
        const index = this.posts.findIndex(p => p.id === post.id)
        if (index !== -1) {
          this.posts[index].status = 'draft'
          this.filterPosts()
        }
        this.$toast?.success('已撤回審核')
      } catch (error) {
        console.error('❌ 撤回失敗:', error)
        this.$toast?.error(error.message || '撤回失敗')
      }
    },

    async unpublishPost(post) {
      if (!confirm('確定要下架此貼文嗎？')) return

      try {
        console.log('📥 下架貼文:', post.title)
        await postsApi.updatePost(post.id, { 
          ...post, 
          status: 'draft', 
          publishedAt: null 
        })
        
        const index = this.posts.findIndex(p => p.id === post.id)
        if (index !== -1) {
          this.posts[index].status = 'draft'
          this.posts[index].publishedAt = null
          this.filterPosts()
        }
        this.$toast?.success('貼文已下架')
      } catch (error) {
        console.error('❌ 下架失敗:', error)
        this.$toast?.error(error.message || '下架失敗')
      }
    },

   async handlePostSuccess(newPost, isEditing) {
  console.log('✅ 貼文操作成功:', { 
    title: newPost.title, 
    isEditing, 
    status: newPost.status,
    membersId: newPost.membersId,
    postId: newPost.id
  })
  
  this.closeCreatePost()
  
  if (isEditing) {
    this.$toast?.success('貼文已更新！')
  } else {
    this.$toast?.success('貼文已儲存！等待審核中...')
    
    // 🔥 新貼文：立即添加到本地列表（樂觀更新）
    if (newPost.id && newPost.membersId == this.currentMemberId) {
      console.log('🔥 添加新貼文到本地列表')
      
      const localPost = {
        ...newPost,
        id: parseInt(newPost.id),
        membersId: parseInt(newPost.membersId),
        likesCount: 0, // 新貼文初始按讚數為 0
        commentsCount: 0,
        viewsCount: 0
      }
      
      // 檢查是否已存在
      if (!this.posts.find(p => p.id === localPost.id)) {
        this.posts.unshift(localPost) // 添加到開頭
        console.log('✅ 新貼文已添加到列表')
      }
      
      // 如果當前在「審核中」篩選，切換到顯示新貼文
      if (this.statusFilter !== 'all' && this.statusFilter !== localPost.status) {
        console.log('🔄 切換到審核中篩選器')
        this.setStatusFilter('pending')
      } else {
        this.filterPosts()
      }
    }
  }
  
  // 延遲刷新確保 API 同步
  setTimeout(async () => {
    console.log('🔄 延遲刷新貼文列表')
    await this.fetchMyPosts()
  }, 1500)
},

    getStatusText(status) {
      const map = {
        published: '已發布',
        pending: '審核中',
        rejected: '被拒絕',
        draft: '草稿'
      }
      return map[status] || status
    },

    getEmptyTitle() {
      return this.statusFilter === 'all' ? '還沒有貼文' : `沒有${this.getStatusText(this.statusFilter)}的貼文`
    },

    getEmptyMessage() {
      const messages = {
        draft: '您還沒有儲存任何草稿',
        pending: '目前沒有貼文在審核中',
        rejected: '沒有被拒絕的貼文',
        published: '還沒有發布任何貼文',
        all: '開始分享您的穿搭吧！'
      }
      return messages[this.statusFilter] || messages.all
    },

    truncateText(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    },

    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays} 天前`
      return date.toLocaleDateString('zh-TW')
    },

    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/300x400/f5f5f5/888?text=無圖片'
    }
  }
}
</script>

<style scoped>
/* 簡約設計 CSS */
.posts-management {
  max-width: 1300px;
  margin: 0 auto;
  padding: 24px;
  margin-top: 40px;
  background: #fafafa;
  min-height: 100vh;
  margin-bottom: 20px;
  margin-left: auto;
}

/* 簡約標題 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.btn-primary {
  background: #111827;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #374151;
}

/* 簡約統計 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 4px;
}

/* 簡約篩選器 */
.filters {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-tabs {
  display: flex;
  gap: 4px;
}

.filter-tab {
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.filter-tab.active {
  background: #111827;
  color: white;
}

.filter-tab:not(.active):hover {
  background: #f3f4f6;
}

.sort-select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.875rem;
}

/* 載入狀態 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #111827;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 簡約貼文列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.post-content {
  flex: 1;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.post-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.status-published {
  background: #dcfce7;
  color: #166534;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.status-draft {
  background: #f3f4f6;
  color: #374151;
}

.post-excerpt {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 8px 0;
}

.rejection-notice {
  background: #fee2e2;
  color: #991b1b;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  margin: 8px 0;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #9ca3af;
  font-size: 0.75rem;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
  align-items: center;
}

.btn-action {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-action:hover {
  background: #f3f4f6;
}

.btn-status {
  background: #111827;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-status:hover {
  background: #374151;
}

/* 空狀態 */
.empty-state {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #111827;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

/* Modal 樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  background: #111827;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 20px;
  display: flex;
  gap: 16px;
}

.preview-image {
  width: 150px;
  height: auto;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.preview-content {
  flex: 1;
}

.preview-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.preview-status.status-published {
  background: #dcfce7;
  color: #166534;
}

.preview-status.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.preview-status.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.preview-status.status-draft {
  background: #f3f4f6;
  color: #374151;
}

.preview-text {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.preview-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #6b7280;
  font-size: 0.8rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .posts-management {
    padding: 16px;
    margin-top: 80px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters {
    flex-direction: column;
    gap: 12px;
  }

  .filter-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }

  .post-card {
    flex-direction: column;
    gap: 12px;
  }

  .post-actions {
    margin-left: 0;
    justify-content: center;
  }

  .modal-body {
    flex-direction: column;
    gap: 12px;
  }

  .preview-image {
    width: 100%;
    max-width: 250px;
    align-self: center;
  }
}
</style>

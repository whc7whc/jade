<template>
  <div class="sr-page">
    <section class="page-hero bg-light py-5" style="margin-top: 90px;">
      <div class="container">
        <div class="row justify-content-center text-center">
          <div class="col-md-8">
            <h1 class="display-4 text-uppercase mb-4">JADE - 企業社會責任宣言</h1>
          </div>
        </div>
      </div>
    </section>

    <section class="sr-intro section-padding">
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <div class="sr-content">
              <p>JADE 不僅是一個服飾電商平台，更是一個承載社會責任的企業。我們深信，科技與商業的發展應該與社會福祉、環境保護和可持續發展攜手並進。作為新一代的電商平台，我們致力於創造一個更公平、更包容、更永續的時尚生態系統。</p>
              <p>🤝 支持中小型企業與創業者降低創業門檻，實現夢想。我們相信每個有才華的設計師和創業者都應該有展示作品的機會。JADE 平台專門為中小型服飾賣家設計了友善的入駐機制：</p>
<p>簡化申請流程：提供清晰的賣家申請指引，降低技術與資金門檻</p>
<p>完整管理工具：免費提供商品管理、庫存控制、財務管理等專業工具</p>
<p>智能通知系統：自動化庫存補貨提醒，協助賣家優化營運效率</p>
<p>公平審核制度：建立透明的賣家審核機制，確保平等競爭環境</p>
<p>扶植台灣在地品牌：我們特別重視台灣本土設計師與品牌的發展，透過平台資源協助他們接觸更廣大的消費群體，讓台灣的創意與設計能在國際舞台上發光發熱。</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 社會責任相關文章列表 -->
    <section class="sr-posts section-padding">
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <div class="section-tittle mb-40">
              <h2>相關文章</h2>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12">
            <div v-if="loading" class="text-center">
              <p>載入中...</p>
            </div>
            <div v-else-if="posts.length > 0">
              <div 
                v-for="post in posts" 
                :key="post.Id" 
                class="single-post"
                :class="{ 'highlighted': highlightedPostId == post.Id }"
                @click="viewPost(post)"
              >
                <div class="post-thumb" v-if="post.CoverImage || post.coverImage">
                  <img :src="getImageUrl(post.CoverImage || post.coverImage)" :alt="post.Title || post.title">
                </div>
                <div class="post-content">
                  <h3>{{ post.Title || post.title }}</h3>
                  <p>{{ post.Excerpt || post.excerpt || getExcerpt(post.Content || post.content) }}</p>
                  <span class="post-date">{{ formatDate(post.PublishedAt || post.publishedAt || post.Created_At || post.createdAt) }}</span>
                  <span class="category-tag">{{ post.Category || post.category }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-posts">
              <p>目前還沒有相關文章</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 文章詳情彈窗 -->
    <div v-if="selectedPost" class="post-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedPost.Title || selectedPost.title }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedPost.CoverImage || selectedPost.coverImage" class="post-image">
            <img :src="getImageUrl(selectedPost.CoverImage || selectedPost.coverImage)" :alt="selectedPost.Title || selectedPost.title">
          </div>
          <div class="post-meta">
            <span class="post-date">{{ formatDate(selectedPost.PublishedAt || selectedPost.publishedAt || selectedPost.Created_At || selectedPost.createdAt) }}</span>
            <span class="category-tag">{{ selectedPost.Category || selectedPost.category }}</span>
          </div>
          <div class="post-content" v-html="selectedPost.Content || selectedPost.content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'SRView',
  data() {
    return {
      posts: [],
      loading: true,
      selectedPost: null,
      highlightedPostId: null
    }
  },
  async created() {
    // 檢查是否有要高亮的文章 ID
    if (this.$route.query.highlight) {
      this.highlightedPostId = parseInt(this.$route.query.highlight);
    }
    
    await this.fetchSRPosts();
  },
  methods: {
    async fetchSRPosts() {
      try {
        this.loading = true;
        console.log('🔍 開始載入社會責任文章...');
        
        // 嘗試不同的 API 端點
        let response;
        let posts = [];
        
        try {
          // 方法1: 使用查詢參數
          console.log('📡 嘗試使用查詢參數方式...');
          response = await fetch('/api/OfficialPosts?category=社會責任', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const text = await response.text();
            console.log('📝 API 回應 (查詢參數):', text);
            
            const data = text ? JSON.parse(text) : [];
            
            // 處理不同的回應格式
            if (Array.isArray(data)) {
              posts = data;
            } else if (data.Data && Array.isArray(data.Data)) {
              posts = data.Data;
            } else if (data.data && Array.isArray(data.data)) {
              posts = data.data;
            }
            
            console.log('📊 找到社會責任文章:', posts.length, '篇');
          }
        } catch (error) {
          console.warn('查詢參數方式失敗:', error);
        }
        
        // 如果第一種方法沒找到文章，嘗試第二種方法
        if (posts.length === 0) {
          try {
            console.log('📡 嘗試使用分類路由方式...');
            response = await fetch('/api/OfficialPosts/by-category/社會責任', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            if (response.ok) {
              const text = await response.text();
              console.log('📝 API 回應 (分類路由):', text);
              
              const data = text ? JSON.parse(text) : [];
              
              if (Array.isArray(data)) {
                posts = data;
              } else if (data.Data && Array.isArray(data.Data)) {
                posts = data.Data;
              } else if (data.data && Array.isArray(data.data)) {
                posts = data.data;
              }
              
              console.log('📊 找到社會責任文章:', posts.length, '篇');
            }
          } catch (error) {
            console.warn('分類路由方式失敗:', error);
          }
        }
        
        // 如果還是沒有文章，獲取所有文章然後過濾
        if (posts.length === 0) {
          console.log('📡 嘗試獲取所有文章然後過濾...');
          
          try {
            response = await fetch('/api/OfficialPosts', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            if (response.ok) {
              const text = await response.text();
              const data = text ? JSON.parse(text) : [];
              
              let allPosts = [];
              if (Array.isArray(data)) {
                allPosts = data;
              } else if (data.Data && Array.isArray(data.Data)) {
                allPosts = data.Data;
              } else if (data.data && Array.isArray(data.data)) {
                allPosts = data.data;
              }
              
              console.log('📊 所有文章數量:', allPosts.length);
              
              // 過濾社會責任文章
              posts = allPosts.filter(post => {
                const category = post.Category || post.category || '';
                const isSR = category === '社會責任';
                if (isSR) {
                  console.log('✅ 找到社會責任文章:', post.Title || post.title);
                }
                return isSR;
              });
              
              console.log('📊 過濾後的社會責任文章:', posts.length, '篇');
            }
          } catch (error) {
            console.error('獲取所有文章失敗:', error);
          }
        }
        
        // 如果還是沒有，創建測試數據
        if (posts.length === 0) {
          console.log('⚠️ 沒有找到社會責任文章，使用測試數據');
          posts = [
            {
              Id: 999,
              Title: "JADE 企業社會責任實踐",
              Content: "作為一個負責任的企業，JADE 致力於創造更美好的社會環境...",
              Category: "社會責任",
              PublishedAt: new Date().toISOString(),
              Status: "published",
              CoverImage: "/images/banner-image-1.jpg",
              Excerpt: "了解 JADE 如何實踐企業社會責任，創造更美好的未來。"
            },
            {
              Id: 998,
              Title: "可持續時尚的未來",
              Content: "探討時尚產業如何實現可持續發展，保護我們的地球...",
              Category: "社會責任",
              PublishedAt: new Date(Date.now() - 86400000).toISOString(),
              Status: "published",
              CoverImage: "/images/banner-image-2.jpg",
              Excerpt: "時尚與環保並非對立，讓我們一起創造可持續的時尚未來。"
            }
          ];
        }
        
        this.posts = posts;
        
        // 如果有高亮文章且不在當前列表中，單獨獲取
        if (this.highlightedPostId && !this.posts.find(p => (p.Id || p.id) === this.highlightedPostId)) {
          await this.fetchHighlightedPost();
        }
        
        console.log('✅ 社會責任文章載入完成:', this.posts.length, '篇');
        
      } catch (error) {
        console.error('❌ 載入社會責任文章失敗:', error);
        this.posts = [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchHighlightedPost() {
      try {
        console.log('🔍 嘗試獲取高亮文章:', this.highlightedPostId);
        
        const response = await fetch(`/api/OfficialPosts/${this.highlightedPostId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const text = await response.text();
          const post = text ? JSON.parse(text) : null;
          
          console.log('📝 高亮文章回應:', post);
          
          if (post && (post.Category === '社會責任' || post.category === '社會責任')) {
            // 將高亮文章插入到列表前面
            this.posts.unshift(post);
            console.log('✅ 高亮文章已加入列表');
          }
        }
      } catch (error) {
        console.error('❌ 獲取高亮文章失敗:', error);
      }
    },
    
    viewPost(post) {
      this.selectedPost = post;
      // 移除高亮效果
      this.highlightedPostId = null;
    },
    
    closeModal() {
      this.selectedPost = null;
    },
    
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    getImageUrl(imagePath) {
      if (!imagePath) return '/images/post/default.jpg';
      // 根據你的後端設定調整路徑
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      // 嘗試不同的路徑格式
      if (imagePath.startsWith('/')) {
        return imagePath;
      }
      return `/images/${imagePath}`;
    },
    
    getExcerpt(content, length = 150) {
      if (!content) return '';
      const textContent = content.replace(/<[^>]*>/g, ''); // 移除 HTML 標籤
      return textContent.length > length 
        ? textContent.substring(0, length) + '...'
        : textContent;
    }
  }
}
</script>

<style scoped>
.sr-page {
  padding: 20px 0;
}

.sr-intro {
  background-color: #f8f9fa;
}

.section-padding {
  padding: 50px 0;
}

.section-tittle h2 {
  font-size: 36px;
  margin-bottom: 20px;
  color: #222222;
}

.sr-content {
  font-size: 16px;
  line-height: 1.8;
  color: #666666;
  white-space: pre-line;
}

.single-post {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.single-post:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.single-post.highlighted {
  border-color: #eb5757;
  background-color: #f8f9ff;
  box-shadow: 0 0 15px rgba(0,123,255,0.2);
}

.post-thumb img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.post-content {
  padding: 15px 0;
}

.post-content h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #222222;
}

.post-date {
  color: #888888;
  font-size: 14px;
  margin-right: 15px;
}

.category-tag {
  background-color: #022c5c;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.no-posts {
  text-align: center;
  padding: 40px 0;
  color: #666666;
}

/* 彈窗樣式 */
.post-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  max-height: 90vh;
  width: 90%;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #222222;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.post-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 20px;
}

.post-meta {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.post-content {
  line-height: 1.8;
  color: #444;
}

.post-content h1, .post-content h2, .post-content h3 {
  color: #222;
  margin-top: 20px;
  margin-bottom: 10px;
}

.post-content p {
  margin-bottom: 15px;
}
</style>
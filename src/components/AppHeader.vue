<template>
  <!-- 導航列 -->
  <nav class="navbar navbar-expand-lg text-uppercase fs-6 p-3 border-bottom align-items-center" 
       style="background-color: #efe8dd; position: fixed; display: block !important; top: 0px; left: 0px; width: 100%; z-index: 1030">
    <div class="container-fluid">
      <div class="row justify-content-between align-items-center w-100">
        
        <!-- Logo -->
        <div class="col-auto">
          <router-link class="navbar-brand" to="/">
            <img src="/images/main-logo.png" alt="網站 Logo" height="60">
          </router-link>
        </div>
        
        <!-- 導航選單 -->
        <div class="col-auto">
          <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"
                  aria-controls="offcanvasNavbar">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar"
               aria-labelledby="offcanvasNavbarLabel">
            <div class="offcanvas-header">
              <h5 class="offcanvas-title" id="offcanvasNavbarLabel">選單</h5>
              <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"
                      aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
              <ul class="navbar-nav justify-content-end flex-grow-1 gap-1 gap-md-5 pe-3">
                <li v-for="item in currentNavItems" :key="item.id" class="nav-item position-relative"
                    @mouseenter="item.id==='categories' && openCategoriesPanel()"
                    @mouseleave="item.id==='categories' && scheduleCloseCategoriesPanel()">
                  <!-- 一般項目 -->
                  <router-link 
                    v-if="item.type === 'router' && item.id !== 'categories'"
                    class="nav-link" 
                    :to="item.to"
                    :exact-active-class="item.activeClass || 'active'">
                    {{ item.text }}
                  </router-link>
                  <a 
                    v-else-if="item.id !== 'categories'"
                    class="nav-link" 
                    :href="item.href"
                    @click="handleNavClick(item, $event)">
                    {{ item.text }}
                  </a>

                  <!-- 商品分類（滑入面板） -->
                  <a v-else class="nav-link d-none d-lg-block" href="#" @click.prevent="goToAllProducts"
                  >
                    {{ item.text }}
                  </a>
                  <!-- 手機版仍直接導頁到商品列表 -->
                  <router-link 
                    v-if="item.id==='categories'"
                    class="nav-link d-lg-none" 
                    :to="{ path: '/products' }"
                    >{{ item.text }}</router-link>

                  <!-- 顯示分類面板（僅桌面） -->
                  <div 
                    v-if="item.id==='categories'"
                    class="categories-panel d-none d-lg-block"
                    :class="{ show: showCategoriesPanel }"
                    @mouseenter="clearCloseTimer"
                    @mouseleave="scheduleCloseCategoriesPanel"
                  >
                    <div class="panel-inner">
                      <div class="row gx-4 gy-3">
                        <!-- 固定四欄：風格館 + 男裝 + 女裝 + 配件 -->
                        <div class="col-3">
                          <div class="style-block">
                            <div class="style-title">
                              <i class="fas fa-palette me-2"></i>風格館
                            </div>
                            <div class="style-list">
                              <button 
                                v-for="style in styleAttributes"
                                :key="style.id || style.Id"
                                class="style-item"
                                @click="goToStyle(style)"
                              >
                                {{ style.value || style.name || style.Value || style.Name }}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div 
                          v-for="cat in panelFixedCategories" 
                          :key="cat.id"
                          class="col-3"
                        >
                          <div class="cat-block">
                            <div class="cat-title" @click="goToCategory(cat)">
                              <i :class="getCategoryIcon(cat.name)" class="me-2"></i>{{ cat.name }}
                            </div>
                            <div class="sub-list">
                              <button 
                                v-for="sub in getSubCategories(cat.id)"
                                :key="sub.id"
                                class="sub-item"
                                @click="goToSubCategory(cat, sub)"
                              >
                                {{ sub.name }}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 右側圖示 -->
        <div class="col-auto">
          <ul class="list-unstyled d-flex m-0 align-items-center gap-3">
            <!-- 即時通 -->
            <li>
              <button type="button" 
                      class="icon-button border-0" 
                      @click="handleChatClick"
                      title="商家聊天">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14M18,8H6V6H18"/>
                </svg>
                <span v-if="unreadMessages > 0" class="notification-badge">{{ unreadMessages }}</span>
              </button>
            </li>
            
            <!-- 官方通知 -->
            <li class="nav-item dropdown">
              <button 
                type="button" 
                class="icon-button border-0 dropdown-toggle"
                id="notificationsDropdown" 
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="false"
                title="官方通知"
                style="position: relative;"
                  
              >
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21"/>
                </svg>
                <span v-if="notices.length > 0" class="notification-badge" 
                      style="position: absolute; top: -8px; right: -8px; background: #dc3545; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                  {{ notices.length }}
                </span>
              </button>
              
              <!-- Dropdown - Notifications -->
              <div class="dropdown-menu dropdown-list dropdown-menu-end shadow animated--grow-in" 
                   aria-labelledby="notificationsDropdown">
                <h6 class="dropdown-header d-flex justify-content-between align-items-center">
                  <span>
                    <i class="fas fa-bell me-2"></i>
                    通知中心
                  </span>
                </h6>
                
                <!-- 載入狀態 -->
                <div v-if="loadingNotices" class="dropdown-item-text text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">載入中...</span>
                  </div>
                  <div class="text-muted mt-2">載入通知中...</div>
                </div>
                
                <!-- 空狀態 -->
                <div v-else-if="notices.length === 0" class="dropdown-item-text text-center py-4">
                  <i class="fas fa-bell-slash fa-2x text-muted mb-2"></i>
                  <div class="text-muted">目前沒有通知</div>
                </div>
                
                <!-- 通知列表 -->
                <template v-else>
                  <a 
                    v-for="notice in displayNotices" 
                    :key="notice.id"
                    class="dropdown-item d-flex align-items-start notice-item"
                    href="#"
                    @click.prevent="handleNoticeClick(notice)"
                  >
                    <!-- 通知圖示 -->
                    <div class="notice-icon me-3">
                      <i class="fas fa-bell text-primary"></i>
                    </div>
                    
                    <!-- 通知內容 -->
                    <div class="flex-grow-1 min-width-0">
                      <div class="d-flex justify-content-between align-items-start mb-1">
                        <div class="font-weight-bold text-truncate">
                          {{ notice.title }}
                        </div>
                        <div class="small text-muted ms-2 flex-shrink-0">
                          {{ formatTime(notice.date) }}
                        </div>
                      </div>
                      
                      <div class="text-truncate mb-1" style="font-size: 0.875rem;">
                        {{ getNoticePreview(notice.content) }}
                      </div>
                      
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="small text-muted">
                          {{ notice.publisher || '系統' }}
                        </div>
                        <div class="notice-actions">
                          <span v-if="notice.scheduledAt && new Date(notice.scheduledAt) <= new Date()" 
                                class="badge badge-success px-2">
                            已發送
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                  
                  <!-- 查看更多 -->
                  <div v-if="notices.length > maxDisplayNotices" class="dropdown-divider"></div>
                  <a 
                    class="dropdown-item text-center small text-muted py-2" 
                    href="#" 
                    @click.prevent="showAllNotices"
                  >
                    查看全部 {{ notices.length }} 則通知
                    <i class="fas fa-arrow-right ms-1"></i>
                  </a>
                </template>
              </div>
            </li>
            

            <!-- 購物車 -->
            <li>
              <router-link to="/cart" class="icon-button" title="購物車">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 18C5.9 18 5 18.9 5 20S5.9 22 7 22 9 20.9 9 20 8.1 18 7 18M1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15A2 2 0 0 0 7 17H19V15H7.42A.25.25 0 0 1 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5H5.21L4.27 3H1M7 18C5.9 18 5 18.9 5 20S5.9 22 7 22 9 20.9 9 20 8.1 18 7 18M17 18C15.9 18 15 18.9 15 20S15.9 22 17 22 19 20.9 19 20 18.1 18 17 18Z"/>
                </svg>
                <span v-if="cartCount > 0" class="notification-badge cart-badge-icon">{{ cartCount }}</span>
              </router-link>
            </li>
            <!-- 登入/使用者 -->
 <li class="nav-item dropdown">
    <button
      class="icon-button border-0 dropdown-toggle"
      id="userDropdown"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      title="會員選單"
      style="position: relative;"
    >
      <template v-if="isLogin">
        <img :src="profileImgUrl || defaultImg" class="profile-avatar" alt="會員頭像" />
      </template>
      <template v-else>
        <i class="bi bi-person-circle fs-4"></i>
      </template>
    </button>

    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
      <!-- 未登入 -->
      <template v-if="!isLogin">
        <li>
          <router-link class="dropdown-item d-flex align-items-center gap-2" to="/login">
            <i class="bi bi-box-arrow-in-right"></i> 登入 / 註冊
          </router-link>
        </li>
      </template>

      <!-- 已登入 -->
      <template v-else>
        <li>
          <router-link class="dropdown-item d-flex align-items-center gap-2" to="/member">
            <i class="bi bi-person"></i> 會員中心
          </router-link>
        </li>

        <!-- 如果是賣家 -->
        <li v-if="isSeller">
          <router-link class="dropdown-item d-flex align-items-center gap-2" to="/seller">
            <i class="bi bi-shop"></i> 賣家中心
          </router-link>
        </li>

        <li><hr class="dropdown-divider" /></li>

        <li>
          <button class="dropdown-item d-flex align-items-center gap-2" @click="logout">
            <i class="bi bi-box-arrow-right"></i> 登出
          </button>
        </li>
      </template>
    </ul>
  </li>
            <!-- 搜尋按鈕 -->
            <li>
              <button type="button" 
                      class="icon-button border-0" 
                      @click="handleSearchClick"
                      title="搜尋">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>

  <!-- 聊天對話框 Modal -->
  <div class="modal fade" id="chatListModal" tabindex="-1" aria-labelledby="chatListModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen modal-dialog-centered">
      <div class="modal-content h-100">
        <div class="modal-header">
          <h5 class="modal-title" id="chatListModalLabel">聊天系統</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-0 h-100">
          <ChatRoomComponent v-if="!showChat" @close="closeChat" />
        </div>
      </div>
    </div>
  </div>
  
  <!-- 浮動聊天元件（右下角） - 點擊外面可收回 -->
  <div v-if="showChat" class="floating-chat-backdrop" @click="closeChat" style="position: fixed; inset: 0; z-index: 1060;">
    <div class="floating-chat-panel" @click.stop style="position: fixed; bottom: 20px; right: 20px; z-index: 1061;">
      <ChatRoomComponent @close="closeChat" />
    </div>
  </div>
</template>

<script>
import { Dropdown, Offcanvas, Modal } from 'bootstrap'
import authService from '@/services/authService'
import axios from 'axios';
import ChatRoomComponent from './ChatRoom.vue';

export default {
  name: 'AppHeader',
  emits: ['openSearch'],
  components: {
    ChatRoomComponent
  },
  props: {
    // 允許從外部傳入自定義導航選單
    navItems: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
         isLogin: false,   // 改成 true 代表已登入
      isSeller: false,  // 改成 true 代表是賣家
      profileImgUrl: '', // 會員頭像網址
      defaultImg: '/images/default-avatar.png', // 預設頭像
      cartCount: 0,
      
      notices: [], // 改為空陣列，將從 API 載入
      maxDisplayNotices: 5,
      removeListener: null,
      loadingNotices: false, // 載入狀態
      notificationRefreshInterval: null, // 定期刷新計時器
      
  // 商品分類面板狀態
  showCategoriesPanel: false,
  categories: [],
  subCategories: [],
  catsPerPage: 6, // 每頁顯示 6 個分類
  catPageIndex: 0,
  hideTimer: null,
      // 預設導航選單（一般頁面）
      defaultNavItems: [
        {
          id: 'home',
          type: 'router',
          text: '首頁',
          to: '/',
          activeClass: 'active'
        },
        {
          id: 'new-arrival',
          type: 'router',
          text: '新品上市',
          to: '/products?sortBy=CreatedAt&sortDirection=desc&isNew=true'
        },
        {
          id: 'best-sellers',
          type: 'anchor',
          text: '熱銷商品',
          href: '#best-sellers'
        },
        {
          id: 'categories',
          type: 'anchor',
          text: '商品分類',
          href: '#categories'
        },
        {
          id: 'about',
          type: 'router',
          text: '關於我們',
          to: '/about'
        },
        {
          id: 'apply',
          type: 'router',
          text: '賣家申請',
          to: '/apply'
        }
      ],
      // 部落格導航選單
      blogNavItems: [
        {
          id: 'store-home',
          type: 'router',
          text: '賣場首頁',
          to: '/',
          activeClass: 'active'
        },
        {
          id: 'hot-topics',
          type: 'router',
          text: '熱門話題',
          to: '/blog'
        },
        {
          id: 'outfit-sharing',
          type: 'router',
          text: '穿搭分享',
          to: '/blog/memberpost',
        },
        {
          id: 'social-responsibility',
          type: 'router',
          text: '社會責任',
          to: '/blog/sr'
        },
        {
          id: 'about-us',
          type: 'router',
          text: '關於我們',
          to: '/about'
        }
      ],
      // 風格館資料
      allAttributes: [],
      allAttributeValues: [],
      styleAttributes: [],
      showChat: false
  ,
  chatInitAttempted: false
    }
  },
  
  computed: {
    // 決定當前使用的導航選單
    currentNavItems() {
      // 如果有傳入自定義導航選單，優先使用
      if (this.navItems) {
        return this.navItems
      }

      // 根據當前路由判斷是否為部落格頁面
      const currentRoute = this.$route
      const isBlogPage = currentRoute && (
        currentRoute.path.startsWith('/blog') || 
        currentRoute.name === 'BlogHome' || 
        currentRoute.name === 'BlogView' ||
        currentRoute.name === 'PostDetail' ||
        currentRoute.name === 'BlogCategory' ||
        currentRoute.name === 'BlogSearch'
      )

      // 過濾導航選單項目
      if (!isBlogPage) {
        let navItems = this.defaultNavItems.filter(item => {
          // 如果是賣家申請項目，只有非賣家才顯示
          if (item.id === 'apply') {
            return !this.isSeller
          }
          // 其他項目都顯示
          return true
        })
        
        return navItems
      } else {
        return this.blogNavItems
      }
    },
    
    // 通知系統相關計算屬性
    displayNotices() {
      return this.notices.slice(0, this.maxDisplayNotices)
    },
    // 商品分類分頁
    categoryPages() {
      const per = this.catsPerPage
      const pages = []
      for (let i = 0; i < this.categories.length; i += per) {
        pages.push(this.categories.slice(i, i + per))
      }
      return pages
    },
    pagedCategories() {
      if (!this.categoryPages.length) return []
      return this.categoryPages[this.catPageIndex] || []
    },
    hasStyles() {
      return Array.isArray(this.styleAttributes) && this.styleAttributes.length > 0
    },
    panelFixedCategories() {
      // 根據名稱挑出固定三類：男裝、女裝、配件
      const wanted = ['男裝', '女裝', '配件']
      const picked = []
      for (const name of wanted) {
        const found = (this.categories || []).find(c => (c.name || c.Name) === name)
        if (found) {
          picked.push({ id: found.id || found.Id, name: found.name || found.Name })
        } else {
          // 若尚未載入或不存在，以名稱佔位，避免版面閃動
          picked.push({ id: null, name })
        }
      }
      return picked
    },
    // 聊天未讀總數（來自 Vuex chat 模組）
    unreadMessages() {
      try {
        return this.$store.getters['chat/totalUnread'] || 0;
      } catch (e) { return 0; }
    }
  },
  methods: {
    toggleChat() {
      this.showChat = !this.showChat;
    },
    closeChat() {
      this.showChat = false;
      // 如果 modal 版的聊天視窗開啟，使用 Bootstrap API 隱藏它
      try {
        const modalEl = document.getElementById('chatListModal');
        if (modalEl) {
          const bsModal = Modal.getInstance(modalEl) || new Modal(modalEl);
          bsModal.hide();
        }
      } catch (e) {
        console.warn('closeChat: hide modal failed', e);
      }
    },
    // === Bootstrap 初始化方法 ===
    logout() {
      // 登出邏輯
      console.log('🔓 開始登出...');
      
      // 清除 localStorage
      localStorage.removeItem('memberId');
      localStorage.removeItem('isSeller');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
  // 一併清除賣家快取（與商品管理/儀表板一致）
  localStorage.removeItem('currentSellerId');
  localStorage.removeItem('currentSellerId_owner');
      
      // 🔧 同步清除 authService 狀態
      try {
        authService.logout();
      } catch (error) {
        console.warn('清除 authService 狀態失敗:', error);
      }
      
      // 更新組件狀態
      this.isLogin = false;
      this.isSeller = false;
      this.profileImgUrl = ''; // 清除頭像
      
      console.log('✅ 登出完成');
      
      // 跳轉到登入頁面
      this.$router.push('/login');
    },
    // 會員登入後即時更新 header 狀態
    handleUserLogin(user) {
      this.isLogin = true;
      // 更新賣家狀態
      this.updateSellerStatus(user);
      this.profileImgUrl = user.profileImgUrl || user.profileImage || ''; // 從 user 物件取得頭像網址
      
      console.log('🔔 AppHeader: 收到登入事件', { 
        user, 
        isLogin: this.isLogin, 
        isSeller: this.isSeller 
      });
      
      // 🔧 同步到 authService，確保狀態一致
      try {
        authService.saveUserToStorage(user);
      } catch (error) {
        console.warn('同步到 authService 失敗:', error);
      }
      
      // 強制更新 Vue 組件視圖，確保狀態變化即時反映
      this.$nextTick(() => {
        this.$forceUpdate();
        // 額外延遲更新，確保計算屬性重新計算
        setTimeout(() => {
          this.$forceUpdate();
        }, 100);
      });
      
      // 如果登入時沒有頭像資料，嘗試從 API 載入
      if (!this.profileImgUrl) {
        this.loadMemberProfile();
      }
    },

    // 更新賣家狀態的專門方法
    updateSellerStatus(user) {
      if (!user) {
        this.isSeller = false;
        localStorage.removeItem('isSeller');
        return;
      }

      // 檢查多種可能的賣家狀態屬性
      const isSellerFromUser = user && (
        user.role === true || user.role === 'true' || user.role === 1 ||
        user.isSeller === true || user.isSeller === 'true' || user.isSeller === 1 ||
        user.Role === true || user.Role === 'true' || user.Role === 1 ||
        user.IsSeller === true || user.IsSeller === 'true' || user.IsSeller === 1
      );

      // 也檢查 localStorage 中的狀態
      const storedSellerStatus = localStorage.getItem('isSeller');
      const isSellerFromStorage = storedSellerStatus === 'true';

      // 優先使用用戶物件中的狀態，如果沒有則使用 localStorage
      this.isSeller = isSellerFromUser || isSellerFromStorage;

      // 同步到 localStorage
      localStorage.setItem('isSeller', this.isSeller.toString());

      console.log('🔄 賣家狀態已更新:', {
        isSellerFromUser,
        isSellerFromStorage,
        finalIsSeller: this.isSeller,
        userRoleProperties: {
          role: user.role,
          isSeller: user.isSeller,
          Role: user.Role,
          IsSeller: user.IsSeller
        }
      });
    },
    // 會員登出後即時更新 header 狀態
    handleUserLogout() {
      this.isLogin = false;
      this.isSeller = false;
      this.profileImgUrl = ''; // 清除頭像
    },

    // 處理賣家申請成功事件
    handleSellerApplicationSuccess(data) {
      console.log('🎉 AppHeader: 收到賣家申請成功事件', data);
      
      // 更新賣家狀態
      this.isSeller = true;
      localStorage.setItem('isSeller', 'true');
      
      // 如果有完整的用戶資料，也更新其他資訊
      if (data && data.user) {
        this.updateSellerStatus(data.user);
        if (data.user.profileImgUrl || data.user.profileImage) {
          this.profileImgUrl = data.user.profileImgUrl || data.user.profileImage;
          localStorage.setItem('profileImgUrl', this.profileImgUrl);
        }
      } else {
        // 沒有完整用戶資料時，只更新賣家狀態
        this.isSeller = true;
        localStorage.setItem('isSeller', 'true');
      }
      
      // 強制更新視圖以確保導航選單立即更新
      this.$nextTick(() => {
        this.$forceUpdate();
        setTimeout(() => {
          this.$forceUpdate();
        }, 100);
      });
      
      console.log('✅ AppHeader: 賣家狀態已更新為:', this.isSeller);
    },
    
    // 處理個人資料更新事件
    handleProfileUpdate(data) {
      if (data && data.profileImgUrl) {
        this.profileImgUrl = data.profileImgUrl;
        console.log('✅ Header: 頭像已更新:', data.profileImgUrl);
      }
    },
    
    // 從 API 載入會員個人資料
    async loadMemberProfile() {
      const memberId = localStorage.getItem('memberId');
      if (!memberId) return;
      
      try {
        console.log('🔍 Header: 載入會員個人資料...');
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'}/Auth/${memberId}/profile`);
        
        console.log('📋 API 回應資料:', response.data);
        
        // 根據你的後端 API，頭像應該在 ProfileImg 欄位
        const profileImageUrl = 
          response.data?.profileImg || 
          response.data?.ProfileImg || 
          response.data?.profileImageUrl || 
          response.data?.ProfileImageUrl ||
          response.data?.avatar || 
          response.data?.imageUrl;
          
        if (profileImageUrl) {
          this.profileImgUrl = profileImageUrl;
          localStorage.setItem('profileImgUrl', profileImageUrl);
          console.log('✅ Header: 從 API 載入頭像成功:', profileImageUrl);
        } else {
          console.log('⚠️ Header: API 回應中沒有找到頭像欄位');
          console.log('📋 可用欄位:', Object.keys(response.data || {}));
        }
      } catch (error) {
        console.warn('⚠️ Header: 載入會員資料失敗:', error);
        if (error.response) {
          console.log('📋 錯誤回應:', error.response.status, error.response.data);
        }
        // 如果 API 失敗，不影響其他功能
      }
    },
    // 初始化 Bootstrap Dropdown
    initializeDropdowns() {
      try {
        const dropdownElement = document.getElementById('notificationsDropdown');
        if (dropdownElement) {
          // 檢查是否已經初始化
          let dropdownInstance = Dropdown.getInstance(dropdownElement);
          if (!dropdownInstance) {
            dropdownInstance = new Dropdown(dropdownElement);
            console.log('🔔 Header: Bootstrap Dropdown 已初始化');
          }
        }
      } catch (error) {
        console.error('🔔 Header: Bootstrap Dropdown 初始化失敗:', error);
      }
    },
    // === 商品分類浮層 ===
    async openCategoriesPanel() {
      this.clearCloseTimer()
      this.showCategoriesPanel = true
      // 懶載入分類/子分類
      if (this.categories.length === 0) {
        try {
          await Promise.all([this.fetchCategories(), this.fetchSubCategories()])
        } catch (e) {
          console.error('載入分類或子分類失敗', e)
        }
      }
      // 懶載入風格資料
      if (this.styleAttributes.length === 0) {
        try {
          await this.loadStyles()
        } catch (e) {
          console.error('載入風格資料失敗', e)
        }
      }
    },
    scheduleCloseCategoriesPanel() {
      this.clearCloseTimer()
      this.hideTimer = setTimeout(() => {
        this.showCategoriesPanel = false
      }, 150)
    },
    clearCloseTimer() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer)
        this.hideTimer = null
      }
    },
    async fetchCategories() {
      const res = await fetch('/api/Categories', { headers: { 'Accept': 'application/json' } })
      if (!res.ok) throw new Error('Categories API error')
      const data = await res.json()
      this.categories = (data || []).filter(c => c.isVisible !== false).map(c => ({
        id: c.id || c.Id,
        name: c.name || c.Name,
        sortOrder: c.sortOrder || c.SortOrder || 0
      })).sort((a,b)=>a.sortOrder-b.sortOrder)
    },
    async fetchSubCategories() {
      const res = await fetch('/api/SubCategories', { headers: { 'Accept': 'application/json' } })
      if (!res.ok) throw new Error('SubCategories API error')
      const data = await res.json()
      this.subCategories = (data || []).filter(s => s.isVisible !== false).map(s => ({
        id: s.id || s.Id,
        name: s.name || s.Name,
        categoryId: s.categoryId || s.CategoryId,
        sortOrder: s.sortOrder || s.SortOrder || 0
      }))
    },
    getSubCategories(categoryId) {
      return this.subCategories
        .filter(s => (s.categoryId == categoryId))
        .sort((a,b)=> (a.sortOrder||0) - (b.sortOrder||0))
        .slice(0, 6) // 每分類最多顯示前 6 個子分類，可自行調整
    },
    setCatPage(idx) {
      this.catPageIndex = idx
    },
    // 桌面點擊「商品分類」時，直接前往商品總覽（無篩選）
    goToAllProducts() {
      this.showCategoriesPanel = false
      // 若在手機 offcanvas 也一併關閉（防護）
      const offcanvas = document.getElementById('offcanvasNavbar')
      if (offcanvas) {
        const bsOffcanvas = Offcanvas.getInstance(offcanvas)
        if (bsOffcanvas) bsOffcanvas.hide()
      }
      this.$router.push({ path: '/products' })
    },
    goToCategory(cat) {
      this.showCategoriesPanel = false
      this.$router.push({ path: '/products', query: { categoryId: cat.id } })
    },
    goToSubCategory(cat, sub) {
      this.showCategoriesPanel = false
      this.$router.push({ path: '/products', query: { categoryId: cat.id, subCategoryId: sub.id } })
    },
    async loadStyles() {
      try {
        // 取得所有 Attributes 與 AttributeValues
        const [attrRes, valRes] = await Promise.all([
          fetch('/api/Attributes', { headers: { 'Accept': 'application/json' } }),
          fetch('/api/AttributeValues', { headers: { 'Accept': 'application/json' } }),
        ])
        if (!attrRes.ok || !valRes.ok) throw new Error('Attributes API error')

        const [attrs, vals] = await Promise.all([attrRes.json(), valRes.json()])
        this.allAttributes = Array.isArray(attrs) ? attrs : []
        this.allAttributeValues = Array.isArray(vals) ? vals : []

        // 找出名稱包含「風格」的屬性，並收集其對應的屬性值
        const styleAttrs = this.allAttributes.filter(a => (a.name || a.Name || '').includes('風格'))
        const styleAttrIds = new Set(styleAttrs.map(a => a.id || a.Id))

        const styles = this.allAttributeValues.filter(v => styleAttrIds.has(v.attributeId || v.Attribute_Id || v.attribute_id))
          .map(v => ({ id: v.id || v.Id, value: v.value || v.Value }))
          .sort((a, b) => String(a.value).localeCompare(String(b.value), 'zh-Hant'))

        this.styleAttributes = styles
      } catch (err) {
        console.error('loadStyles error', err)
        this.styleAttributes = []
      }
    },
    goToStyle(style) {
      const styleId = style.id || style.Id
      this.showCategoriesPanel = false
      this.$router.push({ path: '/products', query: { styleId } })
    },
    
    // 手動切換通知下拉選單
    toggleNotificationDropdown(event) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        const dropdownElement = document.getElementById('notificationsDropdown');
        if (dropdownElement) {
          let dropdownInstance = Dropdown.getInstance(dropdownElement);
          if (!dropdownInstance) {
            dropdownInstance = new Dropdown(dropdownElement);
          }
          dropdownInstance.toggle();
          console.log('🔔 Header: 手動切換通知下拉選單');
        }
      } catch (error) {
        console.error('🔔 Header: 切換下拉選單失敗:', error);
        // 如果 Bootstrap 方法失敗，使用原生方法
        const dropdownElement = document.getElementById('notificationsDropdown');
        const dropdownMenu = document.querySelector('#notificationsDropdown + .dropdown-menu');
        if (dropdownMenu && dropdownElement) {
          const isVisible = dropdownMenu.classList.contains('show');
          if (isVisible) {
            dropdownMenu.classList.remove('show');
            dropdownElement.setAttribute('aria-expanded', 'false');
          } else {
            dropdownMenu.classList.add('show');
            dropdownElement.setAttribute('aria-expanded', 'true');
          }
        }
      }
    },
    
    // === 通知相關方法 ===
    
    // 載入通知資料
    async loadNotifications() {
      if (this.loadingNotices) return;
      
      this.loadingNotices = true;
      
      try {
        console.log('🔔 Header: 開始載入通知資料...');
        
        // 使用全域 API 載入通知（只載入 push 通知）
        const queryParams = {
          itemsPerPage: 20, // Header 顯示前 20 個通知
          sortBy: 'CreatedAt',
          sortDirection: 'desc'
        };
        
        const result = await this.$api.getNotifications(queryParams);
        
        if (result.success && Array.isArray(result.data)) {
          // 處理 API 回傳的資料並篩選
          const processedNotices = this.processNotificationData(result.data);
          
          // 套用與 NoticeAllView 相同的篩選邏輯
          this.notices = this.filterNoticesForDisplay(processedNotices);
          
          console.log(`✅ Header: 成功載入 ${this.notices.length} 則通知`);
        } else {
          throw new Error(result.message || result.error || `API 錯誤`);
        }
      } catch (error) {
        console.error('❌ Header: 載入通知失敗:', error);
        // Header 中的錯誤不顯示給用戶，但保留日誌
      } finally {
        this.loadingNotices = false;
      }
    },

    // 篩選要在 Header 顯示的通知
    filterNoticesForDisplay(notifications) {
      const now = new Date();
      
      return notifications.filter(notification => {
        // 如果有排程時間，必須是已發送狀態
        if (notification.scheduledAt) {
          const scheduledTime = new Date(notification.scheduledAt);
          return scheduledTime <= now && (notification.emailStatus === 'sent' || notification.emailStatus === 'delivered');
        }
        
        // 只顯示 push 通知，不顯示 email 通知
        if (notification.channel && notification.channel.toLowerCase() === 'email') {
          return false;
        }
        
        return true;
      });
    },

    // 處理從 API 回傳的通知資料
    processNotificationData(apiData) {
      if (!Array.isArray(apiData)) {
        console.warn('Header: API 回傳的資料格式不正確');
        return [];
      }

      return apiData.map(notification => {
        // 根據新的 NotificationResponseDto 結構處理資料
        return {
          id: notification.id,
          title: this.extractTitleFromMessage(notification.message),
          content: notification.message,
          priority: this.mapCategoryToPriority(notification.category),
          isRead: notification.emailStatus === 'delivered' || notification.emailStatus === 'sent',
          acknowledged: notification.emailStatus === 'delivered' || notification.emailStatus === 'sent',
          createdAt: notification.createdAt || notification.sentAt,
          scheduledAt: notification.scheduledAt,
          category: notification.category,
          categoryLabel: notification.categoryLabel,
          emailStatus: notification.emailStatus,
          emailStatusLabel: notification.emailStatusLabel,
          // 判斷通道類型，如果有 emailAddress 就是 email，否則是 push
          channel: notification.emailAddress ? 'email' : (notification.channel || 'push'),
          channelLabel: notification.emailAddress ? 'Email' : (notification.channelLabel || notification.channel || 'Push'),
          publisher: notification.emailAddress ? '系統通知' : '管理員',
          date: notification.createdAt || notification.sentAt
        };
      }).filter(notice => notice.title && notice.content); // 過濾掉無效通知
    },

    // 從訊息中提取標題（取前30字元作為標題）
    extractTitleFromMessage(message) {
      if (!message) return '無標題通知';
      
      // 移除 HTML 標籤
      const textContent = message.replace(/<[^>]*>/g, '').trim();
      
      // 取前30字元作為標題
      if (textContent.length <= 30) {
        return textContent;
      }
      
      return textContent.substring(0, 30) + '...';
    },

    // 將類別映射為優先級
    mapCategoryToPriority(category) {
      const categoryMap = {
        'urgent': 'high',
        'important': 'high',
        'system': 'medium',
        'maintenance': 'medium',
        'general': 'normal',
        'info': 'normal'
      };
      return categoryMap[category?.toLowerCase()] || 'normal';
    },

    // 解析日期
    parseDate(dateValue) {
      if (!dateValue) return new Date();
      if (dateValue instanceof Date) return dateValue;
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    },

    // 映射優先級
    mapPriority(apiPriority) {
      const priorityMap = {
        '1': 'high',
        '2': 'medium', 
        '3': 'normal',
        '4': 'low',
        'urgent': 'high',
        'important': 'medium',
        'normal': 'normal',
        'info': 'low',
        'high': 'high',
        'medium': 'medium',
        'low': 'low'
      };
      
      return priorityMap[String(apiPriority).toLowerCase()] || 'normal';
    },

    // 處理通知點擊
    async handleNoticeClick(notice) {
      // 標記為已讀
      if (!notice.acknowledged) {
        try {
          notice.acknowledged = true;
          await this.$api.acknowledgeNotification(notice.id);
          console.log(`✅ Header: 通知 ${notice.id} 已確認`);
        } catch (error) {
          console.error('❌ Header: 確認通知失敗:', error);
          notice.acknowledged = false;
        }
      }
      
      // 關閉下拉選單
      const dropdown = document.querySelector('#notificationsDropdown');
      if (dropdown) {
        const bsDropdown = Dropdown.getInstance(dropdown);
        if (bsDropdown) {
          bsDropdown.hide();
        }
      }
      
      console.log('🔔 Header: 查看通知詳情:', notice);
    },

    // 查看所有通知
    showAllNotices() {
      // 跳轉到所有通知頁面
      this.$router.push('/notice-all');
      
      // 關閉下拉選單
      const dropdown = document.querySelector('#notificationsDropdown');
      if (dropdown) {
        const bsDropdown = Dropdown.getInstance(dropdown);
        if (bsDropdown) {
          bsDropdown.hide();
        }
      }
    },

    // === 其他方法保持不變 ===

    formatTime(date) {
      const now = new Date()
      const noticeDate = new Date(date)
      const diffInMinutes = Math.floor((now - noticeDate) / 60000)
      
      if (diffInMinutes < 1) {
        return '剛剛'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}分鐘前`
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}小時前`
      } else {
        return noticeDate.toLocaleDateString('zh-TW')
      }
    },

    getNoticePreview(content) {
      // 移除 HTML 標籤並截取前 50 個字符
      const text = content.replace(/<[^>]*>/g, '')
      return text.length > 50 ? text.substring(0, 50) + '...' : text
    },
    
    // 原有方法
    handleSearchClick() {
      this.$emit('openSearch')
    },
    
    handleNavClick(item, event) {
      if (item.type === 'anchor') {
        this.scrollToSection(event)
      }
    },
    
    async initChat() {
  if (!this.isLogin) return;
      if (!this.$store || typeof this.$store.dispatch !== 'function') {
        console.warn('initChat: $store not available yet');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        await this.$store.dispatch('chat/ensureConnected', token);
        // 角色判斷（簡化：若 isSeller 為 true，抓賣家房間；否則會員房間）
        if (this.isSeller) {
          await this.$store.dispatch('chat/fetchSellerRooms');
        } else {
          await this.$store.dispatch('chat/fetchMemberRooms');
        }
      } catch (err) {
  console.error('初始化聊天失敗', err);
  // 標記為已嘗試，避免 UI 重複觸發多次連線嘗試
  this.chatInitAttempted = true;
      }
    },
    async handleChatClick() {
      if (!this.isLogin) {
        this.$router.push('/login?redirect=' + encodeURIComponent('/member/chat'));
        return;
      }

      // 準備聊天（連線等），只在尚未嘗試過時觸發一次
      if (!this.chatInitAttempted) {
        try {
          this.initChat();
        } catch (e) {
          console.warn('初始化聊天失敗（可忽略）', e);
          this.chatInitAttempted = true;
        }
      }
  // 切換右下角浮動聊天面板
  this.showChat = true;
    },
    
    handleNewMessage() {
      // 當收到新訊息時增加未讀數
      if (!this.isVendorChatModalVisible()) {
        this.unreadMessages++
      }
    },
    
    handleConnectionStatus(isConnected) {
      // 更新聊天連線狀態
      this.isConnectedToChat = isConnected
    },
    
    isVendorChatModalVisible() {
      // 檢查會員廠商聊天模態框是否可見
      const chatModal = document.getElementById('chatListModal')
      return chatModal && chatModal.classList.contains('show')
    },
    
    // 處理從聊天服務收到的消息
    handleChatServiceMessage(data) {
      // 只在特定消息類型時處理
      if (data.Type === 'privateMessage') {
        // 如果聊天視窗沒有開啟，則增加未讀消息數
        if (!this.isVendorChatModalVisible()) {
          this.unreadMessages++;
        }
        
        // 播放通知聲音 (可選)
        this.playNotificationSound();
      }
    },
    
    // 播放通知聲音
    playNotificationSound() {
      // 可以添加一個簡單的通知聲音
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => {
          // 用戶互動問題，忽略錯誤
          console.log('播放通知聲音需要用戶互動');
        });
      } catch (error) {
        console.error('播放通知聲音失敗:', error);
      }
    },
    
    scrollToSection(event) {
      event.preventDefault()
      const targetId = event.target.getAttribute('href').substring(1)
      const targetElement = document.getElementById(targetId)
      
      if (targetElement) {
        // 考慮固定導航欄的高度 (90px)
        const offsetTop = targetElement.offsetTop - 90
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        })
      }
      
      // 關閉手機版選單
      const offcanvas = document.getElementById('offcanvasNavbar')
      if (offcanvas) {
        const bsOffcanvas = Offcanvas.getInstance(offcanvas)
        if (bsOffcanvas) {
          bsOffcanvas.hide()
        }
      }
    },
    
    // 更新購物車數量
    updateCartCount(count) {
      this.cartCount = count
    },
    getCategoryIcon(categoryName) {
      const iconMap = {
        '男裝': 'fas fa-male',
        '女裝': 'fas fa-female',
        '配件': 'fas fa-shopping-bag',
        '鞋子': 'fas fa-shoe-prints',
        '包包': 'fas fa-shopping-bag',
        '飾品': 'fas fa-gem'
      }
      return iconMap[categoryName] || 'fas fa-tag'
    },
  },
  mounted() {
    // 從 localStorage 載入用戶登入狀態
    // 檢查多種可能的 key 格式
    let user = null;
    let memberId = null;
    let isSeller = false;
    
    try {
      // 方法1: 檢查完整的用戶物件 (舊版本格式)
      const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
      if (storedUser) {
        user = JSON.parse(storedUser);
      }
      
      // 方法2: 檢查新版本的分開儲存格式 (目前使用的格式)
      memberId = localStorage.getItem('memberId');
      const sellerStatus = localStorage.getItem('isSeller');
      if (sellerStatus) {
        isSeller = sellerStatus === 'true';
      }
      
      console.log('🔍 檢查登入狀態:', { 
        user: !!user, 
        memberId: !!memberId, 
        isSeller,
        sellerStatus 
      });
      
    } catch (error) {
      console.error('解析用戶資料失敗:', error);
    }

    // 也可以使用 authService 來檢查
    const authUser = authService.getCurrentUser();

    // 判斷登入狀態的優先順序
    if (user && user.role !== undefined) {
      // 有完整用戶物件 (舊格式)
      this.isLogin = true;
      this.isSeller = user.role === true || user.role === 'true' || user.role === 1;
      this.profileImgUrl = user.profileImgUrl || user.profileImage || '';
      console.log('✅ 用戶已登入 (完整物件):', {
        isLogin: this.isLogin,
        isSeller: this.isSeller,
        userRole: user.role,
        profileImg: this.profileImgUrl
      });
    } else if (memberId) {
      // 有 memberId 表示已登入 (新格式)
      this.isLogin = true;
      this.isSeller = isSeller;
      // 嘗試從 localStorage 載入頭像
      this.profileImgUrl = localStorage.getItem('profileImgUrl') || '';
      console.log('✅ 用戶已登入 (memberId):', {
        isLogin: this.isLogin,
        isSeller: this.isSeller,
        memberId: memberId,
        profileImg: this.profileImgUrl
      });
    } else if (authUser) {
      // 使用 authService 檢查 (備用)
      this.isLogin = true;
      this.isSeller = authUser.role === true || authUser.role === 'true' || authUser.role === 1;
      this.profileImgUrl = authUser.profileImgUrl || authUser.profileImage || '';
      console.log('✅ 用戶已登入 (authService):', {
        isLogin: this.isLogin,
        isSeller: this.isSeller,
        profileImg: this.profileImgUrl
      });
    } else {
      this.isLogin = false;
      this.isSeller = false;
      this.profileImgUrl = '';
      console.log('❌ 用戶未登入');
    }

    // 如果已登入但沒有頭像，嘗試從 API 載入
    if (this.isLogin && !this.profileImgUrl) {
      console.log('🔄 Header: 已登入但沒有頭像，嘗試從 API 載入...');
      this.loadMemberProfile();
    } else if (this.isLogin && this.profileImgUrl) {
      console.log('✅ Header: 已有頭像:', this.profileImgUrl);
    }

    console.log('🎯 Header 頭像狀態檢查:', {
      isLogin: this.isLogin,
      profileImgUrl: this.profileImgUrl,
      defaultImg: this.defaultImg,
      finalImageSrc: this.profileImgUrl || this.defaultImg
    });

    // 如果已登入但沒有頭像，嘗試從 API 載入
    if (this.isLogin && !this.profileImgUrl) {
      this.loadMemberProfile();
    }

    // 監聽購物車變化
    this.$eventBus.on('cart-updated', this.updateCartCount)
    
    // 監聽登入狀態變化
    this.$eventBus.on('user-login', this.handleUserLogin)
    this.$eventBus.on('user-logout', this.handleUserLogout)
    
    // 監聽個人資料更新事件
    this.$eventBus.on('user-profile-updated', this.handleProfileUpdate)
    
    // 監聽賣家申請成功事件
    this.$eventBus.on('seller-application-success', this.handleSellerApplicationSuccess)
    
    // 載入通知資料
    this.loadNotifications();
    
    // 設定定期刷新通知 (每 5 分鐘)
    this.notificationRefreshInterval = setInterval(() => {
      this.loadNotifications();
    }, 5 * 60 * 1000);
    
    // 初始化 Bootstrap Dropdown
    this.initializeDropdowns()
  // 初始化聊天（已登入才執行）
  this.$nextTick(() => {
    this.initChat();
  });
  },
  
  beforeUnmount() {
    // 移除事件監聽
    this.$eventBus.off('cart-updated', this.updateCartCount)
    this.$eventBus.off('user-login', this.handleUserLogin)
    this.$eventBus.off('user-logout', this.handleUserLogout)
    this.$eventBus.off('user-profile-updated', this.handleProfileUpdate)
    this.$eventBus.off('seller-application-success', this.handleSellerApplicationSuccess)
    
    // 清除定期刷新
    if (this.notificationRefreshInterval) {
      clearInterval(this.notificationRefreshInterval);
    }
    
    if (this.removeListener) {
      this.removeListener()
    }
  }
}
</script>

<!-- 插入浮動聊天元件（右下角） -->

<style scoped>
/* 商品分類面板 */
.categories-panel {
  position: absolute;
  top: 100%;
  left: 70%;
  transform: translateX(-50%);
  width: 720px;
  background: #faf6eb;
  border: 1px solid #e4dcd1;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: 16px 16px 32px;
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s ease, transform .2s ease;
}
.categories-panel.show {
  opacity: 1;
  transform: translateX(-50%) translateY(25px);
  pointer-events: auto;
}
.categories-panel .panel-inner { position: relative; }
.categories-panel .cat-block { padding: 6px 4px; }
.categories-panel .cat-title { font-weight: 600; cursor: pointer; margin-bottom: 6px; }
.categories-panel .cat-title:hover { color: #022c5c; }
.categories-panel .sub-list { display: flex; flex-direction: column; gap: 6px; }
.categories-panel .sub-item { 
  background: transparent; border: none; padding: 6px 8px; border-radius: 4px; 
  color: #6c757d; font-size: 0.9rem; cursor: pointer; text-align: left; width: 100%;
}
.categories-panel .sub-item:hover { background: #022c5c; color: #faf6eb; }
.categories-panel .style-block { padding: 6px 4px; }
.categories-panel .style-title { font-weight: 600; margin-bottom: 6px; }
.categories-panel .style-list { display: flex; flex-direction: column; gap: 6px; }
.categories-panel .style-item { 
  background: transparent; border: 1px solid transparent; padding: 6px 8px; border-radius: 4px; 
  color: #495057; font-size: 0.9rem; cursor: pointer; text-align: left;
}
.categories-panel .style-item:hover { background: #022c5c; border-color: #e9ecef; color: #faf6eb; }
.swiper-pagination-like { position: absolute; bottom: 6px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; }
.swiper-pagination-bullet { width: 8px; height: 8px; border-radius: 50%; background: #dee2e6; cursor: pointer; }
.swiper-pagination-bullet-active { background: #0d6efd; }
.navbar {
  transition: all 0.3s ease;
}

.navbar-brand img {
  transition: transform 0.3s ease;
}

.navbar-brand:hover img {
  transform: scale(1.05);
}

.nav-link {
  position: relative;
  transition: color 0.3s ease;

/* 浮動聊天 backdrop 與 panel */
.floating-chat-backdrop {
  background: rgba(0,0,0,0.35);
}
.floating-chat-panel {
  /* 若有需要可在此調整寬高，否則使用 ChatRoom 元件預設 */
  max-width: 800px;
  max-height: 90vh;
}
}

.nav-link:hover {
  color: #000 !important;
}

.nav-link.active {
  color: #000 !important;
  font-weight: 600;
}

/* 圖示按鈕樣式 */
.icon-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  transition: all 0.3s ease;
  cursor: pointer;
  color: #333;
  text-decoration: none;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.icon-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #000;
  text-decoration: none;
}

.icon-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

/* 浮動聊天面板（右下） */
.floating-chat-panel {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 340px;
  height: 480px;
  z-index: 2000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.25);
  overflow: hidden;
}

.floating-chat-panel .chat-room-root {
  height: 100%;
}

/* 個人頭像樣式 */
.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-avatar:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 通知徽章樣式 */
.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
}

.cart-badge-icon {
  background: linear-gradient(135deg, #2ed573 0%, #26d467 100%);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ff3131;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.cart-count {
  font-weight: 600;
  color: #ff3131;
}

/* 右側導航連結樣式 */
.col-lg-auto a,
.col-lg-auto .router-link-active,
.col-lg-auto router-link {
  color: #4a4a4a !important;
  text-decoration: none !important;
}

.col-lg-auto a:hover,
.col-lg-auto .router-link-active:hover,
.col-lg-auto router-link:hover {
  color: #000000 !important;
}

/* 響應式調整 */
@media (max-width: 991px) {
  .navbar-toggler {
    border: none;
    padding: 0.25rem 0.5rem;
  }
  
  .navbar-toggler:focus {
    box-shadow: none;
  }
  
  .offcanvas-body .nav-link {
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .offcanvas-body .nav-link:last-child {
    border-bottom: none;
  }
  
  /* 小螢幕上的圖示按鈕調整 */
  .icon-button {
    width: 40px;
    height: 40px;
  }
  
  .notification-badge {
    top: 4px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    font-size: 0.65rem;
  }
}

@media (max-width: 576px) {
  .icon-button {
    width: 36px;
    height: 36px;
  }
  
  .icon-button svg {
    width: 20px;
    height: 20px;
  }
  
  .notification-badge {
    top: 2px;
    right: 2px;
    min-width: 14px;
    height: 14px;
    font-size: 0.6rem;
  }
  
  /* 調整圖示間距 */
  .list-unstyled.gap-3 {
    gap: 0.5rem !important;
  }
}

/* 通知下拉選單樣式 */
.dropdown-list {
  min-width: 360px;
  max-width: 400px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding: 0;
  margin-top: 10px;
}

.dropdown-header {
  background: #f8f9fa;
  padding: 16px 20px;
  margin: 0;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.dropdown-header-actions {
  display: flex;
  gap: 8px;
}

.btn-header-action {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-header-action:hover {
  color: #007bff;
  background: rgba(0, 123, 255, 0.1);
}

.notice-item {
  padding: 12px 20px;
  border: none;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  border-left: 3px solid transparent;
}

.notice-item:hover {
  background: #f8f9fa;
  text-decoration: none;
  color: inherit;
}

.notice-item.unread {
  background: rgba(0, 123, 255, 0.05);
  font-weight: 500;
}

.notice-item.priority-high {
  border-left-color: #dc3545;
}

.notice-item.priority-medium {
  border-left-color: #fd7e14;
}

.notice-item.priority-normal {
  border-left-color: #007bff;
}

.notice-item.priority-low {
  border-left-color: #6c757d;
}

.notice-priority-icon {
  padding-top: 2px;
}

.notice-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge {
  font-size: 10px;
  padding: 4px 8px;
}

.badge-danger {
  background: #dc3545;
}

.badge-warning {
  background: #fd7e14;
  color: white;
}

.min-width-0 {
  min-width: 0;
}

.animated--grow-in {
  animation: growIn 0.3s ease-out;
}

@keyframes growIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 使用者下拉選單樣式 */
#userDropdown + .dropdown-menu {
  min-width: 200px;
  border: none;
  background-color: #faf6eb;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 8px 0;
  margin-top: 26px;
}

#userDropdown + .dropdown-menu .dropdown-item {
  padding: 10px 16px;
  font-size: 14px;
  transition: all 0.2s ease;
  border-radius: 0;
  color: #333;
}

#userDropdown + .dropdown-menu .dropdown-item:hover {
  background-color: #022c5c;
  color: #faf6eb;
  border-radius: 8px;
  transform: translateX(2px);
}

#userDropdown + .dropdown-menu .dropdown-item i {
  width: 16px;
  text-align: center;
  margin-right: 8px;
}

#userDropdown + .dropdown-menu .dropdown-divider {
  margin: 8px 0;
  border-color: #e9ecef;
}

/* 登入按鈕特殊樣式 */
#userDropdown + .dropdown-menu .dropdown-item[href*="login"] {
  color: #007bff;
  font-weight: 500;
}

#userDropdown + .dropdown-menu .dropdown-item[href*="login"]:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

/* 登出按鈕樣式 */
#userDropdown + .dropdown-menu button.dropdown-item {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  color: #dc3545;
}

#userDropdown + .dropdown-menu button.dropdown-item:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

/* 響應式調整 - 使用者選單 */
@media (max-width: 768px) {
  #userDropdown + .dropdown-menu {
    min-width: 180px;
    right: 0 !important;
    left: auto !important;
  }
  
  #userDropdown + .dropdown-menu .dropdown-item {
    padding: 12px 16px;
    font-size: 15px;
  }
}

/* 通知按鈕特殊樣式 */
.icon-button.has-unread {
  animation: notificationPulse 2s infinite;
}

@keyframes notificationPulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 2px 16px rgba(255, 71, 87, 0.3);
  }
}

/* 響應式調整 - 通知下拉選單 */
@media (max-width: 768px) {
  .dropdown-list {
    min-width: 300px;
    margin-top: 5px;
  }
  
  .dropdown-header {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .notice-item {
    padding: 10px 16px;
  }
}

@media (max-width: 480px) {
  .dropdown-list {
    min-width: 280px;
    right: -120px !important;
  }
  
  .dropdown-header {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .notice-item {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .dropdown-header-actions {
    flex-direction: column;
    gap: 4px;
  }
}

/* 確保 dropdown 正確顯示 */
.dropdown-menu {
  z-index: 1050;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-toggle::after {
  display: none; /* 隱藏默認的下拉箭頭 */
}
</style>
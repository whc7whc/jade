import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'
import MainLayout from '@/layout/mainlayout.vue'
import MemberLayout from '@/layout/MemberLayout.vue'
import ApplyLayout from '@/layout/ApplyLayout.vue'
import Swal from 'sweetalert2'
import axios from 'axios'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: 'JADE 時尚電商 - 全台最大服飾販售平台'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/info/AboutView.vue'),
    meta: { title: '關於我們 - JADE' }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/product/ProductsView.vue'),
    meta: { title: '商品列表 - JADE' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/product/ProductDetailView.vue'),
    meta: { title: '商品詳情 - JADE' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/SearchView.vue'),
    meta: { title: '搜尋結果 - JADE' }
  },



  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/shopping/CartView.vue'),
    meta: { title: '購物車 - JADE' }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/shopping/CheckoutView.vue'),
    meta: {
      title: '結帳 - JADE',
      requiresAuth: true
    },
    beforeEnter: async (to, from, next) => {
      try {
        // 檢查用戶是否登入
        const memberId = localStorage.getItem('memberId')
        if (!memberId) {
          console.log('結帳頁面：用戶未登入')
          return next('/login?redirect=' + encodeURIComponent(to.fullPath))
        }

        // 檢查購物車是否有商品
        const cartResponse = await fetch(`${process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app/api'}/Carts/user/${memberId}`)

        if (cartResponse.ok) {
          const cartData = await cartResponse.json()

          // 檢查購物車是否為空
          // API 回應格式：{ success: true, data: { items: [...] } }
          const actualCartData = cartData.data || cartData
          if (!actualCartData || !actualCartData.items || actualCartData.items.length === 0) {
            console.log('結帳頁面：購物車為空')

            // 購物車為空，顯示提示並導向購物車頁面
            setTimeout(() => {
              Swal.fire({
                icon: 'warning',
                title: '購物車是空的',
                text: '您的購物車目前沒有商品，請先添加商品再進行結帳。',
                confirmButtonText: '前往購物車',
                cancelButtonText: '繼續購物',
                showCancelButton: true
              }).then(result => {
                if (result.isConfirmed) {
                  window.location.href = '/cart'
                } else {
                  window.location.href = '/products'
                }
              })
            }, 100)

            return next(false) // 阻止進入結帳頁面
          }

          // 購物車有商品，允許進入結帳頁面
          console.log('結帳頁面：購物車檢查通過，商品數量:', actualCartData.items.length)
          next()
        } else {
          // API 連接失敗，顯示錯誤訊息
          console.error('結帳頁面：無法獲取購物車資料')

          setTimeout(() => {
            Swal.fire({
              icon: 'error',
              title: '系統錯誤',
              text: '無法獲取購物車資料，請稍後再試。',
              confirmButtonText: '返回購物車'
            }).then(() => {
              window.location.href = '/cart'
            })
          }, 100)

          next(false)
        }
      } catch (error) {
        console.error('結帳頁面守衛錯誤:', error)

        // 出現錯誤時導向購物車頁面
        setTimeout(() => {
          Swal.fire({
            icon: 'error',
            title: '系統錯誤',
            text: '系統暫時無法處理您的請求，請稍後再試。',
            confirmButtonText: '返回購物車'
          }).then(() => {
            window.location.href = '/cart'
          })
        }, 100)

        next(false)
      }
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { title: '登入/註冊 - JADE' }
  },

  {
    path: '/member/profile',
    name: 'MemberProfile',
    component: () => import('../views/auth/MemberProfileView.vue'),
    meta: {
      title: '會員資料填寫 - JADE',
      requiresAuth: false
    },
  },
  {
    path: '/blog',
    name: 'Blog',
    component: () => import('@/views/blog/BlogView.vue')
  },

  {
    path: '/blog/category',
    name: 'BlogCategory',
    component: () => import('@/views/blog/CategoryView.vue')
  },
  {
    path: '/blog/sr',
    name: 'SocialResponsibility',
    component: () => import('@/views/blog/SRView.vue'),
    meta: {
      title: '社會責任 - JADE'
    }
  },
  // 部落格文章詳情
  {
    path: '/blog/post/:id',
    name: 'BlogPost',
    component: () => import('@/views/blog/BlogPostView.vue'),
    meta: {
      title: '文章詳情 - JADE'
    }
  },
  {
    path: '/blog/memberpost',
    name: 'MemberPost',
    component: () => import('@/views/blog/MemberPostView.vue'),
    meta: {
      title: '穿搭分享 - JADE'
    }
  },
  {
    path: '/jobs',
    name: 'Jobs',
    component: () => import('../views/info/JobsView.vue'),
    meta: { title: '加入我們 - JADE' }
  },
  {
    path: '/seller',
    name: 'Seller',
    component: () => import('../views/seller/SellerView.vue'),
    meta: {
      title: '賣家中心 - JADE',
      requiresAuth: true,
      requiresSeller: false  // ✅ 如果要看賣家中心，這裡先寫false
    }
  },
  {
    path: '/order-tracking',
    name: 'OrderTracking',
    component: () => import('../views/shopping/OrderTrackingView.vue'),
    meta: { title: '訂單追蹤 - JADE' }
  },
  {
    path: '/returns',
    name: 'Returns',
    component: () => import('../views/info/ReturnsView.vue'),
    meta: { title: '退換貨說明 - JADE' }
  },
  {
    path: '/shipping',
    name: 'Shipping',
    component: () => import('../views/shopping/ShippingView.vue'),
    meta: { title: '物流方式 - JADE' }
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('../views/info/FAQView.vue'),
    meta: { title: '常見問題 - JADE' }
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: () => import('../views/AnnouncementsView.vue'),
    meta: { title: '訊息公告 - JADE' }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../views/info/TermsView.vue'),
    meta: { title: '服務條款 - JADE' }
  },

  //賣家申請框架
  {
    path: '/apply',
    component: ApplyLayout,
    meta: { requiresAuth: true, authType: 'user' }, // 這裡假設申請是會員身分登入後才申請
    children: [
      {
        path: '',
        name: 'ApplySeller',
        component: () => import('@/views/apply/ApplySellerView.vue'),
        meta: { title: '申請成為賣家 - JADE' }
      }
    ]
  },


  // ✅ 新增的會員區路由：用 MemberLayout 包住
  {
    path: '/member',
    component: MemberLayout,
    meta: { requiresAuth: true }, // 整個 member 路由區塊設為需要登入
    redirect: '/member/basic-info',  //進入頁面
    children: [

      {
        path: 'basic-info',
        name: 'BasicInfo',
        component: () => import('@/views/Member/BasicInfoView.vue'),
        meta: {
          title: '基本資料 - JADE',
        }
      },
      {
        path: 'address',
        name: 'MemberAddress',
        component: () => import('@/views/Member/AddressView.vue'),
        meta: {
          title: '我的地址 - JADE'
        }
      },
      {
        path: 'password-settings',
        name: 'PasswordSettings',
        component: () => import('@/views/Member/PasswordSettingsView.vue'),
        meta: {
          title: '更換密碼 - JADE'
        }
      },
      {
        path: 'purchase-list',
        name: 'PurchaseList',
        component: () => import('@/views/Member/PurchaseListView.vue'),
        meta: {
          title: '購買清單 - JADE'
        }
      },
      {
        path: 'notification-overview',
        name: 'NotificationOverview',
        component: () => import('@/views/Member/NotificationOverviewView.vue'),
        meta: {
          title: '通知總覽 - JADE'
        }
      },
      {
        path: 'level',
        name: 'MemberLevel',
        component: () => import('@/views/Member/LevelView.vue'),
        meta: {
          title: '會員等級 - JADE'
        }
      },
      {
        path: 'j-coins',
        name: 'MyJCoins',
        component: () => import('@/views/Member/JCoinsView.vue'),
        meta: {
          title: 'J-Coins - JADE'
        }
      },
      {
        path: 'coupons',
        name: 'MyCoupons',
        component: () => import('@/views/Member/CouponsView.vue'),
        meta: {
          title: '我的優惠券 - JADE'
        }
      },
      {
        path: 'posts',
        name: 'MyPosts',
        component: () => import('@/views/Member/PostsView.vue'),
        meta: {
          title: '我的貼文 - JADE'
        }
      },
      {
        path: 'transaction-refund',
        name: 'TransactionRefund',
        component: () => import('@/views/Member/TransactionRefundView.vue'),
        meta: {
          title: '交易退款 - JADE'
        }
      }
    ]
  },
  // 廠商相關路由
  {
    path: '/vendor/coupons',
    name: 'VendorCoupons',
    component: () => import('../views/coupons/CouponManager.vue'),
    meta: {
      title: '優惠券管理 - JADE'
    }
  },
  // 重導向：訪問 /vendor 時自動跳轉到優惠券管理
  {
    path: '/vendor',
    redirect: '/vendor/coupons'
  },
  // 重導向：將舊的通知頁面導向新位置
  {
    path: '/notice-all',
    redirect: '/member/notification-overview'
  },
  // 404 頁面（放最後）
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/info/NotFoundView.vue'),
    meta: { title: '頁面不存在 - JADE' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 90
      }
    } else {
      return { top: 0 }
    }
  }
})

// 會員與廠商登入驗證，在原頁面顯示彈窗
router.beforeEach((to, from, next) => {
  // 設定頁面標題
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 會員認證檢查
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isLoggedIn = localStorage.getItem('token') || localStorage.getItem('memberId')

  if (requiresAuth && !isLoggedIn) {
    console.log('需要登入，當前路由:', to.path)

    // 重要：立即阻止路由跳轉，停留在當前頁面
    next(false)

    // 稍微延遲以確保 DOM 已穩定，然後顯示彈窗
    setTimeout(() => {
      Swal.fire({
        icon: 'warning',
        title: '請先登入',
        text: '您尚未登入，請先登入後繼續操作。',
        confirmButtonText: '前往登入',
        cancelButtonText: '取消',
        showCancelButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(result => {
        if (result.isConfirmed) {
          // 用戶確認後才手動跳轉到登入頁面
          window.location.href = `/login?redirect=${encodeURIComponent(to.fullPath)}`
        }
        // 如果用戶點取消，就停留在當前頁面
      })
    }, 100)

    return // 重要：直接返回，不執行後續邏輯
  }

  // 廠商認證檢查
  const requiresVendorAuth = to.matched.some(record => record.meta.requiresVendorAuth)
  const vendorToken = localStorage.getItem('vendor_token')
  const vendorId = localStorage.getItem('vendor_id')

  if (requiresVendorAuth && (!vendorToken || !vendorId)) {
    console.log('需要廠商登入，當前路由:', to.path)

    // 重要：立即阻止路由跳轉，停留在當前頁面
    next(false)

    // 稍微延遲以確保 DOM 已穩定，然後顯示彈窗
    // 彈窗提醒登入/註冊
    setTimeout(() => {
      Swal.fire({
        icon: 'warning',
        title: '請先登入或註冊',
        text: '您尚未登入會員，請先登入或註冊後繼續操作。',
        showCancelButton: true,
        confirmButtonText: '前往登入/註冊',
        cancelButtonText: '取消',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(result => {
        if (result.isConfirmed) {
          // 導向登入頁，帶上 redirect 參數
          window.location.href = `/login?redirect=${encodeURIComponent(to.fullPath)}`
        }
        // 點取消就停留原頁
      })
    }, 100)

    return
  }
  // 賣家權限檢查
  const requiresSeller = to.matched.some(record => record.meta.requiresSeller)
  const isSeller = localStorage.getItem('isSeller') === 'true' // 或 API 回傳的角色

  if (requiresSeller && !isSeller) {
    Swal.fire({
      icon: 'warning',
      title: '權限不足',
      text: '您還不是賣家，請先申請成為賣家。',
      confirmButtonText: '前往申請'
    }).then(result => {
      if (result.isConfirmed) {
        router.push('/apply')
      } else {
        router.push('/')
      }
    })
    return
  }
  // 如果不需要認證，或者已經登入，正常繼續
  next()
})
router.onError((error) => {
  console.error('路由錯誤:', error)
})

export default router

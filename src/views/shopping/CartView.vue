<template>
  <div class="cart-page">
    <!-- 載入中顯示 -->
    <div v-if="!isInitialized" class="d-flex justify-content-center align-items-center" style="min-height: 50vh;">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
    </div>
    
    <!-- 已初始化時顯示完整購物車 -->
    <template v-else>
      <!-- 結帳流程進度條 -->
      <CheckoutProgress :current-step="1" />

      <!-- 購物車內容 -->
      <div class="container my-5">
        <div class="row">
          <div class="col-lg-8">
            <CartItems
              :cart-items="cartItems"
              :is-empty="isEmpty"
              @update-quantity="updateQuantity"
              @remove-item="removeItem"
              @clear-cart="clearCart"
            />
          </div>

          <!-- 購物車總計 - 只在不為空時顯示 -->
          <div class="col-lg-4" v-if="!isEmpty">
          <CartSummary
            :cart-summary="cartSummary"
            :shipping-fee="0"
            :applied-coupon="appliedCoupon"
            :discount-amount="discountAmount"
            :shopping-credit="shoppingCredit"
            :final-total="cartPageTotal"
            :is-empty="isEmpty"
            :show-shipping-fee="false"
            @checkout="goToCheckout"
          />

          <!-- 優惠券選擇區域 -->
          <CouponSection
            :applied-coupon="appliedCoupon"
            :user-coupons="userCoupons"
            :is-applying-coupon="isApplyingCoupon"
            @apply-coupon="applyCouponByCode"
            @remove-coupon="removeCoupon"
            @show-coupon-modal="showCouponModal = true"
          />
        </div>
      </div>
    </div>

    <!-- 優惠券選擇彈窗 -->
    <CouponModal
      :show="showCouponModal"
      :user-coupons="userCoupons"
      :loading-coupons="loadingCoupons"
      :applied-coupon="appliedCoupon"
      :can-use-coupon="canUseCoupon"
      :get-coupon-disabled-reason="getCouponDisabledReason"
      @close="showCouponModal = false"
      @select-coupon="handleSelectCoupon"
    />

    <!-- Toast 通知 -->
    <ToastNotification
      :toasts="toasts"
      :get-toast-icon="getToastIcon"
      @remove-toast="removeToast"
    />
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useToast } from '@/composables/useToast'
import userIdentityService from '@/services/userIdentityService'
import Swal from 'sweetalert2'

// 組件引入
import CheckoutProgress from '@/components/cart/CheckoutProgress.vue'
import CartItems from '@/components/cart/CartItems.vue'
import CartSummary from '@/components/cart/CartSummary.vue'
import CouponSection from '@/components/cart/CouponSection.vue'
import CouponModal from '@/components/cart/CouponModal.vue'
import ToastNotification from '@/components/cart/ToastNotification.vue'

export default {
  name: 'CartView',
  components: {
    CheckoutProgress,
    CartItems,
    CartSummary,
    CouponSection,
    CouponModal,
    ToastNotification
  },
  setup() {
    const router = useRouter()
    
    // 使用 composables
    const {
      // 狀態
      cartItems,
      cartSummary,
      loading,
      error,
      apiConnected,
      appliedCoupon,
      discountAmount,
      userCoupons,
      loadingCoupons,
      isApplyingCoupon,
      shoppingCredit,
      
      // 計算屬性
      isEmpty,
      isLoggedIn,
      shippingFee,
      finalTotal,
      cartPageTotal,
      apiUrl,
      apiStatusClass,
      apiStatusIcon,
      apiStatusTitle,
      
      // 方法
      loadCartData,
      updateQuantity,
      removeItem,
      clearCart,
      applyCouponByCode,
      canUseCoupon,
      getCouponDisabledReason,
      selectCoupon,
      removeCoupon,
      initialize
    } = useCart()

    const { toasts, showToast, removeToast, getToastIcon } = useToast()

    // 本地狀態
    const showCouponModal = ref(false)
    const isInitialized = ref(false)

    // 方法
    const goToCheckout = () => {
      if (isEmpty.value) {
        showToast('購物車是空的，無法結帳', 'error')
        return
      }
      
      showToast('正在跳轉到結帳頁面...', 'info')
      setTimeout(() => {
        router.push('/checkout')
      }, 1000)
    }

    const handleSelectCoupon = (coupon) => {
      selectCoupon(coupon)
      showCouponModal.value = false
    }

    // 購物車專用的登入檢查函數（與隊友的登入機制相容）
    const checkCartLoginStatus = () => {
      // 檢查各種可能的認證方式
      const token = localStorage.getItem('authToken') ||
                   localStorage.getItem('auth_token') ||
                   localStorage.getItem('token')
      const currentUser = localStorage.getItem('currentUser')
      const memberId = localStorage.getItem('memberId')
      
      // 與隊友的登入機制相容：只要有 memberId 就視為已登入
      const hasStandardAuth = !!(token && currentUser)
      const hasMemberAuth = !!(memberId && memberId !== 'null' && memberId !== '' && memberId !== 'undefined')
      
      // 放寬條件：只要有任何一種認證方式就算已登入
      const isLoggedIn = hasStandardAuth || hasMemberAuth || !!memberId
      
      console.log('CartView: 購物車登入狀態檢查', {
        token: !!token,
        currentUser: !!currentUser,
        memberId: memberId,
        hasStandardAuth,
        hasMemberAuth,
        finalResult: isLoggedIn
      })
      
      return isLoggedIn
    }

    // 生命週期
    onMounted(async () => {
      // 使用購物車專用的登入檢查
      const cartLoginStatus = checkCartLoginStatus()
      
      // 添加詳細的調試資訊
      const debugInfo = {
        cartLoginCheck: cartLoginStatus,
        serviceLoginCheck: isLoggedIn.value,
        token: !!localStorage.getItem('token'),
        authToken: !!localStorage.getItem('authToken'),
        auth_token: !!localStorage.getItem('auth_token'),
        currentUser: !!localStorage.getItem('currentUser'),
        memberId: localStorage.getItem('memberId'),
        memberIdFromService: userIdentityService.getMemberId()
      }
      
      console.log('CartView: 詳細登入狀態檢查', debugInfo)
      
      // 檢查登入狀態，未登入時顯示彈窗
      if (!cartLoginStatus) {
        console.warn('CartView: 用戶未登入，顯示登入提示')
        const result = await Swal.fire({
          title: '需要登入',
          text: '請先登入會員帳號',
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#6c757d',
          confirmButtonText: '前往登入',
          cancelButtonText: '取消',
          backdrop: true
        })
        
        if (result.isConfirmed) {
          // 跳轉到登入頁面
          router.push('/login')
        } else {
          // 取消時回到首頁
          router.push('/')
        }
        return
      }
      
      console.log('CartView: 用戶已登入，初始化購物車')
      // 已登入時初始化購物車
      isInitialized.value = true
      initialize()
    })

    return {
      // 狀態
      cartItems,
      cartSummary,
      loading,
      error,
      apiConnected,
      appliedCoupon,
      discountAmount,
      userCoupons,
      loadingCoupons,
      isApplyingCoupon,
      shoppingCredit,
      toasts,
      showCouponModal,
      isInitialized,
      
      // 計算屬性
      isEmpty,
      isLoggedIn,
      shippingFee,
      finalTotal,
      cartPageTotal,
      
      // 方法
      loadCartData,
      updateQuantity,
      removeItem,
      clearCart,
      applyCouponByCode,
      canUseCoupon,
      getCouponDisabledReason,
      removeCoupon,
      goToCheckout,
      handleSelectCoupon,
      removeToast,
      getToastIcon
    }
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f8f9fa;
}
</style>
import { ref, computed, onMounted } from 'vue'
import cartService from '@/services/cartService'
import userIdentityService from '@/services/userIdentityService'
import memberCouponService from '@/services/memberCouponService'
import Swal from 'sweetalert2'

export function useCart() {
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
    
    // 詳細的調試信息
    console.log('🔍 購物車登入狀態檢查:', {
      memberId: memberId,
      hasToken: !!token,
      hasCurrentUser: !!currentUser,
      hasStandardAuth: hasStandardAuth,
      hasMemberAuth: hasMemberAuth,
      allLocalStorageKeys: Object.keys(localStorage),
      relevantData: {
        authToken: localStorage.getItem('authToken') ? '***有值***' : null,
        auth_token: localStorage.getItem('auth_token') ? '***有值***' : null,
        token: localStorage.getItem('token') ? '***有值***' : null,
        currentUser: localStorage.getItem('currentUser') ? '***有值***' : null,
        memberId: localStorage.getItem('memberId')
      }
    })
    
    // 放寬條件：只要有任何一種認證方式就算已登入
    const isLoggedIn = hasStandardAuth || hasMemberAuth || !!memberId
    console.log(`${isLoggedIn ? '✅' : '❌'} 購物車登入檢查結果:`, isLoggedIn)
    
    return isLoggedIn
  }

  // 獲取會員 ID（相容隊友的登入機制）
  const getCartMemberId = () => {
    // 優先從 localStorage 直接獲取 memberId（與隊友的方法相同）
    const directMemberId = localStorage.getItem('memberId')
    console.log('🔍 檢查 directMemberId:', directMemberId, typeof directMemberId)
    
    if (directMemberId && directMemberId !== 'null' && directMemberId !== '' && directMemberId !== 'undefined') {
      const parsedId = parseInt(directMemberId, 10)
      console.log('🔍 解析後的 memberId:', parsedId, '(原始值:', directMemberId, ')')
      
      if (!isNaN(parsedId) && parsedId > 0) {
        console.log('✅ 成功獲取會員 ID:', parsedId)
        return parsedId
      } else {
        console.warn('⚠️ memberId 解析失敗或無效:', directMemberId, '-> 解析結果:', parsedId)
      }
    } else {
      console.warn('⚠️ localStorage 中沒有有效的 memberId:', directMemberId)
    }
    
    // 備用：嘗試從 userIdentityService 獲取
    try {
      const serviceId = userIdentityService.getMemberId()
      console.log('🔍 userIdentityService.getMemberId():', serviceId)
      if (serviceId) {
        console.log('✅ 從 userIdentityService 獲取會員 ID:', serviceId)
        return serviceId
      }
    } catch (error) {
      console.warn('⚠️ userIdentityService.getMemberId() 失敗:', error)
    }
    
    console.error('❌ 無法獲取會員 ID')
    return null
  }
  
  // 響應式數據
  const cartItems = ref([])
  const cartSummary = ref({ subtotal: 0, total: 0 })
  const loading = ref(false)
  const error = ref(null)
  const apiConnected = ref(false)
  
  // 優惠券相關
  const appliedCoupon = ref(null)
  const discountAmount = ref(0)
  const userCoupons = ref([])
  const loadingCoupons = ref(false)
  const isApplyingCoupon = ref(false)
  
  // 購物金相關
  const shoppingCredit = ref(0)

  // Toast 提示函數
  const showToast = (message, type = 'info') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    Toast.fire({
      icon: type,
      title: message
    })
  }

  // 計算屬性
  const isEmpty = computed(() => cartItems.value.length === 0)
  const isLoggedIn = computed(() => checkCartLoginStatus())
  const shippingFee = computed(() => cartSummary.value.shipping || 0)
  const finalTotal = computed(() => {
    const subtotal = cartSummary.value.subtotal || 0
    const shipping = shippingFee.value
    const discount = discountAmount.value
    return Math.max(0, subtotal + shipping - discount)
  })

  // 購物車頁面總計（不包含運費）
  const cartPageTotal = computed(() => {
    const subtotal = cartSummary.value.subtotal || 0
    const discount = discountAmount.value
    return Math.max(0, subtotal - discount)
  })

  const apiUrl = computed(() => {
    if (loading.value) return '連接中...'
    if (apiConnected.value) return process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'
    return '連接失敗'
  })

  const apiStatusClass = computed(() => {
    if (loading.value) return 'text-warning'
    if (apiConnected.value) return 'text-success'
    return 'text-danger'
  })

  const apiStatusIcon = computed(() => {
    if (loading.value) return 'fa-spinner fa-spin'
    if (apiConnected.value) return 'fa-check-circle'
    return 'fa-times-circle'
  })

  const apiStatusTitle = computed(() => {
    if (loading.value) return '正在連接 API...'
    if (apiConnected.value) return 'API 連接成功'
    return 'API 連接失敗'
  })

  // 方法
  const loadCartData = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('🔄 開始載入購物車資料...')
      
      // 使用購物車專用的登入檢查
      if (!checkCartLoginStatus()) {
        console.warn('⚠️ 用戶未登入，無法載入購物車')
        apiConnected.value = false
        cartItems.value = []
        cartSummary.value = { subtotal: 0, total: 0 }
        showToast('請先登入會員帳號', 'warning')
        return
      }

      // 獲取會員 ID
      const memberId = getCartMemberId()
      if (!memberId) {
        console.error('❌ 無法獲取會員 ID')
        apiConnected.value = false
        cartItems.value = []
        cartSummary.value = { subtotal: 0, total: 0 }
        showToast('無法獲取會員資訊，請重新登入', 'error')
        return
      }
      
      console.log('📍 使用會員 ID:', memberId)
      const result = await cartService.getCart(memberId)
      
      if (result.success) {
        console.log('✅ API 連接成功，載入購物車資料:', result.data)
        apiConnected.value = true
        cartItems.value = result.data.items || []
        
        // 詳細檢查每個商品的結構
        if (cartItems.value.length > 0) {
          console.log('🔍 購物車商品詳細結構檢查:')
          cartItems.value.forEach((item, index) => {
            console.log(`商品 ${index + 1}:`, {
              id: item.id,
              itemId: item.itemId,
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              fullItem: item
            })
          })
        }
        
        cartSummary.value = {
          subtotal: result.data.subtotal || 0,
          total: result.data.total || 0,
          shipping: result.data.shipping || 0,
          discount: result.data.discount || 0,
          shippingFee: result.data.shipping || 0,
          finalTotal: result.data.total || 0
        }
        
        // 處理優惠券資訊
        if (result.data.couponCode) {
          // 只在沒有已套用的優惠券時，或者優惠券代碼不同時才更新
          if (!appliedCoupon.value || appliedCoupon.value.code !== result.data.couponCode) {
            appliedCoupon.value = {
              code: result.data.couponCode,
              name: result.data.couponCode,
              title: result.data.couponCode,
              // 可以添加更多優惠券資訊
              discountAmount: result.data.discount || 0
            }
          }
          discountAmount.value = result.data.discount || 0
        } else {
          // 如果後端沒有返回優惠券代碼，且當前沒有手動設置的優惠券，則清空
          if (!appliedCoupon.value || !appliedCoupon.value.title) {
            appliedCoupon.value = null
            discountAmount.value = 0
          }
        }
        
        console.log('📊 購物車摘要:', cartSummary.value)
        console.log('🎫 優惠券資訊:', appliedCoupon.value)
        console.log('🛒 購物車商品數量:', cartItems.value.length)
      } else {
        console.warn('⚠️ API 回應但無法載入購物車:', result.message)
        apiConnected.value = false
        cartItems.value = []
        cartSummary.value = { subtotal: 0, total: 0 }
        showToast(result.message || '載入購物車失敗', 'warning')
      }
    } catch (err) {
      console.error('❌ 載入購物車資料時發生錯誤:', err)
      error.value = err.message || '載入失敗'
      apiConnected.value = false
      cartItems.value = []
      cartSummary.value = { subtotal: 0, total: 0 }
      showToast('載入購物車失敗，請稍後再試', 'error')
    } finally {
      loading.value = false
    }
  }

  const updateQuantity = async (itemOrProductId, quantity) => {
    try {
      if (!checkCartLoginStatus()) {
        showToast('請先登入會員帳號', 'warning')
        return false
      }

      const memberId = getCartMemberId()
      if (!memberId) {
        showToast('無法獲取會員資訊，請重新登入', 'error')
        return false
      }

      let cartItem
      
      // 檢查第一個參數是 item 對象還是 productId
      if (typeof itemOrProductId === 'object' && (itemOrProductId.id || itemOrProductId.itemId)) {
        // 如果是 item 對象，直接使用
        cartItem = itemOrProductId
        console.log('🔄 使用 item 對象更新數量:', { item: cartItem, quantity, memberId })
      } else {
        // 如果是 productId 或其他標識符，嘗試多種方式查找
        let searchId = itemOrProductId
        
        // 如果傳入的是對象但沒有 id，嘗試提取 productId
        if (typeof itemOrProductId === 'object') {
          searchId = itemOrProductId.productId || itemOrProductId.id || itemOrProductId.itemId
        }
        
        // 按照優先級查找：先按 itemId，再按 productId，最後按 id
        cartItem = cartItems.value.find(item => 
          item.itemId === searchId || 
          item.productId === searchId || 
          item.id === searchId
        )
        
        console.log('🔄 根據 ID 查找商品:', { 
          searchId, 
          originalInput: itemOrProductId,
          foundItem: cartItem, 
          availableItems: cartItems.value.map(i => ({ 
            id: i.id, 
            itemId: i.itemId, 
            productId: i.productId 
          })) 
        })
      }
      
      if (!cartItem || (!cartItem.id && !cartItem.itemId)) {
        console.error('❌ 找不到該商品:', { 
          itemOrProductId, 
          cartItem, 
          availableItems: cartItems.value.map(i => ({ id: i.id, itemId: i.itemId, productId: i.productId }))
        })
        showToast('找不到該商品', 'error')
        return false
      }

      const itemId = cartItem.id || cartItem.itemId
      console.log('🔄 更新商品數量:', { 
        cartItem, 
        itemId, 
        quantity, 
        memberId,
        cartItemKeys: Object.keys(cartItem || {})
      })
      
      // 先更新本地狀態以提供即時反饋
      const oldQuantity = cartItem.quantity
      const oldSubtotal = cartItem.subtotal
      cartItem.quantity = quantity
      cartItem.subtotal = cartItem.unitPrice * quantity
      
      // 更新購物車總計
      const subtotalDiff = cartItem.subtotal - oldSubtotal
      cartSummary.value.subtotal += subtotalDiff
      cartSummary.value.total += subtotalDiff
      
      const result = await cartService.updateQuantity(itemId, quantity, memberId)
      
      if (result.success) {
        console.log('✅ 成功更新商品數量')
        // 如果 API 回應包含更新後的資料，使用它來確保數據正確性
        if (result.data && result.data.updatedItem) {
          const updatedItem = result.data.updatedItem
          cartItem.quantity = updatedItem.quantity
          cartItem.subtotal = updatedItem.subtotal
        }
        if (result.data && result.data.cartSummary) {
          cartSummary.value = { ...cartSummary.value, ...result.data.cartSummary }
        }
        
        // 重要：數量更新後，重新驗證已套用的優惠券
        await validateAppliedCoupon()
        
        showToast('已更新商品數量', 'success')
        return true
      } else {
        // API 失敗時回滾本地狀態
        cartItem.quantity = oldQuantity
        cartItem.subtotal = oldSubtotal
        cartSummary.value.subtotal -= subtotalDiff
        cartSummary.value.total -= subtotalDiff
        
        console.warn('⚠️ 更新商品數量失敗:', result.error || result.message)
        showToast(result.error || result.message || '更新失敗', 'error')
        return false
      }
    } catch (err) {
      console.error('❌ 更新商品數量時發生錯誤:', err)
      showToast('更新失敗，請稍後再試', 'error')
      return false
    }
  }

  const removeItem = async (itemOrProductId) => {
    try {
      if (!checkCartLoginStatus()) {
        showToast('請先登入會員帳號', 'warning')
        return false
      }

      const memberId = getCartMemberId()
      if (!memberId) {
        showToast('無法獲取會員資訊，請重新登入', 'error')
        return false
      }

      let cartItem
      
      // 檢查第一個參數是 item 對象還是 productId
      if (typeof itemOrProductId === 'object' && itemOrProductId.id) {
        // 如果是 item 對象，直接使用
        cartItem = itemOrProductId
        console.log('🗑️ 使用 item 對象移除商品:', { item: cartItem, memberId })
      } else {
        // 如果是 productId，根據 productId 找到對應的 itemId
        const productId = itemOrProductId
        cartItem = cartItems.value.find(item => item.productId === productId)
        console.log('🗑️ 根據 productId 查找商品:', { productId, foundItem: cartItem, availableItems: cartItems.value.map(i => ({ id: i.id, productId: i.productId })) })
      }
      
      if (!cartItem || !cartItem.id) {
        console.error('❌ 找不到該商品:', { 
          itemOrProductId, 
          cartItem, 
          availableItems: cartItems.value.map(i => ({ id: i.id, itemId: i.itemId, productId: i.productId }))
        })
        showToast('找不到該商品', 'error')
        return false
      }

      // 顯示確認對話框
      const result = await Swal.fire({
        title: '確認移除商品',
        html: `
          <div class="text-start">
            <div class="d-flex align-items-center mb-3">
              <img src="${cartItem.productImage}" alt="${cartItem.productName}" 
                   style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" 
                   class="me-3">
              <div>
                <h6 class="mb-1">${cartItem.productName}</h6>
                <small class="text-muted">${cartItem.attributeValues || ''}</small><br>
                <small class="text-muted">數量: ${cartItem.quantity}</small>
              </div>
            </div>
            <p class="mb-0">確定要將此商品從購物車中移除嗎？</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="fas fa-trash me-2"></i>確定移除',
        cancelButtonText: '<i class="fas fa-times me-2"></i>取消',
        backdrop: true,
        allowOutsideClick: true,
        customClass: {
          popup: 'swal2-popup-custom',
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-secondary'
        }
      })

      if (!result.isConfirmed) {
        console.log('👤 用戶取消移除商品')
        return false
      }

      const itemId = cartItem.id || cartItem.itemId
      console.log('🗑️ 確認移除商品:', { itemId, memberId })
      const apiResult = await cartService.removeCartItem(itemId, memberId)
      
      if (apiResult.success) {
        console.log('✅ 成功移除商品')
        await loadCartData() // 重新載入購物車資料
        
        // 重要：商品移除後，重新驗證已套用的優惠券
        await validateAppliedCoupon()
        
        // 顯示成功訊息
        await Swal.fire({
          title: '移除成功！',
          text: `已將「${cartItem.productName}」從購物車中移除`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        })
        
        return true
      } else {
        console.warn('⚠️ 移除商品失敗:', apiResult.error || apiResult.message)
        
        await Swal.fire({
          title: '移除失敗',
          text: apiResult.error || apiResult.message || '移除商品時發生錯誤',
          icon: 'error',
          confirmButtonText: '確定',
          confirmButtonColor: '#3085d6'
        })
        
        return false
      }
    } catch (err) {
      console.error('❌ 移除商品時發生錯誤:', err)
      
      await Swal.fire({
        title: '操作失敗',
        text: '移除商品時發生錯誤，請稍後再試',
        icon: 'error',
        confirmButtonText: '確定',
        confirmButtonColor: '#3085d6'
      })
      
      return false
    }
  }

  const clearCart = async () => {
    try {
      const memberId = getCartMemberId()
      if (!memberId) {
        showToast('無法獲取會員資訊，請重新登入', 'error')
        return false
      }

      const result = await Swal.fire({
        title: '確認清空購物車',
        text: '此操作將移除所有商品，確定要繼續嗎？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '確定清空',
        cancelButtonText: '取消'
      })

      if (result.isConfirmed) {
        console.log('🗑️ 清空購物車:', memberId)
        const clearResult = await cartService.clearCart(memberId)
        
        if (clearResult.success) {
          console.log('✅ 成功清空購物車')
          await loadCartData() // 重新載入購物車資料
          showToast('已清空購物車', 'success')
          return true
        } else {
          console.warn('⚠️ 清空購物車失敗:', clearResult.message)
          showToast(clearResult.message || '清空失敗', 'error')
          return false
        }
      }
      return false
    } catch (err) {
      console.error('❌ 清空購物車時發生錯誤:', err)
      showToast('清空失敗，請稍後再試', 'error')
      return false
    }
  }

  // 添加商品到購物車
  const addToCart = async (productId, quantity = 1) => {
    try {
      if (!checkCartLoginStatus()) {
        showToast('請先登入會員帳號', 'warning')
        return false
      }

      const memberId = getCartMemberId()
      if (!memberId) {
        showToast('無法獲取會員資訊，請重新登入', 'error')
        return false
      }

      console.log('🛒 添加商品到購物車:', { productId, quantity, memberId })
      const result = await cartService.addToCart(memberId, productId, quantity)
      
      if (result.success) {
        console.log('✅ 成功添加商品到購物車')
        await loadCartData() // 重新載入購物車資料
        
        // 重要：商品添加後，重新驗證已套用的優惠券
        await validateAppliedCoupon()
        
        showToast('商品已添加到購物車', 'success')
        return true
      } else {
        console.warn('⚠️ 添加商品到購物車失敗:', result.message)
        showToast(result.message || '添加失敗', 'error')
        return false
      }
    } catch (err) {
      console.error('❌ 添加商品到購物車時發生錯誤:', err)
      showToast('添加失敗，請稍後再試', 'error')
      return false
    }
  }

  // 優惠券相關函數
  const canUseCoupon = (coupon) => {
    if (!coupon) return false
    
    const cartTotal = cartSummary.value.subtotal || 0
    const usabilityCheck = memberCouponService.isCouponUsableForCart(coupon, cartTotal)
    return usabilityCheck.usable
  }

  const getCouponDisabledReason = (coupon) => {
    if (!coupon) return '無效的優惠券'
    
    const cartTotal = cartSummary.value.subtotal || 0
    const usabilityCheck = memberCouponService.isCouponUsableForCart(coupon, cartTotal)
    return usabilityCheck.reason || ''
  }

  const loadUserCoupons = async () => {
    try {
      loadingCoupons.value = true
      const memberId = getCartMemberId()
      if (!memberId) {
        console.warn('⚠️ 無法獲取會員 ID，無法載入優惠券')
        userCoupons.value = []
        return
      }

      console.log('🎫 載入會員優惠券:', memberId)
      
      // 只獲取用戶擁有的優惠券
      const ownedResult = await memberCouponService.getMemberCoupons()
      
      console.log('🔍 擁有的優惠券 API 回應:', ownedResult)
      console.log('🔍 檢查 API 回應結構:', {
        hasSuccess: ownedResult.success,
        hasCoupons: ownedResult.coupons,
        couponsLength: ownedResult.coupons?.length,
        couponsData: ownedResult.coupons
      })
      
      let allCoupons = []
      
      // 處理用戶擁有的優惠券
      if (ownedResult.coupons && ownedResult.coupons.length > 0) {
        console.log('📋 原始擁有的優惠券數據:', ownedResult.coupons)
        allCoupons = ownedResult.coupons.map(coupon => {
          console.log('🔍 單個擁有優惠券原始數據:', coupon)
          const formatted = memberCouponService.formatCouponForDisplay(coupon)
          console.log('🔄 格式化後的擁有優惠券:', formatted)
          return {
            ...formatted,
            isOwned: true,
            source: 'owned',
            // 確保 code 字段存在
            code: coupon.verificationCode || coupon.code || coupon.couponCode
          }
        })
      }
      
      // 為每個優惠券添加可用性檢查
      const cartTotal = cartSummary.value.subtotal || 0
      console.log('💰 當前購物車總額:', cartTotal)
      
      userCoupons.value = allCoupons.map(coupon => {
        const usabilityCheck = memberCouponService.isCouponUsableForCart(coupon, cartTotal)
        console.log(`🎫 優惠券 "${coupon.title}" 可用性檢查:`, {
          coupon: coupon,
          usable: usabilityCheck.usable,
          reason: usabilityCheck.reason
        })
        
        return {
          ...coupon,
          isUsable: usabilityCheck.usable,
          disabledReason: usabilityCheck.reason,
          // 確保 code 字段存在
          code: coupon.code || coupon.verificationCode || coupon.couponCode
        }
      })
      
      console.log('🎫 載入的優惠券:', userCoupons.value)
      
    } catch (err) {
      console.error('❌ 載入優惠券失敗:', err)
      userCoupons.value = []
      showToast('載入優惠券失敗', 'error')
    } finally {
      loadingCoupons.value = false
    }
  }

  const selectCoupon = async (coupon) => {
    try {
      if (!canUseCoupon(coupon)) {
        showToast(getCouponDisabledReason(coupon), 'warning')
        return false
      }

      const memberId = getCartMemberId()
      if (!memberId) {
        showToast('無法獲取會員資訊，請重新登入', 'error')
        return false
      }

      console.log('🎫 套用優惠券:', coupon)
      console.log('🔍 優惠券字段檢查:', {
        'coupon.code': coupon.code,
        'coupon.verificationCode': coupon.verificationCode,
        'coupon.couponCode': coupon.couponCode
      })
      const couponCode = coupon.code || coupon.verificationCode || coupon.couponCode
      console.log('📝 使用優惠券代碼:', couponCode)
      
      if (!couponCode) {
        console.error('❌ 找不到優惠券代碼:', coupon)
        showToast('優惠券代碼不完整', 'error')
        return false
      }
      
      const result = await cartService.applyCoupon(memberId, couponCode)
      
      if (result.success) {
        // 先保存選中的優惠券對象
        const selectedCoupon = coupon
        discountAmount.value = result.data.discountAmount || 0
        await loadCartData() // 重新載入購物車資料
        
        // 重新設置 appliedCoupon 為我們選擇的優惠券對象，而不是後端返回的數據
        appliedCoupon.value = selectedCoupon
        console.log('✅ 已設置套用的優惠券:', appliedCoupon.value)
        
        showToast('優惠券套用成功', 'success')
        return true
      } else {
        showToast(result.error || '套用優惠券失敗', 'error')
        return false
      }
    } catch (err) {
      console.error('❌ 套用優惠券失敗:', err)
      showToast('套用優惠券失敗，請稍後再試', 'error')
      return false
    }
  }

  // 驗證已套用的優惠券是否仍然有效
  const validateAppliedCoupon = async () => {
    if (!appliedCoupon.value) {
      return // 沒有套用優惠券，無需驗證
    }

    try {
      console.log('🔍 重新驗證已套用的優惠券:', appliedCoupon.value)
      
      // 檢查優惠券是否仍然可用
      const isStillUsable = canUseCoupon(appliedCoupon.value)
      
      if (!isStillUsable) {
        const reason = getCouponDisabledReason(appliedCoupon.value)
        console.log('❌ 優惠券不再可用:', reason)
        
        // 自動移除無效的優惠券
        appliedCoupon.value = null
        discountAmount.value = 0
        
        // 通知後端移除優惠券
        const memberId = getCartMemberId()
        if (memberId) {
          try {
            await cartService.removeCoupon(memberId)
            console.log('✅ 已從後端移除無效的優惠券')
          } catch (err) {
            console.warn('⚠️ 移除後端優惠券失敗:', err)
          }
        }
        
        // 重新載入購物車資料以確保數據一致性
        await loadCartData()
        
        showToast(`優惠券已自動移除：${reason}`, 'warning')
      } else {
        console.log('✅ 優惠券仍然有效')
      }
    } catch (err) {
      console.error('❌ 驗證優惠券時發生錯誤:', err)
    }
  }

  const removeCoupon = async () => {
    try {
      const memberId = getCartMemberId()
      if (!memberId) {
        showToast('無法獲取會員資訊，請重新登入', 'error')
        return false
      }

      console.log('🎫 移除優惠券')
      const result = await cartService.removeCoupon(memberId)
      
      if (result.success) {
        console.log('✅ 優惠券移除成功，API 回應:', result)
        
        // 清除優惠券資訊
        appliedCoupon.value = null
        discountAmount.value = 0
        
        // 重新載入完整的購物車資料以確保數據一致性
        await loadCartData()
        
        console.log('🎫 優惠券已清除')
        showToast('優惠券已移除', 'success')
        return true
      } else {
        console.warn('⚠️ 移除優惠券失敗:', result.error)
        showToast(result.error || '移除優惠券失敗', 'error')
        return false
      }
    } catch (err) {
      console.error('❌ 移除優惠券失敗:', err)
      showToast('移除優惠券失敗，請稍後再試', 'error')
      return false
    }
  }

  const applyCouponByCode = async (couponCode) => {
    try {
      if (!couponCode || !couponCode.trim()) {
        showToast('請輸入優惠券代碼', 'warning')
        return false
      }

      isApplyingCoupon.value = true
      const memberId = getCartMemberId()
      if (!memberId) {
        showToast('無法獲取會員資訊，請重新登入', 'error')
        return false
      }

      console.log('🎫 套用優惠券代碼:', couponCode)
      const result = await cartService.applyCoupon(memberId, couponCode.trim())
      
      if (result.success) {
        console.log('✅ 優惠券套用成功，API 回應:', result)
        
        // 根據 API 文件，成功時會返回更新後的完整購物車資料
        if (result.data) {
          // 更新購物車資料
          cartItems.value = result.data.items || []
          
          cartSummary.value = {
            subtotal: result.data.subtotal || 0,
            total: result.data.total || 0,
            shipping: result.data.shipping || 0,
            discount: result.data.discount || 0,
            shippingFee: result.data.shipping || 0,
            finalTotal: result.data.total || 0
          }
          
          // 更新已套用的優惠券資訊
          appliedCoupon.value = {
            code: couponCode.trim(),
            name: result.data.couponCode || couponCode.trim(),
            discountAmount: result.data.discount || 0
          }
          discountAmount.value = result.data.discount || 0
          
          console.log('🎫 已套用優惠券:', appliedCoupon.value)
          console.log('💰 折扣金額:', discountAmount.value)
        } else {
          // 如果沒有返回完整資料，重新載入購物車
          await loadCartData()
        }
        
        showToast(result.message || '優惠券套用成功', 'success')
        return true
      } else {
        console.warn('⚠️ 優惠券套用失敗:', result.error)
        showToast(result.error || '套用優惠券失敗', 'error')
        return false
      }
    } catch (err) {
      console.error('❌ 套用優惠券代碼失敗:', err)
      showToast('套用優惠券失敗，請稍後再試', 'error')
      return false
    } finally {
      isApplyingCoupon.value = false
    }
  }

  // 初始化函數
  const initialize = async () => {
    console.log('🚀 初始化購物車 composable')
    await loadCartData()
    
    // 如果購物車載入成功，也載入優惠券
    if (checkCartLoginStatus()) {
      await loadUserCoupons()
    }
  }

  // 組件掛載時自動初始化
  onMounted(() => {
    initialize()
  })

  return {
    // 響應式數據
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
    addToCart,
    initialize,
    
    // 優惠券相關方法
    canUseCoupon,
    getCouponDisabledReason,
    loadUserCoupons,
    selectCoupon,
    validateAppliedCoupon,
    removeCoupon,
    applyCouponByCode,
    
    // 登入相關方法
    checkCartLoginStatus,
    getCartMemberId
  }
}

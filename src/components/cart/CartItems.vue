<template>
  <div id="cart-items" v-if="!isEmpty">
    <!-- 購物車商品列表 -->
    <div 
      v-for="item in cartItems" 
      :key="item.id || item.productId"
      class="cart-item" 
      :data-product-id="item.productId"
    >
      <div class="row align-items-center">
        <div class="col-md-2">
          <img 
            :src="item.productImage" 
            :alt="item.productName" 
            class="product-image"
            @error="handleImageError"
          >
        </div>
        <div class="col-md-4">
          <h6 class="mb-1">{{ item.productName }}</h6>
          <small class="text-muted">{{ item.attributeValues }}</small>
        </div>
        <div class="col-md-2">
          <span class="fw-bold text-primary">${{ formatPrice(item.unitPrice) }}</span>
        </div>
        <div class="col-md-3">
          <div class="quantity-control">
            <button 
              class="quantity-btn" 
              @click="$emit('update-quantity', item, item.quantity - 1)"
              :disabled="item.quantity <= 1"
            >
              <i class="fas fa-minus"></i>
            </button>
            <input 
              type="number" 
              :value="item.quantity" 
              min="1" 
              class="form-control text-center" 
              style="width: 60px;"
              @change="handleQuantityChange(item, $event)"
            >
            <button 
              class="quantity-btn" 
              @click="$emit('update-quantity', item, item.quantity + 1)"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        <div class="col-md-1">
          <button 
            class="remove-btn" 
            @click="$emit('remove-item', item)"
            title="移除商品"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 空購物車顯示 -->
  <div v-else class="empty-cart">
    <i class="fas fa-shopping-cart fa-4x mb-3"></i>
    <h4>購物車是空的</h4>
    <p>快去逛逛，找些喜歡的商品吧！</p>
    <button 
      @click="handleStartShopping"
      class="btn btn-primary"
    >
      <i class="fas fa-shopping-bag me-2"></i>開始購物
    </button>
  </div>

  <!-- 操作按鈕 -->
  <div class="mt-4" v-if="!isEmpty">
    <button 
      class="btn btn-outline-secondary me-3" 
      @click="$emit('clear-cart')"
    >
      <i class="fas fa-trash"></i> 清空購物車
    </button>
    <router-link 
      to="/products" 
      class="btn btn-outline-primary"
    >
      <i class="fas fa-arrow-left"></i> 繼續購物
    </router-link>
  </div>
</template>

<script>
import { handleImageError, formatPrice } from '@/utils/cartUtils'
import userIdentityService from '@/services/userIdentityService'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

export default {
  name: 'CartItems',
  props: {
    cartItems: {
      type: Array,
      required: true
    },
    isEmpty: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update-quantity', 'remove-item', 'clear-cart'],
  setup() {
    const router = useRouter()
    return { router }
  },
  methods: {
    handleImageError,
    formatPrice,
    handleQuantityChange(item, event) {
      const newQuantity = parseInt(event.target.value) || 1
      this.$emit('update-quantity', item, newQuantity)
    },
    async handleStartShopping() {
      // 使用與購物車相同的登入檢查邏輯
      const checkLoginStatus = () => {
        const token = localStorage.getItem('authToken') ||
                     localStorage.getItem('auth_token') ||
                     localStorage.getItem('token')
        const currentUser = localStorage.getItem('currentUser')
        const memberId = localStorage.getItem('memberId')
        
        // 與購物車相容的登入檢查：只要有 memberId 就視為已登入
        const hasStandardAuth = !!(token && currentUser)
        const hasMemberAuth = !!(memberId && memberId !== 'null' && memberId !== '' && memberId !== 'undefined')
        
        return hasStandardAuth || hasMemberAuth || !!memberId
      }
      
      const isLoggedIn = checkLoginStatus()
      const memberId = localStorage.getItem('memberId')
      
      console.log('CartItems: 開始購物按鈕登入檢查', {
        isLoggedIn,
        memberId,
        token: !!localStorage.getItem('token'),
        currentUser: !!localStorage.getItem('currentUser')
      })
      
      if (!isLoggedIn) {
        // 顯示需要登入的提示
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
          this.router.push('/login')
        }
      } else {
        // 已登入，直接跳轉到商品頁面
        this.router.push('/products')
      }
    }
  }
}
</script>

<style scoped>
.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.quantity-btn:hover {
  background: #e9ecef;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 隱藏數字輸入框的上下箭頭 */
.quantity-control input[type="number"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

.quantity-control input[type="number"]::-webkit-outer-spin-button,
.quantity-control input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.cart-item {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s;
  background: white;
}

.cart-item:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.remove-btn {
  color: #dc3545;
  border: none;
  background: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.remove-btn:hover {
  color: #c82333;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .quantity-control {
    flex-direction: column;
    gap: 5px;
  }
  
  .cart-item .row > div {
    margin-bottom: 0.5rem;
  }
}
</style>

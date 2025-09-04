<template>
  <div class="cart-summary">
    <h5 class="mb-3"><i class="fas fa-calculator"></i> 訂單摘要</h5>
    
    <!-- 商品小計 -->
    <div class="d-flex justify-content-between mb-2">
      <span>商品總計:</span>
      <span class="price-positive">NT${{ formatPrice(cartSummary.subtotal) }}</span>
    </div>
    
    <!-- 運費 -->
    <div class="d-flex justify-content-between mb-2" v-if="showShippingFee">
      <span>運費:</span>
      <span v-if="shippingFee === 0" class="text-success fw-bold">免運費</span>
      <span v-else class="price-positive">+NT${{ formatPrice(shippingFee) }}</span>
    </div>
    
    <!-- 優惠券折扣 -->
    <div class="d-flex justify-content-between mb-2" v-if="appliedCoupon && discountAmount > 0">
      <span>
        <i class="fas fa-ticket-alt text-success me-1"></i>
        {{ appliedCoupon.title }}折扣:
      </span>
      <span class="price-negative">-NT${{ formatPrice(discountAmount) }}</span>
    </div>
    
    <!-- 購物金折抵 -->
    <div class="d-flex justify-content-between mb-2" v-if="shoppingCredit > 0">
      <span>
        <i class="fas fa-coins text-warning me-1"></i>
        購物金折抵:
      </span>
      <span class="price-negative">-NT${{ formatPrice(shoppingCredit) }}</span>
      <small class="text-muted d-block">購物金餘額 NT$0</small>
    </div>
    
    <hr>
    
    <!-- 總計 -->
    <div class="d-flex justify-content-between mb-3">
      <strong class="fs-5">總計:</strong>
      <strong class="text-primary fs-4">NT${{ formatPrice(finalTotal) }}</strong>
    </div>

    <!-- 結帳按鈕 -->
    <button 
      class="btn checkout-btn w-100" 
      @click="$emit('checkout')"
      :disabled="isEmpty"
    >
      <i class="fas fa-credit-card"></i> 前往結帳
    </button>

    <!-- 安全保證 -->
    <div class="mt-3 text-center">
      <small class="text-muted">
        <i class="fas fa-shield-alt text-success"></i>
        SSL安全加密 | 安全付款保證
      </small>
    </div>
  </div>
</template>

<script>
import { formatPrice } from '@/utils/cartUtils'

export default {
  name: 'CartSummary',
  props: {
    cartSummary: {
      type: Object,
      required: true
    },
    shippingFee: {
      type: Number,
      required: true
    },
    appliedCoupon: {
      type: Object,
      default: null
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    shoppingCredit: {
      type: Number,
      default: 0
    },
    finalTotal: {
      type: Number,
      required: true
    },
    isEmpty: {
      type: Boolean,
      required: true
    },
    showShippingFee: {
      type: Boolean,
      default: false
    }
  },
  emits: ['checkout'],
  methods: {
    formatPrice
  }
}
</script>

<style scoped>
.cart-summary {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  position: sticky;
  top: 20px;
}

.checkout-btn {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  transition: all 0.3s;
}

.checkout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
  color: white;
}

.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 價格顯示樣式 */
.price-positive {
  color: #333;
  font-weight: 500;
}

.price-negative {
  color: #28a745;
  font-weight: 600;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .cart-summary {
    position: static;
    margin-top: 2rem;
  }
}
</style>

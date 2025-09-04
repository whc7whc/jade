<template>
  <div class="buy-buttons mb-4">
    <div class="d-grid gap-2">
      <button 
        class="btn btn-buy-now btn-lg"
        @click="handleBuyNow"
        :disabled="isDisabled"
      >
        <i class="fas fa-bolt me-2"></i>
        {{ buttonText.buyNow }}
      </button>
      <button 
        class="btn btn-add-cart"
        @click="handleAddToCart"
        :disabled="isDisabled"
      >
        <i class="fas fa-shopping-cart me-2"></i>
        {{ buttonText.addToCart }}
      </button>
    </div>
    
    <!-- 庫存不足時的提示 -->
    <div v-if="showStockWarning" class="alert alert-warning mt-2 mb-0">
      <i class="fas fa-exclamation-triangle me-2"></i>
      購買數量不可超過庫存 {{ currentStock }} 件，請調整數量後再進行購買。
    </div>

    <!-- Toast 通知 -->
    <div 
      v-if="toast.show" 
      class="toast-container position-fixed top-0 end-0 p-3" 
      style="z-index: 1055;"
    >
      <div class="toast show" role="alert">
        <div class="toast-header">
          <i 
            class="fas me-2"
            :class="{
              'fa-check-circle text-success': toast.type === 'success',
              'fa-exclamation-triangle text-warning': toast.type === 'warning',
              'fa-times-circle text-danger': toast.type === 'danger'
            }"
          ></i>
          <strong class="me-auto">購物車</strong>
          <button 
            type="button" 
            class="btn-close" 
            @click="hideToast"
          ></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import cartService from '@/services/cartService'

export default {
  name: 'PurchaseButtons',
  props: {
    product: {
      type: Object,
      required: true
    },
    selectedColor: {
      type: String,
      default: ''
    },
    selectedSize: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      default: 1
    },
    currentStock: {
      type: Number,
      default: 0
    },
    currentImage: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      toast: {
        show: false,
        message: '',
        type: 'success' // success, warning, danger
      }
    }
  },
  computed: {
    isDisabled() {
      return this.currentStock === 0 || 
             this.quantity > this.currentStock || 
             this.quantity <= 0
    },
    showStockWarning() {
      return this.quantity > this.currentStock && this.currentStock > 0
    },
    buttonText() {
      return {
        buyNow: this.currentStock === 0 ? '缺貨中' : '立即購買',
        addToCart: '加入購物車'
      }
    }
  },
  methods: {
    /**
     * 處理加入購物車
     */
    async handleAddToCart() {
      // 驗證必要選項
      if (!this.validateSelection()) {
        return
      }

      const cartItem = this.createCartItem()
      
      try {
        // 先嘗試加入後端購物車
        const result = await cartService.addToCartServer(cartItem, this.product)
        
        if (result.success) {
          // 後端成功，同時保存到本地（可選）
          this.saveToLocalCart(cartItem)
          this.showToast(result.message, 'success')
          this.$emit('cart-updated', cartItem)
        } else {
          // 後端失敗，保存到本地作為備援
          this.saveToLocalCart(cartItem)
          this.showToast('已保存至本地購物車（離線模式）', 'warning')
        }
      } catch (error) {
        console.error('❌ 加入購物車失敗:', error)
        
        // 發生錯誤時的處理
        if (error.message.includes('用戶未登入')) {
          this.showToast('請先登入後再進行購買', 'danger')
          // 可以在這裡觸發登入流程
          this.$emit('need-login')
        } else {
          this.saveToLocalCart(cartItem)
          this.showToast('網路異常，已暫存至本地', 'warning')
        }
      }
    },

    /**
     * 處理立即購買
     */
    async handleBuyNow() {
      // 驗證必要選項
      if (!this.validateSelection()) {
        return
      }

      const cartItem = this.createCartItem()
      
      try {
        const result = await cartService.buyNowServer(cartItem, this.product)
        
        if (result.success) {
          this.showToast(result.message, 'success')
          
          // 延遲跳轉，讓用戶看到成功訊息
          setTimeout(() => {
            this.$router.push(result.redirectUrl)
          }, 1500)
        } else {
          this.showToast(result.message, 'danger')
        }
      } catch (error) {
        console.error('❌ 立即購買失敗:', error)
        
        if (error.message.includes('用戶未登入')) {
          this.showToast('請先登入後再進行購買', 'danger')
          this.$emit('need-login')
        } else {
          this.showToast('購買失敗，請稍後再試', 'danger')
        }
      }
    },

    /**
     * 驗證選項是否完整
     */
    validateSelection() {
      // 檢查庫存
      if (this.quantity > this.currentStock) {
        this.showToast(`庫存不足，目前僅有 ${this.currentStock} 件`, 'warning')
        return false
      }

      if (this.quantity <= 0) {
        this.showToast('請選擇商品數量', 'warning')
        return false
      }

      // 檢查必選顏色
      if (this.product.colors && this.product.colors.length > 1 && !this.selectedColor) {
        this.showToast('請選擇顏色', 'warning')
        return false
      }

      // 檢查必選尺寸
      if (this.product.sizes && this.product.sizes.length > 1 && !this.selectedSize) {
        this.showToast('請選擇尺寸', 'warning')
        return false
      }

      return true
    },

    /**
     * 創建購物車項目
     */
    createCartItem() {
      return {
        productId: this.product.id,
        name: this.product.name,
        price: this.product.price,
        quantity: this.quantity,
        color: this.selectedColor,
        size: this.selectedSize,
        image: this.currentImage,
        originalPrice: this.product.originalPrice,
        stock: this.currentStock,
        categoryId: this.product.categoryId,
        subCategoryId: this.product.subCategoryId
      }
    },

    /**
     * 保存到本地購物車
     */
    saveToLocalCart(cartItem) {
      try {
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
        
        // 檢查是否已存在相同商品
        const existingIndex = existingCart.findIndex(item => 
          item.productId === cartItem.productId && 
          item.color === cartItem.color && 
          item.size === cartItem.size
        )

        if (existingIndex > -1) {
          // 更新數量
          existingCart[existingIndex].quantity += cartItem.quantity
        } else {
          // 新增項目
          existingCart.push({
            ...cartItem,
            addedAt: new Date().toISOString()
          })
        }

        localStorage.setItem('cart', JSON.stringify(existingCart))
        console.log('💾 已儲存到本地購物車')
      } catch (error) {
        console.error('❌ 本地購物車儲存失敗:', error)
      }
    },

    /**
     * 顯示 Toast 通知
     */
    showToast(message, type = 'success') {
      this.toast = {
        show: true,
        message,
        type
      }

      // 自動隱藏
      setTimeout(() => {
        this.hideToast()
      }, 4000)
    },

    /**
     * 隱藏 Toast 通知
     */
    hideToast() {
      this.toast.show = false
    }
  }
}
</script>

<style scoped>
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* 加入購物車（#e4dcd1） */
.btn-add-cart {
  background-color: #e4dcd1;
  border-color: #e4dcd1;
  color: #022c5c;
}
.btn-add-cart:hover {
  background-color: #d7cfc3;
  border-color: #d7cfc3;
}

/* 立即購買（#eb5757） */
.btn-buy-now {
  background-color: #eb5757;
  border-color: #eb5757;
  color: #faf6eb;
}
.btn-buy-now:hover {
  background-color: #d94f4f;
  border-color: #d94f4f;
}

.alert {
  font-size: 0.9rem;
}

.toast-container {
  z-index: 1055;
}

.toast {
  min-width: 300px;
}
</style>

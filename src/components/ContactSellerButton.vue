<template>
  <button 
    :class="buttonClass"
    
    :disabled="loading"
    :title="buttonTitle"
  >
    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
    <i v-else :class="iconClass"></i>
    {{ buttonText }}
  </button>
</template>

<script>
export default {
  name: 'ContactSellerButton',
  props: {
    sellerId: {
      type: [String, Number],
      required: true
    },
    sellerName: {
      type: String,
      required: true
    },
    sellerAvatar: {
      type: String,
      default: ''
    },
    productId: {
      type: [String, Number],
      default: null
    },
    productName: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: '聯繫賣家'
    },
    buttonClass: {
      type: String,
      default: 'btn btn-outline-primary'
    },
    iconClass: {
      type: String,
      default: 'fas fa-comments me-2'
    },
    size: {
      type: String,
      default: 'normal', // small, normal, large
      validator: (value) => ['small', 'normal', 'large'].includes(value)
    },
    variant: {
      type: String,
      default: 'primary', // primary, success, outline
      validator: (value) => ['primary', 'success', 'outline'].includes(value)
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    buttonTitle() {
      return `與 ${this.sellerName} 開始聊天`
    },
    
    finalButtonClass() {
      const sizes = {
        small: 'btn-sm',
        normal: '',
        large: 'btn-lg'
      }
      
      const variants = {
        primary: 'btn-primary',
        success: 'btn-success', 
        outline: 'btn-outline-primary'
      }
      
      return `btn ${variants[this.variant]} ${sizes[this.size]} ${this.buttonClass}`
    }
  },
  methods: {
    async startChat() {
      this.loading = true
      
      try {
        // 生成聊天室ID
        const currentUser = this.getCurrentUser()
        if (!currentUser) {
          this.showLoginRequired()
          return
        }
        
        const chatRoomId = this.generateChatRoomId(
          currentUser.userId, 
          'member', 
          this.sellerId, 
          'seller'
        )
        
      // 準備聊天資訊
      const chatInfo = {
        chatRoomId,
        participant: {
          userId: this.sellerId,
          userType: 'seller',
          username: this.sellerName,
          avatar: this.sellerAvatar || this.getDefaultSellerAvatar()
        },
        // 這裡應該補上 lastMessage 或其他欄位
      }
      // 這裡可以加入實際的聊天啟動邏輯，例如跳轉或發送事件
    } catch (error) {
      console.error('啟動聊天時發生錯誤:', error)
    } finally {
      this.loading = false
    }
  },
  
  getInitialMessage() {
    if (this.productName) {
      return `您好，我想詢問關於「${this.productName}」的相關問題`
    }
    return '您好，我想詢問您的商品'
  },
    
    getDefaultSellerAvatar() {
      return `https://via.placeholder.com/40/28a745/white?text=${this.sellerName.charAt(0)}`
    },
    
    getDefaultMemberAvatar() {
      return 'https://via.placeholder.com/40/007bff/white?text=會'
    }
  },
}
</script>

<style scoped>
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:disabled {
  transform: none;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}
</style>

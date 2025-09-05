<template>
  <div class="checkout-container">
    <!-- 結帳流程進度條 -->
    <CheckoutProgress :current-step="currentStep" />
    
    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 結帳內容區域 -->
    <div v-if="!loading" class="checkout-content">
      <!-- 步驟 1: 收貨資訊 -->
      <div v-if="currentStep === 1" class="step-content">
        <h2><i class="fas fa-shipping-fast"></i> 收貨資訊</h2>
        <div class="shipping-form">
          <!-- 會員地址選擇與管理 -->
          <div class="form-group">
            <label>收貨地址</label>
            <div class="address-management">
              <!-- 預設地址顯示 -->
              <div v-if="defaultAddress" class="default-address-card" 
                   :class="{ 'selected': selectedAddressId === defaultAddress.id }"
                   @click="selectMemberAddress(defaultAddress)">
                <div class="address-header">
                  <h4><i class="fas fa-map-marker-alt"></i> 預設收貨地址</h4>
                  <div class="address-actions">
                    <button @click.stop="editDefaultAddress" class="btn-icon btn-edit" title="編輯地址">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click.stop="deleteAddress(defaultAddress)" class="btn-icon btn-delete" title="刪除地址">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="address-content" v-if="defaultAddress">
                  <div class="address-info">
                    <p><strong>{{ defaultAddress.recipientName }}</strong> {{ defaultAddress.phoneNumber }}</p>
                    <p>{{ defaultAddress.zipCode }} {{ defaultAddress.city }}{{ defaultAddress.district }}{{ defaultAddress.streetAddress }}</p>
                  </div>
                </div>
                <div class="selection-indicator" v-if="selectedAddressId === defaultAddress.id">
                  <i class="fas fa-check-circle"></i>
                </div>
              </div>
              
              <!-- 其他地址列表 -->
              <div class="other-addresses" v-if="otherAddresses.length > 0">
                <h4 class="other-addresses-title">
                  <i class="fas fa-list"></i>
                  其他收貨地址 ({{ otherAddresses.length }} 個)
                </h4>
                
                <div class="address-options">
                  <div 
                    v-for="address in otherAddresses" 
                    :key="address.id"
                    class="address-option-card"
                    :class="{ 'selected': selectedAddressId === address.id }"
                    @click="selectMemberAddress(address)"
                  >
                    <div class="address-content">
                      <div class="address-info">
                        <p><strong>{{ address.recipientName }}</strong> {{ address.phoneNumber }}</p>
                        <p>{{ address.zipCode }} {{ address.city }}{{ address.district }}{{ address.streetAddress }}</p>
                      </div>
                      <div class="address-actions">
                        <button @click.stop="editAddress(address)" class="btn-icon btn-edit">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button @click.stop="deleteAddress(address)" class="btn-icon btn-delete">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div class="selection-indicator" v-if="selectedAddressId === address.id">
                      <i class="fas fa-check-circle"></i>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 新增地址卡片 -->
              <div class="add-address-card" @click="startAddNewAddress">
                <div class="add-address-content">
                  <div class="add-address-icon">
                    <i class="fas fa-plus"></i>
                  </div>
                  <h4>新增收貨地址</h4>
                  <p>點擊新增新的收貨地址</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 地址表單（新增或編輯時顯示） -->
          <div v-if="showNewAddressForm || editingAddress" class="address-form">
            <h4 v-if="editingAddress">編輯地址</h4>
            <h4 v-else>新增地址</h4>
            <div class="form-group">
              <label>收件人姓名 <span class="required">*</span></label>
              <input 
                type="text" 
                v-model="shippingInfo.recipientName"
                placeholder="請輸入收件人姓名"
                required
                class="form-control"
              >
            </div>
            
            <div class="form-group">
              <label>聯絡電話 <span class="required">*</span></label>
              <input 
                type="tel" 
                v-model="shippingInfo.phone"
                placeholder="請輸入聯絡電話"
                required
                class="form-control"
              >
            </div>
            
            <div class="form-group">
              <label>收貨地址 <span class="required">*</span></label>
              <div class="address-group">
                <select 
                  v-model="shippingInfo.city"
                  @change="onCityChange"
                  required
                  class="form-control"
                >
                  <option value="">請選擇縣市</option>
                  <option v-for="cityName in availableCities" :key="cityName" :value="cityName">
                    {{ cityName }}
                  </option>
                </select>
                
                <select 
                  v-model="shippingInfo.district"
                  @change="onDistrictChange"
                  :disabled="!shippingInfo.city"
                  required
                  class="form-control"
                  :class="{ 'is-invalid': !shippingInfo.district && shippingInfo.city }"
                >
                  <option value="">請選擇區域</option>
                  <option v-for="district in availableDistricts" :key="district.name" :value="district.name">
                    {{ district.name }}
                  </option>
                </select>
                <div v-if="!shippingInfo.district && shippingInfo.city" class="invalid-feedback">
                  請選擇行政區
                </div>
                
                <input 
                  type="text" 
                  v-model="shippingInfo.address"
                  placeholder="請輸入詳細地址"
                  required
                  class="form-control"
                >
              </div>
            </div>
            
            <!-- 儲存為預設地址選項 -->
            <div class="form-group">
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="saveAsDefaultAddress"
                >
                <span class="option-text">
                  <i class="fas fa-bookmark"></i>
                  將此地址儲存為我的預設地址
                </span>
                <small class="option-desc">勾選後，下次結帳會自動使用此地址</small>
              </label>
            </div>
            
            <!-- 表單操作按鈕 -->
            <div class="form-actions">
              <button @click="cancelAddressEdit" class="btn btn-secondary">
                <i class="fas fa-times"></i>
                取消
              </button>
              <button @click="saveAddress" class="btn btn-primary">
                <i class="fas fa-check"></i>
                {{ editingAddress ? '更新地址' : '保存地址' }}
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>配送方式 <span class="required">*</span></label>
            <div class="delivery-options">
              <div v-if="deliveryMethods.length === 0" class="text-center py-3">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                載入配送方式中...
              </div>
              <label 
                v-for="method in deliveryMethods" 
                :key="method.method"
                class="radio-option"
                :class="{ disabled: !method.isAvailable }"
              >
                <input 
                  type="radio" 
                  v-model="shippingInfo.deliveryMethod" 
                  :value="method.method"
                  :disabled="!method.isAvailable"
                  @change="onDeliveryMethodChange"
                >
                <div class="option-content">
                  <span class="option-title">{{ method.name }}</span>
                  <span class="option-price">
                    {{ method.fee === 0 ? '免費' : `+NT$ ${method.fee}` }}
                  </span>
                  <small class="option-desc">{{ method.description }}</small>
                </div>
              </label>
            </div>
          </div>
          
          <!-- 儲存地址選項 -->
        </div>
      </div>

      <!-- 步驟 2: 付款方式 -->
      <div v-if="currentStep === 2" class="step-content">
        <h2><i class="fas fa-credit-card"></i> 付款方式與確認訂單</h2>
        
        <!-- 付款方式選擇 -->
        <div class="payment-section">
          <h3><i class="fas fa-credit-card"></i> 選擇付款方式</h3>
          <div class="payment-methods">
          <!-- 信用卡付款 -->
          <div class="payment-option">
            <label class="radio-option">
              <input 
                type="radio" 
                v-model="paymentInfo.method" 
                value="credit"
              >
              <div class="option-content">
                <span class="option-title">
                  <i class="fab fa-cc-visa"></i>
                  <i class="fab fa-cc-mastercard"></i>
                  信用卡付款
                </span>
                <small class="option-desc">支援 Visa、Mastercard、JCB - 將跳轉至安全付款頁面</small>
              </div>
            </label>
          </div>
          
          <!-- 銀行轉帳 -->
          <div class="payment-option">
            <label class="radio-option">
              <input 
                type="radio" 
                v-model="paymentInfo.method" 
                value="transfer"
              >
              <div class="option-content">
                <span class="option-title">
                  <i class="fas fa-university"></i>
                  銀行轉帳
                </span>
                <small class="option-desc">訂單成立後 3 日內完成轉帳</small>
              </div>
            </label>
            
            <div v-if="paymentInfo.method === 'transfer'" class="transfer-info">
              <div class="bank-info-card">
                <h4><i class="fas fa-university"></i> 轉帳資訊</h4>
                <div class="bank-details">
                  <div class="bank-item">
                    <span class="label">銀行:</span>
                    <span class="value">玉山銀行 (808)</span>
                  </div>
                  <div class="bank-item">
                    <span class="label">戶名:</span>
                    <span class="value">JADE 時尚電商股份有限公司</span>
                  </div>
                  <div class="bank-item">
                    <span class="label">帳號:</span>
                    <span class="value">1234-567-890123</span>
                  </div>
                </div>
                <div class="transfer-note">
                  <i class="fas fa-info-circle"></i>
                  <span>請於轉帳後保留收據，客服將主動聯繫確認</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 貨到付款 -->
          <div class="payment-option">
            <label class="radio-option">
              <input 
                type="radio" 
                v-model="paymentInfo.method" 
                value="cod"
              >
              <div class="option-content">
                <span class="option-title">
                  <i class="fas fa-hand-holding-usd"></i>
                  貨到付款
                </span>
                <span class="option-price">+NT$ 30</span>
                <small class="option-desc">商品送達時付款</small>
              </div>
            </label>
          </div>
        </div>
        </div>
        
        <hr class="section-divider">
        
        <!-- 確認訂單區域 -->
        <div class="order-confirmation-section">
          <h3><i class="fas fa-shopping-cart"></i> 確認訂單</h3>
          <div class="order-summary">
            <div class="order-items">
              <!-- 按賣家分組的購物車商品列表 -->
              <div v-if="vendorGroups && vendorGroups.length > 0" class="items-list">
                <!-- 每個賣家的商品群組 -->
                <div 
                  v-for="(vendor, index) in vendorGroups" 
                  :key="vendor.sellerId"
                  class="vendor-group"
                >
                  <!-- 簡潔的分隔區域 -->
                  <div v-if="vendorGroups.length > 1" class="vendor-header">
                    <div class="vendor-info">
                      <span class="vendor-indicator">商品組 {{ index + 1 }}</span>
                      <span class="vendor-item-count">{{ vendor.itemCount }} 件商品</span>
                    </div>
                  </div>
                  
                  <!-- 該賣家的商品列表 -->
                  <div class="vendor-items">
                    <div 
                      v-for="item in vendor.items" 
                      :key="`${item.productId}-${item.attributeValueId || item.id || item.itemId}`"
                      class="cart-item"
                    >
                      <div class="item-image">
                        <img :src="item.productImage || '/images/placeholder.jpg'" :alt="item.productName">
                      </div>
                      <div class="item-details">
                        <h5>{{ item.productName }}</h5>
                        <p class="item-attributes">
                          <span v-if="item.attributeValues">{{ item.attributeValues }}</span>
                          <span v-else-if="item.selectedColor || item.selectedSize">
                            <span v-if="item.selectedColor">顏色: {{ item.selectedColor }}</span>
                            <span v-if="item.selectedSize">尺寸: {{ item.selectedSize }}</span>
                          </span>
                          <span v-else-if="item.sku">SKU: {{ item.sku }}</span>
                        </p>
                        <div class="item-pricing">
                          <span class="quantity">數量: {{ item.quantity }}</span>
                          <span class="price">NT$ {{ formatPrice(item.priceAtAdded || item.price || item.unitPrice || 0) }}</span>
                          <span class="subtotal">小計: NT$ {{ formatPrice((item.priceAtAdded || item.price || item.unitPrice || 0) * item.quantity) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 群組小計 -->
                  <div v-if="vendorGroups.length > 1" class="vendor-subtotal">
                    <span class="subtotal-label">組別小計:</span>
                    <span class="subtotal-amount">NT$ {{ formatPrice(vendor.subtotal) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 如果沒有商品分組，顯示原始列表（向後兼容） -->
              <div v-else-if="cartItems && cartItems.length > 0" class="items-list">
                <div 
                  v-for="item in cartItems" 
                  :key="`${item.productId}-${item.attributeValueId || item.id || item.itemId}`"
                  class="cart-item"
                >
                  <div class="item-image">
                    <img :src="item.productImage || '/images/placeholder.jpg'" :alt="item.productName">
                  </div>
                  <div class="item-details">
                    <h4>{{ item.productName }}</h4>
                    <p class="item-attributes">
                      <span v-if="item.attributeValues">{{ item.attributeValues }}</span>
                      <span v-else-if="item.selectedColor || item.selectedSize">
                        <span v-if="item.selectedColor">顏色: {{ item.selectedColor }}</span>
                        <span v-if="item.selectedSize">尺寸: {{ item.selectedSize }}</span>
                      </span>
                      <span v-else-if="item.sku">SKU: {{ item.sku }}</span>
                    </p>
                    <div class="item-pricing">
                      <span class="quantity">數量: {{ item.quantity }}</span>
                      <span class="price">NT$ {{ formatPrice(item.priceAtAdded || item.price || item.unitPrice || 0) }}</span>
                      <span class="subtotal">小計: NT$ {{ formatPrice((item.priceAtAdded || item.price || item.unitPrice || 0) * item.quantity) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 訂單摘要 (步驟2顯示) -->
        <div class="checkout-summary">
          <h3>訂單摘要</h3>
          <div class="summary-content">
            <div class="summary-row">
              <span>商品總計</span>
              <span>NT$ {{ formatPrice(orderSummary.subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span>運費</span>
              <span v-html="getShippingFeeText()"></span>
            </div>
            <!-- 優惠券折扣 -->
            <div v-if="orderSummary.discount > 0" class="summary-row discount">
              <span><i class="fas fa-ticket-alt"></i> 優惠券折扣</span>
              <span class="text-success">-NT$ {{ formatPrice(orderSummary.discount) }}</span>
            </div>
            <div class="summary-row">
              <span>付款手續費</span>
              <span>{{ getPaymentFeeText() }}</span>
            </div>
            <div class="summary-row total">
              <span><strong>總計</strong></span>
              <span class="text-primary"><strong>NT$ {{ formatPrice(getFinalTotal()) }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步驟 3: 完成訂單 -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="order-confirmation">
          <div class="confirmation-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          
          <h2>訂單建立成功！</h2>
          <p class="order-number">訂單編號: <strong>#{{ orderResult.orderNumber }}</strong></p>
          
          <div class="order-details">
            <h3>訂單摘要</h3>
            
            <!-- 訂購商品列表 -->
            <div class="order-items-summary">
              <h4><i class="fas fa-shopping-bag"></i> 訂購商品</h4>
              <div v-if="cartItems && cartItems.length > 0" class="confirmation-items-list">
                <div 
                  v-for="item in cartItems" 
                  :key="`confirm-${item.productId}-${item.attributeValueId || item.id || item.itemId}`"
                  class="confirmation-item"
                >
                  <div class="confirmation-item-image">
                    <img :src="item.productImage || '/images/placeholder.jpg'" :alt="item.productName">
                  </div>
                  <div class="confirmation-item-details">
                    <h5>{{ item.productName }}</h5>
                    <p class="confirmation-item-attributes">
                      <span v-if="item.attributeValues">{{ item.attributeValues }}</span>
                      <span v-else-if="item.selectedColor || item.selectedSize">
                        <span v-if="item.selectedColor">顏色: {{ item.selectedColor }}</span>
                        <span v-if="item.selectedSize">尺寸: {{ item.selectedSize }}</span>
                      </span>
                      <span v-else-if="item.sku">SKU: {{ item.sku }}</span>
                    </p>
                    <div class="confirmation-item-pricing">
                      <span class="quantity">× {{ item.quantity }}</span>
                      <span class="price">NT$ {{ formatPrice(item.priceAtAdded || item.price || item.unitPrice || 0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="confirmation-summary">
              <div class="summary-row">
                <span>商品總計</span>
                <span>NT$ {{ formatPrice(orderSummary.subtotal) }}</span>
              </div>
              <div class="summary-row">
                <span>運費</span>
                <span v-html="getShippingFeeText()"></span>
              </div>
              <!-- 優惠券折扣 -->
              <div v-if="orderSummary.discount > 0" class="summary-row discount">
                <span><i class="fas fa-ticket-alt"></i> 優惠券折扣</span>
                <span class="text-success">-NT$ {{ formatPrice(orderSummary.discount) }}</span>
              </div>
              <div class="summary-row">
                <span>付款手續費</span>
                <span>{{ getPaymentFeeText() }}</span>
              </div>
              <div class="summary-row total">
                <span><strong>訂單金額</strong></span>
                <span class="text-primary"><strong>NT$ {{ formatPrice(orderResult.totalAmount) }}</strong></span>
              </div>
              <div class="summary-row">
                <span>付款方式</span>
                <span>{{ getPaymentMethodName(orderResult.paymentMethod) }}</span>
              </div>
              <div class="summary-row">
                <span>訂單狀態</span>
                <span class="status-badge">{{ getOrderStatusName(orderResult.orderStatus) }}</span>
              </div>
              <div class="summary-row">
                <span>付款狀態</span>
                <span class="status-badge payment">{{ getPaymentStatusName(orderResult.paymentStatus) }}</span>
              </div>
            </div>
          </div>
          
          <div class="next-steps">
            <div class="step-item">
              <i class="fas fa-envelope"></i>
              <span>我們已發送確認信至您的電子郵件</span>
            </div>
            <div class="step-item">
              <i class="fas fa-user"></i>
              <span>您可以在會員中心查看訂單狀態</span>
            </div>
            <div v-if="paymentInfo.method === 'transfer'" class="step-item">
              <i class="fas fa-university"></i>
              <span>請於 3 日內完成轉帳，並保留收據</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <!-- 如果是信用卡付款，顯示前往付款按鈕 -->
            <button 
              v-if="paymentInfo.method === 'credit'" 
              @click="goToPayment" 
              class="btn btn-primary btn-payment"
              :disabled="paymentProcessing"
            >
              <span v-if="paymentProcessing" class="spinner-small"></span>
              <i v-else class="fas fa-credit-card"></i>
              {{ paymentProcessing ? '跳轉中...' : '前往付款' }}
            </button>
            
            <button @click="goToOrderTracking" class="btn btn-outline-primary">
              <i class="fas fa-list"></i>
              查看我的訂單
            </button>
            <button @click="continueShopping" class="btn btn-secondary">
              <i class="fas fa-shopping-bag"></i>
              繼續購物
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按鈕 -->
    <div class="checkout-actions" v-if="currentStep < 3 && !loading">
      <div class="left-actions">
        <button 
          v-if="currentStep > 1" 
          @click="previousStep" 
          class="btn btn-secondary"
          :disabled="processing"
        >
          <i class="fas fa-arrow-left"></i>
          上一步
        </button>
      </div>
      
      <div class="right-actions">
        <button 
          @click="nextStep" 
          class="btn btn-primary"
          :disabled="!canProceed || processing || paymentProcessing"
        >
          <span v-if="processing" class="spinner-small"></span>
          <i v-else-if="currentStep === 2" class="fas fa-check"></i>
          <i v-else class="fas fa-arrow-right"></i>
          {{ getNextStepButtonText() }}
        </button>
      </div>
    </div>
    
    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import CheckoutProgress from '@/components/cart/CheckoutProgress.vue'
import cartService from '@/services/cartService'
import memberAddressService from '@/services/memberAddressService'
import orderAddressService from '@/services/orderAddressService'
import userIdentityService from '@/services/userIdentityService'
import { formatPrice } from '@/utils/cartUtils'
import { groupCartItemsByVendor, formatVendorName } from '@/utils/vendorUtils'

export default {
  name: 'CheckoutView',
  components: {
    CheckoutProgress
  },
  data() {
    return {
      currentStep: 1,
      loading: true,
      processing: false,
      paymentProcessing: false,
      errorMessage: '',
      
      // 地址設置狀態控制
      isSettingAddress: false, // 新增：標記是否正在程式化設置地址
      
      // 購物車資料
      cartItems: [],
      cartData: null, // 保存完整的購物車資料（包含優惠券資訊）
      orderSummary: {
        subtotal: 0,
        shippingFee: 0,
        originalShippingFee: 0, // 新增：儲存原始運費，用於顯示劃線效果
        discount: 0,
        total: 0,
        couponCode: null
      },
      
      // 會員地址
      memberAddresses: [],
      defaultAddress: null,        // 預設地址
      otherAddresses: [],         // 其他地址
      selectedAddressId: null,
      showAddressOptions: false,  // 是否顯示其他地址選項
      showNewAddressForm: false,  // 是否顯示新地址表單
      editingAddress: null,       // 正在編輯的地址
      saveAsDefaultAddress: false, // 是否儲存為預設地址
      
      // 收貨資訊
      shippingInfo: {
        recipientName: '',
        phone: '',
        city: '',
        district: '',
        address: '',
        deliveryMethod: '' // 改為空字串，等載入後設定第一個可用選項
      },
      
      // 配送選項
      deliveryMethods: [],
      
      // 付款方式選項
      paymentMethods: [],
      selectedPaymentMethod: null,
      
      // 付款資訊
      paymentInfo: {
        method: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      },
      
      // 訂單結果
      orderResult: {
        orderNumber: '',
        totalAmount: 0,
        paymentMethod: '',
        orderStatus: '',
        paymentStatus: ''
      }
    }
  },
  
  computed: {
    canProceed() {
      if (this.processing) return false
      
      switch (this.currentStep) {
        case 1:
          return this.validateShippingInfo()
        case 2:
          return this.validatePaymentInfo()
        default:
          return false
      }
    },

    // 按賣家分組的購物車商品
    vendorGroups() {
      return groupCartItemsByVendor(this.cartItems)
    },

    // 可用縣市清單
    availableCities() {
      return orderAddressService.getCities()
    },

    // 可用區域清單
    availableDistricts() {
      return orderAddressService.getDistricts(this.shippingInfo.city)
    }
  },
  
  methods: {
    formatPrice,
    formatVendorName,
    
    async loadCheckoutData() {
      try {
        this.loading = true
        this.errorMessage = ''
        
        // 載入購物車資料
        await this.loadCartItems()
        
        // 載入會員地址
        await this.loadMemberAddresses()
        
        // 載入配送方式
        await this.loadDeliveryMethods()
        
        // 載入付款方式
        await this.loadPaymentMethods()
        
        // 如果購物車為空，導向購物車頁面
        if (this.cartItems.length === 0) {
          this.$router.push('/cart')
          return
        }
        
      } catch (error) {
        console.error('載入結帳資料失敗:', error)
        this.errorMessage = '載入資料失敗，請重新整理頁面'
      } finally {
        this.loading = false
      }
    },
    
    async loadCartItems() {
      try {
        // 獲取會員 ID（與 useCart composable 相同的邏輯）
        const memberId = this.getCartMemberId()
        if (!memberId) {
          console.error('❌ CheckoutView: 無法獲取會員 ID')
          this.cartItems = []
          return
        }
        
        console.log('🛒 CheckoutView: 載入購物車資料，會員 ID:', memberId)
        const result = await cartService.getCart(memberId)
        
        console.log('📦 CheckoutView: API 完整回應:', result)
        
        if (result.success && result.data) {
          // 檢查原始數據結構
          console.log('🔍 CheckoutView: 檢查原始購物車數據結構:', {
            hasItems: !!result.data.items,
            itemsLength: result.data.items ? result.data.items.length : 0,
            hasCoupon: !!result.data.couponCode,
            discount: result.data.discount,
            total: result.data.total,
            subtotal: result.data.subtotal,
            rawData: result.data
          })
          
          // 確保 items 存在且為陣列
          const rawItems = result.data.items
          if (Array.isArray(rawItems) && rawItems.length > 0) {
            this.cartItems = rawItems
            console.log('✅ CheckoutView: 成功載入購物車商品:', this.cartItems.length, '項目')
            
            // 保存購物車的優惠券和折扣資訊
            this.cartData = result.data
            console.log('💾 CheckoutView: 保存完整購物車資料:', this.cartData)
            
            // 詳細檢查每個商品的結構
            this.cartItems.forEach((item, index) => {
              console.log(`🔍 CheckoutView 商品 ${index + 1}:`, {
                id: item.id || item.itemId,
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                priceAtAdded: item.priceAtAdded,
                price: item.price,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
                fullStructure: item
              })
            })
          } else {
            console.warn('⚠️ CheckoutView: 購物車商品陣列為空或無效:', rawItems)
            this.cartItems = []
            this.cartData = null
          }
          
          // 計算訂單摘要
          this.calculateOrderSummary()
        } else {
          console.warn('❌ CheckoutView: API 回應失敗:', result.message)
          this.cartItems = []
          this.cartData = null
        }
      } catch (error) {
        console.error('❌ CheckoutView: 載入購物車異常:', error)
        this.cartItems = []
        this.cartData = null
      }
    },
    
    // 獲取會員 ID（與 useCart composable 相同的邏輯）
    getCartMemberId() {
      // 優先從 localStorage 直接獲取 memberId（與隊友的登入機制相容）
      const directMemberId = localStorage.getItem('memberId')
      if (directMemberId && directMemberId !== 'null' && directMemberId !== '' && directMemberId !== 'undefined') {
        const parsedId = parseInt(directMemberId, 10)
        if (!isNaN(parsedId) && parsedId > 0) {
          console.log('🔍 CheckoutView: 從 localStorage 獲取會員 ID:', parsedId)
          return parsedId
        }
      }
      
      // 備用：檢查其他可能的認證方式
      const token = localStorage.getItem('authToken') ||
                   localStorage.getItem('auth_token') ||
                   localStorage.getItem('token')
      const currentUser = localStorage.getItem('currentUser')
      
      // 如果有標準認證但沒有 memberId，嘗試從 userIdentityService 獲取
      if (token && currentUser) {
        try {
          const serviceId = userIdentityService.getMemberId()
          if (serviceId) {
            console.log('🔍 CheckoutView: 從 userIdentityService 獲取會員 ID:', serviceId)
            return serviceId
          }
        } catch (error) {
          console.warn('⚠️ CheckoutView: 無法從 userIdentityService 獲取會員 ID:', error)
        }
      }
      
      console.warn('⚠️ CheckoutView: 無法獲取會員 ID')
      return null
    },
    
    async loadDeliveryMethods() {
      try {
        const memberId = this.getCartMemberId()
        if (!memberId) {
          console.warn('🚚 無法載入配送方式：缺少會員 ID')
          // 使用預設選項
          this.deliveryMethods = this.getDefaultDeliveryMethods()
          return
        }

        console.log('🚚 開始載入配送方式，會員 ID:', memberId)

        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'}/api/Checkout/delivery-methods/${memberId}`)
        
        if (response.ok) {
          const result = await response.json()
          
          if (result.success && Array.isArray(result.data)) {
            this.deliveryMethods = result.data
            console.log('✅ 載入配送方式成功:', this.deliveryMethods)
            
            // 自動選擇第一個可用的配送方式
            if (this.deliveryMethods.length > 0 && !this.shippingInfo.deliveryMethod) {
              const firstAvailable = this.deliveryMethods.find(m => m.isAvailable)
              if (firstAvailable) {
                this.shippingInfo.deliveryMethod = firstAvailable.method
                console.log('🎯 自動選擇配送方式:', firstAvailable.method)
              }
            }
          } else {
            console.warn('🚚 配送方式 API 回應格式錯誤:', result)
            this.deliveryMethods = this.getDefaultDeliveryMethods()
          }
        } else {
          console.warn('🚚 配送方式 API 請求失敗:', response.status)
          this.deliveryMethods = this.getDefaultDeliveryMethods()
        }
      } catch (error) {
        console.error('🚚 載入配送方式發生錯誤:', error)
        this.deliveryMethods = this.getDefaultDeliveryMethods()
      }
    },

    getDefaultDeliveryMethods() {
      return [
        {
          method: 'HOME_TCAT',
          name: '黑貓宅急便',
          fee: 60,
          description: '黑貓宅急便到府配送 - 1-2個工作天',
          isAvailable: true,
          estimatedDays: 2
        },
        {
          method: 'UNIMART',
          name: '7-ELEVEN 超商取貨',
          fee: 60,
          description: '7-ELEVEN 超商取貨付款 - 2-4個工作天',
          isAvailable: true,
          estimatedDays: 3
        },
        {
          method: 'FAMI',
          name: '全家便利商店取貨',
          fee: 60,
          description: '全家便利商店取貨付款 - 2-4個工作天',
          isAvailable: true,
          estimatedDays: 3
        }
      ]
    },

    async loadMemberAddresses() {
      try {
        // 獲取會員 ID
        const memberId = this.getCartMemberId()
        
        // 詳細的除錯訊息
        console.log('🔍 CheckoutView: localStorage memberId:', localStorage.getItem('memberId'))
        console.log('🔍 CheckoutView: localStorage authToken:', localStorage.getItem('authToken'))
        console.log('🔍 CheckoutView: 解析的會員 ID:', memberId)
        
        if (!memberId) {
          console.warn('⚠️ CheckoutView: 無法獲取會員 ID，跳過載入地址')
          this.memberAddresses = []
          return
        }

        console.log('🏠 CheckoutView: 載入會員地址，會員 ID:', memberId)
        const result = await memberAddressService.getMemberAddresses(memberId)
        
        if (result.success) {
          this.memberAddresses = result.data || []
          console.log('✅ CheckoutView: 成功載入會員地址:', this.memberAddresses.length, '個地址')
          
          // 分離預設地址和其他地址
          this.defaultAddress = this.memberAddresses.find(addr => addr.isDefault) || null
          this.otherAddresses = this.memberAddresses.filter(addr => !addr.isDefault)
          
          // 如果有預設地址，自動選中並填入表單
          if (this.defaultAddress) {
            this.selectedAddressId = this.defaultAddress.id
            this.selectMemberAddress(this.defaultAddress)
            console.log('🏠 CheckoutView: 自動選中預設地址:', this.defaultAddress.id)
          }
          
          console.log('🏠 CheckoutView: 預設地址:', this.defaultAddress)
          console.log('🏠 CheckoutView: 其他地址:', this.otherAddresses.length, '個')
        } else {
          console.warn('⚠️ CheckoutView: 載入會員地址失敗:', result.error)
          this.memberAddresses = []
        }
      } catch (error) {
        console.error('❌ CheckoutView: 載入會員地址異常:', error)
        this.memberAddresses = []
      }
    },
    
    async loadPaymentMethods() {
      try {
        const memberId = this.getCartMemberId()
        if (!memberId) {
          console.warn('💳 無法載入付款方式：缺少會員 ID')
          this.paymentMethods = []
          return
        }

        console.log('💳 開始載入付款方式，會員 ID:', memberId)

        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'}/api/Checkout/payment-methods/${memberId}`)
        
        if (response.ok) {
          const result = await response.json()
          
          if (result.success && Array.isArray(result.data)) {
            this.paymentMethods = result.data
            console.log('✅ 載入付款方式成功:', this.paymentMethods)
            
            // 自動選擇第一個可用的付款方式
            if (this.paymentMethods.length > 0 && !this.selectedPaymentMethod) {
              const firstAvailable = this.paymentMethods.find(m => m.isAvailable)
              if (firstAvailable) {
                this.selectedPaymentMethod = firstAvailable.method
                console.log('🎯 自動選擇付款方式:', firstAvailable.method)
              }
            }
          } else {
            console.warn('💳 付款方式 API 回應格式錯誤:', result)
            this.paymentMethods = []
          }
        } else {
          console.warn('💳 付款方式 API 請求失敗:', response.status)
          this.paymentMethods = []
        }
      } catch (error) {
        console.error('💳 載入付款方式發生錯誤:', error)
        this.paymentMethods = []
      }
    },
    
    // 地址管理方法
    editDefaultAddress() {
      if (this.defaultAddress) {
        this.editAddress(this.defaultAddress)
      }
    },

    startAddNewAddress() {
      // 清除編輯狀態，切換到新增模式
      this.editingAddress = null
      this.showNewAddressForm = true
      
      // 清除選中的地址，讓用戶知道當前在新增模式
      this.selectedAddressId = null
      
      // 重置預設地址選項
      this.saveAsDefaultAddress = false
      
      // 清空表單
      this.shippingInfo = {
        recipientName: '',
        phone: '',
        city: '',
        district: '',
        address: '',
        deliveryMethod: 'standard'
      }
      
      console.log('🏠 CheckoutView: 開始新增地址，已清除選中狀態')
    },

    editAddress(address) {
      this.editingAddress = { ...address }
      this.showNewAddressForm = true
      
      // 設定是否為預設地址
      this.saveAsDefaultAddress = address.isDefault || false
      
      // 填入編輯表單
      this.shippingInfo = {
        recipientName: address.recipientName,
        phone: address.phoneNumber,
        city: address.city,
        district: address.district,
        address: address.streetAddress,
        deliveryMethod: this.shippingInfo.deliveryMethod
      }
    },

    async deleteAddress(address) {
      try {
        const confirmed = await this.$swal.fire({
          title: '確認刪除',
          text: `確定要刪除「${address.recipientName}」的地址嗎？`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: '確定刪除',
          cancelButtonText: '取消'
        })

        if (!confirmed.isConfirmed) return

        const memberId = this.getCartMemberId()
        if (!memberId) {
          this.$swal.fire('錯誤', '無法獲取會員資訊', 'error')
          return
        }

        const result = await memberAddressService.deleteMemberAddress(memberId, address.id)
        
        if (result.success) {
          this.$swal.fire('成功', '地址已刪除', 'success')
          await this.loadMemberAddresses() // 重新載入地址列表
          
          // 如果刪除的是當前選中的地址，清除選中狀態
          if (this.selectedAddressId === address.id) {
            this.selectedAddressId = null
            this.clearAddressSelection()
          }
        } else {
          this.$swal.fire('錯誤', result.error || '刪除地址失敗', 'error')
        }
      } catch (error) {
        console.error('刪除地址失敗:', error)
        this.$swal.fire('錯誤', '刪除地址失敗', 'error')
      }
    },
    
    cancelAddressEdit() {
      this.editingAddress = null
      this.showNewAddressForm = false
      
      // 重置預設地址選項
      this.saveAsDefaultAddress = false
      
      // 恢復先前選中的地址或預設地址
      if (this.selectedAddressId) {
        const selectedAddress = this.memberAddresses.find(addr => addr.id === this.selectedAddressId)
        if (selectedAddress) {
          this.selectMemberAddress(selectedAddress)
        }
      } else if (this.defaultAddress) {
        this.selectMemberAddress(this.defaultAddress)
      } else {
        // 如果沒有選中地址和預設地址，清空表單
        this.clearAddressSelection()
      }
    },

    // 處理縣市變更
    onCityChange() {
      this.shippingInfo.district = ''
      console.log('城市變更為:', this.shippingInfo.city)
    },

    // 處理區域變更
    onDistrictChange() {
      const zipCode = orderAddressService.getZipCode(this.shippingInfo.city, this.shippingInfo.district)
      console.log('區域變更為:', this.shippingInfo.district, '郵遞區號:', zipCode)
    },
    
    async saveAddress() {
      try {
        const memberId = this.getCartMemberId()
        if (!memberId) return
        
        // 驗證必填欄位
        if (!this.shippingInfo.recipientName || !this.shippingInfo.phone || 
            !this.shippingInfo.city || !this.shippingInfo.district || !this.shippingInfo.address) {
          this.$swal.fire('錯誤', '請填寫完整的收貨資訊', 'error')
          return
        }
        
        // 取得郵遞區號
        const zipCode = orderAddressService.getZipCode(this.shippingInfo.city, this.shippingInfo.district)
        if (!zipCode) {
          this.$swal.fire('錯誤', '無法取得郵遞區號，請檢查城市和區域選擇', 'error')
          return
        }

        const addressData = {
          recipientName: this.shippingInfo.recipientName,
          phoneNumber: this.shippingInfo.phone,
          city: this.shippingInfo.city,
          district: this.shippingInfo.district,
          streetAddress: this.shippingInfo.address,
          zipCode: zipCode,
          isDefault: this.saveAsDefaultAddress
        }
        
        console.log('🏠 CheckoutView: 準備發送的地址資料:', addressData)

        let result
        if (this.editingAddress) {
          // 編輯現有地址
          result = await memberAddressService.updateMemberAddress(memberId, this.editingAddress.id, addressData)
        } else {
          // 新增地址
          result = await memberAddressService.createMemberAddress(memberId, addressData)
        }

        if (result.success) {
          this.$swal.fire('成功', this.editingAddress ? '地址已更新' : '地址已新增', 'success')
          this.cancelAddressEdit()
          await this.loadMemberAddresses() // 重新載入地址列表
        } else {
          this.$swal.fire('錯誤', result.error || '儲存地址失敗', 'error')
        }
      } catch (error) {
        console.error('儲存地址失敗:', error)
        this.$swal.fire('錯誤', '儲存地址失敗', 'error')
      }
    },    calculateOrderSummary() {
      console.log('🧮 CheckoutView: 開始計算訂單摘要')
      console.log('🧮 CheckoutView: 購物車商品數量:', this.cartItems ? this.cartItems.length : 'undefined')
      console.log('🧮 CheckoutView: 完整購物車資料:', this.cartData)
      
      // 檢查購物車商品是否存在
      if (!this.cartItems || !Array.isArray(this.cartItems)) {
        console.warn('⚠️ CheckoutView: 購物車商品不是有效陣列')
        this.orderSummary.subtotal = 0
        this.orderSummary.total = 0
        this.orderSummary.discount = 0
        return
      }
      
      // 計算商品小計
      this.orderSummary.subtotal = this.cartItems.reduce((sum, item) => {
        // 檢查不同可能的價格字段
        const price = item.priceAtAdded || item.price || item.unitPrice || 0
        const quantity = item.quantity || 0
        const subtotal = price * quantity
        
        console.log('🧮 CheckoutView 計算商品小計:', {
          productName: item.productName,
          price: price,
          quantity: quantity,
          subtotal: subtotal
        })
        
        return sum + subtotal
      }, 0)
      
      console.log('🧮 CheckoutView 總商品小計:', this.orderSummary.subtotal)
      
      // 從購物車資料中取得優惠券折扣資訊
      if (this.cartData) {
        this.orderSummary.discount = parseFloat(this.cartData.discount || 0)
        this.orderSummary.couponCode = this.cartData.couponCode || null
        console.log('🎫 CheckoutView 優惠券資訊:', {
          couponCode: this.orderSummary.couponCode,
          discount: this.orderSummary.discount
        })
      } else {
        this.orderSummary.discount = 0
        this.orderSummary.couponCode = null
      }
      
      // 計算運費
      this.updateShippingFee()
      
      // 計算總計
      this.orderSummary.total = this.orderSummary.subtotal + this.orderSummary.shippingFee - this.orderSummary.discount
      
      console.log('🧮 CheckoutView 最終訂單摘要:', this.orderSummary)
    },
    
    async updateShippingFee() {
      try {
        const memberId = this.getCartMemberId()
        if (!memberId) return

        // 先獲取原始運費（不含免運優惠）
        const selectedMethod = this.deliveryMethods.find(m => m.method === this.shippingInfo.deliveryMethod)
        if (selectedMethod) {
          this.orderSummary.originalShippingFee = selectedMethod.fee
          console.log('🚚 設置原始運費:', selectedMethod.fee, '配送方式:', selectedMethod.method)
        }

        // 調用後端 API 計算運費（包含免運邏輯）
        const deliveryMethod = this.shippingInfo.deliveryMethod || 'HOME_TCAT' // 🔧 提供默認值
        if (!deliveryMethod) {
          console.warn('⚠️ 配送方式為空，跳過後端運費計算')
          return
        }
        
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'}/api/Checkout/shipping-fee/${memberId}?deliveryMethod=${deliveryMethod}`)
        const result = await response.json()
        
        if (result.success) {
          this.orderSummary.shippingFee = result.data
          console.log(`🚚 後端運費計算: 配送方式 ${deliveryMethod}, 原始運費 ${this.orderSummary.originalShippingFee}, 最終運費 ${result.data}`)
          
          // 如果最終運費為0但原始運費大於0，說明觸發了免運
          if (result.data === 0 && this.orderSummary.originalShippingFee > 0) {
            console.log('✅ 觸發免運優惠！原始運費:', this.orderSummary.originalShippingFee)
          }
        } else {
          // 如果 API 失敗，使用前端備用邏輯
          this.fallbackShippingCalculation()
        }
      } catch (error) {
        console.error('運費計算 API 失敗:', error)
        // API 失敗時使用前端備用邏輯
        this.fallbackShippingCalculation()
      }
    },

    fallbackShippingCalculation() {
      // 備用的前端運費計算邏輯
      const feeMap = {
        // 新的綠界物流代碼
        'HOME_TCAT': 60,    // 黑貓宅急便
        'UNIMART': 60,      // 7-11超商取貨
        'FAMI': 60,         // 全家便利商店
        // 向下兼容舊代碼
        'standard': 60,
        'express': 100,
        'pickup': 60
      }
      
      let originalFee = feeMap[this.shippingInfo.deliveryMethod] || 60
      let finalFee = originalFee
      
      // 記錄原始運費
      this.orderSummary.originalShippingFee = originalFee
      
      // 滿1000元免運邏輯
      if (this.orderSummary.subtotal >= 1000) {
        finalFee = 0
      }
      
      this.orderSummary.shippingFee = finalFee
      console.log(`🚚 前端備用運費計算: 小計 ${this.orderSummary.subtotal}, 配送方式 ${this.shippingInfo.deliveryMethod}, 原始運費 ${originalFee}, 最終運費 ${finalFee}`)
    },
    
    getPaymentFee() {
      return this.paymentInfo.method === 'cod' ? 30 : 0
    },
    
    getFinalTotal() {
      return this.orderSummary.total + this.getPaymentFee()
    },
    
    getShippingFeeText() {
      const currentFee = this.orderSummary.shippingFee
      const originalFee = this.orderSummary.originalShippingFee
      
      // 檢查是否觸發免運 - 如果原始費用為0但後端API被調用，表示可能有免運邏輯
      if (currentFee === 0) {
        // 如果有設置原始費用且大於0，顯示劃線效果
        if (originalFee > 0) {
          return `<span class="original-price">NT$ ${this.formatPrice(originalFee)}</span> <span class="free-shipping">免運費</span>`
        }
        
        // 如果原始費用也是0，但是從配送方式中可以找到實際費用，顯示劃線效果
        const selectedMethod = this.deliveryMethods.find(m => m.method === this.shippingInfo.deliveryMethod)
        if (selectedMethod && selectedMethod.fee > 0) {
          return `<span class="original-price">NT$ ${this.formatPrice(selectedMethod.fee)}</span> <span class="free-shipping">免運費</span>`
        }
        
        // 否則只顯示免運費
        return '<span class="free-shipping">免運費</span>'
      } else {
        // 正常收費
        return `NT$ ${this.formatPrice(currentFee)}`
      }
    },
    
    getPaymentFeeText() {
      const fee = this.getPaymentFee()
      return fee > 0 ? `NT$ ${this.formatPrice(fee)}` : '免費'
    },
    
    selectMemberAddress(address) {
      // 如果當前在編輯狀態，先清除編輯狀態
      if (this.editingAddress || this.showNewAddressForm) {
        this.cancelAddressEdit()
      }
      
      this.selectedAddressId = address.id
      
      // 🔥 修復：設置標記，避免觸發 watch 清空 district
      this.isSettingAddress = true
      
      this.shippingInfo = {
        recipientName: address.recipientName,
        phone: address.phoneNumber,
        city: address.city,
        district: address.district,
        address: address.streetAddress,
        deliveryMethod: this.shippingInfo.deliveryMethod
      }
      
      // 重置標記
      this.$nextTick(() => {
        this.isSettingAddress = false
      })
      
      console.log('🏠 選擇地址後的 shippingInfo:', this.shippingInfo)
    },
    
    clearAddressSelection() {
      this.shippingInfo = {
        recipientName: '',
        phone: '',
        city: '',
        district: '',
        address: '',
        deliveryMethod: this.shippingInfo.deliveryMethod
      }
    },
    
    nextStep() {
      if (!this.canProceed) return
      
      if (this.currentStep === 1) {
        // 第一步，重新計算運費
        this.updateShippingFee()
        this.calculateOrderSummary()
      }
      
      if (this.currentStep === 2) {
        // 第二步：根據付款方式處理
        if (this.paymentInfo.method === 'credit') {
          // 信用卡付款：直接跳轉到綠界
          console.log('💳 信用卡付款：直接跳轉到綠界')
          this.goToPayment()
        } else {
          // 其他付款方式：建立訂單後進入步驟3
          console.log('🏦 其他付款方式：建立訂單')
          this.processOrder()
        }
      } else {
        this.currentStep++
      }
    },
    
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    
    validateShippingInfo() {
      // 如果有預設地址且選擇了配送方式，則可以通過
      if (this.defaultAddress && this.shippingInfo.deliveryMethod) {
        return true
      }
      
      // 或者手動輸入了完整的地址資訊
      const { recipientName, phone, city, district, address, deliveryMethod } = this.shippingInfo
      return recipientName.trim() && phone.trim() && city && district && address.trim() && deliveryMethod
    },
    
    validatePaymentInfo() {
      const { method } = this.paymentInfo
      return !!method // 只需要選擇付款方式即可
    },
    
    async processOrder() {
      try {
        this.processing = true
        this.errorMessage = ''
        
        // 準備結帳資料
        const memberId = this.getCartMemberId()
        if (!memberId) {
          throw new Error('無法獲取會員資訊，請重新登入')
        }

        // 🔥 加入結帳前驗證
        console.log('🔍 開始結帳前驗證...')
        const validationResult = await this.validateCheckoutBeforeProcess(memberId)
        
        if (!validationResult.isValid) {
          // 顯示庫存不足或其他錯誤
          const errorMessages = validationResult.errors.map(error => {
            if (error.type === 'INSUFFICIENT_STOCK') {
              return `${error.data.productName} 庫存不足（需要 ${error.data.requestedQuantity}，剩餘 ${error.data.availableStock}）`
            }
            return error.message
          }).join('\n')
          
          throw new Error(`結帳驗證失敗：\n${errorMessages}`)
        }
        
        console.log('✅ 結帳前驗證通過')
        
        // 檢查必要欄位
        const requiredFields = {
          'MemberId': memberId,
          'RecipientName': this.shippingInfo.recipientName,
          'PhoneNumber': this.shippingInfo.phone,
          'City': this.shippingInfo.city,
          'District': this.shippingInfo.district,
          'AddressDetail': this.shippingInfo.address,
          'DeliveryMethod': this.shippingInfo.deliveryMethod,
          'PaymentMethod': this.paymentInfo.method
        }
        
        console.log('🔍 檢查必要欄位:', requiredFields)
        console.log('🔍 完整 shippingInfo:', this.shippingInfo)
        console.log('🔍 完整 paymentInfo:', this.paymentInfo)
        console.log('🔍 可用行政區:', this.availableDistricts)
        
        // 檢查是否有空值
        const emptyFields = Object.entries(requiredFields).filter(([key, value]) => !value || value === '')
        if (emptyFields.length > 0) {
          console.error('❌ 發現空的必要欄位:', emptyFields)
          
          // 提供更友善的錯誤訊息
          const fieldNames = {
            'MemberId': '會員ID',
            'RecipientName': '收件人姓名',
            'PhoneNumber': '聯絡電話',
            'City': '縣市',
            'District': '行政區',
            'AddressDetail': '詳細地址',
            'DeliveryMethod': '配送方式',
            'PaymentMethod': '付款方式'
          }
          
          const missingFieldsText = emptyFields.map(([key]) => fieldNames[key] || key).join('、')
          
          // 特別處理：如果只是行政區為空，提示用戶檢查
          if (emptyFields.length === 1 && emptyFields[0][0] === 'District') {
            // 如果用戶確實選擇了縣市，我們提供更具體的幫助
            if (this.shippingInfo.city) {
              throw new Error(`請選擇 ${this.shippingInfo.city} 的行政區。如果看不到選項，請重新選擇縣市。`)
            }
          }
          
          throw new Error(`請填寫以下必要資訊：${missingFieldsText}`)
        }
        
        const checkoutData = {
          MemberId: memberId,
          RecipientName: this.shippingInfo.recipientName,
          PhoneNumber: this.shippingInfo.phone,
          City: this.shippingInfo.city,
          District: this.shippingInfo.district,
          AddressDetail: this.shippingInfo.address,
          DeliveryMethod: this.shippingInfo.deliveryMethod,
          PaymentMethod: this.paymentInfo.method,
          AddressId: this.selectedAddressId,
          CouponCode: null, // 暫時沒有優惠券
          UsedPoints: 0,    // 暫時沒有點數
          Note: null        // 備註欄位
        }
        
        console.log('提交結帳資料:', checkoutData)
        
        // 呼叫結帳 API
        const response = await this.submitCheckout(checkoutData)
        
        if (response.success) {
          // 保存訂單結果（根據後端 CheckoutResponseDto 格式）
          this.orderResult = {
            orderId: response.data.orderId, // 保存原始訂單 ID
            orderNumber: response.data.orderNumber || response.data.orderId,
            totalAmount: this.getFinalTotal(), // 🔥 修復：使用前端計算的最終金額
            backendTotalAmount: response.data.totalAmount, // 保存後端金額用於調試
            paymentMethod: this.paymentInfo.method,
            orderStatus: response.data.orderStatus || 'pending',
            paymentStatus: response.data.paymentStatus || 'pending'
          }
          
          console.log('💰 訂單金額比較:', {
            frontend: this.getFinalTotal(),
            backend: response.data.totalAmount,
            difference: this.getFinalTotal() - response.data.totalAmount
          })
          
          // 進入完成頁面
          this.currentStep = 3
          
          // 清空購物車（在後端已處理，這裡更新前端狀態）
          this.cartItems = []
          
        } else {
          throw new Error(response.message || '訂單建立失敗')
        }
        
      } catch (error) {
        console.error('處理訂單失敗:', error)
        this.errorMessage = error.message || '訂單建立失敗，請稍後再試'
      } finally {
        this.processing = false
      }
    },
    
    async submitCheckout(checkoutData) {
      try {
        // 使用 CheckoutController 的 create-order API
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'}/api/Checkout/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(checkoutData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('後端錯誤詳情:', errorData)
          throw new Error(errorData.message || `HTTP ${response.status}`)
        }
        
        const result = await response.json()
        return result
        
      } catch (error) {
        console.error('API 呼叫失敗:', error)
        throw error
      }
    },

    async validateCheckoutBeforeProcess(memberId) {
      try {
        const API_BASE = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'
        const response = await fetch(`${API_BASE}/api/Checkout/validate/${memberId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
          }
        })
        
        const result = await response.json()
        
        if (response.ok && result.success) {
          return result.data // { isValid: true, errors: [], summary: {...} }
        } else {
          // API 回傳驗證失敗（包括 400 錯誤）
          console.log('🚫 結帳驗證失敗:', result)
          return result.data || { isValid: false, errors: [{ message: result.message || '驗證失敗' }] }
        }
      } catch (error) {
        console.error('結帳驗證 API 網路錯誤:', error)
        // 只有在網路錯誤等真正的異常情況下才假設通過
        return { isValid: false, errors: [{ message: '無法連接到伺服器，請檢查網路連線' }] }
      }
    },
    
    async onDeliveryMethodChange() {
      console.log('🚚 配送方式已變更:', this.shippingInfo.deliveryMethod)
      // 當配送方式改變時，重新計算運費
      await this.updateShippingFee()
    },
    
    getPaymentMethodName(method) {
      const methodMap = {
        'credit': '信用卡付款',
        'transfer': '銀行轉帳',
        'cod': '貨到付款'
      }
      return methodMap[method] || method
    },
    
    getOrderStatusName(status) {
      const statusMap = {
        'pending': '處理中',
        'confirmed': '已確認',
        'shipped': '已出貨',
        'delivered': '已送達',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    },
    
    getPaymentStatusName(status) {
      const statusMap = {
        'pending': '待付款',
        'completed': '已付款',
        'failed': '付款失敗',
        'refunded': '已退款'
      }
      return statusMap[status] || status
    },
    
    goToOrderTracking() {
      this.$router.push('/member/purchase-list')
    },
    
    continueShopping() {
      this.$router.push('/products')
    },
    
    async goToPayment() {
      try {
        this.paymentProcessing = true
        
        console.log('💳 開始信用卡付款流程...')
        
        // 🔥 先建立訂單
        const orderResult = await this.createOrderFirst()
        
        if (!orderResult || !orderResult.orderId) {
          throw new Error('建立訂單失敗')
        }
        
        console.log('✅ 訂單建立成功，訂單ID:', orderResult.orderId)
        
        // 🔥 修正：使用環境變數中的 ngrok URL
        const ngrokUrl = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'
        const paymentUrl = `${ngrokUrl}/api/payments/ecpay-checkout/${orderResult.orderId}`
        
        console.log('🏦 跳轉到付款頁面:', paymentUrl)
        console.log('🌐 使用的 ngrok URL:', ngrokUrl)
        
        // 在當前頁面跳轉到付款
        window.location.href = paymentUrl
        
      } catch (error) {
        console.error('❌ 信用卡付款失敗:', error)
        this.$swal.fire({
          title: '付款失敗',
          text: error.message || '無法跳轉到付款頁面，請稍後再試',
          icon: 'error',
          confirmButtonText: '確定'
        })
      } finally {
        this.paymentProcessing = false
      }
    },
    
    // 🔥 新增：先建立訂單的方法
    async createOrderFirst() {
      try {
        const memberId = this.getCartMemberId()
        if (!memberId) {
          throw new Error('無法獲取會員資訊，請重新登入')
        }

        // 🔧 驗證必要的配送資訊
        if (!this.shippingInfo.recipientName?.trim()) {
          throw new Error('請填寫收件人姓名')
        }
        if (!this.shippingInfo.phone?.trim()) {
          throw new Error('請填寫聯絡電話')
        }
        if (!this.shippingInfo.city?.trim()) {
          throw new Error('請選擇配送城市')
        }
        if (!this.shippingInfo.district?.trim()) {
          throw new Error('請選擇配送區域')
        }
        if (!this.shippingInfo.address?.trim()) {
          throw new Error('請填寫詳細地址')
        }
        if (!this.shippingInfo.deliveryMethod?.trim()) {
          throw new Error('請選擇配送方式')
        }
        if (!this.selectedPaymentMethod?.trim()) {
          throw new Error('請選擇付款方式')
        }

        const checkoutData = {
          MemberId: memberId,
          RecipientName: this.shippingInfo.recipientName.trim(),
          PhoneNumber: this.shippingInfo.phone.trim(),
          City: this.shippingInfo.city.trim(),
          District: this.shippingInfo.district.trim(),
          AddressDetail: this.shippingInfo.address.trim(),
          DeliveryMethod: this.shippingInfo.deliveryMethod,
          PaymentMethod: this.selectedPaymentMethod
        }
        
        console.log('� 建立訂單資料:', checkoutData)
        
        const API_BASE = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'
        const response = await fetch(`${API_BASE}/api/Checkout/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(checkoutData)
        })
        
        console.log('📡 API 回應狀態:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API 錯誤回應:', errorText)
          
          try {
            const errorJson = JSON.parse(errorText)
            console.error('❌ 解析後的錯誤:', errorJson)
            throw new Error(errorJson.message || `建立訂單失敗: ${response.status}`)
          } catch (parseError) {
            console.error('❌ 無法解析錯誤回應:', parseError)
            throw new Error(`建立訂單失敗: ${response.status} - ${errorText}`)
          }
        }
        
        const result = await response.json()
        
        if (result.success) {
          return {
            orderId: result.data.orderId,
            orderNumber: result.data.orderNumber,
            totalAmount: result.data.totalAmount
          }
        } else {
          throw new Error(result.message || '建立訂單失敗')
        }
        
      } catch (error) {
        console.error('❌ 建立訂單失敗:', error)
        throw error
      }
    },
    
    // 生成付款用的商品名稱
    generateItemNameForPayment() {
      if (!this.cartItems || this.cartItems.length === 0) {
        return 'JADE時尚購物'
      }
      
      // 取前3個商品名稱，如果超過就加上 "等X件商品"
      const itemNames = this.cartItems.slice(0, 3).map(item => item.productName || '商品')
      
      if (this.cartItems.length > 3) {
        return `${itemNames.join('+')}等${this.cartItems.length}件商品`
      } else {
        return itemNames.join('+')
      }
    },
    
    // 取得完整的配送地址
    getFullShippingAddress() {
      const { city, district, address } = this.shippingInfo
      return `${city || ''}${district || ''}${address || ''}`
    },
    
    // 取得下一步按鈕文字
    getNextStepButtonText() {
      if (this.processing || this.paymentProcessing) {
        return this.paymentProcessing ? '跳轉付款中...' : '處理中...'
      }
      
      if (this.currentStep === 2) {
        // 步驟2根據付款方式顯示不同文字
        if (this.paymentInfo.method === 'credit') {
          return '💳 前往付款'
        } else {
          return '確認訂單'
        }
      }
      
      return '下一步'
    }
  },
  
  watch: {
    'shippingInfo.city'() {
      // 🔥 修復：只有在用戶手動選擇城市時才清空區域選擇
      // 避免在程式化設置地址時清空 district
      if (!this.isSettingAddress) {
        console.log('👤 用戶手動選擇城市，清空區域選擇')
        this.shippingInfo.district = ''
      } else {
        console.log('🤖 程式設置地址，保持區域選擇')
      }
    },
    
    'shippingInfo.deliveryMethod'() {
      // 當配送方式改變時，重新計算運費
      this.updateShippingFee()
      this.calculateOrderSummary()
    }
  },
  
  async mounted() {
    // 使用與 useCart 相同的登入檢查邏輯
    const token = localStorage.getItem('authToken') ||
                 localStorage.getItem('auth_token') ||
                 localStorage.getItem('token')
    const currentUser = localStorage.getItem('currentUser')
    const memberId = localStorage.getItem('memberId')
    
    // 與隊友的登入機制相容：只要有 memberId 就視為已登入
    const hasStandardAuth = !!(token && currentUser)
    const hasMemberAuth = !!(memberId && memberId !== 'null' && memberId !== '' && memberId !== 'undefined')
    const isLoggedIn = hasStandardAuth || hasMemberAuth || !!memberId
    
    console.log('CheckoutView: 登入狀態檢查', {
      isLoggedIn,
      memberId,
      token: !!token,
      currentUser: !!currentUser
    })
    
    if (!isLoggedIn) {
      this.$router.push('/login')
      return
    }
    
    // 載入結帳資料
    await this.loadCheckoutData()
  }
}
</script>

<style scoped>
.checkout-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* 載入狀態 */
.loading-container {
  text-align: center;
  padding: 3rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 步驟內容 */
.step-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.step-content h2 {
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.step-content h2 i {
  margin-right: 0.5rem;
  color: #667eea;
}

/* 步驟操作區域 */
.step-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-info {
  flex: 1;
  margin-left: 2rem;
}

.step-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-info i {
  color: #667eea;
}

/* 訂單摘要 */
.order-summary {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.items-list {
  max-height: 400px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #333;
}

.item-attributes {
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.item-pricing {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.9rem;
}

.quantity {
  color: #666;
}

.price {
  color: #333;
  font-weight: 500;
}

.subtotal {
  color: #667eea;
  font-weight: 600;
}

/* 賣家分組樣式 */
.vendor-group {
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.vendor-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vendor-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.vendor-indicator {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6c757d;
}

.vendor-item-count {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.vendor-items {
  padding: 1rem;
}

.vendor-items .cart-item {
  background: #fafbfc;
  border: 1px solid #f0f1f2;
  margin-bottom: 0.75rem;
}

.vendor-items .cart-item:last-child {
  margin-bottom: 0;
}

.vendor-items .cart-item .item-details h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

.vendor-subtotal {
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.subtotal-label {
  color: #666;
  font-size: 0.95rem;
}

.subtotal-amount {
  color: #28a745;
  font-size: 1.1rem;
  font-weight: 700;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-cart i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ccc;
}

.order-total {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
}

.total-row.discount {
  color: #28a745;
}

.coupon-code {
  color: #667eea;
  font-weight: 600;
  margin-left: 0.5rem;
}

.total-row.total {
  border-top: 2px solid #667eea;
  margin-top: 1rem;
  padding-top: 1rem;
  font-size: 1.2rem;
}

/* 地址管理樣式 */
.address-management {
  margin-bottom: 1.5rem;
}

.default-address-card {
  background: #f8f9fa;
  border: 2px solid #667eea;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.address-header h4 {
  margin: 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background: #ffc107;
  color: white;
}

.btn-edit:hover {
  background: #e0a800;
  transform: translateY(-1px);
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.address-info p {
  margin: 0.25rem 0;
  color: #333;
}

.other-addresses {
  margin: 1rem 0;
}

.btn-outline {
  background: transparent;
  border: 2px dashed #667eea;
  color: #667eea;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.form-actions .btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 2px solid #e9ecef;
  transition: all 0.3s;
}

.checkbox-option:hover {
  border-color: #667eea;
  background: #667eea10;
}

.checkbox-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
  cursor: pointer;
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.option-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
}

.option-desc {
  display: block;
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.85rem;
  margin-left: 2.25rem;
}

/* 其他地址 */
.other-addresses {
  margin: 1.5rem 0;
}

.other-addresses-title {
  color: #495057;
  margin-bottom: 1rem;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.other-addresses-title i {
  color: #667eea;
}

/* 地址選項 */
.address-options {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.address-option-card {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.address-option-card:hover {
  border-color: #667eea;
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.address-option-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea10, #764ba210);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.selection-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #667eea;
  font-size: 1.2rem;
}

/* 新增地址卡片 */
.add-address-card {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  text-align: center;
  margin-top: 1rem;
}

.add-address-card:hover {
  border-color: #667eea;
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.add-address-content h4 {
  margin: 1rem 0 0.5rem 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.add-address-content p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.add-address-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.add-address-icon i {
  padding: 1rem;
  border: 2px solid #667eea;
  border-radius: 50%;
  background: white;
}

.address-option {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.address-option:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.address-option.selected {
  border-color: #667eea;
  background: #667eea10;
}

.address-option input[type="radio"] {
  margin-right: 1rem;
}

.address-content {
  flex: 1;
}

.address-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.address-detail {
  color: #666;
  font-size: 0.9rem;
}

.new-address .address-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  font-weight: 600;
}

/* 表單元素 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.required {
  color: #dc3545;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.address-group {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 1rem;
}

/* 配送方式 */
.delivery-options {
  display: grid;
  gap: 1rem;
}

.radio-option {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.radio-option:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.radio-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.radio-option.disabled:hover {
  border-color: #e0e7ff;
  background-color: #f5f5f5;
}

.radio-option input[type="radio"]:checked + .option-content,
.radio-option input[type="radio"]:checked ~ .option-content {
  color: #667eea;
}

.radio-option input[type="radio"]:checked {
  accent-color: #667eea;
}

.option-content {
  flex: 1;
  margin-left: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-title {
  font-weight: 600;
}

.option-price {
  color: #667eea;
  font-weight: 600;
}

.option-desc {
  display: block;
  color: #666;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

/* 付款方式 */
.payment-methods {
  display: grid;
  gap: 1.5rem;
}

.payment-option {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.payment-option:hover {
  border-color: #667eea;
}

.payment-option .radio-option {
  border: none;
  border-radius: 0;
  margin: 0;
}

.payment-option .option-title i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.credit-form {
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.transfer-info {
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.bank-info-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
}

.bank-info-card h4 {
  margin-bottom: 1rem;
  color: #333;
}

.bank-details {
  margin-bottom: 1rem;
}

.bank-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0;
}

.bank-item .label {
  font-weight: 600;
  color: #666;
}

.bank-item .value {
  font-weight: 600;
  color: #333;
}

.transfer-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  font-size: 0.9rem;
  background: #667eea10;
  padding: 1rem;
  border-radius: 6px;
}

/* 結帳摘要 */
.checkout-summary {
  margin-top: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.checkout-summary h3 {
  margin-bottom: 1rem;
  color: #333;
}

.summary-content {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
}

.summary-row.total {
  border-top: 2px solid #667eea;
  margin-top: 1rem;
  padding-top: 1rem;
  font-size: 1.1rem;
}

/* 運費顯示樣式 */
.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.9em;
}

.free-shipping {
  color: #28a745;
  font-weight: 600;
  margin-left: 0.5rem;
}

/* 優惠券折扣樣式 */
.summary-row.discount {
  color: #28a745;
  font-weight: 500;
}

.summary-row.discount span:last-child {
  font-weight: 600;
}

/* 訂單確認 */
.order-confirmation {
  text-align: center;
  padding: 2rem;
}

.confirmation-icon {
  font-size: 4rem;
  color: #28a745;
  margin-bottom: 1rem;
}

.order-confirmation h2 {
  color: #28a745;
  margin-bottom: 1rem;
  border: none;
}

.order-number {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
}

.order-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
}

.order-details h3 {
  margin-bottom: 1rem;
  color: #333;
}

.confirmation-summary {
  text-align: left;
}

.status-badge {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.payment {
  background: #28a745;
}

.next-steps {
  margin: 2rem 0;
}

.next-steps .step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.next-steps .step-item i {
  color: #667eea;
  font-size: 1.2rem;
}

/* 操作按鈕 */
.checkout-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
}

.left-actions {
  flex: 0 0 auto;
}

.right-actions {
  flex: 0 0 auto;
  margin-left: auto;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

/* 錯誤訊息 */
.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .checkout-container {
    padding: 10px;
  }
  
  .order-summary {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .address-group {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .checkout-actions {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .cart-item {
    flex-direction: column;
    text-align: center;
  }
  
  .item-image {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .item-pricing {
    justify-content: center;
  }
}

/* 步驟指示器 */
.checkout-steps {
  margin-bottom: 40px;
}

.step-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.step-indicator::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e9ecef;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  background-color: white;
  padding: 0 10px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background-color: #007bff;
  color: white;
}

.step.completed .step-number {
  background-color: #28a745;
  color: white;
}

.step-label {
  font-size: 14px;
  color: #6c757d;
  text-align: center;
}

.step.active .step-label {
  color: #007bff;
  font-weight: bold;
}

.step.completed .step-label {
  color: #28a745;
}

/* 內容區域 */
.checkout-content {
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.step-content h2 {
  margin-bottom: 25px;
  color: #333;
}

/* 訂單摘要 */
.order-summary {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.order-items h3 {
  margin-bottom: 15px;
  color: #495057;
}

.item-placeholder,
.detail-placeholder {
  padding: 20px;
  background-color: #e9ecef;
  border-radius: 4px;
  text-align: center;
  color: #6c757d;
}

.order-total {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.total-row.total {
  font-weight: bold;
  font-size: 18px;
  color: #007bff;
  border-top: 1px solid #dee2e6;
  padding-top: 10px;
}

/* 表單樣式 */
.shipping-form,
.payment-methods {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.address-group {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.radio-option {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  cursor: pointer;
}

.radio-option input[type="radio"] {
  width: auto;
  margin-right: 10px;
}

.delivery-options,
.payment-methods {
  margin-top: 10px;
}

.payment-option {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.payment-option:last-child {
  border-bottom: none;
}

.credit-form,
.transfer-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.bank-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #e7f3ff;
  border-radius: 4px;
}

.bank-info p {
  margin: 5px 0;
}

/* 訂單確認樣式 */
.order-confirmation {
  text-align: center;
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

/* 訂單確認商品列表 */
.order-items-summary {
  margin: 25px 0;
  text-align: left;
}

.order-items-summary h4 {
  color: #495057;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
}

.confirmation-items-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  background: #f8f9fa;
}

.confirmation-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.confirmation-item:last-child {
  border-bottom: none;
}

.confirmation-item-image {
  width: 50px;
  height: 50px;
  margin-right: 15px;
  border-radius: 4px;
  overflow: hidden;
}

.confirmation-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.confirmation-item-details {
  flex: 1;
}

.confirmation-item-details h5 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 600;
  color: #212529;
}

.confirmation-item-attributes {
  margin: 0 0 5px 0;
  font-size: 12px;
  color: #6c757d;
}

.confirmation-item-pricing {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.confirmation-item-pricing .quantity {
  color: #6c757d;
}

.confirmation-item-pricing .price {
  font-weight: 600;
  color: #007bff;
}

.confirmation-icon {
  font-size: 60px;
  color: #28a745;
  margin-bottom: 20px;
}

.order-confirmation h3 {
  color: #28a745;
  margin-bottom: 15px;
}

.order-number {
  font-size: 18px;
  margin-bottom: 30px;
}

.order-details {
  margin: 30px 0;
  text-align: left;
}

.next-steps {
  margin: 20px 0;
}

.next-steps p {
  margin: 5px 0;
  color: #6c757d;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

/* 操作按鈕 */
.checkout-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .checkout-container {
    padding: 10px;
  }
  
  .step-indicator {
    flex-wrap: wrap;
  }
  
  .step {
    margin-bottom: 20px;
  }
  
  .step-indicator::before {
    display: none;
  }
  
  .address-group {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .checkout-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .left-actions,
  .right-actions {
    width: 100%;
    margin-left: 0;
  }
  
  .left-actions {
    order: 2;
  }
  
  .right-actions {
    order: 1;
  }
  
  .step-actions {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .step-info {
    margin-left: 0;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

/* 分隔線樣式 */
.section-divider {
  margin: 2rem 0;
  border: none;
  border-top: 2px solid #e9ecef;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  height: 2px;
}

/* 確認訂單區域 */
.order-confirmation-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.order-confirmation-section h3 {
  color: #495057;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

/* 付款方式區域 */
.payment-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.payment-section h3 {
  color: #495057;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

/* 訂單確認頁面樣式 */
.confirmation-summary .summary-row.total {
  border-top: 2px solid #28a745;
  padding-top: 1rem;
  margin-top: 1rem;
  font-size: 1.1rem;
}

.confirmation-summary .summary-row.discount {
  color: #28a745;
  font-weight: 500;
}

.confirmation-summary .summary-row.discount i {
  margin-right: 0.5rem;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  margin-right: 0.5rem;
}

.free-shipping {
  color: #28a745;
  font-weight: 600;
}

/* 付款按鈕樣式 */
.btn-payment {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-payment:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  color: white;
}

.btn-payment:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-payment .spinner-small {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}
</style>
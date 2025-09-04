<template>
<!-- 優惠券選擇彈窗 -->
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-dialog" @click.stop>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-ticket-alt me-2"></i>選擇優惠券
          </h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="loadingCoupons" class="text-center py-4">
            <i class="fas fa-spinner fa-spin fs-2 text-primary"></i>
            <p class="mt-2">載入優惠券中...</p>
          </div>
          
          <div v-else-if="userCoupons.length === 0" class="text-center py-4">
            <i class="fas fa-ticket-alt fs-2 text-muted"></i>
            <p class="mt-2 text-muted">您目前沒有可用的優惠券</p>
          </div>
          
          <div v-else class="coupon-list">
            <div 
              v-for="coupon in userCoupons" 
              :key="coupon.id || coupon.memberCouponId"
              class="coupon-item"
              :class="{
                'coupon-available': canUseCoupon(coupon),
                'coupon-disabled': !canUseCoupon(coupon),
                'coupon-selected': appliedCoupon?.id === coupon.id
              }"
              @click="handleSelectCoupon(coupon)"
            >
              <div class="coupon-info">
                <div class="coupon-header">
                  <span class="coupon-title">{{ coupon.title }}</span>
                  <span class="coupon-value">{{ formatCouponValue(coupon) }}</span>
                </div>
                <p class="coupon-description">{{ coupon.description }}</p>
                <div class="coupon-conditions">
                  <small class="text-muted">
                    <i class="fas fa-calendar-alt me-1"></i>
                    有效期至: {{ formatDate(coupon.expiryDate || coupon.expiredAt) }}
                  </small>
                  <small v-if="(coupon.minAmount || coupon.minSpend) > 0" class="text-muted ms-3">
                    <i class="fas fa-shopping-cart me-1"></i>
                    滿 NT${{ (coupon.minAmount || coupon.minSpend || 0).toLocaleString() }}
                  </small>
                </div>
              </div>
              
              <div class="coupon-status">
                <i v-if="appliedCoupon?.id === coupon.id" class="fas fa-check-circle text-success fs-4"></i>
                <i v-else-if="canUseCoupon(coupon)" class="fas fa-circle-plus text-primary fs-4"></i>
                <div v-else-if="coupon.status === 'used'" class="coupon-used-status">
                  <i class="fas fa-check-double text-muted fs-4"></i>
                  <small class="text-muted d-block">已使用</small>
                </div>
                <div v-else class="coupon-disabled-reason">
                  <i class="fas fa-ban text-muted fs-4"></i>
                  <small class="text-muted d-block">{{ getCouponDisabledReason(coupon) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="$emit('close')"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatCouponValue, formatDate } from '@/utils/cartUtils'

export default {
  name: 'CouponModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    userCoupons: {
      type: Array,
      required: true
    },
    loadingCoupons: {
      type: Boolean,
      default: false
    },
    appliedCoupon: {
      type: Object,
      default: null
    },
    canUseCoupon: {
      type: Function,
      required: true
    },
    getCouponDisabledReason: {
      type: Function,
      required: true
    }
  },
  emits: ['close', 'select-coupon'],
  methods: {
    formatCouponValue,
    formatDate,
    handleSelectCoupon(coupon) {
      // 防止選擇已使用或不可用的優惠券
      if (coupon.status === 'used' || !this.canUseCoupon(coupon)) {
        return
      }
      this.$emit('select-coupon', coupon)
    }
  }
}
</script>

<style scoped>
/* 優惠券彈窗樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-dialog {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
}

.modal-content {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
}

/* 優惠券列表樣式 */
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coupon-item {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.coupon-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.coupon-available {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.05);
}

.coupon-available:hover {
  border-color: #20c997;
  background: rgba(40, 167, 69, 0.1);
}

.coupon-disabled {
  border-color: #ced4da;
  background: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.6;
}

.coupon-used {
  border-color: #adb5bd;
  background: #e9ecef;
  cursor: not-allowed;
  opacity: 0.7;
}

.coupon-used .coupon-title {
  color: #6c757d !important;
  text-decoration: line-through;
}

.coupon-used .coupon-value {
  color: #6c757d !important;
}

.coupon-used .coupon-description {
  color: #6c757d !important;
}

.coupon-used:hover {
  box-shadow: none;
  border-color: #adb5bd;
  background: #e9ecef;
}

.coupon-selected {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.1);
}

.coupon-info {
  flex: 1;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.coupon-title {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.coupon-value {
  background: #28a745;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.coupon-description {
  color: #666;
  margin: 8px 0;
  font-size: 0.95rem;
}

.coupon-conditions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.coupon-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
}

.coupon-disabled-reason {
  text-align: center;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .modal-dialog {
    width: 95%;
    margin: 1rem;
  }

  .coupon-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .coupon-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .coupon-status {
    align-self: flex-end;
    margin-left: 0;
  }
}
</style>

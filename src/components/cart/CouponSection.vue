<template>
  <div class="mb-3">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <label class="form-label mb-0">優惠券</label>
      <button 
        class="btn btn-link btn-sm p-0" 
        @click="$emit('show-coupon-modal')"
        :disabled="userCoupons.length === 0"
      >
        <i class="fas fa-list"></i> 選擇優惠券
      </button>
    </div>
    
    <!-- 手動輸入優惠券代碼 -->
    <div class="input-group mb-2">
      <input 
        type="text" 
        class="form-control" 
        v-model="couponCode"
        placeholder="輸入優惠券代碼"
        @keyup.enter="handleApplyCoupon"
      >
      <button 
        class="btn btn-outline-secondary" 
        @click="handleApplyCoupon"
        :disabled="!couponCode.trim() || isApplyingCoupon"
      >
        <span v-if="isApplyingCoupon">
          <i class="fas fa-spinner fa-spin"></i>
        </span>
        <span v-else>套用</span>
      </button>
    </div>
    
    <!-- 已套用的優惠券 -->
    <div v-if="appliedCoupon" class="applied-coupon-card">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-bold text-success">
            <i class="fas fa-check-circle me-1"></i>
            {{ appliedCoupon.title }}
          </div>
          <small class="text-muted">{{ appliedCoupon.description }}</small>
        </div>
        <button 
          class="btn btn-sm btn-outline-danger" 
          @click="$emit('remove-coupon')"
          title="移除優惠券"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'CouponSection',
  props: {
    appliedCoupon: {
      type: Object,
      default: null
    },
    userCoupons: {
      type: Array,
      required: true
    },
    isApplyingCoupon: {
      type: Boolean,
      default: false
    }
  },
  emits: ['apply-coupon', 'remove-coupon', 'show-coupon-modal'],
  setup(props, { emit }) {
    const couponCode = ref('')

    const handleApplyCoupon = () => {
      if (couponCode.value.trim()) {
        emit('apply-coupon', couponCode.value)
        couponCode.value = ''
      }
    }

    return {
      couponCode,
      handleApplyCoupon
    }
  }
}
</script>

<style scoped>
/* 已套用優惠券卡片 */
.applied-coupon-card {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}
</style>

<template>
  <div>
    <!-- 優惠券新增/編輯 Modal -->
    <div class="modal fade" :class="{ show: isVisible }" :style="{ display: isVisible ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? '編輯優惠券' : '新增優惠券' }}
            </h5>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
              <div class="row">
                <!-- 基本資訊 -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">優惠券名稱 <span class="text-danger">*</span></label>
                    <input 
                      v-model="form.name" 
                      type="text" 
                      class="form-control" 
                      required
                      placeholder="例：新會員專享折扣"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">優惠券代碼 <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <input 
                        v-model="form.code" 
                        type="text" 
                        class="form-control" 
                        required
                        placeholder="例：NEWBIE20"
                        style="text-transform: uppercase;"
                      >
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary" 
                        @click="generateCode"
                      >
                        自動生成
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">描述</label>
                <textarea 
                  v-model="form.description" 
                  class="form-control" 
                  rows="2"
                  placeholder="描述這個優惠券的用途和特色"
                ></textarea>
              </div>
              
              <!-- 折扣設定 -->
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">折扣類型 <span class="text-danger">*</span></label>
                    <select v-model="form.type" class="form-select" required>
                      <option value="">請選擇</option>
                      <option value="percentage">百分比折扣</option>
                      <option value="fixed">固定金額</option>
                      <option value="shipping">免運費</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4" v-if="form.type !== 'shipping'">
                  <div class="mb-3">
                    <label class="form-label">
                      折扣{{ form.type === 'percentage' ? '百分比' : '金額' }}
                      <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <input 
                        v-model.number="form.discount" 
                        type="number" 
                        class="form-control" 
                        :min="form.type === 'percentage' ? 1 : 1"
                        :max="form.type === 'percentage' ? 100 : 99999"
                        required
                      >
                      <span class="input-group-text">
                        {{ form.type === 'percentage' ? '%' : 'NT$' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">最低消費金額</label>
                    <div class="input-group">
                      <input 
                        v-model.number="form.minAmount" 
                        type="number" 
                        class="form-control" 
                        min="0"
                        placeholder="0"
                      >
                      <span class="input-group-text">NT$</span>
                    </div>
                    <small class="form-text text-muted">設為 0 表示無限制</small>
                  </div>
                </div>
              </div>
              
              <!-- 使用限制 -->
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">使用開始日期 <span class="text-danger">*</span></label>
                    <input 
                      v-model="form.startDate" 
                      type="datetime-local" 
                      class="form-control" 
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">使用結束日期 <span class="text-danger">*</span></label>
                    <input 
                      v-model="form.endDate" 
                      type="datetime-local" 
                      class="form-control" 
                      required
                    >
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">使用次數限制</label>
                    <input 
                      v-model.number="form.maxUses" 
                      type="number" 
                      class="form-control" 
                      min="1"
                      placeholder="無限制"
                    >
                    <small class="form-text text-muted">留空表示無限制</small>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">每人使用限制</label>
                    <input 
                      v-model.number="form.maxUsesPerUser" 
                      type="number" 
                      class="form-control" 
                      min="1"
                      placeholder="無限制"
                    >
                    <small class="form-text text-muted">留空表示無限制</small>
                  </div>
                </div>
              </div>
              
              <!-- 狀態設定 -->
              <div class="mb-3">
                <div class="form-check">
                  <input 
                    v-model="form.isActive" 
                    class="form-check-input" 
                    type="checkbox" 
                    id="couponActive"
                  >
                  <label class="form-check-label" for="couponActive">
                    立即啟用此優惠券
                  </label>
                </div>
              </div>
              
              <!-- 預覽區 -->
              <div class="mt-4 p-3 bg-light rounded">
                <h6>優惠券預覽</h6>
                <div class="coupon-preview border rounded p-3 bg-white">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="mb-1">{{ form.name || '優惠券名稱' }}</h6>
                      <small class="text-muted">{{ form.description || '優惠券描述' }}</small>
                    </div>
                    <div class="text-end">
                      <div class="fw-bold text-primary">
                        <span v-if="form.type === 'percentage'">{{ form.discount || 0 }}% OFF</span>
                        <span v-else-if="form.type === 'fixed'">NT$ {{ form.discount || 0 }} OFF</span>
                        <span v-else-if="form.type === 'shipping'">免運費</span>
                        <span v-else>請選擇折扣類型</span>
                      </div>
                      <code class="small">{{ form.code || 'COUPON' }}</code>
                    </div>
                  </div>
                  <div class="mt-2 small text-muted">
                    <span v-if="form.minAmount">滿 NT$ {{ form.minAmount }} 可用</span>
                    <span v-if="form.startDate && form.endDate"> • 
                      {{ formatDate(form.startDate) }} 至 {{ formatDate(form.endDate) }}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              取消
            </button>
            <button type="button" class="btn btn-primary" @click="handleSave">
              {{ isEditing ? '更新' : '新增' }}優惠券
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal 背景遮罩 -->
    <div v-if="isVisible" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
export default {
  name: 'CouponModal',
  emits: ['close', 'save'],
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    coupon: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        name: '',
        code: '',
        description: '',
        type: '',
        discount: null,
        minAmount: null,
        startDate: '',
        endDate: '',
        maxUses: null,
        maxUsesPerUser: null,
        isActive: true
      }
    }
  },
  computed: {
    isEditing() {
      return !!this.coupon
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.resetForm()
        if (this.coupon) {
          Object.assign(this.form, this.coupon)
        }
      }
    }
  },
  methods: {
    resetForm() {
      this.form = {
        name: '',
        code: '',
        description: '',
        type: '',
        discount: null,
        minAmount: null,
        startDate: '',
        endDate: '',
        maxUses: null,
        maxUsesPerUser: null,
        isActive: true
      }
    },
    generateCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      this.form.code = result
    },
    validateForm() {
      if (!this.form.name.trim()) {
        alert('請輸入優惠券名稱')
        return false
      }
      if (!this.form.code.trim()) {
        alert('請輸入優惠券代碼')
        return false
      }
      
      if (!this.form.type) {
        alert('請選擇折扣類型')
        return false
      }
      if (this.form.type !== 'shipping' && (!this.form.discount || this.form.discount <= 0)) {
        alert('請輸入有效的折扣金額')
        return false
      }
      if (!this.form.startDate || !this.form.endDate) {
        alert('請設定使用期限')
        return false
      }
      if (new Date(this.form.startDate) >= new Date(this.form.endDate)) {
        alert('結束日期必須晚於開始日期')
        return false
      }
      return true
    },
    handleSave() {
      if (!this.validateForm()) {
        return
      }
      this.$emit('save', { ...this.form })
    },
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('zh-TW')
    }
  }
}
</script>

<style scoped>
.modal-dialog {
  max-width: 800px;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

code {
  background-color: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.875em;
}

.coupon-preview {
  min-height: 80px;
}

.text-primary {
  color: #0d6efd !important;
}
</style>

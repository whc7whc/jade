<template>
  <div class="card h-100 coupon-card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="card-title mb-0">{{ coupon.name }}</h6>
        <span class="badge" :class="statusBadgeClass">
          {{ statusText }}
        </span>
      </div>
      <p class="card-text text-muted small">{{ coupon.description }}</p>
      
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <span class="badge" :class="typeBadgeClass">
            {{ typeText }}
          </span>
        </div>
        <div class="text-end">
          <div class="fw-bold text-primary">
            <span v-if="coupon.type === 'percentage'">{{ coupon.discount }}% OFF</span>
            <span v-else-if="coupon.type === 'fixed'">NT$ {{ coupon.discount }} OFF</span>
            <span v-else-if="coupon.type === 'shipping'">免運費</span>
          </div>
          <code class="small">{{ coupon.code }}</code>
        </div>
      </div>

      <div class="small text-muted mb-3">
        <div v-if="coupon.minAmount">最低消費：NT$ {{ coupon.minAmount }}</div>
        <div>有效期限：{{ formatDate(coupon.startDate) }} 至 {{ formatDate(coupon.endDate) }}</div>
        <div v-if="coupon.maxUses">
          使用進度：{{ coupon.usedCount }} / {{ coupon.maxUses }} 
          ({{ usagePercentage }}%)
        </div>
      </div>

      <div class="d-flex gap-2">
        <button @click="$emit('edit', coupon)" class="btn btn-sm btn-outline-primary flex-fill">
          編輯
        </button>
        <button @click="$emit('toggle-status', coupon)" class="btn btn-sm" 
                :class="coupon.isActive ? 'btn-outline-warning' : 'btn-outline-success'">
          {{ coupon.isActive ? '停用' : '啟用' }}
        </button>
        <button @click="$emit('delete', coupon)" class="btn btn-sm btn-outline-danger">
          刪除
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CouponCard',
  emits: ['edit', 'toggle-status', 'delete'],
  props: {
    coupon: {
      type: Object,
      required: true
    }
  },
  computed: {
    statusBadgeClass() {
      if (!this.coupon.isActive) return 'bg-secondary';
      if (new Date(this.coupon.endDate) < new Date()) return 'bg-danger';
      if (this.coupon.maxUses && this.coupon.usedCount >= this.coupon.maxUses) return 'bg-warning';
      return 'bg-success';
    },
    statusText() {
      if (!this.coupon.isActive) return '已停用';
      if (new Date(this.coupon.endDate) < new Date()) return '已過期';
      if (this.coupon.maxUses && this.coupon.usedCount >= this.coupon.maxUses) return '已用完';
      return '啟用中';
    },
    typeBadgeClass() {
      const classes = {
        percentage: 'bg-primary',
        fixed: 'bg-info',
        shipping: 'bg-warning'
      };
      return classes[this.coupon.type] || 'bg-secondary';
    },
    typeText() {
      const types = {
        percentage: '百分比',
        fixed: '固定金額',
        shipping: '免運費'
      };
      return types[this.coupon.type] || this.coupon.type;
    },
    usagePercentage() {
      if (!this.coupon.maxUses) return 0;
      return Math.round((this.coupon.usedCount / this.coupon.maxUses) * 100);
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('zh-TW');
    }
  }
}
</script>

<style scoped>
.coupon-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.coupon-card:hover {
  transform: translateY(-2px);
}

.badge {
  font-size: 0.75em;
  font-weight: 500;
}

code {
  background-color: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.875em;
}

.btn:hover {
  transform: translateY(-1px);
}

.text-primary {
  color: #0d6efd !important;
}
</style>

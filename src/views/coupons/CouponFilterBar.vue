<template>
  <div class="card mb-4">
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-4">
          <input
            :value="searchTerm"
            @input="$emit('update:searchTerm', $event.target.value)"
            type="text"
            class="form-control"
            placeholder="搜尋優惠券名稱、代碼或描述..."
          >
        </div>
        <div class="col-md-3">
          <select 
            :value="statusFilter" 
            @change="$emit('update:statusFilter', $event.target.value)"
            class="form-select"
          >
            <option value="">所有狀態</option>
            <option value="active">啟用中</option>
            <option value="inactive">已停用</option>
            <option value="expired">已過期</option>
          </select>
        </div>
        <div class="col-md-3">
          <select 
            :value="typeFilter" 
            @change="$emit('update:typeFilter', $event.target.value)"
            class="form-select"
          >
            <option value="">所有類型</option>
            <option value="percentage">百分比折扣</option>
            <option value="fixed">固定金額</option>
            <option value="shipping">免運費</option>
          </select>
        </div>
        <div class="col-md-2">
          <button @click="$emit('reset')" class="btn btn-outline-secondary w-100">
            重設篩選
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CouponFilterBar',
  emits: ['update:searchTerm', 'update:statusFilter', 'update:typeFilter', 'reset'],
  props: {
    searchTerm: {
      type: String,
      default: ''
    },
    statusFilter: {
      type: String,
      default: ''
    },
    typeFilter: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}
</style>

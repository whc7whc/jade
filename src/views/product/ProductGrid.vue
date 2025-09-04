<template>
  <div v-if="products.length > 0" class="row g-3 mb-4">
    <!-- 新增商品按鈕 -->
    <div class="col-6 col-sm-4 col-md-3 col-lg-2">
      <div 
        class="card h-100 border-dashed border-2 border-secondary d-flex align-items-center justify-content-center cursor-pointer hover-border-dark"
        style="min-height: 200px; cursor: pointer;"
        @click="$emit('add-product')"
      >
        <div class="text-center">
          <svg class="text-muted mb-2" width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <div class="small text-muted">新增商品</div>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <ProductCard 
      v-for="product in products" 
      :key="product.id" 
      :product="product"
      @edit="$emit('edit-product', $event)"
  @delete="$emit('delete-product', $event)"
    />
  </div>
  
  <!-- 空狀態 -->
  <div v-else class="card border-0 shadow-sm">
    <div class="card-body">
      <div class="text-center text-muted py-5">
        <div class="mb-3">
          <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <h5>還沒有商品</h5>
        <p class="mb-3">開始新增您的第一個商品</p>
        <button class="btn btn-primary" @click="$emit('add-product')">
          立即新增商品
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ProductCard from './ProductCard.vue'

export default {
  name: 'ProductGrid',
  components: {
    ProductCard
  },
  props: {
    products: {
      type: Array,
      required: true
    }
  },
  emits: ['add-product', 'edit-product', 'delete-product']
}
</script>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* 新增商品卡片懸停效果 */
.hover-border-dark:hover {
  border-color: #6c757d !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>

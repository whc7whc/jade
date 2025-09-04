<template>
  <div class="col-6 col-sm-4 col-md-3 col-lg-2">
    <div class="card h-100 shadow-sm position-relative product-card">
      <div class="card-img-top ratio ratio-1x1 bg-light overflow-hidden position-relative">
        <img :src="product.image" :alt="product.name" class="w-100 h-100 object-fit-cover" />
      </div>
      
      <div class="card-body p-3">
        <h6 class="card-title text-truncate mb-2">{{ product.name }}</h6>
        <div class="small text-danger mb-1">NT$ {{ product.price }}</div>
        <div class="small text-muted text-decoration-line-through">原價 {{ product.originalPrice }}</div>
      </div>
      
      <div class="position-absolute top-0 end-0 p-2 edit-btn-container" style="opacity: 0; transition: opacity 0.3s;">
        <div class="btn-group-vertical" role="group">
          <button 
            @click="$emit('edit', product)"
            class="btn btn-sm btn-light shadow-sm"
            title="編輯商品"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button 
            @click="$emit('delete', product)"
            class="btn btn-sm btn-outline-danger shadow-sm mt-1"
            title="刪除商品"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h10"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'delete']
}
</script>

<style scoped>
.ratio-1x1 {
  aspect-ratio: 1 / 1;
}

.object-fit-cover {
  object-fit: cover;
}

/* 產品卡片懸停效果 */
.product-card:hover .edit-btn-container {
  opacity: 1 !important;
}

.product-card {
  transition: all 0.2s ease-in-out;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
</style>

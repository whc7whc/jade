<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <AppHeader />
    
    <main class="main-content">
      <router-view />
    </main>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'


export default {
  name: 'MainLayout',
  components: {
    AppHeader,
    AppFooter
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  margin-top: 90px; /* 為固定的導航列留出空間 */
}

/* 確保頁面內容不會被固定的 header 遮擋 */
@media (max-width: 768px) {
  .main-content {
    margin-top: 80px;
  }
}
</style>
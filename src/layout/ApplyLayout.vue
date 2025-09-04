<template>
  <div class="apply-layout">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'

export default {
  name: 'ApplyLayout',
  components: {
    AppHeader
  }
}
</script>

<style scoped>
.apply-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #efe8dd;
}

.main-content {
  flex: 1;
  padding: 10px 10px 0;
  padding-top: 150px; /* 根據 header 高度調整 */
  box-sizing: border-box;
}

/* 可選：響應式處理 */
@media (max-width: 768px) {
  .main-content {
    padding-top: 120px;
  }
}
</style>

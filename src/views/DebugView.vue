<template>
  <div class="debug-page">
    <div class="container">
      <h1>🔧 JADE 購物車調試頁面</h1>
      <p>此頁面用於調試購物車功能問題</p>
      
      <CartDebugComponent />
      
      <div class="external-links">
        <h3>🔗 外部調試工具</h3>
        <p>
          <a href="/debug-login.html" target="_blank">登入狀態檢查工具</a> | 
          <a href="/debug-cart.html" target="_blank">購物車 API 測試工具</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import CartDebugComponent from '@/components/debug/CartDebugComponent.vue'

export default {
  name: 'DebugPage',
  components: {
    CartDebugComponent
  }
}
</script>

<style scoped>
.debug-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.external-links {
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  text-align: center;
}

.external-links a {
  color: #007bff;
  text-decoration: none;
  margin: 0 10px;
}

.external-links a:hover {
  text-decoration: underline;
}
</style>

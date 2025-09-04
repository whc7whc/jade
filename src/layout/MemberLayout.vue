<template>
  <div class="member-layout">
    <div class="content-wrapper">
      <!-- 側邊欄 -->
      <div class="sidebar-container">
        <Sidebar />
      </div>

      <!-- 主內容 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/MemberSidebar.vue'

export default {
  name: 'MemberLayout',
  components: {
    Sidebar
  }
}
</script>

<style scoped>
.member-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.content-wrapper {
  display: flex;
  flex: 1;
}

.sidebar-container {
  width: 350px;
  background-color: #efe8dd;
}

.main-content {
  flex: 1;
  padding: 10px;
  padding-top: 60px;
  background-color: transparent;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .sidebar-container {
    width: 100%;
  }
}
</style>

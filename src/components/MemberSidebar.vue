<template>
  <div class="sidebar">
    <ul>
      <!-- 非點擊項目 -->
      <li class="menu-item non-clickable">
        <i class="fa fa-home icon"></i> 會員中心
      </li>

      <!-- 🔽 我的帳戶 Dropdown Header -->
      <li @click="toggleAccountDropdown" class="menu-item dropdown-header">
        <i class="fa fa-user icon"></i> 我的帳戶
        <i 
          class="fa arrow" 
          :class="accountDropdownOpen ? 'fa-chevron-up rotate' : 'fa-chevron-down rotate'"
        ></i>
      </li>

      <!-- ⬇️ 下拉選單：個人檔案 & 通知設定 -->
      <ul v-if="accountDropdownOpen" class="dropdown-list">
        <li>
          <router-link
            to="/member/basic-info"
            class="menu-item"
            :class="{ active: isActive('/member/basic-info') }"
            @click="accountDropdownOpen = false"
          >
            <i class="fa fa-id-card icon"></i> 個人檔案
          </router-link>
        </li>
        <li>
          <router-link
            to="/member/address"
            class="menu-item"
            :class="{ active: isActive('/member/address') }"
            @click="accountDropdownOpen = false"
          >
            <i class="fa fa-map-marker icon"></i> 我的地址
          </router-link>
        </li>
        <li v-if="!isGoogleLogin">
          <router-link
            to="/member/password-settings"
            class="menu-item"
            :class="{ active: isActive('/member/password-settings') }"
            @click="accountDropdownOpen = false"
          >
            <i class="fa fa-lock icon"></i> 更改密碼
          </router-link>
        </li>
      </ul>

      <!-- 其他選單項目 -->
      <li>
        <router-link
          to="/member/purchase-list"
          class="menu-item"
          :class="{ active: isActive('/member/purchase-list') }"
        >
          <i class="fa fa-shopping-cart icon"></i> 購買清單
        </router-link>
      </li>

      <li>
        <router-link
          to="/member/notification-overview"
          class="menu-item"
          :class="{ active: isActive('/member/notification-overview') }"
        >
          <i class="fa fa-bell icon"></i> 通知總覽
        </router-link>
      </li>

      <li>
        <router-link
          to="/member/level"
          class="menu-item"
          :class="{ active: isActive('/member/level') }"
        >
          <i class="fa fa-star icon"></i> 會員等級
        </router-link>
      </li>

      <li>
        <router-link
          to="/member/j-coins"
          class="menu-item"
          :class="{ active: isActive('/member/j-coins') }"
        >
          <i class="fa fa-coins icon"></i> 我的J幣
        </router-link>
      </li>

      <li>
        <router-link
          to="/member/coupons"
          class="menu-item"
          :class="{ active: isActive('/member/coupons') }"
        >
          <i class="fa fa-ticket icon"></i> 我的優惠券
        </router-link>
      </li>

      <li>
        <router-link
          to="/member/posts"
          class="menu-item"
          :class="{ active: isActive('/member/posts') }"
        >
          <i class="fa fa-file-lines icon"></i> 我的貼文
        </router-link>
      </li>

      <li>
        <router-link
          to="/member/transaction-refund"
          class="menu-item"
          :class="{ active: isActive('/member/transaction-refund') }"
        >
          <i class="fa fa-credit-card icon"></i> 交易支付及退款查詢
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const isGoogleLogin = ref(false)
try {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  if (currentUser && currentUser.loginType === 'google') {
    isGoogleLogin.value = true
  }
} catch(e) { /* ignore */ }

const accountDropdownOpen = ref(false)
const route = useRoute()

function toggleAccountDropdown() {
  accountDropdownOpen.value = !accountDropdownOpen.value
}

// 判斷當前路由是否 active（可精準匹配或用 startsWith）
function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
.sidebar {
  font-size: 16px;
  width: 350px;
  background-color: #efe8dd;
  height: 100vh;
  padding: 60px 40px 20px;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  cursor: pointer;
  padding: 10px 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
  font-size: inherit;
  font-family: inherit;
  color: #333;
  text-decoration: none;
}

.menu-item:hover,
.menu-item.active {
  background-color: #444;
  color: white;
}

.non-clickable {
  cursor: default;
  color: #666;
  background-color: transparent;
  pointer-events: none;
}

.dropdown-header {
  font-weight: bold;
  justify-content: space-between;
}

.dropdown-list {
  margin-top: 10px;
  padding-left: 20px;
  font-size: inherit;
  font-family: inherit;
}

.icon {
  margin-right: 8px;
  width: 20px;
  text-align: center;
}

.arrow {
  margin-left: auto;
}

.rotate {
  transition: transform 0.3s ease;
}
</style>
<!-- src/components/layout/SearchModal.vue -->
<template>
  <Teleport to="body">
    <div 
      v-show="show" 
      class="search-modal"
      @click="closeModal"
    >
      <div class="search-content" @click.stop>
        <button type="button" class="btn-close" @click="closeModal">
          <svg width="24" height="24">
            <use xlink:href="#close"></use>
          </svg>
        </button>
        
        <div class="d-flex justify-content-center align-items-center h-100">
          <div class="w-50">
            <form @submit="handleSearch">
              <div class="input-group input-group-lg">
                <input 
                  ref="searchInput"
                  v-model="searchTerm" 
                  type="text" 
                  class="form-control" 
                  placeholder="搜尋商品..." 
                  autocomplete="off"
                  style="border-color: #eb5757;"
                >
                <button class="btn" type="submit" style="background-color: #eb5757; color: white;">搜尋</button>
              </div>
            </form>
            
            <!-- 搜尋建議（可選） -->
            <div v-if="searchSuggestions.length > 0" class="search-suggestions mt-3">
              <h6 class="mb-2" style="color: #4a4a4a;">熱門搜尋</h6>
              <div class="d-flex flex-wrap gap-2">
                <button 
                  v-for="suggestion in searchSuggestions" 
                  :key="suggestion"
                  @click="searchTerm = suggestion; handleSearch()"
                  class="btn btn-outline-dark btn-sm"
                  style="border-color: #eb5757; color: #4a4a4a;"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SearchModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:show'],
  setup(props, { emit }) {
    const router = useRouter()
    const searchInput = ref(null)
    const searchTerm = ref('')
    
    // 搜尋建議
    const searchSuggestions = ref([
      '連身洋裝', '牛仔褲', '外套', '運動鞋', '手提包'
    ])

    const closeModal = () => {
      emit('update:show', false)
      searchTerm.value = ''
    }

    const handleSearch = (event) => {
      if (event) event.preventDefault()
      
      const term = searchTerm.value.trim()
      if (!term) {
        if (searchInput.value) {
          searchInput.value.focus()
        }
        return
      }
      
      console.log('🔍 SearchModal 搜尋:', term)
      
      // 導航到商品列表頁面並帶上搜尋參數
      router.push({
        path: '/products',
        query: { q: term }
      })
      
      closeModal()
    }

    // 監聽 show 變化，自動聚焦輸入框
    watch(() => props.show, (newVal) => {
      if (newVal) {
        nextTick(() => {
          if (searchInput.value) {
            searchInput.value.focus()
          }
        })
      }
    })

    // ESC 鍵關閉
    const handleKeydown = (event) => {
      if (event.key === 'Escape' && props.show) {
        closeModal()
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
    })
    
    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
    })

    return {
      searchInput,
      searchTerm,
      searchSuggestions,
      closeModal,
      handleSearch
    }
  }
}
</script>

<style scoped>
.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  z-index: 1055;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-content {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 800px;
}

.btn-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: #4a4a4a;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1;
  padding: 10px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.btn-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.btn-close svg {
  width: 24px;
  height: 24px;
}

.search-suggestions {
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .search-content .w-50 {
    width: 90% !important;
  }
  
  .btn-close {
    top: 15px;
    right: 15px;
  }
}
</style>
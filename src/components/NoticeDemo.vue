<template>
  <div class="notice-demo-page">
    <div class="container">
      <h2 class="page-title">官方通知展示</h2>
      
      <!-- 控制面板 -->
      <div class="control-panel">
        <div class="form-group">
          <label>主題樣式：</label>
          <select v-model="selectedTheme" class="form-select">
            <option value="">預設</option>
            <option value="dark-theme">深色主題</option>
            <option value="success-theme">成功主題</option>
            <option value="warning-theme">警告主題</option>
            <option value="error-theme">錯誤主題</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>優先級：</label>
          <select v-model="currentNotice.priority" class="form-select">
            <option value="high">緊急</option>
            <option value="medium">重要</option>
            <option value="normal">一般</option>
            <option value="low">提醒</option>
          </select>
        </div>
        
        <button @click="refreshNotifications" class="btn-refresh" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          {{ loading ? '載入中...' : '重新整理' }}
        </button>
        
        <button @click="addNewNotice" class="btn-add" :disabled="loading">
          <i class="fas fa-plus"></i>
          新增通知
        </button>
      </div>

      <!-- 載入狀態 - 參考 BlogPostView -->
      <div v-if="loading && notices.length === 0" class="loading-state">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">載入中...</span>
          </div>
          <p class="mt-3">載入通知資料中...</p>
        </div>
      </div>

      <!-- 錯誤狀態 - 參考 BlogPostView -->
      <div v-else-if="error && notices.length === 0" class="error-state">
        <div class="alert alert-danger text-center">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
          </div>
          <h4>載入失敗</h4>
          <p>{{ error }}</p>
          <div class="d-flex gap-2 justify-content-center">
            <button @click="refreshNotifications" class="btn btn-primary">
              <i class="fas fa-redo"></i>
              重新載入
            </button>
          </div>
        </div>
      </div>

      <!-- 通知列表 -->
      <div v-if="!loading || notices.length > 0" class="notices-list">
        <OfficialNotice 
          v-for="notice in notices" 
          :key="notice.id"
          :notice="notice"
          :acknowledged="notice.acknowledged"
          :class="selectedTheme"
          @acknowledge="handleAcknowledge"
        />
      </div>
      
      <!-- 如果沒有通知 -->
      <div v-if="!loading && !error && notices.length === 0" class="no-notices">
        <i class="fas fa-bell-slash"></i>
        <p>目前沒有官方通知</p>
        <button @click="refreshNotifications" class="btn-reload">
          <i class="fas fa-sync-alt"></i>
          重新載入
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import OfficialNotice from './OfficialNotice.vue'

export default {
  name: 'NoticeDemo',
  components: {
    OfficialNotice
  },
  data() {
    return {
      selectedTheme: '',
      currentNotice: {
        priority: 'normal'
      },
      notices: [],
      loading: false,
      error: null
    }
  },
  mounted() {
    this.loadNotifications();
  },
  methods: {
    // 載入通知資料 - 優先使用 API，完全失敗才使用備用資料
    async loadNotifications() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('📡 開始載入通知資料...');
        
        // 使用全域 API 載入通知
        const result = await this.$api.getNotifications();
        
        if (result.success && Array.isArray(result.data)) {
          // 處理 API 回傳的資料
          this.notices = this.processNotificationData(result.data);
          console.log('✅ 通知資料載入成功:', this.notices);
          
          // 如果成功載入，顯示成功訊息
          if (this.notices.length > 0) {
            this.showToast(`成功載入 ${this.notices.length} 則通知`, 'success');
          } else {
            this.showToast('目前沒有通知資料', 'info');
          }
        } else {
          throw new Error(result.error || `API 錯誤 (HTTP ${result.status})`);
        }
      } catch (error) {
        console.error('❌ 載入通知失敗:', error);
        this.error = `API 載入失敗: ${error.message}`;
        
        // 顯示錯誤提示，但不自動載入備用資料
        this.showToast('無法連線到後端 API，請確認伺服器運行狀態', 'error');
        
        // 如果是網路錯誤或後端服務器未啟動，提供明確的錯誤訊息
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          this.error = `無法連接到後端 API 伺服器 (${process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'})。請確認後端服務已啟動並且可存取。`;
        }
      } finally {
        this.loading = false;
      }
    },

    // 處理從 API 回傳的通知資料 - 支援多種後端格式
    processNotificationData(apiData) {
      if (!Array.isArray(apiData)) {
        console.warn('API 回傳的資料格式不正確，期望陣列格式');
        return [];
      }

      return apiData.map(notification => {
        // 處理可能的嵌套結構或不同命名
        const data = notification.data || notification;
        
        return {
          id: data.id || data.notificationId || data.ID,
          title: data.title || data.notificationTitle || data.subject || '無標題',
          content: data.content || data.message || data.body || data.description || '無內容',
          date: this.parseDate(
            data.createdDate || 
            data.createDate || 
            data.created_at || 
            data.timestamp || 
            data.dateCreated
          ),
          priority: this.mapPriority(
            data.priority || 
            data.importance || 
            data.level || 
            data.urgency
          ),
          publisher: data.publisher || 
                    data.author || 
                    data.createdBy || 
                    data.department || 
                    data.source || 
                    '系統管理員',
          acknowledged: data.acknowledged || 
                       data.isRead || 
                       data.read || 
                       data.isAcknowledged || 
                       false,
          category: data.category || 
                   data.type || 
                   data.notificationType || 
                   'general'
        };
      });
    },

    // 解析日期 - 支援多種格式
    parseDate(dateValue) {
      if (!dateValue) return new Date();
      
      // 如果已經是 Date 物件
      if (dateValue instanceof Date) return dateValue;
      
      // 嘗試解析各種日期格式
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    },

    // 映射優先級
    mapPriority(apiPriority) {
      const priorityMap = {
        '1': 'high',
        '2': 'medium', 
        '3': 'normal',
        '4': 'low',
        'urgent': 'high',
        'important': 'medium',
        'normal': 'normal',
        'info': 'low',
        'high': 'high',
        'medium': 'medium',
        'low': 'low'
      };
      
      return priorityMap[String(apiPriority).toLowerCase()] || 'normal';
    },

    // 確認通知
    async handleAcknowledge(noticeId) {
      const notice = this.notices.find(n => n.id === noticeId);
      if (!notice) return;

      try {
        // 先更新 UI
        notice.acknowledged = true;
        
        // 呼叫 API 更新確認狀態
        const result = await this.$api.acknowledgeNotification(noticeId);

        if (result.success) {
          console.log('✅ 通知確認狀態更新成功');
          this.showToast('已確認通知', 'success');
        } else {
          // 如果 API 更新失敗，回復 UI 狀態
          notice.acknowledged = false;
          throw new Error(result.error || '更新確認狀態失敗');
        }
      } catch (error) {
        console.error('❌ 更新通知確認狀態失敗:', error);
        notice.acknowledged = false; // 回復狀態
        this.handleApiError(error);
      }
    },

    // 重新整理通知
    async refreshNotifications() {
      console.log('🔄 重新整理通知資料...');
      await this.loadNotifications();
    },

    // 顯示提示訊息 - 參考 BlogPostView 的提示方式
    showToast(message, type = 'info') {
      console.log(`[${type.toUpperCase()}] ${message}`);
      
      // 創建更友好的提示
      const toastTypes = {
        success: { class: 'alert-success', icon: 'fas fa-check-circle' },
        error: { class: 'alert-danger', icon: 'fas fa-times-circle' },
        warning: { class: 'alert-warning', icon: 'fas fa-exclamation-triangle' },
        info: { class: 'alert-info', icon: 'fas fa-info-circle' }
      };
      
      const toastConfig = toastTypes[type] || toastTypes.info;
      
      // 簡單的頁面頂部通知實現
      const existingToast = document.querySelector('.global-toast');
      if (existingToast) {
        existingToast.remove();
      }
      
      const toast = document.createElement('div');
      toast.className = `alert ${toastConfig.class} global-toast position-fixed top-0 start-50 translate-middle-x mt-3`;
      toast.style.zIndex = '9999';
      toast.style.minWidth = '300px';
      toast.innerHTML = `
        <i class="${toastConfig.icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close ms-2" onclick="this.parentElement.remove()"></button>
      `;
      
      document.body.appendChild(toast);
      
      // 3秒後自動移除
      setTimeout(() => {
        if (toast && toast.parentNode) {
          toast.remove();
        }
      }, 3000);
    },

    // 處理 API 錯誤
    handleApiError(error) {
      console.error('API 錯誤:', error);
      this.showToast('連接發生錯誤，請稍後再試', 'error');
    },

    // 重新整理通知
    refreshNotifications() {
      console.log('🔄 手動重新整理通知...');
      this.loadNotifications();
    },

    // 新增通知（保留此功能用於測試）
    async addNewNotice() {
      const newNotice = {
        title: this.currentNotice.title || '新通知',
        content: this.currentNotice.content || '<p>通知內容</p>',
        priority: this.currentNotice.priority,
        publisher: this.currentNotice.publisher || '系統管理員'
      };

      try {
        const result = await this.$api.createNotification(newNotice);
        
        if (result.success) {
          console.log('✅ 新通知建立成功');
          this.showToast('通知建立成功', 'success');
          // 重新載入通知列表
          await this.loadNotifications();
        } else {
          throw new Error(result.error || '建立通知失敗');
        }
      } catch (error) {
        console.error('❌ 建立通知失敗:', error);
        this.handleApiError(error);
      }
    }
  }
}
</script>

<style scoped>
.notice-demo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 40px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-panel {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.form-select {
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-add {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  height: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-refresh {
  background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  height: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 184, 148, 0.3);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.notices-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.no-notices {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.no-notices i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-notices p {
  font-size: 18px;
  margin: 0 0 20px 0;
}

.btn-reload {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-reload:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.loading-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  color: #667eea;
}

.loading-state .spinner-border {
  width: 3rem;
  height: 3rem;
}

.loading-state p {
  font-size: 18px;
  margin: 0;
  font-weight: 500;
  color: #6c757d;
}

.error-state {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  padding: 60px 20px;
}

.error-state .alert {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(220, 53, 69, 0.2);
}

.error-state i {
  color: #dc3545;
}

.error-state h4 {
  color: #dc3545;
  font-weight: 600;
}

.error-state p {
  color: #6c757d;
  margin-bottom: 20px;
}

.error-state .btn {
  border-radius: 8px;
  font-weight: 500;
}

/* 全域提示樣式 */
.global-toast {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
  border-radius: 10px;
}

.global-toast .btn-close {
  background: none;
  border: none;
  opacity: 0.7;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-group {
    min-width: auto;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .loading-state, .error-state, .no-notices {
    padding: 40px 15px;
  }
  
  .loading-spinner i, .error-icon i, .no-notices i {
    font-size: 48px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }
  
  .control-panel {
    padding: 20px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .loading-state, .error-state, .no-notices {
    padding: 30px 15px;
  }
  
  .loading-state p, .error-state h3, .no-notices p {
    font-size: 16px;
  }
  
  .error-state p {
    font-size: 14px;
  }
}
</style>

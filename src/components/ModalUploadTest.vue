<template>
  <div class="modal-upload-test p-4 border rounded">
    <h5>📷 Modal 中的圖片上傳測試</h5>
    
    <div class="row">
      <div class="col-md-6">
        <h6>測試 1: 基本上傳</h6>
        <ImageUploader
          upload-type="product"
          upload-text="測試上傳"
          upload-hint="2MB 以下"
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
        />
        
        <div v-if="uploadResult" class="mt-3">
          <div v-if="uploadResult.success" class="alert alert-success">
            ✅ 上傳成功！
            <br><strong>URL:</strong> {{ uploadResult.url }}
            <br><strong>檔名:</strong> {{ uploadResult.filename }}
          </div>
          <div v-else class="alert alert-danger">
            ❌ 上傳失敗：{{ uploadResult.error }}
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <h6>測試 2: 使用全域方法</h6>
        <input type="file" accept="image/*" @change="testGlobalUpload" class="form-control">
        <button v-if="selectedFile" class="btn btn-primary mt-2" @click="uploadViaGlobal" :disabled="uploading">
          {{ uploading ? '上傳中...' : '使用全域方法上傳' }}
        </button>
        
        <div v-if="globalResult" class="mt-3">
          <div v-if="globalResult.success" class="alert alert-success">
            ✅ 全域方法上傳成功！
            <br><strong>URL:</strong> {{ globalResult.data.url }}
          </div>
          <div v-else class="alert alert-danger">
            ❌ 全域方法上傳失敗：{{ globalResult.error }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 詳細日誌 -->
    <div class="mt-4">
      <h6>📋 執行日誌</h6>
      <div class="log-container bg-dark text-light p-3 rounded" style="height: 200px; overflow-y: auto;">
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          <small class="text-muted">{{ log.time }}</small>
          <span :class="log.level === 'error' ? 'text-danger' : log.level === 'success' ? 'text-success' : 'text-info'">
            {{ log.message }}
          </span>
        </div>
      </div>
      <button class="btn btn-sm btn-secondary mt-2" @click="clearLogs">清除日誌</button>
    </div>
  </div>
</template>

<script>
import ImageUploader from '@/components/ImageUploader.vue'

export default {
  name: 'ModalUploadTest',
  components: {
    ImageUploader
  },
  data() {
    return {
      uploadResult: null,
      selectedFile: null,
      uploading: false,
      globalResult: null,
      logs: []
    }
  },
  methods: {
    addLog(level, message) {
      this.logs.push({
        time: new Date().toLocaleTimeString(),
        level,
        message
      })
      
      // 自動滾動到底部
      this.$nextTick(() => {
        const logContainer = this.$el.querySelector('.log-container')
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight
        }
      })
    },

    handleUploadSuccess(data) {
      this.addLog('success', `ImageUploader 上傳成功: ${data.url}`)
      this.uploadResult = {
        success: true,
        url: data.url,
        filename: data.filename
      }
      console.log('Modal Test: 收到上傳成功事件', data)
    },

    handleUploadError(error) {
      this.addLog('error', `ImageUploader 上傳失敗: ${error.message || error}`)
      this.uploadResult = {
        success: false,
        error: error.message || error
      }
      console.error('Modal Test: 收到上傳錯誤事件', error)
    },

    testGlobalUpload(event) {
      this.selectedFile = event.target.files[0]
      this.globalResult = null
      this.addLog('info', `選擇檔案: ${this.selectedFile?.name}`)
    },

    async uploadViaGlobal() {
      if (!this.selectedFile) return

      this.uploading = true
      this.addLog('info', '開始使用全域方法上傳...')

      try {
        // 檢查全域方法是否存在
        if (!this.$uploadFile) {
          throw new Error('全域上傳方法 $uploadFile 不存在')
        }

        const result = await this.$uploadFile(this.selectedFile, 'product')
        
        this.addLog('success', `全域方法上傳成功: ${result.data.url}`)
        this.globalResult = result
        
      } catch (error) {
        this.addLog('error', `全域方法上傳失敗: ${error.message}`)
        this.globalResult = {
          success: false,
          error: error.message
        }
      }

      this.uploading = false
    },

    clearLogs() {
      this.logs = []
    }
  },

  mounted() {
    this.addLog('info', 'Modal 上傳測試組件已載入')
    
    // 檢查全域方法
    if (this.$uploadFile) {
      this.addLog('success', '全域上傳方法 $uploadFile 可用')
    } else {
      this.addLog('error', '全域上傳方法 $uploadFile 不可用')
    }
  }
}
</script>

<style scoped>
.log-container {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
}

.log-entry {
  display: block;
  margin-bottom: 2px;
}
</style>

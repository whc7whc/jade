<template>
  <div class="diagnostic-panel p-4 border rounded">
    <h4>🔍 Cloudinary 深度診斷工具</h4>
    
    <!-- 配置檢查 -->
    <div class="mb-4">
      <h5>1. 當前配置</h5>
      <table class="table table-sm">
        <tr>
          <td>雲端名稱</td>
          <td><code>{{ cloudName }}</code></td>
        </tr>
        <tr>
          <td>Upload Preset</td>
          <td><code>{{ uploadPreset }}</code></td>
        </tr>
        <tr>
          <td>API 端點</td>
          <td><code>{{ uploadUrl }}</code></td>
        </tr>
      </table>
    </div>

    <!-- Preset 驗證 -->
    <div class="mb-4">
      <h5>2. Upload Preset 詳細驗證</h5>
      <button class="btn btn-primary" @click="testPresetDetailed" :disabled="testing">
        {{ testing ? '檢測中...' : '詳細檢測 Upload Preset' }}
      </button>
      
      <div v-if="detailedResult" class="mt-3">
        <div class="card">
          <div class="card-header">
            <strong>檢測結果</strong>
          </div>
          <div class="card-body">
            <p><strong>HTTP 狀態:</strong> {{ detailedResult.status }}</p>
            <p><strong>回應內容:</strong></p>
            <pre class="bg-light p-2">{{ detailedResult.response }}</pre>
            
            <div v-if="detailedResult.status === 401" class="alert alert-warning">
              <h6>❌ 401 錯誤分析：</h6>
              <ul>
                <li v-if="detailedResult.response.includes('Invalid upload preset')">
                  Upload Preset "jade-products" 不存在或名稱錯誤
                </li>
                <li v-else-if="detailedResult.response.includes('Must use signed upload')">
                  Upload Preset 設定為 "Signed" 模式，需要改為 "Unsigned"
                </li>
                <li v-else>
                  其他認證問題：{{ detailedResult.response }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 手動驗證步驟 -->
    <div class="mb-4">
      <h5>3. 手動驗證步驟</h5>
      <div class="card">
        <div class="card-body">
          <h6>請按以下步驟檢查 Cloudinary 設定：</h6>
          <ol>
            <li class="mb-2">
              <strong>確認 Upload Preset 存在：</strong>
              <br>前往 <a href="https://console.cloudinary.com/settings/upload" target="_blank">Cloudinary Upload Settings</a>
              <br>檢查是否有名為 <code>jade-products</code> 的 preset
            </li>
            
            <li class="mb-2">
              <strong>檢查 Signing Mode：</strong>
              <br>點擊 <code>jade-products</code> preset
              <br>確認 "Signing Mode" 設為 <strong>"Unsigned"</strong>
              <div class="alert alert-info mt-2">
                ⚠️ 如果設為 "Signed"，前端無法直接上傳，會出現 401 錯誤
              </div>
            </li>
            
            <li class="mb-2">
              <strong>檢查 Cloud Name：</strong>
              <br>在 Cloudinary Console 右上角確認 Cloud Name 是否為 <code>jadetainan</code>
            </li>
            
            <li class="mb-2">
              <strong>檢查網域限制：</strong>
              <br>前往 Settings → Security → Allowed request domains
              <br>確認沒有限制或已加入 <code>localhost</code>
            </li>
          </ol>
        </div>
      </div>
    </div>

    <!-- cURL 測試指令 -->
    <div class="mb-4">
      <h5>4. 命令列測試</h5>
      <p>您可以在終端機執行以下指令來測試 Upload Preset：</p>
      <div class="bg-dark text-light p-3 rounded">
        <code>
curl -X POST \<br>
  "https://api.cloudinary.com/v1_1/jadetainan/image/upload" \<br>
  -F "upload_preset=jade-products" \<br>
  -F "file=@任何圖片檔案.jpg"
        </code>
      </div>
      <small class="text-muted">如果成功，會回傳 JSON 格式的圖片資訊；如果失敗，會顯示錯誤訊息</small>
    </div>

    <!-- 替代方案測試 -->
    <div class="mb-4">
      <h5>5. 建立新的 Upload Preset</h5>
      <p>如果問題持續存在，請嘗試建立一個新的 Upload Preset：</p>
      <ol>
        <li>前往 <a href="https://console.cloudinary.com/settings/upload" target="_blank">Cloudinary Upload Settings</a></li>
        <li>點擊 "Add upload preset"</li>
        <li>使用以下設定：</li>
      </ol>
      <div class="bg-light p-3 rounded">
        <strong>新 Preset 設定：</strong><br>
        Preset name: <code>jade-products-v2</code><br>
        Signing mode: <strong>Unsigned</strong> ⭐<br>
        Folder: <code>products</code> (可選)<br>
        Resource type: <code>Auto</code><br>
        Access mode: <code>Public</code>
      </div>
      
      <div class="mt-3">
        <label>測試新的 Preset 名稱：</label>
        <input v-model="alternativePreset" class="form-control" placeholder="jade-products-v2">
        <button class="btn btn-secondary mt-2" @click="testAlternativePreset" :disabled="testing">
          測試替代 Preset
        </button>
      </div>
    </div>

    <!-- 即時圖片上傳測試 -->
    <div class="mb-4">
      <h5>6. 即時圖片上傳測試</h5>
      <input type="file" accept="image/*" @change="handleFileSelect" class="form-control">
      <button v-if="selectedFile" class="btn btn-success mt-2" @click="testRealUpload" :disabled="uploading">
        {{ uploading ? '上傳中...' : '測試實際上傳' }}
      </button>
      
      <div v-if="uploadResult" class="mt-3">
        <div v-if="uploadResult.success" class="alert alert-success">
          ✅ 上傳成功！
          <br><strong>URL:</strong> <a :href="uploadResult.url" target="_blank">查看圖片</a>
          <br><img :src="uploadResult.url" alt="上傳成功" style="max-width: 300px; margin-top: 10px;">
        </div>
        <div v-else class="alert alert-danger">
          ❌ 上傳失敗
          <br><strong>狀態碼:</strong> {{ uploadResult.status }}
          <br><strong>錯誤詳情:</strong> {{ uploadResult.error }}
          
          <div class="mt-2">
            <h6>🔧 根據錯誤提供解決方案：</h6>
            <div v-if="uploadResult.status === 401">
              <p><strong>401 錯誤解決方案：</strong></p>
              <ul>
                <li>確認 Upload Preset 名稱正確: <code>jade-products</code></li>
                <li>確認 Signing Mode 設為 <strong>Unsigned</strong></li>
                <li>檢查 Cloud Name 是否正確: <code>jadetainan</code></li>
              </ul>
            </div>
            <div v-else-if="uploadResult.status === 400">
              <p><strong>400 錯誤解決方案：</strong></p>
              <ul>
                <li>檢查檔案格式是否支援</li>
                <li>檢查檔案大小是否超過限制</li>
                <li>檢查 Upload Preset 設定</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CloudinaryDiagnostic',
  data() {
    return {
      cloudName: process.env.VUE_APP_CLOUDINARY_CLOUD_NAME || 'jadetainan',
      uploadPreset: process.env.VUE_APP_CLOUDINARY_UPLOAD_PRESET || 'jade-products',
      testing: false,
      detailedResult: null,
      alternativePreset: 'jade-products-v2',
      selectedFile: null,
      uploading: false,
      uploadResult: null
    }
  },
  computed: {
    uploadUrl() {
      return `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`
    }
  },
  methods: {
    async testPresetDetailed() {
      this.testing = true
      this.detailedResult = null

      try {
        // 創建一個 1x1 像素的測試圖片
        const canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = 1
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FF0000'
        ctx.fillRect(0, 0, 1, 1)

        canvas.toBlob(async (blob) => {
          const formData = new FormData()
          formData.append('file', blob, 'test.png')
          formData.append('upload_preset', this.uploadPreset)

          console.log('測試參數:', {
            cloudName: this.cloudName,
            uploadPreset: this.uploadPreset,
            url: this.uploadUrl
          })

          try {
            const response = await fetch(this.uploadUrl, {
              method: 'POST',
              body: formData
            })

            const responseText = await response.text()
            console.log('Cloudinary 回應:', responseText)

            this.detailedResult = {
              status: response.status,
              response: responseText,
              success: response.ok
            }

            if (response.ok) {
              const data = JSON.parse(responseText)
              console.log('上傳成功:', data)
            }

          } catch (error) {
            console.error('請求失敗:', error)
            this.detailedResult = {
              status: 'Network Error',
              response: error.message,
              success: false
            }
          }

          this.testing = false
        }, 'image/png')

      } catch (error) {
        this.detailedResult = {
          status: 'Error',
          response: error.message,
          success: false
        }
        this.testing = false
      }
    },

    async testAlternativePreset() {
      this.testing = true
      const originalPreset = this.uploadPreset
      this.uploadPreset = this.alternativePreset
      
      await this.testPresetDetailed()
      
      // 如果測試失敗，恢復原始設定
      if (!this.detailedResult?.success) {
        this.uploadPreset = originalPreset
      }
    },

    handleFileSelect(event) {
      this.selectedFile = event.target.files[0]
      this.uploadResult = null
      console.log('選擇檔案:', this.selectedFile)
    },

    async testRealUpload() {
      if (!this.selectedFile) return

      this.uploading = true
      this.uploadResult = null

      const formData = new FormData()
      formData.append('file', this.selectedFile)
      formData.append('upload_preset', this.uploadPreset)

      console.log('開始實際上傳:', {
        fileName: this.selectedFile.name,
        fileSize: this.selectedFile.size,
        fileType: this.selectedFile.type,
        cloudName: this.cloudName,
        uploadPreset: this.uploadPreset
      })

      try {
        const response = await fetch(this.uploadUrl, {
          method: 'POST',
          body: formData
        })

        console.log('上傳回應狀態:', response.status)
        const responseText = await response.text()
        console.log('上傳回應內容:', responseText)

        if (response.ok) {
          const data = JSON.parse(responseText)
          this.uploadResult = {
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
            status: response.status
          }
          console.log('上傳成功:', data)
        } else {
          this.uploadResult = {
            success: false,
            status: response.status,
            error: responseText
          }
          console.error('上傳失敗:', responseText)
        }

      } catch (error) {
        console.error('上傳錯誤:', error)
        this.uploadResult = {
          success: false,
          status: 'Network Error',
          error: error.message
        }
      }

      this.uploading = false
    }
  },

  mounted() {
    console.log('Cloudinary 診斷工具載入完成')
    console.log('環境變數:', {
      VUE_APP_CLOUDINARY_CLOUD_NAME: process.env.VUE_APP_CLOUDINARY_CLOUD_NAME,
      VUE_APP_CLOUDINARY_UPLOAD_PRESET: process.env.VUE_APP_CLOUDINARY_UPLOAD_PRESET
    })
  }
}
</script>

<style scoped>
.diagnostic-panel {
  max-width: 900px;
  margin: 0 auto;
}

pre {
  font-size: 0.85rem;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.alert {
  border-radius: 6px;
}

.table td {
  vertical-align: middle;
}

code {
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}

.bg-dark code {
  background-color: transparent;
  color: #f8f9fa;
}
</style>

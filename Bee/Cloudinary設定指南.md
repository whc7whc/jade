# Cloudinary 設定指南

## 📋 Cloudinary 憑證資訊

您的 Cloudinary 配置已經設定完成：

```javascript
{
  "CloudName": "jadetainan",
  "ApiKey": "384776688611428",
  "ApiSecret": "4dSdNavAr96WmP0vO_wJL8TkbTU"
}
```

## 🔧 需要在 Cloudinary 控制台進行的設定

### 1. 創建 Upload Preset

1. 登入 [Cloudinary Console](https://console.cloudinary.com/)
2. 進入 **Settings** → **Upload**
3. 點擊 **Add upload preset**
4. 設定以下參數：

```
Preset name: jade-products
Signing mode: Unsigned (重要！)
Folder: products
Resource type: Auto
Access mode: Public
```

**圖片轉換設定 (可選)：**
```
Quality: Auto
Format: Auto
Max width: 1200
Max height: 1200
```

### 2. 安全性設定

在 **Settings** → **Security** 中設定：

**允許的網域：**
```
http://localhost:8086
http://localhost:8084
http://localhost:8085
https://your-production-domain.com
```

### 3. 其他建議設定

**自動備份：** 啟用
**圖片優化：** 啟用 f_auto, q_auto
**響應式圖片：** 啟用

## 📝 已更新的檔案

1. **環境變數 (.env)**
   ```env
   VUE_APP_CLOUDINARY_CLOUD_NAME=jadetainan
   VUE_APP_CLOUDINARY_API_KEY=384776688611428
   VUE_APP_CLOUDINARY_UPLOAD_PRESET=jade-products
   ```

2. **Cloudinary 配置 (src/config/cloudinary.js)**
   - 完整的 Cloudinary 整合
   - 圖片轉換功能
   - 縮圖生成

3. **上傳服務 (src/services/uploadService.js)**
   - 直接上傳到 Cloudinary
   - 自動圖片優化
   - 錯誤處理

## 🚀 測試步驟

1. **檢查 Upload Preset**
   ```bash
   curl -X POST \
   "https://api.cloudinary.com/v1_1/jadetainan/image/upload" \
   -F "upload_preset=jade-products" \
   -F "file=@test-image.jpg"
   ```

2. **在應用中測試**
   - 進入商品管理頁面
   - 點擊新增商品
   - 上傳圖片測試

## ⚠️ 安全性注意事項

1. **API Secret** 絕不應該暴露在前端代碼中
2. **Upload Preset** 必須設為 "Unsigned" 模式
3. 建議設定 **Upload 限制**：
   - 檔案大小限制：10MB
   - 檔案類型限制：image/*
   - 每日上傳限制

## 🔍 故障排除

### 常見錯誤：

1. **"Invalid upload preset"**
   - 確認 Upload Preset 名稱正確
   - 確認設為 Unsigned 模式

2. **"CORS error"**
   - 檢查 Cloudinary 安全性設定
   - 確認網域已加入白名單

3. **"File too large"**
   - 檢查檔案大小限制
   - 調整 Upload Preset 設定

### 檢查清單：

- [ ] Upload Preset "jade-products" 已創建
- [ ] Preset 設為 Unsigned 模式
- [ ] 網域已加入安全性白名單
- [ ] 圖片上傳功能正常運作
- [ ] 圖片 URL 正確顯示

## 📊 使用統計

您可以在 Cloudinary Console 的 **Media Library** 和 **Reports** 中查看：
- 上傳的圖片
- 使用量統計
- 轉換次數
- 流量統計

完成這些設定後，您的圖片上傳功能就可以正常使用了！🎉

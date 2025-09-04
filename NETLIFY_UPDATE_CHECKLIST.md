# Netlify 更新檢查清單

## 立即檢查步驟：

1. **檢查 Netlify 部署狀態**
   - 網址：https://app.netlify.com/sites/moonlit-klepon-a78f8c/deploys
   - 查看最新部署是否完成

2. **測試環境配置**
   - 訪問：https://moonlit-klepon-a78f8c.netlify.app/emergency-check.html
   - 確認 API URL 是否正確

3. **清除瀏覽器快取**
   - 按 Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)
   - 或開啟無痕模式測試

4. **如果問題持續**
   - 在 Netlify Dashboard 點擊 "Clear cache and deploy site"
   - 等待 3-5 分鐘重新測試

## 目標 API URL：
- ✅ 應該使用：https://jadeapi-production.up.railway.app/api
- ❌ 不應該出現：https://localhost:7106

## 快速測試指令：
```bash
# 測試 Railway API 健康狀態
curl https://jadeapi-production.up.railway.app/health

# 測試產品 API
curl https://jadeapi-production.up.railway.app/api/Products
```

## 如果都完成但仍有問題：
聯繫我們進行進一步除錯。

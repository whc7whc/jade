# JADE Cart Fix Deployment Script

Write-Host "JADE Cart Fix Deployment Starting..." -ForegroundColor Green

# 1. Check current working directory
Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Yellow

# 2. Install dependencies if needed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "✅ 找到 package.json" -ForegroundColor Green
    npm install
} else {
    Write-Host "❌ 未找到 package.json" -ForegroundColor Red
    exit 1
}

# 3. 建置項目
Write-Host "🔨 開始建置..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 建置失敗" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 建置成功" -ForegroundColor Green

# 4. 檢查建置結果
if (Test-Path "dist") {
    Write-Host "✅ dist 目錄已生成" -ForegroundColor Green
    $distFiles = Get-ChildItem "dist" -Recurse | Measure-Object | Select-Object -ExpandProperty Count
    Write-Host "📁 dist 目錄包含 $distFiles 個檔案" -ForegroundColor Cyan
} else {
    Write-Host "❌ 建置失敗：未找到 dist 目錄" -ForegroundColor Red
    exit 1
}

# 5. Git 提交（如果有 Git）
if (Test-Path ".git") {
    Write-Host "📝 準備 Git 提交..." -ForegroundColor Yellow
    
    git add .
    git status
    
    $commitMessage = "fix: 修復購物車載入問題和聊天初始化錯誤

- 修復 Vuex store 初始化問題
- 修復 cartService API 配置
- 增加購物車調試工具
- 改善錯誤處理和日誌記錄
- 添加詳細的診斷工具"
    
    git commit -m $commitMessage
    
    Write-Host "✅ Git 提交完成" -ForegroundColor Green
    Write-Host "📤 推送到遠端倉庫..." -ForegroundColor Yellow
    
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 推送成功" -ForegroundColor Green
    } else {
        Write-Host "⚠️ 推送可能有問題，請手動檢查" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ 未找到 Git 倉庫，請手動部署到 Netlify" -ForegroundColor Yellow
}

# 6. 提供測試 URL
Write-Host "" -ForegroundColor White
Write-Host "🎉 部署腳本執行完成！" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📋 接下來的步驟：" -ForegroundColor Cyan
Write-Host "1. 等待 Netlify 自動部署完成（通常需要 1-3 分鐘）" -ForegroundColor White
Write-Host "2. 訪問以下 URL 進行測試：" -ForegroundColor White
Write-Host "   🏠 主站：https://moonlit-klepon-a78f8c.netlify.app/" -ForegroundColor Yellow
Write-Host "   🛒 購物車診斷：https://moonlit-klepon-a78f8c.netlify.app/cart-diagnostic.html" -ForegroundColor Yellow
Write-Host "   🔍 調試頁面：https://moonlit-klepon-a78f8c.netlify.app/debug" -ForegroundColor Yellow
Write-Host "   🔐 登入測試：https://moonlit-klepon-a78f8c.netlify.app/debug-login.html" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "🔧 如果還有問題，請檢查：" -ForegroundColor Cyan
Write-Host "- 瀏覽器開發者工具的 Console 和 Network 標籤" -ForegroundColor White
Write-Host "- 用戶是否已正確登入" -ForegroundColor White
Write-Host "- Railway API 服務是否正常運行" -ForegroundColor White
Write-Host "" -ForegroundColor White

# 7. 開啟診斷頁面
$openBrowser = Read-Host "是否要開啟瀏覽器到診斷頁面？(y/N)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "https://moonlit-klepon-a78f8c.netlify.app/cart-diagnostic.html"
}

Write-Host "✨ 完成！" -ForegroundColor Green

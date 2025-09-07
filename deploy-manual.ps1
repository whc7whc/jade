# 手動部署腳本
Write-Host "開始手動部署到 Netlify..." -ForegroundColor Green

# 檢查 dist 資料夾是否存在
if (!(Test-Path "dist")) {
    Write-Host "錯誤：dist 資料夾不存在，請先執行 npm run build" -ForegroundColor Red
    exit 1
}

# 壓縮 dist 資料夾
Write-Host "正在壓縮 dist 資料夾..." -ForegroundColor Yellow
Compress-Archive -Path "dist\*" -DestinationPath "dist-deploy.zip" -Force

Write-Host "部署檔案已準備完成：dist-deploy.zip" -ForegroundColor Green
Write-Host ""
Write-Host "請手動執行以下步驟：" -ForegroundColor Cyan
Write-Host "1. 前往 https://app.netlify.com/sites/moonlit-klepon-a78f8c/deploys" -ForegroundColor White
Write-Host "2. 拖拽 dist-deploy.zip 檔案到部署區域" -ForegroundColor White
Write-Host "3. 等待部署完成" -ForegroundColor White
Write-Host ""
Write-Host "或者您可以直接拖拽 dist 資料夾到 Netlify 部署區域" -ForegroundColor Yellow

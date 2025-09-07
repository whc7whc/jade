# JADE Cart Fix Deployment Script

Write-Host "JADE Cart Fix Deployment Starting..." -ForegroundColor Green

# 1. Check current working directory
Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Yellow

# 2. Install dependencies if needed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "Found package.json" -ForegroundColor Green
    npm install
} else {
    Write-Host "package.json not found" -ForegroundColor Red
    exit 1
}

# 3. Build project
Write-Host "Starting build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful" -ForegroundColor Green

# 4. Check build results
if (Test-Path "dist") {
    Write-Host "dist directory created" -ForegroundColor Green
    $distFiles = Get-ChildItem "dist" -Recurse | Measure-Object | Select-Object -ExpandProperty Count
    Write-Host "dist directory contains $distFiles files" -ForegroundColor Cyan
} else {
    Write-Host "Build failed: dist directory not found" -ForegroundColor Red
    exit 1
}

# 5. Git commit if git repository exists
if (Test-Path ".git") {
    Write-Host "Preparing Git commit..." -ForegroundColor Yellow
    
    git add .
    git status
    
    $commitMessage = "fix: Fix cart loading issues and chat initialization errors

- Fix Vuex store initialization issues
- Fix cartService API configuration
- Add cart debugging tools
- Improve error handling and logging
- Add detailed diagnostic tools"
    
    git commit -m $commitMessage
    
    Write-Host "Git commit completed" -ForegroundColor Green
    Write-Host "Pushing to remote repository..." -ForegroundColor Yellow
    
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Push successful" -ForegroundColor Green
    } else {
        Write-Host "Push may have issues, please check manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "Git repository not found, please deploy to Netlify manually" -ForegroundColor Yellow
}

# 6. Provide test URLs
Write-Host "" -ForegroundColor White
Write-Host "Deployment script completed!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Wait for Netlify auto-deployment (usually 1-3 minutes)" -ForegroundColor White
Write-Host "2. Test the following URLs:" -ForegroundColor White
Write-Host "   Main site: https://moonlit-klepon-a78f8c.netlify.app/" -ForegroundColor Yellow
Write-Host "   Cart diagnostic: https://moonlit-klepon-a78f8c.netlify.app/cart-diagnostic.html" -ForegroundColor Yellow
Write-Host "   Debug page: https://moonlit-klepon-a78f8c.netlify.app/debug" -ForegroundColor Yellow
Write-Host "   Login test: https://moonlit-klepon-a78f8c.netlify.app/debug-login.html" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "If there are still issues, please check:" -ForegroundColor Cyan
Write-Host "- Browser Developer Tools Console and Network tabs" -ForegroundColor White
Write-Host "- Whether user is properly logged in" -ForegroundColor White
Write-Host "- Whether Railway API service is running normally" -ForegroundColor White
Write-Host "" -ForegroundColor White

# 7. Open diagnostic page
$openBrowser = Read-Host "Open browser to diagnostic page? (y/N)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "https://moonlit-klepon-a78f8c.netlify.app/cart-diagnostic.html"
}

Write-Host "Completed!" -ForegroundColor Green

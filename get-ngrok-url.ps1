# 獲取 ngrok URL 的腳本
try {
    Write-Host "正在檢查 ngrok API..."
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 5
    
    if ($response.tunnels -and $response.tunnels.Count -gt 0) {
        foreach ($tunnel in $response.tunnels) {
            Write-Host "協議: $($tunnel.proto)"
            Write-Host "公開 URL: $($tunnel.public_url)"
            Write-Host "本地 URL: $($tunnel.config.addr)"
            Write-Host "---"
        }
        
        # 尋找 HTTPS 隧道
        $httpsUrl = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1 -ExpandProperty public_url
        if ($httpsUrl) {
            Write-Host ""
            Write-Host "🎉 找到 HTTPS URL: $httpsUrl"
            return $httpsUrl
        } else {
            $httpUrl = $response.tunnels[0].public_url
            Write-Host ""
            Write-Host "🔗 找到 HTTP URL: $httpUrl"
            return $httpUrl
        }
    } else {
        Write-Host "❌ 沒有找到活躍的隧道"
    }
} catch {
    Write-Host "❌ 無法連接到 ngrok API: $($_.Exception.Message)"
    Write-Host "請確認 ngrok 正在運行並且可以訪問 http://127.0.0.1:4040"
}

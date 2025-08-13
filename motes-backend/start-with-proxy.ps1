Write-Host "启动 Motes 后端服务（带代理配置）..." -ForegroundColor Green

# 设置代理环境变量
$env:HTTP_PROXY = "http://127.0.0.1:7897"
$env:HTTPS_PROXY = "http://127.0.0.1:7897"

Write-Host "代理配置:" -ForegroundColor Yellow
Write-Host "HTTP_PROXY=$env:HTTP_PROXY"
Write-Host "HTTPS_PROXY=$env:HTTPS_PROXY"
Write-Host ""

# 启动开发服务器
npm run dev

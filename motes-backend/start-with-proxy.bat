@echo off
echo 启动 Motes 后端服务（带代理配置）...

REM 设置代理环境变量
set HTTP_PROXY=http://127.0.0.1:7897
set HTTPS_PROXY=http://127.0.0.1:7897

echo 代理配置:
echo HTTP_PROXY=%HTTP_PROXY%
echo HTTPS_PROXY=%HTTPS_PROXY%
echo.

REM 启动开发服务器
npm run dev

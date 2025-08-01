@echo off
REM SecureDSA-Pro Startup Script for Windows
REM This script starts all required services for the SecureDSA-Pro chrome extension

echo 🚀 Starting SecureDSA-Pro System...
echo ==================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not installed. Please install it first.
    pause
    exit /b 1
)

echo 📦 Starting Docker services...
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

echo 🔍 Checking service health...

REM Check Claude 3.5 (Primary)
curl -f http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Claude 3.5 (Primary) - Port 11434
) else (
    echo ❌ Claude 3.5 (Primary) - Port 11434 - Not responding
)

REM Check Deepseek v3 (Secondary)
curl -f http://localhost:11436/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Deepseek v3 (Secondary) - Port 11436
) else (
    echo ❌ Deepseek v3 (Secondary) - Port 11436 - Not responding
)

REM Check GPT-4.1 (Retry 1)
curl -f http://localhost:11435/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ GPT-4.1 (Retry 1) - Port 11435
) else (
    echo ❌ GPT-4.1 (Retry 1) - Port 11435 - Not responding
)

REM Check Grok4 (Retry 2)
curl -f http://localhost:11437/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Grok4 (Retry 2) - Port 11437
) else (
    echo ❌ Grok4 (Retry 2) - Port 11437 - Not responding
)

echo.
echo 🎯 SecureDSA-Pro System Status:
echo ================================
docker-compose ps

echo.
echo 📋 Next Steps:
echo 1. Open Chrome browser
echo 2. Go to chrome://extensions/
echo 3. Enable 'Developer mode'
echo 4. Click 'Load unpacked'
echo 5. Select the 'secure-dsa-pro' directory
echo 6. Click the SecureDSA-Pro extension icon to start solving DSA problems!

echo.
echo 🔧 Useful Commands:
echo - View logs: docker-compose logs -f
echo - Stop services: docker-compose down
echo - Restart services: docker-compose restart
echo - Check status: docker-compose ps

echo.
echo 🎉 SecureDSA-Pro is ready to use!
pause 
@echo off
echo ========================================
echo    SecureDSA-Pro Hybrid System
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running
    echo Please install Docker Desktop and try again
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not available
    echo Please ensure Docker Compose is installed
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are available
echo.

REM Navigate to backend directory
cd /d "%~dp0"

echo 🚀 Starting SecureDSA-Pro Hybrid System...
echo.

REM Start Docker services
echo 📦 Starting AI model services...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start Docker services
    pause
    exit /b 1
)

echo ✅ Docker services started successfully
echo.

REM Wait for services to be ready
echo ⏳ Waiting for AI models to initialize...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...
echo.

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
echo 🎯 Starting Backend Server...
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

REM Start the backend server
echo 🚀 Starting backend server on port 3000...
start "SecureDSA-Pro Backend" cmd /k "npm start"

echo.
echo ========================================
echo    Hybrid System Status
echo ========================================
echo.
echo 🌐 Web Application: http://localhost:5173
echo 🔧 Backend API: http://localhost:3000
echo 🤖 AI Models: Running on ports 11434-11437
echo 🔐 Chrome Extension: Load from frontend/public/
echo.
echo 📋 Next Steps:
echo 1. Open http://localhost:5173 for the web app
echo 2. Load the Chrome Extension from frontend/public/
echo 3. Use Ctrl+Shift+S to solve DSA problems on any webpage
echo 4. Or use the extension popup for manual problem solving
echo.
echo 💡 Features Available:
echo - Multi-model AI orchestration (Claude 3.5, Deepseek v3, GPT-4.1, Grok4)
echo - Web application with React interface
echo - Chrome Extension with context extraction
echo - Test case validation and execution
echo - Quality assessment and retry mechanisms
echo.
echo Press any key to stop all services...
pause

REM Stop Docker services
echo.
echo 🛑 Stopping Docker services...
docker-compose down

echo.
echo ✅ Hybrid system stopped successfully
pause 
@echo off
REM Flashcard Game Auto-Start Script (Windows)
REM This script automatically starts the server when opening the HTML file

echo ===================================
echo   Flashcard Game Auto-Launcher
echo ===================================

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Check if server is running
netstat -an | findstr :3000 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo Server already running on port 3000
) else (
    echo Starting server...
    start /B cmd /c "npm run server"
    timeout /t 2 /nobreak >nul
    echo Server started
)

REM Open browser
echo Opening browser...
start http://localhost:3000

echo.
echo Flashcard Game is ready!
echo Press any key to continue...
pause >nul
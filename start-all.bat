@echo off
echo 🚀 Starting Wild West Duel - All Servers
echo.

echo 🎮 Starting Frontend...
start "Frontend" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

echo 🖥️ Starting Backend...
start "Backend" cmd /k "cd src/backend && node app.js"

timeout /t 2 /nobreak >nul

echo 🤖 Starting AI Service...
start "AI Service" cmd /k powershell -NoExit -Command "Set-Location 'C:\Users\SANJAY G\Desktop\hack'; .\venv\Scripts\Activate.ps1;cd ai_service; python main.py"

echo.
echo ✅ All servers starting in separate windows!
echo 🎯 Game will be ready at: http://localhost:5173
echo 🤖 AI Service at: http://localhost:5001
echo 🖥️ Backend at: http://localhost:3001
echo.
echo Press any key to exit...
pause >nul
    
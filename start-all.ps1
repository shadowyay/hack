# PowerShell script to start all servers
Write-Host "🚀 Starting Wild West Duel - All Servers" -ForegroundColor Green
Write-Host ""

# Start each process in a new window
Write-Host "🎮 Starting Frontend (npm run dev)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Start-Sleep -Seconds 2

Write-Host "🖥️ Starting Backend (src/backend)..." -ForegroundColor Green  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src/backend; node server.js"

Start-Sleep -Seconds 2

Write-Host "🤖 Starting AI Service (ai_service)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "conda activate tf; cd ai_service; python main.py"

Write-Host ""
Write-Host "✅ All servers starting in separate windows!" -ForegroundColor Yellow
Write-Host "🎯 Game will be ready at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🤖 AI Service at: http://localhost:5001" -ForegroundColor Cyan  
Write-Host "🖥️ Backend at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor White
Read-Host

Write-Host "🚀 Starting EduAI Full Stack Application..." -ForegroundColor Cyan
Write-Host ""

# Start backend in new window
Write-Host "📡 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", ".\start-backend.ps1"

# Wait a bit for backend to initialize
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", ".\start-frontend.ps1"

Write-Host ""
Write-Host "✅ Application is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Close the terminal windows to stop the servers" -ForegroundColor Yellow

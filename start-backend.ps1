Write-Host "🚀 Starting EduAI Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location backend

# Check if virtual environment exists
if (!(Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Install/Update dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pip install -q -r requirements.txt

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate

# Start server
Write-Host ""
Write-Host "✅ Backend server starting on http://localhost:8000" -ForegroundColor Green
Write-Host "📊 Admin panel: http://localhost:8000/admin" -ForegroundColor Green
Write-Host "🔌 API Health: http://localhost:8000/api/health/" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python manage.py runserver

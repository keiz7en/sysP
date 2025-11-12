Write-Host "Clearing Python Cache Files..." -ForegroundColor Cyan
Write-Host ""

# Clear __pycache__ directories
Write-Host "Removing __pycache__ directories..." -ForegroundColor Yellow
$pycacheDirs = Get-ChildItem -Path backend -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue
if ($pycacheDirs) {
    $pycacheDirs | ForEach-Object {
        Write-Host "   Removing: $($_.FullName)" -ForegroundColor Gray
        Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Removed $($pycacheDirs.Count) __pycache__ directories" -ForegroundColor Green
} else {
    Write-Host "   No __pycache__ directories found" -ForegroundColor Gray
}

Write-Host ""

# Clear .pyc files
Write-Host "Removing .pyc files..." -ForegroundColor Yellow
$pycFiles = Get-ChildItem -Path backend -Recurse -File -Filter "*.pyc" -ErrorAction SilentlyContinue
if ($pycFiles) {
    $pycFiles | ForEach-Object {
        Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Removed $($pycFiles.Count) .pyc files" -ForegroundColor Green
} else {
    Write-Host "   No .pyc files found" -ForegroundColor Gray
}

Write-Host ""

# Show latest modified Python files
Write-Host "Latest Modified Python Files:" -ForegroundColor Cyan
Get-ChildItem -Path backend -Recurse -File -Filter "*.py" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 10 | ForEach-Object {
    $relPath = $_.FullName.Replace((Get-Location).Path + "\", "")
    $timestamp = $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
    Write-Host "   $relPath - $timestamp" -ForegroundColor White
}

Write-Host ""
Write-Host "Python cache cleared successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps for PyCharm:" -ForegroundColor Yellow
Write-Host "1. Close PyCharm completely" -ForegroundColor White
Write-Host "2. Reopen PyCharm" -ForegroundColor White
Write-Host "3. Go to File then Invalidate Caches and Restart" -ForegroundColor White
Write-Host "4. Click Invalidate and Restart button" -ForegroundColor White
Write-Host "5. Wait for re-indexing to complete" -ForegroundColor White
Write-Host ""

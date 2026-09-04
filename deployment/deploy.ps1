# TenderTracker Command Center - Windows Production Verification & Build Script
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " TenderTracker Command Center — Deployment Sentinel " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Frontend Build
Write-Host "[1/4] Building production frontend..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[+] Frontend build successful." -ForegroundColor Green

# 2. Run Backend Integration Tests
Write-Host "[2/4] Running backend integration test suite..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\backend"
.\venv\Scripts\python run_tests.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Backend tests failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[+] All backend integration tests passed." -ForegroundColor Green

# 3. Verify Backup Sentinel
Write-Host "[3/4] Running backup sentinel snapshot & verification..." -ForegroundColor Yellow
.\venv\Scripts\python scripts\backup_sentinel.py --action create
.\venv\Scripts\python scripts\backup_sentinel.py --action verify
if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Backup verification failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[+] Backup verification passed 100%." -ForegroundColor Green

# 4. Knowledge Graph Sync
Write-Host "[4/4] Synchronizing knowledge graph..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\.."
python tools\graphify\graphify.py

Write-Host "======================================================" -ForegroundColor Green
Write-Host " SUCCESS: Production deployment checks 100% passed! " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green

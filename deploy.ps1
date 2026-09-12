param (
    [string]$Message = "chore: update application"
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   🚀 TenderTracker One-Click Live Cloud Deployment     " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

$KeyFile = "tendertracker-vm_key.pem"
$ServerIP = "20.235.240.78"
$LiveURL = "https://tendertracker-app.centralindia.cloudapp.azure.com"

# 1. Verify SSH Key exists
if (-not (Test-Path $KeyFile)) {
    Write-Host "❌ Error: Private key '$KeyFile' not found in current directory." -ForegroundColor Red
    exit 1
}

# 2. Check for local git changes
Write-Host "[1/3] Checking git changes and pushing to GitHub..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "      Detected local changes. Committing: '$Message'..." -ForegroundColor Gray
    git add -A
    git commit -m $Message
} else {
    Write-Host "      Working tree clean. Ensuring latest commits are pushed..." -ForegroundColor Gray
}

git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error pushing to GitHub. Aborting deployment." -ForegroundColor Red
    exit 1
}
Write-Host "      GitHub repository updated successfully." -ForegroundColor Green

# 3. Ensure NTFS permissions on SSH key
icacls.exe $KeyFile /reset > $null 2>&1
icacls.exe $KeyFile /inheritance:r > $null 2>&1
icacls.exe $KeyFile /grant:r "$($env:USERNAME):(R)" > $null 2>&1

# 4. Trigger remote deployment on Azure VM
Write-Host "[2/3] Connecting to Azure VM ($ServerIP) via SSH..." -ForegroundColor Yellow

$remoteCommand = @"
set -e
echo '--> Pulling latest code from GitHub...'
cd /var/www/tender-tracker
git pull origin main

echo '--> Recompiling frontend production build...'
cd /var/www/tender-tracker/frontend
npm run build

echo '--> Restarting backend service...'
sudo systemctl restart tendertracker

echo '--> Reloading Nginx...'
sudo systemctl reload nginx

echo '--> Health Check:'
curl -s http://127.0.0.1:8000/api/health
echo ''
"@

ssh -i $KeyFile -o StrictHostKeyChecking=no -o ConnectTimeout=15 azureuser@$ServerIP "bash -c `"$remoteCommand`""

if ($LASTEXITCODE -eq 0) {
    Write-Host "[3/3] Deployment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=========================================================" -ForegroundColor Green
    Write-Host " 🎉 Live site successfully updated:                      " -ForegroundColor Green
    Write-Host "    $LiveURL" -ForegroundColor White
    Write-Host "=========================================================" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment encountered an error on the server." -ForegroundColor Red
}

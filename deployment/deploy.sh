#!/usr/bin/env bash
# TenderTracker Command Center — Linux Production Deployment & Verification Script
set -e

echo "======================================================"
echo " TenderTracker Command Center — Linux Deploy Sentinel "
echo "======================================================"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 1. Build Frontend
echo "[1/4] Building production frontend..."
cd "$ROOT_DIR/frontend"
npm ci || npm install
npm run build
echo "[+] Frontend compiled into dist/"

# 2. Setup Python Environment & Run Tests
echo "[2/4] Verifying backend integration test suite..."
cd "$ROOT_DIR/backend"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt httpx
python run_tests.py
echo "[+] All backend integration tests passed."

# 3. Test 3-2-1 Backup Sentinel
echo "[3/4] Testing backup snapshot creation and integrity verification..."
python scripts/backup_sentinel.py --action create
python scripts/backup_sentinel.py --action verify
echo "[+] 3-2-1 Backup verification successful."

# 4. Sync Knowledge Graph
echo "[4/4] Updating Graphify knowledge index..."
cd "$ROOT_DIR"
python3 tools/graphify/graphify.py

echo "======================================================"
echo " SUCCESS: Production build and hardening verified!   "
echo "======================================================"

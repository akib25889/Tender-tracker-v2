import os
import sys
import json
import shutil
import hashlib
import zipfile
import argparse
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
BACKUP_DIR = BASE_DIR / "backups"
DB_FILE = BASE_DIR / "tender_tracker.db"

def sha256_file(filepath: Path) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(1024 * 1024):
            hasher.update(chunk)
    return hasher.hexdigest()

def create_backup() -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    staging_name = f"backup_{timestamp}"
    staging_dir = BACKUP_DIR / staging_name
    staging_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"[*] Creating backup snapshot in {staging_dir}...")
    manifest = {
        "timestamp": timestamp,
        "created_at": datetime.now().isoformat(),
        "database": None,
        "files": []
    }
    
    # 1. Backup Database
    if DB_FILE.exists():
        db_dest = staging_dir / "database.db"
        shutil.copy2(DB_FILE, db_dest)
        db_hash = sha256_file(db_dest)
        manifest["database"] = {
            "type": "sqlite",
            "filename": "database.db",
            "sha256": db_hash,
            "size_bytes": db_dest.stat().st_size
        }
        print(f" [+] Database backed up (SHA-256: {db_hash[:16]}...)")
    else:
        print(" [!] Database file not found, skipping db backup.")
        
    # 2. Backup Storage Vault
    vault_dest = staging_dir / "storage"
    if STORAGE_DIR.exists():
        shutil.copytree(STORAGE_DIR, vault_dest, dirs_exist_ok=True)
        for root, _, files in os.walk(vault_dest):
            for file in files:
                fpath = Path(root) / file
                rel_path = fpath.relative_to(staging_dir).as_posix()
                f_hash = sha256_file(fpath)
                manifest["files"].append({
                    "path": rel_path,
                    "sha256": f_hash,
                    "size_bytes": fpath.stat().st_size
                })
        print(f" [+] Storage vault backed up ({len(manifest['files'])} files indexed)")
        
    # 3. Write Manifest
    manifest_path = staging_dir / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(" [+] Cryptographic manifest.json generated.")
    
    # 4. Create ZIP Archive
    archive_path = BACKUP_DIR / f"{staging_name}.zip"
    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(staging_dir):
            for file in files:
                fpath = Path(root) / file
                arcname = fpath.relative_to(staging_dir)
                zf.write(fpath, arcname)
                
    # Clean staging directory
    shutil.rmtree(staging_dir, ignore_errors=True)
    archive_hash = sha256_file(archive_path)
    print(f"[*] Backup archive finalized: {archive_path.name}")
    print(f"    SHA-256: {archive_hash}")
    return archive_path

def verify_backup(archive_path: Path) -> bool:
    print(f"[*] Verifying backup archive: {archive_path.name}...")
    if not archive_path.exists():
        print(f"[-] Error: Archive not found: {archive_path}")
        return False
        
    sandbox_dir = BACKUP_DIR / f"verify_sandbox_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    sandbox_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        with zipfile.ZipFile(archive_path, "r") as zf:
            zf.extractall(sandbox_dir)
            
        manifest_path = sandbox_dir / "manifest.json"
        if not manifest_path.exists():
            print("[-] Verification failed: Missing manifest.json in backup.")
            return False
            
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
            
        # Verify Database
        if manifest.get("database"):
            db_entry = manifest["database"]
            extracted_db = sandbox_dir / db_entry["filename"]
            if not extracted_db.exists() or sha256_file(extracted_db) != db_entry["sha256"]:
                print("[-] Verification failed: Database checksum mismatch!")
                return False
            print(" [+] Database checksum matches manifest.")
            
        # Verify Files
        for f_entry in manifest.get("files", []):
            extracted_f = sandbox_dir / f_entry["path"]
            if not extracted_f.exists() or sha256_file(extracted_f) != f_entry["sha256"]:
                print(f"[-] Verification failed: File checksum mismatch on {f_entry['path']}!")
                return False
        print(f" [+] All {len(manifest.get('files', []))} files passed cryptographic checksum check.")
        print("[+] SUCCESS: Backup verification passed 100%. Data is completely recoverable.")
        return True
    finally:
        shutil.rmtree(sandbox_dir, ignore_errors=True)

def rotate_backups(keep_count: int = 7):
    print(f"[*] Enforcing retention policy (keeping last {keep_count} snapshots)...")
    archives = sorted(BACKUP_DIR.glob("backup_*.zip"), key=lambda p: p.stat().st_mtime, reverse=True)
    if len(archives) > keep_count:
        for old in archives[keep_count:]:
            print(f" [-] Pruning expired backup: {old.name}")
            old.unlink()
    print(f"[+] Active backups retained: {min(len(archives), keep_count)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TenderTracker 3-2-1 Backup Sentinel")
    parser.add_argument("--action", choices=["create", "verify", "rotate"], default="create", help="Backup action")
    parser.add_argument("--archive", type=str, help="Archive path for verify action")
    parser.add_argument("--keep", type=int, default=7, help="Snapshots to retain")
    args = parser.parse_args()
    
    if args.action == "create":
        arch = create_backup()
        rotate_backups(args.keep)
    elif args.action == "verify":
        if args.archive:
            target = Path(args.archive)
        else:
            archives = sorted(BACKUP_DIR.glob("backup_*.zip"), key=lambda p: p.stat().st_mtime, reverse=True)
            if not archives:
                print("[-] No backup archives found to verify.")
                sys.exit(1)
            target = archives[0]
        success = verify_backup(target)
        sys.exit(0 if success else 1)
    elif args.action == "rotate":
        rotate_backups(args.keep)

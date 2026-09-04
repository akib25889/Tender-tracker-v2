import hashlib
import shutil
from pathlib import Path
from fastapi import UploadFile
from app.core.config import settings

DEFAULT_FOLDERS = [
    "01_original_tender_documents",
    "02_company_statutory_documents",
    "03_technical_proposal",
    "04_financial_proposal",
    "05_final_submission_package",
    "06_submission_receipts",
]

def get_tender_storage_dir(tender_id: str) -> Path:
    base = settings.STORAGE_ROOT / "tenders" / tender_id
    base.mkdir(parents=True, exist_ok=True)
    return base

def ensure_tender_directories(tender_id: str):
    base = get_tender_storage_dir(tender_id)
    for folder in DEFAULT_FOLDERS:
        (base / folder).mkdir(parents=True, exist_ok=True)

def get_master_library_dir() -> Path:
    base = settings.STORAGE_ROOT / "master_library"
    base.mkdir(parents=True, exist_ok=True)
    return base

async def save_uploaded_file(file: UploadFile, target_dir: Path) -> tuple[str, str, int]:
    """
    Saves an uploaded file to disk and computes its SHA-256 hash simultaneously.
    Returns: (stored_filename, sha256_hash, file_size_bytes)
    """
    target_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(file.filename or "uploaded_file").name
    file_path = target_dir / safe_name
    
    hasher = hashlib.sha256()
    size = 0
    
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            size += len(chunk)
            hasher.update(chunk)
            buffer.write(chunk)
            
    return safe_name, hasher.hexdigest(), size

def safe_relocate_folder_files(tender_id: str, source_folder: str, target_folder: str = "01_original_tender_documents"):
    """
    Safely moves all physical files from a deleted folder to the fallback folder.
    """
    tender_dir = get_tender_storage_dir(tender_id)
    src = tender_dir / source_folder
    dst = tender_dir / target_folder
    dst.mkdir(parents=True, exist_ok=True)
    
    if src.exists() and src.is_dir():
        for item in src.iterdir():
            if item.is_file():
                shutil.move(str(item), str(dst / item.name))
        shutil.rmtree(str(src), ignore_errors=True)

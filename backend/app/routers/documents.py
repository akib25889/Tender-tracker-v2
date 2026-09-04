import os
from typing import List, Optional
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tender import Tender
from app.models.document import TenderDocument, TenderFolder, ReusableDocument
from app.schemas.document import (
    DocumentOut,
    FolderCreate,
    FolderOut,
    ReusableDocCreate,
    ReusableDocOut,
    LinkReusableRequest,
)
from app.services.storage import (
    get_tender_storage_dir,
    get_master_library_dir,
    save_uploaded_file,
    safe_relocate_folder_files,
)

router = APIRouter(tags=["Document Vault & Master Library"])

@router.get("/tenders/{tender_id}/documents", response_model=List[DocumentOut])
def get_tender_documents(tender_id: str, db: Session = Depends(get_db)):
    return db.query(TenderDocument).filter(TenderDocument.tender_id == tender_id).all()

@router.post("/tenders/{tender_id}/documents/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_tender_document(
    tender_id: str,
    file: UploadFile = File(...),
    folder: str = Form("01_original_tender_documents"),
    access_level: str = Form("ALL_TEAM"),
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    target_dir = get_tender_storage_dir(tender_id) / folder
    filename, sha256_hash, size_bytes = await save_uploaded_file(file, target_dir)
    
    size_mb = f"{size_bytes / (1024 * 1024):.1f} MB" if size_bytes >= 1024 * 1024 else f"{size_bytes / 1024:.0f} KB"
    doc_id = f"DOC-{db.query(TenderDocument).count() + 101}"
    
    doc = TenderDocument(
        id=doc_id,
        tender_id=tender_id,
        name=filename,
        folder=folder,
        size=size_mb,
        revision="v1.0",
        sha256=sha256_hash,
        uploaded_at=datetime.now().strftime("%Y-%m-%d"),
        access_level=access_level,
        file_path=str(target_dir / filename),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/documents/{doc_id}/download")
def download_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(TenderDocument).filter(TenderDocument.id == doc_id).first()
    if not doc or not doc.file_path or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Physical document file not found on SSD storage")
    return FileResponse(
        path=doc.file_path,
        filename=doc.name,
        media_type="application/octet-stream"
    )

# --- Custom Folders ---

@router.post("/tenders/{tender_id}/folders", response_model=FolderOut, status_code=status.HTTP_201_CREATED)
def create_folder(tender_id: str, folder_in: FolderCreate, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    folder = TenderFolder(
        tender_id=tender_id,
        name=folder_in.name,
        label=folder_in.label,
    )
    db.add(folder)
    
    # Create directory on disk
    (get_tender_storage_dir(tender_id) / folder_in.name).mkdir(parents=True, exist_ok=True)
    
    db.commit()
    db.refresh(folder)
    return folder

@router.delete("/tenders/{tender_id}/folders/{folder_name}", status_code=status.HTTP_204_NO_CONTENT)
def delete_folder(tender_id: str, folder_name: str, db: Session = Depends(get_db)):
    # 1. Safely reassign documents in database
    db.query(TenderDocument).filter(
        TenderDocument.tender_id == tender_id,
        TenderDocument.folder == folder_name
    ).update({"folder": "01_original_tender_documents"})
    
    # 2. Safely relocate physical files on SSD
    safe_relocate_folder_files(tender_id, folder_name, "01_original_tender_documents")
    
    # 3. Remove folder record if custom
    db.query(TenderFolder).filter(
        TenderFolder.tender_id == tender_id,
        TenderFolder.name == folder_name
    ).delete()
    
    db.commit()
    return None

# --- Reusable Master Document Library ---

@router.get("/reusable-documents", response_model=List[ReusableDocOut])
def get_reusable_documents(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ReusableDocument)
    if category and category.upper() != "ALL":
        query = query.filter(ReusableDocument.category == category)
    return query.order_by(ReusableDocument.uploaded_at.desc()).all()

@router.post("/reusable-documents", response_model=ReusableDocOut, status_code=status.HTTP_201_CREATED)
def create_reusable_document(doc_in: ReusableDocCreate, db: Session = Depends(get_db)):
    doc_id = f"RUD-{db.query(ReusableDocument).count() + 101}"
    
    import secrets
    mock_hash = secrets.token_hex(32)
    
    new_doc = ReusableDocument(
        id=doc_id,
        name=doc_in.name,
        category=doc_in.category,
        uploaded_at=datetime.now().strftime("%Y-%m-%d"),
        expiry_date=doc_in.expiry_date,
        size=doc_in.size,
        revision="v1.0",
        access_level=doc_in.access_level,
        sha256=mock_hash,
        description=doc_in.description,
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

@router.post("/tenders/{tender_id}/link-reusable", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def link_reusable_to_tender(tender_id: str, req: LinkReusableRequest, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    master = db.query(ReusableDocument).filter(ReusableDocument.id == req.reusable_doc_id).first()
    if not tender or not master:
        raise HTTPException(status_code=404, detail="Tender or Reusable Document not found")
        
    doc_id = f"DOC-LINK-{db.query(TenderDocument).count() + 101}"
    linked_doc = TenderDocument(
        id=doc_id,
        tender_id=tender_id,
        name=master.name,
        folder=req.target_folder,
        size=master.size,
        revision=master.revision,
        sha256=master.sha256,
        uploaded_at=datetime.now().strftime("%Y-%m-%d"),
        is_reusable_link=True,
        reusable_source_id=master.id,
        access_level=master.access_level,
        file_path=master.file_path,
    )
    db.add(linked_doc)
    db.commit()
    db.refresh(linked_doc)
    return linked_doc

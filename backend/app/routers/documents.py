import os
import io
import zipfile
import secrets
import uuid
from typing import List, Optional
from datetime import datetime, timedelta
from datetime import datetime, timedelta, timezone
from pathlib import Path
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    Query,
    Request,
    status,
)
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.tender import Tender
from app.models.document import TenderDocument, TenderFolder, ReusableDocument
from app.models.permission import ResourceShare, PartnerOrganization
from app.services.authorization import AuthorizationService
from app.schemas.document import (
    DocumentOut,
    FolderCreate,
    FolderOut,
    ReusableDocCreate,
    ReusableDocOut,
    LinkReusableRequest,
    ResourceShareCreate,
    ResourceShareOut,
    PublicShareValidationOut,
)
from app.services.storage import (
    get_tender_storage_dir,
    get_master_library_dir,
    save_uploaded_file,
    safe_relocate_folder_files,
)

router = APIRouter(tags=["Document Vault & Master Library"])


@router.get("/tenders/{tender_id}/documents", response_model=List[DocumentOut])
def get_tender_documents(
    tender_id: str,
    user_id: Optional[str] = Query(None),
    partner_org_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    # If request is scoped to a partner organization, enforce anti-leakage isolation
    if partner_org_id:
        auth = AuthorizationService.authorize(
            db=db,
            user_id=user_id,
            permission_code="document.view",
            tender_id=tender_id,
            partner_org_id=partner_org_id,
        )
        if not auth.allowed:
            raise HTTPException(
                status_code=403,
                detail=auth.denial_message or "Access to tender documents denied.",
            )

        now = datetime.utcnow()
        active_shares = (
            db.query(ResourceShare)
            .filter(
                ResourceShare.tender_id == tender_id,
                ResourceShare.status == "ACTIVE",
                (ResourceShare.expires_at == None) | (ResourceShare.expires_at > now),
                (ResourceShare.shared_with_id == partner_org_id)
                | (ResourceShare.shared_with_type == "PUBLIC"),
                ResourceShare.can_view == True,
            )
            .all()
        )
        shared_doc_ids = {s.resource_id for s in active_shares}
        return (
            db.query(TenderDocument)
            .filter(
                TenderDocument.tender_id == tender_id,
                TenderDocument.id.in_(shared_doc_ids),
            )
            .all()
        )

    return db.query(TenderDocument).filter(TenderDocument.tender_id == tender_id).all()


@router.post(
    "/tenders/{tender_id}/documents/upload",
    response_model=DocumentOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_tender_document(
    tender_id: str,
    file: UploadFile = File(...),
    folder: str = Form("01_original_tender_documents"),
    access_level: str = Form("ALL_TEAM"),
    user_id: Optional[str] = Form(None),
    partner_org_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    if user_id or partner_org_id:
        auth = AuthorizationService.authorize(
            db=db,
            user_id=user_id,
            permission_code="document.upload",
            tender_id=tender_id,
            partner_org_id=partner_org_id,
        )
        if not auth.allowed:
            raise HTTPException(
                status_code=403,
                detail=auth.denial_message or "Document upload forbidden.",
            )

    target_dir = get_tender_storage_dir(tender_id) / folder
    filename, sha256_hash, size_bytes = await save_uploaded_file(file, target_dir)

    size_mb = (
        f"{size_bytes / (1024 * 1024):.1f} MB"
        if size_bytes >= 1024 * 1024
        else f"{size_bytes / 1024:.0f} KB"
    )
    doc_id = f"DOC-{db.query(TenderDocument).count() + 101}"
    doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"

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
def download_document(
    doc_id: str,
    user_id: Optional[str] = Query(None),
    partner_org_id: Optional[str] = Query(None),
    share_token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    doc = db.query(TenderDocument).filter(TenderDocument.id == doc_id).first()
    if not doc or not doc.file_path or not os.path.exists(doc.file_path):
        raise HTTPException(
            status_code=404, detail="Physical document file not found on disk"
        )

    if share_token:
        share = (
            db.query(ResourceShare).filter(ResourceShare.token == share_token).first()
        )
        now = datetime.utcnow()
        if not share or share.resource_id != doc_id or share.status != "ACTIVE":
            raise HTTPException(
                status_code=403, detail="Invalid or revoked share token"
            )
        if share.expires_at and share.expires_at < now:
            raise HTTPException(status_code=403, detail="Share token has expired")
        if not share.can_download:
            raise HTTPException(
                status_code=403,
                detail="Download permission not granted on this shared link",
            )
    elif partner_org_id:
        auth = AuthorizationService.authorize(
            db=db,
            user_id=user_id,
            permission_code="document.download",
            tender_id=doc.tender_id,
            resource_type="DOCUMENT",
            resource_id=doc_id,
            partner_org_id=partner_org_id,
        )
        if not auth.allowed:
            raise HTTPException(
                status_code=403,
                detail=auth.denial_message or "Document download forbidden",
            )

    return FileResponse(
        path=doc.file_path, filename=doc.name, media_type="application/octet-stream"
    )


@router.get("/tenders/{tender_id}/documents/zip")
def download_tender_zip(
    tender_id: str,
    folder: Optional[str] = None,
    db: Session = Depends(get_db),
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    query = db.query(TenderDocument).filter(TenderDocument.tender_id == tender_id)
    if folder and folder.upper() != "ALL":
        query = query.filter(TenderDocument.folder == folder)
        zip_filename = f"{tender_id}_{folder}.zip"
    else:
        zip_filename = f"{tender_id}_complete_vault.zip"

    docs = query.all()
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        manifest_lines = [
            f"TenderTracker Vault Archive: {tender_id}",
            f"Tender Title: {tender.title}",
            f"Organization: {tender.organization}",
            f"Archive Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Scope: {folder if folder and folder.upper() != 'ALL' else 'Complete Vault'}",
            f"Total Documents: {len(docs)}",
            "-" * 70,
            "FOLDER / FILENAME | SIZE | ACCESS | SHA-256 CHECKSUM",
            "-" * 70,
        ]

        for d in docs:
            arc_path = (
                d.name
                if (folder and folder.upper() != "ALL")
                else f"{d.folder}/{d.name}"
            )
            manifest_lines.append(
                f"{d.folder}/{d.name} | {d.size} | {d.access_level} | {d.sha256}"
            )

            if d.file_path and os.path.exists(d.file_path):
                zf.write(d.file_path, arc_path)
            else:
                content = (
                    f"TenderTracker Vault Document Record\n"
                    f"====================================\n"
                    f"Tender ID:    {tender_id}\n"
                    f"Document:     {d.name}\n"
                    f"Folder:       {d.folder}\n"
                    f"Access Level: {d.access_level}\n"
                    f"Revision:     {d.revision}\n"
                    f"SHA-256 Hash: {d.sha256}\n"
                    f"Uploaded At:  {d.uploaded_at}\n"
                    f"Size:         {d.size}\n"
                ).encode("utf-8")
                zf.writestr(arc_path, content)

        zf.writestr("VAULT_MANIFEST.txt", "\n".join(manifest_lines).encode("utf-8"))

    zip_buffer.seek(0)
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{zip_filename}"'},
    )


@router.get("/tenders/{tender_id}/folders/{folder_name}/zip")
def download_folder_zip(
    tender_id: str,
    folder_name: str,
    db: Session = Depends(get_db),
):
    return download_tender_zip(tender_id=tender_id, folder=folder_name, db=db)


# --- Custom Folders ---


@router.post(
    "/tenders/{tender_id}/folders",
    response_model=FolderOut,
    status_code=status.HTTP_201_CREATED,
)
def create_folder(
    tender_id: str, folder_in: FolderCreate, db: Session = Depends(get_db)
):
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
    (get_tender_storage_dir(tender_id) / folder_in.name).mkdir(
        parents=True, exist_ok=True
    )

    db.commit()
    db.refresh(folder)
    return folder


@router.delete(
    "/tenders/{tender_id}/folders/{folder_name}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_folder(tender_id: str, folder_name: str, db: Session = Depends(get_db)):
    # 1. Safely reassign documents in database
    db.query(TenderDocument).filter(
        TenderDocument.tender_id == tender_id, TenderDocument.folder == folder_name
    ).update({"folder": "01_original_tender_documents"})

    # 2. Safely relocate physical files on SSD
    safe_relocate_folder_files(tender_id, folder_name, "01_original_tender_documents")

    # 3. Remove folder record if custom
    db.query(TenderFolder).filter(
        TenderFolder.tender_id == tender_id, TenderFolder.name == folder_name
    ).delete()

    db.commit()
    return None


# --- Reusable Master Document Library ---


@router.get("/reusable-documents", response_model=List[ReusableDocOut])
def get_reusable_documents(
    category: Optional[str] = None, db: Session = Depends(get_db)
):
    query = db.query(ReusableDocument)
    if category and category.upper() != "ALL":
        query = query.filter(ReusableDocument.category == category)
    return query.order_by(ReusableDocument.uploaded_at.desc()).all()


@router.post(
    "/reusable-documents",
    response_model=ReusableDocOut,
    status_code=status.HTTP_201_CREATED,
)
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


@router.post(
    "/tenders/{tender_id}/link-reusable",
    response_model=DocumentOut,
    status_code=status.HTTP_201_CREATED,
)
def link_reusable_to_tender(
    tender_id: str, req: LinkReusableRequest, db: Session = Depends(get_db)
):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    master = (
        db.query(ReusableDocument)
        .filter(ReusableDocument.id == req.reusable_doc_id)
        .first()
    )
    if not tender or not master:
        raise HTTPException(
            status_code=404, detail="Tender or Reusable Document not found"
        )

    doc_id = f"DOC-LINK-{db.query(TenderDocument).count() + 101}"
    doc_id = f"DOC-LINK-{uuid.uuid4().hex[:8].upper()}"
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


# --- Resource Sharing Endpoints (Sections 20, 21, 30) ---


@router.post("/documents/{doc_id}/share", response_model=ResourceShareOut)
def create_document_share(
    doc_id: str,
    payload: ResourceShareCreate,
    shared_by_user_id: str = Query("SYSTEM_ADMIN"),
    db: Session = Depends(get_db),
):
    doc = db.query(TenderDocument).filter(TenderDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    token = secrets.token_urlsafe(24)
    expires_at = None
    if payload.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=payload.expires_in_days)

    share = ResourceShare(
        resource_type="DOCUMENT",
        resource_id=doc_id,
        tender_id=doc.tender_id,
        shared_by_user_id=shared_by_user_id,
        shared_with_type=payload.shared_with_type,
        shared_with_id=payload.shared_with_id,
        recipient_email=payload.recipient_email,
        can_view=payload.can_view,
        can_preview=payload.can_preview,
        can_download=payload.can_download,
        can_share=payload.can_reshare,
        token=token,
        expires_at=expires_at,
        status="ACTIVE",
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    return share


@router.get("/documents/{doc_id}/shares", response_model=List[ResourceShareOut])
def get_document_shares(doc_id: str, db: Session = Depends(get_db)):
    return (
        db.query(ResourceShare)
        .filter(ResourceShare.resource_id == doc_id, ResourceShare.status == "ACTIVE")
        .order_by(ResourceShare.created_at.desc())
        .all()
    )


@router.delete("/shares/{share_id}")
def revoke_share(
    share_id: int,
    revoked_by: str = Query("SYSTEM_ADMIN"),
    db: Session = Depends(get_db),
):
    share = db.query(ResourceShare).filter(ResourceShare.id == share_id).first()
    if not share:
        raise HTTPException(status_code=404, detail="Share record not found")

    share.status = "REVOKED"
    share.revoked_at = datetime.utcnow()
    share.revoked_by = revoked_by
    db.commit()
    return {"message": "Resource share successfully revoked", "share_id": share_id}


@router.get("/shared/{token}", response_model=PublicShareValidationOut)
def validate_shared_token(token: str, db: Session = Depends(get_db)):
    share = db.query(ResourceShare).filter(ResourceShare.token == token).first()
    if not share:
        raise HTTPException(status_code=404, detail="Shared link not found or invalid")

    now = datetime.utcnow()
    if share.status == "REVOKED":
        raise HTTPException(
            status_code=403, detail="This shared document link has been revoked."
        )

    if share.expires_at and share.expires_at < now:
        raise HTTPException(
            status_code=403, detail="This shared document link has expired."
        )

    doc = (
        db.query(TenderDocument).filter(TenderDocument.id == share.resource_id).first()
    )
    rud = None
    if not doc:
        rud = db.query(ReusableDocument).filter(ReusableDocument.id == share.resource_id).first()
        if not rud:
            raise HTTPException(
                status_code=404, detail="Associated document no longer exists."
            )

    tender = db.query(Tender).filter(Tender.id == share.tender_id).first() if share.tender_id else None

    return PublicShareValidationOut(
        token=token,
        document_id=doc.id if doc else rud.id,
        document_name=doc.name if doc else rud.name,
        tender_id=doc.tender_id if doc else (share.tender_id or "MASTER_LIBRARY"),
        tender_title=tender.title if tender else (share.tender_id or "Master Document Library"),
        folder=doc.folder if doc else rud.category,
        size=doc.size if doc else rud.size,
        sha256=doc.sha256 if doc else rud.sha256,
        can_view=share.can_view,
        can_download=share.can_download,
        expires_at=share.expires_at,
        status=share.status,
        shared_by=share.shared_by_user_id,
    )


@router.get("/shared/{token}/download")
def download_shared_file(token: str, db: Session = Depends(get_db)):
    share = db.query(ResourceShare).filter(ResourceShare.token == token).first()
    if not share:
        raise HTTPException(status_code=404, detail="Shared link not found or invalid")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if share.status == "REVOKED":
        raise HTTPException(status_code=403, detail="Share link has been revoked.")
    if share.expires_at and share.expires_at < now:
        raise HTTPException(status_code=403, detail="Share link has expired.")
    if not share.can_download:
        raise HTTPException(
            status_code=403,
            detail="Download permission not granted for this shared link.",
        )

    doc = (
        db.query(TenderDocument).filter(TenderDocument.id == share.resource_id).first()
    )
    file_path = doc.file_path if doc else None
    filename = doc.name if doc else None
    if not doc:
        rud = db.query(ReusableDocument).filter(ReusableDocument.id == share.resource_id).first()
        if rud:
            file_path = rud.file_path
            filename = rud.name

    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Document file not found on disk")

    return FileResponse(
        path=file_path, filename=filename or "document.bin", media_type="application/octet-stream"
    )

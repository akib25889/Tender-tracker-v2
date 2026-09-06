import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.company_credential import CompanyProjectCredential
from app.models.tender import Tender
from app.models.document import TenderDocument
from app.schemas.company_credential import (
    CompanyProjectCreate,
    CompanyProjectUpdate,
    CompanyProjectOut,
    LinkProjectToTenderRequest,
)
from app.services.storage import save_uploaded_file, get_tender_storage_dir

router = APIRouter(prefix="/companies", tags=["Company Credentials"])


def _get_safe_slug(text: str) -> str:
    return "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in text).strip("_") or "entity"


def _format_size(size_bytes: int) -> str:
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    return f"{size_bytes / 1024:.0f} KB"


@router.get("/projects", response_model=List[CompanyProjectOut])
def get_company_projects(
    company_name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(CompanyProjectCredential)
    if company_name and company_name.upper() != "ALL":
        query = query.filter(CompanyProjectCredential.company_name == company_name)
    return query.order_by(CompanyProjectCredential.created_at.desc()).all()


@router.post("/projects", response_model=CompanyProjectOut, status_code=status.HTTP_201_CREATED)
def create_company_project(
    data: CompanyProjectCreate,
    db: Session = Depends(get_db),
):
    project_id = f"PROJ-{uuid.uuid4().hex[:8].upper()}"
    custom_fields_dict = [f.model_dump() for f in (data.custom_fields or [])]

    new_project = CompanyProjectCredential(
        id=project_id,
        company_name=data.company_name,
        company_role=data.company_role,
        project_title=data.project_title,
        client_name=data.client_name,
        contract_value=data.contract_value,
        currency=data.currency,
        start_date=data.start_date,
        completion_date=data.completion_date,
        role_in_project=data.role_in_project,
        custom_fields=custom_fields_dict,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@router.put("/projects/{project_id}", response_model=CompanyProjectOut)
def update_company_project(
    project_id: str,
    data: CompanyProjectUpdate,
    db: Session = Depends(get_db),
):
    project = db.query(CompanyProjectCredential).filter(CompanyProjectCredential.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project credential not found")

    if data.project_title is not None:
        project.project_title = data.project_title
    if data.client_name is not None:
        project.client_name = data.client_name
    if data.contract_value is not None:
        project.contract_value = data.contract_value
    if data.currency is not None:
        project.currency = data.currency
    if data.start_date is not None:
        project.start_date = data.start_date
    if data.completion_date is not None:
        project.completion_date = data.completion_date
    if data.role_in_project is not None:
        project.role_in_project = data.role_in_project
    if data.company_role is not None:
        project.company_role = data.company_role
    if data.custom_fields is not None:
        project.custom_fields = [f.model_dump() for f in data.custom_fields]

    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company_project(
    project_id: str,
    db: Session = Depends(get_db),
):
    project = db.query(CompanyProjectCredential).filter(CompanyProjectCredential.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project credential not found")

    db.delete(project)
    db.commit()
    return None


@router.post("/projects/{project_id}/upload-work-order", response_model=CompanyProjectOut)
async def upload_work_order(
    project_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    project = db.query(CompanyProjectCredential).filter(CompanyProjectCredential.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project credential not found")

    safe_company = _get_safe_slug(project.company_name)
    target_dir = Path(settings.STORAGE_ROOT) / "companies" / safe_company / "projects" / project_id / "work_order"
    filename, sha256_hash, size_bytes = await save_uploaded_file(file, target_dir)

    project.work_order_filename = filename
    project.work_order_path = str(target_dir / filename)
    project.work_order_sha256 = sha256_hash
    project.work_order_size = _format_size(size_bytes)
    project.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(project)
    return project


@router.post("/projects/{project_id}/upload-completion-cert", response_model=CompanyProjectOut)
async def upload_completion_cert(
    project_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    project = db.query(CompanyProjectCredential).filter(CompanyProjectCredential.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project credential not found")

    safe_company = _get_safe_slug(project.company_name)
    target_dir = Path(settings.STORAGE_ROOT) / "companies" / safe_company / "projects" / project_id / "completion_cert"
    filename, sha256_hash, size_bytes = await save_uploaded_file(file, target_dir)

    project.completion_cert_filename = filename
    project.completion_cert_path = str(target_dir / filename)
    project.completion_cert_sha256 = sha256_hash
    project.completion_cert_size = _format_size(size_bytes)
    project.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(project)
    return project


@router.post("/projects/{project_id}/link-to-tender")
def link_project_to_tender(
    project_id: str,
    req: LinkProjectToTenderRequest,
    db: Session = Depends(get_db),
):
    project = db.query(CompanyProjectCredential).filter(CompanyProjectCredential.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project credential not found")

    tender = db.query(Tender).filter(Tender.id == req.tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    safe_company = _get_safe_slug(project.company_name)
    dest_dir = get_tender_storage_dir(req.tender_id) / req.target_folder / safe_company
    dest_dir.mkdir(parents=True, exist_ok=True)

    linked_docs = []
    now_str = datetime.now().strftime("%Y-%m-%d")

    # 1. Link Work Order if exists
    if project.work_order_path and os.path.exists(project.work_order_path):
        wo_dest_file = dest_dir / f"WO_{project.work_order_filename}"
        shutil.copy2(project.work_order_path, wo_dest_file)
        wo_doc = TenderDocument(
            id=f"DOC-{uuid.uuid4().hex[:8].upper()}",
            tender_id=req.tender_id,
            name=f"Work Order - {project.project_title} ({project.work_order_filename})",
            folder=req.target_folder,
            company_name=project.company_name,
            company_role=project.company_role,
            is_jv_partner=project.company_role == "JV_PARTNER",
            size=project.work_order_size or "1.5 MB",
            revision="v1.0",
            sha256=project.work_order_sha256 or "hash_placeholder",
            uploaded_at=now_str,
            access_level="ALL_TEAM",
            file_path=str(wo_dest_file),
        )
        db.add(wo_doc)
        linked_docs.append(wo_doc)

    # 2. Link Completion Certificate if exists
    if project.completion_cert_path and os.path.exists(project.completion_cert_path):
        cc_dest_file = dest_dir / f"CC_{project.completion_cert_filename}"
        shutil.copy2(project.completion_cert_path, cc_dest_file)
        cc_doc = TenderDocument(
            id=f"DOC-{uuid.uuid4().hex[:8].upper()}",
            tender_id=req.tender_id,
            name=f"Completion Certificate - {project.project_title} ({project.completion_cert_filename})",
            folder=req.target_folder,
            company_name=project.company_name,
            company_role=project.company_role,
            is_jv_partner=project.company_role == "JV_PARTNER",
            size=project.completion_cert_size or "1.2 MB",
            revision="v1.0",
            sha256=project.completion_cert_sha256 or "hash_placeholder",
            uploaded_at=now_str,
            access_level="ALL_TEAM",
            file_path=str(cc_dest_file),
        )
        db.add(cc_doc)
        linked_docs.append(cc_doc)

    # 3. Create Project Credential Factsheet summary document
    summary_filename = f"Project_Credential_{_get_safe_slug(project.project_title)}.txt"
    summary_file_path = dest_dir / summary_filename
    with open(summary_file_path, "w", encoding="utf-8") as f:
        f.write(f"PROJECT CREDENTIAL DOSSIER\n")
        f.write(f"===========================\n")
        f.write(f"Company: {project.company_name} ({project.company_role})\n")
        f.write(f"Project Title: {project.project_title}\n")
        f.write(f"Client/Employer: {project.client_name}\n")
        f.write(f"Contract Value: {project.currency} {project.contract_value:,.2f}\n")
        f.write(f"Timeline: {project.start_date or 'N/A'} to {project.completion_date or 'N/A'}\n")
        f.write(f"Role: {project.role_in_project}\n")
        if project.custom_fields:
            f.write(f"\nADDITIONAL CREDENTIAL FIELDS:\n")
            for field in project.custom_fields:
                f.write(f"- {field.get('name')}: {field.get('value')}\n")

    summary_doc = TenderDocument(
        id=f"DOC-{uuid.uuid4().hex[:8].upper()}",
        tender_id=req.tender_id,
        name=f"Credential Dossier - {project.project_title}",
        folder=req.target_folder,
        company_name=project.company_name,
        company_role=project.company_role,
        is_jv_partner=project.company_role == "JV_PARTNER",
        size="24 KB",
        revision="v1.0",
        sha256=uuid.uuid4().hex,
        uploaded_at=now_str,
        access_level="ALL_TEAM",
        file_path=str(summary_file_path),
    )
    db.add(summary_doc)
    linked_docs.append(summary_doc)

    db.commit()
    return {
        "status": "success",
        "message": f"Successfully linked {len(linked_docs)} document(s) for project '{project.project_title}' into tender {req.tender_id}",
        "linked_documents_count": len(linked_docs),
    }

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.company_profile import CompanyProfile
from app.schemas.company_profile import (
    CompanyProfileCreate,
    CompanyProfileUpdate,
    CompanyProfileOut,
)

router = APIRouter(prefix="/companies/profiles", tags=["Company Profiles"])


@router.get("", response_model=List[CompanyProfileOut])
def get_company_profiles(
    role: Optional[str] = Query(
        None, description="Filter by company role (e.g. LEAD_BIDDER, JV_PARTNER)"
    ),
    search: Optional[str] = Query(
        None, description="Search query across name, trade name, registration"
    ),
    db: Session = Depends(get_db),
):
    query = db.query(CompanyProfile)
    if role and role.upper() != "ALL":
        query = query.filter(CompanyProfile.company_role == role)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (CompanyProfile.legal_name.ilike(s))
            | (CompanyProfile.trade_name.ilike(s))
            | (CompanyProfile.registration_no.ilike(s))
            | (CompanyProfile.tin_number.ilike(s))
            | (CompanyProfile.bin_vat_number.ilike(s))
        )
    return query.order_by(
        CompanyProfile.company_role.asc(), CompanyProfile.legal_name.asc()
    ).all()


@router.get("/{company_id}", response_model=CompanyProfileOut)
def get_company_profile(
    company_id: str,
    db: Session = Depends(get_db),
):
    profile = db.query(CompanyProfile).filter(CompanyProfile.id == company_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company profile '{company_id}' not found",
        )
    return profile


@router.post("", response_model=CompanyProfileOut, status_code=status.HTTP_201_CREATED)
def create_company_profile(
    data: CompanyProfileCreate,
    db: Session = Depends(get_db),
):
    # Determine custom ID or generate one
    profile_id = data.id or f"COMP-{uuid.uuid4().hex[:8].upper()}"

    # Check if ID already exists
    existing = db.query(CompanyProfile).filter(CompanyProfile.id == profile_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Company profile with ID '{profile_id}' already exists",
        )

    # Convert custom_fields to json list of dicts
    custom_fields_dict = [f.model_dump() for f in (data.custom_fields or [])]

    new_profile = CompanyProfile(
        id=profile_id,
        legal_name=data.legal_name,
        trade_name=data.trade_name,
        company_role=data.company_role,
        entity_type=data.entity_type,
        registration_no=data.registration_no,
        incorporation_date=data.incorporation_date,
        country=data.country,
        status=data.status,
        business_nature=data.business_nature,
        logo_url=data.logo_url,
        tin_number=data.tin_number,
        bin_vat_number=data.bin_vat_number,
        trade_license_no=data.trade_license_no,
        trade_license_expiry=data.trade_license_expiry,
        trade_license_issuer=data.trade_license_issuer,
        tax_circle_zone=data.tax_circle_zone,
        rjsc_return_year=data.rjsc_return_year,
        irc_erc_no=data.irc_erc_no,
        registered_address=data.registered_address,
        operational_address=data.operational_address,
        official_email=data.official_email,
        billing_email=data.billing_email,
        phone=data.phone,
        fax=data.fax,
        website=data.website,
        contact_person_name=data.contact_person_name,
        contact_person_title=data.contact_person_title,
        contact_person_phone=data.contact_person_phone,
        contact_person_email=data.contact_person_email,
        signatory_name=data.signatory_name,
        signatory_title=data.signatory_title,
        signatory_nid=data.signatory_nid,
        power_of_attorney_ref=data.power_of_attorney_ref,
        bank_name=data.bank_name,
        bank_branch=data.bank_branch,
        bank_account_name=data.bank_account_name,
        bank_account_no=data.bank_account_no,
        routing_no=data.routing_no,
        swift_code=data.swift_code,
        audited_turnover_bdt=data.audited_turnover_bdt,
        audited_turnover_usd=data.audited_turnover_usd,
        bank_solvency_limit_bdt=data.bank_solvency_limit_bdt,
        paid_up_capital_bdt=data.paid_up_capital_bdt,
        authorized_capital_bdt=data.authorized_capital_bdt,
        credit_rating=data.credit_rating,
        credit_rating_validity=data.credit_rating_validity,
        certifications=data.certifications or [],
        core_competencies=data.core_competencies or [],
        total_employees=data.total_employees,
        certified_engineers=data.certified_engineers,
        custom_fields=custom_fields_dict,
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile


@router.put("/{company_id}", response_model=CompanyProfileOut)
def update_company_profile(
    company_id: str,
    data: CompanyProfileUpdate,
    db: Session = Depends(get_db),
):
    profile = db.query(CompanyProfile).filter(CompanyProfile.id == company_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company profile '{company_id}' not found",
        )

    update_dict = data.model_dump(exclude_unset=True)

    if "custom_fields" in update_dict and update_dict["custom_fields"] is not None:
        update_dict["custom_fields"] = [
            f if isinstance(f, dict) else f.model_dump()
            for f in update_dict["custom_fields"]
        ]

    for key, value in update_dict.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company_profile(
    company_id: str,
    db: Session = Depends(get_db),
):
    profile = db.query(CompanyProfile).filter(CompanyProfile.id == company_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company profile '{company_id}' not found",
        )

    db.delete(profile)
    db.commit()
    return None

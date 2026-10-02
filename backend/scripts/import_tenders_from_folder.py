import glob
import hashlib
import json
import os
import re
import shutil
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
import yaml

# Add backend directory to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import SessionLocal, Base, engine, run_migrations
from app.models.tender import Tender
from app.models.requirement import TenderRequirement
from app.models.document import TenderDocument

def clean_citations(text: str) -> str:
    if not text:
        return ""
    cleaned = re.sub(r'\[cite:\s*[\d,\s]+\]', '', text)
    cleaned = re.sub(r'\s{2,}', ' ', cleaned)
    return cleaned.strip()

def calculate_sha256(file_path: Path) -> str:
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def format_size(bytes_len: int) -> str:
    if bytes_len >= 1024 * 1024:
        return f"{bytes_len / (1024 * 1024):.1f} MB"
    return f"{max(1, round(bytes_len / 1024))} KB"

def parse_markdown_tender(file_path: Path):
    raw_content = file_path.read_text(encoding='utf-8', errors='ignore')
    
    if '```yaml' not in raw_content:
        raise ValueError(f"No YAML block in {file_path}")
    
    parts = raw_content.split('```yaml')
    md_content = parts[0]
    yaml_text = parts[1].split('```')[0]
    
    parsed_yaml = yaml.safe_load(yaml_text)
    t_data = parsed_yaml.get('tender_tracker_data', {})
    
    raw_id = str(t_data.get('id', '')).strip()
    if not raw_id:
        raise ValueError(f"No tender ID in {file_path}")
    tender_id = raw_id.replace('/', '-')
        
    title = clean_citations(t_data.get('title', ''))
    organization = clean_citations(t_data.get('organization', ''))
    ref_no = clean_citations(t_data.get('reference_no', '')) or raw_id
    country = clean_citations(t_data.get('country', ''))
    category = clean_citations(t_data.get('category', ''))
    if category.startswith("Telecommunications") and len(category) > 60:
        category = "Telecommunications & Call Center Services"
    classification = clean_citations(t_data.get('classification', 'SOFTWARE / IT RELATED'))
    
    main_idea_match = re.search(r'### Main Idea\s*\n(.*?)(?=\n###|\n##|\n---)', md_content, re.DOTALL)
    main_idea = clean_citations(main_idea_match.group(1)) if main_idea_match else ""
    
    tech_match = re.search(r'### Technical Requirements\s*\n(.*?)(?=\n###|\n##|\n---)', md_content, re.DOTALL)
    tech_reqs = []
    if tech_match:
        for line in tech_match.group(1).splitlines():
            line = line.strip()
            if line.startswith('- ') or line.startswith('* '):
                tech_reqs.append(clean_citations(line[2:]))
                
    tech_ment_match = re.search(r'### Software / Technology Mentioned\s*\n(.*?)(?=\n###|\n##|\n---)', md_content, re.DOTALL)
    tech_mentioned = []
    if tech_ment_match:
        for line in tech_ment_match.group(1).splitlines():
            line = line.strip()
            if line.startswith('- ') or line.startswith('* '):
                tech_mentioned.append(clean_citations(line[2:]))
                
    ops_match = re.search(r'### Operational / Service Requirements\s*\n(.*?)(?=\n###|\n##|\n---)', md_content, re.DOTALL)
    ops_reqs = []
    if ops_match:
        for line in ops_match.group(1).splitlines():
            line = line.strip()
            if line.startswith('- ') or line.startswith('* '):
                ops_reqs.append(clean_citations(line[2:]))

    sub_docs_match = re.search(r'## Documents Required in Submission\s*\n(.*?)(?=\n##|\n---)', md_content, re.DOTALL)
    submission_docs = []
    if sub_docs_match:
        for line in sub_docs_match.group(1).splitlines():
            line = line.strip()
            if line.startswith('- [ ]') or line.startswith('- [x]') or line.startswith('- '):
                item = re.sub(r'^- \[[ x]\]\s*', '', line)
                item = re.sub(r'^- \s*', '', item)
                item = clean_citations(item)
                if item:
                    submission_docs.append(item)
                    
    risks_match = re.search(r'## Key Risks / Important Points\s*\n(.*?)(?=\n##|\n---)', md_content, re.DOTALL)
    risks = []
    if risks_match:
        for line in risks_match.group(1).splitlines():
            line = line.strip()
            if line.startswith('- ') or line.startswith('* '):
                risks.append(clean_citations(line[2:]))
                
    mgmt_match = re.search(r'## Important for Management\s*\n(.*?)(?=\n##|\n---)', md_content, re.DOTALL)
    mgmt_highlights = []
    if mgmt_match:
        for line in mgmt_match.group(1).splitlines():
            line = line.strip()
            if line.startswith('- ') or line.startswith('* '):
                mgmt_highlights.append(clean_citations(line[2:]))
                
    proj_match = re.search(r'\|\s*\*\*Project Name\*\*\s*\|\s*([^|\n]+)', md_content)
    project_name = clean_citations(proj_match.group(1)) if proj_match else ""
    
    portal_match = re.search(r'\|\s*\*\*Portal / Source\*\*\s*\|\s*([^|\n]+)', md_content)
    portal = clean_citations(portal_match.group(1)) if portal_match else t_data.get('portal_url', '')

    period_match = re.search(r'-\s*\*\*Contract / Service Period:\*\*\s*([^\n]+)', md_content)
    contract_period = clean_citations(period_match.group(1)) if period_match else t_data.get('possible_period', '')
    
    payment_terms_match = re.search(r'-\s*\*\*Payment Terms:\*\*\s*([^\n]+)', md_content)
    payment_terms = clean_citations(payment_terms_match.group(1)) if payment_terms_match else ""

    sub_deadline_str = str(t_data.get('submission_deadline', '') or '')
    close_hour = str(t_data.get('close_hour', '23') or '23')
    close_minute = str(t_data.get('close_minute', '59') or '59')
    close_tz = str(t_data.get('close_timezone', 'UTC') or 'UTC')
    
    days_rem = 0
    hours_rem = 0
    full_iso_deadline = ""
    if sub_deadline_str:
        try:
            dl_date = datetime.strptime(sub_deadline_str[:10], "%Y-%m-%d")
            dl_full = dl_date.replace(hour=int(close_hour), minute=int(close_minute), tzinfo=timezone.utc)
            full_iso_deadline = dl_full.isoformat()
            now = datetime.now(timezone.utc)
            diff = dl_full - now
            total_sec = diff.total_seconds()
            if total_sec > 0:
                days_rem = int(total_sec // 86400)
                hours_rem = int((total_sec % 86400) // 3600)
            else:
                days_rem = 0
                hours_rem = 0
        except Exception:
            full_iso_deadline = f"{sub_deadline_str}T{close_hour}:{close_minute}:00Z"
    
    summary_payload = {
        "classification": classification,
        "projectName": project_name,
        "tenderIdDisplay": raw_id,
        "shortTitle": title[:100],
        "portal": portal,
        "publishedDate": str(t_data.get('published_date', '') or ''),
        "publishedHour": str(t_data.get('published_hour', '') or ''),
        "publishedMinute": str(t_data.get('published_minute', '') or ''),
        "publishedTimezone": str(t_data.get('published_timezone', '') or ''),
        "submissionTime": f"{close_hour}:{close_minute} {close_tz}",
        "closeHour": close_hour,
        "closeMinute": close_minute,
        "closeTimezone": close_tz,
        "mainIdea": main_idea,
        "commercial": {
            "tenderSecurity": str(t_data.get('tender_security_amount', '') or ''),
            "tenderSecurityAmount": float(t_data.get('tender_security_amount') or 0.0),
            "tenderSecurityMethod": t_data.get('tender_security_method') or '',
            "contractPeriod": contract_period,
            "tenderDocPrice": str(t_data.get('tender_doc_price', '') or ''),
            "schedulePurchaseDeadline": str(t_data.get('schedule_purchase_deadline', '') or ''),
            "schedulePurchaseMethod": t_data.get('schedule_purchase_method') or '',
            "performanceSecurity": str(t_data.get('performance_security', '') or ''),
            "maintenancePeriod": str(t_data.get('maintenance_period', '') or ''),
            "paymentTerms": payment_terms
        },
        "technicalReqs": tech_reqs,
        "technologyMentioned": tech_mentioned,
        "operationalReqs": ops_reqs,
        "eligibility": t_data.get('eligibility', {}),
        "jv": t_data.get('jv', {}),
        "submissionDocuments": submission_docs,
        "dates": {
            "clarificationDeadline": "",
            "submissionDeadline": full_iso_deadline or sub_deadline_str,
            "schedulePurchaseDeadline": str(t_data.get('schedule_purchase_deadline', '') or ''),
            "openingDate": str(t_data.get('opening_date', '') or ''),
            "contractSigningDate": str(t_data.get('contract_signing_date', '') or ''),
            "workStartDate": str(t_data.get('work_start_date', '') or ''),
            "productHandoverDate": str(t_data.get('product_handover_date', '') or ''),
            "maintenancePeriod": str(t_data.get('maintenance_period', '') or '')
        },
        "risks": risks,
        "managementHighlights": mgmt_highlights,
        "notes": "",
        "procurementManager": {
            "name": t_data.get('procurement_manager_name') or '',
            "designation": t_data.get('procurement_manager_designation') or '',
            "email": t_data.get('procurement_manager_email') or '',
            "phone": t_data.get('procurement_manager_phone') or ''
        },
        "helpline": {
            "phone": t_data.get('helpline_phone') or '',
            "email": t_data.get('helpline_email') or '',
            "hours": t_data.get('helpline_hours') or ''
        },
        "tenderType": t_data.get('tender_type') or 'Request for Proposal (RFP)',
        "budgetType": t_data.get('budget_type') or '',
        "sourceOfFund": t_data.get('source_of_fund') or '',
        "procurementMethod": t_data.get('procurement_method') or 'Request for Proposal (RFP)',
        "evaluationMethod": t_data.get('evaluation_method') or '',
        "financialModel": t_data.get('financial_model', {}),
        "aiChatShareLink": t_data.get('ai_chat_share_link') or ''
    }

    est_val = float(t_data.get('estimated_value') or 0.0)
    curr = str(t_data.get('currency', 'USD') or 'USD').upper()
    rate = float(t_data.get('exchange_rate_to_bdt') or (1.0 if curr == 'BDT' else 122.0))
    val_bdt = est_val if curr == 'BDT' else round(est_val * rate, 2)
    
    tender_record = {
        "id": tender_id,
        "reference_no": ref_no,
        "title": title,
        "organization": organization,
        "country": country,
        "category": category,
        "estimated_value": est_val,
        "currency": curr,
        "exchange_rate_to_bdt": rate,
        "exchange_rate_date": str(t_data.get('published_date', '') or ''),
        "estimated_value_bdt": val_bdt,
        "stage": t_data.get('stage', 'DISCOVERED'),
        "decision": t_data.get('decision', 'PENDING'),
        "priority": t_data.get('priority', 'MEDIUM'),
        "submission_deadline": full_iso_deadline or sub_deadline_str,
        "days_remaining": days_rem,
        "hours_remaining": hours_rem,
        "readiness_score": 15 if submission_docs else 10,
        "lead_owner_name": t_data.get('lead_owner_name') or 'NYK Advance Limited',
        "lead_owner_role": t_data.get('lead_owner_role') or 'Lead Bidder',
        "summary_json": json.dumps(summary_payload),
        "important_clauses": [
            {**c, "id": c.get("id") or f"clause-{uuid.uuid4().hex[:8]}"}
            if isinstance(c, dict) else c
            for c in (t_data.get("important_clauses") or [])
        ],
        "languages": t_data.get('languages') or [],
        "procurement_manager_name": t_data.get('procurement_manager_name'),
        "procurement_manager_designation": t_data.get('procurement_manager_designation'),
        "procurement_manager_email": t_data.get('procurement_manager_email'),
        "procurement_manager_phone": t_data.get('procurement_manager_phone'),
        "helpline_phone": t_data.get('helpline_phone'),
        "helpline_email": t_data.get('helpline_email'),
        "helpline_hours": t_data.get('helpline_hours'),
        "opening_date": str(t_data.get('opening_date', '') or ''),
        "contract_signing_date": str(t_data.get('contract_signing_date', '') or ''),
        "work_start_date": str(t_data.get('work_start_date', '') or ''),
        "possible_period": str(t_data.get('possible_period', '') or contract_period),
        "product_handover_date": str(t_data.get('product_handover_date', '') or ''),
        "maintenance_period": str(t_data.get('maintenance_period', '') or ''),
        "schedule_purchase_deadline": str(t_data.get('schedule_purchase_deadline', '') or ''),
        "schedule_purchase_method": t_data.get('schedule_purchase_method'),
        "tender_security_amount": float(t_data.get('tender_security_amount') or 0.0) if t_data.get('tender_security_amount') is not None else None,
        "tender_security_method": t_data.get('tender_security_method'),
        "tender_type": t_data.get('tender_type') or 'Request for Proposal (RFP)',
        "budget_type": t_data.get('budget_type'),
        "source_of_fund": t_data.get('source_of_fund'),
        "procurement_method": t_data.get('procurement_method') or 'Request for Proposal (RFP)',
        "evaluation_method": t_data.get('evaluation_method'),
        "ai_chat_share_link": t_data.get('ai_chat_share_link')
    }

    return {
        "tender": tender_record,
        "requirements": submission_docs,
        "source_file": file_path
    }

def import_all_tenders(tender_info_dir: Path, storage_root: Path):
    print("=" * 70)
    print(f"  Importing Tenders from: {tender_info_dir}")
    print(f"  Storage Root:           {storage_root}")
    print("=" * 70)
    
    files = sorted(tender_info_dir.glob("*.md"))
    if not files:
        print(f"No .md files found in {tender_info_dir}")
        return

    # Track unique tenders by ID
    unique_tenders = {}
    for f in files:
        try:
            parsed = parse_markdown_tender(f)
            tid = parsed["tender"]["id"]
            if tid not in unique_tenders:
                unique_tenders[tid] = parsed
        except Exception as e:
            print(f"Error parsing {f.name}: {e}")

    print(f"Found {len(unique_tenders)} unique tenders across {len(files)} files.")

    db = SessionLocal()
    try:
        from sqlalchemy import text
        Base.metadata.create_all(bind=engine)
        run_migrations()

        if engine.dialect.name == "mysql":
            for mod_sql in [
                "ALTER TABLE tenders MODIFY COLUMN title TEXT NULL",
                "ALTER TABLE tenders MODIFY COLUMN organization TEXT NULL",
                "ALTER TABLE tenders MODIFY COLUMN category TEXT NULL",
                "ALTER TABLE tenders MODIFY COLUMN country VARCHAR(255) NULL",
                "ALTER TABLE tenders MODIFY COLUMN tender_type TEXT NULL",
                "ALTER TABLE tenders MODIFY COLUMN budget_type TEXT NULL",
                "ALTER TABLE tenders MODIFY COLUMN source_of_fund TEXT NULL",
                "ALTER TABLE tenders MODIFY COLUMN procurement_method TEXT NULL",
                "ALTER TABLE tenders MODIFY COLUMN evaluation_method TEXT NULL",
                "ALTER TABLE tenders MODIFY COLUMN possible_period TEXT NULL",
                "ALTER TABLE tenders MODIFY COLUMN maintenance_period TEXT NULL",
                "ALTER TABLE tenders MODIFY COLUMN schedule_purchase_deadline TEXT NULL",
            ]:
                try:
                    db.execute(text(mod_sql))
                    db.commit()
                except Exception as ex:
                    print(f"Note on MySQL column alter: {ex}")

        # Clean up any legacy slash-containing tender IDs from the database
        try:
            slash_tenders = db.execute(text("SELECT id FROM tenders WHERE id LIKE '%/%'")).fetchall()
            for row in slash_tenders:
                st_id = row[0]
                print(f"Purging legacy slash tender: {st_id}")
                db.execute(text("DELETE FROM tender_requirements WHERE tender_id = :tid"), {"tid": st_id})
                db.execute(text("DELETE FROM tender_documents WHERE tender_id = :tid"), {"tid": st_id})
                db.execute(text("DELETE FROM tenders WHERE id = :tid"), {"tid": st_id})
            db.commit()
        except Exception as ex:
            print(f"Note on legacy slash cleanup: {ex}")
            db.rollback()

        success_count = 0
        for tid, data in unique_tenders.items():
            t_rec = data["tender"]
            req_list = data["requirements"]
            src_file = data["source_file"]

            # 1. Tender Upsert
            existing_tender = db.query(Tender).filter(Tender.id == tid).first()
            if existing_tender:
                print(f"Updating existing tender: {tid} - {t_rec['title'][:40]}...")
                for key, val in t_rec.items():
                    setattr(existing_tender, key, val)
                tender_obj = existing_tender
            else:
                print(f"Creating new tender: {tid} - {t_rec['title'][:40]}...")
                tender_obj = Tender(**t_rec)
                db.add(tender_obj)
            db.flush()

            # 2. Requirements
            # Clear old requirements for this tender to avoid duplicates
            db.query(TenderRequirement).filter(TenderRequirement.tender_id == tid).delete()
            for idx, req_title in enumerate(req_list, start=1):
                clean_title = clean_citations(req_title)[:250]
                cat = "Statutory Document"
                tl = clean_title.lower()
                if "financial" in tl or "price" in tl or "fee" in tl:
                    cat = "Financial Document"
                elif "technical" in tl or "methodology" in tl or "capability" in tl:
                    cat = "Technical Proposal"
                elif "cv" in tl or "personnel" in tl or "trainer" in tl:
                    cat = "Personnel / Key Staff"
                elif "sustainability" in tl or "iso" in tl or "certif" in tl:
                    cat = "Certifications & Compliance"

                req_obj = TenderRequirement(
                    id=f"REQ-{tid[:8]}-{idx:02d}-{uuid.uuid4().hex[:4]}",
                    tender_id=tid,
                    title=clean_title,
                    category=cat,
                    status="PENDING",
                    owner=t_rec.get("lead_owner_name") or "System Administrator"
                )
                db.add(req_obj)

            # 3. Store Original Tender Summary Document in Vault
            safe_tid = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in tid)
            target_vault_dir = storage_root / "tenders" / safe_tid / "01_original_tender_documents"
            target_vault_dir.mkdir(parents=True, exist_ok=True)

            doc_filename = f"Tender_Summary_{safe_tid}.md"
            dest_file = target_vault_dir / doc_filename
            shutil.copy2(src_file, dest_file)

            file_size = dest_file.stat().st_size
            file_sha = calculate_sha256(dest_file)
            size_str = format_size(file_size)

            # Check if document already exists
            existing_doc = db.query(TenderDocument).filter(
                TenderDocument.tender_id == tid,
                TenderDocument.name == doc_filename
            ).first()

            if not existing_doc:
                doc_obj = TenderDocument(
                    id=f"DOC-{uuid.uuid4().hex[:8].upper()}",
                    tender_id=tid,
                    name=doc_filename,
                    folder="01_original_tender_documents",
                    company_name=t_rec.get("lead_owner_name") or "NYK Advance Limited",
                    company_role="LEAD_BIDDER",
                    is_jv_partner=False,
                    size=size_str,
                    revision="v1.0",
                    sha256=file_sha,
                    uploaded_at=datetime.now().strftime("%Y-%m-%d"),
                    file_path=str(dest_file),
                    status="CLEARED"
                )
                db.add(doc_obj)
            else:
                existing_doc.size = size_str
                existing_doc.sha256 = file_sha
                existing_doc.file_path = str(dest_file)

            db.commit()
            success_count += 1
            print(f"  [OK] Successfully ingested {tid} with {len(req_list)} requirements and 1 vault document.")

        print("=" * 70)
        print(f"Import completed! Successfully imported {success_count} tenders.")
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"Database error during import: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    root_dir = Path(__file__).resolve().parent.parent.parent
    t_dir = root_dir / "tender info"
    s_root = root_dir / "storage"
    
    # Allow overriding directories from CLI args
    if len(sys.argv) > 1:
        t_dir = Path(sys.argv[1])
    if len(sys.argv) > 2:
        s_root = Path(sys.argv[2])
        
    import_all_tenders(t_dir, s_root)

import os
import shutil
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal, run_migrations
from app.services.seeder import seed_database

client = TestClient(app)


def setup_module():
    Base.metadata.create_all(bind=engine)
    run_migrations()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


def test_01_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_02_auth_and_team():
    # Test valid login
    login_payload = {
        "email": "sarah.jenkins@tendertracker.org",
        "password": "Password123!",
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    assert token_data["user"]["role"] == "BUSINESS_HEAD"

    # Test invalid login
    bad_login = {
        "email": "sarah.jenkins@tendertracker.org",
        "password": "WrongPassword!",
    }
    bad_res = client.post("/api/auth/login", json=bad_login)
    assert bad_res.status_code == 401

    # Test team roster
    team_res = client.get("/api/auth/team")
    assert team_res.status_code == 200
    team = team_res.json()
    assert len(team) >= 4


def test_03_tender_lifecycle_and_storage_provisioning():
    test_id = "TDR-E2E-TEST-01"
    # Ensure clean slate
    client.delete(f"/api/tenders/{test_id}")

    tender_payload = {
        "id": test_id,
        "title": "Multilateral Disaster Recovery Cloud Services",
        "organization": "Asian Development Bank (ADB)",
        "country": "Philippines",
        "category": "Cloud Infrastructure",
        "estimated_value": 7500000.0,
        "stage": "DISCOVERED",
        "priority": "HIGH",
        "days_remaining": 14,
        "hours_remaining": 336,
        "readiness_score": 50,
    }

    # Create tender
    create_res = client.post("/api/tenders", json=tender_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["id"] == test_id
    assert created["stage"] == "DISCOVERED"

    # Verify physical storage vault on disk
    vault_dir = Path(settings.STORAGE_ROOT) / "tenders" / test_id
    assert vault_dir.exists()
    assert (vault_dir / "01_original_tender_documents").exists()
    assert (vault_dir / "02_company_statutory_documents").exists()

    # Update tender stage (Advancing to PREPARATION with GO decision)
    update_payload = {
        "stage": "PREPARATION",
        "decision": "GO",
        "readiness_score": 75,
    }
    update_res = client.put(f"/api/tenders/{test_id}", json=update_payload)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["stage"] == "PREPARATION"
    assert updated["decision"] == "GO"
    assert updated["readiness_score"] == 75

    # Test Archive and Restore
    arc_res = client.post(f"/api/tenders/{test_id}/archive")
    assert arc_res.status_code == 200
    assert arc_res.json()["stage"] == "ARCHIVED"

    restore_res = client.post(f"/api/tenders/{test_id}/restore")
    assert restore_res.status_code == 200
    assert restore_res.json()["stage"] == "PREPARATION"


def test_04_tasks_and_deliverables():
    test_id = "TDR-E2E-TEST-01"
    task_payload = {
        "title": "Complete SLA Risk Assessment",
        "assignee": "Dr. Marcus Vance",
        "status": "TODO",
        "priority": "HIGH",
        "due_date": "2026-09-12",
    }

    create_res = client.post(f"/api/tasks/tender/{test_id}", json=task_payload)
    assert create_res.status_code == 201
    task = create_res.json()
    task_id = task["id"]
    assert task["tender_id"] == test_id
    assert task["status"] == "TODO"

    # Move task to IN_PROGRESS
    patch_res = client.patch(f"/api/tasks/{task_id}", json={"status": "IN_PROGRESS"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "IN_PROGRESS"


def test_05_document_vault_custom_folders_and_safe_deletion():
    test_id = "TDR-E2E-TEST-01"

    # 1. Test Reusable Document creation
    reusable_payload = {
        "name": "Corporate_ISO_27001_Master_Certificate.pdf",
        "category": "Certifications & ISO",
        "size": "2.4 MB",
        "access_level": "ALL_TEAM",
        "description": "Information security certification valid through 2028.",
    }
    rud_res = client.post("/api/reusable-documents", json=reusable_payload)
    assert rud_res.status_code == 201
    rud = rud_res.json()
    rud_id = rud["id"]

    # 2. Link reusable document into tender
    link_payload = {
        "reusable_doc_id": rud_id,
        "target_folder": "02_company_statutory_documents",
    }
    link_res = client.post(f"/api/tenders/{test_id}/link-reusable", json=link_payload)
    assert link_res.status_code == 201
    linked_doc = link_res.json()
    assert linked_doc["is_reusable_link"] is True
    assert linked_doc["reusable_source_id"] == rud_id

    # 3. Create Custom Folder
    folder_payload = {
        "name": "07_client_clarifications",
        "label": "Client Clarifications & Addenda",
    }
    folder_res = client.post(f"/api/tenders/{test_id}/folders", json=folder_payload)
    assert folder_res.status_code == 201
    assert folder_res.json()["name"] == "07_client_clarifications"

    # 4. Safe Delete Folder (documents inside should be relocated to 01_original_tender_documents)
    del_folder_res = client.delete(
        f"/api/tenders/{test_id}/folders/07_client_clarifications"
    )
    assert del_folder_res.status_code == 204

    # 5. Test Download Folder as ZIP
    folder_zip_res = client.get(
        f"/api/tenders/{test_id}/folders/02_company_statutory_documents/zip"
    )
    assert folder_zip_res.status_code == 200
    assert folder_zip_res.headers["content-type"] == "application/zip"
    assert folder_zip_res.content[:4] == b"PK\x03\x04"

    # 6. Test Download All Vault Folders as ZIP
    all_zip_res = client.get(f"/api/tenders/{test_id}/documents/zip")
    assert all_zip_res.status_code == 200
    assert all_zip_res.headers["content-type"] == "application/zip"
    assert all_zip_res.content[:4] == b"PK\x03\x04"


def test_06_team_comments_and_discussions():
    test_id = "TDR-E2E-TEST-01"
    comment_payload = {
        "tender_id": test_id,
        "author_name": "Tariq Al-Mansoor",
        "author_role": "SENIOR_MANAGER",
        "author_avatar": "TA",
        "content": "Commercial pricing modeling completed for Asian Development Bank proposal.",
    }
    post_res = client.post("/api/comments", json=comment_payload)
    assert post_res.status_code == 201
    cmt = post_res.json()
    assert cmt["tender_id"] == test_id
    assert "Asian Development Bank" in cmt["content"]

    # Get comments for this tender
    list_res = client.get(f"/api/comments?tender_id={test_id}")
    assert list_res.status_code == 200
    comments = list_res.json()
    assert len(comments) >= 1


def test_07_dashboard_stats():
    stats_res = client.get("/api/dashboard/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "totalPipelineValue" in stats
    assert stats["activeTendersCount"] >= 1
    assert "stageDistribution" in stats


def test_08_category_lifecycle():
    # 1. List seeded categories
    list_res = client.get("/api/categories")
    assert list_res.status_code == 200
    categories = list_res.json()
    assert len(categories) >= 5
    cat_names = [c["name"] for c in categories]
    assert "Software Development" in cat_names

    # 2. Create new category
    new_cat = {
        "name": "Biometric ID & Border Control",
        "description": "Automated border clearance gates and biometric verification systems.",
        "color_badge": "indigo",
    }
    create_res = client.post("/api/categories", json=new_cat)
    assert create_res.status_code == 201
    created = create_res.json()
    cat_id = created["id"]
    assert created["name"] == new_cat["name"]

    # 3. Update category
    update_res = client.put(
        f"/api/categories/{cat_id}",
        json={"name": "Biometrics & Border Security", "color_badge": "cyan"},
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["name"] == "Biometrics & Border Security"
    assert updated["color_badge"] == "cyan"

    # 4. Delete category
    del_res = client.delete(f"/api/categories/{cat_id}")
    assert del_res.status_code == 204

    # 5. Verify it's gone
    verify_res = client.get("/api/categories")
    remaining_names = [c["name"] for c in verify_res.json()]
    assert "Biometrics & Border Security" not in remaining_names


def test_09_system_settings_lifecycle():
    # 1. Get settings
    get_res = client.get("/api/settings")
    assert get_res.status_code == 200
    settings = get_res.json()
    assert "vault_path" in settings
    assert "alert_threshold_hours" in settings

    # 2. Update settings
    updates = {
        "vault_path": "H:/Tender tracker v2/storage/tenders_custom",
        "alert_threshold_hours": "36",
        "smtp_server": "smtp.company.org",
    }
    post_res = client.post("/api/settings", json=updates)
    assert post_res.status_code == 200
    updated = post_res.json()
    assert updated["vault_path"] == "H:/Tender tracker v2/storage/tenders_custom"
    assert updated["alert_threshold_hours"] == "36"
    assert updated["smtp_server"] == "smtp.company.org"

    # 3. Verify persistence
    verify_res = client.get("/api/settings")
    assert verify_res.status_code == 200
    assert verify_res.json()["alert_threshold_hours"] == "36"


def test_10_tender_submission_proof_lock():
    test_id = "TDR-E2E-TEST-01"
    # 1. Record submission proof
    payload = {
        "portal_reference": "UNGM-2026-CONF-99812",
        "submitted_by": "Sarah Jenkins",
        "receipt_sha256": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
        "receipt_path": "storage/tenders/TDR-E2E-TEST-01/06_submission_receipts/receipt.pdf",
    }
    sub_res = client.post(f"/api/tenders/{test_id}/submission", json=payload)
    assert sub_res.status_code == 201
    sub_data = sub_res.json()
    assert sub_data["tender_id"] == test_id
    assert sub_data["portal_reference"] == "UNGM-2026-CONF-99812"
    assert sub_data["status"] == "SUBMITTED_LOCKED"

    # 2. Verify tender stage transitioned to SUBMITTED and score=100
    t_res = client.get(f"/api/tenders/{test_id}")
    assert t_res.status_code == 200
    tender = t_res.json()
    assert tender["stage"] == "SUBMITTED"
    assert tender["readiness_score"] == 100

    # 3. Retrieve submission proof
    get_sub_res = client.get(f"/api/tenders/{test_id}/submission")
    assert get_sub_res.status_code == 200
    assert get_sub_res.json()["portal_reference"] == "UNGM-2026-CONF-99812"


def test_11_chat_channels_lifecycle():
    channel = "general-ops"
    # 1. Get seeded messages
    list_res = client.get(f"/api/chat/channels/{channel}/messages")
    assert list_res.status_code == 200
    messages = list_res.json()
    assert len(messages) >= 1

    # 2. Post new channel message
    payload = {
        "content": "Final compliance checks for DG DIGIT have passed.",
        "sender_name": "Elena Rostova",
        "sender_role": "TENDER_ANALYST",
        "sender_avatar": "ER",
    }
    post_res = client.post(f"/api/chat/channels/{channel}/messages", json=payload)
    assert post_res.status_code == 201
    created = post_res.json()
    assert created["channel_id"] == channel
    assert created["content"] == payload["content"]

    # 3. Verify retrieved list includes new message
    verify_res = client.get(f"/api/chat/channels/{channel}/messages")
    assert verify_res.status_code == 200
    contents = [m["content"] for m in verify_res.json()]
    assert payload["content"] in contents


def test_12_tender_currency_and_exchange_rate():
    test_id = "TDR-CURRENCY-TEST-01"
    # Ensure clean slate
    client.delete(f"/api/tenders/{test_id}")

    # 1. Create tender in EUR with manual rate
    payload = {
        "id": test_id,
        "title": "EU Climate Informatics Surveillance Platform",
        "organization": "European Environment Agency (EEA)",
        "country": "Denmark",
        "category": "Cloud Infrastructure",
        "estimated_value": 2500000.0,
        "currency": "EUR",
        "exchange_rate_to_bdt": 133.5,
        "exchange_rate_date": "2026-03-01",
        "stage": "DISCOVERED",
        "priority": "HIGH",
    }
    create_res = client.post("/api/tenders", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["id"] == test_id
    assert created["currency"] == "EUR"
    assert created["exchange_rate_to_bdt"] == 133.5
    assert created["exchange_rate_date"] == "2026-03-01"
    assert created["estimated_value_bdt"] == 333750000.0

    # 2. Retrieve tender and verify persistence in DB
    get_res = client.get(f"/api/tenders/{test_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["currency"] == "EUR"
    assert data["exchange_rate_to_bdt"] == 133.5
    assert data["estimated_value_bdt"] == 333750000.0

    # 3. Update tender to BDT
    update_res = client.put(
        f"/api/tenders/{test_id}",
        json={
            "currency": "BDT",
            "exchange_rate_to_bdt": 1.0,
            "estimated_value": 5000000.0,
        },
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["currency"] == "BDT"
    assert updated["exchange_rate_to_bdt"] == 1.0
    assert updated["estimated_value_bdt"] == 5000000.0

    # Clean up
    client.delete(f"/api/tenders/{test_id}")


def test_13_multi_company_document_disambiguation_and_jv():
    test_id = "TDR-MULTICOMPANY-01"
    # Ensure clean slate
    client.delete(f"/api/tenders/{test_id}")

    # 1. Create a tender with JV participation
    payload = {
        "id": test_id,
        "title": "National High-Speed Fiber Backbone EPC",
        "organization": "Bangladesh Telecommunications Company (BTCL)",
        "country": "Bangladesh",
        "category": "Telecommunications",
        "estimated_value": 45000000.0,
        "currency": "BDT",
        "stage": "PREPARATION",
        "priority": "CRITICAL",
    }
    create_res = client.post("/api/tenders", json=payload)
    assert create_res.status_code == 201

    # 2. Upload Trade_License_2026.pdf as Lead Bidder (PrimeTech Ltd)
    lead_file_content = b"PrimeTech Ltd Statutory Trade License 2026 - Official Copy"
    upload_lead_res = client.post(
        f"/api/tenders/{test_id}/documents/upload",
        data={
            "folder": "02_company_statutory_documents",
            "company_name": "PrimeTech Ltd",
            "company_role": "LEAD_BIDDER",
            "is_jv_partner": False,
        },
        files={
            "file": ("Trade_License_2026.pdf", lead_file_content, "application/pdf")
        },
    )
    assert upload_lead_res.status_code == 201
    lead_doc = upload_lead_res.json()
    assert lead_doc["name"] == "Trade_License_2026.pdf"
    assert lead_doc["company_name"] == "PrimeTech Ltd"
    assert lead_doc["company_role"] == "LEAD_BIDDER"
    assert lead_doc["is_jv_partner"] is False

    # 3. Upload identical filename Trade_License_2026.pdf as JV Partner (DataCore Systems Ltd)
    jv_file_content = (
        b"DataCore Systems Ltd Statutory Trade License 2026 - JV Partner Official"
    )
    upload_jv_res = client.post(
        f"/api/tenders/{test_id}/documents/upload",
        data={
            "folder": "02A_jv_partner_credentials",
            "company_name": "DataCore Systems Ltd",
            "company_role": "JV_PARTNER",
            "is_jv_partner": True,
        },
        files={"file": ("Trade_License_2026.pdf", jv_file_content, "application/pdf")},
    )
    assert upload_jv_res.status_code == 201
    jv_doc = upload_jv_res.json()
    assert jv_doc["name"] == "Trade_License_2026.pdf"
    assert jv_doc["company_name"] == "DataCore Systems Ltd"
    assert jv_doc["company_role"] == "JV_PARTNER"
    assert jv_doc["is_jv_partner"] is True

    # 4. Verify disk isolation: both physical files must exist in their own company folders and contain distinct content
    lead_disk_path = (
        Path(settings.STORAGE_ROOT)
        / "tenders"
        / test_id
        / "02_company_statutory_documents"
        / "PrimeTech_Ltd"
        / "Trade_License_2026.pdf"
    )
    jv_disk_path = (
        Path(settings.STORAGE_ROOT)
        / "tenders"
        / test_id
        / "02A_jv_partner_credentials"
        / "DataCore_Systems_Ltd"
        / "Trade_License_2026.pdf"
    )
    assert lead_disk_path.exists()
    assert jv_disk_path.exists()
    assert lead_disk_path != jv_disk_path
    assert lead_disk_path.read_bytes() == lead_file_content
    assert jv_disk_path.read_bytes() == jv_file_content

    # 5. Verify tender documents endpoint returns both documents with company metadata
    docs_res = client.get(f"/api/tenders/{test_id}/documents")
    assert docs_res.status_code == 200
    docs = docs_res.json()
    assert len(docs) >= 2
    doc_names = [d["name"] for d in docs]
    assert doc_names.count("Trade_License_2026.pdf") == 2

    # 6. Test reusable master document creation with JV partner ownership and linking
    reusable_payload = {
        "name": "DataCore_ISO_27001_Master_Certificate.pdf",
        "category": "Certifications & ISO",
        "company_name": "DataCore Systems Ltd",
        "company_role": "JV_PARTNER",
        "is_jv_partner": True,
        "access_level": "ALL_TEAM",
        "size": "1.8 MB",
    }
    create_reusable_res = client.post("/api/reusable-documents", json=reusable_payload)
    assert create_reusable_res.status_code == 201
    reusable_doc = create_reusable_res.json()
    assert reusable_doc["company_name"] == "DataCore Systems Ltd"
    assert reusable_doc["is_jv_partner"] is True

    # Link reusable into tender's JV folder
    link_res = client.post(
        f"/api/tenders/{test_id}/link-reusable",
        json={
            "reusable_doc_id": reusable_doc["id"],
            "target_folder": "02A_jv_partner_credentials",
        },
    )
    assert link_res.status_code == 201
    linked_doc = link_res.json()
    assert linked_doc["name"] == "DataCore_ISO_27001_Master_Certificate.pdf"
    assert linked_doc["company_name"] == "DataCore Systems Ltd"
    assert linked_doc["folder"] == "02A_jv_partner_credentials"
    assert linked_doc["is_jv_partner"] is True

    # Clean up
    client.delete(f"/api/tenders/{test_id}")


def test_14_company_project_credentials_and_custom_fields():
    # 1. Fetch seeded projects
    get_res = client.get("/api/companies/projects")
    assert get_res.status_code == 200
    projects = get_res.json()
    assert len(projects) >= 3

    # Filter by company
    lead_res = client.get("/api/companies/projects?company_name=PrimeTech%20Ltd")
    assert lead_res.status_code == 200
    lead_projs = lead_res.json()
    assert all(p["company_name"] == "PrimeTech Ltd" for p in lead_projs)

    # 2. Create a new Project Credential with dynamic custom fields
    new_project_payload = {
        "company_name": "PrimeTech Ltd",
        "company_role": "LEAD_BIDDER",
        "project_title": "Rooftop Solar SCADA & Energy Storage Microgrid",
        "client_name": "Sustainable and Renewable Energy Development Authority (SREDA)",
        "contract_value": 18500000.0,
        "currency": "BDT",
        "start_date": "2024-03-01",
        "completion_date": "2025-08-31",
        "role_in_project": "EPC Turnkey Prime Contractor",
        "custom_fields": [
            {
                "id": "cf-test-1",
                "name": "Supervising Consultant",
                "value": "Fichtner GmbH & Co. KG",
            },
            {
                "id": "cf-test-2",
                "name": "Battery Storage Capacity",
                "value": "2.5 MWh Lithium Iron Phosphate",
            },
        ],
    }
    create_res = client.post("/api/companies/projects", json=new_project_payload)
    assert create_res.status_code == 201
    created_proj = create_res.json()
    proj_id = created_proj["id"]
    assert created_proj["project_title"] == new_project_payload["project_title"]
    assert len(created_proj["custom_fields"]) == 2
    assert created_proj["custom_fields"][0]["name"] == "Supervising Consultant"

    # 3. Update project details and dynamic custom fields (edit & delete fields)
    update_payload = {
        "contract_value": 19200000.0,
        "custom_fields": [
            {
                "id": "cf-test-1",
                "name": "Lead Consultant",
                "value": "Fichtner GmbH (Berlin)",
            },
            {
                "id": "cf-test-3",
                "name": "Inverter Topology",
                "value": "SMA Sunny Central 2500-EV",
            },
        ],
    }
    update_res = client.put(f"/api/companies/projects/{proj_id}", json=update_payload)
    assert update_res.status_code == 200
    updated_proj = update_res.json()
    assert updated_proj["contract_value"] == 19200000.0
    assert len(updated_proj["custom_fields"]) == 2
    assert updated_proj["custom_fields"][0]["name"] == "Lead Consultant"

    # 4. Upload Work Order file
    wo_content = (
        b"SREDA Official Work Order for Microgrid EPC Contract - Signed by Chairman"
    )
    upload_wo_res = client.post(
        f"/api/companies/projects/{proj_id}/upload-work-order",
        files={
            "file": ("SREDA_WO_Microgrid_Signed.pdf", wo_content, "application/pdf")
        },
    )
    assert upload_wo_res.status_code == 200
    proj_with_wo = upload_wo_res.json()
    assert proj_with_wo["work_order_filename"] == "SREDA_WO_Microgrid_Signed.pdf"
    assert proj_with_wo["work_order_sha256"] is not None

    # 5. Upload Completion Certificate file
    cc_content = (
        b"SREDA Final Commercial Operational Acceptance and Performance Certificate"
    )
    upload_cc_res = client.post(
        f"/api/companies/projects/{proj_id}/upload-completion-cert",
        files={
            "file": (
                "SREDA_Final_Completion_Certificate.pdf",
                cc_content,
                "application/pdf",
            )
        },
    )
    assert upload_cc_res.status_code == 200
    proj_with_cc = upload_cc_res.json()
    assert (
        proj_with_cc["completion_cert_filename"]
        == "SREDA_Final_Completion_Certificate.pdf"
    )
    assert proj_with_cc["completion_cert_sha256"] is not None

    # 6. Link project credential into a tender submission dossier
    tender_id = "TDR-SUBMISSION-TEST-01"
    client.delete(f"/api/tenders/{tender_id}")
    client.post(
        "/api/tenders",
        json={
            "id": tender_id,
            "title": "National Renewable Energy Microgrid Framework",
            "organization": "Power Division, MPEMR",
            "country": "Bangladesh",
            "category": "Renewable Energy",
            "estimated_value": 75000000.0,
            "currency": "BDT",
            "stage": "PREPARATION",
            "priority": "HIGH",
        },
    )

    link_res = client.post(
        f"/api/companies/projects/{proj_id}/link-to-tender",
        json={
            "tender_id": tender_id,
            "target_folder": "03_technical_proposal",
        },
    )
    assert link_res.status_code == 200
    link_data = link_res.json()
    assert link_data["status"] == "success"
    assert link_data["linked_documents_count"] >= 3  # WO + CC + Factsheet

    # Verify documents appear in tender proposal
    tender_docs_res = client.get(f"/api/tenders/{tender_id}/documents")
    assert tender_docs_res.status_code == 200
    tender_docs = tender_docs_res.json()
    doc_names = [d["name"] for d in tender_docs]
    assert any("Work Order" in name for name in doc_names)
    assert any("Completion Certificate" in name for name in doc_names)
    assert any("Credential Dossier" in name for name in doc_names)

    # Clean up
    client.delete(f"/api/companies/projects/{proj_id}")
    client.delete(f"/api/tenders/{tender_id}")


def test_15_tender_important_clauses_with_doc_reference():
    tender_id = "TDR-CLAUSES-TEST-01"
    client.delete(f"/api/tenders/{tender_id}")

    clauses_payload = [
        {
            "id": "clause-01",
            "clause_title": "Bid Security Bank Guarantee Requirement",
            "category": "FINANCIAL",
            "criticality": "CRITICAL",
            "doc_reference": "Section 2 (ITB) Clause 14.1",
            "doc_file_name": "RFP_Volume_1_ITB.pdf",
            "page_number": "Page 28",
            "clause_text": "The Bidder shall furnish as part of its Bid, a Bid Security in the amount of BDT 2,500,000 in the form of an unconditional and irrevocable Bank Guarantee from any scheduled bank of Bangladesh.",
            "implication": "Mandatory blocker. Must initiate Bank Guarantee application 10 days before tender submission deadline.",
        },
        {
            "id": "clause-02",
            "clause_title": "Liquidated Damages & Maximum Delay Cap",
            "category": "PENALTY",
            "criticality": "HIGH",
            "doc_reference": "Section 4 (GCC) Clause 27.1 & PCC Clause 19",
            "doc_file_name": "Tender_Document_GCC_PCC.pdf",
            "page_number": "Page 64",
            "clause_text": "Liquidated damages shall apply at 0.5% of the contract price per week of delay up to a maximum deduction of 10% of the total contract price.",
            "implication": "High risk. Project schedule must include 3 weeks buffer to prevent LD deduction.",
        },
    ]

    create_res = client.post(
        "/api/tenders",
        json={
            "id": tender_id,
            "title": "National Data Center High Availability Expansion",
            "organization": "Bangladesh Computer Council",
            "country": "Bangladesh",
            "category": "Information Technology",
            "estimated_value": 35000000.0,
            "currency": "BDT",
            "stage": "PREPARATION",
            "priority": "HIGH",
            "important_clauses": clauses_payload,
        },
    )
    assert create_res.status_code == 201
    tender_data = create_res.json()
    assert len(tender_data["important_clauses"]) == 2
    assert (
        tender_data["important_clauses"][0]["doc_reference"]
        == "Section 2 (ITB) Clause 14.1"
    )
    assert (
        tender_data["important_clauses"][0]["doc_file_name"] == "RFP_Volume_1_ITB.pdf"
    )
    assert tender_data["important_clauses"][0]["criticality"] == "CRITICAL"

    # Verify retrieval via GET
    get_res = client.get(f"/api/tenders/{tender_id}")
    assert get_res.status_code == 200
    retrieved = get_res.json()
    assert len(retrieved["important_clauses"]) == 2
    assert retrieved["important_clauses"][1]["category"] == "PENALTY"
    assert retrieved["important_clauses"][1]["page_number"] == "Page 64"

    # Add a third clause via PUT
    updated_clauses = clauses_payload + [
        {
            "id": "clause-03",
            "clause_title": "Manufacturer Authorization Form (MAF)",
            "category": "TECHNICAL_MANDATORY",
            "criticality": "CRITICAL",
            "doc_reference": "Section 3 (Evaluation) Clause 4.2(b)",
            "doc_file_name": "TOR_Specifications.pdf",
            "page_number": "Page 42",
            "clause_text": "Bidders must submit direct OEM Manufacturer's Authorization Form for all active routing and firewall hardware.",
            "implication": "Must obtain signoff from Cisco / Fortinet OEM regional team prior to bid packaging.",
        }
    ]

    put_res = client.put(
        f"/api/tenders/{tender_id}",
        json={"important_clauses": updated_clauses},
    )
    assert put_res.status_code == 200
    updated_data = put_res.json()
    assert len(updated_data["important_clauses"]) == 3
    assert (
        updated_data["important_clauses"][2]["clause_title"]
        == "Manufacturer Authorization Form (MAF)"
    )

    # Clean up
    client.delete(f"/api/tenders/{tender_id}")


def test_16_document_update_delete_and_sharing_to_db():
    tender_id = "TDR-DOC-TEST-01"
    client.delete(f"/api/tenders/{tender_id}")

    # 1. Create a test tender
    create_res = client.post(
        "/api/tenders",
        json={
            "id": tender_id,
            "title": "Document Lifecycle and Sharing Integration",
            "organization": "Cabinet Division",
            "country": "Bangladesh",
            "category": "Governance",
            "stage": "PREPARATION",
            "priority": "HIGH",
        },
    )
    assert create_res.status_code == 201

    # 2. Upload document
    upload_res = client.post(
        f"/api/tenders/{tender_id}/documents/upload",
        data={
            "folder": "01_original_tender_documents",
            "access_level": "ALL_TEAM",
        },
        files={
            "file": ("Legal_Charter.pdf", b"Legal Charter content", "application/pdf")
        },
    )
    assert upload_res.status_code == 201
    doc_data = upload_res.json()
    doc_id = doc_data["id"]

    # 3. PATCH document (move folder and elevate access)
    patch_res = client.patch(
        f"/api/documents/{doc_id}",
        json={
            "folder": "02_company_statutory_documents",
            "access_level": "MANAGEMENT_ONLY",
        },
    )
    assert patch_res.status_code == 200
    patched_data = patch_res.json()
    assert patched_data["folder"] == "02_company_statutory_documents"
    assert patched_data["access_level"] == "MANAGEMENT_ONLY"

    # 4. Share document (creates record in resource_shares table)
    share_res = client.post(
        f"/api/documents/{doc_id}/share",
        json={
            "shared_with_type": "USER",
            "recipient_email": "auditor@external-review.org",
            "can_download": True,
            "expires_in_days": 7,
        },
    )
    assert share_res.status_code == 200
    share_data = share_res.json()
    assert share_data["recipient_email"] == "auditor@external-review.org"
    assert share_data["token"] is not None

    # 5. Delete document
    del_doc_res = client.delete(f"/api/documents/{doc_id}")
    assert del_doc_res.status_code == 204

    # 6. Test reusable document lifecycle (create, patch, delete)
    rud_res = client.post(
        "/api/reusable-documents",
        json={
            "name": "Global_Quality_Audit_2026.pdf",
            "category": "Certifications",
            "access_level": "ALL_TEAM",
        },
    )
    assert rud_res.status_code == 201
    rud_data = rud_res.json()
    rud_id = rud_data["id"]

    rud_patch_res = client.patch(
        f"/api/reusable-documents/{rud_id}",
        json={"access_level": "EXECUTIVE_ONLY"},
    )
    assert rud_patch_res.status_code == 200
    assert rud_patch_res.json()["access_level"] == "EXECUTIVE_ONLY"

    rud_del_res = client.delete(f"/api/reusable-documents/{rud_id}")
    assert rud_del_res.status_code == 204

    # Clean up tender
    client.delete(f"/api/tenders/{tender_id}")


def test_17_company_profiles_crud():
    # 1. Verify GET /api/companies/profiles
    list_res = client.get("/api/companies/profiles")
    assert list_res.status_code == 200
    profiles = list_res.json()
    assert len(profiles) >= 2
    pt = next((p for p in profiles if p["id"] == "COMP-PRIMETECH"), None)
    assert pt is not None
    assert pt["company_role"] == "LEAD_BIDDER"
    assert pt["tin_number"] == "817294029148"
    assert pt["bank_name"] == "Eastern Bank PLC"
    assert len(pt["custom_fields"]) >= 4

    # 2. Verify GET specific profile
    single_res = client.get("/api/companies/profiles/COMP-PRIMETECH")
    assert single_res.status_code == 200
    assert single_res.json()["legal_name"] == "PrimeTech Solutions Limited"

    # 3. Create new Company Profile (JV Partner)
    test_id = "COMP-TEST-APEX"
    client.delete(f"/api/companies/profiles/{test_id}")

    create_payload = {
        "id": test_id,
        "legal_name": "Apex Global Engineering Ltd",
        "trade_name": "Apex Engineering",
        "company_role": "JV_PARTNER",
        "entity_type": "Private Limited Company",
        "registration_no": "C-998811/2019",
        "incorporation_date": "2019-05-10",
        "country": "Bangladesh",
        "status": "ACTIVE",
        "business_nature": "High-Voltage Substation Infrastructure & Civil Engineering Works",
        "tin_number": "918237461928",
        "bin_vat_number": "003829103-0303",
        "trade_license_no": "TRAD/DNCC/088192/2025",
        "trade_license_expiry": "2026-06-30",
        "trade_license_issuer": "Dhaka North City Corporation",
        "registered_address": "House 14, Road 3, Sector 9, Uttara, Dhaka",
        "official_email": "tenders@apex-eng.com.bd",
        "phone": "+880-2-8921040",
        "bank_name": "Standard Chartered Bank",
        "bank_branch": "Gulshan Branch",
        "bank_account_no": "018291039481",
        "routing_no": "195260192",
        "swift_code": "SCBLBDDH",
        "audited_turnover_bdt": 45000000.0,
        "audited_turnover_usd": 368852.0,
        "bank_solvency_limit_bdt": 20000000.0,
        "credit_rating": "A- (Long Term)",
        "certifications": ["ISO 9001:2015", "IEB Corporate Member"],
        "core_competencies": ["132/33kV Substation EPC", "Transmission Line Towers"],
        "total_employees": 52,
        "certified_engineers": 18,
        "custom_fields": [
            {
                "id": "cf-apex-1",
                "name": "Civil Work License Category",
                "value": "Grade-1 Building & Electrical Contractor",
            },
            {
                "id": "cf-apex-2",
                "name": "Heavy Machinery Fleet Count",
                "value": "12 Hydraulic Cranes & Piling Rigs",
            },
        ],
    }

    create_res = client.post("/api/companies/profiles", json=create_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["id"] == test_id
    assert created["legal_name"] == "Apex Global Engineering Ltd"
    assert len(created["custom_fields"]) == 2

    # 4. PUT update Company Profile
    update_res = client.put(
        f"/api/companies/profiles/{test_id}",
        json={
            "bank_solvency_limit_bdt": 25000000.0,
            "status": "VERIFIED",
            "custom_fields": [
                {
                    "id": "cf-apex-1",
                    "name": "Civil Work License Category",
                    "value": "Grade-1 Building & Electrical Contractor (Special Class)",
                },
                {
                    "id": "cf-apex-2",
                    "name": "Heavy Machinery Fleet Count",
                    "value": "15 Hydraulic Cranes & Piling Rigs",
                },
                {
                    "id": "cf-apex-3",
                    "name": "Environmental Safety Rating",
                    "value": "Green Category Department of Environment",
                },
            ],
        },
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["bank_solvency_limit_bdt"] == 25000000.0
    assert updated["status"] == "VERIFIED"
    assert len(updated["custom_fields"]) == 3

    # 5. Search filtering
    filter_res = client.get("/api/companies/profiles?search=Apex")
    assert filter_res.status_code == 200
    assert any(p["id"] == test_id for p in filter_res.json())

    # 6. DELETE Company Profile
    del_res = client.delete(f"/api/companies/profiles/{test_id}")
    assert del_res.status_code == 204

    # Verify 404 after delete
    get_del = client.get(f"/api/companies/profiles/{test_id}")
    assert get_del.status_code == 404


def test_18_document_reupload_request_workflow():
    """Test requesting document upload, requesting re-upload with comment, and resolving revision."""
    tenders_res = client.get("/api/tenders")
    assert tenders_res.status_code == 200
    tenders_list = tenders_res.json()
    if tenders_list:
        tender_id = tenders_list[0]["id"]
    else:
        tender_id = "TDR-TEST-REUPLOAD-01"
        client.post(
            "/api/tenders",
            json={
                "id": tender_id,
                "title": "Test Tender for Re-upload Workflow",
                "organization": "UNDP Bangladesh",
                "country": "Bangladesh",
                "category": "ICT Systems",
                "estimated_value": 500000.0,
                "stage": "PREPARATION",
                "priority": "HIGH",
                "days_remaining": 10,
                "hours_remaining": 240,
                "readiness_score": 60,
            },
        )

    # 1. Request a new missing document from JV partner
    new_doc_req = client.post(
        "/api/documents/request-upload",
        json={
            "tender_id": tender_id,
            "title": "Manufacturer Authorization Form (MAF) - CISCO",
            "folder": "03_technical_specifications_compliance",
            "company_name": "DataCore Systems Ltd",
            "company_role": "JV_PARTNER",
            "instructions": "Official OEM authorization letter signed by Country Director for Bangladesh.",
            "due_date": "T-48h",
            "requested_by": "Mark D. (Prime Lead)",
        },
    )
    assert new_doc_req.status_code == 201
    created_req = new_doc_req.json()
    doc_id = created_req["id"]
    assert created_req["status"] == "ACTION_REQUIRED"
    assert created_req["revision"] == "v0.0 (Requested)"
    assert created_req["company_name"] == "DataCore Systems Ltd"
    assert "Official OEM authorization" in created_req["action_comment"]

    # 2. Resolve the requested document with initial upload
    file_bytes = b"%PDF-1.4 Mock Manufacturer Authorization Form Content"
    upload_res = client.post(
        f"/api/documents/{doc_id}/resolve-reupload",
        files={"file": ("MAF_Cisco_Partner_Signed.pdf", file_bytes, "application/pdf")},
        data={"comment": "Signed digital copy received from Singapore regional desk."},
    )
    assert upload_res.status_code == 200
    uploaded_doc = upload_res.json()
    assert uploaded_doc["status"] == "PENDING_REVIEW"
    assert uploaded_doc["revision"] == "v1.0"
    assert uploaded_doc["sha256"] != "PENDING_UPLOAD"
    assert "Revised: Signed digital copy" in uploaded_doc["action_comment"]

    # 3. Prime Lead inspects and requests a RE-UPLOAD with specific reason & comment
    reupload_res = client.post(
        f"/api/documents/{doc_id}/request-reupload",
        json={
            "reason": "Missing Auditor Stamp",
            "comment": "Page 2 is missing the official notary seal. Please re-scan with seal attached.",
            "due_date": "T-24h",
            "requested_by": "Mark D. (Prime Lead)",
        },
    )
    assert reupload_res.status_code == 200
    flagged = reupload_res.json()
    assert flagged["status"] == "ACTION_REQUIRED"
    assert "[Missing Auditor Stamp]" in flagged["action_comment"]
    assert flagged["action_due_date"] == "T-24h"

    # 4. Partner re-uploads the certified revision (bumps to v1.1)
    revision_bytes = (
        b"%PDF-1.4 Mock Manufacturer Authorization Form with Notary Seal Added"
    )
    reupload_submit = client.post(
        f"/api/documents/{doc_id}/resolve-reupload",
        files={
            "file": (
                "MAF_Cisco_Partner_Signed_Notarized_v1.1.pdf",
                revision_bytes,
                "application/pdf",
            )
        },
        data={
            "comment": "Notary seal affixed on page 2 by Supreme Court Notary Public."
        },
    )
    assert reupload_submit.status_code == 200
    resolved = reupload_submit.json()
    assert resolved["status"] == "PENDING_REVIEW"
    assert resolved["revision"] == "v1.1"
    assert "Notary seal affixed" in resolved["action_comment"]


def test_19_procurement_manager_and_helpline_details():
    """Verify official Procurement Manager & Helpline details persist, update, and return in API."""
    tender_id = "TDR-TEST-PROC-MGR-01"
    client.delete(f"/api/tenders/{tender_id}")

    # 1. Create tender with procurement manager and helpline
    create_payload = {
        "id": tender_id,
        "title": "Smart City Intelligent Transport System Tender",
        "organization": "Dhaka Transport Coordination Authority (DTCA)",
        "country": "Bangladesh",
        "category": "Traffic & IoT Systems",
        "currency": "BDT",
        "estimated_value": 45000000.0,
        "procurement_manager_name": "Engr. Rafiqul Islam",
        "procurement_manager_designation": "Superintending Engineer (Procurement)",
        "procurement_manager_email": "rafiqul.islam@dtca.gov.bd",
        "procurement_manager_phone": "+880 1711-234567",
        "helpline_phone": "+880 2 9568741",
        "helpline_email": "helpdesk@dtca.gov.bd",
        "helpline_hours": "09:00 AM - 05:00 PM BST (Sun-Thu)",
    }
    create_res = client.post("/api/tenders", json=create_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["procurement_manager_name"] == "Engr. Rafiqul Islam"
    assert (
        created["procurement_manager_designation"]
        == "Superintending Engineer (Procurement)"
    )
    assert created["procurement_manager_email"] == "rafiqul.islam@dtca.gov.bd"
    assert created["procurement_manager_phone"] == "+880 1711-234567"
    assert created["helpline_phone"] == "+880 2 9568741"
    assert created["helpline_email"] == "helpdesk@dtca.gov.bd"
    assert created["helpline_hours"] == "09:00 AM - 05:00 PM BST (Sun-Thu)"

    # 2. Get tender by ID and verify persistence
    get_res = client.get(f"/api/tenders/{tender_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["procurement_manager_name"] == "Engr. Rafiqul Islam"
    assert fetched["helpline_phone"] == "+880 2 9568741"

    # 3. Update procurement manager and helpline details
    update_res = client.put(
        f"/api/tenders/{tender_id}",
        json={
            "procurement_manager_name": "Engr. Tanjina Akter",
            "procurement_manager_designation": "Director (Procurement & Contracts)",
            "helpline_phone": "16123 (Toll Free Hotline)",
        },
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["procurement_manager_name"] == "Engr. Tanjina Akter"
    assert (
        updated["procurement_manager_designation"]
        == "Director (Procurement & Contracts)"
    )
    assert updated["helpline_phone"] == "16123 (Toll Free Hotline)"
    # Retains previous unchanged fields
    assert updated["helpline_email"] == "helpdesk@dtca.gov.bd"


def test_20_procurement_milestones_and_commercial_calculator():
    """Test Req #20 & Req #17: Full lifecycle procurement milestones, commercial security deposit terms & post-award execution tracking."""
    test_id = "TDR-TEST-MILESTONES-20"
    client.delete(f"/api/tenders/{test_id}")

    from datetime import date, timedelta

    today = date.today().isoformat()
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    next_month = (date.today() + timedelta(days=30)).isoformat()

    create_payload = {
        "id": test_id,
        "title": "National High-Speed Transit Ticketing Infrastructure",
        "organization": "Bangladesh Railway",
        "country": "Bangladesh",
        "category": "Smart Mobility & Ticketing",
        "estimated_value": 10000000.0,
        "currency": "BDT",
        "opening_date": today,
        "contract_signing_date": next_month,
        "work_start_date": (date.today() + timedelta(days=45)).isoformat(),
        "possible_period": "18 Months Turnkey Delivery",
        "product_handover_date": (date.today() + timedelta(days=540)).isoformat(),
        "maintenance_period": "36 Months SLA 24/7 Support",
        "schedule_purchase_deadline": tomorrow,
        "schedule_purchase_method": "ONLINE_EGP",
        "tender_security_amount": 250000.0,  # 2.5% of 10,000,000
        "tender_security_method": "BANK_GUARANTEE",
        "post_award_data": {
            "noaReference": "BR/PROC/2026/089",
            "noaDate": today,
            "performanceSecurityAmount": 1000000.0,
            "performanceSecurityStatus": "PENDING",
            "contractSigningStatus": "SCHEDULED",
        },
    }

    # 1. Create tender with milestones
    res = client.post("/api/tenders", json=create_payload)
    assert res.status_code == 201
    created = res.json()
    assert created["opening_date"] == today
    assert created["possible_period"] == "18 Months Turnkey Delivery"
    assert created["tender_security_amount"] == 250000.0
    assert created["post_award_data"]["noaReference"] == "BR/PROC/2026/089"

    # 2. Retrieve tender
    get_res = client.get(f"/api/tenders/{test_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["opening_date"] == today
    assert fetched["maintenance_period"] == "36 Months SLA 24/7 Support"
    assert fetched["tender_security_method"] == "BANK_GUARANTEE"

    # 3. Check alerts generated for opening date today (while tender is in active pipeline)
    alerts_res = client.get("/api/alerts")
    assert alerts_res.status_code == 200
    alerts_data = alerts_res.json()
    alerts = alerts_data.get("alerts", [])
    opening_alerts = [
        a
        for a in alerts
        if a.get("tender_id") == test_id and "Opening" in a.get("title", "")
    ]
    assert len(opening_alerts) >= 1
    assert opening_alerts[0]["severity"] == "CRITICAL"

    # 4. Update post-award execution roadmap upon winning
    update_res = client.put(
        f"/api/tenders/{test_id}",
        json={
            "stage": "AWARDED",
            "post_award_data": {
                "noaReference": "BR/PROC/2026/089",
                "noaDate": today,
                "performanceSecurityAmount": 1000000.0,
                "performanceSecurityStatus": "DEPOSITED",
                "contractSigningStatus": "SIGNED",
                "contractSigningDate": next_month,
            },
        },
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["stage"] == "AWARDED"
    assert updated["post_award_data"]["performanceSecurityStatus"] == "DEPOSITED"
    assert updated["post_award_data"]["contractSigningStatus"] == "SIGNED"


def test_21_tender_financial_scenarios_and_rules():
    """Test Section 6.1 financial rules CRUD and tender financial model management."""
    test_tender_id = "TDR-TEST-FIN-001"
    client.delete(f"/api/tenders/{test_tender_id}")

    # 1. Create tender with financial_model
    tender_payload = {
        "id": test_tender_id,
        "title": "National Tax Automation & E-Invoice Platform",
        "reference_no": "NBR/FIN/2026/04",
        "organization": "National Board of Revenue",
        "country": "Bangladesh",
        "stage": "DISCOVERED",
        "category": "ICT",
        "submission_deadline": "2026-11-30",
        "estimated_value": 50000000.0,
        "currency": "BDT",
        "financial_model": {
            "paymentScenario": "MILESTONE_AND_ADVANCE",
            "workingCapitalRisk": "MEDIUM",
            "advancePayment": {
                "enabled": True,
                "percentage": 15.0,
                "amount": 7500000.0,
                "bankGuaranteeRequired": True,
                "recoveryType": "PRO_RATA_INVOICE",
                "recoveryPercentagePerInvoice": 15.0,
            },
            "milestones": [
                {
                    "milestoneNumber": 1,
                    "name": "SRS and Architecture Approval",
                    "percentage": 25.0,
                    "amount": 12500000.0,
                    "deliverable": "SRS Signoff & Architecture Design Document",
                    "approvalRequired": True,
                    "clientReviewDays": 15,
                    "paymentProcessingDays": 30,
                    "paymentTrigger": "UPON_ACCEPTANCE",
                },
                {
                    "milestoneNumber": 2,
                    "name": "Core System UAT & Pilot Rollout",
                    "percentage": 40.0,
                    "amount": 20000000.0,
                    "deliverable": "Pilot Go-Live in 3 Collectorates",
                    "approvalRequired": True,
                    "clientReviewDays": 20,
                    "paymentProcessingDays": 30,
                    "paymentTrigger": "UPON_ACCEPTANCE",
                },
                {
                    "milestoneNumber": 3,
                    "name": "Nationwide Commissioning & DLP Handover",
                    "percentage": 20.0,
                    "amount": 10000000.0,
                    "deliverable": "Final Commissioning Certificate",
                    "approvalRequired": True,
                    "clientReviewDays": 30,
                    "paymentProcessingDays": 45,
                    "paymentTrigger": "UPON_FINAL_ACCEPTANCE",
                },
            ],
            "subscriptionModel": {
                "pricingModel": "MULTI_YEAR_ESCALATION",
                "billingFrequency": "ANNUAL",
                "annualBaseFee": 6000000.0,
                "durationYears": 3,
                "annualEscalationRate": 5.0,
                "calculatedTcv": 18915000.0,
                "calculatedAcv": 6305000.0,
            },
            "penaltiesAndDeductions": {
                "liquidatedDamages": {
                    "enabled": True,
                    "rate": 0.5,
                    "frequency": "PER_WEEK",
                    "calculationBasis": "DELAYED_MILESTONE_VALUE",
                    "maxCapPercentage": 10.0,
                },
                "retentionMoney": {
                    "enabled": True,
                    "percentage": 10.0,
                    "releaseCondition": "DLP_EXPIRY",
                    "dlpMonths": 12,
                },
            },
        },
    }

    create_res = client.post("/api/tenders", json=tender_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["id"] == test_tender_id
    assert created["financial_model"]["paymentScenario"] == "MILESTONE_AND_ADVANCE"
    assert created["financial_model"]["advancePayment"]["amount"] == 7500000.0

    # 2. Get financial model via dedicated endpoint
    fm_res = client.get(f"/api/tenders/{test_tender_id}/financial-model")
    assert fm_res.status_code == 200
    fm_data = fm_res.json()
    assert fm_data["paymentScenario"] == "MILESTONE_AND_ADVANCE"
    assert len(fm_data["milestones"]) == 3

    # 3. Update financial model via dedicated endpoint
    updated_fm = dict(fm_data)
    updated_fm["workingCapitalRisk"] = "LOW"
    updated_fm["subscriptionModel"]["calculatedTcv"] = 19000000.0

    put_fm_res = client.put(
        f"/api/tenders/{test_tender_id}/financial-model",
        json={"financial_model": updated_fm},
    )
    assert put_fm_res.status_code == 200
    assert put_fm_res.json()["financial_model"]["workingCapitalRisk"] == "LOW"

    # 4. Create granular financial rules
    rule1_payload = {
        "tender_id": test_tender_id,
        "rule_category": "ADVANCE_PAYMENT",
        "rule_type": "MOBILIZATION_ADVANCE",
        "original_clause": "15% Mobilization Advance against Bank Guarantee",
        "financial_value": 7500000.0,
        "percentage": 15.0,
        "currency": "BDT",
        "payment_trigger": "CONTRACT_SIGNING",
        "advance_percentage": 15.0,
        "advance_recovery_method": "PRO_RATA_INVOICE",
        "risk_level": "LOW",
    }
    r1_res = client.post(
        f"/api/tenders/{test_tender_id}/financial-rules", json=rule1_payload
    )
    assert r1_res.status_code == 201
    r1_data = r1_res.json()
    rule_id = r1_data["id"]
    assert r1_data["rule_type"] == rule1_payload["rule_type"]
    assert r1_data["original_clause"] == rule1_payload["original_clause"]
    assert r1_data["advance_percentage"] == 15.0

    # 5. Create another rule (Liquidated Damages)
    rule2_payload = {
        "tender_id": test_tender_id,
        "rule_category": "PENALTY_LD",
        "rule_type": "DELAY_PENALTY",
        "original_clause": "Liquidated Damages for Delay",
        "penalty_rate": 0.5,
        "penalty_basis": "DELAYED_PORTION",
        "penalty_frequency": "WEEKLY",
        "maximum_penalty": 10.0,
    }
    r2_res = client.post(
        f"/api/tenders/{test_tender_id}/financial-rules", json=rule2_payload
    )
    assert r2_res.status_code == 201

    # 6. List financial rules for tender
    list_res = client.get(f"/api/tenders/{test_tender_id}/financial-rules")
    assert list_res.status_code == 200
    rules = list_res.json()
    assert len(rules) == 2

    # Filter by category
    adv_rules_res = client.get(
        f"/api/tenders/{test_tender_id}/financial-rules?rule_category=ADVANCE_PAYMENT"
    )
    assert adv_rules_res.status_code == 200
    adv_rules = adv_rules_res.json()
    assert len(adv_rules) == 1
    assert adv_rules[0]["rule_category"] == "ADVANCE_PAYMENT"

    # 7. Get single rule
    get_r1 = client.get(f"/api/financial-rules/{rule_id}")
    assert get_r1.status_code == 200
    assert get_r1.json()["id"] == rule_id

    # 8. Update rule
    put_r1 = client.put(
        f"/api/financial-rules/{rule_id}",
        json={"financial_value": 8000000.0, "percentage": 16.0},
    )
    assert put_r1.status_code == 200
    assert put_r1.json()["financial_value"] == 8000000.0
    assert put_r1.json()["percentage"] == 16.0

    # 9. Delete rule
    del_res = client.delete(f"/api/financial-rules/{rule_id}")
    assert del_res.status_code == 204

    # Verify deleted
    verify_list = client.get(f"/api/tenders/{test_tender_id}/financial-rules")
    assert len(verify_list.json()) == 1


def test_22_user_personal_profile_and_assignments():
    """Verify Personal Profile & Key Personnel Dossier APIs: contact info, employment type, proposed designation, and past project track record assignments."""
    # 1. List users
    res = client.get("/api/users")
    assert res.status_code == 200
    users = res.json()
    assert len(users) > 0
    target_user = users[0]
    user_id = target_user["id"]

    # 2. Update user profile
    update_payload = {
        "phone": "+880 1711-987654",
        "location": "Dhaka, Bangladesh",
        "employment_type": "PERMANENT",
        "proposed_designation": "Lead Solutions Architect & Team Leader",
        "certifications": ["PMP", "AWS Certified Solutions Architect", "CISSP"],
        "education": [{"degree": "M.Sc in CSE", "institution": "BUET", "year": "2016"}],
        "active_tender_roles": {"TDR-PRC0190428": "LEAD_MANAGER"},
    }
    put_res = client.put(f"/api/users/{user_id}", json=update_payload)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["phone"] == "+880 1711-987654"
    assert updated["employment_type"] == "PERMANENT"
    assert updated["proposed_designation"] == "Lead Solutions Architect & Team Leader"
    assert "PMP" in updated["certifications"]
    assert updated["active_tender_roles"]["TDR-PRC0190428"] == "LEAD_MANAGER"

    # 3. Add past project assignment
    asg_payload = {
        "id": "asg-test-01",
        "projectName": "Government Cloud Infrastructure Modernization",
        "client": "Ministry of ICT / World Bank",
        "role": "Lead Systems Architect",
        "duration": "24 Months (2022 - 2024)",
        "deploymentMonths": 24,
        "keyDeliverables": ["Microservices Architecture", "Tier-IV UAT Sign-off"],
        "technologiesUsed": ["Kubernetes", "PostgreSQL", "Terraform"],
        "coreResponsibilities": "Spearheaded core solution design and disaster recovery cutover.",
    }
    asg_res = client.post(f"/api/users/{user_id}/assignments", json=asg_payload)
    assert asg_res.status_code == 200
    user_with_asg = asg_res.json()
    assert any(a["id"] == "asg-test-01" for a in user_with_asg["past_assignments"])

    # 4. Get specific user profile
    get_res = client.get(f"/api/users/{user_id}")
    assert get_res.status_code == 200
    assert (
        get_res.json()["proposed_designation"]
        == "Lead Solutions Architect & Team Leader"
    )

    # 5. Delete past assignment
    del_res = client.delete(f"/api/users/{user_id}/assignments/asg-test-01")
    assert del_res.status_code == 200
    assert not any(a["id"] == "asg-test-01" for a in del_res.json()["past_assignments"])


def test_23_document_preview_and_streaming():
    """
    Test Req #15: In-Browser Document Preview & Streaming endpoints
    Verify retrieval of documents with inline headers and access validation.
    """
    # 1. Upload a test document for preview
    file_bytes = b"%PDF-1.4 Simulated Technical Proposal Volume for In-Browser Preview"
    upload_res = client.post(
        "/api/tenders/TDR-2026-EU-089/documents/upload",
        files={
            "file": (
                "Technical_Schedule_Preview_Test.pdf",
                file_bytes,
                "application/pdf",
            )
        },
        data={"folder": "03_technical_proposal"},
    )
    assert upload_res.status_code == 201
    doc = upload_res.json()
    doc_id = doc["id"]

    # 2. Test shared document validation for in-browser preview
    share_payload = {
        "shared_with_type": "PUBLIC",
        "can_view": True,
        "can_preview": True,
        "can_download": False,
        "expires_in_days": 7,
    }
    share_res = client.post(f"/api/documents/{doc_id}/share", json=share_payload)
    assert share_res.status_code == 200
    token = share_res.json()["token"]

    # 3. Access shared link for in-browser preview
    shared_view_res = client.get(f"/api/shared/{token}")
    assert shared_view_res.status_code == 200
    shared_data = shared_view_res.json()
    assert shared_data["can_view"] is True
    assert shared_data["can_preview"] is True
    assert shared_data["document_name"] == "Technical_Schedule_Preview_Test.pdf"
    assert shared_data["sha256"] is not None

    preview_res = client.get(f"/api/documents/{doc_id}/preview")
    assert preview_res.status_code == 200
    assert preview_res.headers["content-type"].startswith("application/pdf")
    assert preview_res.headers["content-disposition"].startswith("inline;")
    assert preview_res.content == file_bytes

    range_res = client.get(
        f"/api/documents/{doc_id}/preview", headers={"Range": "bytes=0-7"}
    )
    assert range_res.status_code == 206
    assert range_res.headers["content-range"] == f"bytes 0-7/{len(file_bytes)}"
    assert range_res.content == file_bytes[:8]

    shared_preview_res = client.get(f"/api/shared/{token}/preview")
    assert shared_preview_res.status_code == 200
    assert shared_preview_res.headers["content-disposition"].startswith("inline;")

    denied_download_res = client.get(f"/api/shared/{token}/download")
    assert denied_download_res.status_code == 403


def test_24_tender_procurement_governance_attributes():
    """
    Test Req #21: Tender type, budget type, source of fund, procurement method
    Verify CRUD persistence and serialization of procurement governance attributes.
    """
    test_id = "TDR-2026-GOV-TEST-99"
    client.delete(f"/api/tenders/{test_id}")

    payload = {
        "id": test_id,
        "reference_no": "GOV/2026/PROC-88",
        "title": "National Single Window & Customs Modernization Portal",
        "organization": "National Board of Revenue (NBR)",
        "country": "Bangladesh",
        "category": "Software / IT Related",
        "estimated_value": 4500000.0,
        "currency": "USD",
        "stage": "DISCOVERED",
        "priority": "HIGH",
        "tender_type": "International Competitive Bidding (ICB)",
        "budget_type": "Development Budget (ADP / Capex)",
        "source_of_fund": "World Bank (IDA / IBRD)",
        "procurement_method": "Quality & Cost Based Selection (QCBS)",
    }

    # 1. Create tender with procurement governance fields
    res = client.post("/api/tenders", json=payload)
    assert res.status_code == 201
    created = res.json()
    assert created["id"] == test_id
    assert created["tender_type"] == "International Competitive Bidding (ICB)"
    assert created["budget_type"] == "Development Budget (ADP / Capex)"
    assert created["source_of_fund"] == "World Bank (IDA / IBRD)"
    assert created["procurement_method"] == "Quality & Cost Based Selection (QCBS)"

    # 2. Retrieve tender via GET
    get_res = client.get(f"/api/tenders/{test_id}")
    assert get_res.status_code == 200
    retrieved = get_res.json()
    assert retrieved["tender_type"] == "International Competitive Bidding (ICB)"
    assert retrieved["budget_type"] == "Development Budget (ADP / Capex)"
    assert retrieved["source_of_fund"] == "World Bank (IDA / IBRD)"
    assert retrieved["procurement_method"] == "Quality & Cost Based Selection (QCBS)"

    # 3. Update procurement governance attributes
    update_payload = {
        "tender_type": "National Competitive Bidding (NCB)",
        "budget_type": "Own Funds / Corporate Budget",
        "source_of_fund": "Government of Bangladesh (GoB)",
        "procurement_method": "Single Stage Two Envelope (SSTE)",
    }
    put_res = client.put(f"/api/tenders/{test_id}", json=update_payload)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["tender_type"] == "National Competitive Bidding (NCB)"
    assert updated["budget_type"] == "Own Funds / Corporate Budget"
    assert updated["source_of_fund"] == "Government of Bangladesh (GoB)"
    assert updated["procurement_method"] == "Single Stage Two Envelope (SSTE)"

    # 4. Cleanup
    del_res = client.delete(f"/api/tenders/{test_id}")
    assert del_res.status_code in (200, 204)


def test_25_client_visits_and_meetings_crud():
    """
    Test Client Visitor & Scheduled Meetings REST endpoints:
    - POST /api/v1/client-visits (create visit / schedule)
    - GET /api/v1/client-visits (list all)
    - GET /api/v1/client-visits/{id} (get single)
    - PUT /api/v1/client-visits/{id} (update visit & MoM)
    - PATCH /api/v1/client-visits/{id}/status (quick check-in & status transition)
    - GET /api/v1/client-visits/upcoming (query upcoming pipeline)
    - DELETE /api/v1/client-visits/{id} (delete record)
    """
    visit_id = "VISIT-TEST-2026-001"
    # Ensure cleanup first if exists
    client.delete(f"/api/v1/client-visits/{visit_id}")

    payload = {
        "id": visit_id,
        "title": "UNDP Climate Fund Technical Pre-Bid Alignment",
        "client_organization": "United Nations Development Programme",
        "visitor_name": "Dr. Arthur Pendelton",
        "visitor_designation": "Director General of Procurement",
        "visitor_phone": "+1 555-019-2834",
        "visitor_email": "arthur.pendelton@undp.org",
        "accompanying_persons": [
            {"name": "Elena Rostova", "designation": "Senior Evaluation Specialist"},
            {"name": "Tariq Mansoor", "designation": "IT Security Assessor"},
        ],
        "internal_host_name": "Sarah Jenkins",
        "internal_host_role": "Business Head",
        "visit_type": "IN_PERSON_OFFICE",
        "status": "SCHEDULED",
        "scheduled_start": "2026-09-15T10:00:00",
        "scheduled_end": "2026-09-15T11:30:00",
        "location_or_room": "Executive Boardroom 4A",
        "agenda": "Reviewing data residency compliance, ISO 27001 SLA, and consortium qualifications.",
        "action_items": [
            {
                "task": "Submit updated Tier-3 Datacenter SOC2 Type II compliance audit report",
                "owner": "Michael Zhang",
                "deadline": "2026-09-18",
                "is_done": False,
            }
        ],
        "sentiment_outcome": "POSITIVE",
    }

    # 1. Create client visit
    create_res = client.post("/api/v1/client-visits", json=payload)
    assert create_res.status_code == 201
    created_visit = create_res.json()
    assert created_visit["id"] == visit_id
    assert created_visit["visitor_name"] == "Dr. Arthur Pendelton"
    assert len(created_visit["accompanying_persons"]) == 2
    assert created_visit["status"] == "SCHEDULED"

    # 2. Get by ID
    get_res = client.get(f"/api/v1/client-visits/{visit_id}")
    assert get_res.status_code == 200
    retrieved_visit = get_res.json()
    assert retrieved_visit["title"] == payload["title"]
    assert retrieved_visit["client_organization"] == payload["client_organization"]

    # 3. Patch Status (Reception Check-In)
    patch_res = client.patch(
        f"/api/v1/client-visits/{visit_id}/status",
        json={
            "status": "CHECKED_IN",
            "actual_check_in": "2026-09-15T09:55:00",
        },
    )
    assert patch_res.status_code == 200
    patched_visit = patch_res.json()
    assert patched_visit["status"] == "CHECKED_IN"
    assert patched_visit["actual_check_in"] == "2026-09-15T09:55:00"

    # 4. Update with MoM Discussion Notes & Completed status
    update_res = client.put(
        f"/api/v1/client-visits/{visit_id}",
        json={
            "status": "COMPLETED",
            "actual_check_out": "2026-09-15T11:45:00",
            "discussion_notes": "Client was highly satisfied with our consortium structure and confirmed submission timeline extension by 7 days.",
            "sentiment_outcome": "VERY_POSITIVE",
        },
    )
    assert update_res.status_code == 200
    updated_visit = update_res.json()
    assert updated_visit["status"] == "COMPLETED"
    assert updated_visit["sentiment_outcome"] == "VERY_POSITIVE"
    assert "consortium structure" in updated_visit["discussion_notes"]

    # 5. Check Upcoming Endpoint
    upcoming_res = client.get("/api/v1/client-visits/upcoming")
    assert upcoming_res.status_code == 200
    assert isinstance(upcoming_res.json(), list)

    # 6. Delete visit
    del_res = client.delete(f"/api/v1/client-visits/{visit_id}")
    assert del_res.status_code == 204

    # 7. Confirm 404 after deletion
    get_after_del = client.get(f"/api/v1/client-visits/{visit_id}")
    assert get_after_del.status_code == 404


def test_30_two_stage_eoi_rfp_lineage_and_direct_rfp():
    eoi_id = "TDR-2026-EOI-TEST-99"
    rfp_spawned_id = "TDR-2026-RFP-SPAWNED-99"
    direct_rfp_id = "TDR-2026-RFP-DIRECT-99"

    # Clean slate
    for tid in [eoi_id, rfp_spawned_id, direct_rfp_id]:
        client.delete(f"/api/tenders/{tid}")

    # 1. Create an EOI tender
    eoi_payload = {
        "id": eoi_id,
        "title": "Expression of Interest (EOI) for National Cloud Modernization",
        "organization": "ICT Division, Bangladesh",
        "country": "Bangladesh",
        "category": "Cloud & Cyber Security",
        "tender_type": "Expression of Interest (EOI)",
        "estimated_value": 3500000.0,
        "currency": "USD",
        "stage": "DISCOVERED",
        "decision": "PENDING",
    }
    eoi_res = client.post("/api/tenders", json=eoi_payload)
    assert eoi_res.status_code == 201
    created_eoi = eoi_res.json()
    assert created_eoi["id"] == eoi_id
    assert created_eoi["tender_type"] == "Expression of Interest (EOI)"
    assert created_eoi["parent_eoi_id"] is None
    assert created_eoi["spawned_rfp_id"] is None

    # 2. Record EOI Shortlisting Outcome
    update_eoi_res = client.put(
        f"/api/tenders/{eoi_id}",
        json={
            "eoi_shortlist_status": "SHORTLISTED",
            "stage": "AWARDED",
            "decision": "GO",
        },
    )
    assert update_eoi_res.status_code == 200
    updated_eoi = update_eoi_res.json()
    assert updated_eoi["eoi_shortlist_status"] == "SHORTLISTED"

    # 3. Create Linked RFP Stage from Shortlisted EOI
    rfp_linked_payload = {
        "id": rfp_spawned_id,
        "title": "Request for Proposals (RFP) for National Cloud Modernization",
        "organization": "ICT Division, Bangladesh",
        "country": "Bangladesh",
        "category": "Cloud & Cyber Security",
        "tender_type": "Request for Proposals (RFP)",
        "parent_eoi_id": eoi_id,
        "estimated_value": 3500000.0,
        "currency": "USD",
        "stage": "DISCOVERED",
        "decision": "GO",
    }
    rfp_res = client.post("/api/tenders", json=rfp_linked_payload)
    assert rfp_res.status_code == 201
    created_rfp = rfp_res.json()
    assert created_rfp["id"] == rfp_spawned_id
    assert created_rfp["parent_eoi_id"] == eoi_id
    assert created_rfp["tender_type"] == "Request for Proposals (RFP)"

    # Check that parent EOI was automatically linked
    eoi_check_res = client.get(f"/api/tenders/{eoi_id}")
    assert eoi_check_res.status_code == 200
    eoi_data = eoi_check_res.json()
    assert eoi_data["spawned_rfp_id"] == rfp_spawned_id
    assert eoi_data["eoi_shortlist_status"] == "SHORTLISTED"

    # 4. Create Direct RFP (No EOI Required / Open Tender)
    direct_rfp_payload = {
        "id": direct_rfp_id,
        "title": "Direct Request for Proposals (RFP) for Hospital Management ERP",
        "organization": "Ministry of Health",
        "country": "Bangladesh",
        "category": "Healthcare & Medical Systems",
        "tender_type": "Request for Proposals (RFP)",
        "parent_eoi_id": None,
        "estimated_value": 1800000.0,
        "currency": "USD",
        "stage": "DISCOVERED",
        "decision": "PENDING",
    }
    direct_res = client.post("/api/tenders", json=direct_rfp_payload)
    assert direct_res.status_code == 201
    created_direct_rfp = direct_res.json()
    assert created_direct_rfp["id"] == direct_rfp_id
    assert created_direct_rfp["parent_eoi_id"] is None
    assert created_direct_rfp["tender_type"] == "Request for Proposals (RFP)"

    # Clean up test tenders
    for tid in [eoi_id, rfp_spawned_id, direct_rfp_id]:
        client.delete(f"/api/tenders/{tid}")

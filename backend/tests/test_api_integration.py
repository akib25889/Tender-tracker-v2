import os
import shutil
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.services.seeder import seed_database

client = TestClient(app)


def setup_module():
    Base.metadata.create_all(bind=engine)
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

import os
import shutil
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


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
    folder_zip_res = client.get(f"/api/tenders/{test_id}/folders/02_company_statutory_documents/zip")
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

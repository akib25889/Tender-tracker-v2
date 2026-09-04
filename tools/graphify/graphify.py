"""
Graphify: Project Knowledge Graph Generator & Retrieval Optimizer.
Builds an indexed dependency and relationship graph of TenderTracker's
modules, routes, screens, models, and specifications to prevent costly
full-repository re-reads.
"""

import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DESIGN_DIR = BASE_DIR / "project design"
OUTPUT_DIR = BASE_DIR / "tools" / "graphify"


def extract_project_nodes():
    nodes = []
    edges = []

    # 1. Lifecycle Stages
    stages = [
        {
            "id": "stage:discovered",
            "name": "Stage 1 - Discovered",
            "type": "lifecycle_stage",
            "desc": "Scanner or manual intake with confidence scoring",
        },
        {
            "id": "stage:screening",
            "name": "Stage 2 - Screening",
            "type": "lifecycle_stage",
            "desc": "Entity jurisdiction check, restrictions, threshold screening",
        },
        {
            "id": "stage:analysis",
            "name": "Stage 3 - Analysis & Go/No-Go",
            "type": "lifecycle_stage",
            "desc": "Clause extraction, AI suitability, weighted decision matrix",
        },
        {
            "id": "stage:preparation",
            "name": "Stage 4 - Preparation",
            "type": "lifecycle_stage",
            "desc": "Task kanban, document vault population, requirement checklist",
        },
        {
            "id": "stage:review",
            "name": "Stage 5 - Review & Approval",
            "type": "lifecycle_stage",
            "desc": "4-tier sign-off (Technical, Financial, Legal, Executive)",
        },
        {
            "id": "stage:submission",
            "name": "Stage 6 - Submission & Post-Award",
            "type": "lifecycle_stage",
            "desc": "Portal upload proof, SHA-256 timestamps, win/loss ledger",
        },
    ]
    nodes.extend(stages)

    # Link stages sequentially
    for i in range(len(stages) - 1):
        edges.append(
            {
                "source": stages[i]["id"],
                "target": stages[i + 1]["id"],
                "relation": "TRANSITIONS_TO",
            }
        )

    # 2. Screens & Routes
    screens = [
        {
            "id": "screen:login",
            "name": "Login - Enterprise Sign In",
            "route": "/login",
            "module": "auth",
        },
        {
            "id": "screen:dashboard",
            "name": "Tender Command Center Dashboard",
            "route": "/dashboard",
            "module": "dashboard",
        },
        {
            "id": "screen:my_tasks",
            "name": "My Tasks - Cross-Tender Console",
            "route": "/tasks/my-tasks",
            "module": "tasks",
        },
        {
            "id": "screen:tenders_list",
            "name": "Tender List & Pipeline Registry",
            "route": "/tenders",
            "module": "tenders",
        },
        {
            "id": "screen:tender_registry",
            "name": "Tender Registry & Data Entry",
            "route": "/registry",
            "module": "registry",
        },
        {
            "id": "screen:tender_detail",
            "name": "Tender Detail & Proposal Workspace",
            "route": "/tenders/{id}",
            "module": "tenders",
        },
        {
            "id": "screen:tender_analysis",
            "name": "Tender Analysis & Scope Workspace",
            "route": "/tenders/{id}/analysis",
            "module": "analysis",
        },
        {
            "id": "screen:tender_requirements",
            "name": "Compliance & Requirements Matrix",
            "route": "/tenders/{id}/requirements",
            "module": "compliance",
        },
        {
            "id": "screen:tender_tasks",
            "name": "Tender Task Management Kanban",
            "route": "/tenders/{id}/tasks",
            "module": "tasks",
        },
        {
            "id": "screen:tender_documents",
            "name": "Tender Document Vault",
            "route": "/tenders/{id}/documents",
            "module": "documents",
        },
        {
            "id": "screen:team_allocation",
            "name": "Tender Team & Workload Allocation",
            "route": "/team",
            "module": "team",
        },
        {
            "id": "screen:calendar",
            "name": "Tender Calendar & Deadline Schedule",
            "route": "/calendar",
            "module": "calendar",
        },
        {
            "id": "screen:tender_review",
            "name": "Review & Sign-Off Workflow",
            "route": "/tenders/{id}/review",
            "module": "review",
        },
        {
            "id": "screen:tender_submission",
            "name": "Submission Ledger",
            "route": "/tenders/{id}/submission",
            "module": "submission",
        },
        {
            "id": "screen:tender_result",
            "name": "Outcome & Win/Loss Debrief",
            "route": "/tenders/{id}/result",
            "module": "result",
        },
        {
            "id": "screen:reports",
            "name": "Reports & Win/Loss Analytics",
            "route": "/reports",
            "module": "analytics",
        },
        {
            "id": "screen:notifications",
            "name": "Notification & Alert Center",
            "route": "/notifications",
            "module": "notifications",
        },
        {
            "id": "screen:settings",
            "name": "Settings & System Configuration",
            "route": "/settings",
            "module": "settings",
        },
        {
            "id": "screen:master_documents",
            "name": "Master Reusable Document Vault",
            "route": "/documents",
            "module": "documents",
        },
        {
            "id": "screen:chat_discussions",
            "name": "Team Chat & Tender Discussions",
            "route": "/discussions",
            "module": "collaboration",
        },
        {
            "id": "screen:tender_summary",
            "name": "Formal 3-Page Tender Document Summary",
            "route": "/registry/summary/{id}",
            "module": "registry",
        },
        {
            "id": "screen:archive",
            "name": "Archived Non-Participating Records",
            "route": "/archive",
            "module": "archive",
        },
    ]

    for sc in screens:
        nodes.append(
            {
                "id": sc["id"],
                "name": sc["name"],
                "type": "screen",
                "route": sc["route"],
                "module": sc["module"],
            }
        )

    # 3. Database Core Entities
    entities = [
        {
            "id": "entity:users",
            "name": "users",
            "type": "db_table",
            "desc": "Accounts, hashed passwords (Argon2id), roles",
        },
        {
            "id": "entity:tenders",
            "name": "tenders",
            "type": "db_table",
            "desc": "Core tender records, status, stage, valuation, deadlines",
        },
        {
            "id": "entity:tender_decisions",
            "name": "tender_decisions",
            "type": "db_table",
            "desc": "Go/No-Go score matrix and executive rationale",
        },
        {
            "id": "entity:tender_tasks",
            "name": "tender_tasks",
            "type": "db_table",
            "desc": "Individual tasks, assignments, kanban column, due dates",
        },
        {
            "id": "entity:documents",
            "name": "documents",
            "type": "db_table",
            "desc": "Document metadata, categories, relative storage paths",
        },
        {
            "id": "entity:document_versions",
            "name": "document_versions",
            "type": "db_table",
            "desc": "Immutable file revisions with SHA-256 checksums",
        },
        {
            "id": "entity:tender_requirements",
            "name": "tender_requirements",
            "type": "db_table",
            "desc": "Compliance matrix clauses and evidence links",
        },
        {
            "id": "entity:tender_reviews",
            "name": "tender_reviews",
            "type": "db_table",
            "desc": "Multi-tier approval sign-offs and comment audit trail",
        },
        {
            "id": "entity:audit_logs",
            "name": "audit_logs",
            "type": "db_table",
            "desc": "System-wide immutable security and activity log",
        },
        {
            "id": "entity:reusable_documents",
            "name": "reusable_documents",
            "type": "db_table",
            "desc": "Corporate master credentials, validity expiration, access tiers",
        },
        {
            "id": "entity:tender_comments",
            "name": "tender_comments",
            "type": "db_table",
            "desc": "Real-time proposal remarks, debrief notes, and cross-team chat",
        },
    ]
    nodes.extend(entities)

    # 4. Storage Vault Hierarchy
    storage_nodes = [
        {
            "id": "storage:root",
            "name": "storage/tenders/{TDR-ID}",
            "type": "storage_vault",
            "desc": "Local SSD root per tender",
        },
        {
            "id": "storage:original",
            "name": "01_original_tender_documents",
            "type": "storage_folder",
            "desc": "Official RFP notices and specs",
        },
        {
            "id": "storage:statutory",
            "name": "02_company_statutory_documents",
            "type": "storage_folder",
            "desc": "Trade license, tax clearance, solvency",
        },
        {
            "id": "storage:technical",
            "name": "03_technical_proposal",
            "type": "storage_folder",
            "desc": "Scope, methodology, CVs, credentials",
        },
        {
            "id": "storage:financial",
            "name": "04_financial_proposal",
            "type": "storage_folder",
            "desc": "BOQ, pricing tables, bank guarantees",
        },
        {
            "id": "storage:final",
            "name": "05_final_submission_package",
            "type": "storage_folder",
            "desc": "Compiled and sealed proposal bundles",
        },
        {
            "id": "storage:receipts",
            "name": "06_submission_receipts",
            "type": "storage_folder",
            "desc": "e-GP / UNGM upload receipts & confirmations",
        },
    ]
    nodes.extend(storage_nodes)

    for sf in storage_nodes[1:]:
        edges.append(
            {
                "source": "storage:root",
                "target": sf["id"],
                "relation": "CONTAINS_FOLDER",
            }
        )

    # Connect screens to entities
    screen_entity_map = [
        ("screen:login", "entity:users", "AUTHENTICATES_AGAINST"),
        ("screen:dashboard", "entity:tenders", "AGGREGATES_METRICS"),
        ("screen:tenders_list", "entity:tenders", "QUERIES_REGISTRY"),
        ("screen:tender_tasks", "entity:tender_tasks", "MANAGES_TASKS"),
        ("screen:my_tasks", "entity:tender_tasks", "FILTERS_BY_ASSIGNEE"),
        ("screen:tender_documents", "entity:documents", "MANAGES_VAULT"),
        ("screen:tender_documents", "entity:document_versions", "TRACKS_VERSIONS"),
        ("screen:tender_documents", "entity:reusable_documents", "REFERENCES_MASTER_FILES"),
        ("screen:master_documents", "entity:reusable_documents", "MANAGES_MASTER_CREDENTIALS"),
        ("screen:chat_discussions", "entity:tender_comments", "TRANSMITS_COLLABORATIVE_CHAT"),
        (
            "screen:tender_requirements",
            "entity:tender_requirements",
            "VALIDATES_COMPLIANCE",
        ),
        ("screen:tender_review", "entity:tender_reviews", "RECORDS_SIGNOFF"),
        ("screen:tender_analysis", "entity:tender_decisions", "SCORES_GO_NO_GO"),
    ]
    for src, tgt, rel in screen_entity_map:
        edges.append({"source": src, "target": tgt, "relation": rel})

    return {"nodes": nodes, "edges": edges}


def generate_markdown(graph):
    lines = [
        "# TenderTracker Project Knowledge Graph",
        "",
        "> Generated by Graphify engine for instant, low-token codebase retrieval.",
        "",
        "## 1. Core Lifecycle Pipeline",
        "",
    ]
    stages = [n for n in graph["nodes"] if n["type"] == "lifecycle_stage"]
    for s in stages:
        lines.append(f"- **{s['name']}**: {s['desc']}")

    lines.append("\n## 2. Screen & Route Directory\n")
    screens = [n for n in graph["nodes"] if n["type"] == "screen"]
    lines.append("| Screen ID | Screen Name | Route | Module |")
    lines.append("| :--- | :--- | :--- | :--- |")
    for sc in screens:
        lines.append(
            f"| `{sc['id']}` | {sc['name']} | `{sc['route']}` | `{sc['module']}` |"
        )

    lines.append("\n## 3. Database Entities & Relationships\n")
    entities = [n for n in graph["nodes"] if n["type"] == "db_table"]
    for e in entities:
        lines.append(f"- **`{e['name']}`**: {e['desc']}")

    lines.append("\n## 4. Local File Storage Vault\n")
    storage = [n for n in graph["nodes"] if "storage" in n["type"]]
    for st in storage:
        lines.append(f"- `{st['name']}`: {st['desc']}")

    lines.append("\n## 5. Architectural Cross-References\n")
    for ed in graph["edges"]:
        lines.append(f"- `{ed['source']}` ──[{ed['relation']}]──> `{ed['target']}`")

    return "\n".join(lines) + "\n"


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    graph = extract_project_nodes()

    json_path = OUTPUT_DIR / "knowledge_graph.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(graph, f, indent=2)

    md_path = OUTPUT_DIR / "knowledge_graph.md"
    md_content = generate_markdown(graph)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    print(
        f"Graphify completed: {len(graph['nodes'])} nodes, {len(graph['edges'])} edges indexed."
    )
    print(f"Written to:\n  - {json_path}\n  - {md_path}")


if __name__ == "__main__":
    main()

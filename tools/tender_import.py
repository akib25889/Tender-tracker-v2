#!/usr/bin/env python3
"""
TenderTracker — Markdown-to-Database Ingestion Engine
=====================================================
Usage:
  python tools/tender_import.py <path-to-tender-summary.md> [--base-url http://localhost:8000] [--update] [--dry-run]

Description:
  Ingests a Tender Summary Markdown file (produced from the Master Template)
  directly into the TenderTracker database via the FastAPI backend.

Features:
  1. Complete cell mapping: populates all top-level database columns AND all
     nested keys in `summary_json` (Basic, Scope, Financial, Eligibility,
     Staffing, Dates, Risks, Clauses, Helpline, Post-Award).
  2. Parses both the `tender_tracker_data` YAML automation block and the
     Markdown tables/lists with automatic fallbacks.
  3. Pre-calculates BDT currency values, days remaining, and readiness metrics.
  4. Fully zero-dependency HTTP client using standard library urllib.
"""

import argparse
import json
import re
import sys
from datetime import datetime, date
from typing import Any, Dict, List, Optional
import urllib.request
import urllib.error

try:
    import yaml
except ImportError:
    yaml = None


# ---------------------------------------------------------------------------
# Value cleaning & normalization helpers
# ---------------------------------------------------------------------------

def _clean_str(val: Any) -> Optional[str]:
    if val is None:
        return None
    s = str(val).strip()
    if s.lower() in (
        "null",
        "none",
        "...",
        "not specified",
        "not specified in the tender documents",
        "not specified in the available documents",
        "cannot be determined from the available documents",
        "n/a",
    ):
        return None
    return s if s else None


def _clean_num(val: Any) -> Optional[float]:
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    cleaned = re.sub(r"[^\d.-]", "", str(val))
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None


def _clean_date(val: Any) -> Optional[str]:
    s = _clean_str(val)
    if not s:
        return None
    m = re.search(r"(\d{4}-\d{2}-\d{2})", s)
    if m:
        return m.group(1)
    try:
        dt = datetime.strptime(s.split(",")[0].strip(), "%d-%b-%Y")
        return dt.strftime("%Y-%m-%d")
    except Exception:
        pass
    return s[:10] if len(s) >= 10 else s


def _clean_list(val: Any) -> List[str]:
    if not val:
        return []
    if isinstance(val, list):
        return [_clean_str(x) for x in val if _clean_str(x)]
    cleaned = _clean_str(val)
    return [cleaned] if cleaned else []


# ---------------------------------------------------------------------------
# Markdown Table & Section Parser (Fallback)
# ---------------------------------------------------------------------------

def parse_markdown_content(md_text: str) -> Dict[str, Any]:
    """Parse key attributes directly from Markdown tables and headers."""
    data: Dict[str, Any] = {}

    # 1. Parse Title and Tender ID from header
    id_match = re.search(r"Tender ID:\s*([A-Za-z0-9_\-\.]+)", md_text)
    if id_match and id_match.group(1).strip() != "[Tender ID]":
        data["tender_id"] = id_match.group(1).strip()

    title_match = re.search(r"Tender ID:.*?\|\s*([^\n\r#]+)", md_text)
    if title_match and "[Short Tender Title]" not in title_match.group(1):
        data["title"] = title_match.group(1).strip()

    # Classification
    class_match = re.search(r"Classification:\s*`?([A-Z /]+)`?", md_text)
    if class_match:
        data["classification"] = class_match.group(1).strip()

    # 2. Parse 2-column Basic Information & Contact Tables
    table_rows = re.findall(r"\|\s*\*\*?([^*|]+)\*\*?\s*\|\s*([^|\n\r]+)\|", md_text)
    for raw_key, raw_val in table_rows:
        k = raw_key.strip().lower()
        v = raw_val.strip()
        if v.startswith("[") and v.endswith("]"):
            continue  # skip unfilled template placeholders
        if "country" in k:
            data["country"] = _clean_str(v)
        elif "project name" in k:
            data["project_name"] = _clean_str(v)
        elif "tender title" in k and not data.get("title"):
            data["title"] = _clean_str(v)
        elif "reference" in k:
            data["reference_no"] = _clean_str(v)
        elif "tender id" in k and not data.get("tender_id"):
            data["tender_id"] = _clean_str(v)
        elif "client" in k or "organization" in k:
            data["organization"] = _clean_str(v)
        elif "portal" in k:
            data["portal"] = _clean_str(v)
        elif "published" in k:
            data["published_date"] = _clean_date(v)
        elif "deadline" in k or "submission" in k or "last date" in k:
            data["submission_deadline"] = _clean_date(v)
            time_m = re.search(r"(\d{1,2}:\d{2})", v)
            if time_m:
                hh, mm = time_m.group(1).split(":")
                data["close_hour"] = hh.zfill(2)
                data["close_minute"] = mm.zfill(2)
        elif "tender type" in k:
            data["tender_type"] = _clean_str(v)
        elif "budget type" in k:
            data["budget_type"] = _clean_str(v)
        elif "estimated value" in k or "budget" in k:
            data["estimated_value"] = _clean_num(v)
            if "bdt" in v.lower():
                data["currency"] = "BDT"
            elif "usd" in v.lower() or "$" in v:
                data["currency"] = "USD"
        elif "source of fund" in k:
            data["source_of_fund"] = _clean_str(v)
        elif "procurement method" in k:
            data["procurement_method"] = _clean_str(v)
        elif "evaluation method" in k:
            data["evaluation_method"] = _clean_str(v)
        elif "procurement manager name" in k:
            data["procurement_manager_name"] = _clean_str(v)
        elif "designation" in k:
            data["procurement_manager_designation"] = _clean_str(v)
        elif "official email" in k:
            data["procurement_manager_email"] = _clean_str(v)
        elif "office phone" in k:
            data["procurement_manager_phone"] = _clean_str(v)
        elif "helpline phone" in k:
            data["helpline_phone"] = _clean_str(v)
        elif "helpline email" in k:
            data["helpline_email"] = _clean_str(v)
        elif "helpline operating hours" in k or "helpline hours" in k:
            data["helpline_hours"] = _clean_str(v)

    # 3. Parse Scope & Reqs
    main_idea_m = re.search(r"### Main Idea\s*\n+([^#]+?)(?=\n###|\n##|\Z)", md_text)
    if main_idea_m:
        data["main_idea"] = main_idea_m.group(1).strip()

    tech_m = re.search(r"### Technical Requirements\s*\n+([^#]+?)(?=\n###|\n##|\Z)", md_text)
    if tech_m:
        items = re.findall(r"^[*-]\s+(.+)$", tech_m.group(1), re.MULTILINE)
        data["technical_reqs"] = [i.strip() for i in items if i.strip() and not i.strip().startswith("[e.g.")]

    tech_list_m = re.search(r"### Software / Technology Mentioned\s*\n+([^#]+?)(?=\n###|\n##|\Z)", md_text)
    if tech_list_m:
        items = re.findall(r"^[*-]\s+(.+)$", tech_list_m.group(1), re.MULTILINE)
        data["technology_mentioned"] = [i.strip() for i in items if "not specified" not in i.lower() and not i.strip().startswith("[")]

    # 4. Parse Personnel Table
    personnel_rows = re.findall(r"\|\s*\d+\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|", md_text)
    personnel_list = []
    for pos, qual, exp, qty in personnel_rows:
        p_name = _clean_str(pos)
        if p_name and not p_name.startswith("["):
            personnel_list.append({
                "position": p_name,
                "qualification": _clean_str(qual) or "",
                "experience": _clean_str(exp) or "",
                "qty": _clean_str(qty) or "1",
            })
    if personnel_list:
        data["personnel"] = personnel_list

    # 5. Parse Hardware Table
    hw_rows = re.findall(r"\|\s*\d+\s*\|\s*([^|]+)\|\s*([^|]+)\|", md_text)
    hw_list = []
    for eq, purp in hw_rows:
        eq_name = _clean_str(eq)
        if eq_name and not eq_name.startswith("["):
            hw_list.append({
                "equipment": eq_name,
                "purpose": _clean_str(purp) or "",
            })
    if hw_list:
        data["hardware"] = hw_list

    # 6. Parse Risks
    risks_m = re.search(r"## Key Risks / Important Points\s*\n+([^#]+?)(?=\n##|\Z)", md_text)
    if risks_m:
        items = re.findall(r"^[*-]\s+\*\*?\[(Tender Requirement|Analyst Observation)\]\*\*?\s*(.+)$", risks_m.group(1), re.MULTILINE)
        data["risks"] = [{"type": t, "text": txt.strip()} for t, txt in items if not txt.strip().startswith("[e.g.")]

    # 7. Parse Management Highlights
    mgmt_m = re.search(r"## Important for Management\s*\n+([^#]+?)(?=\n##|\Z)", md_text)
    if mgmt_m:
        items = re.findall(r"^[*-]\s+(.+)$", mgmt_m.group(1), re.MULTILINE)
        data["management_highlights"] = [i.strip() for i in items if i.strip() and not i.strip().startswith("[e.g.")]

    return data


# ---------------------------------------------------------------------------
# YAML Automation Block Parser
# ---------------------------------------------------------------------------

def extract_yaml_block(md_text: str) -> Optional[Dict[str, Any]]:
    """Extract tender_tracker_data YAML code block if present."""
    if not yaml:
        return None
    matches = re.findall(r"```(?:yaml)?\s*\n(.*?)```", md_text, re.DOTALL)
    selected = None
    for block in matches:
        if "tender_tracker_data:" in block:
            try:
                parsed = yaml.safe_load(block)
                if isinstance(parsed, dict) and "tender_tracker_data" in parsed:
                    data = parsed["tender_tracker_data"]
                    if data.get("title") and data.get("title") != "...":
                        return data
                    selected = data
            except Exception:
                continue
    return selected


# ---------------------------------------------------------------------------
# Payload Builder (Normalized for backend /api/tenders)
# ---------------------------------------------------------------------------

def build_api_payload(md_text: str) -> Dict[str, Any]:
    """Combines YAML block and Markdown content into a complete Tender payload."""
    yaml_data = extract_yaml_block(md_text) or {}
    md_data = parse_markdown_content(md_text)

    # Merge: YAML data takes precedence, complemented by markdown text
    merged: Dict[str, Any] = {**md_data, **yaml_data}

    # Core Identification
    tender_id = _clean_str(merged.get("id")) or _clean_str(merged.get("tender_id"))
    reference_no = _clean_str(merged.get("reference_no")) or ""
    title = _clean_str(merged.get("title")) or "Untitled Tender"
    organization = _clean_str(merged.get("organization")) or ""
    country = _clean_str(merged.get("country")) or "Bangladesh"
    category = _clean_str(merged.get("category")) or "Information & Communication Technology (ICT)"

    # Financials
    est_val = _clean_num(merged.get("estimated_value"))
    currency = _clean_str(merged.get("currency")) or ("BDT" if country == "Bangladesh" else "USD")
    rate = _clean_num(merged.get("exchange_rate_to_bdt")) or (1.0 if currency == "BDT" else 122.0)
    rate_date = _clean_date(merged.get("exchange_rate_date"))
    val_bdt = est_val if currency == "BDT" else (round(est_val * rate, 2) if est_val is not None else None)

    # Stage, Decision, Priority
    stage = _clean_str(merged.get("stage")) or "DISCOVERED"
    decision = _clean_str(merged.get("decision")) or "PENDING"
    priority = _clean_str(merged.get("priority")) or "MEDIUM"

    # Deadlines & Timings
    deadline = _clean_date(merged.get("submission_deadline"))
    published = _clean_date(merged.get("published_date"))
    close_hour = _clean_str(merged.get("close_hour")) or "13"
    close_minute = _clean_str(merged.get("close_minute")) or "00"
    close_tz = _clean_str(merged.get("close_timezone")) or "BST"

    days_remaining = 0
    if deadline:
        try:
            delta = datetime.fromisoformat(deadline).date() - date.today()
            days_remaining = max(0, delta.days)
        except Exception:
            pass

    # Nested Eligibility Object
    elig_raw = merged.get("eligibility") or {}
    eligibility_obj = {
        "generalExperience": _clean_str(elig_raw.get("general_experience")),
        "similarExperience": _clean_str(elig_raw.get("similar_experience")),
        "similarProjectValue": _clean_str(elig_raw.get("similar_project_value")),
        "avgTurnover": _clean_str(elig_raw.get("avg_turnover")),
        "financialResources": _clean_str(elig_raw.get("financial_resources")),
        "certification": _clean_str(elig_raw.get("certification")),
        "localPresence": _clean_str(elig_raw.get("local_presence")),
    }

    # Nested JV Object
    jv_raw = merged.get("jv") or {}
    jv_obj = {
        "participation": _clean_str(jv_raw.get("participation")),
        "leadMember": _clean_str(jv_raw.get("lead_member")),
        "memberRules": _clean_str(jv_raw.get("member_rules")),
        "localPartner": _clean_str(jv_raw.get("local_partner")),
        "jvAgreement": _clean_str(jv_raw.get("jv_agreement")),
    }

    # Nested Commercial Object
    comm_raw = merged.get("commercial") or {}
    commercial_obj = {
        "tenderSecurity": _clean_str(comm_raw.get("tender_security")) or _clean_str(merged.get("tender_security")),
        "tenderSecurityAmount": _clean_num(comm_raw.get("tender_security_amount")) or _clean_num(merged.get("tender_security_amount")),
        "tenderSecurityMethod": _clean_str(comm_raw.get("tender_security_method")) or _clean_str(merged.get("tender_security_method")),
        "contractPeriod": _clean_str(comm_raw.get("contract_period")) or _clean_str(merged.get("possible_period")),
        "tenderDocPrice": _clean_str(comm_raw.get("tender_doc_price")) or _clean_str(merged.get("tender_doc_price")),
        "schedulePurchaseDeadline": _clean_date(comm_raw.get("schedule_purchase_deadline")) or _clean_date(merged.get("schedule_purchase_deadline")),
        "schedulePurchaseMethod": _clean_str(comm_raw.get("schedule_purchase_method")) or _clean_str(merged.get("schedule_purchase_method")),
        "performanceSecurity": _clean_str(comm_raw.get("performance_security")) or _clean_str(merged.get("performance_security")),
        "maintenancePeriod": _clean_str(comm_raw.get("maintenance_period")) or _clean_str(merged.get("maintenance_period")),
    }

    # Nested Dates Object
    dates_raw = merged.get("dates") or {}
    dates_obj = {
        "clarificationDeadline": _clean_date(dates_raw.get("clarification_deadline")) or _clean_date(merged.get("clarification_deadline")),
        "submissionDeadline": deadline,
        "schedulePurchaseDeadline": commercial_obj["schedulePurchaseDeadline"],
        "openingDate": _clean_date(dates_raw.get("opening_date")) or _clean_date(merged.get("opening_date")),
        "contractSigningDate": _clean_date(dates_raw.get("contract_signing_date")) or _clean_date(merged.get("contract_signing_date")),
        "workStartDate": _clean_date(dates_raw.get("work_start_date")) or _clean_date(merged.get("work_start_date")),
        "contractStart": _clean_date(dates_raw.get("contract_start")),
        "possiblePeriod": _clean_str(merged.get("possible_period")),
        "productHandoverDate": _clean_date(dates_raw.get("product_handover_date")) or _clean_date(merged.get("product_handover_date")),
        "maintenancePeriod": _clean_str(merged.get("maintenance_period")),
    }

    # Officers & Helpline
    proc_mgr_obj = {
        "name": _clean_str(merged.get("procurement_manager_name")),
        "designation": _clean_str(merged.get("procurement_manager_designation")),
        "email": _clean_str(merged.get("procurement_manager_email")),
        "phone": _clean_str(merged.get("procurement_manager_phone")),
    }

    helpline_obj = {
        "phone": _clean_str(merged.get("helpline_phone")),
        "email": _clean_str(merged.get("helpline_email")),
        "hours": _clean_str(merged.get("helpline_hours")),
    }

    # Personnel & Hardware
    personnel_list = merged.get("personnel") or []
    hardware_list = merged.get("hardware") or []

    # Extended Summary JSON Structure (Used by all summary components in the UI)
    ext_summary: Dict[str, Any] = {
        "classification": _clean_str(merged.get("classification")) or "SOFTWARE / IT RELATED",
        "projectName": _clean_str(merged.get("project_name")),
        "shortTitle": title[:45] if title else None,
        "portal": _clean_str(merged.get("portal")) or _clean_str(merged.get("portal_url")),
        "publishedDate": published,
        "publishedHour": _clean_str(merged.get("published_hour")) or "10",
        "publishedMinute": _clean_str(merged.get("published_minute")) or "00",
        "publishedTimezone": _clean_str(merged.get("published_timezone")) or close_tz,
        "submissionTime": deadline,
        "closeHour": close_hour,
        "closeMinute": close_minute,
        "closeTimezone": close_tz,
        "mainIdea": _clean_str(merged.get("main_idea")),
        "commercial": commercial_obj,
        "technicalReqs": _clean_list(merged.get("technical_reqs")),
        "technologyMentioned": _clean_list(merged.get("technology_mentioned")),
        "operationalReqs": _clean_list(merged.get("operational_reqs")),
        "eligibility": eligibility_obj,
        "jv": jv_obj,
        "submissionDocuments": _clean_list(merged.get("submission_documents")),
        "personnel": personnel_list,
        "hardware": hardware_list,
        "dates": dates_obj,
        "risks": merged.get("risks") or [],
        "managementHighlights": _clean_list(merged.get("management_highlights")),
        "notes": _clean_str(merged.get("notes")),
        "procurementManager": proc_mgr_obj,
        "helpline": helpline_obj,
        "tenderType": _clean_str(merged.get("tender_type")),
        "budgetType": _clean_str(merged.get("budget_type")),
        "sourceOfFund": _clean_str(merged.get("source_of_fund")),
        "procurementMethod": _clean_str(merged.get("procurement_method")),
        "evaluationMethod": _clean_str(merged.get("evaluation_method")),
        "financialModel": merged.get("financial_model") or {},
        "aiChatShareLink": _clean_str(merged.get("ai_chat_share_link")),
        "postAward": merged.get("post_award"),
    }

    # Important clauses
    important_clauses = []
    raw_clauses = merged.get("important_clauses") or []
    for idx, c in enumerate(raw_clauses, 1):
        if isinstance(c, dict):
            important_clauses.append({
                "id": _clean_str(c.get("id")) or f"clause-{idx}",
                "clause_title": _clean_str(c.get("clause_title")) or f"Clause {idx}",
                "category": _clean_str(c.get("category")) or "FINANCIAL",
                "criticality": _clean_str(c.get("criticality")) or "HIGH",
                "doc_reference": _clean_str(c.get("doc_reference")) or "",
                "doc_file_name": _clean_str(c.get("doc_file_name")),
                "page_number": _clean_str(c.get("page_number")),
                "clause_text": _clean_str(c.get("clause_text")) or "",
                "implication": _clean_str(c.get("implication")),
            })

    # Top-level API payload matching backend TenderCreate schema
    payload: Dict[str, Any] = {
        "id": tender_id,
        "reference_no": reference_no,
        "title": title,
        "organization": organization,
        "country": country,
        "category": category,
        "estimated_value": est_val,
        "currency": currency,
        "exchange_rate_to_bdt": rate,
        "exchange_rate_date": rate_date,
        "estimated_value_bdt": val_bdt,
        "stage": stage,
        "decision": decision,
        "priority": priority,
        "submission_deadline": deadline,
        "close_hour": close_hour,
        "close_minute": close_minute,
        "close_timezone": close_tz,
        "published_date": published,
        "days_remaining": days_remaining,
        "hours_remaining": 0,
        "readiness_score": 10,
        "lead_owner_name": _clean_str(merged.get("lead_owner_name")) or "NYK Advance Limited",
        "lead_owner_role": _clean_str(merged.get("lead_owner_role")) or "Lead Bidder",
        "procurement_manager_name": proc_mgr_obj["name"],
        "procurement_manager_designation": proc_mgr_obj["designation"],
        "procurement_manager_email": proc_mgr_obj["email"],
        "procurement_manager_phone": proc_mgr_obj["phone"],
        "helpline_phone": helpline_obj["phone"],
        "helpline_email": helpline_obj["email"],
        "helpline_hours": helpline_obj["hours"],
        "tender_type": _clean_str(merged.get("tender_type")),
        "budget_type": _clean_str(merged.get("budget_type")),
        "source_of_fund": _clean_str(merged.get("source_of_fund")),
        "procurement_method": _clean_str(merged.get("procurement_method")),
        "evaluation_method": _clean_str(merged.get("evaluation_method")),
        "opening_date": dates_obj["openingDate"],
        "contract_signing_date": dates_obj["contractSigningDate"],
        "work_start_date": dates_obj["workStartDate"],
        "possible_period": dates_obj["possiblePeriod"],
        "product_handover_date": dates_obj["productHandoverDate"],
        "maintenance_period": dates_obj["maintenancePeriod"],
        "schedule_purchase_deadline": commercial_obj["schedulePurchaseDeadline"],
        "schedule_purchase_method": commercial_obj["schedulePurchaseMethod"],
        "tender_security_amount": commercial_obj["tenderSecurityAmount"],
        "tender_security_method": commercial_obj["tenderSecurityMethod"],
        "portal_url": _clean_str(merged.get("portal_url")),
        "languages": _clean_list(merged.get("languages")) or ["English", "Bengali"],
        "important_clauses": important_clauses,
        "summary_json": json.dumps(ext_summary),
        "financial_model": merged.get("financial_model") or {},
        "post_award_data": merged.get("post_award"),
        "parent_eoi_id": _clean_str(merged.get("parent_eoi_id")),
        "spawned_rfp_id": _clean_str(merged.get("spawned_rfp_id")),
        "eoi_shortlist_status": _clean_str(merged.get("eoi_shortlist_status")),
        "ai_chat_share_link": _clean_str(merged.get("ai_chat_share_link")),
    }

    return payload


# ---------------------------------------------------------------------------
# HTTP Client (urllib - Zero Dependency)
# ---------------------------------------------------------------------------

def _send_request(method: str, url: str, payload: Optional[Dict[str, Any]] = None) -> tuple[int, Dict[str, Any]]:
    data_bytes = json.dumps(payload).encode("utf-8") if payload else None
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raw_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(raw_body)
        except Exception:
            return e.code, {"detail": raw_body}


# ---------------------------------------------------------------------------
# Main CLI Execution
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Ingest Tender Summary Markdown into TenderTracker DB")
    parser.add_argument("md_file", help="Path to the generated tender summary .md file")
    parser.add_argument("--base-url", default="http://localhost:8000", help="TenderTracker API root URL")
    parser.add_argument("--update", action="store_true", help="Force PUT update instead of POST create")
    parser.add_argument("--dry-run", action="store_true", help="Output parsed JSON payload without sending HTTP")
    args = parser.parse_args()

    try:
        with open(args.md_file, "r", encoding="utf-8") as f:
            md_content = f.read()
    except FileNotFoundError:
        print(f"❌ Error: File not found: {args.md_file}")
        sys.exit(1)

    payload = build_api_payload(md_content)

    if args.dry_run:
        print("=== DRY RUN: Parsed Tender Payload (Ready for Ingestion) ===")
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        return

    base = args.base_url.rstrip("/")
    tender_id = payload.get("id")

    # Check if tender already exists to automatically toggle update vs create
    auto_update = args.update
    if tender_id and not auto_update:
        status_check, _ = _send_request("GET", f"{base}/api/tenders/{tender_id}")
        if status_check == 200:
            print(f"ℹ️  Tender {tender_id} already exists. Switching to UPDATE mode...")
            auto_update = True

    if auto_update and tender_id:
        url = f"{base}/api/tenders/{tender_id}"
        status_code, resp = _send_request("PUT", url, payload)
        action_name = "Updated"
    else:
        url = f"{base}/api/tenders"
        status_code, resp = _send_request("POST", url, payload)
        action_name = "Created"

    if status_code in (200, 201):
        tid = resp.get("id", tender_id or "UNKNOWN")
        print("\n" + "=" * 60)
        print(f"✅ Success! Tender {action_name} in Database")
        print("=" * 60)
        print(f"  Tender ID   : {tid}")
        print(f"  Title       : {resp.get('title')}")
        print(f"  Ref No      : {resp.get('reference_no')}")
        print(f"  Client      : {resp.get('organization')}")
        print(f"  Stage       : {resp.get('stage')}")
        print(f"  Deadline    : {resp.get('submission_deadline')}")
        print(f"  Value       : {resp.get('estimated_value')} {resp.get('currency')}")
        print("-" * 60)
        print(f"  🔗 Workspace: {base.replace('8000', '5173')}/tenders/{tid}")
        print(f"  📄 Summary  : {base.replace('8000', '5173')}/registry/summary/{tid}")
        print("=" * 60 + "\n")
    else:
        print(f"\n❌ Ingestion Failed (HTTP {status_code}):")
        print(json.dumps(resp, indent=2, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()

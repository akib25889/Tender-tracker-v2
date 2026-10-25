import os
import json
import sqlite3
import hashlib
from datetime import datetime
from pathlib import Path

# Paths
DB_PATH = Path("backend/tender_tracker.db")
STORAGE_ROOT = Path("storage")

def create_valid_pdf(file_path: Path, title: str, subtitle: str, metadata: dict) -> tuple[str, str]:
    file_path.parent.mkdir(parents=True, exist_ok=True)
    safe_title = title.replace("(", "[").replace(")", "]")
    safe_subtitle = subtitle.replace("(", "[").replace(")", "]")
    
    stream_content = f"BT /F1 15 Tf 50 720 Td ({safe_title}) Tj 0 -30 Td /F1 11 Tf ({safe_subtitle}) Tj "
    for k, v in metadata.items():
        safe_v = str(v).replace("(", "[").replace(")", "]")
        stream_content += f"0 -22 Td /F1 10 Tf ({k}: {safe_v}) Tj "
    stream_content += "ET"
    stream_bytes = stream_content.encode("latin1", errors="replace")
    length = len(stream_bytes)
    
    body = (
        b"%PDF-1.4\n"
        b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
        b"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
        b"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj\n"
        b"4 0 obj <</Length " + str(length).encode("ascii") + b">> stream\n" + stream_bytes + b"\nendstream\nendobj\n"
        b"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
    )
    xref_offset = len(body)
    pdf = body + (
        b"xref\n"
        b"0 6\n"
        b"0000000000 65535 f \n"
        b"0000000009 00000 n \n"
        b"0000000056 00000 n \n"
        b"0000000111 00000 n \n"
        b"0000000212 00000 n \n"
        b"0000000300 00000 n \n"
        b"trailer <</Size 6 /Root 1 0 R>>\n"
        b"startxref\n"
        + str(xref_offset).encode("ascii") + b"\n"
        b"%%EOF\n"
    )
    with open(file_path, "wb") as f:
        f.write(pdf)
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        hasher.update(f.read())
    size_str = f"{len(pdf) / 1024:.1f} KB" if len(pdf) < 1024*1024 else f"{len(pdf) / (1024*1024):.1f} MB"
    return hasher.hexdigest(), size_str

def safe_slug(name: str) -> str:
    return "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in name).strip("_")

def seed():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    now_iso = datetime.utcnow().isoformat()
    now_date = datetime.utcnow().strftime("%Y-%m-%d")

    print("--- 1. SEEDING COMPANY PROFILES ---")
    company_profiles_data = [
        {
            "id": "COMP-PRIMETECH",
            "legal_name": "PrimeTech Solutions Limited",
            "trade_name": "PrimeTech Ltd",
            "company_role": "LEAD_BIDDER",
            "entity_type": "Private Limited Company",
            "registration_no": "C-102948/2014",
            "incorporation_date": "2014-06-15",
            "country": "Bangladesh",
            "status": "ACTIVE",
            "business_nature": "Enterprise Cloud Architecture, AI/ML Automation, Intelligent Transportation (ITS/ETC), and Large-Scale Systems Integration",
            "logo_url": "/logos/primetech.png",
            "tin_number": "481920394812",
            "bin_vat_number": "002918475-0101",
            "trade_license_no": "TRAD/DNCC/012948/2024",
            "trade_license_expiry": "2027-06-30",
            "trade_license_issuer": "Dhaka North City Corporation (Zone 3)",
            "tax_circle_zone": "Large Taxpayers Unit (LTU) / Circle 14",
            "rjsc_return_year": "2025",
            "irc_erc_no": "IRC-0918239",
            "registered_address": "Level 12 & 14, Crystal Palace, Plot 22, Road 140, Gulshan 1, Dhaka 1212",
            "operational_address": "Floor 7, Tower B, High-Tech City, Kaliakair, Gazipur",
            "official_email": "tenders@primetechbd.com",
            "billing_email": "finance@primetechbd.com",
            "phone": "+880 2 9884511",
            "fax": "+880 2 9884512",
            "website": "https://www.primetechbd.com",
            "contact_person_name": "Engr. Tanvir Ahmed",
            "contact_person_title": "Head of Tendering & Strategic Bids",
            "contact_person_phone": "+880 1711 009988",
            "contact_person_email": "tanvir.ahmed@primetechbd.com",
            "signatory_name": "Kazi Farhan Ahmed",
            "signatory_title": "Managing Director & CEO",
            "signatory_nid": "2691820491820",
            "power_of_attorney_ref": "POA-2024-EXEC-01 (Notarized & Registered)",
            "bank_name": "Standard Chartered Bank Bangladesh",
            "bank_branch": "Gulshan Main Branch, Dhaka",
            "bank_account_name": "PrimeTech Solutions Limited",
            "bank_account_no": "01-1184920-01",
            "routing_no": "215261184",
            "swift_code": "SCBLBDDX",
            "audited_turnover_bdt": 1450000000.0,
            "audited_turnover_usd": 11836734.0,
            "bank_solvency_limit_bdt": 650000000.0,
            "paid_up_capital_bdt": 250000000.0,
            "authorized_capital_bdt": 800000000.0,
            "credit_rating": "AAA",
            "credit_rating_validity": "2027-06-30",
            "certifications": json.dumps([
                "ISO 9001:2015 Quality Management",
                "ISO 27001:2022 Information Security",
                "CMMI Level 3 Appraised",
                "BASIS Member G-842",
                "BCS Member 1042"
            ]),
            "core_competencies": json.dumps([
                "Enterprise Cloud Migration",
                "AI/ML Document Intelligence",
                "Intelligent Transportation Systems (ITS)",
                "Cybersecurity & Zero-Trust",
                "Core Banking System Integration",
                "Automated Toll Systems (ETC)"
            ]),
            "total_employees": 340,
            "certified_engineers": 145,
            "custom_fields": json.dumps([
                {"id": "cf-pt-1", "name": "Dun & Bradstreet DUNS", "value": "73-194-0821"},
                {"id": "cf-pt-2", "name": "UNGM Registration ID", "value": "UNGM-849102 (Level 2 Active)"},
                {"id": "cf-pt-3", "name": "World Bank Vendor ID", "value": "WB-19482-BD"},
                {"id": "cf-pt-4", "name": "Primary Lead Underwriter", "value": "Green Delta Insurance PLC (Limit BDT 500M)"}
            ])
        },
        {
            "id": "COMP-DATACORE",
            "legal_name": "DataCore Systems Bangladesh Limited",
            "trade_name": "DataCore Systems Ltd",
            "company_role": "JV_PARTNER",
            "entity_type": "Joint Venture / Private Limited",
            "registration_no": "C-109482/2016",
            "incorporation_date": "2016-04-12",
            "country": "Bangladesh",
            "status": "ACTIVE",
            "business_nature": "Industrial IoT, SCADA Automation, High-Capacity Telemetry, AI-driven Smart Grid & Distributed Sensor Solutions",
            "logo_url": "/logos/datacore.png",
            "tin_number": "492019482711",
            "bin_vat_number": "003928174-0102",
            "trade_license_no": "TRAD/DNCC/049182/2024",
            "trade_license_expiry": "2027-06-30",
            "trade_license_issuer": "Dhaka North City Corporation (Zone 3)",
            "tax_circle_zone": "Large Taxpayers Unit (LTU) / Circle 11",
            "rjsc_return_year": "2025",
            "irc_erc_no": "IRC-2948102",
            "registered_address": "Level 8, Concord Tower, 113 Kazi Nazrul Islam Ave, Dhaka 1205",
            "operational_address": "Plot 22, Road 4, Sector 3, Uttara, Dhaka 1230",
            "official_email": "tenders@datacore-systems.com",
            "billing_email": "finance@datacore-systems.com",
            "phone": "+880 2 9845120",
            "fax": "+880 2 9845121",
            "website": "https://www.datacore-systems.com",
            "contact_person_name": "Mahmudur Rahman, PMP",
            "contact_person_title": "Director - Enterprise Solutions",
            "contact_person_phone": "+880 1713 445566",
            "contact_person_email": "m.rahman@datacore-systems.com",
            "signatory_name": "Dr. Tariqul Islam",
            "signatory_title": "Chief Executive Officer & Managing Director",
            "signatory_nid": "8271940182",
            "power_of_attorney_ref": "POA-2024-DC-04 (Board Resolution Dated Jan 10, 2024)",
            "bank_name": "Standard Chartered Bank Bangladesh",
            "bank_branch": "Gulshan Main Branch, Dhaka",
            "bank_account_name": "DataCore Systems Bangladesh Limited",
            "bank_account_no": "01-7892341-01",
            "routing_no": "215261184",
            "swift_code": "SCBLBDDX",
            "audited_turnover_bdt": 1050000000.0,
            "audited_turnover_usd": 8570000.0,
            "bank_solvency_limit_bdt": 450000000.0,
            "paid_up_capital_bdt": 180000000.0,
            "authorized_capital_bdt": 500000000.0,
            "credit_rating": "AA+",
            "credit_rating_validity": "2027-04-30",
            "certifications": json.dumps([
                "ISO 9001:2015 Quality Management",
                "ISO 27001:2022 Information Security",
                "IEC 62443 Industrial Cybersecurity",
                "Schneider Certified Alliance Partner",
                "BASIS Member G-1104"
            ]),
            "core_competencies": json.dumps([
                "SCADA & Telemetry Systems",
                "Industrial IoT Architectures",
                "Substation Automation",
                "Smart Grid Data Platforms",
                "Predictive Maintenance Algorithms"
            ]),
            "total_employees": 195,
            "certified_engineers": 82,
            "custom_fields": json.dumps([
                {"id": "cf-dc-1", "name": "D&B D-U-N-S Number", "value": "73-402-9182"},
                {"id": "cf-dc-2", "name": "Schneider Alliance Tier", "value": "Master EcoXpert Industrial Automation"},
                {"id": "cf-dc-3", "name": "Siemens Solution Partner ID", "value": "SP-BD-2023-889"}
            ])
        },
        {
            "id": "COMP-CYBERSHIELD",
            "legal_name": "CyberShield Defense Solutions Limited",
            "trade_name": "CyberShield Defense Ltd",
            "company_role": "SUBCONTRACTOR",
            "entity_type": "Private Limited Company",
            "registration_no": "C-143920/2019",
            "incorporation_date": "2019-08-22",
            "country": "Bangladesh",
            "status": "ACTIVE",
            "business_nature": "National Critical Infrastructure Defense, Military-Grade Cryptography, FedRAMP / SOC2 Audits, Red-Teaming, AI Threat Detection",
            "logo_url": "/logos/cybershield.png",
            "tin_number": "581930294819",
            "bin_vat_number": "004819203-0201",
            "trade_license_no": "TRAD/DSCC/019284/2024",
            "trade_license_expiry": "2027-06-30",
            "trade_license_issuer": "Dhaka South City Corporation (Zone 1)",
            "tax_circle_zone": "Circle 44, Tax Zone 08",
            "rjsc_return_year": "2025",
            "irc_erc_no": "IRC-4491820",
            "registered_address": "Suite 14B, Green Grandeur, 58 Kemal Ataturk Avenue, Banani, Dhaka 1213",
            "operational_address": "Cyber Operations Centre, High-Tech Park, Kaliakair, Gazipur",
            "official_email": "compliance@cybershield-defense.com",
            "billing_email": "accounts@cybershield-defense.com",
            "phone": "+880 2 8837194",
            "fax": "+880 2 8837195",
            "website": "https://www.cybershield-defense.com",
            "contact_person_name": "Shahidul Alam, CISSP",
            "contact_person_title": "Head of Threat Intelligence & Audits",
            "contact_person_phone": "+880 1715 889900",
            "contact_person_email": "shahidul@cybershield-defense.com",
            "signatory_name": "Lt. Col. (Retd.) Farhan Ahmed",
            "signatory_title": "Chief Information Security Officer (CISO) & Director",
            "signatory_nid": "1938472910",
            "power_of_attorney_ref": "POA-2024-CS-02",
            "bank_name": "Eastern Bank PLC",
            "bank_branch": "Gulshan Branch, Dhaka",
            "bank_account_name": "CyberShield Defense Solutions Limited",
            "bank_account_no": "1041060392817",
            "routing_no": "095261145",
            "swift_code": "EBLBBDDH",
            "audited_turnover_bdt": 420000000.0,
            "audited_turnover_usd": 3428000.0,
            "bank_solvency_limit_bdt": 150000000.0,
            "paid_up_capital_bdt": 80000000.0,
            "authorized_capital_bdt": 250000000.0,
            "credit_rating": "AA",
            "credit_rating_validity": "2027-08-31",
            "certifications": json.dumps([
                "ISO 27001:2022 Lead Auditor",
                "ISO 22301 Business Continuity",
                "PCI-DSS QSA Partner",
                "CREST Certified SOC",
                "CISSP/CISM Certified Staff"
            ]),
            "core_competencies": json.dumps([
                "Zero Trust Architecture (ZTA)",
                "24/7 Security Operations Center (SOC)",
                "Penetration Testing & VAPT",
                "Smart Grid Cybersecurity Audits",
                "Encrypted Cloud Enclaves"
            ]),
            "total_employees": 90,
            "certified_engineers": 58,
            "custom_fields": json.dumps([
                {"id": "cf-cs-1", "name": "BTRC Security Clearance Ref", "value": "BTRC/CS/2023-4190"},
                {"id": "cf-cs-2", "name": "CREST SOC Accreditation ID", "value": "CREST-SOC-2024-BD01"}
            ])
        },
        {
            "id": "COMP-NYKADVANCE",
            "legal_name": "NYK Advance Engineering & Infrastructure Ltd",
            "trade_name": "NYK Advance Limited",
            "company_role": "JV_PARTNER",
            "entity_type": "Public Limited (Unlisted)",
            "registration_no": "C-082914/2012",
            "incorporation_date": "2012-02-18",
            "country": "Bangladesh",
            "status": "ACTIVE",
            "business_nature": "Heavy Highway & Bridge ITS/ETC Toll Plazas, Structural Fiber-Optic Networks, Industrial Civil Engineering, Weigh-in-Motion (WIM) Gantry Deployment",
            "logo_url": "/logos/nykadvance.png",
            "tin_number": "381920491823",
            "bin_vat_number": "001928475-0304",
            "trade_license_no": "TRAD/DNCC/081923/2024",
            "trade_license_expiry": "2027-06-30",
            "trade_license_issuer": "Dhaka North City Corporation (Zone 5)",
            "tax_circle_zone": "Large Taxpayers Unit (LTU) / Circle 04",
            "rjsc_return_year": "2025",
            "irc_erc_no": "IRC-1102948",
            "registered_address": "NYK Tower, 45 Mohakhali C/A, Dhaka 1212",
            "operational_address": "Yard 4, Gazipur Industrial Belt, Dhaka",
            "official_email": "tenders@nyk-advance.com",
            "billing_email": "finance@nyk-advance.com",
            "phone": "+880 2 9884501",
            "fax": "+880 2 9884502",
            "website": "https://www.nyk-advance.com",
            "contact_person_name": "Engr. Monirul Haque",
            "contact_person_title": "Project Director (Civil & ETC)",
            "contact_person_phone": "+880 1819 223344",
            "contact_person_email": "monirul@nyk-advance.com",
            "signatory_name": "Engr. Kazi Nayeem Hassan",
            "signatory_title": "Executive Director (Tolls & Infrastructure)",
            "signatory_nid": "4918274019",
            "power_of_attorney_ref": "POA-2023-NYK-INFRA-09",
            "bank_name": "City Bank PLC",
            "bank_branch": "Principal Branch, Motijheel, Dhaka",
            "bank_account_name": "NYK Advance Engineering & Infrastructure Ltd",
            "bank_account_no": "1101982746001",
            "routing_no": "225261102",
            "swift_code": "CIBLBDDH",
            "audited_turnover_bdt": 2850000000.0,
            "audited_turnover_usd": 23265000.0,
            "bank_solvency_limit_bdt": 1200000000.0,
            "paid_up_capital_bdt": 500000000.0,
            "authorized_capital_bdt": 1500000000.0,
            "credit_rating": "AAA",
            "credit_rating_validity": "2027-06-30",
            "certifications": json.dumps([
                "ISO 9001:2015 Infrastructure Construction",
                "ISO 14001 Environmental Management",
                "ISO 45001 Occupational Health & Safety",
                "RHD Enlisted Category-1A Contractor"
            ]),
            "core_competencies": json.dumps([
                "Electronic Toll Collection (ETC) Gantries",
                "Highway Weigh-In-Motion (WIM) Systems",
                "Fiber Optic Backbone Trenching & Splicing",
                "High-Mast Gantries & Variable Message Signs (VMS)",
                "Civil Foundation Engineering"
            ]),
            "total_employees": 520,
            "certified_engineers": 110,
            "custom_fields": json.dumps([
                {"id": "cf-nyk-1", "name": "RHD Contractor Enlistment No", "value": "RHD-CL-1A-Dhaka-042"},
                {"id": "cf-nyk-2", "name": "Civil Engineering Plant Fleet Value", "value": "BDT 680,000,000 (Machinery Audited)"}
            ])
        }
    ]

    for p in company_profiles_data:
        cur.execute("DELETE FROM company_profiles WHERE id = ?", (p["id"],))
        keys = list(p.keys())
        placeholders = ", ".join(["?"] * len(keys))
        columns = ", ".join(keys)
        cur.execute(f"INSERT INTO company_profiles ({columns}, created_at, updated_at) VALUES ({placeholders}, ?, ?)", list(p.values()) + [now_iso, now_iso])
        print(f"  [+] Saved Company Profile: {p['id']} ({p['trade_name']} - {p['company_role']})")

    print("\n--- 2. SEEDING PARTNER ORGANIZATIONS ---")
    partner_orgs = [
        ("ORG-DATACORE", "DataCore Systems Ltd", "JV_PARTNER", "Bangladesh", "tenders@datacore-systems.com", "+880 2 9845120", "ACTIVE", "Prime JV Partner for SCADA, Industrial IoT and Smart Grid telemetry."),
        ("ORG-CYBERSHIELD", "CyberShield Defense Ltd", "SUBCONTRACTOR", "Bangladesh", "compliance@cybershield-defense.com", "+880 2 8837194", "ACTIVE", "Subcontractor for Zero-Trust Defense, SOC operations and ISO 27001 / FedRAMP auditing."),
        ("ORG-NYKADVANCE", "NYK Advance Limited", "JV_PARTNER", "Bangladesh", "tenders@nyk-advance.com", "+880 2 9884501", "ACTIVE", "Infrastructure and civil consortium partner for expressway toll plazas and fiber optic backbone."),
        ("ORG-CISCO-SYS", "Cisco Systems Inc.", "CONSULTANT", "United States", "public-sector-bids@cisco.com", "+1 408 526 4000", "ACTIVE", "OEM Network Infrastructure & Industrial Ethernet Switch supplier."),
        ("ORG-MICROSOFT-BD", "Microsoft Bangladesh", "OTHER", "Bangladesh", "bangladesh-ps@microsoft.com", "+880 2 9898011", "ACTIVE", "Tier-1 Cloud Provider Partner for Azure Government & OpenAI Sovereign Deployments.")
    ]
    cur.execute("DELETE FROM partner_organizations")
    for po in partner_orgs:
        cur.execute("""
            INSERT INTO partner_organizations (id, name, partner_type, country, contact_email, contact_phone, status, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, po + (now_iso, now_iso))
        print(f"  [+] Saved Partner Org: {po[0]} ({po[1]})")

    print("\n--- 3. LINKING PARTNERS TO ACTIVE TENDERS ---")
    cur.execute("DELETE FROM tender_partner_organizations")
    tender_assignments = [
        ("TDR-2026-RHD-001", "ORG-NYKADVANCE", "JV_PARTNER", "ACTIVE", "System Admin", "Consortium JV partner for civil gantry and ETC toll plaza construction."),
        ("TDR-2026-RHD-001", "ORG-DATACORE", "JV_PARTNER", "ACTIVE", "System Admin", "Consortium partner for lane controllers and SCADA central clearing."),
        ("TDR-2026-UNPD-USA-002", "ORG-DATACORE", "JV_PARTNER", "ACTIVE", "System Admin", "Technology partner for mission-critical telemetry and container workloads."),
        ("TDR-2026-UNPD-USA-002", "ORG-CYBERSHIELD", "SUBCONTRACTOR", "ACTIVE", "System Admin", "Cybersecurity and Zero-Trust enclave audit partner."),
        ("UNDP-BGD-01218", "ORG-DATACORE", "JV_PARTNER", "ACTIVE", "System Admin", "IoT & AI deployment partner."),
        ("UNDP-BGD-01218", "ORG-CYBERSHIELD", "SUBCONTRACTOR", "ACTIVE", "System Admin", "Sovereign AI data security auditor.")
    ]
    for ta in tender_assignments:
        cur.execute("""
            INSERT INTO tender_partner_organizations (tender_id, organization_id, partner_type, status, assigned_by, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ta)
        print(f"  [+] Linked {ta[1]} to Tender {ta[0]} ({ta[2]})")

    print("\n--- 4. SEEDING COMPANY PROJECT CREDENTIALS & PHYSICAL PDFS ---")
    cur.execute("DELETE FROM company_project_credentials")
    
    projects = [
        {
            "id": "PROJ-PRIMETECH-01",
            "company_name": "PrimeTech Ltd",
            "company_role": "LEAD_BIDDER",
            "project_title": "Padma Bridge & Expressway Automated Electronic Toll Collection (ETC) System",
            "client_name": "Bangladesh Bridge Authority (BBA) / Roads and Highways Department",
            "contract_value": 185000000.0,
            "currency": "BDT",
            "start_date": "2023-01-15",
            "completion_date": "2024-06-30",
            "role_in_project": "Prime Contractor & System Integrator",
            "wo_filename": "BBA_WO_Padma_ETC_Signed.pdf",
            "cc_filename": "BBA_Final_Completion_Acceptance_Padma.pdf",
            "custom_fields": [
                {"id": "cf-p1-1", "name": "Consultant JV", "value": "Korea Expressway Corporation (KEC) JV"},
                {"id": "cf-p1-2", "name": "ETC Lanes Deployed", "value": "18 High-Speed Dedicated RFID Transceiver Lanes"},
                {"id": "cf-p1-3", "name": "Transaction Volume", "value": "Over 45,000 daily automated reconciliations with Bangladesh Bank RTGS"},
                {"id": "cf-p1-4", "name": "Warranty Period", "value": "36 Months Comprehensive OEM SLA Active"}
            ]
        },
        {
            "id": "PROJ-PRIMETECH-02",
            "company_name": "PrimeTech Ltd",
            "company_role": "LEAD_BIDDER",
            "project_title": "Global Logistics & Field Mission Enterprise Hybrid Cloud Migration and Identity Mesh",
            "client_name": "International Organization for Migration (IOM) - Geneva & Dhaka Hub",
            "contract_value": 3200000.0,
            "currency": "USD",
            "start_date": "2023-08-01",
            "completion_date": "2024-11-20",
            "role_in_project": "Prime Contractor",
            "wo_filename": "IOM_Mission_Cloud_Migration_WorkOrder.pdf",
            "cc_filename": "IOM_Operational_Handover_Certificate.pdf",
            "custom_fields": [
                {"id": "cf-p2-1", "name": "UN Vendor Status", "value": "UNGM Level-2 Verified Sovereign Provider"},
                {"id": "cf-p2-2", "name": "Infrastructure Scale", "value": "48 Mission Critical Servers Migrated with Zero Data Loss"},
                {"id": "cf-p2-3", "name": "Zero-Downtime Migration", "value": "Failover completed in under 120 seconds"}
            ]
        },
        {
            "id": "PROJ-DATACORE-01",
            "company_name": "DataCore Systems Ltd",
            "company_role": "JV_PARTNER",
            "project_title": "National Renewable Energy Centralized SCADA Monitoring and Smart Grid Telemetry Platform",
            "client_name": "Sustainable and Renewable Energy Development Authority (SREDA)",
            "contract_value": 320000000.0,
            "currency": "BDT",
            "start_date": "2022-04-10",
            "completion_date": "2023-10-15",
            "role_in_project": "Lead Technology & SCADA Partner",
            "wo_filename": "SREDA_WO_Microgrid_Signed.pdf",
            "cc_filename": "SREDA_Final_Completion_Certificate.pdf",
            "custom_fields": [
                {"id": "cf-dc-p1", "name": "Protocol Stack", "value": "IEC 60870-5-104 & DNP3 Telemetry standard"},
                {"id": "cf-dc-p2", "name": "Grid Interconnections", "value": "22 Solar IPP Plants real-time telemetry to National Load Dispatch"},
                {"id": "cf-dc-p3", "name": "Telemetry Accuracy", "value": "99.992% Data Packet Ingestion Reliability"}
            ]
        },
        {
            "id": "PROJ-DATACORE-02",
            "company_name": "DataCore Systems Ltd",
            "company_role": "JV_PARTNER",
            "project_title": "Smart Prepaid Metering Head-End System (HES) & Advanced Metering Infrastructure (AMI) Integration",
            "client_name": "Dhaka Electric Supply Company Limited (DESCO)",
            "contract_value": 480000000.0,
            "currency": "BDT",
            "start_date": "2023-03-01",
            "completion_date": "2024-09-30",
            "role_in_project": "System Integrator & Software OEM",
            "wo_filename": "DESCO_AMI_Work_Order_Signed.pdf",
            "cc_filename": "DESCO_Final_Acceptance_Certificate.pdf",
            "custom_fields": [
                {"id": "cf-dc-p2-1", "name": "Meter Ingestion Capacity", "value": "250,000 Smart Cellular Meters"},
                {"id": "cf-dc-p2-2", "name": "Standard Compliance", "value": "DLMS/COSEM Suite Standard 2.0"},
                {"id": "cf-dc-p2-3", "name": "Billing Integration", "value": "Direct Real-time Integration with DESCO SAP ERP"}
            ]
        },
        {
            "id": "PROJ-CYBERSHIELD-01",
            "company_name": "CyberShield Defense Ltd",
            "company_role": "SUBCONTRACTOR",
            "project_title": "Bangladesh Bank RTGS & Core Clearing Security Hardening and 24/7 Red-Team Operations",
            "client_name": "Bangladesh Bank (Central Bank of Bangladesh)",
            "contract_value": 160000000.0,
            "currency": "BDT",
            "start_date": "2023-05-15",
            "completion_date": "2024-08-30",
            "role_in_project": "Lead Cybersecurity Specialist Subcontractor",
            "wo_filename": "BangladeshBank_SOC_WorkOrder_Signed.pdf",
            "cc_filename": "BangladeshBank_Acceptance_Letter.pdf",
            "custom_fields": [
                {"id": "cf-cs-p1-1", "name": "Standard Compliance", "value": "SWIFT Customer Security Programme (CSP v2024)"},
                {"id": "cf-cs-p1-2", "name": "Defense Framework", "value": "NIST CSF 2.0 & MITRE ATT&CK Matrix for Financial Systems"},
                {"id": "cf-cs-p1-3", "name": "Clearance Level", "value": "Classified Central Bank National Security Clearance"}
            ]
        },
        {
            "id": "PROJ-CYBERSHIELD-02",
            "company_name": "CyberShield Defense Ltd",
            "company_role": "SUBCONTRACTOR",
            "project_title": "National Load Dispatch Centre (NLDC) OT/IT Industrial Firewall Hardening & Threat Intelligence",
            "client_name": "Power Grid Company of Bangladesh (PGCB)",
            "contract_value": 95000000.0,
            "currency": "BDT",
            "start_date": "2023-11-01",
            "completion_date": "2024-12-15",
            "role_in_project": "Cyber Defense Subcontractor",
            "wo_filename": "PGCB_NLDC_Security_WorkOrder.pdf",
            "cc_filename": "PGCB_Final_Commissioning_Report.pdf",
            "custom_fields": [
                {"id": "cf-cs-p2-1", "name": "OT Architecture", "value": "IEC 62443 Security Level 3 Industrial Zoning"},
                {"id": "cf-cs-p2-2", "name": "Air-Gap Technology", "value": "Hardware Unidirectional Data Diodes"}
            ]
        },
        {
            "id": "PROJ-NYKADVANCE-01",
            "company_name": "NYK Advance Limited",
            "company_role": "JV_PARTNER",
            "project_title": "Dhaka Bus Rapid Transit (BRT Line-3) Civil Stations & Intelligent Weigh-in-Motion Gantries",
            "client_name": "Dhaka BRT Company Limited & RHD",
            "contract_value": 1250000000.0,
            "currency": "BDT",
            "start_date": "2021-09-01",
            "completion_date": "2023-12-31",
            "role_in_project": "Civil & Structural Consortium Partner",
            "wo_filename": "BRT_Gazipur_Civil_Gantry_WorkOrder.pdf",
            "cc_filename": "BRT_Commercial_Completion_Certificate.pdf",
            "custom_fields": [
                {"id": "cf-nyk-p1-1", "name": "Civil Foundations", "value": "16 Elevated Station Concourses & 8 Quartz Sensor Pits"},
                {"id": "cf-nyk-p1-2", "name": "Supervising Consultant", "value": "Egis Rail (France) in JV with SMEC (Australia)"},
                {"id": "cf-nyk-p1-3", "name": "Concrete Batching", "value": "35,000 cu.m Ready-mix C40 Concrete Poured"}
            ]
        },
        {
            "id": "PROJ-NYKADVANCE-02",
            "company_name": "NYK Advance Limited",
            "company_role": "JV_PARTNER",
            "project_title": "Chittagong Port Deep Berth Heavy Equipment Foundation & Underground Optical Fiber Duct Network",
            "client_name": "Chittagong Port Authority (CPA)",
            "contract_value": 820000000.0,
            "currency": "BDT",
            "start_date": "2022-02-15",
            "completion_date": "2024-03-20",
            "role_in_project": "Lead Infrastructure Contractor",
            "wo_filename": "CPA_Berth_Fiber_Infrastructure_WO.pdf",
            "cc_filename": "CPA_Final_Handover_Certificate.pdf",
            "custom_fields": [
                {"id": "cf-nyk-p2-1", "name": "Underground Ducting", "value": "45 km HDPE Heavy-Duty Armored Fiber Conduit"},
                {"id": "cf-nyk-p2-2", "name": "Marine Foundations", "value": "Deep Marine Pile Foundation for Ship-to-Shore Gantry Cranes"}
            ]
        }
    ]

    for prj in projects:
        safe_co = safe_slug(prj["company_name"])
        base_dir = STORAGE_ROOT / "companies" / safe_co / "projects" / prj["id"]
        
        # 1. Create Work Order PDF
        wo_path = base_dir / "work_order" / prj["wo_filename"]
        wo_hash, wo_size = create_valid_pdf(
            wo_path,
            title=f"FORMAL WORK ORDER & CONTRACT AWARD",
            subtitle=f"Project: {prj['project_title']}",
            metadata={
                "Awarding Authority": prj["client_name"],
                "Awarded Entity": f"{prj['company_name']} ({prj['company_role']})",
                "Contract Value": f"{prj['currency']} {prj['contract_value']:,.2f}",
                "Award Date": prj["start_date"],
                "Official Ref": f"WO-{prj['id']}-EXEC-SIGNED",
                "Classification": "OFFICIAL COMMERCIAL TENDER DOCUMENT"
            }
        )

        # 2. Create Completion Certificate PDF
        cc_path = base_dir / "completion_cert" / prj["cc_filename"]
        cc_hash, cc_size = create_valid_pdf(
            cc_path,
            title=f"FINAL COMPLETION & ACCEPTANCE CERTIFICATE",
            subtitle=f"Project: {prj['project_title']}",
            metadata={
                "Client Organization": prj["client_name"],
                "Executing Contractor": f"{prj['company_name']} ({prj['role_in_project']})",
                "Final Certified Value": f"{prj['currency']} {prj['contract_value']:,.2f}",
                "Commissioning Date": prj["completion_date"],
                "Acceptance Status": "100% SATISFACTORILY COMPLETED & DEFECT-FREE",
                "Certificate No": f"CC-{prj['id']}-FINAL-ACCEPTED"
            }
        )

        cur.execute("""
            INSERT INTO company_project_credentials (
                id, company_name, company_role, project_title, client_name,
                contract_value, currency, start_date, completion_date, role_in_project,
                work_order_filename, work_order_path, work_order_sha256, work_order_size,
                completion_cert_filename, completion_cert_path, completion_cert_sha256, completion_cert_size,
                custom_fields, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            prj["id"], prj["company_name"], prj["company_role"], prj["project_title"], prj["client_name"],
            prj["contract_value"], prj["currency"], prj["start_date"], prj["completion_date"], prj["role_in_project"],
            prj["wo_filename"], str(wo_path), wo_hash, wo_size,
            prj["cc_filename"], str(cc_path), cc_hash, cc_size,
            json.dumps(prj["custom_fields"]), now_iso, now_iso
        ))
        print(f"  [+] Saved Project: {prj['id']} - {prj['project_title'][:40]}... ({prj['company_name']})")

    print("\n--- 5. SEEDING MASTER REUSABLE DOCUMENTS WITH PHYSICAL FILES ---")
    cur.execute("DELETE FROM reusable_documents")

    master_docs = [
        # PrimeTech Ltd (Lead Bidder)
        {
            "id": "RUD-PT-INC-01",
            "name": "PrimeTech_Certificate_of_Incorporation_RJSC.pdf",
            "category": "Company Statutory",
            "company_name": "PrimeTech Ltd",
            "company_role": "LEAD_BIDDER",
            "is_jv": False,
            "access": "ALL_TEAM",
            "exp": "2035-12-31",
            "desc": "Official Registrar of Joint Stock Companies (RJSC) Certificate of Incorporation C-102948."
        },
        {
            "id": "RUD-PT-MOA-02",
            "name": "PrimeTech_Memorandum_and_Articles_of_Association.pdf",
            "category": "Company Statutory",
            "company_name": "PrimeTech Ltd",
            "company_role": "LEAD_BIDDER",
            "is_jv": False,
            "access": "ALL_TEAM",
            "exp": None,
            "desc": "Certified true copy of Memorandum and Articles of Association registered with RJSC."
        },
        {
            "id": "RUD-PT-TAX-03",
            "name": "PrimeTech_Tax_Return_Acknowledgment_2024_2025.pdf",
            "category": "Financial & Tax",
            "company_name": "PrimeTech Ltd",
            "company_role": "LEAD_BIDDER",
            "is_jv": False,
            "access": "RESTRICTED_FINANCE",
            "exp": "2026-11-30",
            "desc": "NBR e-TIN Return Acknowledgment Slip & Tax Clearance Certificate for Assessment Year 2024-2025."
        },
        {
            "id": "RUD-PT-AUDIT-04",
            "name": "PrimeTech_3Years_Audited_Financial_Statements_CA.pdf",
            "category": "Financial & Tax",
            "company_name": "PrimeTech Ltd",
            "company_role": "LEAD_BIDDER",
            "is_jv": False,
            "access": "RESTRICTED_FINANCE",
            "exp": "2026-12-31",
            "desc": "Audited Balance Sheets, P&L and Cash Flow Statements certified by Hoda Vasi Chowdhury & Co. Chartered Accountants."
        },
        {
            "id": "RUD-PT-ISO-05",
            "name": "PrimeTech_ISO_9001_and_27001_Master_Certificates.pdf",
            "category": "Certifications & ISO",
            "company_name": "PrimeTech Ltd",
            "company_role": "LEAD_BIDDER",
            "is_jv": False,
            "access": "ALL_TEAM",
            "exp": "2027-05-15",
            "desc": "Bureau Veritas Certified ISO 9001:2015 and ISO 27001:2022 Information Security Management System."
        },
        {
            "id": "RUD-PT-LEGAL-06",
            "name": "PrimeTech_Non_Debarment_Affidavit_Stamp300.pdf",
            "category": "Legal & Governance",
            "company_name": "PrimeTech Ltd",
            "company_role": "LEAD_BIDDER",
            "is_jv": False,
            "access": "MANAGEMENT_ONLY",
            "exp": "2026-12-31",
            "desc": "Notarized Non-Debarment and Clean Integrity Undertaking executed on BDT 300 Non-Judicial Stamp Paper."
        },

        # DataCore Systems Ltd (JV Partner)
        {
            "id": "RUD-DC-INC-01",
            "name": "DataCore_Certificate_of_Incorporation_Form_XII.pdf",
            "category": "Company Statutory",
            "company_name": "DataCore Systems Ltd",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "ALL_TEAM",
            "exp": "2036-12-31",
            "desc": "RJSC Certificate of Incorporation and Schedule Form XII showing Board of Directors."
        },
        {
            "id": "RUD-DC-TRADE-02",
            "name": "DataCore_Updated_Trade_License_DNCC_2024_2027.pdf",
            "category": "Company Statutory",
            "company_name": "DataCore Systems Ltd",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "ALL_TEAM",
            "exp": "2027-06-30",
            "desc": "Dhaka North City Corporation renewed trade license for Industrial Automation and Engineering."
        },
        {
            "id": "RUD-DC-SOLV-03",
            "name": "DataCore_Standard_Chartered_Bank_Solvency_Certificate.pdf",
            "category": "Financial & Tax",
            "company_name": "DataCore Systems Ltd",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "RESTRICTED_FINANCE",
            "exp": "2026-10-31",
            "desc": "SCB Bank Solvency and Credit Line facility confirmation letter for BDT 450,000,000."
        },
        {
            "id": "RUD-DC-ISO-04",
            "name": "DataCore_IEC_62443_and_ISO_27001_Industrial_Security.pdf",
            "category": "Certifications & ISO",
            "company_name": "DataCore Systems Ltd",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "ALL_TEAM",
            "exp": "2027-04-10",
            "desc": "TUV Rheinland Certified IEC 62443 Industrial Network & SCADA Security compliance certificate."
        },
        {
            "id": "RUD-DC-CV-05",
            "name": "DataCore_Key_Personnel_Chief_SCADA_Architect_CV.pdf",
            "category": "Key Personnel CV",
            "company_name": "DataCore Systems Ltd",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "ALL_TEAM",
            "exp": "2028-01-01",
            "desc": "Signed Europass format CV and credentials of Chief SCADA Architect Dr. Tariqul Islam (PhD, PE)."
        },
        {
            "id": "RUD-DC-POA-06",
            "name": "DataCore_Joint_Venture_Power_of_Attorney_and_MOU.pdf",
            "category": "Legal & Governance",
            "company_name": "DataCore Systems Ltd",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "EXECUTIVE_ONLY",
            "exp": "2027-12-31",
            "desc": "Standard JV Power of Attorney and Joint Bidding Consortium Agreement template for Government Tenders."
        },

        # CyberShield Defense Ltd (Subcontractor)
        {
            "id": "RUD-CS-INC-01",
            "name": "CyberShield_Incorporation_and_BTRC_Clearance.pdf",
            "category": "Company Statutory",
            "company_name": "CyberShield Defense Ltd",
            "company_role": "SUBCONTRACTOR",
            "is_jv": False,
            "access": "ALL_TEAM",
            "exp": "2039-08-30",
            "desc": "RJSC Registration and BTRC Special Cybersecurity Security Clearance documentation."
        },
        {
            "id": "RUD-CS-FIN-02",
            "name": "CyberShield_Audited_Turnover_and_Tax_Clearance.pdf",
            "category": "Financial & Tax",
            "company_name": "CyberShield Defense Ltd",
            "company_role": "SUBCONTRACTOR",
            "is_jv": False,
            "access": "RESTRICTED_FINANCE",
            "exp": "2026-11-30",
            "desc": "Chartered Accountants Audited Turnover Certificate and EBL Solvency certificate."
        },
        {
            "id": "RUD-CS-CREST-03",
            "name": "CyberShield_CREST_SOC_and_ISO_27001_Accreditation.pdf",
            "category": "Certifications & ISO",
            "company_name": "CyberShield Defense Ltd",
            "company_role": "SUBCONTRACTOR",
            "is_jv": False,
            "access": "ALL_TEAM",
            "exp": "2027-08-31",
            "desc": "CREST Certified Security Operations Center and ISO 27001 Lead Auditor certifications."
        },
        {
            "id": "RUD-CS-CV-04",
            "name": "CyberShield_CISO_and_Lead_Pentester_Profiles.pdf",
            "category": "Key Personnel CV",
            "company_name": "CyberShield Defense Ltd",
            "company_role": "SUBCONTRACTOR",
            "is_jv": False,
            "access": "ALL_TEAM",
            "exp": "2027-12-31",
            "desc": "Certified CISSP, CEH, OSCP personnel dossiers and national security clearance vetting records."
        },

        # NYK Advance Limited (JV Partner)
        {
            "id": "RUD-NYK-INC-01",
            "name": "NYK_Advance_Certificate_of_Incorporation_and_Articles.pdf",
            "category": "Company Statutory",
            "company_name": "NYK Advance Limited",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "ALL_TEAM",
            "exp": "2032-02-28",
            "desc": "Certified RJSC Incorporation Certificate and Articles of Association for Public Limited Entity."
        },
        {
            "id": "RUD-NYK-RHD-02",
            "name": "NYK_RHD_Enlistment_License_Category_1A.pdf",
            "category": "Company Statutory",
            "company_name": "NYK Advance Limited",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "ALL_TEAM",
            "exp": "2027-06-30",
            "desc": "Roads and Highways Department (RHD) Category 1-A Special Grade Contractor Enlistment Renewal."
        },
        {
            "id": "RUD-NYK-BANK-03",
            "name": "NYK_City_Bank_Solvency_and_1_2Billion_Credit_Line.pdf",
            "category": "Financial & Tax",
            "company_name": "NYK Advance Limited",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "RESTRICTED_FINANCE",
            "exp": "2026-12-31",
            "desc": "City Bank PLC Solvency Certificate confirming BDT 1,200,000,000 credit line facility for national tenders."
        },
        {
            "id": "RUD-NYK-ISO-04",
            "name": "NYK_ISO_9001_14001_45001_QHSE_Master_Certificates.pdf",
            "category": "Certifications & ISO",
            "company_name": "NYK Advance Limited",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "ALL_TEAM",
            "exp": "2027-06-30",
            "desc": "Integrated Management System (IMS) Quality, Environmental, and Occupational Safety Certificates."
        },
        {
            "id": "RUD-NYK-PLANT-05",
            "name": "NYK_Civil_Construction_Heavy_Plant_and_Equipment_Audit.pdf",
            "category": "Past Credentials",
            "company_name": "NYK Advance Limited",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "ALL_TEAM",
            "exp": "2026-12-31",
            "desc": "Independent Engineering Surveyor report of owned asphalt plants, boring rigs, crane fleet and fiber tensioners."
        },
        {
            "id": "RUD-NYK-LEGAL-06",
            "name": "NYK_Litigation_History_and_Integrity_Affidavit.pdf",
            "category": "Legal & Governance",
            "company_name": "NYK Advance Limited",
            "company_role": "JV_PARTNER",
            "is_jv": True,
            "access": "MANAGEMENT_ONLY",
            "exp": "2026-12-31",
            "desc": "Judicial Magistrate attested affidavit confirming no debarment, blacklisting, or active litigation with any Ministry."
        }
    ]

    for d in master_docs:
        safe_co = safe_slug(d["company_name"])
        doc_path = STORAGE_ROOT / "companies" / safe_co / "master_documents" / d["name"]
        d_hash, d_size = create_valid_pdf(
            doc_path,
            title=f"MASTER REUSABLE CREDENTIAL DOSSIER",
            subtitle=f"{d['name']}",
            metadata={
                "Owning Entity": f"{d['company_name']} ({d['company_role']})",
                "Category": d["category"],
                "Document ID": d["id"],
                "Access Clearance": d["access"],
                "Valid Through": d["exp"] or "Perpetual / Active",
                "Description": d["desc"]
            }
        )

        cur.execute("""
            INSERT INTO reusable_documents (
                id, name, category, company_name, company_role, is_jv_partner,
                uploaded_at, expiry_date, size, revision, access_level,
                sha256, description, file_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            d["id"], d["name"], d["category"], d["company_name"], d["company_role"],
            d["is_jv"], now_date, d["exp"], d_size, "v1.0", d["access"],
            d_hash, d["desc"], str(doc_path)
        ))
        print(f"  [+] Saved Reusable Doc: {d['id']} ({d['name'][:40]}... for {d['company_name']})")

    conn.commit()
    conn.close()
    print("\n[OK] SEEDING COMPLETE! All companies, partners, projects, and physical PDF files are generated successfully.")

if __name__ == "__main__":
    seed()

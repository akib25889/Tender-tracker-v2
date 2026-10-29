import os
import json
import sqlite3
import hashlib
from datetime import datetime, timezone
from pathlib import Path

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

def configure_jv_tenders():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    now_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    print("=== CONFIGURING TENDERS AS HIGH-PROFILE JOINT VENTURES (JV) ===")

    jv_tenders = [
        # 1. Flagship International AI Project
        {
            "id": "TDR-2026-UNPD-USA-002",
            "title": "Enterprise Hybrid Cloud Migration, AI Document Intelligence & Global Operations Infrastructure",
            "organization": "United Nations Procurement Division (UNPD) - New York HQ",
            "country": "United States",
            "category": "IT & Cloud Infrastructure",
            "estimated_value": 12800000.0,
            "currency": "USD",
            "exchange_rate_to_bdt": 122.5,
            "estimated_value_bdt": 1568000000.0,
            "stage": "PREPARATION",
            "decision": "GO",
            "priority": "CRITICAL",
            "tender_type": "International Competitive Bidding (ICB)",
            "budget_type": "UN Capital Master Budget",
            "procurement_method": "Open International RFP (Two-Envelope)",
            "evaluation_method": "Quality & Cost Based Selection (QCBS 80:20)",
            "partners": [
                ("ORG-DATACORE", "JV_PARTNER", "Co-Bidder for Edge Telemetry, High-Throughput Stream Ingestion & Multi-Region Distributed Sensor Nodes (40% Share)."),
                ("ORG-CYBERSHIELD", "SUBCONTRACTOR", "Independent Cybersecurity Subcontractor for UN Level-3 Enclave Accreditation & FedRAMP High Guardrails.")
            ],
            "jv_config": {
                "participation": "Allowed (International Joint Venture / Consortium of up to 3 entities permitted)",
                "leadMember": "PrimeTech Solutions Limited (Lead Bidder & Sovereign Cloud Integrator - 60% Share)",
                "localPartner": "DataCore Systems Ltd",
                "memberRules": "All JV members jointly and severally liable; Lead member must satisfy primary financial turnover (>USD 10M); Technical AI & Cloud scores combined.",
                "jvAgreement": "Mandatory registered Joint Venture Consortium Agreement and Joint Power of Attorney executed before a Notary Public / Hague Apostille.",
                # Snake case aliases for universal frontend/backend compatibility
                "lead_member": "PrimeTech Solutions Limited (Lead Bidder & Sovereign Cloud Integrator - 60% Share)",
                "local_partner": "DataCore Systems Ltd",
                "member_rules": "All JV members jointly and severally liable; Lead member must satisfy primary financial turnover (>USD 10M); Technical AI & Cloud scores combined.",
                "jv_agreement": "Mandatory registered Joint Venture Consortium Agreement and Joint Power of Attorney executed before a Notary Public / Hague Apostille."
            },
            "documents": [
                {
                    "folder": "01_original_tender_documents",
                    "name": "UNPD_RFP_2026_Enterprise_Hybrid_Cloud_and_AI.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "OFFICIAL UN PROCUREMENT DIVISION RFP DOCUMENT",
                    "subtitle": "UNPD RFP Reference: UNPD-USA-2026-002",
                    "meta": {"Issuing Authority": "UN Procurement Division NY HQ", "Tender Value": "USD 12,800,000", "Deadline": "2026-11-20"}
                },
                {
                    "folder": "02A_jv_partner_credentials",
                    "name": "DataCore_ISO27001_and_IEC62443_Certified_Credentials.pdf",
                    "company_name": "DataCore Systems Ltd",
                    "company_role": "JV_PARTNER",
                    "is_jv": True,
                    "title": "JV PARTNER OFFICIAL STATUTORY & TECHNICAL DOSSIER",
                    "subtitle": "DataCore Systems Bangladesh Limited (JV Partner)",
                    "meta": {"Owning Entity": "DataCore Systems Ltd", "Role": "Consortium Partner (40%)", "Security Standard": "ISO 27001:2022 & IEC 62443"}
                },
                {
                    "folder": "02B_lead_statutory_documents",
                    "name": "PrimeTech_Lead_Bidder_Sovereign_Corporate_Dossier.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "LEAD BIDDER STATUTORY QUALIFICATION DOSSIER",
                    "subtitle": "PrimeTech Solutions Limited (Prime Contractor)",
                    "meta": {"Owning Entity": "PrimeTech Solutions Limited", "Role": "Lead Consortium Contractor (60%)", "Turnover": "BDT 1.45 Billion / USD 11.8M"}
                },
                {
                    "folder": "02C_jv_agreement_and_poa",
                    "name": "UNPD_Notarized_Joint_Venture_Consortium_Deed.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": True,
                    "title": "NOTARIZED JOINT VENTURE CONSORTIUM AGREEMENT",
                    "subtitle": "Consortium of PrimeTech Solutions Ltd & DataCore Systems Ltd",
                    "meta": {"Lead Partner (60%)": "PrimeTech Solutions Limited", "JV Partner (40%)": "DataCore Systems Ltd", "Subcontractor": "CyberShield Defense Ltd", "Execution": "Notarized & Apostilled"}
                },
                {
                    "folder": "03_technical_proposal",
                    "name": "Joint_AI_Document_Intelligence_and_Hybrid_Cloud_Architecture.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "TECHNICAL PROPOSAL & ENTERPRISE ARCHITECTURE",
                    "subtitle": "AI Document Intelligence & Zero-Trust Cloud Platform",
                    "meta": {"AI Model Architecture": "Sovereign Fine-Tuned LLM & OCR Parsing", "Telemetry Pipeline": "DataCore Ingestion Gateway", "Security Enclave": "CyberShield FedRAMP High"}
                }
            ]
        },

        # 2. Flagship Government AI Project
        {
            "id": "UNDP-BGD-01218",
            "title": "Contracting a Firm for AI Use Case Design, Prototyping, Controlled Testing and Local Deployment for Government Operational Efficiency",
            "organization": "United Nations Development Programme (UNDP) Bangladesh",
            "country": "Bangladesh",
            "category": "AI & Machine Learning",
            "estimated_value": 145000000.0,
            "currency": "BDT",
            "exchange_rate_to_bdt": 1.0,
            "estimated_value_bdt": 145000000.0,
            "stage": "PREPARATION",
            "decision": "GO",
            "priority": "HIGH",
            "tender_type": "National Competitive RFP (QCBS)",
            "budget_type": "UNDP Trust Fund & GoB Co-Financing",
            "procurement_method": "Quality and Cost Based Selection (QCBS 80:20)",
            "evaluation_method": "Two-Envelope Technical + Financial Evaluation",
            "partners": [
                ("ORG-DATACORE", "JV_PARTNER", "Local Data Ingestion Pipelines, Government API Connectors & On-Premise GPU Edge Cluster Deployment (35% Share)."),
                ("ORG-CYBERSHIELD", "SUBCONTRACTOR", "Security Red-Teaming, AI Prompt Injection Guardrails & Sovereign Citizen Privacy Auditing.")
            ],
            "jv_config": {
                "participation": "Allowed (Joint Venture / Consortium Permitted up to 3 partners)",
                "leadMember": "PrimeTech Solutions Limited (Lead AI Architecture, LLM Fine-Tuning & Government Enterprise Integration - 65% Share)",
                "localPartner": "DataCore Systems Ltd",
                "memberRules": "Lead partner must have delivered at least 1 large-scale national data or AI transformation project; Technical team qualifications and CA audited turnover combined.",
                "jvAgreement": "Mandatory signed Joint Venture Agreement conforming to UNDP Quantum Form E and Board Resolutions from both entities.",
                # Snake case aliases
                "lead_member": "PrimeTech Solutions Limited (Lead AI Architecture, LLM Fine-Tuning & Government Enterprise Integration - 65% Share)",
                "local_partner": "DataCore Systems Ltd",
                "member_rules": "Lead partner must have delivered at least 1 large-scale national data or AI transformation project; Technical team qualifications and CA audited turnover combined.",
                "jv_agreement": "Mandatory signed Joint Venture Agreement conforming to UNDP Quantum Form E and Board Resolutions from both entities."
            },
            "documents": [
                {
                    "folder": "01_original_tender_documents",
                    "name": "UNDP_BGD_RFP_01218_AI_Government_Efficiency.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "UNDP BANGLADESH OFFICIAL REQUEST FOR PROPOSALS",
                    "subtitle": "Tender Ref: UNDP-BGD-01218",
                    "meta": {"Client": "UNDP Bangladesh", "Scope": "AI Prototype Design & Operationalization", "Value": "BDT 145,000,000"}
                },
                {
                    "folder": "02A_jv_partner_credentials",
                    "name": "DataCore_OnPrem_GPU_Cluster_and_IoT_Credentials.pdf",
                    "company_name": "DataCore Systems Ltd",
                    "company_role": "JV_PARTNER",
                    "is_jv": True,
                    "title": "JV PARTNER TECHNICAL QUALIFICATIONS",
                    "subtitle": "DataCore Systems Ltd - High-Performance AI Infrastructure",
                    "meta": {"Partner Role": "JV Partner (35%)", "Infrastructure": "Edge GPU Cluster & Telemetry Ingestion", "Solvency": "BDT 450,000,000"}
                },
                {
                    "folder": "02B_lead_statutory_documents",
                    "name": "PrimeTech_AI_Center_of_Excellence_Credentials.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "LEAD BIDDER AI QUALIFICATIONS & RJSC STATUTORY DOSSIER",
                    "subtitle": "PrimeTech Solutions Limited (Lead Bidder 65%)",
                    "meta": {"Lead Bidder": "PrimeTech Solutions Limited", "Certifications": "CMMI Level 3 & ISO 27001:2022", "Engineers": "145 Certified Engineers"}
                },
                {
                    "folder": "02C_jv_agreement_and_poa",
                    "name": "UNDP_Form_E_Signed_Joint_Venture_Agreement.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": True,
                    "title": "JOINT VENTURE AGREEMENT & BOARD RESOLUTION (UNDP FORM E)",
                    "subtitle": "PrimeTech Solutions Ltd (Lead) & DataCore Systems Ltd (Partner)",
                    "meta": {"Form": "UNDP Quantum Standard Form E", "Liability": "Joint and Several", "Signatories": "Kazi Farhan Ahmed (MD) & Dr. Tariqul Islam (CEO)"}
                },
                {
                    "folder": "03_technical_proposal",
                    "name": "Bengali_LLM_Adaptation_and_Government_Workflow_Proposal.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "TECHNICAL METHODOLOGY & AI PROTOTYPING ROADMAP",
                    "subtitle": "Fine-Tuned Sovereign LLMs for Ministry Service Automation",
                    "meta": {"Methodology": "Controlled Sandbox Testing with Real-world Ministry Workflows", "Security": "Red-Teaming by CyberShield Defense Ltd"}
                }
            ]
        },

        # 3. International AI Early Warning & Satellite Analytics Project
        {
            "id": "UNDP-SOM-00710",
            "title": "Long-Term Agreement for AI-Enabled Early Warning, Operational Risk Monitoring and Analytical Services",
            "organization": "United Nations Development Programme (UNDP) – Somalia Country Office",
            "country": "Somalia",
            "category": "AI Predictive Analytics & Geospatial",
            "estimated_value": 4800000.0,
            "currency": "USD",
            "exchange_rate_to_bdt": 122.5,
            "estimated_value_bdt": 588000000.0,
            "stage": "PREPARATION",
            "decision": "GO",
            "priority": "HIGH",
            "tender_type": "International Competitive Bidding (3-Year LTA)",
            "budget_type": "UNDP Crisis Bureau & Multi-Donor Trust Fund",
            "procurement_method": "Open International RFP",
            "evaluation_method": "Quality & Cost Based Selection (QCBS 70:30)",
            "partners": [
                ("ORG-DATACORE", "JV_PARTNER", "Satellite Remote Sensing Data Ingestion, Automated Weather Sensor Telemetry & Distributed Hubs (40% Share)."),
                ("ORG-CYBERSHIELD", "SUBCONTRACTOR", "Encrypted Mission Critical Communications, SatCom Data Protection & Air-Gapped Intelligence.")
            ],
            "jv_config": {
                "participation": "Allowed (International Consortium / Joint Venture Permitted)",
                "leadMember": "PrimeTech Solutions Limited (Lead AI Risk Modeling & Geospatial Machine Learning Platform - 60% Share)",
                "localPartner": "DataCore Systems Ltd",
                "memberRules": "Consortium must cover end-to-end data pipeline from satellite ingestion to real-time predictive dashboards; Joint and several liability throughout 3-year LTA.",
                "jvAgreement": "Executed Consortium Deed with Power of Attorney and Notarized Board Authorizations.",
                # Snake case aliases
                "lead_member": "PrimeTech Solutions Limited (Lead AI Risk Modeling & Geospatial Machine Learning Platform - 60% Share)",
                "local_partner": "DataCore Systems Ltd",
                "member_rules": "Consortium must cover end-to-end data pipeline from satellite ingestion to real-time predictive dashboards; Joint and several liability throughout 3-year LTA.",
                "jv_agreement": "Executed Consortium Deed with Power of Attorney and Notarized Board Authorizations."
            },
            "documents": [
                {
                    "folder": "01_original_tender_documents",
                    "name": "UNDP_SOM_00710_RFP_AI_Risk_Monitoring_LTA.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "UNDP INTERNATIONAL REQUEST FOR PROPOSALS",
                    "subtitle": "Tender Ref: UNDP-SOM-00710 (3-Year Long Term Agreement)",
                    "meta": {"Client": "UNDP Somalia Country Office", "Contract Type": "Long Term Agreement (LTA)", "Estimated Total": "USD 4,800,000"}
                },
                {
                    "folder": "02A_jv_partner_credentials",
                    "name": "DataCore_Satellite_and_Sensor_Telemetry_Dossier.pdf",
                    "company_name": "DataCore Systems Ltd",
                    "company_role": "JV_PARTNER",
                    "is_jv": True,
                    "title": "JV PARTNER TELEMETRY & SENSOR EXPERTISE",
                    "subtitle": "DataCore Systems Ltd (Consortium Partner 40%)",
                    "meta": {"Capabilities": "Automated Weather Telemetry & Remote Ingestion", "SLA Track Record": "99.98% High Availability"}
                },
                {
                    "folder": "02B_lead_statutory_documents",
                    "name": "PrimeTech_UN_Registered_Vendor_Credentials.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "LEAD BIDDER UN VENDOR REGISTRATION & FINANCIAL STANDING",
                    "subtitle": "PrimeTech Solutions Limited (Lead Contractor 60%)",
                    "meta": {"UNGM Status": "UNGM Level-2 Verified Sovereign Provider", "D-U-N-S": "73-194-0821"}
                },
                {
                    "folder": "02C_jv_agreement_and_poa",
                    "name": "PrimeTech_DataCore_Consortium_Deed_LTA.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": True,
                    "title": "INTERNATIONAL CONSORTIUM DEED & POWER OF ATTORNEY",
                    "subtitle": "PrimeTech Solutions Ltd & DataCore Systems Ltd Consortium",
                    "meta": {"Agreement Type": "Bilateral Consortium Deed for UN LTA", "Jurisdiction": "International Commercial Law"}
                },
                {
                    "folder": "03_technical_proposal",
                    "name": "AI_Predictive_Early_Warning_Architecture_Proposal.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "AI GEOSPATIAL & PREDICTIVE ANALYTICS TECHNICAL PROPOSAL",
                    "subtitle": "Multi-Modal Early Warning System for UN Field Operations",
                    "meta": {"AI Engine": "Spatial-Temporal Risk Forecasting Algorithm", "Encryption": "End-to-End Cryptography by CyberShield Defense"}
                }
            ]
        },

        # 4. Mega Expressway AI & Transportation Project
        {
            "id": "TDR-2026-RHD-001",
            "title": "Intelligent Transportation System (ITS), Highway Surveillance & Electronic Toll Collection (ETC) for Dhaka-Chattogram Expressway",
            "organization": "Roads and Highways Department (RHD)",
            "country": "Bangladesh",
            "category": "Smart City & Transportation",
            "estimated_value": 4500000.0,
            "currency": "USD",
            "exchange_rate_to_bdt": 122.0,
            "estimated_value_bdt": 549000000.0,
            "stage": "PREPARATION",
            "decision": "GO",
            "priority": "CRITICAL",
            "tender_type": "International Competitive Bidding (ICB)",
            "budget_type": "GoB Development Budget & World Bank Co-Financed",
            "procurement_method": "Two-Stage International Bidding",
            "evaluation_method": "Quality & Cost Based Selection (QCBS)",
            "partners": [
                ("ORG-NYKADVANCE", "JV_PARTNER", "Consortium Partner for Civil Gantries, Weigh-in-Motion Stations, Toll Plazas & Fiber Trenching (35% Share)."),
                ("ORG-DATACORE", "JV_PARTNER", "Consortium Partner for Highway SCADA, High-Speed Optical Sensor Networks & Lane Controllers (20% Share)."),
                ("ORG-CYBERSHIELD", "SUBCONTRACTOR", "Specialized Subcontractor for Critical National Infrastructure SCADA Firewall & Anti-Tampering.")
            ],
            "jv_config": {
                "participation": "Allowed (Consortium / Joint Venture of maximum 3 firms permitted)",
                "leadMember": "PrimeTech Solutions Limited (Lead Contractor - AI Computer Vision ANPR, Central Clearing House & Bank RTGS - 45% Share)",
                "localPartner": "NYK Advance Limited",
                "memberRules": "Consortium must include an RHD Category 1-A enlisted civil engineering contractor; Lead partner must satisfy minimum BDT 1.2 Billion annual turnover; Technical scores combined.",
                "jvAgreement": "Mandatory registered Joint Venture Agreement executed on BDT 300 Non-Judicial Stamp Paper with Joint Irrevocable Power of Attorney.",
                # Snake case aliases
                "lead_member": "PrimeTech Solutions Limited (Lead Contractor - AI Computer Vision ANPR, Central Clearing House & Bank RTGS - 45% Share)",
                "local_partner": "NYK Advance Limited",
                "member_rules": "Consortium must include an RHD Category 1-A enlisted civil engineering contractor; Lead partner must satisfy minimum BDT 1.2 Billion annual turnover; Technical scores combined.",
                "jv_agreement": "Mandatory registered Joint Venture Agreement executed on BDT 300 Non-Judicial Stamp Paper with Joint Irrevocable Power of Attorney."
            },
            "documents": [
                {
                    "folder": "01_original_tender_documents",
                    "name": "RHD_ITS_ETC_Dhaka_Chattogram_Official_Tender_Notice.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "ROADS AND HIGHWAYS DEPARTMENT OFFICIAL TENDER NOTICE",
                    "subtitle": "Expressway ITS & Electronic Toll Collection System",
                    "meta": {"Client": "Roads and Highways Department (RHD)", "Tender Ref": "TDR-2026-RHD-001", "Estimated Value": "USD 4,500,000"}
                },
                {
                    "folder": "02A_jv_partner_credentials",
                    "name": "NYK_Advance_RHD_Category_1A_Enlistment_and_Heavy_Plant.pdf",
                    "company_name": "NYK Advance Limited",
                    "company_role": "JV_PARTNER",
                    "is_jv": True,
                    "title": "CONSORTIUM PARTNER RHD ENLISTMENT & HEAVY CIVIL DOSSIER",
                    "subtitle": "NYK Advance Engineering & Infrastructure Ltd (JV Partner 35%)",
                    "meta": {"Enlistment": "RHD Category-1A Special Grade Contractor", "Plant Fleet": "BDT 680,000,000 Owned Civil Machinery"}
                },
                {
                    "folder": "02B_lead_statutory_documents",
                    "name": "PrimeTech_Expressway_ETC_Proven_Credentials_Dossier.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "LEAD BIDDER ETC CREDENTIALS & FINANCIAL STANDING",
                    "subtitle": "PrimeTech Solutions Limited (Lead Bidder 45%)",
                    "meta": {"Proven Track Record": "Padma Bridge ETC Commissioned (18 Lanes)", "Turnover": "BDT 1.45 Billion"}
                },
                {
                    "folder": "02C_jv_agreement_and_poa",
                    "name": "RHD_Tripartite_Joint_Venture_Consortium_Deed.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": True,
                    "title": "REGISTERED TRIPARTITE JOINT VENTURE CONSORTIUM AGREEMENT",
                    "subtitle": "Executed on BDT 300 Non-Judicial Stamp Paper",
                    "meta": {"Lead Partner (45%)": "PrimeTech Solutions Limited", "Civil Partner (35%)": "NYK Advance Limited", "SCADA Partner (20%)": "DataCore Systems Ltd"}
                },
                {
                    "folder": "03_technical_proposal",
                    "name": "Expressway_AI_Computer_Vision_ANPR_and_ETC_Proposal.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "INTELLIGENT TRANSPORTATION SYSTEM (ITS) TECHNICAL PROPOSAL",
                    "subtitle": "High-Speed Gantry ANPR, Weight-in-Motion & Automated Toll Plaza Architecture",
                    "meta": {"AI Camera Accuracy": "99.6% Automated Plate Reading at 160 km/h", "Payment Gateway": "Automated Bangladesh Bank RTGS Real-Time Clearing"}
                }
            ]
        },

        # 5. National Enterprise Cloud & AI Security Managed Service
        {
            "id": "BPD-2026-IFT-2636",
            "title": "IFT for Technology Managed Network Service (CLOUD & SECURITY) and Support for BRAC",
            "organization": "BRAC – Technology Division",
            "country": "Bangladesh",
            "category": "Enterprise Cloud & Cyber Security",
            "estimated_value": 280000000.0,
            "currency": "BDT",
            "exchange_rate_to_bdt": 1.0,
            "estimated_value_bdt": 280000000.0,
            "stage": "PREPARATION",
            "decision": "GO",
            "priority": "HIGH",
            "tender_type": "National Competitive Tender (36 Months SLA)",
            "budget_type": "BRAC Corporate IT Expenditure",
            "procurement_method": "Single-Stage Two-Envelope Tender",
            "evaluation_method": "Quality & Cost Based Selection (QCBS)",
            "partners": [
                ("ORG-CYBERSHIELD", "JV_PARTNER", "24/7 Security Operations Center (SOC) Monitoring, Threat Hunting & Incident Response (30% Share).")
            ],
            "jv_config": {
                "participation": "Allowed (Specialized Technology Consortium Permitted)",
                "leadMember": "PrimeTech Solutions Limited (Lead Cloud Managed Services Provider - 70% Share)",
                "localPartner": "CyberShield Defense Ltd",
                "memberRules": "Consortium must hold active ISO 27001, Tier-1 CSP accreditation, and CREST-certified SOC; Joint and several liability.",
                "jvAgreement": "Executed Consortium MoU & Joint Service Level Agreement (SLA) commitment.",
                # Snake case aliases
                "lead_member": "PrimeTech Solutions Limited (Lead Cloud Managed Services Provider - 70% Share)",
                "local_partner": "CyberShield Defense Ltd",
                "member_rules": "Consortium must hold active ISO 27001, Tier-1 CSP accreditation, and CREST-certified SOC; Joint and several liability.",
                "jv_agreement": "Executed Consortium MoU & Joint Service Level Agreement (SLA) commitment."
            },
            "documents": [
                {
                    "folder": "01_original_tender_documents",
                    "name": "BRAC_IFT_2636_Managed_Cloud_and_Security_Specification.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "BRAC TECHNOLOGY MANAGED SERVICE SPECIFICATION",
                    "subtitle": "Tender Reference: BPD-2026-IFT-2636",
                    "meta": {"Client": "BRAC Technology Division", "Contract Period": "36 Months", "Estimated Value": "BDT 280,000,000"}
                },
                {
                    "folder": "02A_jv_partner_credentials",
                    "name": "CyberShield_CREST_SOC_and_ZeroTrust_Credentials.pdf",
                    "company_name": "CyberShield Defense Ltd",
                    "company_role": "JV_PARTNER",
                    "is_jv": True,
                    "title": "CONSORTIUM PARTNER 24/7 SOC ACCREDITATION",
                    "subtitle": "CyberShield Defense Solutions Limited (JV Partner 30%)",
                    "meta": {"Accreditation": "CREST Certified SOC & ISO 27001 Lead Auditor", "Clearance": "Bangladesh Bank Level-A Approved"}
                },
                {
                    "folder": "02B_lead_statutory_documents",
                    "name": "PrimeTech_Managed_Cloud_and_Network_Track_Record.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "LEAD BIDDER ENTERPRISE NETWORK CREDENTIALS",
                    "subtitle": "PrimeTech Solutions Limited (Lead Contractor 70%)",
                    "meta": {"Cloud Track Record": "Managed Over 500 Enterprise Virtual Machines", "Turnover": "BDT 1.45 Billion"}
                },
                {
                    "folder": "02C_jv_agreement_and_poa",
                    "name": "BRAC_Joint_Consortium_Deed_and_SLA_Commitment.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": True,
                    "title": "JOINT CONSORTIUM DEED & SHARED SLA GUARANTEE",
                    "subtitle": "PrimeTech Solutions Ltd & CyberShield Defense Ltd",
                    "meta": {"SLA Uptime": "99.95% Guaranteed", "Incident Response Time": "< 15 Minutes for P1 Cyber Alerts"}
                },
                {
                    "folder": "03_technical_proposal",
                    "name": "BRAC_AI_Managed_Cloud_and_Automated_SOC_Proposal.pdf",
                    "company_name": "PrimeTech Ltd",
                    "company_role": "LEAD_BIDDER",
                    "is_jv": False,
                    "title": "TECHNICAL PROPOSAL: AIOps & AUTONOMOUS DEFENSE MESH",
                    "subtitle": "Next-Generation Managed Cloud & Cybersecurity Support",
                    "meta": {"AIOps Engine": "Predictive Network Anomaly Detection", "SOC Coverage": "24/7/365 Continuous Threat Hunting"}
                }
            ]
        }
    ]

    jv_folders_schema = [
        ("01_original_tender_documents", "Original RFP Notices & Addenda"),
        ("02A_jv_partner_credentials", "⭐ JV Partner Credentials"),
        ("02B_lead_statutory_documents", "🏛️ Lead Bidder Statutory Credentials"),
        ("02C_jv_agreement_and_poa", "📜 JV Consortium Deed & Power of Attorney"),
        ("03_technical_proposal", "Technical Proposal & Architecture"),
        ("04_financial_proposal", "Financial Proposal & BOQ Tables"),
        ("05_final_submission_package", "Compiled Sealed Submission Package"),
        ("06_submission_receipts", "Official Portal Receipts & Confirmations")
    ]

    for item in jv_tenders:
        tid = item["id"]
        print(f"\n---> Updating Tender: {tid} ({item['title'][:45]}...)")

        # 1. Fetch current tender summary_json
        existing_summary_row = cur.execute("SELECT summary_json FROM tenders WHERE id = ?", (tid,)).fetchone()
        current_summary = json.loads(existing_summary_row[0]) if existing_summary_row and existing_summary_row[0] else {}

        # Merge JV config into summary
        current_summary["jv"] = item["jv_config"]
        current_summary["title"] = item["title"]
        current_summary["organization"] = item["organization"]
        current_summary["country"] = item["country"]
        current_summary["tenderType"] = item["tender_type"]
        current_summary["estimatedValue"] = item["estimated_value"]
        current_summary["currency"] = item["currency"]
        
        # Ensure submissionDocuments has JV docs
        req_docs = current_summary.get("submissionDocuments", [])
        jv_required = [
            "Signed & Notarized Joint Venture Consortium Agreement",
            "Joint Irrevocable Power of Attorney on Non-Judicial Stamp",
            "JV Partner Technical Credentials and CA Certified Turnover",
            "Lead Bidder Statutory Qualifications and Solvency Certificate",
            "Joint Technical Proposal and System Architecture Plan"
        ]
        for rd in jv_required:
            if rd not in req_docs:
                req_docs.append(rd)
        current_summary["submissionDocuments"] = req_docs

        new_summary_str = json.dumps(current_summary)

        # 2. Update Tenders table
        cur.execute("""
            UPDATE tenders SET
                title = ?,
                organization = ?,
                country = ?,
                category = ?,
                estimated_value = ?,
                currency = ?,
                exchange_rate_to_bdt = ?,
                estimated_value_bdt = ?,
                stage = ?,
                decision = ?,
                priority = ?,
                tender_type = ?,
                budget_type = ?,
                procurement_method = ?,
                evaluation_method = ?,
                summary_json = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            item["title"],
            item["organization"],
            item["country"],
            item["category"],
            item["estimated_value"],
            item["currency"],
            item["exchange_rate_to_bdt"],
            item["estimated_value_bdt"],
            item["stage"],
            item["decision"],
            item["priority"],
            item["tender_type"],
            item["budget_type"],
            item["procurement_method"],
            item["evaluation_method"],
            new_summary_str,
            tid
        ))
        print(f"  [+] Tender {tid} updated with JV configuration and value {item['currency']} {item['estimated_value']:,.0f}")

        # 3. Update tender_partner_organizations
        cur.execute("DELETE FROM tender_partner_organizations WHERE tender_id = ?", (tid,))
        for p_org_id, p_type, p_notes in item["partners"]:
            cur.execute("""
                INSERT INTO tender_partner_organizations (
                    tender_id, organization_id, partner_type, status, assigned_by, notes, assigned_at
                ) VALUES (?, ?, ?, 'ACTIVE', 'Tender Lead Admin', ?, CURRENT_TIMESTAMP)
            """, (tid, p_org_id, p_type, p_notes))
            print(f"  [+] Linked Partner: {p_org_id} ({p_type}) to Tender {tid}")

        # 4. Provision tender_folders in DB
        cur.execute("DELETE FROM tender_folders WHERE tender_id = ?", (tid,))
        for f_name, f_label in jv_folders_schema:
            cur.execute("""
                INSERT INTO tender_folders (tender_id, name, label)
                VALUES (?, ?, ?)
            """, (tid, f_name, f_label))
        print(f"  [+] Seeded {len(jv_folders_schema)} JV folders for Tender {tid}")

        # 5. Provision Physical Documents & tender_documents records
        for d in item["documents"]:
            doc_id = f"DOC-{tid[:6]}-{hashlib.md5(d['name'].encode()).hexdigest()[:6].upper()}"
            folder_dir = STORAGE_ROOT / "tenders" / tid / d["folder"]
            file_path = folder_dir / d["name"]

            h, size = create_valid_pdf(
                file_path=file_path,
                title=d["title"],
                subtitle=d["subtitle"],
                metadata=d["meta"]
            )

            # Insert or replace in tender_documents
            cur.execute("DELETE FROM tender_documents WHERE id = ?", (doc_id,))
            cur.execute("""
                INSERT INTO tender_documents (
                    id, tender_id, name, folder, company_name, company_role,
                    is_jv_partner, size, revision, sha256, uploaded_at,
                    access_level, file_path, status, action_comment, is_reusable_link
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
            """, (
                doc_id, tid, d["name"], d["folder"], d["company_name"], d["company_role"],
                1 if d["is_jv"] else 0, size, "v1.0", h, now_date,
                "ALL_TEAM", str(file_path), "CLEARED", "Verified and accepted for submission"
            ))
            print(f"  [+] Document Seeded: {d['name']} in [{d['folder']}] (Size: {size})")

    conn.commit()
    conn.close()
    print("\n[OK] ALL 5 STRATEGIC TENDERS CONFIGURED AS HIGH-PROFILE JOINT VENTURES!")

if __name__ == "__main__":
    configure_jv_tenders()

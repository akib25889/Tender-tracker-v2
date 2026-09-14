import json
import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal, Base, engine, run_migrations
from app.models.organization import Organization

SEED_JSON_PATH = backend_dir / "app" / "services" / "organizations_seed.json"

# List of new procuring entities extracted from the 14-page e-GP Department Tree PDF
NEW_EGP_ENTITIES = [
    # --- A. Procurement Governance & Planning (Parent: Ministry of Planning) ---
    {
        "id": "ORG-BD-BPPA",
        "name": "Bangladesh Public Procurement Authority (BPPA)",
        "short_name": "BPPA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-PLANCOMM",
        "country": "Bangladesh",
        "website": "https://bppa.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["BPPA", "CPTU", "Public Procurement Authority", "Central Procurement Technical Unit", "Sher-e-Bangla Nagar"],
        "description": "Location: Planning Commission Campus, Sher-e-Bangla Nagar, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Apex government procurement authority operating the national e-GP system."
    },
    {
        "id": "ORG-BD-IMED",
        "name": "Implementation Monitoring and Evaluation Division (IMED)",
        "short_name": "IMED",
        "type": "DIVISION",
        "parent_id": "ORG-BD-PLANCOMM",
        "country": "Bangladesh",
        "website": "https://imed.gov.bd",
        "priority": "HIGH",
        "aliases": ["IMED", "Implementation Monitoring Division", "Planning Ministry"],
        "description": "Location: Sher-e-Bangla Nagar, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BIDS",
        "name": "Bangladesh Institute of Development Studies (BIDS)",
        "short_name": "BIDS",
        "type": "OTHER",
        "parent_id": "ORG-BD-PLANCOMM",
        "country": "Bangladesh",
        "website": "https://bids.org.bd",
        "priority": "MEDIUM",
        "aliases": ["BIDS", "Development Studies Institute", "Agargaon"],
        "description": "Location: E-17 Agargaon, Sher-e-Bangla Nagar, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-SID",
        "name": "Statistics and Informatics Division (SID)",
        "short_name": "SID",
        "type": "DIVISION",
        "parent_id": "ORG-BD-PLANCOMM",
        "country": "Bangladesh",
        "website": "https://sid.gov.bd",
        "priority": "HIGH",
        "aliases": ["SID", "Statistics Division"],
        "description": "Location: Parishankhyan Bhaban, Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- B. Housing, Urban Planning & Public Works (Parent: MoHPW) ---
    {
        "id": "ORG-BD-PWD",
        "name": "Public Works Department (PWD)",
        "short_name": "PWD",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MOHPW",
        "country": "Bangladesh",
        "website": "https://pwd.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["PWD", "Public Works", "Purta Bhaban", "Segunbagicha"],
        "description": "Location: Purta Bhaban, Segunbagicha, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Premier government construction and public infrastructure procurement agency."
    },
    {
        "id": "ORG-BD-RAJUK",
        "name": "Rajdhani Unnayan Kartripakkha (RAJUK)",
        "short_name": "RAJUK",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOHPW",
        "country": "Bangladesh",
        "website": "https://rajuk.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["RAJUK", "Capital Development Authority", "Motijheel"],
        "description": "Location: RAJUK Bhaban, Motijheel, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Capital development and town planning authority for Dhaka metropolitan area."
    },
    {
        "id": "ORG-BD-CDA",
        "name": "Chattogram Development Authority (CDA)",
        "short_name": "CDA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOHPW",
        "country": "Bangladesh",
        "website": "https://cda.gov.bd",
        "priority": "HIGH",
        "aliases": ["CDA", "Chittagong Development Authority", "Kotwali"],
        "description": "Location: CDA Building, Kotwali, Chattogram | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-KDA",
        "name": "Khulna Development Authority (KDA)",
        "short_name": "KDA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOHPW",
        "country": "Bangladesh",
        "website": "https://kda.gov.bd",
        "priority": "HIGH",
        "aliases": ["KDA", "Khulna Development"],
        "description": "Location: KDA Bhaban, Shibbari More, Khulna | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-RDA-HPW",
        "name": "Rajshahi Development Authority (RDA)",
        "short_name": "RDA (Rajshahi)",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOHPW",
        "country": "Bangladesh",
        "website": "https://rda.rajshahi.gov.bd",
        "priority": "HIGH",
        "aliases": ["RDA", "Rajshahi Development Authority"],
        "description": "Location: RDA Bhaban, Banaswar, Rajshahi | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-COXDA",
        "name": "Cox's Bazar Development Authority (CoxDA)",
        "short_name": "CoxDA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOHPW",
        "country": "Bangladesh",
        "website": "https://coxda.gov.bd",
        "priority": "HIGH",
        "aliases": ["CoxDA", "Cox's Bazar Development"],
        "description": "Location: Kolatoli, Cox's Bazar | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-NHA",
        "name": "National Housing Authority (NHA)",
        "short_name": "NHA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOHPW",
        "country": "Bangladesh",
        "website": "https://nha.gov.bd",
        "priority": "HIGH",
        "aliases": ["NHA", "Grihayan Kartripakkha", "Segunbagicha"],
        "description": "Location: Grihayan Bhaban, Segunbagicha, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-UDD",
        "name": "Urban Development Directorate (UDD)",
        "short_name": "UDD",
        "type": "DIRECTORATE",
        "parent_id": "ORG-BD-MOHPW",
        "country": "Bangladesh",
        "website": "https://udd.gov.bd",
        "priority": "MEDIUM",
        "aliases": ["UDD", "Urban Development", "Segunbagicha"],
        "description": "Location: 82 Segunbagicha, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-ARCHDEPT",
        "name": "Department of Architecture",
        "short_name": "ArchDept",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MOHPW",
        "country": "Bangladesh",
        "website": "https://architecture.gov.bd",
        "priority": "MEDIUM",
        "aliases": ["Architecture Dept", "Sthapatya Adhidoptor", "Segunbagicha"],
        "description": "Location: Sthapatya Bhaban, Segunbagicha, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- C. Ports & Maritime Logistics (Parent: Ministry of Shipping) ---
    {
        "id": "ORG-BD-CPA",
        "name": "Chittagong Port Authority (CPA)",
        "short_name": "CPA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOS",
        "country": "Bangladesh",
        "website": "https://cpa.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["CPA", "Chittagong Port", "Bandar Bhaban", "Chattogram"],
        "description": "Location: Bandar Bhaban, Chattogram | Tender Portal: https://www.eprocure.gov.bd | Principal seaport handling over 90% of Bangladesh maritime container trade."
    },
    {
        "id": "ORG-BD-MPA",
        "name": "Mongla Port Authority (MPA)",
        "short_name": "MPA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOS",
        "country": "Bangladesh",
        "website": "https://mpa.gov.bd",
        "priority": "HIGH",
        "aliases": ["MPA", "Mongla Port", "Bagerhat"],
        "description": "Location: Mongla, Bagerhat | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-PPA",
        "name": "Payra Port Authority (PPA)",
        "short_name": "PPA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOS",
        "country": "Bangladesh",
        "website": "https://ppa.gov.bd",
        "priority": "HIGH",
        "aliases": ["PPA", "Payra Port", "Patuakhali"],
        "description": "Location: Kalapara, Patuakhali | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BIWTA",
        "name": "Bangladesh Inland Water Transport Authority (BIWTA)",
        "short_name": "BIWTA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOS",
        "country": "Bangladesh",
        "website": "https://biwta.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["BIWTA", "Inland Water Transport Authority", "Motijheel"],
        "description": "Location: BIWTA Bhaban, 141-143 Motijheel C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BIWTC",
        "name": "Bangladesh Inland Water Transport Corporation (BIWTC)",
        "short_name": "BIWTC",
        "type": "CORPORATION",
        "parent_id": "ORG-BD-MOS",
        "country": "Bangladesh",
        "website": "https://biwtc.gov.bd",
        "priority": "HIGH",
        "aliases": ["BIWTC", "Inland Water Transport Corp", "Shahbag"],
        "description": "Location: BIWTC Bhaban, 5 Dilkusha C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BSC",
        "name": "Bangladesh Shipping Corporation (BSC)",
        "short_name": "BSC",
        "type": "CORPORATION",
        "parent_id": "ORG-BD-MOS",
        "country": "Bangladesh",
        "website": "https://bsc.gov.bd",
        "priority": "HIGH",
        "aliases": ["BSC", "Shipping Corporation", "Agrabad"],
        "description": "Location: BSC Bhaban, Saltgola Road, Chattogram | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- D. Electrical Power Utilities (Parent: Ministry of Power, Energy & Mineral Resources) ---
    {
        "id": "ORG-BD-PGCB",
        "name": "Power Grid Bangladesh PLC (PGCB)",
        "short_name": "PGCB",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MPEMR",
        "country": "Bangladesh",
        "website": "https://pgcb.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["PGCB", "Power Grid", "National Grid", "Aftabnagar"],
        "description": "Location: PGCB Bhaban, Avenue 3, Jahurul Islam City, Aftabnagar, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Sole transmission utility managing the national electricity grid."
    },
    {
        "id": "ORG-BD-DESCO",
        "name": "Dhaka Electric Supply Company PLC (DESCO)",
        "short_name": "DESCO",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MPEMR",
        "country": "Bangladesh",
        "website": "https://desco.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["DESCO", "Dhaka Electric Supply", "Nikunja", "Khilkhet"],
        "description": "Location: 22/B Kabi Farooq Sarani, Nikunja-2, Khilkhet, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Major electricity distributor for northern Dhaka and Tongi."
    },
    {
        "id": "ORG-BD-DPDC",
        "name": "Dhaka Power Distribution Company Limited (DPDC)",
        "short_name": "DPDC",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MPEMR",
        "country": "Bangladesh",
        "website": "https://dpdc.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["DPDC", "Dhaka Power Distribution", "Bidyut Bhaban", "Abdul Gani Road"],
        "description": "Location: Bidyut Bhaban, 1 Abdul Gani Road, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Major electricity distributor for southern and central Dhaka and Narayanganj."
    },
    {
        "id": "ORG-BD-BREB",
        "name": "Bangladesh Rural Electrification Board (BREB)",
        "short_name": "BREB",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MPEMR",
        "country": "Bangladesh",
        "website": "https://reb.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["BREB", "REB", "Rural Electrification Board", "Palli Bidyut", "Khilkhet"],
        "description": "Location: Bidyut Bhaban, Nikunja-2, Khilkhet, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Oversees 80+ Palli Bidyut Samities serving 30M+ rural consumers."
    },
    {
        "id": "ORG-BD-SREDA",
        "name": "Sustainable and Renewable Energy Development Authority (SREDA)",
        "short_name": "SREDA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MPEMR",
        "country": "Bangladesh",
        "website": "https://sreda.gov.bd",
        "priority": "HIGH",
        "aliases": ["SREDA", "Renewable Energy Authority", "IEB Bhaban"],
        "description": "Location: IEB Bhaban, Ramna, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-APSCL",
        "name": "Ashuganj Power Station Company Ltd. (APSCL)",
        "short_name": "APSCL",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MPEMR",
        "country": "Bangladesh",
        "website": "https://apscl.gov.bd",
        "priority": "HIGH",
        "aliases": ["APSCL", "Ashuganj Power", "Brahmanbaria"],
        "description": "Location: Ashuganj, Brahmanbaria | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-NWPGCL",
        "name": "North-West Power Generation Company Limited (NWPGCL)",
        "short_name": "NWPGCL",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MPEMR",
        "country": "Bangladesh",
        "website": "https://nwpgcl.gov.bd",
        "priority": "HIGH",
        "aliases": ["NWPGCL", "North West Power", "Uttara"],
        "description": "Location: UTC Building, Panthapath, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-CPGCBL",
        "name": "Coal Power Generation Company Bangladesh Limited (CPGCBL)",
        "short_name": "CPGCBL",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MPEMR",
        "country": "Bangladesh",
        "website": "https://cpgcbl.gov.bd",
        "priority": "HIGH",
        "aliases": ["CPGCBL", "Coal Power", "Matarbari", "Dhanmondi"],
        "description": "Location: Matarbari / Dhanmondi, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-WZPDCL",
        "name": "West Zone Power Distribution Company Ltd. (WZPDCL)",
        "short_name": "WZPDCL",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MPEMR",
        "country": "Bangladesh",
        "website": "https://wzpdcl.gov.bd",
        "priority": "HIGH",
        "aliases": ["WZPDCL", "West Zone Power", "Khulna"],
        "description": "Location: Bidyut Bhaban, Boyra Main Road, Khulna | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- E. Gas, Oil & Energy Exploration (Parent: Petrobangla / MPEMR) ---
    {
        "id": "ORG-BD-BAPEX",
        "name": "Bangladesh Petroleum Exploration and Production Company Limited (BAPEX)",
        "short_name": "BAPEX",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-PETROBANGLA",
        "country": "Bangladesh",
        "website": "https://bapex.com.bd",
        "priority": "CRITICAL",
        "aliases": ["BAPEX", "Petroleum Exploration", "BAPEX Bhaban", "Kawranbazar"],
        "description": "Location: BAPEX Bhaban, 4 Kawranbazar C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd | National upstream gas and oil exploration company."
    },
    {
        "id": "ORG-BD-TGTDCL",
        "name": "Titas Gas Transmission and Distribution Company Limited",
        "short_name": "Titas Gas",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-PETROBANGLA",
        "country": "Bangladesh",
        "website": "https://titasgas.org.bd",
        "priority": "CRITICAL",
        "aliases": ["TGTDCL", "Titas Gas", "Titas Bhaban", "Kawranbazar"],
        "description": "Location: Titas Bhaban, 105 Kazi Nazrul Islam Avenue, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Largest natural gas distributor in Bangladesh."
    },
    {
        "id": "ORG-BD-BGSL",
        "name": "Bakhrabad Gas Distribution Company Limited",
        "short_name": "Bakhrabad Gas",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-PETROBANGLA",
        "country": "Bangladesh",
        "website": "https://bgdcl.gov.bd",
        "priority": "HIGH",
        "aliases": ["BGDCL", "BGSL", "Bakhrabad Gas", "Cumilla"],
        "description": "Location: Chapapur, Cumilla | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-JGTDSL",
        "name": "Jalalabad Gas Transmission and Distribution System Ltd.",
        "short_name": "Jalalabad Gas",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-PETROBANGLA",
        "country": "Bangladesh",
        "website": "https://jalalabadgas.org.bd",
        "priority": "HIGH",
        "aliases": ["JGTDSL", "Jalalabad Gas", "Sylhet"],
        "description": "Location: Gas Bhaban, Mendibag, Sylhet | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-KGDCL",
        "name": "Karnaphuli Gas Distribution Company Limited",
        "short_name": "Karnaphuli Gas",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-PETROBANGLA",
        "country": "Bangladesh",
        "website": "https://kgdcl.gov.bd",
        "priority": "HIGH",
        "aliases": ["KGDCL", "Karnaphuli Gas", "Chattogram"],
        "description": "Location: 137/A CDA Avenue, Sholashahar, Chattogram | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-SGCL",
        "name": "Sundarban Gas Company Limited",
        "short_name": "Sundarban Gas",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-PETROBANGLA",
        "country": "Bangladesh",
        "website": "https://sgcl.org.bd",
        "priority": "MEDIUM",
        "aliases": ["SGCL", "Sundarban Gas", "Khulna"],
        "description": "Location: 218 M.A. Bari Street, Sonadanga, Khulna | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-PGCL",
        "name": "Paschimanchal Gas Company Limited",
        "short_name": "Paschimanchal Gas",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-PETROBANGLA",
        "country": "Bangladesh",
        "website": "https://pgcl.org.bd",
        "priority": "MEDIUM",
        "aliases": ["PGCL", "Paschimanchal Gas", "Sirajganj"],
        "description": "Location: Nalka, Sirajganj | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-ERL",
        "name": "Eastern Refinery PLC",
        "short_name": "Eastern Refinery",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-BPC-PETROL",
        "country": "Bangladesh",
        "website": "https://erl.com.bd",
        "priority": "HIGH",
        "aliases": ["ERL", "Eastern Refinery", "Chattogram", "North Patenga"],
        "description": "Location: North Patenga, Chattogram | Tender Portal: https://www.eprocure.gov.bd | Sole crude oil refining company in Bangladesh."
    },
    {
        "id": "ORG-BD-POCL",
        "name": "Padma Oil Company Limited",
        "short_name": "Padma Oil",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-BPC-PETROL",
        "country": "Bangladesh",
        "website": "https://pocl.gov.bd",
        "priority": "HIGH",
        "aliases": ["POCL", "Padma Oil", "Strand Road", "Chattogram"],
        "description": "Location: Padma Bhaban, Strand Road, Chattogram | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-MPCL",
        "name": "Meghna Petroleum Limited",
        "short_name": "Meghna Petroleum",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-BPC-PETROL",
        "country": "Bangladesh",
        "website": "https://mpl.gov.bd",
        "priority": "HIGH",
        "aliases": ["MPL", "Meghna Petroleum", "Agrabad", "Chattogram"],
        "description": "Location: 58 Agrabad C/A, Chattogram | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-JOCL",
        "name": "Jamuna Oil Company Limited",
        "short_name": "Jamuna Oil",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-BPC-PETROL",
        "country": "Bangladesh",
        "website": "https://jamunaoil.gov.bd",
        "priority": "HIGH",
        "aliases": ["JOCL", "Jamuna Oil", "Agrabad", "Chattogram"],
        "description": "Location: Jamuna Bhaban, Agrabad C/A, Chattogram | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BCMCL",
        "name": "Barapukuria Coal Mining Company Limited (BCMCL)",
        "short_name": "BCMCL",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-PETROBANGLA",
        "country": "Bangladesh",
        "website": "https://bcmcl.org.bd",
        "priority": "HIGH",
        "aliases": ["BCMCL", "Barapukuria Coal", "Dinajpur"],
        "description": "Location: Parbatipur, Dinajpur | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-MGMCL",
        "name": "Maddhapara Granite Mining Company Limited (MGMCL)",
        "short_name": "MGMCL",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-PETROBANGLA",
        "country": "Bangladesh",
        "website": "https://mgmcl.org.bd",
        "priority": "HIGH",
        "aliases": ["MGMCL", "Maddhapara Granite", "Dinajpur"],
        "description": "Location: Maddhapara, Dinajpur | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- F. Bridges & Roads Expansion (Parent: MoRTH) ---
    {
        "id": "ORG-BD-BBA",
        "name": "Bangladesh Bridge Authority (BBA)",
        "short_name": "BBA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MORTH",
        "country": "Bangladesh",
        "website": "https://bba.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["BBA", "Bridge Authority", "Setu Bhaban", "Bridges Division", "Banani"],
        "description": "Location: Setu Bhaban, New Airport Road, Banani, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Executing agency for major bridges including Padma Multipurpose Bridge and Karnaphuli Tunnel."
    },
    {
        "id": "ORG-BD-BRTA",
        "name": "Bangladesh Road Transport Authority (BRTA)",
        "short_name": "BRTA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MORTH",
        "country": "Bangladesh",
        "website": "https://brta.gov.bd",
        "priority": "HIGH",
        "aliases": ["BRTA", "Road Transport Authority", "Banani"],
        "description": "Location: BRTA Bhaban, Banani, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BRTC",
        "name": "Bangladesh Road Transport Corporation (BRTC)",
        "short_name": "BRTC",
        "type": "CORPORATION",
        "parent_id": "ORG-BD-MORTH",
        "country": "Bangladesh",
        "website": "https://brtc.gov.bd",
        "priority": "HIGH",
        "aliases": ["BRTC", "Road Transport Corp", "Motijheel"],
        "description": "Location: Paribahan Bhaban, 21 DIT Avenue, Motijheel, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-DHAKABRT",
        "name": "Dhaka Bus Rapid Transit Company PLC (Dhaka BRT)",
        "short_name": "Dhaka BRT",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MORTH",
        "country": "Bangladesh",
        "website": "https://dbrt.gov.bd",
        "priority": "HIGH",
        "aliases": ["Dhaka BRT", "BRT", "Gazipur BRT"],
        "description": "Location: House 4, Road 21, Sector 4, Uttara, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- G. ICT, Telecom & Postal (Parent: MoPTIT) ---
    {
        "id": "ORG-BD-BCC",
        "name": "Bangladesh Computer Council (BCC)",
        "short_name": "BCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOPTIT",
        "country": "Bangladesh",
        "website": "https://bcc.gov.bd",
        "priority": "HIGH",
        "aliases": ["BCC", "Computer Council", "ICT Bhaban", "Agargaon"],
        "description": "Location: ICT Bhaban, Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BTCL",
        "name": "Bangladesh Telecommunications Company Limited (BTCL)",
        "short_name": "BTCL",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MOPTIT",
        "country": "Bangladesh",
        "website": "https://btcl.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["BTCL", "Telecommunications Company", "Telejogayog Bhaban", "Eskaton"],
        "description": "Location: Telejogayog Bhaban, 37/E Eskaton Garden, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BSCPLC",
        "name": "Bangladesh Submarine Cables PLC (BSCPLC)",
        "short_name": "BSCPLC",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MOPTIT",
        "country": "Bangladesh",
        "website": "https://bscplc.com.bd",
        "priority": "HIGH",
        "aliases": ["BSCPLC", "BSCCL", "Submarine Cable", "Moghbazar"],
        "description": "Location: Wireless Gate, Moghbazar, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-TELETALK",
        "name": "Teletalk Bangladesh Limited",
        "short_name": "Teletalk",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MOPTIT",
        "country": "Bangladesh",
        "website": "https://teletalk.com.bd",
        "priority": "HIGH",
        "aliases": ["Teletalk", "Teletalk Bhaban", "Gulshan"],
        "description": "Location: Rajuk Commercial Complex, Gulshan-1, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-POSTOFFICE",
        "name": "Bangladesh Post Office",
        "short_name": "Post Office",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MOPTIT",
        "country": "Bangladesh",
        "website": "https://bdpost.gov.bd",
        "priority": "HIGH",
        "aliases": ["Post Office", "Dak Adhidoptor", "Dak Bhaban", "Agargaon"],
        "description": "Location: Dak Bhaban, Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- H. Prime Minister's Office: Economic & Investment Authorities (Parent: ORG-BD-PMO) ---
    {
        "id": "ORG-BD-BEZA",
        "name": "Bangladesh Economic Zones Authority (BEZA)",
        "short_name": "BEZA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-PMO",
        "country": "Bangladesh",
        "website": "https://beza.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["BEZA", "Economic Zones Authority", "Biniyog Bhaban", "Agargaon"],
        "description": "Location: Biniyog Bhaban, Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Developer and operator of government economic zones and special economic corridors."
    },
    {
        "id": "ORG-BD-BEPZA",
        "name": "Bangladesh Export Processing Zones Authority (BEPZA)",
        "short_name": "BEPZA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-PMO",
        "country": "Bangladesh",
        "website": "https://bepza.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["BEPZA", "Export Processing Zones", "BEPZA Complex", "Dhanmondi"],
        "description": "Location: BEPZA Complex, House 19/D, Road 6, Dhanmondi, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BIDA",
        "name": "Bangladesh Investment Development Authority (BIDA)",
        "short_name": "BIDA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-PMO",
        "country": "Bangladesh",
        "website": "https://bida.gov.bd",
        "priority": "HIGH",
        "aliases": ["BIDA", "Investment Development Authority", "Biniyog Bhaban"],
        "description": "Location: Biniyog Bhaban, E-6/B Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-PPPA",
        "name": "Public Private Partnership (PPP) Authority",
        "short_name": "PPP Authority",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-PMO",
        "country": "Bangladesh",
        "website": "https://pppo.gov.bd",
        "priority": "HIGH",
        "aliases": ["PPPA", "PPP Authority", "Public Private Partnership", "Agargaon"],
        "description": "Location: Plot E-13-B, Agargaon, Shere Bangla Nagar, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-NSDA",
        "name": "National Skills Development Authority (NSDA)",
        "short_name": "NSDA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-PMO",
        "country": "Bangladesh",
        "website": "https://nsda.gov.bd",
        "priority": "MEDIUM",
        "aliases": ["NSDA", "Skills Development Authority", "Biniyog Bhaban"],
        "description": "Location: Biniyog Bhaban, Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- I. All 12 City Corporations & Regional WASAs (Parent: LGRD) ---
    {
        "id": "ORG-BD-DNCC",
        "name": "Dhaka North City Corporation (DNCC)",
        "short_name": "DNCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://dncc.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["DNCC", "Dhaka North", "Nagar Bhaban", "Gulshan"],
        "description": "Location: Nagar Bhaban, Plot 23-26, Road 46, Gulshan-2, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-DSCC",
        "name": "Dhaka South City Corporation (DSCC)",
        "short_name": "DSCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://dscc.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["DSCC", "Dhaka South", "Nagar Bhaban", "Fulbaria"],
        "description": "Location: Nagar Bhaban, Fulbaria, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-CCC",
        "name": "Chattogram City Corporation (CCC)",
        "short_name": "CCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://ccc.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["CCC", "Chittagong City Corporation", "Tigerpass"],
        "description": "Location: Tigerpass, Chattogram | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-GCC",
        "name": "Gazipur City Corporation (GCC)",
        "short_name": "GCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://gcc.gov.bd",
        "priority": "HIGH",
        "aliases": ["GCC", "Gazipur City"],
        "description": "Location: Gazipur City | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-NCC",
        "name": "Narayanganj City Corporation (NCC)",
        "short_name": "NCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://ncc.gov.bd",
        "priority": "HIGH",
        "aliases": ["NCC", "Narayanganj City"],
        "description": "Location: Nagar Bhaban, Narayanganj | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-RCC",
        "name": "Rajshahi City Corporation (RCC)",
        "short_name": "RCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://rcc.gov.bd",
        "priority": "HIGH",
        "aliases": ["RCC", "Rajshahi City"],
        "description": "Location: Nagar Bhaban, Rajshahi | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-KCC",
        "name": "Khulna City Corporation (KCC)",
        "short_name": "KCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://kcc.gov.bd",
        "priority": "HIGH",
        "aliases": ["KCC", "Khulna City"],
        "description": "Location: Nagar Bhaban, K.D. Ghosh Road, Khulna | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-SCC",
        "name": "Sylhet City Corporation (SCC)",
        "short_name": "SCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://scc.gov.bd",
        "priority": "HIGH",
        "aliases": ["SCC", "Sylhet City"],
        "description": "Location: Topkhana, Sylhet | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BCC-CITY",
        "name": "Barishal City Corporation (BCC)",
        "short_name": "Barishal CC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://bcc.gov.bd",
        "priority": "HIGH",
        "aliases": ["Barishal City Corporation", "Barisal CC"],
        "description": "Location: Nagar Bhaban, Barishal | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-RPCC",
        "name": "Rangpur City Corporation (RpCC)",
        "short_name": "RpCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://rpcc.gov.bd",
        "priority": "HIGH",
        "aliases": ["RpCC", "Rangpur City Corporation"],
        "description": "Location: City Bhaban, Rangpur | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-MCC",
        "name": "Mymensingh City Corporation (MCC)",
        "short_name": "MCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://mcc.gov.bd",
        "priority": "HIGH",
        "aliases": ["MCC", "Mymensingh City"],
        "description": "Location: Shaheed Golandaz Sarak, Mymensingh | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-CUCC",
        "name": "Cumilla City Corporation (CuCC)",
        "short_name": "CuCC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://cucc.gov.bd",
        "priority": "HIGH",
        "aliases": ["CuCC", "Comilla City Corporation", "Cumilla"],
        "description": "Location: Kandirpar, Cumilla | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-CWASA",
        "name": "Chattogram WASA (CWASA)",
        "short_name": "CWASA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://cwasa.org.bd",
        "priority": "CRITICAL",
        "aliases": ["CWASA", "Chittagong WASA", "Dampara"],
        "description": "Location: WASA Bhaban, Dampara, Chattogram | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-KWASA",
        "name": "Khulna WASA (KWASA)",
        "short_name": "KWASA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://kwasa.gov.bd",
        "priority": "HIGH",
        "aliases": ["KWASA", "Khulna WASA"],
        "description": "Location: WASA Bhaban, Khulna | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-RWASA",
        "name": "Rajshahi WASA (RWASA)",
        "short_name": "RWASA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-LGRD",
        "country": "Bangladesh",
        "website": "https://rwasa.gov.bd",
        "priority": "HIGH",
        "aliases": ["RWASA", "Rajshahi WASA"],
        "description": "Location: WASA Bhaban, Rajshahi | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- J. Health, Nursing & Medical Engineering (Parent: MoHFW) ---
    {
        "id": "ORG-BD-DGDA",
        "name": "Directorate General of Drug Administration (DGDA)",
        "short_name": "DGDA",
        "type": "DIRECTORATE",
        "parent_id": "ORG-BD-MOHFW",
        "country": "Bangladesh",
        "website": "https://dgda.gov.bd",
        "priority": "HIGH",
        "aliases": ["DGDA", "Drug Administration", "Mohakhali"],
        "description": "Location: Aushad Bhaban, Mohakhali, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-DGNM",
        "name": "Directorate General of Nursing and Midwifery (DGNM)",
        "short_name": "DGNM",
        "type": "DIRECTORATE",
        "parent_id": "ORG-BD-MOHFW",
        "country": "Bangladesh",
        "website": "https://dgnm.gov.bd",
        "priority": "HIGH",
        "aliases": ["DGNM", "Nursing Directorate", "Mohakhali"],
        "description": "Location: Mohakhali, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-HED",
        "name": "Health Engineering Department (HED)",
        "short_name": "HED",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MOHFW",
        "country": "Bangladesh",
        "website": "https://hed.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["HED", "Health Engineering", "Mukti Bhaban", "Motijheel"],
        "description": "Location: Mukti Bhaban, 105-106 Motijheel C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Engineering and physical facility development wing of Ministry of Health."
    },
    {
        "id": "ORG-BD-EDCL",
        "name": "Essential Drugs Company Limited (EDCL)",
        "short_name": "EDCL",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MOHFW",
        "country": "Bangladesh",
        "website": "https://edcl.gov.bd",
        "priority": "HIGH",
        "aliases": ["EDCL", "Essential Drugs", "Tejgaon"],
        "description": "Location: 395-397 Tejgaon I/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- K. Law Enforcement & Civil Defence (Parent: MoHA) ---
    {
        "id": "ORG-BD-POLICE",
        "name": "Bangladesh Police",
        "short_name": "Police",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MOHA",
        "country": "Bangladesh",
        "website": "https://police.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["Bangladesh Police", "Police HQ", "Phoenix Road", "Fulbaria"],
        "description": "Location: Police Headquarters, 6 Phoenix Road, Fulbaria, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BGB",
        "name": "Border Guard Bangladesh (BGB)",
        "short_name": "BGB",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MOHA",
        "country": "Bangladesh",
        "website": "https://bgb.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["BGB", "Border Guard", "Pilkhana"],
        "description": "Location: Pilkhana, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-COASTGUARD",
        "name": "Bangladesh Coast Guard",
        "short_name": "Coast Guard",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MOHA",
        "country": "Bangladesh",
        "website": "https://coastguard.gov.bd",
        "priority": "HIGH",
        "aliases": ["Coast Guard", "BCG", "Agargaon"],
        "description": "Location: Coast Guard HQ, Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-FSCD",
        "name": "Fire Service and Civil Defence Department",
        "short_name": "FSCD",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MOHA",
        "country": "Bangladesh",
        "website": "https://fireservice.gov.bd",
        "priority": "HIGH",
        "aliases": ["FSCD", "Fire Service", "Kazi Alauddin Road"],
        "description": "Location: Kazi Alauddin Road, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-DNC",
        "name": "Department of Narcotics Control (DNC)",
        "short_name": "DNC",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MOHA",
        "country": "Bangladesh",
        "website": "https://dnc.gov.bd",
        "priority": "HIGH",
        "aliases": ["DNC", "Narcotics Control", "Segunbagicha"],
        "description": "Location: Segunbagicha, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-PRISONS",
        "name": "Department of Prisons (Prisons Directorate)",
        "short_name": "Prisons",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MOHA",
        "country": "Bangladesh",
        "website": "https://prison.gov.bd",
        "priority": "HIGH",
        "aliases": ["Prisons", "Kara Adhidoptor", "Chankharpul"],
        "description": "Location: Chankharpul, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- L. Industries & Small Business Development (Parent: MoInd) ---
    {
        "id": "ORG-BD-BSCIC",
        "name": "Bangladesh Small & Cottage Industries Corporation (BSCIC)",
        "short_name": "BSCIC",
        "type": "CORPORATION",
        "parent_id": "ORG-BD-MOIND",
        "country": "Bangladesh",
        "website": "https://bscic.gov.bd",
        "priority": "HIGH",
        "aliases": ["BSCIC", "Small & Cottage Industries", "Motijheel"],
        "description": "Location: BSCIC Bhaban, 137-141 Motijheel C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BSEC-IND",
        "name": "Bangladesh Steel and Engineering Corporation (BSEC)",
        "short_name": "BSEC (Steel)",
        "type": "CORPORATION",
        "parent_id": "ORG-BD-MOIND",
        "country": "Bangladesh",
        "website": "https://bsec.gov.bd",
        "priority": "HIGH",
        "aliases": ["BSEC", "Steel & Engineering Corp", "Kawranbazar"],
        "description": "Location: BSEC Bhaban, 102 Kazi Nazrul Islam Avenue, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BSFIC",
        "name": "Bangladesh Sugar and Food Industries Corporation (BSFIC)",
        "short_name": "BSFIC",
        "type": "CORPORATION",
        "parent_id": "ORG-BD-MOIND",
        "country": "Bangladesh",
        "website": "https://bsfic.gov.bd",
        "priority": "HIGH",
        "aliases": ["BSFIC", "Sugar & Food Industries", "Motijheel"],
        "description": "Location: Chinishilpa Bhaban, 3 Dilkusha C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BSTI",
        "name": "Bangladesh Standards and Testing Institution (BSTI)",
        "short_name": "BSTI",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOIND",
        "country": "Bangladesh",
        "website": "https://bsti.gov.bd",
        "priority": "HIGH",
        "aliases": ["BSTI", "Standards & Testing", "Tejgaon"],
        "description": "Location: Maan Bhaban, 116/A Tejgaon I/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-SMEF",
        "name": "Small & Medium Enterprise Foundation (SME Foundation)",
        "short_name": "SME Foundation",
        "type": "OTHER",
        "parent_id": "ORG-BD-MOIND",
        "country": "Bangladesh",
        "website": "https://smef.gov.bd",
        "priority": "MEDIUM",
        "aliases": ["SMEF", "SME Foundation", "Agargaon"],
        "description": "Location: Parjatan Bhaban, Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- M. Commerce & Export Trading (Parent: MinCom) ---
    {
        "id": "ORG-BD-TCB",
        "name": "Trading Corporation of Bangladesh (TCB)",
        "short_name": "TCB",
        "type": "CORPORATION",
        "parent_id": "ORG-BD-MINCOM",
        "country": "Bangladesh",
        "website": "https://tcb.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["TCB", "Trading Corporation", "Kawranbazar"],
        "description": "Location: TCB Bhaban, 1 Kawranbazar, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Major public procurement agency for essential commodities."
    },
    {
        "id": "ORG-BD-EPB",
        "name": "Export Promotion Bureau (EPB)",
        "short_name": "EPB",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MINCOM",
        "country": "Bangladesh",
        "website": "https://epb.gov.bd",
        "priority": "HIGH",
        "aliases": ["EPB", "Export Promotion Bureau", "Kawranbazar"],
        "description": "Location: 1 Kawranbazar, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-DNCRP",
        "name": "Directorate of National Consumers' Right Protection (DNCRP)",
        "short_name": "DNCRP",
        "type": "DIRECTORATE",
        "parent_id": "ORG-BD-MINCOM",
        "country": "Bangladesh",
        "website": "https://dncrp.gov.bd",
        "priority": "HIGH",
        "aliases": ["DNCRP", "Consumer Rights", "Kawranbazar"],
        "description": "Location: TCB Bhaban, Kawranbazar, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-TEABOARD",
        "name": "Bangladesh Tea Board",
        "short_name": "Tea Board",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MINCOM",
        "country": "Bangladesh",
        "website": "https://teaboard.gov.bd",
        "priority": "MEDIUM",
        "aliases": ["Tea Board", "Cha Board", "Nasirabad", "Chattogram"],
        "description": "Location: 171-172 Baizid Bostami Road, Nasirabad, Chattogram | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-RJSC",
        "name": "Registrar of Joint Stock Companies and Firms (RJSC)",
        "short_name": "RJSC",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MINCOM",
        "country": "Bangladesh",
        "website": "https://roc.gov.bd",
        "priority": "HIGH",
        "aliases": ["RJSC", "Joint Stock Companies", "Kawranbazar"],
        "description": "Location: TCB Bhaban, Kawranbazar, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- N. Finance, Revenue & Banking (Parent: Ministry of Finance) ---
    {
        "id": "ORG-BD-NBR",
        "name": "National Board of Revenue (NBR)",
        "short_name": "NBR",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOF",
        "country": "Bangladesh",
        "website": "https://nbr.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["NBR", "Revenue Board", "Rajaswa Bhaban", "Agargaon"],
        "description": "Location: Rajaswa Bhaban, Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Apex tax, customs, and revenue authority of Bangladesh."
    },
    {
        "id": "ORG-BD-BANGLADESHBANK",
        "name": "Bangladesh Bank (Central Bank)",
        "short_name": "Bangladesh Bank",
        "type": "BANK",
        "parent_id": "ORG-BD-MOF",
        "country": "Bangladesh",
        "website": "https://bb.org.bd",
        "priority": "CRITICAL",
        "aliases": ["Bangladesh Bank", "BB", "Central Bank", "Motijheel"],
        "description": "Location: Motijheel C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Central bank and apex monetary regulatory authority."
    },
    {
        "id": "ORG-BD-IDCOL",
        "name": "Infrastructure Development Company Limited (IDCOL)",
        "short_name": "IDCOL",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MOF",
        "country": "Bangladesh",
        "website": "https://idcol.org",
        "priority": "HIGH",
        "aliases": ["IDCOL", "Infrastructure Development Company", "Agargaon"],
        "description": "Location: UTC Building, Panthapath / Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BSEC-FIN",
        "name": "Bangladesh Securities and Exchange Commission (BSEC)",
        "short_name": "BSEC (Securities)",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOF",
        "country": "Bangladesh",
        "website": "https://sec.gov.bd",
        "priority": "HIGH",
        "aliases": ["BSEC", "Securities Commission", "Agargaon"],
        "description": "Location: Securities Commission Bhaban, Plot E-6/C Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-IDRA",
        "name": "Insurance Development and Regulatory Authority (IDRA)",
        "short_name": "IDRA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOF",
        "country": "Bangladesh",
        "website": "https://idra.org.bd",
        "priority": "HIGH",
        "aliases": ["IDRA", "Insurance Regulatory Authority", "Motijheel"],
        "description": "Location: Sadharan Bima Tower, 37/A Dilkusha C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-SONALIBANK",
        "name": "Sonali Bank PLC",
        "short_name": "Sonali Bank",
        "type": "BANK",
        "parent_id": "ORG-BD-MOF",
        "country": "Bangladesh",
        "website": "https://sonalibank.com.bd",
        "priority": "HIGH",
        "aliases": ["Sonali Bank", "Sonali Bank Bhaban", "Motijheel"],
        "description": "Location: 35-42, 44 Motijheel C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Largest commercial bank in Bangladesh."
    },
    {
        "id": "ORG-BD-JANATABANK",
        "name": "Janata Bank PLC",
        "short_name": "Janata Bank",
        "type": "BANK",
        "parent_id": "ORG-BD-MOF",
        "country": "Bangladesh",
        "website": "https://jb.com.bd",
        "priority": "HIGH",
        "aliases": ["Janata Bank", "Janata Bhaban", "Motijheel"],
        "description": "Location: 110 Motijheel C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-AGRANIBANK",
        "name": "Agrani Bank PLC",
        "short_name": "Agrani Bank",
        "type": "BANK",
        "parent_id": "ORG-BD-MOF",
        "country": "Bangladesh",
        "website": "https://agranibank.org",
        "priority": "HIGH",
        "aliases": ["Agrani Bank", "Agrani Bhaban", "Motijheel"],
        "description": "Location: 9/D Dilkusha C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-RUPALIBANK",
        "name": "Rupali Bank PLC",
        "short_name": "Rupali Bank",
        "type": "BANK",
        "parent_id": "ORG-BD-MOF",
        "country": "Bangladesh",
        "website": "https://rupalibank.com.bd",
        "priority": "HIGH",
        "aliases": ["Rupali Bank", "Rupali Bhaban", "Dilkusha"],
        "description": "Location: 34 Dilkusha C/A, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-CGA",
        "name": "Office of the Controller General of Accounts (CGA)",
        "short_name": "CGA",
        "type": "DEPARTMENT",
        "parent_id": "ORG-BD-MOF",
        "country": "Bangladesh",
        "website": "https://cga.gov.bd",
        "priority": "HIGH",
        "aliases": ["CGA", "Controller General of Accounts", "Hisab Bhaban", "Segunbagicha"],
        "description": "Location: Hisab Bhaban, Segunbagicha, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },

    # --- O. Science & Nuclear Energy (Parent: MoST) ---
    {
        "id": "ORG-BD-BAEC",
        "name": "Bangladesh Atomic Energy Commission (BAEC)",
        "short_name": "BAEC",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOST",
        "country": "Bangladesh",
        "website": "https://baec.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["BAEC", "Atomic Energy Commission", "Paramanu Bhaban", "Agargaon"],
        "description": "Location: Paramanu Bhaban, E-12/A Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BAERA",
        "name": "Bangladesh Atomic Energy Regulatory Authority (BAERA)",
        "short_name": "BAERA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOST",
        "country": "Bangladesh",
        "website": "https://baera.gov.bd",
        "priority": "HIGH",
        "aliases": ["BAERA", "Atomic Energy Regulatory", "Agargaon"],
        "description": "Location: Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BCSIR",
        "name": "Bangladesh Council of Scientific and Industrial Research (BCSIR)",
        "short_name": "BCSIR",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOST",
        "country": "Bangladesh",
        "website": "https://bcsir.gov.bd",
        "priority": "HIGH",
        "aliases": ["BCSIR", "Science Laboratory", "Dhanmondi"],
        "description": "Location: Dr. Qudrat-I-Khuda Road, Dhanmondi, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-NPCBL",
        "name": "Nuclear Power Plant Company Bangladesh Limited (NPCBL)",
        "short_name": "NPCBL",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MOST",
        "country": "Bangladesh",
        "website": "https://npcbl.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["NPCBL", "Rooppur Nuclear", "Nuclear Power Plant"],
        "description": "Location: Rooppur, Ishwardi, Pabna / Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Operator of the Rooppur Nuclear Power Plant."
    },

    # --- P. Sovereign Parliament & Apex Judiciary (Parent: ORG-BD-GOV) ---
    {
        "id": "ORG-BD-BPS",
        "name": "Bangladesh Parliament Secretariat",
        "short_name": "Parliament Sec",
        "type": "CONSTITUTIONAL_BODY",
        "parent_id": "ORG-BD-GOV",
        "country": "Bangladesh",
        "website": "https://parliament.gov.bd",
        "priority": "HIGH",
        "aliases": ["Parliament Secretariat", "Jatiya Sangsad Secretariat", "Sher-e-Bangla Nagar"],
        "description": "Location: Jatiya Sangsad Bhaban, Sher-e-Bangla Nagar, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-SCB",
        "name": "Supreme Court of Bangladesh",
        "short_name": "Supreme Court",
        "type": "CONSTITUTIONAL_BODY",
        "parent_id": "ORG-BD-GOV",
        "country": "Bangladesh",
        "website": "https://supremecourt.gov.bd",
        "priority": "CRITICAL",
        "aliases": ["Supreme Court", "Appellate Division", "High Court Division"],
        "description": "Location: Supreme Court Building, Ramna, Dhaka | Tender Portal: https://www.eprocure.gov.bd | Apex judicial organ of the People's Republic of Bangladesh."
    },

    # --- Q. Tourism, Airlines & Agriculture Research ---
    {
        "id": "ORG-BD-BIMAN",
        "name": "Biman Bangladesh Airlines Limited",
        "short_name": "Biman",
        "type": "STATE_OWNED_ENTERPRISE",
        "parent_id": "ORG-BD-MOCAT",
        "country": "Bangladesh",
        "website": "https://biman-airlines.com",
        "priority": "CRITICAL",
        "aliases": ["Biman", "Bangladesh Airlines", "Balaka Bhaban", "Kurmitola"],
        "description": "Location: Balaka Bhaban, Kurmitola, Dhaka | Tender Portal: https://www.eprocure.gov.bd | National flag carrier airline."
    },
    {
        "id": "ORG-BD-BTB",
        "name": "Bangladesh Tourism Board (BTB)",
        "short_name": "BTB",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOCAT",
        "country": "Bangladesh",
        "website": "https://tourismboard.gov.bd",
        "priority": "HIGH",
        "aliases": ["BTB", "Tourism Board", "Parjatan Bhaban", "Agargaon"],
        "description": "Location: Parjatan Bhaban, Agargaon, Dhaka | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BARI",
        "name": "Bangladesh Agricultural Research Institute (BARI)",
        "short_name": "BARI",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOA",
        "country": "Bangladesh",
        "website": "https://bari.gov.bd",
        "priority": "HIGH",
        "aliases": ["BARI", "Agricultural Research Institute", "Joydebpur", "Gazipur"],
        "description": "Location: Joydebpur, Gazipur | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BRRI",
        "name": "Bangladesh Rice Research Institute (BRRI)",
        "short_name": "BRRI",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOA",
        "country": "Bangladesh",
        "website": "https://brri.gov.bd",
        "priority": "HIGH",
        "aliases": ["BRRI", "Rice Research Institute", "Gazipur"],
        "description": "Location: Joydebpur, Gazipur | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-BMDA",
        "name": "Barind Multipurpose Development Authority (BMDA)",
        "short_name": "BMDA",
        "type": "AUTHORITY",
        "parent_id": "ORG-BD-MOA",
        "country": "Bangladesh",
        "website": "https://bmda.gov.bd",
        "priority": "HIGH",
        "aliases": ["BMDA", "Barind Authority", "Rajshahi"],
        "description": "Location: Barind Bhaban, Cantonment Road, Rajshahi | Tender Portal: https://www.eprocure.gov.bd"
    },
    {
        "id": "ORG-BD-RRI",
        "name": "River Research Institute (RRI)",
        "short_name": "RRI",
        "type": "OTHER",
        "parent_id": "ORG-BD-MOWR",
        "country": "Bangladesh",
        "website": "https://rri.gov.bd",
        "priority": "MEDIUM",
        "aliases": ["RRI", "River Research", "Faridpur"],
        "description": "Location: Harukandi, Faridpur | Tender Portal: https://www.eprocure.gov.bd"
    },
]


def merge_and_seed_new_entities():
    print("=" * 65)
    print("  Adding New Procuring Entities from e-GP Department Tree PDF")
    print("=" * 65)

    # 1. Load existing seed JSON
    if not SEED_JSON_PATH.exists():
        raise FileNotFoundError(f"Seed file not found: {SEED_JSON_PATH}")

    with open(SEED_JSON_PATH, "r", encoding="utf-8") as f:
        existing_records = json.load(f)

    existing_ids = {r["id"] for r in existing_records}
    print(f"Current organizations in seed file: {len(existing_records)}")

    # 2. Filter only NEW entities (exact user instruction: 'only new ones')
    new_to_add = []
    skipped = []

    for entity in NEW_EGP_ENTITIES:
        if entity["id"] in existing_ids:
            skipped.append(entity["id"])
        else:
            aliases_str = json.dumps(entity.get("aliases", []))
            record = {
                "id": entity["id"],
                "name": entity["name"],
                "short_name": entity.get("short_name"),
                "type": entity.get("type", "GOVERNMENT"),
                "parent_id": entity.get("parent_id"),
                "country": entity.get("country", "Bangladesh"),
                "website": entity.get("website"),
                "priority": entity.get("priority", "MEDIUM"),
                "aliases_json": aliases_str,
                "description": entity.get("description"),
            }
            new_to_add.append(record)
            existing_ids.add(entity["id"])

    print(f"Identified {len(new_to_add)} brand-new entities to add ({len(skipped)} already existed).")

    # 3. Update seed JSON
    combined_records = existing_records + new_to_add
    with open(SEED_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(combined_records, f, indent=2, ensure_ascii=False)
    print(f"Updated {SEED_JSON_PATH} with total {len(combined_records)} organizations.")

    # 4. Upsert into database
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        run_migrations()

        added_count = 0
        for r in new_to_add:
            existing_db = db.query(Organization).filter(Organization.id == r["id"]).first()
            if not existing_db:
                db_org = Organization(
                    id=r["id"],
                    name=r["name"],
                    short_name=r["short_name"],
                    type=r["type"],
                    parent_id=r["parent_id"],
                    country=r["country"],
                    website=r["website"],
                    priority=r["priority"],
                    aliases_json=r["aliases_json"],
                    description=r["description"],
                )
                db.add(db_org)
                added_count += 1

        db.commit()
        total_db = db.query(Organization).count()
        print(f"Successfully inserted {added_count} new entities into database.")
        print(f"Total organizations currently in DB: {total_db}")
        print("=" * 65)

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    merge_and_seed_new_entities()

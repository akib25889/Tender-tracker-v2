import { UserProfile } from '../types/tender';

export const TEAM_PROFILES: UserProfile[] = [
  {
    id: 'USR-01',
    name: 'Sarah Jenkins',
    role: 'BUSINESS_HEAD',
    title: 'Senior Bid Operations Director',
    email: 'sarah.jenkins@tendertracker.io',
    avatar: 'SJ',
    department: 'Bid Operations & Executive Strategy',
    phone: '+880 1819-445566',
    location: 'Dhaka, Bangladesh',
    employmentType: 'PERMANENT',
    proposedDesignation: 'Sarah Jenkins — Senior Bid Operations Director & Chief Commercial Strategist',
    maxCapacity: 5,
    certifications: [
      'APMP Certified Bid Practitioner (CP APMP)',
      'PMP® - Project Management Professional',
      'PRINCE2 Agile Practitioner',
    ],
    education: [
      {
        degree: 'MBA in Global Strategic Management & Procurement',
        institution: 'Institute of Business Administration (IBA), DU',
        year: '2015',
      },
      {
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh University of Engineering & Technology (BUET)',
        year: '2011',
      },
    ],
    activeTenderRoles: {
      'TDR-2024-001': 'LEAD_MANAGER',
      'TDR-2024-002': 'REVIEWER',
      'TDR-2024-005': 'LEAD_MANAGER',
    },
    pastAssignments: [
      {
        id: 'PA-001',
        projectName: 'National e-Procurement Portal Revamp Phase III',
        client: 'Central Procurement Technical Unit (CPTU), IMED',
        role: 'Lead Bid Strategist & Commercial Director',
        duration: 'Jan 2023 - Nov 2023',
        deploymentMonths: 11,
        keyDeliverables: [
          'High-Security Tender Opening Gateway',
          'Automated Bid Evaluation Matrix Engine',
          'Financial Security Verification API',
        ],
        technologiesUsed: ['FastAPI', 'PostgreSQL', 'HSM Cryptography', 'React', 'Docker'],
        coreResponsibilities:
          'Led end-to-end tender preparation, consortium structuring, commercial risk mitigation, and executive negotiation resulting in an award worth $4.2M.',
      },
      {
        id: 'PA-002',
        projectName: 'Smart Border Control & Automated Biometric Clearance',
        client: 'Department of Immigration & Passports',
        role: 'Bid Proposal Manager & Consortium Lead',
        duration: 'Mar 2022 - Dec 2022',
        deploymentMonths: 10,
        keyDeliverables: [
          'Multi-Modal Biometric e-Gate Integration',
          'High-Availability Failover Cluster Specification',
        ],
        technologiesUsed: ['Kubernetes', 'gRPC', 'Oracle RAC', 'TypeScript'],
        coreResponsibilities:
          'Directed technical proposal formulation and vendor partner integration across 3 global hardware OEMs.',
      },
      {
        id: 'PA-003',
        projectName: 'Metropolitan Automated Fare Collection Clearinghouse',
        client: 'Dhaka Mass Transit Company Limited (DMTCL)',
        role: 'Senior Bid Specialist',
        duration: 'Jun 2021 - Feb 2022',
        deploymentMonths: 9,
        keyDeliverables: [
          'Open-Loop Contactless Transit Payment Gateway',
          'Multi-Operator Revenue Allocation Matrix',
        ],
        technologiesUsed: ['ISO 8583', 'RabbitMQ', 'MySQL 8', 'React'],
        coreResponsibilities:
          'Authored technical compliance matrix across 420 statutory clauses with 100% compliance clearance.',
      },
    ],
  },
  {
    id: 'USR-02',
    name: 'Dr. Marcus Vance',
    role: 'EXECUTIVE_MANAGER',
    title: 'Lead Solutions Architect & Technical Authority',
    email: 'marcus.vance@tendertracker.io',
    avatar: 'MV',
    department: 'Technical Solutions Architecture',
    phone: '+880 1711-234567',
    location: 'Dhaka, Bangladesh',
    employmentType: 'PERMANENT',
    proposedDesignation: 'Dr. Marcus Vance — Lead Solutions Architect & Enterprise Systems Specialist',
    maxCapacity: 4,
    certifications: [
      'AWS Certified Solutions Architect - Professional',
      'TOGAF 9.2 Enterprise Architecture Certified',
      'Certified Information Systems Security Professional (CISSP)',
    ],
    education: [
      {
        degree: 'Ph.D. in Distributed Systems & Resilient Computing',
        institution: 'National University of Singapore (NUS)',
        year: '2014',
      },
      {
        degree: 'B.Sc. in Computer Engineering',
        institution: 'BUET',
        year: '2009',
      },
    ],
    activeTenderRoles: {
      'TDR-2024-001': 'CORE_CONTRIBUTOR',
      'TDR-2024-003': 'LEAD_MANAGER',
    },
    pastAssignments: [
      {
        id: 'PA-004',
        projectName: 'Central Bank Real-Time Gross Settlement (RTGS) Upgrade',
        client: 'Bangladesh Bank',
        role: 'Principal Systems Architect',
        duration: 'Feb 2023 - Oct 2023',
        deploymentMonths: 9,
        keyDeliverables: [
          'Sub-Second ISO 20022 Financial Messaging Engine',
          'Active-Active Cross-Datacenter Disaster Recovery Plan',
        ],
        technologiesUsed: ['Kafka', 'Go', 'CockroachDB', 'PCI-DSS Framework'],
        coreResponsibilities:
          'Engineered ultra-low latency transaction routing topology with 99.999% uptime guarantee and regulatory financial audit trails.',
      },
      {
        id: 'PA-005',
        projectName: 'National Identity Database High-Throughput Matching Hub',
        client: 'Election Commission Secretariat',
        role: 'Chief Technical Bid Architect',
        duration: 'May 2022 - Jan 2023',
        deploymentMonths: 8,
        keyDeliverables: [
          'GPU-Accelerated 1:N Biometric Matching Cluster',
          'Zero-Trust Data Vault Encryption Tier',
        ],
        technologiesUsed: ['C++', 'CUDA', 'Python', 'Redis Enterprise', 'Terraform'],
        coreResponsibilities:
          'Synthesized hardware-software co-design specification meeting SLA requirement of 120M records queried in under 2 seconds.',
      },
    ],
  },
  {
    id: 'USR-03',
    name: 'Tariq Al-Mansoor',
    role: 'SENIOR_MANAGER',
    title: 'Commercial Director & Legal Compliance Lead',
    email: 'tariq.almansoor@tendertracker.io',
    avatar: 'TA',
    department: 'Commercial & Legal Risk Management',
    phone: '+880 1912-345678',
    location: 'Dhaka, Bangladesh',
    employmentType: 'JV_PARTNER_STAFF',
    proposedDesignation: 'Tariq Al-Mansoor — Commercial Director & Contract Compliance Officer',
    maxCapacity: 4,
    certifications: [
      'ACMA / CGMA Chartered Global Management Accountant',
      'FIDIC Contract Administration Certified Specialist',
    ],
    education: [
      {
        degree: 'M.Sc. in Financial Engineering & Risk Modelling',
        institution: 'Alliance Manchester Business School',
        year: '2016',
      },
      {
        degree: 'LL.B (Honours) in Corporate & Commercial Law',
        institution: 'University of London International Programmes',
        year: '2012',
      },
    ],
    activeTenderRoles: {
      'TDR-2024-001': 'REVIEWER',
      'TDR-2024-004': 'CORE_CONTRIBUTOR',
    },
    pastAssignments: [
      {
        id: 'PA-006',
        projectName: 'Chittagong Port Authority Terminal Logistics System',
        client: 'Chittagong Port Authority (CPA)',
        role: 'Commercial Lead & JV Consortium Structurer',
        duration: 'Jul 2022 - Apr 2023',
        deploymentMonths: 10,
        keyDeliverables: [
          'Foreign Currency Hedging & Multi-Tier Escrow Agreement',
          'Subcontractor Warranty & Liquidity Indemnity Protocol',
        ],
        technologiesUsed: ['SAP S/4HANA', 'IFRS 15/16', 'Custom Financial Simulators'],
        coreResponsibilities:
          'Structured joint-venture legal vehicles with international port automation suppliers, eliminating $1.4M in potential tax leakage.',
      },
    ],
  },
  {
    id: 'USR-04',
    name: 'Elena Rostova',
    role: 'TENDER_ANALYST',
    title: 'Lead Technical Proposal Coordinator & Quality Sentinel',
    email: 'elena.rostova@tendertracker.io',
    avatar: 'ER',
    department: 'Bid Operations & Quality Assurance',
    phone: '+880 1610-987654',
    location: 'Dhaka, Bangladesh',
    employmentType: 'EXTERNAL_CONSULTANT',
    proposedDesignation: 'Elena Rostova — Lead Technical Proposal Coordinator & Compliance Auditor',
    maxCapacity: 6,
    certifications: [
      'APMP Foundation Level Certification',
      'Professional Scrum Master™ I (PSM I)',
      'ISO 9001:2015 Lead Auditor - Quality Management',
    ],
    education: [
      {
        degree: 'B.Sc. in Software Engineering',
        institution: 'North South University (NSU)',
        year: '2020',
      },
    ],
    activeTenderRoles: {
      'TDR-2024-002': 'CORE_CONTRIBUTOR',
      'TDR-2024-003': 'CORE_CONTRIBUTOR',
    },
    pastAssignments: [
      {
        id: 'PA-007',
        projectName: 'Multi-Ministry Document Automation & Archival Clearinghouse',
        client: 'Ministry of Public Administration (MOPA)',
        role: 'Technical Writer & Proposal Quality Lead',
        duration: 'Jan 2023 - Aug 2023',
        deploymentMonths: 8,
        keyDeliverables: [
          'Standardized Proposal Volume Template Repository',
          '350-Page Technical Proposal Volume with ISO Audit Trails',
        ],
        technologiesUsed: ['Markdown / AsciiDoc', 'GitBook', 'Figma', 'Confluence'],
        coreResponsibilities:
          'Managed submission packaging, compliance cross-referencing, and final proposal redactions with 0 disqualifications.',
      },
    ],
  },
];

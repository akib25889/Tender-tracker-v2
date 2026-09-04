import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Layers,
  FileCheck2,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useTenders } from '../../context/TenderContext';
import {
  TenderClassification,
  TenderPriority,
  TenderPersonnelReq,
  TenderHardwareReq,
  TenderRiskPoint,
} from '../../types/tender';

const CLASSIFICATIONS: TenderClassification[] = [
  'SOFTWARE / IT RELATED',
  'PARTIALLY SOFTWARE / IT RELATED',
  'NOT SOFTWARE / IT RELATED',
  'UNCLEAR',
];

export const NewTenderModal: React.FC = () => {
  const { isNewTenderModalOpen, setIsNewTenderModalOpen, addTender, currency } =
    useTenders();

  const [activeTab, setActiveTab] = useState<
    'BASIC' | 'SCOPE' | 'ELIGIBILITY' | 'STAFFING' | 'RISKS'
  >('BASIC');

  // Classification
  const [classification, setClassification] =
    useState<TenderClassification>('SOFTWARE / IT RELATED');

  // Basic Information
  const [tenderTitle, setTenderTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [tenderId, setTenderId] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [client, setClient] = useState('UNDP (United Nations Development Programme)');
  const [country, setCountry] = useState('Bangladesh / Regional');
  const [portal, setPortal] = useState('e-GP / UNGM');
  const [publishedDate, setPublishedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [lastDate, setLastDate] = useState(
    new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0]
  );
  const [submissionTime, setSubmissionTime] = useState('14:00 BST');
  const [estimatedValue, setEstimatedValue] = useState('2500000');
  const [priority, setPriority] = useState<TenderPriority>('HIGH');
  const [category, setCategory] = useState('IT & Cloud Infrastructure');

  // Scope & Commercial
  const [mainIdea, setMainIdea] = useState(
    'Deployment of a centralized sovereign cloud management system, automated database replication, and technical user acceptance training.'
  );
  const [tenderSecurity, setTenderSecurity] = useState('2.0% Bank Guarantee / BDT 5,000,000');
  const [contractPeriod, setContractPeriod] = useState('12 Months + 24 Months O&M');
  const [tenderDocPrice, setTenderDocPrice] = useState('BDT 5,000 / Non-refundable');
  const [performanceSecurity, setPerformanceSecurity] = useState('10% of Total Contract Value');

  // Dynamic lists
  const [technicalReqs, setTechnicalReqs] = useState<string[]>([
    'Web-based zero-trust information management system',
    'PostgreSQL / Oracle active-active geo-replication',
    'Automated RESTful integration API with audit logging',
  ]);
  const [technologyMentioned, setTechnologyMentioned] = useState<string[]>([
    'React',
    'FastAPI / Python',
    'PostgreSQL',
    'Docker / Kubernetes',
    'Linux Ubuntu 24.04 LTS',
  ]);
  const [operationalReqs, setOperationalReqs] = useState<string[]>([
    '24/7 on-call technical operations and incident resolution',
    'Tier-4 SLA: 99.95% system uptime guarantee',
    'Quarterly security audits and vulnerability patch management',
  ]);

  // Eligibility & Qualification
  const [generalExperience, setGeneralExperience] = useState(
    'Minimum 5 years of commercial software and infrastructure operations experience.'
  );
  const [similarExperience, setSimilarExperience] = useState(
    'Successfully completed at least 2 enterprise cloud / database migration contracts.'
  );
  const [similarProjectValue, setSimilarProjectValue] = useState(
    'Single contract of at least USD 1.5M or BDT 15 Crore in the last 3 fiscal years.'
  );
  const [avgTurnover, setAvgTurnover] = useState(
    'Minimum average annual turnover of USD 3M or BDT 30 Crore over the last 3 years.'
  );
  const [financialResources, setFinancialResources] = useState(
    'Available liquid assets or credit line of at least BDT 2 Crore from a scheduled bank.'
  );
  const [certification, setCertification] = useState(
    'ISO 9001:2015 and ISO 27001:2022 certified mandatory.'
  );
  const [localPresence, setLocalPresence] = useState(
    'Must have an operational registered branch or local support center in Dhaka.'
  );

  // JV & Consortium
  const [jvParticipation, setJvParticipation] = useState(
    'Allowed (Maximum 3 partners including lead member)'
  );
  const [leadMember, setLeadMember] = useState(
    'Must meet at least 50% of financial turnover and lead all technical presentations.'
  );
  const [memberRules, setMemberRules] = useState(
    'Each member must contribute at least 25% of turnover requirements.'
  );
  const [localPartner, setLocalPartner] = useState(
    'Local partner required if foreign lead firm bids.'
  );
  const [jvAgreement, setJvAgreement] = useState(
    'Joint venture deed notarized and stamped according to sovereign legal code.'
  );

  // Submission Documents
  const [documents, setDocuments] = useState<string[]>([
    'Valid Trade License & Certificate of Incorporation',
    'Updated e-TIN Certificate & Latest Year Tax Return Clearance',
    'Audited Balance Sheets & Profit/Loss Statements (Last 3 Years)',
    'Client Completion Certificates for Similar Nature Contracts',
    'Manufacturer Authorization Form (MAF) for hardware appliances',
    'Litigation History Declaration & Non-Disbarment Affidavit',
  ]);

  // Personnel Table
  const [personnel, setPersonnel] = useState<TenderPersonnelReq[]>([
    {
      position: 'Project Manager / Team Lead',
      qualification: 'B.Sc. in CSE / IT + PMP / Prince2',
      experience: '10+ Years in enterprise ICT project rollout',
      qty: '1',
    },
    {
      position: 'Lead Solutions Architect',
      qualification: 'B.Sc. in Computer Engineering + AWS/Azure Pro',
      experience: '8+ Years in cloud architecture & microservices',
      qty: '2',
    },
    {
      position: 'Senior Database Administrator',
      qualification: 'B.Sc. in IT + OCP / PostgreSQL Certified',
      experience: '6+ Years in high-volume relational DBMS',
      qty: '2',
    },
  ]);

  // Hardware Table
  const [hardware, setHardware] = useState<TenderHardwareReq[]>([
    {
      equipment: 'Rackmount Application Servers (2U, 64-Core, 256GB RAM)',
      purpose: 'Primary production hypervisors for microservices cluster',
    },
    {
      equipment: 'High-Availability SAN NVMe Storage Array (100TB Usable)',
      purpose: 'Central database storage pool with hardware RAID-10',
    },
    {
      equipment: 'Enterprise Next-Gen Firewalls (Active-Passive)',
      purpose: 'Zero-trust perimeter security, IDS/IPS, and SSL offloading',
    },
  ]);

  // Important Dates
  const [clarificationDeadline, setClarificationDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [openingDate, setOpeningDate] = useState(
    new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0]
  );
  const [contractStart, setContractStart] = useState(
    new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
  );

  // Key Risks / Points
  const [risks, setRisks] = useState<TenderRiskPoint[]>([
    {
      type: 'Tender Requirement',
      text: 'Mandatory on-site residency requirement for senior architecture team during UAT.',
    },
    {
      type: 'Analyst Observation',
      text: 'Tight 14-day turnaround for bank guarantee issuance; finance coordination required immediately.',
    },
    {
      type: 'Tender Requirement',
      text: 'Liquidated damages of 0.5% per week of delay up to a cap of 10%.',
    },
  ]);

  // Management & Notes
  const [management, setManagement] = useState<string[]>([
    'Strategic entry opportunity into multilateral regional health informatics pipeline.',
    'Expected commercial gross margin estimated between 28% and 34%.',
    'Opportunity to reuse existing proprietary microservice orchestration modules.',
  ]);
  const [notes, setNotes] = useState(
    'Initial pre-bid meeting scheduled virtually. Client procurement officer noted that past performance credentials with UN agencies will be heavily weighted during technical scoring.'
  );

  if (!isNewTenderModalOpen) return null;

  // Helper dynamic handlers
  const handleAddStringItem = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    defaultValue: string = ''
  ) => {
    setter([...list, defaultValue]);
  };

  const handleUpdateStringItem = (
    index: number,
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const updated = [...list];
    updated[index] = value;
    setter(updated);
  };

  const handleRemoveStringItem = (
    index: number,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(list.filter((_, idx) => idx !== index));
  };

  const handleAddPersonnel = () => {
    setPersonnel([
      ...personnel,
      { position: '', qualification: '', experience: '', qty: '1' },
    ]);
  };

  const handleRemovePersonnel = (index: number) => {
    setPersonnel(personnel.filter((_, idx) => idx !== index));
  };

  const handleAddHardware = () => {
    setHardware([...hardware, { equipment: '', purpose: '' }]);
  };

  const handleRemoveHardware = (index: number) => {
    setHardware(hardware.filter((_, idx) => idx !== index));
  };

  const handleAddRisk = () => {
    setRisks([
      ...risks,
      { type: 'Tender Requirement', text: '' },
    ]);
  };

  const handleRemoveRisk = (index: number) => {
    setRisks(risks.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTenderId = tenderId.trim() || `TDR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const finalTitle = tenderTitle.trim() || projectName.trim() || 'Untitled Tender Opportunity';

    addTender({
      id: newTenderId,
      referenceNo: referenceNo.trim() || '',
      title: finalTitle,
      organization: client,
      country,
      category,
      estimatedValue: Number(estimatedValue) || 1000000,
      priority,
      stage: 'DISCOVERED',
      submissionDeadline: new Date(lastDate).toISOString(),
      summary: {
        classification,
        projectName,
        portal,
        publishedDate,
        submissionTime,
        mainIdea,
        commercial: {
          tenderSecurity,
          contractPeriod,
          tenderDocPrice,
          performanceSecurity,
        },
        technicalReqs: technicalReqs.filter((s) => s.trim().length > 0),
        technologyMentioned: technologyMentioned.filter((s) => s.trim().length > 0),
        operationalReqs: operationalReqs.filter((s) => s.trim().length > 0),
        eligibility: {
          generalExperience,
          similarExperience,
          similarProjectValue,
          avgTurnover,
          financialResources,
          certification,
          localPresence,
        },
        jv: {
          participation: jvParticipation,
          leadMember,
          memberRules,
          localPartner,
          jvAgreement,
        },
        submissionDocuments: documents.filter((s) => s.trim().length > 0),
        personnel: personnel.filter((p) => p.position.trim().length > 0),
        hardware: hardware.filter((h) => h.equipment.trim().length > 0),
        dates: {
          clarificationDeadline,
          submissionDeadline: `${lastDate} ${submissionTime}`,
          openingDate,
          contractStart,
        },
        risks: risks.filter((r) => r.text.trim().length > 0),
        managementHighlights: management.filter((m) => m.trim().length > 0),
        notes,
      },
    });

    setIsNewTenderModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0F172A]/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-xl shadow-2xl border border-[#CBD5E1] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                Tender Summary Template
              </span>
              <span className="text-xs text-[#64748B]">•</span>
              <span className="text-xs text-[#64748B]">
                Curated Intake Specification
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-[#0F172A] mt-0.5">
              Register New Tender Opportunity
            </h3>
          </div>
          <button
            onClick={() => setIsNewTenderModalOpen(false)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Step Navigation Bar */}
        <div className="flex items-center border-b border-[#E2E8F0] bg-white px-6 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('BASIC')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'BASIC'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Basic Info &amp; Classification</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SCOPE')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'SCOPE'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>2. Scope &amp; Commercial</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ELIGIBILITY')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'ELIGIBILITY'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>3. Eligibility &amp; JV</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STAFFING')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'STAFFING'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Docs, Staff &amp; Hardware</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RISKS')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'RISKS'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>5. Dates &amp; Risks</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'BASIC' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Classification Pills */}
              <div>
                <label className="block font-bold text-[#0F172A] mb-1.5">
                  Tender Domain Classification *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CLASSIFICATIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setClassification(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        classification === c
                          ? 'bg-[#0F172A] text-white shadow-sm ring-2 ring-[#0F172A]/20'
                          : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Project Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Tender Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full statutory title from notice"
                    value={tenderTitle}
                    onChange={(e) => setTenderTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="Short or programmatic name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Tender ID & Reference No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Tender ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TDR-2026-BD-102"
                    value={tenderId}
                    onChange={(e) => setTenderId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Reference No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RFP/2026/0441"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Procurement Portal
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. e-GP, UNGM, World Bank"
                    value={portal}
                    onChange={(e) => setPortal(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Country / Territory *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangladesh"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Client & SOW Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Client / Issuing Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ministry of Land / World Bank / UNDP"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Scope of Work (SOW) Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="IT & Cloud Infrastructure">IT &amp; Cloud Infrastructure</option>
                    <option value="Healthcare Systems">Healthcare Systems</option>
                    <option value="Cybersecurity & Energy">Cybersecurity &amp; Energy</option>
                    <option value="Identity & Security">Identity &amp; Security</option>
                    <option value="Government Software">Government Software</option>
                  </select>
                </div>
              </div>

              {/* Value, Priority, Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Estimated Net Value ($ USD) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono font-bold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#64748B]">
                      {currency === 'BDT'
                        ? `≈ ৳${((Number(estimatedValue) * 122) / 10000000).toFixed(2)} Cr`
                        : `$${(Number(estimatedValue) / 1000000).toFixed(2)}M`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Published Notice Date
                  </label>
                  <input
                    type="date"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Operational Priority *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TenderPriority)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="CRITICAL">CRITICAL (Closing &lt; 48h / Tier 1)</option>
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MEDIUM">MEDIUM Priority</option>
                    <option value="LOW">LOW Priority</option>
                  </select>
                </div>
              </div>

              {/* Submission Deadline & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Last Date (Submission Deadline) *
                  </label>
                  <input
                    type="date"
                    required
                    value={lastDate}
                    onChange={(e) => setLastDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Submission Cutoff Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14:00 BST / 12:00 CET"
                    value={submissionTime}
                    onChange={(e) => setSubmissionTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCOPE & COMMERCIAL */}
          {activeTab === 'SCOPE' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Main Idea */}
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">
                  Main Scope &amp; Concept Idea
                </label>
                <p className="text-[11px] text-[#64748B] mb-1.5">
                  Executive summary of what the tender entails, client objectives, and key deliverables.
                </p>
                <textarea
                  rows={3}
                  value={mainIdea}
                  onChange={(e) => setMainIdea(e.target.value)}
                  className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* Commercial Requirements Grid */}
              <div>
                <h4 className="font-bold text-[#0F172A] mb-2 pb-1 border-b border-[#F1F5F9]">
                  Commercial Requirements &amp; Securities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Tender Security / Earnest Money Deposit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2% Bank Guarantee / BDT 5,000,000"
                      value={tenderSecurity}
                      onChange={(e) => setTenderSecurity(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Contract / Service Period
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12 Months Implementation + 24 Months O&M"
                      value={contractPeriod}
                      onChange={(e) => setContractPeriod(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Tender Document Price
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BDT 5,000 / Free on e-GP"
                      value={tenderDocPrice}
                      onChange={(e) => setTenderDocPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Performance Security Guarantee
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10% of Contract Value"
                      value={performanceSecurity}
                      onChange={(e) => setPerformanceSecurity(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Requirements Lines */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#0F172A]">
                    Technical Requirements (Key Deliverables)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddStringItem(technicalReqs, setTechnicalReqs, '')
                    }
                    className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Requirement</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {technicalReqs.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={req}
                        placeholder="e.g. Web-based zero-trust information system"
                        onChange={(e) =>
                          handleUpdateStringItem(
                            idx,
                            e.target.value,
                            technicalReqs,
                            setTechnicalReqs
                          )
                        }
                        className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveStringItem(idx, technicalReqs, setTechnicalReqs)
                        }
                        className="p-1.5 text-[#94A3B8] hover:text-[#DC2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Software / Tech Mentioned */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#0F172A]">
                    Software &amp; Technology Stack Mentioned
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddStringItem(
                        technologyMentioned,
                        setTechnologyMentioned,
                        ''
                      )
                    }
                    className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Technology</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {technologyMentioned.map((tech, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tech}
                        placeholder="e.g. Oracle Database, Docker, GIS"
                        onChange={(e) =>
                          handleUpdateStringItem(
                            idx,
                            e.target.value,
                            technologyMentioned,
                            setTechnologyMentioned
                          )
                        }
                        className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveStringItem(
                            idx,
                            technologyMentioned,
                            setTechnologyMentioned
                          )
                        }
                        className="p-1.5 text-[#94A3B8] hover:text-[#DC2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operational & SLA Reqs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#0F172A]">
                    Operational &amp; Maintenance Requirements
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddStringItem(
                        operationalReqs,
                        setOperationalReqs,
                        ''
                      )
                    }
                    className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add SLA / Ops Line</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {operationalReqs.map((ops, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ops}
                        placeholder="e.g. 24/7 on-call technical support with 2-hour MTTR"
                        onChange={(e) =>
                          handleUpdateStringItem(
                            idx,
                            e.target.value,
                            operationalReqs,
                            setOperationalReqs
                          )
                        }
                        className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveStringItem(
                            idx,
                            operationalReqs,
                            setOperationalReqs
                          )
                        }
                        className="p-1.5 text-[#94A3B8] hover:text-[#DC2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ELIGIBILITY & JV */}
          {activeTab === 'ELIGIBILITY' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h4 className="font-bold text-[#0F172A] mb-2 pb-1 border-b border-[#F1F5F9]">
                  Key Eligibility &amp; Statutory Qualifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      General Experience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Minimum 5 years in IT sector"
                      value={generalExperience}
                      onChange={(e) => setGeneralExperience(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Similar Experience (Contracts)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. At least 2 similar scale cloud projects"
                      value={similarExperience}
                      onChange={(e) => setSimilarExperience(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Similar Project Minimum Value
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Single contract of BDT 15 Crore"
                      value={similarProjectValue}
                      onChange={(e) => setSimilarProjectValue(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Average Annual Turnover
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BDT 30 Crore over last 3 years"
                      value={avgTurnover}
                      onChange={(e) => setAvgTurnover(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Financial Resources / Liquid Assets
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Credit facility of BDT 2 Crore"
                      value={financialResources}
                      onChange={(e) => setFinancialResources(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Required Quality Certifications
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ISO 9001, ISO 27001, CMMI Level 3"
                      value={certification}
                      onChange={(e) => setCertification(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block font-semibold text-[#475569] mb-1">
                    Local Presence / Domicile Requirements
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Registered office in Dhaka with 24/7 support personnel"
                    value={localPresence}
                    onChange={(e) => setLocalPresence(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                  />
                </div>
              </div>

              {/* JV & Consortium Rules */}
              <div>
                <h4 className="font-bold text-[#0F172A] mb-2 pb-1 border-b border-[#F1F5F9]">
                  Joint Venture (JV) &amp; Consortium Guidelines
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      JV Participation Status
                    </label>
                    <input
                      type="text"
                      placeholder="Allowed / Not Allowed / Max 3 Partners"
                      value={jvParticipation}
                      onChange={(e) => setJvParticipation(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Lead Member Rules
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Must satisfy min 50% of financial criteria"
                      value={leadMember}
                      onChange={(e) => setLeadMember(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Member Qualification Sharing
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Each partner must hold 25% experience"
                      value={memberRules}
                      onChange={(e) => setMemberRules(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Local Partner Mandate
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mandatory local firm partnership"
                      value={localPartner}
                      onChange={(e) => setLocalPartner(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block font-semibold text-[#475569] mb-1">
                    JV Agreement &amp; Legal Deed Requirement
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Formally notarized JV agreement defining profit/loss split"
                    value={jvAgreement}
                    onChange={(e) => setJvAgreement(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PERSONNEL & HARDWARE */}
          {activeTab === 'STAFFING' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Submission Documents Checklist */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <label className="font-bold text-[#0F172A] block">
                      Documents Required in Submission Package
                    </label>
                    <span className="text-[11px] text-[#64748B]">
                      Automatically generates compliance checklist and vault audit placeholders
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddStringItem(documents, setDocuments, '')
                    }
                    className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Document</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={doc}
                        placeholder="e.g. Audited Financial Balance Sheets"
                        onChange={(e) =>
                          handleUpdateStringItem(
                            idx,
                            e.target.value,
                            documents,
                            setDocuments
                          )
                        }
                        className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveStringItem(idx, documents, setDocuments)
                        }
                        className="p-1.5 text-[#94A3B8] hover:text-[#DC2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* CV / Key Personnel Table */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <label className="font-bold text-[#0F172A] block">
                      CV / Key Personnel Requirements
                    </label>
                    <span className="text-[11px] text-[#64748B]">
                      Stated staff positions, qualifications, and minimum experience
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPersonnel}
                    className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Key Position</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B]">
                        <th className="p-2">Position Title</th>
                        <th className="p-2">Min. Qualification</th>
                        <th className="p-2">Required Experience</th>
                        <th className="p-2 w-16">Qty</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {personnel.map((p, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC]">
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={p.position}
                              placeholder="e.g. Lead Database Architect"
                              onChange={(e) => {
                                const updated = [...personnel];
                                updated[idx].position = e.target.value;
                                setPersonnel(updated);
                              }}
                              className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={p.qualification}
                              placeholder="e.g. B.Sc. in CSE"
                              onChange={(e) => {
                                const updated = [...personnel];
                                updated[idx].qualification = e.target.value;
                                setPersonnel(updated);
                              }}
                              className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={p.experience}
                              placeholder="e.g. 8+ Years"
                              onChange={(e) => {
                                const updated = [...personnel];
                                updated[idx].experience = e.target.value;
                                setPersonnel(updated);
                              }}
                              className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={p.qty}
                              placeholder="1"
                              onChange={(e) => {
                                const updated = [...personnel];
                                updated[idx].qty = e.target.value;
                                setPersonnel(updated);
                              }}
                              className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs text-center font-mono"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemovePersonnel(idx)}
                              className="text-[#94A3B8] hover:text-[#DC2626]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hardware Requirements Table */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <label className="font-bold text-[#0F172A] block">
                      Hardware &amp; Equipment Specifications
                    </label>
                    <span className="text-[11px] text-[#64748B]">
                      Physical appliances, edge nodes, or server hardware requirements
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddHardware}
                    className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Hardware</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B]">
                        <th className="p-2">Hardware / Equipment</th>
                        <th className="p-2">Functional Purpose</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {hardware.map((h, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC]">
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={h.equipment}
                              placeholder="e.g. 2U Rackmount Servers"
                              onChange={(e) => {
                                const updated = [...hardware];
                                updated[idx].equipment = e.target.value;
                                setHardware(updated);
                              }}
                              className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={h.purpose}
                              placeholder="e.g. Database replication cluster"
                              onChange={(e) => {
                                const updated = [...hardware];
                                updated[idx].purpose = e.target.value;
                                setHardware(updated);
                              }}
                              className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveHardware(idx)}
                              className="text-[#94A3B8] hover:text-[#DC2626]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATES, RISKS & MANAGEMENT */}
          {activeTab === 'RISKS' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Important Dates */}
              <div>
                <h4 className="font-bold text-[#0F172A] mb-2 pb-1 border-b border-[#F1F5F9] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#2563EB]" />
                  <span>Important Timeline Deadlines</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Clarification Deadline
                    </label>
                    <input
                      type="date"
                      value={clarificationDeadline}
                      onChange={(e) => setClarificationDeadline(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Bid Opening Date
                    </label>
                    <input
                      type="date"
                      value={openingDate}
                      onChange={(e) => setOpeningDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Expected Contract Start Date
                    </label>
                    <input
                      type="date"
                      value={contractStart}
                      onChange={(e) => setContractStart(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>
              </div>

              {/* Key Risks & Analyst Points */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <label className="font-bold text-[#0F172A] block">
                      Key Risks / Important Points
                    </label>
                    <span className="text-[11px] text-[#64748B]">
                      Critical items flagged for executive attention and proposal clearance
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRisk}
                    className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Risk Point</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {risks.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={r.type}
                        onChange={(e) => {
                          const updated = [...risks];
                          updated[idx].type = e.target.value as
                            | 'Tender Requirement'
                            | 'Analyst Observation';
                          setRisks(updated);
                        }}
                        className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] shrink-0"
                      >
                        <option value="Tender Requirement">Tender Requirement</option>
                        <option value="Analyst Observation">Analyst Observation</option>
                      </select>
                      <input
                        type="text"
                        value={r.text}
                        placeholder="Point senior management needs to know..."
                        onChange={(e) => {
                          const updated = [...risks];
                          updated[idx].text = e.target.value;
                          setRisks(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRisk(idx)}
                        className="p-1.5 text-[#94A3B8] hover:text-[#DC2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important for Management */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#0F172A]">
                    Important for Management (Highlights)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddStringItem(management, setManagement, '')
                    }
                    className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Point</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {management.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={m}
                        placeholder="e.g. Strategic expansion into multilateral health pipeline"
                        onChange={(e) =>
                          handleUpdateStringItem(
                            idx,
                            e.target.value,
                            management,
                            setManagement
                          )
                        }
                        className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveStringItem(idx, management, setManagement)
                        }
                        className="p-1.5 text-[#94A3B8] hover:text-[#DC2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">
                  Internal Remarks &amp; Debrief Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Context, clarifications from pre-bid meeting, or internal remarks..."
                  className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2">
              {activeTab !== 'BASIC' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: ('BASIC' | 'SCOPE' | 'ELIGIBILITY' | 'STAFFING' | 'RISKS')[] = [
                      'BASIC',
                      'SCOPE',
                      'ELIGIBILITY',
                      'STAFFING',
                      'RISKS',
                    ];
                    const idx = tabs.indexOf(activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1]);
                  }}
                  className="flex items-center gap-1 px-3 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-lg font-semibold hover:bg-[#F8FAFC] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}

              {activeTab !== 'RISKS' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: ('BASIC' | 'SCOPE' | 'ELIGIBILITY' | 'STAFFING' | 'RISKS')[] = [
                      'BASIC',
                      'SCOPE',
                      'ELIGIBILITY',
                      'STAFFING',
                      'RISKS',
                    ];
                    const idx = tabs.indexOf(activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg font-semibold transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewTenderModalOpen(false)}
                className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-lg font-semibold hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B] shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Register Tender Entry</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

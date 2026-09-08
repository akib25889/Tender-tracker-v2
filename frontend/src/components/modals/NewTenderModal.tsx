import React, { useState, useMemo } from 'react';
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
  BookOpen,
  UserCheck,
  Headphones,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Check,
  FileText,
  CreditCard,
} from 'lucide-react';
import { useTenders } from '../../context/TenderContext';
import {
  TenderClassification,
  TenderPriority,
  TenderPersonnelReq,
  TenderHardwareReq,
  TenderRiskPoint,
  ImportantClause,
  TenderFinancialModel,
  STANDARD_TENDER_TYPES,
  STANDARD_BUDGET_TYPES,
  STANDARD_SOURCE_OF_FUNDS,
  STANDARD_PROCUREMENT_METHODS,
} from '../../types/tender';
import { ImportantClausesManager } from '../tender/ImportantClausesManager';
import { FinancialScenariosEditor } from '../tender/FinancialScenariosEditor';

const CLASSIFICATIONS: TenderClassification[] = [
  'SOFTWARE / IT RELATED',
  'PARTIALLY SOFTWARE / IT RELATED',
  'NOT SOFTWARE / IT RELATED',
  'UNCLEAR',
];

const createDefaultFinancialModel = (estimatedVal: number = 0): TenderFinancialModel => ({
  paymentScenario: 'MILESTONE_BASED',
  workingCapitalRisk: 'MEDIUM',
  advancePayment: {
    enabled: false,
    percentage: 15,
    amount: estimatedVal > 0 ? Math.round(estimatedVal * 0.15) : 0,
    bankGuaranteeRequired: true,
    bankGuaranteeType: 'Unconditional First Demand Bank Guarantee',
    recoveryType: 'PRO_RATA_INVOICE',
    recoveryPercentagePerInvoice: 15,
    recoveryStartMilestone: 1,
  },
  milestones: [
    {
      milestoneNumber: 1,
      name: 'Inception & SRS Signoff',
      percentage: 20,
      amount: estimatedVal > 0 ? Math.round(estimatedVal * 0.2) : 0,
      deliverable: 'Approved Inception Report & Architectural Blueprint',
      approvalRequired: true,
      clientReviewDays: 14,
      paymentProcessingDays: 30,
      paymentTrigger: 'UPON_SRS_APPROVAL',
      invoiceRequirements: 'Inception Report, Acceptance Certificate, Tax Invoice',
    },
    {
      milestoneNumber: 2,
      name: 'Core Development & Pilot Deployment',
      percentage: 50,
      amount: estimatedVal > 0 ? Math.round(estimatedVal * 0.5) : 0,
      deliverable: 'Core Modules Deployed in Staging & UAT Signoff',
      approvalRequired: true,
      clientReviewDays: 21,
      paymentProcessingDays: 30,
      paymentTrigger: 'UPON_UAT_ACCEPTANCE',
      invoiceRequirements: 'UAT Sign-off Protocol, Source Code Escrow',
    },
    {
      milestoneNumber: 3,
      name: 'Final Acceptance & Handover',
      percentage: 30,
      amount: estimatedVal > 0 ? Math.round(estimatedVal * 0.3) : 0,
      deliverable: 'Commissioning Certificate & Operations Handover',
      approvalRequired: true,
      clientReviewDays: 30,
      paymentProcessingDays: 45,
      paymentTrigger: 'UPON_FINAL_ACCEPTANCE',
      invoiceRequirements: 'FAC Certificate & 10% Retention Deduction',
    },
  ],
  subscriptionModel: {
    pricingModel: 'MULTI_YEAR_ESCALATION',
    billingFrequency: 'ANNUAL',
    annualBaseFee: 0,
    durationYears: 3,
    annualEscalationRate: 5,
    userCount: 100,
    feePerUserMonthly: 500,
    calculatedTcv: 0,
    calculatedAcv: 0,
    escalationTiers: [],
  },
  penaltiesAndDeductions: {
    liquidatedDamages: {
      enabled: true,
      rate: 0.5,
      frequency: 'PER_WEEK',
      calculationBasis: 'DELAYED_MILESTONE_VALUE',
      maxCapPercentage: 10,
      gracePeriodDays: 7,
    },
    retentionMoney: {
      enabled: true,
      percentage: 10,
      releaseCondition: 'DLP_EXPIRY',
      dlpMonths: 12,
      interimReleasePercent: 50,
    },
    slaDeductionRate: 1.0,
    taxDeductionAtSourcePercent: 5.0,
    vatDeductionAtSourcePercent: 7.5,
  },
});

export const NewTenderModal: React.FC = () => {
  const {
    isNewTenderModalOpen,
    setIsNewTenderModalOpen,
    addTender,
    tenders,
    categories,
    addCategory,
  } = useTenders();

  const [activeTab, setActiveTab] = useState<
    'BASIC' | 'SCOPE' | 'FINANCIAL' | 'ELIGIBILITY' | 'STAFFING' | 'RISKS' | 'CLAUSES'
  >('BASIC');

  const [importantClauses, setImportantClauses] = useState<ImportantClause[]>([]);
  const [financialModel, setFinancialModel] = useState<TenderFinancialModel>(() =>
    createDefaultFinancialModel(2500000)
  );

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
  const [tenderCurrency, setTenderCurrency] = useState('USD');
  const [exchangeRateToBdt, setExchangeRateToBdt] = useState('122.00');
  const [exchangeRateDate, setExchangeRateDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<TenderPriority>('HIGH');
  const [category, setCategory] = useState('IT & Cloud Infrastructure');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Procurement Governance & Sourcing Attributes (Req #21)
  const [tenderType, setTenderType] = useState<string>('International Competitive Bidding (ICB)');
  const [budgetType, setBudgetType] = useState<string>('Development Budget (ADP / Capex)');
  const [sourceOfFund, setSourceOfFund] = useState<string>('Government of Bangladesh (GoB)');
  const [procurementMethod, setProcurementMethod] = useState<string>('Quality & Cost Based Selection (QCBS)');
  const [isCustomTenderType, setIsCustomTenderType] = useState(false);
  const [isCustomBudgetType, setIsCustomBudgetType] = useState(false);
  const [isCustomSourceOfFund, setIsCustomSourceOfFund] = useState(false);
  const [isCustomProcurementMethod, setIsCustomProcurementMethod] = useState(false);

  // Procuring Authority Officer & Helpline Details
  const [procurementManagerName, setProcurementManagerName] = useState('');
  const [procurementManagerDesignation, setProcurementManagerDesignation] = useState('');
  const [procurementManagerEmail, setProcurementManagerEmail] = useState('');
  const [procurementManagerPhone, setProcurementManagerPhone] = useState('');
  const [helplinePhone, setHelplinePhone] = useState('');
  const [helplineEmail, setHelplineEmail] = useState('');
  const [helplineHours, setHelplineHours] = useState('');

  const handleCurrencyChange = (newCur: string) => {
    setTenderCurrency(newCur);
    if (newCur === 'BDT') {
      setExchangeRateToBdt('1.0');
    } else if (newCur === 'USD') {
      setExchangeRateToBdt('122.00');
    } else if (newCur === 'EUR') {
      setExchangeRateToBdt('133.50');
    } else if (newCur === 'GBP') {
      setExchangeRateToBdt('158.00');
    } else if (newCur === 'JPY') {
      setExchangeRateToBdt('0.82');
    }
  };

  const liveBdtValue = useMemo(() => {
    const val = Number(estimatedValue) || 0;
    const rate = tenderCurrency === 'BDT' ? 1.0 : (Number(exchangeRateToBdt) || 0);
    return val * rate;
  }, [estimatedValue, exchangeRateToBdt, tenderCurrency]);

  const formatBdtPreview = (val: number) => {
    if (val >= 10000000) {
      return `≈ ৳${(val / 10000000).toFixed(2)} Crore`;
    }
    if (val >= 100000) {
      return `≈ ৳${(val / 100000).toFixed(2)} Lakh`;
    }
    return `≈ ৳${Math.round(val).toLocaleString()}`;
  };

  const availableCategories = useMemo(() => {
    const fromCategories = (categories || []).map((c) => c.name);
    const fromTenders = (tenders || []).map((t) => t.category).filter(Boolean);
    const combined = Array.from(new Set([...fromCategories, ...fromTenders])).filter(Boolean);
    return combined.sort((a, b) => a.localeCompare(b));
  }, [categories, tenders]);

  // Scope & Commercial
  const [mainIdea, setMainIdea] = useState(
    'Deployment of a centralized sovereign cloud management system, automated database replication, and technical user acceptance training.'
  );
  const [tenderSecurity, setTenderSecurity] = useState('2.0% Bank Guarantee / BDT 5,000,000');
  const [contractPeriod, setContractPeriod] = useState('12 Months + 24 Months O&M');
  const [tenderDocPrice, setTenderDocPrice] = useState('BDT 5,000 / Non-refundable');
  const [performanceSecurity, setPerformanceSecurity] = useState('10% of Total Contract Value');

  // Commercial Schedule & Security Deposit Terms (Req #20 & Calculator)
  const [schedulePurchaseDeadline, setSchedulePurchaseDeadline] = useState(
    new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0]
  );
  const [schedulePurchaseMethod, setSchedulePurchaseMethod] = useState('ONLINE_EGP');
  const [tenderSecurityAmount, setTenderSecurityAmount] = useState<string | number>('50000');
  const [tenderSecurityMethod, setTenderSecurityMethod] = useState('BANK_GUARANTEE');
  const [securityPercent, setSecurityPercent] = useState<number>(2.5);

  // Reverse budget estimator: Security ÷ %
  const impliedBudgetFromSecurity = useMemo(() => {
    const sec = Number(tenderSecurityAmount) || 0;
    const pct = Number(securityPercent) || 2.5;
    if (sec <= 0 || pct <= 0) return 0;
    return sec / (pct / 100);
  }, [tenderSecurityAmount, securityPercent]);

  // Forward security calculator: Budget × %
  const impliedSecurityFromBudget = useMemo(() => {
    const bud = Number(estimatedValue) || 0;
    const pct = Number(securityPercent) || 2.5;
    if (bud <= 0 || pct <= 0) return 0;
    return bud * (pct / 100);
  }, [estimatedValue, securityPercent]);

  const handleApplyCalculatedBudget = () => {
    if (impliedBudgetFromSecurity > 0) {
      setEstimatedValue(Math.round(impliedBudgetFromSecurity).toString());
    }
  };

  const handleApplyCalculatedSecurity = () => {
    if (impliedSecurityFromBudget > 0) {
      setTenderSecurityAmount(Math.round(impliedSecurityFromBudget));
    }
  };

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

  // Important Dates & Full Lifecycle Procurement Milestones (Req #20)
  const [clarificationDeadline, setClarificationDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [openingDate, setOpeningDate] = useState(
    new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0]
  );
  const [contractSigningDate, setContractSigningDate] = useState(
    new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0]
  );
  const [workStartDate, setWorkStartDate] = useState(
    new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
  );
  const [contractStart, setContractStart] = useState(
    new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
  );
  const [possiblePeriod, setPossiblePeriod] = useState('12 Months Execution');
  const [productHandoverDate, setProductHandoverDate] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  );
  const [maintenancePeriod, setMaintenancePeriod] = useState(
    '24 Months SLA Support & Maintenance'
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

    if (category && category.trim()) {
      addCategory({ name: category.trim() });
    }

    addTender({
      id: newTenderId,
      referenceNo: referenceNo.trim() || '',
      title: finalTitle,
      organization: client,
      country,
      category,
      estimatedValue: Number(estimatedValue) || 1000000,
      currency: tenderCurrency,
      exchangeRateToBdt: tenderCurrency === 'BDT' ? 1.0 : (Number(exchangeRateToBdt) || 122.0),
      exchangeRateDate: exchangeRateDate || publishedDate,
      estimatedValueBdt: liveBdtValue,
      procurementManagerName,
      procurementManagerDesignation,
      procurementManagerEmail,
      procurementManagerPhone,
      helplinePhone,
      helplineEmail,
      helplineHours,
      // Procurement Governance & Sourcing Attributes (Req #21)
      tenderType,
      budgetType,
      sourceOfFund,
      procurementMethod,
      priority,
      stage: 'DISCOVERED',
      submissionDeadline: new Date(lastDate).toISOString(),
      // Full Lifecycle Procurement Milestones (Req #20)
      openingDate: openingDate || undefined,
      contractSigningDate: contractSigningDate || undefined,
      workStartDate: workStartDate || contractStart || undefined,
      possiblePeriod: possiblePeriod || undefined,
      productHandoverDate: productHandoverDate || undefined,
      maintenancePeriod: maintenancePeriod || undefined,
      // Commercial Schedule & Security Deposit Terms
      schedulePurchaseDeadline: schedulePurchaseDeadline || undefined,
      schedulePurchaseMethod: schedulePurchaseMethod || undefined,
      tenderDocPrice: tenderDocPrice || undefined,
      tenderSecurityAmount: tenderSecurityAmount ? Number(tenderSecurityAmount) : undefined,
      tenderSecurityMethod: tenderSecurityMethod || undefined,
      summary: {
        classification,
        projectName,
        portal,
        publishedDate,
        submissionTime,
        mainIdea,
        tenderType,
        budgetType,
        sourceOfFund,
        procurementMethod,
        procurementManager: {
          name: procurementManagerName,
          designation: procurementManagerDesignation,
          email: procurementManagerEmail,
          phone: procurementManagerPhone,
        },
        helpline: {
          phone: helplinePhone,
          email: helplineEmail,
          hours: helplineHours,
        },
        commercial: {
          tenderSecurity: tenderSecurityAmount
            ? `${tenderSecurityMethod || 'Security'}: ${tenderSecurityAmount}`
            : tenderSecurity,
          contractPeriod: possiblePeriod || contractPeriod,
          tenderDocPrice,
          performanceSecurity,
          schedulePurchaseDeadline,
          schedulePurchaseMethod,
          tenderSecurityAmount: tenderSecurityAmount ? Number(tenderSecurityAmount) : undefined,
          tenderSecurityMethod,
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
          schedulePurchaseDeadline,
          openingDate,
          contractSigningDate,
          workStartDate,
          contractStart: contractSigningDate || contractStart,
          possiblePeriod,
          productHandoverDate,
          maintenancePeriod,
        },
        risks: risks.filter((r) => r.text.trim().length > 0),
        managementHighlights: management.filter((m) => m.trim().length > 0),
        notes,
        financialModel,
      },
      financialModel,
      importantClauses,
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
            onClick={() => setActiveTab('FINANCIAL')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'FINANCIAL'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>3. Financial Scenarios &amp; Rules</span>
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
            <span>4. Eligibility &amp; JV</span>
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
            <span>5. Docs, Staff &amp; Hardware</span>
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
            <span>6. Dates &amp; Risks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CLAUSES')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'CLAUSES'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>7. Clauses &amp; Citations ({importantClauses.length})</span>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#0F172A]">
                      Scope of Work (SOW) Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (isCustomCategory) {
                          setIsCustomCategory(false);
                          if (!category) setCategory(availableCategories[0] || 'IT & Cloud Infrastructure');
                        } else {
                          setIsCustomCategory(true);
                          setCategory('');
                        }
                      }}
                      className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                    >
                      {isCustomCategory ? '← Choose Existing' : '+ New Category'}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="e.g. Industrial IoT & SCADA, Renewable Energy..."
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#2563EB] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>
                  ) : (
                    <select
                      value={availableCategories.includes(category) ? category : '__CUSTOM__'}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsCustomCategory(true);
                          setCategory('');
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      {!availableCategories.includes(category) && category && (
                        <option value={category}>{category}</option>
                      )}
                      <option value="__CUSTOM__" className="font-bold text-[#2563EB]">
                        + Add New Custom Category...
                      </option>
                    </select>
                  )}
                </div>
              </div>

              {/* Currency & Financial Valuation */}
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Currency &amp; Financial Valuation
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 shadow-sm">
                    {formatBdtPreview(liveBdtValue)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                      Tender Currency *
                    </label>
                    <select
                      value={tenderCurrency}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg font-bold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="BDT">BDT (৳)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="OTHER">Other Currency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                      Net Value ({tenderCurrency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      placeholder="e.g. 2500000"
                      className="w-full px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg font-mono font-bold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                      Rate vs BDT (At that time) *
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      disabled={tenderCurrency === 'BDT'}
                      value={tenderCurrency === 'BDT' ? '1.0' : exchangeRateToBdt}
                      onChange={(e) => setExchangeRateToBdt(e.target.value)}
                      placeholder="e.g. 122.00"
                      className={`w-full px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg font-mono text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] ${
                        tenderCurrency === 'BDT' ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                      Rate Fixation Date
                    </label>
                    <input
                      type="date"
                      value={exchangeRateDate}
                      onChange={(e) => setExchangeRateDate(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#64748B] pt-1.5 border-t border-[#E2E8F0]">
                  <span>
                    {tenderCurrency === 'BDT'
                      ? 'Local currency tender (1.0 conversion factor to BDT).'
                      : `Historical conversion rate of that time: 1 ${tenderCurrency} = ৳${exchangeRateToBdt || '122.00'} BDT`}
                  </span>
                  <span className="font-semibold text-slate-700">
                    Total Equivalent:{' '}
                    <span className="text-[#2563EB] font-mono">
                      ৳{Math.round(liveBdtValue).toLocaleString()} BDT
                    </span>
                  </span>
                </div>
              </div>

              {/* Procurement Governance & Sourcing Attributes (Req #21) */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Procurement Governance &amp; Sourcing Framework
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Statutory Governance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tender Type */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-[#0F172A]">
                        Tender Type *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomTenderType(!isCustomTenderType);
                          if (isCustomTenderType && !tenderType) setTenderType(STANDARD_TENDER_TYPES[0]);
                        }}
                        className="text-[10px] font-semibold text-[#2563EB] hover:underline"
                      >
                        {isCustomTenderType ? '← Select Preset' : '+ Custom Type'}
                      </button>
                    </div>
                    {isCustomTenderType ? (
                      <input
                        type="text"
                        placeholder="e.g. Turnkey EPC, Framework Call-off..."
                        value={tenderType}
                        onChange={(e) => setTenderType(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#2563EB] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    ) : (
                      <select
                        value={tenderType}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__' || e.target.value === 'Other / Custom Modality') {
                            setIsCustomTenderType(true);
                            setTenderType('');
                          } else {
                            setTenderType(e.target.value);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      >
                        {STANDARD_TENDER_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                        {!STANDARD_TENDER_TYPES.includes(tenderType as any) && tenderType && (
                          <option value={tenderType}>{tenderType}</option>
                        )}
                        <option value="__CUSTOM__" className="font-bold text-[#2563EB]">
                          + Add Custom Tender Type...
                        </option>
                      </select>
                    )}
                  </div>

                  {/* Budget Type */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-[#0F172A]">
                        Budget Type *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomBudgetType(!isCustomBudgetType);
                          if (isCustomBudgetType && !budgetType) setBudgetType(STANDARD_BUDGET_TYPES[0]);
                        }}
                        className="text-[10px] font-semibold text-[#2563EB] hover:underline"
                      >
                        {isCustomBudgetType ? '← Select Preset' : '+ Custom Budget'}
                      </button>
                    </div>
                    {isCustomBudgetType ? (
                      <input
                        type="text"
                        placeholder="e.g. Special Trust Fund, Sovereign Loan..."
                        value={budgetType}
                        onChange={(e) => setBudgetType(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#2563EB] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    ) : (
                      <select
                        value={budgetType}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomBudgetType(true);
                            setBudgetType('');
                          } else {
                            setBudgetType(e.target.value);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      >
                        {STANDARD_BUDGET_TYPES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                        {!STANDARD_BUDGET_TYPES.includes(budgetType as any) && budgetType && (
                          <option value={budgetType}>{budgetType}</option>
                        )}
                        <option value="__CUSTOM__" className="font-bold text-[#2563EB]">
                          + Add Custom Budget Type...
                        </option>
                      </select>
                    )}
                  </div>

                  {/* Source of Fund */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-[#0F172A]">
                        Source of Fund (Financier) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSourceOfFund(!isCustomSourceOfFund);
                          if (isCustomSourceOfFund && !sourceOfFund) setSourceOfFund(STANDARD_SOURCE_OF_FUNDS[0]);
                        }}
                        className="text-[10px] font-semibold text-[#2563EB] hover:underline"
                      >
                        {isCustomSourceOfFund ? '← Select Preset' : '+ Custom Source'}
                      </button>
                    </div>
                    {isCustomSourceOfFund ? (
                      <input
                        type="text"
                        placeholder="e.g. Islamic Development Bank (IsDB)..."
                        value={sourceOfFund}
                        onChange={(e) => setSourceOfFund(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#2563EB] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    ) : (
                      <select
                        value={sourceOfFund}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomSourceOfFund(true);
                            setSourceOfFund('');
                          } else {
                            setSourceOfFund(e.target.value);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      >
                        {STANDARD_SOURCE_OF_FUNDS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                        {!STANDARD_SOURCE_OF_FUNDS.includes(sourceOfFund as any) && sourceOfFund && (
                          <option value={sourceOfFund}>{sourceOfFund}</option>
                        )}
                        <option value="__CUSTOM__" className="font-bold text-[#2563EB]">
                          + Add Custom Source of Fund...
                        </option>
                      </select>
                    )}
                  </div>

                  {/* Procurement Method */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-[#0F172A]">
                        Procurement Method *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomProcurementMethod(!isCustomProcurementMethod);
                          if (isCustomProcurementMethod && !procurementMethod) setProcurementMethod(STANDARD_PROCUREMENT_METHODS[0]);
                        }}
                        className="text-[10px] font-semibold text-[#2563EB] hover:underline"
                      >
                        {isCustomProcurementMethod ? '← Select Preset' : '+ Custom Method'}
                      </button>
                    </div>
                    {isCustomProcurementMethod ? (
                      <input
                        type="text"
                        placeholder="e.g. Two-Envelope with Reverse Auction..."
                        value={procurementMethod}
                        onChange={(e) => setProcurementMethod(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#2563EB] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    ) : (
                      <select
                        value={procurementMethod}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomProcurementMethod(true);
                            setProcurementMethod('');
                          } else {
                            setProcurementMethod(e.target.value);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      >
                        {STANDARD_PROCUREMENT_METHODS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                        {!STANDARD_PROCUREMENT_METHODS.includes(procurementMethod as any) && procurementMethod && (
                          <option value={procurementMethod}>{procurementMethod}</option>
                        )}
                        <option value="__CUSTOM__" className="font-bold text-[#2563EB]">
                          + Add Custom Method...
                        </option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Procuring Authority Officer & Helpline Details */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                  <UserCheck className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Procuring Authority Contact &amp; Helpdesk Information
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Procurement Officer / Manager */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                        Procurement Manager / Officer
                      </span>
                      <span className="text-[10px] text-[#64748B] font-mono">Official Contact</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                        Officer Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Engr. Rafiqul Islam"
                        value={procurementManagerName}
                        onChange={(e) => setProcurementManagerName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                        Official Designation / Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Superintending Engineer (Procurement)"
                        value={procurementManagerDesignation}
                        onChange={(e) => setProcurementManagerDesignation(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                          Direct Phone / Mobile
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. +880 1711-234567"
                          value={procurementManagerPhone}
                          onChange={(e) => setProcurementManagerPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                          Official Email
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. rafiqul@dtca.gov.bd"
                          value={procurementManagerEmail}
                          onChange={(e) => setProcurementManagerEmail(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tender Helpline & Support Desk */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                        <Headphones className="w-3.5 h-3.5 text-[#2563EB]" />
                        Tender Helpline &amp; Support Desk
                      </span>
                      <span className="text-[10px] text-[#64748B] font-mono">Portal Support</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                        Helpline Number / Hotline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +880 2 9568741 or 16123"
                        value={helplinePhone}
                        onChange={(e) => setHelplinePhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                        Support Desk Email
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. helpdesk@eprocure.gov.bd"
                        value={helplineEmail}
                        onChange={(e) => setHelplineEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                        Desk Operating Hours
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 09:00 AM - 05:00 PM BST (Sun-Thu)"
                        value={helplineHours}
                        onChange={(e) => setHelplineHours(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Published Date & Operational Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Published Notice Date
                  </label>
                  <input
                    type="date"
                    value={publishedDate}
                    onChange={(e) => {
                      setPublishedDate(e.target.value);
                      if (!exchangeRateDate) setExchangeRateDate(e.target.value);
                    }}
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
              {/* Tender Schedule / Form Buy Panel */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                    Tender Schedule / Form Purchase Terms
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono">Form Buy &amp; Procurement Fee</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                      Schedule Buy Deadline
                    </label>
                    <input
                      type="date"
                      value={schedulePurchaseDeadline}
                      onChange={(e) => setSchedulePurchaseDeadline(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] text-xs focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                      Tender Document / Form Fee
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ৳2,000 or Free on e-GP"
                      value={tenderDocPrice}
                      onChange={(e) => setTenderDocPrice(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] text-xs focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                      Schedule Payment Method
                    </label>
                    <select
                      value={schedulePurchaseMethod}
                      onChange={(e) => setSchedulePurchaseMethod(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] text-xs focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="ONLINE_EGP">Online e-GP Payment Gateway</option>
                      <option value="PAY_ORDER">Pay Order / Demand Draft</option>
                      <option value="BANK_DEPOSIT">Direct Bank Deposit / Transfer</option>
                      <option value="TREASURY_CHALLAN">Treasury Challan (Sonali Bank)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tender Security Deposit & Smart 2.5% Reverse Budget Calculator */}
              <div className="p-4 bg-gradient-to-br from-[#EFF6FF]/60 to-[#F8FAFC] rounded-xl border border-[#BFDBFE] space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-[#BFDBFE] pb-2.5 gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Tender Security / Earnest Money Deposit (EMD)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold bg-[#DBEAFE] text-[#1D4ED8] px-2 py-0.5 rounded-full">
                    Standard Guideline: ~2.5% of Budget
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Security Deposit Amount ({tenderCurrency}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 50000"
                      value={tenderSecurityAmount}
                      onChange={(e) => setTenderSecurityAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg font-mono font-bold text-[#0F172A] text-sm focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Security Instrument / Method *
                    </label>
                    <select
                      value={tenderSecurityMethod}
                      onChange={(e) => setTenderSecurityMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] text-xs focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="BANK_GUARANTEE">Bank Guarantee (BG)</option>
                      <option value="PAY_ORDER">Pay Order (PO) / Demand Draft</option>
                      <option value="ONLINE_PORTAL">Online Portal Security Deposit</option>
                      <option value="TREASURY_CHALLAN">Treasury Challan</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Security Description / Specific Bank Requirements
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Irrevocable unconditional Bank Guarantee valid for 148 days from scheduled opening"
                      value={tenderSecurity}
                      onChange={(e) => setTenderSecurity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] text-xs focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                {/* Interactive % Estimator & Reverse Budget Calculator */}
                <div className="p-3.5 bg-white rounded-xl border border-[#93C5FD] shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E40AF]">
                      <Calculator className="w-4 h-4 text-[#2563EB]" />
                      <span>Security Deposit % &amp; Reverse Budget Estimator</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1.0, 2.0, 2.5, 3.0, 5.0].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setSecurityPercent(pct)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                            securityPercent === pct
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    In many tenders, procuring entities state the exact <strong>Security Deposit</strong> amount but keep the total budget unstated. 
                    Since security is typically set at <strong>{securityPercent}%</strong>, you can calculate the estimated budget from the security deposit, or vice versa.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Reverse Estimator: From Security to Budget */}
                    <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5">
                      <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        Reverse Mode: Implied Budget from Security
                      </div>
                      <div className="text-xs text-[#0F172A]">
                        Security ({tenderSecurityAmount ? Number(tenderSecurityAmount).toLocaleString() : '0'} {tenderCurrency}) ÷ {securityPercent}% =
                      </div>
                      <div className="font-mono text-sm font-extrabold text-[#2563EB]">
                        {impliedBudgetFromSecurity > 0
                          ? `≈ ${tenderCurrency === 'BDT' ? '৳' : '$'}${Math.round(impliedBudgetFromSecurity).toLocaleString()} ${tenderCurrency}`
                          : 'Enter security deposit above'}
                      </div>
                      {impliedBudgetFromSecurity > 0 && (
                        <button
                          type="button"
                          onClick={handleApplyCalculatedBudget}
                          className="mt-1 w-full py-1.5 px-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>⚡ Set Estimated Budget to {tenderCurrency === 'BDT' ? '৳' : '$'}{Math.round(impliedBudgetFromSecurity).toLocaleString()}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Forward Mode: From Budget to Security */}
                    <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5">
                      <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        Forward Mode: Security from Estimated Budget
                      </div>
                      <div className="text-xs text-[#0F172A]">
                        Budget ({estimatedValue ? Number(estimatedValue).toLocaleString() : '0'} {tenderCurrency}) × {securityPercent}% =
                      </div>
                      <div className="font-mono text-sm font-extrabold text-[#16A34A]">
                        {impliedSecurityFromBudget > 0
                          ? `≈ ${tenderCurrency === 'BDT' ? '৳' : '$'}${Math.round(impliedSecurityFromBudget).toLocaleString()} ${tenderCurrency}`
                          : 'Enter estimated budget'}
                      </div>
                      {impliedSecurityFromBudget > 0 && (
                        <button
                          type="button"
                          onClick={handleApplyCalculatedSecurity}
                          className="mt-1 w-full py-1.5 px-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Set Security Amount ({tenderCurrency === 'BDT' ? '৳' : '$'}{Math.round(impliedSecurityFromBudget).toLocaleString()})</span>
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract & Performance Security */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* TAB 3: FINANCIAL SCENARIOS & CASH FLOW */}
          {activeTab === 'FINANCIAL' && (
            <div className="space-y-6 animate-fadeIn">
              <FinancialScenariosEditor
                value={financialModel}
                onChange={setFinancialModel}
                tenderCurrency={tenderCurrency}
                estimatedValue={Number(estimatedValue) || 0}
              />
            </div>
          )}

          {/* TAB 4: ELIGIBILITY & JV */}
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
              {/* Key Procurement & Project Milestones Schedule (Req #20) */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    Key Procurement &amp; Project Milestones Schedule
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono">Full Lifecycle Dates (Req #20)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Clarification Deadline
                    </label>
                    <input
                      type="date"
                      value={clarificationDeadline}
                      onChange={(e) => setClarificationDeadline(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Tender Document / Bid Opening Date *
                    </label>
                    <input
                      type="date"
                      value={openingDate}
                      onChange={(e) => setOpeningDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#0F172A] focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Contract Signing Date *
                    </label>
                    <input
                      type="date"
                      value={contractSigningDate}
                      onChange={(e) => setContractSigningDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Work / Project Start Date (W.O.) *
                    </label>
                    <input
                      type="date"
                      value={workStartDate || contractStart}
                      onChange={(e) => {
                        setWorkStartDate(e.target.value);
                        setContractStart(e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Possible / Execution Period
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 180 Days / 12 Months"
                      value={possiblePeriod}
                      onChange={(e) => setPossiblePeriod(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Product / System Handover Date *
                    </label>
                    <input
                      type="date"
                      value={productHandoverDate}
                      onChange={(e) => setProductHandoverDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#0F172A] focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Support &amp; Maintenance Period (O&amp;M / Warranty)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 24 Months Comprehensive O&M + 24/7 Helpline SLA"
                      value={maintenancePeriod}
                      onChange={(e) => setMaintenancePeriod(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:ring-1 focus:ring-[#2563EB]"
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

          {/* TAB 6: IMPORTANT CLAUSES & CITATIONS */}
          {activeTab === 'CLAUSES' && (
            <div className="space-y-4 animate-fadeIn">
              <ImportantClausesManager
                clauses={importantClauses}
                onChange={setImportantClauses}
              />
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2">
              {activeTab !== 'BASIC' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: (
                      | 'BASIC'
                      | 'SCOPE'
                      | 'FINANCIAL'
                      | 'ELIGIBILITY'
                      | 'STAFFING'
                      | 'RISKS'
                      | 'CLAUSES'
                    )[] = [
                      'BASIC',
                      'SCOPE',
                      'FINANCIAL',
                      'ELIGIBILITY',
                      'STAFFING',
                      'RISKS',
                      'CLAUSES',
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

              {activeTab !== 'CLAUSES' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: (
                      | 'BASIC'
                      | 'SCOPE'
                      | 'FINANCIAL'
                      | 'ELIGIBILITY'
                      | 'STAFFING'
                      | 'RISKS'
                      | 'CLAUSES'
                    )[] = [
                      'BASIC',
                      'SCOPE',
                      'FINANCIAL',
                      'ELIGIBILITY',
                      'STAFFING',
                      'RISKS',
                      'CLAUSES',
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

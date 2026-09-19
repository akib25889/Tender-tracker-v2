import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Save,
  Check,
  Layers,
  FileCheck2,
  Briefcase,
  AlertTriangle,
  ExternalLink,
  FileText,
  BookOpen,
  UserCheck,
  Headphones,
  Calculator,
  ShieldCheck,
  Calendar,
  ArrowRight,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import {
  TenderClassification,
  TenderStage,
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
} from '../types/tender';
import { ExportDropdown } from '../components/ui/ExportDropdown';
import { ImportantClausesManager } from '../components/tender/ImportantClausesManager';
import { FinancialScenariosEditor } from '../components/tender/FinancialScenariosEditor';

const STAGE_OPTIONS: { value: TenderStage; label: string }[] = [
  { value: 'DISCOVERED', label: '1. Bid Discovery (DISCOVERED)' },
  { value: 'SCREENING', label: '2. Screening (SCREENING)' },
  { value: 'UNDER_ANALYSIS', label: '3. Under Analysis & Go/No-Go' },
  { value: 'PREPARATION', label: '4. Preparation & Authoring' },
  { value: 'SUBMITTED', label: '5. Submitted to Authority' },
  { value: 'AWARDED', label: '6. Won / Awarded' },
  { value: 'LOST', label: 'Closed: Lost' },
  { value: 'DECLINED', label: 'Closed: Declined / No-Go' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const CLASSIFICATIONS: TenderClassification[] = [
  'SOFTWARE / IT RELATED',
  'PARTIALLY SOFTWARE / IT RELATED',
  'NOT SOFTWARE / IT RELATED',
  'UNCLEAR',
];

const createDefaultFinancialModel = (_estimatedVal: number = 0): TenderFinancialModel => ({
  paymentScenario: 'MILESTONE_BASED',
  workingCapitalRisk: 'LOW',
  advancePayment: {
    enabled: false,
    percentage: 0,
    amount: 0,
    bankGuaranteeRequired: false,
    bankGuaranteeType: '',
    recoveryType: 'PRO_RATA_INVOICE',
    recoveryPercentagePerInvoice: 0,
    recoveryStartMilestone: 1,
  },
  milestones: [],
  subscriptionModel: {
    pricingModel: 'MULTI_YEAR_ESCALATION',
    billingFrequency: 'ANNUAL',
    annualBaseFee: 0,
    durationYears: 0,
    annualEscalationRate: 0,
    userCount: 0,
    feePerUserMonthly: 0,
    calculatedTcv: 0,
    calculatedAcv: 0,
    escalationTiers: [],
  },
  penaltiesAndDeductions: {
    liquidatedDamages: {
      enabled: false,
      rate: 0,
      frequency: 'PER_WEEK',
      calculationBasis: 'DELAYED_MILESTONE_VALUE',
      maxCapPercentage: 0,
      gracePeriodDays: 0,
    },
    retentionMoney: {
      enabled: false,
      percentage: 0,
      releaseCondition: 'DLP_EXPIRY',
      dlpMonths: 0,
      interimReleasePercent: 0,
    },
    slaDeductionRate: 0,
    taxDeductionAtSourcePercent: 0,
    vatDeductionAtSourcePercent: 0,
  },
});

export const TenderRegistryPage: React.FC = () => {
  const { tenders, addTender, deleteTender, categories, addCategory } = useTenders();
  const [searchParams, setSearchParams] = useSearchParams();
  const editIdFromUrl = searchParams.get('id') || searchParams.get('edit');

  const [selectedTenderId, setSelectedTenderId] = useState<string>(
    editIdFromUrl || ''
  );

  useEffect(() => {
    if (editIdFromUrl) {
      setSelectedTenderId(editIdFromUrl);
    }
  }, [editIdFromUrl]);

  const [activeEditorTab, setActiveEditorTab] = useState<
    'BASIC' | 'SCOPE' | 'FINANCIAL' | 'ELIGIBILITY' | 'STAFFING' | 'RISKS' | 'CLAUSES'
  >('BASIC');

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Currently selected tender or null (blank entry mode)
  const selectedTender = useMemo(() => {
    if (!selectedTenderId) return null;
    return tenders.find((t) => t.id === selectedTenderId) || null;
  }, [selectedTenderId, tenders]);

  const [importantClauses, setImportantClauses] = useState<ImportantClause[]>([]);
  const [financialModel, setFinancialModel] = useState<TenderFinancialModel>(() =>
    createDefaultFinancialModel(0)
  );

  const [classification, setClassification] = useState<TenderClassification>(
    'SOFTWARE / IT RELATED'
  );
  const [tenderTitle, setTenderTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [tenderId, setTenderId] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [client, setClient] = useState('');
  const [country, setCountry] = useState('');
  const [portal, setPortal] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [lastDate, setLastDate] = useState('');
  const [submissionTime, setSubmissionTime] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<string | number>('');
  const [tenderCurrency, setTenderCurrency] = useState<string>('USD');
  const [exchangeRateToBdt, setExchangeRateToBdt] = useState<string | number>('');
  const [exchangeRateDate, setExchangeRateDate] = useState<string>('');
  const [priority, setPriority] = useState<TenderPriority>('MEDIUM');
  const [stage, setStage] = useState<TenderStage>('DISCOVERED');
  const [category, setCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [aiChatShareLink, setAiChatShareLink] = useState('');

  // Procurement Governance & Sourcing Attributes (Req #21)
  const [tenderType, setTenderType] = useState<string>('');
  const [budgetType, setBudgetType] = useState<string>('');
  const [sourceOfFund, setSourceOfFund] = useState<string>('');
  const [procurementMethod, setProcurementMethod] = useState<string>('');
  const [parentEoiId, setParentEoiId] = useState<string>('');
  const [isCustomTenderType, setIsCustomTenderType] = useState(false);
  const [isCustomBudgetType, setIsCustomBudgetType] = useState(false);
  const [isCustomSourceOfFund, setIsCustomSourceOfFund] = useState(false);
  const [isCustomProcurementMethod, setIsCustomProcurementMethod] = useState(false);

  const eligibleParentEois = useMemo(() => {
    return (tenders || []).filter(
      (t) =>
        t.tenderType === 'Expression of Interest (EOI)' ||
        t.tenderType?.toLowerCase().includes('expression of interest') ||
        t.eoiShortlistStatus === 'SHORTLISTED'
    );
  }, [tenders]);

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
    const fromTenders = tenders.map((t) => t.category).filter(Boolean);
    const combined = Array.from(new Set([...fromCategories, ...fromTenders])).filter(Boolean);
    return combined.sort((a, b) => a.localeCompare(b));
  }, [categories, tenders]);

  // Scope & Commercial
  const [mainIdea, setMainIdea] = useState('');
  const [tenderSecurity, setTenderSecurity] = useState('');
  const [contractPeriod, setContractPeriod] = useState('');
  const [tenderDocPrice, setTenderDocPrice] = useState('');
  const [performanceSecurity, setPerformanceSecurity] = useState('');

  // Commercial Schedule & Tender Security (EMD)
  const [schedulePurchaseDeadline, setSchedulePurchaseDeadline] = useState('');
  const [schedulePurchaseMethod, setSchedulePurchaseMethod] = useState('');
  const [tenderSecurityAmount, setTenderSecurityAmount] = useState<string | number>('');
  const [tenderSecurityMethod, setTenderSecurityMethod] = useState('');
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
      setEstimatedValue(Math.round(impliedBudgetFromSecurity));
    }
  };

  const handleApplyCalculatedSecurity = () => {
    if (impliedSecurityFromBudget > 0) {
      setTenderSecurityAmount(Math.round(impliedSecurityFromBudget));
    }
  };

  // Dynamic Lists
  const [technicalReqs, setTechnicalReqs] = useState<string[]>([]);
  const [technologyMentioned, setTechnologyMentioned] = useState<string[]>([]);
  const [operationalReqs, setOperationalReqs] = useState<string[]>([]);

  // Eligibility & JV
  const [generalExperience, setGeneralExperience] = useState('');
  const [similarExperience, setSimilarExperience] = useState('');
  const [similarProjectValue, setSimilarProjectValue] = useState('');
  const [avgTurnover, setAvgTurnover] = useState('');
  const [financialResources, setFinancialResources] = useState('');
  const [certification, setCertification] = useState('');
  const [localPresence, setLocalPresence] = useState('');

  // JV & Consortium
  const [jvParticipation, setJvParticipation] = useState('');
  const [leadMember, setLeadMember] = useState('');
  const [memberRules, setMemberRules] = useState('');
  const [localPartner, setLocalPartner] = useState('');
  const [jvAgreement, setJvAgreement] = useState('');

  // Documents, Personnel, Hardware
  const [documents, setDocuments] = useState<string[]>([]);
  const [personnel, setPersonnel] = useState<TenderPersonnelReq[]>([]);
  const [hardware, setHardware] = useState<TenderHardwareReq[]>([]);

  // Milestone Schedule Dates (Req #20)
  const [clarificationDeadline, setClarificationDeadline] = useState('');
  const [openingDate, setOpeningDate] = useState('');
  const [contractSigningDate, setContractSigningDate] = useState('');
  const [workStartDate, setWorkStartDate] = useState('');
  const [contractStart, setContractStart] = useState('');
  const [possiblePeriod, setPossiblePeriod] = useState('');
  const [productHandoverDate, setProductHandoverDate] = useState('');
  const [maintenancePeriod, setMaintenancePeriod] = useState('');

  const [risks, setRisks] = useState<TenderRiskPoint[]>([]);
  const [management, setManagement] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Sync form when selectedTender changes or reset if null
  useEffect(() => {
    if (!selectedTender) {
      setClassification('SOFTWARE / IT RELATED');
      setTenderTitle('');
      setProjectName('');
      setTenderId('');
      setReferenceNo('');
      setClient('');
      setCountry('');
      setPortal('');
      setPublishedDate('');
      setLastDate('');
      setSubmissionTime('');
      setEstimatedValue('');
      setTenderCurrency('USD');
      setExchangeRateToBdt('');
      setExchangeRateDate('');
      setPriority('MEDIUM');
      setStage('DISCOVERED');
      setCategory('');
      setIsCustomCategory(false);
      setAiChatShareLink('');
      setTenderType('');
      setBudgetType('');
      setSourceOfFund('');
      setProcurementMethod('');
      setParentEoiId('');
      setIsCustomTenderType(false);
      setIsCustomBudgetType(false);
      setIsCustomSourceOfFund(false);
      setIsCustomProcurementMethod(false);
      setProcurementManagerName('');
      setProcurementManagerDesignation('');
      setProcurementManagerEmail('');
      setProcurementManagerPhone('');
      setHelplinePhone('');
      setHelplineEmail('');
      setHelplineHours('');
      setMainIdea('');
      setTenderSecurity('');
      setContractPeriod('');
      setTenderDocPrice('');
      setPerformanceSecurity('');
      setSchedulePurchaseDeadline('');
      setSchedulePurchaseMethod('');
      setTenderSecurityAmount('');
      setTenderSecurityMethod('');
      setSecurityPercent(2.5);
      setTechnicalReqs([]);
      setTechnologyMentioned([]);
      setOperationalReqs([]);
      setGeneralExperience('');
      setSimilarExperience('');
      setSimilarProjectValue('');
      setAvgTurnover('');
      setFinancialResources('');
      setCertification('');
      setLocalPresence('');
      setJvParticipation('');
      setLeadMember('');
      setMemberRules('');
      setLocalPartner('');
      setJvAgreement('');
      setDocuments([]);
      setPersonnel([]);
      setHardware([]);
      setClarificationDeadline('');
      setOpeningDate('');
      setContractSigningDate('');
      setWorkStartDate('');
      setContractStart('');
      setPossiblePeriod('');
      setProductHandoverDate('');
      setMaintenancePeriod('');
      setRisks([]);
      setManagement([]);
      setNotes('');
      setImportantClauses([]);
      setFinancialModel(createDefaultFinancialModel(0));
      return;
    }
    setClassification(
      selectedTender.summary?.classification || 'SOFTWARE / IT RELATED'
    );
    setTenderTitle(selectedTender.title);
    setProjectName(selectedTender.summary?.projectName || '');
    setTenderId(selectedTender.id);
    setReferenceNo(selectedTender.referenceNo);
    setClient(selectedTender.organization);
    setCountry(selectedTender.country);
    setPortal(selectedTender.summary?.portal || 'e-GP / UNGM');
    setPublishedDate(selectedTender.summary?.publishedDate || '');
    setLastDate(
      selectedTender.submissionDeadline
        ? selectedTender.submissionDeadline.split('T')[0]
        : ''
    );
    setSubmissionTime(selectedTender.summary?.submissionTime || '');
    setEstimatedValue(
      selectedTender.estimatedValue && selectedTender.estimatedValue > 0
        ? selectedTender.estimatedValue
        : ''
    );
    setTenderCurrency(selectedTender.currency || 'USD');
    setExchangeRateToBdt(
      selectedTender.exchangeRateToBdt !== undefined
        ? selectedTender.exchangeRateToBdt
        : selectedTender.currency === 'BDT'
        ? 1.0
        : '122.00'
    );
    setExchangeRateDate(selectedTender.exchangeRateDate || selectedTender.summary?.publishedDate || '');
    setPriority(selectedTender.priority);
    setStage(selectedTender.stage || 'DISCOVERED');
    setCategory(selectedTender.category);
    setIsCustomCategory(false);
    setAiChatShareLink(selectedTender.aiChatShareLink || '');

    setTenderType(
      selectedTender.tenderType || selectedTender.summary?.tenderType || STANDARD_TENDER_TYPES[0]
    );
    setBudgetType(
      selectedTender.budgetType || selectedTender.summary?.budgetType || STANDARD_BUDGET_TYPES[0]
    );
    setSourceOfFund(
      selectedTender.sourceOfFund || selectedTender.summary?.sourceOfFund || STANDARD_SOURCE_OF_FUNDS[0]
    );
    setProcurementMethod(
      selectedTender.procurementMethod || selectedTender.summary?.procurementMethod || STANDARD_PROCUREMENT_METHODS[0]
    );
    setParentEoiId(selectedTender.parentEoiId || '');
    setIsCustomTenderType(false);
    setIsCustomBudgetType(false);
    setIsCustomSourceOfFund(false);
    setIsCustomProcurementMethod(false);

    setProcurementManagerName(
      selectedTender.procurementManagerName ||
        selectedTender.summary?.procurementManager?.name ||
        ''
    );
    setProcurementManagerDesignation(
      selectedTender.procurementManagerDesignation ||
        selectedTender.summary?.procurementManager?.designation ||
        ''
    );
    setProcurementManagerEmail(
      selectedTender.procurementManagerEmail ||
        selectedTender.summary?.procurementManager?.email ||
        ''
    );
    setProcurementManagerPhone(
      selectedTender.procurementManagerPhone ||
        selectedTender.summary?.procurementManager?.phone ||
        ''
    );
    setHelplinePhone(
      selectedTender.helplinePhone ||
        selectedTender.summary?.helpline?.phone ||
        ''
    );
    setHelplineEmail(
      selectedTender.helplineEmail ||
        selectedTender.summary?.helpline?.email ||
        ''
    );
    setHelplineHours(
      selectedTender.helplineHours ||
        selectedTender.summary?.helpline?.hours ||
        ''
    );

    setMainIdea(selectedTender.summary?.mainIdea || '');
    setTenderSecurity(
      selectedTender.summary?.commercial?.tenderSecurity || ''
    );
    setContractPeriod(
      selectedTender.summary?.commercial?.contractPeriod || ''
    );
    setTenderDocPrice(
      selectedTender.summary?.commercial?.tenderDocPrice || ''
    );
    setPerformanceSecurity(
      selectedTender.summary?.commercial?.performanceSecurity || ''
    );

    setTechnicalReqs(selectedTender.summary?.technicalReqs || []);
    setTechnologyMentioned(selectedTender.summary?.technologyMentioned || []);
    setOperationalReqs(selectedTender.summary?.operationalReqs || []);

    setGeneralExperience(
      selectedTender.summary?.eligibility?.generalExperience || ''
    );
    setSimilarExperience(
      selectedTender.summary?.eligibility?.similarExperience || ''
    );
    setSimilarProjectValue(
      selectedTender.summary?.eligibility?.similarProjectValue || ''
    );
    setAvgTurnover(
      selectedTender.summary?.eligibility?.avgTurnover || ''
    );
    setFinancialResources(
      selectedTender.summary?.eligibility?.financialResources || ''
    );
    setCertification(
      selectedTender.summary?.eligibility?.certification || ''
    );
    setLocalPresence(
      selectedTender.summary?.eligibility?.localPresence || ''
    );

    setJvParticipation(
      selectedTender.summary?.jv?.participation || ''
    );
    setLeadMember(
      selectedTender.summary?.jv?.leadMember || ''
    );
    setMemberRules(
      selectedTender.summary?.jv?.memberRules || ''
    );
    setLocalPartner(
      selectedTender.summary?.jv?.localPartner || ''
    );
    setJvAgreement(
      selectedTender.summary?.jv?.jvAgreement || ''
    );

    setDocuments(selectedTender.summary?.submissionDocuments || []);
    setPersonnel(selectedTender.summary?.personnel || []);
    setHardware(selectedTender.summary?.hardware || []);

    setSchedulePurchaseDeadline(
      selectedTender.schedulePurchaseDeadline || selectedTender.summary?.commercial?.schedulePurchaseDeadline || ''
    );
    setSchedulePurchaseMethod(
      selectedTender.schedulePurchaseMethod || selectedTender.summary?.commercial?.schedulePurchaseMethod || ''
    );
    setTenderSecurityAmount(
      selectedTender.tenderSecurityAmount || selectedTender.summary?.commercial?.tenderSecurityAmount || ''
    );
    setTenderSecurityMethod(
      selectedTender.tenderSecurityMethod || selectedTender.summary?.commercial?.tenderSecurityMethod || ''
    );

    setClarificationDeadline(
      selectedTender.summary?.dates?.clarificationDeadline || ''
    );
    setOpeningDate(
      selectedTender.openingDate || selectedTender.summary?.dates?.openingDate || ''
    );
    setContractSigningDate(
      selectedTender.contractSigningDate || selectedTender.summary?.dates?.contractSigningDate || ''
    );
    setWorkStartDate(
      selectedTender.workStartDate || selectedTender.summary?.dates?.workStartDate || ''
    );
    setContractStart(
      selectedTender.workStartDate || selectedTender.summary?.dates?.contractStart || ''
    );
    setPossiblePeriod(
      selectedTender.possiblePeriod || selectedTender.summary?.dates?.possiblePeriod || ''
    );
    setProductHandoverDate(
      selectedTender.productHandoverDate || selectedTender.summary?.dates?.productHandoverDate || ''
    );
    setMaintenancePeriod(
      selectedTender.maintenancePeriod || selectedTender.summary?.dates?.maintenancePeriod || ''
    );

    setRisks(selectedTender.summary?.risks || []);
    setManagement(selectedTender.summary?.managementHighlights || []);
    setNotes(selectedTender.summary?.notes || '');
    setImportantClauses(selectedTender.importantClauses || []);
    setFinancialModel(
      selectedTender.financialModel ||
        createDefaultFinancialModel(selectedTender.estimatedValue)
    );
  }, [selectedTenderId]);

  const handleCreateNewBlank = () => {
    setSelectedTenderId('');
    setSearchParams({});
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedDeadline =
      lastDate && !isNaN(Date.parse(lastDate))
        ? new Date(lastDate).toISOString()
        : '';

    const parsedEstVal =
      estimatedValue !== '' && !isNaN(Number(estimatedValue)) && Number(estimatedValue) > 0
        ? Number(estimatedValue)
        : 0;

    if (category && category.trim()) {
      addCategory({ name: category.trim() });
    }

    const finalId = tenderId && tenderId.trim()
      ? tenderId.trim()
      : `TDR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    addTender({
      id: finalId,
      referenceNo,
      title: tenderTitle,
      organization: client,
      country,
      category,
      priority,
      stage: stage || selectedTender?.stage || 'DISCOVERED',
      estimatedValue: parsedEstVal,
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
      parentEoiId: parentEoiId || undefined,
      openingDate: openingDate || '',
      contractSigningDate: contractSigningDate || '',
      workStartDate: workStartDate || '',
      possiblePeriod: possiblePeriod || '',
      productHandoverDate: productHandoverDate || '',
      maintenancePeriod: maintenancePeriod || '',
      schedulePurchaseDeadline: schedulePurchaseDeadline || '',
      schedulePurchaseMethod: schedulePurchaseMethod || 'ONLINE_EGP',
      tenderSecurityAmount: Number(tenderSecurityAmount) || undefined,
      tenderSecurityMethod: tenderSecurityMethod || 'BANK_GUARANTEE',
      submissionDeadline: parsedDeadline,
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
          tenderSecurity,
          tenderSecurityAmount: Number(tenderSecurityAmount) || undefined,
          tenderSecurityMethod,
          contractPeriod: possiblePeriod || contractPeriod,
          tenderDocPrice,
          schedulePurchaseDeadline,
          schedulePurchaseMethod,
          performanceSecurity,
          maintenancePeriod,
        },
        technicalReqs: technicalReqs.filter((s) => s.trim().length > 0),
        technologyMentioned: technologyMentioned.filter(
          (s) => s.trim().length > 0
        ),
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
          clarificationDeadline: clarificationDeadline || '',
          submissionDeadline: lastDate ? `${lastDate} ${submissionTime}`.trim() : '',
          openingDate: openingDate || '',
          contractSigningDate: contractSigningDate || '',
          workStartDate: workStartDate || '',
          contractStart: workStartDate || contractStart || '',
          possiblePeriod: possiblePeriod || '',
          productHandoverDate: productHandoverDate || '',
          maintenancePeriod: maintenancePeriod || '',
          schedulePurchaseDeadline: schedulePurchaseDeadline || '',
        },
        risks: risks.filter((r) => r.text.trim().length > 0),
        managementHighlights: management.filter((m) => m.trim().length > 0),
        notes,
        financialModel,
      },
      financialModel,
      importantClauses,
      aiChatShareLink: aiChatShareLink.trim() || undefined,
    });

    setTenderId(finalId);
    setSelectedTenderId(finalId);
    setSearchParams({ id: finalId });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDeleteCurrent = () => {
    if (!selectedTender) return;
    if (window.confirm(`Are you sure you want to permanently delete tender "${selectedTender.title}" (${selectedTender.id})?`)) {
      deleteTender(selectedTender.id);
      setSelectedTenderId('');
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Procurement Core</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">
              Tender Registry Console
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Tender Registry &amp; Data Entry
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Full data entry workspace matching the official Tender Summary
            template — manage all technical, statutory, and commercial parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saveSuccess && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold rounded-lg shadow-sm">
              <Check className="w-3.5 h-3.5" />
              <span>Entry Saved Successfully!</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#64748B] font-medium hidden sm:inline">Active Record:</span>
            <select
              value={selectedTenderId || ''}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTenderId(val);
                if (val) {
                  setSearchParams({ id: val });
                } else {
                  setSearchParams({});
                }
              }}
              className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] text-[#0F172A] rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB] max-w-[220px] truncate"
            >
              <option value="">+ New Blank Tender Entry</option>
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} {t.title ? `— ${t.title}` : ''}
                </option>
              ))}
            </select>
          </div>
          {selectedTender && (
            <ExportDropdown tender={selectedTender} label="Export Entry" />
          )}
          <button
            onClick={handleCreateNewBlank}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Tender Entry</span>
          </button>
        </div>
      </div>

      {/* Full-Width Editor Panel */}
      <div className="w-full bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden">
        {/* Editor Header Bar */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-base font-bold text-[#0F172A] line-clamp-1">
              {tenderTitle || 'Untitled Tender Entry'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {selectedTender && (
              <Link
                to={`/registry/summary/${selectedTender.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Summary</span>
              </Link>
            )}
            {selectedTender && (
              <button
                type="button"
                onClick={handleDeleteCurrent}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                title="Delete this tender"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
            {selectedTender && (
              <Link
                to={`/tenders/${selectedTender.id}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold transition-colors"
              >
                <span>Workspace</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
            <button
              type="button"
              onClick={handleSaveEntry}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Entry</span>
            </button>
          </div>
        </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center border-b border-[#E2E8F0] bg-white px-6 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveEditorTab('BASIC')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'BASIC'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. Basic Information</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('SCOPE')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'SCOPE'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>2. Scope &amp; Commercial</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('FINANCIAL')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'FINANCIAL'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>3. Financial Scenarios &amp; Rules</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('ELIGIBILITY')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'ELIGIBILITY'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>4. Eligibility &amp; JV</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('STAFFING')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'STAFFING'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>5. Staff &amp; Hardware</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('RISKS')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'RISKS'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>6. Dates, Risks &amp; Notes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('CLAUSES')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'CLAUSES'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>7. Important Clauses ({importantClauses.length})</span>
            </button>
          </div>

          {/* Form Scroll Body */}
          <form
            onSubmit={handleSaveEntry}
            className="flex-1 overflow-y-auto p-6 space-y-6 text-xs"
          >
            {/* TAB 1: BASIC INFORMATION */}
            {activeEditorTab === 'BASIC' && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block font-bold text-[#0F172A] mb-1.5">
                    Tender Domain Classification
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Tender Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={tenderTitle}
                      onChange={(e) => setTenderTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Tender ID *
                    </label>
                    <input
                      type="text"
                      value={tenderId}
                      onChange={(e) => setTenderId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Reference No.
                    </label>
                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Procurement Portal
                    </label>
                    <input
                      type="text"
                      value={portal}
                      onChange={(e) => setPortal(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Country / Jurisdiction *
                    </label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Client / Issuing Authority *
                    </label>
                    <input
                      type="text"
                      required
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
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
                        value={availableCategories.includes(category) ? category : (category ? category : '')}
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
                        <option value="">-- Select Category --</option>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Published Date
                    </label>
                    <input
                      type="date"
                      value={publishedDate}
                      onChange={(e) => setPublishedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Last Date (Submission Deadline)
                    </label>
                    <input
                      type="date"
                      value={lastDate}
                      onChange={(e) => setLastDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Submission Cutoff Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14:00 BST"
                      value={submissionTime}
                      onChange={(e) => setSubmissionTime(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                {/* AI Chat & Document Knowledge Share Link */}
                <div className="p-3.5 bg-violet-50/70 dark:bg-violet-950/25 rounded-xl border border-violet-200 dark:border-violet-800/40 space-y-1.5 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-violet-950 dark:text-violet-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                      <span>AI Chat &amp; Document Knowledge Link (ChatGPT / Claude / NotebookLM / Gemini)</span>
                    </label>
                    {aiChatShareLink && (
                      <a
                        href={aiChatShareLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-violet-700 dark:text-violet-400 hover:text-violet-900 dark:hover:text-violet-200 flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="e.g. https://chatgpt.com/share/67a213ff... or https://notebooklm.google.com/notebook/..."
                    value={aiChatShareLink}
                    onChange={(e) => setAiChatShareLink(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900/90 border border-violet-200 dark:border-violet-800/60 rounded-lg text-xs text-[#0F172A] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-violet-500 focus:border-violet-500 font-mono transition-colors"
                  />
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                    Share link to an external AI conversation or notebook with tender RFPs pre-loaded so your team doesn&apos;t have to re-upload files to inquire.
                  </p>
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
                        Net Value ({tenderCurrency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Leave blank if unannounced"
                        value={estimatedValue}
                        onChange={(e) => setEstimatedValue(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg font-mono font-bold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] placeholder:font-normal placeholder:text-[#94A3B8]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                        Rate vs BDT (At that time) *
                      </label>
                      <input
                        type="number"
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
                          <option value="">-- Select Tender Type --</option>
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

                    {/* Originating EOI Selector (Rendered when RFP mode is active) */}
                    {tenderType === 'Request for Proposals (RFP)' && (
                      <div className="sm:col-span-2 p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-[#1E40AF] flex items-center gap-1.5">
                            <span>🔗 Originating EOI (Optional — 2-Stage Procurement Flow)</span>
                          </label>
                          <span className="text-[10px] font-semibold text-[#2563EB] bg-blue-100/80 px-2 py-0.5 rounded">
                            {parentEoiId ? 'EOI-Linked RFP' : 'Direct RFP Modality'}
                          </span>
                        </div>
                        <select
                          value={parentEoiId}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            setParentEoiId(selectedId);
                            if (selectedId) {
                              const eoi = tenders.find((t) => t.id === selectedId);
                              if (eoi) {
                                if (!tenderTitle || tenderTitle.startsWith('Request for Proposals (RFP)')) {
                                  setTenderTitle(`Request for Proposals (RFP) for ${eoi.title.replace(/^EOI\s*[-–:]\s*/i, '')}`);
                                }
                                if (eoi.organization) setClient(eoi.organization);
                                if (eoi.country) setCountry(eoi.country);
                                if (eoi.category) setCategory(eoi.category);
                                if (eoi.budgetType) setBudgetType(eoi.budgetType);
                                if (eoi.sourceOfFund) setSourceOfFund(eoi.sourceOfFund);
                                if (eoi.procurementManagerName) setProcurementManagerName(eoi.procurementManagerName);
                                if (eoi.procurementManagerDesignation) setProcurementManagerDesignation(eoi.procurementManagerDesignation);
                                if (eoi.procurementManagerEmail) setProcurementManagerEmail(eoi.procurementManagerEmail);
                                if (eoi.procurementManagerPhone) setProcurementManagerPhone(eoi.procurementManagerPhone);
                              }
                            }
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                        >
                          <option value="">-- Direct RFP (Open Tender / No EOI Required) --</option>
                          {eligibleParentEois.map((eoi) => (
                            <option key={eoi.id} value={eoi.id}>
                              [Shortlisted EOI] {eoi.id} — {eoi.title} ({eoi.organization})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-[#3B82F6]">
                          {parentEoiId
                            ? `Linked to Parent EOI #${parentEoiId}. Organization, country, and statutory references are synchronized.`
                            : 'Direct RFP: Organizations can publish RFPs directly without any prior EOI stage required.'}
                        </p>
                      </div>
                    )}

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
                          <option value="">-- Select Budget Type --</option>
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
                          <option value="">-- Select Source of Fund --</option>
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
                          <option value="">-- Select Procurement Method --</option>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0F172A] dark:text-slate-200 mb-1">
                      Lifecycle Stage / Status
                    </label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as TenderStage)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100 text-xs font-semibold focus:ring-1 focus:ring-[#2563EB]"
                    >
                      {STAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] dark:text-slate-200 mb-1">
                      Operational Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value as TenderPriority)
                      }
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100 text-xs font-semibold focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="CRITICAL">
                        CRITICAL (Window &lt; 48h / Urgent Gate)
                      </option>
                      <option value="HIGH">HIGH Priority</option>
                      <option value="MEDIUM">MEDIUM Priority</option>
                      <option value="LOW">LOW Priority</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SCOPE & COMMERCIAL */}
            {activeEditorTab === 'SCOPE' && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">
                    Main Idea &amp; Scope Objectives
                  </label>
                  <textarea
                    rows={3}
                    value={mainIdea}
                    onChange={(e) => setMainIdea(e.target.value)}
                    className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                  />
                </div>

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
                        <option value="">-- Select Payment Method --</option>
                        <option value="ONLINE_EGP">Online e-GP Payment Gateway</option>
                        <option value="PAY_ORDER">Pay Order / Demand Draft</option>
                        <option value="BANK_DEPOSIT">Direct Bank Deposit / Transfer</option>
                        <option value="TREASURY_CHALLAN">Treasury Challan (Sonali Bank)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tender Security Deposit & Smart 2.5% Reverse Budget Calculator */}
                <div className="p-4 bg-gradient-to-br from-[#EFF6FF]/60 to-[#F8FAFC] dark:from-slate-800/60 dark:to-slate-900 rounded-xl border border-[#BFDBFE] dark:border-slate-700 space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-[#BFDBFE] dark:border-slate-700 pb-2.5 gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                      <span className="text-xs font-bold text-[#0F172A] dark:text-slate-100 uppercase tracking-wider">
                        Tender Security / Earnest Money Deposit (EMD)
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold bg-[#DBEAFE] dark:bg-blue-900/40 text-[#1D4ED8] dark:text-blue-300 px-2 py-0.5 rounded-full">
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
                        placeholder="e.g. 355000"
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
                        <option value="">-- Select Security Method --</option>
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
                      In many public tenders, procuring entities state the exact <strong>Security Deposit</strong> amount but keep the total budget unstated. 
                      Since tender security is typically set at <strong>{securityPercent}%</strong>, you can instantly estimate the official procurement budget from the security deposit, or vice versa.
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
                            : 'Enter estimated budget below'}
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

                {/* Contract, Maintenance & Performance Security */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Execution / Contract Period
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 180 Days / 6 Months"
                      value={possiblePeriod || contractPeriod}
                      onChange={(e) => {
                        setPossiblePeriod(e.target.value);
                        setContractPeriod(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Support &amp; Maintenance Period
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 36 Months 24/7 SLA & Warranty"
                      value={maintenancePeriod}
                      onChange={(e) => setMaintenancePeriod(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Performance Security
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10% of Contract Value"
                      value={performanceSecurity}
                      onChange={(e) => setPerformanceSecurity(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-[#475569] mb-1">
                      Estimated Net Value ({tenderCurrency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Leave blank if not specified / entry"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono font-bold text-[#0F172A] placeholder:text-[#94A3B8]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#0F172A]">
                      Technical Requirements
                    </label>
                    <button
                      type="button"
                      onClick={() => setTechnicalReqs([...technicalReqs, ''])}
                      className="text-[#2563EB] font-semibold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add line</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {technicalReqs.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => {
                            const updated = [...technicalReqs];
                            updated[idx] = e.target.value;
                            setTechnicalReqs(updated);
                          }}
                          className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setTechnicalReqs(
                              technicalReqs.filter((_, i) => i !== idx)
                            )
                          }
                          className="p-1 text-[#94A3B8] hover:text-[#DC2626]"
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
            {activeEditorTab === 'FINANCIAL' && (
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
            {activeEditorTab === 'ELIGIBILITY' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      General Experience
                    </label>
                    <input
                      type="text"
                      value={generalExperience}
                      onChange={(e) => setGeneralExperience(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Similar Experience
                    </label>
                    <input
                      type="text"
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
                      value={certification}
                      onChange={(e) => setCertification(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">
                    Local Presence Requirements
                  </label>
                  <input
                    type="text"
                    value={localPresence}
                    onChange={(e) => setLocalPresence(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: STAFFING & HARDWARE */}
            {activeEditorTab === 'STAFFING' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Submission Documents Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#0F172A]">
                      Documents Required in Submission
                    </label>
                    <button
                      type="button"
                      onClick={() => setDocuments([...documents, ''])}
                      className="text-[#2563EB] font-semibold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Document</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={doc}
                          onChange={(e) => {
                            const updated = [...documents];
                            updated[idx] = e.target.value;
                            setDocuments(updated);
                          }}
                          className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDocuments(documents.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-[#94A3B8] hover:text-[#DC2626]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personnel Table */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#0F172A]">
                      CV &amp; Key Personnel Requirements
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setPersonnel([
                          ...personnel,
                          {
                            position: '',
                            qualification: '',
                            experience: '',
                            qty: '1',
                          },
                        ])
                      }
                      className="text-[#2563EB] font-semibold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Position</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] text-[#64748B]">
                        <tr>
                          <th className="p-2">Position Title</th>
                          <th className="p-2">Min. Qualification</th>
                          <th className="p-2">Experience</th>
                          <th className="p-2 w-14 text-center">Qty</th>
                          <th className="p-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {personnel.map((p, idx) => (
                          <tr key={idx}>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={p.position}
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
                                onChange={(e) => {
                                  const updated = [...personnel];
                                  updated[idx].experience = e.target.value;
                                  setPersonnel(updated);
                                }}
                                className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs"
                              />
                            </td>
                            <td className="p-1.5 text-center font-mono">
                              <input
                                type="text"
                                value={p.qty}
                                onChange={(e) => {
                                  const updated = [...personnel];
                                  updated[idx].qty = e.target.value;
                                  setPersonnel(updated);
                                }}
                                className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs text-center"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setPersonnel(
                                    personnel.filter((_, i) => i !== idx)
                                  )
                                }
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

            {/* TAB 5: DATES & RISKS */}
            {activeEditorTab === 'RISKS' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Comprehensive Procurement & Project Milestones Schedule (Req #20) */}
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
                        placeholder="e.g. 180 Days / 6 Months"
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
                        Support and Maintenance / Warranty Period *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 36 Months 24/7 SLA &amp; Comprehensive Warranty (O&amp;M)"
                        value={maintenancePeriod}
                        onChange={(e) => setMaintenancePeriod(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#0F172A]">
                      Key Risks / Important Points
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setRisks([
                          ...risks,
                          { type: 'Tender Requirement', text: '' },
                        ])
                      }
                      className="text-[#2563EB] font-semibold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Risk Point</span>
                    </button>
                  </div>
                  <div className="space-y-2">
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
                          <option value="Tender Requirement">
                            Tender Requirement
                          </option>
                          <option value="Analyst Observation">
                            Analyst Observation
                          </option>
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
                          onClick={() =>
                            setRisks(risks.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-[#94A3B8] hover:text-[#DC2626]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">
                    Internal Remarks &amp; Debrief Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                  />
                </div>
              </div>
            )}

            {/* TAB 6: IMPORTANT CLAUSES & CITATIONS */}
            {activeEditorTab === 'CLAUSES' && (
              <div className="space-y-4 animate-fadeIn">
                <ImportantClausesManager
                  clauses={importantClauses}
                  onChange={setImportantClauses}
                  tenderDocuments={selectedTender?.documents}
                />
              </div>
            )}

            {/* Bottom Save & Action Row */}
            <div className="pt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                <span>Status:</span>
                <span className={`font-bold px-2.5 py-1 rounded-md text-xs border transition-colors ${
                  stage === 'AWARDED'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : stage === 'LOST' || stage === 'DECLINED'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : stage === 'SUBMITTED'
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : stage === 'PREPARATION'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : stage === 'UNDER_ANALYSIS'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : stage === 'SCREENING'
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}>
                  {stage || selectedTender?.stage || 'DISCOVERED'}
                </span>
                <span>•</span>
                <span>Priority:</span>
                <span className={`font-bold px-2.5 py-1 rounded-md text-xs border transition-colors ${
                  priority === 'CRITICAL'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : priority === 'HIGH'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : priority === 'LOW'
                    ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}>
                  {priority || 'MEDIUM'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-semibold shadow-sm transition-colors text-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
    </div>
  );
};

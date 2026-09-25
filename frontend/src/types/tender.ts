export type TenderStage =
  | 'DISCOVERED'
  | 'SCREENING'
  | 'UNDER_ANALYSIS'
  | 'PREPARATION'
  | 'INTERNAL_REVIEW'
  | 'SUBMITTED'
  | 'AWARDED'
  | 'LOST'
  | 'DECLINED'
  | 'ARCHIVED';

export type DecisionStatus = 'PENDING' | 'GO' | 'NO_GO' | 'CONDITIONAL';

export type TenderPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface TenderTask {
  id: string;
  title: string;
  assignee: string;
  priority: TenderPriority;
  deadline: string;
  status: TaskStatus;
}

export type RequirementStatus = 'VERIFIED' | 'PENDING' | 'BLOCKER';

export interface TenderRequirement {
  id: string;
  title: string;
  category: string;
  status: RequirementStatus;
  evidenceFile?: string;
  owner: string;
}

export type DocumentAccessLevel =
  | 'ALL_TEAM'
  | 'MANAGEMENT_ONLY'
  | 'RESTRICTED_FINANCE'
  | 'EXECUTIVE_ONLY';

export interface ReusableDocument {
  id: string;
  name: string;
  category: string;
  companyName?: string;
  companyRole?: string;
  isJvPartner?: boolean;
  uploadedAt: string;
  expiryDate?: string;
  size: string;
  revision: string;
  accessLevel: DocumentAccessLevel;
  sha256: string;
  description?: string;
  filePath?: string;
  mimeType?: string;
  previewUrl?: string;
  downloadUrl?: string;
}

export interface TenderDocument {
  id: string;
  name: string;
  folder: string; // e.g. 01_original_tender_documents
  companyName?: string;
  companyRole?: string;
  isJvPartner?: boolean;
  revision: string;
  sha256: string;
  uploadedAt: string;
  size: string;
  isReusableLink?: boolean;
  reusableSourceId?: string;
  accessLevel?: DocumentAccessLevel;
  status?: 'CLEARED' | 'ACTION_REQUIRED' | 'PENDING_REVIEW' | 'VERIFIED' | string;
  actionComment?: string;
  requestedBy?: string;
  actionDueDate?: string;
  filePath?: string;
  mimeType?: string;
  previewUrl?: string;
  downloadUrl?: string;
}

export interface TenderFolder {
  name: string;
  label: string;
}

export type ReviewTierStatus = 'APPROVED' | 'ACTION_REQUIRED' | 'WAITING';

export interface TenderReviewTier {
  tierNumber: number;
  name: string;
  reviewer: string;
  status: ReviewTierStatus;
  date?: string;
  comments: string;
}

export interface TenderDecisionMatrix {
  technical: number;
  financial: number;
  team: number;
  sla: number;
  aggregateScore: number;
  rationale: string;
  decidedAt?: string;
}

export interface SubmissionProof {
  portalReference: string;
  timestamp?: string;
  sha256ProofReceipt?: string;
  submittedBy?: string;
  status?: 'PENDING' | 'SUBMITTED_LOCKED';
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'BUSINESS_HEAD'
  | 'EXECUTIVE_MANAGER'
  | 'SENIOR_MANAGER'
  | 'TENDER_ANALYST';

export const isSuperAdminRole = (role?: string): boolean => {
  if (!role) return false;
  return role === 'SUPER_ADMIN';
};

export interface PastProjectAssignment {
  id: string;
  projectName: string;
  client: string;
  role: string;
  duration: string;
  deploymentMonths?: number;
  keyDeliverables: string[];
  technologiesUsed: string[];
  coreResponsibilities: string;
}

export type EmploymentType = 'PERMANENT' | 'JV_PARTNER_STAFF' | 'EXTERNAL_CONSULTANT';

export interface EducationEntry {
  degree: string;
  institution: string;
  year?: string | number;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  avatar: string;
  profilePic?: string;
  department?: string;
  maxCapacity?: number;
  phone?: string;
  location?: string;
  employmentType?: EmploymentType;
  proposedDesignation?: string;
  pastAssignments?: PastProjectAssignment[];
  certifications?: string[];
  education?: EducationEntry[];
  activeTenderRoles?: Record<string, 'LEAD_MANAGER' | 'CORE_CONTRIBUTOR' | 'REVIEWER' | string>;
}

export interface TenderComment {
  id: string;
  tenderId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface DocumentShareLink {
  id: string;
  documentId: string;
  documentName: string;
  token: string;
  permission: 'VIEW_ONLY' | 'DOWNLOAD_ALLOWED';
  expiresAt: string;
  sharedWithEmail?: string;
  createdAt: string;
}

export type TenderClassification =
  | 'SOFTWARE / IT RELATED'
  | 'PARTIALLY SOFTWARE / IT RELATED'
  | 'NOT SOFTWARE / IT RELATED'
  | 'UNCLEAR';

export const STANDARD_TENDER_TYPES = [
  'Request for Proposals (RFP)',
  'Expression of Interest (EOI)',
  'Request for Quotation (RFQ)',
  'Open Tendering Process (OTP)',
  'Open Tendering Method (OTM)',
  'National Competitive Bidding (NCB)',
  'International Competitive Bidding (ICB)',
  'Limited Tendering Method (LTM)',
  'Direct Contracting / Single Source',
  'Framework Agreement / Call-off',
  'Pre-Qualification (PQ)',
  'Other / Custom Modality',
] as const;

export const STANDARD_BUDGET_TYPES = [
  'Development Budget (ADP / Capex)',
  'Revenue / Operational Budget (Opex)',
  'Own Funds / Corporate Budget',
  'Grant / Aid Budget',
  'Capital Budget',
] as const;

export const STANDARD_SOURCE_OF_FUNDS = [
  'Government of Bangladesh (GoB)',
  'World Bank (IDA / IBRD)',
  'Asian Development Bank (ADB)',
  'JICA (Japan International Cooperation Agency)',
  'UNDP / UN Agencies',
  'USAID',
  'EU (European Union)',
  'KFW / AFD / EIB',
  'Organization\'s Own Fund',
  'Private / Client Equity',
] as const;

export const STANDARD_PROCUREMENT_METHODS = [
  'Open Tendering Method (OTM)',
  'Single Stage One Envelope (SSOE)',
  'Single Stage Two Envelope (SSTE)',
  'Two Stage Tendering Method (TSTM)',
  'Direct Procurement Method (DPM)',
] as const;

export const STANDARD_EVALUATION_METHODS = [
  'Least Cost Selection (LCS)',
  'Quality & Cost Based Selection (QCBS)',
  'Quality Based Selection (QBS)',
  'Fixed Budget Selection (FBS)',
] as const;

export interface TimezoneOption {
  code: string;
  label: string;
  offset: string;
}

export const STANDARD_TIMEZONES: TimezoneOption[] = [
  // --- South Asia & Primary Hubs ---
  { code: 'BST', label: 'BST (UTC+06:00 - Bangladesh Standard)', offset: '+06:00' },
  { code: 'IST', label: 'IST (UTC+05:30 - India & Sri Lanka)', offset: '+05:30' },
  { code: 'PKT', label: 'PKT (UTC+05:00 - Pakistan Standard)', offset: '+05:00' },
  { code: 'NPT', label: 'NPT (UTC+05:45 - Nepal Time)', offset: '+05:45' },
  { code: 'BTT', label: 'BTT (UTC+06:00 - Bhutan Time)', offset: '+06:00' },
  { code: 'MMT', label: 'MMT (UTC+06:30 - Myanmar Time)', offset: '+06:30' },
  { code: 'MVT', label: 'MVT (UTC+05:00 - Maldives Time)', offset: '+05:00' },

  // --- Universal & Western Europe ---
  { code: 'UTC', label: 'UTC (UTC+00:00 - Coordinated Universal)', offset: '+00:00' },
  { code: 'GMT', label: 'GMT (UTC+00:00 - Greenwich Mean Time / London)', offset: '+00:00' },
  { code: 'WEST', label: 'WEST (UTC+01:00 - Western European Summer / UK BST)', offset: '+01:00' },
  { code: 'CET', label: 'CET (UTC+01:00 - Central European / Paris / Berlin)', offset: '+01:00' },
  { code: 'CEST', label: 'CEST (UTC+02:00 - Central European Summer)', offset: '+02:00' },
  { code: 'EET', label: 'EET (UTC+02:00 - Eastern European / Cairo / Athens)', offset: '+02:00' },
  { code: 'EEST', label: 'EEST (UTC+03:00 - Eastern European Summer)', offset: '+03:00' },
  { code: 'MSK', label: 'MSK (UTC+03:00 - Moscow Standard)', offset: '+03:00' },

  // --- Middle East & Central Asia ---
  { code: 'AST', label: 'AST (UTC+03:00 - Arabia Standard / Riyadh / Doha)', offset: '+03:00' },
  { code: 'IRST', label: 'IRST (UTC+03:30 - Iran Standard / Tehran)', offset: '+03:30' },
  { code: 'GST', label: 'GST (UTC+04:00 - Gulf Standard / Dubai / Abu Dhabi)', offset: '+04:00' },
  { code: 'AFT', label: 'AFT (UTC+04:30 - Afghanistan Time / Kabul)', offset: '+04:30' },
  { code: 'UZT', label: 'UZT (UTC+05:00 - Uzbekistan / Tashkent)', offset: '+05:00' },
  { code: 'ALMT', label: 'ALMT (UTC+05:00 - Kazakhstan / Almaty)', offset: '+05:00' },

  // --- Africa (Key for UN, AfDB, World Bank tenders) ---
  { code: 'WAT', label: 'WAT (UTC+01:00 - West Africa / Nigeria / Lagos)', offset: '+01:00' },
  { code: 'CAT', label: 'CAT (UTC+02:00 - Central Africa / South Africa / Harare)', offset: '+02:00' },
  { code: 'EAT', label: 'EAT (UTC+03:00 - East Africa / Kenya / Nairobi)', offset: '+03:00' },

  // --- Southeast & East Asia ---
  { code: 'ICT', label: 'ICT (UTC+07:00 - Indochina / Bangkok / Jakarta / Hanoi)', offset: '+07:00' },
  { code: 'SGT', label: 'SGT (UTC+08:00 - Singapore Standard)', offset: '+08:00' },
  { code: 'MYT', label: 'MYT (UTC+08:00 - Malaysia / Kuala Lumpur)', offset: '+08:00' },
  { code: 'PHT', label: 'PHT (UTC+08:00 - Philippines / Manila)', offset: '+08:00' },
  { code: 'HKT', label: 'HKT (UTC+08:00 - Hong Kong Time)', offset: '+08:00' },
  { code: 'CST_CN', label: 'CST (UTC+08:00 - China Standard / Beijing)', offset: '+08:00' },
  { code: 'JST', label: 'JST (UTC+09:00 - Japan Standard / Tokyo)', offset: '+09:00' },
  { code: 'KST', label: 'KST (UTC+09:00 - Korea Standard / Seoul)', offset: '+09:00' },

  // --- Oceania & Pacific ---
  { code: 'AWST', label: 'AWST (UTC+08:00 - Australian Western / Perth)', offset: '+08:00' },
  { code: 'ACST', label: 'ACST (UTC+09:30 - Australian Central / Darwin)', offset: '+09:30' },
  { code: 'AEST', label: 'AEST (UTC+10:00 - Australian Eastern / Sydney)', offset: '+10:00' },
  { code: 'AEDT', label: 'AEDT (UTC+11:00 - Australian Eastern Daylight)', offset: '+11:00' },
  { code: 'NZST', label: 'NZST (UTC+12:00 - New Zealand / Wellington)', offset: '+12:00' },
  { code: 'NZDT', label: 'NZDT (UTC+13:00 - New Zealand Daylight)', offset: '+13:00' },
  { code: 'FJT', label: 'FJT (UTC+12:00 - Fiji Time / Suva)', offset: '+12:00' },

  // --- Americas (North, Central, South) ---
  { code: 'EST', label: 'EST (UTC-05:00 - US Eastern / New York / DC)', offset: '-05:00' },
  { code: 'EDT', label: 'EDT (UTC-04:00 - US Eastern Daylight)', offset: '-04:00' },
  { code: 'CST', label: 'CST (UTC-06:00 - US Central / Chicago)', offset: '-06:00' },
  { code: 'CDT', label: 'CDT (UTC-05:00 - US Central Daylight)', offset: '-05:00' },
  { code: 'MST', label: 'MST (UTC-07:00 - US Mountain / Denver)', offset: '-07:00' },
  { code: 'MDT', label: 'MDT (UTC-06:00 - US Mountain Daylight)', offset: '-06:00' },
  { code: 'PST', label: 'PST (UTC-08:00 - US Pacific / Los Angeles)', offset: '-08:00' },
  { code: 'PDT', label: 'PDT (UTC-07:00 - US Pacific Daylight)', offset: '-07:00' },
  { code: 'AKST', label: 'AKST (UTC-09:00 - Alaska Standard)', offset: '-09:00' },
  { code: 'HST', label: 'HST (UTC-10:00 - Hawaii Standard)', offset: '-10:00' },
  { code: 'AST_CA', label: 'AST (UTC-04:00 - Atlantic Standard / Halifax)', offset: '-04:00' },
  { code: 'COT', label: 'COT (UTC-05:00 - Colombia / Bogotá)', offset: '-05:00' },
  { code: 'PET', label: 'PET (UTC-05:00 - Peru / Lima)', offset: '-05:00' },
  { code: 'CLT', label: 'CLT (UTC-04:00 - Chile / Santiago)', offset: '-04:00' },
  { code: 'BRT', label: 'BRT (UTC-03:00 - Brazil / São Paulo)', offset: '-03:00' },
  { code: 'ART', label: 'ART (UTC-03:00 - Argentina / Buenos Aires)', offset: '-03:00' },
];

export const STANDARD_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
export const STANDARD_MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export interface TenderPersonnelReq {
  position: string;
  qualification: string;
  experience: string;
  qty: string;
}

export interface TenderHardwareReq {
  equipment: string;
  purpose: string;
}

export interface TenderRiskPoint {
  type: 'Tender Requirement' | 'Analyst Observation';
  text: string;
}

export interface TenderExtendedSummary {
  classification?: TenderClassification;
  projectName?: string;
  tenderIdDisplay?: string;
  shortTitle?: string;
  portal?: string;
  publishedDate?: string;
  publishedHour?: string;
  publishedMinute?: string;
  publishedTimezone?: string;
  submissionTime?: string;
  closeHour?: string;
  closeMinute?: string;
  closeTimezone?: string;
  mainIdea?: string;
  commercial?: {
    tenderSecurity?: string;
    tenderSecurityAmount?: number;
    tenderSecurityMethod?: string;
    contractPeriod?: string;
    tenderDocPrice?: string;
    schedulePurchaseDeadline?: string;
    schedulePurchaseMethod?: string;
    performanceSecurity?: string;
    maintenancePeriod?: string;
  };
  technicalReqs?: string[];
  technologyMentioned?: string[];
  operationalReqs?: string[];
  eligibility?: {
    generalExperience?: string;
    similarExperience?: string;
    similarProjectValue?: string;
    avgTurnover?: string;
    financialResources?: string;
    certification?: string;
    localPresence?: string;
  };
  jv?: {
    participation?: string;
    leadMember?: string;
    memberRules?: string;
    localPartner?: string;
    jvAgreement?: string;
  };
  submissionDocuments?: string[];
  personnel?: TenderPersonnelReq[];
  hardware?: TenderHardwareReq[];
  dates?: {
    clarificationDeadline?: string;
    submissionDeadline?: string;
    schedulePurchaseDeadline?: string;
    openingDate?: string;
    contractSigningDate?: string;
    workStartDate?: string;
    contractStart?: string;
    possiblePeriod?: string;
    productHandoverDate?: string;
    maintenancePeriod?: string;
  };
  risks?: TenderRiskPoint[];
  managementHighlights?: string[];
  notes?: string;
  procurementManager?: {
    name?: string;
    designation?: string;
    email?: string;
    phone?: string;
    officeAddress?: string;
  };
  helpline?: {
    phone?: string;
    email?: string;
    hours?: string;
    notes?: string;
  };
  tenderType?: string;
  budgetType?: string;
  sourceOfFund?: string;
  procurementMethod?: string;
  evaluationMethod?: string;
  postAward?: PostAwardData;
  financialModel?: TenderFinancialModel;
  aiChatShareLink?: string;
}

export interface PostAwardData {
  noaDate?: string;
  noaReference?: string;
  performanceSecurityAmount?: number;
  performanceSecurityDueDate?: string;
  performanceSecurityStatus?: 'PENDING' | 'DEPOSITED' | 'RELEASED';
  contractSigningStatus?: 'SCHEDULED' | 'SIGNED';
  contractSigningDate?: string;
  workOrderReference?: string;
  workStartDate?: string;
  handoverStatus?: 'PENDING' | 'UAT_IN_PROGRESS' | 'HANDED_OVER';
  productHandoverDate?: string;
  warrantyEndDate?: string;
  maintenancePeriod?: string;
}

export interface Tender {
  id: string;
  referenceNo: string;
  title: string;
  organization: string;
  country: string;
  category: string;
  estimatedValue: number;
  currency?: string;
  exchangeRateToBdt?: number;
  exchangeRateDate?: string;
  estimatedValueBdt?: number;
  procurementManagerName?: string;
  procurementManagerDesignation?: string;
  procurementManagerEmail?: string;
  procurementManagerPhone?: string;
  helplinePhone?: string;
  helplineEmail?: string;
  helplineHours?: string;
  // Procurement Governance & Sourcing (Req #21)
  tenderType?: string;
  budgetType?: string;
  sourceOfFund?: string;
  procurementMethod?: string;
  evaluationMethod?: string;
  portalUrl?: string;
  preBidMeetingDate?: string;
  organizationType?: string;
  scope?: string;
  tags?: string[];
  outcomeNotes?: string;
  // 2-Stage Procurement Lineage (EOI -> RFP) & Shortlisting
  parentEoiId?: string;
  spawnedRfpId?: string;
  eoiShortlistStatus?: 'PENDING' | 'SHORTLISTED' | 'NOT_SHORTLISTED' | string;
  // Milestone Schedule (Req #20)
  openingDate?: string;
  contractSigningDate?: string;
  workStartDate?: string;
  possiblePeriod?: string;
  productHandoverDate?: string;
  maintenancePeriod?: string;
  // Commercial Schedule & Security Deposit
  schedulePurchaseDeadline?: string;
  schedulePurchaseMethod?: string;
  tenderDocPrice?: string;
  tenderSecurityAmount?: number;
  tenderSecurityMethod?: string;
  postAward?: PostAwardData;
  financialModel?: TenderFinancialModel;
  stage: TenderStage;
  decision: DecisionStatus;
  priority: TenderPriority;
  publishedDate?: string;
  publishedHour?: string;
  publishedMinute?: string;
  publishedTimezone?: string;
  submissionDeadline: string;
  closeHour?: string;
  closeMinute?: string;
  closeTimezone?: string;
  daysRemaining: number;
  hoursRemaining: number;
  readinessScore: number;
  missingDocumentsCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  leadOwner: {
    name: string;
    avatarUrl?: string;
    role: string;
  };
  scannerConfidence?: number;
  blockers: string[];
  tasks: TenderTask[];
  requirements: TenderRequirement[];
  documents: TenderDocument[];
  reviews: TenderReviewTier[];
  decisionMatrix?: TenderDecisionMatrix;
  submissionProof?: SubmissionProof;
  summary?: TenderExtendedSummary;
  comments?: TenderComment[];
  customFolders?: TenderFolder[];
  deletedFolders?: string[];
  folderLabels?: Record<string, string>;
  archivedFromStage?: TenderStage;
  archivedAt?: string;
  importantClauses?: ImportantClause[];
  aiChatShareLink?: string;
}

export type ClauseCriticality = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export type ClauseCategory =
  | 'FINANCIAL'
  | 'LEGAL_RISK'
  | 'TECHNICAL_MANDATORY'
  | 'ELIGIBILITY'
  | 'PENALTY'
  | 'OTHER';

export interface ImportantClause {
  id: string;
  clause_title: string;
  category: ClauseCategory | string;
  criticality: ClauseCriticality | string;
  doc_reference: string;
  doc_file_name?: string;
  page_number?: string;
  clause_text: string;
  implication?: string;
}

export interface PipelineSummary {
  totalPipelineValue: number;
  activeTendersCount: number;
  dueThisWeekCount: number;
  missingDocumentsTotal: number;
  averageReadiness: number;
  winRatePercent: number;
}

export interface TenderCategory {
  id: number;
  name: string;
  description?: string;
  color_badge?: string;
  created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  shortName?: string;
  type: string;
  parentId?: string | null;
  country: string;
  website?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  aliases?: string[];
  description?: string;
  createdAt?: string;
}

export interface CustomCredentialField {
  id: string;
  name: string;
  value: string;
}

export interface CompanyProjectCredential {
  id: string;
  companyName: string;
  companyRole: 'LEAD_BIDDER' | 'JV_PARTNER' | 'SUBCONTRACTOR' | string;
  projectTitle: string;
  clientName: string;
  contractValue: number;
  currency: string;
  startDate?: string;
  completionDate?: string;
  roleInProject: string;
  workOrderFilename?: string;
  workOrderPath?: string;
  workOrderSha256?: string;
  workOrderSize?: string;
  completionCertFilename?: string;
  completionCertPath?: string;
  completionCertSha256?: string;
  completionCertSize?: string;
  customFields: CustomCredentialField[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomCompanyField {
  id: string;
  name: string;
  value: string;
}

export interface CompanyProfile {
  id: string;
  legal_name: string;
  trade_name: string;
  company_role: 'LEAD_BIDDER' | 'JV_PARTNER' | 'SUBCONTRACTOR' | string;
  entity_type: string;
  registration_no?: string;
  incorporation_date?: string;
  country: string;
  status: 'ACTIVE' | 'VERIFIED' | 'INACTIVE' | string;
  business_nature?: string;
  logo_url?: string;

  // Statutory & Tax
  tin_number?: string;
  bin_vat_number?: string;
  trade_license_no?: string;
  trade_license_expiry?: string;
  trade_license_issuer?: string;
  tax_circle_zone?: string;
  rjsc_return_year?: string;
  irc_erc_no?: string;

  // Office & Contacts
  registered_address?: string;
  operational_address?: string;
  official_email?: string;
  billing_email?: string;
  phone?: string;
  fax?: string;
  website?: string;

  contact_person_name?: string;
  contact_person_title?: string;
  contact_person_phone?: string;
  contact_person_email?: string;
  signatory_name?: string;
  signatory_title?: string;
  signatory_nid?: string;
  power_of_attorney_ref?: string;

  // Banking & Financials
  bank_name?: string;
  bank_branch?: string;
  bank_account_name?: string;
  bank_account_no?: string;
  routing_no?: string;
  swift_code?: string;
  audited_turnover_bdt: number;
  audited_turnover_usd: number;
  bank_solvency_limit_bdt: number;
  paid_up_capital_bdt: number;
  authorized_capital_bdt: number;
  credit_rating?: string;
  credit_rating_validity?: string;

  // Certifications & Capacity
  certifications?: string[];
  core_competencies?: string[];
  total_employees: number;
  certified_engineers: number;

  // Dynamic Custom Fields
  custom_fields: CustomCompanyField[];
  created_at?: string;
  updated_at?: string;
}

// --- Tender Financial Scenarios & Rules Specification Types ---

export type PaymentScenarioType =
  | 'MILESTONE_BASED'
  | 'ADVANCE_AND_MILESTONES'
  | 'ACCEPTANCE_BASED'
  | 'LUMP_SUM_FINAL';

export interface MilestonePaymentItem {
  id?: string;
  milestoneNumber: number;
  name: string;
  percentage: number;
  amount: number;
  deliverable: string;
  approvalRequired: boolean;
  clientReviewDays: number;
  paymentProcessingDays: number;
  paymentTrigger: string;
  invoiceRequirements?: string;
}

export interface AdvancePaymentConfig {
  enabled: boolean;
  percentage: number;
  amount: number;
  bankGuaranteeRequired: boolean;
  bankGuaranteeType?: string;
  recoveryType: 'PRO_RATA_INVOICE' | 'INTERIM_CERTIFICATES' | 'BALLOON_RECOVERY';
  recoveryPercentagePerInvoice: number;
  recoveryStartMilestone?: number;
}

export interface SubscriptionEscalationTier {
  year: number;
  amount: number;
  rateIncreasePercent: number;
}

export interface SubscriptionModelConfig {
  pricingModel: 'FIXED_RECURRING' | 'MULTI_YEAR_ESCALATION' | 'PER_USER_LICENSE' | 'HYBRID_TIERED';
  billingFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  annualBaseFee: number;
  durationYears: number;
  annualEscalationRate: number;
  userCount?: number;
  feePerUserMonthly?: number;
  calculatedTcv: number;
  calculatedAcv: number;
  escalationTiers?: SubscriptionEscalationTier[];
}

export interface LiquidatedDamagesConfig {
  enabled: boolean;
  rate: number;
  frequency: 'PER_DAY' | 'PER_WEEK';
  calculationBasis: 'DELAYED_MILESTONE_VALUE' | 'TOTAL_CONTRACT_VALUE';
  maxCapPercentage: number;
  gracePeriodDays?: number;
}

export interface RetentionMoneyConfig {
  enabled: boolean;
  percentage: number;
  releaseCondition: 'DLP_EXPIRY' | 'FINAL_ACCEPTANCE_50_DLP_50' | 'BG_SUBSTITUTION';
  dlpMonths: number;
  interimReleasePercent?: number;
}

export interface PenaltiesAndDeductionsConfig {
  liquidatedDamages: LiquidatedDamagesConfig;
  retentionMoney: RetentionMoneyConfig;
  slaDeductionRate?: number;
  taxDeductionAtSourcePercent?: number;
  vatDeductionAtSourcePercent?: number;
}

export interface TenderFinancialModel {
  paymentScenario: PaymentScenarioType;
  workingCapitalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  advancePayment: AdvancePaymentConfig;
  milestones: MilestonePaymentItem[];
  subscriptionModel: SubscriptionModelConfig;
  penaltiesAndDeductions: PenaltiesAndDeductionsConfig;
}

export interface TenderFinancialRule {
  id?: string;
  tenderId: string;
  ruleCategory: string;
  ruleType?: string;
  financialValue?: number;
  currency?: string;
  percentage?: number;
  frequency?: string;
  paymentTrigger?: string;
  paymentDueDays?: number;
  penaltyRate?: number;
  penaltyFrequency?: string;
  maximumPenalty?: number;
  penaltyBasis?: string;
  retentionPercentage?: number;
  advancePercentage?: number;
  advanceRecoveryMethod?: string;
  subscriptionType?: string;
  subscriptionFrequency?: string;
  contractDuration?: string;
  priceEscalation?: string;
  taxRate?: number;
  vatRate?: number;
  paymentCurrency?: string;
  liabilityLimit?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  originalClause?: string;
  sourceDocument?: string;
  pageNumber?: string;
}



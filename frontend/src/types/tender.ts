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
  | 'BUSINESS_HEAD'
  | 'EXECUTIVE_MANAGER'
  | 'SENIOR_MANAGER'
  | 'TENDER_ANALYST';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  avatar: string;
  department?: string;
  maxCapacity?: number;
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
  submissionTime?: string;
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
  postAward?: PostAwardData;
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
  stage: TenderStage;
  decision: DecisionStatus;
  priority: TenderPriority;
  submissionDeadline: string;
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
  archivedFromStage?: TenderStage;
  archivedAt?: string;
  importantClauses?: ImportantClause[];
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


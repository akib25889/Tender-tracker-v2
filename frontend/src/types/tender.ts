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
  revision: string;
  sha256: string;
  uploadedAt: string;
  size: string;
  isReusableLink?: boolean;
  reusableSourceId?: string;
  accessLevel?: DocumentAccessLevel;
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
    contractPeriod?: string;
    tenderDocPrice?: string;
    performanceSecurity?: string;
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
    openingDate?: string;
    contractStart?: string;
  };
  risks?: TenderRiskPoint[];
  managementHighlights?: string[];
  notes?: string;
}

export interface Tender {
  id: string;
  referenceNo: string;
  title: string;
  organization: string;
  country: string;
  category: string;
  estimatedValue: number;
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

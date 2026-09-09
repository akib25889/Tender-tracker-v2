import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tender,
  TenderStage,
  DecisionStatus,
  TenderTask,
  TaskStatus,
  TenderDocument,
  TenderDecisionMatrix,
  TenderRequirement,
  RequirementStatus,
  TenderReviewTier,
  UserProfile,
  UserRole,
  TenderComment,
  DocumentShareLink,
  ReusableDocument,
  DocumentAccessLevel,
  TenderCategory,
  Organization,
  CompanyProjectCredential,
  CompanyProfile,
  PastProjectAssignment,
} from '../types/tender';
import { MOCK_TENDERS } from '../mock/tenders';
import { TEAM_PROFILES } from '../mock/users';
import { INITIAL_REUSABLE_DOCUMENTS } from '../mock/reusableDocuments';
import { INITIAL_ORGANIZATIONS } from '../mock/organizations';

export type CurrencyMode = 'USD' | 'BDT';

interface TenderContextType {
  tenders: Tender[];
  addTender: (tenderData: Partial<Tender>) => void;
  updateTender: (id: string, updates: Partial<Tender>) => void;
  deleteTender: (id: string) => void;
  deleteMultipleTenders: (ids: string[]) => void;
  updateTenderStage: (tenderId: string, stage: TenderStage) => void;
  archiveTender: (tenderId: string) => void;
  restoreTender: (tenderId: string) => void;
  setTenderDecision: (
    tenderId: string,
    decision: DecisionStatus,
    matrix: TenderDecisionMatrix
  ) => void;
  addTask: (tenderId: string, task: Omit<TenderTask, 'id'>) => void;
  moveTask: (tenderId: string, taskId: string, newStatus: TaskStatus) => void;
  addDocument: (
    tenderId: string,
    doc: {
      name: string;
      folder: string;
      size: string;
      companyName?: string;
      companyRole?: string;
      isJvPartner?: boolean;
    }
  ) => void;
  addFolder: (tenderId: string, folder: { name: string; label: string }) => void;
  deleteFolder: (tenderId: string, folderName: string) => void;
  moveDocumentFolder: (tenderId: string, docId: string, targetFolder: string) => void;
  requestDocumentReupload: (
    tenderId: string,
    docId: string,
    payload: { reason: string; comment: string; dueDate?: string; requestedBy?: string }
  ) => Promise<boolean>;
  requestNewDocumentUpload: (payload: {
    tenderId: string;
    title: string;
    folder: string;
    companyName: string;
    companyRole?: string;
    instructions: string;
    dueDate?: string;
    requestedBy?: string;
  }) => Promise<boolean>;
  resolveDocumentReupload: (
    tenderId: string,
    docId: string,
    file: File,
    comment?: string
  ) => Promise<boolean>;
  signOffReviewTier: (
    tenderId: string,
    tierNumber: number,
    comments: string
  ) => void;
  toggleRequirementStatus: (
    tenderId: string,
    reqId: string,
    newStatus: RequirementStatus
  ) => void;
  submitTenderProof: (tenderId: string, portalReference: string) => void;
  // RBAC
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  teamMembers: UserProfile[];
  addTeamMember: (member: {
    name: string;
    role: UserRole;
    title: string;
    email: string;
    dept?: string;
    maxCapacity?: number;
  }) => void;
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  addPastAssignment: (userId: string, assignment: PastProjectAssignment) => Promise<void>;
  deletePastAssignment: (userId: string, assignmentId: string) => Promise<void>;
  canPerformAction: (action: 'ADVANCE_STAGE' | 'SIGN_OFF_TIER_3' | 'DELETE_TENDER' | 'ASSIGN_TASK' | 'EDIT_TECHNICAL') => boolean;
  // Task assignment
  assignTask: (tenderId: string, taskId: string, newAssignee: string) => void;
  // Comments
  addComment: (tenderId: string, text: string) => void;
  deleteComment: (tenderId: string, commentId: string) => void;
  // Document Sharing
  shareDocument: (
    tenderId: string,
    docId: string,
    options: { permission: 'VIEW_ONLY' | 'DOWNLOAD_ALLOWED'; email?: string }
  ) => DocumentShareLink;
  sharedLinks: DocumentShareLink[];
  activeDocForShare: { tenderId: string; doc: TenderDocument } | null;
  setActiveDocForShare: (item: { tenderId: string; doc: TenderDocument } | null) => void;
  // Reusable Documents & Access Control
  reusableDocuments: ReusableDocument[];
  addReusableDocument: (doc: {
    name: string;
    category: string;
    size: string;
    companyName?: string;
    companyRole?: string;
    isJvPartner?: boolean;
    expiryDate?: string;
    accessLevel: DocumentAccessLevel;
    description?: string;
  }) => void;
  updateDocumentAccess: (docId: string, newAccess: DocumentAccessLevel) => void;
  updateTenderDocumentAccess: (tenderId: string, docId: string, newAccess: DocumentAccessLevel) => void;
  linkReusableDocumentToTender: (tenderId: string, reusableDocId: string, targetFolder: string) => void;
  hasDocumentAccess: (accessLevel?: DocumentAccessLevel, role?: UserRole) => boolean;
  // Currency switcher
  currency: CurrencyMode;
  setCurrency: (c: CurrencyMode) => void;
  formatCurrency: (amountInUSD: number) => string;
  // Category Management
  categories: TenderCategory[];
  addCategory: (categoryData: { name: string; description?: string; color_badge?: string }) => Promise<TenderCategory | null>;
  updateCategory: (id: number, updates: { name?: string; description?: string; color_badge?: string }) => Promise<TenderCategory | null>;
  deleteCategory: (id: number) => Promise<boolean>;
  refreshCategories: () => Promise<void>;
  // Organization Master Directory
  organizations: Organization[];
  addOrganization: (orgData: Omit<Organization, 'id'>) => Organization;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  // Company Project Experience Credentials (WO, CC, and Custom Fields)
  companyProjects: CompanyProjectCredential[];
  refreshCompanyProjects: () => Promise<void>;
  addCompanyProject: (projectData: Partial<CompanyProjectCredential>) => Promise<CompanyProjectCredential | null>;
  updateCompanyProject: (id: string, updates: Partial<CompanyProjectCredential>) => Promise<CompanyProjectCredential | null>;
  deleteCompanyProject: (id: string) => Promise<boolean>;
  uploadProjectWorkOrder: (projectId: string, file: File) => Promise<CompanyProjectCredential | null>;
  uploadProjectCompletionCert: (projectId: string, file: File) => Promise<CompanyProjectCredential | null>;
  linkProjectToTender: (projectId: string, tenderId: string, targetFolder: string) => Promise<{ status: string; message: string } | null>;
  // Company Profiles
  companyProfiles: CompanyProfile[];
  refreshCompanyProfiles: () => Promise<void>;
  addCompanyProfile: (profileData: Partial<CompanyProfile>) => Promise<CompanyProfile | null>;
  updateCompanyProfile: (id: string, updates: Partial<CompanyProfile>) => Promise<CompanyProfile | null>;
  deleteCompanyProfile: (id: string) => Promise<boolean>;
  // Modal states
  isNewTenderModalOpen: boolean;
  setIsNewTenderModalOpen: (open: boolean) => void;
  uploadFolderTarget: string | null;
  setUploadFolderTarget: (folder: string | null) => void;
  activeTenderIdForModal: string | null;
  setActiveTenderIdForModal: (id: string | null) => void;
  activeTierForSignOff: number | null;
  setActiveTierForSignOff: (tier: number | null) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
}

const TenderContext = createContext<TenderContextType | undefined>(undefined);

const STORAGE_KEY = 'tendertracker_pipeline_v2';
const CURRENCY_KEY = 'tendertracker_currency_v2';
const USD_TO_BDT = 122; // 1 USD ≈ 122 BDT

export const TenderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tenders, setTenders] = useState<Tender[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: Tender[] = JSON.parse(saved);
        const sanitized = parsed.map((t) => {
          if (t.referenceNo && (t.referenceNo === `REF/${t.id}` || t.referenceNo === t.id)) {
            return { ...t, referenceNo: '' };
          }
          return t;
        });
        const acriIndex = sanitized.findIndex((t) => t.id === 'TDR-PRC0190428');
        const acriMock = MOCK_TENDERS.find((t) => t.id === 'TDR-PRC0190428');
        if (acriMock) {
          if (acriIndex >= 0) {
            sanitized[acriIndex] = acriMock;
          } else {
            sanitized.unshift(acriMock);
          }
        }
        const seenIds = new Set<string>();
        const uniqueTenders: Tender[] = [];
        for (const item of sanitized) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueTenders.push(item);
          }
        }
        // Merge in any newly seeded mock tenders that do not exist in cache yet
        for (const mockItem of MOCK_TENDERS) {
          if (!seenIds.has(mockItem.id)) {
            seenIds.add(mockItem.id);
            uniqueTenders.push(mockItem);
          }
        }
        return uniqueTenders;
      } catch (e) {
        console.error('Failed to parse cached tenders:', e);
      }
    }
    return MOCK_TENDERS;
  });

  const [currency, setCurrencyState] = useState<CurrencyMode>(() => {
    const saved = localStorage.getItem(CURRENCY_KEY);
    return saved === 'BDT' ? 'BDT' : 'USD';
  });

  const setCurrency = (c: CurrencyMode) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_KEY, c);
  };

  const formatCurrency = (amountInUSD: number | undefined | null): string => {
    if (amountInUSD === undefined || amountInUSD === null || amountInUSD <= 0 || isNaN(amountInUSD)) {
      return '—';
    }
    if (currency === 'USD') {
      if (amountInUSD >= 1_000_000) {
        return `$${(amountInUSD / 1_000_000).toFixed(2)}M`;
      }
      return `$${amountInUSD.toLocaleString()}`;
    } else {
      const bdt = amountInUSD * USD_TO_BDT;
      if (bdt >= 10_000_000) {
        return `৳${(bdt / 10_000_000).toFixed(2)} Cr`;
      }
      if (bdt >= 100_000) {
        return `৳${(bdt / 100_000).toFixed(2)} Lakh`;
      }
      return `৳${Math.round(bdt).toLocaleString()}`;
    }
  };

  // Modal control states
  const [isNewTenderModalOpen, setIsNewTenderModalOpen] = useState(false);
  const [uploadFolderTarget, setUploadFolderTarget] = useState<string | null>(null);
  const [activeTenderIdForModal, setActiveTenderIdForModal] = useState<string | null>(null);
  const [activeTierForSignOff, setActiveTierForSignOff] = useState<number | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Category Management State
  const [categories, setCategories] = useState<TenderCategory[]>(() => {
    return [
      { id: 1, name: 'Software Development', description: 'Enterprise application development, modernization, web/mobile engineering, and custom software delivery.', color_badge: 'blue' },
      { id: 2, name: 'Cloud & Cyber Security', description: 'Cloud migration, FedRAMP/ISO 27001 architectures, perimeter security, and SOC operations.', color_badge: 'purple' },
      { id: 3, name: 'Healthcare & Medical Systems', description: 'Hospital management systems, medical device interfaces, PACS, and biomedical software solutions.', color_badge: 'emerald' },
      { id: 4, name: 'Infrastructure & Public Works', description: 'Civil infrastructure, datacenter physical deployments, fiber backbones, and municipal utilities.', color_badge: 'amber' },
      { id: 5, name: 'Defense & Strategic Technology', description: 'Mission-critical C4ISR defense solutions, encrypted tactical links, and aerospace integration.', color_badge: 'rose' },
      { id: 6, name: 'Energy & Utilities', description: 'Smart grid metering, renewable SCADA, power distribution automation, and ESG monitoring.', color_badge: 'teal' },
      { id: 7, name: 'Smart City & Transportation', description: 'Intelligent traffic management, automated fare collection, and IoT sensor telemetry.', color_badge: 'indigo' },
      { id: 8, name: 'Consulting & Advisory Services', description: 'Strategic advisory, regulatory compliance audits, and digital transformation roadmapping.', color_badge: 'cyan' },
    ];
  });

  const refreshCategories = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/categories');
      if (res.ok) {
        const data: TenderCategory[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      }
    } catch {
      // Backend unavailable, retain current state
    }
  };

  const refreshTendersFromBackend = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/tenders');
      if (res.ok) {
        const dbTenders = await res.json();
        if (Array.isArray(dbTenders) && dbTenders.length > 0) {
          setTenders((prev) => {
            const map = new Map(prev.map((t) => [t.id, t]));
            for (const dbt of dbTenders) {
              const existing = map.get(dbt.id);

              const dbTasks: TenderTask[] =
                Array.isArray(dbt.tasks) && dbt.tasks.length > 0
                  ? dbt.tasks.map((tk: any) => ({
                      id: tk.id,
                      title: tk.title,
                      assignee: tk.assignee,
                      priority: tk.priority || 'MEDIUM',
                      deadline: tk.due_date || 'Day 5',
                      status: tk.status || 'TODO',
                    }))
                  : existing
                  ? existing.tasks
                  : [];

              const dbReqs: TenderRequirement[] =
                Array.isArray(dbt.requirements) && dbt.requirements.length > 0
                  ? dbt.requirements.map((rq: any) => ({
                      id: rq.id,
                      title: rq.title,
                      category: rq.category || 'Statutory',
                      status: rq.status || 'PENDING',
                      owner: rq.owner || 'Tariq Al-Mansoor',
                    }))
                  : existing
                  ? existing.requirements
                  : [];

              const dbDocs: TenderDocument[] =
                Array.isArray(dbt.documents) && dbt.documents.length > 0
                  ? dbt.documents.map((doc: any) => ({
                      id: doc.id,
                      name: doc.name,
                      folder: doc.folder,
                      companyName: doc.company_name || 'PrimeTech Ltd',
                      companyRole: doc.company_role || 'LEAD_BIDDER',
                      isJvPartner: Boolean(doc.is_jv_partner),
                      size: doc.size,
                      revision: doc.revision || 'v1.0',
                      sha256: doc.sha256,
                      uploadedAt: doc.uploaded_at,
                      accessLevel: doc.access_level || 'ALL_TEAM',
                      isReusableLink: doc.is_reusable_link,
                      reusableSourceId: doc.reusable_source_id,
                      status: doc.status || 'CLEARED',
                      actionComment: doc.action_comment || undefined,
                      requestedBy: doc.requested_by || undefined,
                      actionDueDate: doc.action_due_date || undefined,
                    }))
                  : existing
                  ? existing.documents
                  : [];

              const dbReviews: TenderReviewTier[] =
                Array.isArray(dbt.reviews) && dbt.reviews.length > 0
                  ? dbt.reviews.map((rv: any) => ({
                      tierNumber: rv.tier_number,
                      name: rv.tier_name,
                      reviewer:
                        rv.signed_off_by ||
                        (rv.role_required === 'EXECUTIVE_MANAGER'
                          ? 'Dr. Marcus Vance'
                          : rv.role_required === 'SENIOR_MANAGER'
                          ? 'Tariq Al-Mansoor'
                          : rv.role_required === 'TENDER_ANALYST'
                          ? 'Elena Rostova'
                          : 'Sarah Jenkins'),
                      status: rv.sign_off_status as any,
                      date: rv.signed_off_at,
                      comments: rv.comments || '',
                    }))
                  : existing
                  ? existing.reviews
                  : [];

              const dbMatrix: TenderDecisionMatrix | undefined = dbt.decision_matrix
                ? ({
                    technical: dbt.decision_matrix.technical_score,
                    financial: dbt.decision_matrix.financial_score,
                    team: dbt.decision_matrix.team_score,
                    sla: dbt.decision_matrix.sla_score,
                    aggregateScore: dbt.decision_matrix.composite_score,
                    threshold: dbt.decision_matrix.threshold || 70,
                    rationale: dbt.decision_matrix.rationale || '',
                  } as any)
                : existing
                ? existing.decisionMatrix
                : undefined;

              let dbSummary = existing ? existing.summary : undefined;
              if (dbt.summary_json) {
                try {
                  dbSummary =
                    typeof dbt.summary_json === 'string'
                      ? JSON.parse(dbt.summary_json)
                      : dbt.summary_json;
                } catch {}
              }

              const completedTasks = dbTasks.filter((tk) => tk.status === 'DONE').length;
              const missingDocs = dbReqs.filter((rq) => rq.status !== 'VERIFIED').length;
              const blockers = dbReqs
                .filter((rq) => rq.status === 'BLOCKER')
                .map((rq) => rq.title);

              map.set(dbt.id, {
                id: dbt.id,
                referenceNo: dbt.reference_no || (existing ? existing.referenceNo : ''),
                title: dbt.title || (existing ? existing.title : 'Untitled Opportunity'),
                organization:
                  dbt.organization || (existing ? existing.organization : 'Procuring Authority'),
                country: dbt.country || (existing ? existing.country : 'Bangladesh'),
                category: dbt.category || (existing ? existing.category : 'General'),
                estimatedValue:
                  dbt.estimated_value !== undefined && dbt.estimated_value !== null
                    ? dbt.estimated_value
                    : existing
                    ? existing.estimatedValue
                    : 0,
                currency: dbt.currency || (existing ? existing.currency : 'USD'),
                exchangeRateToBdt:
                  dbt.exchange_rate_to_bdt !== undefined && dbt.exchange_rate_to_bdt !== null
                    ? dbt.exchange_rate_to_bdt
                    : existing
                    ? existing.exchangeRateToBdt
                    : 122.0,
                exchangeRateDate:
                  dbt.exchange_rate_date || (existing ? existing.exchangeRateDate : ''),
                estimatedValueBdt:
                  dbt.estimated_value_bdt !== undefined && dbt.estimated_value_bdt !== null
                    ? dbt.estimated_value_bdt
                    : existing
                    ? existing.estimatedValueBdt
                    : 0,
                procurementManagerName:
                  dbt.procurement_manager_name || (existing ? existing.procurementManagerName : ''),
                procurementManagerDesignation:
                  dbt.procurement_manager_designation || (existing ? existing.procurementManagerDesignation : ''),
                procurementManagerEmail:
                  dbt.procurement_manager_email || (existing ? existing.procurementManagerEmail : ''),
                procurementManagerPhone:
                  dbt.procurement_manager_phone || (existing ? existing.procurementManagerPhone : ''),
                helplinePhone:
                  dbt.helpline_phone || (existing ? existing.helplinePhone : ''),
                helplineEmail:
                  dbt.helpline_email || (existing ? existing.helplineEmail : ''),
                helplineHours:
                  dbt.helpline_hours || (existing ? existing.helplineHours : ''),
                stage: (dbt.stage as TenderStage) || (existing ? existing.stage : 'DISCOVERED'),
                decision:
                  (dbt.decision as DecisionStatus) || (existing ? existing.decision : 'PENDING'),
                priority: dbt.priority || (existing ? existing.priority : 'MEDIUM'),
                submissionDeadline:
                  dbt.submission_deadline || (existing ? existing.submissionDeadline : ''),
                daysRemaining:
                  dbt.days_remaining !== undefined
                    ? dbt.days_remaining
                    : existing
                    ? existing.daysRemaining
                    : 0,
                hoursRemaining:
                  dbt.hours_remaining !== undefined
                    ? dbt.hours_remaining
                    : existing
                    ? existing.hoursRemaining
                    : 0,
                readinessScore:
                  dbt.readiness_score !== undefined
                    ? dbt.readiness_score
                    : existing
                    ? existing.readinessScore
                    : 0,
                missingDocumentsCount: missingDocs,
                completedTasksCount: completedTasks,
                totalTasksCount: dbTasks.length,
                leadOwner: {
                  name:
                    dbt.lead_owner_name ||
                    (existing ? existing.leadOwner.name : 'Sarah Jenkins'),
                  role:
                    dbt.lead_owner_role ||
                    (existing ? existing.leadOwner.role : 'Business Head'),
                },
                blockers,
                tasks: dbTasks,
                requirements: dbReqs,
                documents: dbDocs,
                reviews: dbReviews,
                decisionMatrix: dbMatrix,
                summary: dbSummary
                  ? {
                      ...dbSummary,
                      procurementManager: dbSummary.procurementManager || {
                        name: dbt.procurement_manager_name || '',
                        designation: dbt.procurement_manager_designation || '',
                        email: dbt.procurement_manager_email || '',
                        phone: dbt.procurement_manager_phone || '',
                      },
                      helpline: dbSummary.helpline || {
                        phone: dbt.helpline_phone || '',
                        email: dbt.helpline_email || '',
                        hours: dbt.helpline_hours || '',
                      },
                    }
                  : dbSummary,
                tenderType: dbt.tender_type || existing?.tenderType,
                budgetType: dbt.budget_type || existing?.budgetType,
                sourceOfFund: dbt.source_of_fund || existing?.sourceOfFund,
                procurementMethod: dbt.procurement_method || existing?.procurementMethod,
                parentEoiId: dbt.parent_eoi_id || existing?.parentEoiId,
                spawnedRfpId: dbt.spawned_rfp_id || existing?.spawnedRfpId,
                eoiShortlistStatus: dbt.eoi_shortlist_status || existing?.eoiShortlistStatus,
                importantClauses: Array.isArray(dbt.important_clauses)
                  ? dbt.important_clauses
                  : existing?.importantClauses || [],
                postAward: dbt.post_award_data || existing?.postAward,
                financialModel: dbt.financial_model || existing?.financialModel,
              });
            }
            return Array.from(map.values());
          });
        }
      }
    } catch {
      // Backend unavailable, retain current state
    }
  };

  const refreshOrganizations = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/organizations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrganizations(data);
        }
      }
    } catch {}
  };

  const refreshTeamMembers = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/team');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTeamMembers(
            data.map((u: any) => ({
              id: u.id,
              name: u.name,
              role: u.role,
              title: u.title,
              email: u.email,
              avatar: u.avatar || u.name.slice(0, 2).toUpperCase(),
              department: u.department,
              maxCapacity: u.max_capacity,
            }))
          );
        }
      }
    } catch {}
  };

  const refreshReusableDocuments = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/documents/reusable');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setReusableDocuments(
            data.map((d: any) => ({
              id: d.id,
              name: d.name,
              category: d.category,
              uploadedAt: d.uploaded_at,
              expiryDate: d.expiry_date,
              size: d.size,
              revision: d.revision,
              accessLevel: d.access_level,
              sha256: d.sha256,
              description: d.description,
            }))
          );
        }
      }
    } catch {}
  };

  const [companyProjects, setCompanyProjects] = useState<CompanyProjectCredential[]>([]);

  const refreshCompanyProjects = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/companies/projects');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCompanyProjects(
            data.map((p: any) => ({
              id: p.id,
              companyName: p.company_name,
              companyRole: p.company_role,
              projectTitle: p.project_title,
              clientName: p.client_name,
              contractValue: p.contract_value,
              currency: p.currency,
              startDate: p.start_date,
              completionDate: p.completion_date,
              roleInProject: p.role_in_project,
              workOrderFilename: p.work_order_filename,
              workOrderPath: p.work_order_path,
              workOrderSha256: p.work_order_sha256,
              workOrderSize: p.work_order_size,
              completionCertFilename: p.completion_cert_filename,
              completionCertPath: p.completion_cert_path,
              completionCertSha256: p.completion_cert_sha256,
              completionCertSize: p.completion_cert_size,
              customFields: Array.isArray(p.custom_fields) ? p.custom_fields : [],
              createdAt: p.created_at,
              updatedAt: p.updated_at,
            }))
          );
        }
      }
    } catch {}
  };

  const addCompanyProject = async (projectData: Partial<CompanyProjectCredential>) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/companies/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: projectData.companyName || 'PrimeTech Ltd',
          company_role: projectData.companyRole || 'LEAD_BIDDER',
          project_title: projectData.projectTitle,
          client_name: projectData.clientName,
          contract_value: projectData.contractValue || 0,
          currency: projectData.currency || 'BDT',
          start_date: projectData.startDate,
          completion_date: projectData.completionDate,
          role_in_project: projectData.roleInProject || 'Prime Contractor',
          custom_fields: projectData.customFields || [],
        }),
      });
      if (res.ok) {
        await refreshCompanyProjects();
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to create company project:', e);
    }
    return null;
  };

  const updateCompanyProject = async (id: string, updates: Partial<CompanyProjectCredential>) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/companies/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_title: updates.projectTitle,
          client_name: updates.clientName,
          contract_value: updates.contractValue,
          currency: updates.currency,
          start_date: updates.startDate,
          completion_date: updates.completionDate,
          role_in_project: updates.roleInProject,
          company_role: updates.companyRole,
          custom_fields: updates.customFields,
        }),
      });
      if (res.ok) {
        await refreshCompanyProjects();
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to update company project:', e);
    }
    return null;
  };

  const deleteCompanyProject = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/companies/projects/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCompanyProjects((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
    } catch (e) {
      console.error('Failed to delete company project:', e);
    }
    return false;
  };

  const uploadProjectWorkOrder = async (projectId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`http://127.0.0.1:8000/api/companies/projects/${projectId}/upload-work-order`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        await refreshCompanyProjects();
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to upload work order:', e);
    }
    return null;
  };

  const uploadProjectCompletionCert = async (projectId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`http://127.0.0.1:8000/api/companies/projects/${projectId}/upload-completion-cert`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        await refreshCompanyProjects();
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to upload completion certificate:', e);
    }
    return null;
  };

  const linkProjectToTender = async (projectId: string, tenderId: string, targetFolder: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/companies/projects/${projectId}/link-to-tender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tender_id: tenderId,
          target_folder: targetFolder,
        }),
      });
      if (res.ok) {
        await refreshTendersFromBackend();
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to link project to tender:', e);
    }
    return null;
  };

  // Company Profiles
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);

  const refreshCompanyProfiles = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/companies/profiles');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCompanyProfiles(data);
        }
      }
    } catch {}
  };

  const addCompanyProfile = async (profileData: Partial<CompanyProfile>): Promise<CompanyProfile | null> => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/companies/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        const created = await res.json();
        await refreshCompanyProfiles();
        return created;
      }
    } catch (e) {
      console.error('Failed to create company profile:', e);
    }
    return null;
  };

  const updateCompanyProfile = async (id: string, updates: Partial<CompanyProfile>): Promise<CompanyProfile | null> => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/companies/profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        await refreshCompanyProfiles();
        return updated;
      }
    } catch (e) {
      console.error('Failed to update company profile:', e);
    }
    return null;
  };

  const deleteCompanyProfile = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/companies/profiles/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshCompanyProfiles();
        return true;
      }
    } catch (e) {
      console.error('Failed to delete company profile:', e);
    }
    return false;
  };

  useEffect(() => {
    refreshCategories();
    refreshTendersFromBackend();
    refreshOrganizations();
    refreshTeamMembers();
    refreshReusableDocuments();
    refreshCompanyProjects();
    refreshCompanyProfiles();
  }, []);

  const addCategory = async (categoryData: { name: string; description?: string; color_badge?: string }): Promise<TenderCategory | null> => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      if (res.ok) {
        const created: TenderCategory = await res.json();
        setCategories((prev) => {
          const exists = prev.find((c) => c.id === created.id || c.name.toLowerCase() === created.name.toLowerCase());
          if (exists) return prev;
          return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
        });
        return created;
      }
    } catch {
      // Fallback to local
    }
    const localCat: TenderCategory = {
      id: Date.now(),
      name: categoryData.name,
      description: categoryData.description,
      color_badge: categoryData.color_badge || 'blue',
    };
    setCategories((prev) => [...prev, localCat].sort((a, b) => a.name.localeCompare(b.name)));
    return localCat;
  };

  const updateCategory = async (id: number, updates: { name?: string; description?: string; color_badge?: string }): Promise<TenderCategory | null> => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated: TenderCategory = await res.json();
        setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
        if (updates.name) {
          const oldCat = categories.find((c) => c.id === id);
          if (oldCat) {
            setTenders((prev) =>
              prev.map((t) => (t.category === oldCat.name ? { ...t, category: updates.name! } : t))
            );
          }
        }
        return updated;
      }
    } catch {
      // Fallback to local
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    return null;
  };

  const deleteCategory = async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        return true;
      }
      return false;
    } catch {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return true;
    }
  };

  // Organizations State & Persistence
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('tendertracker_organizations_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse organizations from localStorage', e);
      }
    }
    return INITIAL_ORGANIZATIONS;
  });

  useEffect(() => {
    localStorage.setItem('tendertracker_organizations_v1', JSON.stringify(organizations));
  }, [organizations]);

  const addOrganization = (orgData: Omit<Organization, 'id'>): Organization => {
    const newId = `ORG-${Date.now().toString(36).toUpperCase()}`;
    const newOrg: Organization = {
      ...orgData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    fetch('http://127.0.0.1:8000/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrg),
    }).catch(() => {});

    setOrganizations((prev) => [newOrg, ...prev]);
    return newOrg;
  };

  const updateOrganization = (id: string, updates: Partial<Organization>) => {
    fetch(`http://127.0.0.1:8000/api/organizations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});

    setOrganizations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const deleteOrganization = (id: string) => {
    fetch(`http://127.0.0.1:8000/api/organizations/${id}`, {
      method: 'DELETE',
    }).catch(() => {});

    setOrganizations((prev) => prev.filter((o) => o.id !== id));
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tenders));
  }, [tenders]);

  const addTender = (tenderData: Partial<Tender>) => {
    const newId =
      tenderData.id ||
      `TDR-2026-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    const submissionDeadlineStr =
      tenderData.submissionDeadline && tenderData.submissionDeadline.trim().length > 0
        ? tenderData.submissionDeadline
        : '';
    const hasDeadline = Boolean(submissionDeadlineStr && !isNaN(Date.parse(submissionDeadlineStr)));
    const deadlineDate = hasDeadline ? new Date(submissionDeadlineStr) : null;
    const diffMs = deadlineDate ? Math.max(0, deadlineDate.getTime() - Date.now()) : 0;
    const daysRemaining = deadlineDate ? Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24))) : 0;
    const hoursRemaining = deadlineDate ? Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60))) : 0;

    // Generate initial requirements from submissionDocuments if provided
    const docReqs = (tenderData.summary?.submissionDocuments || [])
      .filter((d) => d && d.trim().length > 0)
      .map((docName, idx) => ({
        id: `REQ-DOC-${idx + 1}`,
        title: docName,
        category: 'Statutory Document',
        status: 'PENDING' as RequirementStatus,
        owner: 'Elena Rostova',
      }));

    const defaultReqs = [
      {
        id: 'REQ-01',
        title: 'Trade License & Company Incorporation',
        category: 'Statutory',
        status: 'PENDING' as RequirementStatus,
        owner: 'Tariq Al-Mansoor',
      },
      {
        id: 'REQ-02',
        title: 'Tax Compliance Clearance',
        category: 'Finance',
        status: 'PENDING' as RequirementStatus,
        owner: 'Tariq Al-Mansoor',
      },
    ];

    const finalReqs = docReqs.length > 0 ? [...defaultReqs, ...docReqs] : defaultReqs;

    const parsedEstimatedValue =
      tenderData.estimatedValue !== undefined &&
      tenderData.estimatedValue !== null &&
      !isNaN(Number(tenderData.estimatedValue)) &&
      Number(tenderData.estimatedValue) > 0
        ? Number(tenderData.estimatedValue)
        : 0;

    const tenderCurrency = tenderData.currency || 'USD';
    const tenderRate =
      tenderData.exchangeRateToBdt !== undefined && tenderData.exchangeRateToBdt !== null
        ? Number(tenderData.exchangeRateToBdt)
        : tenderCurrency === 'BDT'
        ? 1.0
        : 122.0;
    const tenderValBdt =
      tenderData.estimatedValueBdt !== undefined && tenderData.estimatedValueBdt !== null
        ? Number(tenderData.estimatedValueBdt)
        : tenderCurrency === 'BDT'
        ? parsedEstimatedValue
        : Math.round(parsedEstimatedValue * tenderRate);

    const newTender: Tender = {
      id: newId,
      referenceNo: tenderData.referenceNo || '',
      title: tenderData.title || tenderData.summary?.projectName || 'Untitled Tender Opportunity',
      organization: tenderData.organization || '',
      country: tenderData.country || '',
      category: tenderData.category || 'IT & Cloud Infrastructure',
      estimatedValue: parsedEstimatedValue,
      currency: tenderCurrency,
      exchangeRateToBdt: tenderRate,
      exchangeRateDate: tenderData.exchangeRateDate || '',
      estimatedValueBdt: tenderValBdt,
      procurementManagerName: tenderData.procurementManagerName || tenderData.summary?.procurementManager?.name || '',
      procurementManagerDesignation: tenderData.procurementManagerDesignation || tenderData.summary?.procurementManager?.designation || '',
      procurementManagerEmail: tenderData.procurementManagerEmail || tenderData.summary?.procurementManager?.email || '',
      procurementManagerPhone: tenderData.procurementManagerPhone || tenderData.summary?.procurementManager?.phone || '',
      helplinePhone: tenderData.helplinePhone || tenderData.summary?.helpline?.phone || '',
      helplineEmail: tenderData.helplineEmail || tenderData.summary?.helpline?.email || '',
      helplineHours: tenderData.helplineHours || tenderData.summary?.helpline?.hours || '',
      stage: tenderData.stage || 'DISCOVERED',
      decision: 'PENDING',
      priority: tenderData.priority || 'HIGH',
      submissionDeadline: submissionDeadlineStr,
      daysRemaining,
      hoursRemaining,
      readinessScore: 10,
      missingDocumentsCount: Math.max(1, (tenderData.summary?.submissionDocuments?.length || 3)),
      completedTasksCount: 0,
      totalTasksCount: 5,
      leadOwner: tenderData.leadOwner || {
        name: 'Sarah Jenkins',
        role: 'Senior Bid Operations Director',
      },
      blockers: [],
      tasks: [
        {
          id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
          title: 'Review Scope of Work (SOW) Specifications',
          assignee: 'Dr. Marcus Vance',
          priority: 'HIGH',
          deadline: 'Day 3',
          status: 'TODO',
        },
        {
          id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
          title: 'Commercial BOQ & Tender Security Guarantee',
          assignee: 'Tariq Al-Mansoor',
          priority: 'HIGH',
          deadline: 'Day 5',
          status: 'TODO',
        },
      ],
      requirements: finalReqs,
      documents: [],
      reviews: [
        { tierNumber: 1, name: 'Technical Sign-Off', reviewer: 'Dr. Marcus Vance', status: 'WAITING', comments: 'Pending review' },
        { tierNumber: 2, name: 'Financial Sign-Off', reviewer: 'Tariq Al-Mansoor', status: 'WAITING', comments: 'Pending review' },
        { tierNumber: 3, name: 'Legal Solvency Sign-Off', reviewer: 'Elena Rostova', status: 'WAITING', comments: 'Pending review' },
        { tierNumber: 4, name: 'Executive Gatekeeper Sign-Off', reviewer: 'Sarah Jenkins', status: 'WAITING', comments: 'Pending review' },
      ],
      openingDate: tenderData.openingDate,
      contractSigningDate: tenderData.contractSigningDate,
      workStartDate: tenderData.workStartDate,
      possiblePeriod: tenderData.possiblePeriod,
      productHandoverDate: tenderData.productHandoverDate,
      maintenancePeriod: tenderData.maintenancePeriod,
      schedulePurchaseDeadline: tenderData.schedulePurchaseDeadline,
      schedulePurchaseMethod: tenderData.schedulePurchaseMethod,
      tenderSecurityAmount: tenderData.tenderSecurityAmount,
      tenderSecurityMethod: tenderData.tenderSecurityMethod,
      tenderType: tenderData.tenderType,
      budgetType: tenderData.budgetType,
      sourceOfFund: tenderData.sourceOfFund,
      procurementMethod: tenderData.procurementMethod,
      parentEoiId: tenderData.parentEoiId,
      spawnedRfpId: tenderData.spawnedRfpId,
      eoiShortlistStatus: tenderData.eoiShortlistStatus,
      postAward: tenderData.postAward,
      financialModel: tenderData.financialModel,
      summary: tenderData.summary,
      importantClauses: tenderData.importantClauses || [],
    };

    // Persist new tender to FastAPI backend
    fetch('http://127.0.0.1:8000/api/tenders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newTender.id,
        reference_no: newTender.referenceNo || '',
        title: newTender.title,
        organization: newTender.organization,
        country: newTender.country,
        category: newTender.category,
        estimated_value: newTender.estimatedValue || 0,
        currency: newTender.currency,
        exchange_rate_to_bdt: newTender.exchangeRateToBdt,
        exchange_rate_date: newTender.exchangeRateDate,
        estimated_value_bdt: newTender.estimatedValueBdt,
        procurement_manager_name: newTender.procurementManagerName,
        procurement_manager_designation: newTender.procurementManagerDesignation,
        procurement_manager_email: newTender.procurementManagerEmail,
        procurement_manager_phone: newTender.procurementManagerPhone,
        helpline_phone: newTender.helplinePhone,
        helpline_email: newTender.helplineEmail,
        helpline_hours: newTender.helplineHours,
        tender_type: newTender.tenderType,
        budget_type: newTender.budgetType,
        source_of_fund: newTender.sourceOfFund,
        procurement_method: newTender.procurementMethod,
        parent_eoi_id: newTender.parentEoiId,
        spawned_rfp_id: newTender.spawnedRfpId,
        eoi_shortlist_status: newTender.eoiShortlistStatus,
        opening_date: newTender.openingDate,
        contract_signing_date: newTender.contractSigningDate,
        work_start_date: newTender.workStartDate,
        possible_period: newTender.possiblePeriod,
        product_handover_date: newTender.productHandoverDate,
        maintenance_period: newTender.maintenancePeriod,
        schedule_purchase_deadline: newTender.schedulePurchaseDeadline,
        schedule_purchase_method: newTender.schedulePurchaseMethod,
        tender_security_amount: newTender.tenderSecurityAmount,
        tender_security_method: newTender.tenderSecurityMethod,
        post_award_data: newTender.postAward,
        financial_model: newTender.financialModel || {},
        stage: newTender.stage,
        decision: newTender.decision,
        priority: newTender.priority,
        submission_deadline: newTender.submissionDeadline,
        days_remaining: newTender.daysRemaining,
        hours_remaining: newTender.hoursRemaining,
        readiness_score: newTender.readinessScore,
        lead_owner_name: newTender.leadOwner?.name,
        lead_owner_role: newTender.leadOwner?.role,
        summary_json: newTender.summary ? JSON.stringify(newTender.summary) : null,
        important_clauses: newTender.importantClauses || [],
      }),
    }).catch(() => {});

    setTenders((prev) => {
      const exists = prev.some((t) => t.id === newId);
      if (exists) {
        return prev.map((t) =>
          t.id === newId
            ? {
                ...t,
                ...tenderData,
                currency: tenderCurrency,
                exchangeRateToBdt: tenderRate,
                exchangeRateDate: tenderData.exchangeRateDate !== undefined ? tenderData.exchangeRateDate : t.exchangeRateDate,
                estimatedValueBdt: tenderValBdt,
                estimatedValue:
                  tenderData.estimatedValue !== undefined && !isNaN(Number(tenderData.estimatedValue))
                    ? Number(tenderData.estimatedValue)
                    : t.estimatedValue,
                summary: { ...t.summary, ...tenderData.summary },
                importantClauses: tenderData.importantClauses !== undefined ? tenderData.importantClauses : t.importantClauses,
                financialModel: tenderData.financialModel !== undefined ? tenderData.financialModel : t.financialModel,
              }
            : t
        );
      }
      return [newTender, ...prev];
    });
  };

  const updateTender = (id: string, updates: Partial<Tender>) => {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.referenceNo !== undefined) payload.reference_no = updates.referenceNo;
    if (updates.organization !== undefined) payload.organization = updates.organization;
    if (updates.country !== undefined) payload.country = updates.country;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.tenderType !== undefined) payload.tender_type = updates.tenderType;
    if (updates.budgetType !== undefined) payload.budget_type = updates.budgetType;
    if (updates.sourceOfFund !== undefined) payload.source_of_fund = updates.sourceOfFund;
    if (updates.procurementMethod !== undefined) payload.procurement_method = updates.procurementMethod;
    if (updates.parentEoiId !== undefined) payload.parent_eoi_id = updates.parentEoiId;
    if (updates.spawnedRfpId !== undefined) payload.spawned_rfp_id = updates.spawnedRfpId;
    if (updates.eoiShortlistStatus !== undefined) payload.eoi_shortlist_status = updates.eoiShortlistStatus;
    if (updates.estimatedValue !== undefined) payload.estimated_value = updates.estimatedValue;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.exchangeRateToBdt !== undefined) payload.exchange_rate_to_bdt = updates.exchangeRateToBdt;
    if (updates.exchangeRateDate !== undefined) payload.exchange_rate_date = updates.exchangeRateDate;
    if (updates.estimatedValueBdt !== undefined) payload.estimated_value_bdt = updates.estimatedValueBdt;
    if (updates.procurementManagerName !== undefined) payload.procurement_manager_name = updates.procurementManagerName;
    if (updates.procurementManagerDesignation !== undefined) payload.procurement_manager_designation = updates.procurementManagerDesignation;
    if (updates.procurementManagerEmail !== undefined) payload.procurement_manager_email = updates.procurementManagerEmail;
    if (updates.procurementManagerPhone !== undefined) payload.procurement_manager_phone = updates.procurementManagerPhone;
    if (updates.helplinePhone !== undefined) payload.helpline_phone = updates.helplinePhone;
    if (updates.helplineEmail !== undefined) payload.helpline_email = updates.helplineEmail;
    if (updates.helplineHours !== undefined) payload.helpline_hours = updates.helplineHours;
    if (updates.openingDate !== undefined) payload.opening_date = updates.openingDate;
    if (updates.contractSigningDate !== undefined) payload.contract_signing_date = updates.contractSigningDate;
    if (updates.workStartDate !== undefined) payload.work_start_date = updates.workStartDate;
    if (updates.possiblePeriod !== undefined) payload.possible_period = updates.possiblePeriod;
    if (updates.productHandoverDate !== undefined) payload.product_handover_date = updates.productHandoverDate;
    if (updates.maintenancePeriod !== undefined) payload.maintenance_period = updates.maintenancePeriod;
    if (updates.schedulePurchaseDeadline !== undefined) payload.schedule_purchase_deadline = updates.schedulePurchaseDeadline;
    if (updates.schedulePurchaseMethod !== undefined) payload.schedule_purchase_method = updates.schedulePurchaseMethod;
    if (updates.tenderSecurityAmount !== undefined) payload.tender_security_amount = updates.tenderSecurityAmount;
    if (updates.tenderSecurityMethod !== undefined) payload.tender_security_method = updates.tenderSecurityMethod;
    if (updates.postAward !== undefined) payload.post_award_data = updates.postAward;
    if (updates.financialModel !== undefined) payload.financial_model = updates.financialModel;
    if (updates.stage !== undefined) payload.stage = updates.stage;
    if (updates.decision !== undefined) payload.decision = updates.decision;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.submissionDeadline !== undefined) payload.submission_deadline = updates.submissionDeadline;
    if (updates.readinessScore !== undefined) payload.readiness_score = updates.readinessScore;
    if (updates.importantClauses !== undefined) payload.important_clauses = updates.importantClauses;
    if (updates.summary !== undefined) payload.summary_json = JSON.stringify(updates.summary);

    if (Object.keys(payload).length > 0) {
      fetch(`http://127.0.0.1:8000/api/tenders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    setTenders((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTender = (id: string) => {
    fetch(`http://127.0.0.1:8000/api/tenders/${id}`, { method: 'DELETE' }).catch(() => {});
    setTenders((prev) => prev.filter((t) => t.id !== id));
  };

  const deleteMultipleTenders = (ids: string[]) => {
    ids.forEach((id) => {
      fetch(`http://127.0.0.1:8000/api/tenders/${id}`, { method: 'DELETE' }).catch(() => {});
    });
    setTenders((prev) => prev.filter((t) => !ids.includes(t.id)));
  };

  const updateTenderStage = (tenderId: string, stage: TenderStage) => {
    fetch(`http://127.0.0.1:8000/api/tenders/${tenderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        return {
          ...t,
          stage,
          archivedFromStage:
            stage === 'ARCHIVED'
              ? (t.stage !== 'ARCHIVED' ? t.stage : t.archivedFromStage || 'DISCOVERED')
              : undefined,
          archivedAt: stage === 'ARCHIVED' ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const archiveTender = (tenderId: string) => {
    fetch(`http://127.0.0.1:8000/api/tenders/${tenderId}/archive`, { method: 'POST' }).catch(() => {});
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        if (t.stage === 'SUBMITTED') return t;
        return {
          ...t,
          stage: 'ARCHIVED' as TenderStage,
          archivedFromStage: t.stage !== 'ARCHIVED' ? t.stage : t.archivedFromStage || 'DISCOVERED',
          archivedAt: new Date().toISOString(),
        };
      })
    );
  };

  const restoreTender = (tenderId: string) => {
    fetch(`http://127.0.0.1:8000/api/tenders/${tenderId}/restore`, { method: 'POST' }).catch(() => {});
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const restoredStage: TenderStage = t.archivedFromStage || 'DISCOVERED';
        return {
          ...t,
          stage: restoredStage,
          archivedFromStage: undefined,
          archivedAt: undefined,
        };
      })
    );
  };

  const setTenderDecision = (
    tenderId: string,
    decision: DecisionStatus,
    matrix: TenderDecisionMatrix
  ) => {
    fetch(`http://127.0.0.1:8000/api/tenders/${tenderId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technical: matrix.technical,
        financial: matrix.financial,
        team: matrix.team,
        sla: matrix.sla,
        aggregateScore: matrix.aggregateScore,
        decision,
        rationale: matrix.rationale,
      }),
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const nextStage =
          decision === 'GO' && t.stage === 'UNDER_ANALYSIS'
            ? 'PREPARATION'
            : t.stage;
        return {
          ...t,
          decision,
          stage: nextStage,
          decisionMatrix: matrix,
        };
      })
    );
  };

  const addTask = (tenderId: string, taskData: Omit<TenderTask, 'id'>) => {
    fetch(`http://127.0.0.1:8000/api/tasks/tender/${tenderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: taskData.title,
        assignee: taskData.assignee,
        due_date: taskData.deadline,
        status: taskData.status,
        priority: taskData.priority,
      }),
    }).catch(() => {});

    const newTask: TenderTask = {
      id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      ...taskData,
    };
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updatedTasks = [...t.tasks, newTask];
        const completed = updatedTasks.filter((x) => x.status === 'DONE').length;
        return {
          ...t,
          tasks: updatedTasks,
          totalTasksCount: updatedTasks.length,
          completedTasksCount: completed,
          readinessScore: Math.min(
            100,
            Math.round((completed / updatedTasks.length) * 100)
          ),
        };
      })
    );
  };

  const moveTask = (tenderId: string, taskId: string, newStatus: TaskStatus) => {
    fetch(`http://127.0.0.1:8000/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updatedTasks = t.tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        );
        const completed = updatedTasks.filter((x) => x.status === 'DONE').length;
        return {
          ...t,
          tasks: updatedTasks,
          completedTasksCount: completed,
          readinessScore: Math.min(
            100,
            Math.round((completed / updatedTasks.length) * 100)
          ),
        };
      })
    );
  };

  const addDocument = (
    tenderId: string,
    doc: {
      name: string;
      folder: string;
      size: string;
      companyName?: string;
      companyRole?: string;
      isJvPartner?: boolean;
    }
  ) => {
    const hex = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += hex[Math.floor(Math.random() * 16)];
    }

    const newDoc: TenderDocument = {
      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      name: doc.name,
      folder: doc.folder,
      companyName: doc.companyName || 'PrimeTech Ltd',
      companyRole: doc.companyRole || (doc.isJvPartner ? 'JV_PARTNER' : 'LEAD_BIDDER'),
      isJvPartner: Boolean(doc.isJvPartner),
      revision: 'v1.0',
      sha256: hash,
      uploadedAt: new Date().toISOString().split('T')[0],
      size: doc.size,
    };

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updatedDocs = [newDoc, ...t.documents];
        const missing = Math.max(0, t.missingDocumentsCount - 1);
        return {
          ...t,
          documents: updatedDocs,
          missingDocumentsCount: missing,
          readinessScore: Math.min(100, t.readinessScore + 5),
        };
      })
    );
  };

  const addFolder = (tenderId: string, folder: { name: string; label: string }) => {
    fetch(`http://127.0.0.1:8000/api/documents/tender/${tenderId}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(folder),
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const currentCustom = t.customFolders || [];
        if (currentCustom.some((f) => f.name === folder.name)) return t;
        return {
          ...t,
          customFolders: [...currentCustom, folder],
        };
      })
    );
  };

  const deleteFolder = (tenderId: string, folderName: string) => {
    fetch(`http://127.0.0.1:8000/api/documents/tender/${tenderId}/folders/${encodeURIComponent(folderName)}`, {
      method: 'DELETE',
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;

        const fallbackFolder = '01_original_tender_documents';
        const updatedDocs = t.documents.map((d) =>
          d.folder === folderName ? { ...d, folder: fallbackFolder } : d
        );

        const updatedCustom = (t.customFolders || []).filter(
          (f) => f.name !== folderName
        );

        const currentDeleted = t.deletedFolders || [];
        const updatedDeleted = currentDeleted.includes(folderName)
          ? currentDeleted
          : [...currentDeleted, folderName];

        return {
          ...t,
          documents: updatedDocs,
          customFolders: updatedCustom,
          deletedFolders: updatedDeleted,
        };
      })
    );
  };

  const moveDocumentFolder = (
    tenderId: string,
    docId: string,
    targetFolder: string
  ) => {
    fetch(`http://127.0.0.1:8000/api/documents/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: targetFolder }),
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        return {
          ...t,
          documents: t.documents.map((d) =>
            d.id === docId ? { ...d, folder: targetFolder } : d
          ),
        };
      })
    );
  };

  const requestDocumentReupload = async (
    tenderId: string,
    docId: string,
    payload: { reason: string; comment: string; dueDate?: string; requestedBy?: string }
  ): Promise<boolean> => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/documents/${docId}/request-reupload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updatedDoc = await res.json();
        setTenders((prev) =>
          prev.map((t) => {
            if (t.id !== tenderId) return t;
            return {
              ...t,
              documents: t.documents.map((d) =>
                d.id === docId
                  ? {
                      ...d,
                      status: updatedDoc.status,
                      actionComment: updatedDoc.action_comment,
                      requestedBy: updatedDoc.requested_by,
                      actionDueDate: updatedDoc.action_due_date,
                    }
                  : d
              ),
            };
          })
        );
        return true;
      }
    } catch (e) {
      console.error('Failed to request document reupload', e);
    }
    // Fallback local update
    const fullComment = `[${payload.reason}] ${payload.comment}`.trim();
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        return {
          ...t,
          documents: t.documents.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  status: 'ACTION_REQUIRED',
                  actionComment: fullComment,
                  requestedBy: payload.requestedBy || currentUser.name,
                  actionDueDate: payload.dueDate || 'T-48h',
                }
              : d
          ),
        };
      })
    );
    return true;
  };

  const requestNewDocumentUpload = async (payload: {
    tenderId: string;
    title: string;
    folder: string;
    companyName: string;
    companyRole?: string;
    instructions: string;
    dueDate?: string;
    requestedBy?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/documents/request-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tender_id: payload.tenderId,
          title: payload.title,
          folder: payload.folder,
          company_name: payload.companyName,
          company_role: payload.companyRole || 'JV_PARTNER',
          instructions: payload.instructions,
          due_date: payload.dueDate || 'T-48h',
          requested_by: payload.requestedBy || currentUser.name,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        const newDoc: TenderDocument = {
          id: created.id,
          name: created.name,
          folder: created.folder,
          companyName: created.company_name,
          companyRole: created.company_role,
          isJvPartner: created.is_jv_partner,
          size: created.size,
          revision: created.revision,
          sha256: created.sha256,
          uploadedAt: created.uploaded_at,
          status: created.status,
          actionComment: created.action_comment,
          requestedBy: created.requested_by,
          actionDueDate: created.action_due_date,
        };
        setTenders((prev) =>
          prev.map((t) => {
            if (t.id !== payload.tenderId) return t;
            return {
              ...t,
              documents: [newDoc, ...t.documents],
              missingDocumentsCount: t.missingDocumentsCount + 1,
            };
          })
        );
        return true;
      }
    } catch (e) {
      console.error('Failed to request new document upload', e);
    }
    // Fallback local update
    const dummyId = `DOC-${Math.floor(100 + Math.random() * 900)}`;
    const newDoc: TenderDocument = {
      id: dummyId,
      name: payload.title,
      folder: payload.folder,
      companyName: payload.companyName,
      companyRole: payload.companyRole || 'JV_PARTNER',
      isJvPartner:
        payload.companyRole === 'JV_PARTNER' ||
        payload.companyName.toLowerCase() !== 'primetech ltd',
      size: '0 KB (Pending)',
      revision: 'v0.0 (Requested)',
      sha256: 'PENDING_UPLOAD',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'ACTION_REQUIRED',
      actionComment: payload.instructions,
      requestedBy: payload.requestedBy || currentUser.name,
      actionDueDate: payload.dueDate || 'T-48h',
    };
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== payload.tenderId) return t;
        return {
          ...t,
          documents: [newDoc, ...t.documents],
          missingDocumentsCount: t.missingDocumentsCount + 1,
        };
      })
    );
    return true;
  };

  const resolveDocumentReupload = async (
    tenderId: string,
    docId: string,
    file: File,
    comment?: string
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (comment) formData.append('comment', comment);

      const res = await fetch(`http://127.0.0.1:8000/api/documents/${docId}/resolve-reupload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setTenders((prev) =>
          prev.map((t) => {
            if (t.id !== tenderId) return t;
            return {
              ...t,
              documents: t.documents.map((d) =>
                d.id === docId
                  ? {
                      ...d,
                      name: updated.name,
                      revision: updated.revision,
                      size: updated.size,
                      sha256: updated.sha256,
                      status: updated.status,
                      actionComment: updated.action_comment,
                      uploadedAt: updated.uploaded_at,
                    }
                  : d
              ),
            };
          })
        );
        return true;
      }
    } catch (e) {
      console.error('Failed to resolve document reupload', e);
    }
    // Local fallback
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        return {
          ...t,
          documents: t.documents.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  name: file.name,
                  revision: d.revision === 'v1.0' ? 'v1.1' : 'v1.0',
                  size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                  status: 'PENDING_REVIEW',
                  actionComment: comment ? `Revised: ${comment}` : undefined,
                  uploadedAt: new Date().toISOString().split('T')[0],
                }
              : d
          ),
        };
      })
    );
    return true;
  };

  const signOffReviewTier = (
    tenderId: string,
    tierNumber: number,
    comments: string
  ) => {
    fetch(`http://127.0.0.1:8000/api/tenders/${tenderId}/reviews/${tierNumber}/sign-off`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signer_name: currentUser.name,
        comments: comments || 'Signed off and verified.',
        status: 'APPROVED',
      }),
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updatedReviews = t.reviews.map((r) => {
          if (r.tierNumber === tierNumber) {
            return {
              ...r,
              status: 'APPROVED' as const,
              date: new Date().toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              comments: comments || 'Signed off and verified.',
            };
          }
          if (r.tierNumber === tierNumber + 1 && r.status === 'WAITING') {
            return { ...r, status: 'ACTION_REQUIRED' as const };
          }
          return r;
        });

        const allApproved = updatedReviews.every((r) => r.status === 'APPROVED');
        return {
          ...t,
          reviews: updatedReviews,
          stage: allApproved ? ('SUBMITTED' as const) : t.stage,
          readinessScore: allApproved ? 100 : t.readinessScore,
        };
      })
    );
  };

  const toggleRequirementStatus = (
    tenderId: string,
    reqId: string,
    newStatus: RequirementStatus
  ) => {
    fetch(`http://127.0.0.1:8000/api/requirements/${reqId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updatedReqs = t.requirements.map((r) =>
          r.id === reqId ? { ...r, status: newStatus } : r
        );
        const blockers = updatedReqs
          .filter((r) => r.status === 'BLOCKER')
          .map((r) => r.title);
        return {
          ...t,
          requirements: updatedReqs,
          blockers,
        };
      })
    );
  };

  const submitTenderProof = (tenderId: string, portalReference: string) => {
    fetch(`http://127.0.0.1:8000/api/tenders/${tenderId}/submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portal_reference: portalReference,
        submitted_by: currentUser.name || 'Sarah Jenkins',
      }),
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        return {
          ...t,
          stage: 'SUBMITTED',
          readinessScore: 100,
          submissionProof: {
            portalReference,
            timestamp: new Date().toISOString(),
            status: 'SUBMITTED_LOCKED',
          },
        };
      })
    );
  };

  // RBAC & Collaborative State
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('tendertracker_team_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: UserProfile) => {
            const seed = TEAM_PROFILES.find((s) => s.id === p.id);
            if (!seed) return p;
            return {
              ...seed,
              ...p,
              pastAssignments: p.pastAssignments && p.pastAssignments.length > 0 ? p.pastAssignments : seed.pastAssignments,
              certifications: p.certifications && p.certifications.length > 0 ? p.certifications : seed.certifications,
              education: p.education && p.education.length > 0 ? p.education : seed.education,
              activeTenderRoles: p.activeTenderRoles || seed.activeTenderRoles,
              phone: p.phone || seed.phone,
              location: p.location || seed.location,
              employmentType: p.employmentType || seed.employmentType,
              proposedDesignation: p.proposedDesignation || seed.proposedDesignation,
            };
          });
        }
      } catch (e) {
        console.error('Failed to parse team profiles:', e);
      }
    }
    return TEAM_PROFILES;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(teamMembers[0] || TEAM_PROFILES[0]);
  const [sharedLinks, setSharedLinks] = useState<DocumentShareLink[]>([]);
  const [activeDocForShare, setActiveDocForShare] = useState<{
    tenderId: string;
    doc: TenderDocument;
  } | null>(null);

  // Master Reusable Documents
  const [reusableDocuments, setReusableDocuments] = useState<ReusableDocument[]>(() => {
    const saved = localStorage.getItem('tendertracker_reusable_docs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading reusable docs:', e);
      }
    }
    return INITIAL_REUSABLE_DOCUMENTS;
  });

  useEffect(() => {
    localStorage.setItem('tendertracker_reusable_docs', JSON.stringify(reusableDocuments));
  }, [reusableDocuments]);

  const addReusableDocument = (doc: {
    name: string;
    category: string;
    size: string;
    companyName?: string;
    companyRole?: string;
    isJvPartner?: boolean;
    expiryDate?: string;
    accessLevel: DocumentAccessLevel;
    description?: string;
  }) => {
    const hex = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) hash += hex[Math.floor(Math.random() * 16)];

    const newDoc: ReusableDocument = {
      id: `RUD-${Math.floor(100 + Math.random() * 900)}`,
      name: doc.name,
      category: doc.category,
      companyName: doc.companyName || 'PrimeTech Ltd',
      companyRole: doc.companyRole || (doc.isJvPartner ? 'JV_PARTNER' : 'LEAD_BIDDER'),
      isJvPartner: Boolean(doc.isJvPartner),
      uploadedAt: new Date().toISOString().split('T')[0],
      expiryDate: doc.expiryDate,
      size: doc.size || '2.5 MB',
      revision: 'v1.0',
      accessLevel: doc.accessLevel || 'ALL_TEAM',
      sha256: hash,
      description: doc.description,
    };

    fetch('http://127.0.0.1:8000/api/documents/reusable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: doc.name,
        category: doc.category,
        company_name: doc.companyName || 'PrimeTech Ltd',
        company_role: doc.companyRole || (doc.isJvPartner ? 'JV_PARTNER' : 'LEAD_BIDDER'),
        is_jv_partner: Boolean(doc.isJvPartner),
        size: doc.size || '2.5 MB',
        expiry_date: doc.expiryDate,
        access_level: doc.accessLevel || 'ALL_TEAM',
        description: doc.description,
      }),
    }).catch(() => {});

    setReusableDocuments((prev) => [newDoc, ...prev]);
  };

  const updateDocumentAccess = (docId: string, newAccess: DocumentAccessLevel) => {
    fetch(`http://127.0.0.1:8000/api/documents/reusable-documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_level: newAccess }),
    }).catch(() => {});

    setReusableDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, accessLevel: newAccess } : d))
    );
  };

  const updateTenderDocumentAccess = (
    tenderId: string,
    docId: string,
    newAccess: DocumentAccessLevel
  ) => {
    fetch(`http://127.0.0.1:8000/api/documents/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_level: newAccess }),
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        return {
          ...t,
          documents: t.documents.map((d) =>
            d.id === docId ? { ...d, accessLevel: newAccess } : d
          ),
        };
      })
    );
  };

  const linkReusableDocumentToTender = (
    tenderId: string,
    reusableDocId: string,
    targetFolder: string
  ) => {
    const masterDoc = reusableDocuments.find((d) => d.id === reusableDocId);
    if (!masterDoc) return;

    const docCompanyName = masterDoc.companyName || 'PrimeTech Ltd';
    const docIsJv = masterDoc.isJvPartner !== undefined ? masterDoc.isJvPartner : targetFolder.toLowerCase().includes('jv');
    const docCompanyRole = masterDoc.companyRole || (docIsJv ? 'JV_PARTNER' : 'LEAD_BIDDER');

    const newDoc: TenderDocument = {
      id: `DOC-LINK-${Math.floor(100 + Math.random() * 900)}`,
      name: masterDoc.name,
      folder: targetFolder,
      companyName: docCompanyName,
      companyRole: docCompanyRole,
      isJvPartner: docIsJv,
      revision: masterDoc.revision,
      sha256: masterDoc.sha256,
      uploadedAt: new Date().toISOString().split('T')[0],
      size: masterDoc.size,
      isReusableLink: true,
      reusableSourceId: masterDoc.id,
      accessLevel: masterDoc.accessLevel,
    };

    fetch(`http://127.0.0.1:8000/api/tenders/${tenderId}/link-reusable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reusable_doc_id: reusableDocId,
        target_folder: targetFolder,
        company_name: docCompanyName,
        company_role: docCompanyRole,
        is_jv_partner: docIsJv,
      }),
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        return {
          ...t,
          documents: [newDoc, ...t.documents],
        };
      })
    );
  };

  const hasDocumentAccess = (
    accessLevel: DocumentAccessLevel = 'ALL_TEAM',
    role: UserRole = currentUser.role
  ): boolean => {
    if (accessLevel === 'ALL_TEAM') return true;
    if (accessLevel === 'MANAGEMENT_ONLY') {
      return (
        role === 'BUSINESS_HEAD' ||
        role === 'EXECUTIVE_MANAGER' ||
        role === 'SENIOR_MANAGER'
      );
    }
    if (accessLevel === 'RESTRICTED_FINANCE') {
      return role === 'BUSINESS_HEAD' || role === 'SENIOR_MANAGER';
    }
    if (accessLevel === 'EXECUTIVE_ONLY') {
      return role === 'BUSINESS_HEAD';
    }
    return true;
  };

  const addTeamMember = (member: {
    name: string;
    role: UserRole;
    title: string;
    email: string;
    dept?: string;
    maxCapacity?: number;
  }) => {
    const initials = member.name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    const newProfile: UserProfile = {
      id: `USR-0${teamMembers.length + 1}`,
      name: member.name,
      role: member.role,
      title: member.title || member.role.replace('_', ' '),
      email: member.email,
      avatar: initials || 'TM',
      department: member.dept,
      maxCapacity: member.maxCapacity || 5,
    };

    fetch('http://127.0.0.1:8000/api/auth/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: member.name,
        email: member.email,
        password: 'Password123!',
        role: member.role,
        title: member.title || member.role.replace('_', ' '),
        department: member.dept || 'Bid Operations',
        max_capacity: member.maxCapacity || 5,
        avatar: initials || 'TM',
      }),
    }).catch(() => {});

    const updated = [...teamMembers, newProfile];
    setTeamMembers(updated);
    localStorage.setItem('tendertracker_team_profiles', JSON.stringify(updated));
  };

  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    const payload: Record<string, any> = { ...updates };
    if (updates.maxCapacity !== undefined) payload.max_capacity = updates.maxCapacity;
    if (updates.employmentType !== undefined) payload.employment_type = updates.employmentType;
    if (updates.proposedDesignation !== undefined) payload.proposed_designation = updates.proposedDesignation;
    if (updates.pastAssignments !== undefined) payload.past_assignments = updates.pastAssignments;
    if (updates.activeTenderRoles !== undefined) payload.active_tender_roles = updates.activeTenderRoles;

    fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.warn('Failed to persist user profile to backend:', err));

    setTeamMembers((prev) => {
      const updated = prev.map((m) => (m.id === userId ? { ...m, ...updates } : m));
      localStorage.setItem('tendertracker_team_profiles', JSON.stringify(updated));
      return updated;
    });

    setCurrentUser((prev) => {
      if (prev.id === userId) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  };

  const addPastAssignment = async (userId: string, assignment: PastProjectAssignment) => {
    fetch(`http://127.0.0.1:8000/api/users/${userId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment),
    }).catch((err) => console.warn('Failed to persist assignment to backend:', err));

    setTeamMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== userId) return m;
        const currentList = m.pastAssignments || [];
        return { ...m, pastAssignments: [assignment, ...currentList] };
      });
      localStorage.setItem('tendertracker_team_profiles', JSON.stringify(updated));
      return updated;
    });

    setCurrentUser((prev) => {
      if (prev.id === userId) {
        const currentList = prev.pastAssignments || [];
        return { ...prev, pastAssignments: [assignment, ...currentList] };
      }
      return prev;
    });
  };

  const deletePastAssignment = async (userId: string, assignmentId: string) => {
    fetch(`http://127.0.0.1:8000/api/users/${userId}/assignments/${assignmentId}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Failed to delete assignment on backend:', err));

    setTeamMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== userId) return m;
        const currentList = m.pastAssignments || [];
        return { ...m, pastAssignments: currentList.filter((a) => a.id !== assignmentId) };
      });
      localStorage.setItem('tendertracker_team_profiles', JSON.stringify(updated));
      return updated;
    });

    setCurrentUser((prev) => {
      if (prev.id === userId) {
        const currentList = prev.pastAssignments || [];
        return { ...prev, pastAssignments: currentList.filter((a) => a.id !== assignmentId) };
      }
      return prev;
    });
  };

  // Full access: every role has operational permissions
  const canPerformAction = (): boolean => true;

  const assignTask = (
    tenderId: string,
    taskId: string,
    newAssignee: string
  ) => {
    fetch(`http://127.0.0.1:8000/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignee: newAssignee }),
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        return {
          ...t,
          tasks: t.tasks.map((tsk) =>
            tsk.id === taskId ? { ...tsk, assignee: newAssignee } : tsk
          ),
        };
      })
    );
  };

  const addComment = (tenderId: string, content: string) => {
    fetch(`http://127.0.0.1:8000/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tender_id: tenderId,
        author_name: currentUser.name,
        author_role: currentUser.role,
        author_avatar: currentUser.avatar,
        content,
      }),
    }).catch(() => {});

    const newComment: TenderComment = {
      id: `CMT-${Date.now()}`,
      tenderId,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
    };

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        return {
          ...t,
          comments: [newComment, ...(t.comments || [])],
        };
      })
    );
  };

  const deleteComment = (tenderId: string, commentId: string) => {
    fetch(`http://127.0.0.1:8000/api/comments/${commentId}`, {
      method: 'DELETE',
    }).catch(() => {});

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        return {
          ...t,
          comments: (t.comments || []).filter((c) => c.id !== commentId),
        };
      })
    );
  };

  const shareDocument = (
    tenderId: string,
    docId: string,
    options: { permission: 'VIEW_ONLY' | 'DOWNLOAD_ALLOWED'; email?: string }
  ): DocumentShareLink => {
    const tender = tenders.find((t) => t.id === tenderId);
    const doc =
      tender?.documents.find((d) => d.id === docId) ||
      reusableDocuments.find((d) => d.id === docId);

    const link: DocumentShareLink = {
      id: `SHR-${Math.floor(1000 + Math.random() * 9000)}`,
      documentId: docId,
      documentName: doc?.name || 'Document',
      token: Math.random().toString(36).substring(2, 15),
      permission: options.permission,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      sharedWithEmail: options.email,
      createdAt: new Date().toISOString(),
    };

    fetch(`http://127.0.0.1:8000/api/documents/documents/${docId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shared_with_type: options.email ? 'USER' : 'PUBLIC',
        recipient_email: options.email,
        can_view: true,
        can_download: options.permission === 'DOWNLOAD_ALLOWED',
        expires_in_days: 7,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.token) {
          setSharedLinks((prev) =>
            prev.map((l) => (l.id === link.id ? { ...l, token: data.token } : l))
          );
        }
      })
      .catch(() => {});

    setSharedLinks((prev) => [link, ...prev]);
    return link;
  };

  return (
    <TenderContext.Provider
      value={{
        tenders,
        addTender,
        updateTender,
        deleteTender,
        deleteMultipleTenders,
        updateTenderStage,
        archiveTender,
        restoreTender,
        setTenderDecision,
        addTask,
        moveTask,
        addDocument,
        addFolder,
        deleteFolder,
        moveDocumentFolder,
        requestDocumentReupload,
        requestNewDocumentUpload,
        resolveDocumentReupload,
        signOffReviewTier,
        toggleRequirementStatus,
        submitTenderProof,
        currentUser,
        setCurrentUser,
        teamMembers,
        addTeamMember,
        updateUserProfile,
        addPastAssignment,
        deletePastAssignment,
        canPerformAction,
        assignTask,
        addComment,
        deleteComment,
        shareDocument,
        sharedLinks,
        activeDocForShare,
        setActiveDocForShare,
        reusableDocuments,
        addReusableDocument,
        updateDocumentAccess,
        updateTenderDocumentAccess,
        linkReusableDocumentToTender,
        hasDocumentAccess,
        currency,
        setCurrency,
        formatCurrency,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshCategories,
        organizations,
        addOrganization,
        updateOrganization,
        deleteOrganization,
        companyProjects,
        refreshCompanyProjects,
        addCompanyProject,
        updateCompanyProject,
        deleteCompanyProject,
        uploadProjectWorkOrder,
        uploadProjectCompletionCert,
        linkProjectToTender,
        companyProfiles,
        refreshCompanyProfiles,
        addCompanyProfile,
        updateCompanyProfile,
        deleteCompanyProfile,
        isNewTenderModalOpen,
        setIsNewTenderModalOpen,
        uploadFolderTarget,
        setUploadFolderTarget,
        activeTenderIdForModal,
        setActiveTenderIdForModal,
        activeTierForSignOff,
        setActiveTierForSignOff,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
      }}
    >
      {children}
    </TenderContext.Provider>
  );
};

export const useTenders = () => {
  const context = useContext(TenderContext);
  if (!context) {
    throw new Error('useTenders must be used within a TenderProvider');
  }
  return context;
};

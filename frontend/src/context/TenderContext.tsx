import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tender,
  TenderStage,
  DecisionStatus,
  TenderTask,
  TaskStatus,
  TenderDocument,
  TenderDecisionMatrix,
  RequirementStatus,
  UserProfile,
  UserRole,
  TenderComment,
  DocumentShareLink,
  ReusableDocument,
  DocumentAccessLevel,
} from '../types/tender';
import { MOCK_TENDERS } from '../mock/tenders';
import { TEAM_PROFILES } from '../mock/users';
import { INITIAL_REUSABLE_DOCUMENTS } from '../mock/reusableDocuments';

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
    doc: { name: string; folder: string; size: string }
  ) => void;
  addFolder: (tenderId: string, folder: { name: string; label: string }) => void;
  deleteFolder: (tenderId: string, folderName: string) => void;
  moveDocumentFolder: (tenderId: string, docId: string, targetFolder: string) => void;
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
        return sanitized;
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tenders));
  }, [tenders]);

  const addTender = (tenderData: Partial<Tender>) => {
    const newId = tenderData.id || `TDR-2026-${Math.floor(100 + Math.random() * 900)}`;
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

    const newTender: Tender = {
      id: newId,
      referenceNo: tenderData.referenceNo || '',
      title: tenderData.title || tenderData.summary?.projectName || 'Untitled Tender Opportunity',
      organization: tenderData.organization || '',
      country: tenderData.country || '',
      category: tenderData.category || 'IT & Cloud Infrastructure',
      estimatedValue: parsedEstimatedValue,
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
          title: 'Review Scope of Work & Technical SOW',
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
      summary: tenderData.summary,
    };

    setTenders((prev) => {
      const exists = prev.some((t) => t.id === newId);
      if (exists) {
        return prev.map((t) =>
          t.id === newId
            ? {
                ...t,
                ...tenderData,
                estimatedValue:
                  tenderData.estimatedValue !== undefined && !isNaN(Number(tenderData.estimatedValue))
                    ? Number(tenderData.estimatedValue)
                    : t.estimatedValue,
                summary: { ...t.summary, ...tenderData.summary },
              }
            : t
        );
      }
      return [newTender, ...prev];
    });
  };

  const updateTender = (id: string, updates: Partial<Tender>) => {
    setTenders((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTender = (id: string) => {
    setTenders((prev) => prev.filter((t) => t.id !== id));
  };

  const deleteMultipleTenders = (ids: string[]) => {
    setTenders((prev) => prev.filter((t) => !ids.includes(t.id)));
  };

  const updateTenderStage = (tenderId: string, stage: TenderStage) => {
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
    doc: { name: string; folder: string; size: string }
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

  const signOffReviewTier = (
    tenderId: string,
    tierNumber: number,
    comments: string
  ) => {
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
      uploadedAt: new Date().toISOString().split('T')[0],
      expiryDate: doc.expiryDate,
      size: doc.size || '2.5 MB',
      revision: 'v1.0',
      accessLevel: doc.accessLevel || 'ALL_TEAM',
      sha256: hash,
      description: doc.description,
    };
    setReusableDocuments((prev) => [newDoc, ...prev]);
  };

  const updateDocumentAccess = (docId: string, newAccess: DocumentAccessLevel) => {
    setReusableDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, accessLevel: newAccess } : d))
    );
  };

  const updateTenderDocumentAccess = (
    tenderId: string,
    docId: string,
    newAccess: DocumentAccessLevel
  ) => {
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

    const newDoc: TenderDocument = {
      id: `DOC-LINK-${Math.floor(100 + Math.random() * 900)}`,
      name: masterDoc.name,
      folder: targetFolder,
      revision: masterDoc.revision,
      sha256: masterDoc.sha256,
      uploadedAt: new Date().toISOString().split('T')[0],
      size: masterDoc.size,
      isReusableLink: true,
      reusableSourceId: masterDoc.id,
      accessLevel: masterDoc.accessLevel,
    };

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
    };
    const updated = [...teamMembers, newProfile];
    setTeamMembers(updated);
    localStorage.setItem('tendertracker_team_profiles', JSON.stringify(updated));
  };

  // Full access: every role has operational permissions
  const canPerformAction = (): boolean => true;

  const assignTask = (
    tenderId: string,
    taskId: string,
    newAssignee: string
  ) => {
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
        signOffReviewTier,
        toggleRequirementStatus,
        submitTenderProof,
        currentUser,
        setCurrentUser,
        teamMembers,
        addTeamMember,
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

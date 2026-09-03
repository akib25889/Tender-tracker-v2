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
  TenderComment,
  DocumentShareLink,
} from '../types/tender';
import { MOCK_TENDERS } from '../mock/tenders';
import { TEAM_PROFILES } from '../mock/users';

export type CurrencyMode = 'USD' | 'BDT';

interface TenderContextType {
  tenders: Tender[];
  addTender: (tenderData: Partial<Tender>) => void;
  updateTender: (id: string, updates: Partial<Tender>) => void;
  deleteTender: (id: string) => void;
  deleteMultipleTenders: (ids: string[]) => void;
  updateTenderStage: (tenderId: string, stage: TenderStage) => void;
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
        return JSON.parse(saved);
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

  const formatCurrency = (amountInUSD: number): string => {
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tenders));
  }, [tenders]);

  const addTender = (tenderData: Partial<Tender>) => {
    const newId = tenderData.id || `TDR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const deadlineDate = tenderData.submissionDeadline
      ? new Date(tenderData.submissionDeadline)
      : new Date(Date.now() + 14 * 86400000);
    const diffMs = Math.max(0, deadlineDate.getTime() - Date.now());
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const hoursRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));

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

    const newTender: Tender = {
      id: newId,
      referenceNo: tenderData.referenceNo || `REF/${newId}`,
      title: tenderData.title || tenderData.summary?.projectName || 'Untitled Tender Opportunity',
      organization: tenderData.organization || 'Multilateral Donor Agency',
      country: tenderData.country || 'Global / Regional',
      category: tenderData.category || 'IT & Cloud Infrastructure',
      estimatedValue: Number(tenderData.estimatedValue) || 1000000,
      stage: tenderData.stage || 'DISCOVERED',
      decision: 'PENDING',
      priority: tenderData.priority || 'HIGH',
      submissionDeadline: deadlineDate.toISOString(),
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
        return prev.map((t) => (t.id === newId ? { ...t, ...tenderData, summary: { ...t.summary, ...tenderData.summary } } : t));
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
      prev.map((t) => (t.id === tenderId ? { ...t, stage } : t))
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
  const [currentUser, setCurrentUser] = useState<UserProfile>(TEAM_PROFILES[0]);
  const [sharedLinks, setSharedLinks] = useState<DocumentShareLink[]>([]);
  const [activeDocForShare, setActiveDocForShare] = useState<{
    tenderId: string;
    doc: TenderDocument;
  } | null>(null);

  // Full access: every role has all operational permissions
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
    const doc = tender?.documents.find((d) => d.id === docId);

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
        setTenderDecision,
        addTask,
        moveTask,
        addDocument,
        signOffReviewTier,
        toggleRequirementStatus,
        submitTenderProof,
        currentUser,
        setCurrentUser,
        teamMembers: TEAM_PROFILES,
        canPerformAction,
        assignTask,
        addComment,
        deleteComment,
        shareDocument,
        sharedLinks,
        activeDocForShare,
        setActiveDocForShare,
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

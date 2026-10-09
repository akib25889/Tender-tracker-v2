import React, { useState, useMemo } from 'react';
import { useParams, NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  CheckSquare,
  Kanban,
  FolderLock,
  Send,
  Award,
  ChevronRight,
  Clock,
  User,
  Users,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit3,
  Printer,
  Archive,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Globe,
  Landmark,
  ShieldAlert,
  Building,
  CheckCircle2,
  UserCheck,
  Headphones,
  Phone,
  Mail,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Layers,
  Languages,
  UploadCloud,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { useTenderQuery } from '../hooks/useTenderQueries';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ReadinessBar } from '../components/ui/ReadinessBar';
import { ExportDropdown } from '../components/ui/ExportDropdown';
import { LiveCountdownBadge } from '../components/ui/LiveCountdownBadge';
import { TenderCommentsSection } from '../components/ui/TenderCommentsSection';
import { TenderSummaryDocument } from '../components/ui/TenderSummaryDocument';
import { TenderStage, RequirementStatus, TenderRequirement } from '../types/tender';
import { NotFoundPage } from './status/NotFoundPage';
import { getDualDeadlineInfo } from '../utils/dateTimeUtils';


export const TenderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    tenders,
    updateTenderStage,
    archiveTender,
    restoreTender,
    deleteTender,
    updateTenderAiChatLink,
    showSuccessNotification,
    toggleRequirementStatus,
    setActiveTenderIdForModal,
    setActiveRequirementForModal,
  } = useTenders();

  const [copiedRef, setCopiedRef] = useState(false);
  const [showFullSummaryDoc, setShowFullSummaryDoc] = useState(false);
  const [isAiChatModalOpen, setIsAiChatModalOpen] = useState(false);
  const [aiLinkInput, setAiLinkInput] = useState('');
  const [isSavingAiLink, setIsSavingAiLink] = useState(false);
  const [copiedAiLink, setCopiedAiLink] = useState(false);

  // Find the tender by route param ID or fetch via TanStack Query
  const { data: remoteTender, isLoading: isTenderLoading } = useTenderQuery(id);
  const tender = tenders.find((t) => t.id === id) || remoteTender;

  const dualCutoffInfo = useMemo(
    () => (tender ? getDualDeadlineInfo(tender.submissionDeadline) : null),
    [tender?.submissionDeadline]
  );

  const handleDeleteTender = () => {
    if (!tender) return;
    if (window.confirm(`Are you sure you want to permanently delete tender "${tender.title}" (${tender.id})?`)) {
      deleteTender(tender.id);
      navigate('/tenders');
    }
  };

  const handleCopyRef = () => {
    if (!tender) return;
    const textToCopy = tender.referenceNo || tender.id;
    navigator.clipboard.writeText(textToCopy);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleOpenAiModal = () => {
    if (!tender) return;
    setAiLinkInput(tender.aiChatShareLink || '');
    setIsAiChatModalOpen(true);
  };

  const handleSaveAiChatLink = async (e?: React.FormEvent) => {
    if (!tender) return;
    if (e) e.preventDefault();
    setIsSavingAiLink(true);
    try {
      await updateTenderAiChatLink(tender.id, aiLinkInput.trim());
      setIsAiChatModalOpen(false);
      showSuccessNotification('AI Chat knowledge link saved successfully.', 'Link Saved');
    } finally {
      setIsSavingAiLink(false);
    }
  };

  const handleClearAiChatLink = async () => {
    if (!tender) return;
    setIsSavingAiLink(true);
    try {
      await updateTenderAiChatLink(tender.id, '');
      setAiLinkInput('');
      setIsAiChatModalOpen(false);
      showSuccessNotification('AI Chat knowledge link removed.', 'Link Cleared');
    } finally {
      setIsSavingAiLink(false);
    }
  };

  const handleCopyAiLink = () => {
    if (!tender) return;
    if (tender.aiChatShareLink) {
      navigator.clipboard.writeText(tender.aiChatShareLink);
      setCopiedAiLink(true);
      setTimeout(() => setCopiedAiLink(false), 2000);
    }
  };

  // Dynamic Compliance Sentinel criteria
  const complianceItems: TenderRequirement[] = useMemo(() => {
    if (!tender) return [];
    // 1. Gather raw list of requirements from tender.requirements or submissionDocuments
    const rawItems: {
      id?: string;
      title: string;
      category?: string;
      status?: RequirementStatus;
      evidenceFile?: string;
      owner?: string;
    }[] =
      tender.requirements && tender.requirements.length > 0
        ? tender.requirements
        : tender.summary?.submissionDocuments && tender.summary.submissionDocuments.length > 0
        ? tender.summary.submissionDocuments.map((doc, idx) => ({
            id: `REQ-DOC-${idx + 1}`,
            title: doc,
            category: 'Statutory Document',
            status: 'PENDING' as RequirementStatus,
            owner: 'Tender Lead',
          }))
        : [];

    return rawItems.map((req, idx) => {
      const currentStatus = req.status || 'PENDING';

      // If user has already verified it and evidenceFile is explicitly recorded
      if (currentStatus === 'VERIFIED' && req.evidenceFile) {
        return {
          id: req.id || `REQ-DOC-${idx + 1}`,
          title: req.title,
          category: req.category || 'Statutory Document',
          status: 'VERIFIED' as RequirementStatus,
          evidenceFile: req.evidenceFile,
          owner: req.owner || 'Tender Lead',
        };
      }

      // Check if any document in tender.documents matches this requirement
      const reqClean = req.title.trim().toLowerCase();
      const reqAlpha = reqClean.replace(/[^a-z0-9]/g, '');

      const matchingDoc = tender.documents?.find((d) => {
        const fileBase = d.name.toLowerCase().replace(/\.[^/.]+$/, '');
        const fileAlpha = fileBase.replace(/[^a-z0-9]/g, '');

        if (req.evidenceFile && d.name.toLowerCase() === req.evidenceFile.toLowerCase()) {
          return true;
        }

        // If requirement is very short (e.g. "A", "B", "1"):
        if (reqAlpha.length <= 2) {
          return (
            fileAlpha === reqAlpha ||
            fileAlpha === `form${reqAlpha}` ||
            fileAlpha === `doc${reqAlpha}` ||
            fileAlpha === `schedule${reqAlpha}` ||
            fileBase === `form-${reqClean}` ||
            fileBase === `form_${reqClean}` ||
            fileBase === `form ${reqClean}`
          );
        }

        // For longer requirement names, check exact base name or word inclusion
        return (
          fileAlpha === reqAlpha ||
          fileBase === reqClean ||
          fileBase.includes(reqClean) ||
          fileAlpha.includes(reqAlpha) ||
          fileBase.startsWith(`${reqClean}_`) ||
          fileBase.startsWith(`${reqClean}-`) ||
          fileBase.endsWith(`_${reqClean}`) ||
          fileBase.endsWith(`-${reqClean}`) ||
          (reqClean.includes('technical') && fileBase.includes('technical')) ||
          (reqClean.includes('financial') && fileBase.includes('financial'))
        );
      });

      const isVerified = currentStatus === 'VERIFIED' || Boolean(matchingDoc);
      const evidence = req.evidenceFile || (matchingDoc ? matchingDoc.name : undefined);

      return {
        id: req.id || `REQ-DOC-${idx + 1}`,
        title: req.title,
        category: req.category || 'Statutory Document',
        status: (isVerified ? 'VERIFIED' : currentStatus) as RequirementStatus,
        evidenceFile: evidence,
        owner: req.owner || 'Tender Lead',
      };
    });
  }, [tender]);

  const clearedCount = useMemo(
    () => complianceItems.filter((r) => r.status === 'VERIFIED').length,
    [complianceItems]
  );
  const blockersCount = useMemo(
    () => complianceItems.filter((r) => r.status === 'BLOCKER').length,
    [complianceItems]
  );
  const totalCount = complianceItems.length;

  // Hooks above run on every render; bailing out before them would render
  // four fewer hooks while loading than once the tender arrives, which React
  // rejects with "Rendered fewer hooks than expected".
  if (!tender) {
    if (isTenderLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        </div>
      );
    }
    return <NotFoundPage resource="Tender Proposal" resourceId={id} />;
  }

  const handleCycleSentinelStatus = (reqId: string, currentStatus: RequirementStatus) => {
    // Intuitive cycle: PENDING -> VERIFIED -> BLOCKER -> PENDING
    const nextStatus: RequirementStatus =
      currentStatus === 'PENDING'
        ? 'VERIFIED'
        : currentStatus === 'VERIFIED'
        ? 'BLOCKER'
        : 'PENDING';

    const currentReq = tender.requirements?.find((r) => r.id === reqId);
    const evidenceToSet =
      nextStatus === 'VERIFIED'
        ? currentReq?.evidenceFile || (tender.documents && tender.documents.length > 0 ? tender.documents[0].name : undefined)
        : undefined;

    toggleRequirementStatus(tender.id, reqId, nextStatus, evidenceToSet);
  };

  const subNavTabs = [
    { label: 'Overview', path: `/tenders/${tender.id}`, exact: true, icon: FileText },
    { label: 'Compliance Matrix', path: `/tenders/${tender.id}/requirements`, icon: CheckSquare, badge: totalCount },
    { label: 'Task Board', path: `/tenders/${tender.id}/tasks`, icon: Kanban },
    { label: 'Document Vault', path: `/tenders/${tender.id}/documents`, icon: FolderLock, hasAlert: (tender.missingDocumentsCount || 0) > 0 },
    { label: 'JV Partners', path: `/tenders/${tender.id}/partners`, icon: Users },
    { label: 'Submission Ledger', path: `/tenders/${tender.id}/submission`, icon: Send },
    { label: 'Outcome & Debrief', path: `/tenders/${tender.id}/result`, icon: Award },
  ];

  const isOverview = location.pathname === `/tenders/${tender.id}`;

  const stages: { stage: TenderStage; label: string; sub: string }[] = [
    { stage: 'DISCOVERED', label: '01. Discovered', sub: 'Discovery & Intake' },
    { stage: 'SCREENING', label: '02. Screening', sub: 'Go / No-Go Gate' },
    { stage: 'UNDER_ANALYSIS', label: '03. Under Analysis', sub: 'TOR & Scope Audit' },
    { stage: 'PREPARATION', label: '04. Preparation', sub: 'Financials & BoQ' },
    { stage: 'SUBMITTED', label: '05. Submitted', sub: 'Receipt & Guarantee' },
  ];

  const stageKeys = stages.map((s) => s.stage);
  const currentStageIndex = stageKeys.indexOf(tender.stage);

  // Financial calculations
  const estVal = tender.estimatedValue || 0;
  const tenderCur = tender.currency || 'USD';
  const exRate = tender.exchangeRateToBdt || (tenderCur === 'BDT' ? 1.0 : 122.0);
  const bdtTotal = tender.estimatedValueBdt || (tenderCur === 'BDT' ? estVal : estVal * exRate);
  const bdtCrore = (bdtTotal / 10000000).toFixed(2);
  const earnestVal = tender.tenderSecurityAmount || 0;

  // Scope tags derived
  const scopeTags = tender.tags || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation & Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <NavLink to="/tenders" className="hover:text-[var(--accent)] transition-colors">
            Tenders
          </NavLink>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span className="font-mono font-bold text-[var(--text-primary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-default)]">
            {tender.id}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span className="font-semibold text-[var(--accent)]">Proposal Workspace</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Chat Session Quick Launch / Link Button */}
          {tender.aiChatShareLink ? (
            <div className="inline-flex items-center rounded-lg shadow-2xs border border-[var(--border-default)] bg-[var(--bg-subtle)] overflow-hidden">
              <a
                href={tender.aiChatShareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] transition-colors"
                title="Open active AI Chat session in new tab"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--text-secondary)] animate-pulse" />
                <span>Open AI Chat</span>
                <ExternalLink className="w-3 h-3 text-[var(--text-secondary)]" />
              </a>
              <button
                type="button"
                onClick={handleOpenAiModal}
                className="px-2 py-1.5 hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-l border-[var(--border-default)] transition-colors"
                title="Edit AI Chat Link"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenAiModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)] hover:border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] rounded-lg transition-colors shadow-2xs"
              title="Attach shared AI chat session so team won't re-upload files"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>+ Link AI Chat</span>
            </button>
          )}

          <Link
            to={`/registry?id=${tender.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] rounded-lg transition-colors shadow-2xs"
            title="Edit tender specifications in Registry"
          >
            <Edit3 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span>Edit</span>
          </Link>
          <button
            type="button"
            onClick={handleDeleteTender}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--crit-line)] hover:bg-[var(--crit-soft)] text-xs font-semibold text-[var(--crit)] rounded-lg transition-colors shadow-2xs"
            title="Delete this tender"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
          <ExportDropdown tender={tender} label="Export Brief" />
        </div>
      </div>

      {/* MASTER EXECUTIVE HEADER CARD */}
      <section className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-xs p-6 relative">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
          {/* Left Title & Status Badges */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-tight px-2.5 py-1 rounded-md bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--border-strong)]">
                {tender.id}
              </span>
              <StatusBadge stage={tender.stage} />
              <StatusBadge decision={tender.decision} />
              <LiveCountdownBadge
                deadlineStr={tender.submissionDeadline}
                daysRemaining={tender.daysRemaining}
                hoursRemaining={tender.hoursRemaining}
              />
              {tender.parentEoiId && (
                <Link
                  to={`/tenders/${tender.parentEoiId}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent-soft)] font-bold text-xs border border-[var(--accent-line)] transition-colors shadow-2xs"
                  title="View Parent EOI tender workspace"
                >
                  <span>🔗 Originating EOI: {tender.parentEoiId}</span>
                  <ArrowRight className="w-3 h-3 text-[var(--accent)]" />
                </Link>
              )}
              {tender.spawnedRfpId && (
                <Link
                  to={`/tenders/${tender.spawnedRfpId}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--ok-soft)] text-[var(--ok)] hover:bg-[var(--ok-soft)] font-bold text-xs border border-[var(--ok-line)] transition-colors shadow-2xs"
                  title="View Linked RFP tender workspace"
                >
                  <span>🚀 Linked RFP: {tender.spawnedRfpId}</span>
                  <ArrowRight className="w-3 h-3 text-[var(--ok)]" />
                </Link>
              )}
              {tender.tenderType === 'Request for Proposals (RFP)' && !tender.parentEoiId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold text-xs border border-[var(--border-default)]">
                  🏷️ Direct RFP Modality
                </span>
              )}
              {tender.tenderType === 'Expression of Interest (EOI)' && !tender.spawnedRfpId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-semibold text-xs border border-[var(--border-default)]">
                  📋 EOI Qualification Stage
                </span>
              )}
            </div>

            <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight leading-snug break-words">
              {tender.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                Authority: {tender.organization}
              </span>
              <span className="text-[var(--text-muted)] hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                Lead: <span className="text-[var(--text-primary)] font-semibold ml-0.5">{tender.leadOwner.name}</span>
              </span>
              <span className="text-[var(--text-muted)] hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 min-w-0 max-w-full sm:max-w-md">
                <Building className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                <span className="shrink-0">Scope:</span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] font-semibold text-xs border border-[var(--accent-line)] truncate"
                  title={tender.category || 'General Procurement'}
                >
                  {tender.category || 'General Procurement'}
                </span>
              </span>
              <span className="text-[var(--text-muted)] hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                <span>Cutoff:</span>
                {dualCutoffInfo ? (
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <span className="text-[var(--text-primary)] font-semibold ml-0.5">
                      {dualCutoffInfo.isPrimaryBd ? dualCutoffInfo.bdDisplay : dualCutoffInfo.intlDisplay}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border shadow-2xs ${
 dualCutoffInfo.isPrimaryBd
                          ? 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]'
                          : 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]'
                      }`}
                      title={
                        dualCutoffInfo.isPrimaryBd
                          ? 'Coordinated Universal Time (UTC / GMT)'
                          : 'Equivalent Bangladesh Standard Time (BST / UTC+6)'
                      }
                    >
                      <span>{dualCutoffInfo.isPrimaryBd ? "🌐 Int'l:" : '🇧🇩 BD Time:'}</span>
                      <span>{dualCutoffInfo.isPrimaryBd ? dualCutoffInfo.intlDisplay : dualCutoffInfo.bdDisplay}</span>
                    </span>
                  </span>
                ) : (
                  <span className="text-[var(--text-primary)] font-medium ml-0.5">TBD</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Executive Scorecard: Submission Readiness */}
          <div className="w-full sm:w-64 lg:w-72 shrink-0 lg:border-l lg:border-[var(--border-subtle)] lg:pl-6 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] whitespace-nowrap">
                  Submission Readiness
                </span>
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${
 tender.readinessScore >= 75
                      ? 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok-line)]'
                      : tender.readinessScore >= 50
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]'
                      : tender.readinessScore >= 40
                      ? 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]'
                      : 'bg-[var(--crit-soft)] text-[var(--crit)] border-[var(--crit-line)]'
                  }`}
                >
                  {tender.readinessScore}%
                </span>
              </div>
              <ReadinessBar score={tender.readinessScore} showLabel={false} />
              <div className="flex items-center justify-between text-[11px]">
                {(tender.missingDocumentsCount ?? 0) > 0 ? (
                  <span className="text-[10px] font-medium text-[var(--warn)] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[var(--warn)] shrink-0" />
                    <span>
                      {tender.missingDocumentsCount} Mandatory Doc{tender.missingDocumentsCount === 1 ? '' : 's'} Missing
                    </span>
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-[var(--ok)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ok)] shrink-0" />
                    <span>All Mandatory Docs Ready</span>
                  </span>
                )}
              </div>
            <div className="pt-1 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
              <span className="text-[10px] text-[var(--text-secondary)] font-mono">Gate Status</span>
              <Link
                to={`/tenders/${tender.id}/requirements`}
                className="text-[10px] font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                <span>Compliance Checklist →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 6-STAGE GATE VISUAL RIBBON & ADVANCEMENT CONTROLS */}
        <div className="mt-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">
                Current Lifecycle Stage:
              </span>
              <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 rounded border border-[var(--accent-line)]">
                Stage 0{currentStageIndex + 1} • {stages[currentStageIndex]?.label.split('. ')[1] || tender.stage}
              </span>
              {tender.stage === 'ARCHIVED' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-strong)]">
                  Archived Record
                </span>
              )}
            </div>

            {/* Advance / Back Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {currentStageIndex > 0 && tender.stage !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => updateTenderStage(tender.id, stageKeys[currentStageIndex - 1])}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to {stages[currentStageIndex - 1]?.label.split('. ')[1]}</span>
                </button>
              )}

              {currentStageIndex < stageKeys.length - 1 && tender.stage !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => updateTenderStage(tender.id, stageKeys[currentStageIndex + 1])}
                  className="px-4 py-1.5 text-xs font-semibold text-[var(--accent-on)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Advance to {stages[currentStageIndex + 1]?.label.split('. ')[1]?.toUpperCase()}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {tender.stage !== 'SUBMITTED' && tender.stage !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Send tender "${tender.title}" (${tender.id}) to Archive for record-keeping?`)) {
                      archiveTender(tender.id);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--crit)] rounded-lg border border-[var(--border-default)] hover:border-[var(--crit-line)] hover:bg-[var(--crit-soft)] transition-colors flex items-center gap-1.5"
                  title="Archive tender"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Send to Archive</span>
                </button>
              )}

              {tender.stage === 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => restoreTender(tender.id)}
                  className="px-4 py-1.5 text-xs font-semibold text-[var(--accent-on)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Tender</span>
                </button>
              )}
            </div>
          </div>

          {/* 5-Stage Gate Visual Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {stages.map((st, idx) => {
              const isPast = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;

              return (
                <div
                  key={st.stage}
                  className={`p-3 rounded-xl border flex flex-col justify-between min-h-[64px] transition-all ${
 isCurrent
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] shadow-xs'
                      : isPast
                      ? 'border-[var(--ok-line)] bg-[var(--ok-soft)]/80'
                      : 'border-[var(--border-default)] bg-[var(--bg-subtle)]/80 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className={isCurrent ? 'text-[var(--accent)]' : isPast ? 'text-[var(--ok)]' : 'text-[var(--text-secondary)]'}>
                      {st.label}
                    </span>
                    {isPast ? (
                      <Check className="w-3.5 h-3.5 text-[var(--ok)]" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--bg-muted)]" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-medium mt-1.5 ${
 isCurrent ? 'text-[var(--accent)] font-semibold' : isPast ? 'text-[var(--ok)]' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {isCurrent ? 'Status: In-Progress' : st.sub}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* WORKSPACE SUB-NAVIGATION TABS */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {subNavTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  end={tab.exact}
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                      isActive
                        ? 'bg-[var(--accent)] text-[var(--accent-on)] shadow-xs font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface)]/20 text-current font-bold">
                      {tab.badge}
                    </span>
                  )}
                  {tab.hasAlert && (
                    <span className="w-2 h-2 rounded-full bg-[var(--crit)]" />
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <span>Last synchronized recently</span>
          </div>
        </div>
      </section>

      {/* OVERVIEW TAB CONTENT OR NESTED SUB-ROUTES */}
      {isOverview ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Corrigendum / Amendment Active Notification Banner (Req #30) */}
          {tender.amendments && tender.amendments.length > 0 && (
            <div className="p-4 bg-[var(--warn-soft)]/90 border-2 border-[var(--warn-line)] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--warn)] text-[var(--accent-on)] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-[var(--warn-soft)]/90 text-[var(--warn)] border border-[var(--warn-line)]/50">
                      Corrigendum / Addendum Active
                    </span>
                    <span className="text-xs font-semibold text-[var(--warn)]">
                      {tender.amendments.length} Amendment{tender.amendments.length > 1 ? 's' : ''} Issued by Client
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[var(--warn)] mt-1">
                    <strong>Latest: {tender.amendments[tender.amendments.length - 1].corrigendumNumber}</strong> — {tender.amendments[tender.amendments.length - 1].title}
                    {tender.amendments[tender.amendments.length - 1].isDeadlineExtension && (
                      <span className="ml-1.5 text-[var(--ok)] font-bold bg-[var(--ok-soft)] px-2 py-0.5 rounded border border-[var(--ok-line)]">
                        ✓ Submission Deadline Extended: {tender.submissionDeadline}
                      </span>
                    )}
                  </p>
                  {tender.amendments[tender.amendments.length - 1].rulesChanged && (
                    <p className="text-[11px] text-[var(--warn)] line-clamp-1 mt-0.5">
                      Rules Modified: {tender.amendments[tender.amendments.length - 1].rulesChanged}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <NavLink
                  to={`/tenders/${tender.id}/requirements`}
                  className="px-3 py-1.5 bg-[var(--warn)] hover:bg-[var(--warn)] text-[var(--accent-on)] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>View in Clauses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>
          )}

          {/* HIGH-DENSITY WORKSPACE GRID (Left 8 Cols: Specs, Right 4 Cols: Compliance Sentinel) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Column 1: Core Tender Specifications & Contract Details (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-xs overflow-hidden">
                {/* Header bar */}
                <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-subtle)]">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shrink-0" />
                    <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight shrink-0 whitespace-nowrap">
                      Tender Specification Matrix &amp; Identity
                    </h3>
                    <span
                      className="tt-tag max-w-[220px] sm:max-w-xs md:max-w-md truncate"
                      title={tender.category || 'Software / IT Related'}
                    >
                      {tender.category || 'Software / IT Related'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFullSummaryDoc(!showFullSummaryDoc)}
                      className="px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="Toggle 3-page formal document"
                    >
                      <FileText className="w-3 h-3 text-[var(--text-secondary)]" />
                      <span>{showFullSummaryDoc ? 'Hide Full Brief' : 'View Full Brief'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-3 h-3 text-[var(--text-secondary)]" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                </div>

                {/* Specification Matrix */}
                <div>
                  <div className="tt-defs">
                    {/* Tender Type / Invitation */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Tender Type / Invitation
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
                          {tender.tenderType || tender.summary?.tenderType || '—'}
                        </span>
                        <span className="tt-tag">
                          Bidding Mode
                        </span>
                      </div>
                    </div>

                    {/* Procurement Method */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Procurement Method
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ok)]" />
                          {tender.procurementMethod || tender.summary?.procurementMethod || '—'}
                        </span>
                        <span className="tt-tag">
                          Method
                        </span>
                      </div>
                    </div>

                    {/* Evaluation Method */}
                    {(tender.evaluationMethod || tender.summary?.evaluationMethod) && (
                      <div className="tt-def">
                        <span className="tt-def-label">
                          Evaluation Method
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                            {tender.evaluationMethod || tender.summary?.evaluationMethod}
                          </span>
                          <span className="tt-tag">
                            Evaluation
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Budget Type */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Budget Type
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-[var(--accent)]" />
                          {tender.budgetType || tender.summary?.budgetType || '—'}
                        </span>
                        <span className="tt-tag">
                          Budget
                        </span>
                      </div>
                    </div>

                    {/* Source of Fund (Financier) */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Source of Fund (Financier)
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          {tender.sourceOfFund || tender.summary?.sourceOfFund || '—'}
                        </span>
                        <span className="text-[10px] text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded font-mono font-bold border border-[var(--accent-line)]">
                          Financier
                        </span>
                      </div>
                    </div>

                    {/* Country / Territory */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Country / Territory
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[var(--accent)]" />
                          {tender.country || '—'}
                        </span>
                        <span className="tt-tag">
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Official Project Language(s) (Req #29) */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Official Language(s) of Bid
                      </span>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <Languages className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                          {((tender.languages && tender.languages.length > 0)
                            ? tender.languages
                            : [tender.language || 'English']
                          ).map((lang) => (
                            <span
                              key={lang}
                              className="text-[11px] font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-strong)] px-2 py-0.5 rounded shadow-2xs"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                        <span className="tt-tag">
                          {((tender.languages && tender.languages.length > 0) ? tender.languages.length : 1)} Lang
                        </span>
                      </div>
                    </div>

                    {/* Procurement Portal & Source */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Procurement Portal &amp; Source
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)]" />
                          {tender.summary?.portal || tender.portalUrl || '—'}
                        </span>
                        {tender.portalUrl && (
                          <a
                            href={tender.portalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-semibold text-[var(--accent)] hover:underline flex items-center gap-0.5"
                          >
                            Link Source →
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Procuring Authority / Client */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Procuring Authority / Client
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          {tender.organization}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-mono">{tender.organizationType || 'Procuring Entity'}</span>
                      </div>
                    </div>

                    {/* Official Reference / Tender No. */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Official Reference / Tender No.
                      </span>
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="text-xs font-mono font-bold text-[var(--text-primary)] break-all" title={tender.referenceNo || tender.id}>
                          {tender.referenceNo || tender.id}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyRef}
                          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-muted)] transition-colors shrink-0"
                          title="Copy reference number"
                        >
                          {copiedRef ? (
                            <Check className="w-3.5 h-3.5 text-[var(--ok)]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Procurement Stage Lineage & Modality */}
                    <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] sm:col-span-2">
                      <span className="tt-def-label">
                        Procurement Stage Lineage &amp; Modality
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[var(--accent)]" />
                          <span className="text-xs font-semibold text-[var(--text-primary)]">
                            {tender.parentEoiId
                              ? `2-Stage Procurement: Spawned from Originating EOI #${tender.parentEoiId}`
                              : tender.spawnedRfpId
                              ? `2-Stage Procurement: Parent EOI (Linked RFP #${tender.spawnedRfpId} active)`
                              : tender.tenderType === 'Request for Proposals (RFP)'
                              ? 'Direct RFP: 1-Stage Open Competitive Modality (No Preceding EOI)'
                              : tender.tenderType === 'Expression of Interest (EOI)'
                              ? 'EOI Qualification Stage: Prequalification for Upcoming RFP'
                              : 'Standard Single-Stage Procurement Modality'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {tender.parentEoiId && (
                            <Link
                              to={`/tenders/${tender.parentEoiId}`}
                              className="px-2.5 py-1 text-[11px] font-bold text-[var(--accent)] bg-[var(--bg-surface)] border border-[var(--accent-line)] hover:bg-[var(--accent-soft)] rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <span>View Parent EOI ({tender.parentEoiId})</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          {tender.spawnedRfpId && (
                            <Link
                              to={`/tenders/${tender.spawnedRfpId}`}
                              className="px-2.5 py-1 text-[11px] font-bold text-[var(--ok)] bg-[var(--bg-surface)] border border-[var(--ok-line)] hover:bg-[var(--ok-soft)] rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <span>Open Linked RFP ({tender.spawnedRfpId})</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          {!tender.parentEoiId && !tender.spawnedRfpId && (
                            <span className="tt-tag">
                              Modality
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Estimated Tender Value (Gross) */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Estimated Tender Value (Gross)
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-[var(--ok)]">
                          {estVal > 0 ? (
                            <>
                              {tenderCur} {estVal.toLocaleString()}{' '}
                              <span className="text-[10px] font-normal text-[var(--text-secondary)] font-sans">
                                (≈ BDT {bdtCrore} Crore)
                              </span>
                            </>
                          ) : (
                            'Not specified'
                          )}
                        </span>
                        <span className="tt-tag">
                          {estVal > 0 ? 'Budget Estimate' : 'Unestimated'}
                        </span>
                      </div>
                    </div>

                    {/* Tender Security (Earnest Money) */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Tender Security (Earnest Money)
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                          {earnestVal > 0 ? (
                            <>
                              {tenderCur} {earnestVal.toLocaleString()}{' '}
                              <span className="text-[10px] font-normal text-[var(--text-secondary)] font-sans">
                                (Bank Guarantee required)
                              </span>
                            </>
                          ) : (
                            'Not specified / Not required'
                          )}
                        </span>
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded border border-[var(--border-default)]">
                          {earnestVal > 0 ? 'Bank Guarantee' : 'Not required'}
                        </span>
                      </div>
                    </div>

                    {/* Procurement Officer / Contact Person */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Procurement Officer / Contact
                      </span>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                            {tender.procurementManagerName || tender.summary?.procurementManager?.name || 'Not specified'}
                          </span>
                          <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5">
                            {tender.procurementManagerDesignation || tender.summary?.procurementManager?.designation || '—'}
                          </span>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px]">
                            {(tender.procurementManagerPhone || tender.summary?.procurementManager?.phone) && (
                              <a
                                href={`tel:${tender.procurementManagerPhone || tender.summary?.procurementManager?.phone}`}
                                className="text-[var(--accent)] hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                {tender.procurementManagerPhone || tender.summary?.procurementManager?.phone}
                              </a>
                            )}
                            {(tender.procurementManagerEmail || tender.summary?.procurementManager?.email) && (
                              <a
                                href={`mailto:${tender.procurementManagerEmail || tender.summary?.procurementManager?.email}`}
                                className="text-[var(--accent)] hover:underline flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3" />
                                {tender.procurementManagerEmail || tender.summary?.procurementManager?.email}
                              </a>
                            )}
                          </div>
                        </div>
                        <span className="tt-tag shrink-0">
                          Direct Desk
                        </span>
                      </div>
                    </div>

                    {/* Tender Helpline & Support Desk */}
                    <div className="tt-def">
                      <span className="tt-def-label">
                        Tender Helpline &amp; Support Desk
                      </span>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                            <Headphones className="w-3.5 h-3.5 text-[var(--accent)]" />
                            {tender.helplinePhone || tender.summary?.helpline?.phone || 'Not specified'}
                          </span>
                          <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5">
                            {tender.helplineHours || tender.summary?.helpline?.hours || '—'}
                          </span>
                          {(tender.helplineEmail || tender.summary?.helpline?.email) && (
                            <a
                              href={`mailto:${tender.helplineEmail || tender.summary?.helpline?.email}`}
                              className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 mt-1"
                            >
                              <Mail className="w-3 h-3" />
                              {tender.helplineEmail || tender.summary?.helpline?.email}
                            </a>
                          )}
                        </div>
                        <span className="tt-tag shrink-0">
                          Helpdesk
                        </span>
                      </div>
                    </div>

                    {/* Pre-Bid Meeting Date (if available) */}
                    {tender.preBidMeetingDate && (
                      <div className="tt-def">
                        <span className="tt-def-label">
                          Pre-Bid Meeting Date
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--text-primary)]">
                            {new Date(tender.preBidMeetingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] font-medium text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded">
                            Hybrid / Zoom
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Final Closing Deadline */}
                    <div className="p-3.5 rounded-xl bg-[var(--warn-soft)] border border-[var(--warn-line)]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--warn)] block mb-1">
                        Submission Deadline &amp; Closing
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-[var(--warn)]">
                            {dualCutoffInfo ? (dualCutoffInfo.isPrimaryBd ? dualCutoffInfo.bdDisplay : dualCutoffInfo.intlDisplay) : 'TBD'}
                          </span>
                          <span className="text-[10px] font-bold font-mono bg-[var(--warn-soft)] text-[var(--warn)] px-1.5 py-0.5 rounded">
                            T-{tender.daysRemaining} Days
                          </span>
                        </div>
                        {dualCutoffInfo && (
                          <div
                            className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border ${
 dualCutoffInfo.isPrimaryBd
                                ? 'bg-[var(--bg-subtle)]/80 text-[var(--text-secondary)] border-[var(--border-default)]/80'
                                : 'bg-[var(--accent-soft)]/80 text-[var(--accent)] border-[var(--accent-line)]/80'
                            }`}
                          >
                            <span className="font-sans font-semibold">
                              {dualCutoffInfo.isPrimaryBd ? "🌐 Int'l Time:" : '🇧🇩 BD Time:'}
                            </span>
                            <span>{dualCutoffInfo.isPrimaryBd ? dualCutoffInfo.intlDisplay : dualCutoffInfo.bdDisplay}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scope Synopsis Block */}
                  <div className="mt-5 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                        Brief Scope of Work &amp; Deliverables
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                        Extracted from Section 6 (Schedule of Requirements)
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {tender.scope || tender.summary?.mainIdea || 'No scope synopsis provided for this tender.'}
                    </p>
                    {scopeTags.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {scopeTags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] px-2.5 py-0.5 rounded-md shadow-2xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FINANCIAL SCENARIOS & CASH FLOW ARCHITECTURE CARD */}
              <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-subtle)]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                      Financial Scenarios, Milestones &amp; Cash Flow Architecture
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] uppercase">
                      {tender.financialModel?.paymentScenario?.replace(/_/g, ' ') || 'MILESTONE BASED'}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
 (tender.financialModel?.workingCapitalRisk || 'MEDIUM') === 'LOW'
                          ? 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok-line)]'
                          : (tender.financialModel?.workingCapitalRisk || 'MEDIUM') === 'HIGH'
                          ? 'bg-[var(--crit-soft)] text-[var(--crit)] border-[var(--crit-line)]'
                          : 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]'
                      }`}
                    >
                      {(tender.financialModel?.workingCapitalRisk || 'MEDIUM')} RISK
                    </span>
                  </div>

                  <Link
                    to={`/registry?id=${tender.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent)] hover:underline"
                  >
                    <span>Configure in Registry</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-6 space-y-5">
                  {/* Top 4 Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                      <span className="tt-def-label">
                        Advance Mobilization
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)] block">
                        {tender.financialModel?.advancePayment?.enabled
                          ? `${tender.financialModel.advancePayment.percentage}% (${tenderCur} ${(tender.financialModel.advancePayment.amount || Math.round(estVal * tender.financialModel.advancePayment.percentage / 100)).toLocaleString()})`
                          : 'None (0%)'}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {tender.financialModel?.advancePayment?.bankGuaranteeRequired ? '100% APG Required' : 'No BG required'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                      <span className="tt-def-label">
                        Retention Withholding
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)] block">
                        {tender.financialModel?.penaltiesAndDeductions?.retentionMoney?.enabled
                          ? `${tender.financialModel.penaltiesAndDeductions.retentionMoney.percentage}% Withheld`
                          : 'None (0%)'}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {tender.financialModel?.penaltiesAndDeductions?.retentionMoney?.enabled
                          ? `${tender.financialModel?.penaltiesAndDeductions?.retentionMoney?.dlpMonths || 12}m Defects Liability`
                          : 'No retention deduction'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                      <span className="tt-def-label">
                        Liquidated Damages Cap
                      </span>
                      <span className="text-xs font-bold text-[var(--crit)] block">
                        {tender.financialModel?.penaltiesAndDeductions?.liquidatedDamages?.maxCapPercentage
                          ? `Max ${tender.financialModel.penaltiesAndDeductions.liquidatedDamages.maxCapPercentage}% Cap`
                          : 'Not specified'}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {tender.financialModel?.penaltiesAndDeductions?.liquidatedDamages?.rate
                          ? `${tender.financialModel.penaltiesAndDeductions.liquidatedDamages.rate}% / ${tender.financialModel?.penaltiesAndDeductions?.liquidatedDamages?.frequency === 'PER_DAY' ? 'day' : 'week'}`
                          : 'Standard terms'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                      <span className="tt-def-label">
                        Statutory Deductions
                      </span>
                      <span className="text-xs font-bold text-[var(--text-secondary)] block">
                        {tender.financialModel?.penaltiesAndDeductions?.taxDeductionAtSourcePercent || tender.financialModel?.penaltiesAndDeductions?.vatDeductionAtSourcePercent
                          ? `TDS ${tender.financialModel?.penaltiesAndDeductions?.taxDeductionAtSourcePercent || 0}% • VDS ${tender.financialModel?.penaltiesAndDeductions?.vatDeductionAtSourcePercent || 0}%`
                          : 'Standard statutory rates'}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        At source invoice deduction
                      </span>
                    </div>
                  </div>

                  {/* Milestone Schedule Table */}
                  {tender.financialModel?.milestones && tender.financialModel.milestones.length > 0 ? (
                    <div className="rounded-xl border border-[var(--border-default)] overflow-hidden">
                      <div className="px-4 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
                          Milestone Disbursement Schedule &amp; Approval Gates
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-[var(--accent)]">
                          Total Milestones: {tender.financialModel.milestones.length}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-semibold border-b border-[var(--border-default)]">
                            <tr>
                              <th className="py-2 px-3 w-10">#</th>
                              <th className="py-2 px-3">Milestone / Deliverable</th>
                              <th className="py-2 px-3">Approval Gate / Trigger</th>
                              <th className="py-2 px-3 text-right">Share %</th>
                              <th className="py-2 px-3 text-right">Projected Value</th>
                              <th className="py-2 px-3 text-center">Turnaround</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-subtle)]">
                            {tender.financialModel.milestones.map((m, idx) => (
                              <tr key={idx} className="hover:bg-[var(--bg-subtle)]/80 transition-colors">
                                <td className="py-2 px-3 font-mono text-[var(--text-secondary)]">{m.milestoneNumber || idx + 1}</td>
                                <td className="py-2 px-3">
                                  <div className="font-semibold text-[var(--text-primary)]">{m.name}</div>
                                  {m.deliverable && <div className="text-[10px] text-[var(--text-secondary)]">{m.deliverable}</div>}
                                </td>
                                <td className="py-2 px-3 text-[var(--text-secondary)]">{m.paymentTrigger || 'Client sign-off'}</td>
                                <td className="py-2 px-3 text-right font-bold text-[var(--text-primary)]">{m.percentage}%</td>
                                <td className="py-2 px-3 text-right font-mono font-semibold text-[var(--accent)]">
                                  {tenderCur} {(m.amount || Math.round(estVal * m.percentage / 100)).toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-center font-mono text-[11px] text-[var(--text-secondary)]">
                                  {m.clientReviewDays || 14}d rev / {m.paymentProcessingDays || 30}d pay
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-center">
                      <p className="text-xs text-[var(--text-secondary)]">
                        No milestone disbursement schedule configured for this tender. You can configure milestones and payment triggers in the Registry.
                      </p>
                      <Link
                        to={`/registry?id=${tender.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline mt-2"
                      >
                        <span>Add Milestones in Registry</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {/* SaaS / Recurring Revenue Card if applicable */}
                  {tender.financialModel?.subscriptionModel && (tender.financialModel.subscriptionModel.calculatedTcv > 0 || tender.financialModel.subscriptionModel.annualBaseFee > 0) && (
                    <div className="p-4 rounded-xl bg-[var(--ok-soft)] border border-[var(--ok-line)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[var(--ok)] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[var(--ok)]" />
                          SaaS &amp; Recurring Revenue Architecture
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-[var(--ok-soft)] text-[var(--ok)] px-2 py-0.5 rounded border border-[var(--ok-line)]">
                            TCV: {tenderCur} {tender.financialModel.subscriptionModel.calculatedTcv.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-[var(--ok-soft)] text-[var(--ok)] px-2 py-0.5 rounded border border-[var(--ok-line)]">
                            ACV: {tenderCur} {tender.financialModel.subscriptionModel.calculatedAcv.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[var(--ok)]">
                        <div>Model: <span className="font-semibold">{tender.financialModel.subscriptionModel.pricingModel?.replace(/_/g, ' ')}</span></div>
                        <div>Billing: <span className="font-semibold">{tender.financialModel.subscriptionModel.billingFrequency}</span></div>
                        <div>Contract Term: <span className="font-semibold">{tender.financialModel.subscriptionModel.durationYears} Years</span></div>
                        <div>Escalation: <span className="font-semibold">{tender.financialModel.subscriptionModel.annualEscalationRate}% p.a.</span></div>
                      </div>
                    </div>
                  )}

                  {/* Expected Cash Flow Realization Waterfall Ledger */}
                  {estVal > 0 && (
                    <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-3">
                        Expected Net Cash Flow Realization Waterfall
                      </span>
                      {(() => {
                        const advanceAmount = tender.financialModel?.advancePayment?.enabled
                          ? (tender.financialModel.advancePayment.amount || Math.round(estVal * tender.financialModel.advancePayment.percentage / 100))
                          : 0;
                        const retentionAmount = tender.financialModel?.penaltiesAndDeductions?.retentionMoney?.enabled
                          ? Math.round(estVal * (tender.financialModel.penaltiesAndDeductions.retentionMoney.percentage || 0) / 100)
                          : 0;
                        const taxRate = (tender.financialModel?.penaltiesAndDeductions?.taxDeductionAtSourcePercent || 0) + (tender.financialModel?.penaltiesAndDeductions?.vatDeductionAtSourcePercent || 0);
                        const taxAmount = Math.round(estVal * taxRate / 100);
                        const netRealized = estVal - retentionAmount - taxAmount;

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                            <div className="p-2.5 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
                              <span className="text-[10px] text-[var(--text-secondary)] block">Gross Contract Value</span>
                              <span className="text-xs font-bold font-mono text-[var(--text-primary)]">{tenderCur} {estVal.toLocaleString()}</span>
                            </div>
                            <div className="p-2.5 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
                              <span className="text-[10px] text-[var(--accent)] block">(+) Advance Mobilization</span>
                              <span className="text-xs font-bold font-mono text-[var(--accent)]">
                                {tenderCur} {advanceAmount.toLocaleString()}
                              </span>
                            </div>
                            <div className="p-2.5 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
                              <span className="text-[10px] text-[var(--warn)] block">(-) Retention Holdback</span>
                              <span className="text-xs font-bold font-mono text-[var(--warn)]">
                                {tenderCur} {retentionAmount.toLocaleString()}
                              </span>
                            </div>
                            <div className="p-2.5 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]">
                              <span className="text-[10px] text-[var(--crit)] block">(-) Statutory TDS &amp; VDS</span>
                              <span className="text-xs font-bold font-mono text-[var(--crit)]">
                                {tenderCur} {taxAmount.toLocaleString()}
                              </span>
                            </div>
                            <div className="p-2.5 bg-[var(--accent-soft)] rounded-lg border border-[var(--accent-line)]">
                              <span className="text-[10px] font-bold text-[var(--accent)] block">(=) Net Cash Realized</span>
                              <span className="text-xs font-bold font-mono text-[var(--accent)]">
                                {tenderCur} {netRealized.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Compliance Sentinel & Mandatory Document Checklist (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-xs p-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
 blockersCount > 0
                          ? 'bg-[var(--crit)] animate-ping'
                          : clearedCount === totalCount && totalCount > 0
                          ? 'bg-[var(--ok)]'
                          : 'bg-[var(--warn)] animate-pulse'
                      }`}
                    />
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Compliance Sentinel</h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors ${
 totalCount === 0
                        ? 'text-[var(--text-secondary)] bg-[var(--bg-subtle)] border-[var(--border-strong)]'
                        : blockersCount > 0
                        ? 'text-[var(--crit)] bg-[var(--crit-soft)] border-[var(--crit-line)]'
                        : clearedCount === totalCount
                        ? 'text-[var(--ok)] bg-[var(--ok-soft)] border-[var(--ok-line)]'
                        : 'text-[var(--warn)] bg-[var(--warn-soft)] border-[var(--warn-line)]'
                    }`}
                  >
                    {totalCount === 0
                      ? '0 Configured'
                      : blockersCount > 0
                      ? `${clearedCount} / ${totalCount} Cleared (${blockersCount} Blocker${blockersCount > 1 ? 's' : ''})`
                      : clearedCount === totalCount
                      ? `${clearedCount} / ${totalCount} Cleared (All Ready)`
                      : `${clearedCount} / ${totalCount} Cleared`}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-4 leading-normal">
                  Mandatory qualification gatekeeper. Tenders failing these criteria are subject to immediate technical disqualification.
                </p>

                {/* Sentinel Checklist */}
                {complianceItems.length === 0 ? (
                  <div className="p-4 bg-[var(--bg-subtle)] rounded-xl border border-dashed border-[var(--border-strong)] text-center space-y-2">
                    <p className="text-xs text-[var(--text-secondary)]">
                      No compliance requirements registered yet for this tender.
                    </p>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <Link
                        to={`/registry?edit=${tender.id}`}
                        className="w-full py-1.5 px-2 bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>+ Add in Registry (Tab 5)</span>
                      </Link>
                      <Link
                        to={`/tenders/${tender.id}/requirements`}
                        className="w-full py-1.5 px-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors border border-[var(--border-strong)]"
                      >
                        <span>Open Compliance Matrix</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {complianceItems.slice(0, 6).map((req) => {
                      const isVerified = req.status === 'VERIFIED';
                      const isBlocker = req.status === 'BLOCKER';

                      return (
                        <div
                          key={req.id}
                          className={`p-3 rounded-xl border transition-all space-y-2 ${
                            isVerified
                              ? 'border-[var(--ok-line)] bg-[var(--ok-soft)]/50'
                              : isBlocker
                              ? 'border-[var(--crit-line)] bg-[var(--crit-soft)]/50'
                              : 'border-[var(--warn-line)] bg-[var(--warn-soft)]/50'
                          }`}
                        >
                          {/* Top: Status Icon + Title + Status Pill */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => handleCycleSentinelStatus(req.id, req.status)}
                                title="Click to cycle status (Verified / Pending / Blocker)"
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 cursor-pointer transition-transform hover:scale-110 shadow-2xs ${
                                  isVerified
                                    ? 'bg-[var(--ok-soft)] text-[var(--ok)]'
                                    : isBlocker
                                    ? 'bg-[var(--crit-soft)] text-[var(--crit)]'
                                    : 'bg-[var(--warn-soft)] text-[var(--warn)]'
                                }`}
                              >
                                {isVerified ? '✓' : '!'}
                              </button>
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold text-[var(--text-primary)] block leading-snug break-words" title={req.title}>
                                  {req.title}
                                </span>
                                <span className="text-[10px] text-[var(--text-secondary)] block truncate mt-0.5">
                                  {req.evidenceFile
                                    ? `Evidence: ${req.evidenceFile}`
                                    : req.category
                                    ? `${req.category} • ${isVerified ? 'Cleared' : isBlocker ? 'Disqualification risk' : 'Pending verification'}`
                                    : isVerified
                                    ? 'Verified & Ready'
                                    : 'Pending verification'}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded shrink-0 border ${
                                isVerified
                                  ? 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok-line)]'
                                  : isBlocker
                                  ? 'bg-[var(--crit-soft)] text-[var(--crit)] border-[var(--crit-line)]'
                                  : 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]'
                              }`}
                            >
                              {isVerified ? 'Cleared' : isBlocker ? 'Blocker' : 'Pending'}
                            </span>
                          </div>

                          {/* Bottom Action Footer */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border-subtle)] text-[11px]">
                            {isVerified ? (
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] font-semibold text-[var(--ok)] flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Compliance Cleared</span>
                                </span>
                                {req.evidenceFile && (
                                  <Link
                                    to={`/tenders/${tender.id}/documents`}
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--accent)] hover:underline"
                                    title={`View ${req.evidenceFile} in vault`}
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>View Evidence</span>
                                  </Link>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full gap-2">
                                <span className="text-[10px] text-[var(--text-muted)] font-mono">Evidence:</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {tender.documents && tender.documents.length > 0 && (
                                    <select
                                      aria-label={`Link file to ${req.title}`}
                                      value=""
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          toggleRequirementStatus(tender.id, req.id, 'VERIFIED', e.target.value);
                                          showSuccessNotification(`Attached "${e.target.value}" to ${req.title}`, 'Requirement Cleared');
                                        }
                                      }}
                                      className="px-2 py-1 text-[10px] font-semibold bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)] rounded-md hover:border-[var(--accent)] cursor-pointer max-w-[120px] truncate"
                                      title="Link an already uploaded document from vault"
                                    >
                                      <option value="">Link File...</option>
                                      {tender.documents.map((d) => (
                                        <option key={d.id} value={d.name}>
                                          {d.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTenderIdForModal(tender.id);
                                      setActiveRequirementForModal({ id: req.id, title: req.title });
                                    }}
                                    className={`px-2.5 py-1 text-[10px] font-semibold text-[var(--accent-on)] rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-xs ${
                                      isBlocker
                                        ? 'bg-[var(--crit)] hover:bg-[var(--crit)]'
                                        : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'
                                    }`}
                                    title={`Upload evidence file specifically for ${req.title}`}
                                  >
                                    <UploadCloud className="w-3 h-3" />
                                    <span>Upload</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {complianceItems.length > 6 && (
                      <Link
                        to={`/tenders/${tender.id}/requirements`}
                        className="block text-center text-[11px] font-semibold text-[var(--accent)] hover:underline pt-1"
                      >
                        + View all {complianceItems.length} requirements in Compliance Matrix →
                      </Link>
                    )}
                  </div>
                )}

                {/* Sentinel CTA Button */}
                <Link
                  to={`/tenders/${tender.id}/requirements`}
                  className="w-full mt-4 py-2 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Launch Full Compliance Audit ({totalCount})</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Toggleable Formal 3-Page Tender Summary Document */}
          {showFullSummaryDoc && (
            <div className="space-y-4 p-6 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-2xl animate-scaleIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Formal 3-Page Executive Summary
                </h4>
                <button
                  type="button"
                  onClick={() => setShowFullSummaryDoc(false)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold"
                >
                  Close Document View ✕
                </button>
              </div>
              <TenderSummaryDocument tender={tender} />
            </div>
          )}

          {/* TEAM DISCUSSION & PROPOSAL REMARKS FEED (Full Width) */}
          <div className="w-full">
            <TenderCommentsSection tender={tender} />
          </div>
        </div>
      ) : (
        <div className="pt-6 sm:pt-8">
          <Outlet />
        </div>
      )}

      {/* AI Chat & Knowledge Link Modal */}
      {isAiChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--text-primary)]/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleIn">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">AI Chat &amp; Knowledge Link</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Tender: <span className="font-semibold text-[var(--text-primary)]">{tender.id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiChatModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Link an active AI conversation or notebook (e.g. <strong>ChatGPT Shared Chat</strong>, <strong>Google NotebookLM</strong>, <strong>Claude Project</strong>, or <strong>Gemini</strong>) where this tender&apos;s RFP, TOR, and BOQ files have already been indexed. Team members can consult it directly without re-uploading documents.
            </p>

            <form onSubmit={handleSaveAiChatLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                  AI Chat / Notebook Share URL
                </label>
                <input
                  type="url"
                  value={aiLinkInput}
                  onChange={(e) => setAiLinkInput(e.target.value)}
                  placeholder="https://chatgpt.com/share/... or https://notebooklm.google.com/notebook/..."
                  className="w-full px-3.5 py-2.5 text-xs text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[var(--border-default)] focus:border-[var(--border-default)] placeholder:text-[var(--text-muted)] font-mono transition-colors"
                  autoFocus
                />
                <div className="flex items-center gap-2 mt-2 text-[11px] text-[var(--text-secondary)]">
                  <span className="font-semibold">Compatible:</span>
                  <span>ChatGPT Shares</span> • <span>NotebookLM</span> • <span>Claude Projects</span> • <span>Gemini</span>
                </div>
              </div>

              {tender.aiChatShareLink && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)]/80 border border-[var(--border-default)] text-xs">
                  <div className="truncate max-w-[260px] text-[var(--text-secondary)] font-mono text-[11px]">
                    {tender.aiChatShareLink}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyAiLink}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)]/50 rounded-md text-[11px] font-semibold text-[var(--text-secondary)] transition-colors"
                    >
                      {copiedAiLink ? <Check className="w-3 h-3 text-[var(--ok)]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAiLink ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={tender.aiChatShareLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle)] text-[var(--accent-on)] rounded-md text-[11px] font-semibold transition-colors"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                {tender.aiChatShareLink ? (
                  <button
                    type="button"
                    onClick={handleClearAiChatLink}
                    disabled={isSavingAiLink}
                    className="text-xs font-semibold text-[var(--crit)] hover:text-[var(--crit)] hover:underline transition-colors"
                  >
                    Remove Link
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAiChatModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAiLink}
                    className="px-4 py-2 text-xs font-semibold text-[var(--accent-on)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle)] disabled:opacity-50 rounded-xl transition-colors shadow-2xs inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isSavingAiLink ? 'Saving...' : 'Save AI Link'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

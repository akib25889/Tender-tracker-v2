import React, { useState } from 'react';
import { useParams, NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  CheckSquare,
  Kanban,
  FolderLock,
  FileCheck2,
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
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { ReadinessBar } from '../components/ui/ReadinessBar';
import { ExportDropdown } from '../components/ui/ExportDropdown';
import { TenderCommentsSection } from '../components/ui/TenderCommentsSection';
import { TenderSummaryDocument } from '../components/ui/TenderSummaryDocument';
import { TenderStage } from '../types/tender';

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
    formatCurrency,
  } = useTenders();

  const [copiedRef, setCopiedRef] = useState(false);
  const [showFullSummaryDoc, setShowFullSummaryDoc] = useState(false);

  // Find the tender or fallback to the first tender
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  if (!tender) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8F0] space-y-4">
        <h2 className="text-xl font-bold text-[#0F172A]">Tender Not Found</h2>
        <p className="text-xs text-[#64748B]">
          The tender with ID "{id}" could not be located in the current pipeline.
        </p>
        <button
          onClick={() => navigate('/tenders')}
          className="px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          Return to Tender Pipeline
        </button>
      </div>
    );
  }

  const handleDeleteTender = () => {
    if (window.confirm(`Are you sure you want to permanently delete tender "${tender.title}" (${tender.id})?`)) {
      deleteTender(tender.id);
      navigate('/tenders');
    }
  };

  const handleCopyRef = () => {
    const textToCopy = tender.referenceNo || tender.id;
    navigator.clipboard.writeText(textToCopy);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const subNavTabs = [
    { label: 'Overview', path: `/tenders/${tender.id}`, exact: true, icon: FileText },
    { label: 'Compliance Matrix', path: `/tenders/${tender.id}/requirements`, icon: CheckSquare, badge: tender.requirements?.length || 14 },
    { label: 'Task Board', path: `/tenders/${tender.id}/tasks`, icon: Kanban },
    { label: 'Document Vault', path: `/tenders/${tender.id}/documents`, icon: FolderLock, hasAlert: (tender.missingDocumentsCount || 0) > 0 },
    { label: 'JV Partners', path: `/tenders/${tender.id}/partners`, icon: Users },
    { label: 'Review & Sign-Off', path: `/tenders/${tender.id}/review`, icon: FileCheck2 },
    { label: 'Submission Ledger', path: `/tenders/${tender.id}/submission`, icon: Send },
    { label: 'Outcome & Debrief', path: `/tenders/${tender.id}/result`, icon: Award },
  ];

  const isOverview = location.pathname === `/tenders/${tender.id}`;

  const stages: { stage: TenderStage; label: string; sub: string }[] = [
    { stage: 'DISCOVERED', label: '01. Discovered', sub: 'Discovery & Intake' },
    { stage: 'SCREENING', label: '02. Screening', sub: 'Go / No-Go Gate' },
    { stage: 'UNDER_ANALYSIS', label: '03. Under Analysis', sub: 'TOR & Scope Audit' },
    { stage: 'PREPARATION', label: '04. Preparation', sub: 'Financials & BoQ' },
    { stage: 'INTERNAL_REVIEW', label: '05. Sign-Off', sub: 'Executive Approval' },
    { stage: 'SUBMITTED', label: '06. Submitted', sub: 'Receipt & Guarantee' },
  ];

  const stageKeys = stages.map((s) => s.stage);
  const currentStageIndex = stageKeys.indexOf(tender.stage);

  // Financial calculations
  const estUsd = tender.estimatedValue || 4250000;
  const bdtCrore = ((estUsd * 122) / 10000000).toFixed(1);
  const earnestUsd = Math.round(estUsd * 0.02);

  // Scope tags derived or fallback
  const scopeTags = [
    'Hyperconverged HCI',
    'Tier-IV Compliant',
    '36-Month SLA',
    'ISO 27001 Required',
    'OEM Direct MAF',
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation & Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-xs text-[#64748B]">
          <NavLink to="/tenders" className="hover:text-[#2563EB] transition-colors">
            Tenders
          </NavLink>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="font-mono font-bold text-[#0F172A] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
            {tender.id}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="font-semibold text-[#2563EB]">Proposal Workspace</span>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to={`/registry?id=${tender.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] rounded-lg transition-colors shadow-2xs"
            title="Edit tender specifications in Registry"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Edit</span>
          </Link>
          <button
            type="button"
            onClick={handleDeleteTender}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#FECACA] hover:bg-[#FEF2F2] text-xs font-semibold text-[#DC2626] rounded-lg transition-colors shadow-2xs"
            title="Delete this tender"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
          <ExportDropdown tender={tender} label="Export Brief" />
        </div>
      </div>

      {/* MASTER EXECUTIVE HEADER CARD */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[#F1F5F9]">
          {/* Left Title & Status Badges */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-tight px-2.5 py-1 rounded-md bg-[#0F172A] text-white border border-[#1E293B]">
                {tender.id}
              </span>
              <StatusBadge stage={tender.stage} />
              <StatusBadge decision={tender.decision} />
              <UrgencyBadge
                daysRemaining={tender.daysRemaining}
                hoursRemaining={tender.hoursRemaining}
              />
            </div>

            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight leading-tight">
              {tender.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#64748B]">
              <span className="flex items-center gap-1.5 text-[#0F172A] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                Authority: {tender.organization}
              </span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                Lead: <span className="text-[#0F172A] font-semibold ml-0.5">{tender.leadOwner.name}</span>
              </span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                Cutoff: <span className="text-[#0F172A] font-medium ml-0.5">
                  {new Date(tender.submissionDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (14:00 BST)
                </span>
              </span>
            </div>
          </div>

          {/* Right SOW Category & Readiness Gauge */}
          <div className="flex flex-wrap items-center gap-6 lg:border-l lg:border-[#F1F5F9] lg:pl-8 shrink-0">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Scope of Work (SOW)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] font-semibold text-xs border border-[#BFDBFE]">
                <Building className="w-3.5 h-3.5 text-[#2563EB]" />
                {tender.category || 'IT & Cloud Infrastructure'}
              </span>
            </div>

            <div className="space-y-1.5 min-w-[200px] sm:min-w-[220px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] whitespace-nowrap">
                  Submission Readiness
                </span>
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${
                    tender.readinessScore >= 75
                      ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                      : tender.readinessScore >= 50
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                      : tender.readinessScore >= 40
                      ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                      : 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]'
                  }`}
                >
                  {tender.readinessScore}%
                </span>
              </div>
              <ReadinessBar score={tender.readinessScore} showLabel={false} />
              {(tender.missingDocumentsCount ?? 0) > 0 ? (
                <span className="text-[10px] font-medium text-[#B45309] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                  <span>
                    {tender.missingDocumentsCount} Mandatory Doc{tender.missingDocumentsCount === 1 ? '' : 's'} Missing
                  </span>
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#15803D] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>All Mandatory Docs Ready</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 6-STAGE GATE VISUAL RIBBON & ADVANCEMENT CONTROLS */}
        <div className="mt-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
                Current Lifecycle Stage:
              </span>
              <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded border border-[#BFDBFE]">
                Stage 0{currentStageIndex + 1} • {stages[currentStageIndex]?.label.split('. ')[1] || tender.stage}
              </span>
              {tender.stage === 'ARCHIVED' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
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
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to {stages[currentStageIndex - 1]?.label.split('. ')[1]}</span>
                </button>
              )}

              {currentStageIndex < stageKeys.length - 1 && tender.stage !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => updateTenderStage(tender.id, stageKeys[currentStageIndex + 1])}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
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
                  className="px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#DC2626] rounded-lg border border-[#E2E8F0] hover:border-[#FECACA] hover:bg-[#FEF2F2] transition-colors flex items-center gap-1.5"
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
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Tender</span>
                </button>
              )}
            </div>
          </div>

          {/* 6-Stage Gate Visual Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {stages.map((st, idx) => {
              const isPast = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;

              return (
                <div
                  key={st.stage}
                  className={`p-3 rounded-xl border flex flex-col justify-between min-h-[64px] transition-all ${
                    isCurrent
                      ? 'border-[#2563EB] bg-[#EFF6FF] shadow-xs'
                      : isPast
                      ? 'border-[#A7F3D0] bg-[#ECFDF5]/80'
                      : 'border-[#E2E8F0] bg-[#F8FAFC]/80 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className={isCurrent ? 'text-[#1D4ED8]' : isPast ? 'text-[#065F46]' : 'text-[#475569]'}>
                      {st.label}
                    </span>
                    {isPast ? (
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-medium mt-1.5 ${
                      isCurrent ? 'text-[#2563EB] font-semibold' : isPast ? 'text-[#059669]' : 'text-[#64748B]'
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
        <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between overflow-x-auto">
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
                        ? 'bg-[#0F172A] text-white shadow-xs font-bold'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/20 text-current font-bold">
                      {tab.badge}
                    </span>
                  )}
                  {tab.hasAlert && (
                    <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#94A3B8]">
            <span>Last synchronized recently</span>
          </div>
        </div>
      </section>

      {/* OVERVIEW TAB CONTENT OR NESTED SUB-ROUTES */}
      {isOverview ? (
        <div className="space-y-6 animate-fadeIn">
          {/* HIGH-DENSITY WORKSPACE GRID (Left 8 Cols: Specs, Right 4 Cols: Compliance Sentinel) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Column 1: Core Tender Specifications & Contract Details (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
                {/* Header bar */}
                <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FAFC]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                    <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
                      Tender Specification Matrix &amp; Identity
                    </h3>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#0F172A] text-white uppercase tracking-wider">
                      {tender.category || 'Software / IT Related'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFullSummaryDoc(!showFullSummaryDoc)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="Toggle 3-page formal document"
                    >
                      <FileText className="w-3 h-3 text-[#64748B]" />
                      <span>{showFullSummaryDoc ? 'Hide Full Brief' : 'View Full Brief'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-2.5 py-1 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-3 h-3 text-[#64748B]" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                </div>

                {/* 2x3 Specification Matrix */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Country / Territory */}
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                        Country / Territory
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#2563EB]" />
                          {tender.country || 'Bangladesh'}
                        </span>
                        <span className="text-[10px] font-mono text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded font-bold border border-[#A7F3D0]">
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Procurement Portal & Source */}
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                        Procurement Portal &amp; Source
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
                          {tender.summary?.portal || 'e-GP Portal (eprocure.gov.bd)'}
                        </span>
                        <a
                          href="https://eprocure.gov.bd"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-semibold text-[#2563EB] hover:underline flex items-center gap-0.5"
                        >
                          Link Source →
                        </a>
                      </div>
                    </div>

                    {/* Procuring Authority / Client */}
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                        Procuring Authority / Client
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-[#64748B]" />
                          {tender.organization}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-mono">Ministry Supervised</span>
                      </div>
                    </div>

                    {/* Official Reference / Tender No. */}
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                        Official Reference / Tender No.
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#0F172A]">
                          {tender.referenceNo || tender.id}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyRef}
                          className="text-[#64748B] hover:text-[#0F172A] p-1 rounded hover:bg-[#E2E8F0] transition-colors"
                          title="Copy reference number"
                        >
                          {copiedRef ? (
                            <Check className="w-3.5 h-3.5 text-[#059669]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Estimated Tender Value (Gross) */}
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                        Estimated Tender Value (Gross)
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-[#059669]">
                          {formatCurrency(estUsd)}{' '}
                          <span className="text-[10px] font-normal text-[#64748B] font-sans">
                            (≈ BDT {bdtCrore} Crore)
                          </span>
                        </span>
                        <span className="text-[10px] font-mono text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.5 rounded font-bold border border-[#FDE68A]">
                          Pending Verification
                        </span>
                      </div>
                    </div>

                    {/* Tender Security (Earnest Money) */}
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                        Tender Security (Earnest Money)
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-[#0F172A]">
                          {formatCurrency(earnestUsd)}{' '}
                          <span className="text-[10px] font-normal text-[#64748B] font-sans">
                            (Bank Guarantee required)
                          </span>
                        </span>
                        <span className="text-[10px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded border border-[#FECACA]">
                          120 Days Validity
                        </span>
                      </div>
                    </div>

                    {/* Pre-Bid Meeting Date */}
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                        Pre-Bid Meeting Date
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#0F172A]">
                          {new Date(new Date(tender.submissionDeadline).getTime() - 14 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • 11:00 AM
                        </span>
                        <span className="text-[10px] font-medium text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded">
                          Hybrid / Zoom
                        </span>
                      </div>
                    </div>

                    {/* Final Closing Deadline */}
                    <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] block mb-1">
                        Submission Deadline &amp; Closing
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-[#92400E]">
                          {new Date(tender.submissionDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — 14:00 BST
                        </span>
                        <span className="text-[10px] font-bold font-mono bg-[#FDE68A] text-[#92400E] px-1.5 py-0.5 rounded">
                          T-{tender.daysRemaining} Days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scope Synopsis Block */}
                  <div className="mt-5 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                        Brief Scope of Work &amp; Deliverables
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        Extracted from Section 6 (Schedule of Requirements)
                      </span>
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {tender.summary?.mainIdea ||
                        'Turnkey supply, installation, testing, commissioning, and 3-year Tier-IV SLA maintenance for hyper-converged compute nodes, high-density SAN storage arrays, core spine-leaf switches, SDN controller integration, and automated disaster recovery failover nodes across primary and secondary government cloud data centers.'}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {scopeTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium bg-white text-[#334155] border border-[#E2E8F0] px-2.5 py-0.5 rounded-md shadow-2xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Compliance Sentinel & Mandatory Document Checklist (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
                    <h3 className="text-sm font-bold text-[#0F172A]">Compliance Sentinel</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                    2 / 8 Cleared
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mb-4 leading-normal">
                  Mandatory qualification gatekeeper. Tenders failing these criteria are subject to immediate technical disqualification.
                </p>

                {/* Sentinel Checklist */}
                <div className="space-y-2.5">
                  {/* Item 1: Trade License */}
                  <div className="p-2.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#D1FAE5] text-[#059669] flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">Up-to-Date Trade License</span>
                        <span className="text-[10px] text-[#64748B]">FY 2025–2026 Cleared</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#059669] uppercase">Ready</span>
                  </div>

                  {/* Item 2: TIN & Tax Clearance */}
                  <div className="p-2.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#D1FAE5] text-[#059669] flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">TIN &amp; Tax Clearance</span>
                        <span className="text-[10px] text-[#64748B]">NBR Certified PDF in vault</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#059669] uppercase">Ready</span>
                  </div>

                  {/* Item 3: Bank Solvency Certificate */}
                  <div className="p-2.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2]/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center text-xs font-bold">
                        !
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">Bank Solvency Certificate</span>
                        <span className="text-[10px] text-[#DC2626] font-medium">Min $2.5M Line of Credit</span>
                      </div>
                    </div>
                    <Link
                      to={`/tenders/${tender.id}/documents`}
                      className="px-2 py-1 text-[10px] font-bold bg-[#DC2626] text-white rounded hover:bg-[#B91C1C] transition-colors"
                    >
                      Upload
                    </Link>
                  </div>

                  {/* Item 4: 5-Year Financial Audit Reports */}
                  <div className="p-2.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB]/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-xs font-bold">
                        !
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">Audited Balance Sheets (5Y)</span>
                        <span className="text-[10px] text-[#D97706] font-medium">FY24 pending CA signature</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#D97706] uppercase">Pending</span>
                  </div>

                  {/* Item 5: OEM Authorization Form (MAF) */}
                  <div className="p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#E2E8F0] text-[#64748B] flex items-center justify-center text-xs font-bold">
                        ?
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">OEM Authorization (MAF)</span>
                        <span className="text-[10px] text-[#64748B]">From Cisco / HPE / Dell</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase">Unassigned</span>
                  </div>

                  {/* Item 6: Joint Venture Deed */}
                  <div className="p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#E2E8F0] text-[#64748B] flex items-center justify-center text-xs font-bold">
                        ?
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">JV Agreement / Deed</span>
                        <span className="text-[10px] text-[#64748B]">Notary Public stamp needed</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase">Action Req</span>
                  </div>
                </div>

                {/* Sentinel CTA Button */}
                <Link
                  to={`/tenders/${tender.id}/requirements`}
                  className="w-full mt-4 py-2 px-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Launch Full Compliance Audit</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Toggleable Formal 3-Page Tender Summary Document */}
          {showFullSummaryDoc && (
            <div className="space-y-4 p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl animate-scaleIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Formal 3-Page Executive Summary
                </h4>
                <button
                  type="button"
                  onClick={() => setShowFullSummaryDoc(false)}
                  className="text-xs text-[#64748B] hover:text-[#0F172A] font-semibold"
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
        <Outlet />
      )}
    </div>
  );
};

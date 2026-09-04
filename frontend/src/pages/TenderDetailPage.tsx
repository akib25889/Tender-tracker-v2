import React from 'react';
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
  const { tenders, updateTenderStage, archiveTender, restoreTender, deleteTender, formatCurrency } = useTenders();

  // Find the tender or fallback to the first tender
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const handleDeleteTender = () => {
    if (window.confirm(`Are you sure you want to permanently delete tender "${tender.title}" (${tender.id})?`)) {
      deleteTender(tender.id);
      navigate('/tenders');
    }
  };

  const subNavTabs = [
    { label: 'Overview', path: `/tenders/${tender.id}`, exact: true, icon: FileText },
    { label: 'Analysis & Scope', path: `/tenders/${tender.id}/analysis`, icon: FileText },
    { label: 'Compliance Matrix', path: `/tenders/${tender.id}/requirements`, icon: CheckSquare },
    { label: 'Task Board', path: `/tenders/${tender.id}/tasks`, icon: Kanban },
    { label: 'Document Vault', path: `/tenders/${tender.id}/documents`, icon: FolderLock },
    { label: 'JV Partners', path: `/tenders/${tender.id}/partners`, icon: Users },
    { label: 'Review & Sign-Off', path: `/tenders/${tender.id}/review`, icon: FileCheck2 },
    { label: 'Submission Ledger', path: `/tenders/${tender.id}/submission`, icon: Send },
    { label: 'Outcome & Debrief', path: `/tenders/${tender.id}/result`, icon: Award },
  ];

  const isOverview = location.pathname === `/tenders/${tender.id}`;

  const stages: TenderStage[] = [
    'DISCOVERED',
    'SCREENING',
    'UNDER_ANALYSIS',
    'PREPARATION',
    'INTERNAL_REVIEW',
    'SUBMITTED',
  ];

  const currentStageIndex = stages.indexOf(tender.stage);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation & Action */}
      <div className="flex items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-xs text-[#64748B]">
          <NavLink to="/tenders" className="hover:text-[#2563EB] transition-colors">
            Tenders
          </NavLink>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="font-mono font-bold text-[#0F172A]">{tender.id}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="font-semibold text-[#0F172A]">Proposal Workspace</span>
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

      {/* Master Tender Header Banner */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#0F172A] bg-[#F1F5F9] px-2.5 py-0.5 rounded border border-[#E2E8F0]">
                {tender.id}
              </span>
              <span className="font-mono text-xs text-[#64748B]">
                Ref: {tender.referenceNo}
              </span>
              <StatusBadge stage={tender.stage} />
              <StatusBadge decision={tender.decision} />
              <UrgencyBadge
                daysRemaining={tender.daysRemaining}
                hoursRemaining={tender.hoursRemaining}
              />
            </div>

            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0F172A] leading-tight">
              {tender.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#64748B]">
              <span className="font-medium text-[#0F172A]">
                {tender.organization}
              </span>
              <span>•</span>
              <span>{tender.country}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                Cutoff: {new Date(tender.submissionDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                Lead: {tender.leadOwner.name}
              </span>
            </div>
          </div>

          {/* Value & Readiness Widget */}
          <div className="flex items-center gap-6 lg:border-l lg:border-[#F1F5F9] lg:pl-6 shrink-0 justify-between lg:justify-end">
            {Boolean(tender.estimatedValue && tender.estimatedValue > 0) ? (
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Estimated Net Value
                </span>
                <span className="font-mono font-bold text-2xl text-[#0F172A] mt-0.5 block">
                  {formatCurrency(tender.estimatedValue)}
                </span>
                <span className="text-[11px] text-[#2563EB] font-medium">
                  SOW Category: {tender.category}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  SOW Category
                </span>
                <span className="font-semibold text-sm text-[#0F172A] mt-0.5 block">
                  {tender.category}
                </span>
              </div>
            )}

            <div className="w-36">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#64748B] font-medium">Readiness</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  {tender.readinessScore}%
                </span>
              </div>
              <ReadinessBar score={tender.readinessScore} showLabel={false} />
            </div>
          </div>
        </div>

        {/* 6-Gate Lifecycle Progression Bar */}
        <div className="mt-6 pt-4 border-t border-[#F1F5F9]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0F172A] dark:text-white">
                Current Lifecycle Stage: {tender.stage.replace('_', ' ')}
              </span>
              {tender.stage === 'ARCHIVED' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F1F5F9] dark:bg-[#21262D] text-[#475569] dark:text-[#94A3B8] border border-[#CBD5E1] dark:border-[#30363D]">
                  Archived Record
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {currentStageIndex > 0 && tender.stage !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => updateTenderStage(tender.id, stages[currentStageIndex - 1])}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] text-[#475569] dark:text-[#C9D1D9] hover:text-[#0F172A] hover:bg-[#F8FAFC] text-[11px] font-semibold rounded transition-colors shadow-xs"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to {stages[currentStageIndex - 1].replace('_', ' ')}</span>
                </button>
              )}
              {currentStageIndex < stages.length - 1 && tender.stage !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => updateTenderStage(tender.id, stages[currentStageIndex + 1])}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#0F172A] text-white text-[11px] font-semibold rounded hover:bg-[#1E293B] transition-colors shadow-sm"
                >
                  <span>Advance to {stages[currentStageIndex + 1].replace('_', ' ')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              {/* Archive for Records button (available in ANY stage except SUBMITTED) */}
              {tender.stage !== 'SUBMITTED' && tender.stage !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Send tender "${tender.title}" (${tender.id}) to Archive for record-keeping?`)) {
                      archiveTender(tender.id);
                    }
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] dark:bg-[#21262D] border border-[#CBD5E1] dark:border-[#30363D] text-[#475569] dark:text-[#C9D1D9] hover:bg-[#F1F5F9] hover:text-[#0F172A] text-[11px] font-semibold rounded transition-colors shadow-2xs"
                  title="Send this tender to archive for record keeping"
                >
                  <Archive className="w-3 h-3 text-[#64748B]" />
                  <span>Send to Archive</span>
                </button>
              )}

              {/* Restore button if already ARCHIVED */}
              {tender.stage === 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => restoreTender(tender.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-[11px] font-semibold rounded transition-colors shadow-xs"
                  title="Restore tender from archive"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Tender</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {stages.map((st, idx) => {
              const isDone = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;
              return (
                <div key={st} className="flex flex-col gap-1">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      isDone
                        ? 'bg-[#16A34A]'
                        : isCurrent
                        ? 'bg-[#2563EB]'
                        : 'bg-[#E2E8F0]'
                    }`}
                  />
                  <span
                    className={`text-[10px] truncate ${
                      isCurrent
                        ? 'font-bold text-[#2563EB]'
                        : isDone
                        ? 'text-[#16A34A] font-medium'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-Navigation Ribbon */}
        <div className="flex items-center gap-1 border-t border-[#F1F5F9] mt-4 pt-3 overflow-x-auto">
          {subNavTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.exact}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Overview Tab Content or Nested Sub-Route Outlet */}
      {isOverview ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Quick Actions Bar for Overview Document */}
          <div className="flex items-center justify-between bg-white dark:bg-[#161B22] p-3 px-4 rounded-xl border border-[#E2E8F0] shadow-xs max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">
                Tender Summary Document
              </span>
              {tender.summary?.classification && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#0F172A] text-white text-[10px] font-bold tracking-wider">
                  {tender.summary.classification}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#21262D] border border-[#E2E8F0] hover:bg-[#F8FAFC] dark:hover:bg-[#30363D] text-[#0F172A] dark:text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                title="Print or save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Print / PDF</span>
              </button>
              <Link
                to={`/registry?id=${tender.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#21262D] border border-[#E2E8F0] hover:bg-[#F8FAFC] dark:hover:bg-[#30363D] text-[#0F172A] dark:text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                title="Edit this tender in Registry"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Edit in Registry</span>
              </Link>
            </div>
          </div>

          {/* Render Full Tender Summary Report Document matching photographed specifications */}
          <TenderSummaryDocument tender={tender} />

          {/* Proposal Comments & Team Remarks */}
          <div className="max-w-4xl mx-auto w-full">
            <TenderCommentsSection tender={tender} />
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

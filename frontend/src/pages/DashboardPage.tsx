import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Activity,
  Plus,
  ChevronRight,
  FileWarning,
  ExternalLink,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { ReadinessBar } from '../components/ui/ReadinessBar';
import { Card } from '../components/ui/Card';
import { TenderStage } from '../types/tender';

export const DashboardPage: React.FC = () => {
  const { tenders, setIsNewTenderModalOpen } = useTenders();
  const [filterMode, setFilterMode] = useState<'ALL_URGENT' | 'CLOSING_SOON' | 'BLOCKERS'>('ALL_URGENT');

  // Dynamic live metric calculations
  const totalPipelineValue = tenders.reduce((acc, t) => acc + t.estimatedValue, 0);
  const activeTenders = tenders.filter((t) => !['AWARDED', 'LOST', 'DECLINED'].includes(t.stage));
  const dueThisWeek = tenders.filter((t) => t.daysRemaining <= 7);
  const totalMissingDocs = tenders.reduce((acc, t) => acc + t.missingDocumentsCount, 0);
  const avgReadiness = tenders.length
    ? Math.round(tenders.reduce((acc, t) => acc + t.readinessScore, 0) / tenders.length)
    : 0;

  // 10-Second Attention Queue Filter
  const attentionQueue = tenders.filter((t) => {
    if (filterMode === 'CLOSING_SOON') return t.daysRemaining <= 4;
    if (filterMode === 'BLOCKERS') return t.blockers.length > 0 || t.missingDocumentsCount > 0;
    return t.daysRemaining <= 4 || t.blockers.length > 0 || t.decision === 'PENDING';
  });

  const stages: { stage: TenderStage; label: string }[] = [
    { stage: 'DISCOVERED', label: '1. Discovered' },
    { stage: 'SCREENING', label: '2. Screening' },
    { stage: 'UNDER_ANALYSIS', label: '3. Analysis' },
    { stage: 'PREPARATION', label: '4. Preparation' },
    { stage: 'INTERNAL_REVIEW', label: '5. Review' },
    { stage: 'SUBMITTED', label: '6. Submission' },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Tender Command Center</span>
            <span>•</span>
            <span className="font-semibold text-[#16A34A] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
              Live Pipeline Active ({activeTenders.length} Bids)
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Command Center Dashboard
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Operational triage adhering to the 10-Second Rule: deadlines, missing documents, and executive blockers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/tenders"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm"
          >
            <span>View All Registry</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
          </Link>
          <button
            onClick={() => setIsNewTenderModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* 4 Strategic KPI Ribbons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Pipeline */}
        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Active Pipeline
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-[#0F172A]">
                {activeTenders.length}
              </span>
              <span className="font-mono text-xs font-bold text-[#2563EB]">
                ${(totalPipelineValue / 1000000).toFixed(1)}M Net
              </span>
            </div>
            <span className="text-[11px] text-[#16A34A] font-medium mt-0.5 block">
              ↑ 17.2% vs previous quarter
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Closing This Week */}
        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#DC2626] uppercase tracking-wider block">
              Closing This Week
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-[#DC2626]">
                {dueThisWeek.length}
              </span>
              <span className="text-xs text-[#64748B]">Bids</span>
            </div>
            <span className="text-[11px] text-[#DC2626] font-medium mt-0.5 block">
              {dueThisWeek.filter((t) => t.daysRemaining <= 2).length} bids &lt; 48h window
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Missing Documents & Blockers */}
        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Missing Docs &amp; Blockers
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-[#EA580C]">
                {totalMissingDocs}
              </span>
              <span className="text-xs text-[#64748B]">Pending Files</span>
            </div>
            <span className="text-[11px] text-[#64748B] font-medium mt-0.5 block">
              Solvency &amp; Statutory gates
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Fleet Readiness Score */}
        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Submission Readiness
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-[#0F172A]">
                {avgReadiness}%
              </span>
              <span className="font-mono text-[10px] text-[#64748B] uppercase font-semibold">
                Avg Health
              </span>
            </div>
            <div className="w-24 mt-1.5">
              <ReadinessBar score={avgReadiness} showLabel={false} />
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 6-Gate Tender Lifecycle Stage Distribution */}
      <Card
        title="6-Gate Tender Pipeline Breakdown"
        subtitle="Distribution of live opportunities across sequential procurement gates"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((s) => {
            const count = tenders.filter((t) => t.stage === s.stage).length;
            const stageValue = tenders
              .filter((t) => t.stage === s.stage)
              .reduce((acc, t) => acc + t.estimatedValue, 0);

            return (
              <div
                key={s.stage}
                className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 hover:border-[#CBD5E1] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0F172A]">
                    {count}
                  </span>
                  <span className="font-mono text-[10px] text-[#2563EB] font-semibold">
                    ${(stageValue / 1000000).toFixed(1)}M
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#64748B] block truncate">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 10-Second Rule Attention Queue */}
      <Card
        title="Tenders Requiring Immediate Intervention"
        subtitle="Prioritized by submission urgency, pending Go/No-Go decisions, or missing statutory clearance files"
        headerAction={
          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-[#F1F5F9] rounded-lg text-xs">
              <button
                onClick={() => setFilterMode('ALL_URGENT')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'ALL_URGENT' ? 'bg-white text-[#0F172A] shadow-sm font-semibold' : 'text-[#64748B]'
                }`}
              >
                All Urgent ({attentionQueue.length})
              </button>
              <button
                onClick={() => setFilterMode('CLOSING_SOON')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'CLOSING_SOON' ? 'bg-white text-[#0F172A] shadow-sm font-semibold' : 'text-[#64748B]'
                }`}
              >
                Closing &lt; 4d
              </button>
              <button
                onClick={() => setFilterMode('BLOCKERS')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'BLOCKERS' ? 'bg-white text-[#0F172A] shadow-sm font-semibold' : 'text-[#64748B]'
                }`}
              >
                Blockers
              </button>
            </div>
          </div>
        }
      >
        <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
          {attentionQueue.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B]">
              No urgent blockers matching filter. All pipelines operating on schedule.
            </div>
          ) : (
            attentionQueue.map((tender) => (
              <div
                key={tender.id}
                className="p-4 hover:bg-[#F8FAFC] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0F172A] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
                      {tender.id}
                    </span>
                    <StatusBadge stage={tender.stage} />
                    <StatusBadge decision={tender.decision} />
                    <UrgencyBadge
                      daysRemaining={tender.daysRemaining}
                      hoursRemaining={tender.hoursRemaining}
                    />
                    {tender.scannerConfidence && (
                      <span className="text-[10px] font-mono text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                        Scanner {tender.scannerConfidence}%
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/tenders/${tender.id}`}
                    className="font-display font-semibold text-sm text-[#0F172A] hover:text-[#2563EB] transition-colors block truncate"
                  >
                    {tender.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
                    <span>{tender.organization}</span>
                    <span>•</span>
                    <span>{tender.country}</span>
                    <span>•</span>
                    <span className="font-mono font-semibold text-[#0F172A]">
                      ${(tender.estimatedValue / 1000000).toFixed(2)}M
                    </span>
                    <span>•</span>
                    <span>Lead: {tender.leadOwner.name}</span>
                  </div>

                  {tender.blockers.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-[#DC2626] font-medium bg-[#FEF2F2] px-2.5 py-1 rounded border border-[#FECACA] inline-flex">
                      <FileWarning className="w-3.5 h-3.5 shrink-0" />
                      <span>Blocker: {tender.blockers[0]}</span>
                    </div>
                  )}
                </div>

                {/* Right Action & Readiness */}
                <div className="flex items-center gap-4 shrink-0 justify-between lg:justify-end">
                  <div className="w-36">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#64748B]">Readiness</span>
                      <span className="font-mono font-bold text-[#0F172A]">
                        {tender.readinessScore}%
                      </span>
                    </div>
                    <ReadinessBar score={tender.readinessScore} showLabel={false} />
                  </div>

                  <Link
                    to={`/tenders/${tender.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm"
                  >
                    <span>Open Workspace</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

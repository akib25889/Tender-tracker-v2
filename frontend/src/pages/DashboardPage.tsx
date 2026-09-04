import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Clock,
  AlertTriangle,
  Activity,
  Plus,
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
  const { tenders } = useTenders();
  const [filterMode, setFilterMode] = useState<'ALL_URGENT' | 'CLOSING_SOON' | 'BLOCKERS'>('ALL_URGENT');

  // Dynamic live operational metric calculations
  const activeTenders = tenders.filter(
    (t) => t.stage !== 'AWARDED' && t.stage !== 'LOST' && t.stage !== 'DECLINED'
  );
  const dueThisWeek = tenders.filter((t) => t.daysRemaining <= 7);
  const totalMissingDocs = tenders.reduce(
    (acc, t) => acc + (t.missingDocumentsCount || 0),
    0
  );
  const avgReadiness =
    tenders.length > 0
      ? Math.round(
          tenders.reduce((acc, t) => acc + (t.readinessScore || 0), 0) / tenders.length
        )
      : 0;

  // Filter Attention Queue based on filterMode
  const urgentQueue = tenders.filter((t) => {
    if (filterMode === 'CLOSING_SOON') return t.daysRemaining <= 4;
    if (filterMode === 'BLOCKERS') return t.blockers.length > 0;
    return t.daysRemaining <= 7 || t.blockers.length > 0 || t.priority === 'CRITICAL';
  });

  const stages: { stage: TenderStage; label: string }[] = [
    { stage: 'DISCOVERED', label: '1. Bid Discovery' },
    { stage: 'SCREENING', label: '2. Screening' },
    { stage: 'UNDER_ANALYSIS', label: '3. Analysis' },
    { stage: 'PREPARATION', label: '4. Preparation' },
    { stage: 'INTERNAL_REVIEW', label: '5. Review' },
    { stage: 'SUBMITTED', label: '6. Submitted' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Operations</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Real-Time Mission Control</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Tender Command Center
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/registry"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tender Registry &amp; Data Entry</span>
          </Link>
        </div>
      </div>

      {/* 4 Operational KPI Ribbons (Zero Money) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Opportunities */}
        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Active Opportunities
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-[#0F172A]">
                {activeTenders.length}
              </span>
              <span className="text-xs text-[#2563EB] font-semibold">
                Proposals Live
              </span>
            </div>
            <span className="text-[11px] text-[#16A34A] font-medium mt-0.5 block">
              {tenders.filter((t) => t.stage === 'PREPARATION' || t.stage === 'INTERNAL_REVIEW').length} in active drafting
            </span>
            <Link
              to="/tenders?stage=DISCOVERED"
              className="text-[10px] text-[#2563EB] font-bold hover:underline inline-flex items-center gap-0.5 mt-1"
            >
              <span>View {tenders.filter((t) => t.stage === 'DISCOVERED').length} Discovered Bids →</span>
            </Link>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <FolderGit2 className="w-5 h-5" />
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

      {/* 6-Gate Tender Pipeline Breakdown (Zero Money) */}
      <Card
        title="6-Gate Tender Pipeline Breakdown"
        subtitle="Distribution of live opportunities across sequential procurement gates"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((s) => {
            const count = tenders.filter((t) => t.stage === s.stage).length;
            const pct = tenders.length > 0 ? Math.round((count / tenders.length) * 100) : 0;

            return (
              <Link
                key={s.stage}
                to={`/tenders?stage=${s.stage}`}
                className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 hover:border-[#2563EB] hover:bg-[#EFF6FF]/50 transition-all block group"
                title={`Click to show all ${s.label} tenders`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                    {count} Bids
                  </span>
                  <span className="font-mono text-[10px] text-[#2563EB] font-semibold">
                    {pct}%
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#64748B] block truncate group-hover:text-[#0F172A] transition-colors">
                  {s.label}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* 10-Second Rule Attention Queue (Zero Money) */}
      <Card
        title="Tenders Requiring Immediate Intervention"
        subtitle="Ranked by deadline proximity, missing statutory credentials, and compliance blockers"
        headerAction={
          <div className="flex items-center gap-1.5">
            <div className="flex items-center p-0.5 bg-[#F1F5F9] rounded-lg text-xs">
              <button
                onClick={() => setFilterMode('ALL_URGENT')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'ALL_URGENT'
                    ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                All Urgent ({tenders.filter((t) => t.daysRemaining <= 7 || t.blockers.length > 0).length})
              </button>
              <button
                onClick={() => setFilterMode('CLOSING_SOON')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'CLOSING_SOON'
                    ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Closing &le; 4d
              </button>
              <button
                onClick={() => setFilterMode('BLOCKERS')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'BLOCKERS'
                    ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Blockers ({tenders.filter((t) => t.blockers.length > 0).length})
              </button>
            </div>
          </div>
        }
      >
        <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
          {urgentQueue.map((tender) => (
            <div
              key={tender.id}
              className="p-4 hover:bg-[#F8FAFC] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Left Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0F172A] bg-[#F1F5F9] px-2 py-0.5 rounded">
                    {tender.id}
                  </span>
                  <span className="font-mono text-xs text-[#64748B]">
                    {tender.referenceNo}
                  </span>
                  <StatusBadge stage={tender.stage} />
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
                  <span className="font-semibold text-[#2563EB]">
                    {tender.category}
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
              <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end">
                <div className="w-28 text-right hidden sm:block">
                  <span className="text-[11px] text-[#64748B] block mb-1">
                    Readiness
                  </span>
                  <ReadinessBar score={tender.readinessScore} showLabel={true} />
                </div>

                <Link
                  to={`/tenders/${tender.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#2563EB] hover:text-white text-[#0F172A] rounded-lg text-xs font-semibold transition-all group-hover:border-[#2563EB]"
                >
                  <span>Resolve</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

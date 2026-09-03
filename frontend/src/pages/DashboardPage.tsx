import React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ChevronRight,
  FileWarning,
  ExternalLink,
} from 'lucide-react';
import { MOCK_PIPELINE_SUMMARY, MOCK_TENDERS } from '../mock/tenders';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { ReadinessBar } from '../components/ui/ReadinessBar';
import { Card } from '../components/ui/Card';

export const DashboardPage: React.FC = () => {
  const summary = MOCK_PIPELINE_SUMMARY;

  // Filter tenders requiring immediate attention: closing < 5 days or has blockers
  const urgentTenders = MOCK_TENDERS.filter(
    (t) => t.daysRemaining <= 4 || t.blockers.length > 0
  );

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
              Live Pipeline Active
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
          <Link
            to="/calendar"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
          >
            <span>Statutory Calendar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
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
                {summary.activeTendersCount}
              </span>
              <span className="font-mono text-xs font-bold text-[#2563EB]">
                ${(summary.totalPipelineValue / 1000000).toFixed(1)}M Net
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
                {summary.dueThisWeekCount}
              </span>
              <span className="text-xs text-[#64748B]">Bids</span>
            </div>
            <span className="text-[11px] text-[#DC2626] font-medium mt-0.5 block">
              3 bids &lt; 72h cutoff window
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
              Missing Docs & Blockers
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-[#EA580C]">
                {summary.missingDocumentsTotal}
              </span>
              <span className="text-xs text-[#64748B]">Critical Audits</span>
            </div>
            <span className="text-[11px] text-[#64748B] font-medium mt-0.5 block">
              Solvency &amp; Bank Guarantee gates
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
                {summary.averageReadiness}%
              </span>
              <span className="font-mono text-[10px] text-[#64748B] uppercase font-semibold">
                Avg Health
              </span>
            </div>
            <div className="w-24 mt-1.5">
              <ReadinessBar score={summary.averageReadiness} showLabel={false} />
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 10-Second Rule Attention Queue */}
      <Card
        title="Tenders Requiring Immediate Intervention"
        subtitle="Prioritized by submission urgency, pending Go/No-Go decisions, or missing statutory clearance files"
        headerAction={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[#B91C1C] text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping"></span>
            {urgentTenders.length} Critical Actions
          </span>
        }
      >
        <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
          {urgentTenders.map((tender) => (
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
                  <span>{tender.category}</span>
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
          ))}
        </div>
      </Card>
    </div>
  );
};


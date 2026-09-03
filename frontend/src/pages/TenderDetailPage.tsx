import React from 'react';
import { useParams, NavLink, Outlet, useLocation } from 'react-router-dom';
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
  ArrowRight,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { ReadinessBar } from '../components/ui/ReadinessBar';
import { Card } from '../components/ui/Card';
import { ExportDropdown } from '../components/ui/ExportDropdown';
import { TenderCommentsSection } from '../components/ui/TenderCommentsSection';
import { TenderStage } from '../types/tender';

export const TenderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { tenders, updateTenderStage, formatCurrency, canPerformAction } = useTenders();

  // Find the tender or fallback to the first tender
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const subNavTabs = [
    { label: 'Overview', path: `/tenders/${tender.id}`, exact: true, icon: FileText },
    { label: 'Analysis & Scope', path: `/tenders/${tender.id}/analysis`, icon: FileText },
    { label: 'Compliance Matrix', path: `/tenders/${tender.id}/requirements`, icon: CheckSquare },
    { label: 'Task Kanban', path: `/tenders/${tender.id}/tasks`, icon: Kanban },
    { label: 'Document Vault', path: `/tenders/${tender.id}/documents`, icon: FolderLock },
    { label: 'Review & Sign-Off', path: `/tenders/${tender.id}/review`, icon: FileCheck2 },
    { label: 'Submission Ledger', path: `/tenders/${tender.id}/submission`, icon: Send },
    { label: 'Result Post-Mortem', path: `/tenders/${tender.id}/result`, icon: Award },
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

        <ExportDropdown tender={tender} label="Export Brief" />
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
            <span className="text-xs font-semibold text-[#0F172A]">
              Current Lifecycle Stage: {tender.stage.replace('_', ' ')}
            </span>
            <div className="flex items-center gap-2">
              {currentStageIndex > 0 && (
                <button
                  disabled={!canPerformAction('ADVANCE_STAGE')}
                  onClick={() => updateTenderStage(tender.id, stages[currentStageIndex - 1])}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E2E8F0] disabled:opacity-40 text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] text-[11px] font-semibold rounded transition-colors shadow-xs"
                  title={!canPerformAction('ADVANCE_STAGE') ? 'Only Business Head or Executive Manager can revert lifecycle stage' : undefined}
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to {stages[currentStageIndex - 1].replace('_', ' ')}</span>
                </button>
              )}
              {currentStageIndex < stages.length - 1 && (
                <button
                  disabled={!canPerformAction('ADVANCE_STAGE')}
                  onClick={() => updateTenderStage(tender.id, stages[currentStageIndex + 1])}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#0F172A] disabled:bg-[#94A3B8] text-white text-[11px] font-semibold rounded hover:bg-[#1E293B] transition-colors shadow-sm"
                  title={!canPerformAction('ADVANCE_STAGE') ? 'Only Business Head or Executive Manager can advance lifecycle stage' : undefined}
                >
                  {!canPerformAction('ADVANCE_STAGE') && <Lock className="w-3 h-3 text-amber-300" />}
                  <span>Advance to {stages[currentStageIndex + 1].replace('_', ' ')}</span>
                  <ArrowRight className="w-3 h-3" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols: Scope Overview & Gatekeeper QA */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              title="Tender Summary &amp; Stated Concept"
              subtitle="Stated specifications, commercial requirements, and scope objectives"
              headerAction={
                tender.summary?.classification && (
                  <span className="px-2.5 py-1 rounded-full bg-[#0F172A] text-white text-[10px] font-bold tracking-wider">
                    {tender.summary.classification}
                  </span>
                )
              }
            >
              <div className="space-y-4 text-xs text-[#334155] leading-relaxed">
                <div>
                  <span className="font-bold text-[#0F172A] block mb-1">
                    Main Concept &amp; Deliverables:
                  </span>
                  <p className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-[#334155]">
                    {tender.summary?.mainIdea ||
                      'This bid addresses sovereign requirements for deploying a secure, high-availability ERP and data infrastructure across multilateral regional nodes. The scope requires compliance with tier-4 security certifications, zero-trust cloud orchestration, and 24/7 technical operations SLA.'}
                  </p>
                </div>

                {tender.summary?.commercial && (
                  <div>
                    <span className="font-bold text-[#0F172A] block mb-1.5">
                      Commercial Terms &amp; Financial Securities:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                        <span className="text-[#64748B] block font-medium">Tender Security</span>
                        <span className="font-mono font-bold text-[#0F172A]">
                          {tender.summary.commercial.tenderSecurity || 'Bank Guarantee Required'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                        <span className="text-[#64748B] block font-medium">Contract / Service Period</span>
                        <span className="font-semibold text-[#0F172A]">
                          {tender.summary.commercial.contractPeriod || '12 Months + 24 Months O&M'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                        <span className="text-[#64748B] block font-medium">Document Price</span>
                        <span className="font-mono text-[#0F172A]">
                          {tender.summary.commercial.tenderDocPrice || 'Free on Portal'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                        <span className="text-[#64748B] block font-medium">Performance Security</span>
                        <span className="font-mono font-bold text-[#16A34A]">
                          {tender.summary.commercial.performanceSecurity || '10% of Contract Value'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {tender.summary?.personnel && tender.summary.personnel.length > 0 && (
                  <div>
                    <span className="font-bold text-[#0F172A] block mb-1.5">
                      CV &amp; Key Personnel Mandates:
                    </span>
                    <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                          <tr>
                            <th className="p-2">Position Title</th>
                            <th className="p-2">Min. Qualification</th>
                            <th className="p-2">Required Experience</th>
                            <th className="p-2 text-center w-12">Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                          {tender.summary.personnel.map((p, idx) => (
                            <tr key={idx}>
                              <td className="p-2 font-semibold text-[#0F172A]">{p.position}</td>
                              <td className="p-2 text-[#64748B]">{p.qualification}</td>
                              <td className="p-2 text-[#64748B]">{p.experience}</td>
                              <td className="p-2 text-center font-mono font-bold text-[#0F172A]">{p.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tender.summary?.risks && tender.summary.risks.length > 0 && (
                  <div>
                    <span className="font-bold text-[#0F172A] block mb-1.5">
                      Key Risks &amp; Analyst Observations:
                    </span>
                    <div className="space-y-1.5">
                      {tender.summary.risks.map((r, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#FEF2F2]/60 rounded border border-[#FECACA] flex items-start gap-2 text-xs"
                        >
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${
                              r.type === 'Tender Requirement'
                                ? 'bg-[#DC2626] text-white'
                                : 'bg-[#D97706] text-white'
                            }`}
                          >
                            {r.type}
                          </span>
                          <span className="text-[#991B1B] font-medium">{r.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Statutory Requirements Matrix Summary" subtitle="Clause verification status mapped to proof documents">
              <div className="space-y-3">
                {tender.requirements.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          req.status === 'VERIFIED'
                            ? 'bg-[#16A34A]'
                            : req.status === 'BLOCKER'
                            ? 'bg-[#DC2626] animate-pulse'
                            : 'bg-[#D97706]'
                        }`}
                      />
                      <span className="text-xs font-semibold text-[#0F172A]">
                        {req.title}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-semibold ${
                        req.status === 'VERIFIED'
                          ? 'text-[#16A34A]'
                          : req.status === 'BLOCKER'
                          ? 'text-[#DC2626] font-bold'
                          : 'text-[#D97706]'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Proposal Comments & Team Remarks */}
            <TenderCommentsSection tender={tender} />
          </div>

          {/* Right Col: Task Progress & Quick Actions */}
          <div className="space-y-6">
            <Card title="Task Execution Progress" subtitle="Cross-department completion status">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Completed Tasks</span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    {tender.completedTasksCount} / {tender.totalTasksCount}
                  </span>
                </div>
                <ReadinessBar score={tender.readinessScore} />

                <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
                  <NavLink
                    to={`/tenders/${tender.id}/tasks`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors text-xs font-semibold text-[#0F172A]"
                  >
                    <span>Open Task Kanban Board</span>
                    <ChevronRight className="w-4 h-4 text-[#64748B]" />
                  </NavLink>
                  <NavLink
                    to={`/tenders/${tender.id}/documents`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors text-xs font-semibold text-[#0F172A]"
                  >
                    <span>Open Document Vault</span>
                    <ChevronRight className="w-4 h-4 text-[#64748B]" />
                  </NavLink>
                  <NavLink
                    to={`/tenders/${tender.id}/review`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors text-xs font-semibold text-[#0F172A]"
                  >
                    <span>Sign-Off Gatekeeper Approvals</span>
                    <ChevronRight className="w-4 h-4 text-[#64748B]" />
                  </NavLink>
                </div>
              </div>
            </Card>

            <Card title="Vault Storage Verification" subtitle="Local SSD SHA-256 cryptographic logs">
              <div className="space-y-2 text-[11px] text-[#64748B]">
                <div className="p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0] font-mono">
                  <div className="text-[#0F172A] font-semibold truncate">
                    storage/tenders/{tender.id}/05_final_submission_package/
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-1 truncate">
                    SHA-256: 8f4c2b9a7d1e3f5...389c
                  </div>
                </div>
                <p className="text-[11px] text-[#16A34A] flex items-center gap-1 font-medium">
                  ✓ Vault directory locked &amp; replicated
                </p>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

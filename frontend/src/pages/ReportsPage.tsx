import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import {
  TrendingUp,
  Award,
  DollarSign,
  Building2,
  CheckCircle2,
  BarChart3,
  Layers,
  Sliders,
  Target,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../components/ui/ExportDropdown';

interface CategoryBreakdown {
  category: string;
  count: number;
  total_value: number;
  share_percent: number;
  win_rate: number;
}

interface OrgBreakdown {
  organization: string;
  count: number;
  total_value: number;
  awarded_count: number;
}

interface AnalyticsData {
  total_pipeline_value: number;
  total_opportunities: number;
  awarded_count: number;
  lost_count: number;
  cumulative_win_rate: number;
  category_breakdown: CategoryBreakdown[];
  top_organizations: OrgBreakdown[];
}

type ReportMode = 'BASIC' | 'GENERAL' | 'ADVANCE';

export const ReportsPage: React.FC = () => {
  const { tenders, formatCurrency } = useTenders();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [reportMode, setReportMode] = useState<ReportMode>('GENERAL');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/dashboard/reports/analytics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setAnalytics(data);
      })
      .catch((err) => console.error('Failed to fetch analytics:', err));
  }, []);

  const totalValue =
    analytics?.total_pipeline_value ??
    tenders.reduce((acc, t) => acc + (t.estimatedValue || 0), 0);
  const winRate = analytics?.cumulative_win_rate ?? 68.5;

  // Fallback category stats if analytics endpoint not yet loaded
  const categories = Array.from(new Set(tenders.map((t) => t.category).filter(Boolean)));
  const fallbackCategoryStats = categories.map((cat) => {
    const catTenders = tenders.filter((t) => t.category === cat);
    const catVal = catTenders.reduce((acc, t) => acc + (t.estimatedValue || 0), 0);
    const share = Math.round((catVal / (totalValue || 1)) * 100) || 0;
    return {
      category: cat,
      count: catTenders.length,
      total_value: catVal,
      share_percent: share,
      win_rate: 65.0,
    };
  });

  const categoryStats =
    analytics?.category_breakdown?.length
      ? analytics.category_breakdown
      : fallbackCategoryStats;

  // Advanced metrics computations
  const awardedTenders = tenders.filter((t) => t.stage === 'AWARDED');
  const lostTenders = tenders.filter((t) => t.stage === 'LOST');
  const awardedTotalValue = awardedTenders.reduce((acc, t) => acc + (t.estimatedValue || 0), 0);
  const avgTicketSize = Math.round(totalValue / (tenders.length || 1));
  const evaluatedCount = awardedTenders.length + lostTenders.length;
  const captureEfficiency = evaluatedCount > 0
    ? Math.round((awardedTenders.length / evaluatedCount) * 100)
    : 72;
  const highValueTenders = tenders.filter((t) => (t.estimatedValue || 0) >= 10000000);

  const stageBreakdown = [
    { stage: 'Discovered', key: 'DISCOVERED', color: '#94A3B8' },
    { stage: 'Screening', key: 'SCREENING', color: '#38BDF8' },
    { stage: 'Under Analysis', key: 'UNDER_ANALYSIS', color: '#818CF8' },
    { stage: 'Preparation', key: 'PREPARATION', color: '#F59E0B' },
    { stage: 'Internal Review', key: 'INTERNAL_REVIEW', color: '#EC4899' },
    { stage: 'Submitted', key: 'SUBMITTED', color: '#2563EB' },
    { stage: 'Awarded', key: 'AWARDED', color: '#10B981' },
    { stage: 'Lost', key: 'LOST', color: '#EF4444' },
  ].map((s) => {
    const stageTenders = tenders.filter((t) => t.stage === s.key);
    const sVal = stageTenders.reduce((acc, t) => acc + (t.estimatedValue || 0), 0);
    const sShare = totalValue > 0 ? Math.round((sVal / totalValue) * 100) : 0;
    return {
      name: s.stage,
      count: stageTenders.length,
      total_value: sVal,
      share: sShare,
      color: s.color,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Analytics</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Report &amp; Analytics</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Report &amp; Analytics
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Procurement conversion telemetry, sector distributions, and custom analytics across Basic, General, and Advance modes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 3-Mode Segmented Control */}
          <div className="flex items-center p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] shadow-2xs">
            {(['BASIC', 'GENERAL', 'ADVANCE'] as ReportMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setReportMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reportMode === mode
                    ? 'bg-white text-[#0F172A] shadow-xs ring-1 ring-black/5'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {mode.charAt(0) + mode.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <ExportDropdown tenders={tenders} label="Export Executive Report" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: BASIC MODE                                                        */}
      {/* ========================================================================= */}
      {reportMode === 'BASIC' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 4 Core Essential Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Total Pipeline Value
                </span>
                <span className="font-display text-2xl font-bold text-[#0F172A] mt-1 block">
                  {formatCurrency(totalValue)}
                </span>
                <span className="text-[11px] text-[#2563EB]">{tenders.length} Total Bids</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Win Rate
                </span>
                <span className="font-display text-2xl font-bold text-[#16A34A] mt-1 block">
                  {winRate}%
                </span>
                <span className="text-[11px] text-[#64748B]">Across submitted contracts</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Won Contracts Value
                </span>
                <span className="font-display text-2xl font-bold text-[#10B981] mt-1 block">
                  {formatCurrency(awardedTotalValue)}
                </span>
                <span className="text-[11px] text-[#16A34A]">{awardedTenders.length} contracts captured</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Active in Preparation
                </span>
                <span className="font-display text-2xl font-bold text-[#0F172A] mt-1 block">
                  {tenders.filter((t) => t.stage === 'PREPARATION' || t.stage === 'INTERNAL_REVIEW').length}
                </span>
                <span className="text-[11px] text-[#D97706]">Immediate drafting focus</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* High-Level Stage Breakdown Table */}
          <Card
            title="Pipeline Status Summary"
            subtitle="Essential distribution of opportunities across operational lifecycle stages"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Stage</th>
                    <th className="py-2.5 px-3 text-center">Opportunity Count</th>
                    <th className="py-2.5 px-3 text-right">Aggregate Valuation</th>
                    <th className="py-2.5 px-3 text-right">Pipeline Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {stageBreakdown.map((s) => (
                    <tr key={s.name} className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-semibold text-[#0F172A] flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span>{s.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#475569]">
                        {s.count}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0F172A]">
                        {formatCurrency(s.total_value)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#64748B]">
                        {s.share}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: GENERAL MODE (Standard Operational View)                          */}
      {/* ========================================================================= */}
      {reportMode === 'GENERAL' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top 3 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Cumulative Win Rate
                </span>
                <span className="font-display text-2xl font-bold text-[#16A34A] mt-1 block">
                  {winRate}%
                </span>
                <span className="text-[11px] text-[#64748B]">Benchmark target: 20%</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Tracked Pipeline Total
                </span>
                <span className="font-display text-2xl font-bold text-[#0F172A] mt-1 block">
                  {formatCurrency(totalValue)}
                </span>
                <span className="text-[11px] text-[#2563EB]">{tenders.length} active opportunities</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Avg Gross Target Margin
                </span>
                <span className="font-display text-2xl font-bold text-[#0F172A] mt-1 block">
                  28.4%
                </span>
                <span className="text-[11px] text-[#16A34A]">Above 25% hurdle rate</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakdown by Domain / Sector */}
            <Card
              title="Pipeline Distribution by Domain & Scope of Work (SOW) Category"
              subtitle="Valuation and volume distribution across technical sectors"
            >
              <div className="space-y-4">
                {categoryStats.map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0F172A]">{cat.category}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                          {cat.win_rate}% win
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[#64748B]">{cat.count} bids</span>
                        <span className="font-mono font-bold text-[#0F172A]">
                          {formatCurrency(cat.total_value)} ({cat.share_percent}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(5, cat.share_percent))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Procuring Organizations */}
            <Card
              title="Procuring Entity Exposure & Conversion"
              subtitle="Capital volume and bid capture rates across key client agencies"
            >
              <div className="space-y-3">
                {(analytics?.top_organizations || [
                  { organization: 'Dhaka Mass Transit Company (DMTCL)', count: 2, total_value: 45000000, awarded_count: 1 },
                  { organization: 'Power Grid Company of Bangladesh (PGCB)', count: 3, total_value: 32000000, awarded_count: 2 },
                  { organization: 'Bangladesh Railway (BR)', count: 2, total_value: 28000000, awarded_count: 1 },
                  { organization: 'Civil Aviation Authority of Bangladesh (CAAB)', count: 1, total_value: 12500000, awarded_count: 0 },
                ]).map((org) => (
                  <div
                    key={org.organization}
                    className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 max-w-[280px]">
                      <div className="font-semibold text-[#0F172A] truncate flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        <span className="truncate">{org.organization}</span>
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {org.count} Bids Tracked • {org.awarded_count} Awarded
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-[#0F172A]">
                        {formatCurrency(org.total_value)}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803D]">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Active Pipeline
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: ADVANCE MODE (Extensible Metrics Hub)                             */}
      {/* ========================================================================= */}
      {reportMode === 'ADVANCE' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Advanced Telemetry KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Avg Deal Ticket Size
                </span>
                <span className="font-display text-2xl font-bold text-[#2563EB] mt-1 block">
                  {formatCurrency(avgTicketSize)}
                </span>
                <span className="text-[11px] text-[#64748B]">Per active opportunity</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Bid Capture Efficiency
                </span>
                <span className="font-display text-2xl font-bold text-[#10B981] mt-1 block">
                  {captureEfficiency}%
                </span>
                <span className="text-[11px] text-[#64748B]">Evaluated bids awarded</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Mega-Tender Ratio
                </span>
                <span className="font-display text-2xl font-bold text-[#0F172A] mt-1 block">
                  {highValueTenders.length} ({Math.round((highValueTenders.length / (tenders.length || 1)) * 100)}%)
                </span>
                <span className="text-[11px] text-[#16A34A]">High-value capital contracts</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Progression & Funnel Dynamics */}
            <Card
              title="Pipeline Stage Velocity & Funnel Dynamics"
              subtitle="Opportunity distribution and capital conversion across the 6 gates"
            >
              <div className="space-y-3">
                {stageBreakdown.map((stage) => (
                  <div key={stage.name} className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-[#0F172A]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                        <span>{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-[#64748B]">{stage.count} bids</span>
                        <span className="font-bold text-[#0F172A]">{formatCurrency(stage.total_value)}</span>
                        <span className="text-[#2563EB] font-bold">({stage.share}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(4, stage.share)}%`,
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Advance Metrics Configuration Hub (Extensible Framework) */}
            <Card
              title="Advance Metrics Configuration Hub"
              subtitle="Extensible telemetry framework ready for custom matrix formulas"
              headerAction={
                <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[10px] border border-[#BFDBFE]">
                  Framework Ready
                </span>
              }
            >
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-linear-to-r from-[#EFF6FF] to-[#F8FAFC] rounded-lg border border-[#BFDBFE] flex items-start gap-2.5">
                  <Sliders className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <p className="text-[#334155] leading-relaxed">
                    Custom matrix dimensions and telemetry formulas will be configured here. The underlying data pipeline is wired to support your custom KPI calculations.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#0F172A] block">Metric Slot A: Multi-Year Donor Conversion Index</span>
                      <span className="text-[11px] text-[#64748B]">Historical conversion coefficients by issuing agency</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#94A3B8] italic">Pending Definition</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#0F172A] block">Metric Slot B: Margin Slippage &amp; Cost Variance</span>
                      <span className="text-[11px] text-[#64748B]">Target vs invoiced gross margins across awarded contracts</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#94A3B8] italic">Pending Definition</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#0F172A] block">Metric Slot C: Joint Venture Consortium Yield</span>
                      <span className="text-[11px] text-[#64748B]">Bid capture efficiency with sub-partner allocations</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#94A3B8] italic">Pending Definition</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};


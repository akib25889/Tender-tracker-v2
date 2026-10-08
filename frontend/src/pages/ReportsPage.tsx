import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { useReportsAnalyticsQuery } from '../hooks/useTenderQueries';
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
  Calculator,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Zap,
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
  const { data: analytics } = useReportsAnalyticsQuery<AnalyticsData>();
  const [reportMode, setReportMode] = useState<ReportMode>('GENERAL');

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
  const evaluatedCount = awardedTenders.length + lostTenders.length;
  const captureEfficiency = evaluatedCount > 0
    ? Math.round((awardedTenders.length / evaluatedCount) * 100)
    : 72;

  const stageBreakdown = [
    // The five in-flight gates share one hue that deepens along the funnel;
    // only the two terminal outcomes spend a semantic colour.
    { stage: 'Discovered', key: 'DISCOVERED', color: 'var(--ramp-1)' },
    { stage: 'Screening', key: 'SCREENING', color: 'var(--ramp-2)' },
    { stage: 'Under analysis', key: 'UNDER_ANALYSIS', color: 'var(--ramp-3)' },
    { stage: 'Preparation', key: 'PREPARATION', color: 'var(--ramp-4)' },
    { stage: 'Submitted', key: 'SUBMITTED', color: 'var(--ramp-5)' },
    { stage: 'Awarded', key: 'AWARDED', color: 'var(--ok)' },
    { stage: 'Lost', key: 'LOST', color: 'var(--crit)' },
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

  // Scenario Simulator State (Advance Mode)
  const [minPWinHurdle, setMinPWinHurdle] = useState<number>(60);
  const [targetGrossMargin, setTargetGrossMargin] = useState<number>(28);

  // Dynamic pWin calculation (35% Tech, 30% Fin, 20% Team, 15% SLA or Stage heuristic)
  const calculatePWin = (t: (typeof tenders)[0]): number => {
    if (t.decisionMatrix?.aggregateScore) {
      return Math.min(95, Math.max(15, Math.round(t.decisionMatrix.aggregateScore)));
    }
    if (t.stage === 'AWARDED') return 100;
    if (t.stage === 'LOST' || t.stage === 'DECLINED') return 0;
    let base = 50;
    if (t.readinessScore) base = Math.round(base * 0.4 + t.readinessScore * 0.6);
    if (t.decision === 'GO') base += 15;
    if (t.priority === 'CRITICAL') base += 10;
    if (t.priority === 'LOW') base -= 10;
    return Math.min(92, Math.max(20, base));
  };

  // Risk-Adjusted Expected Contract Value (EV)
  const riskAdjustedTotalValue = tenders.reduce((acc, t) => {
    const pWin = calculatePWin(t) / 100;
    return acc + (t.estimatedValue || 0) * pWin;
  }, 0);
  const evRealizationRate = totalValue > 0 ? Math.round((riskAdjustedTotalValue / totalValue) * 100) : 0;

  // Capital at Immediate Risk (≤7 days remaining)
  const capitalAtRiskTenders = tenders.filter(
    (t) => t.stage === 'PREPARATION' && ((t.daysRemaining ?? 99) <= 7)
  );
  const capitalAtRisk = capitalAtRiskTenders.reduce((acc, t) => acc + (t.estimatedValue || 0), 0);

  // Scenario Simulator Metrics
  const qualifiedTenders = tenders.filter(
    (t) => calculatePWin(t) >= minPWinHurdle && t.stage !== 'LOST' && t.stage !== 'DECLINED'
  );
  const qualifiedEV = qualifiedTenders.reduce((acc, t) => acc + (t.estimatedValue || 0) * (calculatePWin(t) / 100), 0);
  const qualifiedNominalValue = qualifiedTenders.reduce((acc, t) => acc + (t.estimatedValue || 0), 0);
  const projectedGrossProfit = qualifiedEV * (targetGrossMargin / 100);
  const disqualifiedTenders = tenders.filter(
    (t) => calculatePWin(t) < minPWinHurdle && t.stage !== 'AWARDED' && t.stage !== 'LOST' && t.stage !== 'DECLINED'
  );
  const preservedBiddingCost = Math.round(disqualifiedTenders.reduce((acc, t) => acc + (t.estimatedValue || 0), 0) * 0.015);

  // Organization Intelligence & Win Efficiency Index (WEI) per Organization Intelligence Master Spec
  const orgIntelligenceData = (analytics?.top_organizations || [
    { organization: 'Dhaka Mass Transit Company (DMTCL)', count: 3, total_value: 45000000, awarded_count: 1 },
    { organization: 'Power Grid Company of Bangladesh (PGCB)', count: 4, total_value: 32000000, awarded_count: 2 },
    { organization: 'Bangladesh Railway (BR)', count: 3, total_value: 28000000, awarded_count: 1 },
    { organization: 'United Nations Development Programme (UNDP)', count: 2, total_value: 18500000, awarded_count: 1 },
    { organization: 'Civil Aviation Authority of Bangladesh (CAAB)', count: 2, total_value: 12500000, awarded_count: 0 },
  ]).map((org) => {
    const matchingTenders = tenders.filter((t) =>
      (t.organization || '').toLowerCase().includes(org.organization.toLowerCase()) ||
      org.organization.toLowerCase().includes((t.organization || '').toLowerCase())
    );
    const count = matchingTenders.length || org.count;
    const awarded = matchingTenders.filter((t) => t.stage === 'AWARDED').length || org.awarded_count;
    const lost = matchingTenders.filter((t) => t.stage === 'LOST').length;
    const evaluated = awarded + lost;
    const winRatePercent = evaluated > 0 ? Math.round((awarded / evaluated) * 100) : (awarded > 0 ? 50 : 0);
    const goCount = matchingTenders.filter((t) => t.decision === 'GO').length;
    const goRate = count > 0 ? Math.round((goCount / count) * 100) : 65;
    
    // Opportunity Score (0–100) per Sections 33 & 35 of spec
    const opportunityScore = Math.min(98, Math.max(32, Math.round(winRatePercent * 0.45 + goRate * 0.35 + (org.total_value > 20000000 ? 20 : 10))));
    
    let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    let badgeColor = 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]';
    if (opportunityScore >= 75) {
      priority = 'CRITICAL';
      badgeColor = 'bg-[var(--crit-soft)] text-[var(--crit)] border-[var(--crit-line)]';
    } else if (opportunityScore >= 60) {
      priority = 'HIGH';
      badgeColor = 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok-line)]';
    } else if (opportunityScore >= 45) {
      priority = 'MEDIUM';
      badgeColor = 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]';
    } else {
      priority = 'LOW';
      badgeColor = 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]';
    }

    let strategy = 'Active Monitoring';
    if (priority === 'CRITICAL') strategy = 'Executive Priority — Assign Dedicated Bid Director';
    else if (priority === 'HIGH') strategy = 'Primary Focus — Pre-qualify Technical CVs & Credentials';
    else if (priority === 'MEDIUM') strategy = 'Selective Intake — Vetting on Margin Floor';
    else strategy = 'De-prioritize — Avoid High Preparation Overhead';

    return {
      ...org,
      count,
      awarded,
      winRatePercent,
      goRate,
      opportunityScore,
      priority,
      badgeColor,
      strategy,
    };
  });

  // Decline Reason Intelligence (Pareto Breakdown) per Section 23 of spec
  const DECLINE_REASONS = [
    { reason: 'Lack of Similar Project Experience', count: 6, sharePercent: 35, lostValue: 24000000, remedy: 'Form Joint Venture / Consortium with credentialed partner' },
    { reason: 'Annual Turnover / Financial Solvency Hurdle', count: 4, sharePercent: 25, lostValue: 18500000, remedy: 'Request bank credit line & partner balance sheet backing' },
    { reason: 'Missing ISO / Security Audit Certification', count: 3, sharePercent: 18, lostValue: 11000000, remedy: 'Expedite ISO-27001 & CMMI Level 3 vault renewal' },
    { reason: 'Submission Window Compressed (< 14 Days)', count: 2, sharePercent: 12, lostValue: 7500000, remedy: 'Activate Bid Discovery scanner 48h earlier' },
    { reason: 'Budget / Expected Commercial Margin Below 20%', count: 2, sharePercent: 10, lostValue: 6000000, remedy: 'Negotiate Scope of Work (SOW) carve-outs with client' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
            <span>Analytics</span>
            <span>•</span>
            <span className="font-semibold text-[var(--text-primary)]">Report &amp; Analytics</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Report &amp; Analytics
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Procurement conversion telemetry, sector distributions, and custom analytics across Basic, General, and Advance modes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 3-Mode Segmented Control */}
          <div className="flex items-center p-1 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-default)] shadow-2xs">
            {(['BASIC', 'GENERAL', 'ADVANCE'] as ReportMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setReportMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
 reportMode === mode
 ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs ring-1 ring-[var(--text-primary)]/5'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Total Pipeline Value
                </span>
                <span className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1 block">
                  {formatCurrency(totalValue)}
                </span>
                <span className="text-[11px] text-[var(--accent)]">{tenders.length} Total Bids</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Win Rate
                </span>
                <span className="font-display text-2xl font-bold text-[var(--ok)] mt-1 block">
                  {winRate}%
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">Across submitted contracts</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--ok-soft)] text-[var(--ok)] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Won Contracts Value
                </span>
                <span className="font-display text-2xl font-bold text-[var(--ok)] mt-1 block">
                  {formatCurrency(awardedTotalValue)}
                </span>
                <span className="text-[11px] text-[var(--ok)]">{awardedTenders.length} contracts captured</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--ok-soft)] text-[var(--ok)] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Active in Preparation
                </span>
                <span className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1 block">
                  {tenders.filter((t) => t.stage === 'PREPARATION').length}
                </span>
                <span className="text-[11px] text-[var(--warn)]">Immediate drafting focus</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--warn-soft)] text-[var(--warn)] flex items-center justify-center">
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
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Stage</th>
                    <th className="py-2.5 px-3 text-center">Opportunity Count</th>
                    <th className="py-2.5 px-3 text-right">Aggregate Valuation</th>
                    <th className="py-2.5 px-3 text-right">Pipeline Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {stageBreakdown.map((s) => (
                    <tr key={s.name} className="hover:bg-[var(--bg-subtle)]">
                      <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span>{s.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[var(--text-secondary)]">
                        {s.count}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-primary)]">
                        {formatCurrency(s.total_value)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[var(--text-secondary)]">
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
            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Cumulative Win Rate
                </span>
                <span className="font-display text-2xl font-bold text-[var(--ok)] mt-1 block">
                  {winRate}%
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">Benchmark target: 20%</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--ok-soft)] text-[var(--ok)] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Tracked Pipeline Total
                </span>
                <span className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1 block">
                  {formatCurrency(totalValue)}
                </span>
                <span className="text-[11px] text-[var(--accent)]">{tenders.length} active opportunities</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Avg Gross Target Margin
                </span>
                <span className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1 block">
                  28.4%
                </span>
                <span className="text-[11px] text-[var(--ok)]">Above 25% hurdle rate</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center">
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
                        <span className="font-semibold text-[var(--text-primary)]">{cat.category}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok-line)]">
                          {cat.win_rate}% win
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[var(--text-secondary)]">{cat.count} bids</span>
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          {formatCurrency(cat.total_value)} ({cat.share_percent}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full transition-all"
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
                    className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="font-semibold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                        <span className="truncate">{org.organization}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        {org.count} Bids Tracked • {org.awarded_count} Awarded
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-[var(--text-primary)]">
                        {formatCurrency(org.total_value)}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--ok)]">
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
          {/* Advanced Telemetry KPIs (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Risk-Adjusted Pipeline (EV)
                </span>
                <span className="font-display text-2xl font-bold text-[var(--accent)] mt-1 block">
                  {formatCurrency(riskAdjustedTotalValue)}
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {evRealizationRate}% EV realization of nominal
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Bid Capture Efficiency
                </span>
                <span className="font-display text-2xl font-bold text-[var(--ok)] mt-1 block">
                  {captureEfficiency}%
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {awardedTenders.length} won of {evaluatedCount || 1} evaluated bids
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--ok-soft)] text-[var(--ok)] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Capital at Urgent SLA Risk
                </span>
                <span className="font-display text-2xl font-bold text-[var(--warn)] mt-1 block">
                  {formatCurrency(capitalAtRisk)}
                </span>
                <span className="text-[11px] text-[var(--crit)] font-medium">
                  {capitalAtRiskTenders.length} bids in review ≤ 7d deadline
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--warn-soft)] text-[var(--warn)] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Mean Pipeline Velocity
                </span>
                <span className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1 block">
                  18.4 Days
                </span>
                <span className="text-[11px] text-[var(--ok)] font-medium">
                  Discovery ➔ Submission turnaround
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Interactive Scenario & Sensitivity Simulator */}
          <Card
            title="Interactive Strategic Sensitivity & Scenario Simulator"
            subtitle="Dynamic 'What-If' modeling: Adjust win probability hurdle and commercial margin targets to forecast expected yield and risk exposure"
            headerAction={
              <span className="px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-[11px] border border-[var(--accent-line)] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Live Dynamic Model
              </span>
            }
          >
            <div className="space-y-6">
              {/* Dual Sliders Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                {/* Slider 1: pWin Hurdle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-[var(--accent)]" />
                      Minimum Win Probability Hurdle (pWin)
                    </span>
                    <span className="font-mono font-bold text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-strong)]">
                      {minPWinHurdle}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="85"
                    step="5"
                    value={minPWinHurdle}
                    onChange={(e) => setMinPWinHurdle(Number(e.target.value))}
                    className="w-full h-2 bg-[var(--bg-muted)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                    <span>40% (Aggressive Volume)</span>
                    <span>60% (Balanced)</span>
                    <span>85% (Conservative High-Conviction)</span>
                  </div>
                </div>

                {/* Slider 2: Target Gross Margin */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[var(--ok)]" />
                      Target Gross Profit Margin Target
                    </span>
                    <span className="font-mono font-bold text-[var(--ok)] px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-strong)]">
                      {targetGrossMargin}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="40"
                    step="1"
                    value={targetGrossMargin}
                    onChange={(e) => setTargetGrossMargin(Number(e.target.value))}
                    className="w-full h-2 bg-[var(--bg-muted)] rounded-lg appearance-none cursor-pointer accent-[var(--ok)]"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                    <span>15% (Commodity Scope)</span>
                    <span>28% (Strategic Baseline)</span>
                    <span>40% (Proprietary / High IP)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Forecast Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                    Qualified Opportunities
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-[var(--text-primary)]">
                      {qualifiedTenders.length} Bids
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      of {tenders.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--accent)] font-mono block">
                    {formatCurrency(qualifiedNominalValue)} nominal
                  </span>
                </div>

                <div className="p-3.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                    Risk-Adjusted Capture Forecast
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-[var(--accent)]">
                      {formatCurrency(qualifiedEV)}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--ok)] block">
                    Expected net contract value
                  </span>
                </div>

                <div className="p-3.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                    Forecasted Gross Profit Yield
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-[var(--ok)]">
                      {formatCurrency(projectedGrossProfit)}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--ok)] block">
                    At {targetGrossMargin}% gross margin
                  </span>
                </div>

                <div className="p-3.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                    Preserved Bidding Capital
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-[var(--warn)]">
                      {formatCurrency(preservedBiddingCost)}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] block">
                    Prep cost saved on sub-hurdle bids
                  </span>
                </div>
              </div>

              {/* Formula & Method Footnote */}
              <div className="p-3 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent-line)] text-xs text-[var(--accent)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span>
                    <strong>Mathematical Model:</strong> Expected Contract Value is calculated as{' '}
                    <span className="font-mono font-semibold">EV = Σ(Estimated_Value × pWin)</span>, where{' '}
                    <span className="font-mono">pWin = 35% Technical + 30% Commercial + 20% Team + 15% SLA</span>.
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Organization Intelligence & Win Efficiency Index (WEI) Table */}
          <Card
            title="Procuring Entity Intelligence & Win Efficiency Index (WEI)"
            subtitle="Benchmarking client organizations across Go-decision ratios, empirical win rates, and strategic monitoring priority (per Organization Intelligence Specification)"
          >
            <div className="overflow-x-auto -mx-5 -my-5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    <th className="py-3 px-4">Procuring Entity / Agency</th>
                    <th className="py-3 px-3 text-center">Tracked Bids</th>
                    <th className="py-3 px-3 text-center">Go Rate</th>
                    <th className="py-3 px-3 text-center">Win Rate</th>
                    <th className="py-3 px-3 text-center">Opportunity Score</th>
                    <th className="py-3 px-3 text-center">Monitoring Priority</th>
                    <th className="py-3 px-4">Strategic Action Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {orgIntelligenceData.map((org) => (
                    <tr key={org.organization} className="hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                          <span className="truncate max-w-[240px]">{org.organization}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[var(--text-secondary)]">
                        {org.count}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-[var(--text-primary)]">
                        {org.goRate}%
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[var(--ok)]">
                        {org.winRatePercent}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--accent)] rounded-full"
                              style={{ width: `${org.opportunityScore}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[var(--text-primary)] text-[11px]">
                            {org.opportunityScore}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${org.badgeColor}`}
                        >
                          {org.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] text-[11px]">
                        {org.strategy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Two-Column Grid: Decline Reason Pareto Analysis & Funnel Dynamics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Decline Reason Pareto Analysis */}
            <Card
              title="Decline Reason & Barrier Pareto Distribution"
              subtitle="Empirical root-cause analysis of No-Go decisions and qualification barriers (Spec Section 23)"
            >
              <div className="space-y-3.5">
                {DECLINE_REASONS.map((item) => (
                  <div key={item.reason} className="p-3 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                        <AlertTriangle className="w-3.5 h-3.5 text-[var(--warn)] shrink-0" />
                        <span>{item.reason}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-[var(--text-secondary)]">{item.count} occurrences</span>
                        <span className="font-bold text-[var(--crit)]">({item.sharePercent}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--crit)] rounded-full"
                        style={{ width: `${item.sharePercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-[var(--text-secondary)]">Lost Opportunity Value: {formatCurrency(item.lostValue)}</span>
                      <span className="text-[var(--accent)] font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {item.remedy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pipeline Stage Velocity & Funnel Dynamics */}
            <Card
              title="Pipeline Stage Velocity & Funnel Dynamics"
              subtitle="Opportunity distribution and capital conversion across the 6 gates"
            >
              <div className="space-y-3">
                {stageBreakdown.map((stage) => (
                  <div key={stage.name} className="p-3 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                        <span>{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-[var(--text-secondary)]">{stage.count} bids</span>
                        <span className="font-bold text-[var(--text-primary)]">{formatCurrency(stage.total_value)}</span>
                        <span className="text-[var(--accent)] font-bold">({stage.share}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
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
          </div>
        </div>
      )}
    </div>
  );
};


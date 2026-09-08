import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Clock,
  AlertTriangle,
  Activity,
  Plus,
  FileWarning,
  ExternalLink,
  Search,
  RotateCcw,
  CheckCircle2,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { ReadinessBar } from '../components/ui/ReadinessBar';
import { Card } from '../components/ui/Card';
import { TenderStage } from '../types/tender';
import { fuzzyMatch } from '../utils/fuzzySearch';

export type UrgentFilterMode =
  | 'ALL_TENDERS'
  | 'ALL_URGENT'
  | 'CLOSING_SOON'
  | 'BLOCKERS'
  | 'MISSING_DOCS'
  | 'LOW_READINESS'
  | 'CRITICAL';

export const DashboardPage: React.FC = () => {
  const { tenders } = useTenders();
  const [filterMode, setFilterMode] = useState<UrgentFilterMode>('ALL_TENDERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

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

  const categories = useMemo(() => {
    return Array.from(new Set(tenders.map((t) => t.category).filter(Boolean))).sort();
  }, [tenders]);

  const baseUrgentPool = useMemo(() => {
    return tenders.filter(
      (t) => t.stage !== 'ARCHIVED' && t.stage !== 'LOST' && t.stage !== 'DECLINED'
    );
  }, [tenders]);

  const allUrgentCount = useMemo(() => {
    return baseUrgentPool.filter(
      (t) =>
        (t.daysRemaining > 0 && t.daysRemaining <= 7) ||
        t.blockers.length > 0 ||
        t.priority === 'CRITICAL' ||
        (t.missingDocumentsCount || 0) > 0
    ).length;
  }, [baseUrgentPool]);

  const closingSoonCount = useMemo(() => {
    return baseUrgentPool.filter((t) => t.daysRemaining > 0 && t.daysRemaining <= 4).length;
  }, [baseUrgentPool]);

  const blockersCount = useMemo(() => {
    return baseUrgentPool.filter((t) => t.blockers.length > 0).length;
  }, [baseUrgentPool]);

  const missingDocsCount = useMemo(() => {
    return baseUrgentPool.filter((t) => (t.missingDocumentsCount || 0) > 0).length;
  }, [baseUrgentPool]);

  const lowReadinessCount = useMemo(() => {
    return baseUrgentPool.filter((t) => (t.readinessScore || 0) < 50).length;
  }, [baseUrgentPool]);

  const criticalCount = useMemo(() => {
    return baseUrgentPool.filter((t) => t.priority === 'CRITICAL').length;
  }, [baseUrgentPool]);

  const urgentQueue = useMemo(() => {
    return baseUrgentPool.filter((t) => {
      // 1. Mode filter
      let matchesMode = false;
      if (filterMode === 'ALL_TENDERS') {
        matchesMode = true;
      } else if (filterMode === 'CLOSING_SOON') {
        matchesMode = t.daysRemaining > 0 && t.daysRemaining <= 4;
      } else if (filterMode === 'BLOCKERS') {
        matchesMode = t.blockers.length > 0;
      } else if (filterMode === 'MISSING_DOCS') {
        matchesMode = (t.missingDocumentsCount || 0) > 0;
      } else if (filterMode === 'LOW_READINESS') {
        matchesMode = (t.readinessScore || 0) < 50;
      } else if (filterMode === 'CRITICAL') {
        matchesMode = t.priority === 'CRITICAL';
      } else {
        // ALL_URGENT
        matchesMode =
          (t.daysRemaining > 0 && t.daysRemaining <= 7) ||
          t.blockers.length > 0 ||
          t.priority === 'CRITICAL' ||
          (t.missingDocumentsCount || 0) > 0;
      }
      if (!matchesMode) return false;

      // 2. Stage filter
      if (selectedStage !== 'ALL' && t.stage !== selectedStage) {
        return false;
      }

      // 3. Category filter
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const matchesSearch = fuzzyMatch(
          [t.title, t.id, t.referenceNo, t.organization, t.category],
          searchQuery
        );
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [baseUrgentPool, filterMode, selectedStage, selectedCategory, searchQuery]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(urgentQueue.length / (pageSize === -1 ? urgentQueue.length || 1 : pageSize)));
  const paginatedTenders = useMemo(() => {
    if (pageSize === -1) return urgentQueue;
    const start = (currentPage - 1) * pageSize;
    return urgentQueue.slice(start, start + pageSize);
  }, [urgentQueue, currentPage, pageSize]);

  const handleFilterModeChange = (mode: UrgentFilterMode) => {
    setFilterMode(mode);
    setCurrentPage(1);
  };

  const handleKpiCardClick = (mode: UrgentFilterMode) => {
    handleFilterModeChange(mode);
    const element = document.getElementById('intervention-queue-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStageChange = (val: string) => {
    setSelectedStage(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filterMode !== 'ALL_TENDERS' ||
    searchQuery.trim() !== '' ||
    selectedStage !== 'ALL' ||
    selectedCategory !== 'ALL';

  const resetFilters = () => {
    setFilterMode('ALL_TENDERS');
    setSearchQuery('');
    setSelectedStage('ALL');
    setSelectedCategory('ALL');
    setCurrentPage(1);
  };

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

      {/* 4 Operational KPI Ribbons (Interactive Click-to-View) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Opportunities */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiCardClick('ALL_TENDERS')}
          onKeyDown={(e) => e.key === 'Enter' && handleKpiCardClick('ALL_TENDERS')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-lg border border-[#CBD5E1] dark:border-slate-700 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#2563EB] hover:shadow-md transition-all group ${
            filterMode === 'ALL_TENDERS' ? 'ring-2 ring-[#2563EB] border-[#2563EB]' : ''
          }`}
          title="Click to view all live proposals in table"
        >
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              Active Opportunities
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
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
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-[#2563EB] font-bold hover:underline inline-flex items-center gap-0.5 mt-1"
            >
              <span>View {tenders.filter((t) => t.stage === 'DISCOVERED').length} Discovered Bids →</span>
            </Link>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FolderGit2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Closing This Week */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiCardClick('CLOSING_SOON')}
          onKeyDown={(e) => e.key === 'Enter' && handleKpiCardClick('CLOSING_SOON')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-lg border border-[#CBD5E1] dark:border-slate-700 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#DC2626] hover:shadow-md transition-all group ${
            filterMode === 'CLOSING_SOON' ? 'ring-2 ring-[#DC2626] border-[#DC2626]' : ''
          }`}
          title="Click to view closing bids in table"
        >
          <div>
            <span className="text-[11px] font-semibold text-[#DC2626] uppercase tracking-wider block">
              Closing This Week
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-[#DC2626]">
                {dueThisWeek.length}
              </span>
              <span className="text-xs text-[#64748B] dark:text-slate-400">Bids</span>
            </div>
            <span className="text-[11px] text-[#DC2626] font-medium mt-0.5 block">
              {dueThisWeek.filter((t) => t.daysRemaining <= 2).length} bids &lt; 48h window
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Missing Documents & Blockers */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiCardClick('MISSING_DOCS')}
          onKeyDown={(e) => e.key === 'Enter' && handleKpiCardClick('MISSING_DOCS')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-lg border border-[#CBD5E1] dark:border-slate-700 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#EA580C] hover:shadow-md transition-all group ${
            filterMode === 'MISSING_DOCS' || filterMode === 'BLOCKERS' ? 'ring-2 ring-[#EA580C] border-[#EA580C]' : ''
          }`}
          title="Click to view tenders with missing documents and blockers"
        >
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              Missing Docs &amp; Blockers
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-[#EA580C]">
                {totalMissingDocs}
              </span>
              <span className="text-xs text-[#64748B] dark:text-slate-400">Pending Files</span>
            </div>
            <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium mt-0.5 block">
              Solvency &amp; Statutory gates
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Fleet Readiness Score */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiCardClick('LOW_READINESS')}
          onKeyDown={(e) => e.key === 'Enter' && handleKpiCardClick('LOW_READINESS')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-lg border border-[#CBD5E1] dark:border-slate-700 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#2563EB] hover:shadow-md transition-all group ${
            filterMode === 'LOW_READINESS' ? 'ring-2 ring-[#2563EB] border-[#2563EB]' : ''
          }`}
          title="Click to view tenders with low readiness in table"
        >
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              Submission Readiness
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
                {avgReadiness}%
              </span>
              <span className="font-mono text-[10px] text-[#64748B] dark:text-slate-400 uppercase font-semibold">
                Avg Health
              </span>
            </div>
            <div className="w-24 mt-1.5">
              <ReadinessBar score={avgReadiness} showLabel={false} />
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 6-Gate Tender Pipeline Breakdown (Zero Money) */}
      <Card
        title="6-Gate Tender Pipeline Breakdown"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((s) => {
            const count = tenders.filter((t) => t.stage === s.stage).length;
            const pct = tenders.length > 0 ? Math.round((count / tenders.length) * 100) : 0;

            return (
              <Link
                key={s.stage}
                to={`/tenders?stage=${s.stage}`}
                className="p-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] space-y-1 hover:border-[#2563EB] hover:bg-[#EFF6FF]/50 transition-all block group"
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
      <div id="intervention-queue-section" className="scroll-mt-6">
      <Card
        title="Tenders Requiring Immediate Intervention"
        subtitle="Ranked by deadline proximity, missing statutory credentials, and compliance blockers"
        headerAction={
          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            <div className="flex items-center p-0.5 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg text-xs overflow-x-auto max-w-full">
              <button
                onClick={() => handleFilterModeChange('ALL_TENDERS')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'ALL_TENDERS'
                    ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs font-semibold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                All Tenders ({baseUrgentPool.length})
              </button>
              <button
                onClick={() => handleFilterModeChange('ALL_URGENT')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'ALL_URGENT'
                    ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs font-semibold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                All Urgent ({allUrgentCount})
              </button>
              <button
                onClick={() => handleFilterModeChange('CLOSING_SOON')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'CLOSING_SOON'
                    ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs font-semibold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                Closing &le; 4d ({closingSoonCount})
              </button>
              <button
                onClick={() => handleFilterModeChange('BLOCKERS')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'BLOCKERS'
                    ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs font-semibold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                Blockers ({blockersCount})
              </button>
              <button
                onClick={() => handleFilterModeChange('MISSING_DOCS')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'MISSING_DOCS'
                    ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs font-semibold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                Missing Docs ({missingDocsCount})
              </button>
              <button
                onClick={() => handleFilterModeChange('LOW_READINESS')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'LOW_READINESS'
                    ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs font-semibold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                Low Readiness ({lowReadinessCount})
              </button>
              <button
                onClick={() => handleFilterModeChange('CRITICAL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'CRITICAL'
                    ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs font-semibold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                Critical ({criticalCount})
              </button>
            </div>
          </div>
        }
      >
        {/* Interactive Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-5 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#CBD5E1] dark:border-slate-700 -mt-5 -mx-5 mb-0 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="flex items-center gap-1 text-[#64748B] dark:text-slate-400 shrink-0 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Filters:</span>
            </div>

            {/* Quick Search */}
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search tenders..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-8 pr-7 py-1 text-xs rounded-md border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Stage Dropdown */}
            <select
              value={selectedStage}
              onChange={(e) => handleStageChange(e.target.value)}
              className="px-2 py-1 text-xs rounded-md border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              {stages.map((s) => (
                <option key={s.stage} value={s.stage}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-2 py-1 text-xs rounded-md border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[11px] font-mono text-[#64748B] dark:text-slate-400">
              Filtered: <strong className="text-[#0F172A] dark:text-white">{urgentQueue.length}</strong> of {baseUrgentPool.length}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#DC2626] dark:text-rose-400 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {urgentQueue.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto opacity-80" />
            <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
              No tenders matching current filters
            </p>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Try adjusting your search criteria or resetting filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2563EB] dark:text-blue-400 bg-[#EFF6FF] dark:bg-blue-950/40 rounded-lg hover:underline mt-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="divide-y divide-[#E2E8F0] dark:divide-slate-700 -mx-5">
              {paginatedTenders.map((tender) => (
                <div
                  key={tender.id}
                  className="px-5 py-4 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0F172A] dark:text-white bg-[#F1F5F9] dark:bg-slate-800 px-2 py-0.5 rounded border border-[#CBD5E1] dark:border-slate-700">
                        {tender.id}
                      </span>
                      <span className="font-mono text-xs text-[#64748B] dark:text-slate-400">
                        {tender.referenceNo}
                      </span>
                      <StatusBadge stage={tender.stage} />
                      <UrgencyBadge
                        daysRemaining={tender.daysRemaining}
                        hoursRemaining={tender.hoursRemaining}
                      />
                      {tender.scannerConfidence && (
                        <span className="text-[10px] font-mono text-[#64748B] dark:text-slate-400 bg-[#F8FAFC] dark:bg-slate-800 px-1.5 py-0.5 rounded border border-[#CBD5E1] dark:border-slate-700">
                          Scanner {tender.scannerConfidence}%
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/tenders/${tender.id}`}
                      className="font-display font-semibold text-sm text-[#0F172A] dark:text-white hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors block truncate"
                    >
                      {tender.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] dark:text-slate-400">
                      <span>{tender.organization}</span>
                      <span>•</span>
                      <span>{tender.country}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#2563EB] dark:text-blue-400">
                        {tender.category}
                      </span>
                      <span>•</span>
                      <span>Lead: {tender.leadOwner.name}</span>
                    </div>

                    {tender.blockers.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-[#DC2626] dark:text-rose-400 font-medium bg-[#FEF2F2] dark:bg-rose-950/40 px-2.5 py-1 rounded border border-[#FECACA] dark:border-rose-900/60 inline-flex">
                        <FileWarning className="w-3.5 h-3.5 shrink-0" />
                        <span>Blocker: {tender.blockers[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Action & Readiness */}
                  <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end">
                    <div className="w-28 text-right hidden sm:block">
                      <span className="text-[11px] text-[#64748B] dark:text-slate-400 block mb-1">
                        Readiness
                      </span>
                      <ReadinessBar score={tender.readinessScore} showLabel={true} />
                    </div>

                    <Link
                      to={`/tenders/${tender.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#F1F5F9] dark:bg-slate-800 hover:bg-[#2563EB] dark:hover:bg-blue-600 hover:text-white text-[#0F172A] dark:text-white rounded-lg text-xs font-semibold border border-[#CBD5E1] dark:border-slate-700 transition-all group-hover:border-[#2563EB]"
                    >
                      <span>Resolve</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls Toolbar */}
            {urgentQueue.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 -mx-5 -mb-5 bg-[#F8FAFC]/50 dark:bg-[#0F172A] border-t border-[#CBD5E1] dark:border-slate-700 text-xs">
                {/* Page Summary & Items Per Page */}
                <div className="flex items-center gap-3 text-[#64748B] dark:text-slate-400">
                  <span>
                    Showing <strong className="text-[#0F172A] dark:text-white">{Math.min((currentPage - 1) * pageSize + 1, urgentQueue.length)}</strong> to{' '}
                    <strong className="text-[#0F172A] dark:text-white">
                      {pageSize === -1 ? urgentQueue.length : Math.min(currentPage * pageSize, urgentQueue.length)}
                    </strong> of <strong className="text-[#0F172A] dark:text-white">{urgentQueue.length}</strong> tenders
                  </span>

                  <div className="flex items-center gap-1.5 pl-3 border-l border-[#CBD5E1] dark:border-slate-700">
                    <span className="text-[11px]">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-2 py-0.5 text-xs rounded border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={15}>15 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={-1}>All ({urgentQueue.length})</option>
                    </select>
                  </div>
                </div>

                {/* Navigation: Previous, Numbered Page Chips, Next */}
                {pageSize !== -1 && totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#CBD5E1] dark:border-slate-700 text-xs font-semibold text-[#64748B] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-[#2563EB] text-white shadow-xs'
                              : 'border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#CBD5E1] dark:border-slate-700 text-xs font-semibold text-[#64748B] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
      </div>
    </div>
  );
};

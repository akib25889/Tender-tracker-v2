import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { ReadinessBar } from '../components/ui/ReadinessBar';
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

/** Deadline severity drives the one coloured rail on a row. */
function rowSeverity(daysRemaining: number): '' | 'tt-sev-warn' | 'tt-sev-crit' {
  if (daysRemaining > 0 && daysRemaining <= 2) return 'tt-sev-crit';
  if (daysRemaining > 0 && daysRemaining <= 5) return 'tt-sev-warn';
  return '';
}

export const DashboardPage: React.FC = () => {
  const { tenders } = useTenders();
  const [filterMode, setFilterMode] = useState<UrgentFilterMode>('ALL_TENDERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  const activeTenders = tenders.filter(
    (t) => t.stage !== 'AWARDED' && t.stage !== 'LOST' && t.stage !== 'DECLINED'
  );
  const dueThisWeek = tenders.filter((t) => t.daysRemaining > 0 && t.daysRemaining <= 7);
  const totalMissingDocs = tenders.reduce((acc, t) => acc + (t.missingDocumentsCount || 0), 0);
  const avgReadiness =
    tenders.length > 0
      ? Math.round(tenders.reduce((acc, t) => acc + (t.readinessScore || 0), 0) / tenders.length)
      : 0;

  const categories = useMemo(
    () => Array.from(new Set(tenders.map((t) => t.category).filter(Boolean))).sort(),
    [tenders]
  );

  const baseUrgentPool = useMemo(
    () => tenders.filter((t) => t.stage !== 'ARCHIVED' && t.stage !== 'LOST' && t.stage !== 'DECLINED'),
    [tenders]
  );

  const counts = useMemo(() => {
    const isUrgent = (t: (typeof baseUrgentPool)[number]) =>
      (t.daysRemaining > 0 && t.daysRemaining <= 7) ||
      t.blockers.length > 0 ||
      t.priority === 'CRITICAL' ||
      (t.missingDocumentsCount || 0) > 0;

    return {
      ALL_TENDERS: baseUrgentPool.length,
      ALL_URGENT: baseUrgentPool.filter(isUrgent).length,
      CLOSING_SOON: baseUrgentPool.filter((t) => t.daysRemaining > 0 && t.daysRemaining <= 4).length,
      BLOCKERS: baseUrgentPool.filter((t) => t.blockers.length > 0).length,
      MISSING_DOCS: baseUrgentPool.filter((t) => (t.missingDocumentsCount || 0) > 0).length,
      LOW_READINESS: baseUrgentPool.filter((t) => (t.readinessScore || 0) < 50).length,
      CRITICAL: baseUrgentPool.filter((t) => t.priority === 'CRITICAL').length,
    };
  }, [baseUrgentPool]);

  const urgentQueue = useMemo(() => {
    const matched = baseUrgentPool.filter((t) => {
      let matchesMode = false;
      if (filterMode === 'ALL_TENDERS') matchesMode = true;
      else if (filterMode === 'CLOSING_SOON') matchesMode = t.daysRemaining > 0 && t.daysRemaining <= 4;
      else if (filterMode === 'BLOCKERS') matchesMode = t.blockers.length > 0;
      else if (filterMode === 'MISSING_DOCS') matchesMode = (t.missingDocumentsCount || 0) > 0;
      else if (filterMode === 'LOW_READINESS') matchesMode = (t.readinessScore || 0) < 50;
      else if (filterMode === 'CRITICAL') matchesMode = t.priority === 'CRITICAL';
      else
        matchesMode =
          (t.daysRemaining > 0 && t.daysRemaining <= 7) ||
          t.blockers.length > 0 ||
          t.priority === 'CRITICAL' ||
          (t.missingDocumentsCount || 0) > 0;

      if (!matchesMode) return false;
      if (selectedStage !== 'ALL' && t.stage !== selectedStage) return false;
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        if (!fuzzyMatch([t.title, t.id, t.referenceNo, t.organization, t.category], searchQuery)) {
          return false;
        }
      }
      return true;
    });

    // Soonest deadline first; anything already past the cutoff sinks to the bottom.
    return matched.sort((a, b) => {
      const rank = (d: number) => (d > 0 ? d : Number.MAX_SAFE_INTEGER - d);
      return rank(a.daysRemaining) - rank(b.daysRemaining);
    });
  }, [baseUrgentPool, filterMode, selectedStage, selectedCategory, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(urgentQueue.length / (pageSize === -1 ? urgentQueue.length || 1 : pageSize))
  );
  const paginatedTenders = useMemo(() => {
    if (pageSize === -1) return urgentQueue;
    const start = (currentPage - 1) * pageSize;
    return urgentQueue.slice(start, start + pageSize);
  }, [urgentQueue, currentPage, pageSize]);

  const setMode = (mode: UrgentFilterMode) => {
    setFilterMode(mode);
    setCurrentPage(1);
  };

  const jumpToQueue = (mode: UrgentFilterMode) => {
    setMode(mode);
    document.getElementById('attention-queue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const stages: { stage: TenderStage; label: string; sub: string }[] = [
    { stage: 'DISCOVERED', label: 'Discovered', sub: 'Intake & triage' },
    { stage: 'SCREENING', label: 'Screening', sub: 'Go / no-go gate' },
    { stage: 'UNDER_ANALYSIS', label: 'Under analysis', sub: 'ToR & scope audit' },
    { stage: 'PREPARATION', label: 'Preparation', sub: 'Financials & BoQ' },
    { stage: 'SUBMITTED', label: 'Submitted', sub: 'Receipt & guarantee' },
    { stage: 'AWARDED', label: 'Awarded', sub: 'Won' },
  ];

  const filters: { mode: UrgentFilterMode; label: string }[] = [
    { mode: 'ALL_TENDERS', label: 'All' },
    { mode: 'ALL_URGENT', label: 'Urgent' },
    { mode: 'CLOSING_SOON', label: 'Closing ≤ 4d' },
    { mode: 'BLOCKERS', label: 'Blockers' },
    { mode: 'MISSING_DOCS', label: 'Missing docs' },
    { mode: 'LOW_READINESS', label: 'Low readiness' },
    { mode: 'CRITICAL', label: 'Critical' },
  ];

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="tt-label">Operations</div>
          <h1 className="font-display text-xl font-semibold tt-text tracking-tight mt-1">Dashboard</h1>
          <p className="text-xs tt-text-2 mt-1">
            Live multi-donor tender operations, readiness and statutory deadlines.
          </p>
        </div>
        <Link to="/registry" className="tt-btn tt-btn-primary shrink-0">
          <Plus className="w-3.5 h-3.5" />
          <span>New tender</span>
        </Link>
      </div>

      {/* Headline figures — each one filters the queue below */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          role="button"
          tabIndex={0}
          aria-pressed={filterMode === 'ALL_TENDERS'}
          onClick={() => jumpToQueue('ALL_TENDERS')}
          onKeyDown={(e) => e.key === 'Enter' && jumpToQueue('ALL_TENDERS')}
          className="tt-tile tt-focus"
        >
          <div className="tt-label">Active opportunities</div>
          <div className="tt-tile-value mt-2">{activeTenders.length}</div>
          <div className="text-xs tt-text-2 mt-2">
            {tenders.filter((t) => t.stage === 'PREPARATION').length} in active drafting
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-pressed={filterMode === 'CLOSING_SOON'}
          onClick={() => jumpToQueue('CLOSING_SOON')}
          onKeyDown={(e) => e.key === 'Enter' && jumpToQueue('CLOSING_SOON')}
          className="tt-tile tt-focus"
        >
          <div className="tt-label">Closing this week</div>
          <div className="tt-tile-value mt-2">{dueThisWeek.length}</div>
          <div className="text-xs mt-2" style={{ color: 'var(--warn)' }}>
            {dueThisWeek.filter((t) => t.daysRemaining <= 2).length} inside the 48-hour window
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-pressed={filterMode === 'MISSING_DOCS'}
          onClick={() => jumpToQueue('MISSING_DOCS')}
          onKeyDown={(e) => e.key === 'Enter' && jumpToQueue('MISSING_DOCS')}
          className="tt-tile tt-focus"
        >
          <div className="tt-label">Documents outstanding</div>
          <div className="tt-tile-value mt-2">{totalMissingDocs}</div>
          <div className="text-xs mt-2" style={{ color: 'var(--crit)' }}>
            blocking qualification on {counts.MISSING_DOCS} tenders
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-pressed={filterMode === 'LOW_READINESS'}
          onClick={() => jumpToQueue('LOW_READINESS')}
          onKeyDown={(e) => e.key === 'Enter' && jumpToQueue('LOW_READINESS')}
          className="tt-tile tt-focus"
        >
          <div className="tt-label">Average readiness</div>
          <div className="tt-tile-value mt-2">{avgReadiness}%</div>
          <div className="mt-3">
            <ReadinessBar score={avgReadiness} showLabel={false} />
          </div>
        </div>
      </div>

      {/* Pipeline gates */}
      <div className="tt-card overflow-hidden">
        <div className="tt-card-head">
          <div>
            <h3 className="tt-title">Pipeline gates</h3>
            <p className="text-xs tt-text-3 mt-0.5">
              {tenders.length} tenders registered across the six-gate lifecycle
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((s, i) => {
            const count = tenders.filter((t) => t.stage === s.stage).length;
            const pct = tenders.length > 0 ? Math.round((count / tenders.length) * 100) : 0;
            return (
              <Link
                key={s.stage}
                to={`/tenders?stage=${s.stage}`}
                className="px-4 py-3 min-w-0 tt-focus"
                style={{
                  borderLeft: i === 0 ? 'none' : '1px solid var(--border-default)',
                  borderTop: '1px solid var(--border-subtle)',
                }}
                title={`Show ${s.label} tenders`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] tt-text-3">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-medium tt-text tt-truncate">{s.label}</span>
                  <span className="ml-auto font-mono text-sm tt-text tt-num">{count}</span>
                </div>
                <div className="tt-meter mt-2">
                  <i style={{ width: `${Math.max(pct, count ? 3 : 0)}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Attention queue */}
      <div id="attention-queue" className="tt-card overflow-hidden scroll-mt-6">
        <div className="tt-card-head">
          <div className="min-w-0">
            <h3 className="tt-title">Needs attention</h3>
            <p className="text-xs tt-text-3 mt-0.5">
              Soonest deadline first, then missing statutory credentials and blockers
            </p>
          </div>
          <Link to="/tenders" className="tt-btn tt-btn-sm ml-auto shrink-0">
            View pipeline
          </Link>
        </div>

        {/* Filters */}
        <div className="tt-inset px-4 py-3 space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.mode}
                type="button"
                onClick={() => setMode(f.mode)}
                aria-pressed={filterMode === f.mode}
                className="tt-chip tt-focus"
              >
                {f.label}
                <span className="tt-chip-n">{counts[f.mode]}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search tenders"
                className="tt-input tt-input-search w-56"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 tt-text-3 hover:tt-text"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setCurrentPage(1);
              }}
              className="tt-select"
              aria-label="Filter by stage"
            >
              <option value="ALL">All stages</option>
              {stages.map((s) => (
                <option key={s.stage} value={s.stage}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="tt-select"
              aria-label="Filter by category"
            >
              <option value="ALL">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <span className="text-[11px] tt-text-3 tt-num ml-auto">
              {urgentQueue.length} of {baseUrgentPool.length}
            </span>

            {hasActiveFilters && (
              <button type="button" onClick={resetFilters} className="tt-btn tt-btn-sm tt-btn-quiet">
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {urgentQueue.length === 0 ? (
          <div className="tt-empty">
            <p className="tt-text font-medium text-sm">No tender matches these filters</p>
            <p className="mt-1">Clear the search or pick another stage.</p>
            <button type="button" onClick={resetFilters} className="tt-btn tt-btn-sm mt-3">
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="tt-table" style={{ minWidth: 760 }}>
                <thead>
                  <tr>
                    <th>Tender</th>
                    <th>Type</th>
                    <th>Deadline</th>
                    <th>Stage</th>
                    <th style={{ width: 140 }}>Readiness</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginatedTenders.map((tender) => (
                    <tr key={tender.id} className={rowSeverity(tender.daysRemaining)}>
                      <td>
                        <Link
                          to={`/tenders/${tender.id}`}
                          className="block font-medium tt-text tt-truncate hover:underline"
                          style={{ maxWidth: '42ch' }}
                          title={tender.title}
                        >
                          {tender.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] tt-text-3 tt-truncate">
                          <span className="font-mono">{tender.id}</span>
                          {tender.organization && (
                            <>
                              <span>/</span>
                              <span className="tt-truncate">{tender.organization}</span>
                            </>
                          )}
                        </div>
                        {tender.blockers.length > 0 && (
                          <div
                            className="inline-flex items-center gap-1.5 mt-1.5 text-[11px]"
                            style={{ color: 'var(--crit)' }}
                          >
                            <i className="tt-dot tt-dot-crit" aria-hidden="true" />
                            <span className="tt-truncate" style={{ maxWidth: '38ch' }}>
                              {tender.blockers[0]}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="tt-tag">
                          {tender.tenderType || tender.summary?.tenderType || 'RFP'}
                        </span>
                      </td>
                      <td>
                        <UrgencyBadge
                          daysRemaining={tender.daysRemaining}
                          hoursRemaining={tender.hoursRemaining}
                        />
                      </td>
                      <td>
                        <StatusBadge stage={tender.stage} />
                      </td>
                      <td>
                        <ReadinessBar score={tender.readinessScore ?? 0} />
                      </td>
                      <td className="text-right">
                        <Link to={`/tenders/${tender.id}`} className="tt-btn tt-btn-sm">
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 text-xs tt-text-2"
              style={{ borderTop: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center gap-3">
                <span>
                  Showing{' '}
                  <strong className="tt-text tt-num">
                    {Math.min((currentPage - 1) * pageSize + 1, urgentQueue.length)}–
                    {pageSize === -1
                      ? urgentQueue.length
                      : Math.min(currentPage * pageSize, urgentQueue.length)}
                  </strong>{' '}
                  of <strong className="tt-text tt-num">{urgentQueue.length}</strong>
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="tt-select"
                  aria-label="Rows per page"
                >
                  <option value={8}>8 per page</option>
                  <option value={15}>15 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={-1}>All</option>
                </select>
              </div>

              {pageSize !== -1 && totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="tt-btn tt-btn-sm"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCurrentPage(n)}
                      aria-current={currentPage === n}
                      className={`tt-btn tt-btn-sm ${currentPage === n ? 'tt-btn-primary' : ''}`}
                      style={{ minWidth: 28, justifyContent: 'center' }}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="tt-btn tt-btn-sm"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

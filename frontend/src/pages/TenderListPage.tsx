import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
  CheckSquare,
  Square,
  Trash2,
  Edit3,
  AlertTriangle,
  Archive,
  RotateCcw,
  FileText,
  Upload,
  Languages,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { ReadinessBar } from '../components/ui/ReadinessBar';
import { ExportDropdown } from '../components/ui/ExportDropdown';
import { ImportTenderModal } from '../components/modals/ImportTenderModal';
import { TenderStage } from '../types/tender';
import { fuzzyMatch } from '../utils/fuzzySearch';

const STAGE_FILTERS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All active' },
  { value: 'DISCOVERED', label: 'Discovered' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'UNDER_ANALYSIS', label: 'Under analysis' },
  { value: 'PREPARATION', label: 'Preparation' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'ARCHIVED', label: 'Archived' },
];

function rowSeverity(daysRemaining: number): '' | 'tt-sev-warn' | 'tt-sev-crit' {
  if (daysRemaining > 0 && daysRemaining <= 2) return 'tt-sev-crit';
  if (daysRemaining > 0 && daysRemaining <= 5) return 'tt-sev-warn';
  return '';
}

export const TenderListPage: React.FC = () => {
  const {
    tenders,
    updateTenderStage,
    archiveTender,
    restoreTender,
    deleteTender,
    deleteMultipleTenders,
    formatCurrency,
  } = useTenders();
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFromUrl = searchParams.get('stage');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>(
    stageFromUrl ? stageFromUrl.toUpperCase() : 'ALL'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  // A nine-column table does not fit a phone. Cards are the better default
  // there; the Table/Cards toggle still works either way.
  const [viewMode, setViewMode] = useState<'list' | 'cards'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 900 ? 'cards' : 'list'
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tenderToDelete, setTenderToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    setSelectedStage(stageFromUrl ? stageFromUrl.toUpperCase() : 'ALL');
    setCurrentPage(1);
  }, [stageFromUrl]);

  const handleStageSelect = (stage: string) => {
    setSelectedStage(stage);
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    if (stage === 'ALL') nextParams.delete('stage');
    else nextParams.set('stage', stage);
    setSearchParams(nextParams);
  };

  const categories = useMemo(
    () => ['ALL', ...Array.from(new Set(tenders.map((t) => t.category).filter(Boolean))).sort()],
    [tenders]
  );

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {
      ALL: tenders.filter((t) => t.stage !== 'ARCHIVED').length,
    };
    STAGE_FILTERS.slice(1).forEach((s) => {
      map[s.value] = tenders.filter((t) => t.stage === s.value).length;
    });
    return map;
  }, [tenders]);

  const filteredTenders = useMemo(
    () =>
      tenders.filter((t) => {
        const matchesSearch = fuzzyMatch(
          [t.title, t.organization, t.id, t.referenceNo, t.category],
          searchQuery
        );
        const matchesStage =
          selectedStage === 'ALL' ? t.stage !== 'ARCHIVED' : t.stage === selectedStage;
        const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
        return matchesSearch && matchesStage && matchesCategory;
      }),
    [tenders, searchQuery, selectedStage, selectedCategory]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTenders.length / (pageSize === -1 ? filteredTenders.length || 1 : pageSize))
  );
  const paginatedTenders =
    pageSize === -1
      ? filteredTenders
      : filteredTenders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === filteredTenders.length ? [] : filteredTenders.map((t) => t.id)
    );

  const handleBatchAdvanceStage = (nextStage: TenderStage) => {
    selectedIds.forEach((id) => updateTenderStage(id, nextStage));
    setSelectedIds([]);
  };

  const handleConfirmSingleDelete = () => {
    if (!tenderToDelete) return;
    deleteTender(tenderToDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== tenderToDelete.id));
    setTenderToDelete(null);
  };

  const handleConfirmBulkDelete = () => {
    deleteMultipleTenders(selectedIds);
    setSelectedIds([]);
    setIsBulkDeleting(false);
  };

  const displayId = (t: (typeof tenders)[number]) =>
    t.summary?.tenderIdDisplay || t.referenceNo || t.id;

  /** Table rows stay one line high: icons only, labels live in the tooltip. */
  const rowActionsCompact = (t: (typeof tenders)[number]) => (
    <div className="flex items-center justify-end gap-1 flex-nowrap whitespace-nowrap">
      <Link to={`/registry/summary/${t.id}`} className="tt-btn tt-btn-sm tt-btn-quiet" title="Document summary" aria-label="Document summary">
        <FileText className="w-3.5 h-3.5" />
      </Link>
      <Link to={`/registry?id=${t.id}`} className="tt-btn tt-btn-sm tt-btn-quiet" title="Edit specifications" aria-label="Edit specifications">
        <Edit3 className="w-3.5 h-3.5" />
      </Link>
      {t.stage !== 'SUBMITTED' && t.stage !== 'ARCHIVED' && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Send "${t.title}" (${t.id}) to the archive?`)) archiveTender(t.id);
          }}
          className="tt-btn tt-btn-sm tt-btn-quiet"
          title="Archive tender"
          aria-label="Archive tender"
        >
          <Archive className="w-3.5 h-3.5" />
        </button>
      )}
      {t.stage === 'ARCHIVED' && (
        <button
          type="button"
          onClick={() => restoreTender(t.id)}
          className="tt-btn tt-btn-sm tt-btn-quiet"
          title="Restore tender"
          aria-label="Restore tender"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => setTenderToDelete({ id: t.id, title: t.title })}
        className="tt-btn tt-btn-sm tt-btn-quiet"
        style={{ color: 'var(--crit)' }}
        title="Delete tender"
        aria-label="Delete tender"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <Link to={`/tenders/${t.id}`} className="tt-btn tt-btn-sm" title="Open workspace">
        <span>Open</span>
        <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );

  /** Cards have the room for labelled buttons. */
  const rowActions = (t: (typeof tenders)[number]) => (
    <div className="flex items-center justify-end gap-1.5 flex-wrap">
      <Link to={`/registry/summary/${t.id}`} className="tt-btn tt-btn-sm" title="View document summary">
        <FileText className="w-3 h-3" />
        <span>Summary</span>
      </Link>
      <Link to={`/registry?id=${t.id}`} className="tt-btn tt-btn-sm" title="Edit specifications">
        <Edit3 className="w-3 h-3" />
        <span>Edit</span>
      </Link>
      {t.stage !== 'SUBMITTED' && t.stage !== 'ARCHIVED' && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Send "${t.title}" (${t.id}) to the archive?`)) archiveTender(t.id);
          }}
          className="tt-btn tt-btn-sm"
          title="Archive tender"
        >
          <Archive className="w-3 h-3" />
          <span>Archive</span>
        </button>
      )}
      {t.stage === 'ARCHIVED' && (
        <button type="button" onClick={() => restoreTender(t.id)} className="tt-btn tt-btn-sm" title="Restore tender">
          <RotateCcw className="w-3 h-3" />
          <span>Restore</span>
        </button>
      )}
      <button
        type="button"
        onClick={() => setTenderToDelete({ id: t.id, title: t.title })}
        className="tt-btn tt-btn-sm tt-btn-danger"
        title="Delete tender"
      >
        <Trash2 className="w-3 h-3" />
        <span>Delete</span>
      </button>
      <Link to={`/tenders/${t.id}`} className="tt-btn tt-btn-sm tt-btn-primary" title="Open workspace">
        <span>Workspace</span>
        <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="tt-label">Operations / Pipeline</div>
          <h1 className="font-display text-xl font-semibold tt-text tracking-tight mt-1">Pipeline</h1>
          <p className="text-xs tt-text-2 mt-1">
            Every tracked opportunity, its gate and its submission readiness.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={() => setIsImportModalOpen(true)} className="tt-btn">
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV / JSON</span>
          </button>
          <ExportDropdown tenders={filteredTenders} label="Export" />
          <Link to="/registry" className="tt-btn tt-btn-primary">
            <Plus className="w-3.5 h-3.5" />
            <span>New tender</span>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="tt-card overflow-hidden">
        <div className="tt-inset px-4 py-3 space-y-2.5">
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
                placeholder="Search title, ID, authority"
                className="tt-input tt-input-search w-64"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="tt-select"
              aria-label="Filter by category"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All categories' : c}
                </option>
              ))}
            </select>

            <div className="tt-seg ml-auto">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                aria-pressed={viewMode === 'cards'}
              >
                Cards
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STAGE_FILTERS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => handleStageSelect(s.value)}
                aria-pressed={selectedStage === s.value}
                className="tt-chip tt-focus"
              >
                {s.label}
                <span className="tt-chip-n">{stageCounts[s.value] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedIds.length > 0 && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-2.5 flex-wrap text-xs"
            style={{
              background: 'var(--accent-soft)',
              borderBottom: '1px solid var(--accent-line)',
            }}
          >
            <span className="font-medium" style={{ color: 'var(--accent)' }}>
              {selectedIds.length} selected
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleBatchAdvanceStage('PREPARATION')}
                className="tt-btn tt-btn-sm"
              >
                Move to preparation
              </button>
              <button
                type="button"
                onClick={() => handleBatchAdvanceStage('SUBMITTED')}
                className="tt-btn tt-btn-sm"
              >
                Move to submitted
              </button>
              <button
                type="button"
                onClick={() => setIsBulkDeleting(true)}
                className="tt-btn tt-btn-sm tt-btn-danger"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete {selectedIds.length}</span>
              </button>
              <button type="button" onClick={() => setSelectedIds([])} className="tt-btn tt-btn-sm tt-btn-quiet">
                Clear
              </button>
            </div>
          </div>
        )}

        {paginatedTenders.length === 0 ? (
          <div className="tt-empty">
            <p className="tt-text font-medium text-sm">No tender matches these filters</p>
            <p className="mt-1">Clear the search or pick another stage.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="tt-table" style={{ minWidth: 1040 }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <button type="button" onClick={toggleSelectAll} title="Select all" className="tt-focus">
                      {selectedIds.length === filteredTenders.length && filteredTenders.length > 0 ? (
                        <CheckSquare className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      ) : (
                        <Square className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      )}
                    </button>
                  </th>
                  <th style={{ minWidth: 260 }}>Scope of work / title</th>
                  <th>Portal</th>
                  <th>Value</th>
                  <th>Deadline</th>
                  <th>Stage</th>
                  <th style={{ width: 130 }}>Readiness</th>
                  <th className="text-right tt-col-pin" style={{ width: 196 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTenders.map((tender, idx) => {
                  const isSelected = selectedIds.includes(tender.id);
                  return (
                    <tr
                      key={`${tender.id}-${idx}`}
                      className={`${rowSeverity(tender.daysRemaining)} ${isSelected ? 'is-selected' : ''}`}
                    >
                      <td>
                        <button type="button" onClick={() => toggleSelect(tender.id)} className="tt-focus">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                          ) : (
                            <Square className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                          )}
                        </button>
                      </td>

                      <td>
                        <Link
                          to={`/tenders/${tender.id}`}
                          className="block font-medium tt-text tt-truncate hover:underline"
                          style={{ maxWidth: '30ch' }}
                          title={tender.title}
                        >
                          {tender.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] tt-text-3">
                          <span className="tt-tag">
                            {tender.tenderType || tender.summary?.tenderType || 'RFP'}
                          </span>
                          <span className="font-mono">{displayId(tender)}</span>
                          {tender.amendments && tender.amendments.length > 0 && (
                            <span className="tt-tag tt-tag-warn">
                              Corrigendum {tender.amendments.length}
                            </span>
                          )}
                          {((tender.languages && tender.languages.length > 0) || tender.language) && (
                            <span className="inline-flex items-center gap-1">
                              <Languages className="w-2.5 h-2.5" />
                              {(tender.languages && tender.languages.length > 0
                                ? tender.languages
                                : [tender.language]
                              ).join(', ')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div
                          className="tt-truncate"
                          style={{ maxWidth: '16ch' }}
                          title={tender.summary?.portal || tender.portalUrl || tender.organization}
                        >
                          {tender.summary?.portal || tender.portalUrl || tender.organization || 'Direct portal'}
                        </div>
                        {tender.country && (
                          <div className="text-[11px] tt-text-3 mt-0.5 tt-truncate">{tender.country}</div>
                        )}
                      </td>

                      <td className="font-mono tt-num text-[12px]">
                        {tender.estimatedValue && tender.estimatedValue > 0 ? (
                          formatCurrency(tender.estimatedValue)
                        ) : (
                          <span className="tt-text-3">Not stated</span>
                        )}
                      </td>

                      <td>
                        <UrgencyBadge
                          daysRemaining={tender.daysRemaining}
                          hoursRemaining={tender.hoursRemaining}
                        />
                      </td>

                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge stage={tender.stage} />
                          {tender.decision && <StatusBadge decision={tender.decision} />}
                        </div>
                      </td>

                      <td>
                        <ReadinessBar score={tender.readinessScore ?? 0} />
                      </td>

                      <td className="text-right tt-col-pin">{rowActionsCompact(tender)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
            {paginatedTenders.map((tender, idx) => {
              const isSelected = selectedIds.includes(tender.id);
              return (
                <article
                  key={`${tender.id}-${idx}`}
                  className="tt-card p-4 space-y-3 min-w-0"
                  style={isSelected ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' } : undefined}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button type="button" onClick={() => toggleSelect(tender.id)} className="tt-focus shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      ) : (
                        <Square className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      )}
                    </button>
                    <span className="font-mono text-[11px] tt-text-2 tt-truncate">{displayId(tender)}</span>
                    <span className="ml-auto shrink-0">
                      <UrgencyBadge
                        daysRemaining={tender.daysRemaining}
                        hoursRemaining={tender.hoursRemaining}
                      />
                    </span>
                  </div>

                  <Link
                    to={`/tenders/${tender.id}`}
                    className="block text-sm font-medium tt-text hover:underline leading-snug"
                  >
                    {tender.title}
                  </Link>

                  <div className="text-xs tt-text-2 space-y-1">
                    <div className="tt-truncate">
                      {tender.summary?.portal || tender.portalUrl || tender.organization || 'Direct portal'}
                      {tender.country ? ` · ${tender.country}` : ''}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="tt-tag">
                        {tender.tenderType || tender.summary?.tenderType || 'RFP'}
                      </span>
                      <span className="font-mono tt-num">
                        {tender.estimatedValue && tender.estimatedValue > 0
                          ? formatCurrency(tender.estimatedValue)
                          : 'Not stated'}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 pt-3"
                    style={{ borderTop: '1px solid var(--border-default)' }}
                  >
                    <StatusBadge stage={tender.stage} />
                    <div className="ml-auto" style={{ width: 110 }}>
                      <ReadinessBar score={tender.readinessScore ?? 0} />
                    </div>
                  </div>

                  <div className="pt-1">{rowActions(tender)}</div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredTenders.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 text-xs tt-text-2"
            style={{ borderTop: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center gap-3">
              <span>
                Showing{' '}
                <strong className="tt-text tt-num">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredTenders.length)}–
                  {pageSize === -1
                    ? filteredTenders.length
                    : Math.min(currentPage * pageSize, filteredTenders.length)}
                </strong>{' '}
                of <strong className="tt-text tt-num">{filteredTenders.length}</strong>
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
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={-1}>All</option>
              </select>
            </div>

            {pageSize !== -1 && totalPages > 1 && (
              <div className="flex items-center gap-1 flex-wrap justify-center">
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
        )}
      </div>

      {/* Delete confirmation */}
      {tenderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.45)' }}>
          <div className="tt-card max-w-md w-full p-5 space-y-4" style={{ boxShadow: 'var(--shadow-popover)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--crit-soft)', color: 'var(--crit)' }}
              >
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="tt-title">Delete tender</h3>
                <p className="text-xs tt-text-3">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs tt-text-2 leading-relaxed">
              Deleting <strong className="tt-text">{tenderToDelete.title}</strong> (
              <span className="font-mono">{tenderToDelete.id}</span>) also removes its tasks,
              requirements and records.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
              <button type="button" onClick={() => setTenderToDelete(null)} className="tt-btn tt-btn-quiet">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmSingleDelete} className="tt-btn tt-btn-danger">
                Delete tender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirmation */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.45)' }}>
          <div className="tt-card max-w-md w-full p-5 space-y-4" style={{ boxShadow: 'var(--shadow-popover)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--crit-soft)', color: 'var(--crit)' }}
              >
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="tt-title">Delete {selectedIds.length} tenders</h3>
                <p className="text-xs tt-text-3">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs tt-text-2 leading-relaxed">
              All records attached to the {selectedIds.length} selected tenders will be removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
              <button type="button" onClick={() => setIsBulkDeleting(false)} className="tt-btn tt-btn-quiet">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmBulkDelete} className="tt-btn tt-btn-danger">
                Delete all {selectedIds.length}
              </button>
            </div>
          </div>
        </div>
      )}

      <ImportTenderModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </div>
  );
};

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
  Building2,
  Handshake,
  Globe,
  Calendar,
  Trophy,
  XCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
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


function parseSafeDate(dStr?: string): Date | null {
  if (!dStr) return null;
  const clean = dStr.trim();
  const d = new Date(clean);
  if (!isNaN(d.getTime())) return d;
  const parts = clean.split('T')[0].split(' ')[0].split('-');
  if (parts.length === 3) {
    const parsed = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function getTenderPortal(t: any): string {
  if (t.summary?.portal) {
    if (t.summary.portal.includes('e-GP')) return 'e-GP (eprocure.gov.bd)';
    if (t.summary.portal.includes('Quantum')) return 'UNDP Quantum Supplier Portal';
    if (t.summary.portal.includes('UNGM')) return 'UNGM / UN Agencies';
    return t.summary.portal;
  }
  const ref = t.referenceNo || '';
  if (/^\d{6,}$/.test(ref)) return 'e-GP (eprocure.gov.bd)';
  if (ref.includes('UNDP') || ref.includes('UN') || ref.includes('LRPS') || (t.organization && t.organization.includes('United Nations'))) {
    return 'UNGM / UN Agencies';
  }
  if (ref.includes('BPD') || ref.includes('BRAC')) return 'BRAC / Corporate';
  return 'Direct / Agency Portal';
}

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
  const [selectedOrg, setSelectedOrg] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [selectedPortal, setSelectedPortal] = useState<string>('ALL');
  const [selectedTenderType, setSelectedTenderType] = useState<string>('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState<'ALL' | 'WON' | 'LOST' | 'IN_FLIGHT' | 'DECLINED'>('ALL');
  const [datePreset, setDatePreset] = useState<string>('ALL');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(true);
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

  // 1. Unique Organizations (Buyers)
  const organizations = useMemo(
    () => ['ALL', ...Array.from(new Set(tenders.map((t) => t.organization).filter(Boolean))).sort()],
    [tenders]
  );

  // 2. Unique Bidding Companies & JV Partners
  const companies = useMemo(() => {
    const set = new Set<string>();
    set.add('PrimeTech Solutions Ltd');
    tenders.forEach((t) => {
      const localPartner = t.summary?.jv?.localPartner;
      if (localPartner) set.add(localPartner);
      const leadMember = t.summary?.jv?.leadMember;
      if (leadMember) {
        const lead = leadMember.split('(')[0].trim();
        if (lead) set.add(lead);
      }
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [tenders]);

  // 3. Unique Portals
  const portals = useMemo(() => {
    const set = new Set<string>();
    tenders.forEach((t) => set.add(getTenderPortal(t)));
    return ['ALL', ...Array.from(set).sort()];
  }, [tenders]);

  // 4. Unique Tender Types
  const tenderTypes = useMemo(() => {
    const set = new Set<string>();
    tenders.forEach((t) => {
      const type = t.tenderType || t.summary?.tenderType;
      if (type) set.add(type);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [tenders]);

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {
      ALL: tenders.filter((t) => t.stage !== 'ARCHIVED').length,
    };
    STAGE_FILTERS.slice(1).forEach((s) => {
      map[s.value] = tenders.filter((t) => t.stage === s.value).length;
    });
    return map;
  }, [tenders]);

  const outcomeCounts = useMemo(() => {
    return {
      ALL: tenders.length,
      WON: tenders.filter((t) => t.stage === 'AWARDED').length,
      LOST: tenders.filter((t) => t.stage === 'LOST').length,
      IN_FLIGHT: tenders.filter(
        (t) =>
          t.stage !== 'AWARDED' &&
          t.stage !== 'LOST' &&
          t.stage !== 'DECLINED' &&
          t.stage !== 'ARCHIVED'
      ).length,
      DECLINED: tenders.filter((t) => t.stage === 'DECLINED').length,
    };
  }, [tenders]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'ALL') count++;
    if (selectedOrg !== 'ALL') count++;
    if (selectedCompany !== 'ALL') count++;
    if (selectedPortal !== 'ALL') count++;
    if (selectedTenderType !== 'ALL') count++;
    if (selectedOutcome !== 'ALL') count++;
    if (datePreset !== 'ALL' || customStartDate || customEndDate) count++;
    return count;
  }, [selectedCategory, selectedOrg, selectedCompany, selectedPortal, selectedTenderType, selectedOutcome, datePreset, customStartDate, customEndDate]);

  const handleResetAllFilters = () => {
    setSelectedStage('ALL');
    setSelectedCategory('ALL');
    setSelectedOrg('ALL');
    setSelectedCompany('ALL');
    setSelectedPortal('ALL');
    setSelectedTenderType('ALL');
    setSelectedOutcome('ALL');
    setDatePreset('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('stage');
    setSearchParams(nextParams);
  };

  const filteredTenders = useMemo(
    () =>
      tenders.filter((t) => {
        // Search query
        const tType = t.tenderType || t.summary?.tenderType || '';
        const portal = getTenderPortal(t);
        const jvPartner = t.summary?.jv?.localPartner || '';
        const matchesSearch = fuzzyMatch(
          [t.title, t.organization, t.id, t.referenceNo, t.category, tType, portal, jvPartner],
          searchQuery
        );

        // Stage
        let matchesStage = true;
        if (selectedStage === 'ALL') {
          if (selectedOutcome === 'ALL') {
            matchesStage = t.stage !== 'ARCHIVED';
          }
        } else {
          matchesStage = t.stage === selectedStage;
        }

        // Category
        const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;

        // Organization (Buyer)
        const matchesOrg = selectedOrg === 'ALL' || t.organization === selectedOrg;

        // Company / Partner
        let matchesCompany = true;
        if (selectedCompany !== 'ALL') {
          if (selectedCompany.includes('PrimeTech')) {
            matchesCompany = !t.summary?.jv?.localPartner || (t.summary?.jv?.leadMember?.includes('PrimeTech') ?? true);
          } else {
            matchesCompany =
              t.summary?.jv?.localPartner === selectedCompany ||
              (t.summary?.jv?.localPartner ? t.summary.jv.localPartner.includes(selectedCompany) : false) ||
              (t.summary?.jv?.leadMember ? t.summary.jv.leadMember.includes(selectedCompany) : false);
          }
        }

        // Portal
        const matchesPortal = selectedPortal === 'ALL' || portal === selectedPortal;

        // Tender Type
        const matchesTenderType = selectedTenderType === 'ALL' || tType === selectedTenderType;

        // Win / Loss Outcome
        let matchesOutcome = true;
        if (selectedOutcome === 'WON') {
          matchesOutcome = t.stage === 'AWARDED';
        } else if (selectedOutcome === 'LOST') {
          matchesOutcome = t.stage === 'LOST';
        } else if (selectedOutcome === 'IN_FLIGHT') {
          matchesOutcome =
            t.stage !== 'AWARDED' &&
            t.stage !== 'LOST' &&
            t.stage !== 'DECLINED' &&
            t.stage !== 'ARCHIVED';
        } else if (selectedOutcome === 'DECLINED') {
          matchesOutcome = t.stage === 'DECLINED';
        }

        // Date & Range
        let matchesDate = true;
        if (datePreset !== 'ALL' || customStartDate || customEndDate) {
          const d = parseSafeDate(t.submissionDeadline);
          if (!d) {
            matchesDate = false;
          } else {
            const dateStr = d.toISOString().split('T')[0];
            const now = new Date();
            if (datePreset === 'TODAY') {
              matchesDate = t.daysRemaining === 0 || t.daysRemaining <= 1;
            } else if (datePreset === 'NEXT_7_DAYS') {
              matchesDate = t.daysRemaining >= 0 && t.daysRemaining <= 7;
            } else if (datePreset === 'NEXT_30_DAYS') {
              matchesDate = t.daysRemaining >= 0 && t.daysRemaining <= 30;
            } else if (datePreset === 'THIS_MONTH') {
              matchesDate =
                (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) ||
                (d.getFullYear() === 2026 && d.getMonth() === 9);
            } else if (datePreset === 'PAST') {
              matchesDate = t.daysRemaining < 0;
            } else if (datePreset === 'CUSTOM' || customStartDate || customEndDate) {
              if (customStartDate && dateStr < customStartDate) matchesDate = false;
              if (customEndDate && dateStr > customEndDate) matchesDate = false;
            }
          }
        }

        return (
          matchesSearch &&
          matchesStage &&
          matchesCategory &&
          matchesOrg &&
          matchesCompany &&
          matchesPortal &&
          matchesTenderType &&
          matchesOutcome &&
          matchesDate
        );
      }),
    [
      tenders,
      searchQuery,
      selectedStage,
      selectedCategory,
      selectedOrg,
      selectedCompany,
      selectedPortal,
      selectedTenderType,
      selectedOutcome,
      datePreset,
      customStartDate,
      customEndDate,
    ]
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
          <div className="tt-label">
            {selectedStage === 'DISCOVERED' ? 'Operations / Bid Discovery' : 'Operations / Pipeline'}
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="font-display text-xl font-semibold tt-text tracking-tight">
              {selectedStage === 'DISCOVERED' ? 'Bid Discovery & Intake Queue' : 'Pipeline'}
            </h1>
            {selectedStage === 'DISCOVERED' && (
              <span
                className="tt-badge text-[11px] font-medium"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                Gate 01 • Intake
              </span>
            )}
          </div>
          <p className="text-xs tt-text-2 mt-1">
            {selectedStage === 'DISCOVERED'
              ? 'Newly identified tender opportunities awaiting initial qualification and Go/No-Go screening.'
              : 'Every tracked opportunity, its gate and its submission readiness.'}
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

            <button
              type="button"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`tt-btn tt-btn-sm ${activeFiltersCount > 0 ? 'tt-btn-primary' : ''}`}
              title="Toggle advanced filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-current">
                  {activeFiltersCount}
                </span>
              )}
              {isFilterExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="tt-btn tt-btn-sm tt-btn-quiet text-[11px] text-[var(--crit)] hover:text-[var(--crit)]"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

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

          {/* Advanced Multi-Filters Panel */}
          {isFilterExpanded && (
            <div className="pt-2.5 border-t border-[var(--border-default)] space-y-2.5 animate-fadeIn">
              {/* Row 1: Org, Company, Portal, Tender Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* 1. Organization / Buyer */}
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
                  <select
                    value={selectedOrg}
                    onChange={(e) => {
                      setSelectedOrg(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="tt-select text-xs w-full pl-8"
                    aria-label="Filter by Organization"
                  >
                    <option value="ALL">🏢 All Organizations ({organizations.length - 1})</option>
                    {organizations.filter((o) => o !== 'ALL').map((org) => (
                      <option key={org} value={org}>
                        {org.length > 34 ? org.slice(0, 32) + '...' : org}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Company / Partner */}
                <div className="relative">
                  <Handshake className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
                  <select
                    value={selectedCompany}
                    onChange={(e) => {
                      setSelectedCompany(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="tt-select text-xs w-full pl-8"
                    aria-label="Filter by Company / Partner"
                  >
                    <option value="ALL">🤝 All Companies & JV</option>
                    {companies.filter((c) => c !== 'ALL').map((c) => (
                      <option key={c} value={c}>
                        {c.length > 34 ? c.slice(0, 32) + '...' : c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Portal */}
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
                  <select
                    value={selectedPortal}
                    onChange={(e) => {
                      setSelectedPortal(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="tt-select text-xs w-full pl-8"
                    aria-label="Filter by Portal"
                  >
                    <option value="ALL">🌐 All Portals ({portals.length - 1})</option>
                    {portals.filter((p) => p !== 'ALL').map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Tender Type */}
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
                  <select
                    value={selectedTenderType}
                    onChange={(e) => {
                      setSelectedTenderType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="tt-select text-xs w-full pl-8"
                    aria-label="Filter by Tender Type"
                  >
                    <option value="ALL">📋 All Tender Types ({tenderTypes.length - 1})</option>
                    {tenderTypes.filter((t) => t !== 'ALL').map((t) => (
                      <option key={t} value={t}>
                        {t.length > 34 ? t.slice(0, 32) + '...' : t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Win / Loss Outcome + Date Range */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Outcome (Win / Loss) Segmented Chips */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="font-medium tt-text-2 mr-1">Outcome:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOutcome('ALL');
                      setCurrentPage(1);
                    }}
                    aria-pressed={selectedOutcome === 'ALL'}
                    className="tt-chip tt-focus text-xs py-1"
                  >
                    All
                    <span className="tt-chip-n">{outcomeCounts.ALL}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOutcome('WON');
                      setCurrentPage(1);
                    }}
                    aria-pressed={selectedOutcome === 'WON'}
                    className={`tt-chip tt-focus text-xs py-1 ${selectedOutcome === 'WON' ? '!bg-[var(--ok-soft)] !text-[var(--ok)] !border-[var(--ok)] font-semibold' : ''}`}
                  >
                    <Trophy className="w-3 h-3 mr-1 inline text-[var(--ok)]" />
                    Won (Awarded)
                    <span className="tt-chip-n">{outcomeCounts.WON}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOutcome('LOST');
                      setCurrentPage(1);
                    }}
                    aria-pressed={selectedOutcome === 'LOST'}
                    className={`tt-chip tt-focus text-xs py-1 ${selectedOutcome === 'LOST' ? '!bg-[var(--crit-soft)] !text-[var(--crit)] !border-[var(--crit)] font-semibold' : ''}`}
                  >
                    <XCircle className="w-3 h-3 mr-1 inline text-[var(--crit)]" />
                    Lost
                    <span className="tt-chip-n">{outcomeCounts.LOST}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOutcome('IN_FLIGHT');
                      setCurrentPage(1);
                    }}
                    aria-pressed={selectedOutcome === 'IN_FLIGHT'}
                    className="tt-chip tt-focus text-xs py-1"
                  >
                    ⚡ In-Flight
                    <span className="tt-chip-n">{outcomeCounts.IN_FLIGHT}</span>
                  </button>
                </div>

                {/* Date & Range Picker */}
                <div className="flex items-center gap-2 flex-wrap text-xs ml-auto">
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <select
                    value={datePreset}
                    onChange={(e) => {
                      setDatePreset(e.target.value);
                      if (e.target.value !== 'CUSTOM') {
                        setCustomStartDate('');
                        setCustomEndDate('');
                      }
                      setCurrentPage(1);
                    }}
                    className="tt-select text-xs"
                    aria-label="Filter by Deadline Date Range"
                  >
                    <option value="ALL">📅 All Deadlines</option>
                    <option value="TODAY">Due Today / 24h</option>
                    <option value="NEXT_7_DAYS">Closing Soon (≤ 7 Days)</option>
                    <option value="NEXT_30_DAYS">Next 30 Days</option>
                    <option value="THIS_MONTH">This Month (October 2026)</option>
                    <option value="PAST">Past / Closed Deadlines</option>
                    <option value="CUSTOM">Custom Date Range...</option>
                  </select>

                  {datePreset === 'CUSTOM' && (
                    <div className="flex items-center gap-1.5 animate-fadeIn">
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => {
                          setCustomStartDate(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="tt-input text-xs py-1 px-2 h-7"
                        title="Start Date"
                      />
                      <span className="tt-text-muted">to</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => {
                          setCustomEndDate(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="tt-input text-xs py-1 px-2 h-7"
                        title="End Date"
                      />
                      {(customStartDate || customEndDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomStartDate('');
                            setCustomEndDate('');
                            setCurrentPage(1);
                          }}
                          className="p-1 text-[var(--text-muted)] hover:text-current"
                          title="Clear date inputs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
                          {Boolean(
                            tender.summary?.jv?.localPartner ||
                            tender.summary?.jv?.participation?.toLowerCase().includes('allow')
                          ) && (
                            <span
                              className="tt-tag tt-tag-accent font-semibold"
                              title={`Joint Venture with ${tender.summary?.jv?.localPartner || 'Consortium Partner'}`}
                            >
                              🤝 JV: {tender.summary?.jv?.localPartner || 'Consortium'}
                            </span>
                          )}
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
                      {Boolean(
                        tender.summary?.jv?.localPartner ||
                        tender.summary?.jv?.participation?.toLowerCase().includes('allow')
                      ) && (
                        <span
                          className="tt-tag tt-tag-accent font-semibold"
                          title={`Joint Venture with ${tender.summary?.jv?.localPartner || 'Consortium Partner'}`}
                        >
                          🤝 JV: {tender.summary?.jv?.localPartner || 'Consortium'}
                        </span>
                      )}
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

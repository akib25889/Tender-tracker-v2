import React, { useState } from 'react';
import {
  Search,
  Building2,
  Handshake,
  Globe,
  Calendar,
  Trophy,
  XCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { TenderFilterState, countActiveFilters } from '../../utils/tenderFilters';

interface TenderFilterToolbarProps {
  filters: TenderFilterState;
  onChange: (patch: Partial<TenderFilterState>) => void;
  onReset: () => void;
  organizations: string[];
  companies: string[];
  portals: string[];
  tenderTypes: string[];
  categories?: string[];
  outcomeCounts?: { ALL: number; WON: number; LOST: number; IN_FLIGHT: number };
  showOutcome?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showCategory?: boolean;
  extraRightActions?: React.ReactNode;
  activeFilterCountExclude?: (keyof TenderFilterState)[];
}

export const TenderFilterToolbar: React.FC<TenderFilterToolbarProps> = ({
  filters,
  onChange,
  onReset,
  organizations,
  companies,
  portals,
  tenderTypes,
  categories = [],
  outcomeCounts,
  showOutcome = false,
  showSearch = true,
  searchPlaceholder = 'Search tenders...',
  showCategory = true,
  extraRightActions,
  activeFilterCountExclude = ['selectedStage'],
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const activeCount = countActiveFilters(filters, activeFilterCountExclude);

  return (
    <div className="bg-[var(--bg-surface)] p-3.5 rounded-xl border border-[var(--border-default)] shadow-xs space-y-3">
      {/* Top Row: Search, Main Selectors, Toggle, and Action Slots */}
      <div className="flex flex-wrap items-center gap-2.5">
        {showSearch && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="search"
              value={filters.searchQuery}
              onChange={(e) => onChange({ searchQuery: e.target.value })}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
        )}

        {showCategory && categories.length > 1 && (
          <select
            value={filters.selectedCategory}
            onChange={(e) => onChange({ selectedCategory: e.target.value })}
            className="tt-select text-xs py-1.5"
            aria-label="Filter by category"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All categories' : c}
              </option>
            ))}
          </select>
        )}

        {/* Toggle Filters Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            activeCount > 0
              ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent)] shadow-xs'
              : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-surface)]'
          }`}
          title="Toggle advanced filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-current">
              {activeCount}
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[var(--crit)] hover:bg-[var(--crit-soft)] rounded-lg transition-colors font-medium"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        {extraRightActions && <div className="ml-auto flex items-center gap-2">{extraRightActions}</div>}
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="pt-3 border-t border-[var(--border-default)] space-y-3 animate-fadeIn">
          {/* Row 1: Org, Company, Portal, Tender Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. Organization */}
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
              <select
                value={filters.selectedOrg}
                onChange={(e) => onChange({ selectedOrg: e.target.value })}
                className="tt-select text-xs w-full pl-8 py-1.5"
                aria-label="Filter by Organization"
              >
                <option value="ALL">🏢 All Organizations ({organizations.length > 1 ? organizations.length - 1 : 0})</option>
                {organizations
                  .filter((o) => o !== 'ALL')
                  .map((org) => (
                    <option key={org} value={org}>
                      {org.length > 34 ? org.slice(0, 32) + '...' : org}
                    </option>
                  ))}
              </select>
            </div>

            {/* 2. Company & JV */}
            <div className="relative">
              <Handshake className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
              <select
                value={filters.selectedCompany}
                onChange={(e) => onChange({ selectedCompany: e.target.value })}
                className="tt-select text-xs w-full pl-8 py-1.5"
                aria-label="Filter by Company / Partner"
              >
                <option value="ALL">🤝 All Companies & JV</option>
                {companies
                  .filter((c) => c !== 'ALL')
                  .map((c) => (
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
                value={filters.selectedPortal}
                onChange={(e) => onChange({ selectedPortal: e.target.value })}
                className="tt-select text-xs w-full pl-8 py-1.5"
                aria-label="Filter by Portal"
              >
                <option value="ALL">🌐 All Portals ({portals.length > 1 ? portals.length - 1 : 0})</option>
                {portals
                  .filter((p) => p !== 'ALL')
                  .map((p) => (
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
                value={filters.selectedTenderType}
                onChange={(e) => onChange({ selectedTenderType: e.target.value })}
                className="tt-select text-xs w-full pl-8 py-1.5"
                aria-label="Filter by Tender Type"
              >
                <option value="ALL">📋 All Tender Types ({tenderTypes.length > 1 ? tenderTypes.length - 1 : 0})</option>
                {tenderTypes
                  .filter((t) => t !== 'ALL')
                  .map((t) => (
                    <option key={t} value={t}>
                      {t.length > 34 ? t.slice(0, 32) + '...' : t}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Row 2: Win/Loss Outcome (if enabled) + Date Range Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {showOutcome && outcomeCounts && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="font-semibold text-[var(--text-secondary)] mr-1">Outcome:</span>
                <button
                  type="button"
                  onClick={() => onChange({ selectedOutcome: 'ALL' })}
                  className={`tt-chip text-xs py-1 ${filters.selectedOutcome === 'ALL' ? '!bg-[var(--accent-soft)] !text-[var(--accent)] font-semibold' : ''}`}
                >
                  All
                  <span className="tt-chip-n">{outcomeCounts.ALL}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ selectedOutcome: 'WON' })}
                  className={`tt-chip text-xs py-1 ${filters.selectedOutcome === 'WON' ? '!bg-[var(--ok-soft)] !text-[var(--ok)] !border-[var(--ok)] font-semibold' : ''}`}
                >
                  <Trophy className="w-3 h-3 mr-1 inline text-[var(--ok)]" />
                  Won
                  <span className="tt-chip-n">{outcomeCounts.WON}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ selectedOutcome: 'LOST' })}
                  className={`tt-chip text-xs py-1 ${filters.selectedOutcome === 'LOST' ? '!bg-[var(--crit-soft)] !text-[var(--crit)] !border-[var(--crit)] font-semibold' : ''}`}
                >
                  <XCircle className="w-3 h-3 mr-1 inline text-[var(--crit)]" />
                  Lost
                  <span className="tt-chip-n">{outcomeCounts.LOST}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ selectedOutcome: 'IN_FLIGHT' })}
                  className={`tt-chip text-xs py-1 ${filters.selectedOutcome === 'IN_FLIGHT' ? '!bg-[var(--accent-soft)] !text-[var(--accent)] font-semibold' : ''}`}
                >
                  ⚡ In-Flight
                  <span className="tt-chip-n">{outcomeCounts.IN_FLIGHT}</span>
                </button>
              </div>
            )}

            {/* Date Preset & Custom Pickers */}
            <div className="flex items-center gap-2 flex-wrap text-xs ml-auto">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <select
                value={filters.datePreset}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({
                    datePreset: val,
                    customStartDate: val !== 'CUSTOM' ? '' : filters.customStartDate,
                    customEndDate: val !== 'CUSTOM' ? '' : filters.customEndDate,
                  });
                }}
                className="tt-select text-xs py-1"
                aria-label="Deadline date preset"
              >
                <option value="ALL">📅 Any Deadline</option>
                <option value="TODAY">Today</option>
                <option value="7_DAYS">Next 7 Days</option>
                <option value="30_DAYS">Next 30 Days</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="PAST">Past Deadlines</option>
                <option value="CUSTOM">Custom Range...</option>
              </select>

              {filters.datePreset === 'CUSTOM' && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={filters.customStartDate}
                    onChange={(e) => onChange({ customStartDate: e.target.value })}
                    className="tt-input text-xs py-0.5 px-2 w-32"
                    aria-label="Start date"
                    title="From date"
                  />
                  <span className="text-[var(--text-muted)] text-[10px]">to</span>
                  <input
                    type="date"
                    value={filters.customEndDate}
                    onChange={(e) => onChange({ customEndDate: e.target.value })}
                    className="tt-input text-xs py-0.5 px-2 w-32"
                    aria-label="End date"
                    title="To date"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


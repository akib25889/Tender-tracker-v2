import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  ChevronRight,
  ChevronLeft,
  CheckSquare,
  Square,
  Compass,
  Trash2,
  Edit3,
  AlertTriangle,
  Archive,
  RotateCcw,
  FileText,
  Upload,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { ReadinessBar } from '../components/ui/ReadinessBar';
import { ExportDropdown } from '../components/ui/ExportDropdown';
import { ImportTenderModal } from '../components/modals/ImportTenderModal';
import { TenderStage } from '../types/tender';
import { fuzzyMatch } from '../utils/fuzzySearch';

export const TenderListPage: React.FC = () => {
  const { tenders, updateTenderStage, archiveTender, restoreTender, deleteTender, deleteMultipleTenders, formatCurrency } = useTenders();
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFromUrl = searchParams.get('stage');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>(
    stageFromUrl ? stageFromUrl.toUpperCase() : 'ALL'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tenderToDelete, setTenderToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    if (stageFromUrl) {
      setSelectedStage(stageFromUrl.toUpperCase());
    } else {
      setSelectedStage('ALL');
    }
    setCurrentPage(1);
  }, [stageFromUrl]);

  const handleStageSelect = (stage: string) => {
    setSelectedStage(stage);
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    if (stage === 'ALL') {
      nextParams.delete('stage');
    } else {
      nextParams.set('stage', stage);
    }
    setSearchParams(nextParams);
  };

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch = fuzzyMatch(
      [t.title, t.organization, t.id, t.referenceNo, t.category],
      searchQuery
    );
    const matchesStage =
      selectedStage === 'ALL'
        ? t.stage !== 'ARCHIVED'
        : t.stage === selectedStage;
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesStage && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTenders.length / (pageSize === -1 ? filteredTenders.length || 1 : pageSize)));
  const paginatedTenders = pageSize === -1 ? filteredTenders : filteredTenders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTenders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTenders.map((t) => t.id));
    }
  };

  const handleBatchAdvanceStage = (nextStage: TenderStage) => {
    selectedIds.forEach((id) => updateTenderStage(id, nextStage));
    setSelectedIds([]);
  };

  const handleConfirmSingleDelete = () => {
    if (tenderToDelete) {
      deleteTender(tenderToDelete.id);
      setSelectedIds((prev) => prev.filter((id) => id !== tenderToDelete.id));
      setTenderToDelete(null);
    }
  };

  const handleConfirmBulkDelete = () => {
    deleteMultipleTenders(selectedIds);
    setSelectedIds([]);
    setIsBulkDeleting(false);
  };

  const categories = [
    'ALL',
    'IT & Cloud Infrastructure',
    'Software / IT Related',
    'Healthcare Systems',
    'Cybersecurity & Energy',
    'Identity & Security',
    'Government Software',
    'Healthcare & Cloud Data',
    'Industrial IoT & SCADA',
    'Trade & Customs Logistics',
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-[#0F172A] tracking-tight">
            Pipeline Overview
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Active multi-donor tender operations, technical proposal readiness, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Import CSV / JSON</span>
          </button>
          <ExportDropdown tenders={filteredTenders} label="Export Pipeline" />
          <Link
            to="/registry"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Tender Opportunity</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#CBD5E1] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tender ID, title, donor..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <span className="text-xs text-[#64748B] font-medium whitespace-nowrap">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stage Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#E2E8F0]">
          <Filter className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          <span className="text-xs text-[#64748B] font-medium whitespace-nowrap">Stage:</span>
          {['ALL', 'DISCOVERED', 'SCREENING', 'UNDER_ANALYSIS', 'PREPARATION', 'INTERNAL_REVIEW', 'SUBMITTED', 'ARCHIVED'].map(
            (stage) => (
              <button
                key={stage}
                onClick={() => handleStageSelect(stage)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedStage === stage
                    ? 'bg-[#0F172A] text-white font-semibold'
                    : 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {stage === 'ALL'
                  ? 'All Active'
                  : stage === 'DISCOVERED'
                  ? '1. Bid Discovery (New)'
                  : stage === 'ARCHIVED'
                  ? 'Archived Records'
                  : stage.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Bid Discovery Active Banner */}
      {selectedStage === 'DISCOVERED' && (
        <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-[#1E3A8A]">
                Bid Discovery Queue ({filteredTenders.length} New Tenders)
              </h3>
              <p className="text-xs text-[#3B82F6]">
                Showing all newly discovered tenders awaiting qualification screening and go/no-go assessment.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleStageSelect('ALL')}
            className="text-xs text-[#1D4ED8] bg-white px-3 py-1.5 rounded-lg border border-[#BFDBFE] font-semibold hover:bg-[#F8FAFC] transition-colors"
          >
            Show All Pipeline
          </button>
        </div>
      )}

      {/* Batch Action Bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#0F172A] text-white rounded-lg flex items-center justify-between shadow-lg animate-fadeIn text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono px-2 py-0.5 bg-[#2563EB] rounded">
              {selectedIds.length} Selected
            </span>
            <span>Bulk actions available:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchAdvanceStage('PREPARATION')}
              className="px-3 py-1 bg-[#1E293B] hover:bg-[#334155] rounded text-white font-medium"
            >
              Move to Preparation
            </button>
            <button
              onClick={() => handleBatchAdvanceStage('INTERNAL_REVIEW')}
              className="px-3 py-1 bg-[#1E293B] hover:bg-[#334155] rounded text-white font-medium"
            >
              Move to Review
            </button>
            <button
              onClick={() => setIsBulkDeleting(true)}
              className="px-3 py-1 bg-[#DC2626] hover:bg-[#B91C1C] rounded text-white font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-[#94A3B8] hover:text-white"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Bid Discovery View: 3-line format per tender */}
      {selectedStage === 'DISCOVERED' ? (
        <div className="space-y-3">
          {filteredTenders.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#CBD5E1] p-12 text-center text-[#64748B]">
              <Compass className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
              <p className="font-semibold text-sm text-[#0F172A]">No tenders in Bid Discovery</p>
              <p className="text-xs text-[#64748B] mt-1">All discovered opportunities have been advanced or screened.</p>
            </div>
          ) : (
            filteredTenders.map((tender, idx) => (
              <div
                key={`${tender.id}-${idx}`}
                className={`bg-white rounded-xl border border-[#CBD5E1] p-4 shadow-xs hover:border-[#94A3B8] transition-all space-y-3 ${
                  selectedIds.includes(tender.id) ? 'bg-[#EFF6FF]/40 border-[#93C5FD]' : ''
                }`}
              >
                {/* Upper Line: Tender ID & Title */}
                <div className="flex items-start sm:items-center justify-between gap-3 pb-2.5 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2.5 flex-wrap flex-1">
                    <button type="button" onClick={() => toggleSelect(tender.id)}>
                      {selectedIds.includes(tender.id) ? (
                        <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#94A3B8]" />
                      )}
                    </button>
                    <span className="font-mono text-xs font-bold text-[#0F172A] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#CBD5E1]">
                      {tender.id}
                    </span>
                    {tender.referenceNo &&
                      tender.referenceNo !== tender.id &&
                      tender.referenceNo !== `REF/${tender.id}` &&
                      !tender.referenceNo.endsWith(tender.id) && (
                        <span className="text-[11px] font-mono font-medium text-[#475569] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#CBD5E1]">
                          <span className="text-[10px] text-[#64748B] font-sans font-medium mr-1">Ref:</span>
                          {tender.referenceNo}
                        </span>
                      )}
                    <Link
                      to={`/tenders/${tender.id}`}
                      className="font-bold text-sm text-[#0F172A] hover:text-[#2563EB] transition-colors"
                    >
                      {tender.title}
                    </Link>
                  </div>
                  <UrgencyBadge
                    daysRemaining={tender.daysRemaining}
                    hoursRemaining={tender.hoursRemaining}
                  />
                </div>

                {/* Second Line: Authority, Value, Stage */}
                <div className="flex items-center justify-between gap-4 py-1 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748B] font-medium">Authority:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {tender.organization || 'Not specified'}
                    </span>
                    {tender.country && (
                      <span className="text-[#64748B]">
                        • {tender.country}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[#64748B] font-sans font-medium text-xs">Value:</span>
                    <span className="font-bold text-[#0F172A]">
                      {tender.estimatedValue && tender.estimatedValue > 0 ? formatCurrency(tender.estimatedValue) : '— (Not stated)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#64748B] font-medium">Stage:</span>
                    <StatusBadge stage={tender.stage} />
                    {tender.decision && <StatusBadge decision={tender.decision} />}
                  </div>
                </div>

                {/* Third Line: Readiness and all the button */}
                <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-[#E2E8F0] flex-wrap">
                  <div className="flex items-center gap-3 w-64 max-w-full">
                    <span className="text-xs text-[#64748B] font-medium shrink-0">Readiness:</span>
                    <div className="w-full">
                      <ReadinessBar score={tender.readinessScore} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      to={`/registry/summary/${tender.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#475569] bg-white hover:bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] transition-colors shadow-2xs"
                      title="View Document Summary"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Summary</span>
                    </Link>

                    <Link
                      to={`/registry?id=${tender.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] transition-colors shadow-2xs"
                      title="Edit Tender Specifications"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Edit</span>
                    </Link>

                    {tender.stage !== 'SUBMITTED' && tender.stage !== 'ARCHIVED' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Send tender "${tender.title}" (${tender.id}) to Archive for record-keeping?`)) {
                            archiveTender(tender.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#475569] bg-white hover:bg-[#F1F5F9] rounded-lg border border-[#CBD5E1] transition-colors shadow-2xs"
                        title="Send to Archive for records"
                      >
                        <Archive className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>Archive</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setTenderToDelete({ id: tender.id, title: tender.title })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#DC2626] bg-white hover:bg-[#FEF2F2] rounded-lg border border-[#FECACA] hover:border-[#F87171] transition-colors shadow-2xs"
                      title="Delete Tender"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <Link
                      to={`/tenders/${tender.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-lg transition-colors shadow-2xs"
                      title="Open Tender Workspace"
                    >
                      <span>Workspace</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Standard Tenders Table for other stages */
        <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <button onClick={toggleSelectAll}>
                      {selectedIds.length === filteredTenders.length && filteredTenders.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#94A3B8]" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Tender ID &amp; Scope of Work (SOW)</th>
                  <th className="py-3 px-4">Issuing Authority</th>
                  <th className="py-3 px-4 whitespace-nowrap">Value</th>
                  <th className="py-3 px-4 whitespace-nowrap">Stage</th>
                  <th className="py-3 px-4 whitespace-nowrap">Decision</th>
                  <th className="py-3 px-4 whitespace-nowrap">Urgency</th>
                  <th className="py-3 px-4 whitespace-nowrap">Readiness</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-700 text-xs">
                {paginatedTenders.map((tender, idx) => (
                  <tr
                    key={`${tender.id}-${idx}`}
                    className={`hover:bg-[#F8FAFC] dark:hover:bg-slate-800/50 transition-colors group ${
                      selectedIds.includes(tender.id) ? 'bg-[#EFF6FF]/40 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <button onClick={() => toggleSelect(tender.id)}>
                        {selectedIds.includes(tender.id) ? (
                          <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#94A3B8]" />
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[#0F172A] dark:text-white">
                          {tender.id}
                        </span>
                        {tender.referenceNo &&
                          tender.referenceNo !== tender.id &&
                          tender.referenceNo !== `REF/${tender.id}` &&
                          !tender.referenceNo.endsWith(tender.id) && (
                            <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono bg-[#F8FAFC] dark:bg-slate-800 px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-slate-700">
                              Ref: {tender.referenceNo}
                            </span>
                          )}
                      </div>
                      <Link
                        to={`/tenders/${tender.id}`}
                        className="font-medium text-[#0F172A] dark:text-white group-hover:text-[#2563EB] line-clamp-1"
                      >
                        {tender.title}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-[#475569] dark:text-slate-300">
                      <div className="font-medium text-[#0F172A] dark:text-white">
                        {tender.organization}
                      </div>
                      <div className="text-[11px] text-[#94A3B8]">
                        {tender.country}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A] dark:text-white">
                      {formatCurrency(tender.estimatedValue)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge stage={tender.stage} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge decision={tender.decision} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <UrgencyBadge
                        daysRemaining={tender.daysRemaining}
                        hoursRemaining={tender.hoursRemaining}
                      />
                    </td>

                    <td className="py-3.5 px-4 w-36">
                      <ReadinessBar score={tender.readinessScore} />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/registry?id=${tender.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0F172A] dark:text-white bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] dark:border-slate-700 hover:border-[#94A3B8] transition-colors shadow-2xs"
                          title="Edit Tender Specifications"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>Edit</span>
                        </Link>

                        {tender.stage !== 'SUBMITTED' && tender.stage !== 'ARCHIVED' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Send tender "${tender.title}" (${tender.id}) to Archive for record-keeping?`)) {
                                archiveTender(tender.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#475569] dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-[#F1F5F9] rounded-lg border border-[#CBD5E1] dark:border-slate-700 transition-colors shadow-2xs"
                            title="Send to Archive for records"
                          >
                            <Archive className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>Archive</span>
                          </button>
                        )}

                        {tender.stage === 'ARCHIVED' && (
                          <button
                            type="button"
                            onClick={() => restoreTender(tender.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#2563EB] bg-white dark:bg-slate-800 hover:bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] transition-colors shadow-2xs"
                            title="Restore tender from archive"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                        )}

                        <button
                          onClick={() => setTenderToDelete({ id: tender.id, title: tender.title })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#DC2626] bg-white dark:bg-slate-800 hover:bg-[#FEF2F2] rounded-lg border border-[#FECACA] dark:border-rose-900/60 hover:border-[#F87171] transition-colors shadow-2xs"
                          title="Delete Tender"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>

                        <Link
                          to={`/tenders/${tender.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:bg-[#EFF6FF] dark:hover:bg-blue-950/40 rounded-lg border border-[#BFDBFE] dark:border-blue-900/60 transition-colors shadow-2xs"
                          title="Open Tender Workspace"
                        >
                          <span>Workspace</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Controls */}
          {filteredTenders.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-[#0F172A] border-t border-[#CBD5E1] dark:border-slate-700 text-xs">
              <div className="flex items-center gap-3 text-[#64748B] dark:text-slate-400">
                <span>
                  Showing <strong className="text-[#0F172A] dark:text-white">{Math.min((currentPage - 1) * pageSize + 1, filteredTenders.length)}</strong> to{' '}
                  <strong className="text-[#0F172A] dark:text-white">
                    {pageSize === -1 ? filteredTenders.length : Math.min(currentPage * pageSize, filteredTenders.length)}
                  </strong> of <strong className="text-[#0F172A] dark:text-white">{filteredTenders.length}</strong> tenders
                </span>

                <div className="flex items-center gap-1.5 pl-3 border-l border-[#CBD5E1] dark:border-slate-700">
                  <span className="text-[11px]">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-0.5 text-xs rounded border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={-1}>All ({filteredTenders.length})</option>
                  </select>
                </div>
              </div>

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

      {/* Single Delete Confirmation Dialog */}
      {tenderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-[#E2E8F0] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-[#0F172A]">Delete Tender</h3>
                <p className="text-xs text-[#64748B]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#0F172A]">{tenderToDelete.title}</strong> (<span className="font-mono text-[11px] font-semibold">{tenderToDelete.id}</span>)? All associated tasks, requirements, and records will be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <button
                onClick={() => setTenderToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSingleDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors shadow-sm"
              >
                Delete Tender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-[#E2E8F0] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-[#0F172A]">Delete {selectedIds.length} Selected Tenders</h3>
                <p className="text-xs text-[#64748B]">Irreversible bulk action.</p>
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Are you sure you want to delete the <strong className="text-[#0F172A]">{selectedIds.length} selected tenders</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <button
                onClick={() => setIsBulkDeleting(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors shadow-sm"
              >
                Delete All {selectedIds.length}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      <ImportTenderModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};

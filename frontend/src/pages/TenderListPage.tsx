import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  ChevronRight,
  CheckSquare,
  Square,
  Compass,
  Trash2,
  Edit3,
  AlertTriangle,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { ReadinessBar } from '../components/ui/ReadinessBar';
import { ExportDropdown } from '../components/ui/ExportDropdown';
import { TenderStage } from '../types/tender';

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

  useEffect(() => {
    if (stageFromUrl) {
      setSelectedStage(stageFromUrl.toUpperCase());
    } else {
      setSelectedStage('ALL');
    }
  }, [stageFromUrl]);

  const handleStageSelect = (stage: string) => {
    setSelectedStage(stage);
    const nextParams = new URLSearchParams(searchParams);
    if (stage === 'ALL') {
      nextParams.delete('stage');
    } else {
      nextParams.set('stage', stage);
    }
    setSearchParams(nextParams);
  };

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage =
      selectedStage === 'ALL'
        ? t.stage !== 'ARCHIVED'
        : t.stage === selectedStage;
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesStage && matchesCategory;
  });

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
      <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tender ID, title, donor..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <span className="text-xs text-[#64748B] font-medium whitespace-nowrap">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A]"
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
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#F1F5F9]">
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
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
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

      {/* Tenders Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleSelectAll}>
                    {selectedIds.length === filteredTenders.length && filteredTenders.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#CBD5E1]" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Tender ID &amp; SOW Title</th>
                <th className="py-3 px-4">Issuing Authority</th>
                <th className="py-3 px-4 whitespace-nowrap">Value</th>
                <th className="py-3 px-4 whitespace-nowrap">Stage</th>
                <th className="py-3 px-4 whitespace-nowrap">Decision</th>
                <th className="py-3 px-4 whitespace-nowrap">Urgency</th>
                <th className="py-3 px-4 whitespace-nowrap">Readiness</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {filteredTenders.map((tender, idx) => (
                <tr
                  key={`${tender.id}-${idx}`}
                  className={`hover:bg-[#F8FAFC] transition-colors group ${
                    selectedIds.includes(tender.id) ? 'bg-[#EFF6FF]/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <button onClick={() => toggleSelect(tender.id)}>
                      {selectedIds.includes(tender.id) ? (
                        <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#CBD5E1]" />
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#0F172A]">
                        {tender.id}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-mono">
                        {tender.referenceNo}
                      </span>
                    </div>
                    <Link
                      to={`/tenders/${tender.id}`}
                      className="font-medium text-[#0F172A] group-hover:text-[#2563EB] line-clamp-1"
                    >
                      {tender.title}
                    </Link>
                  </td>

                  <td className="py-3.5 px-4 text-[#475569]">
                    <div className="font-medium text-[#0F172A]">
                      {tender.organization}
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      {tender.country}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors shadow-2xs"
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

                      {tender.stage === 'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() => restoreTender(tender.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#2563EB] bg-white hover:bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] transition-colors shadow-2xs"
                          title="Restore tender from archive"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      )}

                      <button
                        onClick={() => setTenderToDelete({ id: tender.id, title: tender.title })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#DC2626] bg-white hover:bg-[#FEF2F2] rounded-lg border border-[#FECACA] hover:border-[#F87171] transition-colors shadow-2xs"
                        title="Delete Tender"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <Link
                        to={`/tenders/${tender.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] transition-colors shadow-2xs"
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
      </div>

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
    </div>
  );
};

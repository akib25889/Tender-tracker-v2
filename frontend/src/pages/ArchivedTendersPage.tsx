import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  Search,
  RotateCcw,
  Trash2,
  FileText,
  ChevronRight,
  Building2,
  Globe2,
  AlertCircle,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { StatusBadge } from '../components/ui/StatusBadge';

export const ArchivedTendersPage: React.FC = () => {
  const { tenders, restoreTender, deleteTender, deleteMultipleTenders, formatCurrency } = useTenders();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tenderToDelete, setTenderToDelete] = useState<{ id: string; title: string } | null>(null);

  const archivedTenders = tenders.filter((t) => t.stage === 'ARCHIVED');

  const filtered = archivedTenders.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.organization.toLowerCase().includes(q) ||
      t.country.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((t) => t.id));
    }
  };

  const handleBulkRestore = () => {
    selectedIds.forEach((id) => restoreTender(id));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    deleteMultipleTenders(selectedIds);
    setSelectedIds([]);
  };

  const totalArchivedValue = archivedTenders.reduce(
    (acc, curr) => acc + (curr.estimatedValue || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <Link to="/tenders" className="hover:text-[#2563EB] transition-colors">
              Pipeline
            </Link>
            <span>•</span>
            <span className="font-semibold text-[#0F172A] dark:text-white">Archived Records</span>
          </div>
          <h1 className="text-xl font-bold font-display text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2.5">
            <Archive className="w-5 h-5 text-[#64748B]" />
            <span>Archived Tenders (Non-Participation Records)</span>
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 max-w-3xl">
            Tender opportunities where our team decided not to submit a proposal. All technical requirements, donor specifications, and audit notes are retained here for institutional history and future reference.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#161B22] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#30363D] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] block">Total Archived Records</span>
          <span className="text-2xl font-bold font-mono text-[#0F172A] dark:text-white mt-1 block">
            {archivedTenders.length}
          </span>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 block">
            Preserved historical opportunities
          </span>
        </div>

        <div className="bg-white dark:bg-[#161B22] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#30363D] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] block">Estimated Value Retained</span>
          <span className="text-2xl font-bold font-mono text-[#2563EB] mt-1 block">
            {totalArchivedValue > 0 ? formatCurrency(totalArchivedValue) : '—'}
          </span>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 block">
            Budget intelligence benchmark
          </span>
        </div>

        <div className="bg-white dark:bg-[#161B22] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#30363D] shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] dark:bg-[#1E293B] flex items-center justify-center shrink-0">
            <RotateCcw className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#0F172A] dark:text-white block">Re-activation Ready</span>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Any archived tender can be restored to its exact previous stage at any time.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#161B22] p-3.5 rounded-lg border border-[#E2E8F0] dark:border-[#30363D] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archived tenders by ID, title, donor, country..."
            className="w-full pl-9 pr-4 py-1.5 bg-[#F8FAFC] dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] rounded-lg text-xs text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0F172A] dark:text-white">
              {selectedIds.length} selected
            </span>
            <button
              type="button"
              onClick={handleBulkRestore}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Selected</span>
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2] rounded-lg text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E2E8F0] dark:border-[#30363D] p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#F1F5F9] dark:bg-[#21262D] flex items-center justify-center mb-3">
            <Archive className="w-7 h-7 text-[#94A3B8]" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white mb-1">
            {archivedTenders.length === 0
              ? 'No Archived Tenders Yet'
              : 'No matching archived tenders found'}
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto mb-4">
            {archivedTenders.length === 0
              ? 'When your team decides not to participate in a tender before submission, click "Send to Archive" in its workspace or pipeline table to store all specifications here for future reference.'
              : 'Try adjusting your search terms to locate specific non-participating tender records.'}
          </p>
          <Link
            to="/tenders"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B] transition-colors shadow-sm"
          >
            <span>View Active Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E2E8F0] dark:border-[#30363D] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#21262D] border-b border-[#E2E8F0] dark:border-[#30363D] text-[#64748B] dark:text-[#94A3B8]">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-semibold">Tender ID & Opportunity</th>
                  <th className="py-3 px-4 font-semibold">Client / Country</th>
                  <th className="py-3 px-4 font-semibold">Archived From Stage</th>
                  <th className="py-3 px-4 font-semibold">Value</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#30363D]">
                {filtered.map((tender) => (
                  <tr
                    key={tender.id}
                    className="hover:bg-[#F8FAFC] dark:hover:bg-[#1C2128] transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(tender.id)}
                        onChange={() => toggleSelect(tender.id)}
                        className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                      />
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono font-bold text-[#0F172A] dark:text-white">
                          {tender.id}
                        </span>
                        {tender.referenceNo && (
                          <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#21262D] px-1.5 py-0.5 rounded">
                            {tender.referenceNo}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/tenders/${tender.id}`}
                        className="font-semibold text-[#0F172A] dark:text-white hover:text-[#2563EB] transition-colors line-clamp-1"
                        title={tender.title}
                      >
                        {tender.title}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-[#0F172A] dark:text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{tender.organization || '—'}</span>
                      </div>
                      <div className="text-[11px] text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
                        <Globe2 className="w-3 h-3 text-[#94A3B8]" />
                        <span>{tender.country || '—'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F1F5F9] dark:bg-[#21262D] text-[#475569] dark:text-[#C9D1D9] border border-[#CBD5E1] dark:border-[#30363D]">
                        {tender.archivedFromStage ? tender.archivedFromStage.replace('_', ' ') : 'PREPARATION'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A] dark:text-white whitespace-nowrap">
                      {tender.estimatedValue && tender.estimatedValue > 0
                        ? formatCurrency(tender.estimatedValue)
                        : '—'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge stage="ARCHIVED" />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/registry/summary/${tender.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#475569] dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] hover:bg-[#F8FAFC] dark:hover:bg-[#30363D] rounded-lg border border-[#E2E8F0] dark:border-[#30363D] transition-colors shadow-2xs"
                          title="View Printable Document Summary"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>Summary</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => restoreTender(tender.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#2563EB] bg-white dark:bg-[#21262D] hover:bg-[#EFF6FF] dark:hover:bg-[#1E293B] rounded-lg border border-[#BFDBFE] dark:border-[#1E3A8A] transition-colors shadow-2xs"
                          title="Restore this tender back to active pipeline"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTenderToDelete({ id: tender.id, title: tender.title })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#DC2626] bg-white dark:bg-[#21262D] hover:bg-[#FEF2F2] dark:hover:bg-[#450A0A] rounded-lg border border-[#FECACA] dark:border-[#7F1D1D] transition-colors shadow-2xs"
                          title="Permanently Delete Tender"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>

                        <Link
                          to={`/tenders/${tender.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0F172A] dark:text-white bg-[#F1F5F9] dark:bg-[#21262D] hover:bg-[#E2E8F0] dark:hover:bg-[#30363D] rounded-lg transition-colors shadow-2xs"
                          title="Open Full Workspace Records"
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
      )}

      {/* Delete Confirmation Dialog */}
      {tenderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E2E8F0] dark:border-[#30363D] p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-start gap-3 text-[#DC2626]">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Delete Archived Tender Record?
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-[#0F172A] dark:text-white">"{tenderToDelete.title}"</strong> ({tenderToDelete.id})? This will permanently wipe all preserved Scope of Work (SOW) specs and audit history.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9] dark:border-[#30363D]">
              <button
                type="button"
                onClick={() => setTenderToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#30363D] text-xs font-semibold text-[#475569] dark:text-[#C9D1D9] hover:bg-[#F8FAFC] dark:hover:bg-[#21262D] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTender(tenderToDelete.id);
                  setTenderToDelete(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

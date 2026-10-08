import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  Search,
  RotateCcw,
  Trash2,
  FileText,
  ChevronRight,
  FolderGit2,
  Building2,
  Globe2,
  AlertCircle,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { fuzzyMatch } from '../utils/fuzzySearch';

export const ArchivedTendersPage: React.FC = () => {
  const { tenders, restoreTender, deleteTender, deleteMultipleTenders, formatCurrency } = useTenders();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tenderToDelete, setTenderToDelete] = useState<{ id: string; title: string } | null>(null);

  const archivedTenders = tenders.filter((t) => t.stage === 'ARCHIVED');

  const filtered = archivedTenders.filter((t) => {
    return fuzzyMatch([t.title, t.id, t.referenceNo, t.organization, t.country, t.category], searchQuery);
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
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
            <Link to="/tenders" className="hover:text-[var(--accent)] transition-colors">
              Pipeline
            </Link>
            <span>•</span>
            <span className="font-semibold text-[var(--text-primary)]">Archived Records</span>
          </div>
          <h1 className="text-xl font-bold font-display text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Archive className="w-5 h-5 text-[var(--text-secondary)]" />
            <span>Archived Tenders (Non-Participation Records)</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 max-w-3xl">
            Tender opportunities where our team decided not to submit a proposal. All technical requirements, donor specifications, and audit notes are retained here for institutional history and future reference.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/tenders"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] rounded-lg transition-colors shadow-2xs"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Active Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs">
          <span className="text-xs font-medium text-[var(--text-secondary)] block">Total Archived Records</span>
          <span className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1 block">
            {archivedTenders.length}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
            Preserved historical opportunities
          </span>
        </div>

        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs">
          <span className="text-xs font-medium text-[var(--text-secondary)] block">Estimated Value Retained</span>
          <span className="text-2xl font-bold font-mono text-[var(--accent)] mt-1 block">
            {totalArchivedValue > 0 ? formatCurrency(totalArchivedValue) : '—'}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
            Budget intelligence benchmark
          </span>
        </div>

        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <RotateCcw className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-primary)] block">Re-activation Ready</span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Any archived tender can be restored to its exact previous stage at any time.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--bg-surface)] p-3.5 rounded-lg border border-[var(--border-default)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archived tenders by ID, title, donor, country..."
            className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {selectedIds.length} selected
            </span>
            <button
              type="button"
              onClick={handleBulkRestore}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] text-[var(--accent-on)] hover:bg-[var(--accent-hover)] rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Selected</span>
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--crit-soft)] text-[var(--crit)] border border-[var(--crit-line)] hover:bg-[var(--crit-soft)] rounded-lg text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-3">
            <Archive className="w-7 h-7 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
            {archivedTenders.length === 0
              ? 'No Archived Tenders Yet'
              : 'No matching archived tenders found'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mb-4">
            {archivedTenders.length === 0
              ? 'When your team decides not to participate in a tender before submission, click "Send to Archive" in its workspace or pipeline table to store all specifications here for future reference.'
              : 'Try adjusting your search terms to locate specific non-participating tender records.'}
          </p>
          <Link
            to="/tenders"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-[var(--accent-on)] text-xs font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
          >
            <span>View Active Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)]"
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
              <tbody className="divide-y divide-[var(--border-default)]">
                {filtered.map((tender) => (
                  <tr
                    key={tender.id}
                    className="hover:bg-[var(--bg-subtle)] transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(tender.id)}
                        onChange={() => toggleSelect(tender.id)}
                        className="rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          {tender.id}
                        </span>
                        {tender.referenceNo && (
                          <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded">
                            {tender.referenceNo}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/tenders/${tender.id}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors line-clamp-1"
                        title={tender.title}
                      >
                        {tender.title}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        <span>{tender.organization || '—'}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                        <Globe2 className="w-3 h-3 text-[var(--text-muted)]" />
                        <span>{tender.country || '—'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-strong)]">
                        {tender.archivedFromStage ? tender.archivedFromStage.replace('_', ' ') : 'PREPARATION'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--text-primary)] whitespace-nowrap">
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)] transition-colors shadow-2xs"
                          title="View Printable Document Summary"
                        >
                          <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>Summary</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => restoreTender(tender.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[var(--accent)] bg-[var(--bg-surface)] hover:bg-[var(--accent-soft)] rounded-lg border border-[var(--accent-line)] transition-colors shadow-2xs"
                          title="Restore this tender back to active pipeline"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTenderToDelete({ id: tender.id, title: tender.title })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[var(--crit)] bg-[var(--bg-surface)] hover:bg-[var(--crit-soft)] rounded-lg border border-[var(--crit-line)] transition-colors shadow-2xs"
                          title="Permanently Delete Tender"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>

                        <Link
                          to={`/tenders/${tender.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] rounded-lg transition-colors shadow-2xs"
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
        <div className="tt-overlay items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-start gap-3 text-[var(--crit)]">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Delete Archived Tender Record?
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-[var(--text-primary)]">"{tenderToDelete.title}"</strong> ({tenderToDelete.id})? This will permanently wipe all preserved Scope of Work (SOW) specs and audit history.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setTenderToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTender(tenderToDelete.id);
                  setTenderToDelete(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-[var(--crit)] hover:bg-[var(--crit)] text-[var(--accent-on)] text-xs font-semibold shadow-sm transition-colors"
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

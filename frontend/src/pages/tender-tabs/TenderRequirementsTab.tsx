import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useTenders } from '../../context/TenderContext';
import { CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { RequirementStatus } from '../../types/tender';
import { ImportantClausesManager } from '../../components/tender/ImportantClausesManager';

export const TenderRequirementsTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    tenders,
    toggleRequirementStatus,
    setUploadFolderTarget,
    setActiveTenderIdForModal,
    setActiveRequirementForModal,
    updateTender,
  } = useTenders();
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'BLOCKER'>('ALL');

  if (!tender) return null;

  const filteredRequirements = (tender.requirements || []).filter((req) => {
    if (filter === 'ALL') return true;
    return req.status === filter;
  });

  const handleStatusCycle = (reqId: string, current: RequirementStatus) => {
    const next: RequirementStatus =
      current === 'PENDING'
        ? 'VERIFIED'
        : current === 'VERIFIED'
        ? 'BLOCKER'
        : 'PENDING';
    const currentReq = tender.requirements?.find((r) => r.id === reqId);
    const evidenceToSet =
      next === 'VERIFIED'
        ? currentReq?.evidenceFile || (tender.documents && tender.documents.length > 0 ? tender.documents[0].name : undefined)
        : undefined;
    toggleRequirementStatus(tender.id, reqId, next, evidenceToSet);
  };

  const blockers = (tender.requirements || []).filter((r) => r.status === 'BLOCKER');

  return (
    <div className="space-y-6">
      {/* Blocker Alert Banner */}
      {blockers.length > 0 && (
        <div className="p-4 bg-[var(--crit-soft)] border border-[var(--crit-line)] rounded-lg text-xs text-[var(--crit)] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse text-[var(--crit)]" />
            <div>
              <span className="font-bold block">
                {blockers.length} Mandatory Compliance Blocker(s) Identified
              </span>
              <span>
                Statutory audit prevents submission progression until all evidence files are stamped.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTenderIdForModal(tender.id);
              setUploadFolderTarget('02_company_statutory_documents');
            }}
            className="px-3 py-1.5 bg-[var(--crit)] text-[var(--accent-on)] rounded-md font-semibold hover:bg-[var(--crit)] transition-colors shrink-0"
          >
            Upload Evidence
          </button>
        </div>
      )}

      <Card
        title="Tender Requirements &amp; Compliance Matrix"
        subtitle="Clause-by-clause statutory checklist mapped to evidence documents in the vault"
        headerAction={
          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-[var(--bg-subtle)] rounded-lg text-xs">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
 filter === 'ALL' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold' : 'text-[var(--text-secondary)]'
                }`}
              >
                All ({tender.requirements.length})
              </button>
              <button
                onClick={() => setFilter('VERIFIED')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
 filter === 'VERIFIED' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold' : 'text-[var(--text-secondary)]'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setFilter('BLOCKER')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
 filter === 'BLOCKER' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold' : 'text-[var(--text-secondary)]'
                }`}
              >
                Blockers ({blockers.length})
              </button>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="py-2.5 px-3">Req ID</th>
                <th className="py-2.5 px-3">Requirement Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Status (Click to toggle)</th>
                <th className="py-2.5 px-3">Vault Evidence Document</th>
                <th className="py-2.5 px-3">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredRequirements.map((req) => (
                <tr key={req.id} className="hover:bg-[var(--bg-subtle)]">
                  <td className="py-3 px-3 font-mono font-bold text-[var(--text-primary)]">
                    {req.id}
                  </td>
                  <td className="py-3 px-3 font-medium text-[var(--text-primary)]">
                    {req.title}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">{req.category}</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleStatusCycle(req.id, req.status)}
                      className="cursor-pointer group flex items-center gap-1.5"
                      title="Click to cycle status"
                    >
                      {req.status === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 text-[var(--ok)] font-semibold bg-[var(--ok-soft)] px-2 py-0.5 rounded border border-[var(--ok-line)]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : req.status === 'BLOCKER' ? (
                        <span className="inline-flex items-center gap-1 text-[var(--crit)] font-bold bg-[var(--crit-soft)] px-2 py-0.5 rounded border border-[var(--crit-line)]">
                          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                          <span>Blocker</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[var(--warn)] font-semibold bg-[var(--warn-soft)] px-2 py-0.5 rounded border border-[var(--warn-line)]">
                          <span>Pending Clearance</span>
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[var(--accent)] truncate max-w-xs">
                    {req.evidenceFile ? (
                      <span className="flex items-center gap-1.5 truncate">
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">{req.evidenceFile}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTenderIdForModal(tender.id);
                          setActiveRequirementForModal({ id: req.id, title: req.title });
                          setUploadFolderTarget('02_company_statutory_documents');
                        }}
                        className="text-[var(--text-muted)] hover:text-[var(--accent)] italic"
                      >
                        + Attach vault document
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">{req.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Important Marked Clauses Section */}
      <ImportantClausesManager
        clauses={tender.importantClauses || []}
        onChange={(updatedClauses) =>
          updateTender(tender.id, { importantClauses: updatedClauses })
        }
        tenderDocuments={tender.documents}
        tenderId={tender.id}
        tenderTitle={tender.title}
        amendments={tender.amendments}
        tenderSubmissionDeadline={tender.submissionDeadline}
      />
    </div>
  );
};

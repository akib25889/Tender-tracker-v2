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
      current === 'VERIFIED'
        ? 'PENDING'
        : current === 'PENDING'
        ? 'BLOCKER'
        : 'VERIFIED';
    toggleRequirementStatus(tender.id, reqId, next);
  };

  const blockers = (tender.requirements || []).filter((r) => r.status === 'BLOCKER');

  return (
    <div className="space-y-6">
      {/* Blocker Alert Banner */}
      {blockers.length > 0 && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse text-[#DC2626]" />
            <div>
              <span className="font-bold block">
                {blockers.length} Mandatory Compliance Blocker(s) Identified
              </span>
              <span>
                Statutory audit prevents Stage 5 review sign-off until all evidence files are stamped.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTenderIdForModal(tender.id);
              setUploadFolderTarget('02_company_statutory_documents');
            }}
            className="px-3 py-1.5 bg-[#DC2626] text-white rounded-md font-semibold hover:bg-[#B91C1C] transition-colors shrink-0"
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
            <div className="flex items-center p-0.5 bg-[#F1F5F9] rounded-lg text-xs">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  filter === 'ALL' ? 'bg-white text-[#0F172A] shadow-sm font-semibold' : 'text-[#64748B]'
                }`}
              >
                All ({tender.requirements.length})
              </button>
              <button
                onClick={() => setFilter('VERIFIED')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  filter === 'VERIFIED' ? 'bg-white text-[#0F172A] shadow-sm font-semibold' : 'text-[#64748B]'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setFilter('BLOCKER')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  filter === 'BLOCKER' ? 'bg-white text-[#0F172A] shadow-sm font-semibold' : 'text-[#64748B]'
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
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-2.5 px-3">Req ID</th>
                <th className="py-2.5 px-3">Requirement Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Status (Click to toggle)</th>
                <th className="py-2.5 px-3">Vault Evidence Document</th>
                <th className="py-2.5 px-3">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredRequirements.map((req) => (
                <tr key={req.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-3 font-mono font-bold text-[#0F172A]">
                    {req.id}
                  </td>
                  <td className="py-3 px-3 font-medium text-[#0F172A]">
                    {req.title}
                  </td>
                  <td className="py-3 px-3 text-[#64748B]">{req.category}</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleStatusCycle(req.id, req.status)}
                      className="cursor-pointer group flex items-center gap-1.5"
                      title="Click to cycle status"
                    >
                      {req.status === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#BBF7D0]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : req.status === 'BLOCKER' ? (
                        <span className="inline-flex items-center gap-1 text-[#DC2626] font-bold bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                          <span>Blocker</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#D97706] font-semibold bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
                          <span>Pending Clearance</span>
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#2563EB] truncate max-w-xs">
                    {req.evidenceFile ? (
                      <span className="flex items-center gap-1.5 truncate">
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">{req.evidenceFile}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTenderIdForModal(tender.id);
                          setUploadFolderTarget('02_company_statutory_documents');
                        }}
                        className="text-[#94A3B8] hover:text-[#2563EB] italic"
                      >
                        + Attach vault document
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[#475569]">{req.owner}</td>
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
      />
    </div>
  );
};

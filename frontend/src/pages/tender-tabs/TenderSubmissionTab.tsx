import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useTenders } from '../../context/TenderContext';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

export const TenderSubmissionTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenders, submitTenderProof } = useTenders();
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const [portalRef, setPortalRef] = useState(
    tender?.submissionProof?.portalReference || 'UNGM-SUB-9941'
  );
  const [submitted, setSubmitted] = useState(tender?.stage === 'SUBMITTED');

  if (!tender) return null;

  const handleSealSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    submitTenderProof(tender.id, portalRef);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <Card
        title="Tender Submission &amp; Result Ledger"
        subtitle="Cryptographic proof of upload, e-GP portal receipt capture, and lock timestamping"
      >
        <div className="p-5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-semibold text-xs text-[#0F172A]">
              Official Procurement Portal Endpoint: UNGM / e-Tendering Network
            </span>
            {submitted ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded border border-[#BBF7D0]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SEALED &amp; SUBMITTED
              </span>
            ) : (
              <span className="text-[11px] font-mono text-[#D97706] font-bold bg-[#FFFBEB] px-2.5 py-1 rounded border border-[#FDE68A]">
                SUBMISSION WINDOW OPEN
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block">Portal Reference ID</span>
              <span className="font-mono font-bold text-[#0F172A] text-sm">
                {portalRef}
              </span>
            </div>
            <div className="p-3 bg-white rounded border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block">Submission Deadline Cutoff</span>
              <span className="font-mono font-bold text-[#DC2626] text-sm">
                {new Date(tender.submissionDeadline).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="p-3 bg-white rounded border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block">Authorized Operator</span>
              <span className="font-medium text-[#0F172A] text-sm">
                Sarah Jenkins (Director)
              </span>
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleSealSubmission} className="pt-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Confirm Portal Electronic Submission Confirmation ID:
                </label>
                <input
                  type="text"
                  required
                  value={portalRef}
                  onChange={(e) => setPortalRef(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-mono font-bold text-[#0F172A]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B] shadow-sm transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock &amp; Seal Formal Submission</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-[#F0FDF4] rounded-lg border border-[#BBF7D0] space-y-2">
              <div className="flex items-center gap-2 text-[#15803D] font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Portal Receipt Cryptographically Sealed</span>
              </div>
              <p className="text-xs text-[#166534]">
                Submission timestamp logged. All workspace documents locked to preserve immutable statutory integrity for the post-bid opening debrief.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

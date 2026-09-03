import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useTenders } from '../../context/TenderContext';

interface SignOffModalProps {
  tenderId: string;
  tierNumber: number;
  tierName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SignOffModal: React.FC<SignOffModalProps> = ({
  tenderId,
  tierNumber,
  tierName,
  isOpen,
  onClose,
}) => {
  const { signOffReviewTier } = useTenders();
  const [comments, setComments] = useState(
    'All statutory checklists and technical parameters verified. Approved for progression.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signOffReviewTier(tenderId, tierNumber, comments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div>
            <h3 className="font-display text-base font-bold text-[#0F172A]">
              Stage 5 Review Sign-Off
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Execute digital gatekeeper validation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] space-y-1">
            <span className="font-mono text-[10px] font-bold text-[#2563EB] uppercase">
              Tier {tierNumber} Approval Gate
            </span>
            <h4 className="text-xs font-bold text-[#0F172A]">{tierName}</h4>
          </div>

          <div>
            <label className="block font-semibold text-[#0F172A] mb-1">
              Signer Identity &amp; Authorization
            </label>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
              <span className="font-medium text-[#0F172A]">Sarah Jenkins (Director)</span>
              <span className="font-mono text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#BBF7D0]">
                AUTHENTICATED
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#0F172A] mb-1">
              Gatekeeper Review Notes / Audit Log *
            </label>
            <textarea
              required
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="p-3 bg-[#F0FDF4] rounded-lg border border-[#BBF7D0] flex items-center gap-2 text-[#15803D]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px] leading-tight">
              Sign-off creates an immutable SHA-256 digital entry in the system audit log.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] text-white rounded-lg font-semibold hover:bg-[#15803D] transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record &amp; Authorize Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
